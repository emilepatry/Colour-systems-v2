import { usePaletteStore } from '@/store'

export function useActivePalette() {
  const activeMode = usePaletteStore((s) => s.activeMode)
  const lp = usePaletteStore((s) => s.palette)
  const dp = usePaletteStore((s) => s.darkPalette)
  const lo = usePaletteStore((s) => s.optimization)
  const dop = usePaletteStore((s) => s.darkOptimization)
  const lst = usePaletteStore((s) => s.semanticTokens)
  const dst = usePaletteStore((s) => s.darkSemanticTokens)
  const lct = usePaletteStore((s) => s.componentTokens)
  const dct = usePaletteStore((s) => s.darkComponentTokens)
  return {
    activeMode,
    palette: activeMode === 'light' ? lp : dp,
    optimization: activeMode === 'light' ? lo : dop,
    semanticTokens: activeMode === 'light' ? lst : dst,
    lightSemanticTokens: lst,
    darkSemanticTokens: dst,
    componentTokens: activeMode === 'light' ? lct : dct,
    lightComponentTokens: lct,
    darkComponentTokens: dct,
  }
}
