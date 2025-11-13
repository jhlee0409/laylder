/**
 * Unit Tests for Grid Constraints System
 *
 * 2025년 모던 레이아웃 빌더 패턴 검증
 * - 동적 그리드 크기 제약
 * - 컴포넌트 기반 최소값 계산
 * - 안전성 검증 로직
 */

import {
  calculateMinimumGridSize,
  isGridResizeSafe,
  getAffectedComponentIds,
  suggestGridCompaction,
  isComponentOutOfBounds,
} from "../lib/grid-constraints"
import type { Component } from "../types/schema"

// ===========================
// Test Utilities
// ===========================

type LogColor = "green" | "red" | "yellow" | "blue" | "magenta" | "cyan"

function log(message: string, color: LogColor = "blue") {
  const colors = {
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
  }
  const reset = "\x1b[0m"
  console.log(`${colors[color]}${message}${reset}`)
}

function section(title: string) {
  log(`\n${"=".repeat(60)}`, "cyan")
  log(title, "cyan")
  log(`${"=".repeat(60)}`, "cyan")
}

// ===========================
// Test Data Factories
// ===========================

function createComponent(
  id: string,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number
): Component {
  return {
    id,
    name,
    semanticTag: "section",
    positioning: {
      type: "static",
    },
    layout: {
      type: "flex",
      flex: {
        direction: "column",
        justify: "start",
        items: "stretch",
        gap: 0,
        wrap: "nowrap",
      },
    },
    canvasLayout: {
      x,
      y,
      width,
      height,
    },
  }
}

function createResponsiveComponent(
  id: string,
  name: string,
  mobileLayout: { x: number; y: number; width: number; height: number },
  desktopLayout: { x: number; y: number; width: number; height: number }
): Component {
  return {
    id,
    name,
    semanticTag: "section",
    positioning: {
      type: "static",
    },
    layout: {
      type: "flex",
      flex: {
        direction: "column",
        justify: "start",
        items: "stretch",
        gap: 0,
        wrap: "nowrap",
      },
    },
    canvasLayout: mobileLayout,
    responsiveCanvasLayout: {
      mobile: mobileLayout,
      desktop: desktopLayout,
    },
  }
}

// ===========================
// Test 1: calculateMinimumGridSize
// ===========================

