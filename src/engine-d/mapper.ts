// Engine D — Semantic Mapper
//
// Data contract: Engine D reads `intents` for role assignment and
// `adjustedScales` for final colour values. Intents are classified
// from the *original* scales (pre-solve) and remain stable through
// solving — the solver drifts L without re-classification. Engine D
// must never re-run classifyPalette on adjustedScales.

import type { ScaleEntry } from '@/colour-math'
import { oklchToHex, maxChroma, wcagContrastRatio } from '@/colour-math'
import { NEUTRAL_SCALE_NAME } from '@/engine-c/types'
import type { IntentMap, IntentRecord, OptimizationResult } from '@/engine-c/types'
import type { SemanticToken, SemanticTokenSet } from './types'
import { synthesizeStatusTokens } from './status'

// ─── Helpers ─────────────────────────────────────────────────────────

interface IndexedEntry {
  level: number
  entry: ScaleEntry
  intent: IntentRecord
}

function tokenFromEntry(entry: ScaleEntry, alpha?: number): SemanticToken {
  const t: SemanticToken = { hex: entry.hex, oklch: { ...entry.oklch } }
  if (alpha !== undefined) t.alpha = alpha
  return t
}

function tokenFromOklch(L: number, C: number, H: number, alpha?: number): SemanticToken {
  const hex = oklchToHex(L, C, H)
  const t: SemanticToken = { hex, oklch: { L, C, H } }
  if (alpha !== undefined) t.alpha = alpha
  return t
}

/**
 * Pick the best foreground (light or dark neutral) for a given fill,
 * choosing whichever neutral achieves higher contrast.
 */
export function calculateForeground(
  fillHex: string,
  fillL: number,
  neutralAnchors: { light: SemanticToken; dark: SemanticToken },
  contrastThreshold = 4.5,
): SemanticToken {
  const preferred = fillL < 0.55 ? neutralAnchors.light : neutralAnchors.dark
  const fallback = fillL < 0.55 ? neutralAnchors.dark : neutralAnchors.light

  const prefRatio = wcagContrastRatio(fillHex, preferred.hex)
  const fbRatio = wcagContrastRatio(fillHex, fallback.hex)

  if (prefRatio >= contrastThreshold) return { ...preferred }
  if (fbRatio >= contrastThreshold) return { ...fallback }

  const whiteHex = oklchToHex(1, 0, 0)
  const blackHex = oklchToHex(0, 0, 0)
  const whiteRatio = wcagContrastRatio(fillHex, whiteHex)
  const blackRatio = wcagContrastRatio(fillHex, blackHex)
  if (whiteRatio >= blackRatio) {
    return { hex: whiteHex, oklch: { L: 1, C: 0, H: 0 } }
  }
  return { hex: blackHex, oklch: { L: 0, C: 0, H: 0 } }
}

/**
 * Shift a token's L toward the mode extreme until contrast against all
 * backgrounds meets the threshold. Returns adjusted token, or null if
 * already passing. Preserves hue; clamps chroma to gamut at each step.
 */
function shiftLForContrast(
  token: SemanticToken,
  bgHexes: string[],
  threshold: number,
  mode: 'light' | 'dark',
): SemanticToken | null {
  if (bgHexes.length === 0) return null

  const meetsAll = (hex: string) =>
    bgHexes.every(bg => wcagContrastRatio(hex, bg) >= threshold)

  if (meetsAll(token.hex)) return null

  let { L } = token.oklch
  const { C: originalC, H } = token.oklch
  const step = mode === 'light' ? -0.01 : 0.01

  for (let i = 0; i < 100; i++) {
    L = Math.max(0, Math.min(1, L + step))
    const C = Math.min(originalC, maxChroma(L, H))
    const hex = oklchToHex(L, C, H)
    if (meetsAll(hex)) {
      return { hex, oklch: { L, C, H } }
    }
    if (L <= 0 || L >= 1) {
      return { hex, oklch: { L, C, H } }
    }
  }

  const C = Math.min(originalC, maxChroma(L, H))
  const hex = oklchToHex(L, C, H)
  return { hex, oklch: { L, C, H } }
}

