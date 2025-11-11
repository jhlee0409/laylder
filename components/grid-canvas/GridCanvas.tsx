"use client"

import { useLayoutStore } from "@/store/layout-store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import GridLayout, { Layout } from "react-grid-layout"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Convert CSS Grid areas to react-grid-layout format
 * Helper function to convert existing data structure
 */
function areasToLayout(
  areas: string[][],
  components: Array<{ id: string; name: string }>
): Layout[] {
  const layout: Layout[] = []
  const processed = new Set<string>()

  areas.forEach((row, y) => {
    row.forEach((componentId, x) => {
      if (!componentId || processed.has(componentId)) return

      // Find bounds of this component
      let width = 1
      let height = 1

      // Find width
      for (let i = x + 1; i < row.length; i++) {
        if (row[i] === componentId) width++
        else break
      }

      // Find height
      for (let j = y + 1; j < areas.length; j++) {
        let allMatch = true
        for (let k = x; k < x + width; k++) {
          if (areas[j][k] !== componentId) {
            allMatch = false
            break
          }
        }
        if (allMatch) height++
        else break
      }

      layout.push({
        i: componentId,
        x,
        y,
        w: width,
        h: height,
        minW: 1,
        minH: 1,
      })

      processed.add(componentId)
    })
  })

  return layout
}

/**
 * Convert react-grid-layout format back to CSS Grid areas
 * For backward compatibility with existing store
 */
function layoutToAreas(layout: Layout[], cols: number, rows: number): string[][] {
  const areas: string[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => "")
  )

  layout.forEach((item) => {
    const { i, x, y, w, h } = item
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        if (row < rows && col < cols) {
          areas[row][col] = i
        }
      }
    }
  })

  return areas
}

/**
 * GridCanvas - React Grid Layout based canvas
 * Supports drag, drop, and resize
 */
export function GridCanvas() {
  const components = useLayoutStore((state) => state.schema.components)
  const selectedComponentId = useLayoutStore(
    (state) => state.selectedComponentId
  )
  const setSelectedComponentId = useLayoutStore(
    (state) => state.setSelectedComponentId
  )
  const currentBreakpoint = useLayoutStore((state) => state.currentBreakpoint)
  const currentLayout = useLayoutStore(
    (state) => state.schema.layouts[state.currentBreakpoint]
  )
  const updateGridAreas = useLayoutStore((state) => state.updateGridAreas)

  const [layout, setLayout] = useState<Layout[]>([])
  const [cols, setCols] = useState(12)
  const [rows, setRows] = useState(12)

  // Convert areas to layout when current layout changes
  useEffect(() => {
    if (currentLayout) {
      const newLayout = areasToLayout(currentLayout.grid.areas, components)
      setLayout(newLayout)

      // Calculate cols from areas
      const maxCols = Math.max(
        ...currentLayout.grid.areas.map((row) => row.length),
        12
      )
      setCols(maxCols)
      setRows(currentLayout.grid.areas.length || 12)
    }
  }, [currentLayout, components, currentBreakpoint])

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout)

    // Convert back to areas format and update store
    const newAreas = layoutToAreas(newLayout, cols, rows)
    updateGridAreas(currentBreakpoint, newAreas)
  }

  const getComponentName = (id: string) => {
    return components.find((c) => c.id === id)?.name || id
  }

  if (!currentLayout) {
    return (
      <Card className="p-8">
        <p className="text-center text-muted-foreground">
          No layout available for {currentBreakpoint}
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Grid Canvas - {currentBreakpoint}
        </h3>
        <p className="text-sm text-muted-foreground">
          💡 Drag to move, resize handles to adjust size
        </p>
      </div>

      <div className="border-2 border-dashed border-muted rounded-lg p-4 bg-muted/10 min-h-[600px]">
        <GridLayout
          className="layout"
          layout={layout}
          cols={cols}
          rowHeight={50}
          width={1200}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          compactType={null}
          preventCollision={false}
        >
          {layout.map((item) => {
            const isSelected = selectedComponentId === item.i
            return (
              <div
                key={item.i}
                className={cn(
                  "cursor-pointer rounded-lg border-2 bg-background shadow-sm transition-all",
                  isSelected
                    ? "border-primary ring-2 ring-primary"
                    : "border-border hover:border-accent-foreground"
                )}
                onClick={() =>
                  setSelectedComponentId(
                    isSelected ? null : item.i
                  )
                }
              >
                <div className="h-full flex flex-col items-center justify-center p-4">
                  <div
                    className="drag-handle cursor-move mb-2 text-muted-foreground hover:text-foreground"
                    title="Drag to move"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9" cy="12" r="1" />
                      <circle cx="9" cy="5" r="1" />
                      <circle cx="9" cy="19" r="1" />
                      <circle cx="15" cy="12" r="1" />
                      <circle cx="15" cy="5" r="1" />
                      <circle cx="15" cy="19" r="1" />
                    </svg>
                  </div>
                  <Badge variant={isSelected ? "default" : "secondary"}>
                    {item.i}
                  </Badge>
                  <div className="text-sm font-medium text-center mt-2">
                    {getComponentName(item.i)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.w} × {item.h}
                  </div>
                </div>
              </div>
            )
          })}
        </GridLayout>
      </div>
    </Card>
  )
}
