You are an expert React developer. Generate a responsive layout component based on the following Schema specifications.

**Schema Architecture:**
- **Component Independence**: Each component has its own positioning, layout, styling, and responsive behavior
- **Flexbox First**: Use Flexbox for page structure, CSS Grid only for card/content layouts
- **Semantic HTML**: Follow HTML5 semantic principles
- **Mobile First**: Implement responsive design with mobile-first approach
- **Breakpoint Inheritance**: Mobile → Tablet → Desktop cascade (명시되지 않은 breakpoint는 이전 breakpoint 설정 자동 상속)

**Requirements:**
- Use React functional components with TypeScript
- Use Tailwind CSS utility classes for all styling
- Each component must implement its specified positioning, layout, and styling
- Follow the exact specifications provided for each component
- Apply mobile-first responsive design: base styles for mobile, then md: for tablet, lg: for desktop

---

## Components

You need to create 6 components with the following specifications:

### 1. Header (c1)
- **Semantic Tag:** `<header>`
- **Component Name:** `Header`

**Positioning:**
- Type: `sticky`
- Position values: top: 0, zIndex: 50

**Layout:**
- Type: `container`
- Max width: `full`
- Padding: `1rem`
- Centered: true

**Styling:**
- Background: `white`
- Border: `b`
- Shadow: `sm`

**Props:** None (placeholder component)

### 2. Header (c2)
- **Semantic Tag:** `<header>`
- **Component Name:** `Header`

**Positioning:**
- Type: `sticky`
- Position values: top: 0, zIndex: 50

**Layout:**
- Type: `container`
- Max width: `full`
- Padding: `1rem`
- Centered: true

**Styling:**
- Background: `white`
- Border: `b`
- Shadow: `sm`

**Props:** None (placeholder component)

### 3. Sidebar (c3)
- **Semantic Tag:** `<aside>`
- **Component Name:** `Sidebar`

**Positioning:**
- Type: `sticky`
- Position values: top: 64, left: 0

**Layout:**
- Type: `flex`
- Direction: `column`
- Gap: `1rem`

**Styling:**
- Background: `gray-50`
- Border: `r`

**Props:** None (placeholder component)

### 4. MainContent (c4)
- **Semantic Tag:** `<main>`
- **Component Name:** `MainContent`

**Positioning:**
- Type: `static`

**Layout:**
- Type: `flex`
- Direction: `column`
- Gap: `2rem`

**Styling:**
- Custom classes: `p-8`

**Props:** None (placeholder component)

### 5. Footer (c5)
- **Semantic Tag:** `<footer>`
- **Component Name:** `Footer`

**Positioning:**
- Type: `static`

**Layout:**
- Type: `container`
- Max width: `full`
- Padding: `2rem 1rem`
- Centered: true

**Styling:**
- Background: `gray-100`
- Border: `t`

**Props:** None (placeholder component)

### 6. Footer (c6)
- **Semantic Tag:** `<footer>`
- **Component Name:** `Footer`

**Positioning:**
- Type: `static`

**Layout:**
- Type: `container`
- Max width: `full`
- Padding: `2rem 1rem`
- Centered: true

**Styling:**
- Background: `gray-100`
- Border: `t`

**Props:** None (placeholder component)


---

## Responsive Page Structure

Implement the following page structures for each breakpoint:

### 1. Mobile (≥0px)

**Visual Layout (Canvas Grid):**

This breakpoint uses a **4-column × 8-row grid system** with 3 components.

- Row 0: Header (c1, full width)
- Row 1-6: MainContent (c4, full width)
- Row 7: Footer (c5, full width)

**Spatial Relationships:**

- **Header (c1)** spans **FULL WIDTH** as a header bar
- **MainContent (c4)** spans **FULL WIDTH** as a full-width section
- **Footer (c5)** spans **FULL WIDTH** as a footer bar

**CSS Grid Positioning:**

For precise 2D positioning, use CSS Grid:

```css
.layout-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(8, auto);
  gap: 1rem;
}

.header {
  grid-area: 1 / 1 / 2 / 5;
}
.maincontent {
  grid-area: 2 / 1 / 8 / 5;
}
.footer {
  grid-area: 8 / 1 / 9 / 5;
}
```

Or with Tailwind CSS:

Container: `grid grid-cols-4 grid-rows-8 gap-4`