function testCalculateMinimumGridSize() {
  section("Test 1: calculateMinimumGridSize")

  try {
    // Test 1.1: Empty canvas
    log("\n[1.1] Empty Canvas", "yellow")
    const emptyResult = calculateMinimumGridSize([], "mobile")
    const emptyPass = emptyResult.minRows === 2 && emptyResult.minCols === 2
    log(
      `  Empty canvas: { minRows: ${emptyResult.minRows}, minCols: ${emptyResult.minCols} }`,
      emptyPass ? "green" : "red"
    )
    log(`  Expected: { minRows: 2, minCols: 2 }`, "blue")
    if (!emptyPass) throw new Error("Empty canvas test failed")

    // Test 1.2: Single component
    log("\n[1.2] Single Component (Footer at y=10, height=2)", "yellow")
    const footer = createComponent("footer", "Footer", 0, 10, 12, 2)
    const singleResult = calculateMinimumGridSize([footer], "mobile")
    const singlePass = singleResult.minRows === 12 && singleResult.minCols === 12
    log(
      `  Single component: { minRows: ${singleResult.minRows}, minCols: ${singleResult.minCols} }`,
      singlePass ? "green" : "red"
    )
    log(`  Expected: { minRows: 12, minCols: 12 } (y + height = 10 + 2)`, "blue")
    if (!singlePass) throw new Error("Single component test failed")

    // Test 1.3: Multiple components
    log("\n[1.3] Multiple Components", "yellow")
    const header = createComponent("header", "Header", 0, 0, 12, 2)
    const sidebar = createComponent("sidebar", "Sidebar", 0, 2, 3, 8)
    const main = createComponent("main", "Main", 3, 2, 9, 8)
    const components = [header, sidebar, main, footer]

    const multiResult = calculateMinimumGridSize(components, "mobile")
    const multiPass = multiResult.minRows === 12 && multiResult.minCols === 12
    log(
      `  Multiple components: { minRows: ${multiResult.minRows}, minCols: ${multiResult.minCols} }`,
      multiPass ? "green" : "red"
    )
    log(`  Expected: { minRows: 12, minCols: 12 }`, "blue")
    if (!multiPass) throw new Error("Multiple components test failed")

    // Test 1.4: Responsive layouts
    log("\n[1.4] Responsive Layouts (mobile vs desktop)", "yellow")
    const responsiveComp = createResponsiveComponent(
      "hero",
      "Hero",
      { x: 0, y: 0, width: 12, height: 4 }, // mobile: smaller
      { x: 0, y: 0, width: 12, height: 8 }  // desktop: larger
    )

    const mobileMin = calculateMinimumGridSize([responsiveComp], "mobile")
    const desktopMin = calculateMinimumGridSize([responsiveComp], "desktop")

    const responsivePass =
      mobileMin.minRows === 4 &&
      mobileMin.minCols === 12 &&
      desktopMin.minRows === 8 &&
      desktopMin.minCols === 12

    log(
      `  Mobile: { minRows: ${mobileMin.minRows}, minCols: ${mobileMin.minCols} }`,
      responsivePass ? "green" : "red"
    )
    log(
      `  Desktop: { minRows: ${desktopMin.minRows}, minCols: ${desktopMin.minCols} }`,
      responsivePass ? "green" : "red"
    )
    log(`  Expected: Mobile { 4, 12 }, Desktop { 8, 12 }`, "blue")
    if (!responsivePass) throw new Error("Responsive layouts test failed")

    log("\n✅ Test 1: All calculateMinimumGridSize tests passed", "green")
    return true
  } catch (error) {
    log(`\n❌ Test 1 Failed: ${error}`, "red")
    return false
  }
}

// ===========================
// Test 2: isGridResizeSafe
// ===========================

