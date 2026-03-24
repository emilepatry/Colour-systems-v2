# V2 Phase C — UX Polish & Shipping

> Refine progressive disclosure, add an automated production readiness checklist, and deploy to Vercel. This phase transforms the working tool into a shippable product.

**Depends on:** [V2-ENGINE-D.md](V2-ENGINE-D.md) (semantic tokens) and [V2-EXPORT-PREVIEW.md](V2-EXPORT-PREVIEW.md) (export + preview working)
**Produces:** A deployed, polished product at a public URL

---

## UX Layer: Progressive Disclosure

Apply framework principles from [frameworks/FRAMEWORK_Psych-BIAS.md](../frameworks/FRAMEWORK_Psych-BIAS.md) and [frameworks/FRAMEWORK_Onboarding-Principles.md](../frameworks/FRAMEWORK_Onboarding-Principles.md):

### Default view

Colour wheel + scale strips + token preview. That's it. The tool is immediately usable without reading documentation or configuring anything.

### On-demand panel

Lightness curve editor, easing selectors, chroma strategy, compliance level, vibrancy — collapsed behind a "Configure" toggle or accordion. These are power-user controls that should not compete with the primary interaction (drag anchor → see system respond).

### Export

Remains a slide-out sheet (shadcn/ui `Sheet` component). Opens via button or keyboard shortcut `E`.

### Gesture hints

Import the existing `components/gesture-hints` pattern from the Devouring Details prototypes for first-use guidance on wheel anchors. Dissolve after first interaction.

### Welcome state

First load shows the default palette with semantic tokens applied and the preview rendering. One line of context: "Drag the anchors to explore. Your token system updates in real time."

---

## Production Readiness Checklist (automated)

A new component that evaluates the generated system against the checklist from [misc/gradient-and-review-checklist.md](../misc/gradient-and-review-checklist.md).

### Checks

| Check | Threshold | Source |
|---|---|---|
| All `text.*` roles meet contrast against their paired `background.*` | 4.5:1 (AA) or 7.0:1 (AAA) | [misc/surface-and-text-color.md](../misc/surface-and-text-color.md) |
| Surface hierarchy has >= 3 distinct levels | L difference >= 0.04 between adjacent surfaces | [misc/surface-and-text-color.md](../misc/surface-and-text-color.md) |
| Status colours are distinguishable from each other | Hue angle difference >= 30° between any two status fills | [misc/component-state-color.md](../misc/component-state-color.md) |
| On-colour pairs exist for every filled surface | `accent.primary-foreground` defined, all `status.*-foreground` defined | [misc/color-token-architecture.md](../misc/color-token-architecture.md) |
| Dark mode covers all semantic roles | Every role in `semanticTokens` also exists in `darkSemanticTokens` | [misc/dark-mode-color.md](../misc/dark-mode-color.md) |
| Focus ring is defined and visible | `focus.ring` meets 3:1 against canvas | [misc/component-state-color.md](../misc/component-state-color.md) |
| Status tokens: native or synthesized | Report only (informational, not pass/fail) | — |

### UI

Compact pass/fail strip below the preview. Memoized against the semantic token set to avoid recalculation on render.

---

## Deployment

- **Static deploy to Vercel** — already have Vite build producing `dist/`. No server required.
- **URL state** — `src/lib/url-state.ts` already handles shareable links. No migration needed — semantic tokens are derived from source state, not stored in the URL.
- **Open Graph meta** — add `<meta>` tags to `index.html` for link previews. Consider generating a dynamic OG image from the palette colours (future enhancement).
- **Landing section** — a simple hero above the tool for first-time visitors: product name, one-sentence description, "scroll down to start" or immediate tool visibility.

---

## Acceptance Criteria

- [ ] Default view shows only colour wheel + scale strips + token preview (no configuration panels)
- [ ] Power-user controls are collapsed behind a "Configure" toggle
- [ ] Gesture hints appear on first load and dissolve after first anchor interaction
- [ ] Welcome state renders default palette with semantic tokens and preview
- [ ] Production readiness checklist component evaluates all 7 checks from the table above
- [ ] Checklist renders as a compact pass/fail strip below the preview
- [ ] Checklist is memoized against the semantic token set
- [ ] Site deploys to Vercel as a static build
- [ ] Shareable URLs continue to work (no URL state migration)
- [ ] `<meta>` OG tags are present in `index.html`
- [ ] Landing section renders product name and one-sentence description

---

## References

### Frameworks
- [frameworks/FRAMEWORK_Psych-BIAS.md](../frameworks/FRAMEWORK_Psych-BIAS.md)
- [frameworks/FRAMEWORK_Onboarding-Principles.md](../frameworks/FRAMEWORK_Onboarding-Principles.md)

### Source-of-Truth Docs
- [misc/gradient-and-review-checklist.md](../misc/gradient-and-review-checklist.md) — production readiness checklist
- [misc/surface-and-text-color.md](../misc/surface-and-text-color.md) — surface hierarchy, contrast floors
- [misc/component-state-color.md](../misc/component-state-color.md) — interactive states, status semantics
- [misc/color-token-architecture.md](../misc/color-token-architecture.md) — on-colour pair requirements
- [misc/dark-mode-color.md](../misc/dark-mode-color.md) — dark mode role coverage

### Implementation
- Gesture hints: `components/gesture-hints/source.tsx`
- URL state: [src/lib/url-state.ts](../src/lib/url-state.ts)
