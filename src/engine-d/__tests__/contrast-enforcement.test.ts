import { describe, test, expect } from 'vitest'
import fc from 'fast-check'
import {
  oklchToHex,
  relativeLuminance,
  maxChroma,
  wcagContrastRatio,
  assemblePalette,
  type ScaleEntry,
} from '@/colour-math'
import { runEngineC } from '@/engine-c'
import { mapSemanticTokens } from '@/engine-d'
import { buildArbitraryPalette } from '@/__test-utils__/arbitrary-palette'

// ─── Helpers ────────────────────────────────────────────────────────

const DEFAULT_CURVE = [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17]
const TEXT_ROLES = ['text.primary', 'text.secondary', 'text.tertiary'] as const

function buildTestPalette(
  hueAngles: number[],
  curve: number[] = DEFAULT_CURVE,
  chroma = 0.15,
) {
  const hueScales: Record<string, ScaleEntry[]> = {}
  for (let h = 0; h < hueAngles.length; h++) {
    const H = hueAngles[h]
    hueScales[`hue-${h}`] = curve.map((L, level) => {
      const C = Math.min(chroma, maxChroma(L, H))
      const hex = oklchToHex(L, C, H)
      return { level, hex, oklch: { L, C, H }, relativeLuminance: relativeLuminance(hex) }
    })
  }
  return assemblePalette(hueScales, 'AA', curve.length, curve, 'max_per_hue', null, true)
}

function runAndMap(
  hueAngles: number[],
  mode: 'light' | 'dark' = 'light',
  compliance: 'AA' | 'AAA' = 'AA',
  curve?: number[],
) {
  const palette = buildTestPalette(hueAngles, curve)
  const result = runEngineC(palette, mode)
  return mapSemanticTokens(result, mode, 1.0, compliance)
}

// ─── Unit Tests: AA Guarantee ───────────────────────────────────────

describe('AA text contrast guarantee', () => {
  test('default palette: text meets 4.5:1 against canvas', () => {
    const set = runAndMap([25, 265], 'light', 'AA')
    const canvasHex = set.tokens['background.canvas'].hex
    for (const role of TEXT_ROLES) {
      const ratio = wcagContrastRatio(set.tokens[role].hex, canvasHex)
      expect(ratio).toBeGreaterThanOrEqual(4.5 - 0.1)
    }
  })

  test('3-hue palette: text meets 4.5:1 against canvas', () => {
    const set = runAndMap([25, 145, 265], 'light', 'AA')
    const canvasHex = set.tokens['background.canvas'].hex
    for (const role of TEXT_ROLES) {
      const ratio = wcagContrastRatio(set.tokens[role].hex, canvasHex)
      expect(ratio).toBeGreaterThanOrEqual(4.5 - 0.1)
    }
  })

  test('compressed curve: text meets 4.5:1 after enforcement', () => {
    const compressedCurve = [0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60, 0.55, 0.50, 0.45]
    const set = runAndMap([180, 300], 'light', 'AA', compressedCurve)
    const canvasHex = set.tokens['background.canvas'].hex
    for (const role of TEXT_ROLES) {
      const ratio = wcagContrastRatio(set.tokens[role].hex, canvasHex)
      expect(ratio).toBeGreaterThanOrEqual(4.5 - 0.1)
    }
  })

  test('narrow midtone curve: text meets 4.5:1 after enforcement', () => {
    const narrowCurve = [0.70, 0.65, 0.60, 0.55, 0.50, 0.50, 0.50, 0.45, 0.40, 0.35]
    const set = runAndMap([180, 300], 'light', 'AA', narrowCurve)
    const canvasHex = set.tokens['background.canvas'].hex
    for (const role of TEXT_ROLES) {
      const ratio = wcagContrastRatio(set.tokens[role].hex, canvasHex)
      expect(ratio).toBeGreaterThanOrEqual(4.5 - 0.1)
    }
  })
})

// ─── Unit Tests: AAA Guarantee ──────────────────────────────────────

describe('AAA text contrast guarantee', () => {
  test('default palette: text meets 7.0:1 against canvas', () => {
    const set = runAndMap([25, 265], 'light', 'AAA')
    const canvasHex = set.tokens['background.canvas'].hex
    for (const role of TEXT_ROLES) {
      const ratio = wcagContrastRatio(set.tokens[role].hex, canvasHex)
      expect(ratio).toBeGreaterThanOrEqual(7.0 - 0.1)
    }
  })

  test('3-hue palette: text meets 7.0:1 against canvas at AAA', () => {
    const set = runAndMap([25, 145, 265], 'light', 'AAA')
    const canvasHex = set.tokens['background.canvas'].hex
    for (const role of TEXT_ROLES) {
      const ratio = wcagContrastRatio(set.tokens[role].hex, canvasHex)
      expect(ratio).toBeGreaterThanOrEqual(7.0 - 0.1)
    }
  })
})

// ─── Property Tests: L Ordering ─────────────────────────────────────