Components:
- **Header (c1)**: `col-span-full row-span-1`
- **MainContent (c4)**: `col-span-full row-start-2 row-end-8`
- **Footer (c5)**: `col-span-full row-start-8 row-end-9`

**Implementation Strategy:**

- While this layout could use Flexbox, CSS Grid is **strongly recommended** for precise positioning and future flexibility
- Each component MUST use `grid-area` (or `grid-column`/`grid-row`) to specify its exact position based on Canvas Grid coordinates
- Each component still uses its own `positioning` strategy (sticky/fixed/static) and internal `layout` (flex/grid/container)
- This grid layout applies to the **mobile** breakpoint - other breakpoints may have different arrangements

**Layout Structure:** `vertical`

**Component Order (DOM):**

For accessibility and SEO, the DOM order should follow visual layout (top to bottom, left to right):

1. c1 (Canvas row 0)
2. c4 (Canvas row 1)
3. c5 (Canvas row 7)

**⚠️ IMPORTANT - Layout Priority:**

1. **PRIMARY**: Use the **Visual Layout (Canvas Grid)** positioning above as your main guide
2. **SECONDARY**: The DOM order below is for reference only (accessibility/SEO)
3. **RULE**: Components with the same Y-coordinate range MUST be placed side-by-side horizontally
4. **DO NOT** stack components vertically if they share the same row in the Canvas Grid

**Note:** Visual positioning (above) may differ from DOM order.

### 2. Desktop (≥1024px)

**Visual Layout (Canvas Grid):**

This breakpoint uses a **12-column × 8-row grid system** with 6 components.

- Row 0: Header (c1, cols 0-3), Header (c2, full width)
- Row 1-6: Sidebar (c3, cols 0-2), MainContent (c4, cols 3-11)
- Row 7: Footer (c5, cols 0-3), Footer (c6, full width)

**Spatial Relationships:**

- **Header (c1)** is positioned to the **LEFT** of **Header (c2)**
- **Sidebar (c3)** is positioned to the **LEFT** of **MainContent (c4)**
- **Footer (c5)** is positioned to the **LEFT** of **Footer (c6)**
- **Sidebar (c3)** acts as a **SIDEBAR** (narrow column spanning multiple rows on the left)
- **Header (c2)** spans **FULL WIDTH** as a header bar
- **Footer (c6)** spans **FULL WIDTH** as a footer bar
- **Header (c1), Header (c2)** are positioned **SIDE-BY-SIDE** in the same row
- **Sidebar (c3), MainContent (c4)** are positioned **SIDE-BY-SIDE** in the same row
- **Footer (c5), Footer (c6)** are positioned **SIDE-BY-SIDE** in the same row

**CSS Grid Positioning:**

For precise 2D positioning, use CSS Grid:

```css
.layout-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(8, auto);
  gap: 1rem;
}

.header {
  grid-area: 1 / 1 / 2 / 5;
}
.header {
  grid-area: 1 / 1 / 2 / 13;
}
.sidebar {
  grid-area: 2 / 1 / 8 / 4;
}
.maincontent {
  grid-area: 2 / 4 / 8 / 13;
}
.footer {
  grid-area: 8 / 1 / 9 / 5;
}
.footer {
  grid-area: 8 / 1 / 9 / 13;
}
```

Or with Tailwind CSS:

Container: `grid grid-cols-12 grid-rows-8 gap-4`

Components:
- **Header (c1)**: `col-span-4 row-span-1`
- **Header (c2)**: `col-span-full row-span-1`
- **Sidebar (c3)**: `col-span-3 row-start-2 row-end-8`
- **MainContent (c4)**: `col-start-4 col-end-13 row-start-2 row-end-8`
- **Footer (c5)**: `col-span-4 row-start-8 row-end-9`
- **Footer (c6)**: `col-span-full row-start-8 row-end-9`

**Implementation Strategy:**

- 🚨 **CRITICAL**: This layout has components positioned **side-by-side** in the same row. You MUST use CSS Grid (not flexbox column) to achieve horizontal positioning. DO NOT stack these components vertically!
- **Use CSS Grid** for the main layout container due to complex 2D positioning. Create a grid container with `display: grid; grid-template-columns: repeat(12, 1fr);`
- Each component MUST use `grid-area` (or `grid-column`/`grid-row`) to specify its exact position based on Canvas Grid coordinates
- **Sidebar** should be implemented as a sticky sidebar (use `position: sticky` with appropriate `top` value) positioned on the left side
- For side-by-side components: Use grid-column spans to place components horizontally. Example: Component A uses `grid-column: 1 / 4`, Component B uses `grid-column: 4 / 9`, both with the same `grid-row` value
- Each component still uses its own `positioning` strategy (sticky/fixed/static) and internal `layout` (flex/grid/container)
- This grid layout applies to the **desktop** breakpoint - other breakpoints may have different arrangements

