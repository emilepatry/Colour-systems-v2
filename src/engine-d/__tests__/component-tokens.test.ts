import { describe, test, expect } from 'vitest'
import {
  oklchToHex,
  relativeLuminance,
  maxChroma,
  wcagContrastRatio,
  assemblePalette,
  type ScaleEntry,
} from '@/colour-math'
import { runEngineC } from '@/engine-c'
import { mapSemanticTokens, COMPONENT_ROLES } from '@/engine-d'
import { deriveComponentTokens } from '@/engine-d'
import type { SemanticTokenSet } from '@/engine-d'

// ─── Test Helpers ────────────────────────────────────────────────────

const DEFAULT_CURVE = [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17]

function buildTestPalette(
  hueAngles: number[],
  curve: number[] = DEFAULT_CURVE,
  chroma = 0.15,
) {
  const hueScales: Record<string, ScaleEntry[]> = {}
  for (let h = 0; h < hueAngles.length; h++) {
    const H = hueAngles[h]
    hueScales[`hue-${h}`] = curve.map((L, level) => {
      const C = Math.min(chroma, maxChroma(L, H))
      const hex = oklchToHex(L, C, H)
      return { level, hex, oklch: { L, C, H }, relativeLuminance: relativeLuminance(hex) }
    })
  }
  return assemblePalette(hueScales, 'AA', curve.length, curve, 'max_per_hue', null, true)
}

function runAndDerive(
  hueAngles: number[],
  mode: 'light' | 'dark' = 'light',
  curve?: number[],
) {
  const palette = buildTestPalette(hueAngles, curve)
  const result = runEngineC(palette, mode)
  const semantic = mapSemanticTokens(result, mode, 1.0)
  return { semantic, component: deriveComponentTokens(semantic) }
}

// ─── Alias Correctness ──────────────────────────────────────────────

describe('alias tokens match their foundation source', () => {
  const { semantic, component } = runAndDerive([25, 265])
  const st = semantic.tokens
  const ct = component.tokens

  const aliasPairs: [string, string][] = [
    ['button.primary.bg', 'accent.primary'],
    ['button.primary.fg', 'accent.primary-foreground'],
    ['button.primary.hover-bg', 'accent.primary-hover'],
    ['button.primary.active-bg', 'accent.primary-active'],
    ['button.primary.disabled-fg', 'text.disabled'],
    ['button.primary.focus-ring', 'focus.ring'],
    ['button.secondary.bg', 'background.surface-inset'],
    ['button.secondary.fg', 'text.primary'],
    ['button.secondary.border', 'border.default'],
    ['button.secondary.active-bg', 'border.subtle'],
    ['input.bg', 'background.surface'],
    ['input.fg', 'text.primary'],
    ['input.placeholder', 'text.tertiary'],
    ['input.border', 'border.subtle'],
    ['input.hover-border', 'border.default'],
    ['input.focus-border', 'accent.primary'],
    ['input.focus-ring', 'focus.ring'],
    ['input.invalid-border', 'status.error'],
    ['nav.item.fg', 'text.secondary'],
    ['nav.item.hover-bg', 'background.accent-subtle'],
    ['nav.item.focus-ring', 'focus.ring'],
  ]

  for (const [compRole, foundRole] of aliasPairs) {
    test(`${compRole} matches ${foundRole}`, () => {
      expect(ct[compRole as keyof typeof ct].hex).toBe(st[foundRole].hex)
      expect(ct[compRole as keyof typeof ct].oklch.L).toBeCloseTo(st[foundRole].oklch.L, 6)
      expect(ct[compRole as keyof typeof ct].oklch.C).toBeCloseTo(st[foundRole].oklch.C, 6)
      expect(ct[compRole as keyof typeof ct].oklch.H).toBeCloseTo(st[foundRole].oklch.H, 2)
    })
  }

  test('input.invalid-ring has alpha 0.5 and matches status.error hex', () => {
    expect(ct['input.invalid-ring'].alpha).toBe(0.5)
    expect(ct['input.invalid-ring'].hex).toBe(st['status.error'].hex)
  })
})

// ─── Computed: button.primary.disabled-bg ────────────────────────────

