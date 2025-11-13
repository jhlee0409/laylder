/**
 * Smart Layout Unit Tests
 */

import { describe, it, expect } from 'vitest'
import { calculateSmartPosition } from '../smart-layout'
import type { Component } from '@/types/schema'
import type { ComponentTemplate } from '@/lib/component-library'

describe('Smart Layout', () => {
  describe('calculateSmartPosition', () => {
    const gridCols = 12
    const gridRows = 8

    it('should place header at top with full width', () => {
      const headerTemplate: ComponentTemplate = {
        id: 'sticky-header',
        name: 'Sticky Header',
        category: 'layout',
        template: {
          id: 'temp-id',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        },
      }

      const position = calculateSmartPosition(
        headerTemplate,
        gridCols,
        gridRows,
        [],
        'desktop'
      )

      expect(position.x).toBe(0)
      expect(position.y).toBe(0)
      expect(position.width).toBe(gridCols)
      expect(position.height).toBe(1)
    })

    it('should place footer at bottom with full width', () => {
      const footerTemplate: ComponentTemplate = {
        id: 'static-footer',
        name: 'Footer',
        category: 'layout',
        template: {
          id: 'temp-id',
          name: 'Footer',
          semanticTag: 'footer',
          positioning: { type: 'static' },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 7, width: 12, height: 1 },
        },
      }

      const position = calculateSmartPosition(
        footerTemplate,
        gridCols,
        gridRows,
        [],
        'desktop'
      )

      expect(position.x).toBe(0)
      expect(position.y).toBe(gridRows - 1)
      expect(position.width).toBe(gridCols)
      expect(position.height).toBe(1)
    })

    it('should place nav at top when no header exists', () => {
      const navTemplate: ComponentTemplate = {
        id: 'horizontal-navbar',
        name: 'Horizontal Navbar',
        category: 'navigation',
        template: {
          id: 'temp-id',
          name: 'Navbar',
          semanticTag: 'nav',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        },
      }

      const position = calculateSmartPosition(
        navTemplate,
        gridCols,
        gridRows,
        [],
        'desktop'
      )

      expect(position.x).toBe(0)
      expect(position.y).toBe(0)
      expect(position.width).toBe(gridCols)
    })

    it('should place nav below header when header exists', () => {
      const existingHeader: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', top: 0 },
        layout: { type: 'flex', direction: 'row' },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      }

      const navTemplate: ComponentTemplate = {
        id: 'horizontal-navbar',
        name: 'Horizontal Navbar',
        category: 'navigation',
        template: {
          id: 'temp-id',
          name: 'Navbar',
          semanticTag: 'nav',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 1, width: 12, height: 1 },
        },
      }

      const position = calculateSmartPosition(
        navTemplate,
        gridCols,
        gridRows,
        [existingHeader],
        'desktop'
      )

      expect(position.y).toBe(1) // Below header
    })

    it('should place sidebar on left side with appropriate width', () => {
      const sidebarTemplate: ComponentTemplate = {
        id: 'left-sidebar',
        name: 'Left Sidebar',
        category: 'navigation',
        template: {
          id: 'temp-id',
          name: 'Sidebar',
          semanticTag: 'aside',
          positioning: { type: 'sticky', top: 64 },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 0, y: 0, width: 3, height: 8 },
        },
      }

      const position = calculateSmartPosition(
        sidebarTemplate,
        gridCols,
        gridRows,
        [],
        'desktop'
      )

      expect(position.x).toBe(0) // Left side
      expect(position.width).toBeLessThanOrEqual(Math.floor(gridCols / 4))
      expect(position.height).toBeGreaterThan(0)
    })

    it('should place second sidebar on right side when left is occupied', () => {
      const existingSidebar: Component = {
        id: 'c1',
        name: 'LeftSidebar',
        semanticTag: 'aside',
        positioning: { type: 'sticky', top: 64 },
        layout: { type: 'flex', direction: 'column' },
        canvasLayout: { x: 0, y: 0, width: 3, height: 8 },
      }

      const sidebarTemplate: ComponentTemplate = {
        id: 'right-sidebar',
        name: 'Right Sidebar',
        category: 'navigation',
        template: {
          id: 'temp-id',
          name: 'RightSidebar',
          semanticTag: 'aside',
          positioning: { type: 'sticky', top: 64 },
          layout: { type: 'flex', direction: 'column' },
          canvasLayout: { x: 9, y: 0, width: 3, height: 8 },
        },
      }

      const position = calculateSmartPosition(
        sidebarTemplate,
        gridCols,
        gridRows,
        [existingSidebar],
        'desktop'
      )

      expect(position.x).toBeGreaterThan(gridCols / 2) // Right side
    })

    it('should handle mobile grid size correctly', () => {
      const mobileGridCols = 4
      const mobileGridRows = 8

      const headerTemplate: ComponentTemplate = {
        id: 'sticky-header',
        name: 'Sticky Header',
        category: 'layout',
        template: {
          id: 'temp-id',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', top: 0 },
          layout: { type: 'flex', direction: 'row' },
          canvasLayout: { x: 0, y: 0, width: 4, height: 1 },
        },
      }

      const position = calculateSmartPosition(
        headerTemplate,
        mobileGridCols,
        mobileGridRows,
        [],
        'mobile'
      )

      expect(position.width).toBe(mobileGridCols) // Full width on mobile
    })
  })
})
