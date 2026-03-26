import { useMemo, useState } from 'react'
import { usePaletteStore } from '@/store'
import { useActivePalette } from '@/hooks/useActivePalette'
import { evaluateReadiness, type ReadinessCheck } from '@/lib/readiness'
import { MONO_FONT } from '@/styles/tokens'

const STATUS_COLOURS: Record<ReadinessCheck['status'], string> = {
  pass: '#22c55e',
  fail: '#ef4444',
  info: '#3b82f6',
}

const STATUS_LABELS: Record<ReadinessCheck['status'], string> = {
  pass: 'Pass',
  fail: 'Fail',
  info: 'Info',
}

export default function ReadinessChecklist() {
  const { lightSemanticTokens, darkSemanticTokens } = useActivePalette()
  const compliance = usePaletteStore((s) => s.compliance)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const checks = useMemo(() => {
    if (!lightSemanticTokens) return []
    return evaluateReadiness(lightSemanticTokens, darkSemanticTokens, compliance)
  }, [lightSemanticTokens, darkSemanticTokens, compliance])

  if (checks.length === 0) return null

  const passCount = checks.filter((c) => c.status === 'pass').length
  const failCount = checks.filter((c) => c.status === 'fail').length

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span
          className="text-[11px]"
          style={{ fontFamily: MONO_FONT, color: '#999' }}
        >
          Quality checks
        </span>
        <span
          className="text-[11px]"
          style={{ fontFamily: MONO_FONT, color: failCount > 0 ? '#ef4444' : '#22c55e' }}
        >
          {passCount}/{checks.filter((c) => c.status !== 'info').length} pass
        </span>
      </div>
      <div
        role="list"
        aria-label="Production readiness checks"
        className="flex items-center gap-2 flex-wrap"
      >
        {checks.map((check) => (
          <div
            key={check.id}
            role="listitem"
            aria-label={`${check.label}: ${STATUS_LABELS[check.status]}${check.detail ? ` — ${check.detail}` : ''}`}
            className="relative"
            onMouseEnter={() => setHoveredId(check.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId(check.id)}
            onBlur={() => setHoveredId(null)}
            tabIndex={0}
          >
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-md cursor-default"
              style={{
                backgroundColor: `${STATUS_COLOURS[check.status]}10`,
                border: `1px solid ${STATUS_COLOURS[check.status]}30`,
              }}
            >
              <div
                className="rounded-full shrink-0"
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: STATUS_COLOURS[check.status],
                }}
              />
              <span
                className="text-[10px] whitespace-nowrap"
                style={{ fontFamily: MONO_FONT, color: '#666' }}
              >
                {check.label}
              </span>
            </div>

            {hoveredId === check.id && check.detail && (
              <div
                role="tooltip"
                className="absolute z-10 bottom-full left-1/2 mb-1.5 px-2.5 py-1.5 rounded-md bg-[#1a1a1a] shadow-lg"
                style={{
                  transform: 'translateX(-50%)',
                  maxWidth: 280,
                  pointerEvents: 'none',
                }}
              >
                <span
                  className="text-[11px] leading-snug block"
                  style={{ fontFamily: MONO_FONT, color: '#e5e5e5' }}
                >
                  {check.detail}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
