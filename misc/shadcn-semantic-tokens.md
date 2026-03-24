# shadcn/ui semantic token guidelines

> How shadcn/ui structures color tokens as semantic CSS variables, what each token means, and how to extend the system with new roles.

## Two systems, one stack

A shadcn + Tailwind project has two distinct token layers:

| Layer | Names describe | Example tokens | Use for |
|---|---|---|---|
| **shadcn semantic tokens** | What a color means in the interface | `primary`, `muted`, `destructive`, `card`, `ring` | Product UI primitives and component theming |
| **Tailwind palette tokens** | Where a color sits in a palette ramp | `red-500`, `sky-700`, `zinc-200` | Direct palette work, expressive moments, illustrations, badges, one-off styling |

- **DO:** Use shadcn tokens for standard app surfaces, forms, dialogs, navigation, and buttons. Use Tailwind palette tokens for intentional exceptions.
- **DON'T:** Mix raw palette tokens into reusable components where a semantic token would make theming possible.

## How shadcn tokens work

### CSS variable foundation

Every shadcn semantic token starts as a CSS variable pair:

```css
--primary: ...;
--primary-foreground: ...;
```

The base token is the surface or fill. The `-foreground` token is the text/icon color intended to sit on top of it. Use them together:

```tsx
<div className="bg-primary text-primary-foreground" />
```

- **DO:** Always pair a surface token with its `-foreground` counterpart when placing text or icons on that surface.
- **DON'T:** Use `bg-primary` with `text-white` or another arbitrary foreground.
- **WHY:** The foreground token is designed to maintain contrast with its surface across all themes.

### Light and dark mode

shadcn defines the same token names in `:root` and `.dark`, then swaps values between themes. Utility names stay stable (`bg-primary`, `text-muted-foreground`, etc.) while actual color values change by theme.

- **DO:** Change roles in the CSS variable definitions, not in every component class.
- **DON'T:** Rewrite component classes with `dark:` variants for tokens that already exist in the semantic layer.
- **WHY:** This is the main advantage of semantic tokens — change once, propagate everywhere.

## Token inventory

| Group | Token(s) | Role in UI | Common utilities |
|---|---|---|---|
| Global canvas | `background`, `foreground` | App/page background and default body text | `bg-background`, `text-foreground` |
| Surface | `card`, `card-foreground` | Cards and card content | `bg-card`, `text-card-foreground` |
| Overlay | `popover`, `popover-foreground` | Popovers, menus, floating layers | `bg-popover`, `text-popover-foreground` |
| Primary action | `primary`, `primary-foreground` | Main CTA, selected emphasis, strongest brand action | `bg-primary`, `text-primary-foreground` |
| Secondary action | `secondary`, `secondary-foreground` | Lower-emphasis filled actions | `bg-secondary`, `text-secondary-foreground` |
| Muted / supporting | `muted`, `muted-foreground` | Subdued surfaces, helper text, placeholders | `bg-muted`, `text-muted-foreground` |
| Accent / highlight | `accent`, `accent-foreground` | Hovered rows, highlighted items, soft emphasis | `bg-accent`, `text-accent-foreground` |
| Destructive | `destructive`, `destructive-foreground` | Danger actions, delete affordances | `bg-destructive`, `text-destructive-foreground` |
| Structural | `border` | Default borders and separators | `border-border` |
| Form chrome | `input` | Input edges, field chrome | `border-input` |
| Focus | `ring` | Focus rings and active outlines | `ring-ring`, `outline-ring` |
| Data viz | `chart-1` … `chart-5` | Default chart series colors | `var(--chart-1)` in chart config |
| Sidebar surface | `sidebar`, `sidebar-foreground` | Sidebar background and text | `bg-sidebar`, `text-sidebar-foreground` |
| Sidebar primary | `sidebar-primary`, `sidebar-primary-foreground` | Sidebar CTA / selected primary | `bg-sidebar-primary`, `text-sidebar-primary-foreground` |
| Sidebar accent | `sidebar-accent`, `sidebar-accent-foreground` | Sidebar hover / highlight | `bg-sidebar-accent`, `text-sidebar-accent-foreground` |
| Sidebar structure | `sidebar-border`, `sidebar-ring` | Sidebar separators and focus | `border-sidebar-border`, `ring-sidebar-ring` |

## Token semantics

- **`background` / `foreground`** — the baseline canvas and baseline text.
- **`card` / `popover`** — specialized surfaces that sit on top of the main canvas.
- **`primary`** — your strongest affirmative or brand-weighted emphasis.
- **`secondary`** — a quieter filled treatment than primary.
- **`muted`** — intentionally low-contrast UI scaffolding.
- **`accent`** — a soft highlight, frequently used for hover or selected-row states.
- **`destructive`** — reserved for danger semantics.
- **`border`, `input`, `ring`** — mechanical UI chrome rather than content color.
- **`chart-*`** — stable, reusable series tokens for data visualization.
- **`sidebar-*`** — a separate semantic layer so the sidebar can diverge from the main app shell without breaking the rest of the system.

## Adding new semantic tokens

Follow this pattern to extend the system (example: `warning`):

### 1. Define CSS variables

```css
:root {
  --warning: oklch(...);
  --warning-foreground: oklch(...);
}

.dark {
  --warning: oklch(...);
  --warning-foreground: oklch(...);
}
```

### 2. Bridge into Tailwind

```css
@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

### 3. Use in components

```tsx
<div className="bg-warning text-warning-foreground" />
```

- **DO:** Promote any raw Tailwind color that keeps reappearing in a semantic role (e.g. `amber-500` used everywhere as "warning") into a formal semantic token.
- **DON'T:** Leave recurring semantic patterns encoded as scattered palette references.

## Base color presets

shadcn exposes these base ramp presets via `baseColor` in `components.json`:

`neutral`, `stone`, `zinc`, `mauve`, `olive`, `mist`, `taupe`

- These shift the project's neutral character.
- They are theming presets for the generated foundation, not the full extent of available colors.
- Changing `baseColor` does not limit which Tailwind colors are available.

## Sources

- [shadcn/ui — Theming](https://ui.shadcn.com/docs/theming)
- [shadcn/ui — Charts](https://ui.shadcn.com/docs/components/chart)
