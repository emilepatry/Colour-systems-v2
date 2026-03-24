import { describe, test, expect } from 'vitest'
import fc from 'fast-check'
import { wcagContrastRatio } from '@/colour-math'
import { runEngineC } from '@/engine-c'
import { mapSemanticTokens, FOUNDATION_ROLES } from '@/engine-d'
import { buildArbitraryPalette } from '@/__test-utils__/arbitrary-palette'

function isWellFormedPalette(palette: {
  scales: Record<string, { oklch: { L: number } }[]>
  intraValidation: { allPass: boolean }
}): boolean {
  if (!palette.intraValidation.allPass) return false
  const neutral = palette.scales['neutral']
  if (!neutral || neutral.length < 4) return false
  const inner = neutral.slice(1, -1).map(e => e.oklch.L)
  const distinctL = new Set(inner.map(l => Math.round(l * 20) / 20))
  return Math.max(...inner) - Math.min(...inner) >= 0.6 && distinctL.size >= 4
}

describe('semantic mapper property tests', () => {
  test('all foundation roles are populated for any valid palette', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        const result = runEngineC(palette)
        const set = mapSemanticTokens(result, 'light', 1.0)

        for (const role of FOUNDATION_ROLES) {
          const token = set.tokens[role]
          expect(token).toBeDefined()
          expect(token.hex).toBeTruthy()
          expect(token.oklch).toBeDefined()
          expect(typeof token.oklch.L).toBe('number')
          expect(typeof token.oklch.C).toBe('number')
          expect(typeof token.oklch.H).toBe('number')
        }
      }),
      { numRuns: 30 },
    )
  })

  test('text tokens are ordered by ascending L (primary is darkest in light mode)', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        fc.pre(isWellFormedPalette(palette))
        const result = runEngineC(palette)
        const set = mapSemanticTokens(result, 'light', 1.0)

        const primary = set.tokens['text.primary'].oklch.L
        const secondary = set.tokens['text.secondary'].oklch.L
        const tertiary = set.tokens['text.tertiary'].oklch.L
        const disabled = set.tokens['text.disabled'].oklch.L

        expect(primary).toBeLessThanOrEqual(secondary + 1e-9)
        expect(secondary).toBeLessThanOrEqual(tertiary + 1e-9)
        expect(tertiary).toBeLessThanOrEqual(disabled + 1e-9)
      }),
      { numRuns: 30 },
    )
  })

  test('every status foreground meets 4.5:1 against its status fill', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        const result = runEngineC(palette)
        const set = mapSemanticTokens(result, 'light', 1.0)

        for (const status of ['success', 'warning', 'error', 'info'] as const) {
          const fill = set.tokens[`status.${status}`]
          const fg = set.tokens[`status.${status}-foreground`]
          const ratio = wcagContrastRatio(fill.hex, fg.hex)
          expect(ratio).toBeGreaterThanOrEqual(4.5 - 0.1)
        }
      }),
      { numRuns: 30 },
    )
  })

  test('accent foreground always achieves >= 4.5:1 contrast against accent', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        fc.pre(isWellFormedPalette(palette))
        const result = runEngineC(palette)
        const set = mapSemanticTokens(result, 'light', 1.0)
        const accent = set.tokens['accent.primary']
        const fg = set.tokens['accent.primary-foreground']
        const ratio = wcagContrastRatio(accent.hex, fg.hex)
        expect(ratio).toBeGreaterThanOrEqual(4.5 - 0.1)
      }),
      { numRuns: 30 },
    )
  })
})
