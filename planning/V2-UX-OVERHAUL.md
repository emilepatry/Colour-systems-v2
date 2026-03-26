# V2 Phase D — UX Overhaul: Onboarding, Input Model & Polish

> Make the tool usable by anyone who has a hex code and wants a colour system. Fix UX friction, add educational content, expand the input model with a base colour and presets, and replace the diagnostic preview with something people feel before they understand.

**Depends on:** V2 Phases A–C (Engine D, Export, UX Ship) — all built
**Audience:** Design engineers who may have never used an OKLCH tool before. Assume zero prior knowledge.

---

## The Problem

The tool works. The engineering is sound — four engines, real-time token generation, accessible output. But:

1. **Nobody knows what they're looking at.** There's no onboarding, no explanation of what the controls do, no guidance on how to interpret the results.
2. **The only entry point is "drag a circle."** Every design engineer starts with a hex code. Today they can't type one in.
3. **The preview breaks during interaction** — it vanishes when the user drags anchors, which is exactly when they need feedback most.
4. **The layout scrolls** when it shouldn't. At high hue counts the right panel overflows, fragmenting the experience.
5. **Readiness checks are passive** — they tell you what's wrong but don't help you fix it. Engine D should guarantee correctness, not report failure after the fact.

---

## Sequencing

```
Phase D1 — Polish ✓ COMPLETE
  ├─ ✓ Preview caching during drag
  ├─ ✓ Layout: eliminate scroll, preview as hero
  ├─ ✓ Engine D: guarantee text contrast (no more failing readiness checks)
  └─ ✓ Readiness checklist: confidence indicator, not error list

Phase D2 — Onboarding & Education ✓ COMPLETE
  ├─ ✓ "How it works" page (top nav)
  ├─ ✓ Control explainers (inline blurbs)
  └─ ✓ Result interpretation guide (reading the preview, understanding the checklist)

Phase D3 — Input Model (~1 week) ← CURRENT
  ├─ Base hex code input
  ├─ Gradient harmony preview
  └─ Palette presets (depends on base hex)
```

---

## Phase D1 — Polish

### D1.1: Preview caching during drag ✓ Completed

**Problem:** When the user drags an anchor, `moveAnchor` sets `skipCrossValidation = true` (while `activeAnchorIndex !== null`). This means `optimization` → `null` → `semanticTokens` → `null` → `TokenPreview` returns `null`. The preview disappears exactly when the user needs it most.

**Fix:** Cache the last valid `semanticTokens` in `TokenPreview` via `useRef`. When current tokens are null (drag in progress), render the cached version with a subtle 60% opacity to signal "stale but indicative." On pointer-up, `setActiveAnchorIndex(null)` triggers full recomputation and the preview snaps to the final value. There is no flash between cached and fresh state because `computeDerived` runs synchronously within the same React render cycle — the store update replaces null tokens with final tokens before the next paint.

**Mode awareness:** Clear the cache ref when `activeMode` changes (via a `useEffect` that sets `cachedRef.current = null`). Without this, switching mode during drag (via keyboard shortcut `D`) could briefly render cached tokens from the wrong mode.

**Files touched:** `src/components/TokenPreview.tsx` (add `useRef` cache, conditional render, mode-change effect)

**Acceptance:**
- [x] Preview remains visible during anchor drag
- [x] Cached preview renders at reduced opacity during drag
- [x] Preview updates to final values on pointer-up
- [x] No flash of fallback colours between cached and fresh state
- [x] Mode switch during drag does not show stale tokens from the previous mode

**Tests:**
- [x] Unit test: when `semanticTokens` transitions from non-null to null, cached ref retains the previous value
- [x] Unit test: when `semanticTokens` transitions from null to non-null, cache updates to the new value
- [x] Unit test: mode change clears the cache ref

### D1.2: Layout — eliminate scroll, preview as hero ✓ Completed

