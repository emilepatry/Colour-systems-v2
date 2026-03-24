import { describe, test, expect } from 'vitest'
import {
  generatePalette,
  maxChroma,
  oklchToHex,
  relativeLuminance,
  assemblePalette,
  type PaletteOutput,
  type ScaleEntry,
} from '@/colour-math'
import { runEngineC } from '@/engine-c'
import { mapSemanticTokens, deriveComponentTokens, COMPONENT_ROLES } from '@/engine-d'
import { exportAsCSS, exportAsJSON, exportAsShadcn, exportAsTokenJSON } from '@/lib/export'

function makePalette(): PaletteOutput {
  return generatePalette({
    hues: [
      { name: 'hue-0', H: 25 },
      { name: 'hue-1', H: 145 },
    ],
    numLevels: 10,
    compliance: 'AA',
    lightnessCurve: [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17],
    chromaStrategy: 'max_per_hue',
    neutralHue: null,
  })
}

describe('exportAsCSS', () => {
  const palette = makePalette()

  test('output contains :root wrapper and custom properties', () => {
    const css = exportAsCSS(palette)
    expect(css).toContain(':root {')
    expect(css).toContain('--hue-0-0:')
    expect(css).toContain('--neutral-0:')
  })

  test('output contains palette hex values verbatim', () => {
    const css = exportAsCSS(palette)
    expect(css).toContain(palette.scales['hue-0'][0].hex)
    expect(css).toContain(palette.scales['hue-0'][9].hex)
    expect(css).toContain(palette.scales.neutral[0].hex)
  })

  test('header comment contains compliance level', () => {
    const css = exportAsCSS(palette)
    expect(css).toContain('AA')
    expect(css).toContain('Colour Systems v2')
  })

  test('neutral section appears after all hue sections', () => {
    const css = exportAsCSS(palette)
    const neutralIndex = css.indexOf('/* Neutral */')
    const lastHueIndex = css.lastIndexOf('/* Hue')
    expect(neutralIndex).toBeGreaterThan(lastHueIndex)
  })
})

