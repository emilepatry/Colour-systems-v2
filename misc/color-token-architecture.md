# Color token architecture

> How to structure a color system as three layers — reference palette, semantic roles, and component tokens — so products stay consistent, themeable, and accessible.

## Principles

| Principle | DO | DON'T |
|---|---|---|
| **Semantic** | Name colors by role: `background`, `surface`, `text-primary`, `border`, `focus`, `destructive` | Name colors only by hue: `blue-500`, `gray-700` |
| **Hierarchical** | Use color to signal priority, depth, and interaction | Let everything compete at the same visual volume |
| **Adaptive** | Make the same roles work in light mode, dark mode, and higher-contrast environments | Invert or darken light-mode values mechanically |
| **Accessible** | Maintain usable contrast on text, icons, controls, and states | Carry meaning through faint contrast or hue alone |
| **Tokenized** | Define roles and states once and reuse everywhere | Let designers and engineers pick hex values ad hoc |
| **Compositional** | Let components inherit from shared roles so they stay coherent across products | Let each component invent its own colors |
| **Restrained** | Use strong color intentionally and sparingly | Substitute saturation for hierarchy |

## The three-layer model

Every robust color system has three layers. Each layer has a distinct job.

### Layer 1 — Reference palette

The raw color inventory: neutrals, brand hues, status hues, chart/data hues.

- **DO:** Define full ramps (e.g. `gray-50` through `gray-950`, brand ramp, status ramps).
- **DON'T:** Let components consume palette values directly as their default behavior.
- **WHY:** The palette is for *choosing* values; it is not the API that products should couple to.

### Layer 2 — Semantic roles

The layer product UI should mostly use. Roles describe purpose, not hue.

- **DO:** Define roles like `background.canvas`, `text.primary`, `border.subtle`, `accent.primary`, `status.error`.
- **DON'T:** Skip this layer and jump straight from palette to components.
- **WHY:** Semantic roles are what make theming, dark mode, and brand evolution possible without rewriting every component.

### Layer 3 — Component and state tokens

Where semantics become executable UI. Each interactive component gets its own token set.

- **DO:** Define tokens like `button.primary.bg`, `button.primary.hover-bg`, `input.focus-ring`, `nav-item.selected-bg`.
- **DON'T:** Expect a single color token per component to cover all its states.
- **WHY:** Consistent interaction behavior requires explicit color logic for every meaningful state.

### The crucial rule

**Reference palettes are for choosing values. Semantic roles are for building products.** That distinction keeps a design system stable as products, themes, and brands evolve.

## Self-check

A color system is healthy if it can answer these questions at the token level:

- What color is the **app canvas**?
- What color is a **raised surface**?
- What color is **body text** on each surface?
- How do I style **selected**, **hovered**, **focused**, **pressed**, and **disabled** states?
- What changes in **dark mode** besides "making everything darker"?
- What happens when a user enables **higher contrast** or changes system appearance?

If the system cannot answer those questions, it is a palette, not a system.

## Foundation role inventory

```
background.canvas
background.surface
background.surface-raised
background.surface-inset
background.accent-subtle
background.inverse
background.scrim

text.primary
text.secondary
text.tertiary
text.disabled
text.inverse
text.link
text.on-accent

border.subtle
border.default
border.strong

focus.ring
focus.outline

accent.primary
accent.primary-hover
accent.primary-active
accent.primary-foreground

status.success
status.success-subtle
status.success-foreground
status.warning
status.warning-subtle
status.warning-foreground
status.error
status.error-subtle
status.error-foreground
status.info
status.info-subtle
status.info-foreground
```

## Component role inventory

```
button.primary.bg
button.primary.fg
button.primary.hover-bg
button.primary.active-bg
button.primary.disabled-bg
button.primary.disabled-fg
button.primary.focus-ring

button.secondary.bg
button.secondary.fg
button.secondary.border
button.secondary.hover-bg
button.secondary.active-bg

input.bg
input.fg
input.placeholder
input.border
input.hover-border
input.focus-border
input.focus-ring
input.invalid-border
input.invalid-ring

nav.item.fg
nav.item.hover-bg
nav.item.selected-bg
nav.item.selected-fg
nav.item.focus-ring
```

## Why this structure works

It separates five concerns that change independently:

1. **Surface logic** — canvas, depth, elevation
2. **Text hierarchy** — primary, secondary, tertiary, disabled
3. **Accent logic** — brand emphasis, interactive affordance
4. **Status semantics** — success, warning, error, info
5. **Component-state behavior** — rest, hover, pressed, focus, selected, disabled

That separation is what makes theming scalable.
