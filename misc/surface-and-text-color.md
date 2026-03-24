# Surface and text color guidelines

> How to define background surfaces and text hierarchy so that depth is clear, reading conditions are stable, and contrast is always accessible.

## Surface rules

Backgrounds are not empty space. They establish depth, reading conditions, and component context.

### Define a full surface role set

- **DO:** Define at least these surface roles:

| Role | Purpose | Notes |
|---|---|---|
| `background.canvas` | App/page root | Broadest field in the interface |
| `background.surface` | Default containers, cards, panels | Main working surface |
| `background.surface-raised` | Elevated cards, menus, sheets | Must feel above base surface |
| `background.surface-inset` | Wells, grouped areas, nested panels | Often slightly distinct from main surface |
| `background.subtle-accent` | Selected rows, info strips, soft highlights | Must not replace primary accent |
| `background.inverse` | Inverted sections, tooltips, contrast moments | Requires inverse text tokens |
| `background.scrim` | Modal backdrops, image overlays | Usually semi-transparent |
| `background.brand` | Rare branded surface moments | Use sparingly |

- **DON'T:** Define only one "background" and one "card" color for the entire system.
- **WHY:** A two-value surface system is too crude to express depth, layering, or overlays in real product UI.

### Use neutrals for structure

- **DO:** Build most structure from neutral backgrounds, not brand-colored surfaces.
- **DON'T:** Use brand color as the default app shell or primary structural surface.
- **WHY:** Neutral structure keeps content readable, preserves accent signaling power, prevents dense views from becoming visually loud, and keeps dark mode manageable.

### Separate surfaces by luminance before hue

- **DO:** Differentiate adjacent panels using (in order of preference): luminance/tone difference, border/divider, shadow or material, then hue difference only when semantically meaningful.
- **DON'T:** Differentiate adjacent surfaces using hue alone — the relationship is often hard to parse.
- **WHY:** Luminance differences are universally perceivable. Hue-only differentiation fails for many users and viewing conditions.

### In dark mode, elevate lighter

- **DO:** Make elevated dark-mode surfaces lighter than the base.
- **DON'T:** Make elevated dark-mode surfaces darker (that destroys the depth cue).
- **WHY:** Light themes use shadow for elevation. Dark themes use lighter tonal steps plus restrained shadow and border treatment.

### Don't use gradients as default structure

- **DO:** Keep gradients as an expressive layer on top of stable surface tokens.
- **DON'T:** Replace your surface token system with gradient fills.
- **WHY:** A surface system should still work even if all gradients are removed.

### Common surface mistakes

These patterns reliably cause problems:

- Using brand color as the default app shell
- Using the same surface value for canvas, cards, and overlays
- Creating depth only with heavy shadow
- Making dark mode one flat charcoal plane
- Putting text directly on unstable or noisy backgrounds

---

## Text rules

Text is where accessibility and hierarchy become visible immediately.

### Define role-based text tokens

- **DO:** Define at least these text roles:

| Token | Usage |
|---|---|
| `text.primary` | Primary body text, headings, key labels |
| `text.secondary` | Supporting copy, metadata, explanatory labels |
| `text.tertiary` | Quiet metadata, placeholders, less critical information |
| `text.disabled` | Disabled labels and icons |
| `text.inverse` | Text on inverse/darkened/high-contrast surfaces |
| `text.link` | Navigational or inline links |
| `text.on-accent` | Text/icons placed on accent fills |
| `text.success` / `text.warning` / `text.error` | State-aware foregrounds |

- **DON'T:** Use raw palette values or unnamed hex codes for text colors throughout the product.
- **WHY:** Role-based tokens make hierarchy explicit and keep it consistent across every surface context.

### Build hierarchy from roles, not opacity

- **DO:** Define each text role explicitly against each major surface context (primary text on canvas, secondary text on canvas, primary text on inverse surface, text on accent fill).
- **DON'T:** Simulate hierarchy by manually reducing opacity on a single base color everywhere.
- **WHY:** Opacity-based hierarchy creates accidental low-contrast combinations on surfaces with different lightness values.

### Meet WCAG contrast floors

- **DO:** Ensure normal text meets at least **4.5:1** contrast against its background and large text meets at least **3:1** [1].
- **DON'T:** Assume a text color is accessible without checking it against every surface it will sit on.
- **WHY:** These are the WCAG Level AA minimums that Apple, Android, and W3C accessibility guidance all cite.

### Never rely on color alone for meaning

- **DO:** Pair color with at least one additional signal — iconography, label text, shape, pattern, position, or emphasis.
- **DON'T:** Use red for errors, green for success, or hue for selection without any other differentiator.
- **WHY:** Color-alone meaning fails for color-blind users and in contexts where hue is ambiguous. W3C and Apple guidance both reinforce this [1][2].

### Always define on-color pairs

- **DO:** For every filled accent or status surface (`primary`, `warning`, `success`, `destructive`), define an explicit foreground partner (`primary-foreground`, `warning-foreground`, etc.).
- **DON'T:** Assume white or black will always work as the foreground on accent fills.
- **WHY:** Contrast depends on the specific fill value, which changes between light mode, dark mode, and theme variants.

### Stabilize text over unstable backgrounds

- **DO:** When text sits on a gradient or media background, add a legibility stabilizer: a scrim, a solid backing plate, a darkening/lightening overlay, or a capped gradient range designed around the text area.
- **DON'T:** Place live text directly over moving, changing, or wide-range gradient backgrounds without any stabilizer.
- **WHY:** If the background changes, the text contrast changes with it.

## Sources

[1] W3C — Understanding SC 1.4.3 Contrast (Minimum)
https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum

[2] Apple Human Interface Guidelines — Accessibility
https://developer.apple.com/design/human-interface-guidelines/accessibility
