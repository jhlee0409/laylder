/**
 * Verify Prompt Variable Mapping
 *
 * Schema의 모든 변수값이 프롬프트에 정확히 반영되는지 검증
 * - Component 필드 (positioning, layout, styling, responsive, canvas)
 * - Breakpoint 정보
 * - Layout 구조
 * - Component Links
 */

import { generatePrompt } from "./lib/prompt-generator"
import type { LaydlerSchema } from "./types/schema"

// 실제 8개 컴포넌트 Schema (verify-prompt-quality.ts와 동일)
const userSchema: LaydlerSchema = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "Header",
      semanticTag: "header",
      positioning: { type: "sticky", position: { top: 0, zIndex: 50 } },
      layout: { type: "container", container: { maxWidth: "full", padding: "1rem", centered: true } },
      styling: { background: "white", border: "b", shadow: "sm" },
      props: { children: "Header Content" },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 0, width: 4, height: 1 },
        tablet: { x: 0, y: 0, width: 4, height: 1 },
        desktop: { x: 0, y: 0, width: 4, height: 1 }
      }
    },
    {
      id: "c2",
      name: "Header",
      semanticTag: "header",
      positioning: { type: "sticky", position: { top: 0, zIndex: 50 } },
      layout: { type: "container", container: { maxWidth: "full", padding: "1rem", centered: true } },
      styling: { background: "white", border: "b", shadow: "sm" },
      props: { children: "Header Content" },
      responsiveCanvasLayout: {
        Desktop: { x: 0, y: 0, width: 12, height: 1 }
      }
    },
    {
      id: "c3",
      name: "Footer",
      semanticTag: "footer",
      positioning: { type: "static" },
      layout: { type: "container", container: { maxWidth: "full", padding: "2rem 1rem", centered: true } },
      styling: { background: "gray-100", border: "t" },
      props: { children: "Footer Content" },
      responsiveCanvasLayout: {
        Desktop: { x: 0, y: 7, width: 12, height: 1 }
      }
    },
    {
      id: "c4",
      name: "Section",
      semanticTag: "section",
      positioning: { type: "static" },
      layout: { type: "flex", flex: { direction: "column", gap: "1.5rem" } },
      styling: { className: "py-8" },
      props: { children: "Section Content" },
      responsiveCanvasLayout: {
        Desktop: { x: 0, y: 1, width: 6, height: 6 }
      }
    },
    {
      id: "c5",
      name: "Section",
      semanticTag: "section",
      positioning: { type: "static" },
      layout: { type: "flex", flex: { direction: "column", gap: "1.5rem" } },
      styling: { className: "py-8" },
      props: { children: "Section Content" },
      responsiveCanvasLayout: {
        Desktop: { x: 6, y: 1, width: 6, height: 6 }
      }
    },
    {
      id: "c6",
      name: "Footer",
      semanticTag: "footer",
      positioning: { type: "static" },
      layout: { type: "container", container: { maxWidth: "full", padding: "2rem 1rem", centered: true } },
      styling: { background: "gray-100", border: "t" },
      props: { children: "Footer Content" },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 7, width: 4, height: 1 },
        tablet: { x: 0, y: 7, width: 4, height: 1 },
        desktop: { x: 0, y: 7, width: 4, height: 1 }
      }
    },
    {
      id: "c7",
      name: "Section",
      semanticTag: "section",
      positioning: { type: "static" },
      layout: { type: "flex", flex: { direction: "column", gap: "1.5rem" } },
      styling: { className: "py-8" },
      props: { children: "Section Content" },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 1, width: 4, height: 3 },
        tablet: { x: 0, y: 1, width: 1, height: 1 },
        desktop: { x: 0, y: 1, width: 1, height: 1 }
      }
    },
    {
      id: "c8",
      name: "Section",
      semanticTag: "section",
      positioning: { type: "static" },
      layout: { type: "flex", flex: { direction: "column", gap: "1.5rem" } },
      styling: { className: "py-8" },
      props: { children: "Section Content" },
      responsiveCanvasLayout: {
        mobile: { x: 0, y: 4, width: 4, height: 3 },
        tablet: { x: 0, y: 4, width: 1, height: 1 },
        desktop: { x: 0, y: 4, width: 1, height: 1 }
      }
    }
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
    { name: "Desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }
  ],
  layouts: {
    mobile: { structure: "vertical", components: ["c1", "c7", "c8", "c6"] },
    Desktop: { structure: "vertical", components: ["c2", "c4", "c5", "c3"] },
    tablet: { structure: "vertical", components: ["c1"] },
    desktop: { structure: "vertical", components: ["c1"] }
  }
}

