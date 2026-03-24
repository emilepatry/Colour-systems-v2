# V2 Phase B — Export Pipeline & Token Preview

> Upgrade the export system to produce shadcn-compatible CSS, Tailwind palette scales, and 3-layer design token JSON. Replace the single-card token preview with a multi-surface composition that proves the colour system works.

**Depends on:** [V2-ENGINE-D.md](V2-ENGINE-D.md) — consumes `SemanticTokenSet` from Engine D
**Produces:** Production-ready export output + visual proof of the token system, consumed by [V2-UX-SHIP.md](V2-UX-SHIP.md)

---

## Export Pipeline Upgrade

Three export targets replace the current CSS/JSON-only export.

### shadcn drop-in

Generates a complete `:root { }` and `.dark { }` block using shadcn's exact variable names, plus the `@theme inline { }` bridge. Copy-paste into `index.css` and the entire shadcn component library works.

Complete variable mapping:

| shadcn variable | Source role |
|---|---|
| `--background` / `--foreground` | `background.canvas` / `text.primary` |
| `--card` / `--card-foreground` | `background.surface` / `text.primary` |
| `--popover` / `--popover-foreground` | `background.surface-raised` / `text.primary` |
| `--primary` / `--primary-foreground` | `accent.primary` / `accent.primary-foreground` |
| `--secondary` / `--secondary-foreground` | `background.surface-inset` / `text.secondary` |
| `--muted` / `--muted-foreground` | lowest-L `surface`-intent neutral / `text.tertiary` |
| `--accent` / `--accent-foreground` | `background.accent-subtle` / `text.primary` |
| `--destructive` / `--destructive-foreground` | `status.error` / `status.error-foreground` |
| `--border` | `border.default` |
| `--input` | `border.subtle` |
| `--ring` | `focus.ring` |
| `--chart-1` … `--chart-5` | First 5 chromatic hues at `emphasis`-intent level (cycle if fewer hues) |
| `--sidebar` / `--sidebar-foreground` | `background.surface` / `text.primary` |
| `--sidebar-primary` / `--sidebar-primary-foreground` | `accent.primary` / `accent.primary-foreground` |
| `--sidebar-accent` / `--sidebar-accent-foreground` | `background.accent-subtle` / `text.primary` |
| `--sidebar-border` | `border.subtle` |
| `--sidebar-ring` | `focus.ring` |

All values emitted as `oklch(L C H)` strings. Output format:

```css
:root {
  --background: oklch(...);
  --foreground: oklch(...);
  /* ... all light-mode tokens ... */
}

.dark {
  --background: oklch(...);
  --foreground: oklch(...);
  /* ... all dark-mode tokens ... */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... Tailwind bridge for all tokens ... */
}
```

### Tailwind palette

`@theme { --color-{hue}-{level}: ... }` for raw palette scales. Unchanged from v1 — this is the raw palette layer for users who want direct scale access alongside or instead of shadcn semantics.

### Design tokens JSON

3-layer structure:

```json
{
  "meta": { "compliance": "AA", "mode": "light", "numHues": 5 },
  "palette": { "hue-0": [...], "neutral": [...] },
  "semantic": {
    "background.canvas": { "hex": "#...", "oklch": "oklch(...)" },
    "text.primary": { "hex": "#...", "oklch": "oklch(...)" }
  },
  "component": {}
}
```

Component layer is an empty object with Phase 7 as the delivery target.

### ExportSheet UI

The `ExportSheet` component gains tabs: **shadcn** (default), **Tailwind**, **JSON**. The shadcn tab is front and centre because it is the highest-value output for the target user.

---

## Token Preview Upgrade

Replace the single-card `TokenPreview.tsx` with a multi-surface composition rendered using generated semantic CSS variables injected as `style` custom properties on a container div.

### Preview composition

- **Canvas / surface / raised surface** — depth stack demonstrating the surface hierarchy
- **Text hierarchy** — primary, secondary, tertiary, disabled text on canvas
- **Buttons** — primary (accent fill + foreground), secondary (surface-inset fill), ghost (text only)
- **Status badges** — success, warning, error, info pills (including synthesized status tokens)
- **Input field** — background, placeholder text, border, focus ring
- **Divider** — border.default treatment

All elements consume semantic CSS variables, not raw palette indices. The preview IS the proof that the system works — "show, don't tell" per Onboarding Principle #22 from [frameworks/FRAMEWORK_Onboarding-Principles.md](../frameworks/FRAMEWORK_Onboarding-Principles.md).

---

## Test Specification

### Export snapshot tests (`src/lib/__tests__/export-shadcn.test.ts`)

- shadcn output contains `:root { }` and `.dark { }` blocks
- Every expected shadcn variable name is present
- Values are `oklch(...)` strings
- `@theme inline { }` bridge is present with `--color-*` mappings
- Snapshot test for format stability (following `palette.snapshot.test.ts` pattern)

---

## Acceptance Criteria

- [ ] `ExportSheet` has three tabs: shadcn (default), Tailwind, JSON
- [ ] shadcn export produces valid `:root {}`, `.dark {}`, and `@theme inline {}` blocks
- [ ] Every shadcn variable in the mapping table above is present in the output
- [ ] All values are `oklch(L C H)` strings
- [ ] Tailwind export produces `--color-{hue}-{level}` custom properties
- [ ] JSON export contains `meta`, `palette`, `semantic`, and `component` layers
- [ ] `TokenPreview` renders multi-surface composition (canvas, surface, raised surface)
- [ ] Preview renders text hierarchy, buttons, status badges, input field, and divider
- [ ] All preview elements consume semantic CSS variables, not raw palette indices
- [ ] Export snapshot tests pass

---

## References

### Source-of-Truth Docs
- [misc/shadcn-semantic-tokens.md](../misc/shadcn-semantic-tokens.md) — exact CSS variable names and semantics
- [misc/color-token-architecture.md](../misc/color-token-architecture.md) — 3-layer model

### Frameworks
- [frameworks/FRAMEWORK_Onboarding-Principles.md](../frameworks/FRAMEWORK_Onboarding-Principles.md)

### Implementation
- Current export: [src/lib/export.ts](../src/lib/export.ts) (extend with shadcn/Tailwind/JSON)
- Current preview: [src/components/TokenPreview.tsx](../src/components/TokenPreview.tsx) (replace with multi-surface)
