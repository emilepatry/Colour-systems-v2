# Colour Systems v2

Knowledge base and component library for an OKLCH-native colour palette tool. Contains colour theory documentation, Poline palette-generation research, design frameworks, legacy token audits, UI prototypes, and project planning.

This is not a runnable app — it is the foundation a design tool will be built from.

---

## Directory Map

### `docs/`

OKLCH colour theory library covering the colour model, contrast compliance, gamut mapping, scale design, generation algorithms, and token intent. Seven files numbered `00` through `06`, with a keyword-routing [index](docs/00-index.md) and glossary. Start here for any colour science question.

### `poline/`

Reverse-engineered documentation of the [Poline](https://meodai.github.io/poline/) palette generator. `THEORY.md` covers the polar coordinate model, interpolation engine, easing functions, and the `Poline` class API. `VISUALIZATION.md` covers the picker web component — CSS wheel rendering, SVG layers, drag interaction, and events. Reference material for how an existing colour tool works and visualises interpolation.

### `planning/`

Product and engineering specs for the Colour System Visualizer — what we are building. `BRIEF.md` defines the vision, three-engine architecture, UX, and phased delivery. `BRIEF-INTENT-OPTIMIZER.md` details the constraint solver's intent taxonomy, drift budgets, and infeasibility reporting. `OKLCH-COORDINATE-MAPPING.md` and `OKLCH-COORDINATE-RENDERING.md` spec the adaptation of Poline's coordinate system to OKLCH. `engine-coherence-model.md` defines the Engine A / Engine B handoff contract and state ownership.

### `frameworks/`

Design thinking frameworks for structured solutioning. Covers behavioural psychology (`Psych-BIAS`), motivation/ability/prompt analysis (`Behavior-MAP`), journey mapping, six-panel story narratives (`6P-Story`), stakeholder communication and ethics, and onboarding (split across principles, models, and tactics). These frameworks inform how the tool's UX is designed and evaluated.

### `legacy tokens/`

Audit of the DS5 / Heron colour token system — the starting point we are migrating away from. `CORE_COLOUR_TOKENS.md` maps 34 Figma theme tokens to their codebase equivalents with match/mismatch status. `EXTENDED_COLOUR_TOKENS.md` and `EXTENDED_COMPONENT_TOKENS.md` catalogue the remaining DS5 tokens (semantic, accent, component, effect, brand). These files are historical reference, not OKLCH-native.

### `components/`

Twenty component prototypes from [Devouring Details](https://buildui.com/) (Rauno Freiberg). Each folder is a self-contained React + Framer Motion bundle with `source.tsx`, `system.css`, shared fonts, and a boilerplate `README.md`. These are interaction-pattern references for the build phase — spring physics, gesture hints, rubber banding, interpolation, morph surfaces, and more. They are not colour-system components.

### `.cursor/commands/`

Cursor workflow commands for design review, code polish, accessibility audits, animation, and other development tasks. Used during the build phase.

---

## Conventions

- **OKLCH-first.** All new colour work uses OKLCH. Existing HSL/hex values are migrated over time.
- **1k–3k words per file.** Markdown files are kept within this range to stay LLM-friendly (~1k–4k tokens).
- **`.cursorrules`** at the repo root provides AI context: project description, design principles, aesthetic direction, and accessibility requirements.