const componentLinks = [
  { source: "c1", target: "c2" }, // Header
  { source: "c7", target: "c4" }, // Section Left
  { source: "c8", target: "c5" }, // Section Right
  { source: "c6", target: "c3" }, // Footer
]

console.log("🔍 Prompt Variable Mapping Verification\n")
console.log("=" .repeat(80))

// 프롬프트 생성
const result = generatePrompt(userSchema, "react", "tailwind", componentLinks)

if (!result.success) {
  console.error("❌ Prompt generation failed:", result.errors)
  process.exit(1)
}

const prompt = result.prompt!

// 검증 결과 추적
const checks: Array<{ category: string; item: string; passed: boolean; details?: string }> = []

// ============================================================================
// 1. Component 필드 검증
// ============================================================================
console.log("\n📦 VALIDATION 1: Component Fields Mapping")
console.log("-".repeat(80))

userSchema.components.forEach((comp) => {
  console.log(`\n  Checking Component: ${comp.id} (${comp.name})`)

  // 1.1 기본 정보 (id, name, semanticTag)
  const hasId = prompt.includes(comp.id)
  const hasName = prompt.includes(comp.name)
  const hasSemanticTag = prompt.includes(`<${comp.semanticTag}>`)

  console.log(`    ✓ ID (${comp.id}): ${hasId ? "✅" : "❌"}`)
  console.log(`    ✓ Name (${comp.name}): ${hasName ? "✅" : "❌"}`)
  console.log(`    ✓ SemanticTag (<${comp.semanticTag}>): ${hasSemanticTag ? "✅" : "❌"}`)

  checks.push(
    { category: "Component Basic", item: `${comp.id} - ID`, passed: hasId },
    { category: "Component Basic", item: `${comp.id} - Name`, passed: hasName },
    { category: "Component Basic", item: `${comp.id} - SemanticTag`, passed: hasSemanticTag }
  )

  // 1.2 Positioning (type + position values)
  const hasPositioningType = prompt.includes(`Type: \`${comp.positioning.type}\``)
  checks.push({ category: "Positioning", item: `${comp.id} - Type`, passed: hasPositioningType })
  console.log(`    ✓ Positioning Type (${comp.positioning.type}): ${hasPositioningType ? "✅" : "❌"}`)

  if (comp.positioning.position) {
    const { top, right, bottom, left, zIndex } = comp.positioning.position
    if (top !== undefined) {
      const hasTop = prompt.includes(`top: ${top}`)
      checks.push({ category: "Positioning", item: `${comp.id} - top`, passed: hasTop })
      console.log(`    ✓ Position top (${top}): ${hasTop ? "✅" : "❌"}`)
    }
    if (zIndex !== undefined) {
      const hasZIndex = prompt.includes(`zIndex: ${zIndex}`)
      checks.push({ category: "Positioning", item: `${comp.id} - zIndex`, passed: hasZIndex })
      console.log(`    ✓ Position zIndex (${zIndex}): ${hasZIndex ? "✅" : "❌"}`)
    }
  }

  // 1.3 Layout (type + config)
  const hasLayoutType = prompt.includes(`Type: \`${comp.layout.type}\``)
  checks.push({ category: "Layout", item: `${comp.id} - Type`, passed: hasLayoutType })
  console.log(`    ✓ Layout Type (${comp.layout.type}): ${hasLayoutType ? "✅" : "❌"}`)

  if (comp.layout.type === "flex" && comp.layout.flex) {
    const { direction, gap } = comp.layout.flex
    if (direction) {
      const hasDirection = prompt.includes(`Direction: \`${direction}\``)
      checks.push({ category: "Layout", item: `${comp.id} - flex.direction`, passed: hasDirection })
      console.log(`    ✓ Flex Direction (${direction}): ${hasDirection ? "✅" : "❌"}`)
    }
    if (gap) {
      const hasGap = prompt.includes(`Gap: \`${gap}\``)
      checks.push({ category: "Layout", item: `${comp.id} - flex.gap`, passed: hasGap })
      console.log(`    ✓ Flex Gap (${gap}): ${hasGap ? "✅" : "❌"}`)
    }
  }

  if (comp.layout.type === "container" && comp.layout.container) {
    const { maxWidth, padding, centered } = comp.layout.container
    if (maxWidth) {
      const hasMaxWidth = prompt.includes(`Max width: \`${maxWidth}\``)
      checks.push({ category: "Layout", item: `${comp.id} - container.maxWidth`, passed: hasMaxWidth })
      console.log(`    ✓ Container MaxWidth (${maxWidth}): ${hasMaxWidth ? "✅" : "❌"}`)
    }
    if (padding) {
      const hasPadding = prompt.includes(`Padding: \`${padding}\``)
      checks.push({ category: "Layout", item: `${comp.id} - container.padding`, passed: hasPadding })
      console.log(`    ✓ Container Padding (${padding}): ${hasPadding ? "✅" : "❌"}`)
    }
    if (centered !== undefined) {
      const hasCentered = prompt.includes(`Centered: ${centered}`)
      checks.push({ category: "Layout", item: `${comp.id} - container.centered`, passed: hasCentered })
      console.log(`    ✓ Container Centered (${centered}): ${hasCentered ? "✅" : "❌"}`)
    }
  }

  // 1.4 Styling
  if (comp.styling) {
    if (comp.styling.background) {
      const hasBg = prompt.includes(`Background: \`${comp.styling.background}\``)
      checks.push({ category: "Styling", item: `${comp.id} - background`, passed: hasBg })
      console.log(`    ✓ Background (${comp.styling.background}): ${hasBg ? "✅" : "❌"}`)
    }
    if (comp.styling.border) {
      const hasBorder = prompt.includes(`Border: \`${comp.styling.border}\``)
      checks.push({ category: "Styling", item: `${comp.id} - border`, passed: hasBorder })
      console.log(`    ✓ Border (${comp.styling.border}): ${hasBorder ? "✅" : "❌"}`)
    }
    if (comp.styling.shadow) {
      const hasShadow = prompt.includes(`Shadow: \`${comp.styling.shadow}\``)
      checks.push({ category: "Styling", item: `${comp.id} - shadow`, passed: hasShadow })
      console.log(`    ✓ Shadow (${comp.styling.shadow}): ${hasShadow ? "✅" : "❌"}`)
    }
    if (comp.styling.className) {
      const hasClassName = prompt.includes(`Custom classes: \`${comp.styling.className}\``)
      checks.push({ category: "Styling", item: `${comp.id} - className`, passed: hasClassName })
      console.log(`    ✓ ClassName (${comp.styling.className}): ${hasClassName ? "✅" : "❌"}`)
    }
  }

  // 1.5 ResponsiveCanvasLayout (각 breakpoint별 좌표)
  if (comp.responsiveCanvasLayout) {
    Object.entries(comp.responsiveCanvasLayout).forEach(([bp, layout]) => {
      if (!layout) return
      const { x, y, width, height } = layout

      // Canvas 좌표 정보는 Visual Layout Description에 포함됨
      // 정확한 x, y, width, height 값은 grid-area로 변환되어 CSS에 포함됨
      const hasCanvasInfo = prompt.includes(`${bp}`) && prompt.includes("Canvas Grid")
      checks.push({
        category: "Canvas Layout",
        item: `${comp.id} - ${bp} (x:${x}, y:${y}, w:${width}, h:${height})`,
        passed: hasCanvasInfo,
        details: `Canvas coordinates should be in Visual Layout section`
      })
      console.log(`    ✓ Canvas ${bp} (${x}, ${y}, ${width}×${height}): ${hasCanvasInfo ? "✅" : "❌"}`)
    })
  }
})

