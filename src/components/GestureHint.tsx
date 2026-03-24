import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

const STORAGE_KEY = 'cs-has-interacted'

export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== '1'
    } catch {
      return true
    }
  })

  const dismiss = () => {
    setIsFirstVisit(false)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // storage unavailable
    }
  }

  return { isFirstVisit, dismiss }
}

export default function GestureHint({ play = true }: { play?: boolean }) {
  const prefersReducedMotion = useReducedMotion()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (prefersReducedMotion && play) {
      const timer = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [prefersReducedMotion, play])

  if (!play || !visible) return null

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="absolute pointer-events-none select-none"
      style={{ top: '30%', left: '50%', transform: 'translate(-50%, -50%)' }}
    >
      {prefersReducedMotion ? (
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="rounded-full"
          style={{
            width: 40,
            height: 40,
            background: 'oklch(0.6 0 0 / 0.3)',
          }}
        />
      ) : (
        <motion.div
          animate={{
            y: [0, 0, 28, 0],
            x: [0, 0, 16, 0],
            scale: [1, 0.9, 1],
            background: [
              'oklch(0.6 0 0 / 0.25)',
              'oklch(0.5 0 0 / 0.45)',
              'oklch(0.6 0 0 / 0.25)',
            ],
          }}
          transition={{
            repeat: Infinity,
            repeatDelay: 1.4,
            ease: 'easeInOut',
            duration: 1.2,
          }}
          className="rounded-full"
          style={{ width: 40, height: 40 }}
        />
      )}
    </motion.div>
  )
}
