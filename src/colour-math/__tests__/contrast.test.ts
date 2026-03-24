import { describe, test } from 'vitest'

describe('WCAG contrast', () => {
  describe('relative luminance', () => {
    test.todo('Y1 — #000000 → 0.0')
    test.todo('Y2 — #ffffff → 1.0')
    test.todo('Y3 — #ff0000 → 0.2126')
    test.todo('Y4 — #00ff00 → 0.7152')
    test.todo('Y5 — #0000ff → 0.0722')
    test.todo('Y6 — #808080 → 0.21586')
    test.todo('Y7 — #767676 → 0.18504')
  })

  describe('contrast ratio', () => {
    test.todo('CR1 — white vs black → 21.0')
    test.todo('CR2 — black vs black → 1.0')
    test.todo('CR3 — white vs white → 1.0')
    test.todo('CR4 — white vs #767676 → ≈4.54')
    test.todo('CR5 — black vs #767676 → ≈4.62')
    test.todo('CR6 — white vs #595959 → ≈7.0')
    test.todo('CR7 — #767676 vs black → ≈4.62 (symmetry with CR5)')
  })

  describe('compliance thresholds', () => {
    test.todo('TH1 — ratio 4.5, AA normal text → pass')
    test.todo('TH2 — ratio 4.49, AA normal text → fail')
    test.todo('TH3 — ratio 3.0, AA large text → pass')
    test.todo('TH4 — ratio 2.99, AA large text → fail')
    test.todo('TH5 — ratio 7.0, AAA normal text → pass')
    test.todo('TH6 — ratio 6.99, AAA normal text → fail')
    test.todo('TH7 — ratio 4.5, AAA large text → pass')
    test.todo('TH8 — ratio 4.49, AAA large text → fail')
  })
})
