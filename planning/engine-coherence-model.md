# Engine A ↔ Engine B Coherence Model

> **Decision:** Engine A feeds **hue angles and vibrancy factors** (normalised chroma, ∈ [0, 1]) to Engine B. The lightness curve lives outside both engines as a shared parameter. Engine B generates the full validated token grid.

---

## Why This Model

This is the only model that respects all three of the product's structural constraints simultaneously:

1. **The Stripe insight demands a shared lightness curve.** All hues must follow the same L trajectory so cross-hue contrast is predictable. Neither "hue only" nor "full palette quantized" handles this cleanly — the first wastes the wheel's radial axis, the second forces a lossy snap from an arbitrary arc onto a fixed L grid.

2. **Every gesture must have a visible consequence.** "Hue only" leaves the radial dimension meaningless — dragging an anchor inward changes nothing downstream. "Hue + chroma seeds" means angle controls *what colour*, distance controls *how vivid*. Both dimensions produce visible change in the scale strips.

3. **The handoff must be legible, not lossy.** "Full palette quantized" means the designer drags and sees 20 smoothly-interpolated colors on the arc, but Engine B collapses them onto a 10-level grid with a fixed lightness curve. The mapping from continuous arc to discrete grid is opaque — the user can't predict *which* arc colors survive and *how* they change. With "hue + chroma seeds," the contract is explicit: you picked this hue at this vibrancy, here's the scale.

---

## State Ownership