**Layout Structure:** `sidebar-main`

**Component Order (DOM):**

For accessibility and SEO, the DOM order should follow visual layout (top to bottom, left to right):

1. c2 (Canvas row 0)
2. c1 (Canvas row 0)
3. c3 (Canvas row 1)
4. c4 (Canvas row 1)
5. c6 (Canvas row 7)
6. c5 (Canvas row 7)

**⚠️ IMPORTANT - Layout Priority:**

1. **PRIMARY**: Use the **Visual Layout (Canvas Grid)** positioning above as your main guide
2. **SECONDARY**: The DOM order below is for reference only (accessibility/SEO)
3. **RULE**: Components with the same Y-coordinate range MUST be placed side-by-side horizontally
4. **DO NOT** stack components vertically if they share the same row in the Canvas Grid

**Note:** Visual positioning (above) may differ from DOM order.


---

## Component Links (Cross-Breakpoint Relationships)


The following components are linked and MUST be treated as the SAME component:


**Group 1:** Header (c1), Header (c2)

**Group 2:** Footer (c5), Footer (c6)


🚨 **CRITICAL IMPLEMENTATION RULE - Component Links:**

Components in the same link group MUST be rendered as a **SINGLE component** in your code.
DO NOT create separate React components for each component ID in a group.

**Validation Rule:**
- Each link group = 1 React component
- Total components in your code: 2 (NOT 4)

**Example (CORRECT):**
```tsx
// Group 1: Header (c1), Header (c2) → SINGLE component
const Header = () => (
  <header className="sticky top-0 z-50">
    {/* Responsive via Tailwind: grid-cols-4 lg:grid-cols-12 */}
  </header>
)
```

**Example (WRONG - DO NOT DO THIS):**
```tsx
// ❌ WRONG: Separate components for c1 and c2
const HeaderMobile = () => <header>...</header>  // c1
const HeaderDesktop = () => <header>...</header> // c2
```


---

## Implementation Instructions

1. **Main Layout Component:**
   - Create a main container component (e.g., `ResponsiveLayout` or `RootLayout`)
   - Implement responsive structure changes using Tailwind breakpoints
   - Follow the structure specifications for each breakpoint (vertical/horizontal/sidebar-main)

2. **Component Implementation:**
   - Each component MUST use its specified semantic tag
   - Apply positioning classes according to component specifications
   - Implement layout (flex/grid/container) as specified
   - Add styling classes as specified
   - Implement responsive behavior for each breakpoint

3. **Positioning Guidelines:**
   - `static`: Default flow (no position class needed)
   - `fixed`: Use Tailwind `fixed` with specified position values (e.g., `fixed top-0 left-0 right-0 z-50`)
   - `sticky`: Use Tailwind `sticky` with specified position values
   - `absolute`: Use Tailwind `absolute` with specified position values
   - `relative`: Use Tailwind `relative`

4. **Layout Guidelines:**
   - `flex`: Use Tailwind flex utilities (`flex`, `flex-col`, `justify-center`, etc.)
   - `grid`: Use Tailwind grid utilities (`grid`, `grid-cols-3`, `gap-4`, etc.)
   - `container`: Wrap content in a container div with max-width and centering
   - `none`: No specific layout - let content flow naturally

5. **Responsive Behavior:**
   - **Mobile First Approach**: Base styles apply to mobile, use md: and lg: prefixes for larger breakpoints
   - **Breakpoint Inheritance**: Styles cascade upward (Mobile → Tablet → Desktop)
   - **Override Strategy**: Use responsive prefixes to override inherited styles (e.g., `hidden md:block` = hidden on mobile, visible on tablet+)
   - Use Tailwind responsive prefixes (`md:`, `lg:`) for tablet and desktop
   - Handle visibility changes (hidden/block) as specified
   - Apply responsive width/order changes as specified

6. **Code Quality:**
   - Use TypeScript with proper type definitions
   - Follow React best practices (functional components, hooks)
   - Use semantic HTML5 tags as specified
   - Add placeholder content for demonstration
   - Keep component code clean and maintainable

