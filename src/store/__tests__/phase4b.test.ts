import { describe, test, expect, beforeEach } from 'vitest'
import { usePaletteStore } from '@/store'

describe('Engine C store integration', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  test('initial state has non-null optimization', () => {
    const { optimization } = usePaletteStore.getState()
    expect(optimization).not.toBeNull()
  })

  test('optimization.adjustedScales has the same scale keys as palette.scales', () => {
    const { palette, optimization } = usePaletteStore.getState()
    expect(palette).not.toBeNull()
    expect(optimization).not.toBeNull()
    const paletteKeys = Object.keys(palette!.scales).sort()
    const optimizedKeys = Object.keys(optimization!.adjustedScales).sort()
    expect(optimizedKeys).toEqual(paletteKeys)
  })

  test('optimization.adjustedScales has the same number of entries per scale', () => {
    const { palette, optimization } = usePaletteStore.getState()
    expect(palette).not.toBeNull()
    expect(optimization).not.toBeNull()
    for (const key of Object.keys(palette!.scales)) {
      expect(optimization!.adjustedScales[key]).toHaveLength(palette!.scales[key].length)
    }
  })

  test('moveAnchor during drag skips optimization', () => {
    usePaletteStore.getState().setActiveAnchorIndex(0)
    usePaletteStore.getState().moveAnchor(0, 180, 0.10)

    const { optimization } = usePaletteStore.getState()
    expect(optimization).toBeNull()
  })

  test('setActiveAnchorIndex(null) restores optimization', () => {
    usePaletteStore.getState().setActiveAnchorIndex(0)
    usePaletteStore.getState().moveAnchor(0, 180, 0.10)
    expect(usePaletteStore.getState().optimization).toBeNull()

    usePaletteStore.getState().setActiveAnchorIndex(null)

    const { optimization } = usePaletteStore.getState()
    expect(optimization).not.toBeNull()
  })

  test('setCompliance recalculates optimization', () => {
    const before = usePaletteStore.getState().optimization
    expect(before).not.toBeNull()

    usePaletteStore.getState().setCompliance('AAA')

    const after = usePaletteStore.getState().optimization
    expect(after).not.toBeNull()
    expect(after).not.toBe(before)
  })

  test('setGlobalVibrancy recalculates optimization', () => {
    const before = usePaletteStore.getState().optimization
    expect(before).not.toBeNull()

    usePaletteStore.getState().setGlobalVibrancy(0.5)

    const after = usePaletteStore.getState().optimization
    expect(after).not.toBeNull()
    expect(after).not.toBe(before)
  })

  test('updateLightnessCurve with skipCrossValidation skips optimization', () => {
    usePaletteStore.getState().updateLightnessCurve(
      [0.95, 0.90, 0.83, 0.74, 0.64, 0.52, 0.41, 0.32, 0.23, 0.13],
      true,
    )

    const { optimization } = usePaletteStore.getState()
    expect(optimization).toBeNull()
  })

  test('updateLightnessCurve without skipCrossValidation runs optimization', () => {
    usePaletteStore.getState().updateLightnessCurve(
      [0.95, 0.90, 0.83, 0.74, 0.64, 0.52, 0.41, 0.32, 0.23, 0.13],
      false,
    )

    const { optimization } = usePaletteStore.getState()
    expect(optimization).not.toBeNull()
  })
})

describe('Engine C invariants', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  test('every adjustment matches its token in adjustedScales', () => {
    const { optimization } = usePaletteStore.getState()
    expect(optimization).not.toBeNull()

    const lastAdj = new Map<string, typeof optimization!.adjustments[number]>()
    for (const adj of optimization!.adjustments) {
      lastAdj.set(`${adj.token.scale}:${adj.token.level}`, adj)
    }

    for (const adj of lastAdj.values()) {
      const entry = optimization!.adjustedScales[adj.token.scale]?.[adj.token.level]
      expect(entry).toBeDefined()
      expect(entry.hex).toBe(adj.newHex)
      expect(entry.oklch.L).toBeCloseTo(adj.adjustedL, 6)
      expect(entry.oklch.C).toBeCloseTo(adj.adjustedC, 6)
    }
  })

  test('non-adjusted tokens equal raw palette values', () => {
    const { palette, optimization } = usePaletteStore.getState()
    expect(palette).not.toBeNull()
    expect(optimization).not.toBeNull()

    const adjustedSet = new Set(
      optimization!.adjustments.map(a => `${a.token.scale}:${a.token.level}`),
    )

    for (const scale of Object.keys(palette!.scales)) {
      for (const entry of palette!.scales[scale]) {
        if (!adjustedSet.has(`${scale}:${entry.level}`)) {
          const optimized = optimization!.adjustedScales[scale][entry.level]
          expect(optimized).toEqual(entry)
        }
      }
    }
  })

  test('default palette has empty regressions', () => {
    const { optimization } = usePaletteStore.getState()
    expect(optimization).not.toBeNull()
    expect(optimization!.regressions).toHaveLength(0)
  })
})