**Problem:** The right panel has `overflow-y-auto` with `maxHeight: calc(100vh - 4rem)`. At 8+ hues, scale strips push everything below the fold. The preview — the most important output — is buried.

**Fix:** Restructure the right panel:

1. **Preview at top** — the token preview moves above the scale strips. It's the first thing users see in the right column.
2. **Scale strips collapsed by default** — behind a "Palette scales" disclosure toggle (same pattern as the existing "Configure" toggle in `ControlPanel`). Power users can expand to inspect individual swatches.
3. **Readiness strip inline** — compact pill row directly below the preview.
4. **Remove `overflow-y-auto` from right panel** — let the page itself become the scroll container. At large viewports (>= 1440px) with <= 5 hues, everything fits without scrolling. Below that breakpoint, retain `max-h-[calc(100vh-4rem)] overflow-y-auto` behind a `max-lg:` class as graceful degradation. On mobile (< 768px, stacked layout), the page naturally scrolls vertically.
5. **Extract `ResultsPanel`** — move the entire right panel into `src/components/ResultsPanel.tsx` during this phase. This gives D2.1, D2.3, D3.2, and D3.3 a focused component to modify instead of growing `App.tsx` (which is touched in 5 phases otherwise).

**New right panel order:**

```
┌─────────────────────────────┐
│  Gradient harmony strip     │  ← Phase D3 (placeholder until then)
│  Token preview (hero)       │
│  Readiness checklist (pills)│
│  ▶ Palette scales (collapsed)
│     ├─ Hue 1 strip          │
│     ├─ Hue 2 strip          │
│     └─ Neutral strip        │
│  Infeasibility summary      │
│  [Export] [Copy Link]       │
└─────────────────────────────┘
```

**Files touched:** `src/App.tsx` (layout restructure), new `src/components/ResultsPanel.tsx` (extracted right panel), possibly `src/components/ScaleStrip.tsx` (compact variant)

**Acceptance:**
- [x] Preview is first element in right column
- [x] Scale strips are collapsed by default with a disclosure toggle
- [x] No independent scroll container on the right panel at >= 1440px
- [x] Content fits without scrolling at 1440×900 with <= 5 hues
- [x] At 1024×768, right panel has a scroll container as graceful degradation
- [x] At 375px (mobile), stacked layout scrolls naturally via the page
- [x] Right panel is a standalone `ResultsPanel` component

### D1.3: Engine D — guarantee text contrast ✓ Completed

**Problem:** Readiness checks can currently fail for text contrast and focus ring visibility. These failures are reported passively — the user sees "Fail" but has no recourse other than manually adjusting the palette.

**Reframing:** Instead of making readiness checks "clickable to auto-resolve," make Engine D's semantic mapper guarantee that its output always passes. The pattern already exists — `calculateForeground` in `mapper.ts` guarantees 4.5:1 for accent fills by testing both neutrals and falling back to pure white/black.

**Critical prerequisite — thread compliance into the mapper:** `mapSemanticTokens` currently receives `(result, mode, globalVibrancy)` — no compliance parameter. But the readiness check uses compliance to decide 4.5:1 (AA) vs 7.0:1 (AAA). Without compliance in the mapper, the enforcement threshold would be wrong for AAA users.

Add `compliance: 'AA' | 'AAA'` as a fourth parameter to `mapSemanticTokens`. Thread it from the store: update `safeMapSemanticTokens` calls in `store/index.ts` to pass `source.compliance`. The enforcement threshold becomes `compliance === 'AAA' ? 7.0 : 4.5`.

**Extend the `calculateForeground` pattern to:**

1. **`text.primary`, `text.secondary`, and `text.tertiary`:** After initial mapping, verify each text role against its paired backgrounds (canvas, surface). If contrast fails, shift the text token's L toward the extreme (0 in light mode, 1 in dark mode) until the threshold is met. When shifting L, recalculate C via `Math.min(originalC, maxChroma(newL, H))` and regenerate hex via `oklchToHex(newL, newC, H)` to stay in gamut. `text.disabled` is **exempt** — WCAG 1.4.3 excludes disabled controls from contrast requirements, and it is intentionally low-contrast by design.
2. **Focus ring:** Verify `focus.ring` achieves 3:1 against canvas. If not, shift L (with the same C-recalculation).

