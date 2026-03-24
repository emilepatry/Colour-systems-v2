# Colour Math Engine — Test Specification

> **Purpose:** Define every test case the custom OKLCH TypeScript engine must satisfy before any downstream feature is built on top of it. This document is the contract — the engine is not considered complete until every case here passes.

> **Framework:** Vitest (ships with Vite) + fast-check (property-based testing). Both are dev dependencies only.

> **Source truth:** All formulas, matrix constants, and reference values are drawn from [docs/01–05](../docs/00-index.md). Where external references are cited (IEC 61966-2-1, Björn Ottosson, WCAG 2.x), the doc versions are canonical for this project.

---

## Pipeline Under Test

```
sRGB hex
  → sRGB decode (gamma linearisation)
    → Linear RGB → LMS (3×3 matrix)
      → cube root → OKLAB (3×3 matrix)
        → OKLCH (cartesian → cylindrical)
          → max_chroma (binary search)
            → scale generation
              → WCAG contrast validation
```

Each stage is tested independently (Category 1), compositionally (Category 2), and as a full-system snapshot (Category 3).

---

## Category 1 — Golden Value Tests

Unit tests against known-correct input/output pairs. Each conversion step gets its own test file.

### 1.1 sRGB Linearisation

**File:** `src/colour-math/__tests__/srgb-linearise.test.ts`

**Source:** [01-oklch-colour-model.md § sRGB Linearisation](../docs/01-oklch-colour-model.md) / IEC 61966-2-1

**Decode formula:**

```
C_norm = C_srgb / 255
if C_norm <= 0.04045:  C_lin = C_norm / 12.92
else:                  C_lin = ((C_norm + 0.055) / 1.055) ^ 2.4
```

**Encode formula:**

```
if C_lin <= 0.0031308:  C_srgb = 12.92 * C_lin
else:                   C_srgb = 1.055 * C_lin^(1/2.4) - 0.055
```

#### Decode test vectors

| ID | Input (byte) | C_norm | Expected C_lin | Note |
|----|-------------|--------|----------------|------|
| D1 | 0 | 0.0 | 0.0 | Black boundary |
| D2 | 255 | 1.0 | 1.0 | White boundary |
| D3 | 128 | 0.50196 | 0.21586 | Mid-grey — exercises gamma path |
| D4 | 10 | 0.03922 | 0.003035 | Below threshold (linear segment) |
| D5 | 11 | 0.04314 | 0.003347 | Just above threshold (gamma segment) |
| D6 | 1 | 0.00392 | 0.000304 | Near-black |
| D7 | 254 | 0.99608 | 0.99110 | Near-white |
| D8 | 188 | 0.73725 | 0.50289 | ~50% linear — useful mid-range check |

**Tolerance:** ±0.00001

#### Encode test vectors

| ID | Input C_lin | Expected C_norm | Note |
|----|------------|-----------------|------|
| E1 | 0.0 | 0.0 | Black boundary |
| E2 | 1.0 | 1.0 | White boundary |
| E3 | 0.21586 | 0.50196 | Round-trip of D3 |
| E4 | 0.003035 | 0.03921 | Round-trip of D4 |
| E5 | 0.003347 | 0.04314 | Round-trip of D5 |
| E6 | 0.0031308 | 0.04045 | Exact encode threshold boundary |

**Tolerance:** ±0.00001

#### Threshold boundary tests

| ID | Assertion |
|----|-----------|
| T1 | `decode(0.04045)` uses the linear branch (`C_norm / 12.92`) |
| T2 | `decode(0.04046)` uses the gamma branch |
| T3 | `encode(0.0031308)` uses the linear branch (`12.92 * C_lin`) |
| T4 | `encode(0.0031309)` uses the gamma branch |

These catch off-by-one errors in threshold comparisons (`<=` vs `<`).

---

### 1.2 sRGB ↔ OKLAB Conversion

**File:** `src/colour-math/__tests__/srgb-oklab.test.ts`

