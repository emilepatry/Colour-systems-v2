import { describe, test, expect } from 'vitest'
import { evaluateReadiness, type ReadinessCheck } from '@/lib/readiness'
import type { SemanticTokenSet, SemanticToken } from '@/engine-d'

function tok(hex: string, L: number, C: number, H: number, alpha?: number): SemanticToken {
  const t: SemanticToken = { hex, oklch: { L, C, H } }
  if (alpha !== undefined) t.alpha = alpha
  return t
}

function makeTokenSet(
  mode: 'light' | 'dark',
  overrides: Record<string, SemanticToken> = {},
  statusSynthesis: Record<string, 'native' | 'synthesized'> = {},
): SemanticTokenSet {
  const base: Record<string, SemanticToken> = {
    'background.canvas': tok('#ffffff', 0.99, 0, 0),
    'background.surface': tok('#f2f2f2', 0.94, 0, 0),
    'background.surface-raised': tok('#e5e5e5', 0.89, 0, 0),
    'background.surface-inset': tok('#d9d9d9', 0.84, 0, 0),
    'background.accent-subtle': tok('#e8f0fe', 0.94, 0.02, 260),
    'background.inverse': tok('#1a1a1a', 0.18, 0, 0),
    'background.scrim': tok('#000000', 0, 0, 0),

    'text.primary': tok('#111111', 0.17, 0, 0),
    'text.secondary': tok('#555555', 0.42, 0, 0),
    'text.tertiary': tok('#6b6b6b', 0.50, 0, 0),
    'text.disabled': tok('#cccccc', 0.83, 0, 0),
    'text.inverse': tok('#ffffff', 0.99, 0, 0),
    'text.link': tok('#0070f3', 0.55, 0.18, 260),
    'text.on-accent': tok('#ffffff', 0.99, 0, 0),

    'border.subtle': tok('#eeeeee', 0.93, 0, 0),
    'border.default': tok('#dddddd', 0.88, 0, 0),
    'border.strong': tok('#aaaaaa', 0.72, 0, 0),

    'focus.ring': tok('#0070f3', 0.55, 0.18, 260),
    'focus.outline': tok('#0070f3', 0.55, 0.18, 260),

    'accent.primary': tok('#0070f3', 0.55, 0.18, 260),
    'accent.primary-hover': tok('#3388f5', 0.60, 0.16, 260),
    'accent.primary-active': tok('#005cc5', 0.48, 0.19, 260),
    'accent.primary-foreground': tok('#ffffff', 0.99, 0, 0),

    'status.success': tok('#22c55e', 0.72, 0.19, 145),
    'status.success-subtle': tok('#dcfce7', 0.94, 0.04, 145),
    'status.success-foreground': tok('#166534', 0.37, 0.12, 145),
    'status.warning': tok('#eab308', 0.79, 0.18, 85),
    'status.warning-subtle': tok('#fefce8', 0.96, 0.03, 85),
    'status.warning-foreground': tok('#713f12', 0.35, 0.10, 85),
    'status.error': tok('#ef4444', 0.58, 0.24, 25),
    'status.error-subtle': tok('#fef2f2', 0.96, 0.02, 25),
    'status.error-foreground': tok('#7f1d1d', 0.30, 0.14, 25),
    'status.info': tok('#3b82f6', 0.58, 0.19, 255),
    'status.info-subtle': tok('#eff6ff', 0.96, 0.02, 255),
    'status.info-foreground': tok('#1e3a5f', 0.32, 0.10, 255),

    'chart.1': tok('#0070f3', 0.55, 0.18, 260),
    'chart.2': tok('#22c55e', 0.72, 0.19, 145),
    'chart.3': tok('#eab308', 0.79, 0.18, 85),
    'chart.4': tok('#ef4444', 0.58, 0.24, 25),
    'chart.5': tok('#8b5cf6', 0.55, 0.22, 295),
  }

  return {
    tokens: { ...base, ...overrides },
    meta: {
      mode,
      statusSynthesis: {
        success: 'native',
        warning: 'synthesized',
        error: 'synthesized',
        info: 'native',
        ...statusSynthesis,
      },
    },
  }
}

const light = makeTokenSet('light')
const dark = makeTokenSet('dark')

function findCheck(checks: ReadinessCheck[], id: string): ReadinessCheck {
  const c = checks.find((ch) => ch.id === id)
  if (!c) throw new Error(`Check ${id} not found`)
  return c
}

describe('evaluateReadiness', () => {
  test('well-formed palette passes all 6 pass/fail checks', () => {
    const checks = evaluateReadiness(light, dark, 'AA')
    const passFail = checks.filter((c) => c.status !== 'info')
    expect(passFail).toHaveLength(6)
    const failing = passFail.filter((c) => c.status !== 'pass')
    expect(failing).toEqual([])
  })

  test('returns 7 checks total', () => {
    const checks = evaluateReadiness(light, dark, 'AA')
    expect(checks).toHaveLength(7)
  })
})

