import { useActivePalette } from '@/hooks/useActivePalette'

const MONO_FONT = "'JetBrains Mono', ui-monospace, monospace"
const SANS_FONT = "system-ui, -apple-system, sans-serif"

export default function TokenPreview() {
  const { palette, optimization } = useActivePalette()

  if (!palette) return null

  const scales = optimization?.adjustedScales ?? palette.scales

  const hueKeys = Object.keys(scales).filter((k) => k !== 'neutral')
  const badgeHues = [
    hueKeys[0] ?? 'hue-0',
    hueKeys[1] ?? hueKeys[0] ?? 'hue-0',
    hueKeys[2] ?? hueKeys[0] ?? 'hue-0',
  ]

  const n = (level: number) => scales['neutral']?.[level]?.hex ?? '#000000'
  const h = (hue: string, level: number) => scales[hue]?.[level]?.hex ?? '#000000'

  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${n(3)}`,
        backgroundColor: n(1),
        padding: 24,
        fontFamily: SANS_FONT,
      }}
    >
      <p
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: n(9),
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        Welcome back
      </p>
      <p
        style={{
          fontSize: 13,
          color: n(6),
          margin: '4px 0 0',
          lineHeight: 1.4,
        }}
      >
        Your colour system is ready to export.
      </p>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 500,
            backgroundColor: h(hueKeys[0] ?? 'hue-0', 5),
            color: n(0),
          }}
        >
          Apply
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
            backgroundColor: n(2),
            color: n(8),
          }}
        >
          Customise
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {(['Info', 'Draft', 'Published'] as const).map((label, i) => (
          <span
            key={label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 9999,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 500,
              backgroundColor: h(badgeHues[i], 2),
              color: h(badgeHues[i], 8),
            }}
          >
            {label}
          </span>
        ))}
      </div>

      <hr
        style={{
          border: 'none',
          borderTop: `1px solid ${n(3)}`,
          margin: '16px 0',
        }}
      />

      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
        <span
          style={{
            fontFamily: MONO_FONT,
            fontSize: 18,
            fontWeight: 600,
            color: n(7),
          }}
        >
          Aa
        </span>
        <p
          style={{
            fontFamily: MONO_FONT,
            fontSize: 14,
            color: n(7),
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          The quick brown fox jumps over the lazy dog. 0123456789 — Design tokens.
        </p>
      </div>
    </div>
  )
}
