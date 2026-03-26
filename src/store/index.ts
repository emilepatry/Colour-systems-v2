import { create } from 'zustand'
import { temporal } from 'zundo'
import type { EasingId } from '@/engine-a/easing'
import { interpolateAnchors } from '@/engine-a'
import type { HueOutput } from '@/engine-a'
import {
  maxChroma,
  oklchToHex,
  relativeLuminance,
  assemblePalette,
  isValidHex6,
  srgbToOklch,
  type ScaleEntry,
  type PaletteOutput,
} from '@/colour-math'
import { runEngineC, type OptimizationResult } from '@/engine-c'
import { mapSemanticTokens, deriveComponentTokens, type SemanticTokenSet, type ComponentTokenSet } from '@/engine-d'
import { resolveDarkCurve } from '@/lib/dark-curve'
import type { PalettePreset } from '@/lib/presets'

// ─── Source State (undo boundary) ────────────────────────────────────

export interface SourceState {
  anchors: Array<{ H: number; C: number }>
  easing: { x: EasingId; y: EasingId }
  numHues: number
  lightnessCurve: number[]
  displayL: number
  chromaStrategy: 'max_per_hue' | 'uniform'
  compliance: 'AA' | 'AAA'
  neutralHue: number | null
  globalVibrancy: number
  activeMode: 'light' | 'dark'
  darkCurveOverrides: Record<number, number>
  baseHex: string | null
}

// ─── Derived State ───────────────────────────────────────────────────

interface DerivedState {
  hueOutputs: HueOutput[]
  palette: PaletteOutput | null
  optimization: OptimizationResult | null
  semanticTokens: SemanticTokenSet | null
  componentTokens: ComponentTokenSet | null
  gamutBoundary: number[]
  activeAnchorIndex: number | null
  darkLightnessCurve: number[]
  darkDisplayL: number
  darkPalette: PaletteOutput | null
  darkOptimization: OptimizationResult | null
  darkSemanticTokens: SemanticTokenSet | null
  darkComponentTokens: ComponentTokenSet | null
  darkGamutBoundary: number[]
}

// ─── Full Store ──────────────────────────────────────────────────────

// ─── UI State (not undoable) ──────────────────────────────────────────

interface UIState {
  exportOpen: boolean
}

interface PaletteStore extends SourceState, DerivedState, UIState {
  moveAnchor: (index: number, H: number, C: number) => void
  addAnchor: (H: number, C: number) => void
  removeAnchor: (index: number) => void
  setEasing: (axis: 'x' | 'y', id: EasingId) => void
  setNumHues: (n: number) => void
  updateLightnessCurve: (curve: number[], skipCrossValidation?: boolean) => void
  setDisplayL: (l: number) => void
  setChromaStrategy: (s: 'max_per_hue' | 'uniform') => void
  setCompliance: (c: 'AA' | 'AAA') => void
  setGlobalVibrancy: (v: number) => void
  setActiveAnchorIndex: (index: number | null) => void
  setActiveMode: (mode: 'light' | 'dark') => void
  setDarkCurveOverride: (level: number, L: number, skipCrossValidation?: boolean) => void
  clearDarkCurveOverrides: () => void
  setExportOpen: (open: boolean) => void
  setBaseHex: (hex: string | null) => void
  isAnchorLocked: (index: number) => boolean
  applyPreset: (preset: PalettePreset) => void
}

// ─── Derivation Pipeline ─────────────────────────────────────────────

function deriveScales(
  hueOutputs: HueOutput[],
  lightnessCurve: number[],
  chromaStrategy: 'max_per_hue' | 'uniform',
  compliance: 'AA' | 'AAA',
  neutralHue: number | null,
  globalVibrancy: number,
  skipCrossValidation = false,
): PaletteOutput {
  const numLevels = lightnessCurve.length

  const maxChromas: number[][] = hueOutputs.map(({ H }) =>
    lightnessCurve.map((L) => maxChroma(L, H)),
  )

  let chosenChromas: number[][]
  if (chromaStrategy === 'max_per_hue') {
    chosenChromas = hueOutputs.map(({ vibrancy }, hi) =>
      maxChromas[hi].map((cMax) => globalVibrancy * vibrancy * cMax),
    )
  } else {
    chosenChromas = hueOutputs.map(() => new Array<number>(numLevels))
    for (let level = 0; level < numLevels; level++) {
      const minC = Math.min(
        ...hueOutputs.map(({ vibrancy }, hi) => globalVibrancy * vibrancy * maxChromas[hi][level]),
      )
      for (let hi = 0; hi < hueOutputs.length; hi++) {
        chosenChromas[hi][level] = minC
      }
    }
  }

  const hueScales: Record<string, ScaleEntry[]> = {}
  for (let hi = 0; hi < hueOutputs.length; hi++) {
    const { H } = hueOutputs[hi]
    hueScales[`hue-${hi}`] = lightnessCurve.map((L, level) => {
      const C = chosenChromas[hi][level]
      const hex = oklchToHex(L, C, H)
      return {
        level,
        hex,
        oklch: { L, C, H },
        relativeLuminance: relativeLuminance(hex),
      }
    })
  }

  return assemblePalette(hueScales, compliance, numLevels, lightnessCurve, chromaStrategy, neutralHue, skipCrossValidation)
}

