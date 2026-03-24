# misc/ — Color system guidelines

Reference guidelines for building accessible, themeable color systems. Each file is a self-contained document (~1k-2k words) structured for fast scanning by AI agents and humans alike.

## How to navigate

The files are organised in three groups by domain. Within each group, the reading order moves from foundational concepts to implementation detail.

### Color system theory (platform-neutral)

| File | Scope |
|---|---|
| [color-token-architecture.md](color-token-architecture.md) | The three-layer model (palette, semantic roles, component tokens), core principles, and a practical token inventory. **Start here.** |
| [dark-mode-color.md](dark-mode-color.md) | How to build dark mode by remapping values — luminance ladders, saturation restraint, contrast tuning, and accessibility testing. |
| [surface-and-text-color.md](surface-and-text-color.md) | Background surface roles, text hierarchy tokens, WCAG contrast floors, on-color pairing, and text-over-gradient stabilisation. |
| [component-state-color.md](component-state-color.md) | Interactive state logic, multi-token components, focus tokens, status semantics, borders, data-viz colors, and system adaptation. |
| [gradient-and-review-checklist.md](gradient-and-review-checklist.md) | Gradient do/don't rules, 10 anti-patterns, and a production-readiness checklist for the full color system. |

### Apple platform color

| File | Scope |
|---|---|
| [apple-color-system.md](apple-color-system.md) | Apple's four-layer color model, semantic content colors, surface tokens, tint/accent, system palette, and materials/vibrancy. |
| [apple-color-implementation.md](apple-color-implementation.md) | Accessibility targets, light/dark testing, color spaces, named assets, SwiftUI and UIKit code patterns, decision tree, and common mistakes. |

### shadcn/ui + Tailwind CSS

| File | Scope |
|---|---|
| [shadcn-semantic-tokens.md](shadcn-semantic-tokens.md) | shadcn's CSS-variable token system — the bg/foreground convention, full token inventory, light/dark mode, and how to add new semantic tokens. |
| [tailwind-color-palette.md](tailwind-color-palette.md) | Tailwind's palette families, scale steps, utility generation, opacity modifiers, custom tokens, `@theme inline` bridging, and when to use palette vs semantic tokens. |

## Document structure

Every file follows the same template:

```
# Title
> One-sentence scope line

## Section
### Rule name
- DO: ...
- DON'T: ...
- WHY: ...

## Quick reference / tables
## Sources
```

Headings are flat (H1 title, H2 sections, H3 rules) with no deep nesting, so keyword search and heading-based chunking work reliably.
