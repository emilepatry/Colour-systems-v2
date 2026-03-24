import { describe, test } from 'vitest'

describe('round-trip property tests (fast-check)', () => {
  test.todo('P1 — sRGB linearisation round-trip: encode(decode(v/255)) ≈ v/255 for any byte')

  test.todo('P2 — full pipeline round-trip: oklch_to_srgb(srgb_to_oklch(hex)) ≈ original for any hex')

  test.todo('P3 — gamut containment: oklch_to_srgb of in-gamut OKLCH produces channels in [0, 1]')

  test.todo('P4 — max_chroma boundary: max_chroma(L,H) is in gamut, max_chroma(L,H)+0.001 is not')

  test.todo('P5 — contrast symmetry: wcag_contrast(a, b) === wcag_contrast(b, a)')

  test.todo('P6 — contrast identity: wcag_contrast(a, a) === 1.0')

  test.todo('P7 — contrast monotonicity: white has higher contrast than grey against any dark colour')
})
