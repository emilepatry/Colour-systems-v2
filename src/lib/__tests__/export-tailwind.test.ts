import { describe, test, expect } from 'vitest'
import { generatePalette } from '@/colour-math'
import { exportAsTailwind } from '@/lib/export'

function makePalette() {
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

describe('exportAsTailwind', () => {
  const palette = makePalette()
  const output = exportAsTailwind(palette)

  test('wrapped in @theme block', () => {
    expect(output).toMatch(/^@theme \{/)
    expect(output).toMatch(/\}$/)
  })

  test('variables use --color-{hue}-{level} format', () => {
    expect(output).toContain('--color-hue-0-0:')
    expect(output).toContain('--color-hue-1-9:')
    expect(output).toContain('--color-neutral-0:')
  })

  test('all values are oklch strings', () => {
    const lines = output.split('\n').filter(l => l.includes('--color-'))
    expect(lines.length).toBeGreaterThan(0)
    for (const line of lines) {
      expect(line).toMatch(/oklch\(\d+\.\d+ \d+\.\d+ \d+\.\d+\)/)
    }
  })

  test('contains all scale levels for each hue', () => {
    for (let level = 0; level < 10; level++) {
      expect(output).toContain(`--color-hue-0-${level}:`)
      expect(output).toContain(`--color-hue-1-${level}:`)
      expect(output).toContain(`--color-neutral-${level}:`)
    }
  })
})
