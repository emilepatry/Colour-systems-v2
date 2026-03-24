import { describe, test } from 'vitest'

describe('palette snapshot', () => {
  test.todo('canonical palette (8 hues, 10 levels, AA, max_per_hue) matches snapshot')

  describe('partial verification (doc 05 example values)', () => {
    test.todo('blue level 0 hex is #EBF0FF')
    test.todo('blue level 0 OKLCH is L=0.97, C=0.030, H=265')
    test.todo('blue level 0 relative luminance ≈ 0.918')
    test.todo('neutral level 0 hex is #F7F7F7')
    test.todo('neutral level 0 relative luminance ≈ 0.913')
    test.todo('neutral chroma is 0 when neutral_hue is null')
  })
})
