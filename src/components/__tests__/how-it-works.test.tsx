/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePaletteStore } from '@/store'
import App from '@/App'
import HowItWorks from '@/components/HowItWorks'

beforeEach(() => {
  usePaletteStore.setState(usePaletteStore.getInitialState())
})

afterEach(() => {
  cleanup()
})

// ─── HowItWorks component ─────────────────────────────────────────

describe('HowItWorks: content and heading hierarchy', () => {
  test('renders exactly one h1', () => {
    render(<HowItWorks />)
    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0].textContent).toBe('How it works')
  })

  test('renders all 6 sections as h2', () => {
    render(<HowItWorks />)
    const h2s = screen.getAllByRole('heading', { level: 2 })
    const texts = h2s.map((h) => h.textContent)

    expect(texts).toContain('What this tool does')
    expect(texts).toContain('The colour wheel')
    expect(texts).toContain('The scale strips')
    expect(texts).toContain('The token preview')
    expect(texts).toContain('The readiness checklist')
    expect(texts).toContain('Exporting')
    expect(h2s).toHaveLength(6)
  })

  test('wraps content in an article element', () => {
    const { container } = render(<HowItWorks />)
    const article = container.querySelector('article')
    expect(article).not.toBeNull()
  })
})

// ─── Navigation ───────────────────────────────────────────────────

describe('App navigation: tool ↔ how-it-works', () => {
  test('"How it works" link is visible in nav', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /how it works/i })).toBeTruthy()
  })

  test('clicking "How it works" renders the education page', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /how it works/i }))

    expect(screen.getByRole('heading', { level: 1, name: /how it works/i })).toBeTruthy()
    expect(screen.queryByLabelText(/colour system preview/i)).toBeNull()
  })

  test('clicking app title returns to tool view', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /how it works/i }))
    expect(screen.getByRole('heading', { level: 1, name: /how it works/i })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /colour systems/i }))
    expect(screen.queryByRole('heading', { level: 1, name: /how it works/i })).toBeNull()
  })

  test('aria-current="page" is set on active nav link', async () => {
    const user = userEvent.setup()
    render(<App />)

    const toolLink = screen.getByRole('button', { name: /colour systems/i })
    const howLink = screen.getByRole('button', { name: /how it works/i })

    expect(toolLink.getAttribute('aria-current')).toBe('page')
    expect(howLink.getAttribute('aria-current')).toBeNull()

    await user.click(howLink)

    expect(toolLink.getAttribute('aria-current')).toBeNull()
    expect(howLink.getAttribute('aria-current')).toBe('page')
  })
})

// ─── State persistence ───────────────────────────────────────────

describe('state persistence across view switches', () => {
  test('store state is preserved after navigating away and back', async () => {
    const user = userEvent.setup()
    render(<App />)

    usePaletteStore.getState().setActiveMode('dark')
    usePaletteStore.getState().setNumHues(7)
    const anchorsBefore = usePaletteStore.getState().anchors

    await user.click(screen.getByRole('button', { name: /how it works/i }))
    await user.click(screen.getByRole('button', { name: /colour systems/i }))

    const state = usePaletteStore.getState()
    expect(state.activeMode).toBe('dark')
    expect(state.numHues).toBe(7)
    expect(state.anchors).toEqual(anchorsBefore)
  })
})

// ─── Keyboard shortcut suppression ───────────────────────────────

describe('keyboard shortcuts on how-it-works view', () => {
  test('D keypress does not toggle mode on education page', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /how it works/i }))

    const modeBefore = usePaletteStore.getState().activeMode
    await user.keyboard('d')
    expect(usePaletteStore.getState().activeMode).toBe(modeBefore)
  })

  test('[ keypress does not change hue count on education page', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /how it works/i }))

    const huesBefore = usePaletteStore.getState().numHues
    await user.keyboard('{BracketLeft}')
    expect(usePaletteStore.getState().numHues).toBe(huesBefore)
  })
})
