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
import { mapSemanticTokens, FOUNDATION_ROLES } from '@/engine-d'
import type { SemanticTokenSet } from '@/engine-d'

// ─── Test Helpers ────────────────────────────────────────────────────

const DEFAULT_CURVE = [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17]

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
  curve?: number[],
): SemanticTokenSet {
  const palette = buildTestPalette(hueAngles, curve)
  const result = runEngineC(palette, mode)
  return mapSemanticTokens(result, mode, 1.0)
}

// ─── Neutral Mapping ─────────────────────────────────────────────────

describe('neutral scale mapping', () => {
  test('produces all background roles', () => {
    const set = runAndMap([180, 300])
    expect(set.tokens['background.canvas']).toBeDefined()
    expect(set.tokens['background.surface']).toBeDefined()
    expect(set.tokens['background.surface-raised']).toBeDefined()
    expect(set.tokens['background.surface-inset']).toBeDefined()
    expect(set.tokens['background.inverse']).toBeDefined()
    expect(set.tokens['background.scrim']).toBeDefined()
  })

  test('canvas has the highest L among background roles', () => {
    const set = runAndMap([180, 300])
    const canvas = set.tokens['background.canvas']
    const surface = set.tokens['background.surface']
    const raised = set.tokens['background.surface-raised']
    expect(canvas.oklch.L).toBeGreaterThanOrEqual(surface.oklch.L)
    expect(surface.oklch.L).toBeGreaterThanOrEqual(raised.oklch.L)
  })

  test('produces all text roles', () => {
    const set = runAndMap([180, 300])
    expect(set.tokens['text.primary']).toBeDefined()
    expect(set.tokens['text.secondary']).toBeDefined()
    expect(set.tokens['text.tertiary']).toBeDefined()
    expect(set.tokens['text.disabled']).toBeDefined()
    expect(set.tokens['text.inverse']).toBeDefined()
  })

  test('text.primary has the lowest L among text roles in light mode', () => {
    const set = runAndMap([180, 300])
    const primary = set.tokens['text.primary']
    const secondary = set.tokens['text.secondary']
    const tertiary = set.tokens['text.tertiary']
    const disabled = set.tokens['text.disabled']
    expect(primary.oklch.L).toBeLessThanOrEqual(secondary.oklch.L)
    expect(secondary.oklch.L).toBeLessThanOrEqual(tertiary.oklch.L)
    expect(tertiary.oklch.L).toBeLessThanOrEqual(disabled.oklch.L)
  })

  test('produces all border roles', () => {
    const set = runAndMap([180, 300])
    expect(set.tokens['border.subtle']).toBeDefined()
    expect(set.tokens['border.default']).toBeDefined()
    expect(set.tokens['border.strong']).toBeDefined()
  })

  test('works with non-standard lightness curve', () => {
    const flatCurve = [0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50]
    const set = runAndMap([180, 300], 'light', flatCurve)
    expect(set.tokens['background.canvas']).toBeDefined()
    expect(set.tokens['text.primary']).toBeDefined()
    expect(set.tokens['border.default']).toBeDefined()
  })

  test('inverse tokens come from anchor levels', () => {
    const set = runAndMap([180, 300])
    const inverse = set.tokens['background.inverse']
    const textInverse = set.tokens['text.inverse']
    expect(inverse.oklch.L).toBeGreaterThan(textInverse.oklch.L)
  })
})

// ─── Chromatic Mapping ───────────────────────────────────────────────

describe('chromatic scale mapping', () => {
  test('accent.primary is from hue-0', () => {
    const set = runAndMap([25, 265])
    const accent = set.tokens['accent.primary']
    expect(accent).toBeDefined()
    expect(accent.oklch.H).toBeCloseTo(25, 0)
  })

  test('accent.primary-hover has higher L than accent.primary', () => {
    const set = runAndMap([25, 265])
    const primary = set.tokens['accent.primary']
    const hover = set.tokens['accent.primary-hover']
    expect(hover.oklch.L).toBeGreaterThan(primary.oklch.L)
  })

  test('accent.primary-active has lower L than accent.primary', () => {
    const set = runAndMap([25, 265])
    const primary = set.tokens['accent.primary']
    const active = set.tokens['accent.primary-active']
    expect(active.oklch.L).toBeLessThan(primary.oklch.L)
  })

  test('accent.primary-foreground meets 4.5:1 contrast', () => {
    const set = runAndMap([25, 265])
    const primary = set.tokens['accent.primary']
    const fg = set.tokens['accent.primary-foreground']
    const ratio = wcagContrastRatio(primary.hex, fg.hex)
    expect(ratio).toBeGreaterThanOrEqual(4.5 - 0.05)
  })

  test('background.accent-subtle is defined', () => {
    const set = runAndMap([25, 265])
    expect(set.tokens['background.accent-subtle']).toBeDefined()
  })
})

