import type { ScaleEntry } from '@/colour-math'
import {
  relativeLuminanceFromOklch,
  wcagContrastRatio,
  oklchToHex,
  maxChroma,
  relativeLuminance,
} from '@/colour-math'
import type {
  IntentMap,
  ContrastEdge,
  TokenRef,
  Adjustment,
  InfeasibilityReport,
  OptimizationResult,
} from './types'

const FOREGROUND_ROLES = new Set(['foreground', 'emphasis'])

function tokenKey(ref: TokenRef): string {
  return `${ref.scale}:${ref.level}`
}

/**
 * Intent classification is computed once from the original palette.
 * Adjustments do not trigger re-classification — a token that drifts
 * into a different L-range retains its original intent. This prevents
 * infinite re-classification in future multi-pass implementations.
 *
 * maxChroma is called per binary-search iteration (~20 calls per failing
 * edge). Each call is pure matrix math. At current scale (5-10 hues,
 * 10 levels, ~130 edges, ~5-10 failures), total cost is sub-millisecond.
 * If Engine C is applied to larger palettes (20+ hues), consider caching
 * maxChroma results by (L, H).
 */
export function solve(
  scales: Record<string, ScaleEntry[]>,
  edges: ContrastEdge[],
  intents: IntentMap,
): OptimizationResult {
  // Step 1 — Deep copy
  const adjustedScales: Record<string, ScaleEntry[]> = {}
  for (const [name, scale] of Object.entries(scales)) {
    adjustedScales[name] = scale.map(e => ({
      ...e,
      oklch: { ...e.oklch },
    }))
  }

  // Step 2 — Tracking
  const driftUsed = new Map<string, number>()
  const adjustments: Adjustment[] = []
  const infeasible: InfeasibilityReport[] = []

  // Step 3 — Sort edges: anchor-involving first, then threshold descending
  const sortedEdges = [...edges].sort((a, b) => {
    const aHasAnchor = isAnchor(a.darker, intents) || isAnchor(a.lighter, intents)
    const bHasAnchor = isAnchor(b.darker, intents) || isAnchor(b.lighter, intents)
    if (aHasAnchor && !bHasAnchor) return -1
    if (!aHasAnchor && bHasAnchor) return 1
    return b.threshold - a.threshold
  })

  // Step 4 — Process each edge
  for (const edge of sortedEdges) {
    const darkerEntry = adjustedScales[edge.darker.scale][edge.darker.level]
    const lighterEntry = adjustedScales[edge.lighter.scale][edge.lighter.level]
    const ratio = wcagContrastRatio(darkerEntry.hex, lighterEntry.hex)

    if (ratio >= edge.threshold) continue

    const darkerIsAnchor = isAnchor(edge.darker, intents)
    const lighterIsAnchor = isAnchor(edge.lighter, intents)

    if (darkerIsAnchor && lighterIsAnchor) {
      infeasible.push({
        darker: edge.darker,
        lighter: edge.lighter,
        threshold: edge.threshold,
        achieved: ratio,
        blocker: 'anchor_freeze',
        suggestion: 'Both tokens are frozen. Adjust the lightness curve to increase separation.',
      })
      continue
    }

    const chosen = pickTokenToAdjust(edge, intents, driftUsed, darkerIsAnchor, lighterIsAnchor)
    if (!chosen) {
      infeasible.push({
        darker: edge.darker,
        lighter: edge.lighter,
        threshold: edge.threshold,
        achieved: ratio,
        blocker: 'drift_exhausted',
        suggestion: buildDriftExhaustedSuggestion(edge, intents),
      })
      continue
    }

    const { token, isDarkerSide } = chosen
    const intent = intents[token.scale][token.level]
    const entry = adjustedScales[token.scale][token.level]
    const otherToken = isDarkerSide ? edge.lighter : edge.darker
    const otherEntry = adjustedScales[otherToken.scale][otherToken.level]

    const currentL = entry.oklch.L
    const originalC = entry.oklch.C
    const H = entry.oklch.H
    const key = tokenKey(token)
    const usedDrift = driftUsed.get(key) ?? 0
    const remainingDrift = intent.maxDrift - usedDrift

    const direction = isDarkerSide ? -1 : 1
    const extreme = clampToBand(currentL + direction * remainingDrift, intent.band)
    const otherY = relativeLuminanceFromOklch(otherEntry.oklch.L, otherEntry.oklch.C, otherEntry.oklch.H)

    // Check if extreme can satisfy threshold
    const extremeC = Math.min(originalC, maxChroma(extreme, H))
    const extremeY = relativeLuminanceFromOklch(extreme, extremeC, H)
    const extremeRatio = contrastFromLuminances(
      isDarkerSide ? extremeY : otherY,
      isDarkerSide ? otherY : extremeY,
    )

    if (extremeRatio < edge.threshold) {
      infeasible.push({
        darker: edge.darker,
        lighter: edge.lighter,
        threshold: edge.threshold,
        achieved: extremeRatio,
        blocker: 'band_boundary',
        suggestion: `The ${intent.intent} token at level ${token.level} hit its lightness band boundary (${intent.band[0]}–${intent.band[1]}). Consider adjusting the lightness curve.`,
      })
      continue
    }

    // Binary search for minimal L adjustment
    let lo = currentL
    let hi = extreme
    if (lo > hi) [lo, hi] = [hi, lo]

    let bestL = extreme
    for (let iter = 0; iter < 20; iter++) {
      const midL = (lo + hi) / 2
      const midC = Math.min(originalC, maxChroma(midL, H))
      const midY = relativeLuminanceFromOklch(midL, midC, H)
      const midRatio = contrastFromLuminances(
        isDarkerSide ? midY : otherY,
        isDarkerSide ? otherY : midY,
      )

      if (midRatio >= edge.threshold) {
        bestL = midL
        if (isDarkerSide) {
          lo = midL
        } else {
          hi = midL
        }
      } else {
        if (isDarkerSide) {
          hi = midL
        } else {
          lo = midL
        }
      }
    }

    // Apply adjustment
    const adjustedL = bestL
    const adjustedC = Math.min(originalC, maxChroma(adjustedL, H))
    const newHex = oklchToHex(adjustedL, adjustedC, H)

    // Verify with hex-based WCAG
    const verifyRatio = wcagContrastRatio(newHex, otherEntry.hex)
    if (verifyRatio < edge.threshold) {
      // Nudge toward extreme until hex-based verification passes
      const nudgedL = nudgeUntilPass(adjustedL, extreme, originalC, H, otherEntry.hex, edge.threshold, isDarkerSide)
      if (nudgedL === null) {
        infeasible.push({
          darker: edge.darker,
          lighter: edge.lighter,
          threshold: edge.threshold,
          achieved: verifyRatio,
          blocker: 'band_boundary',
          suggestion: `The ${intent.intent} token at level ${token.level} hit its lightness band boundary (${intent.band[0]}–${intent.band[1]}). Consider adjusting the lightness curve.`,
        })
        continue
      }
      applyResult(nudgedL, originalC, H, token, otherToken, entry, intent, key, driftUsed, usedDrift, adjustedScales, adjustments)
    } else {
      applyResult(adjustedL, originalC, H, token, otherToken, entry, intent, key, driftUsed, usedDrift, adjustedScales, adjustments)
    }
  }

  // Step 5 — Post-pass verification
  const regressions: ContrastEdge[] = []
  for (const edge of edges) {
    const darkerEntry = adjustedScales[edge.darker.scale][edge.darker.level]
    const lighterEntry = adjustedScales[edge.lighter.scale][edge.lighter.level]
    const currentRatio = wcagContrastRatio(darkerEntry.hex, lighterEntry.hex)

    if (currentRatio < edge.threshold) {
      const origDarker = scales[edge.darker.scale][edge.darker.level]
      const origLighter = scales[edge.lighter.scale][edge.lighter.level]
      const origRatio = wcagContrastRatio(origDarker.hex, origLighter.hex)
      if (currentRatio < origRatio) {
        regressions.push(edge)
      }
    }
  }

  return { adjustedScales, adjustments, infeasible, regressions }
}

