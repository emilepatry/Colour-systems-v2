import { useState, useCallback } from 'react'
import { useActivePalette } from '@/hooks/useActivePalette'
import { wcagContrastRatio } from '@/colour-math'
import { MONO_FONT } from '@/styles/tokens'
const BADGE_PASS_BG = 'oklch(0.92 0 0)'
const BADGE_PASS_FG = '#666'
const BADGE_FAIL_BG = 'oklch(0.75 0.05 70)'
const BADGE_FAIL_FG = '#6b5c3e'

function formatOklch(L: number, C: number, H: number): string {
  return `L: ${L.toFixed(3)}  C: ${C.toFixed(3)}  H: ${Math.round(H)}`
}

interface SwatchProps {
  hex: string
  oklch: { L: number; C: number; H: number }
  level: number
  adjusted?: boolean
}

function Swatch({ hex, oklch, level, adjusted }: SwatchProps) {
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleClick = useCallback(() => {
    try {
      navigator.clipboard.writeText(hex).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 600)
      })
    } catch {
      // Clipboard API unavailable in insecure contexts
    }
  }, [hex])

  return (
    <button
      type="button"
      aria-label={`Level ${level}, ${hex}`}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col items-center gap-1 group relative"
      style={{ cursor: 'pointer' }}
    >
      <div
        className="w-11 h-[60px] rounded-md transition-shadow duration-150 hover:shadow-md relative overflow-hidden"
        style={{ backgroundColor: hex }}
      >
        {adjusted && (
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{ backgroundColor: 'oklch(0.65 0.15 265)' }}
          />
        )}
      </div>
      <span
        className="text-[11px] leading-none transition-opacity duration-150 select-none"
        style={{
          fontFamily: MONO_FONT,
          color: '#666',
          opacity: copied ? 0.5 : 1,
        }}
      >
        {copied ? 'Copied' : hex}
      </span>
      <span
        className={`absolute top-full mt-1 left-1/2 -translate-x-1/2
          text-[10px] leading-none whitespace-nowrap pointer-events-none
          transition-opacity duration-150
          ${hovered && !copied ? 'opacity-100' : 'opacity-0'}`}
        style={{ fontFamily: MONO_FONT, color: '#999' }}
      >
        {formatOklch(oklch.L, oklch.C, oklch.H)}
      </span>
    </button>
  )
}

interface ContrastBadgeProps {
  ratio: number
  threshold: number
}

function ContrastBadge({ ratio, threshold }: ContrastBadgeProps) {
  const passes = ratio >= threshold
  return (
    <span
      className="text-[10px] leading-none px-1.5 py-0.5 rounded-full whitespace-nowrap"
      style={{
        fontFamily: MONO_FONT,
        backgroundColor: passes ? BADGE_PASS_BG : BADGE_FAIL_BG,
        color: passes ? BADGE_PASS_FG : BADGE_FAIL_FG,
      }}
    >
      {ratio.toFixed(1)}:1
    </span>
  )
}

export default function ScaleStrip({ hueName }: { hueName: string }) {
  const { palette, optimization } = useActivePalette()
  const rawScale = palette?.scales[hueName]
  const scale = optimization?.adjustedScales[hueName] ?? rawScale

  if (!scale || scale.length === 0) return null

  const adjustedLevels = new Set(
    optimization?.adjustments
      .filter(a => a.token.scale === hueName)
      .map(a => a.token.level) ?? []
  )

  const contrastRules = palette?.meta.contrastRules
  const textMinDistance = contrastRules?.textMinDistance ?? 5
  const textMinContrast = contrastRules?.textMinContrast ?? 4.5
  const compliance = palette?.meta.compliance ?? 'AA'

  const badgePairs: Array<[number, number]> = []
  for (let a = 0; a < scale.length; a++) {
    for (let b = a + 1; b < scale.length; b++) {
      if (b - a >= textMinDistance) badgePairs.push([a, b])
    }
  }

  const badges = badgePairs
    .map(([a, b]) => {
      if (!scale[a] || !scale[b]) return null
      const ratio = wcagContrastRatio(scale[a].hex, scale[b].hex)
      return { a, b, ratio }
    })
    .filter(Boolean) as Array<{ a: number; b: number; ratio: number }>

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1">
        {scale.map((entry) => (
          <Swatch key={entry.level} hex={entry.hex} oklch={entry.oklch} level={entry.level} adjusted={adjustedLevels.has(entry.level)} />
        ))}
      </div>

      {badges.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-[11px] text-[#999]" style={{ fontFamily: MONO_FONT }}>
            {compliance} pairs
          </span>
          {badges.map(({ a, b, ratio }) => (
            <span key={`${a}-${b}`} className="flex items-center gap-1">
              <span className="text-[10px] text-[#bbb]" style={{ fontFamily: MONO_FONT }}>
                {a}↔{b}
              </span>
              <ContrastBadge ratio={ratio} threshold={textMinContrast} />
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
