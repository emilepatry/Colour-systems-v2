import { usePaletteStore } from '@/store'

export function useActivePalette() {
  const activeMode = usePaletteStore((s) => s.activeMode)
  const lp = usePaletteStore((s) => s.palette)
  const dp = usePaletteStore((s) => s.darkPalette)
  const lo = usePaletteStore((s) => s.optimization)
  const dop = usePaletteStore((s) => s.darkOptimization)
  return {
    activeMode,
    palette: activeMode === 'light' ? lp : dp,
    optimization: activeMode === 'light' ? lo : dop,
  }
}
