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

Four engines run in sequence inside a Zustand store's `computeDerived`:

| Engine | Purpose | Location |
|---|---|---|
| **A** | Poline-adapted polar interpolation — draggable anchors, per-axis easing, hue/vibrancy handoff | `src/engine-a/` |
| **B** | OKLCH scale generation — lightness curve, gamut boundary, chroma strategy, WCAG contrast validation | `src/colour-math/` |
| **C** | Intent optimizer — intent classification, interaction graph, constraint solver, drift budgets, infeasibility reporting | `src/engine-c/` |
| **D** | Semantic mapper — intent-driven role assignment, status hue synthesis, contrast verification, component tokens | `src/engine-d/` |

Light and dark pipelines run in parallel. Export produces shadcn CSS, Tailwind palette scales, and 3-layer design token JSON.

---

## Directory Map

### `src/`

Application source. Components, four engines (A–D), colour math, state management, hooks, and utilities.

### `docs/`

OKLCH colour theory library — colour model, contrast compliance, gamut mapping, scale design, generation algorithms, and token intent. Seven files numbered `00`–`06` with a keyword-routing [index](docs/00-index.md).

### `misc/`

Source-of-truth design system docs referenced by [V2-PRODUCT.md](planning/V2-PRODUCT.md) — token architecture, shadcn semantic tokens, surface/text colour rules, dark mode strategy, component state colours, the production readiness checklist, and shadcn/Tailwind v4 validation research. Also includes Apple colour system docs for future iOS export (Phase 8).

### `frameworks/`

UX design frameworks referenced by V2 — psychological biases, onboarding principles, journey mapping, and six-panel story narratives.

### `planning/`

- [V2-PRODUCT.md](planning/V2-PRODUCT.md) — V2 roadmap: Engine D (semantic mapper), export pipeline upgrade, token preview, UX polish, deployment.
- [V1-BRIEF-shipped.md](planning/V1-BRIEF-shipped.md) — Original product brief: vision, three-engine architecture, UX, and phased delivery (historical — internal links are not maintained).

---

## Stack

Vite + React + Tailwind CSS v4 + shadcn/ui + motion/react (Framer Motion) + Zustand. Colour math is a custom OKLCH TypeScript engine — no external colour library.

## Conventions

- **OKLCH-first.** All colour work uses OKLCH. No HSL/hex in new code.
- **`.cursorrules`** at the repo root provides AI context: project description, design principles, aesthetic direction, and accessibility requirements.