function testIsGridResizeSafe() {
  section("Test 2: isGridResizeSafe")

  try {
    const footer = createComponent("footer", "Footer", 0, 10, 12, 2)
    const components = [footer]

    // Test 2.1: Safe reduction
    log("\n[2.1] Safe Reduction (12 rows → 13 rows is safe)", "yellow")
    const safeResult = isGridResizeSafe(13, 12, components, "mobile")
    log(`  Safe: ${safeResult.safe}`, safeResult.safe ? "green" : "red")
    log(`  Reason: ${safeResult.reason || "N/A"}`, "blue")
    if (!safeResult.safe) throw new Error("Safe reduction should be allowed")

    // Test 2.2: Unsafe row reduction
    log("\n[2.2] Unsafe Row Reduction (12 rows → 10 rows, footer at y=10)", "yellow")
    const unsafeRowResult = isGridResizeSafe(10, 12, components, "mobile")
    log(`  Safe: ${unsafeRowResult.safe}`, !unsafeRowResult.safe ? "green" : "red")
    log(`  Reason: ${unsafeRowResult.reason}`, "blue")
    log(
      `  Affected components: ${unsafeRowResult.affectedComponents?.length || 0}`,
      "blue"
    )
    log(
      `  Minimum required: { rows: ${unsafeRowResult.minimumRequired?.rows}, cols: ${unsafeRowResult.minimumRequired?.cols} }`,
      "blue"
    )
    if (unsafeRowResult.safe) throw new Error("Unsafe row reduction should be rejected")

    // Test 2.3: Unsafe column reduction
    log("\n[2.3] Unsafe Column Reduction (12 cols → 10 cols, footer width=12)", "yellow")
    const unsafeColResult = isGridResizeSafe(12, 10, components, "mobile")
    log(`  Safe: ${unsafeColResult.safe}`, !unsafeColResult.safe ? "green" : "red")
    log(`  Reason: ${unsafeColResult.reason}`, "blue")
    if (unsafeColResult.safe) throw new Error("Unsafe column reduction should be rejected")

    // Test 2.4: Exact minimum boundary
    log("\n[2.4] Exact Minimum Boundary (12 rows → 12 rows)", "yellow")
    const boundaryResult = isGridResizeSafe(12, 12, components, "mobile")
    log(`  Safe: ${boundaryResult.safe}`, boundaryResult.safe ? "green" : "red")
    if (!boundaryResult.safe) throw new Error("Exact minimum should be allowed")

    // Test 2.5: Multiple affected components
    log("\n[2.5] Multiple Affected Components", "yellow")
    const header = createComponent("header", "Header", 0, 0, 12, 2)
    const sidebar = createComponent("sidebar", "Sidebar", 0, 2, 3, 8)
    const main = createComponent("main", "Main", 3, 2, 9, 8)
    const multiComponents = [header, sidebar, main, footer]

    const multiUnsafeResult = isGridResizeSafe(5, 12, multiComponents, "mobile")
    log(`  Safe: ${multiUnsafeResult.safe}`, !multiUnsafeResult.safe ? "green" : "red")
    log(
      `  Affected components: ${multiUnsafeResult.affectedComponents?.length || 0}`,
      "blue"
    )
    multiUnsafeResult.affectedComponents?.forEach((comp) => {
      log(
        `    - ${comp.name} at (${comp.currentPosition.x}, ${comp.currentPosition.y}) size (${comp.currentPosition.width}×${comp.currentPosition.height})`,
        "magenta"
      )
    })
    if (
      multiUnsafeResult.safe ||
      (multiUnsafeResult.affectedComponents?.length || 0) < 2
    ) {
      throw new Error("Multiple components should be affected")
    }

    log("\n✅ Test 2: All isGridResizeSafe tests passed", "green")
    return true
  } catch (error) {
    log(`\n❌ Test 2 Failed: ${error}`, "red")
    return false
  }
}

// ===========================
// Test 3: getAffectedComponentIds
// ===========================

function testGetAffectedComponentIds() {
  section("Test 3: getAffectedComponentIds")

  try {
    const footer = createComponent("footer", "Footer", 0, 10, 12, 2)
    const header = createComponent("header", "Header", 0, 0, 12, 2)
    const sidebar = createComponent("sidebar", "Sidebar", 0, 2, 3, 8)
    const components = [header, sidebar, footer]

    // Test 3.1: Multiple affected components (sidebar ends at y=10, footer at y=10)
    log("\n[3.1] Multiple Affected Components (reduce rows to 5)", "yellow")
    const multiAffected = getAffectedComponentIds(5, 12, components, "mobile")
    log(`  Affected IDs: ${multiAffected.join(", ")}`, "blue")
    log(`  Expected: sidebar (y=2, height=8 → ends at 10), footer (at y=10)`, "blue")
    const multiPass =
      multiAffected.length === 2 &&
      multiAffected.includes("sidebar") &&
      multiAffected.includes("footer")
    if (!multiPass) throw new Error("Should affect both sidebar and footer")

    // Test 3.2: Affected components at exact boundary
    log("\n[3.2] Affected Components at Exact Boundary (reduce rows to 2)", "yellow")
    const boundaryAffected = getAffectedComponentIds(2, 12, components, "mobile")
    log(`  Affected IDs: ${boundaryAffected.join(", ")}`, "blue")
    log(`  Expected: sidebar, footer (header at y=0 height=2 is OK)`, "blue")
    const boundaryPass =
      boundaryAffected.length === 2 &&
      boundaryAffected.includes("sidebar") &&
      boundaryAffected.includes("footer")
    if (!boundaryPass) throw new Error("Should affect sidebar and footer")

    // Test 3.3: No affected components
    log("\n[3.3] No Affected Components (safe reduction)", "yellow")
    const noAffected = getAffectedComponentIds(15, 12, components, "mobile")
    log(`  Affected IDs: ${noAffected.join(", ") || "(none)"}`, "blue")
    const noPass = noAffected.length === 0
    if (!noPass) throw new Error("Should have no affected components")

    log("\n✅ Test 3: All getAffectedComponentIds tests passed", "green")
    return true
  } catch (error) {
    log(`\n❌ Test 3 Failed: ${error}`, "red")
    return false
  }
}

