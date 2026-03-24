import { useCallback, useEffect, useRef, useState } from 'react'
import { usePaletteStore, extractSource } from '@/store'
import { useActivePalette } from '@/hooks/useActivePalette'
import { encodeState } from '@/lib/url-state'
import { handleGlobalKeyDown } from '@/lib/keyboard-handler'
import ColourWheel from '@/components/ColourWheel'
import ControlPanel from '@/components/ControlPanel'
import LightnessCurveEditor from '@/components/LightnessCurveEditor'
import ScaleStrip from '@/components/ScaleStrip'
import TokenPreview from '@/components/TokenPreview'
import ExportSheet from '@/components/ExportSheet'
import InfeasibilitySummary from '@/components/InfeasibilitySummary'
import { Button } from '@/components/ui/button'

const MONO_FONT = "'JetBrains Mono', ui-monospace, monospace"

const SHORTCUT_SECTIONS = [
  {
    title: 'Global',
    items: [
      { key: 'D', description: 'Toggle light / dark mode' },
      { key: '[', description: 'Decrease hue count' },
      { key: ']', description: 'Increase hue count' },
      { key: 'C', description: 'Toggle chroma strategy' },
      { key: 'A', description: 'Toggle AA / AAA compliance' },
      { key: 'E', description: 'Open export sheet' },
      { key: '?', description: 'Toggle this reference' },
      { key: 'Esc', description: 'Dismiss overlay' },
    ],
  },
  {
    title: 'History',
    items: [
      { key: '⌘ Z', description: 'Undo' },
      { key: '⌘ ⇧ Z', description: 'Redo' },
    ],
  },
  {
    title: 'Colour wheel anchors (when focused)',
    items: [
      { key: '← →', description: 'Hue ±1° (⇧ ±10°)' },
      { key: '↑ ↓', description: 'Chroma ±0.005' },
    ],
  },
  {
    title: 'Lightness curve points (when focused)',
    items: [
      { key: '↑ ↓', description: 'Lightness ±0.01 (⇧ ±0.05)' },
    ],
  },
]

function ShortcutOverlay({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<Element | null>(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement
    panelRef.current?.focus()
    return () => {
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus()
      }
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Keyboard shortcuts"
        aria-modal="true"
        tabIndex={-1}
        className="relative bg-white rounded-xl shadow-xl max-w-[420px] w-full mx-4 p-6 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md text-[#999] hover:text-[#333] hover:bg-[#f5f5f5] transition-colors"
        >
          <span aria-hidden="true" className="text-sm leading-none">×</span>
        </button>
        <h2
          className="text-[13px] font-semibold mb-4"
          style={{ fontFamily: MONO_FONT, color: '#333' }}
        >
          Keyboard Shortcuts
        </h2>
        <div className="flex flex-col gap-4">
          {SHORTCUT_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3
                className="text-[11px] uppercase tracking-wide mb-2"
                style={{ fontFamily: MONO_FONT, color: '#999' }}
              >
                {section.title}
              </h3>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <div key={item.key} className="flex items-center gap-3">
                    <kbd
                      className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded bg-[#f5f5f5] border border-[#e0e0e0] text-[11px]"
                      style={{ fontFamily: MONO_FONT, color: '#333' }}
                    >
                      {item.key}
                    </kbd>
                    <span
                      className="text-[12px]"
                      style={{ fontFamily: MONO_FONT, color: '#666' }}
                    >
                      {item.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { activeMode, palette } = useActivePalette()
  const [exportOpen, setExportOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const showShortcutsRef = useRef(showShortcuts)
  showShortcutsRef.current = showShortcuts

  const setExportOpenRef = useRef(setExportOpen)
  setExportOpenRef.current = setExportOpen

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

  const handleCloseShortcuts = useCallback(() => setShowShortcuts(false), [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      handleGlobalKeyDown(e, {
        undo: () => usePaletteStore.temporal.getState().undo(),
        redo: () => usePaletteStore.temporal.getState().redo(),
        getState: () => {
          const s = usePaletteStore.getState()
          return {
            numHues: s.numHues,
            activeMode: s.activeMode,
            chromaStrategy: s.chromaStrategy,
            compliance: s.compliance,
          }
        },
        setNumHues: (n) => usePaletteStore.getState().setNumHues(n),
        setActiveMode: (m) => usePaletteStore.getState().setActiveMode(m),
        setChromaStrategy: (s) => usePaletteStore.getState().setChromaStrategy(s),
        setCompliance: (c) => usePaletteStore.getState().setCompliance(c),
        openExport: () => setExportOpenRef.current(true),
        isShortcutsOpen: showShortcutsRef.current,
        toggleShortcuts: () => setShowShortcuts((p) => !p),
        closeShortcuts: () => setShowShortcuts(false),
      })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
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
      {showShortcuts && <ShortcutOverlay onClose={handleCloseShortcuts} />}
    </main>
  )
}
