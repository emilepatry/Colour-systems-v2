# Extended Component, Effect & Brand Tokens (DS5 — Not in Figma)

Companion to [EXTENDED_COLOUR_TOKENS.md](EXTENDED_COLOUR_TOKENS.md), which covers foundation tokens (neutral, surface, inverse, semantic status, accent palettes). This file covers per-component tokens, interaction states, brand, AI, and asset palettes.

> Light-mode hex values shown. Dark-mode equivalents exist in the token system.

---

## Component Tokens

Per-component token namespaces (suffixed with `N`). Aviary components consume these
automatically from the theme. Only relevant when building custom UI that must visually
match a specific Aviary component.

### Buttons (`buttonN`)

| Token | Hex |
|---|---|
| `buttonN.primary.neutral.background` | `#36485c` |
| `buttonN.primary.neutral.text` | `#ffffff` |
| `buttonN.primary.neutral.icon` | `#f5f7fa` |
| `buttonN.primary.critical.background` | `#af2645` |
| `buttonN.primary.critical.text` | `#ffffff` |
| `buttonN.primary.critical.icon` | `#f5f7fa` |
| `buttonN.primary.inverse.background` | `#f5f7fa` |
| `buttonN.primary.inverse.text` | `#2e3a47` |
| `buttonN.primary.inverse.icon` | `#36485c` |
| `buttonN.secondary.neutral.border` | `#212933` |
| `buttonN.secondary.neutral.text` | `#2e3a47` |
| `buttonN.secondary.neutral.icon` | `#36485c` |
| `buttonN.secondary.critical.border` | `#af2645` |
| `buttonN.secondary.critical.text` | `#980b29` |
| `buttonN.secondary.critical.icon` | `#980b29` |
| `buttonN.secondary.inverse.border` | `#f5f7fa` |
| `buttonN.secondary.inverse.text` | `#ffffff` |
| `buttonN.secondary.inverse.icon` | `#f5f7fa` |
| `buttonN.tertiary.neutral.text` | `#2e3a47` |
| `buttonN.tertiary.neutral.icon` | `#36485c` |
| `buttonN.tertiary.critical.text` | `#980b29` |
| `buttonN.tertiary.critical.icon` | `#980b29` |
| `buttonN.tertiary.inverse.text` | `#ffffff` |
| `buttonN.tertiary.inverse.icon` | `#f5f7fa` |
| `buttonN.buttonBase.text.neutral` | `#2e3a47` |
| `buttonN.buttonBase.text.critical` | `#800d25` |
| `buttonN.buttonBase.text.success` | `#244c38` |
| `buttonN.buttonBase.text.info` | `#194673` |
| `buttonN.buttonBase.text.warning` | `#784213` |
| `buttonN.buttonBase.text.discovery` | `#5e4d27` |
| `buttonN.buttonBase.text.recur` | `#2a174f` |
| `buttonN.buttonBase.icon.neutral` | `#2e3a47` |
| `buttonN.buttonBase.icon.critical` | `#980b29` |
| `buttonN.buttonBase.icon.success` | `#275e43` |
| `buttonN.buttonBase.icon.info` | `#21588f` |
| `buttonN.buttonBase.icon.warning` | `#8e4d14` |
| `buttonN.buttonBase.icon.discovery` | `#72623e` |
| `buttonN.buttonBase.icon.recur` | `#3b2566` |

### Icon Buttons (`iconButtonN`)

| Token | Hex |
|---|---|
| `iconButtonN.primary.neutral.background` | `#36485c` |
| `iconButtonN.primary.neutral.icon` | `#f5f7fa` |
| `iconButtonN.primary.critical.background` | `#af2645` |
| `iconButtonN.primary.critical.icon` | `#f5f7fa` |
| `iconButtonN.primary.inverse.background` | `#f5f7fa` |
| `iconButtonN.primary.inverse.icon` | `#36485c` |
| `iconButtonN.secondary.neutral.border` | `#212933` |
| `iconButtonN.secondary.neutral.icon` | `#36485c` |
| `iconButtonN.secondary.critical.border` | `#af2645` |
| `iconButtonN.secondary.critical.icon` | `#980b29` |
| `iconButtonN.secondary.inverse.border` | `#f5f7fa` |
| `iconButtonN.secondary.inverse.icon` | `#f5f7fa` |
| `iconButtonN.tertiary.neutral.icon` | `#36485c` |
| `iconButtonN.tertiary.inverse.icon` | `#f5f7fa` |