// ===========================
// Test 4: suggestGridCompaction
// ===========================

function testSuggestGridCompaction() {
  section("Test 4: suggestGridCompaction")

  try {
    const footer = createComponent("footer", "Footer", 0, 10, 12, 2)
    const components = [footer]

    // Test 4.1: Compaction suggestion
    log("\n[4.1] Compaction Suggestion (20×12 grid, footer ends at row 12)", "yellow")
    const suggestion = suggestGridCompaction(components, 20, 12, "mobile")
    log(
      `  Can reduce rows: ${suggestion.canReduceRows} (current: 20, min: 12)`,
      "blue"
    )
    log(
      `  Can reduce cols: ${suggestion.canReduceCols} (current: 12, min: 12)`,
      "blue"
    )
    const suggestionPass =
      suggestion.canReduceRows === 8 && suggestion.canReduceCols === 0
    if (!suggestionPass) throw new Error("Compaction suggestion incorrect")

    // Test 4.2: No compaction possible
    log("\n[4.2] No Compaction Possible (exact fit)", "yellow")
    const noCompaction = suggestGridCompaction(components, 12, 12, "mobile")
    log(`  Can reduce rows: ${noCompaction.canReduceRows}`, "blue")
    log(`  Can reduce cols: ${noCompaction.canReduceCols}`, "blue")
    const noCompactionPass =
      noCompaction.canReduceRows === 0 && noCompaction.canReduceCols === 0
    if (!noCompactionPass) throw new Error("Should have no compaction space")

    // Test 4.3: Empty canvas compaction
    log("\n[4.3] Empty Canvas (20×12 grid, no components)", "yellow")
    const emptyCompaction = suggestGridCompaction([], 20, 12, "mobile")
    log(`  Can reduce rows: ${emptyCompaction.canReduceRows}`, "blue")
    log(`  Can reduce cols: ${emptyCompaction.canReduceCols}`, "blue")
    const emptyPass =
      emptyCompaction.canReduceRows === 18 && emptyCompaction.canReduceCols === 10
    log(`  Expected: { canReduceRows: 18, canReduceCols: 10 } (min is 2×2)`, "blue")
    if (!emptyPass) throw new Error("Empty canvas compaction incorrect")

    log("\n✅ Test 4: All suggestGridCompaction tests passed", "green")
    return true
  } catch (error) {
    log(`\n❌ Test 4 Failed: ${error}`, "red")
    return false
  }
}

// ===========================
// Test 5: isComponentOutOfBounds
// ===========================

