# Dark mode color guidelines

> How to build a dark mode that preserves hierarchy, readability, and accessibility — not just a darkened copy of the light theme.

## Core principle

A good dark mode is **not** a light theme run through a darkening filter. It keeps the same semantic roles and remaps the underlying color values to preserve hierarchy, contrast, and component behavior.

## Rules

### Keep the same roles, remap the values

- **DO:** Preserve every semantic role (`text.primary`, `surface-raised`, `focus.ring`, `destructive`) and assign dark-appropriate values to each.
- **DON'T:** Mechanically invert the light palette or darken every color by a fixed amount.
- **WHY:** Roles encode meaning; values encode appearance. Changing values while keeping roles stable is what makes theming work.

### Build a luminance ladder

- **DO:** Define several neutral surface levels in dark mode — canvas, base surface, raised surface, inset surface, overlay/scrim, inverse surface.
- **DON'T:** Use a single flat dark color for every surface.
- **WHY:** Without a ladder, dark mode becomes visually flat and hard to scan. Material 3 uses tonal elevation for exactly this reason [1].

Typical dark-mode surface stack:

| Level | Purpose |
|---|---|
| Canvas | Deepest background, app root |
| Base surface | Default container |
| Raised surface | Cards, menus, sheets — slightly lighter than base |
| Inset surface | Wells, grouped areas — slightly distinct from base |
| Overlay / scrim | Modal backdrops, semi-transparent layers |
| Inverse surface | Contrast sections, tooltips |

### Elevate by going lighter, not darker

- **DO:** Make elevated dark-mode surfaces lighter than the base, plus restrained border or shadow treatment.
- **DON'T:** Make elevated surfaces darker than the base (that collapses depth).
- **WHY:** In light themes, elevation moves toward shadow. In dark themes, elevation becomes legible through lighter tonal steps [1].

### Reduce saturation and limit accent area

- **DO:** Keep large surfaces neutral or very low-chroma. Reserve saturated color for actions, states, and highlights. Use brand color surgically.
- **DON'T:** Use the same saturated accent fills and areas you use in light mode.
- **WHY:** Overly saturated colors on dark backgrounds reduce legibility and create optical vibration. Android and Wear OS guidance explicitly recommend lighter or more desaturated accent tones in dark themes [2][3].

In practice:
- Accent colors occupy **less area** in dark mode than in light mode.
- Large structural surfaces stay neutral.
- Saturated color is reserved for small, high-signal elements.

### Use dark gray, not pure black, as the default

- **DO:** Default to very dark gray surfaces for most app UI. They preserve depth, make borders and elevation easier to express, and reduce the stark jump against bright content.
- **DON'T:** Default to pure `#000000` unless you are designing for a specific OLED, immersive media, or wearable context.
- **WHY:** Google's dark-theme guidance notes that darker gray backgrounds better support imagery and preserve vibrancy without harsh contrast [4].

Pure black is appropriate for:
- OLED-first experiences
- Immersive media or photo/video viewing
- Watch interfaces and some wearable contexts [3]

### Tune contrast — don't maximize it

- **DO:** Create comfortable hierarchy: high-contrast body text (but not pure white), clearly subordinate secondary text, subtle but discoverable chrome and dividers, strong interactive emphasis.
- **DON'T:** Push every foreground to pure white and every background to pure black.
- **WHY:** Maximum contrast causes glare, halation around bright text, noisy layer competition, and aggressive focus fighting. The system must meet accessibility requirements while remaining comfortable.

Typical pattern:

| Element | Contrast level |
|---|---|
| Body text | High, but not the brightest possible white |
| Secondary text | Clearly subordinate, still readable |
| Chrome and dividers | Subtle, but discoverable |
| Interactive emphasis | Strong enough to read instantly |

### Test in accessibility settings, not only default mode

- **DO:** Review dark mode in: default dark appearance, default light appearance, higher contrast / increased contrast settings, low-brightness viewing conditions, and real content states (not empty mockups).
- **DON'T:** Only test in default dark mode on a bright monitor with empty placeholder content.
- **WHY:** Apple's HIG recommends checking contrast in both appearances and using adaptive system-defined colors because they respond to settings like Increase Contrast [5].

## Summary

Good dark mode works because it:

1. Preserves roles instead of inverting colors
2. Builds a real surface ladder
3. Limits accent area and saturation
4. Maintains readable but controlled contrast
5. Treats elevation, focus, and component states as first-class parts of the system

## Sources

[1] Android Developers — Material 3 in Compose (tonal elevation)
https://developer.android.com/develop/ui/compose/designsystems/material3

[2] Android Developers — Material Design 2 in Compose (limited color accents in dark theme)
https://developer.android.com/develop/ui/compose/designsystems/material

[3] Android Developers — Wear OS color guidance
https://developer.android.com/design/ui/wear/guides/m2-5/styles/color

[4] Google Design — Material Design dark theme
https://design.google/library/material-design-dark-theme

[5] Apple Human Interface Guidelines — Accessibility
https://developer.apple.com/design/human-interface-guidelines/accessibility
