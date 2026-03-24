# Tailwind CSS color palette guidelines

> How Tailwind's palette token system works — families, scales, utility generation, custom tokens, opacity modifiers, dark mode — and when to use palette tokens vs semantic tokens.

## Palette structure

Tailwind's color system is driven by the `--color-*` theme-variable namespace. Tokens defined in that namespace determine which color utility classes exist.

### Default families

| Group | Families |
|---|---|
| Warm | `red`, `orange`, `amber`, `yellow` |
| Green to blue | `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo` |
| Purple to pink | `violet`, `purple`, `fuchsia`, `pink`, `rose` |
| Neutrals | `slate`, `gray`, `zinc`, `neutral`, `stone`, `taupe`, `mauve`, `mist`, `olive` |

### Scale steps

Every default family includes 11 steps:

`50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `950`

- `50` is the lightest.
- `950` is the darkest.

### Special values

These non-scale values are available across all color utilities:

| Value | Type |
|---|---|
| `inherit` | CSS keyword |
| `current` | CSS keyword |
| `transparent` | CSS keyword |
| `black` | Token backed by `--color-black` |
| `white` | Token backed by `--color-white` |

## Utility generation

A single token family like `sky-*` produces utility classes across every color-related property:

| Utility prefix | Applies color to |
|---|---|
| `bg-*` | Background color |
| `text-*` | Text color |
| `decoration-*` | Text decoration color |
| `border-*` | Border color |
| `outline-*` | Outline color |
| `shadow-*` | Box-shadow color |
| `inset-shadow-*` | Inset box-shadow color |
| `ring-*` | Ring shadow color |
| `inset-ring-*` | Inset ring color |
| `accent-*` | Form-control accent color |
| `caret-*` | Caret color |
| `fill-*` | SVG fill |
| `stroke-*` | SVG stroke |

So `--color-blue-500` backs `bg-blue-500`, `text-blue-500`, `border-blue-500`, `ring-blue-500`, `fill-blue-500`, etc.

## Opacity modifiers

Tailwind supports alpha directly in utility syntax:

```
bg-black/75
bg-sky-500/10
bg-pink-500/[71.37%]
bg-cyan-400/(--my-alpha-value)
```

The token and the alpha are separable: `sky-500` stays the token, `/10` modifies the alpha channel at the utility level.

## Dark mode

Palette tokens are variant-friendly. Gate them behind `dark:`:

```
dark:bg-gray-800
dark:text-white
```

The tokens stay the same; the variant controls when they apply.

## CSS variable access

Tailwind exposes all default colors as CSS variables in the `--color-*` namespace:

```css
color: var(--color-gray-950);
border-color: var(--color-blue-500);
```

Also available:
- `light-dark(var(--color-white), var(--color-gray-950))`
- `--alpha(var(--color-gray-950) / 10%)`

This makes Tailwind colors usable inside authored CSS when you need composition that utilities alone would make awkward.

## Custom tokens

### Add a new palette token

```css
@theme {
  --color-brand-500: oklch(...);
}
```

Creates `bg-brand-500`, `text-brand-500`, `fill-brand-500`, etc.

### Override a default family

Redefine tokens with the same names (e.g. `--color-gray-50` through `--color-gray-950`) to keep the utility API but change the values.

### Disable unused families

```css
@theme {
  --color-lime-*: initial;
}
```

Removes unused default colors from output.

### Replace the entire default palette

```css
@theme {
  --color-*: initial;
  --color-brand-500: ...;
}
```

Gives you a completely custom palette surface.

### Bridge external variables with `@theme inline`

When a Tailwind color token should point at another CSS variable (common when connecting shadcn's semantic variables to Tailwind's namespace):

```css
@theme inline {
  --color-canvas: var(--acme-canvas-color);
}
```

## When to use semantic vs palette tokens

| Use case | Prefer |
|---|---|
| Standard app surfaces, forms, dialogs, navigation, buttons | **Semantic tokens** (shadcn) |
| Rebrand / theme swap without rewriting component classes | **Semantic tokens** (shadcn) |
| One-off illustration, badge, marketing treatment, or expressive accent | **Palette tokens** (Tailwind) |
| Dense data-viz with raw scale control | **Palette tokens** or a dedicated chart token layer |
| Reusable state like `success`, `warning`, `info` across the product | Add **new semantic tokens** and map them into Tailwind |

### Decision rule

If the question is **"what role does this color play in the interface?"** — use a semantic token.

If the question is **"what exact hue/step do I want?"** — use a palette token.

## Design system recommendations

1. **Default to semantic tokens for product UI.** Components should speak in roles (`primary`, `muted`, `border`), not raw hues.

2. **Use palette tokens for intentional exceptions.** Data viz, status chips, illustrations, demos, internal tools, content-heavy views.

3. **Promote repeated palette colors into semantic tokens.** If `amber-500` keeps reappearing as "warning," formalize it as `warning` / `warning-foreground`.

4. **Keep light/dark logic inside tokens, not components.** Stable utility names with swapped values scale better than per-component `dark:` overrides.

5. **Treat `border`, `input`, and `ring` as system chrome tokens.** They regulate the perceived mechanical quality of the UI, not just color.

## Sources

- [Tailwind CSS — Colors](https://tailwindcss.com/docs/colors)
- [Tailwind CSS — Theme variables](https://tailwindcss.com/docs/theme)
- [Tailwind CSS — Background color](https://tailwindcss.com/docs/background-color)
- [Tailwind CSS — Text color](https://tailwindcss.com/docs/color)