function testIsComponentOutOfBounds() {
  section("Test 5: isComponentOutOfBounds")

  try {
    const footer = createComponent("footer", "Footer", 0, 10, 12, 2)

    // Test 5.1: In bounds
    log("\n[5.1] Component In Bounds (12×12 grid, footer at y=10 height=2)", "yellow")
    const inBounds = isComponentOutOfBounds(footer, 12, 12, "mobile")
    log(`  Out of bounds: ${inBounds}`, !inBounds ? "green" : "red")
    if (inBounds) throw new Error("Should be in bounds")

    // Test 5.2: Out of bounds (rows)
    log("\n[5.2] Out of Bounds - Rows (10×12 grid, footer at y=10)", "yellow")
    const outOfBoundsRows = isComponentOutOfBounds(footer, 10, 12, "mobile")
    log(`  Out of bounds: ${outOfBoundsRows}`, outOfBoundsRows ? "green" : "red")
    if (!outOfBoundsRows) throw new Error("Should be out of bounds (rows)")

    // Test 5.3: Out of bounds (columns)
    log("\n[5.3] Out of Bounds - Columns (12×10 grid, footer width=12)", "yellow")
    const outOfBoundsCols = isComponentOutOfBounds(footer, 12, 10, "mobile")
    log(`  Out of bounds: ${outOfBoundsCols}`, outOfBoundsCols ? "green" : "red")
    if (!outOfBoundsCols) throw new Error("Should be out of bounds (columns)")

    // Test 5.4: Negative position
    log("\n[5.4] Negative Position (x=-1)", "yellow")
    const negativeComp = createComponent("bad", "Bad", -1, 0, 5, 5)
    const negativeOutOfBounds = isComponentOutOfBounds(negativeComp, 12, 12, "mobile")
    log(`  Out of bounds: ${negativeOutOfBounds}`, negativeOutOfBounds ? "green" : "red")
    if (!negativeOutOfBounds) throw new Error("Negative position should be out of bounds")

    // Test 5.5: Component without canvas layout
    log("\n[5.5] Component Without Canvas Layout", "yellow")
    const noLayoutComp: Component = {
      id: "no-layout",
      name: "NoLayout",
      semanticTag: "section",
      positioning: { type: "static" },
      layout: {
        type: "flex",
        flex: {
          direction: "column",
          justify: "start",
          items: "stretch",
          gap: 0,
          wrap: "nowrap",
        },
      },
    }
    const noLayoutOutOfBounds = isComponentOutOfBounds(noLayoutComp, 12, 12, "mobile")
    log(
      `  Out of bounds: ${noLayoutOutOfBounds} (should be false)`,
      !noLayoutOutOfBounds ? "green" : "red"
    )
    if (noLayoutOutOfBounds) throw new Error("No layout should return false")

    log("\n✅ Test 5: All isComponentOutOfBounds tests passed", "green")
    return true
  } catch (error) {
    log(`\n❌ Test 5 Failed: ${error}`, "red")
    return false
  }
}

// ===========================
// Edge Cases & Integration Tests
// ===========================