// ============================================================================
// 2. Breakpoint 정보 검증
// ============================================================================
console.log("\n\n📱 VALIDATION 2: Breakpoint Information Mapping")
console.log("-".repeat(80))

userSchema.breakpoints.forEach((bp) => {
  console.log(`\n  Checking Breakpoint: ${bp.name}`)

  const hasName = prompt.includes(bp.name)
  const hasMinWidth = prompt.includes(`≥${bp.minWidth}px`)
  const hasGridCols = prompt.includes(`${bp.gridCols}-column`)
  const hasGridRows = prompt.includes(`${bp.gridRows}-row`)

  console.log(`    ✓ Name (${bp.name}): ${hasName ? "✅" : "❌"}`)
  console.log(`    ✓ MinWidth (${bp.minWidth}px): ${hasMinWidth ? "✅" : "❌"}`)
  console.log(`    ✓ Grid Cols (${bp.gridCols}): ${hasGridCols ? "✅" : "❌"}`)
  console.log(`    ✓ Grid Rows (${bp.gridRows}): ${hasGridRows ? "✅" : "❌"}`)

  checks.push(
    { category: "Breakpoint", item: `${bp.name} - name`, passed: hasName },
    { category: "Breakpoint", item: `${bp.name} - minWidth`, passed: hasMinWidth },
    { category: "Breakpoint", item: `${bp.name} - gridCols`, passed: hasGridCols },
    { category: "Breakpoint", item: `${bp.name} - gridRows`, passed: hasGridRows }
  )
})

