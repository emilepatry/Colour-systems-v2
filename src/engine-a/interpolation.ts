import type { PositionFunction } from './easing'

export function vectorOnLine(
  t: number,
  p1: [number, number],
  p2: [number, number],
  invert: boolean,
  fx: PositionFunction,
  fy: PositionFunction,
): [number, number] {
  const tx = fx(t, invert)
  const ty = fy(t, invert)
  return [
    (1 - tx) * p1[0] + tx * p2[0],
    (1 - ty) * p1[1] + ty * p2[1],
  ]
}

export function vectorsOnLine(
  p1: [number, number],
  p2: [number, number],
  numPoints: number,
  invert: boolean,
  fx: PositionFunction,
  fy: PositionFunction,
): Array<[number, number]> {
  const points: Array<[number, number]> = []
  for (let i = 0; i < numPoints; i++) {
    points.push(vectorOnLine(i / (numPoints - 1), p1, p2, invert, fx, fy))
  }
  return points
}
