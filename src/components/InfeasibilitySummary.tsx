import { useState } from 'react'
import { useActivePalette } from '@/hooks/useActivePalette'
import type { InfeasibilityReport } from '@/engine-c'
import { MONO_FONT, BLURB_STYLE } from '@/styles/tokens'

const BLOCKER_TEXT: Record<InfeasibilityReport['blocker'], string> = {
  anchor_freeze: 'both frozen',
  band_boundary: 'band limit reached',
  drift_exhausted: 'drift budget used',
}

export default function InfeasibilitySummary() {
  const { optimization } = useActivePalette()
  const [expanded, setExpanded] = useState(false)

  if (!optimization) return null

  const { infeasible, adjustments } = optimization
  const adjustmentCount = adjustments.length
  const infeasibleCount = infeasible.length

  if (infeasibleCount === 0) {
    const label = adjustmentCount === 0
      ? '\u2713 All constraints met'
      : `\u2713 ${adjustmentCount} token${adjustmentCount === 1 ? '' : 's'} adjusted`

    return (
      <div className="py-2 flex flex-col gap-1">
        <span
          className="text-[11px]"
          style={{ fontFamily: MONO_FONT, color: '#999' }}
        >
          {label}
        </span>
        {adjustmentCount > 0 && (
          <p style={BLURB_STYLE}>
            The optimizer adjusted {adjustmentCount} token
            {adjustmentCount === 1 ? '' : 's'} to meet your compliance target.
            This is normal — it means your chosen hues needed slight lightness
            shifts to guarantee accessible contrast.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="py-2">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls="infeasibility-details"
        className="text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-1"
        style={{
          fontFamily: MONO_FONT,
          color: '#6b5020',
          backgroundColor: 'oklch(0.93 0.02 70)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span>\u26A0 {infeasibleCount} constraint{infeasibleCount === 1 ? '' : 's'} could not be met</span>
        <span aria-hidden="true">{expanded ? '\u25BE' : '\u25B8'}</span>
      </button>

      {expanded && (
        <div
          id="infeasibility-details"
          className="flex flex-col gap-3 mt-2 pl-2"
        >
          {infeasible.map((report, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <span
                className="text-[11px]"
                style={{ fontFamily: MONO_FONT, color: '#6b5020' }}
              >
                {report.darker.scale} level {report.darker.level} \u2194 {report.lighter.scale} level {report.lighter.level}
              </span>
              <span
                className="text-[11px]"
                style={{ fontFamily: MONO_FONT, color: '#6b5020' }}
              >
                Achieved {report.achieved.toFixed(1)}:1 (need {report.threshold}:1) \u00B7 {BLOCKER_TEXT[report.blocker]}
              </span>
              <span
                className="text-[11px]"
                style={{ fontFamily: MONO_FONT, color: '#999' }}
              >
                \u2192 {report.suggestion}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
