import { describe, test, expect } from 'vitest'
import { generatePalette, type PaletteOutput } from '@/colour-math'
import { exportAsCSS, exportAsJSON } from '@/lib/export'

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
