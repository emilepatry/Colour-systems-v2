// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { handleGlobalKeyDown, type ShortcutActions } from '@/lib/keyboard-handler'

function makeActions(overrides: Partial<ShortcutActions> = {}): ShortcutActions {
  return {
    undo: vi.fn(),
    redo: vi.fn(),
    getState: vi.fn(() => ({
      numHues: 5,
      activeMode: 'light' as const,
      chromaStrategy: 'max_per_hue' as const,
      compliance: 'AA' as const,
    })),
    setNumHues: vi.fn(),
    setActiveMode: vi.fn(),
    setChromaStrategy: vi.fn(),
    setCompliance: vi.fn(),
    openExport: vi.fn(),
    isShortcutsOpen: false,
    toggleShortcuts: vi.fn(),
    closeShortcuts: vi.fn(),
    ...overrides,
  }
}

function fire(key: string, opts: Partial<KeyboardEventInit> = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, bubbles: true, ...opts })
}

beforeEach(() => {
  document.body.innerHTML = ''
  document.body.focus()
})

// ─── Shortcut fires action ────────────────────────────────────────

describe('shortcut actions', () => {
  test('d toggles light → dark', () => {
    const actions = makeActions()
    handleGlobalKeyDown(fire('d'), actions)
    expect(actions.setActiveMode).toHaveBeenCalledWith('dark')
  })

  test('d toggles dark → light', () => {
    const actions = makeActions({
      getState: vi.fn(() => ({
        numHues: 5,
        activeMode: 'dark' as const,
        chromaStrategy: 'max_per_hue' as const,
        compliance: 'AA' as const,
      })),
    })
    handleGlobalKeyDown(fire('d'), actions)
    expect(actions.setActiveMode).toHaveBeenCalledWith('light')
  })

  test('[ decreases numHues', () => {
    const actions = makeActions()
    handleGlobalKeyDown(fire('['), actions)
    expect(actions.setNumHues).toHaveBeenCalledWith(4)
  })

  test('] increases numHues', () => {
    const actions = makeActions()
    handleGlobalKeyDown(fire(']'), actions)
    expect(actions.setNumHues).toHaveBeenCalledWith(6)
  })

  test('c toggles chroma strategy max_per_hue → uniform', () => {
    const actions = makeActions()
    handleGlobalKeyDown(fire('c'), actions)
    expect(actions.setChromaStrategy).toHaveBeenCalledWith('uniform')
  })

  test('c toggles chroma strategy uniform → max_per_hue', () => {
    const actions = makeActions({
      getState: vi.fn(() => ({
        numHues: 5,
        activeMode: 'light' as const,
        chromaStrategy: 'uniform' as const,
        compliance: 'AA' as const,
      })),
    })
    handleGlobalKeyDown(fire('c'), actions)
    expect(actions.setChromaStrategy).toHaveBeenCalledWith('max_per_hue')
  })

  test('a toggles compliance AA → AAA', () => {
    const actions = makeActions()
    handleGlobalKeyDown(fire('a'), actions)
    expect(actions.setCompliance).toHaveBeenCalledWith('AAA')
  })

  test('a toggles compliance AAA → AA', () => {
    const actions = makeActions({
      getState: vi.fn(() => ({
        numHues: 5,
        activeMode: 'light' as const,
        chromaStrategy: 'max_per_hue' as const,
        compliance: 'AAA' as const,
      })),
    })
    handleGlobalKeyDown(fire('a'), actions)
    expect(actions.setCompliance).toHaveBeenCalledWith('AA')
  })

  test('e opens export', () => {
    const actions = makeActions()
    handleGlobalKeyDown(fire('e'), actions)
    expect(actions.openExport).toHaveBeenCalled()
  })

  test('? toggles shortcuts overlay', () => {
    const actions = makeActions()
    handleGlobalKeyDown(fire('?'), actions)
    expect(actions.toggleShortcuts).toHaveBeenCalled()
  })

  test('Escape closes shortcuts overlay when open', () => {
    const actions = makeActions({ isShortcutsOpen: true })
    handleGlobalKeyDown(fire('Escape'), actions)
    expect(actions.closeShortcuts).toHaveBeenCalled()
  })

  test('Escape does nothing when overlay is closed', () => {
    const actions = makeActions({ isShortcutsOpen: false })
    handleGlobalKeyDown(fire('Escape'), actions)
    expect(actions.closeShortcuts).not.toHaveBeenCalled()
    expect(actions.openExport).not.toHaveBeenCalled()
  })
})

// ─── Bounds ───────────────────────────────────────────────────────