describe('text contrast check', () => {
  test('fails when text has poor contrast against background', () => {
    const poor = makeTokenSet('light', {
      'text.primary': tok('#cccccc', 0.83, 0, 0),
    })
    const checks = evaluateReadiness(poor, null, 'AA')
    const check = findCheck(checks, 'text-contrast')
    expect(check.status).toBe('fail')
    expect(check.detail).toContain('text.primary')
  })

  test('AAA requires 7:1 ratio', () => {
    const marginal = makeTokenSet('light', {
      'text.primary': tok('#595959', 0.43, 0, 0),
    })
    const aaChecks = evaluateReadiness(marginal, null, 'AA')
    const aaaChecks = evaluateReadiness(marginal, null, 'AAA')
    expect(findCheck(aaChecks, 'text-contrast').status).toBe('pass')
    expect(findCheck(aaaChecks, 'text-contrast').status).toBe('fail')
  })
})

describe('surface hierarchy check', () => {
  test('fails with fewer than 3 distinct surface levels', () => {
    const flat = makeTokenSet('light', {
      'background.canvas': tok('#ffffff', 0.99, 0, 0),
      'background.surface': tok('#ffffff', 0.99, 0, 0),
      'background.surface-raised': tok('#ffffff', 0.99, 0, 0),
      'background.surface-inset': tok('#ffffff', 0.99, 0, 0),
    })
    const checks = evaluateReadiness(flat, null, 'AA')
    expect(findCheck(checks, 'surface-hierarchy').status).toBe('fail')
  })

  test('fails when adjacent surfaces are too close in L', () => {
    const close = makeTokenSet('light', {
      'background.canvas': tok('#ffffff', 0.990, 0, 0),
      'background.surface': tok('#fefefe', 0.985, 0, 0),
      'background.surface-raised': tok('#fdfdfd', 0.980, 0, 0),
      'background.surface-inset': tok('#f0f0f0', 0.930, 0, 0),
    })
    const checks = evaluateReadiness(close, null, 'AA')
    expect(findCheck(checks, 'surface-hierarchy').status).toBe('fail')
  })
})

describe('status distinguishability check', () => {
  test('fails when two status hues are within 30 degrees', () => {
    const similar = makeTokenSet('light', {
      'status.success': tok('#22c55e', 0.72, 0.19, 145),
      'status.info': tok('#22c5aa', 0.72, 0.19, 160),
    })
    const checks = evaluateReadiness(similar, null, 'AA')
    expect(findCheck(checks, 'status-distinguishability').status).toBe('fail')
  })
})

describe('on-colour pairs check', () => {
  test('fails when a foreground token is missing', () => {
    const tokens = makeTokenSet('light')
    delete tokens.tokens['accent.primary-foreground']
    const checks = evaluateReadiness(tokens, null, 'AA')
    expect(findCheck(checks, 'on-colour-pairs').status).toBe('fail')
    expect(findCheck(checks, 'on-colour-pairs').detail).toContain('accent.primary-foreground')
  })
})

describe('dark mode coverage check', () => {
  test('fails when dark tokens are null', () => {
    const checks = evaluateReadiness(light, null, 'AA')
    expect(findCheck(checks, 'dark-mode-coverage').status).toBe('fail')
  })

  test('fails when dark is missing a role', () => {
    const partialDark = makeTokenSet('dark')
    delete partialDark.tokens['focus.ring']
    const checks = evaluateReadiness(light, partialDark, 'AA')
    expect(findCheck(checks, 'dark-mode-coverage').status).toBe('fail')
    expect(findCheck(checks, 'dark-mode-coverage').detail).toContain('focus.ring')
  })

  test('passes when dark covers all light roles', () => {
    const checks = evaluateReadiness(light, dark, 'AA')
    expect(findCheck(checks, 'dark-mode-coverage').status).toBe('pass')
  })
})

describe('focus ring check', () => {
  test('fails when focus ring has low contrast against canvas', () => {
    const low = makeTokenSet('light', {
      'focus.ring': tok('#eeeeee', 0.93, 0, 0),
    })
    const checks = evaluateReadiness(low, null, 'AA')
    expect(findCheck(checks, 'focus-ring').status).toBe('fail')
  })
})

describe('status synthesis check', () => {
  test('reports native and synthesized tokens', () => {
    const checks = evaluateReadiness(light, dark, 'AA')
    const check = findCheck(checks, 'status-synthesis')
    expect(check.status).toBe('info')
    expect(check.detail).toContain('Native')
    expect(check.detail).toContain('Synthesized')
  })

  test('handles all native tokens', () => {
    const allNative = makeTokenSet('light', {}, {
      success: 'native',
      warning: 'native',
      error: 'native',
      info: 'native',
    })
    const checks = evaluateReadiness(allNative, null, 'AA')
    const check = findCheck(checks, 'status-synthesis')
    expect(check.status).toBe('info')
    expect(check.detail).toContain('Native')
    expect(check.detail).not.toContain('Synthesized')
  })
})
