/**
 * Schema Validation Unit Tests
 */

import { describe, it, expect } from 'vitest'
import {
  validateSchema,
  type ValidationResult,
} from '../schema-validation'
import type { LaydlerSchema, Component } from '@/types/schema'

describe('Schema Validation', () => {
  describe('validateSchema', () => {
    it('should validate a valid schema without errors', () => {
      const validSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: {
              type: 'sticky',
              top: 0,
            },
            layout: {
              type: 'flex',
              direction: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            canvasLayout: {
              x: 0,
              y: 0,
              width: 12,
              height: 1,
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['c1'],
          },
          tablet: {
            structure: 'vertical',
            components: ['c1'],
          },
          desktop: {
            structure: 'vertical',
            components: ['c1'],
          },
        },
      }

      const result = validateSchema(validSchema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid schema version', () => {
      const invalidSchema: LaydlerSchema = {
        schemaVersion: '1.0' as any,
        components: [],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: [],
          },
        },
      }

      const result = validateSchema(invalidSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_VERSION',
          field: 'schemaVersion',
        })
      )
    })

    it('should reject schema with no components', () => {
      const emptySchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: [],
          },
        },
      }

      const result = validateSchema(emptySchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'NO_COMPONENTS',
          field: 'components',
        })
      )
    })

    it('should detect duplicate component IDs', () => {
      const schemaWithDuplicates: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', top: 0 },
            layout: { type: 'flex', direction: 'row' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
          {
            id: 'c1', // Duplicate
            name: 'Footer',
            semanticTag: 'footer',
            positioning: { type: 'static' },
            layout: { type: 'flex', direction: 'row' },
            canvasLayout: { x: 0, y: 7, width: 12, height: 1 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['c1'],
          },
        },
      }

      const result = validateSchema(schemaWithDuplicates)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'DUPLICATE_COMPONENT_ID',
        })
      )
    })

    it('should validate component name is PascalCase', () => {
      const invalidNameSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'myHeader', // Invalid: should be PascalCase
            semanticTag: 'header',
            positioning: { type: 'sticky', top: 0 },
            layout: { type: 'flex', direction: 'row' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['c1'],
          },
        },
      }

      const result = validateSchema(invalidNameSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_COMPONENT_NAME',
          componentId: 'c1',
        })
      )
    })

    it('should detect missing layout for breakpoint', () => {
      const missingLayoutSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', top: 0 },
            layout: { type: 'flex', direction: 'row' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: {
            structure: 'vertical',
            components: ['c1'],
          },
          // Missing desktop layout
        },
      }

      const result = validateSchema(missingLayoutSchema)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_LAYOUT',
          field: 'layouts.desktop',
        })
      )
    })
  })
})
