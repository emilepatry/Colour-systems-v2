import { useCallback, useRef, useState, useMemo } from 'react'
import { motion, useSpring, useReducedMotion } from 'motion/react'
import { usePaletteStore, useTemporalStore } from '@/store'
import { hcToPoint, pointToHC, vectorsOnLine, resolveEasing } from '@/engine-a'
import { maxChroma } from '@/colour-math'

const DEG_TO_RAD = Math.PI / 180

function buildConicStops(displayL: number): string {
  const stops: string[] = []
  for (let h = 0; h <= 360; h += 30) {
    stops.push(`oklch(${displayL} 0.15 ${h}) ${h}deg`)
  }
  return `conic-gradient(from 90deg, ${stops.join(', ')})`
}

function buildGamutPath(gamutBoundary: number[]): string {
  if (gamutBoundary.length === 0) return ''
  const maxVal = Math.max(...gamutBoundary)
  if (maxVal <= 0) return ''

  const parts: string[] = []
  for (let h = 0; h < 360; h++) {
    const r = (gamutBoundary[h] / maxVal) * 50
    const rad = h * DEG_TO_RAD
    const x = 50 + r * Math.cos(rad)
    const y = 50 + r * Math.sin(rad)
    parts.push(h === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)
  }
  parts.push('Z')
  return parts.join(' ')
}

