---
tags: [intent, optimizer, layering, interaction-graph, constraints, anchoring]
purpose: Defines token intent taxonomy, cross-group interaction modeling, and constraint-based optimization rules. Prevents destructive optimizations like shifting white backgrounds to grey.
related: [02-contrast-compliance.md, 04-scale-design.md, 05-generation-algorithm.md]
---

# Token Intent & Interaction-Aware Optimization

> **When to use this file:** Refer here when optimizing token values for contrast compliance, vibrancy, or accessibility — to understand which tokens may be adjusted, how far, and why some must remain unchanged.

## The White-to-Grey Problem

A naive optimizer adjusting for contrast treats every token as a free variable. If `neutral.backgroundLevel0 = #ffffff` fails a contrast check against a border colour, the optimizer might darken it to `#e8e8e8`. The result is technically compliant — but the designer's intent was a **white** page surface, and it now looks grey.

The same problem appears in reverse: darkening a tinted background (`info.backgroundLevel1 = #e6f1fc`) to meet contrast against a border can strip its blue tint, making it indistinguishable from the neutral background.

The fix is not better maths — it is **knowing what each token is for**.

## Intent Taxonomy

Every token slot carries an implicit purpose. The optimizer must respect this purpose when deciding whether and how to adjust a value.

| Intent | Description | Adjustment policy |
|---|---|---|
| **anchor** | Immutable values: pure white, pure black, brand colours | Never modify. If a pairing involving an anchor fails, adjust the *other* token. |
| **surface** | Page/section/card backgrounds that should remain near-white (or near-black in inverse) | Minimal drift. Keep within a tight lightness band. Prefer adjusting the foreground token instead. |
| **container** | Tinted component backgrounds (backgroundLevel1, backgroundLevel2) | Moderate drift allowed, but must preserve the tint — chroma and hue should not collapse to grey. |
| **foreground** | Text, icons — contrast-driven tokens | Largest allowed drift. These are the primary lever for meeting contrast requirements. |
| **decorative** | Borders, dividers — visual structure, not content | Moderate drift. Lower contrast threshold (3:1 instead of 4.5:1). |
| **emphasis** | backgroundBold, base — the key colour of a status/accent group | Moderate drift. Hue must not shift. This token defines the group's visual identity. |

## Lightness Bands

Each intent defines a range of OKLCH lightness values the token must stay within. This prevents category drift (a "light tint" becoming a "medium shade").

