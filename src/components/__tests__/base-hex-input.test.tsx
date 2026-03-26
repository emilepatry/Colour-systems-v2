/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BaseHexInput from '@/components/BaseHexInput'
import { usePaletteStore } from '@/store'

describe('D3.1: BaseHexInput', () => {
  beforeEach(() => {
    usePaletteStore.setState(usePaletteStore.getInitialState())
  })

  afterEach(cleanup)

  test('shows validation hint for invalid input', async () => {
    const user = userEvent.setup()
    render(<BaseHexInput />)

    const input = screen.getByPlaceholderText('Start from a colour')
    await user.type(input, 'zzz')

    expect(screen.queryByText(/Enter a 6-digit hex colour/)).toBeTruthy()
  })

  test('hides validation hint for valid input', async () => {
    const user = userEvent.setup()
    render(<BaseHexInput />)

    const input = screen.getByPlaceholderText('Start from a colour')
    await user.type(input, '#4F46E5')

    expect(screen.queryByText(/Enter a 6-digit hex colour/)).toBeNull()
  })

  test('sets baseHex in store when valid hex is entered', async () => {
    const user = userEvent.setup()
    render(<BaseHexInput />)

    const input = screen.getByPlaceholderText('Start from a colour')
    await user.type(input, '#4F46E5')

    expect(usePaletteStore.getState().baseHex).toBe('#4F46E5')
  })

  test('shows clear button when baseHex is set', async () => {
    const user = userEvent.setup()
    render(<BaseHexInput />)

    const input = screen.getByPlaceholderText('Start from a colour')
    await user.type(input, '#4F46E5')

    expect(screen.getByLabelText('Remove base colour constraint')).toBeTruthy()
  })

  test('clear button removes the base hex constraint', async () => {
    const user = userEvent.setup()
    render(<BaseHexInput />)

    const input = screen.getByPlaceholderText('Start from a colour')
    await user.type(input, '#4F46E5')

    const clearBtn = screen.getByLabelText('Remove base colour constraint')
    await user.click(clearBtn)

    expect(usePaletteStore.getState().baseHex).toBeNull()
  })
})
