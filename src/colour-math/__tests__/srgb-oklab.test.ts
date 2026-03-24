import { describe, test } from 'vitest'

describe('sRGB ↔ OKLAB conversion', () => {
  describe('matrix constants', () => {
    test.todo('Linear RGB → LMS matrix matches doc 01 values')
    test.todo('Cube-rooted LMS → OKLAB matrix matches doc 01 values')
    test.todo('OKLAB → cube-rooted LMS matrix matches doc 01 values')
    test.todo('LMS → Linear RGB matrix matches doc 01 values')
  })

  describe('forward (sRGB → OKLAB)', () => {
    test.todo('F1 — #000000 (black) → L=0, a=0, b=0')
    test.todo('F2 — #ffffff (white) → L=1, a=0, b=0')
    test.todo('F3 — #ff0000 (red) → L≈0.6280, a≈0.2249, b≈0.1264')
    test.todo('F4 — #00ff00 (green) → L≈0.8664, a≈-0.2339, b≈0.1794')
    test.todo('F5 — #0000ff (blue) → L≈0.4520, a≈-0.0324, b≈-0.3119')
    test.todo('F6 — #808080 (mid-grey) → L≈0.5999, a≈0, b≈0')
    test.todo('F7 — #ffff00 (yellow) → L≈0.9680, a≈-0.0711, b≈0.1986')
    test.todo('F8 — #ff00ff (magenta) → L≈0.7017, a≈0.2745, b≈-0.1693')
    test.todo('F9 — #00ffff (cyan) → L≈0.9054, a≈-0.1494, b≈-0.0394')
  })

  describe('reverse (OKLAB → sRGB)', () => {
    test.todo('R1 — (0, 0, 0) → #000000')
    test.todo('R2 — (1, 0, 0) → #ffffff')
    test.todo('R3 — red OKLAB → #ff0000 ±1 per channel')
    test.todo('R4 — mid-grey OKLAB → #808080 ±1 per channel')
  })

  describe('round-trip', () => {
    test.todo('F1–F9 each round-trip within ±1/255 per channel')
  })
})
