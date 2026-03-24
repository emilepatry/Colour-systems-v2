import { describe, test, expect } from 'vitest'
import {
  oklchToHex,
  relativeLuminance,
  maxChroma,
  assemblePalette,
  type ScaleEntry,
} from '@/colour-math'
import { runEngineC } from '@/engine-c'
import { mapSemanticTokens, FOUNDATION_ROLES } from '@/engine-d'

const DEFAULT_CURVE = [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17]

function buildTestPalette(hueAngles: number[], curve: number[] = DEFAULT_CURVE) {
  const hueScales: Record<string, ScaleEntry[]> = {}
  for (let h = 0; h < hueAngles.length; h++) {
    const H = hueAngles[h]
    hueScales[`hue-${h}`] = curve.map((L, level) => {
      const C = Math.min(0.15, maxChroma(L, H))
      const hex = oklchToHex(L, C, H)
      return { level, hex, oklch: { L, C, H }, relativeLuminance: relativeLuminance(hex) }
    })
  }
  return assemblePalette(hueScales, 'AA', curve.length, curve, 'max_per_hue', null, true)
}

describe('dual-mode tests', () => {
  const lightPalette = buildTestPalette([25, 265])
  const darkCurve = [0.17, 0.21, 0.25, 0.30, 0.38, 0.50, 0.58, 0.68, 0.78, 0.93]
  const darkPalette = buildTestPalette([25, 265], darkCurve)

  const lightResult = runEngineC(lightPalette, 'light')
  const darkResult = runEngineC(darkPalette, 'dark')

  const lightSet = mapSemanticTokens(lightResult, 'light', 1.0)
  const darkSet = mapSemanticTokens(darkResult, 'dark', 1.0)

  test('both modes produce populated token sets', () => {
    expect(Object.keys(lightSet.tokens).length).toBeGreaterThan(0)
    expect(Object.keys(darkSet.tokens).length).toBeGreaterThan(0)
  })

  test('both modes produce identical role key sets', () => {
    const lightKeys = Object.keys(lightSet.tokens).sort()
    const darkKeys = Object.keys(darkSet.tokens).sort()
    expect(lightKeys).toEqual(darkKeys)
  })

  test('dark background.canvas has lower L than light background.canvas', () => {
    const lightCanvas = lightSet.tokens['background.canvas']
    const darkCanvas = darkSet.tokens['background.canvas']
    expect(darkCanvas.oklch.L).toBeLessThan(lightCanvas.oklch.L)
  })

  test('dark text.primary has higher L than light text.primary', () => {
    const lightText = lightSet.tokens['text.primary']
    const darkText = darkSet.tokens['text.primary']
    expect(darkText.oklch.L).toBeGreaterThan(lightText.oklch.L)
  })

  test('meta.mode is set correctly', () => {
    expect(lightSet.meta.mode).toBe('light')
    expect(darkSet.meta.mode).toBe('dark')
  })

  test('all foundation roles are present in both modes', () => {
    for (const role of FOUNDATION_ROLES) {
      expect(lightSet.tokens[role]).toBeDefined()
      expect(darkSet.tokens[role]).toBeDefined()
    }
  })
})
