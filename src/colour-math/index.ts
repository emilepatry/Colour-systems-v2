// Colour math engine — OKLCH conversion pipeline
// Implements docs/01–05 as pure TypeScript, no external colour library.
// See planning/TEST-SPEC.md for the test contract this module must satisfy.

const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

// ─── sRGB Linearisation ─────────────────────────────────────────────
// IEC 61966-2-1 transfer function. Source: docs/01-oklch-colour-model.md

export function srgbDecode(c: number): number {
  if (c <= 0.04045) return c / 12.92
  return ((c + 0.055) / 1.055) ** 2.4
}

export function srgbEncode(c: number): number {
  if (c <= 0.0031308) return 12.92 * c
  return 1.055 * c ** (1 / 2.4) - 0.055
}

// ─── Hex Utilities ──────────────────────────────────────────────────

export function isValidHex6(hex: string): boolean {
  return /^#?[0-9a-fA-F]{6}$/.test(hex)
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.startsWith('#') ? hex.slice(1) : hex
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

export function rgbToHex(r: number, g: number, b: number): string {
  const f = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0')
  return `#${f(r)}${f(g)}${f(b)}`
}

// ─── Matrix Constants (exported for test verification) ──────────────
// Björn Ottosson's OKLAB. Source: docs/01-oklch-colour-model.md

export const M1 = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
] as const

export const M2 = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
] as const

export const M3 = [
  [1.0, 0.3963377774, 0.2158037573],
  [1.0, -0.1055613458, -0.0638541728],
  [1.0, -0.0894841775, -1.291485548],
] as const

export const M4 = [
  [+4.0767416621, -3.3077115913, +0.2309699292],
  [-1.2684380046, +2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, +1.707614701],
] as const

// ─── sRGB → OKLAB ───────────────────────────────────────────────────

export function srgbToOklab(hex: string): { L: number; a: number; b: number } {
  const [R, G, B] = hexToRgb(hex)
  const rLin = srgbDecode(R / 255)
  const gLin = srgbDecode(G / 255)
  const bLin = srgbDecode(B / 255)

  const l = M1[0][0] * rLin + M1[0][1] * gLin + M1[0][2] * bLin
  const m = M1[1][0] * rLin + M1[1][1] * gLin + M1[1][2] * bLin
  const s = M1[2][0] * rLin + M1[2][1] * gLin + M1[2][2] * bLin

  const lc = Math.cbrt(l)
  const mc = Math.cbrt(m)
  const sc = Math.cbrt(s)

  return {
    L: M2[0][0] * lc + M2[0][1] * mc + M2[0][2] * sc,
    a: M2[1][0] * lc + M2[1][1] * mc + M2[1][2] * sc,
    b: M2[2][0] * lc + M2[2][1] * mc + M2[2][2] * sc,
  }
}

// ─── OKLAB → Linear RGB ────────────────────────────────────────────

export function oklabToLinearRgb(
  L: number,
  a: number,
  b: number,
): { r: number; g: number; b: number } {
  const lc = M3[0][0] * L + M3[0][1] * a + M3[0][2] * b
  const mc = M3[1][0] * L + M3[1][1] * a + M3[1][2] * b
  const sc = M3[2][0] * L + M3[2][1] * a + M3[2][2] * b

  const l = lc * lc * lc
  const m = mc * mc * mc
  const s = sc * sc * sc

  return {
    r: M4[0][0] * l + M4[0][1] * m + M4[0][2] * s,
    g: M4[1][0] * l + M4[1][1] * m + M4[1][2] * s,
    b: M4[2][0] * l + M4[2][1] * m + M4[2][2] * s,
  }
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

function linearToSrgbByte(lin: number): number {
  return Math.round(srgbEncode(clamp01(lin)) * 255)
}

export function oklabToHex(L: number, a: number, b: number): string {
  const rgb = oklabToLinearRgb(L, a, b)
  return rgbToHex(
    linearToSrgbByte(rgb.r),
    linearToSrgbByte(rgb.g),
    linearToSrgbByte(rgb.b),
  )
}

// ─── OKLAB ↔ OKLCH ──────────────────────────────────────────────────

export function oklabToOklch(
  L: number,
  a: number,
  b: number,
): { L: number; C: number; H: number } {
  const C = Math.sqrt(a * a + b * b)
  if (C < 1e-10) return { L, C: 0, H: 0 }
  let H = Math.atan2(b, a) * RAD_TO_DEG
  if (H < 0) H += 360
  return { L, C, H }
}

export function oklchToOklab(
  L: number,
  C: number,
  H: number,
): { L: number; a: number; b: number } {
  if (C === 0) return { L, a: 0, b: 0 }
  const hRad = (((H % 360) + 360) % 360) * DEG_TO_RAD
  return {
    L,
    a: C * Math.cos(hRad),
    b: C * Math.sin(hRad),
  }
}

// ─── Convenience Composites ─────────────────────────────────────────

export function srgbToOklch(hex: string): { L: number; C: number; H: number } {
  const { L, a, b } = srgbToOklab(hex)
  return oklabToOklch(L, a, b)
}

export function oklchToLinearRgb(
  L: number,
  C: number,
  H: number,
): { r: number; g: number; b: number } {
  const lab = oklchToOklab(L, C, H)
  return oklabToLinearRgb(lab.L, lab.a, lab.b)
}

export function oklchToHex(L: number, C: number, H: number): string {
  const lab = oklchToOklab(L, C, H)
  return oklabToHex(lab.L, lab.a, lab.b)
}

// ─── Gamut Mapping ──────────────────────────────────────────────────
// Source: docs/03-gamut-mapping.md

export function isInGamut(r: number, g: number, b: number): boolean {
  return r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1
}

export function maxChroma(L: number, H: number): number {
  let low = 0
  let high = 0.4
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2
    const { r, g, b } = oklchToLinearRgb(L, mid, H)
    if (isInGamut(r, g, b)) {
      low = mid
    } else {
      high = mid
    }
  }
  return low
}

