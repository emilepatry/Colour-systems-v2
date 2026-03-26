import { describe, test, expect, beforeEach } from 'vitest'
import { encodeState, decodeState } from '@/lib/url-state'
import type { SourceState } from '@/store'
import { usePaletteStore, hydrateFromSource } from '@/store'

const defaultSource: SourceState = {
  anchors: [
    { H: 25, C: 0.15 },
    { H: 265, C: 0.15 },
  ],
  easing: { x: 'sinusoidal', y: 'sinusoidal' },
  numHues: 5,
  lightnessCurve: [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17],
  displayL: 0.56,
  chromaStrategy: 'max_per_hue',
  compliance: 'AA',
  neutralHue: null,
  globalVibrancy: 1.0,
  activeMode: 'light',
  darkCurveOverrides: {},
  baseHex: null,
}

describe('encodeState / decodeState', () => {
  test('round-trip with default source', () => {
    const encoded = encodeState(defaultSource)
    const decoded = decodeState('#' + encoded)
    expect(decoded).toEqual(defaultSource)
  })

  test('round-trip with populated darkCurveOverrides', () => {
    const source: SourceState = {
      ...defaultSource,
      darkCurveOverrides: { 3: 0.82, 7: 0.25 },
    }
    const decoded = decodeState('#' + encodeState(source))
    expect(decoded).toEqual(source)
  })

  test('round-trip with max anchors', () => {
    const anchors = Array.from({ length: 10 }, (_, i) => ({
      H: i * 36,
      C: 0.1 + i * 0.01,
    }))
    const source: SourceState = { ...defaultSource, anchors }
    const decoded = decodeState('#' + encodeState(source))
    expect(decoded).toEqual(source)
  })

  test('round-trip with dark mode active', () => {
    const source: SourceState = {
      ...defaultSource,
      activeMode: 'dark',
      darkCurveOverrides: { 0: 0.1, 9: 0.95 },
    }
    const decoded = decodeState('#' + encodeState(source))
    expect(decoded).toEqual(source)
  })

  test('round-trip with AAA compliance and uniform chroma', () => {
    const source: SourceState = {
      ...defaultSource,
      compliance: 'AAA',
      chromaStrategy: 'uniform',
    }
    const decoded = decodeState('#' + encodeState(source))
    expect(decoded).toEqual(source)
  })

  test('encodeState produces non-empty string', () => {
    expect(encodeState(defaultSource).length).toBeGreaterThan(0)
  })

  test('encoded hash without # prefix still decodes', () => {
    const encoded = encodeState(defaultSource)
    expect(decodeState(encoded)).toEqual(defaultSource)
  })
})

describe('decodeState — invalid inputs', () => {
  test('empty string returns null', () => {
    expect(decodeState('')).toBeNull()
  })

  test('hash-only returns null', () => {
    expect(decodeState('#')).toBeNull()
  })

  test('invalid base64 returns null', () => {
    expect(decodeState('#!!notbase64!!')).toBeNull()
  })

  test('valid base64 but not JSON returns null', () => {
    expect(decodeState('#' + btoa('not json at all'))).toBeNull()
  })

  test('unknown version returns null', () => {
    expect(decodeState('#' + btoa(JSON.stringify({ v: 2, s: defaultSource })))).toBeNull()
  })

  test('missing s field returns null', () => {
    expect(decodeState('#' + btoa(JSON.stringify({ v: 1 })))).toBeNull()
  })

  test('invalid shape — anchors is a string', () => {
    const bad = { ...defaultSource, anchors: 'wrong' }
    expect(decodeState('#' + btoa(JSON.stringify({ v: 1, s: bad })))).toBeNull()
  })

  test('invalid shape — too few anchors', () => {
    const bad = { ...defaultSource, anchors: [{ H: 0, C: 0 }] }
    expect(decodeState('#' + btoa(JSON.stringify({ v: 1, s: bad })))).toBeNull()
  })

  test('invalid easing id', () => {
    const bad = { ...defaultSource, easing: { x: 'bogus', y: 'sinusoidal' } }
    expect(decodeState('#' + btoa(JSON.stringify({ v: 1, s: bad })))).toBeNull()
  })
})