### Pills (`pillN`)

| Token | Hex |
|---|---|
| `pillN.neutral.background` | `#e6edf5` |
| `pillN.neutral.text` | `#36485c` |
| `pillN.critical.background` | `#f0c4cd` |
| `pillN.critical.text` | `#980b29` |
| `pillN.success.background` | `#d1e0d9` |
| `pillN.success.text` | `#275e43` |
| `pillN.info.background` | `#c0d8f0` |
| `pillN.info.text` | `#21588f` |
| `pillN.warning.background` | `#f3d8c0` |
| `pillN.warning.text` | `#8e4d14` |
| `pillN.discovery.background` | `#e9e1ce` |
| `pillN.discovery.text` | `#72623e` |
| `pillN.recur.background` | `#d7cee9` |
| `pillN.recur.text` | `#3b2566` |

### Status Indicators (`statusN`)

| Token | Hex |
|---|---|
| `statusN.neutral.background` | `#e6edf5` |
| `statusN.neutral.icon` | `#36485c` |
| `statusN.neutral.text` | `#2e3a47` |
| `statusN.critical.background` | `#f0c4cd` |
| `statusN.critical.icon` | `#980b29` |
| `statusN.critical.text` | `#800d25` |
| `statusN.success.background` | `#d1e0d9` |
| `statusN.success.icon` | `#275e43` |
| `statusN.success.text` | `#244c38` |
| `statusN.info.background` | `#c0d8f0` |
| `statusN.info.icon` | `#21588f` |
| `statusN.info.text` | `#194673` |
| `statusN.warning.background` | `#f3d8c0` |
| `statusN.warning.icon` | `#8e4d14` |
| `statusN.warning.text` | `#784213` |

### Messages (`messageN`)

| Token | Hex |
|---|---|
| `messageN.neutral.background` | `#e6edf5` |
| `messageN.neutral.textBody` | `#475a70` |
| `messageN.neutral.textHeading` | `#2e3a47` |
| `messageN.critical.background` | `#f0c4cd` |
| `messageN.success.background` | `#d1e0d9` |
| `messageN.info.background` | `#c0d8f0` |
| `messageN.warning.background` | `#f3d8c0` |

### Boxes (`boxN`)

| Token | Hex |
|---|---|
| `boxN.neutral.background` | `#f5f7fa` |
| `boxN.neutral.border` | `#b8c6d6` |
| `boxN.alternate.background` | `#ffffff` |
| `boxN.alternate.border` | `#b8c6d6` |
| `boxN.discovery.background` | `#f6f1e5` |
| `boxN.discovery.border` | `#9e8c61` |
| `boxN.info.background` | `#e6f1fc` |
| `boxN.info.border` | `#3971a8` |
| `boxN.recur.background` | `#f2ecfe` |
| `boxN.recur.border` | `#533e7d` |
| `boxN.success.background` | `#ebf2ef` |
| `boxN.success.border` | `#307553` |
| `boxN.warning.background` | `#fff3e8` |
| `boxN.warning.border` | `#b4631d` |
| `boxN.slot.border` | `#b8c6d6` |
| `boxN.slot.icon` | `#36485c` |
| `boxN.slot.text` | `#2e3a47` |

### Decorated Icons (`iconN`)

| Token | Hex |
|---|---|
| `iconN.neutral.background` | `#e6edf5` |
| `iconN.neutral.icon` | `#36485c` |
| `iconN.alternate.background` | `#ffffff` |
| `iconN.alternate.icon` | `#36485c` |
| `iconN.inverse.background` | `#36485c` |
| `iconN.inverse.icon` | `#f5f7fa` |
| `iconN.critical.background` | `#f0c4cd` |
| `iconN.critical.icon` | `#980b29` |
| `iconN.success.background` | `#d1e0d9` |
| `iconN.success.icon` | `#275e43` |
| `iconN.info.background` | `#c0d8f0` |
| `iconN.info.icon` | `#21588f` |
| `iconN.warning.background` | `#f3d8c0` |
| `iconN.warning.icon` | `#8e4d14` |
| `iconN.discovery.background` | `#e9e1ce` |
| `iconN.discovery.icon` | `#72623e` |
| `iconN.recur.background` | `#d7cee9` |
| `iconN.recur.icon` | `#3b2566` |
| `iconN.background` | `#e6edf5` |

### Badges (`badgeN`)

