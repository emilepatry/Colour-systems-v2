# Dark Mode Subsystem

> **Decision:** Dark mode is a parallel token universe, not a toggle. It requires its own lightness curve, intent bands, and interaction graph. Light and dark modes are linked by default (dark derives from light via a transformation) with per-value overrides for expert control. Engine C runs sequentially — once per mode — in Phase 3, with an upgrade path to simultaneous dual-graph solving if cross-mode constraints prove necessary.

---

## Why Dark Mode Is Not a Toggle

The BRIEF lists "Dark mode preview" as a Phase 3 bullet alongside "Vibrancy slider." But dark mode touches every structural layer in the pipeline:

- The **lightness curve** inverts, and the inversion is asymmetric (not `1 - L`).
- The **intent bands** flip — every intent maps to a different OKLCH L range.
- The **interaction graph** changes — cross-group pairings reference a dark page surface instead of `__white`.
- The **gamut boundary** shifts — chroma availability at dark lightness values differs radically from light values.
- The **store** must carry mode-specific state or a derivation function.

Treating dark mode as a late-stage toggle produces one of two outcomes: it ships broken (wrong contrast, crushed gamut, wrong tints on dark surfaces), or it triggers a late-stage rewrite of the lightness curve, intent bands, and interaction graph — all of which are load-bearing structures that everything else is built on top of.

This document specifies the subsystem before implementation begins.

---

## 1. Dark Mode Lightness Curve

### The problem with naive inversion

The light mode curve is:

```
Light: [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17]
```

A simple `1 - L` flip produces:

```
Naive: [0.03, 0.07, 0.13, 0.22, 0.32, 0.44, 0.55, 0.64, 0.73, 0.83]
```

This fails for two reasons:

1. **WCAG contrast is computed on relative luminance, not OKLCH L.** For achromatic colours, relative luminance Y ≈ L³. At the dark end, small L gaps produce tiny Y gaps, which produce negligible contrast ratios. A naive inversion concentrates L values where contrast sensitivity is lowest.

2. **The endpoints are wrong.** Level 0 at L=0.03 is perceptually indistinguishable from pure black. Level 9 at L=0.83 is not light enough for comfortable reading. Dark mode surfaces need headroom above true black, and dark mode text needs to reach near-white.

### Proposed dark curve

The dark curve must satisfy the same structural constraint as the light curve: 5 levels apart produces >= 4.5:1 WCAG contrast, 4 levels apart produces >= 3.0:1. The asymmetry arises because these thresholds are harder to meet at the dark end of the L scale.

```
Light: [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17]
Dark:  [0.15, 0.21, 0.28, 0.37, 0.48, 0.60, 0.70, 0.79, 0.87, 0.94]
```

| Level | Light L | Dark L | Dark purpose | Delta from prev |
|-------|---------|--------|--------------|-----------------|
| 0 | 0.97 | 0.15 | Near-black page surface | — |
| 1 | 0.93 | 0.21 | Subtle dark background, hover | 0.06 |
| 2 | 0.87 | 0.28 | Visible border on dark surface | 0.07 |
| 3 | 0.78 | 0.37 | Medium element, muted | 0.09 |
| 4 | 0.68 | 0.48 | Transition zone | 0.11 |
| 5 | 0.56 | 0.60 | Default icon, large text | 0.12 |
| 6 | 0.45 | 0.70 | Body text | 0.10 |
| 7 | 0.36 | 0.79 | Emphasised text | 0.09 |
| 8 | 0.27 | 0.87 | Strong emphasis | 0.08 |
| 9 | 0.17 | 0.94 | Near-white, maximum contrast | 0.07 |

### Asymmetry rationale

The inter-level gaps are wider at the dark end (levels 0–4: 0.06, 0.07, 0.09, 0.11) and narrower at the light end (levels 6–9: 0.10, 0.09, 0.08, 0.07). Compare with the light curve, where gaps are narrower at the light end (levels 0–3: 0.04, 0.06, 0.09) and wider toward the dark end (levels 5–8: 0.11, 0.09, 0.09, 0.10).

