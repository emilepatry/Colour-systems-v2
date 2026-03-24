---
tags: [implementation, algorithm, pseudocode, generation, palette, validation, output-format, JSON]
purpose: Step-by-step algorithm for generating an accessible colour palette. Includes input/output specs, pseudocode, validation, and edge case handling. Follow this file to produce a palette.
related: [01-oklch-colour-model.md, 02-contrast-compliance.md, 03-gamut-mapping.md, 04-scale-design.md]
---

# Generation Algorithm

> **When to use this file:** Follow this file step-by-step when generating an accessible colour palette. It synthesises concepts from all other files into an executable algorithm.

## Input Specification

```
Input:
    hues:             list of { name: string, H: number (0-360) }
    num_levels:       integer (e.g., 10)
    compliance:       "AA" | "AAA"
    lightness_curve:  list of L values (length = num_levels, strictly decreasing, each 0-1)
    chroma_strategy:  "max_per_hue" | "uniform_across_hues"
    neutral_hue:      optional number (0-360), or null for pure grey
```

### Example Input

```json
{
  "hues": [
    { "name": "red",    "H": 25 },
    { "name": "orange", "H": 55 },
    { "name": "yellow", "H": 90 },
    { "name": "green",  "H": 145 },
    { "name": "teal",   "H": 195 },
    { "name": "blue",   "H": 265 },
    { "name": "purple", "H": 305 },
    { "name": "pink",   "H": 350 }
  ],
  "num_levels": 10,
  "compliance": "AA",
  "lightness_curve": [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17],
  "chroma_strategy": "max_per_hue",
  "neutral_hue": null
}
```

## Algorithm Overview

```
1. Validate inputs
2. For each hue: find max chromas, apply chroma strategy, convert to sRGB
3. Generate neutral scale
4. Validate contrast for all required level-distance pairs
5. Output the palette
```

## Step 1: Validate Inputs

```
function validate_inputs(input):
    assert len(lightness_curve) == num_levels
    assert lightness_curve is strictly decreasing
    assert all L values in (0, 1)
    assert all H values in [0, 360)
    assert num_levels >= 3

    if compliance == "AA":
        text_threshold = 4.5
        large_text_threshold = 3.0
    else if compliance == "AAA":
        text_threshold = 7.0
        large_text_threshold = 4.5
```

## Step 2: Generate Colour Scales

### 2a: Find Maximum In-Gamut Chroma

For each hue at each level, find the highest chroma producing a valid sRGB colour using `max_chroma(L, H)` from [03-gamut-mapping.md](03-gamut-mapping.md).

```
function find_max_chromas(hues, lightness_curve):
    max_chromas = {}
    for each hue in hues:
        max_chromas[hue.name] = []
        for each L in lightness_curve:
            C_max = max_chroma(L, hue.H)
            max_chromas[hue.name].append(C_max)
    return max_chromas
```

### 2b: Apply Chroma Strategy

**max_per_hue** — each hue uses its maximum in-gamut chroma. Maximises vibrancy; some hues will appear more vivid than others.

```
function apply_max_per_hue(max_chromas):
    return max_chromas
```

**uniform_across_hues** — at each level, cap all hues to the minimum max-chroma. Ensures consistent visual weight at the cost of vibrancy.

```
function apply_uniform(max_chromas, num_levels):
    chosen = {}
    for level_idx in range(num_levels):
        min_C = min(max_chromas[hue][level_idx] for hue in max_chromas)
        for hue_name in max_chromas:
            chosen.setdefault(hue_name, []).append(min_C)
    return chosen
```

A practical hybrid: use the 25th percentile instead of strict minimum, reducing only the outlier hues.

### 2c: Convert to sRGB

```
function generate_scale(hue, lightness_curve, chosen_chromas):
    scale = []
    for level_idx in range(num_levels):
        L = lightness_curve[level_idx]
        C = chosen_chromas[hue.name][level_idx]
        H = hue.H

        r, g, b = oklch_to_srgb(L, C, H)
        r, g, b = clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1)
        hex = rgb_to_hex(r, g, b)

        scale.append({ "level": level_idx, "oklch": { "L": L, "C": C, "H": H }, "hex": hex })
    return scale
```