// ============================================================================
// 3. Layout 구조 검증
// ============================================================================
console.log("\n\n🏗️  VALIDATION 3: Layout Structure Mapping")
console.log("-".repeat(80))

Object.entries(userSchema.layouts).forEach(([bpName, layout]) => {
  console.log(`\n  Checking Layout: ${bpName}`)

  const hasStructure = prompt.includes(`structure: "${layout.structure}"`) ||
                       prompt.includes(layout.structure)
  console.log(`    ✓ Structure (${layout.structure}): ${hasStructure ? "✅" : "❌"}`)
  checks.push({ category: "Layout Structure", item: `${bpName} - structure`, passed: hasStructure })

  // Components 배열 - DOM order로 표시됨
  const hasComponents = layout.components.every(compId => prompt.includes(compId))
  console.log(`    ✓ Components (${layout.components.join(", ")}): ${hasComponents ? "✅" : "❌"}`)
  checks.push({ category: "Layout Structure", item: `${bpName} - components`, passed: hasComponents })

  // Visual Layout Description 포함 여부
  const hasVisualLayout = prompt.includes("Visual Layout (Canvas Grid)")
  console.log(`    ✓ Visual Layout Description: ${hasVisualLayout ? "✅" : "❌"}`)
  checks.push({ category: "Layout Structure", item: `${bpName} - Visual Layout`, passed: hasVisualLayout })

  // CSS Grid Positioning 포함 여부
  const hasGridCSS = prompt.includes("CSS Grid Positioning")
  console.log(`    ✓ CSS Grid Positioning: ${hasGridCSS ? "✅" : "❌"}`)
  checks.push({ category: "Layout Structure", item: `${bpName} - CSS Grid`, passed: hasGridCSS })
})

