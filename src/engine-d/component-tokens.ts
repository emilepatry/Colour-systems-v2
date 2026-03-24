import { oklchToHex, maxChroma } from '@/colour-math'
import type { SemanticToken, SemanticTokenSet, ComponentRole, ComponentTokenSet } from './types'
import { calculateForeground } from './mapper'

// ─── Helpers ─────────────────────────────────────────────────────────

function require(tokens: SemanticTokenSet['tokens'], role: string): SemanticToken {
  const t = tokens[role]
  if (!t) throw new Error(`Component token derivation failed: missing foundation role "${role}"`)
  return t
}

function alias(tokens: SemanticTokenSet['tokens'], role: string): SemanticToken {
  const t = require(tokens, role)
  return { hex: t.hex, oklch: { ...t.oklch }, ...(t.alpha !== undefined ? { alpha: t.alpha } : {}) }
}

function withAlpha(tokens: SemanticTokenSet['tokens'], role: string, alpha: number): SemanticToken {
  const t = require(tokens, role)
  return { hex: t.hex, oklch: { ...t.oklch }, alpha }
}

// ─── Derivation ──────────────────────────────────────────────────────

export function deriveComponentTokens(semantic: SemanticTokenSet): ComponentTokenSet {
  const t = semantic.tokens

  const accent = require(t, 'accent.primary')
  const inset = require(t, 'background.surface-inset')
  const borderSubtle = require(t, 'border.subtle')

  // Neutral anchors for calculateForeground
  const neutralAnchors = {
    light: require(t, 'background.inverse'),
    dark: require(t, 'text.inverse'),
  }

  // ── Computed: button.primary.disabled-bg ──
  const disabledC = Math.min(accent.oklch.C * 0.5, maxChroma(inset.oklch.L, accent.oklch.H))
  const disabledBgHex = oklchToHex(inset.oklch.L, disabledC, accent.oklch.H)
  const disabledBg: SemanticToken = {
    hex: disabledBgHex,
    oklch: { L: inset.oklch.L, C: disabledC, H: accent.oklch.H },
  }

  // ── Computed: button.secondary.hover-bg ──
  const midL = (inset.oklch.L + borderSubtle.oklch.L) / 2
  const secHoverHex = oklchToHex(midL, 0, 0)
  const secHoverBg: SemanticToken = {
    hex: secHoverHex,
    oklch: { L: midL, C: 0, H: 0 },
  }

  // ── Computed: nav.item.selected-bg ──
  const selectedC = Math.min(accent.oklch.C * 0.6, maxChroma(inset.oklch.L, accent.oklch.H))
  const selectedBgHex = oklchToHex(inset.oklch.L, selectedC, accent.oklch.H)
  const selectedBg: SemanticToken = {
    hex: selectedBgHex,
    oklch: { L: inset.oklch.L, C: selectedC, H: accent.oklch.H },
  }

  // ── Computed: nav.item.selected-fg ──
  const selectedFg = calculateForeground(selectedBgHex, inset.oklch.L, neutralAnchors)

  const tokens: Record<ComponentRole, SemanticToken> = {
    'button.primary.bg': alias(t, 'accent.primary'),
    'button.primary.fg': alias(t, 'accent.primary-foreground'),
    'button.primary.hover-bg': alias(t, 'accent.primary-hover'),
    'button.primary.active-bg': alias(t, 'accent.primary-active'),
    'button.primary.disabled-bg': disabledBg,
    'button.primary.disabled-fg': alias(t, 'text.disabled'),
    'button.primary.focus-ring': alias(t, 'focus.ring'),

    'button.secondary.bg': alias(t, 'background.surface-inset'),
    'button.secondary.fg': alias(t, 'text.primary'),
    'button.secondary.border': alias(t, 'border.default'),
    'button.secondary.hover-bg': secHoverBg,
    'button.secondary.active-bg': alias(t, 'border.subtle'),

    'input.bg': alias(t, 'background.surface'),
    'input.fg': alias(t, 'text.primary'),
    'input.placeholder': alias(t, 'text.tertiary'),
    'input.border': alias(t, 'border.subtle'),
    'input.hover-border': alias(t, 'border.default'),
    'input.focus-border': alias(t, 'accent.primary'),
    'input.focus-ring': alias(t, 'focus.ring'),
    'input.invalid-border': alias(t, 'status.error'),
    'input.invalid-ring': withAlpha(t, 'status.error', 0.5),

    'nav.item.fg': alias(t, 'text.secondary'),
    'nav.item.hover-bg': alias(t, 'background.accent-subtle'),
    'nav.item.selected-bg': selectedBg,
    'nav.item.selected-fg': selectedFg,
    'nav.item.focus-ring': alias(t, 'focus.ring'),
  }

  return { tokens }
}
