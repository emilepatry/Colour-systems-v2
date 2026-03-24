---
tags: [index, navigation, glossary, routing]
purpose: Entry point for the colour systems library. Routes to the correct file for any topic.
related: [01-oklch-colour-model.md, 02-contrast-compliance.md, 03-gamut-mapping.md, 04-scale-design.md, 05-generation-algorithm.md, 06-token-intent.md]
---

# Colour Systems Library — Index

> **When to use this file:** Start here to find which document covers a given topic.

## Keyword Routing Table

| Keyword / Question | File |
|---|---|
| OKLAB, OKLCH, axes, ranges, hue angles | [01-oklch-colour-model.md](01-oklch-colour-model.md) |
| sRGB linearisation, gamma decode/encode | [01-oklch-colour-model.md](01-oklch-colour-model.md) |
| Colour space conversion formulas (sRGB ↔ OKLAB ↔ OKLCH) | [01-oklch-colour-model.md](01-oklch-colour-model.md) |
| Why OKLCH, not HSL | [01-oklch-colour-model.md](01-oklch-colour-model.md) |
| WCAG contrast ratio, relative luminance | [02-contrast-compliance.md](02-contrast-compliance.md) |
| AA, AAA thresholds | [02-contrast-compliance.md](02-contrast-compliance.md) |
| APCA, WCAG 3.0 | [02-contrast-compliance.md](02-contrast-compliance.md) |
| Relative luminance vs OKLCH lightness | [02-contrast-compliance.md](02-contrast-compliance.md) |
| Check if a colour pair passes accessibility | [02-contrast-compliance.md](02-contrast-compliance.md) |
| Gamut, out of gamut, impossible colours | [03-gamut-mapping.md](03-gamut-mapping.md) |
| Maximum chroma for a given (L, H) | [03-gamut-mapping.md](03-gamut-mapping.md) |
| Gamut mapping, chroma reduction | [03-gamut-mapping.md](03-gamut-mapping.md) |
| sRGB boundary in OKLCH | [03-gamut-mapping.md](03-gamut-mapping.md) |
| Dark yellow problem, per-hue chroma limits | [03-gamut-mapping.md](03-gamut-mapping.md) |
| Colour scale, palette levels, steps | [04-scale-design.md](04-scale-design.md) |
| Stripe methodology | [04-scale-design.md](04-scale-design.md) |
| Level-distance contrast guarantees | [04-scale-design.md](04-scale-design.md) |
| Lightness curve design | [04-scale-design.md](04-scale-design.md) |
| Per-hue process, threading the needle | [04-scale-design.md](04-scale-design.md) |
| Generate a palette, implementation steps | [05-generation-algorithm.md](05-generation-algorithm.md) |
| Pseudocode, algorithm, input/output spec | [05-generation-algorithm.md](05-generation-algorithm.md) |
| Chroma strategy (max per hue, uniform) | [05-generation-algorithm.md](05-generation-algorithm.md) |
| Validation checklist | [05-generation-algorithm.md](05-generation-algorithm.md) |
| Design token output format (JSON, CSS) | [05-generation-algorithm.md](05-generation-algorithm.md) |
| Edge cases, failure handling | [05-generation-algorithm.md](05-generation-algorithm.md) |
| Token intent, anchor, surface, foreground | [06-token-intent.md](06-token-intent.md) |
| Lightness bands, max drift | [06-token-intent.md](06-token-intent.md) |
| Interaction graph, cross-group pairings | [06-token-intent.md](06-token-intent.md) |
| Optimizer constraints, infeasibility | [06-token-intent.md](06-token-intent.md) |
| White-to-grey problem | [06-token-intent.md](06-token-intent.md) |
| Vibrancy and intent | [06-token-intent.md](06-token-intent.md) |

## Glossary

| Term | Definition | File |
|---|---|---|
| **Chroma** | How colourful a colour appears. Higher = more vivid. OKLCH C axis. | [01](01-oklch-colour-model.md) |
| **Colour scale** | Ordered set of colour steps (e.g., 0–9) for a single hue, light to dark. | [04](04-scale-design.md) |
| **Contrast ratio** | Ratio of relative luminance between two colours, per WCAG. 1:1 to 21:1. | [02](02-contrast-compliance.md) |
| **Gamut** | The range of colours representable by a colour space or device. | [03](03-gamut-mapping.md) |
| **Gamut mapping** | Adjusting an out-of-gamut colour to the nearest representable colour. | [03](03-gamut-mapping.md) |
| **Hue** | The attribute distinguishing red from blue. An angle 0°–360° in OKLCH. | [01](01-oklch-colour-model.md) |
| **Level-distance rule** | Any two colours N levels apart guarantee a specific contrast threshold. | [04](04-scale-design.md) |
| **Lightness (OKLCH)** | Perceptual brightness, 0–1. Equal L values appear equally bright across hues. | [01](01-oklch-colour-model.md) |
| **OKLAB** | Perceptually uniform colour space (2020). Cartesian form: L, a, b. | [01](01-oklch-colour-model.md) |
| **OKLCH** | Cylindrical form of OKLAB: L, C, H. Preferred space for palette design. | [01](01-oklch-colour-model.md) |
| **Perceptual uniformity** | Equal numerical changes correspond to equal perceived changes. | [01](01-oklch-colour-model.md) |
| **Relative luminance** | Perceived brightness (0–1) computed from linearised sRGB. Used for WCAG contrast. | [02](02-contrast-compliance.md) |
| **sRGB** | Standard colour space for the web. All hex/RGB colours exist in sRGB. | [01](01-oklch-colour-model.md) |
| **WCAG** | Web Content Accessibility Guidelines. Defines minimum contrast ratios. | [02](02-contrast-compliance.md) |