| Token | Hex |
|---|---|
| `badgeN.neutral.background` | `#212933` |
| `badgeN.neutral.text` | `#f5f7fa` |
| `badgeN.inverse.background` | `#e6edf5` |
| `badgeN.inverse.text` | `#36485c` |
| `badgeN.critical.background` | `#af2645` |
| `badgeN.critical.text` | `#f5f7fa` |
| `badgeN.success.background` | `#307553` |
| `badgeN.success.text` | `#f5f7fa` |
| `badgeN.recur.background` | `#533e7d` |
| `badgeN.recur.text` | `#f5f7fa` |

### Inputs (`inputN`)

| Token | Hex |
|---|---|
| `inputN.background` | `#ffffff` |
| `inputN.neutral.border` | `#b8c6d6` |
| `inputN.neutral.icon` | `#36485c` |
| `inputN.neutral.text` | `#36485c` |
| `inputN.critical.border` | `#af2645` |
| `inputN.critical.icon` | `#980b29` |
| `inputN.critical.text` | `#980b29` |

### Lists (`listN`)

| Token | Hex |
|---|---|
| `listN.background.default` | `#ffffff` |
| `listN.background.selected` | `#e6edf5` |
| `listN.border` | `#c8d3e0` |
| `listN.textLabel` | `#36485c` |
| `listN.textContent` | `#475a70` |

### Checkboxes (`checkboxN`)

| Token | Hex |
|---|---|
| `checkboxN.background.default` | `#ffffff` |
| `checkboxN.background.selected` | `#212933` |
| `checkboxN.border` | `#596d84` |
| `checkboxN.icon` | `#f5f7fa` |
| `checkboxN.text` | `#36485c` |

### Radios (`radioN`)

| Token | Hex |
|---|---|
| `radioN.background.default` | `#ffffff` |
| `radioN.background.selected` | `#212933` |
| `radioN.border` | `#596d84` |
| `radioN.text` | `#36485c` |

### Chips (`chipN`)

| Token | Hex |
|---|---|
| `chipN.background` | `#ffffff` |
| `chipN.border` | `#b8c6d6` |
| `chipN.icon` | `#36485c` |
| `chipN.text` | `#2e3a47` |
| `chipN.multi.background.selected` | `#c8d3e0` |
| `chipN.single.background.selected` | `#c8d3e0` |
| `chipN.single.text.selected` | `#2e3a47` |

### Sheets (`sheetN`)

| Token | Hex |
|---|---|
| `sheetN.background` | `#ffffff` |
| `sheetN.grabber.background` | `#c8d3e0` |
| `sheetN.textTitle` | `#36485c` |
| `sheetN.textSubtitle` | `#475a70` |

### Snackbars (`snackbarN`)

| Token | Hex |
|---|---|
| `snackbarN.background` | `#212933` |
| `snackbarN.textLabel` | `#ffffff` |

### Navigation Bar (`navigationBarN`)

| Token | Hex |
|---|---|
| `navigationBarN.background` | `#ffffff` |
| `navigationBarN.border` | `#c8d3e0` |
| `navigationBarN.text` | `#36485c` |
| `navigationBarN.os.icon` | `#000000` |

### Tab Navigation (`tabNavN`)

| Token | Hex |
|---|---|
| `tabNavN.background` | `#ffffff` |
| `tabNavN.active` | `#ebf2ef` |
| `tabNavN.border` | `#c8d3e0` |
| `tabNavN.text` | `#36485c` |

### Toggles (`toggleN`)

| Token | Hex |
|---|---|
| `toggleN.track.background.default` | `#307553` |
| `toggleN.track.background.disabled` | `#c8d3e0` |
| `toggleN.button.background` | `#ffffff` |
| `toggleN.text` | `#36485c` |

### Segmented Controls (`segmentedControlN`)

| Token | Hex |
|---|---|
| `segmentedControlN.background` | `#c8d3e0` |
| `segmentedControlN.button.selected` | `#ffffff` |
| `segmentedControlN.text` | `#36485c` |

### Tooltips (`tooltipN`)

| Token | Hex |
|---|---|
| `tooltipN.surface` | `#2e3a47` |
| `tooltipN.textBody` | `#f5f7fa` |
| `tooltipN.textHeading` | `#ffffff` |

### Dividers (`dividerN`)

| Token | Hex |
|---|---|
| `dividerN.border` | `#c8d3e0` |
| `dividerN.text` | `#475a70` |

### Search (`searchN`)