export default function ColourWheel() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)

  const activeMode = usePaletteStore((s) => s.activeMode)
  const anchors = usePaletteStore((s) => s.anchors)
  const displayL = usePaletteStore((s) => s.displayL)
  const darkDisplayL = usePaletteStore((s) => s.darkDisplayL)
  const easing = usePaletteStore((s) => s.easing)
  const hueOutputs = usePaletteStore((s) => s.hueOutputs)
  const lightPalette = usePaletteStore((s) => s.palette)
  const darkPalette = usePaletteStore((s) => s.darkPalette)
  const lightGamutBoundary = usePaletteStore((s) => s.gamutBoundary)
  const darkGamutBoundary = usePaletteStore((s) => s.darkGamutBoundary)
  const moveAnchor = usePaletteStore((s) => s.moveAnchor)
  const setActiveAnchorIndex = usePaletteStore((s) => s.setActiveAnchorIndex)
  const temporal = useTemporalStore()

  const effectiveDisplayL = activeMode === 'light' ? displayL : darkDisplayL
  const effectiveGamutBoundary = activeMode === 'light' ? lightGamutBoundary : darkGamutBoundary
  const activePalette = activeMode === 'light' ? lightPalette : darkPalette

  const prefersReducedMotion = useReducedMotion()
  const springConfig = prefersReducedMotion
    ? { stiffness: 1000, damping: 100 }
    : { stiffness: 400, damping: 35 }
  const springX = useSpring(50, springConfig)
  const springY = useSpring(50, springConfig)

  const conicGradient = useMemo(() => buildConicStops(effectiveDisplayL), [effectiveDisplayL])
  const radialGradient = `radial-gradient(closest-side, oklch(${effectiveDisplayL} 0 0), transparent)`
  const gamutPath = useMemo(() => buildGamutPath(effectiveGamutBoundary), [effectiveGamutBoundary])

  const anchorPositions = useMemo(
    () =>
      anchors.map((a) => {
        const [x, y] = hcToPoint(a.H, a.C, displayL)
        const dx = x - 0.5
        const dy = y - 0.5
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = 0.48
        if (dist > maxDist) {
          const scale = maxDist / dist
          return { svgX: (0.5 + dx * scale) * 100, svgY: (0.5 + dy * scale) * 100 }
        }
        return { svgX: x * 100, svgY: y * 100 }
      }),
    [anchors, displayL],
  )

  const arcPoints = useMemo(() => {
    if (anchors.length < 2) return ''
    const fx = resolveEasing(easing.x)
    const fy = resolveEasing(easing.y)
    const wheelPts = anchors.map((a) => hcToPoint(a.H, a.C, displayL))

    const flatXY: Array<[number, number]> = []
    for (let i = 0; i < wheelPts.length - 1; i++) {
      const seg = vectorsOnLine(wheelPts[i], wheelPts[i + 1], 64, i % 2 !== 0, fx, fy)
      const start = i === 0 ? 0 : 1
      for (let j = start; j < seg.length; j++) {
        flatXY.push(seg[j])
      }
    }
    return flatXY.map(([x, y]) => `${x * 100},${y * 100}`).join(' ')
  }, [anchors, easing, displayL])

  const sampleDots = useMemo(
    () =>
      hueOutputs.map(({ H, vibrancy }, i) => {
        const rad = H * DEG_TO_RAD
        return {
          svgX: 50 + vibrancy * 50 * Math.cos(rad),
          svgY: 50 + vibrancy * 50 * Math.sin(rad),
          fill: activePalette?.scales[`hue-${i}`]?.[0]?.hex ?? '#ffffff',
          key: i,
        }
      }),
    [hueOutputs, activePalette],
  )

  const pointerToNorm = useCallback(
    (e: React.PointerEvent) => {
      const svg = svgRef.current
      if (!svg) return null
      const rect = svg.getBoundingClientRect()
      return {
        normX: (e.clientX - rect.left) / rect.width,
        normY: (e.clientY - rect.top) / rect.height,
      }
    },
    [],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, index: number) => {
      e.stopPropagation()
      setDraggingIndex(index)
      setActiveAnchorIndex(index)
      temporal.getState().pause()
      ;(e.target as SVGCircleElement).setPointerCapture(e.pointerId)

      const pos = anchorPositions[index]
      if (pos) {
        springX.jump(pos.svgX)
        springY.jump(pos.svgY)
      }
    },
    [setActiveAnchorIndex, temporal, anchorPositions, springX, springY],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggingIndex === null) return
      const norm = pointerToNorm(e)
      if (!norm) return

      const { H, C } = pointToHC(norm.normX, norm.normY, displayL)
      moveAnchor(draggingIndex, H, C)
      springX.set(norm.normX * 100)
      springY.set(norm.normY * 100)
    },
    [draggingIndex, pointerToNorm, displayL, moveAnchor, springX, springY],
  )

  const handlePointerUp = useCallback(() => {
    if (draggingIndex === null) return
    temporal.getState().resume()
    setActiveAnchorIndex(null)
    setDraggingIndex(null)
  }, [draggingIndex, temporal, setActiveAnchorIndex])

  const handleAnchorKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const anchor = anchors[index]
      const step = e.shiftKey ? 10 : 1
      let H = anchor.H
      let C = anchor.C

      switch (e.key) {
        case 'ArrowLeft':
          H = (H - step + 360) % 360
          break
        case 'ArrowRight':
          H = (H + step) % 360
          break
        case 'ArrowUp':
          C = Math.min(C + 0.005, maxChroma(displayL, H))
          break
        case 'ArrowDown':
          C = Math.max(C - 0.005, 0)
          break
        default:
          return
      }

      e.preventDefault()
      moveAnchor(index, H, C)
    },
    [anchors, displayL, moveAnchor],
  )

  return (
    <div className="relative w-full max-w-[500px] mx-auto" style={{ aspectRatio: '1' }}>
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{ background: `${radialGradient}, ${conicGradient}` }}
      />

      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{ cursor: draggingIndex !== null ? 'grabbing' : undefined }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {gamutPath && (
          <path
            d={gamutPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.5}
            strokeOpacity={0.15}
          />
        )}

        {arcPoints && (
          <polyline
            points={arcPoints}
            fill="none"
            stroke="white"
            strokeWidth={0.5}
            strokeOpacity={0.5}
          />
        )}

        {sampleDots.map((dot) => (
          <circle key={dot.key} cx={dot.svgX} cy={dot.svgY} r={1.5} fill={dot.fill} />
        ))}

        {anchorPositions.map((pos, i) => (
          <g
            key={i}
            tabIndex={0}
            role="slider"
            aria-label={`Anchor ${i + 1}: hue ${Math.round(anchors[i].H)}°, chroma ${anchors[i].C.toFixed(3)}`}
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={Math.round(anchors[i].H)}
            onKeyDown={(e) => handleAnchorKeyDown(e, i)}
            className="group"
          >
            <motion.circle
              cx={draggingIndex === i ? springX : pos.svgX}
              cy={draggingIndex === i ? springY : pos.svgY}
              r={3}
              fill="white"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={0.5}
              style={{ cursor: draggingIndex !== null ? 'grabbing' : 'grab' }}
              onPointerDown={(e) => handlePointerDown(e, i)}
            />
            <circle
              cx={pos.svgX}
              cy={pos.svgY}
              r={5}
              fill="none"
              stroke="oklch(0.55 0.15 265)"
              strokeWidth={1}
              className="opacity-0 group-focus-visible:opacity-100"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
