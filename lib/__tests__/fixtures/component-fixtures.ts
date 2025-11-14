/**
 * Test Fixtures - Component Factory Functions
 *
 * 테스트에서 반복적으로 사용되는 컴포넌트 fixture를 생성하는 factory 함수들
 * DRY 원칙을 따라 중복을 제거하고 일관성 있는 테스트 데이터 제공
 */

import type { Component, LaydlerSchema } from '@/types/schema'

/**
 * 기본 Header 컴포넌트 생성
 */
export function createHeaderComponent(overrides?: Partial<Component>): Component {
  return {
    id: 'header',
    name: 'Header',
    semanticTag: 'header',
    positioning: { type: 'sticky', top: 0 },
    layout: { type: 'flex', direction: 'row' },
    canvasLayout: { x: 0, y: 0, width: 12, height: 1 },
    ...overrides,
  }
}

/**
 * 기본 Footer 컴포넌트 생성
 */
export function createFooterComponent(overrides?: Partial<Component>): Component {
  return {
    id: 'footer',
    name: 'Footer',
    semanticTag: 'footer',
    positioning: { type: 'static' },
    layout: { type: 'flex', direction: 'row' },
    canvasLayout: { x: 0, y: 10, width: 12, height: 1 },
    ...overrides,
  }
}

/**
 * 기본 Sidebar (Aside) 컴포넌트 생성
 */
export function createSidebarComponent(overrides?: Partial<Component>): Component {
  return {
    id: 'sidebar',
    name: 'Sidebar',
    semanticTag: 'aside',
    positioning: { type: 'sticky', top: 64 },
    layout: { type: 'flex', direction: 'column' },
    canvasLayout: { x: 0, y: 1, width: 3, height: 8 },
    ...overrides,
  }
}

/**
 * 기본 Main 컴포넌트 생성
 */
export function createMainComponent(overrides?: Partial<Component>): Component {
  return {
    id: 'main',
    name: 'Main',
    semanticTag: 'main',
    positioning: { type: 'static' },
    layout: { type: 'flex', direction: 'column' },
    canvasLayout: { x: 3, y: 1, width: 9, height: 8 },
    ...overrides,
  }
}

/**
 * 기본 Section 컴포넌트 생성
 */
export function createSectionComponent(overrides?: Partial<Component>): Component {
  return {
    id: 'section',
    name: 'Section',
    semanticTag: 'section',
    positioning: { type: 'static' },
    layout: { type: 'flex', direction: 'column' },
    canvasLayout: { x: 0, y: 0, width: 6, height: 4 },
    ...overrides,
  }
}

/**
 * 기본 Div 컴포넌트 생성 (범용)
 */
export function createDivComponent(overrides?: Partial<Component>): Component {
  return {
    id: 'div',
    name: 'Container',
    semanticTag: 'div',
    positioning: { type: 'static' },
    layout: { type: 'none' },
    canvasLayout: { x: 0, y: 0, width: 2, height: 2 },
    ...overrides,
  }
}

/**
 * Responsive Canvas Layout을 가진 컴포넌트 생성
 */
export function createResponsiveComponent(overrides?: Partial<Component>): Component {
  return {
    id: 'responsive',
    name: 'ResponsiveBox',
    semanticTag: 'section',
    positioning: { type: 'static' },
    layout: { type: 'flex', direction: 'column' },
    canvasLayout: { x: 0, y: 0, width: 12, height: 2 },
    responsiveCanvasLayout: {
      mobile: { x: 0, y: 0, width: 4, height: 4 },
      tablet: { x: 0, y: 0, width: 8, height: 3 },
      desktop: { x: 0, y: 0, width: 12, height: 2 },
    },
    ...overrides,
  }
}

/**
 * 최소 Schema 생성 (단일 breakpoint)
 */
export function createMinimalSchema(components: Component[]): LaydlerSchema {
  return {
    schemaVersion: '2.0',
    components,
    breakpoints: [
      { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
    ],
    layouts: {
      mobile: {
        structure: 'vertical',
        components: components.map((c) => c.id),
      },
    },
  }
}

/**
 * 전체 Breakpoints를 가진 Schema 생성
 */
export function createFullSchema(components: Component[]): LaydlerSchema {
  const componentIds = components.map((c) => c.id)

  return {
    schemaVersion: '2.0',
    components,
    breakpoints: [
      { name: 'mobile', minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: 'tablet', minWidth: 768, gridCols: 8, gridRows: 8 },
      { name: 'desktop', minWidth: 1024, gridCols: 12, gridRows: 8 },
    ],
    layouts: {
      mobile: { structure: 'vertical', components: componentIds },
      tablet: { structure: 'vertical', components: componentIds },
      desktop: { structure: 'vertical', components: componentIds },
    },
  }
}
