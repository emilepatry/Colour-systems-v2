import { describe, test, expect } from 'vitest'
import {
  easingMap,
  resolveEasing,
  hcToPoint,
  pointToHC,
  stableHue,
  vectorOnLine,
  vectorsOnLine,
  interpolateAnchors,
} from '@/engine-a'
import type { EasingId, PositionFunction } from '@/engine-a'
import { maxChroma } from '@/colour-math'

const ALL_EASING_IDS: EasingId[] = [
  'linear',
  'sinusoidal',
  'exponential',
  'quadratic',
  'cubic',
  'quartic',
  'asinusoidal',
  'arc',
  'smoothStep',
]

// ─── Easing ──────────────────────────────────────────────────────────

describe('easing functions', () => {
  describe('boundary values', () => {
    for (const id of ALL_EASING_IDS) {
      test(`${id} normal: f(0) = 0 and f(1) = 1`, () => {
        const fn = resolveEasing(id)
        expect(fn(0, false)).toBeCloseTo(0, 10)
        expect(fn(1, false)).toBeCloseTo(1, 10)
      })

      test(`${id} reverse: f(0) = 0 and f(1) = 1`, () => {
        const fn = resolveEasing(id)
        expect(fn(0, true)).toBeCloseTo(0, 10)
        expect(fn(1, true)).toBeCloseTo(1, 10)
      })
    }
  })

  describe('reverse symmetry', () => {
    const tValues = [0, 0.25, 0.5, 0.75, 1.0]

    for (const id of ALL_EASING_IDS) {
      test(`${id}: f(t, false) + f_reverse(1-t, true) ≈ 1`, () => {
        const fn = resolveEasing(id)
        for (const t of tValues) {
          const normal = fn(t, false)
          const reverse = fn(1 - t, true)
          expect(normal + reverse).toBeCloseTo(1, 8)
        }
      })
    }
  })

  describe('monotonicity', () => {
    for (const id of ALL_EASING_IDS) {
      for (const reverse of [false, true]) {
        test(`${id} (reverse=${reverse}) is monotonically non-decreasing`, () => {
          const fn = resolveEasing(id)
          let prev = fn(0, reverse)
          for (let i = 1; i <= 100; i++) {
            const t = i / 100
            const val = fn(t, reverse)
            expect(val).toBeGreaterThanOrEqual(prev - 1e-12)
            prev = val
          }
        })
      }
    }
  })

  describe('resolveEasing', () => {
    test('all 9 easing IDs resolve to a function', () => {
      expect(Object.keys(easingMap)).toHaveLength(9)
      for (const id of ALL_EASING_IDS) {
        const fn = resolveEasing(id)
        expect(typeof fn).toBe('function')
      }
    })
  })
})

// ─── Coordinate mapping ─────────────────────────────────────────────

describe('coordinate mapping (Strategy B)', () => {
  describe('hcToPoint → pointToHC round-trip', () => {
    const cases = [
      { H: 25, C: 0.10, displayL: 0.56 },
      { H: 90, C: 0.05, displayL: 0.56 },
      { H: 265, C: 0.15, displayL: 0.56 },
      { H: 0, C: 0.10, displayL: 0.56 },
      { H: 359, C: 0.10, displayL: 0.56 },
    ]

    for (const { H, C, displayL } of cases) {
      test(`H=${H}, C=${C}, displayL=${displayL}`, () => {
        const [x, y] = hcToPoint(H, C, displayL)
        const result = pointToHC(x, y, displayL)
        expect(result.H).toBeCloseTo(H, 0) // ±0.5°
        expect(result.C).toBeCloseTo(C, 2) // ±0.001
      })
    }
  })

  describe('centre maps to achromatic', () => {
    test('hcToPoint(H, 0, displayL) returns (0.5, 0.5)', () => {
      const [x, y] = hcToPoint(90, 0, 0.56)
      expect(x).toBeCloseTo(0.5, 10)
      expect(y).toBeCloseTo(0.5, 10)
    })

    test('pointToHC(0.5, 0.5, displayL).vibrancy is 0', () => {
      const result = pointToHC(0.5, 0.5, 0.56)
      expect(result.vibrancy).toBeCloseTo(0, 10)
    })
  })

  describe('edge maps to full vibrancy', () => {
    test('H=25, displayL=0.56: max chroma maps to normC=1', () => {
      const displayL = 0.56
      const H = 25
      const cMax = maxChroma(displayL, H)
      const [x, y] = hcToPoint(H, cMax, displayL)
      const dist = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2)
      expect(dist).toBeCloseTo(0.5, 2)
    })
  })

  describe('stableHue', () => {
    test('C=0 returns fallbackH', () => {
      expect(stableHue(0, 123, 45)).toBe(45)
    })

    test('C=0.001 returns fallbackH (below CHROMA_EPSILON 0.002)', () => {
      expect(stableHue(0.001, 123, 45)).toBe(45)
    })

    test('C=0.003 returns H (above threshold)', () => {
      expect(stableHue(0.003, 123, 45)).toBe(123)
    })

    test('C=0.1 returns H', () => {
      expect(stableHue(0.1, 200, 45)).toBe(200)
    })
  })
})