**This means:** The readiness checklist becomes a **confidence indicator** — it always shows all-pass for contrast and focus, reinforcing trust. The remaining checks (surface hierarchy, status distinguishability) remain diagnostic because they reflect palette structure choices the user made intentionally.

**Files touched:** `src/engine-d/mapper.ts` (add compliance parameter, post-mapping contrast enforcement), `src/store/index.ts` (thread compliance into `safeMapSemanticTokens` calls), `src/lib/readiness.ts` (no changes needed — checks still run, they just always pass for contrast)

**Acceptance:**
- [x] `text.primary`, `text.secondary`, and `text.tertiary` always meet compliance threshold against `background.canvas` and `background.surface`
- [x] `text.disabled` is not contrast-enforced (exempt per WCAG 1.4.3)
- [x] `focus.ring` always meets 3:1 against `background.canvas`
- [x] Enforcement works correctly for both AA (4.5:1) and AAA (7.0:1) compliance levels
- [x] Existing property tests still pass (they assert contrast — now guaranteed)
- [x] Readiness checklist reflects the guarantees (text contrast and focus ring always show "Pass")

---

## Phase D2 — Onboarding & Education

### D2.1: "How it works" page

A dedicated page accessible from a top navigation link. Not a modal — a full page that the user can read, bookmark, and return to. The tool itself remains the primary view.

**Top navigation:** Add a minimal nav bar to `App.tsx` with two items: the tool name (link to tool view) and "How it works" (link to education page). Use a `useState<'tool' | 'how-it-works'>` toggle. Do not add React Router — it would conflict with the existing hash-based URL state used for shareability, and is unnecessary for two views.

**Page content (written at a layman level — no jargon without definition):**

#### Section 1: What this tool does

> Colour Systems takes your brand colour and turns it into a complete set of design tokens — the exact colour values your app needs for backgrounds, text, buttons, status indicators, and more. It generates both light and dark mode, checks accessibility automatically, and exports code you can drop into your project.

#### Section 2: The colour wheel

> The wheel shows all possible hues (colour directions) at a given lightness level. The dots on the wheel are your **anchors** — they define the key hues in your system. Everything else is derived from these anchor points.
>
> **Drag an anchor** to change where your hues sit on the colour spectrum. The system recalculates in real time.
>
> The faint line connecting the anchors shows the **interpolation path** — the tool generates intermediate hues along this curve. The easing controls (under Configure) change the shape of this path.
>
> The subtle boundary line shows the **gamut limit** — the edge of what screens can actually display at this lightness level. Colours outside this boundary would be clipped.

#### Section 3: The scale strips

> Each hue produces a **scale** — a set of 10 colour steps from very light to very dark. These steps are your raw palette. The numbers on each swatch show the WCAG contrast ratio between pairs of steps — this tells you which combinations are safe for text on backgrounds.
>
> Steps marked with a purple bar were **adjusted** by the contrast optimizer — the tool nudged their lightness slightly to ensure they meet your chosen accessibility standard.

#### Section 4: The token preview

> The preview card shows your colour system applied to real UI patterns: surfaces at different depths, a text hierarchy, buttons, status badges, an input field, and typography. If this preview looks right, your token system will work in production.
>
> Every colour in the preview comes from a **semantic token** — a purpose-based name like `text.primary` or `accent.primary`. These tokens are what you export and use in your code.

#### Section 5: The readiness checklist