For conversion formulas, see [01-oklch-colour-model.md](01-oklch-colour-model.md).

## Step 3: Generate Neutral Scale

```
function generate_neutral_scale(lightness_curve, neutral_hue):
    scale = []
    for level_idx in range(num_levels):
        L = lightness_curve[level_idx]
        C = 0 if neutral_hue is None else 0.005
        H = 0 if neutral_hue is None else neutral_hue

        hex = rgb_to_hex(*oklch_to_srgb(L, C, H))
        scale.append({ "level": level_idx, "oklch": { "L": L, "C": C, "H": H }, "hex": hex })
    return scale
```

## Step 4: Validate Contrast

Compute WCAG contrast ratios on **final hex values** for all required level-distance pairs. For the contrast formula, see [02-contrast-compliance.md](02-contrast-compliance.md).

Validation is split into three functions that map to different update frequencies during real-time interaction. See [Validation Performance](#validation-performance) for the scheduling rationale.

### 4a: Intra-Hue Validation (single scale)

Validate contrast within a single hue scale. During drag, this runs every frame for the hue whose anchor is being manipulated.

```
function validate_intra_single(hue_scale, compliance, num_levels):
    text_distance = 5 if compliance == "AA" else 6
    text_threshold = 4.5 if compliance == "AA" else 7.0

    failures = []
    for i in range(num_levels):
        for j in range(i + text_distance, num_levels):
            cr = wcag_contrast_ratio(hue_scale[i].hex, hue_scale[j].hex)
            if cr < text_threshold:
                failures.append({ "hue": hue_scale.name, "levels": [i, j],
                                  "contrast": cr, "required": text_threshold })
    return failures
```

### 4b: Intra-Hue Validation (all scales)

Validate contrast within every scale. Loops `validate_intra_single` over all hues.

```
function validate_intra_all(palette, compliance, num_levels):
    results = {}
    for each hue_scale in palette.scales:
        results[hue_scale.name] = validate_intra_single(
            hue_scale, compliance, num_levels)
    return results
```

### 4c: Cross-Hue Validation

Validate contrast across every pair of hue scales. This is the most expensive pass — O(N² × L²) where N is the number of scales and L is the number of levels.

```
function validate_cross_hue(palette, compliance, num_levels):
    text_distance = 5 if compliance == "AA" else 6
    text_threshold = 4.5 if compliance == "AA" else 7.0

    failures = []
    for each pair (hue_a, hue_b) in palette.scales:
        for i in range(num_levels):
            for j in range(num_levels):
                if abs(i - j) >= text_distance:
                    cr = wcag_contrast_ratio(hue_a[i].hex, hue_b[j].hex)
                    if cr < text_threshold:
                        failures.append({ "hue_a": hue_a.name, "level_a": i,
                                          "hue_b": hue_b.name, "level_b": j,
                                          "contrast": cr, "required": text_threshold })
    return failures
```

### Validation Performance

Each contrast ratio computation involves a hex-to-sRGB parse, sRGB linearisation (3 channels), relative luminance calculation, and the ratio formula — roughly 0.001ms each. The total cost depends on which tier is running.

**Complexity by palette size (AA compliance, distance ≥ 5, 10 levels):**

| Metric | 9 scales (default) | 13 scales (large system) |
|--------|-------------------|--------------------------|
| Intra-hue pairs per scale | 15 | 15 |
| All intra-hue checks | 9 × 15 = 135 | 13 × 15 = 195 |
| Cross-hue scale pairs C(N,2) | 36 | 78 |
| Level pairs per cross-hue pair | 30 | 30 |
| All cross-hue checks | 36 × 30 = 1,080 | 78 × 30 = 2,340 |
| **Total** | **1,215** | **2,535** |

**Tiered scheduling during drag interaction:**

| Tier | Function | Checks (9 scales) | Budget | Frequency |
|------|----------|-------------------|--------|-----------|
| 1 | `validate_intra_single` | 15 | ~0.02ms | Every frame (60fps) |
| 2 | `validate_intra_all` | 135 | ~0.15ms | Debounced at 10fps (100ms) |
| 3 | `validate_cross_hue` | 1,080 | ~1.2ms | On drag-end, or debounced at 2fps (500ms) via Web Worker |

Tier 1 gives the designer instant feedback on the strip they are actively manipulating. Tier 2 updates all other intra-hue badges at a rate that feels near-real-time. Tier 3 completes the full cross-hue picture within 500ms of stopping — run in a Web Worker so it never blocks rendering. See [OKLCH-COORDINATE-RENDERING.md § 7b](../planning/OKLCH-COORDINATE-RENDERING.md#7b-frame-budget-during-drag) for the full pipeline budget.

At rest (no drag), all three tiers run synchronously as a single pass — there is no scheduling overhead outside of interaction.

### Handling Failures

1. **Adjust lightness curve** — increase L gap between the failing levels (most common fix).
2. **Reduce chroma** at failing levels — high chroma can shift relative luminance away from OKLCH L predictions.
3. **Increase level distance** — if the curve cannot satisfy the threshold at distance 5, require distance 6 and document this constraint.

## Edge Cases

**Zero chroma at a level:** Occurs for extreme L values on certain hues (e.g., yellow at L=0.20). The colour degrades to near-grey. Flag in output metadata with `"warning": "near_neutral_chroma"`.

**Infeasible curve for one hue:** If max_chroma = 0 at a required level, adjust the curve — shift extreme levels inward (e.g., lightest from 0.97 to 0.96, darkest from 0.17 to 0.20).

**Tinted neutrals:** If using `neutral_hue`, set C = 0.003–0.008. Validate that tinted neutrals still meet contrast requirements — the slight chroma can shift relative luminance by up to 0.5%.

## Output Format

### JSON

```json
{
  "meta": {
    "generated": "2026-03-20T12:00:00Z",
    "compliance": "AA",
    "num_levels": 10,
    "lightness_curve": [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17],
    "chroma_strategy": "max_per_hue",
    "contrast_rules": {
      "text_min_distance": 5,
      "text_min_contrast": 4.5,
      "large_text_min_distance": 4,
      "large_text_min_contrast": 3.0
    }
  },
  "scales": {
    "blue": [
      {
        "level": 0,
        "hex": "#EBF0FF",
        "oklch": { "L": 0.97, "C": 0.030, "H": 265 },
        "relative_luminance": 0.918
      }
    ],
    "neutral": [
      {
        "level": 0,
        "hex": "#F7F7F7",
        "oklch": { "L": 0.97, "C": 0, "H": 0 },
        "relative_luminance": 0.913
      }
    ]
  },
  "intraValidation": {
    "all_pass": true,
    "byHue": {
      "blue": { "failures": [] },
      "neutral": { "failures": [] }
    }
  },
  "crossValidation": {
    "all_pass": true,
    "failures": []
  }
}
```

### CSS Custom Properties

```css
:root {
  --color-blue-0: #EBF0FF;
  --color-blue-1: #D4E0FF;
  --color-blue-2: #B4C8FF;
  --color-blue-3: #8AA8FF;
  --color-blue-4: #6088F0;
  --color-blue-5: #3A64D8;
  --color-blue-6: #2548B8;
  --color-blue-7: #183298;
  --color-blue-8: #0E2078;
  --color-blue-9: #061058;
}
```

## Validation Checklist

- [ ] All sRGB hex values are valid 6-digit hex
- [ ] Lightness curve is strictly decreasing
- [ ] Every hue has an entry for every level
- [ ] All level pairs at distance ≥ 5 (AA) or ≥ 6 (AAA) pass text contrast threshold
- [ ] All level pairs at distance ≥ 4 (AA) or ≥ 5 (AAA) pass large text threshold
- [ ] Cross-hue pairs at the same distances also pass
- [ ] Darkest level of every hue passes 4.5:1 against white
- [ ] No hue has near-neutral chroma at levels 3–7
- [ ] Output JSON includes OKLCH values alongside hex
- [ ] If tinted neutrals, they pass the same contrast requirements
