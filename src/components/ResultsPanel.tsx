import { useState } from 'react'
import { usePaletteStore, extractSource } from '@/store'
import { useActivePalette } from '@/hooks/useActivePalette'
import { encodeState } from '@/lib/url-state'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { motion } from 'motion/react'
import ScaleStrip from '@/components/ScaleStrip'
import TokenPreview from '@/components/TokenPreview'
import ExportSheet from '@/components/ExportSheet'
import InfeasibilitySummary from '@/components/InfeasibilitySummary'
import ReadinessChecklist from '@/components/ReadinessChecklist'
import HarmonyPreview from '@/components/HarmonyPreview'
import { Button } from '@/components/ui/button'
import { MONO_FONT, HEADING_STYLE, BLURB_STYLE } from '@/styles/tokens'

export default function ResultsPanel() {
  const { palette } = useActivePalette()
  const exportOpen = usePaletteStore((s) => s.exportOpen)
  const setExportOpen = usePaletteStore((s) => s.setExportOpen)
  const [linkCopied, setLinkCopied] = useState(false)
  const [scalesOpen, setScalesOpen] = useState(false)

  const scaleKeys = palette
    ? Object.keys(palette.scales).filter((k) => k !== 'neutral')
    : []

  const handleCopyLink = () => {
    const source = extractSource(usePaletteStore.getState())
    const hash = '#' + encodeState(source)
    window.history.replaceState(null, '', hash)
    try {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 1500)
      })
    } catch {
      // Clipboard API unavailable in insecure contexts
    }
  }

  return (
    <div
      className="flex flex-col gap-4 flex-1 min-w-0 overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 4rem)' }}
    >
      <HarmonyPreview />

      <section className="flex flex-col gap-1">
        <h2 className="text-[11px]" style={HEADING_STYLE}>
          Preview
        </h2>
        <p style={BLURB_STYLE}>
          Every colour here is a semantic token. If this looks right, your
          system works.
        </p>
        <TokenPreview />
      </section>

      <ReadinessChecklist />

      <Collapsible open={scalesOpen} onOpenChange={setScalesOpen}>
        <section className="flex flex-col gap-1">
          <h2 className="text-[11px]" style={HEADING_STYLE}>
            <CollapsibleTrigger
              className="flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0 text-[11px]"
              style={HEADING_STYLE}
            >
              <motion.span
                animate={{ rotate: scalesOpen ? 90 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                aria-hidden="true"
                style={{ display: 'inline-block', fontSize: 10, lineHeight: 1 }}
              >
                ▶
              </motion.span>
              Palette scales
            </CollapsibleTrigger>
          </h2>
          <CollapsibleContent keepMounted className="overflow-hidden transition-[height] duration-300 ease-out h-(--collapsible-panel-height) data-[ending-style]:h-0 data-[starting-style]:h-0">
            <div className="flex flex-col gap-4 pt-2">
              <p style={BLURB_STYLE}>
                Each row is a hue from your system. Swatches show the 10
                lightness steps. Badges show contrast ratios between usable
                pairs.
              </p>
              {scaleKeys.map((key, i) => (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-[11px]" style={HEADING_STYLE}>
                    Hue {i + 1}
                  </span>
                  <ScaleStrip hueName={key} />
                </div>
              ))}
              {palette?.scales.neutral && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px]" style={HEADING_STYLE}>
                    Neutral
                  </span>
                  <ScaleStrip hueName="neutral" />
                </div>
              )}
            </div>
          </CollapsibleContent>
        </section>
      </Collapsible>

      <InfeasibilitySummary />

      <div className="pt-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
          Export Tokens
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          {linkCopied ? 'Copied!' : 'Copy Link'}
        </Button>
      </div>

      <ExportSheet open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}