> The coloured pills below the preview are automated quality checks. Each one verifies a specific aspect of your colour system:
>
> - **Text contrast** — Can users read body text on your backgrounds?
> - **Surface hierarchy** — Are your background layers visually distinct?
> - **Status distinguishability** — Can users tell success, warning, error, and info apart?
> - **On-colour pairs** — Does every filled surface have a readable text colour?
> - **Dark mode coverage** — Does dark mode define every role that light mode uses?
> - **Focus ring visibility** — Can keyboard users see where focus is?
> - **Status token sources** — Which status colours come from your palette vs. were generated automatically?
>
> Hover any pill to see the detail.

#### Section 6: Exporting

> The Export sheet gives you production-ready code in four formats:
>
> - **shadcn** — Drop-in CSS variables for shadcn/ui + Tailwind. Copy into your `index.css` and your entire component library works.
> - **Tailwind** — Raw palette scales as CSS custom properties for direct Tailwind usage.
> - **CSS** — Standard CSS custom properties.
> - **JSON** — Structured token data with palette, semantic, and component layers.

**Files touched:** New component `src/components/HowItWorks.tsx`, `src/App.tsx` (add nav + view switching)

**Acceptance:**
- [x] "How it works" link visible in top navigation
- [x] Page covers all 6 sections above
- [x] Written at a layman level (no undefined jargon)
- [x] Page is navigable via keyboard and screen reader
- [x] User can return to the tool view without losing state (Zustand store persists across re-renders; colour wheel re-mounts cleanly)
- [x] Heading hierarchy: page has one `h1` (or inherits from nav), sections use `h2`
- [x] All sections reachable via Tab key
- [x] `aria-current="page"` on the active nav link

### D2.2: Control explainers

Add a short descriptive blurb below each control label in `ControlPanel.tsx`. These appear inline, not as tooltips — always visible, always teaching.

#### Primary controls

**Mode** (Light / Dark)
> Switch between light and dark mode. Both are generated simultaneously — this toggle changes which one you're viewing and editing.

**Hues** (slider, 2–10)
> How many distinct colours your system contains. 2–3 for a focused brand palette. 5–6 for a versatile design system. 8–10 for data visualization or playful interfaces.

#### Advanced controls (under Configure)

**Display Lightness** (slider, 0.05–0.95)
> The lightness level shown on the colour wheel. This controls what "slice" of the colour space you see — like adjusting the brightness of a lamp illuminating your palette. It affects which colours are visible on the wheel but doesn't change your output; your scales always span the full lightness range.

**Vibrancy** (slider, 0–1)
> How saturated your colours are overall. At 1.0, every hue is pushed to maximum saturation. At 0.5, colours are more muted and restrained. Lower vibrancy produces calmer, more professional palettes. Higher vibrancy produces more energetic, expressive ones.

**Chroma** (Max / Uniform)
> - **Max:** Each hue is as vivid as it can be at each lightness level. Some hues are naturally more vivid than others (yellows pop, blues are muted), so scales will have unequal intensity.
> - **Uniform:** All hues are capped to the least vivid hue's maximum. This produces more even, harmonious scales where no single hue dominates, but sacrifices peak vibrancy.

**Compliance** (AA / AAA)
> The accessibility standard your system targets.
> - **AA** requires 4.5:1 contrast for normal text — the legal minimum in most jurisdictions.
> - **AAA** requires 7.0:1 — a higher bar that benefits users with low vision, older displays, or bright sunlight.
>
> Higher compliance may limit how much the optimizer can preserve your exact colour choices, since it needs more room to ensure contrast.

**Easing X / Easing Y**
> Control the shape of the interpolation curve between your anchor points on the colour wheel. Think of it like the difference between a straight road and a winding one — both connect the same two points, but the path between them (and therefore which intermediate hues are generated) changes.
>
> - **Linear:** Even spacing. Predictable, uniform.
> - **Sinusoidal:** Gentle S-curve. Clusters hues near the anchors.
> - **Exponential / Quadratic / Cubic / Quartic:** Increasingly aggressive curves. More hues near the start, fewer near the end.
> - **Arc:** Circular interpolation. Smooth and natural.
> - **SmoothStep:** Flat at both ends, steep in the middle. Hues cluster at the anchors with a quick transition between them.