This is the same principle in both modes: **widen gaps near the page surface where the eye discriminates subtle differences, and tolerate tighter gaps near the text end where absolute contrast is already high.**

### Approximate contrast verification

Using Y ≈ L³ for achromatic colours (exact for the OKLab→XYZ conversion at C=0):

| Pair (5 apart) | Dark L values | Approx CR | Pass 4.5:1? |
|-----------------|---------------|-----------|-------------|
| 0 ↔ 5 | 0.15, 0.60 | ~4.9 | yes |
| 1 ↔ 6 | 0.21, 0.70 | ~5.5 | yes |
| 2 ↔ 7 | 0.28, 0.79 | ~6.4 | yes |
| 3 ↔ 8 | 0.37, 0.87 | ~6.1 | yes |
| 4 ↔ 9 | 0.48, 0.94 | ~5.5 | yes |

| Pair (4 apart) | Dark L values | Approx CR | Pass 3.0:1? |
|-----------------|---------------|-----------|-------------|
| 0 ↔ 4 | 0.15, 0.48 | ~3.0 | yes (marginal) |
| 1 ↔ 5 | 0.21, 0.60 | ~3.8 | yes |
| 2 ↔ 6 | 0.28, 0.70 | ~4.5 | yes |
| 3 ↔ 7 | 0.37, 0.79 | ~4.6 | yes |
| 4 ↔ 8 | 0.48, 0.87 | ~4.8 | yes |
| 5 ↔ 9 | 0.60, 0.94 | ~3.3 | yes |

The 0↔4 pair is marginal at 3.0:1. The light curve's 5↔9 pair is similarly tight. Both curves thread the same needle — the constraint budget is fully consumed at the extremes.

### Validation requirement

These values are derived from Y ≈ L³ approximation. **Final validation must be performed on sRGB hex values** using the WCAG relative luminance formula from [02-contrast-compliance.md](../docs/02-contrast-compliance.md), consistent with the methodology in [04-scale-design.md](../docs/04-scale-design.md). Build a margin of >= 0.5 CR points. If validation fails at specific pairs, adjust the dark curve — do not weaken the contrast requirements.

---

## 2. Dark Mode Intent Bands

### Mode-dependent bands

The light-mode intent bands from [06-token-intent.md](../docs/06-token-intent.md) become one column in a mode-dependent table. Dark-mode bands are derived from the dark lightness curve: each band spans the levels that serve the intent's purpose.

| Intent | Light band | Dark band | Max drift | Hue locked | Chroma locked |
|--------|-----------|-----------|-----------|------------|---------------|
| anchor | — (frozen) | — (frozen) | 0 | yes | yes |
| surface | 0.92 – 1.00 | 0.12 – 0.22 | 0.03 | no | if achromatic |
| container | 0.75 – 0.94 | 0.20 – 0.40 | 0.10 | no | if achromatic |
| foreground | 0.15 – 0.55 | 0.55 – 0.95 | 0.20 | no | if achromatic |
| decorative | 0.40 – 0.85 | 0.25 – 0.65 | 0.15 | no | if achromatic |
| emphasis | 0.30 – 0.65 | 0.38 – 0.75 | 0.12 | yes | if achromatic |

### Band derivation methodology

Rather than specifying dark bands as magic numbers, derive them from the dark lightness curve:

- **Surface** spans levels 0–1 of the active curve (page backgrounds, subtle hover states). Light: levels 0–1 → 0.93–0.97, padded to 0.92–1.00. Dark: levels 0–1 → 0.15–0.21, padded to 0.12–0.22.
- **Container** spans levels 1–3 (tinted component backgrounds). Light: 0.78–0.93, padded to 0.75–0.94. Dark: 0.21–0.37, padded to 0.20–0.40.
- **Foreground** spans levels 5–9 in light mode (dark text) and levels 5–9 in dark mode (light text). The absolute L range flips but the structural role is identical.
- **Decorative** spans the middle range where borders and dividers live. Wider band, moderate drift.
- **Emphasis** spans mid-range levels where the group's key colour is both recognisable and provides sufficient contrast against surfaces.

