import { describe, test, expect } from 'vitest'
import { buildInteractionGraph } from '@/engine-c/graph'
import { classifyPalette } from '@/engine-c/intent'
import { NEUTRAL_SCALE_NAME } from '@/engine-c/types'
import type { ContrastEdge } from '@/engine-c/types'
import { generatePalette, type ScaleEntry } from '@/colour-math'

const DEFAULT_CURVE = [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17]

function makeDefaultPalette() {
  return generatePalette({
    hues: [
      { name: 'hue-0', H: 30 },
      { name: 'hue-1', H: 90 },
      { name: 'hue-2', H: 150 },
      { name: 'hue-3', H: 210 },
      { name: 'hue-4', H: 270 },
    ],
    numLevels: 10,
    compliance: 'AA',
    lightnessCurve: DEFAULT_CURVE,
    chromaStrategy: 'max_per_hue',
    neutralHue: null,
  })
}

function makeMinimalPalette(): Record<string, ScaleEntry[]> {
  const curve = DEFAULT_CURVE
  return {
    'hue-0': curve.map((L, level) => ({
      level,
      hex: '#000000',
      oklch: { L, C: 0.10, H: 30 },
      relativeLuminance: 0,
    })),
    [NEUTRAL_SCALE_NAME]: curve.map((L, level) => ({
      level,
      hex: '#000000',
      oklch: { L, C: 0, H: 0 },
      relativeLuminance: 0,
    })),
  }
}

describe('buildInteractionGraph', () => {
  test('single chromatic scale produces intra-scale edges between foreground and surface levels', () => {
    const scales = makeMinimalPalette()
    const intents = classifyPalette(scales)
    const edges = buildInteractionGraph(scales, intents)

    const intraChromatic = edges.filter(
      e => e.darker.scale === 'hue-0' && e.lighter.scale === 'hue-0',
    )
    expect(intraChromatic.length).toBeGreaterThan(0)
  })

  test('decorative-on-surface edges use threshold 3.0, not 4.5', () => {
    const scales = makeMinimalPalette()
    const intents = classifyPalette(scales)
    const edges = buildInteractionGraph(scales, intents)

    const decorativeEdges = edges.filter(e => {
      const dIntent = intents[e.darker.scale][e.darker.level].intent
      const lIntent = intents[e.lighter.scale][e.lighter.level].intent
      return (dIntent === 'decorative' && (lIntent === 'surface' || lIntent === 'container'))
          || (lIntent === 'decorative' && (dIntent === 'surface' || dIntent === 'container'))
    })
    expect(decorativeEdges.length).toBeGreaterThan(0)
    for (const e of decorativeEdges) {
      expect(e.threshold).toBe(3.0)
    }
  })

  test('no edges between two surface tokens', () => {
    const scales = makeMinimalPalette()
    const intents = classifyPalette(scales)
    const edges = buildInteractionGraph(scales, intents)

    const surfacePairs = edges.filter(e => {
      const dI = intents[e.darker.scale][e.darker.level].intent
      const lI = intents[e.lighter.scale][e.lighter.level].intent
      return dI === 'surface' && lI === 'surface'
    })
    expect(surfacePairs).toHaveLength(0)
  })

  test('no edges between two anchor tokens', () => {
    const scales = makeMinimalPalette()
    const intents = classifyPalette(scales)
    const edges = buildInteractionGraph(scales, intents)

    const anchorPairs = edges.filter(e => {
      const dI = intents[e.darker.scale][e.darker.level].intent
      const lI = intents[e.lighter.scale][e.lighter.level].intent
      return dI === 'anchor' && lI === 'anchor'
    })
    expect(anchorPairs).toHaveLength(0)
  })

  test('cross-scale edges pair chromatic foreground with neutral surface', () => {
    const scales = makeMinimalPalette()
    const intents = classifyPalette(scales)
    const edges = buildInteractionGraph(scales, intents)

    const crossEdges = edges.filter(e => {
      const dScale = e.darker.scale
      const lScale = e.lighter.scale
      if (dScale === lScale) return false
      const dI = intents[dScale][e.darker.level].intent
      const lI = intents[lScale][e.lighter.level].intent
      return (
        (dScale !== NEUTRAL_SCALE_NAME && (dI === 'foreground' || dI === 'emphasis' || dI === 'decorative') && lScale === NEUTRAL_SCALE_NAME && (lI === 'surface' || lI === 'container'))
        || (lScale !== NEUTRAL_SCALE_NAME && (lI === 'foreground' || lI === 'emphasis' || lI === 'decorative') && dScale === NEUTRAL_SCALE_NAME && (dI === 'surface' || dI === 'container'))
      )
    })
    expect(crossEdges.length).toBeGreaterThan(0)
  })

  test('reverse cross-scale edges pair neutral foreground with chromatic surface', () => {
    const scales = makeMinimalPalette()
    const intents = classifyPalette(scales)
    const edges = buildInteractionGraph(scales, intents)

    const reverseEdges = edges.filter(e => {
      const dScale = e.darker.scale
      const lScale = e.lighter.scale
      if (dScale === lScale) return false
      const dI = intents[dScale][e.darker.level].intent
      const lI = intents[lScale][e.lighter.level].intent
      return (
        (dScale === NEUTRAL_SCALE_NAME && (dI === 'foreground' || dI === 'emphasis' || dI === 'decorative') && lScale !== NEUTRAL_SCALE_NAME && (lI === 'surface' || lI === 'container'))
        || (lScale === NEUTRAL_SCALE_NAME && (lI === 'foreground' || lI === 'emphasis' || lI === 'decorative') && dScale !== NEUTRAL_SCALE_NAME && (dI === 'surface' || dI === 'container'))
      )
    })
    expect(reverseEdges.length).toBeGreaterThan(0)
  })

  test('edge count for default 5-hue palette is within expected range (300–350)', () => {
    const palette = makeDefaultPalette()
    const intents = classifyPalette(palette.scales)
    const edges = buildInteractionGraph(palette.scales, intents)
    expect(edges.length).toBeGreaterThanOrEqual(300)
    expect(edges.length).toBeLessThanOrEqual(350)
  })

  test('darker always has lower L than lighter in each edge', () => {
    const palette = makeDefaultPalette()
    const intents = classifyPalette(palette.scales)
    const edges = buildInteractionGraph(palette.scales, intents)

    for (const e of edges) {
      const dL = palette.scales[e.darker.scale][e.darker.level].oklch.L
      const lL = palette.scales[e.lighter.scale][e.lighter.level].oklch.L
      expect(dL).toBeLessThanOrEqual(lL)
    }
  })

  test('no duplicate edges (same darker/lighter pair)', () => {
    const palette = makeDefaultPalette()
    const intents = classifyPalette(palette.scales)
    const edges = buildInteractionGraph(palette.scales, intents)

    const keys = new Set<string>()
    for (const e of edges) {
      const key = `${e.darker.scale}:${e.darker.level}|${e.lighter.scale}:${e.lighter.level}`
      expect(keys.has(key)).toBe(false)
      keys.add(key)
    }
  })

  test('no self-edges (same token on both sides)', () => {
    const palette = makeDefaultPalette()
    const intents = classifyPalette(palette.scales)
    const edges = buildInteractionGraph(palette.scales, intents)

    for (const e of edges) {
      const same = e.darker.scale === e.lighter.scale && e.darker.level === e.lighter.level
      expect(same).toBe(false)
    }
  })
})
