import { describe, test, expect } from 'vitest'
import { classifyToken, classifyPalette } from '@/engine-c/intent'
import { NEUTRAL_SCALE_NAME } from '@/engine-c/types'
import { generatePalette } from '@/colour-math'

// ─── classifyToken ──────────────────────────────────────────────────

describe('classifyToken', () => {
  describe('neutral anchors', () => {
    test('neutral level 0 → anchor, drift 0, hueLocked, chromaLocked', () => {
      const r = classifyToken(NEUTRAL_SCALE_NAME, 0, 10, { L: 0.97, C: 0, H: 0 })
      expect(r.intent).toBe('anchor')
      expect(r.band).toEqual([0.97, 0.97])
      expect(r.maxDrift).toBe(0)
      expect(r.hueLocked).toBe(true)
      expect(r.chromaLocked).toBe(true)
    })

    test('neutral last level (level 9 in 10-level scale) → anchor', () => {
      const r = classifyToken(NEUTRAL_SCALE_NAME, 9, 10, { L: 0.17, C: 0, H: 0 })
      expect(r.intent).toBe('anchor')
      expect(r.band).toEqual([0.17, 0.17])
      expect(r.maxDrift).toBe(0)
      expect(r.hueLocked).toBe(true)
      expect(r.chromaLocked).toBe(true)
    })
  })

  describe('lightness-based classification', () => {
    test('chromatic L=0.97 → surface, band [0.92, 1.00], drift 0.03', () => {
      const r = classifyToken('hue-0', 0, 10, { L: 0.97, C: 0.10, H: 30 })
      expect(r.intent).toBe('surface')
      expect(r.band).toEqual([0.92, 1.00])
      expect(r.maxDrift).toBe(0.03)
    })

    test('chromatic L=0.87 → container, band [0.75, 0.94], drift 0.10', () => {
      const r = classifyToken('hue-0', 2, 10, { L: 0.87, C: 0.10, H: 30 })
      expect(r.intent).toBe('container')
      expect(r.band).toEqual([0.75, 0.94])
      expect(r.maxDrift).toBe(0.10)
    })

    test('chromatic L=0.68 → decorative, band [0.40, 0.85], drift 0.15', () => {
      const r = classifyToken('hue-0', 4, 10, { L: 0.68, C: 0.10, H: 30 })
      expect(r.intent).toBe('decorative')
      expect(r.band).toEqual([0.40, 0.85])
      expect(r.maxDrift).toBe(0.15)
    })

    test('chromatic L=0.50 → emphasis, band [0.30, 0.65], drift 0.12, hueLocked', () => {
      const r = classifyToken('hue-0', 5, 10, { L: 0.50, C: 0.10, H: 30 })
      expect(r.intent).toBe('emphasis')
      expect(r.band).toEqual([0.30, 0.65])
      expect(r.maxDrift).toBe(0.12)
      expect(r.hueLocked).toBe(true)
    })

    test('neutral L=0.50 → foreground (NOT emphasis), hueLocked false', () => {
      const r = classifyToken(NEUTRAL_SCALE_NAME, 5, 10, { L: 0.50, C: 0.02, H: 0 })
      expect(r.intent).toBe('foreground')
      expect(r.hueLocked).toBe(false)
    })

    test('chromatic L=0.20 → foreground, band [0.15, 0.55], drift 0.20', () => {
      const r = classifyToken('hue-0', 8, 10, { L: 0.20, C: 0.10, H: 30 })
      expect(r.intent).toBe('foreground')
      expect(r.band).toEqual([0.15, 0.55])
      expect(r.maxDrift).toBe(0.20)
    })
  })

  describe('achromatic detection', () => {
    test('C=0.02 → chromaLocked true regardless of intent', () => {
      const r = classifyToken('hue-0', 4, 10, { L: 0.68, C: 0.02, H: 30 })
      expect(r.intent).toBe('decorative')
      expect(r.chromaLocked).toBe(true)
    })

    test('C=0.10 → chromaLocked false', () => {
      const r = classifyToken('hue-0', 4, 10, { L: 0.68, C: 0.10, H: 30 })
      expect(r.chromaLocked).toBe(false)
    })
  })

  describe('boundary values', () => {
    test('L=0.92 chromatic → surface (not container)', () => {
      const r = classifyToken('hue-0', 1, 10, { L: 0.92, C: 0.10, H: 30 })
      expect(r.intent).toBe('surface')
    })

    test('L=0.75 chromatic → container (not decorative)', () => {
      const r = classifyToken('hue-0', 3, 10, { L: 0.75, C: 0.10, H: 30 })
      expect(r.intent).toBe('container')
    })

    test('L=0.55 chromatic → decorative (not emphasis)', () => {
      const r = classifyToken('hue-0', 5, 10, { L: 0.55, C: 0.10, H: 30 })
      expect(r.intent).toBe('decorative')
    })

    test('L=0.30 chromatic → emphasis (not foreground)', () => {
      const r = classifyToken('hue-0', 7, 10, { L: 0.30, C: 0.10, H: 30 })
      expect(r.intent).toBe('emphasis')
    })
  })
})

// ─── classifyPalette ────────────────────────────────────────────────

describe('classifyPalette', () => {
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

  test('returns one key per scale in the palette', () => {
    const intents = classifyPalette(palette.scales)
    expect(Object.keys(intents).sort()).toEqual(Object.keys(palette.scales).sort())
  })

  test('each array length equals its scale level count', () => {
    const intents = classifyPalette(palette.scales)
    for (const [name, scale] of Object.entries(palette.scales)) {
      expect(intents[name]).toHaveLength(scale.length)
    }
  })

  test('neutral level 0 is anchor', () => {
    const intents = classifyPalette(palette.scales)
    expect(intents[NEUTRAL_SCALE_NAME][0].intent).toBe('anchor')
  })

  test('neutral last level is anchor', () => {
    const intents = classifyPalette(palette.scales)
    const neutral = intents[NEUTRAL_SCALE_NAME]
    expect(neutral[neutral.length - 1].intent).toBe('anchor')
  })

  test('mid-level chromatic token (L in 0.30–0.55) classified as emphasis', () => {
    const intents = classifyPalette(palette.scales)
    const hue0 = intents['hue-0']
    const emphasisTokens = hue0.filter(r => r.intent === 'emphasis')
    expect(emphasisTokens.length).toBeGreaterThan(0)
  })
})
