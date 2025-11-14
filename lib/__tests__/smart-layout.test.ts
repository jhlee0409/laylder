/**
 * Smart Layout Unit Tests
 */

import { describe, it, expect } from 'vitest'
import {
  calculateSmartPosition,
  findEmptySlot,
  getRecommendedSize,
} from '../smart-layout'
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
        description: 'Test header',
        category: 'layout',
        icon: 'LayoutHeader',
        template: {
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex', flex: { direction: 'row' } },
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
        description: 'Test footer',
        category: 'layout',
        icon: 'LayoutFooter',
        template: {
          name: 'Footer',
          semanticTag: 'footer',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'row' } },
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
        description: 'Test navbar',
        category: 'navigation',
        icon: 'Navigation',
        template: {
          name: 'Navbar',
          semanticTag: 'nav',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex', flex: { direction: 'row' } },
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
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      }

      const navTemplate: ComponentTemplate = {
        id: 'horizontal-navbar',
        name: 'Horizontal Navbar',
        description: 'Test navbar',
        category: 'navigation',
        icon: 'Navigation',
        template: {
          name: 'Navbar',
          semanticTag: 'nav',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex', flex: { direction: 'row' } },
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
        description: 'Test sidebar',
        category: 'navigation',
        icon: 'Sidebar',
        template: {
          name: 'Sidebar',
          semanticTag: 'aside',
          positioning: { type: 'sticky', position: { top: 64 } },
          layout: { type: 'flex', flex: { direction: 'column' } },
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
        positioning: { type: 'sticky', position: { top: 64 } },
        layout: { type: 'flex', flex: { direction: 'column' } },
        canvasLayout: { x: 0, y: 0, width: 3, height: 8 },
      }

      const sidebarTemplate: ComponentTemplate = {
        id: 'right-sidebar',
        name: 'Right Sidebar',
        description: 'Test sidebar',
        category: 'navigation',
        icon: 'Sidebar',
        template: {
          name: 'RightSidebar',
          semanticTag: 'aside',
          positioning: { type: 'sticky', position: { top: 64 } },
          layout: { type: 'flex', flex: { direction: 'column' } },
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
        description: 'Test header',
        category: 'layout',
        icon: 'LayoutHeader',
        template: {
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex', flex: { direction: 'row' } },
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

    it('should place main content in center with no sidebars', () => {
      const mainTemplate: ComponentTemplate = {
        id: 'main-content',
        name: 'Main Content',
        description: 'Test main',
        category: 'layout',
        icon: 'LayoutMain',
        template: {
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
          canvasLayout: { x: 0, y: 0, width: 12, height: 8 },
        },
      }

      const position = calculateSmartPosition(
        mainTemplate,
        gridCols,
        gridRows,
        [],
        'desktop'
      )

      expect(position.x).toBe(0)
      expect(position.width).toBe(gridCols)
    })

    it('should place main content beside left sidebar', () => {
      const leftSidebar: Component = {
        id: 'c1',
        name: 'LeftSidebar',
        semanticTag: 'aside',
        positioning: { type: 'sticky', position: { top: 64 } },
        layout: { type: 'flex', flex: { direction: 'column' } },
        canvasLayout: { x: 0, y: 0, width: 3, height: 8 },
      }

      const mainTemplate: ComponentTemplate = {
        id: 'main-content',
        name: 'Main Content',
        description: 'Test main',
        category: 'layout',
        icon: 'LayoutMain',
        template: {
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
          canvasLayout: { x: 3, y: 0, width: 9, height: 8 },
        },
      }

      const position = calculateSmartPosition(
        mainTemplate,
        gridCols,
        gridRows,
        [leftSidebar],
        'desktop'
      )

      expect(position.x).toBe(3) // After left sidebar
      expect(position.width).toBe(9) // Remaining space
    })

    it('should place main content between two sidebars', () => {
      const leftSidebar: Component = {
        id: 'c1',
        name: 'LeftSidebar',
        semanticTag: 'aside',
        positioning: { type: 'sticky', position: { top: 64 } },
        layout: { type: 'flex', flex: { direction: 'column' } },
        canvasLayout: { x: 0, y: 0, width: 3, height: 8 },
      }

      const rightSidebar: Component = {
        id: 'c2',
        name: 'RightSidebar',
        semanticTag: 'aside',
        positioning: { type: 'sticky', position: { top: 64 } },
        layout: { type: 'flex', flex: { direction: 'column' } },
        canvasLayout: { x: 9, y: 0, width: 3, height: 8 },
      }

      const mainTemplate: ComponentTemplate = {
        id: 'main-content',
        name: 'Main Content',
        description: 'Test main',
        category: 'layout',
        icon: 'LayoutMain',
        template: {
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
          canvasLayout: { x: 3, y: 0, width: 6, height: 8 },
        },
      }

      const position = calculateSmartPosition(
        mainTemplate,
        gridCols,
        gridRows,
        [leftSidebar, rightSidebar],
        'desktop'
      )

      expect(position.x).toBe(3) // After left sidebar
      expect(position.width).toBe(6) // Between sidebars (9 - 3)
    })

    it('should place main below header and above footer', () => {
      const header: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      }

      const footer: Component = {
        id: 'c2',
        name: 'Footer',
        semanticTag: 'footer',
        positioning: { type: 'static' },
        layout: { type: 'flex', flex: { direction: 'row' } },
        canvasLayout: { x: 0, y: 7, width: 12, height: 1 },
      }

      const mainTemplate: ComponentTemplate = {
        id: 'main-content',
        name: 'Main Content',
        description: 'Test main',
        category: 'layout',
        icon: 'LayoutMain',
        template: {
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
          canvasLayout: { x: 0, y: 1, width: 12, height: 6 },
        },
      }

      const position = calculateSmartPosition(
        mainTemplate,
        gridCols,
        gridRows,
        [header, footer],
        'desktop'
      )

      expect(position.y).toBe(1) // Below header
      expect(position.height).toBe(6) // Above footer (gridRows - topOffset - bottomOffset)
    })

    it('should place section in empty slot', () => {
      const sectionTemplate: ComponentTemplate = {
        id: 'section-1',
        name: 'Section',
        description: 'Test section',
        category: 'content',
        icon: 'Section',
        template: {
          name: 'Section',
          semanticTag: 'section',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
          canvasLayout: { x: 0, y: 0, width: 1, height: 1 },
        },
      }

      const position = calculateSmartPosition(
        sectionTemplate,
        gridCols,
        gridRows,
        [],
        'desktop'
      )

      expect(position.x).toBe(0)
      expect(position.y).toBe(0)
      expect(position.width).toBe(1)
      expect(position.height).toBe(1)
    })

    it('should find empty slot avoiding collisions', () => {
      const existingComponent: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      }

      const sectionTemplate: ComponentTemplate = {
        id: 'section-1',
        name: 'Section',
        description: 'Test section',
        category: 'content',
        icon: 'Section',
        template: {
          name: 'Section',
          semanticTag: 'section',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
          canvasLayout: { x: 0, y: 1, width: 1, height: 1 },
        },
      }

      const position = calculateSmartPosition(
        sectionTemplate,
        gridCols,
        gridRows,
        [existingComponent],
        'desktop'
      )

      expect(position.y).toBeGreaterThanOrEqual(1) // Below existing component
    })

    it('should place article in empty slot', () => {
      const articleTemplate: ComponentTemplate = {
        id: 'article-1',
        name: 'Article',
        description: 'Test article',
        category: 'content',
        icon: 'Article',
        template: {
          name: 'Article',
          semanticTag: 'article',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
          canvasLayout: { x: 0, y: 0, width: 1, height: 1 },
        },
      }

      const position = calculateSmartPosition(
        articleTemplate,
        gridCols,
        gridRows,
        [],
        'desktop'
      )

      expect(position).toBeDefined()
      expect(position.width).toBeGreaterThan(0)
      expect(position.height).toBeGreaterThan(0)
    })

    it('should place div in empty slot', () => {
      const divTemplate: ComponentTemplate = {
        id: 'div-1',
        name: 'Div',
        description: 'Test div',
        category: 'content',
        icon: 'Div',
        template: {
          name: 'Div',
          semanticTag: 'div',
          positioning: { type: 'static' },
          layout: { type: 'none' },
          canvasLayout: { x: 0, y: 0, width: 1, height: 1 },
        },
      }

      const position = calculateSmartPosition(
        divTemplate,
        gridCols,
        gridRows,
        [],
        'desktop'
      )

      expect(position).toBeDefined()
    })

    it('should place form in empty slot', () => {
      const formTemplate: ComponentTemplate = {
        id: 'form-1',
        name: 'Form',
        description: 'Test form',
        category: 'form',
        icon: 'Form',
        template: {
          name: 'Form',
          semanticTag: 'form',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
          canvasLayout: { x: 0, y: 0, width: 1, height: 1 },
        },
      }

      const position = calculateSmartPosition(
        formTemplate,
        gridCols,
        gridRows,
        [],
        'desktop'
      )

      expect(position).toBeDefined()
    })
  })

  describe('findEmptySlot', () => {
    const gridCols = 12
    const gridRows = 8

    it('should find empty slot in empty grid', () => {
      const slot = findEmptySlot([], gridCols, gridRows, 'desktop', 2, 2)

      expect(slot.x).toBe(0)
      expect(slot.y).toBe(0)
      expect(slot.width).toBe(2)
      expect(slot.height).toBe(2)
    })

    it('should find empty slot avoiding existing component', () => {
      const existingComponent: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
      }

      const slot = findEmptySlot([existingComponent], gridCols, gridRows, 'desktop', 2, 2)

      expect(slot.y).toBeGreaterThanOrEqual(1) // Below header
    })

    it('should place below existing components when no empty slot available', () => {
      // Fill most of the grid
      const components: Component[] = [
        {
          id: 'c1',
          name: 'Header',
          semanticTag: 'header',
          positioning: { type: 'sticky', position: { top: 0 } },
          layout: { type: 'flex', flex: { direction: 'row' } },
          canvasLayout: { x: 0, y: 0, width: 12, height: 3 },
        },
        {
          id: 'c2',
          name: 'Main',
          semanticTag: 'main',
          positioning: { type: 'static' },
          layout: { type: 'flex', flex: { direction: 'column' } },
          canvasLayout: { x: 0, y: 3, width: 12, height: 3 },
        },
      ]

      const slot = findEmptySlot(components, gridCols, gridRows, 'desktop', 12, 2)

      // Should be placed below existing components
      expect(slot.y).toBe(6) // After header (3) + main (3)
      expect(slot.x).toBe(0)
    })

    it('should handle responsive canvas layout', () => {
      const componentWithResponsive: Component = {
        id: 'c1',
        name: 'Header',
        semanticTag: 'header',
        positioning: { type: 'sticky', position: { top: 0 } },
        layout: { type: 'flex', flex: { direction: 'row' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 0, width: 4, height: 2 },
          tablet: { x: 0, y: 0, width: 8, height: 1 },
          desktop: { x: 0, y: 0, width: 12, height: 1 },
        },
      }

      const slot = findEmptySlot([componentWithResponsive], 4, 8, 'mobile', 2, 2)

      expect(slot.y).toBeGreaterThanOrEqual(2) // Mobile header takes 2 rows
    })

    it('should return (0,0) when no existing components', () => {
      const slot = findEmptySlot([], gridCols, gridRows, 'desktop', 1, 1)

      expect(slot.x).toBe(0)
      expect(slot.y).toBe(0)
    })

    it('should constrain position within grid bounds', () => {
      const largeComponent: Component = {
        id: 'c1',
        name: 'Large',
        semanticTag: 'main',
        positioning: { type: 'static' },
        layout: { type: 'flex', flex: { direction: 'column' } },
        canvasLayout: { x: 0, y: 0, width: 12, height: 7 },
      }

      const slot = findEmptySlot([largeComponent], gridCols, gridRows, 'desktop', 12, 3)

      // Should be constrained within grid
      expect(slot.y + slot.height).toBeLessThanOrEqual(gridRows)
    })
  })

  describe('getRecommendedSize', () => {
    const gridCols = 12
    const gridRows = 8

    it('should return full width for header', () => {
      const size = getRecommendedSize('header', gridCols, gridRows)

      expect(size.width).toBe(12)
      expect(size.height).toBe(1)
    })

    it('should return full width for footer', () => {
      const size = getRecommendedSize('footer', gridCols, gridRows)

      expect(size.width).toBe(12)
      expect(size.height).toBe(1)
    })

    it('should return full width for nav', () => {
      const size = getRecommendedSize('nav', gridCols, gridRows)

      expect(size.width).toBe(12)
      expect(size.height).toBe(1)
    })

    it('should return sidebar size for aside', () => {
      const size = getRecommendedSize('aside', gridCols, gridRows)

      expect(size.width).toBe(3) // gridCols / 4
      expect(size.height).toBe(6) // gridRows - 2
    })

    it('should return main content size for main', () => {
      const size = getRecommendedSize('main', gridCols, gridRows)

      expect(size.width).toBe(9) // gridCols * 0.75
      expect(size.height).toBe(6) // gridRows - 2
    })

    it('should return medium size for section', () => {
      const size = getRecommendedSize('section', gridCols, gridRows)

      expect(size.width).toBe(6) // gridCols / 2
      expect(size.height).toBe(2) // gridRows / 3 (floor)
    })

    it('should return medium size for article', () => {
      const size = getRecommendedSize('article', gridCols, gridRows)

      expect(size.width).toBe(6) // gridCols / 2
      expect(size.height).toBe(2) // gridRows / 3 (floor)
    })

    it('should return small size for div', () => {
      const size = getRecommendedSize('div', gridCols, gridRows)

      expect(size.width).toBe(1)
      expect(size.height).toBe(1)
    })

    it('should return small size for form', () => {
      const size = getRecommendedSize('form', gridCols, gridRows)

      expect(size.width).toBe(1)
      expect(size.height).toBe(1)
    })

    it('should handle small grid for aside', () => {
      const size = getRecommendedSize('aside', 4, 8)

      expect(size.width).toBe(1) // min(3, floor(4/4)) = 1
      expect(size.height).toBe(6)
    })

    it('should handle small grid for main', () => {
      const size = getRecommendedSize('main', 4, 4)

      expect(size.width).toBe(3) // max(1, floor(4 * 0.75)) = 3
      expect(size.height).toBe(2) // max(1, 4 - 2) = 2
    })

    it('should ensure minimum size of 1x1', () => {
      const size = getRecommendedSize('section', 2, 2)

      expect(size.width).toBeGreaterThanOrEqual(1)
      expect(size.height).toBeGreaterThanOrEqual(1)
    })
  })
})
