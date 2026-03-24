---
tags: [WCAG, contrast-ratio, relative-luminance, accessibility, APCA, AA, AAA]
purpose: Canonical reference for contrast computation and accessibility thresholds. Defines the WCAG relative luminance formula, contrast ratio, compliance levels, and APCA overview.
related: [01-oklch-colour-model.md, 04-scale-design.md]
---

# Contrast and Compliance

> **When to use this file:** Refer here when you need to compute contrast ratios, check WCAG compliance for a colour pair, or understand the relationship between relative luminance and OKLCH lightness.

## Relative Luminance

Relative luminance (Y) measures perceived brightness on a 0–1 scale. It is computed from sRGB values using linearised channels.

**Linearise each sRGB channel** using the decode formula in [01-oklch-colour-model.md](01-oklch-colour-model.md), then compute:

```
Y = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin
```

The weights reflect the eye's spectral sensitivity — green contributes ~10x more to perceived brightness than blue.

## Contrast Ratio

Given two colours with relative luminances Y1 and Y2:

```
L_lighter = max(Y1, Y2)
L_darker  = min(Y1, Y2)

contrast_ratio = (L_lighter + 0.05) / (L_darker + 0.05)
```

The result ranges from 1:1 (identical) to 21:1 (black on white). The 0.05 offset accounts for ambient light reflection.

## WCAG 2.x Thresholds

### Level AA (minimum standard)

| Element | Minimum contrast |
|---|---|
| Normal text (< 18pt, or < 14pt bold) | **4.5:1** |
| Large text (≥ 18pt, or ≥ 14pt bold) | **3.0:1** |
| UI components and graphical objects | **3.0:1** |

### Level AAA (enhanced)

| Element | Minimum contrast |
|---|---|
| Normal text | **7.0:1** |
| Large text | **4.5:1** |

Target AA at minimum. AAA is ideal for body text. 3.0:1 suffices for icons, borders, and large headings.

## Relative Luminance vs OKLCH Lightness

These are related but distinct. Confusing them causes errors.

| Property | Relative Luminance (Y) | OKLCH Lightness (L) |
|---|---|---|
| Defined by | WCAG / CIE XYZ | OKLAB colour space |
| Range | 0–1 | 0–1 |
| Perceptually uniform? | No | Yes |
| Used for | WCAG contrast calculation | Palette design, visual consistency |

The approximate relationship: `L_oklab ≈ cbrt(Y)`. Middle grey (Y ≈ 0.18) maps to L ≈ 0.56.

**Use Y** when computing WCAG contrast ratios (non-negotiable for compliance). **Use L** when designing scales and choosing visually balanced colours. Design in OKLCH, validate against WCAG luminance.

## Quick Estimation (Not for Compliance)

For rapid iteration, rough heuristics:

| OKLCH L difference | Approximate WCAG contrast | Suitable for |
|---|---|---|
| < 0.15 | < 2:1 | Decorative only |
| 0.15–0.30 | 2:1–3:1 | Large decorative text |
| 0.30–0.40 | 3:1–4.5:1 | Large text, icons, UI components |
| > 0.40 | > 4.5:1 | Body text (AA) |
| > 0.55 | > 7:1 | Body text (AAA) |

Always validate with the WCAG formula before shipping.

## Decision Rules for Checking Colour Pairs

### From hex values

```
Input: colour_a (hex), colour_b (hex), element_type

1. Parse hex to sRGB (0-255), linearise each channel
2. Compute Y_a = 0.2126*R + 0.7152*G + 0.0722*B
3. Repeat for Y_b
4. contrast_ratio = (max(Y_a, Y_b) + 0.05) / (min(Y_a, Y_b) + 0.05)
5. Compare:
   - "text":         pass if >= 4.5
   - "large_text":   pass if >= 3.0
   - "ui_component": pass if >= 3.0
```

### From OKLCH values

You **cannot** determine WCAG compliance from OKLCH values alone. Convert to sRGB first, then compute relative luminance. OKLCH L is not a substitute for Y in the contrast formula.

```
Input: oklch_a (L, C, H), oklch_b (L, C, H)

1. Convert each OKLCH → OKLAB → Linear RGB → sRGB
2. Check gamut (see 03-gamut-mapping.md)
3. Compute relative luminance for both
4. Compute contrast ratio as above
```

## APCA Overview

The Accessible Perceptual Contrast Algorithm (APCA) is the contrast method for WCAG 3.0 (currently draft, not yet a W3C Recommendation).

Key differences from WCAG 2.x: APCA is **asymmetric** (dark-on-light differs from light-on-dark), **font-size-aware** (contrast requirements scale continuously with size and weight), and **polarity-sensitive** (light text on dark backgrounds needs different contrast than the reverse).

APCA outputs a Lightness Contrast value (Lc) instead of a ratio. Reference thresholds:

| Font size | Weight 400 | Weight 700 |
|---|---|---|
| 14px | Lc 90 | Lc 75 |
| 16px | Lc 80 | Lc 60 |
| 24px | Lc 60 | Lc 45 |
| 48px+ | Lc 45 | Lc 35 |

**Recommendation:** Validate against WCAG 2.x for compliance. Use APCA as a supplementary check, especially for dark mode and font-size-specific tuning.
