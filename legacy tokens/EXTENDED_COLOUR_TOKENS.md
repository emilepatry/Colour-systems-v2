# Extended Colour Tokens (DS5 — Not in Figma)

> All DS5 tokens from `@fullscript/aviary-tokens` and Heron hardcodes that are used
> in the codebase but have **no representation** in the Figma Heron theme token set.
>
> Light-mode hex values shown. Dark-mode equivalents exist in the token system.
>
> For per-component tokens, interaction states, brand, AI, and asset palettes, see [EXTENDED_COMPONENT_TOKENS.md](EXTENDED_COMPONENT_TOKENS.md).

---

## Custom Heron Hardcodes

Defined in `src/utils/heron/heronStyles.ts`. Two of the four (`neutralDark`, `borderBase`) are
covered by the Figma tokens (`primary` and `divider`). The remaining two are not:

| Token | Hex | Usage |
|---|---|---|
| `neutralLight` | `#F0F0F0` | Tag text colour (`HERON_TEXT_COLOR` in `Tag.styles.ts`) |
| `shadowColor` | `#000000` | Shadow base colour |

---

## Neutral

| Token | Hex | Role |
|---|---|---|
| `neutral.backgroundLevel0` | `#ffffff` | Page/screen base |
| `neutral.backgroundLevel1` | `#f5f7fa` | Cards, sections, subtle separation |
| `neutral.backgroundLevel2` | `#e6edf5` | Selected states, grouped content |
| `neutral.backgroundLevel3` | `#c8d3e0` | Structural fills, disabled |
| `neutral.border` | `#b8c6d6` | Standard input/card borders |
| `neutral.borderBold` | `#596d84` | Emphasized borders, checkbox outlines |
| `neutral.borderMuted` | `#f5f7fa` | Very subtle separators |
| `neutral.divider` | `#c8d3e0` | Section dividers |
| `neutral.icon` | `#36485c` | Default icon colour |
| `neutral.iconBold` | `#2e3a47` | Emphasized icons |
| `neutral.text` | `#36485c` | Body copy, standard labels |
| `neutral.textBold` | `#2e3a47` | Headings, emphasized labels |
| `neutral.textSubtle` | `#475a70` | Secondary descriptions, timestamps |

---

## Surface

| Token | Hex | Role |
|---|---|---|
| `surface.level0` | `#ffffff` | Root app background |
| `surface.level1` | `#f5f7fa` | Sheet/modal content area |
| `surface.inverse` | `#2e3a47` | Inverse surface |
| `surface.overflow` | `#ffffff` | Overflow surface |
| `surface.overlay` | `#ffffff` | Overlay surface |
| `surface.overlayBackdrop` | `#00000033` | Semi-transparent scrim behind overlays |
| `surface.overlayInverted` | `#2e3a47` | Inverted overlay surface |
| `surface.raised` | `#ffffff` | Elevated card surface |

---

## Inverse

| Token | Hex | Role |
|---|---|---|
| `inverse.backgroundBold` | `#212933` | Darkest inverse background |
| `inverse.backgroundMuted` | `#36485c` | Lighter inverse background |
| `inverse.border` | `#212933` | Border on dark backgrounds |
| `inverse.borderBold` | `#ffffff` | Bold border on dark backgrounds |
| `inverse.icon` | `#f5f7fa` | Icon on dark background |
| `inverse.iconBold` | `#ffffff` | Bold icon on dark background |
| `inverse.text` | `#f5f7fa` | Text on dark background |
| `inverse.textBold` | `#ffffff` | Emphasized text on dark background |

---

## Semantic Status

Each category has a consistent structure. The `backgroundLevel2` and `backgroundBold` slots
overlap with the Figma tokens (see `CORE_COLOUR_TOKENS.md`). The remaining slots listed here
are **not** in Figma.

### Critical

| Token | Hex |
|---|---|
| `critical.backgroundBold` | `#af2645` |
| `critical.backgroundLevel1` | `#feeef2` |
| `critical.border` | `#af2645` |
| `critical.icon` | `#980b29` |
| `critical.text` | `#980b29` |
| `critical.textBold` | `#800d25` |

### Success

