import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { hydrateFromSource } from '@/store'
import { decodeState } from '@/lib/url-state'

const shared = decodeState(window.location.hash)
if (shared) {
  hydrateFromSource(shared)
} else if (window.location.hash.length > 1) {
  console.warn('[Colour Systems] Could not parse shared palette from URL — loading defaults.')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