**Source:** [01-oklch-colour-model.md § Conversion](../docs/01-oklch-colour-model.md)

**Matrix constants (from doc 01 — hard-coded in tests to catch accidental edits):**

Linear RGB → LMS:

```
M1 = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
]
```

Cube-rooted LMS → OKLAB:

```
M2 = [
  [ 0.2104542553,  0.7936177850, -0.0040720468],
  [ 1.9779984951, -2.4285922050,  0.4505937099],
  [ 0.0259040371,  0.7827717662, -0.8086757660],
]
```

OKLAB → cube-rooted LMS:

```
M3 = [
  [1.0,  0.3963377774,  0.2158037573],
  [1.0, -0.1055613458, -0.0638541728],
  [1.0, -0.0894841775, -1.2914855480],
]
```

LMS → Linear RGB:

```
M4 = [
  [+4.0767416621, -3.3077115913, +0.2309699292],
  [-1.2684380046, +2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, +1.7076147010],
]
```

#### Forward conversion test vectors (sRGB → OKLAB)

| ID | sRGB hex | Expected L | Expected a | Expected b | Source |
|----|----------|-----------|-----------|-----------|--------|
| F1 | `#000000` | 0.0 | 0.0 | 0.0 | Identity (black) |
| F2 | `#ffffff` | 1.0 | 0.0 | 0.0 | Identity (white) |
| F3 | `#ff0000` | 0.6280 | 0.2249 | 0.1264 | Ottosson reference |
| F4 | `#00ff00` | 0.8664 | -0.2339 | 0.1794 | Ottosson reference |
| F5 | `#0000ff` | 0.4520 | -0.0324 | -0.3119 | Ottosson reference |
| F6 | `#808080` | 0.5999 | 0.0000 | 0.0000 | Achromatic (mid-grey) |
| F7 | `#ffff00` | 0.9680 | -0.0711 | 0.1986 | Ottosson reference |
| F8 | `#ff00ff` | 0.7017 | 0.2745 | -0.1693 | Ottosson reference |
| F9 | `#00ffff` | 0.9054 | -0.1494 | -0.0394 | Ottosson reference |

**Tolerance:** ±0.002 for L, a, b

#### Reverse conversion test vectors (OKLAB → sRGB)

Every forward vector (F1–F9) must round-trip: `oklab_to_srgb(srgb_to_oklab(hex))` produces each channel within ±1/255 of the original.

| ID | OKLAB (L, a, b) | Expected sRGB hex |
|----|-----------------|-------------------|
| R1 | (0.0, 0.0, 0.0) | `#000000` |
| R2 | (1.0, 0.0, 0.0) | `#ffffff` |
| R3 | (0.6280, 0.2249, 0.1264) | `#ff0000` ±1 per channel |
| R4 | (0.5999, 0.0, 0.0) | `#808080` ±1 per channel |

---

### 1.3 OKLAB ↔ OKLCH Conversion

**File:** `src/colour-math/__tests__/oklab-oklch.test.ts`

**Source:** [01-oklch-colour-model.md § OKLAB ↔ OKLCH](../docs/01-oklch-colour-model.md)

**Formulas:**

```
OKLAB → OKLCH:  C = sqrt(a² + b²),  H = atan2(b, a) in degrees [0, 360)
OKLCH → OKLAB:  a = C * cos(H_rad),  b = C * sin(H_rad)
```

#### Forward test vectors (OKLAB → OKLCH)

