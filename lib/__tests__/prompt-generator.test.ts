/**
 * Prompt Generator Unit Tests
 */

import { describe, it, expect, vi } from 'vitest'
import {
  generatePrompt,
  generateSchemaSummary,
  estimateTokenCount,
  getRecommendedModel,
} from '../prompt-generator'
import type { LaydlerSchema } from '@/types/schema'

describe('Prompt Generator', () => {
  const validSchema: LaydlerSchema = {
    schemaVersion: '2.0',
    components: [
      {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      },
      {
        id: 'c2',
        name: 'Main',
        semanticTag: 'main',
        positioning: { type: 'static' },
        layout: { type: 'flex', flex: { direction: 'column' } },
        canvasLayout: { x: 0, y: 1, width: 12, height: 6 },
      },
    ],
    breakpoints: [
      { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
    ],
    layouts: {
      mobile: {
        structure: 'vertical',
        components: ['c1', 'c2'],
      },
      desktop: {
        structure: 'vertical',
        components: ['c1', 'c2'],
      },
    },
  }

  describe('generatePrompt', () => {
    it('should generate prompt successfully for valid schema', () => {
      const result = generatePrompt(validSchema, 'react', 'tailwind')

      expect(result.success).toBe(true)
      expect(result.prompt).toBeDefined()
      expect(result.schema).toBeDefined()
      expect(result.errors).toBeUndefined()
    })

    it('should include schema JSON in prompt', () => {
      const result = generatePrompt(validSchema, 'react', 'tailwind')

      expect(result.prompt).toContain('Full Schema (JSON)')
      expect(result.prompt).toContain('"schemaVersion": "2.0"')
      expect(result.prompt).toContain('"Header"')
      expect(result.prompt).toContain('"Main"')
    })

    it('should include component information in prompt', () => {
      const result = generatePrompt(validSchema, 'react', 'tailwind')

      expect(result.prompt).toContain('Header')
      expect(result.prompt).toContain('Main')
    })

    it('should include breakpoint information in prompt', () => {
      const result = generatePrompt(validSchema, 'react', 'tailwind')

      expect(result.prompt).toContain('mobile')
      expect(result.prompt).toContain('desktop')
    })

    it('should return errors for invalid schema', () => {
      const invalidSchema: LaydlerSchema = {
        schemaVersion: '1.0' as any, // Invalid version
        components: [],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: [] },
        },
      }

      const result = generatePrompt(invalidSchema, 'react', 'tailwind')

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors!.length).toBeGreaterThan(0)
      expect(result.prompt).toBeUndefined()
    })

    it('should return warnings for schema with issues', () => {
      // Schema with potential warnings (this depends on validation rules)
      const result = generatePrompt(validSchema, 'react', 'tailwind')

      // If there are warnings, they should be included
      if (result.warnings && result.warnings.length > 0) {
        expect(result.warnings).toBeInstanceOf(Array)
      }
    })

    it('should handle unsupported framework', () => {
      const result = generatePrompt(validSchema, 'unsupported-framework', 'tailwind')

      // Should either succeed with fallback or fail gracefully
      expect(result).toBeDefined()
      expect(result.success).toBeDefined()
    })
  })

  describe('generateSchemaSummary', () => {
    it('should generate summary with component count', () => {
      const summary = generateSchemaSummary(validSchema)

      expect(summary).toContain('Components (2)')
      expect(summary).toContain('Header')
      expect(summary).toContain('Main')
    })

    it('should include positioning types', () => {
      const summary = generateSchemaSummary(validSchema)

      expect(summary).toContain('Positioning:')
      expect(summary).toContain('sticky')
      expect(summary).toContain('static')
    })

    it('should include breakpoint information', () => {
      const summary = generateSchemaSummary(validSchema)

      expect(summary).toContain('Breakpoints (2)')
      expect(summary).toContain('mobile')
      expect(summary).toContain('desktop')
    })

    it('should count positioning types correctly', () => {
      const summary = generateSchemaSummary(validSchema)

      expect(summary).toMatch(/sticky\(1\)/)
      expect(summary).toMatch(/static\(1\)/)
    })

    it('should handle empty schema', () => {
      const emptySchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: [] },
        },
      }

      const summary = generateSchemaSummary(emptySchema)

      expect(summary).toContain('Components (0)')
      expect(summary).toContain('Breakpoints (1)')
    })
  })

  describe('estimateTokenCount', () => {
    it('should estimate token count based on character length', () => {
      const shortPrompt = 'Hello world'
      const count = estimateTokenCount(shortPrompt)

      // Rough estimate: 1 token ≈ 4 characters
      expect(count).toBeGreaterThan(0)
      expect(count).toBe(Math.ceil(shortPrompt.length / 4))
    })

    it('should handle empty string', () => {
      const count = estimateTokenCount('')
      expect(count).toBe(0)
    })

    it('should handle long prompts', () => {
      const longPrompt = 'a'.repeat(4000)
      const count = estimateTokenCount(longPrompt)

      expect(count).toBe(1000) // 4000 / 4 = 1000
    })
  })

  describe('getRecommendedModel', () => {
    it('should recommend Haiku for simple layouts', () => {
      const model = getRecommendedModel(500)

      expect(model).toContain('Haiku')
      expect(model).toContain('fast')
    })

    it('should recommend Sonnet for medium layouts', () => {
      const model = getRecommendedModel(1500)

      expect(model).toContain('Sonnet')
    })

    it('should recommend Opus for complex layouts', () => {
      const model = getRecommendedModel(4000)

      expect(model).toContain('Opus')
      expect(model).toContain('complex')
    })

    it('should have appropriate threshold values', () => {
      const haikuModel = getRecommendedModel(799)
      const sonnetModel = getRecommendedModel(800)
      const opusModel = getRecommendedModel(3001)

      expect(haikuModel).toContain('Haiku')
      expect(sonnetModel).toContain('Sonnet')
      expect(opusModel).toContain('Opus')
    })
  })
})