describe('button.primary.disabled-bg', () => {
  test('uses accent hue at surface-inset lightness with halved chroma', () => {
    const { semantic, component } = runAndDerive([200, 300])
    const accent = semantic.tokens['accent.primary']
    const inset = semantic.tokens['background.surface-inset']
    const disabled = component.tokens['button.primary.disabled-bg']

    expect(disabled.oklch.H).toBeCloseTo(accent.oklch.H, 1)
    expect(disabled.oklch.L).toBeCloseTo(inset.oklch.L, 4)

    const expectedC = Math.min(accent.oklch.C * 0.5, maxChroma(inset.oklch.L, accent.oklch.H))
    expect(disabled.oklch.C).toBeCloseTo(expectedC, 4)
  })

  test('chroma is gamut-clamped at high lightness', () => {
    const { component } = runAndDerive([200, 300])
    const disabled = component.tokens['button.primary.disabled-bg']
    const gamutMax = maxChroma(disabled.oklch.L, disabled.oklch.H)
    expect(disabled.oklch.C).toBeLessThanOrEqual(gamutMax + 0.001)
  })
})

// ─── Computed: button.secondary.hover-bg ─────────────────────────────

describe('button.secondary.hover-bg', () => {
  test('is a neutral midpoint between surface-inset and border.subtle', () => {
    const { semantic, component } = runAndDerive([25, 265])
    const inset = semantic.tokens['background.surface-inset']
    const borderSubtle = semantic.tokens['border.subtle']
    const hover = component.tokens['button.secondary.hover-bg']

    const expectedMidL = (inset.oklch.L + borderSubtle.oklch.L) / 2
    expect(hover.oklch.L).toBeCloseTo(expectedMidL, 4)
    expect(hover.oklch.C).toBe(0)
  })
})

// ─── Computed: nav.item.selected-bg ──────────────────────────────────

describe('nav.item.selected-bg', () => {
  test('uses accent hue at surface-inset lightness with 0.6x chroma', () => {
    const { semantic, component } = runAndDerive([25, 265])
    const accent = semantic.tokens['accent.primary']
    const inset = semantic.tokens['background.surface-inset']
    const selected = component.tokens['nav.item.selected-bg']

    expect(selected.oklch.H).toBeCloseTo(accent.oklch.H, 1)
    expect(selected.oklch.L).toBeCloseTo(inset.oklch.L, 4)

    const expectedC = Math.min(accent.oklch.C * 0.6, maxChroma(inset.oklch.L, accent.oklch.H))
    expect(selected.oklch.C).toBeCloseTo(expectedC, 4)
  })

  test('chroma is gamut-clamped', () => {
    const { component } = runAndDerive([25, 265])
    const selected = component.tokens['nav.item.selected-bg']
    const gamutMax = maxChroma(selected.oklch.L, selected.oklch.H)
    expect(selected.oklch.C).toBeLessThanOrEqual(gamutMax + 0.001)
  })
})

// ─── Computed: nav.item.selected-fg ──────────────────────────────────

describe('nav.item.selected-fg', () => {
  test('meets 4.5:1 contrast against nav.item.selected-bg', () => {
    const { component } = runAndDerive([25, 265])
    const bg = component.tokens['nav.item.selected-bg']
    const fg = component.tokens['nav.item.selected-fg']
    const ratio = wcagContrastRatio(bg.hex, fg.hex)
    expect(ratio).toBeGreaterThanOrEqual(4.5 - 0.05)
  })
})

// ─── Completeness ───────────────────────────────────────────────────

describe('all component roles are populated', () => {
  test('every COMPONENT_ROLES entry exists in the output', () => {
    const { component } = runAndDerive([25, 145, 265])
    for (const role of COMPONENT_ROLES) {
      expect(component.tokens[role], `missing ${role}`).toBeDefined()
      expect(component.tokens[role].hex, `empty hex for ${role}`).toBeTruthy()
    }
  })

  test('total token count matches COMPONENT_ROLES length', () => {
    const { component } = runAndDerive([25, 145, 265])
    expect(Object.keys(component.tokens).length).toBe(COMPONENT_ROLES.length)
  })
})

// ─── Dark Mode ──────────────────────────────────────────────────────

describe('dark mode component tokens', () => {
  test('all roles populated in dark mode', () => {
    const { component } = runAndDerive([25, 265], 'dark')
    for (const role of COMPONENT_ROLES) {
      expect(component.tokens[role], `missing ${role} in dark`).toBeDefined()
    }
  })

  test('light and dark produce identical role key sets', () => {
    const light = runAndDerive([25, 265], 'light')
    const dark = runAndDerive([25, 265], 'dark')
    const lightKeys = Object.keys(light.component.tokens).sort()
    const darkKeys = Object.keys(dark.component.tokens).sort()
    expect(lightKeys).toEqual(darkKeys)
  })
})
