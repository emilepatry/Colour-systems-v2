---
tags: [OKLCH, Poline, performance, caching, rendering, gamut-contour, edge-cases, Engine-A, Engine-B]
purpose: Continuation of OKLCH-COORDINATE-MAPPING.md covering performance, per-axis easing in OKLCH, Engine A→B handoff, gamut contour rendering, edge cases, and the full adapted pipeline.
related: [planning/OKLCH-COORDINATE-MAPPING.md, poline/THEORY.md, poline/VISUALIZATION.md, docs/03-gamut-mapping.md, docs/04-scale-design.md]
---

# OKLCH Coordinate Rendering & Edge Cases

Companion to [OKLCH-COORDINATE-MAPPING.md](OKLCH-COORDINATE-MAPPING.md), which defines the coordinate system, chroma strategies, interpolation, and boundary behaviour. This document covers implementation concerns: caching, easing consequences, Engine A→B handoff, gamut contour rendering, edge cases, and the full adapted pipeline.

---

## 7. C_max Caching and Performance

Normalised chroma (Strategy B) requires a `C_max(L, H)` lookup at every sampled point during interpolation. Each lookup involves a 20-iteration binary search with an OKLCH → sRGB conversion per iteration. For real-time drag interaction, this must be fast.

### The cost

- Per lookup: 20 iterations × 1 OKLCH-to-sRGB conversion = ~20 matrix multiplications + 20 gamma encodes.
- Per frame during drag: `numPoints × numSegments` lookups. A typical palette (6 points × 3 segments = 18 lookups × 20 iterations = 360 conversions per frame).
- At 60fps: ~21,600 conversions/second.

This is trivially fast on modern hardware. No optimisation is needed for typical palette sizes.

### When to cache

For visualising the gamut boundary contour on the wheel (a dense 2D grid of C_max values), pre-computation is worthwhile:

```typescript
function buildChromaEnvelopeCache(resolution: number): Float32Array {
  const cache = new Float32Array(resolution * resolution);
  for (let hi = 0; hi < resolution; hi++) {
    const H = (hi / resolution) * 360;
    for (let li = 0; li < resolution; li++) {
      const L = li / (resolution - 1);
      cache[hi * resolution + li] = maxChroma(L, H);
    }
  }
  return cache;
}
```