function safeRunEngineC(
  palette: PaletteOutput,
  mode: 'light' | 'dark' = 'light',
): OptimizationResult | null {
  try { return runEngineC(palette, mode) } catch { return null }
}

function safeMapSemanticTokens(
  result: OptimizationResult,
  mode: 'light' | 'dark',
  globalVibrancy: number,
  compliance: 'AA' | 'AAA',
): SemanticTokenSet | null {
  try { return mapSemanticTokens(result, mode, globalVibrancy, compliance) } catch { return null }
}

function safeDeriveComponentTokens(
  semantic: SemanticTokenSet,
): ComponentTokenSet | null {
  try { return deriveComponentTokens(semantic) } catch { return null }
}

function computeDerived(
  source: SourceState,
  skipCrossValidation = false,
): Omit<DerivedState, 'activeAnchorIndex'> {
  const hueOutputs = interpolateAnchors(
    source.anchors,
    source.easing,
    source.numHues,
    source.displayL,
  )

  // --- Light mode ---
  const palette = hueOutputs.length > 0
    ? deriveScales(
        hueOutputs,
        source.lightnessCurve,
        source.chromaStrategy,
        source.compliance,
        source.neutralHue,
        source.globalVibrancy,
        skipCrossValidation,
      )
    : null

  const optimization = palette && !skipCrossValidation
    ? safeRunEngineC(palette, 'light')
    : null

  const semanticTokens = optimization
    ? safeMapSemanticTokens(optimization, 'light', source.globalVibrancy, source.compliance)
    : null

  const componentTokens = semanticTokens
    ? safeDeriveComponentTokens(semanticTokens)
    : null

  const gamutBoundary = Array.from(
    { length: 360 },
    (_, h) => maxChroma(source.displayL, h),
  )

  // --- Dark mode ---
  const darkLightnessCurve = resolveDarkCurve(
    source.lightnessCurve,
    source.darkCurveOverrides,
  )

  const darkPalette = hueOutputs.length > 0
    ? deriveScales(
        hueOutputs,
        darkLightnessCurve,
        source.chromaStrategy,
        source.compliance,
        source.neutralHue,
        source.globalVibrancy,
        skipCrossValidation,
      )
    : null

  const darkOptimization = darkPalette && !skipCrossValidation
    ? safeRunEngineC(darkPalette, 'dark')
    : null

  const darkSemanticTokens = darkOptimization
    ? safeMapSemanticTokens(darkOptimization, 'dark', source.globalVibrancy, source.compliance)
    : null

  const darkComponentTokens = darkSemanticTokens
    ? safeDeriveComponentTokens(darkSemanticTokens)
    : null

  const darkDisplayL =
    darkLightnessCurve[Math.floor(darkLightnessCurve.length / 2)] ?? 0.60

  const darkGamutBoundary = Array.from(
    { length: 360 },
    (_, h) => maxChroma(darkDisplayL, h),
  )

  return {
    hueOutputs, palette, optimization, semanticTokens, componentTokens, gamutBoundary,
    darkLightnessCurve, darkDisplayL, darkPalette, darkOptimization, darkSemanticTokens, darkComponentTokens, darkGamutBoundary,
  }
}

// ─── Default Values ──────────────────────────────────────────────────

const defaultSource: SourceState = {
  anchors: [
    { H: 25, C: 0.15 },
    { H: 265, C: 0.15 },
  ],
  easing: { x: 'sinusoidal', y: 'sinusoidal' },
  numHues: 5,
  lightnessCurve: [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17],
  displayL: 0.56,
  chromaStrategy: 'max_per_hue',
  compliance: 'AA',
  neutralHue: null,
  globalVibrancy: 1.0,
  activeMode: 'light',
  darkCurveOverrides: {},
  baseHex: null,
}

const initialDerived = computeDerived(defaultSource)

// ─── Store ───────────────────────────────────────────────────────────

function applyAndDerive(
  set: (partial: Partial<PaletteStore>) => void,
  get: () => PaletteStore,
  sourceUpdate: Partial<SourceState>,
  skipCrossValidation = false,
) {
  const next = { ...extractSource(get()), ...sourceUpdate }
  set({ ...sourceUpdate, ...computeDerived(next, skipCrossValidation) })
}

