import { useState } from 'react'
import { motion } from 'motion/react'
import { usePaletteStore } from '@/store'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ALL_EASING_IDS, type EasingId } from '@/engine-a'
import LightnessCurveEditor from '@/components/LightnessCurveEditor'
import { MONO_FONT, LABEL_STYLE, BLURB_STYLE } from '@/styles/tokens'

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
        <p style={BLURB_STYLE}>
          Switch between light and dark mode. Both are generated simultaneously
          — this toggle changes which one you're viewing and editing.
        </p>
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
        <p style={BLURB_STYLE}>
          How many distinct colours your system contains. 2–3 for a focused
          brand palette. 5–6 for a versatile design system. 8–10 for data
          visualization or playful interfaces.
        </p>
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
      <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
        <CollapsibleTrigger
          className="flex items-center gap-1.5 text-[12px] cursor-pointer bg-transparent border-0 p-0"
          style={{ fontFamily: MONO_FONT, color: '#999' }}
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
        </CollapsibleTrigger>

        <CollapsibleContent keepMounted className="overflow-hidden transition-[height] duration-300 ease-out h-(--collapsible-panel-height) data-[ending-style]:h-0 data-[starting-style]:h-0">
          <div className="flex flex-col gap-5 pb-1 pt-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="lightness-slider" className="text-[13px]" style={LABEL_STYLE}>
                  Display Lightness
                </Label>
                <span className="text-[13px]" style={LABEL_STYLE}>{displayL.toFixed(2)}</span>
              </div>
              <p style={BLURB_STYLE}>
                The lightness level shown on the colour wheel. This controls
                what "slice" of the colour space you see — like adjusting the
                brightness of a lamp illuminating your palette. It affects which
                colours are visible on the wheel but doesn't change your output;
                your scales always span the full lightness range.
              </p>
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
              <p style={BLURB_STYLE}>
                How saturated your colours are overall. At 1.0, every hue is
                pushed to maximum saturation. Lower vibrancy produces calmer,
                more professional palettes. Higher vibrancy produces more
                energetic, expressive ones.
              </p>
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
              <p style={BLURB_STYLE}>
                <strong style={{ color: '#666' }}>Max:</strong> Each hue is as
                vivid as it can be at each lightness level. Some hues are
                naturally more vivid than others, so scales will have unequal
                intensity.
                <br />
                <strong style={{ color: '#666' }}>Uniform:</strong> All hues are
                capped to the least vivid hue's maximum. More even and
                harmonious, but sacrifices peak vibrancy.
              </p>
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
              <p style={BLURB_STYLE}>
                The accessibility standard your system targets.{' '}
                <strong style={{ color: '#666' }}>AA</strong> requires 4.5:1
                contrast for normal text — the legal minimum in most
                jurisdictions.{' '}
                <strong style={{ color: '#666' }}>AAA</strong> requires 7.0:1 —
                a higher bar that benefits users with low vision, older displays,
                or bright sunlight. Higher compliance may limit how much the
                optimizer can preserve your exact colour choices.
              </p>
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

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-[13px]" style={LABEL_STYLE}>
                  Easing
                </Label>
                <p style={BLURB_STYLE}>
                  Control the shape of the interpolation curve between your
                  anchor points on the colour wheel. Both connect the same two
                  points, but the path between them — and therefore which
                  intermediate hues are generated — changes.
                </p>
                <ul className="flex flex-col gap-0.5 pl-3 list-disc" style={BLURB_STYLE}>
                  <li><strong style={{ color: '#666' }}>Linear:</strong> Even spacing. Predictable, uniform.</li>
                  <li><strong style={{ color: '#666' }}>Sinusoidal:</strong> Gentle S-curve. Clusters hues near the anchors.</li>
                  <li><strong style={{ color: '#666' }}>Exponential / Quadratic / Cubic / Quartic:</strong> Increasingly aggressive curves. More hues near the start, fewer near the end.</li>
                  <li><strong style={{ color: '#666' }}>Asinusoidal:</strong> Inverse sinusoidal. Gentle at the extremes, steeper through the middle.</li>
                  <li><strong style={{ color: '#666' }}>Arc:</strong> Circular interpolation. Smooth and natural.</li>
                  <li><strong style={{ color: '#666' }}>SmoothStep:</strong> Flat at both ends, steep in the middle. Hues cluster at the anchors with a quick transition between them.</li>
                </ul>
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
            </div>

            <div className="flex flex-col gap-1">
              <span
                className="text-[11px]"
                style={{ fontFamily: MONO_FONT, color: '#999' }}
              >
                Lightness Curve{activeMode === 'dark' ? ' (Dark)' : ''}
              </span>
              <p style={BLURB_STYLE}>
                The 10 draggable points define how lightness is distributed
                across your scale steps. Drag points to redistribute where the
                "interesting" part of the scale lives. In dark mode, the curve
                inverts — you can override individual dark-mode points without
                affecting the light curve.
              </p>
              <LightnessCurveEditor />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
