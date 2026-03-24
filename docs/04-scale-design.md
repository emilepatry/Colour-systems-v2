---
tags: [colour-scale, palette, Stripe, lightness-curve, level-distance, contrast-guarantee, OKLCH]
purpose: Methodology for building colour scales with structural contrast guarantees. Defines the lightness curve, level-distance rules, per-hue process, and validation approach.
related: [02-contrast-compliance.md, 03-gamut-mapping.md, 05-generation-algorithm.md]
---

# Scale Design

> **When to use this file:** Refer here when designing a colour scale (ordered steps from light to dark for a given hue), defining a target lightness curve, or understanding how level-distance contrast guarantees work. For the step-by-step generation algorithm, see [05-generation-algorithm.md](05-generation-algorithm.md).

## What Is a Colour Scale?

A colour scale is an ordered sequence of colour values for a single hue, from lightest to darkest. Each position is a **level**. Common conventions:

| Convention | Levels | Examples |
|---|---|---|
| 0-based | 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 | Stripe |
| Tailwind-style | 50, 100, 200, ..., 900, 950 | Tailwind CSS, Radix |
| Material-style | 50, 100, 200, ..., 900 | Material Design |

The labelling does not affect colour science. What matters: how many levels, what lightness each targets, and whether spacing guarantees contrast compliance.

## The Stripe Insight

Stripe's core innovation: **normalise the perceptual lightness curve so all hues follow the same trajectory.**

1. Define a single target lightness curve — a mapping from each level to a target OKLCH L value.
2. For every hue, set each level's lightness to the target value.
3. Adjust chroma to stay within the sRGB gamut at each (L, H) pair.

The result: at any given level, all hues appear equally light. Contrast between any two levels is predictable regardless of hue.

## Level-Distance Contrast Guarantees

When the lightness curve is carefully designed, structural rules eliminate per-pair checking:

### 10-Level Scale (Stripe Rules)

| Min level distance | Guaranteed contrast | Suitable for |
|---|---|---|
| 5 levels apart | ≥ 4.5:1 | WCAG AA normal text |
| 4 levels apart | ≥ 3.0:1 | WCAG AA large text / icons |

**Examples:** Level 0 bg + level 5 text → AA normal text. Level 0 bg + level 9 text → AAA. Level 1 bg + level 5 text → large text / icons.

### Cross-Hue Combinations

These rules work across hues (e.g., blue text on light yellow background) because contrast depends primarily on lightness, and all hues share the same L at each level. Build a margin of ≥ 0.5 contrast ratio points into the curve to absorb the small discrepancy between OKLCH L and WCAG relative luminance.

### Other Scale Sizes

| Scale size | Levels for 4.5:1 (AA text) | Levels for 3.0:1 (large text) |
|---|---|---|
| 10 steps | 5 apart | 4 apart |
| 11 steps (Tailwind) | 5–6 apart | 4–5 apart |
| 5 steps (minimal) | 3 apart | 2 apart |

## Designing the Target Lightness Curve

The lightness curve maps each level to an OKLCH L value. This is the most important design decision in the system.

### Anchor Points (10-Level)

| Level | Purpose | Typical OKLCH L |
|---|---|---|
| 0 (lightest) | Tinted background, highlight | 0.97 |
| 1 | Subtle background, hover state | 0.93 |
| 2 | Visible border, subtle element | 0.87 |
| 3 | Medium border, muted element | 0.78 |
| 4 | — | 0.68 |
| 5 | Default icon colour, large text | 0.56 |
| 6 | Default body text colour | 0.45 |
| 7 | Emphasised text | 0.36 |
| 8 | Strong emphasis | 0.27 |
| 9 (darkest) | Near-black, maximum contrast | 0.17 |

### Constraints (All Must Hold Simultaneously)

