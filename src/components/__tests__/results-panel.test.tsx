/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePaletteStore } from '@/store'
import ResultsPanel from '@/components/ResultsPanel'

beforeEach(() => {
  usePaletteStore.setState(usePaletteStore.getInitialState())
})

function getTrigger() {
  const triggers = screen.getAllByRole('button', { name: /palette scales/i })
  return triggers[0]
}

describe('D1.2: ResultsPanel', () => {
  test('renders without crashing', () => {
    const { container } = render(<ResultsPanel />)
    expect(container).toBeTruthy()
  })

  test('scales are collapsed by default', () => {
    render(<ResultsPanel />)
    const trigger = getTrigger()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  test('expanding disclosure reveals scale strips', async () => {
    const user = userEvent.setup()
    render(<ResultsPanel />)
    const trigger = getTrigger()

    await user.click(trigger)

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  test('TokenPreview appears before palette scales trigger in DOM order', () => {
    render(<ResultsPanel />)
    const previews = screen.getAllByLabelText(/colour system preview/i)
    const trigger = getTrigger()

    const position = previews[0].compareDocumentPosition(trigger)
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  test('section headings are h2 elements', () => {
    render(<ResultsPanel />)
    const headings = screen.getAllByRole('heading', { level: 2 })
    const headingTexts = headings.map((h) => h.textContent?.trim())

    expect(headingTexts).toContain('Preview')
  })
})