This derivation means the bands update automatically when the lightness curve is tuned. The padding values (how far beyond the curve levels the band extends) are fixed per intent.

### Intent inference adaptation

The intent inference rules from [06-token-intent.md § Inferring Intent](../docs/06-token-intent.md) are mode-dependent. Rule 5 currently reads:

```
5. If the slot is `background`:
   - L > 0.92 → surface
   - L ≤ 0.92 → container
```

In dark mode, this becomes:

```
5. If the slot is `background`:
   - L < 0.22 → surface
   - L ≥ 0.22 → container
```

The threshold is derived from the dark surface band's upper bound.

### Inverse group behaviour

In light mode, the Inverse group uses the dark surface band (0.10–0.22) — a dark tooltip or snackbar on a light page. In dark mode, the Inverse group uses the **light** surface band (0.92–1.00) — a light tooltip on a dark page. The Inverse group always uses the surface band of the opposite mode.

---

## 3. Light–Dark Relationship Model

This is the most consequential design decision in the dark mode subsystem. It determines store complexity, UX surface area, and constraint graph structure.

### Option A: Derived (transformation function)

Dark mode is computed from light mode via a deterministic transformation. The designer manipulates one set of controls; dark mode auto-updates.

**Transformation sketch:**

```typescript
function deriveDarkCurve(lightCurve: number[]): number[] {
  return lightCurve.map((L, i, arr) => {
    const t = i / (arr.length - 1)
    const base = 1 - L
    const asymmetry = easeOutQuad(t) * DARK_SPREAD_FACTOR
    return clamp(base + asymmetry, 0.10, 0.98)
  })
}
```

The transformation is not `1 - L`. It applies an asymmetric easing that widens gaps at the dark end of the output curve.

| | Pro | Con |
|---|---|---|
| | One set of controls — zero added UX complexity | Transformation must be specified, validated, and tuned |
| | Store does not grow | Some light-mode configurations may produce poor dark curves |
| | Guaranteed consistency between modes | Designer cannot fix dark mode independently if derivation produces a suboptimal result |

### Option B: Independent (full duplication)

Light and dark modes are independently editable. The store doubles.

| | Pro | Con |
|---|---|---|
| | Maximum control — each mode is a first-class design surface | Store complexity doubles (two curves, two sets of intent bands, two interaction graphs) |
| | No transformation to specify or validate | UX burden doubles — designer must manage two parallel systems |
| | No risk of derived values being wrong | Easy to produce light and dark modes that are inconsistent |

### Option C: Linked with overrides (recommended)

Dark mode derives from light by default via a transformation function. The designer can override individual dark-mode values. The store tracks which values are overridden vs. derived.

| | Pro | Con |
|---|---|---|
| | Zero-config by default — drag an anchor, both modes update | Override tracking adds moderate store complexity |
| | Expert designers can fine-tune dark mode independently | The transformation still must be specified and validated |
| | Avoids full duplication of Option B | Override state must be serialised for undo and shareable URLs |
| | Graceful degradation — overrides are optional, not required | UI must distinguish derived vs. overridden values |

**Recommendation: Option C.**

The product's core interaction model is "drag one anchor, watch an entire system respond." Dark mode should participate in that experience by default. Option A denies expert control. Option B demands it from every user. Option C makes the common case effortless and the advanced case possible.

### Store shape implications

The Zustand `SourceState` from [engine-coherence-model.md](engine-coherence-model.md) evolves:

