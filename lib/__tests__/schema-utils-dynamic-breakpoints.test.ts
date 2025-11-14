/**
 * Unit Tests: Dynamic Breakpoint Support in normalizeSchema()
 *
 * Tests for PR #14 improvements:
 * - Custom breakpoint names (not just mobile/tablet/desktop)
 * - Layout inheritance logic
 * - Edge case: intentionally empty layouts
 * - structuredClone() deep cloning
 */

import { describe, it, expect } from 'vitest'
import { normalizeSchema, createEmptySchema } from '../schema-utils'
import type { LaydlerSchema } from '@/types/schema'

describe('normalizeSchema - Dynamic Breakpoint Support', () => {
  describe('Custom breakpoint names', () => {
    it('should support capital letters in breakpoint names (e.g., Desktop)', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'Mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'Desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          Mobile: { structure: 'vertical', components: ['c1'] },
          // Desktop layout missing - should inherit from Mobile
        },
      }

      const normalized = normalizeSchema(schema)

      // Desktop should inherit from Mobile
      expect(normalized.layouts.Desktop).toBeDefined()
      expect(normalized.layouts.Desktop.structure).toBe('vertical')
      expect(normalized.layouts.Desktop.components).toEqual(['c1'])
    })

    it('should support arbitrary custom breakpoint names', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'Phone', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'Tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'LaptopXL', minWidth: 1440, gridCols: 16, gridRows: 10 },
        ],
        layouts: {
          Phone: { structure: 'vertical', components: ['c1'] },
          // Tablet and LaptopXL missing - should inherit
        },
      }

      const normalized = normalizeSchema(schema)

      expect(normalized.layouts.Tablet).toBeDefined()
      expect(normalized.layouts.Tablet.components).toEqual(['c1'])
      expect(normalized.layouts.LaptopXL).toBeDefined()
      expect(normalized.layouts.LaptopXL.components).toEqual(['c1'])
    })

    it('should handle mixed case breakpoint names', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'smallScreen', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'MediumScreen', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'LARGE_SCREEN', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          smallScreen: { structure: 'vertical', components: ['c1'] },
        },
      }

      const normalized = normalizeSchema(schema)

      expect(normalized.layouts.MediumScreen).toBeDefined()
      expect(normalized.layouts.LARGE_SCREEN).toBeDefined()
    })
  })

  describe('Layout inheritance logic', () => {
    it('should inherit layout from previous breakpoint when missing', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
          {
            id: 'c2',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1', 'c2'] },
          // tablet and desktop missing
        },
      }

      const normalized = normalizeSchema(schema)

      // Tablet inherits from mobile
      expect(normalized.layouts.tablet).toBeDefined()
      expect(normalized.layouts.tablet.structure).toBe('vertical')
      expect(normalized.layouts.tablet.components).toEqual(['c1', 'c2'])

      // Desktop inherits from tablet (which inherited from mobile)
      expect(normalized.layouts.desktop).toBeDefined()
      expect(normalized.layouts.desktop.structure).toBe('vertical')
      expect(normalized.layouts.desktop.components).toEqual(['c1', 'c2'])
    })

    it('should NOT overwrite existing layout even if different structure', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Sidebar',
            semanticTag: 'aside',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
          {
            id: 'c2',
            name: 'Main',
            semanticTag: 'main',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c2'] },
          desktop: { structure: 'sidebar-main', components: ['c1', 'c2'] },
        },
      }

      const normalized = normalizeSchema(schema)

      // Desktop should NOT be overwritten
      expect(normalized.layouts.desktop.structure).toBe('sidebar-main')
      expect(normalized.layouts.desktop.components).toEqual(['c1', 'c2'])
    })
  })

  describe('Edge case: Intentionally empty layouts', () => {
    it('should PRESERVE intentionally empty layout (not inherit)', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'MobileOnlyNav',
            semanticTag: 'nav',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
          desktop: { structure: 'vertical', components: [] }, // Intentionally empty
        },
      }

      const normalized = normalizeSchema(schema)

      // Desktop layout should remain empty (NOT inherit from mobile)
      expect(normalized.layouts.desktop).toBeDefined()
      expect(normalized.layouts.desktop.components).toEqual([])
      expect(normalized.layouts.desktop.components).not.toEqual(['c1'])
    })

    it('should distinguish between missing and empty layouts', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Component',
            semanticTag: 'div',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'bp1', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'bp2', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'bp3', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          bp1: { structure: 'vertical', components: ['c1'] },
          bp2: { structure: 'vertical', components: [] }, // Intentionally empty
          // bp3 missing entirely
        },
      }

      const normalized = normalizeSchema(schema)

      // bp2 should remain empty (intentional)
      expect(normalized.layouts.bp2.components).toEqual([])

      // bp3 should inherit from bp2 (which is empty)
      // Note: This inherits the empty layout, which is correct behavior
      expect(normalized.layouts.bp3).toBeDefined()
      expect(normalized.layouts.bp3.components).toEqual([])
    })
  })

  describe('Canvas Layout inheritance', () => {
    it('should inherit Canvas Layout for custom breakpoint names', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
            responsiveCanvasLayout: {
              SmallScreen: { x: 0, y: 0, width: 4, height: 1 },
              // LargeScreen missing - should inherit
            },
          },
        ],
        breakpoints: [
          { name: 'SmallScreen', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'LargeScreen', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          SmallScreen: { structure: 'vertical', components: ['c1'] },
          LargeScreen: { structure: 'vertical', components: ['c1'] },
        },
      }

      const normalized = normalizeSchema(schema)

      const component = normalized.components.find((c) => c.id === 'c1')
      expect(component).toBeDefined()
      expect(component!.responsiveCanvasLayout).toBeDefined()
      expect(component!.responsiveCanvasLayout!.LargeScreen).toBeDefined()
      expect(component!.responsiveCanvasLayout!.LargeScreen).toEqual({
        x: 0,
        y: 0,
        width: 4,
        height: 1,
      })
    })

    it('should NOT overwrite existing Canvas Layout', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
            responsiveCanvasLayout: {
              mobile: { x: 0, y: 0, width: 4, height: 1 },
              desktop: { x: 0, y: 0, width: 12, height: 1 }, // Different width
            },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
          desktop: { structure: 'vertical', components: ['c1'] },
        },
      }

      const normalized = normalizeSchema(schema)

      const component = normalized.components.find((c) => c.id === 'c1')
      expect(component!.responsiveCanvasLayout!.desktop).toEqual({
        x: 0,
        y: 0,
        width: 12,
        height: 1,
      })
      expect(component!.responsiveCanvasLayout!.desktop.width).toBe(12)
      expect(component!.responsiveCanvasLayout!.desktop.width).not.toBe(4)
    })
  })

  describe('Deep cloning with structuredClone()', () => {
    it('should use structuredClone() to prevent mutations', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const normalized = normalizeSchema(schema)

      // Mutate normalized schema
      normalized.layouts.mobile.components.push('c2')

      // Original schema should NOT be affected
      expect(schema.layouts.mobile.components).toEqual(['c1'])
      expect(schema.layouts.mobile.components).not.toContain('c2')
    })

    it('should create independent copies of inherited layouts', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const normalized = normalizeSchema(schema)

      // Mutate tablet layout
      normalized.layouts.tablet.components.push('c2')

      // Mobile layout should NOT be affected
      expect(normalized.layouts.mobile.components).toEqual(['c1'])
      expect(normalized.layouts.mobile.components).not.toContain('c2')
    })
  })

  describe('Breakpoint sorting', () => {
    it('should sort breakpoints by minWidth before applying inheritance', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
          { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
        ],
        layouts: {
          mobile: { structure: 'vertical', components: ['c1'] },
        },
      }

      const normalized = normalizeSchema(schema)

      // Tablet should inherit from mobile (not desktop)
      expect(normalized.layouts.tablet.components).toEqual(['c1'])
      // Desktop should inherit from tablet
      expect(normalized.layouts.desktop.components).toEqual(['c1'])
    })

    it('should handle non-standard minWidth values', () => {
      const schema: LaydlerSchema = {
        schemaVersion: '2.0',
        components: [
          {
            id: 'c1',
            name: 'Header',
            semanticTag: 'header',
            positioning: { type: 'static' },
            layout: { type: 'none' },
          },
        ],
        breakpoints: [
          { name: 'xs', minWidth: 0, gridCols: 4, gridRows: 8 },
          { name: 'sm', minWidth: 640, gridCols: 6, gridRows: 8 },
          { name: 'md', minWidth: 768, gridCols: 8, gridRows: 8 },
          { name: 'lg', minWidth: 1024, gridCols: 10, gridRows: 8 },
          { name: 'xl', minWidth: 1280, gridCols: 12, gridRows: 8 },
          { name: '2xl', minWidth: 1536, gridCols: 14, gridRows: 10 },
        ],
        layouts: {
          xs: { structure: 'vertical', components: ['c1'] },
        },
      }

      const normalized = normalizeSchema(schema)

      // All breakpoints should inherit in order
      expect(normalized.layouts.sm.components).toEqual(['c1'])
      expect(normalized.layouts.md.components).toEqual(['c1'])
      expect(normalized.layouts.lg.components).toEqual(['c1'])
      expect(normalized.layouts.xl.components).toEqual(['c1'])
      expect(normalized.layouts['2xl'].components).toEqual(['c1'])
    })
  })
})