A 360 × 100 cache (36,000 entries) takes ~10ms to build on a modern machine and provides sub-degree hue resolution with 1% lightness granularity. Bilinear interpolation between cache entries is sufficient for visual rendering. Whether this resolution is also sufficient for normalised-chroma lookups during interpolation depends on the cache accuracy test results — see [Section 7a](#7a-cache-accuracy-constraints) for the two-threshold model and resolution upgrade path.

The 360 × 100 resolution is **provisional**. If the [cache accuracy test](../planning/TEST-SPEC.md#category-4--cache-accuracy-tests) finds any (L, H) point where the bilinear cache diverges from the binary search ground truth by more than the structural threshold (C_max error > 0.02), the resolution will be increased or a dual-cache strategy adopted (low-res for rendering, binary search for interpolation).

The cache must be invalidated if the target gamut changes (e.g., switching from sRGB to Display P3).

---

## 7a. Cache Accuracy Constraints

The C_max cache serves two consumers with different error tolerances:

1. **Gamut contour rendering** on the wheel — visual only. A C_max error of 0.005 shifts a colour by less than one 8-bit sRGB step at most hue/lightness positions. Errors up to this threshold are invisible on the contour.
2. **Normalised chroma during interpolation** — affects output palette values. The vibrancy factor `z = C / C_max` is computed at each sampled arc point; if C_max is wrong, the reconstructed chroma `C = z × C_max` at the destination (L, H) carries the error forward into Engine B's scale generation and downstream contrast validation.

### Two-threshold model

| Threshold | C_max error | Consequence | Test behaviour |
|---|---|---|---|
| Visual | > 0.005 | Visible colour difference on the contour. Acceptable for rendering. | Report count and worst-case (L, H) positions |
| Structural | > 0.02 | Contrast-relevant chroma shift. A 0.02 chroma error at L = 0.50 can shift WCAG relative luminance by ~0.01, enough to flip a borderline contrast check. | Hard test failure — zero points may exceed this |

### Dual-purpose cache risk

If the cache resolution is chosen for visual adequacy (contour rendering), the bilinear interpolation smooths the sharp ridges of the sRGB gamut boundary. This smoothing is desirable for rendering (it produces antialiased contours) but means the cached C_max disagrees with the ground-truth binary search at ridge locations. If the disagreement exceeds the structural threshold at any (L, H) point, the cache cannot serve both purposes — interpolation must fall back to binary search, or a separate higher-resolution cache must be used.

### Ridge locations

The sRGB gamut boundary in OKLCH space has sharp ridges where an sRGB channel transitions between its 0 and 1 boundaries. These occur at predictable hue angles because each ridge corresponds to one of the six faces of the sRGB cube projecting into OKLCH cylindrical coordinates. The sharpest ridges cluster around approximately:

- **H ≈ 30°** — red/yellow boundary (R channel at 1, G rising)
- **H ≈ 90°** — yellow peak (R falling, G at 1)
- **H ≈ 145°** — green/cyan boundary (G at 1, B rising)
- **H ≈ 265°** — blue peak (G falling at low L; B at 1)
- **H ≈ 325°** — magenta/red boundary (B falling, R at 1)

At these hue angles, C_max can change by 0.03–0.05 over a 1° hue shift or 1% lightness step — exactly the grid spacing of the 360 × 100 cache. Bilinear interpolation between grid points that straddle a ridge will return a value that splits the difference, which may or may not stay within the structural threshold.

### Resolution upgrade path

If the 360 × 100 cache exceeds the structural threshold at any point:

1. **First escalation: 720 × 200** (~576KB as Float32, ~40ms build time). Halves the grid spacing in both dimensions, reducing bilinear interpolation error by ~4× at ridges.
2. **Second escalation: adaptive resolution.** Use the standard 360 × 100 grid in smooth regions and a 4× denser sub-grid (1,440 × 400 locally) within ±5° of each known ridge hue angle. The adaptive cache adds ~100KB and ~15ms build time.
3. **Final fallback: binary search for interpolation.** If no cache resolution is sufficient, use the cache only for contour rendering and run the binary search for every `pointToHC` call during interpolation. The cost analysis in Section 7 shows this is fast enough for typical palette sizes (~360 conversions/frame).

The [cache accuracy test](../planning/TEST-SPEC.md#category-4--cache-accuracy-tests) determines which resolution is needed before the cache is used for real-time rendering.

---

## 7b. Frame Budget During Drag

The product's first principle is that dragging an anchor must produce an instant, 60fps response across the entire pipeline. This section budgets every stage that runs on the main thread during drag and defines what is deferred or offloaded.

### Pipeline cost per frame (9 scales, 10 levels, AA compliance)

| Stage | Cost | Frequency | Thread |
|-------|------|-----------|--------|
| Engine A — Poline interpolation | ~0.3ms | Every frame | Main |
| Engine B — scale generation (gamut mapping + sRGB conversion) | ~2ms | Every frame | Main |
| Tier 1 validation — intra-hue for active scale | ~0.02ms | Every frame | Main |
| React render (scale strips, wheel, badges) | ~4–8ms | Every frame | Main |
| **Per-frame main-thread total** | **~6.3–10.3ms** | | |
| Tier 2 validation — intra-hue for all scales | ~0.15ms | Debounced at 100ms (10fps) | Main |
| Tier 3 validation — cross-hue (all pairs) | ~1.2ms | Drag-end or debounced at 500ms | Web Worker |

At the default palette size (9 scales), per-frame main-thread cost is 6–10ms, leaving 6–10ms headroom against the 16.6ms frame budget. This headroom absorbs GC pauses, layout/paint overhead, and input event processing.

### Scaling behaviour

At 13 scales (8 semantic + 4 accent + 1 neutral), Engine B scale generation rises to ~3ms and Tier 3 cross-hue checks rise to ~2.5ms. Per-frame cost stays under 12ms because only Tier 1 (15 checks, constant regardless of hue count) runs on every frame. Tier 3's increased cost is absorbed by the Web Worker.

### Web Worker for Tier 3

Cross-hue validation is the only O(N²) operation in the pipeline and the only stage that grows quadratically with hue count. It runs in a dedicated Web Worker:

1. On drag-end (or every 500ms during drag), the main thread posts the full hex grid (`Record<string, string[]>`, ~2KB for 13 scales × 10 levels) to the worker.
2. The worker runs `validate_cross_hue` and posts back `CrossValidationResult`.
3. The store merges the result into `crossValidation`. Components subscribed to `crossValidation` re-render.

The worker is long-lived (created at app init, not per-drag) and stateless — it receives the hex grid as input and returns failures as output. No shared memory or synchronisation is required.

### Stale badge policy

During drag, cross-hue badges may show data from the previous Tier 3 run. This is acceptable: the designer's attention is on the strip being dragged (which has live Tier 1 badges), and cross-hue indicators are peripheral. On drag-end, Tier 3 fires immediately and badges update within ~1.2ms + worker message overhead (~0.1ms).

For the validation tier definitions and complexity analysis, see [docs/05-generation-algorithm.md § Validation Performance](../docs/05-generation-algorithm.md#validation-performance). For store subscription guidance, see [engine-coherence-model.md § Zustand Store Shape](engine-coherence-model.md#zustand-store-shape-sketch).

---

## 8. The displayL Slider (replaces Inverted Lightness)

Poline's `invertedLightness` flag reversed the distance-to-lightness mapping. With distance = chroma, this concept no longer applies — distance encodes normalised chroma, and lightness is externalised to the `displayL` shared parameter.

The `displayL` slider (defaulting to the lightness curve's midpoint, typically L ≈ 0.56) replaces `invertedLightness` as the lightness control on the wheel. It determines the reference lightness for chroma normalisation and gamut contour rendering. The designer can drag the slider to explore how chroma availability changes at different lightness levels — a more direct and informative interaction than a binary inversion toggle.

When `displayL` changes, the gamut contour on the wheel re-renders: at low `displayL`, some hues gain chroma headroom (blue) while others lose it (yellow). At high `displayL`, the reverse occurs. The C_max cache must be re-indexed at the new `displayL` (or, if using the binary search directly, the cache is not needed for interpolation — only for contour rendering).

---

## 9. Per-Axis Easing in OKLCH Space

Poline's per-axis easing applies separate easing functions to x, y, and z interpolation. With distance = chroma, the consequences differ from the original lightness-radial model.

### X and Y easing: hue and chroma coupling

Because x and y jointly encode both hue (angle) and normalised chroma (distance), applying different easing functions to x and y distorts both hue and chroma trajectories simultaneously. A sinusoidal ease on x with linear y does not produce "sinusoidal hue transition with linear chroma" — it produces a complex coupled trajectory through both dimensions.

This coupling is what makes Poline's curves visually interesting. The OKLCH adaptation preserves it — the axes encode different properties (hue + chroma instead of hue + lightness), but the mathematical structure (angle + distance from center) is identical.

### Z easing: not applicable in the initial build

With distance = chroma, the z-axis is not exposed on the 2D wheel. All anchors share the same z-plane, so z-easing has no effect. The per-axis easing system supports only x and y in the current model.

Z-axis easing is reserved for future use (e.g., per-anchor vibrancy override, where each anchor could carry an independent vibrancy multiplier that interpolates along the arc). If this feature is added, the z-axis would encode a vibrancy offset, and z-easing would shape how the offset evolves between anchors.

---

## 10. Interaction with Engine B (The Truth Layer)

Engine A (the toy layer) produces `{ H, vibrancy }` pairs — hue angles and normalised chroma values — for each sampled point along the interpolation arc. Engine B (the truth layer) takes these and generates structurally correct token scales. The interface between the two engines is where creative intent meets physical constraint.

### What Engine A provides

Engine A's output is a set of `{ H, vibrancy }` pairs — one per sampled point along the interpolation path. Each pair represents the designer's hue and vibrancy intent as expressed through anchor placement and drag interaction. Engine A does **not** produce lightness values — lightness is a shared parameter controlled by the lightness curve, not a per-anchor or per-sample output.

### What Engine B does with it

Engine B takes Engine A's hue and vibrancy output and feeds it into the scale generation pipeline:

1. **Uses hue angles directly** from Engine A's output (the H component of each sampled point).
2. **Applies the shared lightness curve** — Engine B sets L from `lightnessCurve[level]` at each of the 10 scale levels. Lightness is never derived from the wheel.
3. **Uses vibrancy as a chroma scaling factor** — at each (level, hue) pair, Engine B computes `chosenC = vibrancy × maxChroma(lightnessCurve[level], H)`, capped by the chroma strategy (max per hue or uniform). See [engine-coherence-model.md § The Vibrancy Contract](engine-coherence-model.md#the-vibrancy-contract).
4. **Validates and adjusts** the final output using WCAG contrast rules on converted sRGB hex values.

### The handoff contract

```
Engine A output → Engine B input:
  - H (hue):       used directly as the hue for scale generation
  - vibrancy:      normalised chroma ∈ [0, 1], used as per-hue chroma scaling factor
  - (no L component — lightness is a shared parameter, not an Engine A output)

Engine B output:
  - For each H: a 10-level scale with target L, capped C, validated hex
```

This separation is clean: Engine A is sovereign over hue and vibrancy intent. Engine B is sovereign over lightness structure and physical correctness. Neither produces lightness values that the other must consume — lightness is a shared parameter that Engine B reads from the lightness curve, not from Engine A.

---

## 11. The Gamut Boundary as Visual Feedback

The BRIEF specifies that the gamut boundary renders as a soft contour on the wheel and that chroma reduction during drag is animated visually. With distance = chroma, the contour is a **1D function of hue** at the current `displayL` — structurally simpler than the 2D (L, H) contour in the original lightness-radial model.

### Static contour

The contour renders as a radial boundary on the wheel: for each hue angle, the contour radius = `C_max(displayL, H) / C_max_global`, where `C_max_global` is the maximum `C_max` across all hues at the current `displayL` (used for normalisation so the outermost contour touches the wheel edge at the most vivid hue). The contour is rendered as a smooth SVG path with antialiased edges and low opacity (≈ 0.15) — present but not distracting.

Because `displayL` is fixed for a given wheel state, the contour shape depends only on hue — it is an irregular ring that bulges outward at hues with high chroma headroom (red, magenta) and contracts inward at constrained hues (teal, the dark-yellow/light-blue problematic regions).

### Contour response to displayL changes

When the designer adjusts the `displayL` slider, the contour morphs in real time. This is the primary visual feedback that teaches the designer about gamut constraints:

- At mid-lightness (`displayL` ≈ 0.50), the contour is widest — most hues have generous chroma headroom.
- At high lightness (`displayL` ≈ 0.85), the contour contracts around blue/purple while yellow/green retain more room.
- At low lightness (`displayL` ≈ 0.20), the contour contracts around yellow while blue retains more room.
- At extreme values (`displayL` < 0.05 or > 0.95), the contour collapses to near-zero for all hues.

### Dynamic contour during anchor drag

With normalised chroma (Strategy B), an anchor can never exceed the boundary — normalised distance ≤ 1.0 guarantees C ≤ C_max. The contour communicates how much _absolute_ chroma is available at the anchor's hue. As the anchor rotates through hue angles, the contour boundary at that angle expands or contracts — a visible signal that the colour is gaining or losing chroma headroom.

### Chroma reduction animation

When Engine B reduces an anchor's chroma (e.g., to enforce uniform chroma strategy), the saturation ring arc (from [VISUALIZATION.md](../poline/VISUALIZATION.md)) shortens to reflect the reduced chroma. A brief pulse or glow on the ring signals the adjustment. The gamut contour and the ring arc together tell the story: "your colour was this vivid, the system adjusted it to this."

---

## 12. Edge Cases and Failure Modes

### Dark yellow / light blue

At `displayL` < 0.30, yellow (H ≈ 90°) has C_max approaching zero. At `displayL` > 0.80, blue (H ≈ 265°) has C_max approaching zero. With distance = chroma, these constraints manifest as the gamut contour contracting inward at the affected hue angles — yellow anchors near the edge are "squeezed" at low `displayL`, blue anchors at high `displayL`.

In the scale output, these constraints appear at the corresponding lightness curve levels: Engine B applies `vibrancy × C_max(lightnessCurve[level], H)`, so dark scale levels for yellow and light scale levels for blue will have low absolute chroma regardless of the vibrancy factor.

**Design response:** The gamut contour on the wheel makes these constraints visible. When the designer adjusts `displayL`, they can see which hue regions are chroma-constrained at that lightness. The `displayL` slider teaches the relationship between lightness and chroma availability across hues.

### Achromatic singularity at displayL = 0 and displayL = 1

`C_max(0, H) = 0` and `C_max(1, H) = 0` for all H. When `displayL` approaches these extremes, division by C_max in the `hcToPoint` conversion produces 0/0 when C = 0 and C_max = 0. The implementation must handle this:

```typescript
const normC = cMax > 0 ? C / cMax : 0;
```

At extreme `displayL` values, all anchors map to normC = 0 regardless of their absolute chroma — the entire wheel becomes achromatic. The `displayL` slider should have soft stops to discourage these degenerate values (see [OKLCH-COORDINATE-MAPPING.md § Case 4](OKLCH-COORDINATE-MAPPING.md#case-4-the-degenerate-displayl-extremes)).

### Hue instability at very low chroma

When C < 0.002, the hue angle computed from OKLAB (a, b) via atan2 becomes numerically unstable — tiny floating-point perturbations cause large hue swings. For colours that are effectively achromatic, the hue should be treated as undefined and either snapped to the nearest anchor's hue or inherited from the interpolation context.

```typescript
const CHROMA_EPSILON = 0.002;
function stableHue(L: number, C: number, H: number, fallbackH: number): number {
  return C < CHROMA_EPSILON ? fallbackH : H;
}
```

### Closed-loop paths through complementary hues

A closed-loop palette with anchors at complementary hues (e.g., yellow and blue) must traverse the entire hue wheel. The path will necessarily pass through every gamut narrows in between. With normalised chroma, this produces a chroma profile with multiple dips. With raw chroma, it produces multiple clamping plateaus.

**Design response:** For closed loops across complementary pairs, consider whether the palette benefits from varying z along the path — intentionally lowering vibrancy in constrained regions and raising it where the gamut opens. The easing system supports this through per-axis z-easing, which can be tuned to counteract the gamut envelope's shape.

### Chroma discontinuity at gamut ridges

The sRGB gamut boundary has sharp ridges in OKLCH space (see [Section 7a](#7a-cache-accuracy-constraints) for ridge locations). When an interpolation path crosses a ridge at a shallow angle, C_max can change by 0.03–0.05 between adjacent sample points. At high vibrancy (z > 0.9), this produces a chroma jump of 20% or more between consecutive palette entries — a visible discontinuity in the output.

**Example:** An interpolation path at z = 0.95 crosses the red/yellow ridge near H ≈ 30°. Two adjacent sample points land at:

```
Point A:  H = 29.5°, L = 0.55  →  C_max = 0.15  →  C = 0.1425
Point B:  H = 30.5°, L = 0.55  →  C_max = 0.12  →  C = 0.114
```

The chroma drops 20% over 1° of hue. With finer sampling (e.g., 20 points per segment), the angular step between adjacent samples might be 3–5°, which can straddle a ridge and produce an even larger apparent jump depending on alignment.

**Cache interaction:** The bilinear C_max cache acts as a low-pass filter on the chroma envelope. Where binary search produces a sharp ridge, the cache produces a smooth bump spanning 1–2 grid cells. This smoothing is actually *beneficial* for palette quality — it prevents the chroma profile from having discontinuities that the designer cannot anticipate or control. However, it means the cached and ground-truth C_max values disagree at ridge locations. The cache returns the bilinear average; the binary search returns the true (discontinuous) value.

**Design response:** The cache's smoothing behaviour is acceptable and arguably preferable for palette generation. The structural concern is whether the smoothing introduces errors large enough to affect downstream contrast validation (see [Section 7a](#7a-cache-accuracy-constraints) for the two-threshold model). The [cache accuracy test](../planning/TEST-SPEC.md#category-4--cache-accuracy-tests) quantifies this error empirically and determines whether the 360 × 100 grid resolution is sufficient for both rendering and interpolation, or whether the two consumers need separate C_max sources.

---

## 13. The Full Adapted Pipeline

```mermaid
flowchart TD
  input["Designer provides anchor colours<br/>as (H, C) pairs"] --> normalise["hcToPoint()<br/>maps (H, C) to (x, y)<br/>using normalised chroma at displayL:<br/>normC = C / C_max(displayL, H)"]

  displayL["displayL parameter<br/>(shared slider)"] --> normalise

  normalise --> pairs["Consecutive anchors<br/>form pairs"]
  pairs --> interpolate["vectorsOnLine()<br/>samples N points per pair<br/>with per-axis easing (x, y only)"]

  easing["Position functions<br/>(fx, fy)"] --> interpolate
  invertEase["Segment inversion<br/>(alternating ease direction)"] --> interpolate

  interpolate --> xyPoints["Sampled (x, y) points"]
  xyPoints --> decode["pointToHC()<br/>converts each point back:<br/>H = atan2 angle<br/>normC = distance / 0.5<br/>vibrancy = normC"]

  displayL --> decode

  decode --> engineA["Engine A output:<br/>{H, vibrancy} per sample"]

  engineA -->|"H values"| engineB["Engine B: Scale generation<br/>→ lightnessCurve for L<br/>→ vibrancy × C_max per level<br/>→ chroma strategy<br/>→ WCAG validation"]
  engineA -->|"vibrancy factors"| engineB
  engineB --> output["Final palette:<br/>hex + OKLCH + tokens"]
```

The pipeline preserves Poline's core architecture — bidirectional coordinate mapping, line interpolation with per-axis easing, segment inversion for S-curves, closed-loop support — while replacing HSL with OKLCH and replacing the lightness-radial model with a chroma-radial model. Lightness is externalised to `displayL` (for wheel rendering and normalisation) and `lightnessCurve` (for scale generation). The bridge between creative expression and physical constraint is the vibrancy factor — a normalised chroma value that transfers the designer's "how vivid" intent from the wheel to the scale engine.

---

## 14. Summary of Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Hue mapping | angle → OKLCH H (direct) | Same semantic as HSL, different angle values |
| Chroma mapping on wheel | distance → normalised chroma at `displayL` | Both wheel axes produce visible downstream change; full radial range meaningful |
| Lightness source | `displayL` shared parameter (adjustable slider, defaults to curve midpoint) | Lightness is a structural concern (Stripe insight), not a per-anchor creative choice |
| Gamut boundary handling | Automatic via normalised chroma | No clamping plateaus; chroma follows envelope naturally |
| Gamut contour | 1D function of hue at fixed `displayL`; re-renders on slider change | Simpler than 2D (L, H) contour; teaches designer about gamut at different lightness levels |
| C_max computation | Binary search, 20 iterations | < 0.0000004 precision; fast enough for real-time |
| C_max caching | 360 × 100 LUT for contour rendering (provisional) | ~10ms build time; bilinear interpolation; resolution pending cache accuracy test |
| C_max cache accuracy | Structural threshold < 0.02; validated by dense sweep at 0.1° × 0.001 | Cache smoothing must not produce contrast-relevant chroma errors in interpolation output |
| Degenerate displayL (0, 1) | Soft stops on slider; visual desaturation warning on wheel | No chroma at pure black/white; entire wheel becomes achromatic |
| Low-chroma hue instability | Snap to fallback hue below C < 0.002 | Prevents atan2 noise |
| Z-axis (Poline's third axis) | Not exposed in 2D wheel; reserved for future per-anchor vibrancy override | Vibrancy slider covers this dimension for now |
| Engine A → Engine B handoff | H + vibrancy passed; no L component from Engine A | Clean separation: Engine A owns hue + vibrancy intent, Engine B owns lightness structure |
