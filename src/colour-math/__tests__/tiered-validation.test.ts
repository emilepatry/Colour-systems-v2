import { describe, test, expect } from 'vitest'
import {
  assemblePalette,
  generatePalette,
  type PaletteInput,
} from '@/colour-math'

const LIGHTNESS_CURVE = [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17]

const TEST_INPUT: PaletteInput = {
  hues: [
    { name: 'red', H: 25 },
    { name: 'blue', H: 265 },
  ],
  numLevels: 10,
  compliance: 'AA',
  lightnessCurve: LIGHTNESS_CURVE,
  chromaStrategy: 'max_per_hue',
  neutralHue: null,
}

describe('assemblePalette tiered validation', () => {
  test('skipCrossValidation=true returns placeholder crossValidation', () => {
    const full = generatePalette(TEST_INPUT)
    const result = assemblePalette(
      { ...full.scales },
      'AA',
      10,
      LIGHTNESS_CURVE,
      'max_per_hue',
      null,
      true,
    )
    expect(result.crossValidation.allPass).toBe(true)
    expect(result.crossValidation.failures).toHaveLength(0)
  })

  test('skipCrossValidation=false runs actual cross-validation', () => {
    const full = generatePalette(TEST_INPUT)
    const result = assemblePalette(
      { ...full.scales },
      'AA',
      10,
      LIGHTNESS_CURVE,
      'max_per_hue',
      null,
      false,
    )
    expect(result.crossValidation).toHaveProperty('allPass')
    expect(result.crossValidation).toHaveProperty('failures')
    expect(Array.isArray(result.crossValidation.failures)).toBe(true)
  })

  test('intra-validation always runs regardless of skipCrossValidation', () => {
    const full = generatePalette(TEST_INPUT)
    const skipped = assemblePalette(
      { ...full.scales },
      'AA',
      10,
      LIGHTNESS_CURVE,
      'max_per_hue',
      null,
      true,
    )
    const notSkipped = assemblePalette(
      { ...full.scales },
      'AA',
      10,
      LIGHTNESS_CURVE,
      'max_per_hue',
      null,
      false,
    )
    expect(skipped.intraValidation).toEqual(notSkipped.intraValidation)
  })
})
