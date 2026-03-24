import { describe, test } from 'vitest'

describe('sRGB linearisation', () => {
  describe('decode (sRGB → linear)', () => {
    test.todo('D1 — byte 0 (black boundary) → 0.0')
    test.todo('D2 — byte 255 (white boundary) → 1.0')
    test.todo('D3 — byte 128 (mid-grey) → 0.21586')
    test.todo('D4 — byte 10 (below threshold, linear segment) → 0.003035')
    test.todo('D5 — byte 11 (above threshold, gamma segment) → 0.003347')
    test.todo('D6 — byte 1 (near-black) → 0.000304')
    test.todo('D7 — byte 254 (near-white) → 0.99170')
    test.todo('D8 — byte 188 (~50% linear) → 0.50288')
  })

  describe('encode (linear → sRGB)', () => {
    test.todo('E1 — 0.0 → 0.0 (black boundary)')
    test.todo('E2 — 1.0 → 1.0 (white boundary)')
    test.todo('E3 — 0.21586 → 0.50196 (round-trip of D3)')
    test.todo('E4 — 0.003035 → 0.03922 (round-trip of D4)')
    test.todo('E5 — 0.003347 → 0.04314 (round-trip of D5)')
    test.todo('E6 — 0.0031308 → 0.04045 (exact encode threshold)')
  })

  describe('threshold boundary', () => {
    test.todo('T1 — decode(0.04045) uses linear branch')
    test.todo('T2 — decode(0.04046) uses gamma branch')
    test.todo('T3 — encode(0.0031308) uses linear branch')
    test.todo('T4 — encode(0.0031309) uses gamma branch')
  })
})
