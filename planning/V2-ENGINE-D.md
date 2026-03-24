# V2 Phase A — Engine D: Semantic Mapper

> Build the core semantic mapping engine that transforms Engine C's intent-classified palette into a complete set of foundation-level design tokens, bridging the gap from raw palette scales to a deployable colour system.

**Depends on:** V1 engines (A, B, C) — all built and tested
**Produces:** `SemanticTokenSet` consumed by [V2-EXPORT-PREVIEW.md](V2-EXPORT-PREVIEW.md) and [V2-UX-SHIP.md](V2-UX-SHIP.md)

---

## V1 Audit

V1 is a working Vite + React OKLCH colour system visualiser with three engines, comprehensive tests, and real-time interaction.

### What's built

| Layer | Capability | Key files |
|---|---|---|
| Engine A | Poline-adapted polar interpolation — draggable anchors, per-axis easing, hue/vibrancy handoff | `src/engine-a/` (5 files) |
| Engine B | OKLCH scale generation — lightness curve, gamut boundary, chroma strategy, WCAG contrast validation | `src/colour-math/index.ts` (488 lines) |
| Engine C | Intent optimizer — intent classification, interaction graph, constraint solver, drift budgets, infeasibility reporting | `src/engine-c/` (5 files) |
| UI | Colour wheel (spring-physics drag), scale strips (contrast badges), lightness curve editor, control panel, token preview, export sheet, infeasibility summary, keyboard shortcuts | `src/components/` (14 files) |
| State | Zustand store with source/derived partition, zundo temporal middleware (undo/redo, 50-step limit) | `src/store/index.ts` |
| Dark mode | Dual-curve system — light and dark pipelines run in parallel, mode toggle in UI | `src/lib/dark-curve.ts`, store |
| Export | CSS custom properties and JSON | `src/lib/export.ts` |
| Sharing | URL state encoding/decoding | `src/lib/url-state.ts` |
| Tests | 26 test files — colour math (golden values, property-based round-trips, snapshots), engine A, engine C (intent, graph, solver, dark, property), store phases, export, URL state | `src/*/__tests__/` |

### What's not built

The tool generates **palette scales** (`hue-0[0..9]`, `neutral[0..9]`) but not **semantic roles** or **component tokens**. The export emits `--hue-0-3: #hex` — layer 1 of a colour system, but not a deployable system.

---

## The Gap: Palette vs. System

The three-layer model from [misc/color-token-architecture.md](../misc/color-token-architecture.md) defines the quality bar:

| Layer | What it is | V1 status |
|---|---|---|
| 1. Reference palette | Raw colour inventory — neutrals, brand hues, status hues | **Built** |
| 2. Semantic roles | Purpose-based tokens — `background.canvas`, `text.primary`, `accent.primary`, `status.error` | **Missing** |
| 3. Component tokens | Executable UI — `button.primary.bg`, `input.focus-ring`, `nav.item.selected-bg` | **Missing** |

> "If the system cannot answer those questions, it is a palette, not a system."

V1 cannot answer: What colour is the app canvas? What colour is body text on each surface? How do I style hover, focus, disabled? What changes in dark mode besides "making everything darker"?

V2 bridges layers 1 → 2 and produces a complete semantic token set that plugs directly into shadcn/Tailwind. Layer 3 (component tokens) is deferred to Phase 7.

---

## Engine D Architecture

A new module at `src/engine-d/` that sits after Engine C and before Export. See [V2-PRODUCT.md](V2-PRODUCT.md) for the full pipeline diagram.

### Data flow

Engine C's `OptimizationResult` gains an `intents: IntentMap` field so Engine D can consume it without re-running classification:

```typescript
// src/engine-c/types.ts — one-line addition
export interface OptimizationResult {
  adjustedScales: Record<string, ScaleEntry[]>
  adjustments: Adjustment[]
  infeasible: InfeasibilityReport[]
  regressions: ContrastEdge[]
  intents: IntentMap  // NEW — exposed for Engine D
}
```

`runEngineC` in `src/engine-c/index.ts` passes the `intents` variable (currently local) into the return value.

### Source of truth

Engine C's intent classification (`surface`, `container`, `foreground`, `emphasis`, `decorative`, `anchor`) is the **input signal**. The `misc/` docs define what Engine D **outputs**:

- [misc/color-token-architecture.md](../misc/color-token-architecture.md) — foundation role inventory
- [misc/shadcn-semantic-tokens.md](../misc/shadcn-semantic-tokens.md) — exact CSS variable names
- [misc/surface-and-text-color.md](../misc/surface-and-text-color.md) — surface hierarchy, text roles, contrast floors
- [misc/dark-mode-color.md](../misc/dark-mode-color.md) — luminance ladder, elevation direction, saturation restraint
- [misc/component-state-color.md](../misc/component-state-color.md) — interactive states, status semantics

