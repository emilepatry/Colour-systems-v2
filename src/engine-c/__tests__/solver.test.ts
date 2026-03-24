import { describe, test, expect } from 'vitest'
import { solve } from '@/engine-c/solver'
import { classifyPalette } from '@/engine-c/intent'
import { buildInteractionGraph } from '@/engine-c/graph'
import { runEngineC } from '@/engine-c'
import { NEUTRAL_SCALE_NAME } from '@/engine-c/types'
import type { ContrastEdge } from '@/engine-c/types'
import {
  generatePalette,
  wcagContrastRatio,
  maxChroma,
  oklchToHex,
  relativeLuminance,
  type ScaleEntry,
  type PaletteOutput,
} from '@/colour-math'

const DEFAULT_CURVE = [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17]

function makeDefaultPalette(): PaletteOutput {
  return generatePalette({
    hues: [
      { name: 'hue-0', H: 30 },
      { name: 'hue-1', H: 90 },
      { name: 'hue-2', H: 150 },
      { name: 'hue-3', H: 210 },
      { name: 'hue-4', H: 270 },
    ],
    numLevels: 10,
    compliance: 'AA',
    lightnessCurve: DEFAULT_CURVE,
    chromaStrategy: 'max_per_hue',
    neutralHue: null,
  })
}

function makeEntry(L: number, C: number, H: number, level: number): ScaleEntry {
  const hex = oklchToHex(L, C, H)
  return { level, hex, oklch: { L, C, H }, relativeLuminance: relativeLuminance(hex) }
}

function makePassingPalette(): { scales: Record<string, ScaleEntry[]> } {
  const scales: Record<string, ScaleEntry[]> = {
    'hue-0': [
      makeEntry(0.97, 0.10, 30, 0),
      makeEntry(0.15, 0.05, 30, 1),
    ],
  }
  return { scales }
}

function makeAdversarialPalette(): PaletteOutput {
  const curve = [0.95, 0.88, 0.82, 0.76, 0.70, 0.64, 0.58, 0.52, 0.46, 0.40]
  return generatePalette({
    hues: [
      { name: 'hue-0', H: 30 },
      { name: 'hue-1', H: 150 },
    ],
    numLevels: 10,
    compliance: 'AA',
    lightnessCurve: curve,
    chromaStrategy: 'max_per_hue',
    neutralHue: null,
  })
}

