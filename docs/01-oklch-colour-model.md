---
tags: [OKLAB, OKLCH, colour-conversion, sRGB, linearisation]
purpose: Canonical reference for the OKLCH/OKLAB colour model — axis definitions, conversion formulas in both directions, and hue angle lookup. All other docs reference this file for conversion maths.
related: [02-contrast-compliance.md, 03-gamut-mapping.md]
---

# OKLCH Colour Model

> **When to use this file:** Refer here when you need OKLCH or OKLAB axis definitions, conversion formulas between sRGB and OKLAB/OKLCH, or the hue angle for a named colour.

## Why OKLCH

HSL calculates lightness as `(max(R,G,B) + min(R,G,B)) / 2` — a simple RGB average that ignores the eye's unequal sensitivity to red, green, and blue. Two colours at HSL L=50% can differ in perceived brightness by 13x (yellow vs blue). This makes it impossible to build scales with predictable contrast across hues. OKLCH is a perceptually uniform colour space where equal L values appear equally bright regardless of hue, enabling structural contrast guarantees.

## OKLAB Axes

| Axis | Name | Range | Description |
|---|---|---|---|
| L | Lightness | 0–1 | Perceptual lightness. 0 = black, 1 = white. |
| a | Green–Red | ≈ −0.4 to +0.4 | Negative = green, positive = red. |
| b | Blue–Yellow | ≈ −0.4 to +0.4 | Negative = blue, positive = yellow. |

## OKLCH Axes

OKLCH is the cylindrical form of OKLAB — same colours, more intuitive dimensions for design work.

| Axis | Name | Range | Description |
|---|---|---|---|
| L | Lightness | 0–1 | Identical to OKLAB L. |
| C | Chroma | 0–~0.4 | Colourfulness. 0 = grey. Maximum depends on hue and lightness. |
| H | Hue | 0°–360° | Hue angle. |

## sRGB Linearisation (Canonical)

All conversions from sRGB require linearisation first. This formula is the single source of truth used throughout the library.

**Decode (sRGB → linear):**

```
C_norm = C_srgb / 255

if C_norm <= 0.04045:
    C_lin = C_norm / 12.92
else:
    C_lin = ((C_norm + 0.055) / 1.055) ^ 2.4
```

**Encode (linear → sRGB):**

```
if C_lin <= 0.0031308:
    C_srgb = 12.92 * C_lin
else:
    C_srgb = 1.055 * C_lin^(1/2.4) - 0.055
```

## Conversion: sRGB → OKLAB

**Step 1: sRGB → Linear RGB** — Apply the decode formula above to each channel.

**Step 2: Linear RGB → LMS cone response**

```
l = 0.4122214708 * R_lin + 0.5363325363 * G_lin + 0.0514459929 * B_lin
m = 0.2119034982 * R_lin + 0.6806995451 * G_lin + 0.1073969566 * B_lin
s = 0.0883024619 * R_lin + 0.2817188376 * G_lin + 0.6299787005 * B_lin
```

**Step 3: LMS → OKLAB**

```
l_ = cbrt(l)
m_ = cbrt(m)
s_ = cbrt(s)

L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
b = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
```

## Conversion: OKLAB → sRGB

**Step 1: OKLAB → LMS (cube root domain)**

```
l_ = L + 0.3963377774 * a + 0.2158037573 * b
m_ = L - 0.1055613458 * a - 0.0638541728 * b
s_ = L - 0.0894841775 * a - 1.2914855480 * b
```

**Step 2: Cube**

```
l = l_ * l_ * l_
m = m_ * m_ * m_
s = s_ * s_ * s_
```

**Step 3: LMS → Linear RGB**

```
R_lin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
G_lin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
B_lin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
```

**Step 4: Linear RGB → sRGB** — Apply the encode formula from the linearisation section. If any channel falls outside 0–1, the colour is **out of gamut** (see [03-gamut-mapping.md](03-gamut-mapping.md)).

## Conversion: OKLAB ↔ OKLCH

```
OKLAB → OKLCH:
    L = L
    C = sqrt(a² + b²)
    H = atan2(b, a)    (degrees, 0–360)

OKLCH → OKLAB:
    L = L
    a = C * cos(H)     (H in radians)
    b = C * sin(H)     (H in radians)
```

## Notable OKLCH Hue Angles

| Hue name | Approximate H° | Notes |
|---|---|---|
| Red | 25° | Warm, primary red |
| Orange | 55° | |
| Yellow | 90° | Highest lightness at high chroma |
| Green | 145° | |
| Teal/Cyan | 195° | |
| Blue | 265° | Lowest lightness at high chroma |
| Purple | 305° | |
| Pink | 350° | |

These are approximate. For a specific brand colour, convert its hex value through the formulas above to get the exact hue angle.
