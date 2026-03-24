# Core Colour Tokens (Figma "Heron Theme")

> These are the 34 tokens defined in the Figma Heron theme. Each is mapped to its
> codebase equivalent (DS5 token or `heronStyles` hardcode) with match status.
>
> **Legend:** MATCH = hex values are identical. MISMATCH = token concept exists but
> hex differs. NOT FOUND = no equivalent exists in the codebase.

---

## Neutrals / Text

| Figma Name | Figma Hex | DS5 / Codebase Equivalent | Codebase Hex | Status |
|---|---|---|---|---|
| `primary` | `#2B2C30` | `heronStyles.neutralDark` | `#2B2C30` | MATCH |
| `secondary` | `#484848` | — | — | NOT FOUND |
| `tertiary` | `#8C8C8B` | — | — | NOT FOUND |
| `neutralText` | `#2B2C30` | `neutral.textBold` | `#2e3a47` | MISMATCH |
| `inversePrimaryText` | `#FFFFFF` | `inverse.textBold` | `#ffffff` | MATCH |

**Notes:**

- `primary` maps exactly to `heronStyles.neutralDark`, used for tag backgrounds and explore tile text.
- `secondary` (`#484848`) does not exist anywhere in the codebase — no DS5 token, no hardcode, no style file.
- `tertiary` (`#8C8C8B`) does not exist anywhere in the codebase.
- `neutralText` shares the same hex as `primary` / `heronStyles.neutralDark`, but the DS5 neutral text token (`neutral.textBold`) is a different colour (`#2e3a47`). The codebase uses the DS5 value, not the Figma value.
- `inversePrimaryText` matches `inverse.textBold` exactly.

---

## Backgrounds / Surfaces

| Figma Name | Figma Hex | DS5 / Codebase Equivalent | Codebase Hex | Status |
|---|---|---|---|---|
| `globalBackground` | `#F0EFEC` | — | — | NOT FOUND |
| `surfaceBackground` | `#F0EFEC` | — | — | NOT FOUND |
| `cardBackground` | `#FFFFFF` | `surface.level0` / `surface.raised` | `#ffffff` | MATCH |
| `neutralBackground` | `#F0EFEC` | `neutral.backgroundLevel1` | `#f5f7fa` | MISMATCH |

**Notes:**

- `globalBackground` and `surfaceBackground` share the same warm grey (`#F0EFEC`). This hex appears only in a single test mock (`screenConfigurations.spec.tsx`) and is not a runtime token.
- `neutralBackground` uses the same warm grey, but the DS5 equivalent (`neutral.backgroundLevel1`) is a cool blue-grey (`#f5f7fa`). The codebase uses the DS5 value.
- `cardBackground` is generic white and matches.

---

## Borders / Dividers

| Figma Name | Figma Hex | DS5 / Codebase Equivalent | Codebase Hex | Status |
|---|---|---|---|---|
| `divider` | `#EAE7E7` | `heronStyles.borderBase` | `#EAE7E7` | MATCH |
| `dropdownStroke` | `#D8D6CE` | — | — | NOT FOUND |

**Notes:**

- `divider` maps exactly to `heronStyles.borderBase`, used in `PurchaseOptionSelector.styles.ts` and similar border contexts.
- `dropdownStroke` (`#D8D6CE`) does not exist anywhere in the codebase. The DS5 neutral border (`#b8c6d6`) is a different colour.

---

## Semantic Status — Bold

These are meant to represent the "strong" / "filled" variant of each status colour.

| Figma Name | Figma Hex | DS5 / Codebase Equivalent | Codebase Hex | Status |
|---|---|---|---|---|
| `critical` | `#A54A42` | `critical.backgroundBold` | `#af2645` | MISMATCH |
| `success` | `#307553` | `success.backgroundBold` | `#307553` | MATCH |
| `info` | `#305775` | `info.backgroundBold` | `#3971a8` | MISMATCH |
| `warning` | `#A55F23` | `warning.backgroundBold` | `#8e4d14` | MISMATCH |
| `discover` | `#756430` | `discovery.backgroundBold` | `#9e8c61` | MISMATCH |
| `recur` | `#5B4780` | `recur.backgroundBold` | `#533e7d` | MISMATCH |

**Notes:**

