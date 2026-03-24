# Component and state color guidelines

> How to assign color to interactive components, interaction states, status feedback, borders, data visualization, and system adaptation.

## Interactive state rules

Color in components encodes affordance, priority, selection, feedback, and state transitions — not just appearance.

### Define color for every interaction state

- **DO:** Give every interactive component explicit color behavior for: default/rest, hover, pressed/active, focus-visible, selected, disabled, and error/invalid (when relevant).
- **DON'T:** Ship a component with color defined only for rest state and assume the rest will "just work."
- **WHY:** If a component has no explicit color behavior for those states, the system is incomplete.

### Define multiple tokens per component

A button is not "one color." A complete button needs:

```
background fill
foreground text/icon color
border color
hover fill
active fill
focus ring
disabled fill
disabled foreground
```

- **DO:** Apply this multi-token pattern to buttons, inputs, tabs, checkboxes, chips, nav items, switches, and any other interactive element.
- **DON'T:** Define a component as a single background color and derive everything else implicitly.
- **WHY:** Explicit tokens for each property and state prevent coupling breakdowns when themes, modes, or brands change.

### Differentiate interactivity without saturating

- **DO:** Distinguish interactive elements from non-interactive ones using a combination of: contrast, border presence, background treatment, hover/press behavior, focus treatment, and spatial treatment.
- **DON'T:** Rely on saturated fills as the sole marker of interactivity.
- **WHY:** Overusing saturated fills — especially in dark mode — makes interfaces look loud and fragmentary.

### Give focus its own dedicated token

- **DO:** Define a dedicated `focus.ring` or `focus.outline` token that is reliable across all components.
- **DON'T:** Let focus styling depend on whichever accent fill happens to be nearby.
- **WHY:** Focus must be visible and consistent everywhere for keyboard and assistive technology users.

### Distinguish hover, focus, pressed, selected, and disabled

- **DO:** Give each state a distinct visual treatment, even when they share a color family:

| State | Communicates |
|---|---|
| Hover | "You can interact with this" |
| Pressed | "You are activating this now" |
| Focus-visible | "Keyboard or assistive focus is here" |
| Selected | "This is the current active choice" |
| Disabled | "Unavailable right now" |

- **DON'T:** Make focus identical to hover, or selected identical to pressed.
- **WHY:** Blurring states removes critical feedback for users navigating with keyboard, pointer, or assistive technology.

### Meet non-text contrast requirements

- **DO:** Ensure important boundaries and states — input borders, selected indicators, toggle positions, checkmarks, focus outlines — meet at least **3:1** contrast against their adjacent colors [1].
- **DON'T:** Let component boundaries or state indicators disappear into the background.
- **WHY:** W3C SC 1.4.11 sets 3:1 as the minimum for non-text UI component visuals.

---

## Status and feedback color rules

### Keep status colors semantic

- **DO:** Reserve status hues for their intended meaning:

| Hue family | Reserved meaning |
|---|---|
| Green | Success, positive state |
| Amber | Warning, caution |
| Red | Error, destructive |
| Blue or stable neutral hue | Informational, system accent |

- **DON'T:** Use red for casual emphasis, green for unrelated branding, or warning colors for decorative purposes.
- **WHY:** If status meanings drift, the system loses clarity for users who rely on consistent signaling.

### Define complete status token sets

- **DO:** For each status (success, warning, error, info), define: foreground/icon color, subtle background, stronger fill, border (if applicable), and accessible on-color pairing.
- **DON'T:** Define only a single status color without foreground or background variants.
- **WHY:** Status surfaces appear across banners, badges, toasts, inline messages, and form fields — each context needs a full set.

### Separate brand accent from feedback colors

- **DO:** Keep brand accent tokens (`accent.primary`) conceptually separate from feedback tokens (`status.success`, `status.error`).
- **DON'T:** Reuse the brand accent color as the success or info indicator.
- **WHY:** Brand and feedback serve different roles. Coupling them causes confusion when either changes.

---

## Border, divider, and elevation rules

### Define border and divider tokens

- **DO:** Include tokens for: subtle borders, strong borders, dividers/separators, focus rings, scrims, and shadow colors where relevant.
- **DON'T:** Treat a color system as complete if it only defines fills and text.
- **WHY:** In dark mode especially, borders become more important because shadows alone may not separate surfaces clearly enough.

### Style disabled states explicitly

- **DO:** Give disabled states readable labels, clear boundaries, and an obviously muted appearance using dedicated tokens (`disabled-bg`, `disabled-fg`).
- **DON'T:** Implement disabled by applying low opacity to the rest state and calling it done.
- **WHY:** Opacity-only disabled states often fail contrast and may not look visually distinct enough.

---

## Data visualization color rules

### Treat chart colors as a separate concern

- **DO:** Define dedicated data-viz token sets: categorical palette, sequential scale, diverging scale, chart background/grid tokens, and label/axis tokens.
- **DON'T:** Reuse interface accent or status colors for chart series without verification.
- **WHY:** Data colors need different logic from interface colors — they must be distinguishable from each other, not just from a background.

### Make charts accessible

- **DO:** Use direct labels or markers when possible. Verify chart colors in dark mode separately from interface tokens.
- **DON'T:** Rely on red/green alone to differentiate chart series.
- **WHY:** Hue-only differentiation fails for color-blind users and becomes ambiguous on small chart elements.

---

## System adaptation rules

### Respect platform and user preferences

- **DO:** Respond to `prefers-color-scheme` on the web. Use theme attributes and night-qualified resources on Android. Use system-defined adaptive colors on Apple platforms.
- **DON'T:** Hardcode light-mode colors or ignore user preference signals.
- **WHY:** Semantic roles exist precisely to make adaptation possible. Ignoring the platform undermines the whole architecture.

### Keep dynamic colors dynamic

- **DO:** Keep adaptive/dynamic colors in their native form as long as possible in the rendering pipeline.
- **DON'T:** Prematurely collapse semantic colors into static hex exports.
- **WHY:** Flattening adaptive colors too early loses dynamic behavior across appearances, gamuts, and accessibility settings.

### Design for media-rich contexts

- **DO:** In interfaces with lots of photos or video, use neutral chrome, low-chroma panels, and restrained icon/text colors.
- **DON'T:** Compete with user content by using saturated, brand-heavy UI chrome.
- **WHY:** Dark gray backgrounds let imagery stand out without overwhelming contrast [2].

## Sources

[1] W3C — Understanding SC 1.4.11 Non-text Contrast
https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast

[2] Google Design — Material Design dark theme
https://design.google/library/material-design-dark-theme