```typescript
interface SourceState {
  // Engine A state (unchanged)
  anchors: Array<{ H: number; C: number }>
  easing: { x: EasingId; y: EasingId; z: EasingId }
  numHues: number

  // Shared parameters (mode-aware)
  lightnessCurve: number[]           // light mode curve (source of truth)
  darkCurveOverrides: Map<number, number>  // level index → overridden L value
  chromaStrategy: 'max_per_hue' | 'uniform'
  compliance: 'AA' | 'AAA'
  activeMode: 'light' | 'dark'      // which mode is currently displayed/edited
}
```

The derived state adds:

```typescript
interface DerivedState {
  // Per-mode outputs
  lightScales: Record<string, ScaleEntry[]>
  darkScales: Record<string, ScaleEntry[]>
  darkLightnessCurve: number[]       // fully resolved (derived + overrides applied)

  // Validation (per-mode)
  lightValidation: ValidationResult
  darkValidation: ValidationResult

  // Gamut boundaries (per-mode, since maxChroma depends on L)
  lightGamutBoundary: Record<number, number[]>
  darkGamutBoundary: Record<number, number[]>

  // Active mode selectors (convenience)
  activeScales: Record<string, ScaleEntry[]>
  activeValidation: ValidationResult
  activeGamutBoundary: Record<number, number[]>
}
```

The `darkCurveOverrides` map is serialisable (required for undo and URL encoding). When empty, the dark curve is fully derived. When a designer edits a dark-mode level, the index and value are added to the map. A "reset to derived" action clears a specific override or the entire map.

---

## 4. Interaction Graph Adaptation

### Cross-group pairings become mode-indexed

The interaction graph from [06-token-intent.md § The Interaction Graph](../docs/06-token-intent.md) hardcodes `__white` as the page surface. In dark mode, the page surface is the dark surface token — the near-black level 0 of the dark curve.

Light mode cross-group pairings:

```
- Every group's `text` on `__white` (4.5:1)
- Every group's `base` on `__white` (4.5:1)
- Every group's `border` on `__white` (3:1)
- Neutral `text` on every status group's `backgroundLevel1` (4.5:1)
```

Dark mode cross-group pairings:

```
- Every group's `text` on `__black` (4.5:1)
- Every group's `base` on `__black` (4.5:1)
- Every group's `border` on `__black` (3:1)
- Neutral `text` on every status group's `backgroundLevel1` (4.5:1)
```

Where `__black` is the dark-mode page surface anchor — either literal `#000000` or the dark curve's level 0 value. The choice depends on whether the design uses true black or elevated dark (a common dark-mode design decision that the designer should control).

### Intra-group pairings

Intra-group pairings remain structurally identical across modes. `text` still appears on `background`; `border` still appears on `background`. But the L values of those tokens are resolved via the dark intent bands, so the actual colours and contrast ratios differ.

### Component-derived pairings (future)

