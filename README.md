# Colour Systems v2

An OKLCH-native colour system tool that generates accessible, perceptually uniform palettes through direct manipulation. Drag anchor points on a colour wheel to materialise complete, WCAG-validated token systems in real time.

V1 is shipped. See [V2-PRODUCT.md](planning/V2-PRODUCT.md) for the roadmap.

---

## Quick Start

```bash
npm install
npm run dev
```

---

## Architecture

Three engines run in sequence inside a Zustand store's `computeDerived`:

| Engine | Purpose | Location |
|---|---|---|
| **A** | Poline-adapted polar interpolation — draggable anchors, per-axis easing, hue/vibrancy handoff | `src/engine-a/` |
| **B** | OKLCH scale generation — lightness curve, gamut boundary, chroma strategy, WCAG contrast validation | `src/colour-math/` |
| **C** | Intent optimizer — intent classification, interaction graph, constraint solver, drift budgets, infeasibility reporting | `src/engine-c/` |

Light and dark pipelines run in parallel. Export produces CSS custom properties and JSON.

---

## Directory Map

### `src/`

Application source. Components, engines, colour math, state management, hooks, and utilities.

### `docs/`

OKLCH colour theory library — colour model, contrast compliance, gamut mapping, scale design, generation algorithms, and token intent. Seven files numbered `00`–`06` with a keyword-routing [index](docs/00-index.md).

### `misc/`

Source-of-truth design system docs referenced by [V2-PRODUCT.md](planning/V2-PRODUCT.md) — token architecture, shadcn semantic tokens, surface/text colour rules, dark mode strategy, component state colours, and the production readiness checklist. Also includes Apple colour system docs for future iOS export (Phase 8).

### `frameworks/`

UX design frameworks referenced by V2 — psychological biases, onboarding principles, journey mapping, and six-panel story narratives.

### `planning/`

- [V2-PRODUCT.md](planning/V2-PRODUCT.md) — V2 roadmap: Engine D (semantic mapper), export pipeline upgrade, token preview, UX polish, deployment.
- [BRIEF.md](planning/BRIEF.md) — Original product brief: vision, three-engine architecture, UX, and phased delivery.

### `_archive/`

Legacy reference material preserved for context. Not required for active development.

- `components/` — Devouring Details interaction prototypes (Rauno Freiberg). Spring physics, gesture hints, rubber banding, and other patterns referenced during the v1 build.
- `legacy-tokens/` — DS5/Heron colour token audit. Historical reference, not OKLCH-native.
- `poline/` — Reverse-engineered Poline documentation. Engine A was built from this research.
- `planning/` — V1 planning docs (intent optimizer spec, dark mode, coordinate mapping/rendering, test spec, engine coherence model). All implemented.
- `misc/` — External reference articles (BairesDev palette guides, Tailwind palette notes).
- `frameworks/` — Additional UX frameworks not directly referenced by V2 (Behavior-MAP, Communication, Onboarding Models/Tactics).

---

## Stack

Vite + React + Tailwind CSS v4 + shadcn/ui + motion/react (Framer Motion) + Zustand. Colour math is a custom OKLCH TypeScript engine — no external colour library.

## Conventions

- **OKLCH-first.** All colour work uses OKLCH. No HSL/hex in new code.
- **`.cursorrules`** at the repo root provides AI context: project description, design principles, aesthetic direction, and accessibility requirements.
