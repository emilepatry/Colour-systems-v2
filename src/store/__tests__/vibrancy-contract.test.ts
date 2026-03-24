import { describe, test, expect } from 'vitest'
import { interpolateAnchors } from '@/engine-a'
import { maxChroma, oklchToHex } from '@/colour-math'

const LIGHTNESS_CURVE = [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17]

describe('vibrancy contract', () => {
  test('chosenChroma = vibrancy × maxChroma(lightnessCurve[level], H) at every cell', () => {
    const anchors = [
      { H: 25, C: 0.15 },
      { H: 265, C: 0.15 },
    ]
    const hueOutputs = interpolateAnchors(anchors, { x: 'sinusoidal', y: 'sinusoidal' }, 3, 0.56)

    for (const { H, vibrancy } of hueOutputs) {
      for (let level = 0; level < LIGHTNESS_CURVE.length; level++) {
        const L = LIGHTNESS_CURVE[level]
        const expectedC = vibrancy * maxChroma(L, H)
        const expectedHex = oklchToHex(L, expectedC, H)

        const actualHex = oklchToHex(L, expectedC, H)
        expect(actualHex).toBe(expectedHex)

        expect(expectedC).toBeLessThanOrEqual(maxChroma(L, H) + 0.0001)
        expect(expectedC).toBeGreaterThanOrEqual(0)
      }
    }
  })

  test('vibrancy is re-evaluated at each level lightness, not at displayL', () => {
    const anchors = [{ H: 90, C: 0.10 }]
    const displayL = 0.56
    const hueOutputs = interpolateAnchors(anchors, { x: 'linear', y: 'linear' }, 1, displayL)
    const { H, vibrancy } = hueOutputs[0]

    const cmaxAtDisplayL = maxChroma(displayL, H)
    const cmaxAtLevel0 = maxChroma(LIGHTNESS_CURVE[0], H)  // L=0.97
    const cmaxAtLevel9 = maxChroma(LIGHTNESS_CURVE[9], H)  // L=0.17

    const chromaLevel0 = vibrancy * cmaxAtLevel0
    const chromaLevel9 = vibrancy * cmaxAtLevel9

    // These should NOT equal vibrancy × cmaxAtDisplayL
    expect(chromaLevel0).not.toBeCloseTo(vibrancy * cmaxAtDisplayL, 3)
    expect(chromaLevel9).not.toBeCloseTo(vibrancy * cmaxAtDisplayL, 3)

    // But they should be in gamut at their respective levels
    expect(chromaLevel0).toBeLessThanOrEqual(cmaxAtLevel0 + 0.0001)
    expect(chromaLevel9).toBeLessThanOrEqual(cmaxAtLevel9 + 0.0001)
  })

  test('uniform chroma strategy caps to minimum vibrancy-scaled chroma across hues', () => {
    const anchors = [
      { H: 25, C: 0.18 },
      { H: 265, C: 0.18 },
    ]
    const hueOutputs = interpolateAnchors(anchors, { x: 'linear', y: 'linear' }, 3, 0.56)

    for (let level = 0; level < LIGHTNESS_CURVE.length; level++) {
      const L = LIGHTNESS_CURVE[level]
      const vibrancyScaledChromas = hueOutputs.map(
        ({ H, vibrancy }) => vibrancy * maxChroma(L, H),
      )
      const uniformCap = Math.min(...vibrancyScaledChromas)

      for (const c of vibrancyScaledChromas) {
        expect(uniformCap).toBeLessThanOrEqual(c + 0.0001)
      }
    }
  })
})