### Engine D contract

- **Input:** `OptimizationResult` (adjusted scales + intent map), mode (`light` | `dark`)
- **Output:** `SemanticTokenSet` — a flat record of role name → `{ hex, oklch }` for every foundation role, plus metadata (which status tokens are synthesized vs. native)

---

## Semantic Mapping Rules

Mapping is driven by Engine C's **intent classification per token**, not by hardcoded level indices. This makes it robust against custom lightness curves.

### How it works

For each token in the adjusted palette, Engine C has already classified it as one of: `anchor`, `surface`, `container`, `foreground`, `emphasis`, `decorative`. Engine D groups tokens by intent and assigns semantic roles based on relative lightness within each group.

### Neutral scale mapping

| Engine C intent | Foundation role(s) | Selection rule |
|---|---|---|
| `surface` | `background.canvas`, `background.surface`, `background.surface-raised` | Ordered by descending L: highest-L surface → canvas, next → surface, third → surface-raised (alias surface if only two) |
| `container` | `background.surface-inset`, `border.subtle`, `border.default`, `border.strong` | Highest-L container → surface-inset. Remaining containers ordered by ascending L → border.subtle, border.default, border.strong |
| `foreground` | `text.primary`, `text.secondary`, `text.tertiary`, `text.disabled` | Ordered by ascending L (darkest first in light mode): darkest non-anchor → text.primary, next → secondary, next → tertiary, lightest → disabled |
| `anchor` (level 0) | `background.inverse` candidate | Neutral anchor at the light end of the scale |
| `anchor` (last level) | `text.inverse` candidate | Neutral anchor at the dark end of the scale |

Additional derived tokens:

- `background.accent-subtle` = first chromatic hue at `surface`-intent lightness
- `background.scrim` = darkest neutral anchor at 40% opacity
- `text.link` = `accent.primary`
- `text.on-accent` = `accent.primary-foreground`
- `focus.ring` = `accent.primary`
- `focus.outline` = `accent.primary` at 50% opacity

### Chromatic scale mapping

- `accent.primary` = first chromatic hue (hue-0), token classified `emphasis` at mid-L
- `accent.primary-hover` = next lighter emphasis/decorative token on same hue
- `accent.primary-active` = next darker emphasis token on same hue
- `accent.primary-foreground` = dynamically calculated: lightest neutral if accent L < 0.55, darkest neutral if accent L >= 0.55. Verified for 4.5:1 contrast.

### Status hue mapping with synthesis fallback

For each canonical status angle:

| Status | Canonical hue angle |
|---|---|
| Success | ~145° |
| Warning | ~85° |
| Error | ~25° |
| Info | ~255° |

Algorithm per status:

1. Find the palette hue with the smallest angular distance to the canonical angle
2. If angular distance <= 30°, use that hue's `emphasis`-intent token as the status fill
3. If angular distance > 30°, **synthesize**: compute `oklchToHex(L, maxChroma(L, canonicalH) * globalVibrancy, canonicalH)` at the emphasis-band lightness level, then verify contrast against the canvas surface
4. `status.{name}-subtle` = matched/synthesized hue at `container`-intent lightness
5. `status.{name}-foreground` = dynamically calculated (same logic as accent foreground)

### Minimum viable output

With 2 hues + neutral (the slider minimum), Engine D always produces:

- Accent tokens from hue-0
- Synthesized status tokens for any canonical angle not covered by the palette
- Full neutral hierarchy (canvas, surfaces, text, borders)

The readiness checklist reports whether each status token is **native** (from palette hue) or **synthesized** (generated at canonical angle).

### Dark mode

Same role names. Values drawn from `darkPalette` + `darkOptimization` with dark-mode intent classification (`DARK_BANDS` from `src/engine-c/intent.ts`). Engine D runs once per mode. Key dark-mode rules from [misc/dark-mode-color.md](../misc/dark-mode-color.md):

