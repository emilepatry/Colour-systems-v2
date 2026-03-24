export interface SemanticToken {
  hex: string
  oklch: { L: number; C: number; H: number }
  alpha?: number
}

export interface SemanticTokenSet {
  tokens: Record<string, SemanticToken>
  meta: {
    mode: 'light' | 'dark'
    statusSynthesis: Record<string, 'native' | 'synthesized'>
  }
}

export const FOUNDATION_ROLES = [
  'background.canvas',
  'background.surface',
  'background.surface-raised',
  'background.surface-inset',
  'background.accent-subtle',
  'background.inverse',
  'background.scrim',

  'text.primary',
  'text.secondary',
  'text.tertiary',
  'text.disabled',
  'text.inverse',
  'text.link',
  'text.on-accent',

  'border.subtle',
  'border.default',
  'border.strong',

  'focus.ring',
  'focus.outline',

  'accent.primary',
  'accent.primary-hover',
  'accent.primary-active',
  'accent.primary-foreground',

  'status.success',
  'status.success-subtle',
  'status.success-foreground',
  'status.warning',
  'status.warning-subtle',
  'status.warning-foreground',
  'status.error',
  'status.error-subtle',
  'status.error-foreground',
  'status.info',
  'status.info-subtle',
  'status.info-foreground',

  'chart.1',
  'chart.2',
  'chart.3',
  'chart.4',
  'chart.5',
] as const

export type FoundationRole = (typeof FOUNDATION_ROLES)[number]

// ─── Layer 3: Component Tokens ──────────────────────────────────────

export const COMPONENT_ROLES = [
  'button.primary.bg',
  'button.primary.fg',
  'button.primary.hover-bg',
  'button.primary.active-bg',
  'button.primary.disabled-bg',
  'button.primary.disabled-fg',
  'button.primary.focus-ring',

  'button.secondary.bg',
  'button.secondary.fg',
  'button.secondary.border',
  'button.secondary.hover-bg',
  'button.secondary.active-bg',

  'input.bg',
  'input.fg',
  'input.placeholder',
  'input.border',
  'input.hover-border',
  'input.focus-border',
  'input.focus-ring',
  'input.invalid-border',
  'input.invalid-ring',

  'nav.item.fg',
  'nav.item.hover-bg',
  'nav.item.selected-bg',
  'nav.item.selected-fg',
  'nav.item.focus-ring',
] as const

export type ComponentRole = (typeof COMPONENT_ROLES)[number]

export interface ComponentTokenSet {
  tokens: Record<ComponentRole, SemanticToken>
}