| Token | Hex |
|---|---|
| `success.backgroundBold` | `#307553` |
| `success.backgroundLevel1` | `#ebf2ef` |
| `success.border` | `#307553` |
| `success.icon` | `#275e43` |
| `success.text` | `#275e43` |
| `success.textBold` | `#244c38` |

### Info

| Token | Hex |
|---|---|
| `info.backgroundBold` | `#3971a8` |
| `info.backgroundLevel1` | `#e6f1fc` |
| `info.border` | `#3971a8` |
| `info.icon` | `#21588f` |
| `info.text` | `#21588f` |
| `info.textBold` | `#194673` |

### Warning

| Token | Hex |
|---|---|
| `warning.backgroundBold` | `#8e4d14` |
| `warning.backgroundLevel1` | `#fff3e8` |
| `warning.border` | `#b4631d` |
| `warning.icon` | `#8e4d14` |
| `warning.text` | `#8e4d14` |
| `warning.textBold` | `#784213` |

### Discovery

| Token | Hex |
|---|---|
| `discovery.backgroundBold` | `#9e8c61` |
| `discovery.backgroundLevel1` | `#f6f1e5` |
| `discovery.border` | `#9e8c61` |
| `discovery.icon` | `#72623e` |
| `discovery.text` | `#72623e` |
| `discovery.textBold` | `#5e4d27` |

### Recur

| Token | Hex |
|---|---|
| `recur.backgroundBold` | `#533e7d` |
| `recur.backgroundLevel1` | `#f2ecfe` |
| `recur.border` | `#533e7d` |
| `recur.icon` | `#3b2566` |
| `recur.text` | `#3b2566` |
| `recur.textBold` | `#2a174f` |

---

## Accent Palettes

Five hue-based palettes for decorative/categorical use. No semantic meaning.

### Blue

| Token | Hex |
|---|---|
| `accent.blue.backgroundBold` | `#3971a8` |
| `accent.blue.backgroundLevel1` | `#e6f1fc` |
| `accent.blue.backgroundLevel2` | `#c0d8f0` |
| `accent.blue.border` | `#3971a8` |
| `accent.blue.icon` | `#21588f` |
| `accent.blue.text` | `#21588f` |
| `accent.blue.textBold` | `#194673` |

### Green

| Token | Hex |
|---|---|
| `accent.green.backgroundBold` | `#307553` |
| `accent.green.backgroundLevel1` | `#ebf2ef` |
| `accent.green.backgroundLevel2` | `#d1e0d9` |
| `accent.green.border` | `#275e43` |
| `accent.green.borderBold` | `#0f3d26` |
| `accent.green.icon` | `#275e43` |
| `accent.green.iconBold` | `#0f3d26` |
| `accent.green.text` | `#275e43` |
| `accent.green.textBold` | `#244c38` |

### Orange

| Token | Hex |
|---|---|
| `accent.orange.backgroundBold` | `#8e4d14` |
| `accent.orange.backgroundLevel1` | `#fff3e8` |
| `accent.orange.backgroundLevel2` | `#f3d8c0` |
| `accent.orange.border` | `#b4631d` |
| `accent.orange.icon` | `#8e4d14` |
| `accent.orange.text` | `#8e4d14` |
| `accent.orange.textBold` | `#784213` |

### Purple

| Token | Hex |
|---|---|
| `accent.purple.backgroundBold` | `#533e7d` |
| `accent.purple.backgroundLevel1` | `#f2ecfe` |
| `accent.purple.backgroundLevel2` | `#d7cee9` |
| `accent.purple.border` | `#533e7d` |
| `accent.purple.icon` | `#3b2566` |
| `accent.purple.text` | `#3b2566` |
| `accent.purple.textBold` | `#2a174f` |

### Red

| Token | Hex |
|---|---|
| `accent.red.backgroundBold` | `#af2645` |
| `accent.red.backgroundLevel1` | `#feeef2` |
| `accent.red.backgroundLevel2` | `#f0c4cd` |
| `accent.red.border` | `#af2645` |
| `accent.red.icon` | `#980b29` |
| `accent.red.text` | `#980b29` |
| `accent.red.textBold` | `#800d25` |