function enforceTextContrast(
  tokens: Record<string, SemanticToken>,
  compliance: 'AA' | 'AAA',
  mode: 'light' | 'dark',
): void {
  const threshold = compliance === 'AAA' ? 7.0 : 4.5
  const canvas = tokens['background.canvas']
  if (!canvas) return
  const bgHexes = [canvas.hex]

  const textRoles = ['text.primary', 'text.secondary', 'text.tertiary']
  let prevL: number | null = null

  for (const role of textRoles) {
    const token = tokens[role]
    if (!token) { continue }

    const shifted = shiftLForContrast(token, bgHexes, threshold, mode)
    let final = shifted ?? token

    // Maintain monotonic L ordering: primary.L <= secondary.L <= tertiary.L
    if (prevL !== null && final.oklch.L < prevL) {
      const C = Math.min(final.oklch.C, maxChroma(prevL, final.oklch.H))
      const hex = oklchToHex(prevL, C, final.oklch.H)
      final = { hex, oklch: { L: prevL, C, H: final.oklch.H } }
    }

    tokens[role] = final
    prevL = final.oklch.L
  }
}

function enforceFocusRingContrast(
  tokens: Record<string, SemanticToken>,
  mode: 'light' | 'dark',
): void {
  const ring = tokens['focus.ring']
  const canvas = tokens['background.canvas']
  if (!ring || !canvas) return

  const shifted = shiftLForContrast(ring, [canvas.hex], 3, mode)
  if (!shifted) return

  tokens['focus.ring'] = shifted
  const outline = tokens['focus.outline']
  if (outline) {
    tokens['focus.outline'] = { ...shifted, alpha: outline.alpha }
  }
}

// ─── Neutral Scale Mapping ───────────────────────────────────────────

function mapNeutrals(
  scale: ScaleEntry[],
  intentArr: IntentRecord[],
): Record<string, SemanticToken> {
  const tokens: Record<string, SemanticToken> = {}

  // Group tokens by Engine C intent classification
  const groups: Record<string, IndexedEntry[]> = {
    anchor: [], surface: [], container: [], decorative: [], foreground: [], emphasis: [],
  }
  for (let i = 0; i < scale.length; i++) {
    const ie: IndexedEntry = { level: i, entry: scale[i], intent: intentArr[i] }
    groups[ie.intent.intent].push(ie)
  }

  // Anchors → inverse tokens (highest L = inverse bg, lowest L = inverse text)
  if (groups.anchor.length > 0) {
    const sorted = [...groups.anchor].sort((a, b) => b.entry.oklch.L - a.entry.oklch.L)
    tokens['background.inverse'] = tokenFromEntry(sorted[0].entry)
    tokens['text.inverse'] = tokenFromEntry(sorted[sorted.length - 1].entry)
  }

  // Global fallback pool: all non-anchor tokens sorted by descending L
  const allSorted = [...groups.surface, ...groups.container, ...groups.decorative, ...groups.foreground, ...groups.emphasis]
    .sort((a, b) => b.entry.oklch.L - a.entry.oklch.L)

  // Surface intent → background roles (canvas, surface, surface-raised)
  // Merge highest-L decorative tokens if needed
  const bgPool = [...groups.surface]
  const decorSorted = [...groups.decorative].sort((a, b) => b.entry.oklch.L - a.entry.oklch.L)
  while (bgPool.length < 3 && decorSorted.length > 0) {
    bgPool.push(decorSorted.shift()!)
  }
  const bgSrc = bgPool.length > 0
    ? bgPool.sort((a, b) => b.entry.oklch.L - a.entry.oklch.L)
    : allSorted.slice(0, 3)

  const bgRoles = ['background.canvas', 'background.surface', 'background.surface-raised']
  for (let i = 0; i < bgRoles.length; i++) {
    const src = bgSrc[Math.min(i, bgSrc.length - 1)]
    tokens[bgRoles[i]] = tokenFromEntry(src.entry)
  }

  // Container intent + remaining decorative → inset + border roles
  const borderPool = [...groups.container, ...decorSorted]
  const borderSrc = borderPool.length > 0
    ? borderPool.sort((a, b) => b.entry.oklch.L - a.entry.oklch.L)
    : allSorted.slice(Math.min(3, allSorted.length))
  const borderRoles = ['background.surface-inset', 'border.subtle', 'border.default', 'border.strong']
  for (let i = 0; i < borderRoles.length; i++) {
    const src = borderSrc.length > 0
      ? borderSrc[Math.min(i, borderSrc.length - 1)]
      : allSorted[allSorted.length - 1]
    tokens[borderRoles[i]] = tokenFromEntry(src.entry)
  }

  // Foreground intent → text roles. Sorted by ascending L so that in light mode,
  // darkest = text.primary (most contrast); in dark mode, foreground tokens are
  // already at the light end due to intent classification.
  const fgPool = groups.foreground.length > 0
    ? [...groups.foreground]
    : allSorted.slice(-Math.min(4, allSorted.length)).reverse()
  const fgSorted = fgPool.sort((a, b) => a.entry.oklch.L - b.entry.oklch.L)
  const textRoles = ['text.primary', 'text.secondary', 'text.tertiary', 'text.disabled']
  for (let i = 0; i < textRoles.length; i++) {
    const src = fgSorted[Math.min(i, fgSorted.length - 1)]
    tokens[textRoles[i]] = tokenFromEntry(src.entry)
  }

  return tokens
}

