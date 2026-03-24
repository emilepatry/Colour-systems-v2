import { describe, test, expect } from 'vitest'
import { generatePalette, type PaletteOutput } from '@/colour-math'
import { runEngineC } from '@/engine-c'
import { mapSemanticTokens, type SemanticTokenSet } from '@/engine-d'
import { exportAsTokenJSON } from '@/lib/export'

function makeFixtures(): { palette: PaletteOutput; light: SemanticTokenSet; dark: SemanticTokenSet } {
  const palette = generatePalette({
    hues: [
      { name: 'hue-0', H: 25 },
      { name: 'hue-1', H: 145 },
    ],
    numLevels: 10,
    compliance: 'AA',
    lightnessCurve: [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17],
    chromaStrategy: 'max_per_hue',
    neutralHue: null,
  })
  const lightResult = runEngineC(palette, 'light')
  const darkResult = runEngineC(palette, 'dark')
  const light = mapSemanticTokens(lightResult, 'light', 1.0)
  const dark = mapSemanticTokens(darkResult, 'dark', 1.0)
  return { palette, light, dark }
}

describe('exportAsTokenJSON', () => {
  const { palette, light, dark } = makeFixtures()
  const output = exportAsTokenJSON(palette, light, dark)

  test('produces valid JSON', () => {
    expect(() => JSON.parse(output)).not.toThrow()
  })

  test('contains all four top-level keys', () => {
    const parsed = JSON.parse(output)
    expect(parsed).toHaveProperty('meta')
    expect(parsed).toHaveProperty('palette')
    expect(parsed).toHaveProperty('semantic')
    expect(parsed).toHaveProperty('component')
  })

  test('meta contains compliance and hue count', () => {
    const parsed = JSON.parse(output)
    expect(parsed.meta.compliance).toBe('AA')
    expect(parsed.meta.numHues).toBe(2)
    expect(parsed.meta.numLevels).toBe(10)
  })

  test('palette layer contains all scale keys', () => {
    const parsed = JSON.parse(output)
    expect(parsed.palette).toHaveProperty('hue-0')
    expect(parsed.palette).toHaveProperty('hue-1')
    expect(parsed.palette).toHaveProperty('neutral')
  })

  test('semantic layer contains light and dark sub-objects', () => {
    const parsed = JSON.parse(output)
    expect(parsed.semantic).toHaveProperty('light')
    expect(parsed.semantic).toHaveProperty('dark')
  })

  test('semantic token entries have hex and oklch fields', () => {
    const parsed = JSON.parse(output)
    const lightTokens = parsed.semantic.light
    expect(lightTokens['background.canvas']).toBeDefined()
    expect(lightTokens['background.canvas'].hex).toMatch(/^#/)
    expect(lightTokens['background.canvas'].oklch).toMatch(/^oklch\(/)
  })

  test('dark semantic tokens are populated', () => {
    const parsed = JSON.parse(output)
    const darkTokens = parsed.semantic.dark
    expect(darkTokens['background.canvas']).toBeDefined()
    expect(darkTokens['text.primary']).toBeDefined()
  })

  test('component layer is empty object', () => {
    const parsed = JSON.parse(output)
    expect(parsed.component).toEqual({})
  })
})