describe('decodeState — range validation', () => {
  test('rejects numHues out of range', () => {
    const bad = { ...defaultSource, numHues: 99999 }
    expect(decodeState('#' + btoa(JSON.stringify({ v: 1, s: bad })))).toBeNull()
  })

  test('rejects oversized lightnessCurve', () => {
    const bad = { ...defaultSource, lightnessCurve: new Array(100).fill(0.5) }
    expect(decodeState('#' + btoa(JSON.stringify({ v: 1, s: bad })))).toBeNull()
  })

  test('rejects too many anchors', () => {
    const anchors = Array.from({ length: 25 }, () => ({ H: 0, C: 0.1 }))
    const bad = { ...defaultSource, anchors }
    expect(decodeState('#' + btoa(JSON.stringify({ v: 1, s: bad })))).toBeNull()
  })

  test('rejects globalVibrancy out of range', () => {
    const bad = { ...defaultSource, globalVibrancy: 5 }
    expect(decodeState('#' + btoa(JSON.stringify({ v: 1, s: bad })))).toBeNull()
  })

  test('rejects displayL out of range', () => {
    const bad = { ...defaultSource, displayL: 0.01 }
    expect(decodeState('#' + btoa(JSON.stringify({ v: 1, s: bad })))).toBeNull()
  })

  test('rejects NaN in anchor', () => {
    const bad = { ...defaultSource, anchors: [{ H: NaN, C: 0.1 }, { H: 0, C: 0.1 }] }
    expect(decodeState('#' + btoa(JSON.stringify({ v: 1, s: bad })))).toBeNull()
  })

  test('rejects Infinity globalVibrancy', () => {
    const bad = { ...defaultSource, globalVibrancy: Infinity }
    expect(decodeState('#' + btoa(JSON.stringify({ v: 1, s: bad })))).toBeNull()
  })
})

describe('URL length budget', () => {
  test('maximal state encodes to < 2000 characters', () => {
    const maximal: SourceState = {
      anchors: Array.from({ length: 10 }, (_, i) => ({ H: i * 36, C: 0.15 })),
      easing: { x: 'sinusoidal', y: 'exponential' },
      numHues: 10,
      lightnessCurve: Array.from({ length: 20 }, (_, i) => 0.97 - i * 0.04),
      displayL: 0.56,
      chromaStrategy: 'max_per_hue',
      compliance: 'AAA',
      neutralHue: 210,
      globalVibrancy: 0.85,
      activeMode: 'dark',
      darkCurveOverrides: Object.fromEntries(
        Array.from({ length: 10 }, (_, i) => [i, 0.9 - i * 0.08]),
      ),
      baseHex: '#4F46E5',
    }
    const encoded = encodeState(maximal)
    expect(encoded.length).toBeLessThan(2000)
  })
})

describe('baseHex URL state', () => {
  test('round-trip with baseHex set', () => {
    const source: SourceState = { ...defaultSource, baseHex: '#4F46E5' }
    const decoded = decodeState('#' + encodeState(source))
    expect(decoded).toEqual(source)
  })

  test('round-trip with baseHex null', () => {
    const decoded = decodeState('#' + encodeState(defaultSource))
    expect(decoded).toEqual(defaultSource)
    expect(decoded!.baseHex).toBeNull()
  })

  test('v1 URL without baseHex field decodes with baseHex defaulting to null', () => {
    const legacyPayload = {
      v: 1,
      s: {
        anchors: [{ H: 25, C: 0.15 }, { H: 265, C: 0.15 }],
        easing: { x: 'sinusoidal', y: 'sinusoidal' },
        numHues: 5,
        lightnessCurve: [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17],
        displayL: 0.56,
        chromaStrategy: 'max_per_hue',
        compliance: 'AA',
        neutralHue: null,
        globalVibrancy: 1.0,
        activeMode: 'light',
        darkCurveOverrides: {},
      },
    }
    const encoded = btoa(JSON.stringify(legacyPayload))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const decoded = decodeState('#' + encoded)
    expect(decoded).not.toBeNull()
    expect(decoded!.baseHex).toBeNull()
  })

  test('rejects invalid baseHex string', () => {
    const bad = { ...defaultSource, baseHex: 'notahex' }
    expect(decodeState('#' + btoa(JSON.stringify({ v: 1, s: bad })))).toBeNull()
  })
})

describe('hydrateFromSource', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
    usePaletteStore.temporal.getState().clear()
  })

  test('sets all source fields on the store', () => {
    const source: SourceState = {
      ...defaultSource,
      numHues: 8,
      compliance: 'AAA',
      globalVibrancy: 0.7,
    }
    hydrateFromSource(source)
    const state = usePaletteStore.getState()
    expect(state.numHues).toBe(8)
    expect(state.compliance).toBe('AAA')
    expect(state.globalVibrancy).toBe(0.7)
  })

  test('recomputes derived state after hydration', () => {
    const source: SourceState = {
      ...defaultSource,
      anchors: [
        { H: 120, C: 0.12 },
        { H: 300, C: 0.12 },
      ],
    }
    hydrateFromSource(source)
    const state = usePaletteStore.getState()
    expect(state.palette).not.toBeNull()
    expect(state.hueOutputs.length).toBeGreaterThan(0)
  })

  test('clears temporal history', () => {
    usePaletteStore.getState().setNumHues(7)
    usePaletteStore.getState().setNumHues(8)
    expect(usePaletteStore.temporal.getState().pastStates.length).toBeGreaterThan(0)

    hydrateFromSource(defaultSource)
    expect(usePaletteStore.temporal.getState().pastStates.length).toBe(0)
  })
})