function testEdgeCases() {
  section("Test 6: Edge Cases & Integration")

  try {
    // Test 6.1: Sparse layout (components scattered across large grid)
    log("\n[6.1] Sparse Layout (components far apart)", "yellow")
    const topLeft = createComponent("top-left", "TopLeft", 0, 0, 3, 3)
    const bottomRight = createComponent("bottom-right", "BottomRight", 9, 17, 3, 3)
    const sparseComponents = [topLeft, bottomRight]

    const sparseMin = calculateMinimumGridSize(sparseComponents, "mobile")
    log(
      `  Minimum: { rows: ${sparseMin.minRows}, cols: ${sparseMin.minCols} }`,
      "blue"
    )
    log(
      `  Expected: { rows: 20, cols: 12 } (bottomRight: y=17 + height=3)`,
      "blue"
    )
    const sparsePass = sparseMin.minRows === 20 && sparseMin.minCols === 12
    if (!sparsePass) throw new Error("Sparse layout calculation incorrect")

    // Test 6.2: Overlapping components (validation should still work)
    log("\n[6.2] Overlapping Components", "yellow")
    const comp1 = createComponent("comp1", "Comp1", 0, 0, 6, 6)
    const comp2 = createComponent("comp2", "Comp2", 3, 3, 6, 6)
    const overlapping = [comp1, comp2]

    const overlapMin = calculateMinimumGridSize(overlapping, "mobile")
    log(`  Minimum: { rows: ${overlapMin.minRows}, cols: ${overlapMin.minCols} }`, "blue")
    log(`  Expected: { rows: 9, cols: 9 } (comp2: x=3+6, y=3+6)`, "blue")
    const overlapPass = overlapMin.minRows === 9 && overlapMin.minCols === 9
    if (!overlapPass) throw new Error("Overlapping components calculation incorrect")

    // Test 6.3: 1×1 component
    log("\n[6.3] 1×1 Component", "yellow")
    const tiny = createComponent("tiny", "Tiny", 5, 5, 1, 1)
    const tinyMin = calculateMinimumGridSize([tiny], "mobile")
    log(`  Minimum: { rows: ${tinyMin.minRows}, cols: ${tinyMin.minCols} }`, "blue")
    log(`  Expected: { rows: 6, cols: 6 } (x=5+1, y=5+1)`, "blue")
    const tinyPass = tinyMin.minRows === 6 && tinyMin.minCols === 6
    if (!tinyPass) throw new Error("1×1 component calculation incorrect")

    // Test 6.4: Full-width component (x=0, width=12)
    log("\n[6.4] Full-Width Component", "yellow")
    const fullWidth = createComponent("full-width", "FullWidth", 0, 5, 12, 3)
    const fullWidthMin = calculateMinimumGridSize([fullWidth], "mobile")
    log(
      `  Minimum: { rows: ${fullWidthMin.minRows}, cols: ${fullWidthMin.minCols} }`,
      "blue"
    )
    log(`  Expected: { rows: 8, cols: 12 }`, "blue")
    const fullWidthPass = fullWidthMin.minRows === 8 && fullWidthMin.minCols === 12
    if (!fullWidthPass) throw new Error("Full-width component calculation incorrect")

    // Test 6.5: Integration - resize with affected components info
    log("\n[6.5] Integration - Full Validation Flow", "yellow")
    const integrationComps = [topLeft, bottomRight]
    const validation = isGridResizeSafe(15, 10, integrationComps, "mobile")
    log(`  Safe: ${validation.safe}`, !validation.safe ? "green" : "red")
    log(`  Affected: ${validation.affectedComponents?.length || 0} components`, "blue")

    const affectedIds = getAffectedComponentIds(15, 10, integrationComps, "mobile")
    log(`  Affected IDs: ${affectedIds.join(", ")}`, "blue")

    const suggestion = suggestGridCompaction(integrationComps, 25, 15, "mobile")
    log(
      `  Compaction suggestion: rows -${suggestion.canReduceRows}, cols -${suggestion.canReduceCols}`,
      "blue"
    )

    const integrationPass =
      !validation.safe &&
      affectedIds.includes("bottom-right") &&
      suggestion.canReduceRows === 5 &&
      suggestion.canReduceCols === 3

    if (!integrationPass) throw new Error("Integration flow failed")

    log("\n✅ Test 6: All edge cases and integration tests passed", "green")
    return true
  } catch (error) {
    log(`\n❌ Test 6 Failed: ${error}`, "red")
    return false
  }
}

// ===========================
// Main Test Runner
// ===========================

function main() {
  section("Grid Constraints Unit Tests")
  log("Testing lib/grid-constraints.ts", "blue")
  log("2025년 모던 레이아웃 빌더 패턴 검증\n", "blue")

  const results = {
    test1: testCalculateMinimumGridSize(),
    test2: testIsGridResizeSafe(),
    test3: testGetAffectedComponentIds(),
    test4: testSuggestGridCompaction(),
    test5: testIsComponentOutOfBounds(),
    test6: testEdgeCases(),
  }

  section("Test Summary")

  const passed = Object.values(results).filter((r) => r).length
  const total = Object.keys(results).length

  log(`\nTotal Tests: ${total}`, "blue")
  log(`Passed: ${passed}`, passed === total ? "green" : "yellow")
  log(`Failed: ${total - passed}`, total - passed === 0 ? "green" : "red")

  if (passed === total) {
    log("\n🎉 All tests passed! Grid constraint system is working correctly.", "green")
    process.exit(0)
  } else {
    log("\n❌ Some tests failed. Please review the output above.", "red")
    process.exit(1)
  }
}

// Run tests
main()
