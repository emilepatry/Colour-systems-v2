import { useCallback, useEffect, useRef, useState } from 'react'
import { usePaletteStore } from '@/store'
import { handleGlobalKeyDown } from '@/lib/keyboard-handler'
import { AnimatePresence } from 'motion/react'
import ColourWheel from '@/components/ColourWheel'
import ControlPanel from '@/components/ControlPanel'
import GestureHint, { useFirstVisit } from '@/components/GestureHint'
import ResultsPanel from '@/components/ResultsPanel'
import HowItWorks from '@/components/HowItWorks'
import BaseHexInput from '@/components/BaseHexInput'
import PresetSelector from '@/components/PresetSelector'
import { MONO_FONT } from '@/styles/tokens'

type View = 'tool' | 'how-it-works'

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
  const { isFirstVisit, dismiss: dismissFirstVisit } = useFirstVisit()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [view, setView] = useState<View>('tool')

  const showShortcutsRef = useRef(showShortcuts)
  showShortcutsRef.current = showShortcuts

  const viewRef = useRef(view)
  viewRef.current = view

  const handleCloseShortcuts = useCallback(() => setShowShortcuts(false), [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (viewRef.current !== 'tool') {
        if (e.altKey || (e.metaKey || e.ctrlKey)) return
        if (e.key === '?') {
          e.preventDefault()
          setShowShortcuts((p) => !p)
        } else if (e.key === 'Escape' && showShortcutsRef.current) {
          e.preventDefault()
          setShowShortcuts(false)
        }
        return
      }

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
        openExport: () => usePaletteStore.getState().setExportOpen(true),
        isShortcutsOpen: showShortcutsRef.current,
        toggleShortcuts: () => setShowShortcuts((p) => !p),
        closeShortcuts: () => setShowShortcuts(false),
      })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center p-8">
      <nav aria-label="Main" className="w-full max-w-[1200px] mb-12 flex items-baseline gap-6">
        <button
          onClick={() => setView('tool')}
          aria-current={view === 'tool' ? 'page' : undefined}
          className="text-2xl font-semibold tracking-tight bg-transparent border-0 p-0 cursor-pointer"
          style={{ fontFamily: MONO_FONT, color: view === 'tool' ? '#1a1a1a' : '#999' }}
        >
          Colour Systems
        </button>
        <button
          onClick={() => setView('how-it-works')}
          aria-current={view === 'how-it-works' ? 'page' : undefined}
          className="text-[13px] bg-transparent border-0 p-0 cursor-pointer transition-colors"
          style={{ fontFamily: MONO_FONT, color: view === 'how-it-works' ? '#1a1a1a' : '#999' }}
        >
          How it works
        </button>
      </nav>

      {view === 'tool' ? (
        <div className="flex flex-col md:flex-row items-start gap-12 w-full max-w-[1200px]">
          <div className="w-full md:w-[450px] shrink-0 flex flex-col gap-8">
            <BaseHexInput />
            <PresetSelector />
            <div className="relative" onPointerDown={() => { if (isFirstVisit) dismissFirstVisit() }}>
              <ColourWheel />
              <AnimatePresence>
                {isFirstVisit && <GestureHint play={isFirstVisit} />}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {isFirstVisit && (
                <span
                  className="text-[12px]"
                  style={{ fontFamily: MONO_FONT, color: '#999' }}
                >
                  Drag the anchors to explore. Your token system updates in real time.
                </span>
              )}
            </AnimatePresence>
            <ControlPanel />
          </div>
          <ResultsPanel />
        </div>
      ) : (
        <HowItWorks />
      )}

      {showShortcuts && <ShortcutOverlay onClose={handleCloseShortcuts} />}
    </main>
  )
}
