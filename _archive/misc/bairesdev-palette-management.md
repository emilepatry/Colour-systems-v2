# BairesDev Palette App — management, migration, and workflows

> How BairesDev's Palette App handles palette organisation, import/export, legacy-to-current mapping, and the two primary end-to-end workflows.

## Palette list management

The app manages **multiple palettes** as a first-class concept, not just a single palette at a time.

- **CAPABILITY:** Add, delete, and rename palettes from a sidebar list. Mark any palette as legacy with the **L** action, which moves it into a separate Legacy section.
- **NOTE:** The current/legacy split supports two modes of work:

| Mode | Purpose |
|---|---|
| Active system-building | Designing the palette you want to use now |
| Migration / reference | Preserving older palettes for comparison, audit, or mapping |

This is a strong signal that the app is designed for **design-system cleanup and migration**, not just palette creation.

## Import and export

| Direction | Format | Purpose |
|---|---|---|
| Import | JSON | Round-trippable palette data |
| Export | JSON | Round-trippable palette data |
| Export | CSS | Implementation handoff / developer use |
| Export | Plain HEX | Lightweight sharing, audit lists, copy/paste |

- **LIMITATION:** The exact JSON schema, CSS output format (variables, classes, or other), and whether import performs validation or normalisation are not publicly documented.

## Palette mapping

This is one of the most practically valuable capabilities in the tool. It turns a palette from a design artefact into a **migration target**.

### How it works

1. Import legacy colors.
2. The app matches them to the most similar shades in the current palette.
3. Review which old colors map cleanly.
4. Identify legacy colors that are too far from any existing swatch.
5. Add or refine shades where the new palette lacks coverage.

### Questions it answers

- Which old UI colors can be absorbed into the new system?
- Which legacy values have no good equivalent yet?
- Where is the new palette missing a step?
- Which legacy colors are effectively duplicates of an existing swatch?

- **LIMITATION:** The exact similarity metric, color space used for matching, threshold for "too far off," and whether mapping is one-to-one, many-to-one, or threshold-based are all undisclosed.

## Workflows

### Workflow A — Build a new UI palette

1. Create a new palette.
2. Remove the default swatches.
3. Add a base color as HEX.
4. Build out 8-10 ordered shades.
5. Edit outlier swatches with HSV/RGB/HEX.
6. Refine the overall ramp using H/S/V curve handles.
7. Interpolate to smooth uneven middle steps.
8. Check contrast against dark and light text.
9. Adjust brightness, saturation, or hue until the scale is coherent and usable.
10. Export as JSON, CSS, or plain HEX.

### Workflow B — Rationalise an older color system

1. Build or import the new palette.
2. Keep the old palette in Legacy.
3. Import legacy colors.
4. Run palette mapping.
5. Review which old colors map cleanly to the new palette.
6. Identify legacy colors too far from any existing swatch.
7. Add or refine shades where the new palette lacks coverage.
8. Export the revised system for implementation.

## What makes this tool different

Most lightweight palette generators do one of: generate random combinations, create color-wheel harmonies, extract colors from an image, or output a handful of static swatches.

This tool is different because it emphasises:

- **Ordered UI scales** rather than unordered swatch boards
- **Curve-based H/S/V progression control** rather than per-swatch-only editing
- **Palette maintenance** (current vs legacy, rename, organise)
- **Built-in contrast checking** against dark and light text
- **Legacy-to-new palette mapping** for migration and rationalisation

That makes it more useful for design systems, product UI, and token rationalisation than for loose visual exploration.

## Evidence grades

| Claim | Grade |
|---|---|
| You can add, delete, rename, and mark palettes as legacy | Public |
| Legacy palettes move to a Legacy section in the sidebar | Public |
| Import accepts JSON; export supports JSON, CSS, and plain HEX | Public |
| Mapping matches legacy colors to the closest current palette colors | Public |
| Mapping highlights mismatches and gaps | Public |
| The editor is best used in landscape / desktop mode | Public |
| The current/legacy split is intended for migration workflows | Strong inference |
| Mapping is designed for design-system cleanup | Strong inference |
| Exact JSON schema, CSS output format, import validation | Unknown |
| Exact similarity metric, color space, and threshold for mapping | Unknown |
| Persistence/storage, undo/redo, keyboard shortcuts | Unknown |

## Bottom line

BairesDev's Palette App is a UI-focused palette editor that lets you construct an ordered set of swatches, edit individual colors numerically, shape the palette's hue/saturation/value progression with draggable curve handles, smooth transitions through interpolation, evaluate contrast against light and dark text, organise palettes into current and legacy groups, export/import palette data, and map older colors to the closest colors in a newer system.

The exact internal math behind interpolation, contrast scoring, and color matching is not publicly disclosed.

## Sources

- [BairesDev Palette App — how-to page](https://www.bairesdev.com/tools/color-palette-app/)
- [BairesDev Palette App — editor](https://www.bairesdev.com/tools/color-palette-app/editor/)
