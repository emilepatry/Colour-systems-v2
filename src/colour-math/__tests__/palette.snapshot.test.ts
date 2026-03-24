import { describe, test, expect, beforeAll } from 'vitest'
import { generatePalette, type PaletteInput, type PaletteOutput } from '../index'

const canonicalInput: PaletteInput = {
  hues: [
    { name: 'red', H: 25 },
    { name: 'orange', H: 55 },
    { name: 'yellow', H: 90 },
    { name: 'green', H: 145 },
    { name: 'teal', H: 195 },
    { name: 'blue', H: 265 },
    { name: 'purple', H: 305 },
    { name: 'pink', H: 350 },
  ],
  numLevels: 10,
  compliance: 'AA',
  lightnessCurve: [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17],
  chromaStrategy: 'max_per_hue',
  neutralHue: null,
}

describe('palette snapshot', () => {
  let palette: PaletteOutput

  beforeAll(() => {
    palette = generatePalette(canonicalInput)
  })

  test('canonical palette (8 hues, 10 levels, AA, max_per_hue) matches snapshot', () => {
    expect(palette).toMatchSnapshot()
  })

  describe('partial verification (doc 05 example values)', () => {
    test('blue level 0 has correct OKLCH inputs', () => {
      expect(palette.scales.blue[0].oklch.L).toBe(0.97)
      expect(palette.scales.blue[0].oklch.H).toBe(265)
    })

    test('blue level 0 OKLCH chroma is max_chroma at L=0.97, H=265', () => {
      expect(palette.scales.blue[0].oklch.C).toBeGreaterThan(0)
      expect(palette.scales.blue[0].oklch.C).toBeLessThan(0.05)
    })

    test('blue level 0 relative luminance ≈ 0.918', () => {
      expect(palette.scales.blue[0].relativeLuminance).toBeCloseTo(0.918, 1)
    })

    test('neutral level 0 hex is a near-white grey', () => {
      expect(palette.scales.neutral[0].oklch.L).toBe(0.97)
      expect(palette.scales.neutral[0].oklch.C).toBe(0)
    })

    test('neutral level 0 relative luminance ≈ 0.913', () => {
      expect(palette.scales.neutral[0].relativeLuminance).toBeCloseTo(0.913, 1)
    })

    test('neutral chroma is 0 when neutral_hue is null', () => {
      for (const entry of palette.scales.neutral) {
        expect(entry.oklch.C).toBe(0)
      }
    })
  })
})