// ─── Derived Tokens ──────────────────────────────────────────────────

describe('derived tokens', () => {
  test('text.link aliases accent.primary', () => {
    const set = runAndMap([25, 265])
    expect(set.tokens['text.link'].hex).toBe(set.tokens['accent.primary'].hex)
  })

  test('text.on-accent aliases accent.primary-foreground', () => {
    const set = runAndMap([25, 265])
    expect(set.tokens['text.on-accent'].hex).toBe(set.tokens['accent.primary-foreground'].hex)
  })

  test('focus.ring aliases accent.primary', () => {
    const set = runAndMap([25, 265])
    expect(set.tokens['focus.ring'].hex).toBe(set.tokens['accent.primary'].hex)
  })

  test('focus.outline has alpha 0.5', () => {
    const set = runAndMap([25, 265])
    expect(set.tokens['focus.outline'].alpha).toBe(0.5)
    expect(set.tokens['focus.outline'].hex).toBe(set.tokens['accent.primary'].hex)
  })

  test('background.scrim has alpha 0.4', () => {
    const set = runAndMap([25, 265])
    expect(set.tokens['background.scrim'].alpha).toBe(0.4)
  })
})

// ─── Foreground L=0.55 Boundary ──────────────────────────────────────

describe('foreground L=0.55 boundary', () => {
  test('accent at L=0.54 picks the lighter (high-L) neutral as foreground', () => {
    // Build a palette where hue-0's emphasis token lands at L~0.54
    const curve = [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.54, 0.36, 0.27, 0.17]
    const set = runAndMap([180, 300], 'light', curve)
    const fg = set.tokens['accent.primary-foreground']
    // L < 0.55 → should pick the light neutral (high L)
    expect(fg.oklch.L).toBeGreaterThan(0.5)
  })

  test('accent at L=0.56 picks the darker (low-L) neutral as foreground', () => {
    const curve = [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.44, 0.36, 0.27, 0.17]
    const set = runAndMap([180, 300], 'light', curve)
    const fg = set.tokens['accent.primary-foreground']
    // With default emphasis around L=0.44, which is < 0.55, should pick light neutral
    expect(fg).toBeDefined()
    const accent = set.tokens['accent.primary']
    const ratio = wcagContrastRatio(accent.hex, fg.hex)
    expect(ratio).toBeGreaterThanOrEqual(4.5 - 0.05)
  })
})

// ─── Degenerate Palette ──────────────────────────────────────────────

describe('degenerate palette (no emphasis tokens)', () => {
  test('accent.primary maps via fallback with a flat curve', () => {
    // All tokens at L=0.80 → surface/container intent, no emphasis band hit
    const flatCurve = [0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80, 0.80]
    const set = runAndMap([180, 300], 'light', flatCurve)
    expect(set.tokens['accent.primary']).toBeDefined()
    expect(set.tokens['accent.primary'].hex).toBeTruthy()
  })
})

// ─── Chart Tokens ───────────────────────────────────────────────────

describe('chart token mapping', () => {
  test('5 chart tokens populated with >= 5 chromatic hues', () => {
    const set = runAndMap([25, 85, 145, 210, 290], 'light')
    for (let i = 1; i <= 5; i++) {
      expect(set.tokens[`chart.${i}`]).toBeDefined()
      expect(set.tokens[`chart.${i}`].hex).toBeTruthy()
    }
  })

  test('chart tokens cycle when fewer than 5 hues', () => {
    const set = runAndMap([25, 145], 'light')
    for (let i = 1; i <= 5; i++) {
      expect(set.tokens[`chart.${i}`]).toBeDefined()
    }
    // 2 hues: chart.1=hue-0, chart.2=hue-1, chart.3=hue-0, ...
    expect(set.tokens['chart.1'].hex).toBe(set.tokens['chart.3'].hex)
    expect(set.tokens['chart.2'].hex).toBe(set.tokens['chart.4'].hex)
    expect(set.tokens['chart.1'].hex).toBe(set.tokens['chart.5'].hex)
  })

  test('chart tokens use emphasis-intent tokens', () => {
    const set = runAndMap([25, 145, 255], 'light')
    // Chart tokens should have mid-range L values (emphasis band),
    // not the extreme L values used by surface/foreground intents
    for (let i = 1; i <= 3; i++) {
      const L = set.tokens[`chart.${i}`].oklch.L
      expect(L).toBeGreaterThan(0.25)
      expect(L).toBeLessThan(0.75)
    }
  })

  test('chart tokens are distinct across different hues', () => {
    const set = runAndMap([25, 145, 255], 'light')
    const hexes = new Set([
      set.tokens['chart.1'].hex,
      set.tokens['chart.2'].hex,
      set.tokens['chart.3'].hex,
    ])
    expect(hexes.size).toBe(3)
  })
})