describe('exportAsJSON', () => {
  const palette = makePalette()

  test('produces valid JSON', () => {
    const json = exportAsJSON(palette)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  test('includes meta fields and all scale keys', () => {
    const parsed = JSON.parse(exportAsJSON(palette))
    expect(parsed.meta.compliance).toBe('AA')
    expect(parsed.meta.numHues).toBe(2)
    expect(parsed.meta.numLevels).toBe(10)
    expect(parsed.scales).toHaveProperty('hue-0')
    expect(parsed.scales).toHaveProperty('hue-1')
    expect(parsed.scales).toHaveProperty('neutral')
  })

  test('OKLCH values match oklch(L C H) format', () => {
    const parsed = JSON.parse(exportAsJSON(palette))
    const entry = parsed.scales['hue-0'][0]
    expect(entry.oklch).toMatch(/^oklch\(\d+\.\d{3} \d+\.\d{3} \d+\)$/)
  })

  test('excludes validation data', () => {
    const parsed = JSON.parse(exportAsJSON(palette))
    expect(parsed).not.toHaveProperty('intraValidation')
    expect(parsed).not.toHaveProperty('crossValidation')
  })

  test('includes globalVibrancy when source argument provided', () => {
    const parsed = JSON.parse(exportAsJSON(palette, { globalVibrancy: 0.75 }))
    expect(parsed.meta.globalVibrancy).toBe(0.75)
  })

  test('omits globalVibrancy when source argument not provided', () => {
    const parsed = JSON.parse(exportAsJSON(palette))
    expect(parsed.meta).not.toHaveProperty('globalVibrancy')
  })

  test('includes mode in meta when provided', () => {
    const parsed = JSON.parse(exportAsJSON(palette, { globalVibrancy: 1, mode: 'dark' }))
    expect(parsed.meta.mode).toBe('dark')
  })
})

describe('exportAsCSS mode label', () => {
  const palette = makePalette()

  test('includes dark in header when mode is dark', () => {
    const css = exportAsCSS(palette, 'dark')
    expect(css).toContain('dark')
    expect(css).toContain('Colour Systems v2')
  })

  test('defaults to light in header when mode is omitted', () => {
    const css = exportAsCSS(palette)
    expect(css).toContain('light')
  })
})

// ─── Semantic Token Test Helpers ─────────────────────────────────────

const DEFAULT_CURVE = [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17]

function buildTestPalette(hueAngles: number[]) {
  const hueScales: Record<string, ScaleEntry[]> = {}
  for (let h = 0; h < hueAngles.length; h++) {
    const H = hueAngles[h]
    hueScales[`hue-${h}`] = DEFAULT_CURVE.map((L, level) => {
      const C = Math.min(0.15, maxChroma(L, H))
      const hex = oklchToHex(L, C, H)
      return { level, hex, oklch: { L, C, H }, relativeLuminance: relativeLuminance(hex) }
    })
  }
  return assemblePalette(hueScales, 'AA', DEFAULT_CURVE.length, DEFAULT_CURVE, 'max_per_hue', null, true)
}

function makeSemanticSets() {
  const palette = buildTestPalette([25, 145])
  const lightResult = runEngineC(palette, 'light')
  const darkResult = runEngineC(palette, 'dark')
  const light = mapSemanticTokens(lightResult, 'light', 1.0)
  const dark = mapSemanticTokens(darkResult, 'dark', 1.0)
  const lightComp = deriveComponentTokens(light)
  const darkComp = deriveComponentTokens(dark)
  return { palette, light, dark, lightComp, darkComp }
}

// ─── exportAsShadcn ──────────────────────────────────────────────────

describe('exportAsShadcn', () => {
  const { light, dark } = makeSemanticSets()
  const output = exportAsShadcn(light, dark)

  const EXPECTED_VARS = [
    '--background', '--foreground',
    '--card', '--card-foreground',
    '--popover', '--popover-foreground',
    '--primary', '--primary-foreground',
    '--secondary', '--secondary-foreground',
    '--muted', '--muted-foreground',
    '--accent', '--accent-foreground',
    '--destructive', '--destructive-foreground',
    '--border', '--input', '--ring',
    '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5',
    '--sidebar', '--sidebar-foreground',
    '--sidebar-primary', '--sidebar-primary-foreground',
    '--sidebar-accent', '--sidebar-accent-foreground',
    '--sidebar-border', '--sidebar-ring',
  ]

  test('contains all 32 shadcn CSS variable names', () => {
    for (const v of EXPECTED_VARS) {
      expect(output, `missing ${v}`).toContain(`${v}:`)
    }
  })

  test('contains :root and .dark blocks', () => {
    expect(output).toContain(':root {')
    expect(output).toContain('.dark {')
  })

  test('contains @theme inline block with --color-* bridge vars', () => {
    expect(output).toContain('@theme inline {')
    expect(output).toContain('--color-background: var(--background)')
    expect(output).toContain('--color-primary: var(--primary)')
  })

  test('uses oklch() format for values', () => {
    expect(output).toMatch(/oklch\(\d+\.\d{4} \d+\.\d{4} \d+\.\d{2}\)/)
  })
})

// ─── exportAsTokenJSON ──────────────────────────────────────────────

describe('exportAsTokenJSON', () => {
  const { palette, light, dark, lightComp, darkComp } = makeSemanticSets()

  test('produces valid JSON', () => {
    const json = exportAsTokenJSON(palette, light, dark, lightComp, darkComp)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  test('semantic block has light and dark keys', () => {
    const parsed = JSON.parse(exportAsTokenJSON(palette, light, dark, lightComp, darkComp))
    expect(parsed.semantic).toHaveProperty('light')
    expect(parsed.semantic).toHaveProperty('dark')
  })

  test('component block has light and dark keys when component tokens provided', () => {
    const parsed = JSON.parse(exportAsTokenJSON(palette, light, dark, lightComp, darkComp))
    expect(parsed.component).toHaveProperty('light')
    expect(parsed.component).toHaveProperty('dark')
  })

  test('all 26 component roles appear under light and dark', () => {
    const parsed = JSON.parse(exportAsTokenJSON(palette, light, dark, lightComp, darkComp))
    for (const role of COMPONENT_ROLES) {
      expect(parsed.component.light, `missing light ${role}`).toHaveProperty(role)
      expect(parsed.component.dark, `missing dark ${role}`).toHaveProperty(role)
    }
  })

  test('each component token has hex and oklch fields', () => {
    const parsed = JSON.parse(exportAsTokenJSON(palette, light, dark, lightComp, darkComp))
    for (const role of COMPONENT_ROLES) {
      const token = parsed.component.light[role]
      expect(token.hex).toMatch(/^#[0-9a-f]{6}$/i)
      expect(token.oklch).toMatch(/^oklch\(/)
    }
  })

  test('component block is empty object when component tokens not provided', () => {
    const parsed = JSON.parse(exportAsTokenJSON(palette, light, dark))
    expect(parsed.component).toEqual({})
  })

  test('semantic block is unchanged by component token presence', () => {
    const withComp = JSON.parse(exportAsTokenJSON(palette, light, dark, lightComp, darkComp))
    const without = JSON.parse(exportAsTokenJSON(palette, light, dark))
    expect(withComp.semantic).toEqual(without.semantic)
  })

  test('meta block contains expected fields', () => {
    const parsed = JSON.parse(exportAsTokenJSON(palette, light, dark, lightComp, darkComp))
    expect(parsed.meta.compliance).toBe('AA')
    expect(parsed.meta.numHues).toBe(2)
    expect(parsed.meta.numLevels).toBe(10)
  })
})