// ─── Chromatic Scale Mapping ─────────────────────────────────────────

const ACCENT_HOVER_OFFSET = 0.08
const ACCENT_ACTIVE_OFFSET = 0.08

function mapChromatics(
  scales: Record<string, ScaleEntry[]>,
  intents: IntentMap,
  neutralAnchors: { light: SemanticToken; dark: SemanticToken },
  contrastThreshold = 4.5,
): Record<string, SemanticToken> {
  const tokens: Record<string, SemanticToken> = {}

  const hue0Name = Object.keys(scales).find(k => k === 'hue-0')
  if (!hue0Name) return tokens

  const hue0Scale = scales[hue0Name]
  const hue0Intents = intents[hue0Name]

  // Find emphasis token closest to mid-L of the emphasis band
  let accentEntry: ScaleEntry | null = null
  let bestDist = Infinity

  for (let i = 0; i < hue0Scale.length; i++) {
    if (hue0Intents[i].intent === 'emphasis') {
      const bandMid = (hue0Intents[i].band[0] + hue0Intents[i].band[1]) / 2
      const dist = Math.abs(hue0Scale[i].oklch.L - bandMid)
      if (dist < bestDist) {
        bestDist = dist
        accentEntry = hue0Scale[i]
      }
    }
  }

  // Fallback: highest-chroma token at mid-L if no emphasis tokens
  if (!accentEntry) {
    let bestC = -1
    for (const entry of hue0Scale) {
      if (entry.oklch.C > bestC) {
        bestC = entry.oklch.C
        accentEntry = entry
      }
    }
  }

  if (!accentEntry) return tokens

  const { L, C, H } = accentEntry.oklch
  tokens['accent.primary'] = tokenFromEntry(accentEntry)

  // Derive hover/active from L offset + maxChroma
  const hoverL = Math.min(L + ACCENT_HOVER_OFFSET, 0.95)
  const hoverC = Math.min(C, maxChroma(hoverL, H))
  tokens['accent.primary-hover'] = tokenFromOklch(hoverL, hoverC, H)

  const activeL = Math.max(L - ACCENT_ACTIVE_OFFSET, 0.05)
  const activeC = Math.min(C, maxChroma(activeL, H))
  tokens['accent.primary-active'] = tokenFromOklch(activeL, activeC, H)

  // Foreground
  tokens['accent.primary-foreground'] = calculateForeground(
    accentEntry.hex, L, neutralAnchors, contrastThreshold,
  )

  // Accent-subtle: hue-0 at the highest-L surface-intent token's lightness
  const surfaceEntries = hue0Scale
    .map((e, i) => ({ e, i }))
    .filter(({ i }) => hue0Intents[i].intent === 'surface')
    .sort((a, b) => b.e.oklch.L - a.e.oklch.L)

  if (surfaceEntries.length > 0) {
    tokens['background.accent-subtle'] = tokenFromEntry(surfaceEntries[0].e)
  } else {
    // Fallback: synthesize at a high L with low chroma
    const subtleL = 0.93
    const subtleC = Math.min(0.04, maxChroma(subtleL, H))
    tokens['background.accent-subtle'] = tokenFromOklch(subtleL, subtleC, H)
  }

  return tokens
}

// ─── Chart Tokens ───────────────────────────────────────────────────