// ─── Interpolation ──────────────────────────────────────────────────

describe('interpolation', () => {
  const linearFn: PositionFunction = (t) => t

  describe('vectorOnLine', () => {
    test('t=0 returns p1', () => {
      const p1: [number, number] = [0.1, 0.2]
      const p2: [number, number] = [0.8, 0.9]
      const result = vectorOnLine(0, p1, p2, false, linearFn, linearFn)
      expect(result[0]).toBeCloseTo(p1[0], 10)
      expect(result[1]).toBeCloseTo(p1[1], 10)
    })

    test('t=1 returns p2', () => {
      const p1: [number, number] = [0.1, 0.2]
      const p2: [number, number] = [0.8, 0.9]
      const result = vectorOnLine(1, p1, p2, false, linearFn, linearFn)
      expect(result[0]).toBeCloseTo(p2[0], 10)
      expect(result[1]).toBeCloseTo(p2[1], 10)
    })

    test('t=0.5 with linear easing returns midpoint', () => {
      const p1: [number, number] = [0.0, 0.0]
      const p2: [number, number] = [1.0, 1.0]
      const result = vectorOnLine(0.5, p1, p2, false, linearFn, linearFn)
      expect(result[0]).toBeCloseTo(0.5, 10)
      expect(result[1]).toBeCloseTo(0.5, 10)
    })
  })

  describe('vectorsOnLine', () => {
    test('numPoints=2 returns exactly [p1, p2]', () => {
      const p1: [number, number] = [0.1, 0.2]
      const p2: [number, number] = [0.8, 0.9]
      const result = vectorsOnLine(p1, p2, 2, false, linearFn, linearFn)
      expect(result).toHaveLength(2)
      expect(result[0][0]).toBeCloseTo(p1[0], 10)
      expect(result[0][1]).toBeCloseTo(p1[1], 10)
      expect(result[1][0]).toBeCloseTo(p2[0], 10)
      expect(result[1][1]).toBeCloseTo(p2[1], 10)
    })

    test('numPoints=3 with linear easing returns [p1, midpoint, p2]', () => {
      const p1: [number, number] = [0.0, 0.0]
      const p2: [number, number] = [1.0, 1.0]
      const result = vectorsOnLine(p1, p2, 3, false, linearFn, linearFn)
      expect(result).toHaveLength(3)
      expect(result[0][0]).toBeCloseTo(0.0, 10)
      expect(result[1][0]).toBeCloseTo(0.5, 10)
      expect(result[2][0]).toBeCloseTo(1.0, 10)
    })

    test('first point is always p1, last point is always p2', () => {
      const p1: [number, number] = [0.2, 0.3]
      const p2: [number, number] = [0.7, 0.8]
      const sinFn = resolveEasing('sinusoidal')
      const result = vectorsOnLine(p1, p2, 10, true, sinFn, sinFn)
      expect(result[0][0]).toBeCloseTo(p1[0], 10)
      expect(result[0][1]).toBeCloseTo(p1[1], 10)
      expect(result[result.length - 1][0]).toBeCloseTo(p2[0], 10)
      expect(result[result.length - 1][1]).toBeCloseTo(p2[1], 10)
    })
  })
})

// ─── Orchestrator ───────────────────────────────────────────────────