export function mapToGamut(
  L: number,
  C: number,
  H: number,
): { L: number; C: number; H: number } {
  const cMax = maxChroma(L, H)
  return { L, C: Math.min(C, cMax), H }
}

// ─── WCAG Contrast ──────────────────────────────────────────────────
// Source: docs/02-contrast-compliance.md

export function relativeLuminance(hex: string): number {
  const [R, G, B] = hexToRgb(hex)
  const rLin = srgbDecode(R / 255)
  const gLin = srgbDecode(G / 255)
  const bLin = srgbDecode(B / 255)
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
}

export function relativeLuminanceFromOklch(L: number, C: number, H: number): number {
  const { r, g, b } = oklchToLinearRgb(L, C, H)
  return 0.2126 * clamp01(r) + 0.7152 * clamp01(g) + 0.0722 * clamp01(b)
}

export function wcagContrastRatio(hexA: string, hexB: string): number {
  const yA = relativeLuminance(hexA)
  const yB = relativeLuminance(hexB)
  const lighter = Math.max(yA, yB)
  const darker = Math.min(yA, yB)
  return (lighter + 0.05) / (darker + 0.05)
}

export function meetsCompliance(
  ratio: number,
  level: 'AA' | 'AAA',
  element: 'text' | 'large_text',
): boolean {
  const thresholds: Record<string, Record<string, number>> = {
    AA: { text: 4.5, large_text: 3.0 },
    AAA: { text: 7.0, large_text: 4.5 },
  }
  return ratio >= thresholds[level][element]
}

// ─── Palette Generation Types ───────────────────────────────────────

export interface HueConfig {
  name: string
  H: number
}

export interface PaletteInput {
  hues: HueConfig[]
  numLevels: number
  compliance: 'AA' | 'AAA'
  lightnessCurve: number[]
  chromaStrategy: 'max_per_hue' | 'uniform'
  neutralHue: number | null
}

export interface ScaleEntry {
  level: number
  hex: string
  oklch: { L: number; C: number; H: number }
  relativeLuminance: number
}

export interface ContrastFailure {
  hueA?: string
  hueB?: string
  levelA: number
  levelB: number
  contrast: number
  required: number
}

export interface PaletteOutput {
  meta: {
    compliance: 'AA' | 'AAA'
    numLevels: number
    lightnessCurve: number[]
    chromaStrategy: 'max_per_hue' | 'uniform'
    contrastRules: {
      textMinDistance: number
      textMinContrast: number
      largeTextMinDistance: number
      largeTextMinContrast: number
    }
  }
  scales: Record<string, ScaleEntry[]>
  intraValidation: {
    allPass: boolean
    byHue: Record<string, { failures: ContrastFailure[] }>
  }
  crossValidation: {
    allPass: boolean
    failures: ContrastFailure[]
  }
}

// ─── Validation ─────────────────────────────────────────────────────
// Source: docs/05-generation-algorithm.md

export function validateIntraSingle(
  scale: ScaleEntry[],
  compliance: 'AA' | 'AAA',
  numLevels: number,
): ContrastFailure[] {
  const textDistance = compliance === 'AA' ? 5 : 6
  const textThreshold = compliance === 'AA' ? 4.5 : 7.0
  const failures: ContrastFailure[] = []

  for (let i = 0; i < numLevels; i++) {
    for (let j = i + textDistance; j < numLevels; j++) {
      const cr = wcagContrastRatio(scale[i].hex, scale[j].hex)
      if (cr < textThreshold) {
        failures.push({ levelA: i, levelB: j, contrast: cr, required: textThreshold })
      }
    }
  }

  return failures
}

export function validateIntraAll(
  scales: Record<string, ScaleEntry[]>,
  compliance: 'AA' | 'AAA',
  numLevels: number,
): Record<string, { failures: ContrastFailure[] }> {
  const result: Record<string, { failures: ContrastFailure[] }> = {}
  for (const [name, scale] of Object.entries(scales)) {
    result[name] = { failures: validateIntraSingle(scale, compliance, numLevels) }
  }
  return result
}

