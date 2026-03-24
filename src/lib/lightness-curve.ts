const L_MIN = 0.05
const L_MAX = 0.99
const NEIGHBOUR_GAP = 0.001

/**
 * Clamp a proposed lightness value so the curve stays strictly monotonic.
 *
 * ascending=false (default): strictly decreasing — curve[0] lightest, curve[9] darkest.
 * ascending=true: strictly increasing — curve[0] darkest, curve[9] lightest (dark mode).
 */
export function clampCurvePoint(
  curve: number[],
  index: number,
  proposedL: number,
  ascending = false,
): number {
  let upperBound: number, lowerBound: number
  if (ascending) {
    upperBound = index < curve.length - 1 ? curve[index + 1] - NEIGHBOUR_GAP : L_MAX
    lowerBound = index > 0 ? curve[index - 1] + NEIGHBOUR_GAP : L_MIN
  } else {
    upperBound = index > 0 ? curve[index - 1] - NEIGHBOUR_GAP : L_MAX
    lowerBound = index < curve.length - 1 ? curve[index + 1] + NEIGHBOUR_GAP : L_MIN
  }
  return Math.max(Math.max(lowerBound, L_MIN), Math.min(Math.min(upperBound, L_MAX), proposedL))
}