export function extractSource(state: PaletteStore): SourceState {
  return {
    anchors: state.anchors,
    easing: state.easing,
    numHues: state.numHues,
    lightnessCurve: state.lightnessCurve,
    displayL: state.displayL,
    chromaStrategy: state.chromaStrategy,
    compliance: state.compliance,
    neutralHue: state.neutralHue,
    globalVibrancy: state.globalVibrancy,
    activeMode: state.activeMode,
    darkCurveOverrides: state.darkCurveOverrides,
    baseHex: state.baseHex,
  }
}

export function hydrateFromSource(source: SourceState) {
  usePaletteStore.setState({
    ...source,
    ...computeDerived(source),
    activeAnchorIndex: null,
  })
  usePaletteStore.temporal.getState().clear()
}

export const usePaletteStore = create<PaletteStore>()(
  temporal(
    (set, get) => ({
      // Source state defaults
      ...defaultSource,

      // Derived state (computed at init)
      ...initialDerived,
      activeAnchorIndex: null,

      // UI state (not undoable)
      exportOpen: false,

      // Actions
      moveAnchor: (index, H, C) => {
        const anchors = [...get().anchors]
        if (index < 0 || index >= anchors.length) return
        anchors[index] = { H, C }
        const isDragging = get().activeAnchorIndex !== null
        applyAndDerive(set, get, { anchors }, isDragging)
      },

      addAnchor: (H, C) => {
        const anchors = [...get().anchors, { H, C }]
        applyAndDerive(set, get, { anchors })
      },

      removeAnchor: (index) => {
        if (get().baseHex !== null && index === 0) return
        const anchors = get().anchors.filter((_, i) => i !== index)
        if (anchors.length < 2) return
        applyAndDerive(set, get, { anchors })
      },

      setEasing: (axis, id) => {
        const easing = { ...get().easing, [axis]: id }
        applyAndDerive(set, get, { easing })
      },

      setNumHues: (n) => {
        applyAndDerive(set, get, { numHues: n })
      },

      updateLightnessCurve: (curve, skipCrossValidation = false) => {
        applyAndDerive(set, get, { lightnessCurve: curve }, skipCrossValidation)
      },

      setDisplayL: (l) => {
        applyAndDerive(set, get, { displayL: l })
      },

      setChromaStrategy: (s) => {
        applyAndDerive(set, get, { chromaStrategy: s })
      },

      setCompliance: (c) => {
        applyAndDerive(set, get, { compliance: c })
      },

      setGlobalVibrancy: (v) => {
        applyAndDerive(set, get, { globalVibrancy: v })
      },

      setActiveAnchorIndex: (index) => {
        if (index === null) {
          const source = extractSource(get())
          set({ activeAnchorIndex: null, ...computeDerived(source, false) })
        } else {
          set({ activeAnchorIndex: index })
        }
      },

      setActiveMode: (mode) => {
        set({ activeMode: mode })
      },

      setDarkCurveOverride: (level, L, skipCrossValidation = false) => {
        const overrides = { ...get().darkCurveOverrides, [level]: L }
        applyAndDerive(set, get, { darkCurveOverrides: overrides }, skipCrossValidation)
      },

      clearDarkCurveOverrides: () => {
        applyAndDerive(set, get, { darkCurveOverrides: {} })
      },

      setExportOpen: (open) => {
        set({ exportOpen: open })
      },

      setBaseHex: (hex) => {
        if (hex === null) {
          applyAndDerive(set, get, { baseHex: null })
          return
        }
        if (!isValidHex6(hex)) return
        const normalized = hex.startsWith('#') ? hex : `#${hex}`
        const { H, C } = srgbToOklch(normalized)
        const anchors = [...get().anchors]
        anchors[0] = { H, C }
        applyAndDerive(set, get, { baseHex: normalized.toUpperCase(), anchors })
      },

      isAnchorLocked: (index) => {
        return get().baseHex !== null && index === 0
      },

      applyPreset: (preset) => {
        const state = get()
        const baseHex = state.baseHex
        const baseH = baseHex ? srgbToOklch(baseHex).H : null
        const config = preset.configure(baseH, state.displayL)

        let anchors = config.anchors
        if (baseHex) {
          const { H, C } = srgbToOklch(baseHex)
          anchors = [{ H, C }, ...anchors.slice(1)]
        }

        const update: Partial<SourceState> = {
          anchors,
          easing: config.easing,
          numHues: config.numHues,
          globalVibrancy: config.globalVibrancy,
        }
        if (config.compliance) {
          update.compliance = config.compliance
        }
        applyAndDerive(set, get, update)
      },
    }),
    {
      partialize: (state) => extractSource(state as PaletteStore),
      limit: 50,
    },
  ),
)

export const useTemporalStore = () => usePaletteStore.temporal
