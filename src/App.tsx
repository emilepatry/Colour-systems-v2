import { useEffect, useState } from 'react'
import { usePaletteStore, extractSource } from '@/store'
import { useActivePalette } from '@/hooks/useActivePalette'
import { encodeState } from '@/lib/url-state'
import ColourWheel from '@/components/ColourWheel'
import ControlPanel from '@/components/ControlPanel'
import LightnessCurveEditor from '@/components/LightnessCurveEditor'
import ScaleStrip from '@/components/ScaleStrip'
import TokenPreview from '@/components/TokenPreview'
import ExportSheet from '@/components/ExportSheet'
import InfeasibilitySummary from '@/components/InfeasibilitySummary'
import { Button } from '@/components/ui/button'

const MONO_FONT = "'JetBrains Mono', ui-monospace, monospace"

export default function App() {
  const { activeMode, palette } = useActivePalette()
  const [exportOpen, setExportOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        usePaletteStore.temporal.getState().undo()
      }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'Z') {
        e.preventDefault()
        usePaletteStore.temporal.getState().redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const scaleKeys = palette
    ? Object.keys(palette.scales).filter((k) => k !== 'neutral')
    : []

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="flex flex-col md:flex-row items-start gap-12 w-full max-w-[1200px]">
        <div className="w-full md:w-[450px] shrink-0 flex flex-col gap-8">
          <ColourWheel />
          <ControlPanel />
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
        <div
          className="flex flex-col gap-4 flex-1 min-w-0 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 4rem)' }}
        >
          {scaleKeys.map((key, i) => (
            <div key={key} className="flex flex-col gap-1">
              <span
                className="text-[11px]"
                style={{ fontFamily: MONO_FONT, color: '#999' }}
              >
                Hue {i + 1}
              </span>
              <ScaleStrip hueName={key} />
            </div>
          ))}
          {palette?.scales.neutral && (
            <div className="flex flex-col gap-1">
              <span
                className="text-[11px]"
                style={{ fontFamily: MONO_FONT, color: '#999' }}
              >
                Neutral
              </span>
              <ScaleStrip hueName="neutral" />
            </div>
          )}

          <InfeasibilitySummary />
          <div className="flex flex-col gap-1 pt-4 border-t border-[#eee]">
            <span
              className="text-[11px]"
              style={{ fontFamily: MONO_FONT, color: '#999' }}
            >
              Preview
            </span>
            <TokenPreview />
          </div>

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
      </div>
    </main>
  )
}
