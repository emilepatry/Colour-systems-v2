---
tags: [OKLCH, Poline, coordinate-mapping, gamut-boundary, chroma, interpolation, sRGB]
purpose: Specification for adapting Poline's polar coordinate interpolation to OKLCH colour space. Defines the coordinate mapping, gamut boundary behaviour, chroma normalisation strategies, and edge cases at the boundary.
related: [planning/OKLCH-COORDINATE-RENDERING.md, poline/THEORY.md, docs/01-oklch-colour-model.md, docs/03-gamut-mapping.md, docs/04-scale-design.md]
---

# OKLCH Coordinate Mapping

Poline's polar coordinate system was designed for HSL, where every combination of (H, S, L) in [0, 360) × [0, 1] × [0, 1] produces a displayable sRGB colour. The space is a filled double cone — no holes, no dead zones, no irregular boundaries. A straight line drawn between any two valid HSL points passes only through valid HSL points.

OKLCH breaks this assumption. This document specifies how Poline's coordinate mapping, interpolation engine, and easing system adapt to OKLCH's irregular sRGB gamut — and what happens when they hit its boundaries. For performance, caching, Engine A→B handoff, rendering, and edge cases, see [OKLCH-COORDINATE-RENDERING.md](OKLCH-COORDINATE-RENDERING.md).

---

## 1. Why HSL's Regularity Disappears in OKLCH

### HSL: a synthetic, uniform container

HSL is a mathematical remapping of sRGB. Every point in the HSL cube corresponds to exactly one sRGB colour. The gamut boundary _is_ the cube walls — a designer can never specify an HSL triplet that falls outside sRGB, because HSL was constructed from sRGB in the first place. This makes Poline's interpolation safe by construction: any line between two HSL points produces only displayable colours.

### OKLCH: a perceptual space that exceeds sRGB

OKLCH is a cylindrical projection of OKLAB, which models human colour perception. It is not constructed from sRGB — it can describe colours that sRGB cannot display (Display P3, Rec. 2020, and beyond). The sRGB gamut occupies an irregular, hue-dependent volume within OKLCH space. The boundary of that volume is not a cube, not a sphere, and not any simple geometric primitive. It is a warped, asymmetric solid whose cross-section changes shape at every hue angle and lightness level.

### What this means for Poline

A straight line in Poline's polar coordinate space that was universally safe in HSL can now pass through regions of OKLCH that have no sRGB representation. The interpolation engine must account for this, either by constraining the space, correcting the output, or both.

---

## 2. The Coordinate Mapping

### Poline's original axes (HSL)

| Coordinate | HSL property | Range | Mapping |
|---|---|---|---|
| angle from (0.5, 0.5) | Hue | 0°–360° | `atan2(y - 0.5, x - 0.5)` |
| distance from (0.5, 0.5) | Lightness | 0–1 | `sqrt((x-0.5)² + (y-0.5)²) / 0.5` |
| z | Saturation | 0–1 | direct: `z = S` |

### The OKLCH axes

| Coordinate | OKLCH property | Range | Notes |
|---|---|---|---|
| angle from (0.5, 0.5) | **Hue H** | 0°–360° | Semantically identical to HSL hue, but OKLCH hue angles differ from HSL hue angles for the same named colour. |
| distance from (0.5, 0.5) | **Normalised Chroma** | 0–1 | Fraction of `C_max(displayL, H)`. Center = achromatic, edge = maximum vibrancy at the current display lightness. |
| z | Not exposed on the 2D wheel | — | Reserved for future use (e.g., per-anchor vibrancy override). The vibrancy slider covers this dimension for now. |

### The hue axis: almost unchanged

Hue maps to angle in both systems. The semantic meaning is identical: angular position on the wheel selects a hue. The only difference is that OKLCH hue angles for named colours differ from HSL hue angles. Red is approximately 25° in OKLCH vs 0° in HSL. This is a rotation of the wheel's labels, not a structural change to the coordinate system.

### The chroma axis: repurposed

In Poline's HSL mapping, distance from center encodes lightness. In the OKLCH adaptation, distance encodes **normalised chroma** — the fraction of maximum displayable chroma at the current hue and display lightness. Center is achromatic (C = 0), edge is maximum vibrancy (C = C_max). The radial gradient on the wheel represents chroma intensity, not brightness.

