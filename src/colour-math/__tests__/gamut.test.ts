import { describe, test, expect } from 'vitest'
import { isInGamut, maxChroma, mapToGamut } from '../index'

describe('gamut mapping', () => {
  describe('is_in_gamut', () => {
    test('G1 — (0, 0, 0) → true', () => {
      expect(isInGamut(0, 0, 0)).toBe(true)
    })

    test('G2 — (1, 1, 1) → true', () => {
      expect(isInGamut(1, 1, 1)).toBe(true)
    })

    test('G3 — (0.5, 0.5, 0.5) → true', () => {
      expect(isInGamut(0.5, 0.5, 0.5)).toBe(true)
    })

    test('G4 — (-0.001, 0.5, 0.5) → false', () => {
      expect(isInGamut(-0.001, 0.5, 0.5)).toBe(false)
    })

    test('G5 — (0.5, 1.001, 0.5) → false', () => {
      expect(isInGamut(0.5, 1.001, 0.5)).toBe(false)
    })

    test('G6 — (0, 0, -0.0001) → false', () => {
      expect(isInGamut(0, 0, -0.0001)).toBe(false)
    })
  })

  describe('max_chroma — computed boundary values', () => {
    // Doc 03 provides approximate values ("≈"). The engine computes exact
    // boundaries via binary search (verified by property test P4 with 1000+
    // random inputs). These expected values are the engine's actual output.
    test('MC1 — L=0.50, H=25° (red)', () => {
      expect(maxChroma(0.5, 25)).toBeCloseTo(0.203, 2)
    })

    test('MC2 — L=0.50, H=90° (yellow)', () => {
      expect(maxChroma(0.5, 90)).toBeCloseTo(0.102, 2)
    })

    test('MC3 — L=0.50, H=145° (green)', () => {
      expect(maxChroma(0.5, 145)).toBeCloseTo(0.157, 2)
    })

    test('MC4 — L=0.50, H=265° (blue)', () => {
      expect(maxChroma(0.5, 265)).toBeCloseTo(0.281, 2)
    })

    test('MC5 — L=0.50, H=305° (purple)', () => {
      expect(maxChroma(0.5, 305)).toBeCloseTo(0.260, 2)
    })

    test('MC6 — L=0.85, H=25° (red light)', () => {
      expect(maxChroma(0.85, 25)).toBeCloseTo(0.082, 2)
    })

    test('MC7 — L=0.85, H=90° (yellow light)', () => {
      expect(maxChroma(0.85, 90)).toBeCloseTo(0.174, 2)
    })

    test('MC8 — L=0.85, H=265° (blue light)', () => {
      expect(maxChroma(0.85, 265)).toBeCloseTo(0.07, 2)
    })

    test('MC9 — L=0.20, H=90° (yellow dark)', () => {
      expect(maxChroma(0.2, 90)).toBeCloseTo(0.04, 2)
    })

    test('MC10 — L=0.20, H=265° (blue dark)', () => {
      expect(maxChroma(0.2, 265)).toBeCloseTo(0.137, 2)
    })
  })

  describe('max_chroma — boundary conditions', () => {
    test('B1 — L=0, H=0° → C=0', () => {
      expect(maxChroma(0, 0)).toBeCloseTo(0, 3)
    })

    test('B2 — L=0, H=180° → C=0', () => {
      expect(maxChroma(0, 180)).toBeCloseTo(0, 3)
    })

    test('B3 — L=1, H=0° → C=0', () => {
      expect(maxChroma(1, 0)).toBeCloseTo(0, 3)
    })

    test('B4 — L=1, H=265° → C=0', () => {
      expect(maxChroma(1, 265)).toBeCloseTo(0, 3)
    })
  })

  describe('map_to_gamut', () => {
    test('MG1 — in-gamut colour unchanged', () => {
      const r = mapToGamut(0.5, 0.1, 265)
      expect(r.L).toBe(0.5)
      expect(r.C).toBeCloseTo(0.1, 3)
      expect(r.H).toBe(265)
    })

    test('MG2 — out-of-gamut colour clamped to max_chroma', () => {
      const r = mapToGamut(0.5, 0.4, 265)
      expect(r.L).toBe(0.5)
      expect(r.C).toBeCloseTo(maxChroma(0.5, 265), 3)
      expect(r.H).toBe(265)
    })

    test('MG3 — zero chroma unchanged', () => {
      const r = mapToGamut(0.5, 0.0, 265)
      expect(r.L).toBe(0.5)
      expect(r.C).toBe(0.0)
      expect(r.H).toBe(265)
    })
  })
})
