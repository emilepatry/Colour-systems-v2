import { describe, test } from 'vitest'

describe('gamut mapping', () => {
  describe('is_in_gamut', () => {
    test.todo('G1 — (0, 0, 0) → true')
    test.todo('G2 — (1, 1, 1) → true')
    test.todo('G3 — (0.5, 0.5, 0.5) → true')
    test.todo('G4 — (-0.001, 0.5, 0.5) → false')
    test.todo('G5 — (0.5, 1.001, 0.5) → false')
    test.todo('G6 — (0, 0, -0.0001) → false')
  })

  describe('max_chroma — doc 03 chroma table', () => {
    test.todo('MC1 — L=0.50, H=25° (red) → C≈0.22')
    test.todo('MC2 — L=0.50, H=90° (yellow) → C≈0.18')
    test.todo('MC3 — L=0.50, H=145° (green) → C≈0.18')
    test.todo('MC4 — L=0.50, H=265° (blue) → C≈0.19')
    test.todo('MC5 — L=0.50, H=305° (purple) → C≈0.22')
    test.todo('MC6 — L=0.85, H=25° (red light) → C≈0.10')
    test.todo('MC7 — L=0.85, H=90° (yellow light) → C≈0.14')
    test.todo('MC8 — L=0.85, H=265° (blue light) → C≈0.07')
    test.todo('MC9 — L=0.20, H=90° (yellow dark) → C≈0.04')
    test.todo('MC10 — L=0.20, H=265° (blue dark) → C≈0.13')
  })

  describe('max_chroma — boundary conditions', () => {
    test.todo('B1 — L=0, H=0° → C=0')
    test.todo('B2 — L=0, H=180° → C=0')
    test.todo('B3 — L=1, H=0° → C=0')
    test.todo('B4 — L=1, H=265° → C=0')
  })

  describe('map_to_gamut', () => {
    test.todo('MG1 — in-gamut colour unchanged')
    test.todo('MG2 — out-of-gamut colour clamped to max_chroma')
    test.todo('MG3 — zero chroma unchanged')
  })
})