1. **Contrast compliance** — L drop between level N and N+5 must produce ≥ 4.5:1 after sRGB conversion.
2. **Gamut feasibility** — Every (L, H) pair must have at least one sRGB-representable colour. See [03-gamut-mapping.md](03-gamut-mapping.md).
3. **Perceptual spacing** — Minimum L difference of ~0.06 between adjacent levels to remain visually distinguishable.
4. **Endpoint anchoring** — Level 0 should be L ≥ 0.95 (light enough for backgrounds). Level 9 should be L ≤ 0.20 (dark enough for strong contrast).

### Interpolation

Once anchors are set, fill intermediate values via:

- **Linear interpolation** — simple, may cluster too tightly at one end
- **Easing curves** — ease-in-out distributes perceptual change more evenly
- **Manual adjustment** — fine-tune individual levels to hit specific contrast targets

For 10 levels, manual adjustment is practical. For 11+ levels, a parametric curve is more manageable.

### Validating the Curve

1. For each pair 5 levels apart (0↔5, 1↔6, 2↔7, 3↔8, 4↔9), convert to sRGB and compute WCAG contrast ratio. All must be ≥ 4.5.
2. Repeat for pairs 4 apart, confirming ≥ 3.0.
3. Check that level 0 is visibly distinct from white but light enough for backgrounds.

## Per-Hue Process

Once the target lightness curve is defined, process each hue independently:

1. **Set L** from the target lightness curve for each level.
2. **Find maximum in-gamut chroma** at each (L, H) pair using the binary search in [03-gamut-mapping.md](03-gamut-mapping.md).
3. **Cap chroma** per the chosen strategy (max per hue, or uniform — see [05-generation-algorithm.md](05-generation-algorithm.md)).
4. **Convert to sRGB** hex via [01-oklch-colour-model.md](01-oklch-colour-model.md).
5. **Validate contrast** on the final hex values using the WCAG formula in [02-contrast-compliance.md](02-contrast-compliance.md).

## Threading the Needle

Some hues have severely limited gamut at certain lightness levels. The lightness curve must thread a path where *every* hue has enough chroma to be recognisable at *every* level. In practice, mid-range lightness is where gamut constraints bite hardest. Some hues may sacrifice chroma at specific levels to maintain the uniform curve. See [03-gamut-mapping.md](03-gamut-mapping.md) for per-hue chroma limits.

## Practical Example: 10-Step Blue Scale

Target hue: H = 265° (blue in OKLCH).

| Level | Target L | Max C at (L, 265°) | Chosen C | Hex (approx.) |
|---|---|---|---|---|
| 0 | 0.97 | 0.032 | 0.030 | `#EBF0FF` |
| 1 | 0.93 | 0.060 | 0.055 | `#D4E0FF` |
| 2 | 0.87 | 0.095 | 0.085 | `#B4C8FF` |
| 3 | 0.78 | 0.140 | 0.120 | `#8AA8FF` |
| 4 | 0.68 | 0.175 | 0.150 | `#6088F0` |
| 5 | 0.56 | 0.190 | 0.170 | `#3A64D8` |
| 6 | 0.45 | 0.180 | 0.160 | `#2548B8` |
| 7 | 0.36 | 0.160 | 0.145 | `#183298` |
| 8 | 0.27 | 0.130 | 0.120 | `#0E2078` |
| 9 | 0.17 | 0.090 | 0.080 | `#061058` |

Hex values are approximate. Exact values require precise conversion and gamut clamping.

## Pitfalls

**Always validate contrast on final hex values, not OKLCH L approximations.** Chroma contributes slightly to relative luminance. A vivid red at L=0.56 has a different relative luminance than a grey at the same L. After chroma reduction during gamut mapping, luminance shifts again. Build a margin of ≥ 0.5 contrast ratio points into the curve.

**Store OKLCH coordinates alongside hex in design tokens.** Hex values are opaque — you cannot reason about lightness, chroma, or hue without converting back. Storing both enables regeneration and auditing without lossy round-trips.

**Do not rely on browser gamut mapping for deterministic palettes.** The CSS gamut mapping algorithm is browser-dependent. For design tokens, compute gamut mapping server-side using the binary search method and emit clamped hex values.