This repurposing exists because lightness is not a per-anchor creative choice — it is a shared structural parameter controlled by the lightness curve (the Stripe insight). Mapping distance to lightness would waste the radial axis: Engine B discards Engine A's lightness values and imposes its own curve, so a designer dragging an anchor inward or outward to change "brightness" would see no downstream effect. Mapping distance to chroma means both wheel axes produce visible change in the scale strips — angle controls *which colour*, distance controls *how vivid*.

### The lightness axis: externalised

Lightness is no longer a wheel coordinate. It is a shared parameter called `displayL` — a user-adjustable slider that defaults to the lightness curve's midpoint level (typically L ≈ 0.56). `displayL` determines the gamut contour rendered on the wheel and the reference lightness for chroma normalisation. It does NOT affect Engine B's scale generation, which always uses `lightnessCurve[level]` for each level's lightness.

The maximum displayable chroma depends on both lightness and hue, so `displayL` controls how much chroma is available at each angle on the wheel:

| Hue | C_max at displayL=0.50 | C_max at displayL=0.85 | C_max at displayL=0.20 |
|---|---|---|---|
| Red (25°) | ≈ 0.22 | ≈ 0.10 | ≈ 0.10 |
| Yellow (90°) | ≈ 0.18 | ≈ 0.14 | ≈ 0.04 |
| Green (145°) | ≈ 0.18 | ≈ 0.13 | ≈ 0.08 |
| Blue (265°) | ≈ 0.19 | ≈ 0.07 | ≈ 0.13 |
| Purple (305°) | ≈ 0.22 | ≈ 0.08 | ≈ 0.12 |

When the designer adjusts the `displayL` slider, the gamut contour on the wheel morphs — contracting at extreme lightness levels (where chroma headroom is limited) and expanding at mid-lightness (where the gamut is widest). This is the visual feedback that teaches the designer about gamut constraints at different lightness levels.

### Chroma normalisation: why it still needs a strategy

HSL saturation occupies a fixed [0, 1] range at every (H, L) pair. OKLCH chroma does not — `C_max(displayL, H)` varies wildly across hues even at a fixed `displayL`. The radial axis needs a normalisation strategy to make the full [0, 1] range meaningful at every hue angle.

---

## 3. The Chroma Envelope

Before defining mapping strategies, we need a precise model of what is and isn't displayable.

### C_max(L, H): the gamut boundary function

For any (L, H) pair, the maximum in-gamut chroma is found by binary search (see [03-gamut-mapping.md](../docs/03-gamut-mapping.md)):

```
function C_max(L, H):
    low = 0.0, high = 0.4
    repeat 20 times:
        mid = (low + high) / 2
        if is_in_srgb_gamut(oklch_to_srgb(L, mid, H)):
            low = mid
        else:
            high = mid
    return low
```

The function `C_max(L, H)` defines a 2D surface over the (L, H) plane. This surface is the **chroma envelope** — the ceiling of displayable colourfulness at each point on the Poline wheel.

### Shape of the envelope

The chroma envelope is not a dome, not a ridge, not any regular shape. Its key features:

1. **It peaks at mid-lightness** for most hues — roughly L ∈ [0.45, 0.65], but the exact peak L varies by hue.
2. **It collapses to zero at L=0 and L=1** — black and white have no chroma.
3. **Peak chroma differs by hue.** Red/magenta can reach C ≈ 0.37 at optimal L. Blue peaks lower. Yellow peaks lower still.
4. **The peak lightness varies by hue.** Yellow's chroma peak occurs at high L (≈ 0.85). Blue's occurs at low L (≈ 0.35). This is the most structurally important asymmetry for palette generation.
5. **The envelope has sharp ridges** where sRGB channel boundaries intersect in OKLCH space. These produce non-smooth discontinuities in the C_max surface.

### Visualising the envelope on the wheel

On the Poline wheel, the chroma envelope projects as a **contour line** at any given chroma value. For a fixed z (chroma request), the contour separates the (angle, distance) region where the request is achievable from the region where it exceeds the gamut. Inside the contour, the colour is displayable. Outside it, chroma must be reduced.

