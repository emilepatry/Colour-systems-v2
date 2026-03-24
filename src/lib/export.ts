import type { PaletteOutput } from '@/colour-math'
import type { SemanticToken, SemanticTokenSet, ComponentTokenSet } from '@/engine-d'

// ─── Helpers ──────────────────────────────────────────────────────────

function formatOklch(t: SemanticToken): string {
  const { L, C, H } = t.oklch
  return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(2)})`
}

// ─── shadcn variable → foundation role mapping ──────────────────────

const SHADCN_MAPPING: [cssVar: string, role: string][] = [
  ['--background', 'background.canvas'],
  ['--foreground', 'text.primary'],
  ['--card', 'background.surface'],
  ['--card-foreground', 'text.primary'],
  ['--popover', 'background.surface-raised'],
  ['--popover-foreground', 'text.primary'],
  ['--primary', 'accent.primary'],
  ['--primary-foreground', 'accent.primary-foreground'],
  ['--secondary', 'background.surface-inset'],
  ['--secondary-foreground', 'text.secondary'],
  ['--muted', 'background.surface-raised'],
  ['--muted-foreground', 'text.tertiary'],
  ['--accent', 'background.accent-subtle'],
  ['--accent-foreground', 'text.primary'],
  ['--destructive', 'status.error'],
  ['--destructive-foreground', 'status.error-foreground'],
  ['--border', 'border.default'],
  ['--input', 'border.subtle'],
  ['--ring', 'focus.ring'],
  ['--chart-1', 'chart.1'],
  ['--chart-2', 'chart.2'],
  ['--chart-3', 'chart.3'],
  ['--chart-4', 'chart.4'],
  ['--chart-5', 'chart.5'],
  ['--sidebar', 'background.surface'],
  ['--sidebar-foreground', 'text.primary'],
  ['--sidebar-primary', 'accent.primary'],
  ['--sidebar-primary-foreground', 'accent.primary-foreground'],
  ['--sidebar-accent', 'background.accent-subtle'],
  ['--sidebar-accent-foreground', 'text.primary'],
  ['--sidebar-border', 'border.subtle'],
  ['--sidebar-ring', 'focus.ring'],
]

// ─── Legacy CSS Export (unchanged) ──────────────────────────────────

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

// ─── shadcn Export ──────────────────────────────────────────────────

export function exportAsShadcn(
  light: SemanticTokenSet,
  dark: SemanticTokenSet,
): string {
  const lines: string[] = []

  function emitBlock(selector: string, tokens: SemanticTokenSet['tokens']) {
    lines.push(`${selector} {`)
    for (const [cssVar, role] of SHADCN_MAPPING) {
      const token = tokens[role]
      if (!token) continue
      const value = token.alpha !== undefined
        ? `oklch(${token.oklch.L.toFixed(4)} ${token.oklch.C.toFixed(4)} ${token.oklch.H.toFixed(2)} / ${token.alpha})`
        : formatOklch(token)
      lines.push(`  ${cssVar}: ${value};`)
    }
    lines.push('}')
  }

  emitBlock(':root', light.tokens)
  lines.push('')
  emitBlock('.dark', dark.tokens)

  lines.push('')
  lines.push('@theme inline {')
  for (const [cssVar] of SHADCN_MAPPING) {
    const twVar = `--color-${cssVar.slice(2)}`
    lines.push(`  ${twVar}: var(${cssVar});`)
  }
  lines.push('}')

  return lines.join('\n')
}

// ─── Tailwind v4 Export ─────────────────────────────────────────────

export function exportAsTailwind(palette: PaletteOutput): string {
  const entries = Object.entries(palette.scales)
  const chromatic = entries.filter(([k]) => k !== 'neutral').sort(([a], [b]) => a.localeCompare(b))
  const neutral = entries.filter(([k]) => k === 'neutral')
  const sorted = [...chromatic, ...neutral]

  const lines: string[] = ['@theme {']

  for (const [name, scale] of sorted) {
    for (const entry of scale) {
      const value = `oklch(${entry.oklch.L.toFixed(4)} ${entry.oklch.C.toFixed(4)} ${entry.oklch.H.toFixed(2)})`
      lines.push(`  --color-${name}-${entry.level}: ${value};`)
    }
  }

  lines.push('}')
  return lines.join('\n')
}

// ─── 3-Layer Token JSON Export ──────────────────────────────────────

function serializeTokenRecord(
  tokens: Record<string, SemanticToken>,
): Record<string, { hex: string; oklch: string }> {
  const out: Record<string, { hex: string; oklch: string }> = {}
  for (const [role, token] of Object.entries(tokens)) {
    out[role] = { hex: token.hex, oklch: formatOklch(token) }
  }
  return out
}

export function exportAsTokenJSON(
  palette: PaletteOutput,
  light: SemanticTokenSet,
  dark: SemanticTokenSet,
  lightComponent?: ComponentTokenSet | null,
  darkComponent?: ComponentTokenSet | null,
): string {
  const entries = Object.entries(palette.scales)
  const chromaticKeys = entries.filter(([k]) => k !== 'neutral').map(([k]) => k)

  const meta = {
    compliance: palette.meta.compliance,
    numHues: chromaticKeys.length,
    numLevels: palette.meta.numLevels,
  }

  const paletteLayer = Object.fromEntries(
    entries.map(([name, scale]) => [
      name,
      scale.map((e) => ({
        level: e.level,
        hex: e.hex,
        oklch: `oklch(${e.oklch.L.toFixed(3)} ${e.oklch.C.toFixed(3)} ${Math.round(e.oklch.H)})`,
      })),
    ]),
  )

  const component = lightComponent && darkComponent
    ? {
        light: serializeTokenRecord(lightComponent.tokens),
        dark: serializeTokenRecord(darkComponent.tokens),
      }
    : {}

  const result = {
    meta,
    palette: paletteLayer,
    semantic: {
      light: serializeTokenRecord(light.tokens),
      dark: serializeTokenRecord(dark.tokens),
    },
    component,
  }

  return JSON.stringify(result, null, 2)
}
