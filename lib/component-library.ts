/**
 * Component Library V2
 *
 * 사전 정의된 컴포넌트 템플릿 라이브러리
 */

import type { Component } from "@/types/schema"

export interface ComponentTemplate {
  id: string
  name: string
  description: string
  category: "layout" | "navigation" | "content" | "form"
  icon: string
  template: Omit<Component, "id">
}

/**
 * 컴포넌트 라이브러리
 *
 * 각 카테고리별 사전 정의 템플릿
 */
export const COMPONENT_LIBRARY: ComponentTemplate[] = [
  // Layout Components
  {
    id: "header-sticky",
    name: "Sticky Header",
    description: "Fixed header at the top",
    category: "layout",
    icon: "LayoutHeader",
    template: {
      name: "Header",
      semanticTag: "header",
      positioning: {
        type: "sticky",
        position: { top: 0, zIndex: 50 },
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "full",
          padding: "1rem",
          centered: true,
        },
      },
      styling: {
        border: "b",
        className: "focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-900 motion-reduce:transition-none",
      },
      props: {
        children: "Header Content",
        role: "banner",
        "aria-label": "Main navigation",
      },
    },
  },
  {
    id: "main-content",
    name: "Main Content",
    description: "Main content area",
    category: "layout",
    icon: "LayoutGrid",
    template: {
      name: "Main",
      semanticTag: "main",
      positioning: {
        type: "static",
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "7xl",
          padding: "2rem",
          centered: true,
        },
      },
      styling: {
        className: "flex-1 min-h-screen",
      },
      props: {
        children: "Main Content",
        role: "main",
        id: "main-content",
        "aria-label": "Main content",
      },
    },
  },
  {
    id: "footer-standard",
    name: "Footer",
    description: "Bottom footer",
    category: "layout",
    icon: "LayoutFooter",
    template: {
      name: "Footer",
      semanticTag: "footer",
      positioning: {
        type: "static",
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "full",
          padding: "2rem 1rem",
          centered: true,
        },
      },
      styling: {
        border: "t",
      },
      props: {
        children: "Footer Content",
        role: "contentinfo",
        "aria-label": "Site footer",
      },
    },
  },

  // Navigation Components
  {
    id: "sidebar-left",
    name: "Left Sidebar",
    description: "Left sidebar navigation",
    category: "navigation",
    icon: "PanelLeft",
    template: {
      name: "Sidebar",
      semanticTag: "aside",
      positioning: {
        type: "sticky",
        position: { top: "4rem", zIndex: 40 },
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1rem",
        },
      },
      styling: {
        width: "16rem",
        border: "r",
        className: "focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-900 motion-reduce:transition-none",
      },
      props: {
        children: "Sidebar Navigation",
        role: "complementary",
        "aria-label": "Sidebar navigation",
      },
    },
  },
  {
    id: "navbar-horizontal",
    name: "Horizontal Navbar",
    description: "Horizontal navigation bar",
    category: "navigation",
    icon: "Menu",
    template: {
      name: "Navbar",
      semanticTag: "nav",
      positioning: {
        type: "sticky",
        position: { top: 0, zIndex: 50 },
      },
      layout: {
        type: "flex",
        flex: {
          direction: "row",
          gap: "2rem",
          items: "center",
          justify: "between",
        },
      },
      styling: {
        border: "b",
        className: "px-6 py-4 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-900 motion-reduce:transition-none",
      },
      props: {
        children: "Navigation Links",
        role: "navigation",
        "aria-label": "Primary navigation",
      },
    },
  },

  // Content Components
  {
    id: "section-standard",
    name: "Section",
    description: "Content section",
    category: "content",
    icon: "Box",
    template: {
      name: "Section",
      semanticTag: "section",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1.5rem",
        },
      },
      styling: {
        className: "py-8",
      },
      props: {
        children: "Section Content",
      },
    },
  },
  {
    id: "article-blog",
    name: "Article",
    description: "Blog article",
    category: "content",
    icon: "FileText",
    template: {
      name: "Article",
      semanticTag: "article",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1rem",
        },
      },
      styling: {
        className: "p-4",
      },
      props: {
        children: "Article Content",
        role: "article",
      },
    },
  },
  {
    id: "div-container",
    name: "Container Div",
    description: "General purpose container",
    category: "content",
    icon: "Square",
    template: {
      name: "Container",
      semanticTag: "div",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
        },
      },
      styling: {
        className: "p-4",
      },
      props: {
        children: "Container Content",
      },
    },
  },

  // Form Components
  {
    id: "form-standard",
    name: "Form",
    description: "Form container",
    category: "form",
    icon: "FormInput",
    template: {
      name: "Form",
      semanticTag: "form",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1.5rem",
        },
      },
      styling: {
        className: "max-w-md p-6 border border-gray-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-900 motion-reduce:transition-none",
      },
      props: {
        children: "Form Fields",
        role: "form",
        "aria-label": "Form",
      },
    },
  },

  // New Templates - Extended Library
  {
    id: "hero-section",
    name: "Hero Section",
    description: "Hero section with large banner",
    category: "content",
    icon: "Layout",
    template: {
      name: "Hero",
      semanticTag: "section",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "2rem",
          items: "center",
          justify: "center",
        },
      },
      styling: {
        className: "min-h-[500px] px-4 text-center border border-gray-300",
      },
      props: {
        children: "Hero Content",
        role: "region",
        "aria-label": "Hero section",
      },
    },
  },
  {
    id: "card-container",
    name: "Card",
    description: "Card layout",
    category: "content",
    icon: "Square",
    template: {
      name: "Card",
      semanticTag: "div",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1rem",
        },
      },
      styling: {
        className: "p-6 border border-gray-300",
      },
      props: {
        children: "Card Content",
      },
    },
  },
  {
    id: "grid-container",
    name: "Grid Container",
    description: "Grid layout (2 columns)",
    category: "layout",
    icon: "LayoutGrid",
    template: {
      name: "GridContainer",
      semanticTag: "div",
      positioning: {
        type: "static",
      },
      layout: {
        type: "grid",
        grid: {
          cols: 2,
          gap: "1.5rem",
        },
      },
      styling: {
        className: "p-4",
      },
      props: {
        children: "Grid Items",
      },
    },
  },
  {
    id: "cta-section",
    name: "CTA Section",
    description: "Call-to-Action area",
    category: "content",
    icon: "Box",
    template: {
      name: "CTA",
      semanticTag: "section",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          gap: "1.5rem",
          items: "center",
          justify: "center",
        },
      },
      styling: {
        className: "py-16 px-4 text-center border border-gray-300",
      },
      props: {
        children: "CTA Content",
        role: "region",
        "aria-label": "Call to action",
      },
    },
  },
  {
    id: "image-banner",
    name: "Image Banner",
    description: "Image banner",
    category: "content",
    icon: "Layout",
    template: {
      name: "ImageBanner",
      semanticTag: "div",
      positioning: {
        type: "static",
      },
      layout: {
        type: "container",
        container: {
          maxWidth: "full",
          padding: "0",
          centered: false,
        },
      },
      styling: {
        className: "relative h-[400px] border border-gray-300 overflow-hidden",
      },
      props: {
        children: "Image",
        role: "img",
        "aria-label": "Banner image",
      },
    },
  },
  {
    id: "button-group",
    name: "Button Group",
    description: "Button group",
    category: "form",
    icon: "FormInput",
    template: {
      name: "ButtonGroup",
      semanticTag: "div",
      positioning: {
        type: "static",
      },
      layout: {
        type: "flex",
        flex: {
          direction: "row",
          gap: "0.75rem",
          items: "center",
        },
      },
      styling: {
        className: "p-4",
      },
      props: {
        children: "Buttons",
        role: "group",
        "aria-label": "Button group",
      },
    },
  },
]

/**
 * 카테고리별 컴포넌트 필터
 */
export function getComponentsByCategory(
  category: ComponentTemplate["category"]
): ComponentTemplate[] {
  return COMPONENT_LIBRARY.filter((template) => template.category === category)
}

/**
 * ID로 템플릿 찾기
 */
export function getTemplateById(id: string): ComponentTemplate | undefined {
  return COMPONENT_LIBRARY.find((template) => template.id === id)
}

/**
 * 템플릿에서 새 컴포넌트 생성
 */
export function createComponentFromTemplate(
  template: ComponentTemplate,
  customId?: string
): Component {
  return {
    id: customId || `${template.id}-${Date.now()}`,
    ...template.template,
  }
}

/**
 * 모든 카테고리 목록
 */
export const COMPONENT_CATEGORIES = [
  { id: "layout", name: "Layout", icon: "LayoutGrid" },
  { id: "navigation", name: "Navigation", icon: "Menu" },
  { id: "content", name: "Content", icon: "FileText" },
  { id: "form", name: "Form", icon: "FormInput" },
] as const