At z = 0 (achromatic), the contour encompasses the entire wheel — every (L, H) pair can display zero chroma. As z increases, the contour shrinks inward and deforms, retreating from the lightness extremes first and from the most constrained hue regions next. At z = 0.37, the contour reduces to a single tiny island near red/magenta at optimal lightness.

---

## 4. Chroma Mapping Strategies

Three strategies for mapping the z axis to OKLCH chroma, each with different trade-offs for interpolation behaviour, visual predictability, and gamut safety.

### Strategy A: Raw chroma

```
C = z    (z ∈ [0, 0.4])
```

The z axis maps directly to OKLCH chroma. The coordinate space cube extends to z = 0.4 (the practical ceiling of OKLCH chroma in sRGB).

**Advantages:**
- Simple. The z value _is_ the chroma value.
- Chroma is absolute — moving an anchor point's z slider to 0.15 means C = 0.15 regardless of where the anchor sits on the wheel.

**Disadvantages:**
- Most of the z range is wasted. At L = 0.90, H = 265° (light blue), C_max ≈ 0.07. The remaining 0.07–0.40 range of z produces out-of-gamut colours that must all be clamped to the same ceiling.
- Interpolation paths that traverse these dead zones produce runs of identical clamped chroma — plateaus in the output that look like rendering errors.
- A "full saturation" anchor (`z = 0.4`) means very different things at different (L, H) positions. The visual metaphor of Poline's saturation ring (where a full ring means "fully saturated") breaks down.

**Verdict:** Suitable only for expert/debug views. Not recommended for the interactive layer.

### Strategy B: Normalised chroma (recommended)

```
normC = C / C_max(displayL, H)    (normC ∈ [0, 1])
```

The radial distance on the wheel maps to the _fraction_ of maximum available chroma at the current `displayL`. Distance = 0 (center) is always achromatic; distance = 1 (edge) is always the most vivid displayable colour at that hue and display lightness.

**Advantages:**
- The full radial range [0, 1] is always meaningful, at every hue angle on the wheel.
- Edge universally means "as vivid as possible" — the saturation ring metaphor works perfectly.
- A constant normalised chroma across anchors means "equal relative vibrancy" — perceptually consistent even though the absolute chroma differs by hue.
- No anchor can ever request an out-of-gamut chroma if normalised distance is clamped to [0, 1].

**Disadvantages:**
- The meaning of a radial position is hue-dependent. Moving an anchor from blue to yellow at the edge changes the absolute chroma from ≈ 0.19 to ≈ 0.18 (at `displayL` = 0.50) — subtle here, but dramatic at extreme `displayL` values.
- **During interpolation, the same normalised chroma on the path resolves to different absolute chromas at each sample point**, because `C_max(displayL, H)` differs at each sampled H. Since `displayL` is fixed, `C_max` varies only with hue along the arc — the chroma profile follows the hue-dependent shape of the gamut envelope, which is exactly the desirable behaviour.
- Requires computing `C_max(displayL, H)` at every sampled point during interpolation, not just at anchors.

**Implementation:**

```typescript
function hcToPoint(H: number, C: number, displayL: number): Vector3 {
  const cx = 0.5, cy = 0.5;
  const radians = H * (Math.PI / 180);

  const cMax = maxChroma(displayL, H);
  const normC = cMax > 0 ? C / cMax : 0;
  const dist = normC * cx;

  const x = cx + dist * Math.cos(radians);
  const y = cy + dist * Math.sin(radians);
  const z = normC;

  return [x, y, z];
}

function pointToHC(xy: [number, number], displayL: number): { H: number; C: number; vibrancy: number } {
  const [x, y] = xy;
  const cx = 0.5, cy = 0.5;

  const radians = Math.atan2(y - cy, x - cx);
  let H = radians * (180 / Math.PI);
  H = (360 + H) % 360;

  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const normC = Math.min(dist / cx, 1.0);

  const cMax = maxChroma(displayL, H);
  const C = normC * cMax;

  return { H, C, vibrancy: normC };
}
```

The key difference from the HSL version: `displayL` is an **external parameter** — a shared value from the `displayL` slider, not derived from the wheel position. This means `C_max` varies only with hue across the wheel (since `displayL` is fixed for a given wheel state), simplifying the gamut contour to a 1D function of hue angle. During interpolation, every sampled point gets its own `C_max(displayL, H)` lookup, which means the chroma profile of the path automatically conforms to the gamut boundary at the current display lightness.

