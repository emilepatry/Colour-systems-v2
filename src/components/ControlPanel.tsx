import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { usePaletteStore } from '@/store'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ALL_EASING_IDS, type EasingId } from '@/engine-a'
import LightnessCurveEditor from '@/components/LightnessCurveEditor'

const MONO_FONT = "'JetBrains Mono', ui-monospace, monospace"
const LABEL_STYLE = { fontFamily: MONO_FONT, color: '#666' } as const

export default function ControlPanel() {
  const [configOpen, setConfigOpen] = useState(false)

  const activeMode = usePaletteStore((s) => s.activeMode)
  const setActiveMode = usePaletteStore((s) => s.setActiveMode)
  const numHues = usePaletteStore((s) => s.numHues)
  const displayL = usePaletteStore((s) => s.displayL)
  const chromaStrategy = usePaletteStore((s) => s.chromaStrategy)
  const compliance = usePaletteStore((s) => s.compliance)
  const setNumHues = usePaletteStore((s) => s.setNumHues)
  const setDisplayL = usePaletteStore((s) => s.setDisplayL)
  const globalVibrancy = usePaletteStore((s) => s.globalVibrancy)
  const setGlobalVibrancy = usePaletteStore((s) => s.setGlobalVibrancy)
  const setChromaStrategy = usePaletteStore((s) => s.setChromaStrategy)
  const setCompliance = usePaletteStore((s) => s.setCompliance)
  const easing = usePaletteStore((s) => s.easing)
  const setEasing = usePaletteStore((s) => s.setEasing)

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── Primary controls (always visible) ──────────────────── */}
      <div className="flex flex-col gap-2">
        <Label className="text-[13px]" style={LABEL_STYLE}>Mode</Label>
        <ToggleGroup
          value={[activeMode]}
          onValueChange={(v) => {
            const values = Array.isArray(v) ? v : [v]
            if (values.length === 0) return
            setActiveMode(values[0] as 'light' | 'dark')
          }}
          variant="outline"
          size="sm"
          aria-label="Colour mode"
        >
          <ToggleGroupItem value="light" aria-label="Light mode">Light</ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Dark mode">Dark</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="hues-slider" className="text-[13px]" style={LABEL_STYLE}>
            Hues
          </Label>
          <span className="text-[13px]" style={LABEL_STYLE}>{numHues}</span>
        </div>
        <Slider
          id="hues-slider"
          aria-label="Number of hues"
          min={2}
          max={10}
          step={1}
          value={[numHues]}
          onValueCommitted={(v) => {
            const val = Array.isArray(v) ? v[0] : v
            if (typeof val === 'number' && !Number.isNaN(val)) {
              setNumHues(Math.round(val))
            }
          }}
        />
      </div>

      {/* ── Configure disclosure toggle ────────────────────────── */}
      <button
        onClick={() => setConfigOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[12px] cursor-pointer bg-transparent border-0 p-0"
        style={{ fontFamily: MONO_FONT, color: '#999' }}
        aria-expanded={configOpen}
        aria-controls="advanced-controls"
      >
        <motion.span
          animate={{ rotate: configOpen ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          aria-hidden="true"
          style={{ display: 'inline-block', fontSize: 10, lineHeight: 1 }}
        >
          ▶
        </motion.span>
        Configure
      </button>

      {/* ── Advanced controls (collapsible) ────────────────────── */}
      <AnimatePresence initial={false}>
        {configOpen && (
          <motion.div
            id="advanced-controls"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex flex-col gap-5 pb-1">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lightness-slider" className="text-[13px]" style={LABEL_STYLE}>
                    Display Lightness
                  </Label>
                  <span className="text-[13px]" style={LABEL_STYLE}>{displayL.toFixed(2)}</span>
                </div>
                <Slider
                  id="lightness-slider"
                  aria-label="Display lightness"
                  min={0.05}
                  max={0.95}
                  step={0.01}
                  value={[displayL]}
                  onValueChange={(v) => {
                    const val = Array.isArray(v) ? v[0] : v
                    if (typeof val === 'number' && !Number.isNaN(val)) {
                      setDisplayL(val)
                    }
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="vibrancy-slider" className="text-[13px]" style={LABEL_STYLE}>
                    Vibrancy
                  </Label>
                  <span className="text-[13px]" style={LABEL_STYLE}>{globalVibrancy.toFixed(2)}</span>
                </div>
                <Slider
                  id="vibrancy-slider"
                  aria-label="Global vibrancy"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[globalVibrancy]}
                  onValueChange={(v) => {
                    const val = Array.isArray(v) ? v[0] : v
                    if (typeof val === 'number' && !Number.isNaN(val)) {
                      setGlobalVibrancy(val)
                    }
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-[13px]" style={LABEL_STYLE}>
                  Chroma
                </Label>
                <ToggleGroup
                  value={[chromaStrategy]}
                  onValueChange={(v) => {
                    const values = Array.isArray(v) ? v : [v]
                    if (values.length === 0) return
                    setChromaStrategy(values[0] as 'max_per_hue' | 'uniform')
                  }}
                  variant="outline"
                  size="sm"
                  aria-label="Chroma strategy"
                >
                  <ToggleGroupItem value="max_per_hue" aria-label="Maximum chroma per hue">
                    Max
                  </ToggleGroupItem>
                  <ToggleGroupItem value="uniform" aria-label="Uniform chroma across hues">
                    Uniform
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-[13px]" style={LABEL_STYLE}>
                  Compliance
                </Label>
                <ToggleGroup
                  value={[compliance]}
                  onValueChange={(v) => {
                    const values = Array.isArray(v) ? v : [v]
                    if (values.length === 0) return
                    setCompliance(values[0] as 'AA' | 'AAA')
                  }}
                  variant="outline"
                  size="sm"
                  aria-label="WCAG compliance level"
                >
                  <ToggleGroupItem value="AA" aria-label="WCAG AA compliance">
                    AA
                  </ToggleGroupItem>
                  <ToggleGroupItem value="AAA" aria-label="WCAG AAA compliance">
                    AAA
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-[13px]" style={LABEL_STYLE}>
                  Easing X
                </Label>
                <Select
                  value={easing.x}
                  onValueChange={(v) => setEasing('x', v as EasingId)}
                >
                  <SelectTrigger size="sm" aria-label="X-axis easing function">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_EASING_IDS.map((id) => (
                      <SelectItem key={id} value={id}>
                        {id.charAt(0).toUpperCase() + id.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-[13px]" style={LABEL_STYLE}>
                  Easing Y
                </Label>
                <Select
                  value={easing.y}
                  onValueChange={(v) => setEasing('y', v as EasingId)}
                >
                  <SelectTrigger size="sm" aria-label="Y-axis easing function">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_EASING_IDS.map((id) => (
                      <SelectItem key={id} value={id}>
                        {id.charAt(0).toUpperCase() + id.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <span
                  className="text-[11px]"
                  style={{ fontFamily: MONO_FONT, color: '#999' }}
                >
                  Lightness Curve{activeMode === 'dark' ? ' (Dark)' : ''}
                </span>
                <LightnessCurveEditor />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
