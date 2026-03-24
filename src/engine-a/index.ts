import type { EasingId } from './easing'
import { resolveEasing } from './easing'
import { hcToPoint, pointToHC, stableHue } from './coordinate'
import { vectorsOnLine } from './interpolation'

export type { EasingId, PositionFunction } from './easing'
export { resolveEasing, easingMap, ALL_EASING_IDS } from './easing'
export { hcToPoint, pointToHC, stableHue } from './coordinate'
export { vectorOnLine, vectorsOnLine } from './interpolation'

export interface HueOutput {
  H: number
  vibrancy: number
}

/**
 * Poline-adapted OKLCH interpolation engine.
 *
 * Takes anchor positions + easing + numHues + displayL,
 * outputs the handoff contract: { H, vibrancy }[] for Engine B.
 */
export function interpolateAnchors(
  anchors: Array<{ H: number; C: number }>,
  easing: { x: EasingId; y: EasingId },
  numHues: number,
  displayL: number,
): HueOutput[] {
  if (anchors.length < 2) {
    if (anchors.length === 1) {
      const pt = pointToHC(...hcToPoint(anchors[0].H, anchors[0].C, displayL), displayL)
      return [{ H: stableHue(pt.C, pt.H, anchors[0].H), vibrancy: pt.vibrancy }]
    }
    return []
  }

  if (numHues < 1) return []

  const fx = resolveEasing(easing.x)
  const fy = resolveEasing(easing.y)

  const points = anchors.map((a) => hcToPoint(a.H, a.C, displayL))

  const numSegments = anchors.length - 1
  const pointsPerSegment = Math.max(2, Math.ceil((numHues - 1) / numSegments) + 1)

  const segments: Array<Array<[number, number]>> = []
  for (let i = 0; i < points.length - 1; i++) {
    const invert = i % 2 !== 0
    segments.push(vectorsOnLine(points[i], points[i + 1], pointsPerSegment, invert, fx, fy))
  }

  const flatXY: Array<[number, number]> = []
  for (let s = 0; s < segments.length; s++) {
    const start = s === 0 ? 0 : 1
    for (let j = start; j < segments[s].length; j++) {
      flatXY.push(segments[s][j])
    }
  }

  const sampledXY = pickEvenlySpaced(flatXY, numHues)

  return sampledXY.map((xy, i) => {
    const { H, C, vibrancy } = pointToHC(xy[0], xy[1], displayL)
    const nearestAnchorH = findNearestAnchorHue(i, sampledXY.length, anchors)
    const safeH = stableHue(C, H, nearestAnchorH)
    return { H: safeH, vibrancy }
  })
}

function pickEvenlySpaced<T>(arr: T[], n: number): T[] {
  if (n <= 0) return []
  if (n >= arr.length) return arr
  if (n === 1) return [arr[0]]
  return Array.from({ length: n }, (_, i) =>
    arr[Math.round(i * (arr.length - 1) / (n - 1))]
  )
}

function findNearestAnchorHue(
  flatIndex: number,
  totalPoints: number,
  anchors: Array<{ H: number; C: number }>,
): number {
  if (anchors.length <= 1) return anchors[0]?.H ?? 0

  // Map flat index to a position ∈ [0, 1] across the full arc
  const t = totalPoints > 1 ? flatIndex / (totalPoints - 1) : 0
  // Find the closest anchor by position (anchors are evenly spaced across segments)
  const numSegments = anchors.length - 1
  const segmentT = t * numSegments
  const anchorIndex = Math.round(segmentT)
  return anchors[Math.min(anchorIndex, anchors.length - 1)].H
}