| Token | Hex |
|---|---|
| `searchN.background` | `#f5f7fa` |
| `searchN.icon` | `#36485c` |
| `searchN.text` | `#36485c` |

### Empty States (`emptyStateN`)

| Token | Hex |
|---|---|
| `emptyStateN.background` | `#ffffff` |
| `emptyStateN.border` | `#b8c6d6` |
| `emptyStateN.textBody` | `#36485c` |
| `emptyStateN.textHeading` | `#2e3a47` |

### Accordions (`accordionN`)

| Token | Hex |
|---|---|
| `accordionN.background` | `#ffffff` |
| `accordionN.border` | `#b8c6d6` |
| `accordionN.text` | `#36485c` |

### Avatars (`avatarN`)

| Token | Hex |
|---|---|
| `avatarN.background` | `#e6edf5` |
| `avatarN.text` | `#2e3a47` |

### Headings (`headingN`)

| Token | Hex |
|---|---|
| `headingN.background` | `#ffffff` |
| `headingN.text` | `#36485c` |

### Product Cards (`productCardN`)

| Token | Hex |
|---|---|
| `productCardN.background` | `#ffffff` |
| `productCardN.title` | `#2e3a47` |
| `productCardN.text` | `#475a70` |

### Product Images (`productImageN`)

| Token | Hex |
|---|---|
| `productImageN.background` | `#ffffff` |

### Prices (`priceN`)

| Token | Hex |
|---|---|
| `priceN.textRegular` | `#2e3a47` |
| `priceN.textDiscount` | `#275e43` |
| `priceN.textSubtle` | `#475a70` |

### Links (`linkN`)

| Token | Hex |
|---|---|
| `linkN.neutral.border` | `#596d84` |
| `linkN.neutral.text` | `#36485c` |
| `linkN.inverse.border` | `#ffffff` |
| `linkN.inverse.text` | `#f5f7fa` |
| `linkN.success.border` | `#275e43` |
| `linkN.success.text` | `#275e43` |

---

## Effects / Interaction States

### Elevation (box shadows)

| Token | Value |
|---|---|
| `effect.elevation.raised` | `0px 2px 6px 0px #36485c29` |
| `effect.elevation.overlay` | `0px 4px 16px 0px #36485c29` |
| `effect.elevation.overflow` | `0px -2px 8px 0px #36485c29` |
| `effect.elevation.overflowFade` | `#212933` |

### Overlay / Blur

| Token | Value |
|---|---|
| `effect.overlay` | `#0000001f` |
| `effect.blur.price` | `6` |

### Focus

| Token | Value |
|---|---|
| `effect.focused.border` | `#015fcc` |
| `effect.focused.stroke` | `2` |

### Skeleton

| Token | Value |
|---|---|
| `effect.skeleton.backgroundLevel0` | `#f5f7fa00` |
| `effect.skeleton.backgroundLevel1` | `#e6edf580` |
| `effect.skeleton.backgroundLevel2` | `#c8d3e0` |
| `effect.skeleton.radius` | `4` |

### Opacity States

| Token | Value |
|---|---|
| `effect.state.disabled.opacity` | `0.5` |
| `effect.state.readOnly.opacity` | `0.8` |
| `effect.state.shortPressed.opacity` | `0.7` |

### Hovered

| Token | Value |
|---|---|
| `effect.state.hovered.background` | `#00000014` |
| `effect.state.hovered.backgroundBold` | `#00000029` |
| `effect.state.hovered.border` | `#00000014` |
| `effect.state.hovered.borderBold` | `#00000047` |
| `effect.state.hovered.icon` | `#00000014` |
| `effect.state.hovered.text` | `#00000014` |
| `effect.state.hovered.inverse.background` | `#ffffff14` |
| `effect.state.hovered.inverse.backgroundBold` | `#ffffff29` |
| `effect.state.hovered.inverse.border` | `#ffffff14` |
| `effect.state.hovered.inverse.borderBold` | `#ffffff47` |
| `effect.state.hovered.inverse.icon` | `#ffffff14` |
| `effect.state.hovered.inverse.text` | `#ffffff14` |

### Pressed

| Token | Value |
|---|---|
| `effect.state.pressed.background` | `#00000029` |
| `effect.state.pressed.backgroundBold` | `#00000047` |
| `effect.state.pressed.border` | `#00000029` |
| `effect.state.pressed.borderBold` | `#000000cc` |
| `effect.state.pressed.icon` | `#00000029` |
| `effect.state.pressed.text` | `#00000029` |
| `effect.state.pressed.inverse.background` | `#ffffff29` |
| `effect.state.pressed.inverse.backgroundBold` | `#ffffff47` |
| `effect.state.pressed.inverse.border` | `#ffffff29` |
| `effect.state.pressed.inverse.borderBold` | `#ffffffcc` |
| `effect.state.pressed.inverse.icon` | `#ffffff29` |
| `effect.state.pressed.inverse.text` | `#ffffff29` |