function mapChartTokens(
  scales: Record<string, ScaleEntry[]>,
  intents: IntentMap,
): Record<string, SemanticToken> {
  const tokens: Record<string, SemanticToken> = {}

  const hueNames = Object.keys(scales)
    .filter(k => k !== NEUTRAL_SCALE_NAME && k.startsWith('hue-'))
    .sort((a, b) => {
      const ai = parseInt(a.replace('hue-', ''), 10)
      const bi = parseInt(b.replace('hue-', ''), 10)
      return ai - bi
    })

  if (hueNames.length === 0) return tokens

  const emphasisPerHue: SemanticToken[] = []
  for (const hueName of hueNames) {
    const scale = scales[hueName]
    const hueIntents = intents[hueName]
    if (!scale || !hueIntents) continue

    let best: ScaleEntry | null = null
    let bestDist = Infinity
    for (let i = 0; i < scale.length; i++) {
      if (hueIntents[i].intent === 'emphasis') {
        const bandMid = (hueIntents[i].band[0] + hueIntents[i].band[1]) / 2
        const dist = Math.abs(scale[i].oklch.L - bandMid)
        if (dist < bestDist) {
          bestDist = dist
          best = scale[i]
        }
      }
    }
    if (!best) {
      let bestC = -1
      for (const entry of scale) {
        if (entry.oklch.C > bestC) { bestC = entry.oklch.C; best = entry }
      }
    }
    if (best) emphasisPerHue.push(tokenFromEntry(best))
  }

  if (emphasisPerHue.length === 0) return tokens

  for (let i = 0; i < 5; i++) {
    tokens[`chart.${i + 1}`] = { ...emphasisPerHue[i % emphasisPerHue.length] }
  }

  return tokens
}

// ─── Derived Tokens ──────────────────────────────────────────────────

function mapDerived(
  tokens: Record<string, SemanticToken>,
): void {
  const accentPrimary = tokens['accent.primary']
  const accentForeground = tokens['accent.primary-foreground']
  const inverse = tokens['background.inverse']

  if (accentPrimary) {
    tokens['text.link'] = { ...accentPrimary }
    tokens['focus.ring'] = { ...accentPrimary }
    tokens['focus.outline'] = { ...accentPrimary, alpha: 0.5 }
  }

  if (accentForeground) {
    tokens['text.on-accent'] = { ...accentForeground }
  }

  if (inverse) {
    tokens['background.scrim'] = { ...inverse, alpha: 0.4 }
  }
}

// ─── Public API ──────────────────────────────────────────────────────

export function mapSemanticTokens(
  result: OptimizationResult,
  mode: 'light' | 'dark',
  globalVibrancy: number,
  compliance: 'AA' | 'AAA' = 'AA',
): SemanticTokenSet {
  const { adjustedScales, intents } = result
  const neutralScale = adjustedScales[NEUTRAL_SCALE_NAME]
  const neutralIntents = intents[NEUTRAL_SCALE_NAME]
  const contrastThreshold = compliance === 'AAA' ? 7.0 : 4.5

  const tokens: Record<string, SemanticToken> = {}

  // 1. Neutral mapping
  if (neutralScale && neutralIntents) {
    Object.assign(tokens, mapNeutrals(neutralScale, neutralIntents))
  }

  // Build neutral anchors for foreground calculations
  const neutralAnchors = {
    light: tokens['background.inverse'] ?? tokens['background.canvas'] ?? tokenFromOklch(0.98, 0, 0),
    dark: tokens['text.inverse'] ?? tokens['text.primary'] ?? tokenFromOklch(0.15, 0, 0),
  }

  // 2. Chromatic mapping
  Object.assign(tokens, mapChromatics(adjustedScales, intents, neutralAnchors, contrastThreshold))

  // 3. Chart tokens
  Object.assign(tokens, mapChartTokens(adjustedScales, intents))

  // 4. Derived tokens
  mapDerived(tokens)

  // 5. Status synthesis
  const canvas = tokens['background.canvas'] ?? tokenFromOklch(0.98, 0, 0)
  const { tokens: statusTokens, synthesis } = synthesizeStatusTokens(
    adjustedScales, intents, mode, globalVibrancy, canvas, neutralAnchors, contrastThreshold,
  )
  Object.assign(tokens, statusTokens)

  // 6. Contrast enforcement
  enforceTextContrast(tokens, compliance, mode)
  enforceFocusRingContrast(tokens, mode)

  return {
    tokens,
    meta: {
      mode,
      statusSynthesis: synthesis,
    },
  }
}
