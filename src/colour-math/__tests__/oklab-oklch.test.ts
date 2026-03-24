import { describe, test } from 'vitest'

describe('OKLAB ↔ OKLCH conversion', () => {
  describe('forward (OKLAB → OKLCH)', () => {
    test.todo('C1 — red: a=0.2249, b=0.1264 → C≈0.2580, H≈29.34°')
    test.todo('C2 — blue: a=-0.0324, b=-0.3119 → C≈0.3136, H≈264.07°')
    test.todo('C3 — green: a=-0.2339, b=0.1794 → C≈0.2948, H≈142.52°')
    test.todo('C4 — achromatic (mid-grey): a=0, b=0 → C=0')
    test.todo('C5 — black: a=0, b=0 → C=0')
    test.todo('C6 — white: a=0, b=0 → C=0')
    test.todo('C7 — pure positive-b axis → H=90°')
    test.todo('C8 — pure negative-b axis → H=270°')
    test.todo('C9 — pure positive-a axis → H=0°')
  })

  describe('reverse (OKLCH → OKLAB)', () => {
    test.todo('C1–C9 each round-trip within ±0.0001')
  })

  describe('achromatic hue convention', () => {
    test.todo('C=0 hue does not cause downstream NaN propagation')
    test.todo('oklch_to_oklab with C=0 returns a=0, b=0 regardless of H')
  })

  describe('hue discontinuity', () => {
    test.todo('H1 — H=359.9° round-trips without wrapping error')
    test.todo('H2 — H=0.1° round-trips without wrapping error')
    test.todo('H3 — H=360° normalised to 0°')
  })
})
