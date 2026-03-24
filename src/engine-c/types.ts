import type { ScaleEntry } from '@/colour-math'

export const NEUTRAL_SCALE_NAME = 'neutral' as const

export type Intent = 'anchor' | 'surface' | 'container' | 'foreground' | 'decorative' | 'emphasis'

export interface IntentRecord {
  intent: Intent
  band: [number, number]
  maxDrift: number
  hueLocked: boolean
  chromaLocked: boolean
}

export type IntentMap = Record<string, IntentRecord[]>

/**
 * A contrast requirement between two tokens.
 *
 * `darker` is the token with lower L; `lighter` is the token with higher L.
 * This is a geometric convention (not semantic intent) — a decorative token
 * at L=0.60 paired with a container at L=0.80 puts the decorative in `darker`.
 * The solver uses this convention to determine adjustment direction:
 * push `darker` down or `lighter` up to increase contrast.
 */
export interface ContrastEdge {
  darker: TokenRef
  lighter: TokenRef
  threshold: number
}

export interface TokenRef {
  scale: string
  level: number
}

export interface Adjustment {
  token: TokenRef
  originalL: number
  adjustedL: number
  adjustedC: number
  newHex: string
  trigger: TokenRef
}

export interface InfeasibilityReport {
  darker: TokenRef
  lighter: TokenRef
  threshold: number
  achieved: number
  blocker: 'anchor_freeze' | 'band_boundary' | 'drift_exhausted'
  suggestion: string
}

export interface OptimizationResult {
  adjustedScales: Record<string, ScaleEntry[]>
  adjustments: Adjustment[]
  infeasible: InfeasibilityReport[]
  regressions: ContrastEdge[]
  intents: IntentMap
}
