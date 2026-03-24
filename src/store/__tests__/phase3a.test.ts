import { describe, test, expect, beforeEach } from 'vitest'
import { usePaletteStore } from '@/store'
import { deriveDarkCurve } from '@/lib/dark-curve'

describe('Phase 3a-i: dark mode data layer', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  test('initial state has darkLightnessCurve with 10 entries', () => {
    const { darkLightnessCurve } = usePaletteStore.getState()
    expect(darkLightnessCurve).not.toBeNull()
    expect(darkLightnessCurve).toHaveLength(10)
  })

  test('initial state darkPalette is not null, has same scale keys as palette', () => {
    const { palette, darkPalette } = usePaletteStore.getState()
    expect(palette).not.toBeNull()
    expect(darkPalette).not.toBeNull()
    expect(Object.keys(darkPalette!.scales).sort()).toEqual(
      Object.keys(palette!.scales).sort(),
    )
  })

  test('darkLightnessCurve differs from lightnessCurve', () => {
    const { lightnessCurve, darkLightnessCurve } = usePaletteStore.getState()
    expect(darkLightnessCurve).not.toEqual(lightnessCurve)
  })

  test('darkPalette uses dark curve L values at surface level', () => {
    const { darkPalette, darkLightnessCurve } = usePaletteStore.getState()
    expect(darkPalette).not.toBeNull()
    const hue0Level0 = darkPalette!.scales['hue-0'][0]
    expect(hue0Level0.oklch.L).toBeCloseTo(darkLightnessCurve[0], 6)
  })

  test('darkOptimization is not null at init', () => {
    const { darkOptimization } = usePaletteStore.getState()
    expect(darkOptimization).not.toBeNull()
  })

  test('setActiveMode sets mode without re-derivation', () => {
    const before = usePaletteStore.getState()
    const beforePalette = before.palette
    const beforeDarkPalette = before.darkPalette

    usePaletteStore.getState().setActiveMode('dark')

    const after = usePaletteStore.getState()
    expect(after.activeMode).toBe('dark')
    expect(after.palette).toBe(beforePalette)
    expect(after.darkPalette).toBe(beforeDarkPalette)
  })

  test('setDarkCurveOverride triggers re-derivation with overridden value', () => {
    usePaletteStore.getState().setDarkCurveOverride(5, 0.55)

    const state = usePaletteStore.getState()
    expect(state.darkCurveOverrides).toHaveProperty('5', 0.55)
    expect(state.darkLightnessCurve[5]).toBe(0.55)
    expect(state.darkPalette).not.toBeNull()
  })

  test('after setDarkCurveOverride, light palette is unchanged', () => {
    const beforeHex = usePaletteStore.getState().palette!.scales['hue-0'][5].hex

    usePaletteStore.getState().setDarkCurveOverride(5, 0.55)

    const afterHex = usePaletteStore.getState().palette!.scales['hue-0'][5].hex
    expect(afterHex).toBe(beforeHex)
  })

  test('clearDarkCurveOverrides resets to derived curve', () => {
    usePaletteStore.getState().setDarkCurveOverride(5, 0.55)
    expect(usePaletteStore.getState().darkLightnessCurve[5]).toBe(0.55)

    usePaletteStore.getState().clearDarkCurveOverrides()

    const state = usePaletteStore.getState()
    expect(state.darkCurveOverrides).toEqual({})
    const expected = deriveDarkCurve(state.lightnessCurve)
    expect(state.darkLightnessCurve).toEqual(expected)
  })

  test('during drag, darkOptimization is null (Engine C skipped for both modes)', () => {
    usePaletteStore.getState().setActiveAnchorIndex(0)
    usePaletteStore.getState().moveAnchor(0, 180, 0.10)

    const { optimization, darkOptimization } = usePaletteStore.getState()
    expect(optimization).toBeNull()
    expect(darkOptimization).toBeNull()
  })

  test('activeMode is included in undo snapshots', () => {
    usePaletteStore.getState().setActiveMode('dark')
    usePaletteStore.temporal.getState().undo()

    expect(usePaletteStore.getState().activeMode).toBe('light')
  })

  test('undo atomicity: toggle dark → set override → undo → undo', () => {
    usePaletteStore.getState().setActiveMode('dark')
    expect(usePaletteStore.getState().activeMode).toBe('dark')

    usePaletteStore.getState().setDarkCurveOverride(5, 0.55)
    expect(usePaletteStore.getState().darkLightnessCurve[5]).toBe(0.55)

    usePaletteStore.temporal.getState().undo()
    expect(usePaletteStore.getState().darkCurveOverrides).toEqual({})
    expect(usePaletteStore.getState().activeMode).toBe('dark')

    usePaletteStore.temporal.getState().undo()
    expect(usePaletteStore.getState().activeMode).toBe('light')
  })

  test('extreme displayL (0.95) produces valid dark palette entries', () => {
    usePaletteStore.getState().setDisplayL(0.95)

    const { darkPalette } = usePaletteStore.getState()
    expect(darkPalette).not.toBeNull()
    for (const scale of Object.values(darkPalette!.scales)) {
      for (const entry of scale) {
        expect(Number.isNaN(entry.oklch.C)).toBe(false)
        expect(entry.oklch.C).toBeGreaterThanOrEqual(0)
      }
    }
  })
})
