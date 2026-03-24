import { describe, test, expect } from 'vitest'
import fc from 'fast-check'
import { runEngineC } from '@/engine-c'
import { classifyPalette } from '@/engine-c/intent'
import { buildInteractionGraph } from '@/engine-c/graph'
import { NEUTRAL_SCALE_NAME } from '@/engine-c/types'
import { maxChroma, wcagContrastRatio } from '@/colour-math'
import { buildArbitraryPalette } from '@/__test-utils__/arbitrary-palette'

describe('solver property tests', () => {
  test('every adjustment has adjustedL within [band[0], band[1]]', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        const result = runEngineC(palette)
        const intents = classifyPalette(palette.scales)
        for (const adj of result.adjustments) {
          const intent = intents[adj.token.scale][adj.token.level]
          expect(adj.adjustedL).toBeGreaterThanOrEqual(intent.band[0] - 1e-9)
          expect(adj.adjustedL).toBeLessThanOrEqual(intent.band[1] + 1e-9)
        }
      }),
      { numRuns: 30 },
    )
  })

  test('every adjustment has |adjustedL - originalL| <= maxDrift', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        const result = runEngineC(palette)
        const intents = classifyPalette(palette.scales)
        for (const adj of result.adjustments) {
          const intent = intents[adj.token.scale][adj.token.level]
          const drift = Math.abs(adj.adjustedL - adj.originalL)
          expect(drift).toBeLessThanOrEqual(intent.maxDrift + 1e-9)
        }
      }),
      { numRuns: 30 },
    )
  })

  test('every adjustment has adjustedC <= maxChroma(adjustedL, H)', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        const result = runEngineC(palette)
        for (const adj of result.adjustments) {
          const H = palette.scales[adj.token.scale][adj.token.level].oklch.H
          const mc = maxChroma(adj.adjustedL, H)
          expect(adj.adjustedC).toBeLessThanOrEqual(mc + 1e-9)
        }
      }),
      { numRuns: 30 },
    )
  })

  test('every non-infeasible, non-regressed edge has contrast ratio ≥ threshold', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        const result = runEngineC(palette)

        const infeasibleKeys = new Set(
          result.infeasible.map(inf =>
            `${inf.darker.scale}:${inf.darker.level}|${inf.lighter.scale}:${inf.lighter.level}`,
          ),
        )
        const regressionKeys = new Set(
          result.regressions.map(reg =>
            `${reg.darker.scale}:${reg.darker.level}|${reg.lighter.scale}:${reg.lighter.level}`,
          ),
        )

        const intents = classifyPalette(palette.scales)
        const edges = buildInteractionGraph(palette.scales, intents)

        for (const edge of edges) {
          const key = `${edge.darker.scale}:${edge.darker.level}|${edge.lighter.scale}:${edge.lighter.level}`
          if (infeasibleKeys.has(key) || regressionKeys.has(key)) continue

          const dHex = result.adjustedScales[edge.darker.scale][edge.darker.level].hex
          const lHex = result.adjustedScales[edge.lighter.scale][edge.lighter.level].hex
          const ratio = wcagContrastRatio(dHex, lHex)
          expect(ratio).toBeGreaterThanOrEqual(edge.threshold - 0.01)
        }
      }),
      { numRuns: 30 },
    )
  })
})
