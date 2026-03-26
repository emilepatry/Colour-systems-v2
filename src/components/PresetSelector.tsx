import { useMemo, useCallback } from 'react'
import { usePaletteStore } from '@/store'
import { PRESETS, type PalettePreset } from '@/lib/presets'
import { oklchToHex, srgbToOklch } from '@/colour-math'
import { MONO_FONT, BLURB_STYLE } from '@/styles/tokens'

function PresetSwatch({ preset, baseH, displayL }: {
  preset: PalettePreset
  baseH: number | null
  displayL: number
}) {
  const swatches = useMemo(() => {
    const config = preset.configure(baseH, displayL)
    return config.anchors.map((a) => oklchToHex(displayL, a.C * 0.8, a.H))
  }, [preset, baseH, displayL])

  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {swatches.map((hex, i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-[2px]"
          style={{ backgroundColor: hex }}
        />
      ))}
    </div>
  )
}

export default function PresetSelector() {
  const displayL = usePaletteStore((s) => s.displayL)
  const baseHex = usePaletteStore((s) => s.baseHex)
  const applyPreset = usePaletteStore((s) => s.applyPreset)

  const baseH = useMemo(() => {
    if (!baseHex) return null
    return srgbToOklch(baseHex).H
  }, [baseHex])

  const handleSelect = useCallback((preset: PalettePreset) => {
    applyPreset(preset)
  }, [applyPreset])

  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-[12px] font-medium"
        style={{ fontFamily: MONO_FONT, color: '#666' }}
      >
        Presets
      </span>
      <div
        className="flex flex-wrap gap-1.5"
        role="radiogroup"
        aria-label="Palette presets"
      >
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelect(preset)}
            role="radio"
            aria-checked={false}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-[#e0e0e0] bg-white hover:bg-[#f8f8f8] hover:border-[#ccc] transition-colors cursor-pointer"
            title={preset.description}
          >
            <PresetSwatch preset={preset} baseH={baseH} displayL={displayL} />
            <span
              className="text-[11px] whitespace-nowrap"
              style={{ fontFamily: MONO_FONT, color: '#555' }}
            >
              {preset.name}
            </span>
          </button>
        ))}
      </div>
      <p style={BLURB_STYLE}>
        Presets are starting points — you can modify everything after applying one.
      </p>
    </div>
  )
}