**Lightness Curve**
> The 10 draggable points define how lightness is distributed across your scale steps. The default curve descends from ~0.97 (near white) to ~0.17 (near black) — giving you 10 evenly-useful steps from light backgrounds to dark text.
>
> Drag points to redistribute where the "interesting" part of the scale lives. For example, bunching points in the 0.4–0.7 range gives you more mid-tone options (useful for illustrated interfaces), while spreading them evenly gives you a balanced general-purpose scale.
>
> In dark mode, the curve inverts — level 0 is dark, level 9 is light. You can override individual dark-mode points without affecting the light curve.

**Files touched:** `src/components/ControlPanel.tsx` (add description text below each label)

**Acceptance:**
- [x] Every control has a visible descriptive blurb (not a tooltip)
- [x] Descriptions are written in layman's terms
- [x] Descriptions don't crowd the layout — text is small (11–12px), muted colour, mono font
- [x] Advanced control descriptions only visible when Configure is expanded

### D2.3: Result interpretation guide

Augment the existing UI with contextual interpretation helpers:

1. **Scale strip legend** — Add a one-line explainer above the first scale strip: "Each row is a hue from your system. Swatches show the 10 lightness steps. Badges show contrast ratios between usable pairs."

2. **Preview section header** — Change "Preview" label to "Your colour system in use" with a subtitle: "Every colour here is a semantic token. If this looks right, your system works."

3. **Readiness section header** — Change "Readiness" label to "Quality checks" with pass count.

4. **Infeasibility section** — When adjustments were made, add context: "The optimizer adjusted N tokens to meet your compliance target. This is normal — it means your chosen hues needed slight lightness shifts to guarantee accessible contrast."

**Files touched:** `src/components/ResultsPanel.tsx` (section labels), `src/components/InfeasibilitySummary.tsx` (contextual copy)

**Acceptance:**
- [x] Each section of the right panel has a human-readable label and optional subtitle
- [x] Labels use layman language, not technical terminology
- [x] Infeasibility summary includes reassuring context when adjustments are present

---

## Phase D3 — Input Model

### D3.1: Base hex code input

**What it does:** Lets the user type or paste a hex code (e.g., `#4F46E5`) that becomes the primary anchor in their colour system. This is the "I have a brand colour" entry point.

**Behaviour:**

1. Hex input field with validation — accepts 6-digit, with or without `#`
2. On valid input: convert hex → sRGB → OKLCH via existing `hexToRgb` + `srgbToOklch`
3. Set `anchors[0]` to the resulting `{ H, C }` values
4. Store `baseHex` as source state — it's a constraint, not just a convenience
5. When `baseHex` is set, anchor 0 shows a lock icon on the colour wheel and cannot be dragged (other anchors remain draggable). Both pointer and keyboard interaction are blocked: `handlePointerDown` returns early for index 0, and `handleAnchorKeyDown` returns early for index 0. The locked anchor renders with `aria-disabled="true"` so screen readers communicate the constraint.
6. `removeAnchor(0)` is prevented when `baseHex` is set. `addAnchor` always appends, so the base anchor remains at index 0.
7. Clear button to remove the base constraint and return to free manipulation

**Store changes:**

```typescript
// New source state field
baseHex: string | null  // e.g., '#4F46E5' or null

// New action
setBaseHex: (hex: string | null) => void
```

When `setBaseHex` is called with a valid hex:
- Parse to OKLCH
- Update `anchors[0]` to `{ H, C }` from the parsed value
- `applyAndDerive` with the new anchors

When `setBaseHex(null)` is called:
- Unlock anchor 0 for free dragging
- Do not change its position (it stays where the hex placed it)

**URL state:** Add `baseHex` to the encoded URL state for shareability.

