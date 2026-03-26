/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import HarmonyPreview, { computeHueGradient } from '@/components/HarmonyPreview'
import { usePaletteStore } from '@/store'

describe('D3.2: HarmonyPreview — computeHueGradient', () => {
  test('produces correct CSS stops for N hue outputs', () => {
    const hueOutputs = [
      { H: 25, vibrancy: 1 },
      { H: 145, vibrancy: 1 },
      { H: 265, vibrancy: 1 },
    ]
    const gradient = computeHueGradient(hueOutputs, 0.56)
    expect(gradient).toMatch(/^linear-gradient\(to right,/)
    expect(gradient).toMatch(/0\.0%/)
    expect(gradient).toMatch(/50\.0%/)
    expect(gradient).toMatch(/100\.0%/)
    const stops = gradient.match(/#[0-9a-fA-F]{6}/g)
    expect(stops).toHaveLength(3)
  })

  test('returns transparent for empty hue outputs', () => {
    expect(computeHueGradient([], 0.56)).toBe('transparent')
  })

  test('handles single hue output', () => {
    const gradient = computeHueGradient([{ H: 25, vibrancy: 1 }], 0.56)
    expect(gradient).toMatch(/^linear-gradient/)
    const stops = gradient.match(/#[0-9a-fA-F]{6}/g)
    expect(stops).toHaveLength(1)
  })

  test('correct output for 2 hues (minimum)', () => {
    const gradient = computeHueGradient(
      [{ H: 25, vibrancy: 1 }, { H: 265, vibrancy: 1 }],
      0.56,
    )
    const stops = gradient.match(/#[0-9a-fA-F]{6}/g)
    expect(stops).toHaveLength(2)
    expect(gradient).toMatch(/0\.0%/)
    expect(gradient).toMatch(/100\.0%/)
  })

  test('correct output for 10 hues (maximum)', () => {
    const hueOutputs = Array.from({ length: 10 }, (_, i) => ({
      H: i * 36,
      vibrancy: 0.8,
    }))
    const gradient = computeHueGradient(hueOutputs, 0.56)
    const stops = gradient.match(/#[0-9a-fA-F]{6}/g)
    expect(stops).toHaveLength(10)
  })
})

describe('D3.2: HarmonyPreview — render', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  afterEach(cleanup)

  test('renders with a palette', () => {
    render(<HarmonyPreview />)
    expect(screen.getByRole('img', { name: /palette harmony preview/i })).toBeTruthy()
  })

  test('renders placeholder when palette is null', () => {
    usePaletteStore.setState({ palette: null, darkPalette: null })
    render(<HarmonyPreview />)
    const el = screen.getByRole('img', { name: /palette harmony preview/i })
    expect(el).toBeTruthy()
  })
})
