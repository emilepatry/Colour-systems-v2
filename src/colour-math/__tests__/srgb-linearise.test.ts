import { describe, test, expect } from 'vitest'
import { srgbDecode, srgbEncode } from '../index'

describe('sRGB linearisation', () => {
  describe('decode (sRGB → linear)', () => {
    test('D1 — byte 0 (black boundary) → 0.0', () => {
      expect(srgbDecode(0 / 255)).toBeCloseTo(0.0, 5)
    })

    test('D2 — byte 255 (white boundary) → 1.0', () => {
      expect(srgbDecode(255 / 255)).toBeCloseTo(1.0, 5)
    })

    test('D3 — byte 128 (mid-grey) → 0.21586', () => {
      expect(srgbDecode(128 / 255)).toBeCloseTo(0.21586, 5)
    })

    test('D4 — byte 10 (below threshold, linear segment) → 0.003035', () => {
      expect(srgbDecode(10 / 255)).toBeCloseTo(0.003035, 5)
    })

    test('D5 — byte 11 (above threshold, gamma segment) → 0.003347', () => {
      expect(srgbDecode(11 / 255)).toBeCloseTo(0.003347, 5)
    })

    test('D6 — byte 1 (near-black) → 0.000304', () => {
      expect(srgbDecode(1 / 255)).toBeCloseTo(0.000304, 5)
    })

    test('D7 — byte 254 (near-white) → 0.99110', () => {
      expect(srgbDecode(254 / 255)).toBeCloseTo(0.99110, 5)
    })

    test('D8 — byte 188 (~50% linear) → 0.50289', () => {
      expect(srgbDecode(188 / 255)).toBeCloseTo(0.50289, 4)
    })
  })

  describe('encode (linear → sRGB)', () => {
    test('E1 — 0.0 → 0.0 (black boundary)', () => {
      expect(srgbEncode(0.0)).toBeCloseTo(0.0, 5)
    })

    test('E2 — 1.0 → 1.0 (white boundary)', () => {
      expect(srgbEncode(1.0)).toBeCloseTo(1.0, 5)
    })

    test('E3 — 0.21586 → 0.50196 (round-trip of D3)', () => {
      expect(srgbEncode(0.21586)).toBeCloseTo(0.50196, 5)
    })

    test('E4 — 0.003035 → 0.03921 (round-trip of D4)', () => {
      expect(srgbEncode(0.003035)).toBeCloseTo(0.03921, 5)
    })

    test('E5 — 0.003347 → 0.04314 (round-trip of D5)', () => {
      expect(srgbEncode(0.003347)).toBeCloseTo(0.04314, 5)
    })

    test('E6 — 0.0031308 → 0.04045 (exact encode threshold)', () => {
      expect(srgbEncode(0.0031308)).toBeCloseTo(0.04045, 5)
    })
  })

  describe('threshold boundary', () => {
    test('T1 — decode(0.04045) uses linear branch', () => {
      expect(srgbDecode(0.04045)).toBeCloseTo(0.04045 / 12.92, 10)
    })

    test('T2 — decode(0.04046) uses gamma branch', () => {
      expect(srgbDecode(0.04046)).toBeCloseTo(
        ((0.04046 + 0.055) / 1.055) ** 2.4,
        10,
      )
    })

    test('T3 — encode(0.0031308) uses linear branch', () => {
      expect(srgbEncode(0.0031308)).toBeCloseTo(12.92 * 0.0031308, 10)
    })

    test('T4 — encode(0.0031309) uses gamma branch', () => {
      expect(srgbEncode(0.0031309)).toBeCloseTo(
        1.055 * 0.0031309 ** (1 / 2.4) - 0.055,
        10,
      )
    })
  })
})
