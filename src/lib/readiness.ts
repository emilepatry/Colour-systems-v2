import { wcagContrastRatio } from '@/colour-math'
import type { SemanticTokenSet } from '@/engine-d'

export interface ReadinessCheck {
  id: string
  label: string
  status: 'pass' | 'fail' | 'info'
  detail?: string
}

const TEXT_BG_PAIRS: Array<[string, string]> = [
  ['text.primary', 'background.canvas'],
  ['text.primary', 'background.surface'],
  ['text.secondary', 'background.canvas'],
  ['text.secondary', 'background.surface'],
  ['text.tertiary', 'background.canvas'],
  ['text.tertiary', 'background.surface'],
]

function hex(tokens: SemanticTokenSet, role: string): string | null {
  return tokens.tokens[role]?.hex ?? null
}

function oklchL(tokens: SemanticTokenSet, role: string): number | null {
  return tokens.tokens[role]?.oklch.L ?? null
}

function checkTextContrast(
  tokens: SemanticTokenSet,
  compliance: 'AA' | 'AAA',
): ReadinessCheck {
  const threshold = compliance === 'AAA' ? 7.0 : 4.5
  const failures: string[] = []

  for (const [text, bg] of TEXT_BG_PAIRS) {
    const textHex = hex(tokens, text)
    const bgHex = hex(tokens, bg)
    if (!textHex || !bgHex) continue
    const ratio = wcagContrastRatio(textHex, bgHex)
    if (ratio < threshold) {
      failures.push(`${text} vs ${bg} (${ratio.toFixed(1)}:1)`)
    }
  }

  return {
    id: 'text-contrast',
    label: 'Text contrast',
    status: failures.length === 0 ? 'pass' : 'fail',
    detail:
      failures.length === 0
        ? `All text meets ${threshold}:1`
        : `Fails: ${failures.join(', ')}`,
  }
}

function checkSurfaceHierarchy(tokens: SemanticTokenSet): ReadinessCheck {
  const surfaceRoles = [
    'background.canvas',
    'background.surface',
    'background.surface-raised',
    'background.surface-inset',
  ]
  const levels = surfaceRoles
    .map((r) => oklchL(tokens, r))
    .filter((v): v is number => v !== null)

  const unique = [...new Set(levels.map((l) => l.toFixed(4)))]
  if (unique.length < 3) {
    return {
      id: 'surface-hierarchy',
      label: 'Surface hierarchy',
      status: 'fail',
      detail: `Only ${unique.length} distinct surface levels (need >= 3)`,
    }
  }

  const sorted = [...levels].sort((a, b) => a - b)
  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i] - sorted[i - 1]
    if (diff > 0 && diff < 0.04) {
      return {
        id: 'surface-hierarchy',
        label: 'Surface hierarchy',
        status: 'fail',
        detail: `Adjacent surface L difference ${diff.toFixed(3)} < 0.04`,
      }
    }
  }

  return {
    id: 'surface-hierarchy',
    label: 'Surface hierarchy',
    status: 'pass',
    detail: `${unique.length} distinct surface levels`,
  }
}

function angularDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

function checkStatusDistinguishability(tokens: SemanticTokenSet): ReadinessCheck {
  const statusRoles = ['status.success', 'status.warning', 'status.error', 'status.info']
  const hues: Array<{ role: string; H: number }> = []

  for (const role of statusRoles) {
    const t = tokens.tokens[role]
    if (t) hues.push({ role, H: t.oklch.H })
  }

  const failures: string[] = []
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      const dist = angularDistance(hues[i].H, hues[j].H)
      if (dist < 30) {
        failures.push(`${hues[i].role} / ${hues[j].role} (${dist.toFixed(0)}°)`)
      }
    }
  }

  return {
    id: 'status-distinguishability',
    label: 'Status distinguishability',
    status: failures.length === 0 ? 'pass' : 'fail',
    detail:
      failures.length === 0
        ? 'All status hues >= 30° apart'
        : `Too close: ${failures.join(', ')}`,
  }
}

function checkOnColourPairs(tokens: SemanticTokenSet): ReadinessCheck {
  const required = [
    'accent.primary-foreground',
    'status.success-foreground',
    'status.warning-foreground',
    'status.error-foreground',
    'status.info-foreground',
  ]

  const missing = required.filter((r) => !tokens.tokens[r])

  return {
    id: 'on-colour-pairs',
    label: 'On-colour pairs',
    status: missing.length === 0 ? 'pass' : 'fail',
    detail:
      missing.length === 0
        ? 'All foreground pairs defined'
        : `Missing: ${missing.join(', ')}`,
  }
}

function checkDarkModeCoverage(
  light: SemanticTokenSet,
  dark: SemanticTokenSet | null,
): ReadinessCheck {
  if (!dark) {
    return {
      id: 'dark-mode-coverage',
      label: 'Dark mode coverage',
      status: 'fail',
      detail: 'No dark mode tokens',
    }
  }

  const lightKeys = Object.keys(light.tokens)
  const darkKeys = new Set(Object.keys(dark.tokens))
  const missing = lightKeys.filter((k) => !darkKeys.has(k))

  return {
    id: 'dark-mode-coverage',
    label: 'Dark mode coverage',
    status: missing.length === 0 ? 'pass' : 'fail',
    detail:
      missing.length === 0
        ? 'All roles covered in dark mode'
        : `Missing in dark: ${missing.join(', ')}`,
  }
}

function checkFocusRing(tokens: SemanticTokenSet): ReadinessCheck {
  const ringHex = hex(tokens, 'focus.ring')
  const canvasHex = hex(tokens, 'background.canvas')

  if (!ringHex || !canvasHex) {
    return {
      id: 'focus-ring',
      label: 'Focus ring visibility',
      status: 'fail',
      detail: 'Focus ring or canvas token missing',
    }
  }

  const ratio = wcagContrastRatio(ringHex, canvasHex)
  return {
    id: 'focus-ring',
    label: 'Focus ring visibility',
    status: ratio >= 3 ? 'pass' : 'fail',
    detail: `${ratio.toFixed(1)}:1 against canvas (need 3:1)`,
  }
}

function checkStatusSynthesis(tokens: SemanticTokenSet): ReadinessCheck {
  const entries = Object.entries(tokens.meta.statusSynthesis)
  if (entries.length === 0) {
    return {
      id: 'status-synthesis',
      label: 'Status token sources',
      status: 'info',
      detail: 'No status synthesis data',
    }
  }

  const native = entries.filter(([, v]) => v === 'native').map(([k]) => k)
  const synthesized = entries.filter(([, v]) => v === 'synthesized').map(([k]) => k)

  const parts: string[] = []
  if (native.length > 0) parts.push(`Native: ${native.join(', ')}`)
  if (synthesized.length > 0) parts.push(`Synthesized: ${synthesized.join(', ')}`)

  return {
    id: 'status-synthesis',
    label: 'Status token sources',
    status: 'info',
    detail: parts.join('. '),
  }
}

export function evaluateReadiness(
  light: SemanticTokenSet,
  dark: SemanticTokenSet | null,
  compliance: 'AA' | 'AAA',
): ReadinessCheck[] {
  return [
    checkTextContrast(light, compliance),
    checkSurfaceHierarchy(light),
    checkStatusDistinguishability(light),
    checkOnColourPairs(light),
    checkDarkModeCoverage(light, dark),
    checkFocusRing(light),
    checkStatusSynthesis(light),
  ]
}