| ID | L | a | b | Expected C | Expected H° | Note |
|----|---|---|---|-----------|-------------|------|
| C1 | 0.6280 | 0.2249 | 0.1264 | 0.2580 | 29.34 | Red (from F3) |
| C2 | 0.4520 | -0.0324 | -0.3119 | 0.3136 | 264.07 | Blue (from F5) |
| C3 | 0.8664 | -0.2339 | 0.1794 | 0.2948 | 142.52 | Green (from F4) |
| C4 | 0.5999 | 0.0 | 0.0 | 0.0 | — | Achromatic: C must be 0 |
| C5 | 0.0 | 0.0 | 0.0 | 0.0 | — | Black: C must be 0 |
| C6 | 1.0 | 0.0 | 0.0 | 0.0 | — | White: C must be 0 |
| C7 | 0.5 | 0.0 | 0.1 | 0.1 | 90.0 | Pure positive-b axis |
| C8 | 0.5 | 0.0 | -0.1 | 0.1 | 270.0 | Pure negative-b axis |
| C9 | 0.5 | 0.1 | 0.0 | 0.1 | 0.0 | Pure positive-a axis |

**Tolerance:** C ±0.001, H ±0.5°

**Achromatic hue convention:** When C = 0, the hue angle is undefined. The implementation must handle this consistently — either return 0 or `NaN`. Tests C4–C6 assert whichever convention the engine adopts and verify it doesn't cause downstream `NaN` propagation.

#### Reverse test vectors (OKLCH → OKLAB)

Every forward vector must round-trip: `oklch_to_oklab(oklab_to_oklch(L, a, b))` ≈ (L, a, b) within ±0.0001.

#### Hue discontinuity tests

| ID | H input | Assertion |
|----|---------|-----------|
| H1 | 359.9° | Converts to OKLAB and back without wrapping errors |
| H2 | 0.1° | Converts to OKLAB and back without wrapping errors |
| H3 | 360.0° | Normalised to 0° (or rejected — spec the behaviour) |

---

### 1.4 Gamut Mapping — `max_chroma`

**File:** `src/colour-math/__tests__/gamut.test.ts`

**Source:** [03-gamut-mapping.md § Finding the Gamut Boundary](../docs/03-gamut-mapping.md)

**Algorithm:**

```
function max_chroma(L, H):
    low = 0.0, high = 0.4
    for 20 iterations:
        mid = (low + high) / 2
        if is_in_gamut(oklch_to_srgb(L, mid, H)): low = mid
        else: high = mid
    return low
```

Precision after 20 iterations: `0.4 / 2^20 < 0.0000004`

#### `is_in_gamut` test vectors

| ID | RGB (linear) | Expected |
|----|-------------|----------|
| G1 | (0.0, 0.0, 0.0) | true |
| G2 | (1.0, 1.0, 1.0) | true |
| G3 | (0.5, 0.5, 0.5) | true |
| G4 | (-0.001, 0.5, 0.5) | false |
| G5 | (0.5, 1.001, 0.5) | false |
| G6 | (0.0, 0.0, -0.0001) | false |

#### `max_chroma` test vectors (computed via binary search)

Doc 03 provides approximate chroma values for illustration. The values below are computed by the engine's `max_chroma` binary search (20 iterations, verified by property test P4 with 1000+ random inputs).

| ID | L | H° | Expected C | Tolerance |
|----|---|----|-----------|-----------|
| MC1 | 0.50 | 25 (red) | ≈ 0.203 | ±0.005 |
| MC2 | 0.50 | 90 (yellow) | ≈ 0.102 | ±0.005 |
| MC3 | 0.50 | 145 (green) | ≈ 0.157 | ±0.005 |
| MC4 | 0.50 | 265 (blue) | ≈ 0.281 | ±0.005 |
| MC5 | 0.50 | 305 (purple) | ≈ 0.260 | ±0.005 |
| MC6 | 0.85 | 25 (red) | ≈ 0.082 | ±0.005 |
| MC7 | 0.85 | 90 (yellow) | ≈ 0.174 | ±0.005 |
| MC8 | 0.85 | 265 (blue) | ≈ 0.07 | ±0.005 |
| MC9 | 0.20 | 90 (yellow) | ≈ 0.04 | ±0.005 |
| MC10 | 0.20 | 265 (blue) | ≈ 0.137 | ±0.005 |

#### Boundary condition tests

