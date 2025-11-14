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

You need to create 4 components with the following specifications:

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

**Props:** None (placeholder component)

### 2. LeftSection (c2)
- **Semantic Tag:** `<section>`
- **Component Name:** `LeftSection`

**Positioning:**
- Type: `static`

**Layout:**
- Type: `flex`
- Direction: `column`
- Gap: `1.5rem`

**Styling:**
- Custom classes: `p-4`

**Props:** None (placeholder component)

### 3. RightSection (c3)
- **Semantic Tag:** `<section>`
- **Component Name:** `RightSection`

**Positioning:**
- Type: `static`

**Layout:**
- Type: `flex`
- Direction: `column`
- Gap: `1.5rem`

**Styling:**
- Custom classes: `p-4`

**Props:** None (placeholder component)

### 4. Footer (c4)
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

### 1. Desktop (≥1024px)

**Visual Layout (Canvas Grid):**

This breakpoint uses a **12-column × 8-row grid system** with 4 components.

- Row 0: Header (c1, full width)
- Row 1-6: LeftSection (c2, cols 0-5), RightSection (c3, cols 6-11)
- Row 7: Footer (c4, full width)

**Spatial Relationships:**

- **LeftSection (c2)** is positioned to the **LEFT** of **RightSection (c3)**
- **Header (c1)** spans **FULL WIDTH** as a header bar
- **Footer (c4)** spans **FULL WIDTH** as a footer bar
- **LeftSection (c2), RightSection (c3)** are positioned **SIDE-BY-SIDE** in the same row

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
  grid-area: 1 / 1 / 2 / 13;
}
.leftsection {
  grid-area: 2 / 1 / 8 / 7;
}
.rightsection {
  grid-area: 2 / 7 / 8 / 13;
}
.footer {
  grid-area: 8 / 1 / 9 / 13;
}
```

Or with Tailwind CSS:

Container: `grid grid-cols-12 grid-rows-8 gap-4`

Components:
- **Header (c1)**: `col-span-full row-span-1`
- **LeftSection (c2)**: `col-span-6 row-start-2 row-end-8`
- **RightSection (c3)**: `col-start-7 col-end-13 row-start-2 row-end-8`
- **Footer (c4)**: `col-span-full row-start-8 row-end-9`

**Implementation Strategy:**

- 🚨 **CRITICAL**: This layout has components positioned **side-by-side** in the same row. You MUST use CSS Grid (not flexbox column) to achieve horizontal positioning. DO NOT stack these components vertically!
- **Use CSS Grid** for the main layout container due to complex 2D positioning. Create a grid container with `display: grid; grid-template-columns: repeat(12, 1fr);`
- Each component MUST use `grid-area` (or `grid-column`/`grid-row`) to specify its exact position based on Canvas Grid coordinates
- For side-by-side components: Use grid-column spans to place components horizontally. Example: Component A uses `grid-column: 1 / 4`, Component B uses `grid-column: 4 / 9`, both with the same `grid-row` value
- Each component still uses its own `positioning` strategy (sticky/fixed/static) and internal `layout` (flex/grid/container)
- This grid layout applies to the **desktop** breakpoint - other breakpoints may have different arrangements

**Layout Structure:** `vertical`

**Component Order (DOM):**

For accessibility and SEO, the DOM order should follow visual layout (top to bottom, left to right):

1. c1 (Canvas row 0)
2. c2 (Canvas row 1)
3. c3 (Canvas row 1)
4. c4 (Canvas row 7)

**⚠️ IMPORTANT - Layout Priority:**

1. **PRIMARY**: Use the **Visual Layout (Canvas Grid)** positioning above as your main guide
2. **SECONDARY**: The DOM order below is for reference only (accessibility/SEO)
3. **RULE**: Components with the same Y-coordinate range MUST be placed side-by-side horizontally
4. **DO NOT** stack components vertically if they share the same row in the Canvas Grid

**Note:** Visual positioning (above) may differ from DOM order.


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
        "border": "b"
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
      "id": "c2",
      "name": "LeftSection",
      "semanticTag": "section",
      "positioning": {
        "type": "static"
      },
      "layout": {
        "type": "flex",
        "flex": {
          "direction": "column",
          "gap": "1.5rem"
        }
      },
      "styling": {
        "className": "p-4"
      },
      "responsiveCanvasLayout": {
        "desktop": {
          "x": 0,
          "y": 1,
          "width": 6,
          "height": 6
        }
      }
    },
    {
      "id": "c3",
      "name": "RightSection",
      "semanticTag": "section",
      "positioning": {
        "type": "static"
      },
      "layout": {
        "type": "flex",
        "flex": {
          "direction": "column",
          "gap": "1.5rem"
        }
      },
      "styling": {
        "className": "p-4"
      },
      "responsiveCanvasLayout": {
        "desktop": {
          "x": 6,
          "y": 1,
          "width": 6,
          "height": 6
        }
      }
    },
    {
      "id": "c4",
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
      "name": "desktop",
      "minWidth": 1024,
      "gridCols": 12,
      "gridRows": 8
    }
  ],
  "layouts": {
    "desktop": {
      "structure": "vertical",
      "components": [
        "c1",
        "c2",
        "c3",
        "c4"
      ]
    }
  }
}

```