describe('bounds clamping', () => {
  test('[ at min (2) does not call setNumHues', () => {
    const actions = makeActions({
      getState: vi.fn(() => ({
        numHues: 2,
        activeMode: 'light' as const,
        chromaStrategy: 'max_per_hue' as const,
        compliance: 'AA' as const,
      })),
    })
    handleGlobalKeyDown(fire('['), actions)
    expect(actions.setNumHues).not.toHaveBeenCalled()
  })

  test('] at max (10) does not call setNumHues', () => {
    const actions = makeActions({
      getState: vi.fn(() => ({
        numHues: 10,
        activeMode: 'light' as const,
        chromaStrategy: 'max_per_hue' as const,
        compliance: 'AA' as const,
      })),
    })
    handleGlobalKeyDown(fire(']'), actions)
    expect(actions.setNumHues).not.toHaveBeenCalled()
  })
})

// ─── Guards ───────────────────────────────────────────────────────

describe('guards block shortcuts on editable elements', () => {
  test.each(['input', 'textarea', 'select'])('blocked when <%s> is focused', (tag) => {
    const el = document.createElement(tag)
    document.body.appendChild(el)
    el.focus()

    const actions = makeActions()
    handleGlobalKeyDown(fire('d'), actions)
    expect(actions.setActiveMode).not.toHaveBeenCalled()
  })

  test('blocked when [contenteditable] element is focused', () => {
    const div = document.createElement('div')
    div.setAttribute('contenteditable', 'true')
    document.body.appendChild(div)
    div.focus()

    const actions = makeActions()
    handleGlobalKeyDown(fire('d'), actions)
    expect(actions.setActiveMode).not.toHaveBeenCalled()
  })

  test('blocked when child of [contenteditable] is focused', () => {
    const outer = document.createElement('div')
    outer.setAttribute('contenteditable', 'true')
    const inner = document.createElement('span')
    inner.tabIndex = -1
    outer.appendChild(inner)
    document.body.appendChild(outer)
    inner.focus()

    const actions = makeActions()
    handleGlobalKeyDown(fire('d'), actions)
    expect(actions.setActiveMode).not.toHaveBeenCalled()
  })
})

// ─── Modifier keys don't trigger unmodified shortcuts ─────────────

describe('modifier keys block unmodified shortcuts', () => {
  test('d with ctrlKey does not toggle mode', () => {
    const actions = makeActions()
    handleGlobalKeyDown(fire('d', { ctrlKey: true }), actions)
    expect(actions.setActiveMode).not.toHaveBeenCalled()
  })

  test('d with metaKey does not toggle mode', () => {
    const actions = makeActions()
    handleGlobalKeyDown(fire('d', { metaKey: true }), actions)
    expect(actions.setActiveMode).not.toHaveBeenCalled()
  })

  test('d with altKey does not toggle mode', () => {
    const actions = makeActions()
    handleGlobalKeyDown(fire('d', { altKey: true }), actions)
    expect(actions.setActiveMode).not.toHaveBeenCalled()
  })
})

// ─── Undo / redo (modified keys) ──────────────────────────────────

describe('undo/redo with modifier keys', () => {
  test('Cmd+Z calls undo', () => {
    const actions = makeActions()
    handleGlobalKeyDown(fire('z', { metaKey: true }), actions)
    expect(actions.undo).toHaveBeenCalled()
    expect(actions.redo).not.toHaveBeenCalled()
  })

  test('Ctrl+Z calls undo', () => {
    const actions = makeActions()
    handleGlobalKeyDown(fire('z', { ctrlKey: true }), actions)
    expect(actions.undo).toHaveBeenCalled()
  })

  test('Cmd+Shift+Z calls redo', () => {
    const actions = makeActions()
    handleGlobalKeyDown(fire('z', { metaKey: true, shiftKey: true }), actions)
    expect(actions.redo).toHaveBeenCalled()
  })

  test('Cmd+Shift+Z (capital Z) calls redo', () => {
    const actions = makeActions()
    handleGlobalKeyDown(fire('Z', { metaKey: true }), actions)
    expect(actions.redo).toHaveBeenCalled()
  })

  test('undo/redo is NOT blocked by editable focus', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    const actions = makeActions()
    handleGlobalKeyDown(fire('z', { metaKey: true }), actions)
    expect(actions.undo).toHaveBeenCalled()
  })
})

// ─── Escape priority ──────────────────────────────────────────────

describe('escape priority', () => {
  test('Escape with overlay open closes overlay, does not trigger other actions', () => {
    const actions = makeActions({ isShortcutsOpen: true })
    handleGlobalKeyDown(fire('Escape'), actions)
    expect(actions.closeShortcuts).toHaveBeenCalled()
    expect(actions.toggleShortcuts).not.toHaveBeenCalled()
  })

  test('Escape with overlay closed does nothing in global handler', () => {
    const actions = makeActions({ isShortcutsOpen: false })
    handleGlobalKeyDown(fire('Escape'), actions)
    expect(actions.closeShortcuts).not.toHaveBeenCalled()
  })
})
