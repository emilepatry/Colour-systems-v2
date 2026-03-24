import { describe, test, expect, beforeEach } from 'vitest'
import { usePaletteStore } from '@/store'

describe('tiered validation integration', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  test('moveAnchor during drag uses placeholder cross-validation', () => {
    const store = usePaletteStore.getState()
    store.setActiveAnchorIndex(0)

    usePaletteStore.getState().moveAnchor(0, 180, 0.10)

    const { palette } = usePaletteStore.getState()
    expect(palette).not.toBeNull()
    expect(palette!.crossValidation.allPass).toBe(true)
    expect(palette!.crossValidation.failures).toHaveLength(0)
  })

  test('setActiveAnchorIndex(null) triggers full cross-validation', () => {
    const store = usePaletteStore.getState()
    store.setActiveAnchorIndex(0)
    store.moveAnchor(0, 180, 0.10)

    usePaletteStore.getState().setActiveAnchorIndex(null)

    const { palette } = usePaletteStore.getState()
    expect(palette).not.toBeNull()
    expect(palette!.crossValidation).toHaveProperty('allPass')
    expect(Array.isArray(palette!.crossValidation.failures)).toBe(true)
  })

  test('moveAnchor without drag runs full cross-validation', () => {
    usePaletteStore.getState().moveAnchor(0, 180, 0.10)

    const { palette } = usePaletteStore.getState()
    expect(palette).not.toBeNull()
    expect(palette!.crossValidation).toHaveProperty('allPass')
  })
})

describe('undo coalescing for lightness curve drag', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  test('paused temporal coalesces multiple updates into one undo step', () => {
    const initial = usePaletteStore.getState().lightnessCurve

    usePaletteStore.temporal.getState().pause()

    const curves = [
      [0.96, 0.92, 0.86, 0.77, 0.67, 0.55, 0.44, 0.35, 0.26, 0.16],
      [0.95, 0.91, 0.85, 0.76, 0.66, 0.54, 0.43, 0.34, 0.25, 0.15],
      [0.94, 0.90, 0.84, 0.75, 0.65, 0.53, 0.42, 0.33, 0.24, 0.14],
      [0.93, 0.89, 0.83, 0.74, 0.64, 0.52, 0.41, 0.32, 0.23, 0.13],
      [0.92, 0.88, 0.82, 0.73, 0.63, 0.51, 0.40, 0.31, 0.22, 0.12],
    ]

    for (const curve of curves) {
      usePaletteStore.getState().updateLightnessCurve(curve, true)
    }

    usePaletteStore.temporal.getState().resume()

    expect(usePaletteStore.getState().lightnessCurve).toEqual(curves[curves.length - 1])

    usePaletteStore.temporal.getState().undo()

    expect(usePaletteStore.getState().lightnessCurve).toEqual(initial)
  })
})

describe('easing integration', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  test('setEasing changes store easing and produces different hueOutputs', () => {
    const before = usePaletteStore.getState()
    expect(before.easing.x).toBe('sinusoidal')

    usePaletteStore.getState().setEasing('x', 'exponential')

    const after = usePaletteStore.getState()
    expect(after.easing.x).toBe('exponential')
    expect(after.hueOutputs).not.toEqual(before.hueOutputs)
  })
})

describe('updateLightnessCurve', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  test('new curve produces different scale hex values', () => {
    const before = usePaletteStore.getState().palette
    expect(before).not.toBeNull()

    const newCurve = [0.95, 0.90, 0.83, 0.74, 0.64, 0.52, 0.41, 0.32, 0.23, 0.13]
    usePaletteStore.getState().updateLightnessCurve(newCurve)

    const after = usePaletteStore.getState().palette
    expect(after).not.toBeNull()
    expect(after!.scales['hue-0'][0].hex).not.toBe(before!.scales['hue-0'][0].hex)
  })

  test('skipCrossValidation during curve update skips cross-hue checks', () => {
    usePaletteStore.getState().updateLightnessCurve(
      [0.95, 0.90, 0.83, 0.74, 0.64, 0.52, 0.41, 0.32, 0.23, 0.13],
      true,
    )

    const { palette } = usePaletteStore.getState()
    expect(palette).not.toBeNull()
    expect(palette!.crossValidation.allPass).toBe(true)
    expect(palette!.crossValidation.failures).toHaveLength(0)
  })
})
