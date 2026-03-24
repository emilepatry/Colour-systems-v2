import { describe, test, expect } from 'vitest'
import { relativeLuminance, wcagContrastRatio, meetsCompliance } from '../index'

describe('WCAG contrast', () => {
  describe('relative luminance', () => {
    test('Y1 — #000000 → 0.0', () => {
      expect(relativeLuminance('#000000')).toBeCloseTo(0.0, 3)
    })

    test('Y2 — #ffffff → 1.0', () => {
      expect(relativeLuminance('#ffffff')).toBeCloseTo(1.0, 3)
    })

    test('Y3 — #ff0000 → 0.2126', () => {
      expect(relativeLuminance('#ff0000')).toBeCloseTo(0.2126, 3)
    })

    test('Y4 — #00ff00 → 0.7152', () => {
      expect(relativeLuminance('#00ff00')).toBeCloseTo(0.7152, 3)
    })

    test('Y5 — #0000ff → 0.0722', () => {
      expect(relativeLuminance('#0000ff')).toBeCloseTo(0.0722, 3)
    })

    test('Y6 — #808080 → 0.21586', () => {
      expect(relativeLuminance('#808080')).toBeCloseTo(0.21586, 3)
    })

    test('Y7 — #767676 → 0.18116', () => {
      expect(relativeLuminance('#767676')).toBeCloseTo(0.18116, 3)
    })
  })

  describe('contrast ratio', () => {
    test('CR1 — white vs black → 21.0', () => {
      expect(wcagContrastRatio('#ffffff', '#000000')).toBeCloseTo(21.0, 1)
    })

    test('CR2 — black vs black → 1.0', () => {
      expect(wcagContrastRatio('#000000', '#000000')).toBeCloseTo(1.0, 1)
    })

    test('CR3 — white vs white → 1.0', () => {
      expect(wcagContrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1.0, 1)
    })

    test('CR4 — white vs #767676 → ≈4.54', () => {
      expect(wcagContrastRatio('#ffffff', '#767676')).toBeCloseTo(4.54, 1)
    })

    test('CR5 — black vs #767676 → ≈4.62', () => {
      expect(wcagContrastRatio('#000000', '#767676')).toBeCloseTo(4.62, 1)
    })

    test('CR6 — white vs #595959 → ≈7.0', () => {
      expect(wcagContrastRatio('#ffffff', '#595959')).toBeCloseTo(7.0, 1)
    })

    test('CR7 — #767676 vs black → ≈4.62 (symmetry with CR5)', () => {
      expect(wcagContrastRatio('#767676', '#000000')).toBeCloseTo(4.62, 1)
    })
  })

  describe('compliance thresholds', () => {
    test('TH1 — ratio 4.5, AA normal text → pass', () => {
      expect(meetsCompliance(4.5, 'AA', 'text')).toBe(true)
    })

    test('TH2 — ratio 4.49, AA normal text → fail', () => {
      expect(meetsCompliance(4.49, 'AA', 'text')).toBe(false)
    })

    test('TH3 — ratio 3.0, AA large text → pass', () => {
      expect(meetsCompliance(3.0, 'AA', 'large_text')).toBe(true)
    })

    test('TH4 — ratio 2.99, AA large text → fail', () => {
      expect(meetsCompliance(2.99, 'AA', 'large_text')).toBe(false)
    })

    test('TH5 — ratio 7.0, AAA normal text → pass', () => {
      expect(meetsCompliance(7.0, 'AAA', 'text')).toBe(true)
    })

    test('TH6 — ratio 6.99, AAA normal text → fail', () => {
      expect(meetsCompliance(6.99, 'AAA', 'text')).toBe(false)
    })

    test('TH7 — ratio 4.5, AAA large text → pass', () => {
      expect(meetsCompliance(4.5, 'AAA', 'large_text')).toBe(true)
    })

    test('TH8 — ratio 4.49, AAA large text → fail', () => {
      expect(meetsCompliance(4.49, 'AAA', 'large_text')).toBe(false)
    })
  })
})
