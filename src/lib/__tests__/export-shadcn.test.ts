import { describe, test, expect } from 'vitest'
import { generatePalette, type PaletteOutput } from '@/colour-math'
import { runEngineC } from '@/engine-c'
import { mapSemanticTokens, type SemanticTokenSet } from '@/engine-d'
import { exportAsShadcn } from '@/lib/export'

function makeFixtures(): { palette: PaletteOutput; light: SemanticTokenSet; dark: SemanticTokenSet } {
  const palette = generatePalette({
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
  const lightResult = runEngineC(palette, 'light')
  const darkResult = runEngineC(palette, 'dark')
  const light = mapSemanticTokens(lightResult, 'light', 1.0)
  const dark = mapSemanticTokens(darkResult, 'dark', 1.0)
  return { palette, light, dark }
}

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

describe('exportAsShadcn', () => {
  const { light, dark } = makeFixtures()
  const output = exportAsShadcn(light, dark)

  test('contains :root block', () => {
    expect(output).toContain(':root {')
  })

  test('contains .dark block', () => {
    expect(output).toContain('.dark {')
  })

  test('contains @theme inline block', () => {
    expect(output).toContain('@theme inline {')
  })

  test('all expected shadcn variables are present in :root', () => {
    const rootBlock = output.split('.dark {')[0]
    for (const v of EXPECTED_VARS) {
      expect(rootBlock).toContain(`${v}:`)
    }
  })

  test('all expected shadcn variables are present in .dark', () => {
    const darkBlock = output.split('.dark {')[1]?.split('}')[0] ?? ''
    for (const v of EXPECTED_VARS) {
      expect(darkBlock).toContain(`${v}:`)
    }
  })

  test('values are oklch format, not hex', () => {
    const rootBlock = output.split('.dark {')[0]
    const valueLines = rootBlock.split('\n').filter(l => l.includes(':') && l.includes(';') && !l.startsWith(':root'))
    for (const line of valueLines) {
      if (line.includes('/*')) continue
      expect(line).toMatch(/oklch\(/)
    }
  })

  test('@theme inline block has --color-* bridge for every variable', () => {
    const themeBlock = output.split('@theme inline {')[1]?.split('}')[0] ?? ''
    for (const v of EXPECTED_VARS) {
      const twVar = `--color-${v.slice(2)}`
      expect(themeBlock).toContain(`${twVar}: var(${v})`)
    }
  })

  test('snapshot', () => {
    expect(output).toMatchSnapshot()
  })
})
