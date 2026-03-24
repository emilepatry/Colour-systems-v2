import { useMemo } from 'react'
import { useActivePalette } from '@/hooks/useActivePalette'
import type { SemanticTokenSet } from '@/engine-d'

const MONO_FONT = "'JetBrains Mono', ui-monospace, monospace"
const SANS_FONT = "system-ui, -apple-system, sans-serif"

function tokensToCustomProperties(
  tokens: SemanticTokenSet['tokens'],
): React.CSSProperties {
  const props: Record<string, string> = {}
  for (const [role, token] of Object.entries(tokens)) {
    const cssName = `--cs-${role.replace(/\./g, '-')}`
    if (token.alpha !== undefined) {
      props[cssName] = `oklch(${token.oklch.L.toFixed(4)} ${token.oklch.C.toFixed(4)} ${token.oklch.H.toFixed(2)} / ${token.alpha})`
    } else {
      props[cssName] = token.hex
    }
  }
  return props as unknown as React.CSSProperties
}

function v(role: string, fallback = 'transparent'): string {
  return `var(--cs-${role.replace(/\./g, '-')}, ${fallback})`
}

export default function TokenPreview() {
  const { semanticTokens } = useActivePalette()

  const customProperties = useMemo(
    () => (semanticTokens ? tokensToCustomProperties(semanticTokens.tokens) : {}),
    [semanticTokens],
  )

  if (!semanticTokens) return null

  return (
    <div
      role="img"
      aria-label="Colour system preview showing surfaces, text hierarchy, buttons, status badges, and input"
      style={{
        ...customProperties,
        borderRadius: 12,
        border: `1px solid ${v('border-default', '#e0e0e0')}`,
        backgroundColor: v('background-canvas', '#ffffff'),
        padding: 24,
        fontFamily: SANS_FONT,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* ── Surface Stack ─────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div
          style={{
            flex: 1,
            backgroundColor: v('background-surface', '#fafafa'),
            borderRadius: 8,
            padding: 12,
            border: `1px solid ${v('border-subtle', '#eee')}`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontFamily: MONO_FONT,
              color: v('text-tertiary', '#999'),
              marginBottom: 4,
            }}
          >
            surface
          </div>
          <div
            style={{
              backgroundColor: v('background-surface-raised', '#f5f5f5'),
              borderRadius: 6,
              padding: 8,
              border: `1px solid ${v('border-subtle', '#eee')}`,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontFamily: MONO_FONT,
                color: v('text-tertiary', '#999'),
              }}
            >
              raised
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            backgroundColor: v('background-surface-inset', '#f0f0f0'),
            borderRadius: 8,
            padding: 12,
            border: `1px solid ${v('border-subtle', '#eee')}`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontFamily: MONO_FONT,
              color: v('text-tertiary', '#999'),
            }}
          >
            inset
          </div>
        </div>
      </div>

      {/* ── Text Hierarchy ────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: v('text-primary', '#111') }}>
          Primary text
        </div>
        <div style={{ fontSize: 13, color: v('text-secondary', '#555') }}>
          Secondary text
        </div>
        <div style={{ fontSize: 12, color: v('text-tertiary', '#999') }}>
          Tertiary text
        </div>
        <div style={{ fontSize: 12, color: v('text-disabled', '#ccc') }}>
          Disabled text
        </div>
      </div>

      {/* ── Buttons ───────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 500,
            backgroundColor: v('accent-primary', '#0070f3'),
            color: v('accent-primary-foreground', '#fff'),
          }}
        >
          Primary
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 500,
            backgroundColor: v('background-surface-inset', '#f0f0f0'),
            color: v('text-secondary', '#555'),
            border: `1px solid ${v('border-subtle', '#eee')}`,
          }}
        >
          Secondary
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 500,
            color: v('text-primary', '#111'),
          }}
        >
          Ghost
        </span>
      </div>

      {/* ── Status Badges ─────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {([
          ['Success', 'status-success-subtle', 'status-success-foreground'],
          ['Warning', 'status-warning-subtle', 'status-warning-foreground'],
          ['Error', 'status-error-subtle', 'status-error-foreground'],
          ['Info', 'status-info-subtle', 'status-info-foreground'],
        ] as const).map(([label, bg, fg]) => (
          <span
            key={label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 9999,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 500,
              backgroundColor: v(bg),
              color: v(fg, 'inherit'),
            }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* ── Input Field ───────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: v('background-surface', '#fafafa'),
          border: `1px solid ${v('border-subtle', '#eee')}`,
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 13,
          color: v('text-disabled', '#ccc'),
          fontFamily: SANS_FONT,
          boxShadow: `0 0 0 2px ${v('focus-outline', 'transparent')}`,
        }}
      >
        Placeholder text...
      </div>

      {/* ── Divider ───────────────────────────────────────── */}
      <div
        style={{
          height: 1,
          backgroundColor: v('border-default', '#e0e0e0'),
        }}
      />

      {/* ── Type Specimen ─────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
        <span
          style={{
            fontFamily: MONO_FONT,
            fontSize: 18,
            fontWeight: 600,
            color: v('text-secondary', '#555'),
          }}
        >
          Aa
        </span>
        <span
          style={{
            fontFamily: MONO_FONT,
            fontSize: 13,
            color: v('text-secondary', '#555'),
            lineHeight: 1.5,
          }}
        >
          The quick brown fox jumps over the lazy dog.
        </span>
      </div>
    </div>
  )
}
