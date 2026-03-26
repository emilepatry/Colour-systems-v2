import { describe, test, expect, beforeEach } from 'vitest'
import { PRESETS } from '@/lib/presets'
import { maxChroma, srgbToOklch } from '@/colour-math'
import { usePaletteStore } from '@/store'

const DISPLAY_L = 0.56

describe('D3.3: preset configure(null, displayL)', () => {
  test('all 12 presets are defined', () => {
    expect(PRESETS).toHaveLength(12)
  })

  test.each(PRESETS.map((p) => [p.id, p] as const))(
    '%s produces valid anchors with C within maxChroma bounds',
    (_, preset) => {
      const config = preset.configure(null, DISPLAY_L)

      expect(config.anchors.length).toBeGreaterThanOrEqual(2)

      for (const anchor of config.anchors) {
        expect(anchor.H).toBeGreaterThanOrEqual(0)
        expect(anchor.H).toBeLessThan(360)
        expect(anchor.C).toBeGreaterThanOrEqual(0)
        const maxC = maxChroma(DISPLAY_L, anchor.H)
        expect(anchor.C).toBeLessThanOrEqual(maxC + 0.001)
      }

      expect(config.numHues).toBeGreaterThanOrEqual(2)
      expect(config.numHues).toBeLessThanOrEqual(10)
      expect(config.globalVibrancy).toBeGreaterThanOrEqual(0)
      expect(config.globalVibrancy).toBeLessThanOrEqual(1)
    },
  )
})

describe('D3.3: preset configure(baseH, displayL)', () => {
  const baseH = 120

  test.each(PRESETS.map((p) => [p.id, p] as const))(
    '%s orients around the given hue',
    (_, preset) => {
      const config = preset.configure(baseH, DISPLAY_L)
      const hasBaseHue = config.anchors.some(
        (a) => Math.abs(a.H - baseH) < 1 || Math.abs(a.H - baseH - 360) < 1,
      )
      expect(hasBaseHue).toBe(true)
    },
  )
})

describe('D3.3: all presets produce anchors with H in [0, 360)', () => {
  test.each(PRESETS.map((p) => [p.id, p] as const))(
    '%s: H values are in [0, 360)',
    (_, preset) => {
      for (const baseH of [null, 0, 45, 120, 200, 300, 359]) {
        const config = preset.configure(baseH, DISPLAY_L)
        for (const anchor of config.anchors) {
          expect(anchor.H).toBeGreaterThanOrEqual(0)
          expect(anchor.H).toBeLessThan(360)
        }
      }
    },
  )
})

describe('D3.3: applyPreset store integration', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
    usePaletteStore.temporal.getState().clear()
  })

  test('applying a preset updates anchors, easing, vibrancy, and hue count', () => {
    const preset = PRESETS.find((p) => p.id === 'complementary')!
    usePaletteStore.getState().applyPreset(preset)
    const state = usePaletteStore.getState()
    expect(state.numHues).toBe(4)
    expect(state.globalVibrancy).toBe(0.9)
    expect(state.easing).toEqual({ x: 'sinusoidal', y: 'sinusoidal' })
  })

  test('applyPreset with baseHex: anchors[0] matches actual baseHex OKLCH', () => {
    const hex = '#4F46E5'
    usePaletteStore.getState().setBaseHex(hex)
    const { H: expectedH, C: expectedC } = srgbToOklch(hex)

    const preset = PRESETS.find((p) => p.id === 'complementary')!
    usePaletteStore.getState().applyPreset(preset)
    const state = usePaletteStore.getState()

    expect(state.anchors[0].H).toBeCloseTo(expectedH, 5)
    expect(state.anchors[0].C).toBeCloseTo(expectedC, 5)
  })

  test('preset application is undoable (single undo step)', () => {
    const stateBefore = {
      anchors: [...usePaletteStore.getState().anchors],
      numHues: usePaletteStore.getState().numHues,
      globalVibrancy: usePaletteStore.getState().globalVibrancy,
    }

    const preset = PRESETS.find((p) => p.id === 'full-spectrum')!
    usePaletteStore.getState().applyPreset(preset)
    expect(usePaletteStore.getState().numHues).toBe(9)

    usePaletteStore.temporal.getState().undo()
    const restored = usePaletteStore.getState()
    expect(restored.numHues).toBe(stateBefore.numHues)
    expect(restored.globalVibrancy).toBe(stateBefore.globalVibrancy)
  })
})
