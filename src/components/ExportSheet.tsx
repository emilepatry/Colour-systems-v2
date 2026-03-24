import { useState, useMemo } from 'react'
import { usePaletteStore } from '@/store'
import { useActivePalette } from '@/hooks/useActivePalette'
import {
  exportAsCSS,
  exportAsJSON,
  exportAsShadcn,
  exportAsTailwind,
  exportAsTokenJSON,
} from '@/lib/export'
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

type TabId = 'shadcn' | 'tailwind' | 'css' | 'json'

interface ExportSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ExportSheet({ open, onOpenChange }: ExportSheetProps) {
  const { activeMode, palette, optimization } = useActivePalette()
  const globalVibrancy = usePaletteStore((s) => s.globalVibrancy)
  const lightTokens = usePaletteStore((s) => s.semanticTokens)
  const darkTokens = usePaletteStore((s) => s.darkSemanticTokens)
  const lightComponent = usePaletteStore((s) => s.componentTokens)
  const darkComponent = usePaletteStore((s) => s.darkComponentTokens)
  const [copiedTab, setCopiedTab] = useState<TabId | null>(null)

  const exportPalette = useMemo(() => {
    if (!palette) return null
    if (!optimization) return palette
    return { ...palette, scales: optimization.adjustedScales }
  }, [palette, optimization])

  const shadcnOutput = useMemo(
    () => (lightTokens && darkTokens ? exportAsShadcn(lightTokens, darkTokens) : ''),
    [lightTokens, darkTokens],
  )

  const tailwindOutput = useMemo(
    () => (exportPalette ? exportAsTailwind(exportPalette) : ''),
    [exportPalette],
  )

  const cssOutput = useMemo(
    () => (exportPalette ? exportAsCSS(exportPalette, activeMode) : ''),
    [exportPalette, activeMode],
  )

  const jsonOutput = useMemo(
    () =>
      exportPalette && lightTokens && darkTokens
        ? exportAsTokenJSON(exportPalette, lightTokens, darkTokens, lightComponent, darkComponent)
        : exportPalette
          ? exportAsJSON(exportPalette, { globalVibrancy, mode: activeMode })
          : '',
    [exportPalette, lightTokens, darkTokens, lightComponent, darkComponent, globalVibrancy, activeMode],
  )

  const handleCopy = (content: string, tab: TabId) => {
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

  const preStyle = {
    fontFamily: MONO_FONT,
    fontSize: 12,
    background: '#f5f5f5',
    padding: 16,
    maxHeight: '60vh',
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Export Tokens</SheetTitle>
          <SheetDescription>
            Copy your colour system as shadcn theme, Tailwind palette, CSS custom properties, or JSON.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4 flex-1 min-h-0">
          <Tabs defaultValue="shadcn">
            <TabsList>
              <TabsTrigger value="shadcn">shadcn</TabsTrigger>
              <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="shadcn">
              <div className="flex justify-end mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(shadcnOutput, 'shadcn')}
                >
                  {copiedTab === 'shadcn' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <pre className="text-xs overflow-auto rounded-lg" style={preStyle}>
                {shadcnOutput}
              </pre>
            </TabsContent>

            <TabsContent value="tailwind">
              <div className="flex justify-end mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(tailwindOutput, 'tailwind')}
                >
                  {copiedTab === 'tailwind' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <pre className="text-xs overflow-auto rounded-lg" style={preStyle}>
                {tailwindOutput}
              </pre>
            </TabsContent>

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
              <pre className="text-xs overflow-auto rounded-lg" style={preStyle}>
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
              <pre className="text-xs overflow-auto rounded-lg" style={preStyle}>
                {jsonOutput}
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
