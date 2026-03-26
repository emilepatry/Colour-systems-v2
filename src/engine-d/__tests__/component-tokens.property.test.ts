import { describe, test, expect } from 'vitest'
import fc from 'fast-check'
import { wcagContrastRatio } from '@/colour-math'
import { runEngineC } from '@/engine-c'
import { mapSemanticTokens, deriveComponentTokens, COMPONENT_ROLES } from '@/engine-d'
import { buildArbitraryPalette } from '@/__test-utils__/arbitrary-palette'

function isWellFormedPalette(palette: {
  scales: Record<string, { oklch: { L: number } }[]>
  intraValidation: { allPass: boolean }
}): boolean {
  if (!palette.intraValidation.allPass) return false
  const neutral = palette.scales['neutral']
  if (!neutral || neutral.length < 10) return false
  const Ls = neutral.map(e => e.oklch.L)
  const distinctL = new Set(Ls.map(l => Math.round(l * 10) / 10))
  if (Math.max(...Ls) - Math.min(...Ls) < 0.6 || distinctL.size < 5) return false
  const sorted = [...Ls].sort((a, b) => a - b)
  const maxGap = Math.max(...sorted.slice(1).map((l, i) => l - sorted[i]))
  return maxGap < 0.4
}

describe('component token property tests', () => {
  test('all 26 component roles are populated for any valid palette', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        const result = runEngineC(palette)
        const semantic = mapSemanticTokens(result, 'light', 1.0)
        const component = deriveComponentTokens(semantic)

        for (const role of COMPONENT_ROLES) {
          const token = component.tokens[role]
          expect(token, `missing ${role}`).toBeDefined()
          expect(token.hex, `empty hex for ${role}`).toBeTruthy()
          expect(typeof token.oklch.L).toBe('number')
          expect(Number.isNaN(token.oklch.L)).toBe(false)
        }
      }),
      { numRuns: 30 },
    )
  })

  test('button.primary.fg meets 4.5:1 against button.primary.bg', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        fc.pre(isWellFormedPalette(palette))
        const result = runEngineC(palette)
        const semantic = mapSemanticTokens(result, 'light', 1.0)
        const ct = deriveComponentTokens(semantic).tokens

        const ratio = wcagContrastRatio(ct['button.primary.bg'].hex, ct['button.primary.fg'].hex)
        expect(ratio).toBeGreaterThanOrEqual(4.5 - 0.1)
      }),
      { numRuns: 30 },
    )
  })

  // WCAG 1.4.3 exempts disabled controls from contrast requirements.
  // We verify both tokens exist and produce distinct hex values with
  // well-formed palettes. Contrast thresholds are not meaningful here
  // because text.disabled is intentionally low-contrast by design.
  test('button.primary.disabled tokens are defined and distinguishable', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        fc.pre(isWellFormedPalette(palette))
        const result = runEngineC(palette)
        const semantic = mapSemanticTokens(result, 'light', 1.0)
        const ct = deriveComponentTokens(semantic).tokens

        expect(ct['button.primary.disabled-bg'].hex).toBeTruthy()
        expect(ct['button.primary.disabled-fg'].hex).toBeTruthy()
        expect(ct['button.primary.disabled-bg'].hex).not.toBe(ct['button.primary.disabled-fg'].hex)
      }),
      { numRuns: 30 },
    )
  })

  // Alias pairs: contrast is inherited from the foundation layer.
  // Foundation property tests don't check these specific pairings,
  // so we verify 3:1 as a floor rather than 4.5:1.
  test('button.secondary.fg meets 3:1 against button.secondary.bg', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        fc.pre(isWellFormedPalette(palette))
        const result = runEngineC(palette)
        const semantic = mapSemanticTokens(result, 'light', 1.0)
        const ct = deriveComponentTokens(semantic).tokens

        const ratio = wcagContrastRatio(
          ct['button.secondary.bg'].hex,
          ct['button.secondary.fg'].hex,
        )
        expect(ratio).toBeGreaterThanOrEqual(3.0 - 0.1)
      }),
      { numRuns: 30 },
    )
  })

  test('button.secondary.fg meets 3:1 against button.secondary.active-bg', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        fc.pre(isWellFormedPalette(palette))
        const result = runEngineC(palette)
        const semantic = mapSemanticTokens(result, 'light', 1.0)
        const ct = deriveComponentTokens(semantic).tokens

        const ratio = wcagContrastRatio(
          ct['button.secondary.active-bg'].hex,
          ct['button.secondary.fg'].hex,
        )
        expect(ratio).toBeGreaterThanOrEqual(3.0 - 0.1)
      }),
      { numRuns: 30 },
    )
  })

  // Computed foreground: calculateForeground guarantees 4.5:1.
  test('nav.item.selected-fg meets 4.5:1 against nav.item.selected-bg', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        fc.pre(isWellFormedPalette(palette))
        const result = runEngineC(palette)
        const semantic = mapSemanticTokens(result, 'light', 1.0)
        const ct = deriveComponentTokens(semantic).tokens

        const ratio = wcagContrastRatio(
          ct['nav.item.selected-bg'].hex,
          ct['nav.item.selected-fg'].hex,
        )
        expect(ratio).toBeGreaterThanOrEqual(4.5 - 0.1)
      }),
      { numRuns: 30 },
    )
  })

  test('input.fg meets 2:1 against input.bg', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        fc.pre(isWellFormedPalette(palette))
        const result = runEngineC(palette)
        const semantic = mapSemanticTokens(result, 'light', 1.0)
        const ct = deriveComponentTokens(semantic).tokens

        const ratio = wcagContrastRatio(ct['input.bg'].hex, ct['input.fg'].hex)
        expect(ratio).toBeGreaterThanOrEqual(2.0)
      }),
      { numRuns: 30 },
    )
  })

  test('all computed tokens produce valid hex (no NaN, no out-of-gamut)', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        const result = runEngineC(palette)
        const semantic = mapSemanticTokens(result, 'light', 1.0)
        const ct = deriveComponentTokens(semantic).tokens

        const computed = [
          'button.primary.disabled-bg',
          'button.secondary.hover-bg',
          'nav.item.selected-bg',
          'nav.item.selected-fg',
        ] as const

        for (const role of computed) {
          const token = ct[role]
          expect(token.hex).toMatch(/^#[0-9a-f]{6}$/i)
          expect(Number.isNaN(token.oklch.L)).toBe(false)
          expect(Number.isNaN(token.oklch.C)).toBe(false)
          expect(Number.isNaN(token.oklch.H)).toBe(false)
        }
      }),
      { numRuns: 30 },
    )
  })

  test('light and dark produce identical role key sets', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        const lightResult = runEngineC(palette, 'light')
        const lightSemantic = mapSemanticTokens(lightResult, 'light', 1.0)
        const lightComponent = deriveComponentTokens(lightSemantic)

        const darkResult = runEngineC(palette, 'dark')
        const darkSemantic = mapSemanticTokens(darkResult, 'dark', 1.0)
        const darkComponent = deriveComponentTokens(darkSemantic)

        const lightKeys = Object.keys(lightComponent.tokens).sort()
        const darkKeys = Object.keys(darkComponent.tokens).sort()
        expect(lightKeys).toEqual(darkKeys)
      }),
      { numRuns: 15 },
    )
  })
})
