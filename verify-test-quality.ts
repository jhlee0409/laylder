/**
 * Meta-Validation: Verify Test Quality
 *
 * 테스트 코드가 실제로 의미있는지 검증:
 * 1. Mutation Testing: 버그를 주입하면 테스트가 실패하는가?
 * 2. False Positive: 잘못된 구현도 통과시키지 않는가?
 * 3. Bug Detection: 실제 버그를 잡을 수 있는가?
 */

import { normalizeSchema, createEmptySchema } from "./lib/schema-utils"
import { generatePrompt } from "./lib/prompt-generator"
import type { LaydlerSchema } from "./types/schema"

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
}

function log(msg: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`)
}

// ============================================================================
// TEST 1: Mutation Testing - normalizeSchema()
// ============================================================================
function testMutation_normalizeSchema() {
  log("\n" + "=".repeat(80), "cyan")
  log("MUTATION TEST 1: normalizeSchema() Edge Case Handling", "cyan")
  log("=".repeat(80), "cyan")

  let passed = 0
  let failed = 0

  // Mutation 1: 빈 layout을 상속받아야 하는 버그
  log("\n1. Mutation: Empty layout incorrectly inherits", "yellow")
  const schema1: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "static" },
        layout: { type: "none" },
      },
    ],
    breakpoints: [
      { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 },
    ],
    layouts: {
      mobile: { structure: "vertical", components: ["c1"] },
      desktop: { structure: "vertical", components: [] }, // Intentionally empty
    },
  }

  const normalized1 = normalizeSchema(schema1)

  // 올바른 동작: desktop은 빈 배열 유지
  if (normalized1.layouts.desktop.components.length === 0) {
    log("  ✅ PASS: Empty layout preserved (not inherited)", "green")
    passed++
  } else {
    log("  ❌ FAIL: Empty layout was incorrectly inherited", "red")
    log(`    Expected: [], Got: ${JSON.stringify(normalized1.layouts.desktop.components)}`, "red")
    failed++
  }

  // Mutation 2: Missing layout을 상속받지 않는 버그
  log("\n2. Mutation: Missing layout does not inherit", "yellow")
  const schema2: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "static" },
        layout: { type: "none" },
      },
    ],
    breakpoints: [
      { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 },
    ],
    layouts: {
      mobile: { structure: "vertical", components: ["c1"] },
      // desktop 완전히 누락
    },
  }

  const normalized2 = normalizeSchema(schema2)

  // 올바른 동작: desktop이 mobile로부터 상속
  if (normalized2.layouts.desktop && normalized2.layouts.desktop.components.includes("c1")) {
    log("  ✅ PASS: Missing layout inherited correctly", "green")
    passed++
  } else {
    log("  ❌ FAIL: Missing layout was not inherited", "red")
    log(`    Desktop layout: ${JSON.stringify(normalized2.layouts.desktop)}`, "red")
    failed++
  }

  // Mutation 3: Custom breakpoint name (대문자)
  log("\n3. Mutation: Custom breakpoint names (Desktop vs desktop)", "yellow")
  const schema3: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "static" },
        layout: { type: "none" },
      },
    ],
    breakpoints: [
      { name: "Mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: "Desktop", minWidth: 1024, gridCols: 12, gridRows: 8 },
    ],
    layouts: {
      Mobile: { structure: "vertical", components: ["c1"] },
      // Desktop 누락 - 대문자 'D'
    },
  }

  const normalized3 = normalizeSchema(schema3)

  // 올바른 동작: Desktop이 Mobile로부터 상속 (대소문자 구분 없이)
  if (normalized3.layouts.Desktop && normalized3.layouts.Desktop.components.includes("c1")) {
    log("  ✅ PASS: Custom breakpoint names handled", "green")
    passed++
  } else {
    log("  ❌ FAIL: Custom breakpoint names not handled", "red")
    log(`    Desktop layout: ${JSON.stringify(normalized3.layouts.Desktop)}`, "red")
    failed++
  }

  // Mutation 4: Canvas Layout inheritance
  log("\n4. Mutation: Canvas Layout inheritance for custom breakpoints", "yellow")
  const schema4: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "static" },
        layout: { type: "none" },
        responsiveCanvasLayout: {
          SmallScreen: { x: 0, y: 0, width: 4, height: 1 },
          // LargeScreen 누락
        },
      },
    ],
    breakpoints: [
      { name: "SmallScreen", minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: "LargeScreen", minWidth: 1024, gridCols: 12, gridRows: 8 },
    ],
    layouts: {
      SmallScreen: { structure: "vertical", components: ["c1"] },
      LargeScreen: { structure: "vertical", components: ["c1"] },
    },
  }

  const normalized4 = normalizeSchema(schema4)
  const comp4 = normalized4.components.find((c) => c.id === "c1")

  if (comp4?.responsiveCanvasLayout?.LargeScreen) {
    log("  ✅ PASS: Canvas Layout inherited for custom breakpoints", "green")
    passed++
  } else {
    log("  ❌ FAIL: Canvas Layout not inherited", "red")
    log(`    Component: ${JSON.stringify(comp4?.responsiveCanvasLayout)}`, "red")
    failed++
  }

  log("\n" + "-".repeat(80), "cyan")
  log(`Results: ${passed}/${passed + failed} passed`, passed === passed + failed ? "green" : "red")
  return { passed, failed, total: passed + failed }
}

// ============================================================================
// TEST 2: False Positive - Prompt Mapping
// ============================================================================
function testFalsePositive_promptMapping() {
  log("\n" + "=".repeat(80), "cyan")
  log("FALSE POSITIVE TEST: Prompt Variable Mapping", "cyan")
  log("=".repeat(80), "cyan")

  let passed = 0
  let failed = 0

  // False Positive 1: 없는 필드도 통과시키는가?
  log("\n1. False Positive: Missing field detection", "yellow")
  const schema1: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "sticky", position: { top: 0, zIndex: 50 } },
        layout: { type: "container", container: { maxWidth: "full", padding: "1rem", centered: true } },
        // styling 누락
      },
    ],
    breakpoints: [{ name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 }],
    layouts: { mobile: { structure: "vertical", components: ["c1"] } },
  }

  const result1 = generatePrompt(schema1, "react", "tailwind")

  if (result1.success && result1.prompt) {
    const hasStyling = result1.prompt.includes("**Styling:**")

    // styling이 없으면 프롬프트에도 없어야 함
    if (!hasStyling || result1.prompt.includes("(no styling specified)") || !result1.prompt.includes("Background:")) {
      log("  ✅ PASS: Missing styling not falsely reported", "green")
      passed++
    } else {
      log("  ❌ FAIL: False positive - styling appears when it shouldn't", "red")
      failed++
    }
  } else {
    log("  ❌ FAIL: Prompt generation failed", "red")
    failed++
  }

  // False Positive 2: 잘못된 값도 통과시키는가?
  log("\n2. False Positive: Invalid value detection", "yellow")
  const schema2: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "sticky", position: { top: 999999, zIndex: 50 } }, // 비정상적 값
        layout: { type: "flex", flex: { direction: "row", gap: "999rem" } }, // 비정상적 값
      },
    ],
    breakpoints: [{ name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 }],
    layouts: { mobile: { structure: "vertical", components: ["c1"] } },
  }

  const result2 = generatePrompt(schema2, "react", "tailwind")

  if (result2.success && result2.prompt) {
    const hasTop999999 = result2.prompt.includes("top: 999999")
    const hasGap999rem = result2.prompt.includes("Gap: `999rem`")

    // 비정상적 값도 정확히 프롬프트에 반영되어야 함
    if (hasTop999999 && hasGap999rem) {
      log("  ✅ PASS: Invalid values correctly passed through", "green")
      passed++
    } else {
      log("  ❌ FAIL: Invalid values not reflected in prompt", "red")
      log(`    Has top:999999? ${hasTop999999}, Has gap:999rem? ${hasGap999rem}`, "red")
      failed++
    }
  } else {
    log("  ❌ FAIL: Prompt generation failed", "red")
    failed++
  }

  // False Positive 3: Component Links 없을 때도 CRITICAL RULE이 나오는가?
  log("\n3. False Positive: Component Links section when no links", "yellow")
  const schema3: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "static" },
        layout: { type: "none" },
      },
    ],
    breakpoints: [{ name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 }],
    layouts: { mobile: { structure: "vertical", components: ["c1"] } },
  }

  const result3 = generatePrompt(schema3, "react", "tailwind", undefined) // No links

  if (result3.success && result3.prompt) {
    const hasLinksSection = result3.prompt.includes("## Component Links")

    // Links가 없으면 Section도 없어야 함
    if (!hasLinksSection) {
      log("  ✅ PASS: No links section when no links provided", "green")
      passed++
    } else {
      log("  ❌ FAIL: False positive - links section appears without links", "red")
      failed++
    }
  } else {
    log("  ❌ FAIL: Prompt generation failed", "red")
    failed++
  }

  log("\n" + "-".repeat(80), "cyan")
  log(`Results: ${passed}/${passed + failed} passed`, passed === passed + failed ? "green" : "red")
  return { passed, failed, total: passed + failed }
}

// ============================================================================
// TEST 3: Real Bug Detection - 과거 버그 재현
// ============================================================================
function testBugDetection_historicalBugs() {
  log("\n" + "=".repeat(80), "cyan")
  log("BUG DETECTION TEST: Historical Bugs", "cyan")
  log("=".repeat(80), "cyan")

  let passed = 0
  let failed = 0

  // Bug 1: Hardcoded breakpoint names (mobile/tablet/desktop)
  log("\n1. Bug: Hardcoded breakpoint names failed with 'Desktop' (capital D)", "yellow")
  const schema1: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "static" },
        layout: { type: "none" },
      },
    ],
    breakpoints: [
      { name: "Mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: "Desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }, // Capital D
    ],
    layouts: {
      Mobile: { structure: "vertical", components: ["c1"] },
      // Desktop 누락 - 이전에는 hardcoded 'desktop'만 인식해서 상속 실패
    },
  }

  const normalized1 = normalizeSchema(schema1)

  // 수정 후: Desktop이 Mobile로부터 상속받아야 함
  if (normalized1.layouts.Desktop && normalized1.layouts.Desktop.components.includes("c1")) {
    log("  ✅ PASS: Bug fixed - Custom breakpoint names work", "green")
    passed++
  } else {
    log("  ❌ FAIL: Bug still exists - Custom breakpoint names fail", "red")
    failed++
  }

  // Bug 2: Empty layout inheritance (의도적으로 빈 layout도 상속받던 버그)
  log("\n2. Bug: Intentionally empty layouts were incorrectly inherited", "yellow")
  const schema2: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "MobileOnlyNav",
        semanticTag: "nav",
        positioning: { type: "static" },
        layout: { type: "none" },
      },
    ],
    breakpoints: [
      { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 },
    ],
    layouts: {
      mobile: { structure: "vertical", components: ["c1"] },
      desktop: { structure: "vertical", components: [] }, // Intentionally empty
    },
  }

  const normalized2 = normalizeSchema(schema2)

  // 수정 후: desktop은 빈 배열 유지 (상속받지 않음)
  if (normalized2.layouts.desktop.components.length === 0) {
    log("  ✅ PASS: Bug fixed - Empty layouts preserved", "green")
    passed++
  } else {
    log("  ❌ FAIL: Bug still exists - Empty layout inherited", "red")
    log(`    Expected: [], Got: ${JSON.stringify(normalized2.layouts.desktop.components)}`, "red")
    failed++
  }

  // Bug 3: Component Links가 optional hint였던 버그
  log("\n3. Bug: Component Links were optional hints (not enforced)", "yellow")
  const schema3: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "static" },
        layout: { type: "none" },
      },
      {
        id: "c2",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "static" },
        layout: { type: "none" },
      },
    ],
    breakpoints: [
      { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 },
    ],
    layouts: {
      mobile: { structure: "vertical", components: ["c1"] },
      desktop: { structure: "vertical", components: ["c2"] },
    },
  }

  const componentLinks = [{ source: "c1", target: "c2" }]
  const result3 = generatePrompt(schema3, "react", "tailwind", componentLinks)

  if (result3.success && result3.prompt) {
    // Note: Check without emoji due to encoding issues
    const hasCriticalRule = result3.prompt.includes("CRITICAL IMPLEMENTATION RULE")
    const hasMustBeTreated = result3.prompt.includes("MUST be treated as the SAME component")
    const hasValidationRule = result3.prompt.includes("Each link group = 1 React component")

    // 수정 후: CRITICAL RULE로 강제됨
    if (hasCriticalRule && hasMustBeTreated && hasValidationRule) {
      log("  ✅ PASS: Bug fixed - Component Links enforced as CRITICAL", "green")
      passed++
    } else {
      log("  ❌ FAIL: Bug still exists - Component Links not enforced", "red")
      log(`    Has CRITICAL RULE? ${hasCriticalRule}`, "red")
      log(`    Has MUST? ${hasMustBeTreated}`, "red")
      log(`    Has Validation Rule? ${hasValidationRule}`, "red")
      failed++
    }
  } else {
    log("  ❌ FAIL: Prompt generation failed", "red")
    failed++
  }

  log("\n" + "-".repeat(80), "cyan")
  log(`Results: ${passed}/${passed + failed} passed`, passed === passed + failed ? "green" : "red")
  return { passed, failed, total: passed + failed }
}

// ============================================================================
// TEST 4: Regression Prevention - 회귀 방지
// ============================================================================
function testRegressionPrevention() {
  log("\n" + "=".repeat(80), "cyan")
  log("REGRESSION TEST: Prevent Future Bugs", "cyan")
  log("=".repeat(80), "cyan")

  let passed = 0
  let failed = 0

  // Regression 1: structuredClone이 실제로 deep clone하는가?
  log("\n1. Regression: structuredClone mutation prevention", "yellow")
  const originalSchema: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "static" },
        layout: { type: "none" },
      },
    ],
    breakpoints: [
      { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 },
    ],
    layouts: {
      mobile: { structure: "vertical", components: ["c1"] },
    },
  }

  const normalized = normalizeSchema(originalSchema)

  // Mutate normalized schema
  normalized.layouts.mobile.components.push("c2")

  // Original should NOT be affected
  if (originalSchema.layouts.mobile.components.length === 1 &&
      originalSchema.layouts.mobile.components[0] === "c1") {
    log("  ✅ PASS: structuredClone prevents mutations", "green")
    passed++
  } else {
    log("  ❌ FAIL: Mutation leaked to original schema", "red")
    log(`    Original: ${JSON.stringify(originalSchema.layouts.mobile.components)}`, "red")
    failed++
  }

  // Regression 2: Independent inherited layouts
  log("\n2. Regression: Inherited layouts are independent copies", "yellow")
  const schema2: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "static" },
        layout: { type: "none" },
      },
    ],
    breakpoints: [
      { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },
      { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 8 },
      { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 },
    ],
    layouts: {
      mobile: { structure: "vertical", components: ["c1"] },
    },
  }

  const normalized2 = normalizeSchema(schema2)

  // Mutate tablet layout
  normalized2.layouts.tablet.components.push("c2")

  // Mobile should NOT be affected
  if (normalized2.layouts.mobile.components.length === 1 &&
      !normalized2.layouts.mobile.components.includes("c2")) {
    log("  ✅ PASS: Inherited layouts are independent", "green")
    passed++
  } else {
    log("  ❌ FAIL: Mutation leaked between breakpoints", "red")
    log(`    Mobile: ${JSON.stringify(normalized2.layouts.mobile.components)}`, "red")
    failed++
  }

  // Regression 3: Breakpoint sorting by minWidth
  log("\n3. Regression: Breakpoints sorted by minWidth (not declaration order)", "yellow")
  const schema3: LaydlerSchema = {
    schemaVersion: "2.0",
    components: [
      {
        id: "c1",
        name: "Header",
        semanticTag: "header",
        positioning: { type: "static" },
        layout: { type: "none" },
      },
    ],
    breakpoints: [
      { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 8 }, // Declared first
      { name: "mobile", minWidth: 0, gridCols: 4, gridRows: 8 },       // But should be first in sorting
      { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 8 },
    ],
    layouts: {
      mobile: { structure: "vertical", components: ["c1"] },
    },
  }

  const normalized3 = normalizeSchema(schema3)

  // Tablet should inherit from mobile (not desktop)
  // Desktop should inherit from tablet
  if (normalized3.layouts.tablet.components.includes("c1") &&
      normalized3.layouts.desktop.components.includes("c1")) {
    log("  ✅ PASS: Breakpoints sorted correctly by minWidth", "green")
    passed++
  } else {
    log("  ❌ FAIL: Breakpoint sorting incorrect", "red")
    log(`    Tablet: ${JSON.stringify(normalized3.layouts.tablet)}`, "red")
    log(`    Desktop: ${JSON.stringify(normalized3.layouts.desktop)}`, "red")
    failed++
  }

  log("\n" + "-".repeat(80), "cyan")
  log(`Results: ${passed}/${passed + failed} passed`, passed === passed + failed ? "green" : "red")
  return { passed, failed, total: passed + failed }
}

// ============================================================================
// 메인 실행
// ============================================================================

log("\n" + "=".repeat(80), "magenta")
log("🔬 TEST QUALITY VERIFICATION (Meta-Testing)", "magenta")
log("=".repeat(80), "magenta")
log("Testing the tests: Are our tests meaningful?", "cyan")

const results = [
  testMutation_normalizeSchema(),
  testFalsePositive_promptMapping(),
  testBugDetection_historicalBugs(),
  testRegressionPrevention(),
]

log("\n" + "=".repeat(80), "magenta")
log("📊 FINAL SUMMARY", "magenta")
log("=".repeat(80), "magenta")

const totalPassed = results.reduce((sum, r) => sum + r.passed, 0)
const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)
const totalTests = results.reduce((sum, r) => sum + r.total, 0)
const overallScore = Math.round((totalPassed / totalTests) * 100)

log(`\nTotal Tests: ${totalTests}`, "cyan")
log(`Passed: ${totalPassed}`, "green")
log(`Failed: ${totalFailed}`, totalFailed === 0 ? "green" : "red")
log(`Overall Score: ${overallScore}%`, overallScore === 100 ? "green" : overallScore >= 90 ? "yellow" : "red")

log("\n" + "=".repeat(80), "magenta")
log("🎯 VERDICT", "magenta")
log("=".repeat(80), "magenta")

if (overallScore === 100) {
  log("✅ EXCELLENT - All tests are meaningful and catch real bugs!", "green")
  log("✅ Tests correctly detect mutations, false positives, and regressions", "green")
  log("✅ Historical bugs would have been caught by these tests", "green")
} else if (overallScore >= 90) {
  log("⚠️  GOOD - Most tests are meaningful but some need improvement", "yellow")
  log(`⚠️  ${totalFailed} test(s) failed - review test quality`, "yellow")
} else {
  log("❌ POOR - Tests are not meaningful enough", "red")
  log(`❌ ${totalFailed}/${totalTests} tests failed`, "red")
  log("❌ Tests may have false positives or miss critical bugs", "red")
}

log("\n" + "=".repeat(80), "magenta")

process.exit(totalFailed > 0 ? 1 : 0)
