import { describe, test, expect } from 'vitest'
import { classifyToken, classifyPalette } from '@/engine-c/intent'
import { NEUTRAL_SCALE_NAME } from '@/engine-c/types'
import { generatePalette } from '@/colour-math'

// ─── Dark mode classifyToken ────────────────────────────────────────

describe('classifyToken dark mode', () => {
  test('L=0.15 → surface (band [0.12, 0.22])', () => {
    const r = classifyToken('hue-0', 0, 10, { L: 0.15, C: 0.08, H: 30 }, 'dark')
    expect(r.intent).toBe('surface')
    expect(r.band).toEqual([0.12, 0.22])
    expect(r.maxDrift).toBe(0.03)
  })

  test('L=0.30 → container (band [0.20, 0.40])', () => {
    const r = classifyToken('hue-0', 2, 10, { L: 0.30, C: 0.08, H: 30 }, 'dark')
    expect(r.intent).toBe('container')
    expect(r.band).toEqual([0.20, 0.40])
    expect(r.maxDrift).toBe(0.10)
  })

  test('L=0.48 → decorative (band [0.25, 0.65])', () => {
    const r = classifyToken('hue-0', 4, 10, { L: 0.48, C: 0.08, H: 30 }, 'dark')
    expect(r.intent).toBe('decorative')
    expect(r.band).toEqual([0.25, 0.65])
    expect(r.maxDrift).toBe(0.15)
  })

  test('L=0.60 chromatic → emphasis (band [0.38, 0.75])', () => {
    const r = classifyToken('hue-0', 5, 10, { L: 0.60, C: 0.10, H: 30 }, 'dark')
    expect(r.intent).toBe('emphasis')
    expect(r.band).toEqual([0.38, 0.75])
    expect(r.maxDrift).toBe(0.12)
    expect(r.hueLocked).toBe(true)
  })

  test('L=0.60 neutral → foreground (band [0.55, 0.95])', () => {
    const r = classifyToken(NEUTRAL_SCALE_NAME, 5, 10, { L: 0.60, C: 0.02, H: 0 }, 'dark')
    expect(r.intent).toBe('foreground')
    expect(r.band).toEqual([0.55, 0.95])
    expect(r.maxDrift).toBe(0.20)
    expect(r.hueLocked).toBe(false)
  })

  test('L=0.80 → foreground (band [0.55, 0.95])', () => {
    const r = classifyToken('hue-0', 8, 10, { L: 0.80, C: 0.10, H: 30 }, 'dark')
    expect(r.intent).toBe('foreground')
    expect(r.band).toEqual([0.55, 0.95])
    expect(r.maxDrift).toBe(0.20)
  })

  test('boundary: L=0.22 → container (not surface)', () => {
    const r = classifyToken('hue-0', 1, 10, { L: 0.22, C: 0.08, H: 30 }, 'dark')
    expect(r.intent).toBe('container')
  })

  test('boundary: L=0.40 → decorative (not container)', () => {
    const r = classifyToken('hue-0', 3, 10, { L: 0.40, C: 0.08, H: 30 }, 'dark')
    expect(r.intent).toBe('decorative')
  })
})

// ─── Regression: light mode unchanged ───────────────────────────────

describe('classifyToken light mode regression', () => {
  test('explicit mode=light produces same results as existing tests', () => {
    const surface = classifyToken('hue-0', 0, 10, { L: 0.97, C: 0.10, H: 30 }, 'light')
    expect(surface.intent).toBe('surface')
    expect(surface.band).toEqual([0.92, 1.00])

    const container = classifyToken('hue-0', 2, 10, { L: 0.87, C: 0.10, H: 30 }, 'light')
    expect(container.intent).toBe('container')

    const emphasis = classifyToken('hue-0', 5, 10, { L: 0.50, C: 0.10, H: 30 }, 'light')
    expect(emphasis.intent).toBe('emphasis')
    expect(emphasis.hueLocked).toBe(true)

    const foreground = classifyToken('hue-0', 8, 10, { L: 0.20, C: 0.10, H: 30 }, 'light')
    expect(foreground.intent).toBe('foreground')
  })
})

// ─── classifyPalette default parameter regression ───────────────────

describe('classifyPalette mode parameter', () => {
  const palette = generatePalette({
    hues: [
      { name: 'hue-0', H: 30 },
      { name: 'hue-1', H: 150 },
    ],
    numLevels: 10,
    compliance: 'AA',
    lightnessCurve: [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17],
    chromaStrategy: 'max_per_hue',
    neutralHue: null,
  })

  test('classifyPalette(scales) equals classifyPalette(scales, "light")', () => {
    const implicit = classifyPalette(palette.scales)
    const explicit = classifyPalette(palette.scales, 'light')
    expect(implicit).toEqual(explicit)
  })

  test('classifyPalette with mode=dark returns dark bands', () => {
    const dark = classifyPalette(palette.scales, 'dark')
    for (const [name, records] of Object.entries(dark)) {
      expect(records).toHaveLength(palette.scales[name].length)
    }
    const hue0 = dark['hue-0']
    const surfaceTokens = hue0.filter(r => r.intent === 'surface')
    const foregroundTokens = hue0.filter(r => r.intent === 'foreground')
    expect(surfaceTokens.length).toBeGreaterThan(0)
    expect(foregroundTokens.length).toBeGreaterThan(0)
  })
})
