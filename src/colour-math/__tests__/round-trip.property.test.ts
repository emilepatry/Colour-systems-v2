import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  srgbDecode,
  srgbEncode,
  srgbToOklch,
  oklchToHex,
  hexToRgb,
  oklchToLinearRgb,
  isInGamut,
  maxChroma,
  wcagContrastRatio,
  relativeLuminance,
} from '../index'

const arbSrgbByte = fc.integer({ min: 0, max: 255 })

const arbSrgbHex = fc
  .tuple(arbSrgbByte, arbSrgbByte, arbSrgbByte)
  .map(
    ([r, g, b]) =>
      `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
  )

const arbLH_interior = fc.tuple(
  fc.double({ min: 0.05, max: 0.95, noNaN: true }),
  fc.double({ min: 0, max: 359.99, noNaN: true, noDefaultInfinity: true }),
)

const arbLH = fc.tuple(
  fc.double({ min: 0, max: 1, noNaN: true }),
  fc.double({ min: 0, max: 359.99, noNaN: true, noDefaultInfinity: true }),
)

const arbInGamutOklch = arbLH.chain(([L, H]) => {
  const cMax = maxChroma(L, H)
  if (cMax < 1e-10) return fc.constant({ L, C: 0, H })
  return fc
    .double({ min: 0, max: cMax, noNaN: true })
    .map((C) => ({ L, C, H }))
})

describe('round-trip property tests (fast-check)', () => {
  test('P1 — sRGB linearisation round-trip: encode(decode(v/255)) ≈ v/255 for any byte', () => {
    fc.assert(
      fc.property(arbSrgbByte, (v) => {
        const normalised = v / 255
        const roundTripped = srgbEncode(srgbDecode(normalised))
        expect(Math.abs(roundTripped - normalised)).toBeLessThanOrEqual(1 / 255)
      }),
      { numRuns: 1000 },
    )
  })

  test('P2 — full pipeline round-trip: oklch_to_srgb(srgb_to_oklch(hex)) ≈ original for any hex', () => {
    fc.assert(
      fc.property(arbSrgbHex, (hex) => {
        const oklch = srgbToOklch(hex)
        const roundTripped = oklchToHex(oklch.L, oklch.C, oklch.H)
        const [origR, origG, origB] = hexToRgb(hex)
        const [rtR, rtG, rtB] = hexToRgb(roundTripped)
        expect(Math.abs(origR - rtR)).toBeLessThanOrEqual(1)
        expect(Math.abs(origG - rtG)).toBeLessThanOrEqual(1)
        expect(Math.abs(origB - rtB)).toBeLessThanOrEqual(1)
      }),
      { numRuns: 1000 },
    )
  })

  test('P3 — gamut containment: oklch_to_srgb of in-gamut OKLCH produces channels in [0, 1]', () => {
    fc.assert(
      fc.property(arbInGamutOklch, ({ L, C, H }) => {
        const { r, g, b } = oklchToLinearRgb(L, C, H)
        expect(r).toBeGreaterThanOrEqual(-1e-9)
        expect(r).toBeLessThanOrEqual(1 + 1e-9)
        expect(g).toBeGreaterThanOrEqual(-1e-9)
        expect(g).toBeLessThanOrEqual(1 + 1e-9)
        expect(b).toBeGreaterThanOrEqual(-1e-9)
        expect(b).toBeLessThanOrEqual(1 + 1e-9)
      }),
      { numRuns: 1000 },
    )
  })

  test('P4 — max_chroma boundary: max_chroma(L,H) is in gamut, max_chroma(L,H)+0.001 is not', () => {
    fc.assert(
      fc.property(arbLH_interior, ([L, H]) => {
        const cMax = maxChroma(L, H)
        const { r: r1, g: g1, b: b1 } = oklchToLinearRgb(L, cMax, H)
        expect(isInGamut(r1, g1, b1)).toBe(true)

        const { r: r2, g: g2, b: b2 } = oklchToLinearRgb(L, cMax + 0.001, H)
        expect(isInGamut(r2, g2, b2)).toBe(false)
      }),
      { numRuns: 1000 },
    )
  })

  test('P5 — contrast symmetry: wcag_contrast(a, b) === wcag_contrast(b, a)', () => {
    fc.assert(
      fc.property(arbSrgbHex, arbSrgbHex, (hexA, hexB) => {
        expect(wcagContrastRatio(hexA, hexB)).toBe(
          wcagContrastRatio(hexB, hexA),
        )
      }),
      { numRuns: 1000 },
    )
  })

  test('P6 — contrast identity: wcag_contrast(a, a) === 1.0', () => {
    fc.assert(
      fc.property(arbSrgbHex, (hex) => {
        expect(wcagContrastRatio(hex, hex)).toBe(1.0)
      }),
      { numRuns: 1000 },
    )
  })

  test('P7 — contrast monotonicity: white has higher contrast than grey against any dark colour', () => {
    const greyLuminance = relativeLuminance('#808080')
    const arbDarkHex = arbSrgbHex.filter(
      (hex) => relativeLuminance(hex) < greyLuminance,
    )

    fc.assert(
      fc.property(arbDarkHex, (hex) => {
        expect(
          wcagContrastRatio('#ffffff', hex),
        ).toBeGreaterThanOrEqual(wcagContrastRatio('#808080', hex))
      }),
      { numRuns: 1000 },
    )
  })
})
