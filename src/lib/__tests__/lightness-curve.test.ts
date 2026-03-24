import { describe, test, expect } from 'vitest'
import { clampCurvePoint } from '@/lib/lightness-curve'

const DEFAULT_CURVE = [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17]

describe('clampCurvePoint', () => {
  test('dragging level 5 above level 4 clamps to just below level 4', () => {
    const result = clampCurvePoint(DEFAULT_CURVE, 5, 0.80)
    expect(result).toBeLessThan(DEFAULT_CURVE[4])
    expect(result).toBeCloseTo(DEFAULT_CURVE[4] - 0.001, 3)
  })

  test('dragging level 5 below level 6 clamps to just above level 6', () => {
    const result = clampCurvePoint(DEFAULT_CURVE, 5, 0.30)
    expect(result).toBeGreaterThan(DEFAULT_CURVE[6])
    expect(result).toBeCloseTo(DEFAULT_CURVE[6] + 0.001, 3)
  })

  test('dragging level 0 above 0.99 clamps to 0.99', () => {
    const result = clampCurvePoint(DEFAULT_CURVE, 0, 1.5)
    expect(result).toBe(0.99)
  })

  test('dragging level 9 below 0.05 clamps to 0.05', () => {
    const result = clampCurvePoint(DEFAULT_CURVE, 9, -0.1)
    expect(result).toBe(0.05)
  })

  test('value within valid range is returned unchanged', () => {
    const result = clampCurvePoint(DEFAULT_CURVE, 5, 0.60)
    expect(result).toBe(0.60)
  })

  test('curve remains strictly decreasing after clamping any point', () => {
    for (let i = 0; i < DEFAULT_CURVE.length; i++) {
      const clamped = clampCurvePoint(DEFAULT_CURVE, i, 0.50)
      const newCurve = [...DEFAULT_CURVE]
      newCurve[i] = clamped
      for (let j = 1; j < newCurve.length; j++) {
        expect(newCurve[j - 1]).toBeGreaterThan(newCurve[j])
      }
    }
  })
})

const ASCENDING_CURVE = [0.15, 0.21, 0.28, 0.36, 0.44, 0.55, 0.65, 0.75, 0.84, 0.94]

describe('clampCurvePoint ascending', () => {
  test('value above next point clamps below it', () => {
    const result = clampCurvePoint(ASCENDING_CURVE, 5, 0.80, true)
    expect(result).toBeLessThan(ASCENDING_CURVE[6])
    expect(result).toBeCloseTo(ASCENDING_CURVE[6] - 0.001, 3)
  })

  test('value below previous point clamps above it', () => {
    const result = clampCurvePoint(ASCENDING_CURVE, 5, 0.30, true)
    expect(result).toBeGreaterThan(ASCENDING_CURVE[4])
    expect(result).toBeCloseTo(ASCENDING_CURVE[4] + 0.001, 3)
  })

  test('boundary min/max respected', () => {
    const topResult = clampCurvePoint(ASCENDING_CURVE, 9, 1.5, true)
    expect(topResult).toBe(0.99)

    const bottomResult = clampCurvePoint(ASCENDING_CURVE, 0, -0.1, true)
    expect(bottomResult).toBe(0.05)
  })

  test('curve stays strictly increasing after clamping any point', () => {
    for (let i = 0; i < ASCENDING_CURVE.length; i++) {
      const clamped = clampCurvePoint(ASCENDING_CURVE, i, 0.50, true)
      const newCurve = [...ASCENDING_CURVE]
      newCurve[i] = clamped
      for (let j = 1; j < newCurve.length; j++) {
        expect(newCurve[j]).toBeGreaterThan(newCurve[j - 1])
      }
    }
  })
})
