import type { ScaleEntry } from '@/colour-math'
import { NEUTRAL_SCALE_NAME } from './types'
import type { Intent, IntentRecord, IntentMap } from './types'

// ─── Band Tables ─────────────────────────────────────────────────────

interface BandEntry {
  minL: number
  intent: Intent
  band: [number, number]
  maxDrift: number
  hueLocked: boolean
  neutralIntent?: Intent
  neutralBand?: [number, number]
  neutralDrift?: number
  neutralHueLocked?: boolean
}

const LIGHT_BANDS: BandEntry[] = [
  { minL: 0.92, intent: 'surface',    band: [0.92, 1.00], maxDrift: 0.03, hueLocked: false },
  { minL: 0.75, intent: 'container',  band: [0.75, 0.94], maxDrift: 0.10, hueLocked: false },
  { minL: 0.55, intent: 'decorative', band: [0.40, 0.85], maxDrift: 0.15, hueLocked: false },
  { minL: 0.30, intent: 'emphasis',   band: [0.30, 0.65], maxDrift: 0.12, hueLocked: true,
    neutralIntent: 'foreground', neutralBand: [0.15, 0.55], neutralDrift: 0.20, neutralHueLocked: false },
  { minL: -Infinity, intent: 'foreground', band: [0.15, 0.55], maxDrift: 0.20, hueLocked: false },
]

const DARK_BANDS: BandEntry[] = [
  { minL: 0.75, intent: 'foreground', band: [0.55, 0.95], maxDrift: 0.20, hueLocked: false },
  { minL: 0.55, intent: 'emphasis',   band: [0.38, 0.75], maxDrift: 0.12, hueLocked: true,
    neutralIntent: 'foreground', neutralBand: [0.55, 0.95], neutralDrift: 0.20, neutralHueLocked: false },
  { minL: 0.40, intent: 'decorative', band: [0.25, 0.65], maxDrift: 0.15, hueLocked: false },
  { minL: 0.22, intent: 'container',  band: [0.20, 0.40], maxDrift: 0.10, hueLocked: false },
  { minL: -Infinity, intent: 'surface', band: [0.12, 0.22], maxDrift: 0.03, hueLocked: false },
]

const BAND_TABLES = { light: LIGHT_BANDS, dark: DARK_BANDS } as const

function classifyByBands(
  L: number,
  isNeutral: boolean,
  bands: BandEntry[],
): IntentRecord {
  for (const entry of bands) {
    if (L >= entry.minL) {
      if (isNeutral && entry.neutralIntent) {
        return {
          intent: entry.neutralIntent,
          band: entry.neutralBand!,
          maxDrift: entry.neutralDrift!,
          hueLocked: entry.neutralHueLocked!,
          chromaLocked: false,
        }
      }
      return {
        intent: entry.intent,
        band: entry.band,
        maxDrift: entry.maxDrift,
        hueLocked: entry.hueLocked,
        chromaLocked: false,
      }
    }
  }
  throw new Error('Band table exhausted — missing catch-all entry')
}

// ─── Public API ──────────────────────────────────────────────────────

export function classifyToken(
  scaleName: string,
  level: number,
  scaleLength: number,
  oklch: { L: number; C: number; H: number },
  mode: 'light' | 'dark' = 'light',
): IntentRecord {
  const isNeutral = scaleName === NEUTRAL_SCALE_NAME
  const isAchromatic = oklch.C < 0.04

  if (isNeutral && (level === 0 || level === scaleLength - 1)) {
    return {
      intent: 'anchor',
      band: [oklch.L, oklch.L],
      maxDrift: 0,
      hueLocked: true,
      chromaLocked: true,
    }
  }

  const record = classifyByBands(oklch.L, isNeutral, BAND_TABLES[mode])

  if (isAchromatic) {
    return { ...record, chromaLocked: true }
  }

  return record
}

export function classifyPalette(
  scales: Record<string, ScaleEntry[]>,
  mode: 'light' | 'dark' = 'light',
): IntentMap {
  const map: IntentMap = {}
  for (const [name, scale] of Object.entries(scales)) {
    map[name] = scale.map((entry, level) =>
      classifyToken(name, level, scale.length, entry.oklch, mode),
    )
  }
  return map
}