describe('solve', () => {
  test('palette where all pairs pass → zero adjustments, zero infeasible, zero regressions', () => {
    const { scales } = makePassingPalette()
    const intents = classifyPalette(scales)
    const edges = buildInteractionGraph(scales, intents)
    const result = solve(scales, edges, intents)

    expect(result.adjustments).toHaveLength(0)
    expect(result.infeasible).toHaveLength(0)
    expect(result.regressions).toHaveLength(0)
  })

  test('palette with one failing foreground-on-surface pair → at least one adjustment', () => {
    const scales: Record<string, ScaleEntry[]> = {
      'hue-0': [
        makeEntry(0.82, 0.10, 30, 0),
        makeEntry(0.68, 0.10, 30, 1),
      ],
    }
    const intents = classifyPalette(scales)
    const edges: ContrastEdge[] = [{
      darker: { scale: 'hue-0', level: 1 },
      lighter: { scale: 'hue-0', level: 0 },
      threshold: 3.0,
    }]
    const result = solve(scales, edges, intents)
    expect(result.adjustments.length).toBeGreaterThanOrEqual(1)
    expect(result.adjustments[0].adjustedL).toBeLessThan(0.68)
  })

  test('anchor tokens are never adjusted (even when in a failing pair)', () => {
    const palette = makeDefaultPalette()
    const intents = classifyPalette(palette.scales)
    const edges = buildInteractionGraph(palette.scales, intents)
    const result = solve(palette.scales, edges, intents)

    for (const adj of result.adjustments) {
      expect(intents[adj.token.scale][adj.token.level].intent).not.toBe('anchor')
    }
  })

  test('after adjustment, new hex contrast ratio ≥ threshold', () => {
    const palette = makeDefaultPalette()
    const intents = classifyPalette(palette.scales)
    const edges = buildInteractionGraph(palette.scales, intents)
    const result = solve(palette.scales, edges, intents)

    for (const edge of edges) {
      const isInfeasible = result.infeasible.some(
        inf => inf.darker.scale === edge.darker.scale && inf.darker.level === edge.darker.level
          && inf.lighter.scale === edge.lighter.scale && inf.lighter.level === edge.lighter.level,
      )
      const isRegression = result.regressions.some(
        reg => reg.darker.scale === edge.darker.scale && reg.darker.level === edge.darker.level
          && reg.lighter.scale === edge.lighter.scale && reg.lighter.level === edge.lighter.level,
      )
      if (isInfeasible || isRegression) continue

      const dHex = result.adjustedScales[edge.darker.scale][edge.darker.level].hex
      const lHex = result.adjustedScales[edge.lighter.scale][edge.lighter.level].hex
      const ratio = wcagContrastRatio(dHex, lHex)
      expect(ratio).toBeGreaterThanOrEqual(edge.threshold)
    }
  })

  test('adjusted chroma is gamut-mapped: adjustedC <= maxChroma(adjustedL, H)', () => {
    const palette = makeDefaultPalette()
    const intents = classifyPalette(palette.scales)
    const edges = buildInteractionGraph(palette.scales, intents)
    const result = solve(palette.scales, edges, intents)

    for (const adj of result.adjustments) {
      const mc = maxChroma(adj.adjustedL, palette.scales[adj.token.scale][adj.token.level].oklch.H)
      expect(adj.adjustedC).toBeLessThanOrEqual(mc + 1e-9)
    }
  })

  test('identity preservation: unadjusted tokens have identical hex, L, C, H to input', () => {
    const palette = makeDefaultPalette()
    const intents = classifyPalette(palette.scales)
    const edges = buildInteractionGraph(palette.scales, intents)
    const result = solve(palette.scales, edges, intents)

    const adjustedKeys = new Set(
      result.adjustments.map(a => `${a.token.scale}:${a.token.level}`),
    )

    for (const [name, scale] of Object.entries(palette.scales)) {
      for (let i = 0; i < scale.length; i++) {
        if (adjustedKeys.has(`${name}:${i}`)) continue
        const original = scale[i]
        const adjusted = result.adjustedScales[name][i]
        expect(adjusted.hex).toBe(original.hex)
        expect(adjusted.oklch.L).toBe(original.oklch.L)
        expect(adjusted.oklch.C).toBe(original.oklch.C)
        expect(adjusted.oklch.H).toBe(original.oklch.H)
      }
    }
  })

  test('hue preservation: adjusted tokens retain original H', () => {
    const palette = makeDefaultPalette()
    const intents = classifyPalette(palette.scales)
    const edges = buildInteractionGraph(palette.scales, intents)
    const result = solve(palette.scales, edges, intents)

    for (const adj of result.adjustments) {
      const originalH = palette.scales[adj.token.scale][adj.token.level].oklch.H
      const adjustedH = result.adjustedScales[adj.token.scale][adj.token.level].oklch.H
      expect(adjustedH).toBe(originalH)
    }
  })

  test('infeasibility report includes correct blocker type and non-empty suggestion', () => {
    const adversarial = makeAdversarialPalette()
    const intents = classifyPalette(adversarial.scales)
    const edges = buildInteractionGraph(adversarial.scales, intents)
    const result = solve(adversarial.scales, edges, intents)

    if (result.infeasible.length > 0) {
      for (const report of result.infeasible) {
        expect(['anchor_freeze', 'band_boundary', 'drift_exhausted']).toContain(report.blocker)
        expect(report.suggestion.length).toBeGreaterThan(0)
        expect(report.threshold).toBeGreaterThan(0)
      }
    }
  })
})

// ─── Integration via runEngineC ─────────────────────────────────────

describe('runEngineC', () => {
  test('default palette (5 hues, AA) → produces valid output with zero regressions', () => {
    const palette = makeDefaultPalette()
    const result = runEngineC(palette)

    expect(result.regressions).toHaveLength(0)
    expect(result.adjustedScales).toBeDefined()
    expect(Object.keys(result.adjustedScales)).toEqual(Object.keys(palette.scales))

    for (const report of result.infeasible) {
      expect(['anchor_freeze', 'band_boundary', 'drift_exhausted']).toContain(report.blocker)
      expect(report.suggestion.length).toBeGreaterThan(0)
    }
  })

  test('adversarial palette (compressed curve) → at least one adjustment or infeasibility report', () => {
    const palette = makeAdversarialPalette()
    const result = runEngineC(palette)

    const hasWork = result.adjustments.length > 0 || result.infeasible.length > 0
    expect(hasWork).toBe(true)
  })

  test('adjustment respects drift budget', () => {
    const palette = makeDefaultPalette()
    const result = runEngineC(palette)
    const intents = classifyPalette(palette.scales)

    for (const adj of result.adjustments) {
      const intent = intents[adj.token.scale][adj.token.level]
      const drift = Math.abs(adj.adjustedL - adj.originalL)
      expect(drift).toBeLessThanOrEqual(intent.maxDrift + 1e-9)
    }
  })

  test('adjustment respects band boundary', () => {
    const palette = makeDefaultPalette()
    const result = runEngineC(palette)
    const intents = classifyPalette(palette.scales)

    for (const adj of result.adjustments) {
      const intent = intents[adj.token.scale][adj.token.level]
      expect(adj.adjustedL).toBeGreaterThanOrEqual(intent.band[0] - 1e-9)
      expect(adj.adjustedL).toBeLessThanOrEqual(intent.band[1] + 1e-9)
    }
  })
})
