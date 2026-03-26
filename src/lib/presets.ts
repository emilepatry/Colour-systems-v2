import type { EasingId } from '@/engine-a/easing'
import { maxChroma } from '@/colour-math'

export interface PalettePreset {
  id: string
  name: string
  description: string
  configure: (baseH: number | null, displayL: number) => {
    anchors: Array<{ H: number; C: number }>
    easing: { x: EasingId; y: EasingId }
    numHues: number
    globalVibrancy: number
    compliance?: 'AA' | 'AAA'
  }
}

function hue(base: number | null, offset: number, fallback: number): number {
  return base !== null ? (base + offset + 360) % 360 : fallback
}

function fullC(displayL: number, H: number): number {
  return maxChroma(displayL, H)
}

export const PRESETS: PalettePreset[] = [
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'One hue, many tones. Calm and cohesive.',
    configure: (baseH, displayL) => {
      const h = baseH ?? 265
      return {
        anchors: [
          { H: h, C: fullC(displayL, h) },
          { H: (h + 10) % 360, C: fullC(displayL, (h + 10) % 360) * 0.3 },
        ],
        easing: { x: 'sinusoidal', y: 'sinusoidal' },
        numHues: 2,
        globalVibrancy: 0.6,
      }
    },
  },
  {
    id: 'focused-brand',
    name: 'Focused brand',
    description: 'A vibrant primary with quieter supporting hues.',
    configure: (baseH, displayL) => {
      const primary = baseH ?? 265
      const secondary = (primary + 120) % 360
      return {
        anchors: [
          { H: primary, C: fullC(displayL, primary) },
          { H: secondary, C: fullC(displayL, secondary) * 0.5 },
        ],
        easing: { x: 'sinusoidal', y: 'sinusoidal' },
        numHues: 3,
        globalVibrancy: 0.85,
      }
    },
  },
  {
    id: 'analogous',
    name: 'Analogous',
    description: 'Neighbouring hues that naturally harmonise.',
    configure: (baseH, displayL) => {
      const h1 = baseH ?? 25
      const h2 = (h1 + 40) % 360
      return {
        anchors: [
          { H: h1, C: fullC(displayL, h1) },
          { H: h2, C: fullC(displayL, h2) },
        ],
        easing: { x: 'sinusoidal', y: 'sinusoidal' },
        numHues: 4,
        globalVibrancy: 0.8,
      }
    },
  },
  {
    id: 'complementary',
    name: 'Complementary',
    description: 'Two hues from opposite sides of the wheel.',
    configure: (baseH, displayL) => {
      const h1 = baseH ?? 25
      const h2 = (h1 + 180) % 360
      return {
        anchors: [
          { H: h1, C: fullC(displayL, h1) },
          { H: h2, C: fullC(displayL, h2) },
        ],
        easing: { x: 'sinusoidal', y: 'sinusoidal' },
        numHues: 4,
        globalVibrancy: 0.9,
      }
    },
  },
  {
    id: 'split-complement',
    name: 'Split complement',
    description: 'A primary hue plus two flanking its opposite.',
    configure: (baseH, displayL) => {
      const h1 = baseH ?? 25
      const h2 = (h1 + 150) % 360
      return {
        anchors: [
          { H: h1, C: fullC(displayL, h1) },
          { H: h2, C: fullC(displayL, h2) },
        ],
        easing: { x: 'sinusoidal', y: 'sinusoidal' },
        numHues: 5,
        globalVibrancy: 0.85,
      }
    },
  },
  {
    id: 'triadic',
    name: 'Triadic',
    description: 'Three evenly-spaced hues. Vibrant and balanced.',
    configure: (baseH, displayL) => {
      const h1 = baseH ?? 25
      const h2 = (h1 + 120) % 360
      return {
        anchors: [
          { H: h1, C: fullC(displayL, h1) },
          { H: h2, C: fullC(displayL, h2) },
        ],
        easing: { x: 'sinusoidal', y: 'sinusoidal' },
        numHues: 5,
        globalVibrancy: 0.75,
      }
    },
  },
  {
    id: 'earth-tones',
    name: 'Earth tones',
    description: 'Warm, muted, grounded. Terracotta, olive, sand.',
    configure: (baseH, displayL) => {
      const h1 = baseH ?? 30
      const h2 = hue(baseH, 30, 60)
      return {
        anchors: [
          { H: h1, C: fullC(displayL, h1) * 0.5 },
          { H: h2, C: fullC(displayL, h2) * 0.5 },
        ],
        easing: { x: 'quadratic', y: 'quadratic' },
        numHues: 4,
        globalVibrancy: 0.45,
      }
    },
  },
  {
    id: 'jewel-tones',
    name: 'Jewel tones',
    description: 'Deep, saturated, luxurious. Emerald, sapphire, ruby.',
    configure: (baseH, displayL) => {
      const h1 = baseH ?? 160
      const h2 = hue(baseH, 100, 260)
      return {
        anchors: [
          { H: h1, C: fullC(displayL, h1) },
          { H: h2, C: fullC(displayL, h2) },
        ],
        easing: { x: 'sinusoidal', y: 'sinusoidal' },
        numHues: 5,
        globalVibrancy: 1.0,
      }
    },
  },
  {
    id: 'pastel',
    name: 'Pastel',
    description: 'Soft, light, airy. Low saturation, high lightness.',
    configure: (baseH, displayL) => {
      const h1 = baseH ?? 200
      const h2 = hue(baseH, 90, 290)
      return {
        anchors: [
          { H: h1, C: fullC(displayL, h1) * 0.3 },
          { H: h2, C: fullC(displayL, h2) * 0.3 },
        ],
        easing: { x: 'sinusoidal', y: 'sinusoidal' },
        numHues: 5,
        globalVibrancy: 0.3,
      }
    },
  },
  {
    id: 'high-contrast',
    name: 'High contrast',
    description: 'Maximum accessibility. Designed for AAA compliance.',
    configure: (baseH, displayL) => {
      const h1 = baseH ?? 265
      const h2 = (h1 + 180) % 360
      return {
        anchors: [
          { H: h1, C: fullC(displayL, h1) },
          { H: h2, C: fullC(displayL, h2) },
        ],
        easing: { x: 'sinusoidal', y: 'sinusoidal' },
        numHues: 3,
        globalVibrancy: 0.9,
        compliance: 'AAA',
      }
    },
  },
  {
    id: 'full-spectrum',
    name: 'Full spectrum',
    description: 'All the colours. For data visualization or playful brands.',
    configure: (baseH, displayL) => {
      const h1 = baseH ?? 0
      const h2 = (h1 + 300) % 360
      return {
        anchors: [
          { H: h1, C: fullC(displayL, h1) },
          { H: h2, C: fullC(displayL, h2) },
        ],
        easing: { x: 'linear', y: 'linear' },
        numHues: 9,
        globalVibrancy: 0.7,
      }
    },
  },
  {
    id: 'neutral-accent',
    name: 'Neutral + accent',
    description: 'Almost monochrome with one pop of colour.',
    configure: (baseH, displayL) => {
      const h = baseH ?? 265
      return {
        anchors: [
          { H: h, C: fullC(displayL, h) },
          { H: h, C: fullC(displayL, h) * 0.05 },
        ],
        easing: { x: 'sinusoidal', y: 'sinusoidal' },
        numHues: 3,
        globalVibrancy: 0.7,
      }
    },
  },
]
