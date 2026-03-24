import { useState, useMemo } from 'react'
import { usePaletteStore } from '@/store'
import { useActivePalette } from '@/hooks/useActivePalette'
import { exportAsCSS, exportAsJSON } from '@/lib/export'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

const MONO_FONT = "'JetBrains Mono', ui-monospace, monospace"

interface ExportSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ExportSheet({ open, onOpenChange }: ExportSheetProps) {
  const { activeMode, palette, optimization } = useActivePalette()
  const globalVibrancy = usePaletteStore((s) => s.globalVibrancy)
  const [copiedTab, setCopiedTab] = useState<'css' | 'json' | null>(null)

  const exportPalette = useMemo(() => {
    if (!palette) return null
    if (!optimization) return palette
    return { ...palette, scales: optimization.adjustedScales }
  }, [palette, optimization])

  const cssOutput = useMemo(
    () => (exportPalette ? exportAsCSS(exportPalette, activeMode) : ''),
    [exportPalette, activeMode],
  )

  const jsonOutput = useMemo(
    () => (exportPalette ? exportAsJSON(exportPalette, { globalVibrancy, mode: activeMode }) : ''),
    [exportPalette, globalVibrancy, activeMode],
  )

  const handleCopy = (content: string, tab: 'css' | 'json') => {
    try {
      navigator.clipboard.writeText(content).then(() => {
        setCopiedTab(tab)
        setTimeout(() => setCopiedTab(null), 1500)
      })
    } catch {
      // Clipboard API unavailable in insecure contexts
    }
  }

  if (!palette) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Export Tokens</SheetTitle>
          <SheetDescription>
            Copy your colour system as CSS custom properties or JSON.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4 flex-1 min-h-0">
          <Tabs defaultValue="css">
            <TabsList>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="css">
              <div className="flex justify-end mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(cssOutput, 'css')}
                >
                  {copiedTab === 'css' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <pre
                className="text-xs overflow-auto rounded-lg"
                style={{
                  fontFamily: MONO_FONT,
                  fontSize: 12,
                  background: '#f5f5f5',
                  padding: 16,
                  maxHeight: '60vh',
                }}
              >
                {cssOutput}
              </pre>
            </TabsContent>

            <TabsContent value="json">
              <div className="flex justify-end mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(jsonOutput, 'json')}
                >
                  {copiedTab === 'json' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <pre
                className="text-xs overflow-auto rounded-lg"
                style={{
                  fontFamily: MONO_FONT,
                  fontSize: 12,
                  background: '#f5f5f5',
                  padding: 16,
                  maxHeight: '60vh',
                }}
              >
                {jsonOutput}
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