- Surfaces are low-L (inverted direction from light mode — Engine C's dark bands already handle this)
- Elevated surfaces are lighter than base (not darker)
- Accent area is more restrained than in light mode
- Text contrast is comfortable, not maximised

---

## Store Integration

`computeDerived` in `src/store/index.ts` gains two new derived fields:

```typescript
interface DerivedState {
  hueOutputs: HueOutput[]
  palette: PaletteOutput | null
  optimization: OptimizationResult | null
  gamutBoundary: number[]
  activeAnchorIndex: number | null
  darkLightnessCurve: number[]
  darkDisplayL: number
  darkPalette: PaletteOutput | null
  darkOptimization: OptimizationResult | null
  darkGamutBoundary: number[]
  semanticTokens: SemanticTokenSet | null      // NEW
  darkSemanticTokens: SemanticTokenSet | null   // NEW
}
```

### Derivation flow

Engine D runs after Engine C for both light and dark pipelines inside `computeDerived`:

```
Light: Engine A → Engine B → Engine C → Engine D → semanticTokens
Dark:  Engine A → Engine B(dark curve) → Engine C(dark) → Engine D(dark) → darkSemanticTokens
```

### Export consumption

Export functions consume `SemanticTokenSet` directly. The shadcn export takes **both** light + dark sets to produce the combined `:root` / `.dark` output in a single string. Export formatters remain lazy-evaluated via `useMemo` in `ExportSheet.tsx` — Engine D runs in `computeDerived`, but export string generation only happens when the export sheet opens.

### Performance

Engine D is pure mapping logic — no gamut searches, no solver iterations. Runtime is O(hues × levels) with small constants. No performance concern for the current scale (2–10 hues, 10 levels).

### URL state

No migration needed. `semanticTokens` and `darkSemanticTokens` are derived state, not source state. They are recomputed from the source state that is already encoded in the URL.

---

## Test Specification

Engine D test contract, following existing patterns (Vitest + fast-check):

### Unit tests (`src/engine-d/__tests__/semantic-mapper.test.ts`)

- For each mapping rule, given a known palette + intent map, verify the correct semantic role is assigned
- Test with default lightness curve AND at least one non-standard curve (e.g. flat curve, inverted curve) to confirm intent-driven mapping survives edge cases
- Verify `accent.primary-foreground` contrast calculation picks the correct neutral (light or dark) based on accent L

### Property tests (`src/engine-d/__tests__/semantic-mapper.property.test.ts`)

- For any valid `PaletteOutput`, the semantic output has all required foundation roles populated (no `undefined` values)
- For any valid semantic output, every `text.*` token meets 4.5:1 against its paired `background.*` token
- For any valid semantic output, every `status.*-foreground` meets 4.5:1 against its `status.*` fill

### Status synthesis tests (`src/engine-d/__tests__/status-synthesis.test.ts`)

- With a 2-hue palette at H=180 and H=300 (no hues near red/amber), verify `status.error` and `status.warning` are synthesized at canonical angles (25° and 85°)
- Verify synthesized status tokens pass contrast against canvas
- With a palette containing a hue at H=30 (near error canonical 25°), verify `status.error` uses the native palette hue instead of synthesizing

### Dual-mode tests (`src/engine-d/__tests__/dual-mode.test.ts`)

- Light and dark semantic tokens are both populated
- Dark `background.canvas` has lower L than light `background.canvas`
- Dark `text.primary` has higher L than light `text.primary`
- Both modes produce identical role key sets

---

## Acceptance Criteria

- [ ] `src/engine-d/` module exists with `SemanticTokenSet` type and `mapSemanticTokens()` function
- [ ] Engine C's `OptimizationResult` exposes `intents: IntentMap`
- [ ] Neutral scale mapping produces all `background.*`, `border.*`, `text.*` roles from intent classification
- [ ] Chromatic mapping produces `accent.primary` and interactive variants from hue-0
- [ ] Status hue synthesis fires for canonical angles > 30° from any palette hue
- [ ] All text/foreground tokens meet 4.5:1 contrast against their paired backgrounds
- [ ] `computeDerived` in store produces `semanticTokens` and `darkSemanticTokens`
- [ ] Dark mode produces identical role key sets with inverted lightness direction
- [ ] All unit, property, status synthesis, and dual-mode tests pass

---

## References

### Colour Science
- [docs/02 — Contrast & Compliance](../docs/02-contrast-compliance.md)
- [docs/06 — Token Intent & Optimization](../docs/06-token-intent.md)

### Source-of-Truth Docs
- [misc/color-token-architecture.md](../misc/color-token-architecture.md) — 3-layer model, foundation + component role inventories
- [misc/shadcn-semantic-tokens.md](../misc/shadcn-semantic-tokens.md) — exact CSS variable names and semantics
- [misc/surface-and-text-color.md](../misc/surface-and-text-color.md) — surface hierarchy, text roles, contrast floors
- [misc/dark-mode-color.md](../misc/dark-mode-color.md) — luminance ladder, elevation, saturation restraint
- [misc/component-state-color.md](../misc/component-state-color.md) — interactive states, status semantics

### Implementation
- Engine C types: [src/engine-c/types.ts](../src/engine-c/types.ts) (extend `OptimizationResult`)
- Engine C entry: [src/engine-c/index.ts](../src/engine-c/index.ts) (expose `intents`)
- Engine C intent bands: [src/engine-c/intent.ts](../src/engine-c/intent.ts) (classification source)
- Store: [src/store/index.ts](../src/store/index.ts) (add `semanticTokens` / `darkSemanticTokens`)
