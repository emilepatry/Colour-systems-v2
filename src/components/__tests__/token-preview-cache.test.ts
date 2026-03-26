import { describe, test, expect, beforeEach } from 'vitest'
import { usePaletteStore } from '@/store'

describe('D1.1: TokenPreview cache — store-level drag behaviour', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  test('initial state has non-null semanticTokens (cache material exists)', () => {
    const { semanticTokens, darkSemanticTokens } = usePaletteStore.getState()
    expect(semanticTokens).not.toBeNull()
    expect(darkSemanticTokens).not.toBeNull()
  })

  test('semanticTokens becomes null during drag (triggers cache fallback)', () => {
    const before = usePaletteStore.getState().semanticTokens
    expect(before).not.toBeNull()

    usePaletteStore.getState().setActiveAnchorIndex(0)
    usePaletteStore.getState().moveAnchor(0, 180, 0.10)

    const { semanticTokens, darkSemanticTokens } = usePaletteStore.getState()
    expect(semanticTokens).toBeNull()
    expect(darkSemanticTokens).toBeNull()
  })

  test('semanticTokens restores to non-null on pointer-up (cache replaced with fresh)', () => {
    usePaletteStore.getState().setActiveAnchorIndex(0)
    usePaletteStore.getState().moveAnchor(0, 180, 0.10)
    expect(usePaletteStore.getState().semanticTokens).toBeNull()

    usePaletteStore.getState().setActiveAnchorIndex(null)

    const { semanticTokens, darkSemanticTokens } = usePaletteStore.getState()
    expect(semanticTokens).not.toBeNull()
    expect(darkSemanticTokens).not.toBeNull()
  })

  test('mode switch does not affect token availability (both modes computed)', () => {
    const lightTokens = usePaletteStore.getState().semanticTokens
    expect(lightTokens).not.toBeNull()

    usePaletteStore.getState().setActiveMode('dark')

    const state = usePaletteStore.getState()
    expect(state.activeMode).toBe('dark')
    expect(state.semanticTokens).not.toBeNull()
    expect(state.darkSemanticTokens).not.toBeNull()
  })

  test('drag in one mode nullifies tokens for both modes', () => {
    usePaletteStore.getState().setActiveMode('dark')
    usePaletteStore.getState().setActiveAnchorIndex(0)
    usePaletteStore.getState().moveAnchor(0, 90, 0.08)

    const { semanticTokens, darkSemanticTokens } = usePaletteStore.getState()
    expect(semanticTokens).toBeNull()
    expect(darkSemanticTokens).toBeNull()
  })
})
