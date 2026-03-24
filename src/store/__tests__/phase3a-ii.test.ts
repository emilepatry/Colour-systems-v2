import { describe, test, expect, beforeEach } from 'vitest'
import { usePaletteStore } from '@/store'

describe('Phase 3a-ii: dark mode UI integration', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  test('setDarkCurveOverride with skip=true produces null darkOptimization', () => {
    usePaletteStore.getState().setDarkCurveOverride(5, 0.55, true)

    const { darkOptimization } = usePaletteStore.getState()
    expect(darkOptimization).toBeNull()
  })

  test('setDarkCurveOverride with skip=false produces non-null darkOptimization', () => {
    usePaletteStore.getState().setDarkCurveOverride(5, 0.55, false)

    const { darkOptimization } = usePaletteStore.getState()
    expect(darkOptimization).not.toBeNull()
  })

  test('darkDisplayL is approximately the midpoint of darkLightnessCurve', () => {
    const { darkLightnessCurve, darkDisplayL } = usePaletteStore.getState()
    const midIndex = Math.floor(darkLightnessCurve.length / 2)
    expect(darkDisplayL).toBeCloseTo(darkLightnessCurve[midIndex], 6)
  })

  test('darkDisplayL updates when light curve changes', () => {
    const before = usePaletteStore.getState().darkDisplayL

    const newCurve = [0.95, 0.90, 0.82, 0.72, 0.60, 0.48, 0.38, 0.30, 0.22, 0.12]
    usePaletteStore.getState().updateLightnessCurve(newCurve)

    const after = usePaletteStore.getState().darkDisplayL
    expect(after).not.toBe(before)
  })

  test('darkDisplayL updates when dark curve override applied', () => {
    const before = usePaletteStore.getState().darkDisplayL

    usePaletteStore.getState().setDarkCurveOverride(5, 0.80)

    const state = usePaletteStore.getState()
    const midIndex = Math.floor(state.darkLightnessCurve.length / 2)
    expect(state.darkDisplayL).toBeCloseTo(state.darkLightnessCurve[midIndex], 6)
    expect(state.darkDisplayL).not.toBe(before)
  })
})