export function validateCrossHue(
  scales: Record<string, ScaleEntry[]>,
  compliance: 'AA' | 'AAA',
  numLevels: number,
): { allPass: boolean; failures: ContrastFailure[] } {
  const textDistance = compliance === 'AA' ? 5 : 6
  const textThreshold = compliance === 'AA' ? 4.5 : 7.0
  const failures: ContrastFailure[] = []
  const names = Object.keys(scales)

  for (let ai = 0; ai < names.length; ai++) {
    for (let bi = ai + 1; bi < names.length; bi++) {
      const scaleA = scales[names[ai]]
      const scaleB = scales[names[bi]]
      for (let i = 0; i < numLevels; i++) {
        for (let j = 0; j < numLevels; j++) {
          if (Math.abs(i - j) >= textDistance) {
            const cr = wcagContrastRatio(scaleA[i].hex, scaleB[j].hex)
            if (cr < textThreshold) {
              failures.push({
                hueA: names[ai],
                hueB: names[bi],
                levelA: i,
                levelB: j,
                contrast: cr,
                required: textThreshold,
              })
            }
          }
        }
      }
    }
  }

  return { allPass: failures.length === 0, failures }
}

// ─── Palette Assembly (shared by generatePalette + store) ───────────

export function assemblePalette(
  hueScales: Record<string, ScaleEntry[]>,
  compliance: 'AA' | 'AAA',
  numLevels: number,
  lightnessCurve: number[],
  chromaStrategy: 'max_per_hue' | 'uniform',
  neutralHue: number | null,
  skipCrossValidation?: boolean,
): PaletteOutput {
  const scales: Record<string, ScaleEntry[]> = { ...hueScales }

  const neutralC = neutralHue === null ? 0 : 0.005
  const neutralH = neutralHue === null ? 0 : neutralHue
  scales.neutral = lightnessCurve.map((L, level) => {
    const hex = oklchToHex(L, neutralC, neutralH)
    return {
      level,
      hex,
      oklch: { L, C: neutralC, H: neutralH },
      relativeLuminance: relativeLuminance(hex),
    }
  })

  const intraByHue = validateIntraAll(scales, compliance, numLevels)
  const intraAllPass = Object.values(intraByHue).every((r) => r.failures.length === 0)
  const crossResult = skipCrossValidation
    ? { allPass: true, failures: [] as ContrastFailure[] }
    : validateCrossHue(scales, compliance, numLevels)

  return {
    meta: {
      compliance,
      numLevels,
      lightnessCurve,
      chromaStrategy,
      contrastRules: {
        textMinDistance: compliance === 'AA' ? 5 : 6,
        textMinContrast: compliance === 'AA' ? 4.5 : 7.0,
        largeTextMinDistance: compliance === 'AA' ? 4 : 5,
        largeTextMinContrast: compliance === 'AA' ? 3.0 : 4.5,
      },
    },
    scales,
    intraValidation: { allPass: intraAllPass, byHue: intraByHue },
    crossValidation: crossResult,
  }
}

// ─── Palette Generation ─────────────────────────────────────────────

export function generatePalette(input: PaletteInput): PaletteOutput {
  const { hues, numLevels, compliance, lightnessCurve, chromaStrategy, neutralHue } = input

  const maxChromas: Record<string, number[]> = {}
  for (const hue of hues) {
    maxChromas[hue.name] = lightnessCurve.map((L) => maxChroma(L, hue.H))
  }

  let chosenChromas: Record<string, number[]>
  if (chromaStrategy === 'max_per_hue') {
    chosenChromas = maxChromas
  } else {
    chosenChromas = {}
    for (let level = 0; level < numLevels; level++) {
      const minC = Math.min(...hues.map((h) => maxChromas[h.name][level]))
      for (const hue of hues) {
        if (!chosenChromas[hue.name]) chosenChromas[hue.name] = []
        chosenChromas[hue.name].push(minC)
      }
    }
  }

  const scales: Record<string, ScaleEntry[]> = {}
  for (const hue of hues) {
    scales[hue.name] = lightnessCurve.map((L, level) => {
      const C = chosenChromas[hue.name][level]
      const hex = oklchToHex(L, C, hue.H)
      return {
        level,
        hex,
        oklch: { L, C, H: hue.H },
        relativeLuminance: relativeLuminance(hex),
      }
    })
  }

  return assemblePalette(scales, compliance, numLevels, lightnessCurve, chromaStrategy, neutralHue)
}

// ─── Public API Aliases ─────────────────────────────────────────────
// Canonical names from the module spec. Internal names kept for
// backward compatibility with existing test imports.

export const oklabToSrgb = oklabToHex
export const oklchToSrgb = oklchToHex
export const wcagContrast = wcagContrastRatio

export function meetsThreshold(
  ratio: number,
  level: 'AA' | 'AAA',
  element: 'normal' | 'large',
): boolean {
  return meetsCompliance(
    ratio,
    level,
    element === 'normal' ? 'text' : 'large_text',
  )
}

export type ScaleInput = PaletteInput
export type ScaleOutput = PaletteOutput
export const generateScale = generatePalette
