/**
 * Snap-to-Grid Unit Tests
 */

import { describe, it, expect } from 'vitest'
import {
  snapToGrid,
  gridToPixel,
  calculateSnapGuides,
  toggleSnap,
  getSnapConfigWithModifier,
  DEFAULT_SNAP_CONFIG,
  type SnapConfig,
} from '../snap-to-grid'

describe('Snap-to-Grid', () => {
  describe('snapToGrid', () => {
    const config: SnapConfig = {
      enabled: true,
      threshold: 10,
      gridCellWidth: 50,
      gridCellHeight: 50,
    }

    it('should snap to nearest grid when within threshold', () => {
      // 245px → closest cell is 5 (250px), distance is 5px (< 10px threshold)
      const result = snapToGrid(245, 123, config)

      expect(result.x).toBe(5) // Snapped to nearest
      expect(result.y).toBe(2) // 123 → closest is 2 (100px), but distance is 23px (> threshold), so floor(123/50) = 2
      expect(result.snapped).toBe(true)
    })

    it('should use floor when outside threshold', () => {
      // 220px → closest cell is 4 (200px), distance is 20px (> 10px threshold)
      const result = snapToGrid(220, 180, config)

      expect(result.x).toBe(4) // floor(220/50) = 4
      expect(result.y).toBe(3) // floor(180/50) = 3
      expect(result.snapped).toBe(false)
    })

    it('should snap to exact grid coordinates', () => {
      const result = snapToGrid(250, 100, config)

      expect(result.x).toBe(5)
      expect(result.y).toBe(2)
      expect(result.snapped).toBe(true)
    })

    it('should return floor coordinates when snap is disabled', () => {
      const disabledConfig: SnapConfig = { ...config, enabled: false }
      const result = snapToGrid(245, 123, disabledConfig)

      expect(result.x).toBe(4) // floor(245/50) = 4
      expect(result.y).toBe(2) // floor(123/50) = 2
      expect(result.snapped).toBe(false)
    })

    it('should handle zero coordinates', () => {
      const result = snapToGrid(0, 0, config)

      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
      expect(result.snapped).toBe(true)
    })

    it('should handle negative coordinates', () => {
      const result = snapToGrid(-10, -5, config)

      expect(result.x).toBeLessThanOrEqual(0)
      expect(result.y).toBeLessThanOrEqual(0)
    })

    it('should handle different cell sizes', () => {
      const customConfig: SnapConfig = {
        enabled: true,
        threshold: 5,
        gridCellWidth: 100,
        gridCellHeight: 80,
      }

      const result = snapToGrid(203, 162, customConfig)

      expect(result.x).toBe(2) // 203 is close to 200 (2*100), distance 3px < 5px threshold
      expect(result.y).toBe(2) // 162 is close to 160 (2*80), distance 2px < 5px threshold
    })
  })

  describe('gridToPixel', () => {
    it('should convert grid coordinates to pixel coordinates', () => {
      const result = gridToPixel(5, 3, 50, 50)

      expect(result.x).toBe(250) // 5 * 50
      expect(result.y).toBe(150) // 3 * 50
    })

    it('should handle zero grid coordinates', () => {
      const result = gridToPixel(0, 0, 50, 50)

      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
    })

    it('should handle different cell sizes', () => {
      const result = gridToPixel(3, 2, 100, 80)

      expect(result.x).toBe(300)
      expect(result.y).toBe(160)
    })
  })

  describe('calculateSnapGuides', () => {
    const config: SnapConfig = {
      enabled: true,
      threshold: 10,
      gridCellWidth: 50,
      gridCellHeight: 50,
    }

    it('should return snap guides when within threshold', () => {
      const guides = calculateSnapGuides(245, 103, config)

      expect(guides).toHaveLength(2)

      const verticalGuide = guides.find((g) => g.type === 'vertical')
      const horizontalGuide = guides.find((g) => g.type === 'horizontal')

      expect(verticalGuide).toBeDefined()
      expect(verticalGuide?.position).toBe(250) // Snap line for x
      expect(verticalGuide?.active).toBe(true)

      expect(horizontalGuide).toBeDefined()
      expect(horizontalGuide?.position).toBe(100) // Snap line for y
      expect(horizontalGuide?.active).toBe(true)
    })

    it('should return empty array when snap is disabled', () => {
      const disabledConfig: SnapConfig = { ...config, enabled: false }
      const guides = calculateSnapGuides(245, 103, disabledConfig)

      expect(guides).toHaveLength(0)
    })

    it('should not show guides when outside threshold', () => {
      const guides = calculateSnapGuides(225, 175, config)

      // 225 → closest is 200 (4*50), distance is 25px > 10px threshold
      // 175 → closest is 200 (4*50), distance is 25px > 10px threshold

      expect(guides).toHaveLength(0)
    })

    it('should show only one guide when one axis is within threshold', () => {
      const guides = calculateSnapGuides(245, 175, config)

      // x: 245 → 250, distance 5px < 10px (within threshold)
      // y: 175 → 200, distance 25px > 10px (outside threshold)

      expect(guides).toHaveLength(1)
      expect(guides[0].type).toBe('vertical')
    })
  })

  describe('toggleSnap', () => {
    it('should toggle snap from enabled to disabled', () => {
      const config: SnapConfig = { ...DEFAULT_SNAP_CONFIG, enabled: true }
      const toggled = toggleSnap(config)

      expect(toggled.enabled).toBe(false)
      expect(toggled.threshold).toBe(config.threshold)
      expect(toggled.gridCellWidth).toBe(config.gridCellWidth)
    })

    it('should toggle snap from disabled to enabled', () => {
      const config: SnapConfig = { ...DEFAULT_SNAP_CONFIG, enabled: false }
      const toggled = toggleSnap(config)

      expect(toggled.enabled).toBe(true)
    })
  })

  describe('getSnapConfigWithModifier', () => {
    const baseConfig: SnapConfig = { ...DEFAULT_SNAP_CONFIG, enabled: true }

    it('should disable snap when shift is pressed', () => {
      const config = getSnapConfigWithModifier(baseConfig, true)

      expect(config.enabled).toBe(false)
    })

    it('should keep snap enabled when shift is not pressed', () => {
      const config = getSnapConfigWithModifier(baseConfig, false)

      expect(config.enabled).toBe(true)
    })

    it('should keep snap disabled if base config is disabled', () => {
      const disabledConfig: SnapConfig = { ...baseConfig, enabled: false }
      const config = getSnapConfigWithModifier(disabledConfig, false)

      expect(config.enabled).toBe(false)
    })
  })

  describe('DEFAULT_SNAP_CONFIG', () => {
    it('should have snap enabled by default', () => {
      expect(DEFAULT_SNAP_CONFIG.enabled).toBe(true)
    })

    it('should have reasonable default values', () => {
      expect(DEFAULT_SNAP_CONFIG.threshold).toBe(10)
      expect(DEFAULT_SNAP_CONFIG.gridCellWidth).toBe(50)
      expect(DEFAULT_SNAP_CONFIG.gridCellHeight).toBe(50)
    })
  })
})
