/**
 * Negative Test Cases for Prompt Generation
 *
 * 잘못된 입력, 에러 처리, 예외 상황을 검증
 */

import { describe, it, expect } from 'vitest'
import type { LaydlerSchema } from '@/types/schema'
import { generatePrompt } from '../prompt-generator'
import { validateSchema } from '../schema-validation'

describe('Prompt Generation Negative Tests', () => {
  // ==========================================================================
  // Test 1: Invalid Schema Version
  // ==========================================================================
  describe('Invalid Schema Version', () => {
    it('should reject invalid schema version', () => {
      const invalidSchema = {
        schemaVersion: '1.0', // Invalid: only "2.0" is supported
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['c1'] } },
      } as any

      const result = generatePrompt(invalidSchema, 'react', 'tailwind')

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors!.length).toBeGreaterThan(0)
      expect(result.errors!.some(e => e.includes('version') || e.includes('2.0'))).toBe(true)
    })

    it('should reject missing schema version', () => {
      const invalidSchema = {
        // Missing schemaVersion
        components: [],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: [] } },
      } as any

      const result = generatePrompt(invalidSchema, 'react', 'tailwind')

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })
  })

  // ==========================================================================
  // Test 2: Empty or Invalid Components
  // ==========================================================================
  describe('Empty or Invalid Components', () => {
    it('should reject schema with no components', () => {
      const emptySchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [], // Empty
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: [] } },
      }

      const result = generatePrompt(emptySchema, 'react', 'tailwind')

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors!.some(e => e.includes('component'))).toBe(true)
    })

    it('should reject duplicate component IDs', () => {
      const duplicateSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
          {
            id: 'c1', // Duplicate ID
            name: 'Footer',
            semanticTag: 'footer',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 7, width: 12, height: 1 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['c1'] } },
      }

      const result = generatePrompt(duplicateSchema, 'react', 'tailwind')

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors!.some(e => e.includes('duplicate') || e.includes('c1'))).toBe(true)
    })

    it('should reject invalid component names (not PascalCase)', () => {
      const invalidNameSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'myHeader', // Invalid: should be PascalCase
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['c1'] } },
      }

      const result = generatePrompt(invalidNameSchema, 'react', 'tailwind')

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors!.some(e => e.includes('name') || e.includes('PascalCase'))).toBe(true)
    })
  })

  // ==========================================================================
  // Test 3: Invalid Canvas Layout
  // ==========================================================================
  describe('Invalid Canvas Layout', () => {
    it('should detect negative canvas coordinates', () => {
      const negativeSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Component',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: -1, y: -1, width: 12, height: 1 }, // Negative
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['c1'] } },
      }

      const validationResult = validateSchema(negativeSchema)

      expect(validationResult.valid).toBe(false)
      expect(validationResult.errors.some(e => e.code === 'CANVAS_NEGATIVE_COORDINATE')).toBe(true)
    })

    it('should detect zero-size canvas components', () => {
      const zeroSizeSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Component',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 0, height: 0 }, // Zero size
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['c1'] } },
      }

      const validationResult = validateSchema(zeroSizeSchema)

      expect(validationResult.warnings.some(w => w.code === 'CANVAS_ZERO_SIZE')).toBe(true)
    })

    it('should detect out-of-bounds canvas layout', () => {
      const outOfBoundsSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Component',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 10, y: 5, width: 10, height: 10 }, // Out of bounds (12×8 grid)
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['c1'] } },
      }

      const validationResult = validateSchema(outOfBoundsSchema)

      expect(validationResult.warnings.some(w => w.code === 'CANVAS_OUT_OF_BOUNDS')).toBe(true)
    })

    it('should detect overlapping canvas components', () => {
      const overlappingSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 1, width: 6, height: 4 }, // Left half (0-6)
          },
          {
            id: 'c2',
            name: 'MainContent',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 4, y: 1, width: 8, height: 4 }, // Overlaps: x range 4-12 overlaps with 0-6
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'horizontal', components: ['c1', 'c2'] } },
      }

      const validationResult = validateSchema(overlappingSchema)

      expect(validationResult.warnings.some(w => w.code === 'CANVAS_COMPONENTS_OVERLAP')).toBe(true)
    })
  })

  // ==========================================================================
  // Test 4: Missing or Invalid Breakpoints
  // ==========================================================================
  describe('Missing or Invalid Breakpoints', () => {
    it('should reject schema with empty breakpoints array', () => {
      const noBreakpointsSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [], // Empty
        layouts: {},
      }

      const result = generatePrompt(noBreakpointsSchema, 'react', 'tailwind')

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should reject duplicate breakpoint names', () => {
      const duplicateBreakpointsSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 },
          { name: 'mobile', minWidth: 768, gridCols: 12, gridRows: 8 }, // Duplicate name
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = generatePrompt(duplicateBreakpointsSchema, 'react', 'tailwind')

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should reject negative minWidth values', () => {
      const negativeMinWidthSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: -100, gridCols: 12, gridRows: 8 }, // Negative
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const result = generatePrompt(negativeMinWidthSchema, 'react', 'tailwind')

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })
  })

  // ==========================================================================
  // Test 5: Missing or Invalid Layouts
  // ==========================================================================
  describe('Missing or Invalid Layouts', () => {
    it('should reject missing layout for breakpoint', () => {
      const missingLayoutSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
          // Missing desktop layout
        },
      }

      // Note: generatePrompt() normalizes schema first, which auto-creates missing layouts
      // So we test validation directly to catch the missing layout error
      const validationResult = validateSchema(missingLayoutSchema)

      expect(validationResult.valid).toBe(false)
      expect(validationResult.errors.some(e => e.code === 'MISSING_LAYOUT' && e.field === 'layouts.desktop')).toBe(true)
    })

    it('should reject layout with non-existent component IDs', () => {
      const nonExistentComponentSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1', 'non-existent'] }, // Invalid ID
        },
      }

      const result = generatePrompt(nonExistentComponentSchema, 'react', 'tailwind')

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors!.some(e => e.includes('non-existent'))).toBe(true)
    })
  })

  // ==========================================================================
  // Test 6: Invalid Component Links
  // ==========================================================================
  describe('Invalid Component Links', () => {
    it('should filter out links with non-existent components', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'header',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['header'] } },
      }

      const invalidLinks = [
        { source: 'header', target: 'non-existent' },
        { source: 'invalid', target: 'header' },
      ]

      const result = generatePrompt(schema, 'react', 'tailwind', invalidLinks)

      if (result.success) {
        // Should have warnings about invalid links
        expect(result.warnings).toBeDefined()
        expect(result.warnings!.length).toBeGreaterThan(0)
      } else {
        // Or should fail with errors
        expect(result.errors).toBeDefined()
        expect(result.errors!.some(e => e.includes('invalid'))).toBe(true)
      }
    })

    it('should reject self-referencing component links', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'header',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: { mobile: { structure: 'vertical', components: ['header'] } },
      }

      const selfLinks = [
        { source: 'header', target: 'header' }, // Self-reference
      ]

      const result = generatePrompt(schema, 'react', 'tailwind', selfLinks)

      if (result.success) {
        expect(result.warnings).toBeDefined()
      } else {
        expect(result.errors).toBeDefined()
      }
    })
  })

  // ==========================================================================
  // Test 7: Malformed Layout Configurations
  // ==========================================================================
  describe('Malformed Layout Configurations', () => {
    it('should warn when horizontal structure uses column direction', () => {
      const mismatchSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'flex', flex: { direction: 'column' } },
            canvasLayout: { x: 0, y: 0, width: 12, height: 8 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: {
            structure: 'horizontal',
            components: ['c1'],
            containerLayout: {
              type: 'flex',
              flex: { direction: 'column' }, // Mismatch: horizontal structure with column direction
            },
          },
        },
      }

      const validationResult = validateSchema(mismatchSchema)

      expect(validationResult.warnings.some(w =>
        w.code === 'HORIZONTAL_STRUCTURE_NOT_ROW'
      )).toBe(true)
    })

    it('should warn when sidebar-main structure lacks roles', () => {
      const noRolesSchema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'sidebar',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'sticky', position: { top: 0 } },
            layout: { type: 'flex' },
            canvasLayout: { x: 0, y: 0, width: 3, height: 8 },
          },
          {
            id: 'main',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'flex' },
            canvasLayout: { x: 3, y: 0, width: 9, height: 8 },
          },
        ],
        breakpoints: [{ name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 }],
        layouts: {
          mobile: {
            structure: 'sidebar-main',
            components: ['sidebar', 'main'],
            // Missing roles
          },
        },
      }

      const validationResult = validateSchema(noRolesSchema)

      expect(validationResult.warnings.some(w =>
        w.code === 'SIDEBAR_MAIN_WITHOUT_ROLES'
      )).toBe(true)
    })
  })
})