---

## Full Schema (JSON)


For reference, here is the complete Schema in JSON format:


```json

{
  "schemaVersion": "2.0",
  "components": [
    {
      "id": "c1",
      "name": "Header",
      "semanticTag": "header",
      "positioning": {
        "type": "sticky",
        "position": {
          "top": 0,
          "zIndex": 50
        }
      },
      "layout": {
        "type": "container",
        "container": {
          "maxWidth": "full",
          "padding": "1rem",
          "centered": true
        }
      },
      "styling": {
        "background": "white",
        "border": "b",
        "shadow": "sm"
      },
      "responsiveCanvasLayout": {
        "mobile": {
          "x": 0,
          "y": 0,
          "width": 4,
          "height": 1
        },
        "desktop": {
          "x": 0,
          "y": 0,
          "width": 4,
          "height": 1
        }
      }
    },
    {
      "id": "c2",
      "name": "Header",
      "semanticTag": "header",
      "positioning": {
        "type": "sticky",
        "position": {
          "top": 0,
          "zIndex": 50
        }
      },
      "layout": {
        "type": "container",
        "container": {
          "maxWidth": "full",
          "padding": "1rem",
          "centered": true
        }
      },
      "styling": {
        "background": "white",
        "border": "b",
        "shadow": "sm"
      },
      "responsiveCanvasLayout": {
        "desktop": {
          "x": 0,
          "y": 0,
          "width": 12,
          "height": 1
        }
      }
    },
    {
      "id": "c3",
      "name": "Sidebar",
      "semanticTag": "aside",
      "positioning": {
        "type": "sticky",
        "position": {
          "top": 64,
          "left": 0
        }
      },
      "layout": {
        "type": "flex",
        "flex": {
          "direction": "column",
          "gap": "1rem"
        }
      },
      "styling": {
        "background": "gray-50",
        "border": "r"
      },
      "responsiveCanvasLayout": {
        "desktop": {
          "x": 0,
          "y": 1,
          "width": 3,
          "height": 6
        }
      }
    },
    {
      "id": "c4",
      "name": "MainContent",
      "semanticTag": "main",
      "positioning": {
        "type": "static"
      },
      "layout": {
        "type": "flex",
        "flex": {
          "direction": "column",
          "gap": "2rem"
        }
      },
      "styling": {
        "className": "p-8"
      },
      "responsiveCanvasLayout": {
        "mobile": {
          "x": 0,
          "y": 1,
          "width": 4,
          "height": 6
        },
        "desktop": {
          "x": 3,
          "y": 1,
          "width": 9,
          "height": 6
        }
      }
    },
    {
      "id": "c5",
      "name": "Footer",
      "semanticTag": "footer",
      "positioning": {
        "type": "static"
      },
      "layout": {
        "type": "container",
        "container": {
          "maxWidth": "full",
          "padding": "2rem 1rem",
          "centered": true
        }
      },
      "styling": {
        "background": "gray-100",
        "border": "t"
      },
      "responsiveCanvasLayout": {
        "mobile": {
          "x": 0,
          "y": 7,
          "width": 4,
          "height": 1
        },
        "desktop": {
          "x": 0,
          "y": 7,
          "width": 4,
          "height": 1
        }
      }
    },
    {
      "id": "c6",
      "name": "Footer",
      "semanticTag": "footer",
      "positioning": {
        "type": "static"
      },
      "layout": {
        "type": "container",
        "container": {
          "maxWidth": "full",
          "padding": "2rem 1rem",
          "centered": true
        }
      },
      "styling": {
        "background": "gray-100",
        "border": "t"
      },
      "responsiveCanvasLayout": {
        "desktop": {
          "x": 0,
          "y": 7,
          "width": 12,
          "height": 1
        }
      }
    }
  ],
  "breakpoints": [
    {
      "name": "mobile",
      "minWidth": 0,
      "gridCols": 4,
      "gridRows": 8
    },
    {
      "name": "desktop",
      "minWidth": 1024,
      "gridCols": 12,
      "gridRows": 8
    }
  ],
  "layouts": {
    "mobile": {
      "structure": "vertical",
      "components": [
        "c1",
        "c4",
        "c5"
      ]
    },
    "desktop": {
      "structure": "sidebar-main",
      "components": [
        "c2",
        "c1",
        "c3",
        "c4",
        "c6",
        "c5"
      ]
    }
  }
}

```
