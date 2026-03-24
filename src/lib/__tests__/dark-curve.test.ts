import { describe, test, expect } from 'vitest'
import { deriveDarkCurve, resolveDarkCurve } from '@/lib/dark-curve'

const DEFAULT_LIGHT = [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17]
const SPEC_TARGETS = [0.15, 0.21, 0.28, 0.37, 0.48, 0.60, 0.70, 0.79, 0.87, 0.94]

describe('deriveDarkCurve', () => {
  test('default light curve produces values within ±0.02 of spec targets', () => {
    const result = deriveDarkCurve(DEFAULT_LIGHT)
    result.forEach((val, i) => {
      expect(val).toBeCloseTo(SPEC_TARGETS[i], 1)
      expect(Math.abs(val - SPEC_TARGETS[i])).toBeLessThanOrEqual(0.02)
    })
  })

  test('output is strictly increasing', () => {
    const result = deriveDarkCurve(DEFAULT_LIGHT)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThan(result[i - 1])
    }
  })

  test('output is clamped to [0.10, 0.98]', () => {
    const result = deriveDarkCurve(DEFAULT_LIGHT)
    result.forEach(val => {
      expect(val).toBeGreaterThanOrEqual(0.10)
      expect(val).toBeLessThanOrEqual(0.98)
    })
  })

  test('output length equals input length', () => {
    const result = deriveDarkCurve(DEFAULT_LIGHT)
    expect(result).toHaveLength(DEFAULT_LIGHT.length)
  })

  test('non-default curve (8-level) still produces strictly increasing output', () => {
    const eightLevel = [0.95, 0.88, 0.78, 0.65, 0.52, 0.40, 0.30, 0.20]
    const result = deriveDarkCurve(eightLevel)
    expect(result).toHaveLength(8)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThan(result[i - 1])
    }
  })

  test('1-element curve does not crash, returns clamped inverse', () => {
    const result = deriveDarkCurve([0.50])
    expect(result).toHaveLength(1)
    expect(result[0]).toBeCloseTo(0.50, 2)
    expect(result[0]).toBeGreaterThanOrEqual(0.10)
    expect(result[0]).toBeLessThanOrEqual(0.98)
  })

  test('2-element curve does not crash, produces strictly increasing output', () => {
    const result = deriveDarkCurve([0.90, 0.20])
    expect(result).toHaveLength(2)
    expect(result[1]).toBeGreaterThan(result[0])
  })
})

describe('resolveDarkCurve', () => {
  test('empty overrides equals deriveDarkCurve output', () => {
    const derived = deriveDarkCurve(DEFAULT_LIGHT)
    const resolved = resolveDarkCurve(DEFAULT_LIGHT, {})
    expect(resolved).toEqual(derived)
  })

  test('single override replaces that index', () => {
    const resolved = resolveDarkCurve(DEFAULT_LIGHT, { 3: 0.40 })
    const derived = deriveDarkCurve(DEFAULT_LIGHT)
    expect(resolved[3]).toBe(0.40)
    expect(resolved[0]).toBe(derived[0])
    expect(resolved[9]).toBe(derived[9])
  })

  test('all overrides returns the override values', () => {
    const overrides: Record<number, number> = {}
    DEFAULT_LIGHT.forEach((_, i) => { overrides[i] = 0.50 })
    const resolved = resolveDarkCurve(DEFAULT_LIGHT, overrides)
    resolved.forEach(val => expect(val).toBe(0.50))
  })

  test('override at boundary value 0.10 uses 0.10, not derived', () => {
    const resolved = resolveDarkCurve(DEFAULT_LIGHT, { 0: 0.10 })
    expect(resolved[0]).toBe(0.10)
  })
})
