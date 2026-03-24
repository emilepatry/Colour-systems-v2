export interface ShortcutActions {
  undo: () => void
  redo: () => void
  getState: () => {
    numHues: number
    activeMode: 'light' | 'dark'
    chromaStrategy: 'max_per_hue' | 'uniform'
    compliance: 'AA' | 'AAA'
  }
  setNumHues: (n: number) => void
  setActiveMode: (mode: 'light' | 'dark') => void
  setChromaStrategy: (s: 'max_per_hue' | 'uniform') => void
  setCompliance: (c: 'AA' | 'AAA') => void
  openExport: () => void
  isShortcutsOpen: boolean
  toggleShortcuts: () => void
  closeShortcuts: () => void
}

function isEditableElement(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (el.closest('[contenteditable]')) return true
  return false
}

export function handleGlobalKeyDown(
  e: KeyboardEvent,
  actions: ShortcutActions,
): void {
  const mod = e.metaKey || e.ctrlKey

  // Modified keys — undo/redo (pre-existing)
  if (mod) {
    if (e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      actions.undo()
    }
    if ((e.key === 'z' && e.shiftKey) || e.key === 'Z') {
      e.preventDefault()
      actions.redo()
    }
    return
  }

  // Unmodified keys — guard against editable elements and stray modifiers
  if (e.altKey) return
  if (isEditableElement()) return

  const state = actions.getState()

  switch (e.key) {
    case 'd':
      actions.setActiveMode(state.activeMode === 'light' ? 'dark' : 'light')
      break
    case '[': {
      if (state.numHues > 2) actions.setNumHues(state.numHues - 1)
      break
    }
    case ']': {
      if (state.numHues < 10) actions.setNumHues(state.numHues + 1)
      break
    }
    case 'c':
      actions.setChromaStrategy(
        state.chromaStrategy === 'max_per_hue' ? 'uniform' : 'max_per_hue',
      )
      break
    case 'a':
      actions.setCompliance(state.compliance === 'AA' ? 'AAA' : 'AA')
      break
    case 'e':
      actions.openExport()
      break
    case 'Escape':
      if (actions.isShortcutsOpen) actions.closeShortcuts()
      break
    case '?':
      actions.toggleShortcuts()
      break
    default:
      return
  }

  e.preventDefault()
}
