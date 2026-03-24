export type PositionFunction = (t: number, reverse?: boolean) => number

export type EasingId =
  | 'linear'
  | 'sinusoidal'
  | 'exponential'
  | 'quadratic'
  | 'cubic'
  | 'quartic'
  | 'asinusoidal'
  | 'arc'
  | 'smoothStep'

const HALF_PI = Math.PI / 2

const linear: PositionFunction = (t) => t

const sinusoidal: PositionFunction = (t, reverse = false) =>
  reverse ? 1 - Math.sin((1 - t) * HALF_PI) : Math.sin(t * HALF_PI)

const exponential: PositionFunction = (t, reverse = false) =>
  reverse ? 1 - (1 - t) ** 2 : t ** 2

const quadratic: PositionFunction = (t, reverse = false) =>
  reverse ? 1 - (1 - t) ** 3 : t ** 3

const cubic: PositionFunction = (t, reverse = false) =>
  reverse ? 1 - (1 - t) ** 4 : t ** 4

const quartic: PositionFunction = (t, reverse = false) =>
  reverse ? 1 - (1 - t) ** 5 : t ** 5

const asinusoidal: PositionFunction = (t, reverse = false) =>
  reverse ? 1 - Math.asin(1 - t) / HALF_PI : Math.asin(t) / HALF_PI

const arc: PositionFunction = (t, reverse = false) =>
  reverse ? Math.sqrt(t) : 1 - Math.sqrt(1 - t)

const smoothStep: PositionFunction = (t) => t ** 2 * (3 - 2 * t)

export const easingMap: Record<EasingId, PositionFunction> = {
  linear,
  sinusoidal,
  exponential,
  quadratic,
  cubic,
  quartic,
  asinusoidal,
  arc,
  smoothStep,
}

export const ALL_EASING_IDS = Object.keys(easingMap) as EasingId[]

export const resolveEasing = (id: EasingId): PositionFunction => easingMap[id]
