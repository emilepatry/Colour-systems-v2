import fc from 'fast-check'
import {
  oklchToHex,
  relativeLuminance,
  maxChroma,
  assemblePalette,
  type ScaleEntry,
} from '@/colour-math'

export function buildArbitraryPalette(): fc.Arbitrary<ReturnType<typeof assemblePalette>> {
  return fc.record({
    numHues: fc.integer({ min: 2, max: 6 }),
    hueAngles: fc.array(fc.double({ min: 0, max: 360, noNaN: true }), { minLength: 6, maxLength: 6 }),
    chroma: fc.double({ min: 0, max: 0.30, noNaN: true }),
    curve: fc.array(fc.double({ min: 0.10, max: 0.99, noNaN: true }), { minLength: 10, maxLength: 10 })
      .map(arr => [...arr].sort((a, b) => b - a)),
  }).map(({ numHues, hueAngles, chroma, curve }) => {
    const hueScales: Record<string, ScaleEntry[]> = {}
    for (let h = 0; h < numHues; h++) {
      const H = hueAngles[h]
      hueScales[`hue-${h}`] = curve.map((L, level) => {
        const C = Math.min(chroma, maxChroma(L, H))
        const hex = oklchToHex(L, C, H)
        return {
          level,
          hex,
          oklch: { L, C, H },
          relativeLuminance: relativeLuminance(hex),
        }
      })
    }
    return assemblePalette(hueScales, 'AA', 10, curve, 'max_per_hue', null, true)
  })
}