| State | Owner | Mutated by |
|-------|-------|------------|
| Anchor positions `(H, C)` in polar wheel space | Engine A | Wheel drag |
| Per-axis easing functions | Engine A | Easing picker (progressive disclosure) |
| `numPoints` (how many hues to sample from arc) | Engine A | Hue count control |
| Interpolated arc (derived) | Engine A | Recomputed on anchor/easing change |
| **Lightness curve** (10 L values) | Shared param | Spline editor |
| **`displayL`** (wheel's reference lightness) | Shared param | `displayL` slider (defaults to `lightnessCurve` midpoint) |
| **Chroma strategy** (`max_per_hue` / `uniform`) | Shared param | Toggle |
| **Compliance level** (`AA` / `AAA`) | Shared param | Toggle |
| Per-hue scales, gamut mapping, hex values | Engine B (derived) | Recomputed on any input change |
| Intra-hue validation (per-hue) | Engine B (derived) | Tier 1: active hue every frame. Tier 2: all hues debounced at 100ms |
| Cross-hue validation (all pairs) | Engine B (derived) | Tier 3: on drag-end, or debounced at 500ms via Web Worker |
| Active hue (which anchor is being dragged) | UI state | Set on drag-start, cleared on drag-end |
| Token intent classification | Engine B (derived) | Recomputed / user override |

---

## Wheel Axis Mapping (OKLCH-native)

| Wheel dimension | Maps to | Rationale |
|-----------------|---------|-----------|
| Angle from center | Hue (H) | Standard colour wheel convention |
| Distance from center | Chroma seed (C) | The "saturation rings" in the brief are literally chroma rings. Dragging outward = more vivid. |
| Z-axis (Poline's saturation axis) | Not exposed in the 2D wheel | Could later surface as a global vibrancy offset, but for now the vibrancy slider covers this |

The gamut boundary renders on the wheel as a soft contour at the current `displayL` (see State Ownership) — showing the designer exactly how far outward they can push each hue before chroma clipping occurs. When `displayL` changes, the contour morphs to reflect the gamut envelope at the new lightness level.

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  ENGINE A — The Toy                                             │
│                                                                 │
│  Anchor₁(H, C) ───┐                                            │
│  Anchor₂(H, C) ───┤                                            │
│  Anchor₃(H, C) ───┤── Poline interpolation ── Sampled arc      │
│       ...     ───┘   (per-axis easing,          │               │
│                       segment inversion)         │               │
└──────────────────────────────────────────────────┼───────────────┘
                                                   │
                                          Extract N points
                                                   │
                                                   ▼
                                        ┌─────────────────────┐
                                        │  HANDOFF CONTRACT    │
                                        │                     │
                                        │  hues[]: {          │
                                        │    H: number,       │
                                        │    vibrancy: number │
                                        │  }  // vibrancy ∈   │
                                        │  // [0,1] from z    │
                                        └────────┬────────────┘
                                                 │
                      ┌──────────────────────────┼──────────────────────────┐
                      │                          │                          │
               lightnessCurve[10]         chromaStrategy              compliance
               (spline editor)            (toggle)                   (toggle)
                      │                          │                          │
                      └──────────────────────────┼──────────────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  ENGINE B — The Truth                                           │
│                                                                 │
│  For each hue:                                                  │
│    1. Set L from lightnessCurve[level]                          │
│    2. Compute maxC = max_chroma(L, H)                          │
│    3. chosenC = vibrancy × maxC (capped by strategy)           │
│    4. Convert (L, chosenC, H) → sRGB hex                      │
│    5. Validate WCAG contrast on hex pairs                      │
│    6. Classify token intent                                    │
│                                                                 │
│  Output: validated token grid (M hues × 10 levels + neutral)   │
└─────────────────────────────────────────────────────────────────┘
                                                 │
                                                 ▼
                                 ┌───────────────────────────┐
                                 │  VISUAL FEEDBACK (read-only)│
                                 │                           │
                                 │  • Gamut boundary contour │
                                 │    rendered on wheel      │
                                 │  • Contrast badges on     │
                                 │    scale strips           │
                                 │  • Soft failure indicators│
                                 └───────────────────────────┘
```

---

## The Vibrancy Contract

Each hue sampled from Engine A's interpolation arc carries a **vibrancy** value — the normalised chroma from Poline's Strategy B coordinate mapping (see [OKLCH-COORDINATE-MAPPING.md § Strategy B](OKLCH-COORDINATE-MAPPING.md#strategy-b-normalised-chroma-recommended)). This value is the arc point's chroma expressed as a fraction of the maximum displayable chroma at the current `displayL` and hue:

```typescript
// During interpolation, each sampled arc point already has:
z = C / C_max(displayL, H_arc)   // ∈ [0, 1] by construction
```

`displayL` is a shared parameter (adjustable slider defaulting to the lightness curve midpoint). It determines the gamut contour on the wheel and the reference lightness for chroma normalisation. It does NOT affect Engine B's scale generation, which always uses `lightnessCurve[level]` for each level's lightness.

The `z` value IS the vibrancy factor passed in the handoff — no further normalisation is applied. Engine B re-evaluates `C_max` at each level's lightness rather than at `displayL`:

```typescript
chosenChroma = vibrancy * maxChroma(lightnessCurve[level], hue.H)
```

The `C_max` used to produce `vibrancy` (at `displayL`) differs from the `C_max` Engine B uses (at each scale level's lightness). This is deliberate: the designer's intent ("80% of maximum vibrancy") transfers across lightness levels, while the physical chroma adapts to each level's gamut constraints.

This preserves relative intent ("I want blue more saturated than green") while Engine B handles per-level gamut reality. When `chromaStrategy === 'uniform'`, the factor is further capped to the minimum across all hues at each level, per [docs/05-generation-algorithm.md](../docs/05-generation-algorithm.md).

---

## One-Directional Flow

Engine B never mutates Engine A state. This is the critical architectural boundary:

- **Gamut boundary data** feeds into the wheel's *rendering* (the soft contour), but never moves an anchor. The designer can place an anchor outside the gamut — Engine B clamps chroma during generation, and the dot visually "presses against" the contour without being repositioned.
- **Contrast failures** appear as ambient feedback on scale strips (badges, gentle dimming), but never alter the hue or chroma inputs. The designer sees the problem and decides what to do.
- **Token intent** classification is Engine B's internal concern. It governs which tokens the optimizer can shift and by how much, but this never propagates back up to the wheel.

**Engine A is sovereign over creative intent. Engine B is sovereign over physical reality.**

**Undo/redo respects this boundary.** The temporal middleware operates exclusively on source state (Engine A inputs + shared parameters). Undoing a `moveAnchor` replays the previous `{H, C}` values into the store, which triggers Engine B recomputation automatically through the existing reactive derivation pipeline. Engine B outputs are never directly restored from history — they are always recomputed from the restored source state. This preserves the one-directional flow invariant: undo mutates Engine A's inputs, Engine B reacts.

---

## Zustand Store Shape (sketch)

The store is partitioned into **source state** and **derived state**. This partition is the undo boundary — only source state is snapshotted by the temporal middleware (see [Undo Architecture](#undo-architecture) below).

```typescript
// Serialisable enum — resolves to actual PositionFunction at derivation time.
// Maps 1:1 to the named position functions in Poline (see poline/THEORY.md § 4).
type EasingId =
  | 'linear'
  | 'sinusoidal'
  | 'exponential'
  | 'quadratic'
  | 'cubic'
  | 'quartic'
  | 'asinusoidal'
  | 'arc'
  | 'smoothStep'

// Source state — the undo boundary. Every field is plain, serialisable data.
// zundo snapshots this slice only.
interface SourceState {
  // Engine A state — anchors store (H, C) pairs in OKLCH coordinates.
  // Vibrancy (normC ∈ [0,1]) is derived during interpolation via Strategy B
  // normalisation (normC = C / C_max(displayL, H) at each sampled arc point).
  anchors: Array<{ H: number; C: number }>
  easing: { x: EasingId; y: EasingId; z: EasingId }
  numHues: number

  // Shared parameters
  lightnessCurve: number[]       // length = numLevels, strictly decreasing
  displayL: number               // wheel's reference lightness, defaults to lightnessCurve[Math.floor(numLevels / 2)]
  chromaStrategy: 'max_per_hue' | 'uniform'
  compliance: 'AA' | 'AAA'
}

// Derived state — recomputed from SourceState. Never snapshotted.
interface DerivedState {
  scales: Record<string, ScaleEntry[]>
  intraValidation: Record<string, IntraValidationResult>  // keyed by hue name
  crossValidation: CrossValidationResult
  activeHue: string | null  // which hue is currently being dragged
  gamutBoundary: Record<number, number[]>  // H → maxC per level
}

// Full store
interface PaletteStore extends SourceState, DerivedState {
  // Actions mutate SourceState, then trigger recomputation of DerivedState
  moveAnchor: (index: number, H: number, C: number) => void
  addAnchor: (H: number, C: number) => void
  removeAnchor: (index: number) => void
  setEasing: (axis: 'x' | 'y' | 'z', id: EasingId) => void
  updateLightnessCurve: (curve: number[]) => void
  setDisplayL: (l: number) => void
  setChromaStrategy: (s: 'max_per_hue' | 'uniform') => void
  setCompliance: (c: 'AA' | 'AAA') => void

  // Undo/redo — exposed by zundo temporal middleware
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}
```

**Why `EasingId` instead of `EasingFn`.** The 9 named position functions from Poline ([THEORY.md § 4](../poline/THEORY.md)) form a closed set. Storing string identifiers instead of function references keeps source state JSON-serialisable — a prerequisite for both snapshot-based undo and URL-encoded shareable palettes. A lookup map (`Record<EasingId, PositionFunction>`) resolves identifiers to actual functions at derivation time.

**Why plain `{H, C}` objects instead of `ColorPoint`.** Poline's `ColorPoint` class holds dual HSL + XYZ representations with mutual setters. Class instances don't survive `JSON.parse(JSON.stringify(...))`, which breaks snapshot-based undo. Store anchors as plain coordinate pairs; reconstruct `ColorPoint` in the derivation layer when Poline's interpolation engine needs them.

Engine B's output fields (`scales`, `intraValidation`, `crossValidation`, `gamutBoundary`) are derived state — deterministic functions of source state, excluded from undo snapshots because they are potentially large and always recomputable.

**Tiered validation update schedule.** Not all derived state updates at the same frequency during drag. `scales` and `gamutBoundary` recompute every frame. Validation is tiered to keep the pipeline within the 16.6ms frame budget:

- **Tier 1 (every frame):** When `activeHue` is set, only `intraValidation[activeHue]` is recomputed — 15 contrast checks (~0.02ms). The strip being dragged shows live badges.
- **Tier 2 (debounced at 100ms):** `intraValidation` for all hues is recomputed — 135 checks (~0.15ms). All intra-hue badges update.
- **Tier 3 (drag-end, or debounced at 500ms):** `crossValidation` is recomputed — 1,080+ checks (~1.2ms). This runs in a Web Worker to avoid blocking the main thread. Cross-hue indicators update when the worker posts back.

At rest (no active drag), all tiers run synchronously as a single pass with no scheduling overhead.

**React subscription guidance.** Components subscribe to the narrowest slice they need:

- A single scale strip component subscribes to `intraValidation[hueName]` — it re-renders only when that hue's validation changes, not when other hues update.
- The cross-hue contrast matrix subscribes to `crossValidation` — it re-renders only on Tier 3 completion.
- The `activeHue` field lets the store's middleware distinguish Tier 1 (recompute one hue) from Tier 2 (recompute all hues) without external scheduling logic.

See [docs/05-generation-algorithm.md § Validation Performance](../docs/05-generation-algorithm.md#validation-performance) for the complexity analysis and pseudocode.

---

## Undo Architecture

Undo/redo is foundational infrastructure, not a polish feature. Every direct-manipulation design tool ships with undo — Figma, Sketch, Adobe, browser-based tools. For a tool whose value proposition is exploratory, gesture-driven colour manipulation, the inability to revert a gesture (especially on high-degree-of-freedom surfaces like the lightness curve spline) makes the tool feel broken. The store must be designed for undo from day one because retrofitting it requires refactoring every action and every consumer.

### Strategy: zundo on the source partition

The store uses [zundo](https://github.com/charkour/zundo) (Zustand temporal middleware) with the `partialize` option to snapshot only `SourceState`. This is the lightest-weight approach that satisfies the constraints:

```typescript
import { temporal } from 'zundo'

const usePaletteStore = create<PaletteStore>()(
  temporal(
    (set, get) => ({
      // ... state and actions
    }),
    {
      partialize: (state) => ({
        anchors: state.anchors,
        easing: state.easing,
        numHues: state.numHues,
        lightnessCurve: state.lightnessCurve,
        displayL: state.displayL,
        chromaStrategy: state.chromaStrategy,
        compliance: state.compliance,
      }),
      limit: 50,
    }
  )
)
```

**Why `partialize` matters.** Without it, zundo would deep-copy the entire store on every mutation — including `scales` (M hues × 10 levels of colour objects), `validation`, and `gamutBoundary` caches. Partialising to `SourceState` keeps each snapshot small (a handful of numbers and short arrays) and avoids serialising derived data that is deterministic and always recomputable.

**Why not the command pattern.** The command pattern requires designing every mutation as a `(do, undo)` pair. For continuous gestures like anchor dragging and spline editing, defining the inverse of an arbitrary drag trajectory is awkward — you'd end up storing the previous value anyway, which is what snapshot-based undo does automatically. The command pattern is better suited to discrete, well-defined operations (e.g. "insert row"), not fluid, exploratory manipulation.

### Drag throttling

`moveAnchor` fires on every animation frame during a drag gesture. Naively snapshotting every frame would fill the undo history with dozens of intermediate positions per gesture, making undo useless (each undo step moves the anchor by one pixel).

The solution is pointer-lifecycle gating:

1. **`pointerdown`** — snapshot the current `SourceState` (the "before" state)
2. **During drag** — `moveAnchor` mutates state but zundo skips snapshotting (via `handleSet` or by wrapping the drag in a `temporalStore.pause()` / `temporalStore.resume()` pair)
3. **`pointerup`** — allow the final state to be captured as the "after" snapshot

This produces clean, meaningful undo entries: "undo" reverts the entire drag gesture, not individual frames within it. The same pattern applies to the lightness curve spline editor and any future continuous-manipulation surface.

### Easing resolution

Source state stores easing selections as `EasingId` string identifiers. A lookup map resolves these to actual `PositionFunction` references at derivation time:

```typescript
const easingMap: Record<EasingId, PositionFunction> = {
  linear: linearPosition,
  sinusoidal: sinusoidalPosition,
  exponential: exponentialPosition,
  quadratic: quadraticPosition,
  cubic: cubicPosition,
  quartic: quarticPosition,
  asinusoidal: asinusoidalPosition,
  arc: arcPosition,
  smoothStep: smoothStepPosition,
}

const resolveEasing = (id: EasingId): PositionFunction => easingMap[id]
```

This resolution happens in the derivation layer — wherever the Poline interpolation engine is invoked. The store never holds function references, which means `SourceState` is always safe to serialise, snapshot, and encode into URLs.

### History depth

The undo stack is capped at **50 states** via zundo's `limit` option. This bounds memory growth while providing generous undo depth for exploratory sessions. The limit is configurable and can be tuned based on real-world usage patterns.

### Shareable URLs

Because `SourceState` is plain JSON (no class instances, no functions, no circular references), it can be serialised directly into a URL hash for the shareable palette feature (Phase 5 in the BRIEF). The same serialisation boundary that enables undo also enables sharing — one architectural decision serves both features.

---

## Rejected Alternatives

### Hue only

Wastes the wheel's radial axis. The designer can rotate anchors but the distance from center is cosmetic. Every hue gets maximum chroma by default, so there's no way to say "I want a muted teal and a vivid red" without a separate per-hue chroma control. The toy loses half its expressiveness.

### Full palette, Engine B quantizes

Poline produces a continuous arc of, say, 24 colors with smoothly varying H, L, and C. Engine B must discretize this into M hues × 10 levels on a fixed lightness curve. The mapping is inherently lossy: which of the 24 arc colors become the "hue anchors"? How does the varying L along the arc relate to the fixed L curve? The designer drags and something complex and partially opaque happens downstream. This violates the "engineer-facing clarity" principle — the relationship between gesture and output becomes a black box.

### Why hue + chroma seeds wins

The contract is explicit: you chose these hues at these vibrancies, here's what the pipeline produces from them. No hidden quantization, no wasted degrees of freedom.
