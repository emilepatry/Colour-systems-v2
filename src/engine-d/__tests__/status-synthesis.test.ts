import { describe, test, expect } from 'vitest'
import {
  oklchToHex,
  relativeLuminance,
  maxChroma,
  wcagContrastRatio,
  assemblePalette,
  type ScaleEntry,
} from '@/colour-math'
import { runEngineC } from '@/engine-c'
import { mapSemanticTokens, angularDistance } from '@/engine-d'

const DEFAULT_CURVE = [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17]

function buildTestPalette(hueAngles: number[], chroma = 0.15) {
  const hueScales: Record<string, ScaleEntry[]> = {}
  for (let h = 0; h < hueAngles.length; h++) {
    const H = hueAngles[h]
    hueScales[`hue-${h}`] = DEFAULT_CURVE.map((L, level) => {
      const C = Math.min(chroma, maxChroma(L, H))
      const hex = oklchToHex(L, C, H)
      return { level, hex, oklch: { L, C, H }, relativeLuminance: relativeLuminance(hex) }
    })
  }
  return assemblePalette(hueScales, 'AA', 10, DEFAULT_CURVE, 'max_per_hue', null, true)
}

describe('angularDistance', () => {
  test('same angle → 0', () => {
    expect(angularDistance(25, 25)).toBe(0)
  })

  test('wraps around 360°', () => {
    expect(angularDistance(10, 350)).toBe(20)
    expect(angularDistance(350, 10)).toBe(20)
  })

  test('opposite → 180', () => {
    expect(angularDistance(0, 180)).toBe(180)
  })
})

describe('status synthesis — synthesized tokens', () => {
  // H=180 and H=300 are far from error (25°) and warning (85°)
  test('error and warning are synthesized when no palette hue is close', () => {
    const palette = buildTestPalette([180, 300])
    const result = runEngineC(palette)
    const set = mapSemanticTokens(result, 'light', 1.0)

    expect(set.meta.statusSynthesis['error']).toBe('synthesized')
    expect(set.meta.statusSynthesis['warning']).toBe('synthesized')
  })

  test('synthesized status tokens have valid hex values', () => {
    const palette = buildTestPalette([180, 300])
    const result = runEngineC(palette)
    const set = mapSemanticTokens(result, 'light', 1.0)

    expect(set.tokens['status.error'].hex).toMatch(/^#[0-9a-f]{6}$/i)
    expect(set.tokens['status.warning'].hex).toMatch(/^#[0-9a-f]{6}$/i)
    expect(set.tokens['status.error-subtle'].hex).toMatch(/^#[0-9a-f]{6}$/i)
    expect(set.tokens['status.warning-subtle'].hex).toMatch(/^#[0-9a-f]{6}$/i)
  })

  test('synthesized status foregrounds meet contrast against fill', () => {
    const palette = buildTestPalette([180, 300])
    const result = runEngineC(palette)
    const set = mapSemanticTokens(result, 'light', 1.0)

    for (const status of ['error', 'warning'] as const) {
      const fill = set.tokens[`status.${status}`]
      const fg = set.tokens[`status.${status}-foreground`]
      const ratio = wcagContrastRatio(fill.hex, fg.hex)
      expect(ratio).toBeGreaterThanOrEqual(4.5 - 0.1)
    }
  })

  test('synthesized status.error hue is near canonical 25°', () => {
    const palette = buildTestPalette([180, 300])
    const result = runEngineC(palette)
    const set = mapSemanticTokens(result, 'light', 1.0)

    const errorH = set.tokens['status.error'].oklch.H
    expect(angularDistance(errorH, 25)).toBeLessThanOrEqual(1)
  })
})

describe('status synthesis — native tokens', () => {
  test('error is native when palette has a hue near 25°', () => {
    // H=30 is within 30° of canonical error (25°)
    const palette = buildTestPalette([30, 180])
    const result = runEngineC(palette)
    const set = mapSemanticTokens(result, 'light', 1.0)

    expect(set.meta.statusSynthesis['error']).toBe('native')
  })

  test('native status.error uses the palette hue, not canonical angle', () => {
    const palette = buildTestPalette([30, 180])
    const result = runEngineC(palette)
    const set = mapSemanticTokens(result, 'light', 1.0)

    const errorH = set.tokens['status.error'].oklch.H
    expect(angularDistance(errorH, 30)).toBeLessThanOrEqual(1)
  })

  test('success is native when palette has a hue near 145°', () => {
    const palette = buildTestPalette([145, 300])
    const result = runEngineC(palette)
    const set = mapSemanticTokens(result, 'light', 1.0)

    expect(set.meta.statusSynthesis['success']).toBe('native')
  })

  test('info is native when palette has a hue near 255°', () => {
    const palette = buildTestPalette([100, 255])
    const result = runEngineC(palette)
    const set = mapSemanticTokens(result, 'light', 1.0)

    expect(set.meta.statusSynthesis['info']).toBe('native')
  })
})

describe('status synthesis — all four statuses present', () => {
  test('all four status fills, subtles, and foregrounds exist', () => {
    const palette = buildTestPalette([180, 300])
    const result = runEngineC(palette)
    const set = mapSemanticTokens(result, 'light', 1.0)

    for (const status of ['success', 'warning', 'error', 'info'] as const) {
      expect(set.tokens[`status.${status}`]).toBeDefined()
      expect(set.tokens[`status.${status}-subtle`]).toBeDefined()
      expect(set.tokens[`status.${status}-foreground`]).toBeDefined()
    }
  })
})
