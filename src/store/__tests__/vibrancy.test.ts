import { describe, test, expect, beforeEach } from 'vitest'
import { usePaletteStore } from '@/store'

describe('globalVibrancy', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  test('default globalVibrancy is 1.0', () => {
    expect(usePaletteStore.getState().globalVibrancy).toBe(1.0)
  })

  test('setGlobalVibrancy(0.5) approximately halves chosen chromas', () => {
    const fullPalette = usePaletteStore.getState().palette!
    const fullChroma = fullPalette.scales['hue-0'][5].oklch.C

    usePaletteStore.getState().setGlobalVibrancy(0.5)
    const halfPalette = usePaletteStore.getState().palette!
    const halfChroma = halfPalette.scales['hue-0'][5].oklch.C

    expect(halfChroma).toBeCloseTo(fullChroma * 0.5, 4)
  })

  test('setGlobalVibrancy(0) produces achromatic chromatic scales', () => {
    usePaletteStore.getState().setGlobalVibrancy(0)
    const palette = usePaletteStore.getState().palette!

    for (const [name, scale] of Object.entries(palette.scales)) {
      if (name === 'neutral') continue
      for (const entry of scale) {
        expect(entry.oklch.C).toBeCloseTo(0, 6)
      }
    }
  })

  test('globalVibrancy is restored on undo', () => {
    usePaletteStore.getState().setGlobalVibrancy(0.3)
    expect(usePaletteStore.getState().globalVibrancy).toBe(0.3)

    usePaletteStore.temporal.getState().undo()
    expect(usePaletteStore.getState().globalVibrancy).toBe(1.0)
  })

  test('globalVibrancy = 0 with uniform strategy produces valid palette', () => {
    usePaletteStore.getState().setChromaStrategy('uniform')
    usePaletteStore.getState().setGlobalVibrancy(0)
    const palette = usePaletteStore.getState().palette!

    expect(palette).not.toBeNull()
    for (const scale of Object.values(palette.scales)) {
      for (const entry of scale) {
        expect(Number.isNaN(entry.oklch.C)).toBe(false)
        expect(Number.isNaN(entry.oklch.L)).toBe(false)
        expect(entry.hex).toMatch(/^#[0-9a-f]{6}$/)
      }
    }
  })
})
