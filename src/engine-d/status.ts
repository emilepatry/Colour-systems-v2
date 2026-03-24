import type { ScaleEntry } from '@/colour-math'
import { oklchToHex, maxChroma, wcagContrastRatio } from '@/colour-math'
import { NEUTRAL_SCALE_NAME } from '@/engine-c/types'
import type { IntentMap } from '@/engine-c/types'
import type { SemanticToken } from './types'
import { calculateForeground } from './mapper'

// ─── Canonical Status Hues ───────────────────────────────────────────

const STATUS_DEFINITIONS = [
  { name: 'success', canonicalH: 145 },
  { name: 'warning', canonicalH: 85 },
  { name: 'error', canonicalH: 25 },
  { name: 'info', canonicalH: 255 },
] as const

const NATIVE_THRESHOLD = 30

/**
 * Shortest angular distance on the hue circle (0..180).
 */
export function angularDistance(a: number, b: number): number {
  const diff = Math.abs(((a - b) % 360 + 360) % 360)
  return diff > 180 ? 360 - diff : diff
}

// ─── Synthesis ───────────────────────────────────────────────────────

interface StatusResult {
  tokens: Record<string, SemanticToken>
  synthesis: Record<string, 'native' | 'synthesized'>
}

/**
 * Find the emphasis-band midpoint L for a given mode.
 * Light emphasis is roughly 0.30–0.65, dark is 0.38–0.75.
 */
function emphasisMidL(mode: 'light' | 'dark'): number {
  return mode === 'light' ? 0.475 : 0.565
}

/**
 * Find the container-band midpoint L for subtle variants.
 * Light container is roughly 0.75–0.94, dark is 0.20–0.40.
 */
function containerMidL(mode: 'light' | 'dark'): number {
  return mode === 'light' ? 0.845 : 0.30
}

export function synthesizeStatusTokens(
  scales: Record<string, ScaleEntry[]>,
  intents: IntentMap,
  mode: 'light' | 'dark',
  globalVibrancy: number,
  canvas: SemanticToken,
  neutralAnchors: { light: SemanticToken; dark: SemanticToken },
): StatusResult {
  const tokens: Record<string, SemanticToken> = {}
  const synthesis: Record<string, 'native' | 'synthesized'> = {}

  // Collect chromatic hue angles from the palette
  const hueAngles: { name: string; H: number }[] = []
  for (const [name, scale] of Object.entries(scales)) {
    if (name === NEUTRAL_SCALE_NAME || scale.length === 0) continue
    const midEntry = scale[Math.floor(scale.length / 2)]
    hueAngles.push({ name, H: midEntry.oklch.H })
  }

  const midL = emphasisMidL(mode)
  const subtleL = containerMidL(mode)

  for (const { name: statusName, canonicalH } of STATUS_DEFINITIONS) {
    // Find nearest palette hue
    let nearestHue: { name: string; H: number; dist: number } | null = null
    for (const hue of hueAngles) {
      const dist = angularDistance(hue.H, canonicalH)
      if (!nearestHue || dist < nearestHue.dist) {
        nearestHue = { ...hue, dist }
      }
    }

    let fillToken: SemanticToken
    let subtleToken: SemanticToken

    if (nearestHue && nearestHue.dist <= NATIVE_THRESHOLD) {
      // Native: use the palette hue's emphasis token
      synthesis[statusName] = 'native'
      const scale = scales[nearestHue.name]
      const intentArr = intents[nearestHue.name]

      // Find the emphasis token closest to midL
      let bestEntry: ScaleEntry | null = null
      let bestDist = Infinity
      for (let i = 0; i < scale.length; i++) {
        if (intentArr[i].intent === 'emphasis') {
          const d = Math.abs(scale[i].oklch.L - midL)
          if (d < bestDist) {
            bestDist = d
            bestEntry = scale[i]
          }
        }
      }

      // Fallback: highest-chroma token on that hue
      if (!bestEntry) {
        let bestC = -1
        for (const e of scale) {
          if (e.oklch.C > bestC) {
            bestC = e.oklch.C
            bestEntry = e
          }
        }
      }

      fillToken = bestEntry
        ? { hex: bestEntry.hex, oklch: { ...bestEntry.oklch } }
        : synthesizeToken(canonicalH, midL, globalVibrancy)

      // Subtle: find container-intent token, or use surface-level lightness
      let subtleEntry: ScaleEntry | null = null
      let subtleDist = Infinity
      for (let i = 0; i < scale.length; i++) {
        if (intentArr[i].intent === 'container' || intentArr[i].intent === 'surface') {
          const d = Math.abs(scale[i].oklch.L - subtleL)
          if (d < subtleDist) {
            subtleDist = d
            subtleEntry = scale[i]
          }
        }
      }

      subtleToken = subtleEntry
        ? { hex: subtleEntry.hex, oklch: { ...subtleEntry.oklch } }
        : synthesizeToken(canonicalH, subtleL, globalVibrancy)
    } else {
      // Synthesize at canonical angle
      synthesis[statusName] = 'synthesized'
      fillToken = synthesizeToken(canonicalH, midL, globalVibrancy)
      subtleToken = synthesizeToken(canonicalH, subtleL, globalVibrancy)
    }

    // Verify fill contrast against canvas; nudge if needed
    const fillRatio = wcagContrastRatio(fillToken.hex, canvas.hex)
    if (fillRatio < 3.0) {
      const nudgedL = mode === 'light'
        ? Math.max(fillToken.oklch.L - 0.10, 0.20)
        : Math.min(fillToken.oklch.L + 0.10, 0.85)
      const nudgedC = Math.min(fillToken.oklch.C, maxChroma(nudgedL, fillToken.oklch.H))
      const nudgedHex = oklchToHex(nudgedL, nudgedC, fillToken.oklch.H)
      fillToken = { hex: nudgedHex, oklch: { L: nudgedL, C: nudgedC, H: fillToken.oklch.H } }
    }

    tokens[`status.${statusName}`] = fillToken
    tokens[`status.${statusName}-subtle`] = subtleToken
    tokens[`status.${statusName}-foreground`] = calculateForeground(
      fillToken.hex, fillToken.oklch.L, neutralAnchors,
    )
  }

  return { tokens, synthesis }
}

function synthesizeToken(H: number, L: number, globalVibrancy: number): SemanticToken {
  const C = maxChroma(L, H) * globalVibrancy
  const hex = oklchToHex(L, C, H)
  return { hex, oklch: { L, C, H } }
}
