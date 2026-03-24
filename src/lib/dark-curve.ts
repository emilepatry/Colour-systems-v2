const OFFSET_BASE = 0.12
const OFFSET_SLOPE = 0.17
const OFFSET_CURVE = -0.18

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

/**
 * Transforms a light-mode lightness curve into a dark-mode curve.
 *
 * Not a naive `1 - L` inversion. Applies a t-dependent asymmetric offset
 * that widens gaps at the dark end (near the page surface) to compensate
 * for the Y ≈ L³ nonlinearity in WCAG relative luminance.
 */
export function deriveDarkCurve(lightCurve: number[]): number[] {
  if (lightCurve.length < 2) {
    return lightCurve.map(L => clamp(1 - L, 0.10, 0.98))
  }

  return lightCurve.map((L, i, arr) => {
    const t = i / (arr.length - 1)
    const base = 1 - L
    const offset = OFFSET_BASE + OFFSET_SLOPE * t + OFFSET_CURVE * t * t
    return clamp(base + offset, 0.10, 0.98)
  })
}

/**
 * Applies per-level overrides on top of the derived dark curve.
 * When `overrides` is empty, the result equals `deriveDarkCurve(lightCurve)`.
 */
export function resolveDarkCurve(
  lightCurve: number[],
  overrides: Record<number, number>,
): number[] {
  const derived = deriveDarkCurve(lightCurve)
  // TODO: validate monotonicity post-override (undo can restore stale overrides)
  return derived.map((L, i) =>
    i in overrides ? overrides[i] : L,
  )
}
