/**
 * Snap-to-Grid Unit Test
 *
 * Tests the snap-to-grid functionality following CLAUDE.md testing strategy:
 * - AAA 패턴 (Arrange-Act-Assert)
 * - 명확한 함수 구조
 * - 상세한 검증 포인트
 * - 독립적인 테스트
 */

import {
  snapToGrid,
  gridToPixel,
  calculateSnapGuides,
  toggleSnap,
  getSnapConfigWithModifier,
  DEFAULT_SNAP_CONFIG,
  type SnapConfig,
  type SnapResult,
  type SnapGuide,
} from "../lib/snap-to-grid"

// 색상 코드 함수
type Color = "green" | "red" | "yellow" | "blue" | "cyan" | "magenta"

function log(message: string, color?: Color) {
  const colors: Record<Color, string> = {
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m",
  }
  const reset = "\x1b[0m"
  const colorCode = color ? colors[color] : ""
  console.log(`${colorCode}${message}${reset}`)
}

function section(title: string) {
  log(`\n${"=".repeat(80)}`, "cyan")
  log(title, "cyan")
  log("=".repeat(80), "cyan")
}

/**
 * Test 1: snapToGrid 기본 동작
 */
function testSnapToGridBasics() {
  section("Test 1: snapToGrid 기본 동작 테스트")

  try {
    // Arrange: 테스트 데이터 준비
    const config: SnapConfig = {
      enabled: true,
      threshold: 10,
      gridCellWidth: 100,
      gridCellHeight: 100,
    }

    // Act & Assert: 정확히 그리드 위치 (스냅 불필요)
    const result1 = snapToGrid(200, 300, config)
    const test1 = result1.x === 2 && result1.y === 3
    log(
      `✓ Test 1.1: 정확한 그리드 위치 (200, 300) → (2, 3) [${result1.snapped ? "snapped" : "no snap"}]`,
      test1 ? "green" : "red"
    )

    // Act & Assert: Threshold 이내 (스냅 발생)
    const result2 = snapToGrid(245, 307, config)
    const test2 = result2.x === 2 && result2.y === 3 && result2.snapped
    log(
      `✓ Test 1.2: Threshold 이내 (245, 307) → (${result2.x}, ${result2.y}) [${result2.snapped ? "snapped" : "no snap"}]`,
      test2 ? "green" : "red"
    )

    // Act & Assert: Threshold 초과 (스냅 없음)
    const result3 = snapToGrid(285, 320, config)
    const test3 = result3.x === 2 && result3.y === 3 && !result3.snapped
    log(
      `✓ Test 1.3: Threshold 초과 (285, 320) → (${result3.x}, ${result3.y}) [${result3.snapped ? "snapped" : "no snap"}]`,
      test3 ? "green" : "red"
    )

    // Act & Assert: Snap 비활성화
    const result4 = snapToGrid(245, 307, { ...config, enabled: false })
    const test4 = result4.x === 2 && result4.y === 3 && !result4.snapped
    log(
      `✓ Test 1.4: Snap 비활성화 (245, 307) → (${result4.x}, ${result4.y}) [${result4.snapped ? "snapped" : "no snap"}]`,
      test4 ? "green" : "red"
    )

    return test1 && test2 && test3 && test4
  } catch (error) {
    log(`❌ 테스트 실패: ${error}`, "red")
    console.error(error)
    return false
  }
}

/**
 * Test 2: gridToPixel 역변환
 */
function testGridToPixel() {
  section("Test 2: gridToPixel 역변환 테스트")

  try {
    // Arrange
    const cellWidth = 100
    const cellHeight = 100

    // Act & Assert
    const result1 = gridToPixel(0, 0, cellWidth, cellHeight)
    const test1 = result1.x === 0 && result1.y === 0
    log(
      `✓ Test 2.1: (0, 0) → (${result1.x}, ${result1.y}) pixels`,
      test1 ? "green" : "red"
    )

    const result2 = gridToPixel(5, 10, cellWidth, cellHeight)
    const test2 = result2.x === 500 && result2.y === 1000
    log(
      `✓ Test 2.2: (5, 10) → (${result2.x}, ${result2.y}) pixels`,
      test2 ? "green" : "red"
    )

    // Round-trip 검증
    const gridX = 3
    const gridY = 7
    const pixel = gridToPixel(gridX, gridY, cellWidth, cellHeight)
    const snapResult = snapToGrid(pixel.x, pixel.y, {
      ...DEFAULT_SNAP_CONFIG,
      gridCellWidth: cellWidth,
      gridCellHeight: cellHeight,
    })
    const test3 = snapResult.x === gridX && snapResult.y === gridY
    log(
      `✓ Test 2.3: Round-trip (${gridX}, ${gridY}) → (${pixel.x}, ${pixel.y}) → (${snapResult.x}, ${snapResult.y})`,
      test3 ? "green" : "red"
    )

    return test1 && test2 && test3
  } catch (error) {
    log(`❌ 테스트 실패: ${error}`, "red")
    console.error(error)
    return false
  }
}