| ID | L | H° | Expected C | Note |
|----|---|----|-----------|------|
| B1 | 0.0 | 0 | 0.0 | Black — no visible colour |
| B2 | 0.0 | 180 | 0.0 | Black — any hue |
| B3 | 1.0 | 0 | 0.0 | White — no visible colour |
| B4 | 1.0 | 265 | 0.0 | White — any hue |

#### `map_to_gamut` tests

| ID | Input (L, C, H) | Expected output | Note |
|----|------------------|----------------|------|
| MG1 | (0.50, 0.10, 265) | (0.50, 0.10, 265) | Already in gamut — unchanged |
| MG2 | (0.50, 0.40, 265) | (0.50, ≈0.19, 265) | Out of gamut — clamped to max_chroma |
| MG3 | (0.50, 0.0, 265) | (0.50, 0.0, 265) | Zero chroma — unchanged |

---

### 1.5 WCAG Contrast Ratio

**File:** `src/colour-math/__tests__/contrast.test.ts`

**Source:** [02-contrast-compliance.md](../docs/02-contrast-compliance.md) / WCAG 2.x

**Relative luminance:**

```
Y = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin
```

**Contrast ratio:**

```
ratio = (max(Y1, Y2) + 0.05) / (min(Y1, Y2) + 0.05)
```

#### Relative luminance test vectors

| ID | sRGB hex | Expected Y | Note |
|----|----------|-----------|------|
| Y1 | `#000000` | 0.0 | Black |
| Y2 | `#ffffff` | 1.0 | White |
| Y3 | `#ff0000` | 0.2126 | Pure red |
| Y4 | `#00ff00` | 0.7152 | Pure green |
| Y5 | `#0000ff` | 0.0722 | Pure blue |
| Y6 | `#808080` | 0.21586 | Mid-grey (same as linearised 128) |
| Y7 | `#767676` | 0.18116 | AA boundary grey |

**Tolerance:** ±0.001

#### Contrast ratio test vectors

| ID | Colour A | Colour B | Expected ratio | Note |
|----|----------|----------|---------------|------|
| CR1 | `#ffffff` | `#000000` | 21.0 | Maximum possible contrast |
| CR2 | `#000000` | `#000000` | 1.0 | Identity |
| CR3 | `#ffffff` | `#ffffff` | 1.0 | Identity |
| CR4 | `#ffffff` | `#767676` | 4.54 | AA normal text pass boundary |
| CR5 | `#000000` | `#767676` | 4.62 | Dark-on-grey |
| CR6 | `#ffffff` | `#595959` | 7.0 | AAA normal text boundary |
| CR7 | `#000000` | `#767676` | 4.62 | Symmetry check with CR4 inverse |

**Tolerance:** ±0.05

#### Compliance threshold tests

| ID | Ratio | Level | Element | Expected |
|----|-------|-------|---------|----------|
| TH1 | 4.5 | AA | normal text | pass |
| TH2 | 4.49 | AA | normal text | fail |
| TH3 | 3.0 | AA | large text | pass |
| TH4 | 2.99 | AA | large text | fail |
| TH5 | 7.0 | AAA | normal text | pass |
| TH6 | 6.99 | AAA | normal text | fail |
| TH7 | 4.5 | AAA | large text | pass |
| TH8 | 4.49 | AAA | large text | fail |

---

## Category 2 — Round-Trip Property Tests

Property-based tests using `fast-check`. Each property runs with **numRuns: 1000** minimum. These catch edge cases that golden values miss — particularly around gamut boundaries, degenerate lightness, and hue discontinuity.

**File:** `src/colour-math/__tests__/round-trip.property.test.ts`

### Custom Generators

```typescript
// Integer 0–255
arbSrgbByte: fc.integer({ min: 0, max: 255 })

// Valid hex string #rrggbb
arbSrgbHex: fc.tuple(arbSrgbByte, arbSrgbByte, arbSrgbByte)
  .map(([r, g, b]) => `#${hex(r)}${hex(g)}${hex(b)}`)

