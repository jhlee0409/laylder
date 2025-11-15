/**
 * Test: Canvas Layout Inheritance when adding new breakpoint
 *
 * Verifies that normalizeSchema() in addBreakpoint correctly inherits
 * responsiveCanvasLayout but NOT layout.components
 */

import { describe, it, expect } from 'vitest'
import type { LaydlerSchema } from '@/types/schema'
import { normalizeSchema } from '../schema-utils'

describe('Canvas Layout Inheritance via normalizeSchema', () => {
  it('should inherit responsiveCanvasLayout for new breakpoint', () => {
    // Initial: mobile and desktop, c1 has Canvas layout for mobile only
    const schema: LaydlerSchema = {
      schemaVersion: '2.0',
      components: [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex' },
          responsiveCanvasLayout: {
            mobile: { x: 0, y: 0, width: 4, height: 1 },
            // desktop: not defined
          },
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

    const c1 = normalized.components.find(c => c.id === 'c1')!

    console.log('\n=== Canvas Layout Inheritance ===')
    console.log('mobile Canvas:', c1.responsiveCanvasLayout?.mobile)
    console.log('desktop Canvas:', c1.responsiveCanvasLayout?.desktop)

    // ✅ EXPECTED: desktop inherits Canvas layout from mobile
    expect(c1.responsiveCanvasLayout?.desktop).toEqual({ x: 0, y: 0, width: 4, height: 1 })

    // ✅ EXPECTED: BUT layout.components does NOT inherit (desktop stays empty)
    expect(normalized.layouts.desktop.components).toEqual([])
  })

  it('should NOT overwrite explicit Canvas layout', () => {
    // c1 has DIFFERENT Canvas layouts for mobile and desktop
    const schema: LaydlerSchema = {
      schemaVersion: '2.0',
      components: [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex' },
          responsiveCanvasLayout: {
            mobile: { x: 0, y: 0, width: 4, height: 1 },
            desktop: { x: 0, y: 0, width: 12, height: 1 }, // Explicit desktop layout
          },
        },
      ],
      breakpoints: [
        { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
        { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
      ],
      layouts: {
        mobile: { structure: 'vertical', components: ['c1'] },
        desktop: { structure: 'vertical', components: [] },
      },
    }

    const normalized = normalizeSchema(schema)
    const c1 = normalized.components.find(c => c.id === 'c1')!

    // ✅ EXPECTED: Desktop Canvas layout is NOT overwritten (keeps explicit value)
    expect(c1.responsiveCanvasLayout?.desktop).toEqual({ x: 0, y: 0, width: 12, height: 1 })
    expect(c1.responsiveCanvasLayout?.desktop?.width).toBe(12) // Not 4 (from mobile)
  })

  it('should demonstrate correct behavior when adding new breakpoint', () => {
    // Simulate addBreakpoint workflow
    let schema: LaydlerSchema = {
      schemaVersion: '2.0',
      components: [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex' },
          responsiveCanvasLayout: {
            mobile: { x: 0, y: 0, width: 4, height: 1 },
          },
        },
        {
          id: 'c2',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex' },
          responsiveCanvasLayout: {
            mobile: { x: 0, y: 1, width: 4, height: 6 },
          },
        },
      ],
      breakpoints: [
        { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
      ],
      layouts: {
        mobile: { structure: 'vertical', components: ['c1', 'c2'] },
      },
    }

    console.log('\n=== Before adding laptop breakpoint ===')
    console.log('Breakpoints:', schema.breakpoints.map(bp => bp.name))
    console.log('Mobile components:', schema.layouts.mobile.components)

    // Step 1: User adds new breakpoint "laptop"
    schema = {
      ...schema,
      breakpoints: [
        ...schema.breakpoints,
        { name: 'laptop', minWidth: 1440, gridCols: 10, gridRows: 10 },
      ].sort((a, b) => a.minWidth - b.minWidth),
      layouts: {
        ...schema.layouts,
        laptop: { structure: 'vertical', components: [] }, // Empty layout
      },
    }

    // Step 2: Call normalizeSchema (like addBreakpoint does)
    const normalized = normalizeSchema(schema)

    console.log('\n=== After normalizeSchema ===')
    console.log('Breakpoints:', normalized.breakpoints.map(bp => bp.name))
    console.log('Mobile components:', normalized.layouts.mobile.components)
    console.log('Laptop components:', normalized.layouts.laptop.components)

    const c1 = normalized.components.find(c => c.id === 'c1')!
    const c2 = normalized.components.find(c => c.id === 'c2')!

    console.log('c1 mobile Canvas:', c1.responsiveCanvasLayout?.mobile)
    console.log('c1 laptop Canvas:', c1.responsiveCanvasLayout?.laptop)
    console.log('c2 mobile Canvas:', c2.responsiveCanvasLayout?.mobile)
    console.log('c2 laptop Canvas:', c2.responsiveCanvasLayout?.laptop)

    // ✅ CORRECT: layout.components NOT inherited (laptop is still empty)
    expect(normalized.layouts.laptop.components).toEqual([])

    // ✅ CORRECT: Canvas layouts ARE inherited
    expect(c1.responsiveCanvasLayout?.laptop).toEqual({ x: 0, y: 0, width: 4, height: 1 })
    expect(c2.responsiveCanvasLayout?.laptop).toEqual({ x: 0, y: 1, width: 4, height: 6 })
  })
})