The `vibrancy` field (identical to `normC`) is passed directly to Engine B as the vibrancy factor; see [engine-coherence-model.md § The Vibrancy Contract](engine-coherence-model.md#the-vibrancy-contract).

**Verdict:** Recommended for the interactive layer. Radial distance becomes "relative vibrancy" — a design-meaningful quantity that always maps to a displayable colour.

### Strategy C: Global-ceiling normalisation

```
C = z × C_GLOBAL_MAX    (z ∈ [0, 1], C_GLOBAL_MAX ≈ 0.37)
```

A compromise: z is normalised to [0, 1], but against a fixed global maximum rather than the per-(L, H) maximum.

**Advantages:**
- z has a stable absolute meaning: z = 0.5 always means C ≈ 0.185.
- Interpolation in z produces predictable, smooth chroma transitions.

**Disadvantages:**
- Most of the z range is out-of-gamut at constrained (L, H) pairs. z = 1.0 at L = 0.90, H = 265° requests C = 0.37 when C_max is 0.07 — 81% of the range is wasted.
- Out-of-gamut points still need clamping, reintroducing the plateau problem from Strategy A.

**Verdict:** Useful as an intermediate representation between the interactive layer and the truth layer, but not recommended for the coordinate space itself.

---

## 5. Interpolation Through the Gamut Envelope

### The path in polar space

Poline's interpolation engine draws straight lines (shaped by per-axis easing) between anchor positions in the (x, y) plane. In the OKLCH adaptation with distance = normalised chroma (Strategy B), this line traces a path through (H, normC) space at a fixed `displayL`.

The crucial difference from HSL: **the absolute chroma of each sampled point depends on its hue**, because `C_max(displayL, H)` varies across hue angles. Two points at the same normalised chroma can have very different absolute chromas if they sit at different hue positions on the wheel.

Because `displayL` is fixed for a given wheel state, the gamut envelope is a 1D function of hue — simpler than the 2D (L, H) surface in the original Poline-lightness model, but still irregular.

### What happens during interpolation

Consider two anchors at `displayL = 0.56`:

```
Anchor A: H = 90° (yellow),  normC = 0.95 → C = 0.95 × C_max(0.56, 90°)
Anchor B: H = 265° (blue),   normC = 0.95 → C = 0.95 × C_max(0.56, 265°)
```

A straight line between them in polar space sweeps through intermediate hues. At each sampled point, the normalised chroma is ≈ 0.95 (assuming linear interpolation), but the absolute chroma varies because `C_max(0.56, H)` differs by hue:

| Sample | H | C_max(0.56, H) | C = 0.95 × C_max | Character |
|---|---|---|---|---|
| t=0.0 | 90° | 0.18 | 0.171 | Vivid yellow |
| t=0.25 | 134° | 0.18 | 0.171 | Vivid green — gamut holds |
| t=0.50 | 178° | 0.11 | 0.105 | Teal — gamut tightens |
| t=0.75 | 222° | 0.10 | 0.095 | Steel blue — tightest point |
| t=1.0 | 265° | 0.19 | 0.181 | Vivid blue — gamut reopens |

The chroma profile of this path follows the hue-dependent shape of the gamut envelope at `displayL`. The palette naturally desaturates through gamut-constrained hue regions (teal, steel blue) and resaturates where the gamut opens (green, blue). This is desirable: the path respects the physics of colour rather than forcing impossible vibrancy.

Note that lightness does **not** vary along the arc — it is fixed at `displayL`. Lightness variation is introduced by Engine B, which applies the shared lightness curve independently at each scale level.

### Comparison with naive HSL interpolation

In HSL, the same path would maintain constant saturation throughout — but the _perceived_ colourfulness would vary wildly because HSL saturation does not correspond to perceptual chroma. The OKLCH approach trades constant numerical saturation for consistent _relative_ vibrancy, which produces more honest and visually harmonious results.

### Effect of changing displayL

If the designer adjusts the `displayL` slider from 0.56 to 0.85, the gamut envelope changes shape. At high lightness, yellow retains more chroma (C_max ≈ 0.14) while blue is severely constrained (C_max ≈ 0.07). The same arc at the same normalised chroma would produce a more pronounced chroma dip through the blue region. The gamut contour on the wheel contracts around blue anchors, visually communicating this constraint before the designer commits.

---

## 6. Boundary Behaviour

### Case 1: Anchor inside gamut, path stays inside

When both anchors have normalised chroma ≤ 1.0 and the interpolation path doesn't pass through severely constrained hue regions, every sampled point resolves to an in-gamut colour. No correction needed.

This is the common case for well-chosen anchors at a moderate `displayL` — hues that aren't at the extremes of gamut constraint at the current display lightness.

### Case 2: Path traverses a gamut narrows

Even with normalised chroma ≤ 1.0, the path can traverse hue regions where `C_max(displayL, H)` is very low. The path remains technically in-gamut (because normC × C_max is always ≤ C_max), but the absolute chroma may drop so low that the colour becomes perceptually achromatic.

**Example:** At `displayL = 0.56`, interpolating at normC = 1.0 through teal (H ≈ 178°), where `C_max(0.56, 178°)` ≈ 0.11. The colour is technically "as vivid as possible" but much less vivid than neighbouring hues. This effect is purely hue-dependent at a fixed `displayL`.

**Design response:** The gamut contour on the wheel makes this visible. At hue angles where `C_max` is low, the contour contracts inward — anchors near the edge visually "press against" a tighter boundary. The designer sees which hue regions are chroma-constrained at the current `displayL` and can adjust either the anchors or the `displayL` slider to explore alternatives.

### Case 3: Raw chroma exceeds gamut (Strategy A or C)

If using raw or global-ceiling chroma, interpolated points can request chroma values above `C_max(displayL, H)`. These must be clamped.

**Clamping rule:** Reduce C to `C_max(displayL, H)` while preserving H.

```typescript
function clampToGamut(C: number, H: number, displayL: number): number {
  const cMax = maxChroma(displayL, H);
  return Math.min(C, cMax);
}
```

This is the same chroma-reduction gamut mapping from [03-gamut-mapping.md](../docs/03-gamut-mapping.md). Hue is always preserved — critical for maintaining the structural properties that the truth layer depends on.

**Visual behaviour:** Clamped points cluster along the gamut boundary. If multiple consecutive points on the path are all clamped to the same C_max, the output contains a flat chroma plateau. This is the primary reason Strategy B (normalised chroma) is preferred: it avoids plateaus by construction.

### Case 4: The degenerate displayL extremes

At `displayL` = 0 (black) and `displayL` = 1 (white), `C_max` is exactly 0 for all hues — no chroma is possible. These are edge values of the `displayL` slider, not wheel positions.

When `displayL` approaches 0 or 1, the gamut contour contracts to a point — the entire wheel becomes achromatic. All anchors, regardless of their radial position, produce zero absolute chroma.

**Design response:** The `displayL` slider should have soft stops or visual warnings at the extremes (e.g., `displayL` < 0.05 or `displayL` > 0.95). The wheel should visually indicate when `displayL` is in a degenerate range — a desaturation wash over the wheel background that signals "no meaningful chroma at this lightness."

### Case 5: The achromatic center

An anchor at the exact center of the wheel (distance = 0) has normalised chroma = 0 and undefined hue (`atan2(0, 0) = 0` by convention). Moving infinitesimally off-center establishes a hue, but with near-zero chroma, the hue is imperceptible. Dragging an anchor slowly through the center causes an instantaneous hue flip.

**Design response:** Anchors snapping to center should inherit the hue they held before reaching zero distance. The center is not a useful anchor position (it produces achromatic output regardless of hue), so a small minimum-distance constraint (e.g., normC ≥ 0.02) prevents the degenerate case.

### Case 6: The hue discontinuity at 0°/360°

Hue is an angular quantity. The path from H = 350° to H = 10° should traverse 20° through 0°/360°, not 340° the long way around. Poline's atan2-based mapping handles this naturally for the _endpoints_, but interpolation in Cartesian (x, y) coordinates takes the geometrically shortest path in the (x, y) plane, which automatically corresponds to the shorter hue arc. This is a property inherited from Poline's original design and requires no OKLCH-specific adaptation.

