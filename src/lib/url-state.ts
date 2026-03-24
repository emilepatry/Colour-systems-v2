import type { SourceState } from '@/store'
import { ALL_EASING_IDS, type EasingId } from '@/engine-a/easing'

interface SharePayload {
  v: 1
  s: SourceState
}

function toBase64Url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(b64: string): string {
  const padded =
    b64.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - (b64.length % 4)) % 4)
  return atob(padded)
}

const VALID_EASINGS = new Set<string>(ALL_EASING_IDS)

function validateSourceState(s: unknown): s is SourceState {
  if (!s || typeof s !== 'object') return false
  const o = s as Record<string, unknown>

  if (
    !Array.isArray(o.anchors) ||
    o.anchors.length < 2 ||
    o.anchors.length > 20 ||
    !o.anchors.every(
      (a: unknown) =>
        a !== null &&
        typeof a === 'object' &&
        typeof (a as Record<string, unknown>).H === 'number' &&
        Number.isFinite((a as Record<string, unknown>).H) &&
        typeof (a as Record<string, unknown>).C === 'number' &&
        Number.isFinite((a as Record<string, unknown>).C),
    )
  )
    return false

  const easing = o.easing as Record<string, unknown> | undefined
  if (
    !easing ||
    typeof easing !== 'object' ||
    !VALID_EASINGS.has(easing.x as string) ||
    !VALID_EASINGS.has(easing.y as string)
  )
    return false

  if (
    typeof o.numHues !== 'number' ||
    !Number.isInteger(o.numHues) ||
    o.numHues < 2 ||
    o.numHues > 10
  )
    return false

  if (
    !Array.isArray(o.lightnessCurve) ||
    o.lightnessCurve.length < 2 ||
    o.lightnessCurve.length > 20 ||
    !o.lightnessCurve.every(
      (v: unknown) => typeof v === 'number' && Number.isFinite(v),
    )
  )
    return false

  if (
    typeof o.displayL !== 'number' ||
    !Number.isFinite(o.displayL) ||
    o.displayL < 0.05 ||
    o.displayL > 0.95
  )
    return false

  if (o.chromaStrategy !== 'max_per_hue' && o.chromaStrategy !== 'uniform')
    return false

  if (o.compliance !== 'AA' && o.compliance !== 'AAA') return false

  if (o.neutralHue !== null && (typeof o.neutralHue !== 'number' || !Number.isFinite(o.neutralHue)))
    return false

  if (
    typeof o.globalVibrancy !== 'number' ||
    !Number.isFinite(o.globalVibrancy) ||
    o.globalVibrancy < 0 ||
    o.globalVibrancy > 1
  )
    return false

  if (o.activeMode !== 'light' && o.activeMode !== 'dark') return false

  if (
    typeof o.darkCurveOverrides !== 'object' ||
    o.darkCurveOverrides === null ||
    Array.isArray(o.darkCurveOverrides)
  )
    return false

  return true
}

export function encodeState(source: SourceState): string {
  const payload: SharePayload = { v: 1, s: source }
  return toBase64Url(JSON.stringify(payload))
}

export function decodeState(hash: string): SourceState | null {
  try {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash
    if (!raw) return null
    const payload = JSON.parse(fromBase64Url(raw))
    if (payload?.v !== 1 || !payload?.s) return null
    return validateSourceState(payload.s) ? (payload.s as SourceState) : null
  } catch {
    return null
  }
}
