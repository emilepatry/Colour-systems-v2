import { maxChroma } from '@/colour-math'

const CHROMA_EPSILON = 0.002

export function hcToPoint(
  H: number,
  C: number,
  displayL: number,
): [number, number] {
  const cx = 0.5
  const cy = 0.5
  const cMax = maxChroma(displayL, H)
  const normC = cMax > 0 ? C / cMax : 0
  const dist = normC * cx
  const radians = H * (Math.PI / 180)
  return [cx + dist * Math.cos(radians), cy + dist * Math.sin(radians)]
}

export function pointToHC(
  x: number,
  y: number,
  displayL: number,
): { H: number; C: number; vibrancy: number } {
  const cx = 0.5
  const cy = 0.5
  const radians = Math.atan2(y - cy, x - cx)
  let H = radians * (180 / Math.PI)
  H = (360 + H) % 360
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
  const normC = Math.min(dist / cx, 1.0)
  const cMax = maxChroma(displayL, H)
  return { H, C: normC * cMax, vibrancy: normC }
}

export function stableHue(
  C: number,
  H: number,
  fallbackH: number,
): number {
  return C < CHROMA_EPSILON ? fallbackH : H
}
