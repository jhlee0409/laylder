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

You need to create 1 components with the following specifications:

### 1. FlexContainer (c1)
- **Semantic Tag:** `<section>`
- **Component Name:** `FlexContainer`

**Positioning:**
- Type: `static`

**Layout:**
- Type: `flex`
- Direction: `row`
- Justify: `space-between`
- Items: `center`
- Gap: `2rem`

**Styling:**
- Custom classes: `py-8`

**Props:** None (placeholder component)


---

## Responsive Page Structure

Implement the following page structures for each breakpoint:

### 1. Mobile (≥0px)

**Visual Layout (Canvas Grid):**

This breakpoint uses a **4-column × 8-row grid system** with 1 components.

- Row 0-3: FlexContainer (c1, full width)

**Spatial Relationships:**

- **FlexContainer (c1)** spans **FULL WIDTH** as a full-width section

**CSS Grid Positioning:**

For precise 2D positioning, use CSS Grid:

```css
.layout-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(8, auto);
  gap: 1rem;
}

.flexcontainer {
  grid-area: 1 / 1 / 5 / 5;
}
```

Or with Tailwind CSS:

Container: `grid grid-cols-4 grid-rows-8 gap-4`

Components:
- **FlexContainer (c1)**: `col-span-full row-span-4`

**Implementation Strategy:**

- While this layout could use Flexbox, CSS Grid is **strongly recommended** for precise positioning and future flexibility
- Each component MUST use `grid-area` (or `grid-column`/`grid-row`) to specify its exact position based on Canvas Grid coordinates
- Each component still uses its own `positioning` strategy (sticky/fixed/static) and internal `layout` (flex/grid/container)
- This grid layout applies to the **mobile** breakpoint - other breakpoints may have different arrangements

**Layout Structure:** `vertical`

**Component Order (DOM):**

For accessibility and SEO, the DOM order should follow visual layout (top to bottom, left to right):

1. c1 (Canvas row 0)

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
      "name": "FlexContainer",
      "semanticTag": "section",
      "positioning": {
        "type": "static"
      },
      "layout": {
        "type": "flex",
        "flex": {
          "direction": "row",
          "gap": "2rem",
          "justify": "space-between",
          "items": "center"
        }
      },
      "styling": {
        "className": "py-8"
      },
      "responsiveCanvasLayout": {
        "mobile": {
          "x": 0,
          "y": 0,
          "width": 4,
          "height": 4
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
    }
  ],
  "layouts": {
    "mobile": {
      "structure": "vertical",
      "components": [
        "c1"
      ]
    }
  }
}

```