/**
 * Test 3: calculateSnapGuides 가이드 라인 계산
 */
function testCalculateSnapGuides() {
  section("Test 3: calculateSnapGuides 가이드 라인 계산 테스트")

  try {
    // Arrange
    const config: SnapConfig = {
      enabled: true,
      threshold: 10,
      gridCellWidth: 50,
      gridCellHeight: 50,
    }

    // Act & Assert: Threshold 이내 (가이드 생성) - X축만
    const guides1 = calculateSnapGuides(245, 123, config)
    const hasVerticalGuide = guides1.some(
      (g) => g.type === "vertical" && g.active && g.position === 250
    )
    const test1 = hasVerticalGuide && guides1.length === 1
    log(
      `✓ Test 3.1: Threshold 이내 X축 (245, 123) → Vertical(250) [${guides1.length}개 가이드]`,
      test1 ? "green" : "red"
    )

    // Act & Assert: Threshold 초과 (가이드 없음)
    const guides2 = calculateSnapGuides(285, 165, config)
    const test2 = guides2.length === 0
    log(
      `✓ Test 3.2: Threshold 초과 (285, 165) → 가이드 ${guides2.length}개`,
      test2 ? "green" : "red"
    )

    // Act & Assert: Snap 비활성화 (가이드 없음)
    const guides3 = calculateSnapGuides(245, 123, { ...config, enabled: false })
    const test3 = guides3.length === 0
    log(
      `✓ Test 3.3: Snap 비활성화 → 가이드 ${guides3.length}개`,
      test3 ? "green" : "red"
    )

    return test1 && test2 && test3
  } catch (error) {
    log(`❌ 테스트 실패: ${error}`, "red")
    console.error(error)
    return false
  }
}

/**
 * Test 4: toggleSnap 토글 함수
 */
function testToggleSnap() {
  section("Test 4: toggleSnap 토글 함수 테스트")

  try {
    // Arrange
    const config1: SnapConfig = {
      enabled: true,
      threshold: 10,
      gridCellWidth: 50,
      gridCellHeight: 50,
    }

    // Act & Assert: Toggle OFF
    const config2 = toggleSnap(config1)
    const test1 = config2.enabled === false
    log(
      `✓ Test 4.1: Snap ON → Toggle → Snap ${config2.enabled ? "ON" : "OFF"}`,
      test1 ? "green" : "red"
    )

    // Act & Assert: Toggle ON
    const config3 = toggleSnap(config2)
    const test2 = config3.enabled === true
    log(
      `✓ Test 4.2: Snap OFF → Toggle → Snap ${config3.enabled ? "ON" : "OFF"}`,
      test2 ? "green" : "red"
    )

    return test1 && test2
  } catch (error) {
    log(`❌ 테스트 실패: ${error}`, "red")
    console.error(error)
    return false
  }
}

/**
 * Test 5: getSnapConfigWithModifier (Shift 키 모디파이어)
 */