**UI placement:** Prominent — above the colour wheel or in the header area. Not buried in the control panel. The input should say "Start from a colour" as placeholder text.

**Shared utilities:**
- `isValidHex6(hex)` in `src/colour-math/index.ts` — single validation function used by BaseHexInput, `setBaseHex`, and `validateSourceState`
- `isAnchorLocked(index)` selector on the store — returns `state.baseHex !== null && index === 0`, consumed by ColourWheel and `removeAnchor`

**URL backward compatibility:** `validateSourceState` treats `baseHex` as optional — missing field defaults to `null`. Existing v1 URLs without `baseHex` continue to decode successfully.

**Files touched:** `src/colour-math/index.ts` (add `isValidHex6`), `src/store/index.ts` (add `baseHex` to source state, `setBaseHex` action, `isAnchorLocked` selector), `src/lib/url-state.ts` (encode/decode `baseHex` with backward compat), new `src/components/BaseHexInput.tsx` (input component), `src/components/ColourWheel.tsx` (lock icon on anchor 0 when base is set)

**Acceptance:**
- [ ] User can paste a hex code and see the system regenerate from it
- [ ] Anchor 0 is locked on the wheel when a base hex is set
- [ ] Other anchors remain draggable
- [ ] Base hex persists in shareable URL
- [ ] Clear button removes the lock and restores free manipulation
- [ ] Invalid hex input shows validation feedback (not an error — a subtle "not a valid colour" hint)

### D3.2: Gradient harmony preview

A real-time gradient strip that shows the palette's hue relationships as a beautiful, continuous visual. Replaces the current "Preview" label area (above the token preview card).

**What it renders:**

1. **Hue harmony gradient** — full-width horizontal strip that smoothly transitions between all generated hues at the emphasis-intent lightness level. Uses CSS `linear-gradient` with stops derived from `hueOutputs`.

2. **Lightness depth gradient** — below the hue strip, a shorter vertical gradient per hue showing the full lightness ramp (level 0 → level 9). These stack side-by-side, creating a "colour fields" visualization.

**Data source:** `hueOutputs` (for hue angles), `palette.scales` (for actual hex values per level), `semanticTokens` (for emphasis-level accent). All already in the store.

**Interaction:** The gradient updates in real time during anchor drag (it reads from `palette` which is available even during drag — unlike `semanticTokens`, the raw palette is always computed). This makes it the primary visual feedback loop during manipulation.

**Files touched:** New `src/components/HarmonyPreview.tsx`, `src/components/ResultsPanel.tsx` (mount above token preview)

**Acceptance:**
- [ ] Hue harmony gradient renders with smooth transitions between all palette hues
- [ ] Gradient updates in real time during anchor drag (uses `palette`, not `semanticTokens`)
- [ ] Lightness ramps visible per hue
- [ ] Component renders correctly with 2–10 hues
- [ ] Graceful rendering when `palette` is null (empty/loading state)

### D3.3: Palette presets

Predefined configurations that set anchors, easing, vibrancy, and hue count in one click. These are **starting points**, not locks — the user can modify everything after applying a preset.

**Preset definitions:**