- Only `success` matches. The other five bold status colours are all different hex values between Figma and the DS5 tokens that the codebase actually uses at runtime.

---

## Semantic Status — Text

| Figma Name | Figma Hex | DS5 / Codebase Equivalent | Codebase Hex | Status |
|---|---|---|---|---|
| `criticalText` | `#94374B` | `critical.text` | `#980b29` | MISMATCH |
| `successText` | `#3B5E4D` | `success.text` | `#275e43` | MISMATCH |
| `infoText` | `#395776` | `info.text` | `#21588f` | MISMATCH |
| `warningText` | `#954601` | `warning.text` | `#8e4d14` | MISMATCH |
| `discoverText` | `#705A29` | `discovery.text` | `#72623e` | MISMATCH |
| `recurText` | `#5B4A7C` | `recur.text` | `#3b2566` | MISMATCH |

**Notes:**

- Every semantic text colour is a mismatch. None of these Figma hex values appear anywhere in the codebase. The codebase uses the DS5 token values exclusively.

---

## Semantic Status — Backgrounds

| Figma Name | Figma Hex | DS5 / Codebase Equivalent | Codebase Hex | Status |
|---|---|---|---|---|
| `criticalBackground` | `#F0C4CD` | `critical.backgroundLevel2` | `#f0c4cd` | MATCH |
| `successBackground` | `#D1E0D9` | `success.backgroundLevel2` | `#d1e0d9` | MATCH |
| `infoBackground` | `#C0D8F0` | `info.backgroundLevel2` | `#c0d8f0` | MATCH |
| `warningBackground` | `#F3D8C0` | `warning.backgroundLevel2` | `#f3d8c0` | MATCH |
| `discoverBackground` | `#E9E1CE` | `discovery.backgroundLevel2` | `#e9e1ce` | MATCH |
| `recurBackground` | `#D7CEE9` | `recur.backgroundLevel2` | `#d7cee9` | MATCH |

**Notes:**

- All six background tokens match exactly. These map to the DS5 `backgroundLevel2` slot in each category, used for pills, status indicators, messages, and icon backgrounds.

---

## Badge

| Figma Name | Figma Hex | DS5 / Codebase Equivalent | Codebase Hex | Status |
|---|---|---|---|---|
| `badgeBackground` | `#D0655B` | `badgeN.critical.background` | `#af2645` | MISMATCH |

**Notes:**

- The Figma badge colour is a salmon/coral (`#D0655B`), while the DS5 critical badge background is a deeper red (`#af2645`). This hex does not appear anywhere in the codebase.

---

## Brand

| Figma Name | Figma Hex | DS5 / Codebase Equivalent | Codebase Hex | Status |
|---|---|---|---|---|
| `leaf` | `#88B04B` | `brand.fullscript.logo.leaf` | `#88b04b` | MATCH |

**Notes:**

- Exact match. Used as the default colour in `FSLogoIcon`, sign-in screens, onboarding cards, and the Android adaptive icon foreground.

---

## Radii

| Figma Name | Figma Value | Codebase Equivalent | Codebase Value | Status |
|---|---|---|---|---|
| `baseRadius` | `16` | `heronStyles.borderRadius` | `16` | MATCH |
| `sheetRadius` | `24` | — | — | NOT FOUND |

**Notes:**

- `baseRadius` matches `heronStyles.borderRadius` exactly; propagated to ~67 style files via `borderRadius.base`.
- `sheetRadius` is not defined as a named token in the codebase. Sheet corner radius is controlled internally by `@fullscript/aviary-native`.

---

## Summary

| Status | Count | Tokens |
|---|---|---|
| MATCH | 14 | `primary`, `cardBackground`, `inversePrimaryText`, `divider`, `success`, `criticalBackground`, `successBackground`, `infoBackground`, `warningBackground`, `discoverBackground`, `recurBackground`, `leaf`, `baseRadius` |
| MISMATCH | 14 | `neutralText`, `neutralBackground`, `critical`, `info`, `warning`, `discover`, `recur`, `criticalText`, `successText`, `infoText`, `warningText`, `discoverText`, `recurText`, `badgeBackground` |
| NOT FOUND | 6 | `secondary`, `tertiary`, `globalBackground`, `surfaceBackground`, `dropdownStroke`, `sheetRadius` |
