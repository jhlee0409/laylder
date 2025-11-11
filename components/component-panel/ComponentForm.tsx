"use client"

import { useState } from "react"
import { useLayoutStore } from "@/store/layout-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SemanticTag } from "@/types/schema"

const SEMANTIC_TAGS: SemanticTag[] = [
  "header",
  "nav",
  "main",
  "aside",
  "footer",
  "section",
  "article",
  "div",
]

/**
 * ComponentForm - Form for adding or editing components
 */
export function ComponentForm() {
  const [name, setName] = useState("")
  const [semanticTag, setSemanticTag] = useState<SemanticTag>("div")
  const [propsJson, setPropsJson] = useState('{"children": ""}')
  const [error, setError] = useState<string | null>(null)

  const addComponent = useLayoutStore((state) => state.addComponent)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate component name (PascalCase)
    const nameRegex = /^[A-Z][a-zA-Z0-9]*$/
    if (!nameRegex.test(name)) {
      setError("Component name must be PascalCase (e.g., MyComponent)")
      return
    }

    // Validate and parse props JSON
    let props: Record<string, unknown> = {}
    if (propsJson.trim()) {
      try {
        props = JSON.parse(propsJson)
        if (typeof props !== "object" || Array.isArray(props)) {
          setError("Props must be a valid JSON object")
          return
        }
      } catch (err) {
        setError("Invalid JSON in props")
        return
      }
    }

    // Add component to store
    addComponent({
      name,
      semanticTag,
      props,
    })

    // Reset form
    setName("")
    setSemanticTag("div")
    setPropsJson('{"children": ""}')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Component</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Component Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Component Name *</Label>
            <Input
              id="name"
              placeholder="MyComponent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Must be PascalCase (e.g., GlobalHeader)
            </p>
          </div>

          {/* Semantic Tag */}
          <div className="space-y-2">
            <Label htmlFor="semanticTag">Semantic Tag *</Label>
            <Select
              value={semanticTag}
              onValueChange={(value) => setSemanticTag(value as SemanticTag)}
            >
              <SelectTrigger id="semanticTag">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEMANTIC_TAGS.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    &lt;{tag}&gt;
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Props */}
          <div className="space-y-2">
            <Label htmlFor="props">Default Props (JSON)</Label>
            <Textarea
              id="props"
              placeholder='{"children": "Default text"}'
              value={propsJson}
              onChange={(e) => setPropsJson(e.target.value)}
              className="font-mono text-xs"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Optional JSON object for component props
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Add Component
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
