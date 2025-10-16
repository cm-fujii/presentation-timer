/**
 * @file AlertConfig.test.js
 * @description AlertConfig モデルのユニットテスト
 */

import { describe, it, expect } from 'vitest';
import {
  createAlertPoint,
  isValidAlertPoint,
  createDefaultAlertConfig,
  addAlertPoint,
  removeAlertPoint,
  updateAlertPointSound,
  setVolume,
  setEnabled,
  isValidAlertConfig,
} from '../../js/models/AlertConfig.js';
import { SoundType } from '../../js/models/SoundType.js';

describe('AlertConfig', () => {
  describe('createAlertPoint', () => {
    it('should create AlertPoint with default sound type (GONG)', () => {
      const point = createAlertPoint(60);

      expect(point).toEqual({
        seconds: 60,
        soundType: SoundType.GONG,
      });
    });

    it('should create AlertPoint with specified sound type', () => {
      const bellPoint = createAlertPoint(30, SoundType.BELL);
      const gongPoint = createAlertPoint(0, SoundType.GONG);

      expect(bellPoint).toEqual({
        seconds: 30,
        soundType: SoundType.BELL,
      });

      expect(gongPoint).toEqual({
        seconds: 0,
        soundType: SoundType.GONG,
      });
    });

    it('should create AlertPoint with various time values', () => {
      const points = [
        createAlertPoint(0, SoundType.GONG),
        createAlertPoint(30, SoundType.BELL),
        createAlertPoint(60, SoundType.GONG),
        createAlertPoint(180, SoundType.BELL),
      ];

      expect(points[0].seconds).toBe(0);
      expect(points[1].seconds).toBe(30);
      expect(points[2].seconds).toBe(60);
      expect(points[3].seconds).toBe(180);
    });
  });

  describe('isValidAlertPoint', () => {
    it('should return true for valid AlertPoint', () => {
      const validPoints = [
        createAlertPoint(0, SoundType.GONG),
        createAlertPoint(60, SoundType.BELL),
        { seconds: 30, soundType: SoundType.GONG },
        { seconds: 180, soundType: SoundType.BELL },
      ];

      validPoints.forEach((point) => {
        expect(isValidAlertPoint(point)).toBe(true);
      });
    });

    it('should return false for invalid AlertPoint - not an object', () => {
      expect(isValidAlertPoint(null)).toBe(false);
      expect(isValidAlertPoint(undefined)).toBe(false);
      expect(isValidAlertPoint(60)).toBe(false);
      expect(isValidAlertPoint('invalid')).toBe(false);
      expect(isValidAlertPoint([])).toBe(false);
    });

    it('should return false for invalid seconds', () => {
      const invalidPoints = [
        { seconds: -1, soundType: SoundType.GONG }, // 負の数
        { seconds: 1.5, soundType: SoundType.BELL }, // 小数
        { seconds: '60', soundType: SoundType.GONG }, // 文字列
        { seconds: null, soundType: SoundType.BELL }, // null
        { soundType: SoundType.GONG }, // seconds未定義
      ];

      invalidPoints.forEach((point) => {
        expect(isValidAlertPoint(point)).toBe(false);
      });
    });

    it('should return false for invalid soundType', () => {
      const invalidPoints = [
        { seconds: 60, soundType: 'invalid' }, // 無効な文字列
        { seconds: 60, soundType: 'BELL' }, // 大文字
        { seconds: 60, soundType: null }, // null
        { seconds: 60, soundType: undefined }, // undefined
        { seconds: 60 }, // soundType未定義
        { seconds: 60, soundType: 123 }, // 数値
      ];

      invalidPoints.forEach((point) => {
        expect(isValidAlertPoint(point)).toBe(false);
      });
    });

    it('should handle edge case - zero seconds', () => {
      const point = { seconds: 0, soundType: SoundType.GONG };
      expect(isValidAlertPoint(point)).toBe(true);
    });
  });

  describe('updateAlertPointSound', () => {
    it('should update sound type of existing alert point', () => {
      const config = createDefaultAlertConfig();
      // デフォルト: [{ 60, 'gong' }, { 0, 'gong' }]

      const updated = updateAlertPointSound(config, 60, SoundType.BELL);

      expect(updated.points).toContainEqual({
        seconds: 60,
        soundType: SoundType.BELL,
      });
      expect(updated.points).toContainEqual({
        seconds: 0,
        soundType: SoundType.GONG,
      });
    });

    it('should update multiple alert points independently', () => {
      let config = createDefaultAlertConfig();
      // デフォルト: [{ 60, 'gong' }, { 0, 'gong' }]

      config = updateAlertPointSound(config, 60, SoundType.BELL);
      config = updateAlertPointSound(config, 0, SoundType.BELL);

      expect(config.points).toEqual([
        { seconds: 60, soundType: SoundType.BELL },
        { seconds: 0, soundType: SoundType.BELL },
      ]);
    });

    it('should not modify other alert points', () => {
      const config = {
        enabled: true,
        volume: 0.8,
        points: [
          { seconds: 180, soundType: SoundType.GONG },
          { seconds: 60, soundType: SoundType.BELL },
          { seconds: 0, soundType: SoundType.GONG },
        ],
      };

      const updated = updateAlertPointSound(config, 60, SoundType.GONG);

      expect(updated.points).toContainEqual({ seconds: 180, soundType: SoundType.GONG });
      expect(updated.points).toContainEqual({ seconds: 60, soundType: SoundType.GONG });
      expect(updated.points).toContainEqual({ seconds: 0, soundType: SoundType.GONG });
    });

    it('should not modify original config (immutability)', () => {
      const original = createDefaultAlertConfig();
      const originalPoints = [...original.points];

      const updated = updateAlertPointSound(original, 60, SoundType.BELL);

      expect(original.points).toEqual(originalPoints);
      expect(original).not.toBe(updated);
      expect(original.points).not.toBe(updated.points);
    });

    it('should handle non-existent alert point gracefully', () => {
      const config = createDefaultAlertConfig();
      // 存在しない120秒のポイントを更新しようとする
      const updated = updateAlertPointSound(config, 120, SoundType.BELL);

      // 元のポイントはそのまま
      expect(updated.points).toEqual(config.points);
    });

    it('should preserve other config properties', () => {
      const config = {
        enabled: false,
        volume: 0.5,
        points: [{ seconds: 60, soundType: SoundType.GONG }],
      };

      const updated = updateAlertPointSound(config, 60, SoundType.BELL);

      expect(updated.enabled).toBe(false);
      expect(updated.volume).toBe(0.5);
    });
  });

  describe('createDefaultAlertConfig', () => {
    it('should create default config with AlertPoint objects', () => {
      const config = createDefaultAlertConfig();

      expect(config.enabled).toBe(true);
      expect(config.volume).toBe(0.8);
      expect(config.points).toHaveLength(2);
      expect(config.points).toContainEqual({
        seconds: 60,
        soundType: SoundType.GONG,
      });
      expect(config.points).toContainEqual({
        seconds: 0,
        soundType: SoundType.GONG,
      });
    });
  });

  describe('addAlertPoint', () => {
    it('should add new alert point and sort in descending order', () => {
      const config = createDefaultAlertConfig();
      const newPoint = createAlertPoint(30, SoundType.BELL);

      const updated = addAlertPoint(config, newPoint);

      expect(updated.points).toHaveLength(3);
      expect(updated.points[0].seconds).toBe(60);
      expect(updated.points[1].seconds).toBe(30);
      expect(updated.points[2].seconds).toBe(0);
    });

    it('should replace existing alert point with same seconds', () => {
      const config = createDefaultAlertConfig();
      const replacementPoint = createAlertPoint(60, SoundType.BELL);

      const updated = addAlertPoint(config, replacementPoint);

      expect(updated.points).toHaveLength(2);
      const point60 = updated.points.find((p) => p.seconds === 60);
      expect(point60?.soundType).toBe(SoundType.BELL);
    });

    it('should maintain immutability', () => {
      const original = createDefaultAlertConfig();
      const newPoint = createAlertPoint(30, SoundType.BELL);

      const updated = addAlertPoint(original, newPoint);

      expect(original).not.toBe(updated);
      expect(original.points).toHaveLength(2);
      expect(updated.points).toHaveLength(3);
    });
  });

  describe('removeAlertPoint', () => {
    it('should remove alert point by seconds', () => {
      const config = createDefaultAlertConfig();

      const updated = removeAlertPoint(config, 60);

      expect(updated.points).toHaveLength(1);
      expect(updated.points).toContainEqual({
        seconds: 0,
        soundType: SoundType.GONG,
      });
    });

    it('should handle non-existent seconds gracefully', () => {
      const config = createDefaultAlertConfig();

      const updated = removeAlertPoint(config, 120);

      expect(updated.points).toHaveLength(2);
      expect(updated.points).toEqual(config.points);
    });

    it('should maintain immutability', () => {
      const original = createDefaultAlertConfig();

      const updated = removeAlertPoint(original, 60);

      expect(original).not.toBe(updated);
      expect(original.points).toHaveLength(2);
      expect(updated.points).toHaveLength(1);
    });
  });

  describe('setVolume', () => {
    it('should set volume within valid range', () => {
      const config = createDefaultAlertConfig();

      const updated = setVolume(config, 0.5);

      expect(updated.volume).toBe(0.5);
    });

    it('should clamp volume to 0.0 minimum', () => {
      const config = createDefaultAlertConfig();

      const updated = setVolume(config, -0.5);

      expect(updated.volume).toBe(0.0);
    });

    it('should clamp volume to 1.0 maximum', () => {
      const config = createDefaultAlertConfig();

      const updated = setVolume(config, 1.5);

      expect(updated.volume).toBe(1.0);
    });
  });

  describe('setEnabled', () => {
    it('should enable alert', () => {
      const config = { ...createDefaultAlertConfig(), enabled: false };

      const updated = setEnabled(config, true);

      expect(updated.enabled).toBe(true);
    });

    it('should disable alert', () => {
      const config = createDefaultAlertConfig();

      const updated = setEnabled(config, false);

      expect(updated.enabled).toBe(false);
    });
  });

  describe('isValidAlertConfig', () => {
    it('should return true for valid AlertConfig with AlertPoint array', () => {
      const validConfigs = [
        createDefaultAlertConfig(),
        {
          enabled: true,
          volume: 0.5,
          points: [
            createAlertPoint(60, SoundType.BELL),
            createAlertPoint(0, SoundType.GONG),
          ],
        },
        {
          enabled: false,
          volume: 0.0,
          points: [],
        },
      ];

      validConfigs.forEach((config) => {
        expect(isValidAlertConfig(config)).toBe(true);
      });
    });

    it('should return false for invalid config structure', () => {
      expect(isValidAlertConfig(null)).toBe(false);
      expect(isValidAlertConfig(undefined)).toBe(false);
      expect(isValidAlertConfig('invalid')).toBe(false);
      expect(isValidAlertConfig(123)).toBe(false);
    });

    it('should return false for invalid enabled field', () => {
      const config = {
        enabled: 'true',
        volume: 0.8,
        points: [createAlertPoint(60, SoundType.GONG)],
      };

      expect(isValidAlertConfig(config)).toBe(false);
    });

    it('should return false for invalid volume', () => {
      const invalidConfigs = [
        { enabled: true, volume: -0.1, points: [] },
        { enabled: true, volume: 1.1, points: [] },
        { enabled: true, volume: '0.8', points: [] },
      ];

      invalidConfigs.forEach((config) => {
        expect(isValidAlertConfig(config)).toBe(false);
      });
    });

    it('should return false for invalid points array', () => {
      const invalidConfigs = [
        { enabled: true, volume: 0.8, points: 'invalid' },
        { enabled: true, volume: 0.8, points: null },
        { enabled: true, volume: 0.8 }, // points未定義
      ];

      invalidConfigs.forEach((config) => {
        expect(isValidAlertConfig(config)).toBe(false);
      });
    });

    it('should return false if points contain invalid AlertPoint', () => {
      const config = {
        enabled: true,
        volume: 0.8,
        points: [
          createAlertPoint(60, SoundType.BELL),
          { seconds: -1, soundType: SoundType.GONG }, // 無効
        ],
      };

      expect(isValidAlertConfig(config)).toBe(false);
    });
  });
});
