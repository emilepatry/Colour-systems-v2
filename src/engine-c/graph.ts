import type { ScaleEntry } from '@/colour-math'
import { NEUTRAL_SCALE_NAME } from './types'
import type { IntentMap, ContrastEdge, TokenRef, Intent } from './types'

const FOREGROUND_ROLES: Set<Intent> = new Set(['foreground', 'emphasis', 'decorative'])
const BACKGROUND_ROLES: Set<Intent> = new Set(['surface', 'container'])

function thresholdForForegroundRole(intent: Intent): number {
  return intent === 'decorative' ? 3.0 : 4.5
}

function makeEdge(
  aScale: string, aLevel: number, aL: number,
  bScale: string, bLevel: number, bL: number,
  threshold: number,
): ContrastEdge {
  const tokenA: TokenRef = { scale: aScale, level: aLevel }
  const tokenB: TokenRef = { scale: bScale, level: bLevel }
  if (aL <= bL) {
    return { darker: tokenA, lighter: tokenB, threshold }
  }
  return { darker: tokenB, lighter: tokenA, threshold }
}

function edgeKey(e: ContrastEdge): string {
  return `${e.darker.scale}:${e.darker.level}|${e.lighter.scale}:${e.lighter.level}`
}

export function buildInteractionGraph(
  scales: Record<string, ScaleEntry[]>,
  intents: IntentMap,
): ContrastEdge[] {
  const edges: ContrastEdge[] = []
  const seen = new Set<string>()

  function addEdge(edge: ContrastEdge): void {
    if (edge.darker.scale === edge.lighter.scale && edge.darker.level === edge.lighter.level) return
    const key = edgeKey(edge)
    if (seen.has(key)) return
    seen.add(key)
    edges.push(edge)
  }

  const scaleNames = Object.keys(scales)

  for (const name of scaleNames) {
    const scale = scales[name]
    const intentArr = intents[name]

    for (let i = 0; i < scale.length; i++) {
      for (let j = i + 1; j < scale.length; j++) {
        const iIntent = intentArr[i].intent
        const jIntent = intentArr[j].intent

        if (iIntent === 'anchor' && jIntent === 'anchor') continue

        const iFg = FOREGROUND_ROLES.has(iIntent)
        const iBg = BACKGROUND_ROLES.has(iIntent)
        const jFg = FOREGROUND_ROLES.has(jIntent)
        const jBg = BACKGROUND_ROLES.has(jIntent)

        if (iFg && jBg) {
          addEdge(makeEdge(name, i, scale[i].oklch.L, name, j, scale[j].oklch.L, thresholdForForegroundRole(iIntent)))
        }
        if (jFg && iBg) {
          addEdge(makeEdge(name, j, scale[j].oklch.L, name, i, scale[i].oklch.L, thresholdForForegroundRole(jIntent)))
        }
      }
    }
  }

  const chromaticNames = scaleNames.filter(n => n !== NEUTRAL_SCALE_NAME)
  const neutralScale = scales[NEUTRAL_SCALE_NAME]
  const neutralIntents = intents[NEUTRAL_SCALE_NAME]

  if (neutralScale && neutralIntents) {
    for (const chromName of chromaticNames) {
      const chromScale = scales[chromName]
      const chromIntents = intents[chromName]

      // Chromatic foreground-role on neutral background-role
      for (let ci = 0; ci < chromScale.length; ci++) {
        const cIntent = chromIntents[ci].intent
        if (!FOREGROUND_ROLES.has(cIntent)) continue
        for (let ni = 0; ni < neutralScale.length; ni++) {
          const nIntent = neutralIntents[ni].intent
          if (!BACKGROUND_ROLES.has(nIntent)) continue
          addEdge(makeEdge(
            chromName, ci, chromScale[ci].oklch.L,
            NEUTRAL_SCALE_NAME, ni, neutralScale[ni].oklch.L,
            thresholdForForegroundRole(cIntent),
          ))
        }
      }

      // Neutral foreground-role on chromatic background-role
      for (let ni = 0; ni < neutralScale.length; ni++) {
        const nIntent = neutralIntents[ni].intent
        if (!FOREGROUND_ROLES.has(nIntent)) continue
        for (let ci = 0; ci < chromScale.length; ci++) {
          const cIntent = chromIntents[ci].intent
          if (!BACKGROUND_ROLES.has(cIntent)) continue
          addEdge(makeEdge(
            NEUTRAL_SCALE_NAME, ni, neutralScale[ni].oklch.L,
            chromName, ci, chromScale[ci].oklch.L,
            thresholdForForegroundRole(nIntent),
          ))
        }
      }
    }
  }

  return edges
}