| Preset | Description (shown to user) | Anchors | Easing | Vibrancy | Hues |
|---|---|---|---|---|---|
| **Monochrome** | One hue, many tones. Calm and cohesive. | Single anchor at base hue (or H=265) | — | 0.6 | 2 |
| **Focused brand** | A vibrant primary with quieter supporting hues. The star-and-chorus approach. | Primary at full C, secondary 120° away at 0.5× C | sinusoidal | 0.85 | 3 |
| **Analogous** | Neighbouring hues that naturally harmonise. Warm and cohesive. | Two anchors ~40° apart | sinusoidal | 0.8 | 4 |
| **Complementary** | Two hues from opposite sides of the wheel. High contrast, high energy. | Two anchors ~180° apart | sinusoidal | 0.9 | 4 |
| **Split complement** | A primary hue plus two hues flanking its opposite. Balanced tension. | Primary + secondary 150° away | sinusoidal | 0.85 | 5 |
| **Triadic** | Three evenly-spaced hues. Vibrant and balanced. | Two anchors ~120° apart | sinusoidal | 0.75 | 5 |
| **Earth tones** | Warm, muted, grounded. Terracotta, olive, sand. | Two anchors in 20–60° range | quadratic | 0.45 | 4 |
| **Jewel tones** | Deep, saturated, luxurious. Emerald, sapphire, ruby. | Two anchors in high-chroma deep hues | sinusoidal | 1.0 | 5 |
| **Pastel** | Soft, light, airy. Low saturation, high lightness. | Any anchors | sinusoidal | 0.3 | 5 |
| **High contrast** | Maximum accessibility. Designed for AAA compliance with room to spare. | Two anchors widely spaced | sinusoidal | 0.9 | 3 |
| **Full spectrum** | All the colours. For data visualization, creative tools, or playful brands. | Two anchors ~300° apart | linear | 0.7 | 9 |
| **Neutral + accent** | Almost monochrome with one pop of colour. Minimal and sophisticated. | Primary at high C, secondary at same H with C near 0 | sinusoidal | 0.7 | 3 |

