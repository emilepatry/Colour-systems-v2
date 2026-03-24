import { describe, test, expect } from 'vitest'
import { srgbToOklab, oklabToHex, hexToRgb, M1, M2, M3, M4 } from '../index'

describe('sRGB ↔ OKLAB conversion', () => {
  describe('matrix constants', () => {
    test('Linear RGB → LMS matrix matches doc 01 values', () => {
      expect(M1[0][0]).toBe(0.4122214708)
      expect(M1[0][1]).toBe(0.5363325363)
      expect(M1[0][2]).toBe(0.0514459929)
      expect(M1[1][0]).toBe(0.2119034982)
      expect(M1[1][1]).toBe(0.6806995451)
      expect(M1[1][2]).toBe(0.1073969566)
      expect(M1[2][0]).toBe(0.0883024619)
      expect(M1[2][1]).toBe(0.2817188376)
      expect(M1[2][2]).toBe(0.6299787005)
    })

    test('Cube-rooted LMS → OKLAB matrix matches doc 01 values', () => {
      expect(M2[0][0]).toBe(0.2104542553)
      expect(M2[0][1]).toBeCloseTo(0.793617785, 9)
      expect(M2[0][2]).toBe(-0.0040720468)
      expect(M2[1][0]).toBe(1.9779984951)
      expect(M2[1][1]).toBeCloseTo(-2.428592205, 9)
      expect(M2[1][2]).toBe(0.4505937099)
      expect(M2[2][0]).toBe(0.0259040371)
      expect(M2[2][1]).toBe(0.7827717662)
      expect(M2[2][2]).toBeCloseTo(-0.808675766, 9)
    })

    test('OKLAB → cube-rooted LMS matrix matches doc 01 values', () => {
      expect(M3[0][0]).toBe(1.0)
      expect(M3[0][1]).toBe(0.3963377774)
      expect(M3[0][2]).toBe(0.2158037573)
      expect(M3[1][0]).toBe(1.0)
      expect(M3[1][1]).toBe(-0.1055613458)
      expect(M3[1][2]).toBe(-0.0638541728)
      expect(M3[2][0]).toBe(1.0)
      expect(M3[2][1]).toBe(-0.0894841775)
      expect(M3[2][2]).toBeCloseTo(-1.291485548, 9)
    })

    test('LMS → Linear RGB matrix matches doc 01 values', () => {
      expect(M4[0][0]).toBe(4.0767416621)
      expect(M4[0][1]).toBe(-3.3077115913)
      expect(M4[0][2]).toBe(0.2309699292)
      expect(M4[1][0]).toBe(-1.2684380046)
      expect(M4[1][1]).toBe(2.6097574011)
      expect(M4[1][2]).toBe(-0.3413193965)
      expect(M4[2][0]).toBe(-0.0041960863)
      expect(M4[2][1]).toBe(-0.7034186147)
      expect(M4[2][2]).toBeCloseTo(1.707614701, 9)
    })
  })

  describe('forward (sRGB → OKLAB)', () => {
    test('F1 — #000000 (black) → L=0, a=0, b=0', () => {
      const r = srgbToOklab('#000000')
      expect(r.L).toBeCloseTo(0.0, 2)
      expect(r.a).toBeCloseTo(0.0, 2)
      expect(r.b).toBeCloseTo(0.0, 2)
    })

    test('F2 — #ffffff (white) → L=1, a=0, b=0', () => {
      const r = srgbToOklab('#ffffff')
      expect(r.L).toBeCloseTo(1.0, 2)
      expect(r.a).toBeCloseTo(0.0, 2)
      expect(r.b).toBeCloseTo(0.0, 2)
    })

    test('F3 — #ff0000 (red) → L≈0.6280, a≈0.2249, b≈0.1264', () => {
      const r = srgbToOklab('#ff0000')
      expect(r.L).toBeCloseTo(0.6280, 2)
      expect(r.a).toBeCloseTo(0.2249, 2)
      expect(r.b).toBeCloseTo(0.1264, 2)
    })

    test('F4 — #00ff00 (green) → L≈0.8664, a≈-0.2339, b≈0.1794', () => {
      const r = srgbToOklab('#00ff00')
      expect(r.L).toBeCloseTo(0.8664, 2)
      expect(r.a).toBeCloseTo(-0.2339, 2)
      expect(r.b).toBeCloseTo(0.1794, 2)
    })

    test('F5 — #0000ff (blue) → L≈0.4520, a≈-0.0324, b≈-0.3119', () => {
      const r = srgbToOklab('#0000ff')
      expect(r.L).toBeCloseTo(0.4520, 2)
      expect(r.a).toBeCloseTo(-0.0324, 2)
      expect(r.b).toBeCloseTo(-0.3119, 2)
    })

    test('F6 — #808080 (mid-grey) → L≈0.5999, a≈0, b≈0', () => {
      const r = srgbToOklab('#808080')
      expect(r.L).toBeCloseTo(0.5999, 2)
      expect(r.a).toBeCloseTo(0.0, 2)
      expect(r.b).toBeCloseTo(0.0, 2)
    })

    test('F7 — #ffff00 (yellow) → L≈0.9680, a≈-0.0711, b≈0.1986', () => {
      const r = srgbToOklab('#ffff00')
      expect(r.L).toBeCloseTo(0.9680, 2)
      expect(r.a).toBeCloseTo(-0.0711, 2)
      expect(r.b).toBeCloseTo(0.1986, 2)
    })

    test('F8 — #ff00ff (magenta) → L≈0.7017, a≈0.2745, b≈-0.1693', () => {
      const r = srgbToOklab('#ff00ff')
      expect(r.L).toBeCloseTo(0.7017, 2)
      expect(r.a).toBeCloseTo(0.2745, 2)
      expect(r.b).toBeCloseTo(-0.1693, 2)
    })

    test('F9 — #00ffff (cyan) → L≈0.9054, a≈-0.1494, b≈-0.0394', () => {
      const r = srgbToOklab('#00ffff')
      expect(r.L).toBeCloseTo(0.9054, 2)
      expect(r.a).toBeCloseTo(-0.1494, 2)
      expect(r.b).toBeCloseTo(-0.0394, 2)
    })
  })

  describe('reverse (OKLAB → sRGB)', () => {
    test('R1 — (0, 0, 0) → #000000', () => {
      expect(oklabToHex(0, 0, 0)).toBe('#000000')
    })

    test('R2 — (1, 0, 0) → #ffffff', () => {
      expect(oklabToHex(1, 0, 0)).toBe('#ffffff')
    })

    test('R3 — red OKLAB → #ff0000 ±1 per channel', () => {
      const hex = oklabToHex(0.6280, 0.2249, 0.1264)
      const [r, g, b] = hexToRgb(hex)
      expect(Math.abs(r - 255)).toBeLessThanOrEqual(1)
      expect(Math.abs(g - 0)).toBeLessThanOrEqual(1)
      expect(Math.abs(b - 0)).toBeLessThanOrEqual(1)
    })

    test('R4 — mid-grey OKLAB → #808080 ±1 per channel', () => {
      const hex = oklabToHex(0.5999, 0, 0)
      const [r, g, b] = hexToRgb(hex)
      expect(Math.abs(r - 128)).toBeLessThanOrEqual(1)
      expect(Math.abs(g - 128)).toBeLessThanOrEqual(1)
      expect(Math.abs(b - 128)).toBeLessThanOrEqual(1)
    })
  })

  describe('round-trip', () => {
    test('F1–F9 each round-trip within ±1/255 per channel', () => {
      const hexes = [
        '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
        '#808080', '#ffff00', '#ff00ff', '#00ffff',
      ]
      for (const hex of hexes) {
        const oklab = srgbToOklab(hex)
        const roundTripped = oklabToHex(oklab.L, oklab.a, oklab.b)
        const [origR, origG, origB] = hexToRgb(hex)
        const [rtR, rtG, rtB] = hexToRgb(roundTripped)
        expect(Math.abs(origR - rtR)).toBeLessThanOrEqual(1)
        expect(Math.abs(origG - rtG)).toBeLessThanOrEqual(1)
        expect(Math.abs(origB - rtB)).toBeLessThanOrEqual(1)
      }
    })
  })
})
