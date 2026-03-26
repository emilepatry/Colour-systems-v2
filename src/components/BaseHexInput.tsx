import { useState, useCallback } from 'react'
import { usePaletteStore } from '@/store'
import { isValidHex6 } from '@/colour-math'
import { MONO_FONT, BLURB_STYLE } from '@/styles/tokens'

export default function BaseHexInput() {
  const baseHex = usePaletteStore((s) => s.baseHex)
  const setBaseHex = usePaletteStore((s) => s.setBaseHex)
  const [input, setInput] = useState('')
  const [touched, setTouched] = useState(false)

  const normalizedInput = input.startsWith('#') ? input : `#${input}`
  const isValid = isValidHex6(input)
  const showHint = touched && input.length > 0 && !isValid

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInput(val)
    setTouched(true)

    if (isValidHex6(val)) {
      setBaseHex(val)
    }
  }, [setBaseHex])

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').trim()
    if (isValidHex6(pasted)) {
      e.preventDefault()
      const normalized = pasted.startsWith('#') ? pasted : `#${pasted}`
      setInput(normalized)
      setTouched(true)
      setBaseHex(pasted)
    }
  }, [setBaseHex])

  const handleClear = useCallback(() => {
    setBaseHex(null)
    setInput('')
    setTouched(false)
  }, [setBaseHex])

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="base-hex-input"
        className="text-[12px] font-medium"
        style={{ fontFamily: MONO_FONT, color: '#666' }}
      >
        Base colour
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            id="base-hex-input"
            type="text"
            value={baseHex ?? input}
            onChange={handleChange}
            onPaste={handlePaste}
            placeholder="Start from a colour"
            maxLength={7}
            spellCheck={false}
            autoComplete="off"
            className="w-full h-9 px-3 rounded-md border text-[13px] outline-none transition-colors bg-white placeholder:text-[#bbb]"
            style={{
              fontFamily: MONO_FONT,
              color: '#1a1a1a',
              borderColor: showHint ? '#e5a0a0' : '#e0e0e0',
            }}
            aria-invalid={showHint || undefined}
            aria-describedby={showHint ? 'base-hex-hint' : undefined}
            readOnly={baseHex !== null}
            onFocus={() => {
              if (baseHex !== null) {
                handleClear()
              }
            }}
          />
          {baseHex && (
            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-[3px] border border-black/10"
              style={{ backgroundColor: baseHex }}
              aria-hidden="true"
            />
          )}
        </div>
        {baseHex && (
          <button
            onClick={handleClear}
            className="h-9 px-3 rounded-md text-[12px] border border-[#e0e0e0] bg-white hover:bg-[#f8f8f8] transition-colors cursor-pointer"
            style={{ fontFamily: MONO_FONT, color: '#999' }}
            aria-label="Remove base colour constraint"
          >
            Clear
          </button>
        )}
      </div>
      {showHint && (
        <p id="base-hex-hint" role="alert" style={{ ...BLURB_STYLE, color: '#c47070' }}>
          Enter a 6-digit hex colour, e.g. #4F46E5
        </p>
      )}
    </div>
  )
}
