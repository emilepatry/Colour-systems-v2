---
tags: [gamut, sRGB, out-of-gamut, gamut-mapping, chroma-reduction, binary-search]
purpose: Canonical reference for sRGB gamut boundaries in OKLCH space. Defines how to find the gamut edge, how to map out-of-gamut colours back in, and per-hue chroma limits.
related: [01-oklch-colour-model.md, 04-scale-design.md, 05-generation-algorithm.md]
---

# Gamut Mapping

> **When to use this file:** Refer here when you encounter out-of-gamut colours during palette generation, need to find the maximum chroma for a given (L, H) pair, or need to choose a gamut mapping strategy.

## Why Colours Fall Out of Gamut

A **gamut** is the set of colours representable by a colour space. OKLCH can describe all colours visible to humans; sRGB covers only a subset. Many valid OKLCH triplets have no sRGB representation — converting them produces channel values below 0 or above 1.

The sRGB gamut boundary is an irregular shape in OKLCH space. The maximum achievable chroma depends on both lightness and hue:

### Chroma Limits by Hue and Lightness

| Hue | At L=0.50 (mid) | At L=0.85 (light) | At L=0.20 (dark) |
|---|---|---|---|
| Red (25°) | C ≈ 0.22 | C ≈ 0.10 | C ≈ 0.10 |
| Yellow (90°) | C ≈ 0.18 | C ≈ 0.14 | C ≈ 0.04 |
| Green (145°) | C ≈ 0.18 | C ≈ 0.13 | C ≈ 0.08 |
| Blue (265°) | C ≈ 0.19 | C ≈ 0.07 | C ≈ 0.13 |
| Purple (305°) | C ≈ 0.22 | C ≈ 0.08 | C ≈ 0.12 |

Critical patterns:

- **Maximum chroma peaks at mid-lightness** for most hues, dropping toward both extremes.
- **Different hues peak at different lightness levels.** Yellow peaks at high L; blue peaks at low L.
- **The gamut is asymmetric.** No single chroma value is safe across all hues and lightness levels.

### The "Dark Yellow" Problem

There is no deeply saturated dark yellow. At L < 0.35, what was "yellow" becomes brown or olive — maximum chroma drops near zero. This is not an sRGB limitation but a constraint of human colour perception. Similarly, "light saturated blue" is severely constrained: at L > 0.80, blue's max chroma is very low.

## Finding the Gamut Boundary (Canonical)

To determine the maximum in-gamut chroma for a given (L, H) pair:

```
function max_chroma(L, H):
    low = 0.0
    high = 0.4

    for i in range(20):
        mid = (low + high) / 2
        rgb = oklch_to_srgb(L, mid, H)

        if is_in_gamut(rgb):
            low = mid
        else:
            high = mid

    return low

function is_in_gamut(rgb):
    r, g, b = rgb
    return (0 <= r <= 1) and (0 <= g <= 1) and (0 <= b <= 1)
```

20 iterations gives precision < 0.0000004, well beyond what 8-bit sRGB output requires. For OKLCH → sRGB conversion, see [01-oklch-colour-model.md](01-oklch-colour-model.md).

## Gamut Mapping: Chroma Reduction (Canonical)

When an OKLCH colour is out of gamut, reduce chroma while keeping lightness and hue constant:

```
function map_to_gamut(L, C, H):
    C_max = max_chroma(L, H)
    return (L, min(C, C_max), H)
```

This is the only recommended strategy for palette generation because it:

- **Preserves lightness** — critical for contrast guarantees
- **Preserves hue** — the colour remains recognisably "blue" or "red"
- **Produces deterministic results** — no browser-dependent variation

Naive clipping (clamping each sRGB channel to [0, 1] independently) shifts hue, lightness, and chroma unpredictably and can break accessibility compliance. Do not use it for scale generation.

## Display P3

Display P3 offers ~25% more gamut than sRGB, especially in red-orange and green regions. Design for sRGB as the baseline; offer P3 as an enhancement with higher chroma where available. The lightness curve and contrast guarantees must hold for the sRGB version.

## Implications for Palette Generation

1. **Always check gamut before committing to a lightness curve.** A curve that works for blue may be infeasible for yellow at specific levels.
2. **Compute max chroma per (L, H) pair** before choosing chroma values. Never assume a chroma value will be in gamut.
3. **Expect lower chroma at the extremes** (very light and very dark levels). This is unavoidable.
4. **Yellow and cyan are the most constrained hues** in sRGB — narrowest usable chroma range, especially at mid-to-low lightness.
5. **Red and magenta are the least constrained** — high chroma across a wide lightness range.