The bands below apply to **light mode**. Dark mode requires a parallel set of bands where surface, container, foreground, decorative, and emphasis ranges shift to reflect the inverted lightness curve. See [planning/DARK-MODE.md § Dark Mode Intent Bands](../planning/DARK-MODE.md#2-dark-mode-intent-bands) for the full mode-dependent table and derivation methodology.

| Intent | Lightness band (OKLCH L) | Max drift | Hue locked | Chroma locked |
|---|---|---|---|---|
| anchor | — (frozen) | 0 | yes | yes |
| surface (light) | 0.92 – 1.00 | 0.03 | no | if achromatic |
| surface (dark, inverse) | 0.10 – 0.22 | 0.03 | no | if achromatic |
| container | 0.75 – 0.94 | 0.10 | no | if achromatic |
| foreground | 0.15 – 0.55 | 0.20 | no | if achromatic |
| decorative | 0.40 – 0.85 | 0.15 | no | if achromatic |
| emphasis | 0.30 – 0.65 | 0.12 | yes | if achromatic |

**Max drift** is the maximum OKLCH L shift from the original value. If a token starts at L = 0.93 with max drift 0.03, it can move to 0.90 – 0.96, but is also clamped to its lightness band, so the effective range is 0.92 – 0.96.

**Hue locked** means the H component must not change. This applies to anchors (frozen entirely) and emphasis tokens (whose hue defines the status/accent group identity).

**Chroma locked** means the C component must not change. This is set automatically when a token's original OKLCH chroma is below the achromatic threshold (C < 0.04). See "Achromatic Tokens" below.

## Inferring Intent

Intent is inferred from a combination of the slot name and the token's current value:

1. If the hex value is `#ffffff` or `#000000` → **anchor**.
2. If the slot is `base` or the token name contains `backgroundBold` → **emphasis**.
3. If the slot is `text`, `textBold`, or `icon` → **foreground**.
4. If the slot is `border` → **decorative**.
5. If the slot is `background`:
   - L > 0.92 → **surface**
   - L ≤ 0.92 → **container**
6. If the slot is `backgroundLevel2` → **container**.
7. Tokens belonging to the brand group → **anchor** (regardless of slot).

Override rules for specific groups:

- **Inverse** group: `background` has intent `surface` but uses the dark band (0.10 – 0.22).
- **Brand** group: all tokens are anchors.

## Achromatic Tokens

A token is **achromatic** when its OKLCH chroma is below 0.04. At this level, the colour is perceived as a neutral grey — any hue angle OKLCH reports is essentially noise. A typical neutral grey ramp (100–900) falls entirely in this range, with chroma values between approximately 0.01 and 0.03.

The optimizer sets `chromaLocked: true` on any token whose original chroma is below this threshold. This prevents two problems:

1. **Vibrancy injection.** When vibrancy > 50, `applyVibrancy` scales chroma toward `maxChroma(L, H)`. For a near-zero-chroma token, this formula would introduce visible colour from an arbitrary hue angle — e.g., a neutral border `#B8C6D6` drifting toward visible blue.

2. **Tint collapse ambiguity.** Without the flag, reducing vibrancy on a tinted container (e.g., `info.backgroundLevel2 = #C0D8F0`, C ≈ 0.05) would desaturate it past the threshold, and subsequent vibrancy increases could no longer restore the tint because the token would now be classified as achromatic.

The threshold of 0.04 was chosen to cover typical neutral grey ramps while leaving clearly tinted tokens (status backgrounds at C ≈ 0.05–0.08) unaffected. The classification is based on the token's **original imported value**, not its current optimized value.

A safety net also exists directly in `applyVibrancy`: if the current chroma is below the threshold, the function returns the hex unchanged regardless of whether intent metadata is available. This protects tokens that pass through vibrancy without an `IntentMap` (e.g., preview rendering).

## The Interaction Graph

A colour token does not exist in isolation. It must meet contrast requirements against every other token it will be rendered alongside. The optimizer must know these pairings.

### Sources of interactions

**1. Intra-group pairings**

Within a single semantic group, foreground tokens appear on the group's own backgrounds:

- `text` on `background`
- `textBold` on `background`
- `icon` on `backgroundLevel2`
- `text` on `backgroundLevel2`
- `textBold` on `backgroundLevel2`
- `border` on `background` (3:1 threshold)

**2. Cross-group on surface**

Most semantic groups' light backgrounds sit on a page surface (white or `surface.level1`). Status text often appears directly on these surfaces too:

- Every group's `text` on `__white` (4.5:1)
- Every group's `base` on `__white` (4.5:1)
- Every group's `border` on `__white` (3:1)
- Neutral `text` on every status group's `backgroundLevel1` (4.5:1)

These pairings are **mode-dependent**. In dark mode, `__white` is replaced by the dark page surface anchor (`__black` or the dark curve's level 0). The pairing structure is identical but the surface reference changes. See [planning/DARK-MODE.md § Interaction Graph Adaptation](../planning/DARK-MODE.md#4-interaction-graph-adaptation) for the full specification.

### Future: User-Defined Component Pairings

Real-world UI components often create token pairings that cross group boundaries — a badge renders foreground text from the neutral group on a `backgroundBold` fill from a status group; a tooltip places body text on an inverse surface. These component-derived pairings are a third potential edge source in the interaction graph.

For the initial release, component-derived pairings are **out of scope**. The intra-group and cross-group edge sources above already produce a comprehensive constraint graph covering the most common contrast relationships. Adding component-derived edges would require either hard-coding pairings from a specific design system (coupling the tool to that system's token structure) or building a definition UI for arbitrary pairings (significant complexity for a Phase 4+ feature).

When this capability is added, pairings should be **imported rather than hand-configured** — a JSON schema where the user provides their component token mappings (or imports from a Style Dictionary / Figma file) is more tractable than a bespoke pairing editor. The existing `ContrastEdge` interface already supports arbitrary token pairings, so the solver requires no structural changes to accept user-defined edges.

## Optimization Priority Rules

When a pairing fails its contrast threshold, the optimizer must decide **which token to adjust**. The rules, in priority order:

1. **Never adjust an anchor.** If `white` is one side of a failing pair, adjust the other side.
2. **Prefer adjusting foreground over background.** Text and icons have the widest allowed drift and are designed to be contrast-driven.
3. **Prefer adjusting the token with the wider remaining drift budget.** If a foreground token has already been shifted 0.18 of its 0.20 max drift, and a decorative token has only used 0.02 of its 0.15, adjust the decorative token.
4. **Never push a token outside its lightness band.** If adjustment would breach the band, stop at the band boundary and flag the pairing as infeasible.
5. **Skip vibrancy adjustments for surface and anchor tokens.** Applying chroma to a white background or a brand colour defeats their purpose.

## Infeasibility Reporting

When the optimizer cannot satisfy a contrast requirement without violating intent constraints, it reports the pairing as **infeasible** rather than silently breaking intent. The report includes:

- The failing pairing (foreground group/slot, background group/slot)
- The achieved contrast ratio
- The required threshold
- Which constraint blocked further adjustment (band boundary, max drift, anchor freeze)
- A suggested resolution (e.g., "consider widening the lightness band for `container` tokens" or "choose a darker base colour for this group")

## Vibrancy and Intent

The vibrancy slider scales chroma. Intent constrains which tokens participate:

| Intent | Vibrancy participation |
|---|---|
| anchor | Never — frozen |
| surface | Never — should remain near-neutral |
| container | Yes — tint intensity scales with vibrancy |
| foreground | Yes — text/icon colour richness scales |
| decorative | Yes — border colour richness scales |
| emphasis | Yes — this is the primary target of vibrancy |
| *any* (achromatic) | Never — `chromaLocked` overrides all of the above |

When vibrancy is applied to a container token, the minimum chroma is clamped to 0.005 so the tint never fully desaturates to grey. This clamp is skipped for achromatic containers (`chromaLocked: true`) so that greyscale backgrounds do not acquire a tint.
