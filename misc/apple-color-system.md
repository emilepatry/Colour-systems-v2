# Apple color system model

> How Apple structures color across its platforms — the four-layer model, semantic roles, surface tokens, tint/accent, system palette, and materials.

## The four-layer Apple color model

Apple color usage is a stack of four layers, ordered from most preferred (top) to least preferred (bottom).

| Layer | What it is | When to use |
|---|---|---|
| 1. Semantic content colors | Role-based tokens: primary, secondary, background, link, separator, tint | Default choice for all standard UI |
| 2. System palette colors | Adaptive hue families: `systemBlue`, `systemRed`, `systemGray` … | When you need a specific hue that still adapts to light/dark/contrast |
| 3. Tint / accent color | The app's broad theme color for controls and emphasis | Selected states, CTAs, interactive affordances |
| 4. Custom brand colors | Your own hues for brand identity, charts, illustrations | Only when you've designed and tested all variants yourself |

- **DO:** Start at layer 1 and move down only when a higher layer doesn't solve the problem.
- **DON'T:** Jump to custom brand colors for standard UI elements.
- **WHY:** System-defined colors adapt automatically to appearance, accessibility contrast settings, platform conventions, and translucency/materials.

## Semantic content colors

### Content hierarchy

**SwiftUI** uses `Color.primary`, `Color.secondary`, and hierarchical foreground styles.
**UIKit / AppKit** uses `label`, `secondaryLabel`, `tertiaryLabel`, `quaternaryLabel`.

| Role | Usage |
|---|---|
| Primary / label | Titles, key values, core content |
| Secondary | Supporting text, helper text, sublabels |
| Tertiary | Metadata, less important annotations |
| Quaternary | Least important text, subtle dividers, extremely low-emphasis content |

- **DO:** Use these system-provided hierarchy roles for all text and symbol foregrounds.
- **DON'T:** Simulate hierarchy by manually reducing opacity on one color everywhere.
- **WHY:** System hierarchy responds automatically to appearance and accessibility changes. Manual opacity breaks in dark mode and increased contrast.

### Why semantic colors over hard-coded values

A hard-coded hex value may:
- Look fine in light mode, fail in dark mode
- Read well on flat surfaces, fail on materials
- Pass at normal contrast, fail at increased contrast
- Render correctly on sRGB, clip on wide gamut

- **DO:** Use semantic roles for UI structure. Use specific hues only when the hue itself carries intentional value.
- **DON'T:** Scatter numeric hex or RGB values throughout code for standard UI surfaces and text.

## Background and surface tokens

Apple distinguishes plain surfaces from grouped surfaces.

### Standard surfaces

| Token | Mental model |
|---|---|
| `systemBackground` | Canvas / base layer |
| `secondarySystemBackground` | Card or inset surface on top of the base |
| `tertiarySystemBackground` | Layer on top of the secondary layer |

### Grouped surfaces

| Token | Use for |
|---|---|
| `systemGroupedBackground` | Grouped lists, settings-style layouts |
| `secondarySystemGroupedBackground` | Cards/cells within a grouped layout |
| `tertiarySystemGroupedBackground` | Nested layer within grouped content |

- **DO:** Use grouped background tokens for table/grouped lists, settings-style layouts, and platter/card arrangements.
- **DON'T:** Reuse a plain surface color for a clearly grouped interface pattern.
- **WHY:** Apple treats these as semantically distinct, and they adapt differently across appearances.

## Tint and accent

### SwiftUI

`Color.accentColor` is a broad theme color applied to views and controls. On macOS, accent-color customization only applies when the user chooses Multicolor in system settings.

### UIKit

UIKit's tint model propagates through view hierarchies — set once, inherited everywhere.

### Scope

- **DO:** Use tint/accent for: selected controls, toggles, emphasized interactive elements, links, and action highlights.
- **DON'T:** Use tint/accent as: the default text color for everything, a substitute for error/success/warning semantics, a universal background color, or a replacement for hierarchy.
- **WHY:** A strong accent is most effective when it is reserved. Overuse collapses hierarchy.

## System palette colors

### Adaptive hues

`systemBlue`, `systemBrown`, `systemCyan`, `systemGreen`, `systemIndigo`, `systemMint`, `systemOrange`, `systemPink`, `systemPurple`, `systemRed`, `systemTeal`, `systemYellow`

- **DO:** Use these when you need a recognizable hue that still behaves like a native Apple color (adapts to light/dark/contrast).

### Adaptive grays

`systemGray` through `systemGray6`

- **DO:** Use these instead of hand-picked gray ramps for native UI.
- **WHY:** They already account for appearance changes.

### Fixed colors

`black`, `white`, `red`, `green`, `blue`, `orange`, `purple`, `yellow`, `gray`, `lightGray`, `darkGray`

- **DO:** Use fixed colors only for literal drawing, brand assets, nonsemantic illustration, or pixel-precise rendering.
- **DON'T:** Use fixed colors for general UI surfaces and text.
- **WHY:** Fixed colors do not adapt to appearance or accessibility settings.

## Materials, translucency, and vibrancy

Materials are context-aware layers that help foreground content remain legible over dynamic content.

### SwiftUI material styles

`.ultraThinMaterial`, `.thinMaterial`, `.regularMaterial`, `.thickMaterial`, `.ultraThickMaterial`, `.bar`

### What materials do

- Blur or filter what sits behind them
- Create depth without requiring a flat solid color
- Enable vibrancy, which helps foreground content maintain contrast against the material

### Rules

- **DO:** Prefer system materials for overlays, toolbars, floating UI, and transient surfaces.
- **DON'T:** Paint opaque custom backgrounds where a system material is more appropriate. Don't aggressively override foreground color on top of materials.
- **WHY:** Overriding foreground color on materials can disable or weaken the system's vibrancy behavior. Test custom foreground colors over materials in both light and dark appearances.

## Sources

- [Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color)
- [SwiftUI `Color.accentColor`](https://developer.apple.com/documentation/swiftui/color/accentcolor)
- [SwiftUI `Material`](https://developer.apple.com/documentation/swiftui/material/)
- [UIKit `UIColor`](https://developer.apple.com/documentation/uikit/uicolor)
- [UIKit Standard colors](https://developer.apple.com/documentation/uikit/standard-colors)