**Interaction with base hex:** If `baseHex` is set, presets configure anchor positions *relative to the base hue*. "Complementary" means "your brand hue + its complement." If no base hex, presets use sensible default hue angles. When `baseHex` is set, `applyPreset` overrides `anchors[0]` with the actual OKLCH values from `baseHex` (preserving the user's exact brand colour) while keeping all other anchors as the preset specifies.

**Data structure:**

```typescript
interface PalettePreset {
  id: string
  name: string
  description: string
  configure: (baseH: number | null, displayL: number) => {
    anchors: Array<{ H: number; C: number }>
    easing: { x: EasingId; y: EasingId }
    numHues: number
    globalVibrancy: number
    compliance?: 'AA' | 'AAA'
  }
}
```

Using a `configure` function (rather than static values) allows presets to adapt to the user's base hue. The `displayL` parameter is needed to compute `maxChroma(displayL, H)` for chroma values like "full C" or "0.5× C" — chroma is lightness-dependent in OKLCH, so presets need the current display lightness to produce meaningful anchor chroma values.

**UI:** A row of selectable cards or a dropdown, placed above the colour wheel (below the base hex input if present). Each preset shows its name, one-line description, and a small colour swatch preview generated from its default configuration.

**Files touched:** New `src/lib/presets.ts` (preset definitions), new `src/components/PresetSelector.tsx` (UI), `src/store/index.ts` (add `applyPreset` action), `src/App.tsx` (mount preset selector in left column)

**Acceptance:**
- [ ] All 12 presets are defined and selectable
- [ ] Applying a preset updates anchors, easing, vibrancy, and hue count
- [ ] If `baseHex` is set, presets orient around the base hue
- [ ] User can modify all parameters after applying a preset (presets are starting points, not constraints)
- [ ] Each preset shows a descriptive name and one-line description
- [ ] Preset application is undoable (integrated with zundo temporal middleware)

---

## Summary: Files Touched

| Phase | Files | Type |
|---|---|---|
| D1.1 | `TokenPreview.tsx` | Edit |
| D1.2 | `App.tsx`, `ResultsPanel.tsx` | Edit + New |
| D1.3 | `engine-d/mapper.ts`, `store/index.ts` | Edit |
| D2.1 | `HowItWorks.tsx`, `App.tsx` | New + Edit |
| D2.2 | `ControlPanel.tsx` | Edit |
| D2.3 | `ResultsPanel.tsx`, `InfeasibilitySummary.tsx` | Edit |
| D3.1 | `colour-math/index.ts`, `store/index.ts`, `url-state.ts`, `BaseHexInput.tsx`, `ColourWheel.tsx` | Edit + New |
| D3.2 | `HarmonyPreview.tsx`, `ResultsPanel.tsx` | New + Edit |
| D3.3 | `presets.ts`, `PresetSelector.tsx`, `store/index.ts`, `App.tsx` | New + Edit |

**Total: 9 files edited, 6 files created.** `ResultsPanel.tsx` (extracted in D1.2) absorbs right-panel changes from D2.3, D3.2 that would otherwise bloat `App.tsx`. Within scope for a phased rollout across 3 sprints.

---

## Test Considerations

### D1.3 (Engine D contrast guarantees)
- Property test (parameterized across AA and AAA): for any valid palette, `text.primary`, `text.secondary`, and `text.tertiary` meet the compliance threshold (4.5:1 for AA, 7.0:1 for AAA) against `background.canvas` and `background.surface`
- Property test: `text.disabled` is **not** enforced — verify it remains as mapped (no L-shift applied)
- Property test: `focus.ring` meets 3:1 against `background.canvas` for any valid palette
- Unit test: a palette with intentionally low-contrast neutral scale still produces passing text tokens after enforcement
- Unit test: enforcement recalculates C via `maxChroma` when shifting L (no out-of-gamut hex values)

### D3.1 (Base hex input)
- Unit test: `hexToOklch` round-trip for known hex values
- Unit test: `setBaseHex` correctly updates `anchors[0]` and locks it
- URL state test: `baseHex` encodes and decodes correctly
- Unit test: `isAnchorLocked(0)` returns true when baseHex set, false otherwise
- Unit test: `removeAnchor(0)` is no-op when baseHex set
- Unit test: `setBaseHex(null)` preserves anchors[0] position
- URL state test: v1 URL without baseHex decodes with baseHex=null
- Component test (RTL): BaseHexInput shows validation hint for invalid input, hides for valid

### D3.2 (Gradient harmony preview)
- Unit test: gradient stop computation — N hue outputs produce correct CSS stops in order
- Unit test: null palette — component renders placeholder, no crash
- Unit test: edge cases — correct output for 2 hues and 10 hues

### D3.3 (Presets)
- Unit test: each preset's `configure(null, displayL)` produces valid anchor/easing/vibrancy values with C within `maxChroma` bounds
- Unit test: each preset's `configure(baseH, displayL)` orients correctly around the given hue
- Integration test: applying a preset and then undoing restores previous state (single undo step via zundo)
- Unit test: applyPreset with baseHex — anchors[0] matches actual baseHex OKLCH, not preset's
- Unit test: all 12 presets produce anchors with H in [0, 360)

---

## References

### Archived Planning (Phases A–C, shipped)
- [archive/V2-PRODUCT.md](archive/V2-PRODUCT.md) — overall V2 product plan
- [archive/V2-ENGINE-D.md](archive/V2-ENGINE-D.md) — Engine D semantic mapper
- [archive/V2-EXPORT-PREVIEW.md](archive/V2-EXPORT-PREVIEW.md) — export pipeline + token preview
- [archive/V2-UX-SHIP.md](archive/V2-UX-SHIP.md) — UX polish + deployment
- [archive/V1-BRIEF-shipped.md](archive/V1-BRIEF-shipped.md) — original V1 brief

### Implementation
- Token preview: `src/components/TokenPreview.tsx`
- Readiness checks: `src/lib/readiness.ts`, `src/components/ReadinessChecklist.tsx`
- Control panel: `src/components/ControlPanel.tsx`
- Store: `src/store/index.ts`
- Semantic mapper: `src/engine-d/mapper.ts`
- Colour math: `src/colour-math/index.ts`
- URL state: `src/lib/url-state.ts`

### Frameworks
- [frameworks/FRAMEWORK_Psych-BIAS.md](../frameworks/FRAMEWORK_Psych-BIAS.md)
- [frameworks/FRAMEWORK_Onboarding-Principles.md](../frameworks/FRAMEWORK_Onboarding-Principles.md)