describe('interpolateAnchors', () => {
  const displayL = 0.56

  describe('output shape', () => {
    test('2 anchors, numHues=3 → 3 outputs', () => {
      const anchors = [
        { H: 25, C: 0.15 },
        { H: 265, C: 0.15 },
      ]
      const result = interpolateAnchors(anchors, { x: 'linear', y: 'linear' }, 3, displayL)
      expect(result).toHaveLength(3)
    })

    test('2 anchors, numHues=5 → 5 outputs', () => {
      const anchors = [
        { H: 25, C: 0.15 },
        { H: 265, C: 0.15 },
      ]
      const result = interpolateAnchors(anchors, { x: 'linear', y: 'linear' }, 5, displayL)
      expect(result).toHaveLength(5)
    })

    test('3 anchors, numHues=5 → 5 outputs', () => {
      const anchors = [
        { H: 25, C: 0.15 },
        { H: 145, C: 0.10 },
        { H: 265, C: 0.15 },
      ]
      const result = interpolateAnchors(anchors, { x: 'linear', y: 'linear' }, 5, displayL)
      expect(result).toHaveLength(5)
    })
  })

  describe('boundary hues', () => {
    test('first output hue ≈ first anchor hue', () => {
      const anchors = [
        { H: 25, C: 0.15 },
        { H: 265, C: 0.15 },
      ]
      const result = interpolateAnchors(anchors, { x: 'sinusoidal', y: 'sinusoidal' }, 3, displayL)
      expect(result[0].H).toBeCloseTo(25, 0) // ±1°
    })

    test('last output hue ≈ last anchor hue', () => {
      const anchors = [
        { H: 25, C: 0.15 },
        { H: 265, C: 0.15 },
      ]
      const result = interpolateAnchors(anchors, { x: 'sinusoidal', y: 'sinusoidal' }, 3, displayL)
      expect(result[result.length - 1].H).toBeCloseTo(265, 0) // ±1°
    })
  })

  describe('vibrancy range', () => {
    test('all outputs have vibrancy ∈ [0, 1]', () => {
      const anchors = [
        { H: 25, C: 0.15 },
        { H: 265, C: 0.15 },
      ]
      const result = interpolateAnchors(anchors, { x: 'sinusoidal', y: 'sinusoidal' }, 5, displayL)
      for (const { vibrancy } of result) {
        expect(vibrancy).toBeGreaterThanOrEqual(0)
        expect(vibrancy).toBeLessThanOrEqual(1)
      }
    })

    test('anchor at edge (C = maxChroma) → vibrancy ≈ 1', () => {
      const H = 25
      const cMax = maxChroma(displayL, H)
      const anchors = [
        { H, C: cMax },
        { H: 265, C: 0.15 },
      ]
      const result = interpolateAnchors(anchors, { x: 'linear', y: 'linear' }, 2, displayL)
      expect(result[0].vibrancy).toBeCloseTo(1, 1)
    })

    test('anchor at centre (C ≈ 0) → vibrancy ≈ 0', () => {
      const anchors = [
        { H: 25, C: 0.001 },
        { H: 265, C: 0.15 },
      ]
      const result = interpolateAnchors(anchors, { x: 'linear', y: 'linear' }, 2, displayL)
      expect(result[0].vibrancy).toBeCloseTo(0, 1)
    })
  })

  describe('single anchor fallback', () => {
    test('1 anchor → returns exactly 1 output with that anchor hue (via stableHue)', () => {
      const result = interpolateAnchors([{ H: 90, C: 0.10 }], { x: 'linear', y: 'linear' }, 1, displayL)
      expect(result).toHaveLength(1)
      expect(result[0].H).toBeCloseTo(90, 0)
    })

    test('0 anchors → returns []', () => {
      const result = interpolateAnchors([], { x: 'linear', y: 'linear' }, 1, displayL)
      expect(result).toHaveLength(0)
    })
  })

  describe('numHues semantics (total output count)', () => {
    test('2 anchors, numHues=5 → exactly 5 HueOutputs', () => {
      const anchors = [
        { H: 25, C: 0.15 },
        { H: 265, C: 0.15 },
      ]
      const result = interpolateAnchors(anchors, { x: 'sinusoidal', y: 'sinusoidal' }, 5, displayL)
      expect(result).toHaveLength(5)
    })

    test('3 anchors, numHues=8 → exactly 8 HueOutputs', () => {
      const anchors = [
        { H: 25, C: 0.15 },
        { H: 145, C: 0.10 },
        { H: 265, C: 0.15 },
      ]
      const result = interpolateAnchors(anchors, { x: 'sinusoidal', y: 'sinusoidal' }, 8, displayL)
      expect(result).toHaveLength(8)
    })

    test('2 anchors, numHues=2 → exactly 2 HueOutputs (boundary — just endpoints)', () => {
      const anchors = [
        { H: 25, C: 0.15 },
        { H: 265, C: 0.15 },
      ]
      const result = interpolateAnchors(anchors, { x: 'linear', y: 'linear' }, 2, displayL)
      expect(result).toHaveLength(2)
      expect(result[0].H).toBeCloseTo(25, 0)
      expect(result[1].H).toBeCloseTo(265, 0)
    })
  })
})
