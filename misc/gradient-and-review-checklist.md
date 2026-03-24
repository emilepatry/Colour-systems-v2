# Gradient guidelines and color system review checklist

> When and how to use gradients in product UI, common anti-patterns to avoid, and a comprehensive checklist for evaluating whether a color system is production-ready.

## Gradient rules

Gradients are useful as expressive layers, but they must not become the foundation of semantic UI.

### Good gradient use cases

Gradients work well for:
- Hero areas and marketing surfaces
- Onboarding moments
- Ambient depth or atmosphere
- Selected-state glow or emphasis
- Charts and data visuals
- Image treatments and scrims

### Bad gradient use cases

Gradients are risky for:
- Long-form reading surfaces
- Dense form backgrounds
- Primary app scaffolding
- Small controls with labels
- Any surface where consistent contrast is critical

### Anchor gradients to a semantic base

- **DO:** Derive gradients from a stable token like `surface`, `accent-subtle`, or `brand` so the system has a fallback if gradients are removed.
- **DON'T:** Create free-floating gradients with no relationship to the semantic token layer.
- **WHY:** The surface system should still work even if all gradients are stripped out.

### Control tonal range under text

- **DO:** Use narrow or medium tonal shifts for UI gradients that carry text.
- **DON'T:** Use extreme gradient ranges behind text — the contrast changes unpredictably across the text area.
- **WHY:** The more extreme the range, the harder it is to guarantee text contrast at every gradient stop.

### Test all text regions, not just corners

- **DO:** Verify text contrast against the darkest, lightest, and midpoint regions of any gradient background.
- **DON'T:** Check contrast against one sample corner and assume the rest passes.
- **WHY:** A gradient may pass contrast on one edge and fail in the center.

### Use gradients for emphasis, not default structure

- **DO:** Reserve gradients for moments that deserve visual emphasis.
- **DON'T:** Gradient-fill everything — when everything is gradient, nothing feels special.
- **WHY:** Emphasis works by contrast with the norm.

### Reduce gradient intensity in dark mode

- **DO:** Lower saturation and glow effects for dark-mode gradients.
- **DON'T:** Port light-mode gradient values directly into dark mode.
- **WHY:** Bright, high-chroma gradients can look attractive in isolation but become noisy, neon, or fatiguing in real dark-mode product UI.

### Safe gradient patterns

- Subtle tonal gradient on a hero card
- Soft radial accent behind a selected tile
- Image scrim that preserves headline readability
- Brand gradient confined to a marketing band or decorative layer

### Risky gradient patterns

- Body text directly on a multicolor gradient
- Form controls over a noisy gradient field
- Full-app chrome built entirely from high-chroma gradients
- Gradients used as the only state indicator

---

## Anti-patterns

These are the most common ways color systems fail. Treat each as a hard DON'T.

| # | Anti-pattern | Why it fails |
|---|---|---|
| 1 | Inverting the light theme to make dark mode | Preserves the wrong relationships and creates poor hierarchy |
| 2 | Using raw palette colors directly in components everywhere | Makes consistency fragile and blocks future theming |
| 3 | Using saturated brand color as the app shell | Reduces readability and makes emphasis meaningless |
| 4 | Making dark mode one flat charcoal or pure-black slab | Without a surface ladder, depth and scannability collapse |
| 5 | Treating gradients as structural backgrounds | Makes legibility unstable and components harder to standardize |
| 6 | Using color alone for error, success, and selection | Fails accessibility and weakens clarity |
| 7 | Styling disabled by low opacity only | Disabled states still need readable labels and clear boundaries |
| 8 | Making focus identical to hover or selected | Focus needs a distinct, reliable treatment |
| 9 | Forgetting on-color pairs | Any filled accent or status surface needs an explicit foreground token |
| 10 | Designing only on ideal empty states | Color systems must be reviewed with real density, content, and edge cases |

---

## Review checklist

Use this when evaluating whether a color system is production-ready.

### Dark mode

- [ ] Dark mode uses the same semantic roles as light mode
- [ ] Elevated surfaces are distinguishable from the base background
- [ ] Accent color area is more restrained than in light mode where appropriate
- [ ] The UI does not depend on pure black unless intentionally designed for that context
- [ ] Text, icons, and component boundaries remain readable in dark mode

### Backgrounds

- [ ] There is a clear canvas / surface / raised / inset structure
- [ ] Backgrounds are mostly neutral and do not compete with content
- [ ] Overlays, scrims, and inverse sections have explicit tokens

### Text

- [ ] Primary and secondary text roles are clearly distinct
- [ ] Normal text meets at least 4.5:1 contrast
- [ ] Large text and key non-text component visuals meet at least 3:1
- [ ] Meaning is not conveyed by color alone

### Components

- [ ] Primary, secondary, ghost, and destructive treatments are clearly differentiated
- [ ] Hover, pressed, focus, selected, and disabled states are explicit
- [ ] Focus has a dedicated token
- [ ] Inputs have valid, invalid, and disabled color behavior

### Gradients and expressive color

- [ ] Gradients are used intentionally, not as the entire system
- [ ] Text is not placed on unstable gradient regions without a stabilizer
- [ ] Dark-mode gradients are restrained enough to avoid noise and glare

### System integrity

- [ ] Components mostly consume semantic roles, not raw palette values
- [ ] Brand, status, and data-viz colors are separated conceptually
- [ ] The system has a path for higher-contrast variants
- [ ] Implementation respects platform or browser appearance settings

## Summary

Good color systems are:
- **Semantic** rather than palette-first
- **Hierarchical** rather than decorative
- **Adaptive** rather than hardcoded
- **Accessible** rather than aesthetic-only
- **Stateful** rather than static
- **Restrained** rather than saturated everywhere