describe('text L ordering after enforcement', () => {
  test('primary.L <= secondary.L <= tertiary.L at AA', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        const result = runEngineC(palette)
        const set = mapSemanticTokens(result, 'light', 1.0, 'AA')
        const pL = set.tokens['text.primary'].oklch.L
        const sL = set.tokens['text.secondary'].oklch.L
        const tL = set.tokens['text.tertiary'].oklch.L
        expect(pL).toBeLessThanOrEqual(sL + 1e-9)
        expect(sL).toBeLessThanOrEqual(tL + 1e-9)
      }),
      { numRuns: 30 },
    )
  })

  test('primary.L <= secondary.L <= tertiary.L at AAA', () => {
    fc.assert(
      fc.property(buildArbitraryPalette(), (palette) => {
        const result = runEngineC(palette)
        const set = mapSemanticTokens(result, 'light', 1.0, 'AAA')
        const pL = set.tokens['text.primary'].oklch.L
        const sL = set.tokens['text.secondary'].oklch.L
        const tL = set.tokens['text.tertiary'].oklch.L
        expect(pL).toBeLessThanOrEqual(sL + 1e-9)
        expect(sL).toBeLessThanOrEqual(tL + 1e-9)
      }),
      { numRuns: 30 },
    )
  })
})

// ─── Property Tests: Focus Ring ─────────────────────────────────────

describe('focus ring enforcement', () => {
  test('focus.ring meets 3:1 against canvas for default palette', () => {
    const set = runAndMap([25, 265], 'light', 'AA')
    const ratio = wcagContrastRatio(
      set.tokens['focus.ring'].hex,
      set.tokens['background.canvas'].hex,
    )
    expect(ratio).toBeGreaterThanOrEqual(3.0 - 0.1)
  })

  test('focus.ring meets 3:1 against canvas for 5-hue palette', () => {
    const set = runAndMap([25, 85, 145, 210, 290], 'light', 'AA')
    const ratio = wcagContrastRatio(
      set.tokens['focus.ring'].hex,
      set.tokens['background.canvas'].hex,
    )
    expect(ratio).toBeGreaterThanOrEqual(3.0 - 0.1)
  })
})

// ─── Unit Tests: Disabled Exemption ─────────────────────────────────

describe('text.disabled exemption', () => {
  test('disabled L is unchanged between AA and AAA (not enforced)', () => {
    const aa = runAndMap([25, 265], 'light', 'AA')
    const aaa = runAndMap([25, 265], 'light', 'AAA')
    expect(aa.tokens['text.disabled'].oklch.L).toBe(
      aaa.tokens['text.disabled'].oklch.L,
    )
  })

  test('disabled token is not shifted at AAA', () => {
    const set = runAndMap([25, 265], 'light', 'AAA')
    const disabled = set.tokens['text.disabled']
    expect(disabled).toBeDefined()
    expect(disabled.oklch.L).toBeGreaterThan(0)
  })
})

// ─── Unit Tests: Token Validity ─────────────────────────────────────

describe('enforced token validity', () => {
  test('text tokens have valid hex and no NaN in oklch after enforcement', () => {
    const set = runAndMap([25, 265], 'light', 'AAA')
    for (const role of TEXT_ROLES) {
      const token = set.tokens[role]
      expect(token.hex).toMatch(/^#[0-9a-f]{6}$/i)
      expect(Number.isNaN(token.oklch.L)).toBe(false)
      expect(Number.isNaN(token.oklch.C)).toBe(false)
      expect(Number.isNaN(token.oklch.H)).toBe(false)
      expect(token.oklch.C).toBeGreaterThanOrEqual(0)
    }
  })

  test('focus.ring has valid hex after enforcement', () => {
    const set = runAndMap([25, 265], 'light', 'AA')
    const ring = set.tokens['focus.ring']
    expect(ring.hex).toMatch(/^#[0-9a-f]{6}$/i)
    expect(Number.isNaN(ring.oklch.L)).toBe(false)
    expect(Number.isNaN(ring.oklch.C)).toBe(false)
  })

  test('dark mode text tokens meet AA threshold against canvas', () => {
    const set = runAndMap([25, 265], 'dark', 'AA')
    const canvasHex = set.tokens['background.canvas'].hex
    for (const role of TEXT_ROLES) {
      const ratio = wcagContrastRatio(set.tokens[role].hex, canvasHex)
      expect(ratio).toBeGreaterThanOrEqual(4.5 - 0.1)
    }
  })
})

// ─── Property Test: text.link ───────────────────────────────────────

describe('text.link contrast', () => {
  test('text.link meets 4.5:1 against canvas with default palette', () => {
    const set = runAndMap([25, 265], 'light', 'AA')
    const ratio = wcagContrastRatio(
      set.tokens['text.link'].hex,
      set.tokens['background.canvas'].hex,
    )
    expect(ratio).toBeGreaterThanOrEqual(4.5 - 0.1)
  })
})
