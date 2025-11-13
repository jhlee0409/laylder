/**
 * Snap-to-Grid - 드래그 앤 드롭 시 그리드에 자동 정렬
 *
 * 2025년 모던 레이아웃 빌더 패턴 적용
 * - Figma Smart Guides
 * - Framer Canvas Snapping
 * - Webflow Grid Alignment
 */

/**
 * Snap 설정
 */
export interface SnapConfig {
  /** Snap 활성화 여부 */
  enabled: boolean
  /** Snap 임계값 (픽셀) - 이 거리 이내면 Snap */
  threshold: number
  /** Grid 셀 크기 (픽셀) */
  gridCellWidth: number
  gridCellHeight: number
}

/**
 * Snap 결과
 */
export interface SnapResult {
  /** Snap된 x 좌표 (그리드 셀 인덱스) */
  x: number
  /** Snap된 y 좌표 (그리드 셀 인덱스) */
  y: number
  /** Snap 여부 */
  snapped: boolean
}

/**
 * 픽셀 좌표를 그리드 셀 좌표로 변환하면서 Snap 적용
 *
 * @param pixelX - 픽셀 X 좌표
 * @param pixelY - 픽셀 Y 좌표
 * @param config - Snap 설정
 * @returns Snap 결과
 *
 * @example
 * const result = snapToGrid(245, 123, {
 *   enabled: true,
 *   threshold: 10,
 *   gridCellWidth: 50,
 *   gridCellHeight: 50
 * })
 * // pixelX=245 → 245/50 = 4.9 → 가장 가까운 셀은 5
 * // 245 - (5 * 50) = 245 - 250 = -5 (threshold 10 이내) → Snap!
 * // result = { x: 5, y: 2, snapped: true }
 */
export function snapToGrid(
  pixelX: number,
  pixelY: number,
  config: SnapConfig
): SnapResult {
  if (!config.enabled) {
    // Snap 비활성화 시: 정수 좌표로만 변환 (기존 동작)
    return {
      x: Math.floor(pixelX / config.gridCellWidth),
      y: Math.floor(pixelY / config.gridCellHeight),
      snapped: false,
    }
  }

  // 정확한 실수 좌표 계산
  const exactX = pixelX / config.gridCellWidth
  const exactY = pixelY / config.gridCellHeight

  // 가장 가까운 정수 좌표 (반올림)
  const nearestX = Math.round(exactX)
  const nearestY = Math.round(exactY)

  // 픽셀 단위로 거리 계산
  const distanceX = Math.abs(pixelX - nearestX * config.gridCellWidth)
  const distanceY = Math.abs(pixelY - nearestY * config.gridCellHeight)

  // Threshold 이내면 Snap, 아니면 Floor (드래그 중)
  const snappedX =
    distanceX <= config.threshold ? nearestX : Math.floor(exactX)
  const snappedY =
    distanceY <= config.threshold ? nearestY : Math.floor(exactY)

  const snapped =
    distanceX <= config.threshold || distanceY <= config.threshold

  return {
    x: snappedX,
    y: snappedY,
    snapped,
  }
}

/**
 * 그리드 셀 좌표를 픽셀 좌표로 역변환
 *
 * @param gridX - 그리드 X 좌표 (셀 인덱스)
 * @param gridY - 그리드 Y 좌표 (셀 인덱스)
 * @param cellWidth - 셀 너비 (픽셀)
 * @param cellHeight - 셀 높이 (픽셀)
 * @returns 픽셀 좌표
 */
export function gridToPixel(
  gridX: number,
  gridY: number,
  cellWidth: number,
  cellHeight: number
): { x: number; y: number } {
  return {
    x: gridX * cellWidth,
    y: gridY * cellHeight,
  }
}

/**
 * Snap 가이드 라인 정보
 * (시각적 피드백용)
 */
export interface SnapGuide {
  /** 가이드 타입 */
  type: "vertical" | "horizontal"
  /** 픽셀 좌표 */
  position: number
  /** 가이드 활성화 여부 */
  active: boolean
}

/**
 * 현재 드래그 위치에 대한 Snap 가이드 라인 계산
 *
 * @param pixelX - 현재 드래그 중인 픽셀 X 좌표
 * @param pixelY - 현재 드래그 중인 픽셀 Y 좌표
 * @param config - Snap 설정
 * @returns Snap 가이드 라인 정보
 *
 * @example
 * const guides = calculateSnapGuides(245, 123, config)
 * // guides = [
 * //   { type: 'vertical', position: 250, active: true },  // X축 Snap 가이드
 * //   { type: 'horizontal', position: 100, active: true }  // Y축 Snap 가이드
 * // ]
 */
export function calculateSnapGuides(
  pixelX: number,
  pixelY: number,
  config: SnapConfig
): SnapGuide[] {
  if (!config.enabled) {
    return []
  }

  const guides: SnapGuide[] = []

  // X축 가이드 (수직선)
  const exactX = pixelX / config.gridCellWidth
  const nearestX = Math.round(exactX)
  const snapLineX = nearestX * config.gridCellWidth
  const distanceX = Math.abs(pixelX - snapLineX)

  if (distanceX <= config.threshold) {
    guides.push({
      type: "vertical",
      position: snapLineX,
      active: true,
    })
  }

  // Y축 가이드 (수평선)
  const exactY = pixelY / config.gridCellHeight
  const nearestY = Math.round(exactY)
  const snapLineY = nearestY * config.gridCellHeight
  const distanceY = Math.abs(pixelY - snapLineY)

  if (distanceY <= config.threshold) {
    guides.push({
      type: "horizontal",
      position: snapLineY,
      active: true,
    })
  }

  return guides
}

/**
 * 기본 Snap 설정
 */
export const DEFAULT_SNAP_CONFIG: SnapConfig = {
  enabled: true,
  threshold: 10, // 10px 이내면 Snap
  gridCellWidth: 50,
  gridCellHeight: 50,
}

/**
 * Snap 활성화/비활성화 토글
 *
 * @param currentConfig - 현재 설정
 * @returns 새로운 설정
 */
export function toggleSnap(currentConfig: SnapConfig): SnapConfig {
  return {
    ...currentConfig,
    enabled: !currentConfig.enabled,
  }
}

/**
 * Shift 키 상태에 따라 Snap 설정 조정
 * (Shift 키 누르면 Snap 비활성화 - 자유 배치)
 *
 * @param baseConfig - 기본 설정
 * @param shiftPressed - Shift 키 눌림 여부
 * @returns 조정된 설정
 */
export function getSnapConfigWithModifier(
  baseConfig: SnapConfig,
  shiftPressed: boolean
): SnapConfig {
  return {
    ...baseConfig,
    enabled: baseConfig.enabled && !shiftPressed,
  }
}
