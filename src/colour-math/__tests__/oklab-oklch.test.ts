import { describe, test, expect } from 'vitest'
import { oklabToOklch, oklchToOklab, oklabToHex } from '../index'

describe('OKLAB ↔ OKLCH conversion', () => {
  describe('forward (OKLAB → OKLCH)', () => {
    test('C1 — red: a=0.2249, b=0.1264 → C≈0.2580, H≈29.34°', () => {
      const r = oklabToOklch(0.6280, 0.2249, 0.1264)
      expect(r.C).toBeCloseTo(0.2580, 3)
      expect(r.H).toBeCloseTo(29.34, 0)
    })

    test('C2 — blue: a=-0.0324, b=-0.3119 → C≈0.3136, H≈264.07°', () => {
      const r = oklabToOklch(0.4520, -0.0324, -0.3119)
      expect(r.C).toBeCloseTo(0.3136, 3)
      expect(r.H).toBeCloseTo(264.07, 0)
    })

    test('C3 — green: a=-0.2339, b=0.1794 → C≈0.2948, H≈142.52°', () => {
      const r = oklabToOklch(0.8664, -0.2339, 0.1794)
      expect(r.C).toBeCloseTo(0.2948, 3)
      expect(r.H).toBeCloseTo(142.52, 0)
    })

    test('C4 — achromatic (mid-grey): a=0, b=0 → C=0', () => {
      const r = oklabToOklch(0.5999, 0, 0)
      expect(r.C).toBe(0)
    })

    test('C5 — black: a=0, b=0 → C=0', () => {
      const r = oklabToOklch(0.0, 0, 0)
      expect(r.C).toBe(0)
    })

    test('C6 — white: a=0, b=0 → C=0', () => {
      const r = oklabToOklch(1.0, 0, 0)
      expect(r.C).toBe(0)
    })

    test('C7 — pure positive-b axis → H=90°', () => {
      const r = oklabToOklch(0.5, 0.0, 0.1)
      expect(r.C).toBeCloseTo(0.1, 3)
      expect(r.H).toBeCloseTo(90.0, 0)
    })

    test('C8 — pure negative-b axis → H=270°', () => {
      const r = oklabToOklch(0.5, 0.0, -0.1)
      expect(r.C).toBeCloseTo(0.1, 3)
      expect(r.H).toBeCloseTo(270.0, 0)
    })

    test('C9 — pure positive-a axis → H=0°', () => {
      const r = oklabToOklch(0.5, 0.1, 0.0)
      expect(r.C).toBeCloseTo(0.1, 3)
      expect(r.H).toBeCloseTo(0.0, 0)
    })
  })

  describe('reverse (OKLCH → OKLAB)', () => {
    test('C1–C9 each round-trip within ±0.0001', () => {
      const cases: [number, number, number][] = [
        [0.6280, 0.2249, 0.1264],
        [0.4520, -0.0324, -0.3119],
        [0.8664, -0.2339, 0.1794],
        [0.5999, 0, 0],
        [0.0, 0, 0],
        [1.0, 0, 0],
        [0.5, 0.0, 0.1],
        [0.5, 0.0, -0.1],
        [0.5, 0.1, 0.0],
      ]
      for (const [L, a, b] of cases) {
        const oklch = oklabToOklch(L, a, b)
        const back = oklchToOklab(oklch.L, oklch.C, oklch.H)
        expect(back.L).toBeCloseTo(L, 4)
        expect(back.a).toBeCloseTo(a, 4)
        expect(back.b).toBeCloseTo(b, 4)
      }
    })
  })

  describe('achromatic hue convention', () => {
    test('C=0 hue does not cause downstream NaN propagation', () => {
      const oklch = oklabToOklch(0.5999, 0, 0)
      expect(oklch.C).toBe(0)
      expect(Number.isNaN(oklch.H)).toBe(false)

      const oklab = oklchToOklab(oklch.L, oklch.C, oklch.H)
      expect(Number.isNaN(oklab.a)).toBe(false)
      expect(Number.isNaN(oklab.b)).toBe(false)

      const hex = oklabToHex(oklab.L, oklab.a, oklab.b)
      expect(hex).toMatch(/^#[0-9a-f]{6}$/)
    })

    test('oklch_to_oklab with C=0 returns a=0, b=0 regardless of H', () => {
      for (const H of [0, 45, 90, 135, 180, 225, 270, 315, 359.9]) {
        const lab = oklchToOklab(0.5, 0, H)
        expect(lab.a).toBe(0)
        expect(lab.b).toBe(0)
      }
    })
  })

  describe('hue discontinuity', () => {
    test('H1 — H=359.9° round-trips without wrapping error', () => {
      const lab = oklchToOklab(0.5, 0.1, 359.9)
      const oklch = oklabToOklch(lab.L, lab.a, lab.b)
      expect(oklch.H).toBeCloseTo(359.9, 0)
      expect(oklch.C).toBeCloseTo(0.1, 3)
    })

    test('H2 — H=0.1° round-trips without wrapping error', () => {
      const lab = oklchToOklab(0.5, 0.1, 0.1)
      const oklch = oklabToOklch(lab.L, lab.a, lab.b)
      expect(oklch.H).toBeCloseTo(0.1, 0)
      expect(oklch.C).toBeCloseTo(0.1, 3)
    })

    test('H3 — H=360° normalised to 0°', () => {
      const lab360 = oklchToOklab(0.5, 0.1, 360)
      const lab0 = oklchToOklab(0.5, 0.1, 0)
      expect(lab360.a).toBeCloseTo(lab0.a, 10)
      expect(lab360.b).toBeCloseTo(lab0.b, 10)

      const oklch = oklabToOklch(lab360.L, lab360.a, lab360.b)
      expect(oklch.H).toBeCloseTo(0, 0)
    })
  })
})
