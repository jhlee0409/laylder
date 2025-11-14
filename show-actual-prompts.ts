/**
 * Show Actual Generated Prompts
 *
 * 실제로 생성되는 프롬프트 내용을 보여줌
 * - 대표적인 케이스별로 프롬프트 출력
 * - 파일로 저장하여 직접 확인 가능
 */

import { generatePrompt } from "./lib/prompt-generator"
import type { LaydlerSchema } from "./types/schema"
import * as fs from "fs"
import * as path from "path"

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  yellow: "\x1b[33m",
}

function log(msg: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`)
}

// 출력 디렉토리 생성
const outputDir = path.join(process.cwd(), "generated-prompts")
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// ============================================================================
// Case 1: Header (Sticky Positioning + Container Layout)
// ============================================================================
function generateCase1_StickyHeader() {
  log("\n" + "=".repeat(80), "cyan")
  log("CASE 1: Sticky Header with Container Layout", "cyan")
  log("=".repeat(80), "cyan")

  const schema: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "sticky", position: { top: 0, zIndex: 50 } },
        layout: {
          type: "container",
          container: { maxWidth: "xl", padding: "1rem", centered: true }
        },
        styling: { background: "white", border: "b", shadow: "sm" },
        props: { children: "Header Content" },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 0, width: 4, height: 1 },
          desktop: { x: 0, y: 0, width: 12, height: 1 }
        }
      }
    ],
    breakpoints: [
      { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }
    ],
    layouts: {
      mobile: { structure: "vertical", components: ["c1"] },
      desktop: { structure: "vertical", components: ["c1"] }
    }
  }

  const result = generatePrompt(schema, "react", "tailwind")

  if (result.success && result.prompt) {
    const filename = path.join(outputDir, "case1-sticky-header.md")
    fs.writeFileSync(filename, result.prompt, "utf-8")
    log(`✅ Prompt saved to: ${filename}`, "green")
    log(`\nPrompt Preview (first 800 chars):`, "yellow")
    console.log(result.prompt.substring(0, 800) + "...")
  } else {
    log(`❌ Failed to generate prompt: ${result.errors?.join(", ")}`, "yellow")
  }
}

// ============================================================================
// Case 2: Flex Layout (Direction + Gap + Justify)
// ============================================================================
function generateCase2_FlexLayout() {
  log("\n" + "=".repeat(80), "cyan")
  log("CASE 2: Flex Layout with Direction, Gap, Justify", "cyan")
  log("=".repeat(80), "cyan")

  const schema: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "FlexContainer",
        semanticTag: "section",
        positioning: { type: "static" },
        layout: {
          type: "flex",
          flex: {
            direction: "row",
            gap: "2rem",
            justify: "between",
            items: "center"
          }
        },
        styling: { className: "py-8" },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 0, width: 4, height: 4 }
        }
      }
    ],
    breakpoints: [
      { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 }
    ],
    layouts: {
      mobile: { structure: "vertical", components: ["c1"] }
    }
  }

  const result = generatePrompt(schema, "react", "tailwind")

  if (result.success && result.prompt) {
    const filename = path.join(outputDir, "case2-flex-layout.md")
    fs.writeFileSync(filename, result.prompt, "utf-8")
    log(`✅ Prompt saved to: ${filename}`, "green")
    log(`\nPrompt Preview (first 800 chars):`, "yellow")
    console.log(result.prompt.substring(0, 800) + "...")
  } else {
    log(`❌ Failed to generate prompt: ${result.errors?.join(", ")}`, "yellow")
  }
}

// ============================================================================
// Case 3: Grid Layout (Cols + Rows + Gap)
// ============================================================================
function generateCase3_GridLayout() {
  log("\n" + "=".repeat(80), "cyan")
  log("CASE 3: Grid Layout with Cols, Rows, Gap", "cyan")
  log("=".repeat(80), "cyan")

  const schema: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "CardGrid",
        semanticTag: "section",
        positioning: { type: "static" },
        layout: {
          type: "grid",
          grid: {
            cols: 3,
            rows: 2,
            gap: "1.5rem",
            autoFlow: "row dense"
          }
        },
        styling: { className: "p-8" },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 0, width: 4, height: 6 },
          desktop: { x: 0, y: 0, width: 12, height: 4 }
        }
      }
    ],
    breakpoints: [
      { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }
    ],
    layouts: {
      mobile: { structure: "vertical", components: ["c1"] },
      desktop: { structure: "vertical", components: ["c1"] }
    }
  }

  const result = generatePrompt(schema, "react", "tailwind")

  if (result.success && result.prompt) {
    const filename = path.join(outputDir, "case3-grid-layout.md")
    fs.writeFileSync(filename, result.prompt, "utf-8")
    log(`✅ Prompt saved to: ${filename}`, "green")
    log(`\nPrompt Preview (first 800 chars):`, "yellow")
    console.log(result.prompt.substring(0, 800) + "...")
  } else {
    log(`❌ Failed to generate prompt: ${result.errors?.join(", ")}`, "yellow")
  }
}

// ============================================================================
// Case 4: Responsive Behavior (Hidden + Width + Order)
// ============================================================================
function generateCase4_ResponsiveBehavior() {
  log("\n" + "=".repeat(80), "cyan")
  log("CASE 4: Responsive Behavior (Hidden, Width, Order)", "cyan")
  log("=".repeat(80), "cyan")

  const schema: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "ResponsiveNav",
        semanticTag: "nav",
        positioning: { type: "sticky", position: { top: 0, zIndex: 40 } },
        layout: { type: "flex", flex: { direction: "row", gap: "1rem" } },
        responsive: {
          mobile: { hidden: true, order: 1 },
          tablet: { hidden: false, width: "50%", order: 2 },
          desktop: { width: "33.333%", order: 3 }
        },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 0, width: 4, height: 1 },
          tablet: { x: 0, y: 0, width: 8, height: 1 },
          desktop: { x: 0, y: 0, width: 12, height: 1 }
        }
      }
    ],
    breakpoints: [
      { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 8 },
      { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }
    ],
    layouts: {
      mobile: { structure: "vertical", components: ["c1"] },
      tablet: { structure: "vertical", components: ["c1"] },
      desktop: { structure: "vertical", components: ["c1"] }
    }
  }

  const result = generatePrompt(schema, "react", "tailwind")

  if (result.success && result.prompt) {
    const filename = path.join(outputDir, "case4-responsive-behavior.md")
    fs.writeFileSync(filename, result.prompt, "utf-8")
    log(`✅ Prompt saved to: ${filename}`, "green")
    log(`\nPrompt Preview (first 800 chars):`, "yellow")
    console.log(result.prompt.substring(0, 800) + "...")
  } else {
    log(`❌ Failed to generate prompt: ${result.errors?.join(", ")}`, "yellow")
  }
}

// ============================================================================
// Case 5: Complex Multi-Component Layout with Component Links
// ============================================================================
function generateCase5_ComplexLayoutWithLinks() {
  log("\n" + "=".repeat(80), "cyan")
  log("CASE 5: Complex Layout with Component Links (MOST IMPORTANT)", "cyan")
  log("=".repeat(80), "cyan")

  const schema: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "sticky", position: { top: 0, zIndex: 50 } },
        layout: { type: "container", container: { maxWidth: "full", padding: "1rem", centered: true } },
        styling: { background: "white", border: "b", shadow: "sm" },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 0, width: 4, height: 1 }
        }
      },
      {
        id: "c2",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "sticky", position: { top: 0, zIndex: 50 } },
        layout: { type: "container", container: { maxWidth: "full", padding: "1rem", centered: true } },
        styling: { background: "white", border: "b", shadow: "sm" },
        responsiveCanvasLayout: {
          desktop: { x: 0, y: 0, width: 12, height: 1 }
        }
      },
      {
        id: "c3",
        name: "Sidebar",
        semanticTag: "aside",
        positioning: { type: "sticky", position: { top: 64, left: 0 } },
        layout: { type: "flex", flex: { direction: "column", gap: "1rem" } },
        styling: { background: "gray-50", border: "r" },
        responsiveCanvasLayout: {
          desktop: { x: 0, y: 1, width: 3, height: 6 }
        }
      },
      {
        id: "c4",
        name: "MainContent",
        semanticTag: "main",
        positioning: { type: "static" },
        layout: { type: "flex", flex: { direction: "column", gap: "2rem" } },
        styling: { className: "p-8" },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 1, width: 4, height: 6 },
          desktop: { x: 3, y: 1, width: 9, height: 6 }
        }
      },
      {
        id: "c5",
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "container", container: { maxWidth: "full", padding: "2rem 1rem", centered: true } },
        styling: { background: "gray-100", border: "t" },
        responsiveCanvasLayout: {
          mobile: { x: 0, y: 7, width: 4, height: 1 }
        }
      },
      {
        id: "c6",
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "container", container: { maxWidth: "full", padding: "2rem 1rem", centered: true } },
        styling: { background: "gray-100", border: "t" },
        responsiveCanvasLayout: {
          desktop: { x: 0, y: 7, width: 12, height: 1 }
        }
      }
    ],
    breakpoints: [
      { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }
    ],
    layouts: {
      mobile: { structure: "vertical", components: ["c1", "c4", "c5"] },
      desktop: { structure: "sidebar-main", components: ["c2", "c3", "c4", "c6"] }
    }
  }

  const componentLinks = [
    { source: "c1", target: "c2" }, // Header
    { source: "c5", target: "c6" }, // Footer
  ]

  const result = generatePrompt(schema, "react", "tailwind", componentLinks)

  if (result.success && result.prompt) {
    const filename = path.join(outputDir, "case5-complex-with-links.md")
    fs.writeFileSync(filename, result.prompt, "utf-8")
    log(`✅ Prompt saved to: ${filename}`, "green")

    log(`\n${"=".repeat(80)}`, "magenta")
    log(`FULL PROMPT OUTPUT (Case 5 - Most Important)`, "magenta")
    log(`${"=".repeat(80)}`, "magenta")
    console.log(result.prompt)
    log(`\n${"=".repeat(80)}`, "magenta")
  } else {
    log(`❌ Failed to generate prompt: ${result.errors?.join(", ")}`, "yellow")
  }
}

// ============================================================================
// Case 6: Side-by-Side Components (Canvas Grid 중요 케이스)
// ============================================================================
function generateCase6_SideBySideComponents() {
  log("\n" + "=".repeat(80), "cyan")
  log("CASE 6: Side-by-Side Components (Canvas Grid Visual Layout)", "cyan")
  log("=".repeat(80), "cyan")

  const schema: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "sticky", position: { top: 0, zIndex: 50 } },
        layout: { type: "container", container: { maxWidth: "full", padding: "1rem", centered: true } },
        styling: { background: "white", border: "b" },
        responsiveCanvasLayout: {
          desktop: { x: 0, y: 0, width: 12, height: 1 }
        }
      },
      {
        id: "c2",
        name: "LeftSection",
        semanticTag: "section",
        positioning: { type: "static" },
        layout: { type: "flex", flex: { direction: "column", gap: "1.5rem" } },
        styling: { className: "p-4" },
        responsiveCanvasLayout: {
          desktop: { x: 0, y: 1, width: 6, height: 6 }  // 왼쪽
        }
      },
      {
        id: "c3",
        name: "RightSection",
        semanticTag: "section",
        positioning: { type: "static" },
        layout: { type: "flex", flex: { direction: "column", gap: "1.5rem" } },
        styling: { className: "p-4" },
        responsiveCanvasLayout: {
          desktop: { x: 6, y: 1, width: 6, height: 6 }  // 오른쪽
        }
      },
      {
        id: "c4",
        name: "Footer",
        semanticTag: "footer",
        positioning: { type: "static" },
        layout: { type: "container", container: { maxWidth: "full", padding: "2rem 1rem", centered: true } },
        styling: { background: "gray-100", border: "t" },
        responsiveCanvasLayout: {
          desktop: { x: 0, y: 7, width: 12, height: 1 }
        }
      }
    ],
    breakpoints: [
      { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }
    ],
    layouts: {
      desktop: { structure: "vertical", components: ["c1", "c2", "c3", "c4"] }
    }
  }

  const result = generatePrompt(schema, "react", "tailwind")

  if (result.success && result.prompt) {
    const filename = path.join(outputDir, "case6-side-by-side.md")
    fs.writeFileSync(filename, result.prompt, "utf-8")
    log(`✅ Prompt saved to: ${filename}`, "green")
    log(`\nPrompt Preview (first 1200 chars):`, "yellow")
    console.log(result.prompt.substring(0, 1200) + "...")
  } else {
    log(`❌ Failed to generate prompt: ${result.errors?.join(", ")}`, "yellow")
  }
}

// ============================================================================
// 메인 실행
// ============================================================================

log("\n" + "=".repeat(80), "magenta")
log("📄 ACTUAL PROMPT GENERATION - Real Output Examples", "magenta")
log("=".repeat(80), "magenta")
log(`All prompts will be saved to: ${outputDir}/`, "green")

generateCase1_StickyHeader()
generateCase2_FlexLayout()
generateCase3_GridLayout()
generateCase4_ResponsiveBehavior()
generateCase6_SideBySideComponents()

// Case 5는 가장 중요하므로 마지막에 전체 출력
generateCase5_ComplexLayoutWithLinks()

log("\n" + "=".repeat(80), "magenta")
log("✅ All prompts generated successfully", "green")
log(`📂 Check the prompts in: ${outputDir}/`, "cyan")
log("=".repeat(80), "magenta")