Component-derived pairings — cross-group token combinations arising from specific UI components — are deferred to a future release. See [docs/06-token-intent.md § Future: User-Defined Component Pairings](../docs/06-token-intent.md#future-user-defined-component-pairings) for the scoping rationale. When added, each component-derived pairing will need evaluation in both modes: the pairing structure is identical but the tokens resolve to different L values via their mode-dependent intent bands.

### Edge representation

Each edge in the interaction graph carries a mode tag:

```typescript
interface ContrastEdge {
  foreground: TokenRef   // group + slot
  background: TokenRef
  threshold: number      // 4.5 or 3.0
  mode: 'light' | 'dark' | 'both'
}
```

Edges tagged `'both'` use the active mode's resolved token values. Edges tagged with a specific mode are only evaluated when that mode is active. In practice, most edges are `'both'` — the structure is mode-independent, only the token values change.

The exception is cross-group surface pairings, where the surface anchor itself changes (`__white` in light, `__black` in dark). These are represented as two edges — one per mode — or as a single edge whose surface reference is mode-resolved.

---

## 5. Engine C Dual-Mode Operation

### Sequential (recommended for Phase 3)

Engine C runs the constraint solver once per mode. Each run produces an independent set of adjusted tokens. The two runs share the same priority rules, drift budgets, and intent taxonomy — only the lightness bands and interaction graph edges differ.

```
Input (light mode):
  - Candidate tokens from Engine B (light curve)
  - Light intent bands
  - Light interaction graph (cross-group on __white)

Output: optimised light tokens + infeasibility reports

Input (dark mode):
  - Candidate tokens from Engine B (dark curve)
  - Dark intent bands
  - Dark interaction graph (cross-group on __black)

Output: optimised dark tokens + infeasibility reports
```

**Advantages:**

- Implementation is straightforward — the existing Engine C pipeline accepts mode-specific parameters.
- Performance is predictable — two sequential runs, each with the same constraint graph size as the current single run.
- No new constraint types (cross-mode constraints add complexity with unclear value at this stage).

### Simultaneous (upgrade path)

Engine C runs once with a doubled constraint graph: all light-mode edges and all dark-mode edges in a single solve. This enables cross-mode constraints:

- "Emphasis token must not shift hue between modes" (already enforced by hue locking, so this is free).
- "Foreground lightness in dark mode must not be lighter than foreground lightness in light mode" (prevents the text from flipping the wrong way).
- "Container tint should be perceptually similar across modes" (same hue, scaled chroma).

These constraints are valuable but not critical for a first implementation. The sequential approach produces correct, independent results for each mode. Cross-mode coherence can be enforced by the derivation function (Section 3) rather than by the solver.

**Recommendation:** Ship sequential in Phase 3. Monitor infeasibility reports across modes. If patterns emerge where independent solving produces incoherent cross-mode results (e.g., a status group's emphasis token shifts to different hues in each mode), upgrade to simultaneous in Phase 4 alongside the full optimizer buildout.

---

## 6. Gamut Boundary Implications

### Chroma availability shifts at dark lightness

The gamut boundary from [03-gamut-mapping.md](../docs/03-gamut-mapping.md) is a function of both L and H. Dark mode surfaces (L = 0.15–0.40) occupy a different region of the gamut than light mode surfaces (L = 0.75–0.97). Chroma availability changes significantly:

| Hue | Light surface (L=0.93) | Dark surface (L=0.21) | Light container (L=0.87) | Dark container (L=0.28) |
|-----|----------------------|---------------------|------------------------|----------------------|
| Red (25°) | C ≈ 0.06 | C ≈ 0.08 | C ≈ 0.10 | C ≈ 0.10 |
| Yellow (90°) | C ≈ 0.12 | C ≈ 0.03 | C ≈ 0.14 | C ≈ 0.05 |
| Green (145°) | C ≈ 0.10 | C ≈ 0.06 | C ≈ 0.13 | C ≈ 0.09 |
| Blue (265°) | C ≈ 0.04 | C ≈ 0.11 | C ≈ 0.07 | C ≈ 0.13 |
| Purple (305°) | C ≈ 0.05 | C ≈ 0.10 | C ≈ 0.08 | C ≈ 0.12 |

Values are approximate (from [03-gamut-mapping.md](../docs/03-gamut-mapping.md) Table 1 and interpolated for the dark curve's L values).

### The dark yellow problem

Yellow is the canonical gamut casualty in dark mode. At L < 0.35, maximum chroma for H ≈ 90° drops below 0.05 — effectively desaturated. What the designer sees as "yellow" at light surface levels becomes brown or olive at dark surface levels. This is not an sRGB limitation but a constraint of human colour perception.

**How the system handles this:**

1. **Graceful chroma reduction.** Engine B applies `min(chosenC, maxChroma(L, H))` as it already does. The dark yellow container simply has very low chroma.
2. **Warning, not failure.** When `maxChroma(L, H) < 0.03` for a hue at a dark surface level, flag a `near_neutral_chroma` warning in the output metadata (per [05-generation-algorithm.md](../docs/05-generation-algorithm.md) edge case handling). This is not an error — it is a physical reality the designer should be aware of.
3. **No hue substitution.** The system does not swap yellow for gold or amber in dark mode. Hue is designer intent. The chroma reduction is honest: "this is how much yellow you can have at this lightness."

### Gamut contour on the wheel

The gamut boundary contour rendered on the colour wheel is mode-dependent. In light mode, the contour reflects `maxChroma(L_light, H)` at the display lightness. In dark mode, it reflects `maxChroma(L_dark, H)` at the dark display lightness. The contour changes shape:

- Yellow's contour contracts dramatically (chroma ceiling drops).
- Blue's contour expands (blue has more chroma headroom at dark lightness values).
- Red and magenta remain relatively stable across modes.

The wheel must re-render the contour when the active mode changes. Since `maxChroma` is already computed per frame during drag, this is a parameter change (which L to use), not a new computation.

### Vibrancy interpretation across modes

The vibrancy factor from Engine A (the normalised chroma z ∈ [0, 1]) is mode-independent — it expresses relative intent ("80% of maximum vibrancy"). But the absolute chroma it produces differs per mode because `maxChroma(L, H)` changes:

```typescript
// Light mode, level 2, yellow (H=90):
chosenC = 0.8 * maxChroma(0.87, 90)  // ≈ 0.8 * 0.14 = 0.112

// Dark mode, level 2, yellow (H=90):
chosenC = 0.8 * maxChroma(0.28, 90)  // ≈ 0.8 * 0.05 = 0.040
```

The designer sets vibrancy once. The system produces different absolute chromas per mode because the gamut boundary differs. This is correct behaviour — the alternative (matching absolute chroma across modes) would require pushing dark-mode tokens out of gamut.

---

## Phasing Recommendation

Remove "Dark mode preview" from the Phase 3 bullet list in [BRIEF.md](BRIEF.md). Replace with:

### Phase 3a — Dark Mode Subsystem

- Dark mode lightness curve (derived from light curve, overridable per level)
- Dark intent bands (derived from dark curve per Section 2)
- Mode toggle in token preview panel
- Engine B dual-curve generation (runs light and dark pipelines)
- Gamut contour re-rendering per mode on the wheel

### Phase 4 addition — Dark Mode Optimization

- Engine C sequential dual-mode solving (light and dark interaction graphs)
- Dark-mode infeasibility reporting
- Cross-mode coherence analysis (prerequisite evaluation for simultaneous solving)

Dark mode generation (Engine B) ships in Phase 3 because the designer needs to see their palette in both contexts. Dark mode optimization (Engine C) ships in Phase 4 alongside the rest of the optimizer, because the constraint solver depends on the intent taxonomy, interaction graph, and priority rules — all of which are Phase 4 deliverables.

---

## Open Questions

These require resolution during implementation. They are design decisions, not specification gaps — the answers depend on user research and implementation experience.

1. **True black vs. elevated dark.** Should the dark surface anchor be `#000000` (true black, OLED-friendly) or the dark curve's level 0 (L=0.15, slightly elevated)? Material Design uses elevated dark; Apple uses true black on OLED. This could be a designer-controlled toggle.

2. **Neutral hue in dark mode.** Light-mode neutrals can carry a subtle warm or cool tint (C = 0.003–0.008 per [05-generation-algorithm.md](../docs/05-generation-algorithm.md)). Should dark-mode neutrals carry the same tint, an inverted tint, or no tint? Tinted dark surfaces are common in modern dark modes (e.g., a warm charcoal instead of pure grey).

3. **Override granularity.** Section 3 proposes per-level overrides on the dark lightness curve. Should overrides extend to per-intent band boundaries? Per-hue dark chroma caps? The more override surfaces, the more state to track. Start with curve-level overrides only and expand based on demand.

4. **Preview mode vs. edit mode.** In Phase 3, "dark mode preview" means viewing the palette in a dark context. Should the designer be able to edit anchors while viewing dark mode, or must they switch back to light mode to edit? If editing in dark mode is supported, the wheel's display lightness and gamut contour must reflect the dark curve, and anchor drags must propagate through the derivation function in reverse.