function isAnchor(ref: TokenRef, intents: IntentMap): boolean {
  return intents[ref.scale]?.[ref.level]?.intent === 'anchor'
}

function clampToBand(value: number, band: [number, number]): number {
  return Math.max(band[0], Math.min(band[1], value))
}

function contrastFromLuminances(darkerY: number, lighterY: number): number {
  const hi = Math.max(darkerY, lighterY)
  const lo = Math.min(darkerY, lighterY)
  return (hi + 0.05) / (lo + 0.05)
}

function pickTokenToAdjust(
  edge: ContrastEdge,
  intents: IntentMap,
  driftUsed: Map<string, number>,
  darkerIsAnchor: boolean,
  lighterIsAnchor: boolean,
): { token: TokenRef; isDarkerSide: boolean } | null {
  if (darkerIsAnchor) {
    const remaining = getRemainingDrift(edge.lighter, intents, driftUsed)
    return remaining > 0 ? { token: edge.lighter, isDarkerSide: false } : null
  }
  if (lighterIsAnchor) {
    const remaining = getRemainingDrift(edge.darker, intents, driftUsed)
    return remaining > 0 ? { token: edge.darker, isDarkerSide: true } : null
  }

  const darkerIntent = intents[edge.darker.scale][edge.darker.level]
  const lighterIntent = intents[edge.lighter.scale][edge.lighter.level]
  const darkerIsFg = FOREGROUND_ROLES.has(darkerIntent.intent) || darkerIntent.intent === 'decorative'
  const lighterIsFg = FOREGROUND_ROLES.has(lighterIntent.intent) || lighterIntent.intent === 'decorative'

  const darkerRemaining = getRemainingDrift(edge.darker, intents, driftUsed)
  const lighterRemaining = getRemainingDrift(edge.lighter, intents, driftUsed)

  let preferred: { token: TokenRef; isDarkerSide: boolean }
  let fallback: { token: TokenRef; isDarkerSide: boolean }

  if (darkerIsFg && !lighterIsFg) {
    preferred = { token: edge.darker, isDarkerSide: true }
    fallback = { token: edge.lighter, isDarkerSide: false }
  } else if (lighterIsFg && !darkerIsFg) {
    preferred = { token: edge.lighter, isDarkerSide: false }
    fallback = { token: edge.darker, isDarkerSide: true }
  } else if (darkerRemaining >= lighterRemaining) {
    preferred = { token: edge.darker, isDarkerSide: true }
    fallback = { token: edge.lighter, isDarkerSide: false }
  } else {
    preferred = { token: edge.lighter, isDarkerSide: false }
    fallback = { token: edge.darker, isDarkerSide: true }
  }

  const prefRemaining = preferred.isDarkerSide ? darkerRemaining : lighterRemaining
  if (prefRemaining > 0) return preferred
  const fbRemaining = fallback.isDarkerSide ? darkerRemaining : lighterRemaining
  if (fbRemaining > 0) return fallback
  return null
}

