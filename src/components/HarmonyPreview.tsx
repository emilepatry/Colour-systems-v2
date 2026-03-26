import { useMemo } from 'react'
import { usePaletteStore } from '@/store'
import { useActivePalette } from '@/hooks/useActivePalette'
import { oklchToHex } from '@/colour-math'

export function computeHueGradient(
  hueOutputs: Array<{ H: number; vibrancy: number }>,
  displayL: number,
): string {
  if (hueOutputs.length === 0) return 'transparent'
  const stops = hueOutputs.map((ho, i) => {
    const hex = oklchToHex(displayL, ho.vibrancy * 0.15, ho.H)
    const pct = hueOutputs.length === 1 ? 50 : (i / (hueOutputs.length - 1)) * 100
    return `${hex} ${pct.toFixed(1)}%`
  })
  return `linear-gradient(to right, ${stops.join(', ')})`
}

export default function HarmonyPreview() {
  const hueOutputs = usePaletteStore((s) => s.hueOutputs)
  const displayL = usePaletteStore((s) => s.displayL)
  const { palette } = useActivePalette()

  const hueGradient = useMemo(
    () => computeHueGradient(hueOutputs, displayL),
    [hueOutputs, displayL],
  )

  const scaleKeys = useMemo(() => {
    if (!palette) return []
    return Object.keys(palette.scales).filter((k) => k !== 'neutral')
  }, [palette])

  if (!palette) {
    return (
      <div
        className="w-full rounded-lg"
        style={{ height: 40, background: '#f5f5f5' }}
        aria-label="Palette harmony preview"
        role="img"
      />
    )
  }

  return (
    <div className="flex flex-col gap-1" role="img" aria-label="Palette harmony preview">
      <div
        className="w-full rounded-md"
        style={{ height: 28, background: hueGradient }}
      />
      <div className="flex gap-0.5" style={{ height: 48 }}>
        {scaleKeys.map((key) => {
          const scale = palette.scales[key]
          if (!scale || scale.length === 0) return null
          const rampGradient = `linear-gradient(to bottom, ${scale.map((s, i) => {
            const pct = (i / (scale.length - 1)) * 100
            return `${s.hex} ${pct.toFixed(1)}%`
          }).join(', ')})`

          return (
            <div
              key={key}
              className="flex-1 first:rounded-l-md last:rounded-r-md"
              style={{ background: rampGradient }}
            />
          )
        })}
      </div>
    </div>
  )
}
