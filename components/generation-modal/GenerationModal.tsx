"use client"

import { useState } from "react"
import { useLayoutStore } from "@/store/layout-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Code, Sparkles } from "lucide-react"

/**
 * GenerationModal - Modal for configuring code generation options
 * PRD 3.4: Generation Options Modal
 *
 * MVP Constraints (PRD 6.1):
 * - Only React framework supported
 * - Only Tailwind CSS solution supported
 * - Actual prompt generation will be implemented in Phase 4
 */
export function GenerationModal() {
  const schema = useLayoutStore((state) => state.schema)
  const [open, setOpen] = useState(false)
  const [framework, setFramework] = useState<string>("react")
  const [cssSolution, setCssSolution] = useState<string>("tailwind")

  const handleGenerate = () => {
    // TODO: Phase 4 - Implement prompt generation
    // This will:
    // 1. Convert schema to structured prompt
    // 2. Include framework and CSS solution selections
    // 3. Display generated prompt + JSON for copying

    console.log("Generate clicked:", {
      framework,
      cssSolution,
      schema,
    })

    alert(
      "Code generation will be implemented in Phase 4!\n\n" +
      `Selected options:\n` +
      `- Framework: ${framework}\n` +
      `- CSS: ${cssSolution}\n` +
      `- Components: ${schema.components.length}\n` +
      `- Breakpoints: ${schema.breakpoints.length}`
    )

    setOpen(false)
  }

  const componentCount = schema.components.length
  const breakpointCount = schema.breakpoints.length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Sparkles className="h-5 w-5" />
          Generate Code
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Generate Code Options
          </DialogTitle>
          <DialogDescription>
            Configure your code generation preferences. The AI prompt will be
            generated based on your layout schema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Schema Summary */}
          <div className="rounded-lg border bg-accent/50 p-4">
            <h4 className="text-sm font-medium mb-3">Current Schema</h4>
            <div className="flex gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{componentCount}</Badge>
                <span className="text-muted-foreground">Components</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{breakpointCount}</Badge>
                <span className="text-muted-foreground">Breakpoints</span>
              </div>
            </div>
          </div>

          {/* Framework Selection */}
          <div className="space-y-2">
            <Label htmlFor="framework">Framework</Label>
            <Select value={framework} onValueChange={setFramework}>
              <SelectTrigger id="framework">
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">React</SelectItem>
                {/* Phase 2: Add Vue, Svelte, etc. */}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              MVP supports React only. More frameworks coming in Phase 2.
            </p>
          </div>

          {/* CSS Solution Selection */}
          <div className="space-y-2">
            <Label htmlFor="css">CSS Solution</Label>
            <Select value={cssSolution} onValueChange={setCssSolution}>
              <SelectTrigger id="css">
                <SelectValue placeholder="Select CSS solution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                {/* Phase 2: Add CSS Modules, Styled Components, etc. */}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              MVP supports Tailwind CSS only. More solutions coming in Phase 2.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={componentCount === 0}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate
          </Button>
        </DialogFooter>

        {componentCount === 0 && (
          <p className="text-sm text-muted-foreground text-center -mt-2">
            Add at least one component to generate code
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
