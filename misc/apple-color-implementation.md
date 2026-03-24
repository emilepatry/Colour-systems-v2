# Apple color implementation guidelines

> Accessibility requirements, light/dark adaptation, color spaces, named color assets, SwiftUI and UIKit code patterns, a decision tree for choosing color types, and common mistakes.

## Accessibility

### Contrast targets

Apple cites these WCAG Level AA thresholds:

| Text case | Minimum contrast |
|---|---:|
| Up to 17 pt, any weight | 4.5:1 |
| 18 pt, any weight | 3:1 |
| Bold text, any size | 3:1 |

- **DO:** Check contrast in both light mode and dark mode. If your palette fails, provide a better result when Increase Contrast is enabled. Prefer system-defined colors because Apple provides accessible variants for them.
- **DON'T:** Assume a color is accessible without testing it in both appearances and with increased contrast enabled.

### Never color-alone

- **DO:** Pair color with at least one additional signal: iconography, label text, shape, pattern, position, or emphasis/motion.
- **DON'T:** Communicate status, success, error, warning, or category by hue alone.
- **WHY:** This is critical for charts, health/financial status, validation errors, game states, and network/system status.

## Light mode, dark mode, and user settings

Apple UI is highly adaptive. Assume users may change appearance, contrast, accent preferences, and display gamut at any time.

### Testing requirements

- **DO:** Test every important screen in light mode and dark mode, with Increase Contrast enabled, and verify text legibility on materials and grouped backgrounds. Ensure disabled states remain readable and still look disabled.
- **DON'T:** Invert your palette mechanically. Don't assume one grayscale ramp works in both modes. Don't use the same absolute alpha values everywhere and expect equivalent results.

## Color spaces and gamut

### Key concepts

| Space | Role |
|---|---|
| sRGB | Safe baseline for general UI assets |
| Display P3 | Wider gamut for intentional extended-range color |
| extendedSRGB / extendedGray | UIKit extended color spaces |

### Rules

- **DO:** Use named color assets rather than scattering numeric component values in code. Use Display P3 only when you intentionally need the wider gamut. Test on real Apple hardware if hue relationships matter.
- **DON'T:** Design in wide-gamut color without verifying how it maps back to standard displays.

### HDR

Apple's modern color APIs support HDR workflows. Unless you are doing advanced media, imaging, or rendering work, semantic colors and standard named assets are the correct level of abstraction.

## Named colors and asset catalogs

### When to use a named color asset

- **DO:** Use named color assets for: brand colors, custom chart palettes, reusable theme tokens, and small custom semantic layers specific to your app.
- **DON'T:** Create a custom asset for every standard UI role Apple already defines. If the system already has a semantic color, use it.
- **WHY:** Named colors centralize light/dark variants, gamut-specific variants (sRGB vs Display P3), and reusable design tokens inside Apple-native tooling.

## SwiftUI patterns

### Good defaults

```swift
Text("Primary")
    .foregroundStyle(.primary)

Text("Supporting")
    .foregroundStyle(.secondary)

RoundedRectangle(cornerRadius: 12)
    .fill(.regularMaterial)

Image(systemName: "link")
    .foregroundStyle(.tint)
```

### Deliberate accent usage

```swift
Text("Accent")
    .foregroundStyle(Color.accentColor)
```

### Semantic text hierarchy

```swift
VStack(alignment: .leading, spacing: 4) {
    Text("Invoice total")
        .foregroundStyle(.primary)

    Text("Due in 3 days")
        .foregroundStyle(.secondary)
}
```

### Pattern to avoid

```swift
Text("Supporting")
    .foregroundStyle(Color.black.opacity(0.55))
```

- **DON'T:** Use this pattern.
- **WHY:** It is not semantic, fails in dark mode, and does not respond correctly to accessibility contrast changes.

## UIKit patterns

### Good defaults

```swift
titleLabel.textColor = .label
subtitleLabel.textColor = .secondaryLabel
view.backgroundColor = .systemBackground
cardView.backgroundColor = .secondarySystemBackground
```

### Grouped layout

```swift
tableView.backgroundColor = .systemGroupedBackground
cell.contentView.backgroundColor = .secondarySystemGroupedBackground
```

### App tint

```swift
window?.tintColor = .systemIndigo
```

### Dynamic custom color

```swift
let dynamicBrand = UIColor { trait in
    trait.userInterfaceStyle == .dark
        ? UIColor(displayP3Red: 0.62, green: 0.78, blue: 1.0, alpha: 1.0)
        : UIColor(displayP3Red: 0.10, green: 0.35, blue: 0.95, alpha: 1.0)
}
```

- **DO:** Use dynamic custom colors only when semantic or system colors do not solve the problem.

## Decision tree

Follow this order when choosing a color type:

1. **System semantic color** — when the element is standard UI, hierarchy matters more than hue, the surface must work across light/dark/contrast states, or the element is text, iconography, surface, link, or grouped content.

2. **System hue** — when you need a specific native-looking hue, the color communicates category or status and should still adapt, or the element is still part of Apple-style UI.

3. **Named custom color** — when brand expression matters, the color is part of your product's visual identity, and you have designed and tested all needed variants.

4. **Fixed raw color** — only when you are drawing something literal, handling media/rendering cases, or adaptivity is intentionally not desired.

## Common mistakes

| # | Mistake | Why it fails |
|---|---|---|
| 1 | Using brand blue as every interactive and noninteractive color | Collapses hierarchy and makes the UI feel less native |
| 2 | Building a custom gray ramp instead of using Apple's semantic/background roles | Usually causes contrast or mode-switching bugs |
| 3 | Encoding status only by red/green | Fails accessibility and breaks for many users |
| 4 | Using flat opaque surfaces where materials are expected | Makes floating UI feel heavy and non-native |
| 5 | Extracting raw color values too early | Dynamic system colors lose value when flattened into static values or raw CGColor too early |
| 6 | Ignoring grouped-background semantics | Settings-style and platter/grouped interfaces should use grouped surface roles |

## Recommended baseline

Start here for a robust default strategy:

- Use semantic text colors for all text and symbols
- Use semantic background colors for all surfaces
- Use grouped background colors for grouped layouts
- Use one restrained accent/tint color for interactivity
- Use system palette colors for status/category when a specific hue is needed
- Use materials for overlays, bars, and floating UI
- Add custom named colors only for true product-level branding needs
- Test everything in light, dark, and increased-contrast settings

## Sources

- [Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color)
- [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [UIKit Standard colors](https://developer.apple.com/documentation/uikit/standard-colors)
- [UIKit Color creation](https://developer.apple.com/documentation/uikit/color-creation)
- [UIKit Determining color values with color spaces](https://developer.apple.com/documentation/uikit/determining-color-values-with-color-spaces)
- [Asset Catalog Named Color](https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/Named_Color.html)