---

## Brand

| Token | Hex |
|---|---|
| `brand.fullscript.logo.wordmark` | `#36485c` |
| `brand.apple.icon` | `#000000` |
| `brand.apple.button.border` | `#000000` |
| `brand.apple.button.fill` | `#ffffff` |
| `brand.apple.button.text` | `#000000` |
| `brand.google.icon.blue` | `#4285f4` |
| `brand.google.icon.red` | `#ea4335` |
| `brand.google.icon.yellow` | `#fbbc05` |
| `brand.google.icon.green` | `#34a853` |
| `brand.google.button.border` | `#000000` |
| `brand.google.button.fill` | `#ffffff` |
| `brand.google.button.text` | `#000000` |
| `brand.facebook.logo` | `#3c5a99` |
| `brand.linkedin.logo` | `#2867b2` |
| `brand.twitterX.logo` | `#000000` |
| `brand.emerson.gold` | `#dca270` |
| `brand.emerson.silver` | `#949494` |

(`brand.fullscript.logo.leaf` is covered by the Figma `leaf` token.)

---

## Smart (AI Features)

| Token | Hex |
|---|---|
| `smart.backgroundBold1` | `#7495b9` |
| `smart.backgroundBold2` | `#4d7199` |
| `smart.backgroundBold3` | `#2e5988` |

---

## Asset Palette

Nine-stop scales for illustrations, charts, and decorative assets. Not for UI components.

### Grey

| Stop | Hex |
|---|---|
| 100 | `#fcfeff` |
| 200 | `#f5f7fa` |
| 300 | `#e6edf5` |
| 400 | `#9eb1c7` |
| 500 | `#596d84` |
| 600 | `#475a70` |
| 700 | `#36485c` |
| 800 | `#2e3a47` |
| 900 | `#212933` |

### Green

| Stop | Hex |
|---|---|
| 100 | `#fafffc` |
| 200 | `#ebf2ef` |
| 300 | `#d1e0d9` |
| 400 | `#b6cfc2` |
| 500 | `#86b09b` |
| 600 | `#307553` |
| 700 | `#275e43` |
| 800 | `#244c38` |
| 900 | `#0f3d26` |

### Blue

| Stop | Hex |
|---|---|
| 100 | `#f5faff` |
| 200 | `#e6f1fc` |
| 300 | `#c0d8f0` |
| 400 | `#88b1d9` |
| 500 | `#5d96cf` |
| 600 | `#3971a8` |
| 700 | `#21588f` |
| 800 | `#194673` |
| 900 | `#143657` |

### Orange

| Stop | Hex |
|---|---|
| 100 | `#fffaf5` |
| 200 | `#fff3e8` |
| 300 | `#f3d8c0` |
| 400 | `#e7b88f` |
| 500 | `#cf8545` |
| 600 | `#b4631d` |
| 700 | `#8e4d14` |
| 800 | `#784213` |
| 900 | `#693a11` |

### Purple

| Stop | Hex |
|---|---|
| 100 | `#fcfaff` |
| 200 | `#f2ecfe` |
| 300 | `#d7cee9` |
| 400 | `#b9abd5` |
| 500 | `#8471ab` |
| 600 | `#533e7d` |
| 700 | `#3b2566` |
| 800 | `#2a174f` |
| 900 | `#17043e` |

### Red

| Stop | Hex |
|---|---|
| 100 | `#fff7f9` |
| 200 | `#feeef2` |
| 300 | `#f0c4cd` |
| 400 | `#e296a6` |
| 500 | `#c6516a` |
| 600 | `#af2645` |
| 700 | `#980b29` |
| 800 | `#800d25` |
| 900 | `#68182a` |

### Sand

| Stop | Hex |
|---|---|
| 100 | `#ffffff` |
| 200 | `#f6f1e5` |
| 300 | `#e9e1ce` |
| 400 | `#d9cdb0` |
| 500 | `#c1af86` |
| 600 | `#9e8c61` |
| 700 | `#72623e` |
| 800 | `#5e4d27` |
| 900 | `#3e3114` |