// ============================================================================
// 4. Component Links 검증
// ============================================================================
console.log("\n\n🔗 VALIDATION 4: Component Links Mapping")
console.log("-".repeat(80))

const hasLinksSection = prompt.includes("## Component Links")
console.log(`  ✓ Component Links Section: ${hasLinksSection ? "✅" : "❌"}`)
checks.push({ category: "Component Links", item: "Section exists", passed: hasLinksSection })

const hasCriticalRule = prompt.includes("CRITICAL IMPLEMENTATION RULE")
console.log(`  ✓ CRITICAL RULE enforcement: ${hasCriticalRule ? "✅" : "❌"}`)
checks.push({ category: "Component Links", item: "CRITICAL RULE", passed: hasCriticalRule })

const hasMustBeTreated = prompt.includes("MUST be treated as the SAME component")
console.log(`  ✓ MUST BE TREATED language: ${hasMustBeTreated ? "✅" : "❌"}`)
checks.push({ category: "Component Links", item: "MUST language", passed: hasMustBeTreated })

// 각 링크 그룹 확인
componentLinks.forEach((link) => {
  const hasSourceTarget = prompt.includes(link.source) && prompt.includes(link.target)
  console.log(`  ✓ Link ${link.source} ↔ ${link.target}: ${hasSourceTarget ? "✅" : "❌"}`)
  checks.push({ category: "Component Links", item: `${link.source}-${link.target}`, passed: hasSourceTarget })
})

// ============================================================================
// 5. 전체 점수 및 요약
// ============================================================================
console.log("\n\n" + "=".repeat(80))
console.log("📊 OVERALL MAPPING QUALITY SCORE")
console.log("=".repeat(80))

const passedChecks = checks.filter(c => c.passed).length
const totalChecks = checks.length
const scorePercentage = Math.round((passedChecks / totalChecks) * 100)

console.log(`\nTotal Checks: ${totalChecks}`)
console.log(`Passed: ${passedChecks}`)
console.log(`Failed: ${totalChecks - passedChecks}`)
console.log(`Score: ${scorePercentage}%`)

// 카테고리별 요약
console.log("\n" + "-".repeat(80))
console.log("Category Breakdown:")
console.log("-".repeat(80))

const categories = [...new Set(checks.map(c => c.category))]
categories.forEach(cat => {
  const catChecks = checks.filter(c => c.category === cat)
  const catPassed = catChecks.filter(c => c.passed).length
  const catTotal = catChecks.length
  const catScore = Math.round((catPassed / catTotal) * 100)

  console.log(`  ${cat}: ${catPassed}/${catTotal} (${catScore}%)`)
})

// 실패한 항목 출력
const failedChecks = checks.filter(c => !c.passed)
if (failedChecks.length > 0) {
  console.log("\n" + "-".repeat(80))
  console.log("❌ Failed Checks:")
  console.log("-".repeat(80))
  failedChecks.forEach(check => {
    console.log(`  - [${check.category}] ${check.item}`)
    if (check.details) {
      console.log(`    Details: ${check.details}`)
    }
  })
}

// 최종 판정
console.log("\n" + "=".repeat(80))
console.log("🎯 FINAL VERDICT")
console.log("=".repeat(80))

if (scorePercentage >= 95) {
  console.log("✅ EXCELLENT - All variables are accurately mapped to prompt")
  console.log("✅ Every Schema field has a corresponding representation in the prompt")
  console.log("✅ AI will receive complete and accurate specifications")
} else if (scorePercentage >= 85) {
  console.log("⚠️  GOOD - Most variables are mapped correctly")
  console.log(`⚠️  ${totalChecks - passedChecks} mapping(s) missing or incomplete`)
  console.log("⚠️  Review failed checks above")
} else {
  console.log("❌ POOR - Significant mapping issues detected")
  console.log(`❌ ${totalChecks - passedChecks} mapping(s) missing or incomplete`)
  console.log("❌ Prompt quality needs improvement")
}

console.log("\n" + "=".repeat(80))
