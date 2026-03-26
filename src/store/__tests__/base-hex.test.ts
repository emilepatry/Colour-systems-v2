import { describe, test, expect, beforeEach } from 'vitest'
import { usePaletteStore } from '@/store'
import { srgbToOklch } from '@/colour-math'

describe('D3.1: baseHex store behaviour', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  test('setBaseHex with valid hex updates anchors[0] to parsed OKLCH', () => {
    usePaletteStore.getState().setBaseHex('#4F46E5')
    const state = usePaletteStore.getState()
    const expected = srgbToOklch('#4F46E5')
    expect(state.baseHex).toBe('#4F46E5')
    expect(state.anchors[0].H).toBeCloseTo(expected.H, 5)
    expect(state.anchors[0].C).toBeCloseTo(expected.C, 5)
  })

  test('setBaseHex normalises to uppercase with # prefix', () => {
    usePaletteStore.getState().setBaseHex('ff6600')
    expect(usePaletteStore.getState().baseHex).toBe('#FF6600')
  })

  test('setBaseHex rejects invalid hex', () => {
    usePaletteStore.getState().setBaseHex('zzz')
    expect(usePaletteStore.getState().baseHex).toBeNull()
  })

  test('setBaseHex triggers palette re-derivation', () => {
    const before = usePaletteStore.getState().palette
    usePaletteStore.getState().setBaseHex('#FF0000')
    const after = usePaletteStore.getState().palette
    expect(after).not.toBe(before)
  })

  test('hexToOklch round-trip: known hex values parse correctly', () => {
    const white = srgbToOklch('#FFFFFF')
    expect(white.L).toBeCloseTo(1.0, 1)
    expect(white.C).toBeCloseTo(0, 2)

    const black = srgbToOklch('#000000')
    expect(black.L).toBeCloseTo(0, 1)

    const indigo = srgbToOklch('#4F46E5')
    expect(indigo.H).toBeGreaterThan(0)
    expect(indigo.C).toBeGreaterThan(0)
  })
})

describe('D3.1: isAnchorLocked', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  test('returns false for all anchors when baseHex is null', () => {
    const { isAnchorLocked } = usePaletteStore.getState()
    expect(isAnchorLocked(0)).toBe(false)
    expect(isAnchorLocked(1)).toBe(false)
  })

  test('returns true for anchor 0 when baseHex is set', () => {
    usePaletteStore.getState().setBaseHex('#4F46E5')
    const { isAnchorLocked } = usePaletteStore.getState()
    expect(isAnchorLocked(0)).toBe(true)
  })

  test('returns false for non-zero anchors even when baseHex is set', () => {
    usePaletteStore.getState().setBaseHex('#4F46E5')
    const { isAnchorLocked } = usePaletteStore.getState()
    expect(isAnchorLocked(1)).toBe(false)
    expect(isAnchorLocked(2)).toBe(false)
  })
})

describe('D3.1: removeAnchor lock', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  test('removeAnchor(0) is a no-op when baseHex is set', () => {
    usePaletteStore.getState().setBaseHex('#4F46E5')
    const anchorsBefore = usePaletteStore.getState().anchors
    usePaletteStore.getState().removeAnchor(0)
    const anchorsAfter = usePaletteStore.getState().anchors
    expect(anchorsAfter).toEqual(anchorsBefore)
  })

  test('removeAnchor(1) still works when baseHex is set (3+ anchors)', () => {
    usePaletteStore.getState().addAnchor(180, 0.1)
    usePaletteStore.getState().setBaseHex('#4F46E5')
    const countBefore = usePaletteStore.getState().anchors.length
    usePaletteStore.getState().removeAnchor(1)
    expect(usePaletteStore.getState().anchors.length).toBe(countBefore - 1)
  })
})

describe('D3.1: setBaseHex(null) preserves position', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  test('clearing baseHex keeps anchors[0] at same position', () => {
    usePaletteStore.getState().setBaseHex('#4F46E5')
    const lockedAnchor = { ...usePaletteStore.getState().anchors[0] }
    usePaletteStore.getState().setBaseHex(null)
    const state = usePaletteStore.getState()
    expect(state.baseHex).toBeNull()
    expect(state.anchors[0].H).toBeCloseTo(lockedAnchor.H, 10)
    expect(state.anchors[0].C).toBeCloseTo(lockedAnchor.C, 10)
  })
})
