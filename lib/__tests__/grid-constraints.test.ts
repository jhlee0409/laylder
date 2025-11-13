/**
 * Grid Constraints Unit Tests
 */

import { describe, it, expect } from 'vitest'
import {
  calculateMinimumGridSize,
  isGridResizeSafe,
} from '../grid-constraints'
import type { Component } from '@/types/schema'

describe('Grid Constraints', () => {
  describe('calculateMinimumGridSize', () => {
    it('should return default minimum for empty canvas', () => {
      const result = calculateMinimumGridSize([], 'mobile')

      expect(result.minRows).toBe(2)
      expect(result.minCols).toBe(2)
    })

    it('should calculate minimum based on component positions', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        },
        {
          id: 'c2',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 0, y: 1, width: 12, height: 6 },
        },
      ]

      const result = calculateMinimumGridSize(components, 'mobile')

      // Header ends at y=1, Main ends at y=7
      expect(result.minRows).toBe(7) // y + height = 1 + 6
      expect(result.minCols).toBe(12) // x + width = 0 + 12
    })

    it('should handle components with different widths', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Sidebar',
          semanticTag: 'aside',
          positioning: { type: 'sticky', top: 64 },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 0, y: 0, width: 3, height: 8 },
        },
        {
          id: 'c2',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 3, y: 0, width: 9, height: 8 },
        },
      ]

      const result = calculateMinimumGridSize(components, 'desktop')

      expect(result.minRows).toBe(8)
      expect(result.minCols).toBe(12) // 3 + 9
    })

    it('should use responsive canvas layout for current breakpoint', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
          responsiveCanvasLayout: {
            mobile: { x: 0, y: 0, width: 4, height: 2 },
            tablet: { x: 0, y: 0, width: 8, height: 1 },
            desktop: { x: 0, y: 0, width: 12, height: 1 },
          },
        },
      ]

      const mobileResult = calculateMinimumGridSize(components, 'mobile')
      expect(mobileResult.minCols).toBe(4)
      expect(mobileResult.minRows).toBe(2)

      const desktopResult = calculateMinimumGridSize(components, 'desktop')
      expect(desktopResult.minCols).toBe(12)
      expect(desktopResult.minRows).toBe(1)
    })
  })

  describe('isGridResizeSafe', () => {
    it('should allow resize when no components would be cut off', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 0, width: 10, height: 1 },
        },
      ]

      const result = isGridResizeSafe(10, 12, components, 'desktop')

      expect(result.safe).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should reject resize when components would be cut off vertically', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Footer',
          semanticTag: 'footer',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 9, width: 12, height: 1 },
        },
      ]

      const result = isGridResizeSafe(8, 12, components, 'desktop')

      expect(result.safe).toBe(false)
      expect(result.reason).toBeDefined()
      expect(result.affectedComponents).toHaveLength(1)
      expect(result.affectedComponents?.[0].id).toBe('c1')
    })

    it('should reject resize when components would be cut off horizontally', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 0, y: 0, width: 12, height: 8 },
        },
      ]

      const result = isGridResizeSafe(10, 10, components, 'desktop')

      expect(result.safe).toBe(false)
      expect(result.reason).toBeDefined()
      expect(result.affectedComponents).toHaveLength(1)
    })

    it('should provide minimum required grid size when resize is unsafe', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 0, y: 0, width: 12, height: 8 },
        },
      ]

      const result = isGridResizeSafe(5, 5, components, 'desktop')

      expect(result.safe).toBe(false)
      expect(result.minimumRequired).toBeDefined()
      expect(result.minimumRequired?.rows).toBe(8)
      expect(result.minimumRequired?.cols).toBe(12)
    })

    it('should allow resize for empty canvas', () => {
      const result = isGridResizeSafe(4, 4, [], 'mobile')

      expect(result.safe).toBe(true)
    })

    it('should detect multiple affected components', () => {
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Sidebar',
          semanticTag: 'aside',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 0, y: 4, width: 3, height: 4 }, // ends at row 8
        },
        {
          id: 'c2',
          name: 'Footer',
          semanticTag: 'footer',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 9, width: 12, height: 1 }, // ends at row 10
        },
      ]

      const result = isGridResizeSafe(7, 12, components, 'desktop')

      expect(result.safe).toBe(false)
      expect(result.affectedComponents).toHaveLength(2)
    })
  })
})