// L in [0, 1], H in [0, 360)
arbLH: fc.tuple(
  fc.double({ min: 0, max: 1, noNaN: true }),
  fc.double({ min: 0, max: 360, noNaN: true, noDefaultInfinity: true })
)

// L in (0.05, 0.95), H in [0, 360) — avoids degenerate extremes for max_chroma boundary tests
arbLH_interior: fc.tuple(
  fc.double({ min: 0.05, max: 0.95, noNaN: true }),
  fc.double({ min: 0, max: 360, noNaN: true, noDefaultInfinity: true })
)

// In-gamut OKLCH triplet — requires max_chroma, so this is a dependent generator
arbInGamutOklch: arbLH.chain(([L, H]) => {
  const cMax = max_chroma(L, H)
  return fc.double({ min: 0, max: cMax, noNaN: true }).map(C => ({ L, C, H }))
})
```

### Properties

#### P1 — sRGB linearisation round-trip

For any byte value v in [0, 255]:

```
encode(decode(v / 255)) ≈ v / 255
```

**Tolerance:** ±1/255 (one 8-bit step)

#### P2 — Full pipeline round-trip (sRGB → OKLCH → sRGB)

For any valid sRGB hex:

```
oklch_to_srgb(srgb_to_oklch(hex)) ≈ original RGB
```

Each channel within ±1/255 of the original.

#### P3 — Gamut containment

For any in-gamut OKLCH triplet `(L, C, H)`:

```
rgb = oklch_to_srgb(L, C, H)
assert 0 <= rgb.r <= 1
assert 0 <= rgb.g <= 1
assert 0 <= rgb.b <= 1
```

#### P4 — max_chroma boundary precision

For any `(L, H)` where L in (0.05, 0.95):

```
C_max = max_chroma(L, H)
assert is_in_gamut(oklch_to_srgb(L, C_max, H))
assert !is_in_gamut(oklch_to_srgb(L, C_max + 0.001, H))
```

The first assertion verifies the binary search converges to the boundary, not the interior. The second verifies one step past the boundary is out of gamut.

#### P5 — Contrast ratio symmetry

For any two sRGB hex values a, b:

```
wcag_contrast(a, b) === wcag_contrast(b, a)
```

**Tolerance:** exact (0)

#### P6 — Contrast ratio identity

For any sRGB hex value a:

```
wcag_contrast(a, a) === 1.0
```

**Tolerance:** exact (0)

#### P7 — Contrast ratio monotonicity

For any sRGB hex x where `luminance(x) < luminance(#808080)`:

```
wcag_contrast(#ffffff, x) >= wcag_contrast(#808080, x)
```

This verifies white always has higher contrast against dark colours than mid-grey does.

---

## Category 3 — Palette Snapshot Test

**File:** `src/colour-math/__tests__/palette.snapshot.test.ts`

### Canonical Input

From [05-generation-algorithm.md § Example Input](../docs/05-generation-algorithm.md):

```json
{
  "hues": [
    { "name": "red",    "H": 25  },
    { "name": "orange", "H": 55  },
    { "name": "yellow", "H": 90  },
    { "name": "green",  "H": 145 },
    { "name": "teal",   "H": 195 },
    { "name": "blue",   "H": 265 },
    { "name": "purple", "H": 305 },
    { "name": "pink",   "H": 350 }
  ],
  "num_levels": 10,
  "compliance": "AA",
  "lightness_curve": [0.97, 0.93, 0.87, 0.78, 0.68, 0.56, 0.45, 0.36, 0.27, 0.17],
  "chroma_strategy": "max_per_hue",
  "neutral_hue": null
}
```

### What to snapshot

The test calls the generation algorithm with the canonical input and snapshots the **entire** output:

1. **Per hue, per level:** hex value, OKLCH triplet (L, C, H), relative luminance
2. **Neutral scale:** hex value, OKLCH triplet, relative luminance
3. **Intra-hue contrast validation:** every tested pair, its ratio, pass/fail
4. **Cross-hue contrast validation:** every tested pair, its ratio, pass/fail
5. **Metadata:** compliance level, thresholds, distances

### Snapshot mechanics

Use Vitest's `toMatchSnapshot()` with a `.snap` file. The snapshot is generated once when the engine first passes all Category 1 and Category 2 tests, then committed. Any subsequent code change that alters the output breaks the snapshot.

### Partial verification (before full snapshot)

Until the generation algorithm is implemented, verify these partial properties from doc 05's example output:

| Property | Expected |
|----------|----------|
| Blue level 0 hex | `#EBF0FF` |
| Blue level 0 OKLCH | L=0.97, C=0.030, H=265 |
| Blue level 0 relative luminance | ≈ 0.918 |
| Neutral level 0 hex | `#F7F7F7` |
| Neutral level 0 relative luminance | ≈ 0.913 |
| Neutral chroma | 0 (when `neutral_hue` is null) |

---

## Category 4 — Cache Accuracy Tests

The C_max cache (see [OKLCH-COORDINATE-RENDERING.md § 7](OKLCH-COORDINATE-RENDERING.md#7-c_max-caching-and-performance)) uses bilinear interpolation over a 360 × 100 grid to approximate the ground-truth binary search. This category validates that the approximation error stays within acceptable bounds for both rendering and interpolation use cases. These tests are Phase 1 prerequisites — the cache must pass before it is used for real-time rendering or normalised-chroma lookups.

**File:** `src/colour-math/__tests__/chroma-cache.test.ts`

**Source:** [OKLCH-COORDINATE-RENDERING.md § 7a](OKLCH-COORDINATE-RENDERING.md#7a-cache-accuracy-constraints)

### Prerequisites

The test requires two implementations:

1. `maxChroma(L, H)` — the binary search ground truth (20 iterations, precision < 0.0000004). Already tested in Category 1.4.
2. `cachedMaxChroma(L, H, cache, resolution)` — bilinear lookup into the pre-built `Float32Array` cache.

Both must be available before this test runs.

### 4.1 Dense Sweep — Full (L, H) Plane

For every H at 0.1° intervals (3,600 values) and every L at 0.001 intervals (1,001 values), compare the cached and ground-truth C_max:

```typescript
const resolution = 360;
const cache = buildChromaEnvelopeCache(resolution);

let visualViolations = 0;
let structuralViolations = 0;
let worstError = 0;
let worstPosition = { L: 0, H: 0 };

for (let hi = 0; hi < 3600; hi++) {
  const H = hi * 0.1;
  for (let li = 0; li <= 1000; li++) {
    const L = li * 0.001;
    const cached = cachedMaxChroma(L, H, cache, resolution);
    const truth = maxChroma(L, H);
    const error = Math.abs(cached - truth);

    if (error > 0.005) visualViolations++;
    if (error > 0.02) structuralViolations++;
    if (error > worstError) {
      worstError = error;
      worstPosition = { L, H };
    }
  }
}
```

#### Assertions

| ID | Assertion | Threshold |
|----|-----------|-----------|
| CA1 | `structuralViolations === 0` | Hard fail — no point may exceed 0.02 |
| CA2 | `visualViolations` is reported | Informational — logged with worst-case position |
| CA3 | `worstError` and `worstPosition` are reported | Informational — identifies the most problematic (L, H) region |

**Total comparisons:** ~3,603,600. This is a single test case with an internal loop, not 3.6M individual test cases. Expected runtime: 30–90 seconds (dominated by ~3.6M binary searches at 20 iterations each).

### 4.2 Ridge-Focused Sweep

At the five known ridge hue angles (H ≈ 30°, 90°, 145°, 265°, 325°), sweep L at 10× finer resolution to characterise the worst-case error precisely:

```typescript
const ridgeHues = [30, 90, 145, 265, 325];

for (const H of ridgeHues) {
  let maxError = 0;
  let maxGradient = 0;
  let prevError = 0;

  for (let li = 0; li <= 10000; li++) {
    const L = li * 0.0001;
    const cached = cachedMaxChroma(L, H, cache, resolution);
    const truth = maxChroma(L, H);
    const error = Math.abs(cached - truth);

    if (li > 0) {
      const gradient = Math.abs(error - prevError) / 0.0001;
      if (gradient > maxGradient) maxGradient = gradient;
    }
    prevError = error;

    if (error > maxError) maxError = error;
  }

  // Report per-ridge results
}
```

#### Assertions

| ID | Assertion | Note |
|----|-----------|------|
| CA4 | Per-ridge `maxError < 0.02` | Structural threshold at each ridge |
| CA5 | Per-ridge `maxError` and `maxGradient` are reported | Identifies which ridges are most problematic and how steeply error changes with L |

### 4.3 Resolution Comparison (Informational)

If the 360 × 100 cache produces any visual-threshold violations (CA2 count > 0), repeat the dense sweep with a 720 × 200 cache and report the reduction:

```typescript
if (visualViolations > 0) {
  const hiResCache = buildChromaEnvelopeCache(720);
  let hiResVisualViolations = 0;

  // Same dense sweep as 4.1, using hiResCache and resolution = 720
  // ...

  // Report: visualViolations at 360x100 vs hiResVisualViolations at 720x200
}
```

#### Assertions

| ID | Assertion | Note |
|----|-----------|------|
| CA6 | `hiResVisualViolations < visualViolations` | Informational — confirms higher resolution reduces error. Not a hard pass/fail. |

This test does not gate the build — it provides data for the resolution upgrade decision described in [OKLCH-COORDINATE-RENDERING.md § 7a](OKLCH-COORDINATE-RENDERING.md#7a-cache-accuracy-constraints).

---

## Test File Index

| File | Category | Converts/Tests | Cases |
|------|----------|----------------|-------|
| `srgb-linearise.test.ts` | 1 | sRGB decode/encode | ~20 |
| `srgb-oklab.test.ts` | 1 | sRGB ↔ OKLAB | ~15 |
| `oklab-oklch.test.ts` | 1 | OKLAB ↔ OKLCH | ~15 |
| `gamut.test.ts` | 1 | is_in_gamut, max_chroma, map_to_gamut | ~20 |
| `contrast.test.ts` | 1 | Relative luminance, WCAG ratio, thresholds | ~25 |
| `round-trip.property.test.ts` | 2 | 7 properties × 1000 inputs | 7,000+ |
| `palette.snapshot.test.ts` | 3 | Full palette generation | 1 snapshot |
| `chroma-cache.test.ts` | 4 | Cache vs ground-truth C_max (dense sweep + ridge sweep) | ~3.6M comparisons (3 test cases) |

**Total:** ~95 deterministic cases + 7,000+ random-input property checks + 1 snapshot + ~3.6M cache accuracy comparisons.

---

## Tolerance Summary

| Conversion | Metric | Tolerance |
|-----------|--------|-----------|
| sRGB decode/encode | C_lin or C_norm | ±0.00001 |
| sRGB ↔ OKLAB | L, a, b | ±0.002 |
| OKLAB ↔ OKLCH | C | ±0.001 |
| OKLAB ↔ OKLCH | H (degrees) | ±0.5° |
| max_chroma | C | ±0.002 |
| C_max cache (visual) | absolute C_max error | 0.005 (report count) |
| C_max cache (structural) | absolute C_max error | 0.02 (hard fail) |
| Relative luminance | Y | ±0.001 |
| Contrast ratio | ratio | ±0.05 |
| sRGB round-trip | per channel | ±1/255 |

---

## Dependencies

```
vitest        — test runner (ships with Vite, zero config)
fast-check    — property-based test generator
```

Both are `devDependencies` only. No runtime impact.
