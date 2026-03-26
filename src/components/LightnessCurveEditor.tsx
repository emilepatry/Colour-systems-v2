import { useCallback, useRef, useState } from 'react'
import { motion, useSpring, useReducedMotion } from 'motion/react'
import { usePaletteStore, useTemporalStore } from '@/store'
import { clampCurvePoint } from '@/lib/lightness-curve'
import { Button } from '@/components/ui/button'
import { MONO_FONT } from '@/styles/tokens'

const VIEW_W = 240
const VIEW_H = 140
const PAD_L = 30
const PAD_R = 10
const PAD_T = 20
const PAD_B = 25
const PLOT_W = VIEW_W - PAD_L - PAD_R
const PLOT_H = VIEW_H - PAD_T - PAD_B

const GRID_L_VALUES = [0.2, 0.4, 0.6, 0.8]
const L_LABEL_VALUES = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]
const NUM_LEVELS = 10

function levelToX(level: number): number {
  return PAD_L + (level / (NUM_LEVELS - 1)) * PLOT_W
}

function lToY(L: number): number {
  return PAD_T + (1 - L) * PLOT_H
}

function yToL(y: number): number {
  return 1 - (y - PAD_T) / PLOT_H
}

export default function LightnessCurveEditor() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)

  const activeMode = usePaletteStore((s) => s.activeMode)
  const lightnessCurve = usePaletteStore((s) => s.lightnessCurve)
  const darkLightnessCurve = usePaletteStore((s) => s.darkLightnessCurve)
  const darkCurveOverrides = usePaletteStore((s) => s.darkCurveOverrides)
  const updateLightnessCurve = usePaletteStore((s) => s.updateLightnessCurve)
  const setDarkCurveOverride = usePaletteStore((s) => s.setDarkCurveOverride)
  const clearDarkCurveOverrides = usePaletteStore((s) => s.clearDarkCurveOverrides)
  const temporal = useTemporalStore()

  const activeCurve = activeMode === 'light' ? lightnessCurve : darkLightnessCurve
  const isAscending = activeMode === 'dark'

  const prefersReducedMotion = useReducedMotion()
  const springConfig = prefersReducedMotion
    ? { stiffness: 1000, damping: 100 }
    : { stiffness: 400, damping: 35 }
  const springY = useSpring(0, springConfig)

  const points = activeCurve.map((L, i) => ({
    x: levelToX(i),
    y: lToY(L),
  }))

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ')

  const pointerToSvgY = useCallback(
    (e: React.PointerEvent) => {
      const svg = svgRef.current
      if (!svg) return null
      const rect = svg.getBoundingClientRect()
      const scaleY = VIEW_H / rect.height
      return (e.clientY - rect.top) * scaleY
    },
    [],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, index: number) => {
      e.stopPropagation()
      e.preventDefault()
      setDraggingIndex(index)
      temporal.getState().pause()
      ;(e.target as SVGElement).setPointerCapture(e.pointerId)
      springY.jump(points[index].y)
    },
    [temporal, springY, points],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggingIndex === null) return
      const svgY = pointerToSvgY(e)
      if (svgY === null) return

      const rawL = yToL(svgY)
      const clampedL = clampCurvePoint(activeCurve, draggingIndex, rawL, isAscending)

      if (activeMode === 'light') {
        const newCurve = [...activeCurve]
        newCurve[draggingIndex] = clampedL
        updateLightnessCurve(newCurve, true)
      } else {
        setDarkCurveOverride(draggingIndex, clampedL, true)
      }

      springY.set(lToY(clampedL))
    },
    [draggingIndex, pointerToSvgY, activeCurve, isAscending, activeMode, updateLightnessCurve, setDarkCurveOverride, springY],
  )

  const handlePointerUp = useCallback(() => {
    if (draggingIndex === null) return
    temporal.getState().resume()

    if (activeMode === 'light') {
      const source = usePaletteStore.getState()
      updateLightnessCurve([...source.lightnessCurve], false)
    } else {
      const source = usePaletteStore.getState()
      const currentOverrides = source.darkCurveOverrides
      if (draggingIndex in currentOverrides) {
        setDarkCurveOverride(draggingIndex, currentOverrides[draggingIndex], false)
      }
    }

    setDraggingIndex(null)
  }, [draggingIndex, temporal, activeMode, updateLightnessCurve, setDarkCurveOverride])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const step = e.shiftKey ? 0.05 : 0.01
      let newL: number

      switch (e.key) {
        case 'ArrowUp':
          newL = activeCurve[index] + step
          break
        case 'ArrowDown':
          newL = activeCurve[index] - step
          break
        default:
          return
      }

      e.preventDefault()
      const clampedL = clampCurvePoint(activeCurve, index, newL, isAscending)

      if (activeMode === 'light') {
        const newCurve = [...activeCurve]
        newCurve[index] = clampedL
        updateLightnessCurve(newCurve, false)
      } else {
        setDarkCurveOverride(index, clampedL, false)
      }
    },
    [activeCurve, isAscending, activeMode, updateLightnessCurve, setDarkCurveOverride],
  )

  const hasOverrides = activeMode === 'dark' && Object.keys(darkCurveOverrides).length > 0

  return (
    <div className="flex flex-col gap-1">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        style={{ cursor: draggingIndex !== null ? 'grabbing' : undefined }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Grid lines */}
        {GRID_L_VALUES.map((L) => (
          <line
            key={L}
            x1={PAD_L}
            y1={lToY(L)}
            x2={VIEW_W - PAD_R}
            y2={lToY(L)}
            stroke="#e5e5e5"
            strokeWidth={0.5}
            strokeDasharray="3 3"
          />
        ))}

        {/* Y-axis labels */}
        {L_LABEL_VALUES.map((L) => (
          <text
            key={L}
            x={PAD_L - 5}
            y={lToY(L)}
            textAnchor="end"
            dominantBaseline="middle"
            fill="#999"
            style={{ fontFamily: MONO_FONT, fontSize: 9 }}
          >
            {L.toFixed(1)}
          </text>
        ))}

        {/* X-axis labels */}
        {Array.from({ length: NUM_LEVELS }, (_, i) => (
          <text
            key={i}
            x={levelToX(i)}
            y={VIEW_H - 6}
            textAnchor="middle"
            fill="#999"
            style={{ fontFamily: MONO_FONT, fontSize: 9 }}
          >
            {i}
          </text>
        ))}

        {/* Curve line */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="#999"
          strokeWidth={1}
        />

        {/* Draggable points */}
        {points.map((pt, i) => (
          <g
            key={i}
            tabIndex={0}
            role="slider"
            aria-label={`Level ${i}, L ${activeCurve[i].toFixed(2)}`}
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={activeCurve[i]}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="group"
          >
            {/* Invisible hit area for touch targets */}
            <circle
              cx={pt.x}
              cy={draggingIndex === i ? undefined : pt.y}
              r={18}
              fill="transparent"
              style={{ cursor: draggingIndex !== null ? 'grabbing' : 'grab' }}
              onPointerDown={(e) => handlePointerDown(e, i)}
            />
            {draggingIndex === i ? (
              <motion.circle
                cx={pt.x}
                cy={springY}
                r={4}
                fill="white"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={0.5}
              />
            ) : (
              <circle
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill="white"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={0.5}
              />
            )}
            {/* Focus ring */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={7}
              fill="none"
              stroke="oklch(0.55 0.15 265)"
              strokeWidth={1}
              className="opacity-0 group-focus-visible:opacity-100"
            />
          </g>
        ))}
      </svg>

      {hasOverrides && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start text-[11px]"
          style={{ fontFamily: MONO_FONT }}
          onClick={clearDarkCurveOverrides}
        >
          Reset dark curve
        </Button>
      )}
    </div>
  )
}
