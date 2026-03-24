export { NEUTRAL_SCALE_NAME } from './types'
export type {
  Intent, IntentRecord, IntentMap, TokenRef,
  ContrastEdge, Adjustment, InfeasibilityReport,
  OptimizationResult,
} from './types'
export { classifyToken, classifyPalette } from './intent'
export { buildInteractionGraph } from './graph'
export { solve } from './solver'

import type { PaletteOutput } from '@/colour-math'
import { classifyPalette } from './intent'
import { buildInteractionGraph } from './graph'
import { solve } from './solver'

export function runEngineC(
  palette: PaletteOutput,
  mode: 'light' | 'dark' = 'light',
): OptimizationResult {
  const intents = classifyPalette(palette.scales, mode)
  const graph = buildInteractionGraph(palette.scales, intents)
  const result = solve(palette.scales, graph, intents)
  return { ...result, intents }
}