function testGetSnapConfigWithModifier() {
  section("Test 5: getSnapConfigWithModifier (Shift 키) 테스트")

  try {
    // Arrange
    const baseConfig: SnapConfig = {
      enabled: true,
      threshold: 10,
      gridCellWidth: 50,
      gridCellHeight: 50,
    }

    // Act & Assert: Shift 키 누르지 않음
    const config1 = getSnapConfigWithModifier(baseConfig, false)
    const test1 = config1.enabled === true
    log(
      `✓ Test 5.1: Shift 키 OFF → Snap ${config1.enabled ? "ON" : "OFF"}`,
      test1 ? "green" : "red"
    )

    // Act & Assert: Shift 키 누름 (Snap 비활성화)
    const config2 = getSnapConfigWithModifier(baseConfig, true)
    const test2 = config2.enabled === false
    log(
      `✓ Test 5.2: Shift 키 ON → Snap ${config2.enabled ? "ON" : "OFF"}`,
      test2 ? "green" : "red"
    )

    // Act & Assert: Snap이 이미 비활성화된 경우
    const disabledConfig: SnapConfig = { ...baseConfig, enabled: false }
    const config3 = getSnapConfigWithModifier(disabledConfig, false)
    const test3 = config3.enabled === false
    log(
      `✓ Test 5.3: Snap OFF + Shift OFF → Snap ${config3.enabled ? "ON" : "OFF"}`,
      test3 ? "green" : "red"
    )

    return test1 && test2 && test3
  } catch (error) {
    log(`❌ 테스트 실패: ${error}`, "red")
    console.error(error)
    return false
  }
}

/**
 * Test 6: Edge Cases (경계 조건)
 */
function testEdgeCases() {
  section("Test 6: Edge Cases (경계 조건) 테스트")

  try {
    const config: SnapConfig = {
      enabled: true,
      threshold: 10,
      gridCellWidth: 100,
      gridCellHeight: 100,
    }

    // Act & Assert: 음수 좌표 (floor 동작 - 의도된 동작)
    const result1 = snapToGrid(-50, -50, config)
    const test1 = result1.x === -1 && result1.y === -1
    log(
      `✓ Test 6.1: 음수 좌표 (-50, -50) → (${result1.x}, ${result1.y}) [floor 동작]`,
      test1 ? "green" : "red"
    )

    // Act & Assert: 매우 큰 좌표
    const result2 = snapToGrid(10000, 20000, config)
    const test2 = result2.x === 100 && result2.y === 200
    log(
      `✓ Test 6.2: 큰 좌표 (10000, 20000) → (${result2.x}, ${result2.y})`,
      test2 ? "green" : "red"
    )

    // Act & Assert: 0,0 좌표
    const result3 = snapToGrid(0, 0, config)
    const test3 = result3.x === 0 && result3.y === 0
    log(
      `✓ Test 6.3: 원점 (0, 0) → (${result3.x}, ${result3.y})`,
      test3 ? "green" : "red"
    )

    // Act & Assert: Threshold 정확히 경계
    const result4 = snapToGrid(210, 210, config)
    const test4 = result4.x === 2 && result4.y === 2 && result4.snapped
    log(
      `✓ Test 6.4: Threshold 경계 (210, 210) → (${result4.x}, ${result4.y}) [${result4.snapped ? "snapped" : "no snap"}]`,
      test4 ? "green" : "red"
    )

    return test1 && test2 && test3 && test4
  } catch (error) {
    log(`❌ 테스트 실패: ${error}`, "red")
    console.error(error)
    return false
  }
}

/**
 * 메인 실행
 */
function main() {
  log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                     Snap-to-Grid Unit Test Suite                          ║
╚════════════════════════════════════════════════════════════════════════════╝
`, "cyan")

  const results = [
    { name: "snapToGrid 기본 동작", passed: testSnapToGridBasics() },
    { name: "gridToPixel 역변환", passed: testGridToPixel() },
    { name: "calculateSnapGuides 가이드 라인", passed: testCalculateSnapGuides() },
    { name: "toggleSnap 토글", passed: testToggleSnap() },
    { name: "getSnapConfigWithModifier (Shift 키)", passed: testGetSnapConfigWithModifier() },
    { name: "Edge Cases (경계 조건)", passed: testEdgeCases() },
  ]

  // Summary
  log(`\n${"=".repeat(80)}`, "cyan")
  log("SUMMARY", "cyan")
  log("=".repeat(80), "cyan")

  results.forEach((result) => {
    const status = result.passed ? "✅" : "❌"
    log(`${status} ${result.name}: ${result.passed ? "PASSED" : "FAILED"}`, result.passed ? "green" : "red")
  })

  // Overall status
  const allPassed = results.every((r) => r.passed)
  log(`\n${"=".repeat(80)}`, "cyan")
  if (allPassed) {
    log(`✅ ALL TESTS PASSED - Snap-to-Grid 기능이 정상 동작합니다!`, "green")
  } else {
    log(`❌ SOME TESTS FAILED - 실패한 테스트를 확인하세요`, "red")
  }
  log("=".repeat(80), "cyan")
}

main()
