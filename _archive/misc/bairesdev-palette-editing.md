# BairesDev Palette App — editing model

> How BairesDev's Palette App structures palette editing: swatch-level numeric entry, H/S/V curve shaping, handle-based interpolation, and built-in contrast checking.

## What the tool is

BairesDev's Palette App is a **systematic palette editor**, not a random palette generator. It is designed for building ordered UI color scales, shaping how hue, saturation, and value progress across a swatch set, smoothing transitions via interpolation, and checking contrast for accessibility.

## Mental model

| Concept | Definition |
|---|---|
| **Palette** | A named collection of color swatches, managed as a list in a sidebar |
| **Swatch** | A single color inside a palette — can be added, removed, selected, and edited directly |
| **Ordered progression** | Swatches are treated as an ordered sequence (typically a tonal scale), not an unordered board |
| **H / S / V curves** | Separate editable progressions for hue, saturation, and value across the swatch set |
| **Handles** | Interactive control points on each curve — can be toggled visible, selected, and used as interpolation targets |
| **Current vs Legacy** | Palettes are categorised as active (current) or archived (legacy) for migration workflows |

BairesDev recommends creating **8-10 shades** per palette with relatively consistent hue, increasing brightness as colors get lighter, and decreasing saturation as colors get lighter.

## Observable controls

The live editor exposes: Add Swatch, H, S, V, Toggle Handles, Interpolate, Map Palettes, Import Palettes, Export Palettes, Current Palettes, Light mode, and sidebar +/- controls. The editor is optimised for landscape/desktop use.

## Swatch editing

### Direct numeric entry

- **CAPABILITY:** Each swatch can be edited through HSV, RGB, or HEX values. Changes apply immediately.
- **NOTE:** This makes the tool suitable for matching brand colors, tuning a specific scale step, or correcting a single swatch without rebuilding the whole palette.

### Two layers of control

The tool provides two complementary editing modes:

| Layer | What you control | Scope |
|---|---|---|
| Direct-edit | One swatch's exact numeric values (HSV/RGB/HEX) | Single swatch |
| System-shape | H/S/V curves that govern the progression across the entire palette | All swatches |

This dual-layer model is what makes the tool useful for creating UI scales that feel coherent rather than manually assembled.

## H / S / V curve controls

After defining swatches, you refine the palette by adjusting hue, saturation, and value curves and dragging handles to shape how colors transition.

- **CAPABILITY:** Three independent curves let you control how hue shifts, how saturation rises or falls, and how brightness rises or falls across the scale.
- **NOTE:** The tool is not only storing color values per swatch — it is defining the relationship between swatches along three separate dimensions.

## Handles

- **CAPABILITY:** Each H/S/V curve has visible control points (handles) that can be toggled on/off, selected individually, and used as targets for interpolation.
- **LIMITATION:** The public docs do not disclose whether each handle maps 1:1 to a swatch, whether there are additional bezier-like control points, or how multi-selection mechanics work in detail.

## Interpolation

Interpolation is a **middle-step smoothing action**. It does not create a palette from nothing.

### How it works

1. Select two or more handles on a curve.
2. Click Interpolate.
3. The intermediate handles automatically reposition for a smoother progression.

### When it is useful

- Endpoints are correct but middle steps feel uneven
- Brightness or saturation has unwanted bumps
- You want a cleaner tonal ramp without editing each swatch manually

### What is not publicly documented

The exact interpolation formula, whether it is linear in HSV space, whether it is curve-aware or piecewise, and whether it differs for H vs S vs V are all undisclosed.

## Contrast checking

- **CAPABILITY:** The app evaluates each swatch against dark text and light text at various font sizes. The intended workflow loop is: create/edit a swatch, check contrast, adjust brightness/saturation/hue if the pairing is poor, repeat.
- **LIMITATION:** The exact contrast formula, threshold system, whether it uses WCAG scoring, and the font-size breakpoints are not publicly exposed.

## Evidence grades

| Claim | Grade |
|---|---|
| The app is a palette editor for UI designers | Public |
| Swatches can be added, deleted, selected, and edited via HSV/RGB/HEX | Public |
| H/S/V curves shape the progression across the swatch set | Public |
| Handles are draggable control points on the curves | Public |
| Interpolation smooths intermediate handles between selected endpoints | Public |
| Contrast is checked against dark and light text at multiple sizes | Public |
| The palette is treated as an ordered ramp, not an unordered board | Strong inference |
| Curves act as system-level controls over the swatch sequence | Strong inference |
| Interpolation recalculates intermediates rather than averaging a single pair | Strong inference |
| Exact interpolation math, contrast formula, and handle mechanics | Unknown |

## Sources

- [BairesDev Palette App — how-to page](https://www.bairesdev.com/tools/color-palette-app/)
- [BairesDev Palette App — editor](https://www.bairesdev.com/tools/color-palette-app/editor/)
