"use client"

import { useLayoutStore } from "@/store/layout-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * ComponentList - List of all components with select/delete actions
 */
export function ComponentList() {
  const components = useLayoutStore((state) => state.schema.components)
  const selectedComponentId = useLayoutStore(
    (state) => state.selectedComponentId
  )
  const setSelectedComponentId = useLayoutStore(
    (state) => state.setSelectedComponentId
  )
  const deleteComponent = useLayoutStore((state) => state.deleteComponent)
  const currentBreakpoint = useLayoutStore((state) => state.currentBreakpoint)
  const currentLayout = useLayoutStore(
    (state) => state.schema.layouts[state.currentBreakpoint]
  )

  // Check if component is visible in current breakpoint
  const isComponentVisible = (componentId: string) => {
    if (!currentLayout) return false
    const { areas } = currentLayout.grid
    return areas.some((row) => row.includes(componentId))
  }

  const handleSelect = (componentId: string) => {
    setSelectedComponentId(
      selectedComponentId === componentId ? null : componentId
    )
  }

  const handleDelete = (componentId: string, componentName: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${componentName}"? This will remove it from all layouts.`
      )
    ) {
      deleteComponent(componentId)
    }
  }

  if (components.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Components</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No components yet. Add one above to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Components ({components.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {components.map((component) => {
            const isSelected = selectedComponentId === component.id
            const isVisible = isComponentVisible(component.id)

            return (
              <div
                key={component.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent"
                )}
                onClick={() => handleSelect(component.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={isSelected ? "default" : "secondary"}>
                      {component.id}
                    </Badge>
                    <span className="font-medium text-sm truncate">
                      {component.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      &lt;{component.semanticTag}&gt;
                    </span>
                    {isVisible ? (
                      <Badge variant="outline" className="text-xs">
                        Visible in {currentBreakpoint}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs opacity-50">
                        Hidden in {currentBreakpoint}
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(component.id, component.name)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
