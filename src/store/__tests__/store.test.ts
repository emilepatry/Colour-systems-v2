import { describe, test, expect, beforeEach } from 'vitest'
import { usePaletteStore } from '@/store'

describe('store derivation', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  test('initial state has derived palette', () => {
    const state = usePaletteStore.getState()
    expect(state.palette).not.toBeNull()
    expect(state.hueOutputs.length).toBeGreaterThan(0)
    expect(state.gamutBoundary).toHaveLength(360)
  })

  test('palette has expected scale structure', () => {
    const { palette } = usePaletteStore.getState()
    expect(palette).not.toBeNull()
    expect(palette!.scales).toHaveProperty('hue-0')
    expect(palette!.scales).toHaveProperty('neutral')
    expect(palette!.scales['hue-0']).toHaveLength(10)
    expect(palette!.scales.neutral).toHaveLength(10)
  })

  test('moveAnchor triggers re-derivation', () => {
    const before = usePaletteStore.getState().palette
    usePaletteStore.getState().moveAnchor(0, 180, 0.10)
    const after = usePaletteStore.getState().palette
    expect(after).not.toBe(before)
    expect(after!.scales['hue-0'][5].hex).not.toBe(before!.scales['hue-0'][5].hex)
  })

  test('gamutBoundary depends only on displayL', () => {
    const g1 = usePaletteStore.getState().gamutBoundary
    usePaletteStore.getState().moveAnchor(0, 180, 0.10)
    const g2 = usePaletteStore.getState().gamutBoundary
    expect(g2).toEqual(g1)
  })

  test('changing displayL updates gamutBoundary', () => {
    const g1 = usePaletteStore.getState().gamutBoundary
    usePaletteStore.getState().setDisplayL(0.30)
    const g2 = usePaletteStore.getState().gamutBoundary
    expect(g2).not.toEqual(g1)
  })

  test('setCompliance changes palette validation thresholds', () => {
    usePaletteStore.getState().setCompliance('AAA')
    const { palette } = usePaletteStore.getState()
    expect(palette!.meta.compliance).toBe('AAA')
    expect(palette!.meta.contrastRules.textMinDistance).toBe(6)
    expect(palette!.meta.contrastRules.textMinContrast).toBe(7.0)
  })

  test('removeAnchor enforces minimum of 2', () => {
    expect(usePaletteStore.getState().anchors).toHaveLength(2)
    usePaletteStore.getState().removeAnchor(0)
    expect(usePaletteStore.getState().anchors).toHaveLength(2)
  })

  test('addAnchor increases anchor count and re-derives', () => {
    usePaletteStore.getState().addAnchor(145, 0.12)
    expect(usePaletteStore.getState().anchors).toHaveLength(3)
    expect(usePaletteStore.getState().hueOutputs.length).toBeGreaterThan(0)
  })
})
