/**
 * Test Fixtures for Canvas Integration Tests
 *
 * 공통으로 사용되는 테스트 Schema를 재사용 가능한 fixture로 추출
 */

import type { LaydlerSchema, Component } from '@/types/schema'

/**
 * GitHub-style Layout Schema
 * Header + Sidebar (LEFT) + Main (RIGHT)
 */
export const githubStyleSchema: LaydlerSchema = {
  schemaVersion: '2.0',
  components: [
    {
      id: 'header',
      name: 'SiteHeader',
      semanticTag: 'header',
      positioning: { type: 'sticky', position: { top: 0, zIndex: 50 } },
      layout: { type: 'flex', flex: { direction: 'row', justify: 'between' } },
      canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
    },
    {
      id: 'sidebar',
      name: 'Sidebar',
      semanticTag: 'aside',
      positioning: { type: 'sticky', position: { top: '4rem' } },
      layout: { type: 'flex', flex: { direction: 'column' } },
      canvasLayout: { x: 0, y: 1, width: 3, height: 7 },
    },
    {
      id: 'main',
      name: 'MainContent',
      semanticTag: 'main',
      positioning: { type: 'static' },
      layout: { type: 'container', container: { maxWidth: 'xl', centered: true } },
      canvasLayout: { x: 3, y: 1, width: 9, height: 7 },
    },
  ],
  breakpoints: [
    { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
  ],
  layouts: {
    desktop: {
      structure: 'sidebar-main',
      components: ['header', 'sidebar', 'main'],
      roles: { header: 'header', sidebar: 'sidebar', main: 'main' },
    },
  },
}

/**
 * Simple Vertical Layout Schema
 * Header + Main + Footer (vertical stack)
 */
export const simpleVerticalSchema: LaydlerSchema = {
  schemaVersion: '2.0',
  components: [
    {
      id: 'header',
      name: 'Header',
      semanticTag: 'header',
      positioning: { type: 'sticky', position: { top: 0 } },
      layout: { type: 'flex', flex: { direction: 'row' } },
      canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
    },
    {
      id: 'main',
      name: 'Main',
      semanticTag: 'main',
      positioning: { type: 'static' },
      layout: { type: 'container' },
      canvasLayout: { x: 0, y: 1, width: 12, height: 6 },
    },
    {
      id: 'footer',
      name: 'Footer',
      semanticTag: 'footer',
      positioning: { type: 'static' },
      layout: { type: 'flex' },
      canvasLayout: { x: 0, y: 7, width: 12, height: 1 },
    },
  ],
  breakpoints: [
    { name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 },
  ],
  layouts: {
    mobile: { structure: 'vertical', components: ['header', 'main', 'footer'] },
  },
}

/**
 * Three-Column Side-by-Side Schema
 * Card1 + Card2 + Card3 (3 cards in same row)
 */
export const threeColumnSchema: LaydlerSchema = {
  schemaVersion: '2.0',
  components: [
    {
      id: 'card1',
      name: 'Card1',
      semanticTag: 'article',
      positioning: { type: 'static' },
      layout: { type: 'flex', flex: { direction: 'column' } },
      canvasLayout: { x: 0, y: 0, width: 4, height: 3 },
    },
    {
      id: 'card2',
      name: 'Card2',
      semanticTag: 'article',
      positioning: { type: 'static' },
      layout: { type: 'flex', flex: { direction: 'column' } },
      canvasLayout: { x: 4, y: 0, width: 4, height: 3 },
    },
    {
      id: 'card3',
      name: 'Card3',
      semanticTag: 'article',
      positioning: { type: 'static' },
      layout: { type: 'flex', flex: { direction: 'column' } },
      canvasLayout: { x: 8, y: 0, width: 4, height: 3 },
    },
  ],
  breakpoints: [
    { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
  ],
  layouts: {
    desktop: { structure: 'horizontal', components: ['card1', 'card2', 'card3'] },
  },
}

/**
 * Single Component Schema (minimal)
 */
export const singleComponentSchema: LaydlerSchema = {
  schemaVersion: '2.0',
  components: [
    {
      id: 'only-one',
      name: 'OnlyComponent',
      semanticTag: 'div',
      positioning: { type: 'static' },
      layout: { type: 'flex' },
      canvasLayout: { x: 0, y: 0, width: 12, height: 8 },
    },
  ],
  breakpoints: [
    { name: 'mobile', minWidth: 0, gridCols: 12, gridRows: 8 },
  ],
  layouts: {
    mobile: { structure: 'vertical', components: ['only-one'] },
  },
}

/**
 * Multi-Breakpoint Schema with Responsive Canvas Layout
 */
export const multiBreakpointSchema: LaydlerSchema = {
  schemaVersion: '2.0',
  components: [
    {
      id: 'header',
      name: 'Header',
      semanticTag: 'header',
      positioning: { type: 'sticky', position: { top: 0 } },
      layout: { type: 'flex' },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 0, width: 4, height: 1 },
        tablet: { x: 0, y: 0, width: 8, height: 1 },
        desktop: { x: 0, y: 0, width: 12, height: 1 },
      },
    },
    {
      id: 'sidebar',
      name: 'Sidebar',
      semanticTag: 'aside',
      positioning: { type: 'sticky', position: { top: '4rem' } },
      layout: { type: 'flex' },
      responsiveCanvasLayout: {
        // Mobile: hidden (no layout)
        tablet: { x: 0, y: 1, width: 2, height: 7 },
        desktop: { x: 0, y: 1, width: 3, height: 7 },
      },
    },
  ],
  breakpoints: [
    { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
    { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
    { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
  ],
  layouts: {
    mobile: { structure: 'vertical', components: ['header'] },
    tablet: { structure: 'sidebar-main', components: ['header', 'sidebar'] },
    desktop: { structure: 'sidebar-main', components: ['header', 'sidebar'] },
  },
}

/**
 * Component Factory: Create component with specified combination
 */
export function createComponent(
  id: string,
  name: string,
  semanticTag: Component['semanticTag'],
  positioningType: Component['positioning']['type'],
  layoutType: Component['layout']['type']
): Component {
  const component: Component = {
    id,
    name,
    semanticTag,
    positioning: { type: positioningType },
    layout: { type: layoutType },
    canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
  }

  // Add positioning details
  if (positioningType === 'fixed' || positioningType === 'sticky') {
    component.positioning.position = { top: 0, zIndex: 50 }
  }

  // Add layout details
  if (layoutType === 'flex') {
    component.layout.flex = { direction: 'row' }
  } else if (layoutType === 'grid') {
    component.layout.grid = { cols: 3, gap: '1rem' }
  } else if (layoutType === 'container') {
    component.layout.container = { maxWidth: '7xl', centered: true }
  }

  return component
}

/**
 * Schema Factory: Create schema with N components
 */
export function createSchemaWithComponents(
  componentCount: number,
  gridCols: number = 12,
  gridRows: number = 20
): LaydlerSchema {
  const components: Component[] = []

  for (let i = 0; i < componentCount; i++) {
    components.push({
      id: `c${i + 1}`,
      name: `Component${i + 1}`,
      semanticTag: 'div',
      positioning: { type: 'static' },
      layout: { type: 'flex' },
      canvasLayout: {
        x: (i % 4) * 3,
        y: Math.floor(i / 4) * 2,
        width: 3,
        height: 2,
      },
    })
  }

  return {
    schemaVersion: '2.0',
    components,
    breakpoints: [
      { name: 'desktop', minWidth: 1024, gridCols, gridRows },
    ],
    layouts: {
      desktop: {
        structure: 'custom',
        components: components.map((c) => c.id),
      },
    },
  }
}
