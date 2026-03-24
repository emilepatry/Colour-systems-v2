import type { PaletteOutput } from '@/colour-math'

export function exportAsCSS(palette: PaletteOutput, mode?: string): string {
  const entries = Object.entries(palette.scales)
  const chromatic = entries.filter(([k]) => k !== 'neutral').sort(([a], [b]) => a.localeCompare(b))
  const neutral = entries.filter(([k]) => k === 'neutral')
  const sorted = [...chromatic, ...neutral]

  const numHues = chromatic.length
  const lines: string[] = [
    `/* Colour Systems v2 — ${palette.meta.compliance}, ${palette.meta.chromaStrategy}, ${numHues} hues, ${mode ?? 'light'} */`,
    '',
    ':root {',
  ]

  for (const [name, scale] of sorted) {
    const label = name === 'neutral' ? 'Neutral' : `Hue ${name.replace('hue-', '')}`
    lines.push(`  /* ${label} */`)
    for (const entry of scale) {
      lines.push(`  --${name}-${entry.level}: ${entry.hex};`)
    }
    lines.push('')
  }

  lines.push('}')
  return lines.join('\n')
}

export function exportAsJSON(
  palette: PaletteOutput,
  source?: { globalVibrancy?: number; mode?: string },
): string {
  const entries = Object.entries(palette.scales)
  const chromaticKeys = entries.filter(([k]) => k !== 'neutral').map(([k]) => k)

  const meta: Record<string, unknown> = {
    compliance: palette.meta.compliance,
    chromaStrategy: palette.meta.chromaStrategy,
    numHues: chromaticKeys.length,
    numLevels: palette.meta.numLevels,
    lightnessCurve: palette.meta.lightnessCurve,
  }

  if (source?.globalVibrancy !== undefined) {
    meta.globalVibrancy = source.globalVibrancy
  }

  if (source?.mode) {
    meta.mode = source.mode
  }

  const scales = Object.fromEntries(
    entries.map(([name, scale]) => [
      name,
      scale.map((e) => ({
        level: e.level,
        hex: e.hex,
        oklch: `oklch(${e.oklch.L.toFixed(3)} ${e.oklch.C.toFixed(3)} ${Math.round(e.oklch.H)})`,
      })),
    ]),
  )

  return JSON.stringify({ meta, scales }, null, 2)
}