function getRemainingDrift(ref: TokenRef, intents: IntentMap, driftUsed: Map<string, number>): number {
  const intent = intents[ref.scale][ref.level]
  const used = driftUsed.get(tokenKey(ref)) ?? 0
  return Math.max(0, intent.maxDrift - used)
}

function nudgeUntilPass(
  startL: number,
  extreme: number,
  originalC: number,
  H: number,
  otherHex: string,
  threshold: number,
  isDarkerSide: boolean,
): number | null {
  const steps = 40
  const step = (extreme - startL) / steps
  for (let i = 1; i <= steps; i++) {
    const testL = startL + step * i
    const testC = Math.min(originalC, maxChroma(testL, H))
    const testHex = oklchToHex(testL, testC, H)
    if (wcagContrastRatio(testHex, otherHex) >= threshold) {
      return testL
    }
  }
  return null
}

function applyResult(
  finalL: number,
  originalC: number,
  H: number,
  token: TokenRef,
  otherToken: TokenRef,
  entry: ScaleEntry,
  intent: { maxDrift: number },
  key: string,
  driftUsed: Map<string, number>,
  previousDrift: number,
  adjustedScales: Record<string, ScaleEntry[]>,
  adjustments: Adjustment[],
): void {
  const adjustedC = Math.min(originalC, maxChroma(finalL, H))
  const newHex = oklchToHex(finalL, adjustedC, H)
  const originalL = entry.oklch.L

  adjustedScales[token.scale][token.level] = {
    ...adjustedScales[token.scale][token.level],
    hex: newHex,
    oklch: { L: finalL, C: adjustedC, H },
    relativeLuminance: relativeLuminance(newHex),
  }

  const newDrift = previousDrift + Math.abs(finalL - originalL)
  driftUsed.set(key, newDrift)

  adjustments.push({
    token,
    originalL,
    adjustedL: finalL,
    adjustedC,
    newHex,
    trigger: otherToken,
  })
}

function buildDriftExhaustedSuggestion(edge: ContrastEdge, intents: IntentMap): string {
  const darkerIntent = intents[edge.darker.scale][edge.darker.level]
  const lighterIntent = intents[edge.lighter.scale][edge.lighter.level]
  const darkerRemaining = darkerIntent.maxDrift
  const lighterRemaining = lighterIntent.maxDrift
  if (darkerRemaining >= lighterRemaining) {
    return `The ${darkerIntent.intent} token at level ${edge.darker.level} exhausted its drift budget (${darkerIntent.maxDrift}). The constraint requires a larger shift.`
  }
  return `The ${lighterIntent.intent} token at level ${edge.lighter.level} exhausted its drift budget (${lighterIntent.maxDrift}). The constraint requires a larger shift.`
}
