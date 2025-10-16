/**
 * @file StorageService.test.js
 * @description StorageService のユニットテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageService } from '../../js/services/StorageService.js';
import { createDefaultTimerConfig } from '../../js/models/TimerConfig.js';
import { createDefaultAlertConfig } from '../../js/models/AlertConfig.js';

describe('StorageService', () => {
  beforeEach(() => {
    // 各テスト前にlocalStorageをクリア
    localStorage.clear();
  });

  afterEach(() => {
    // 各テスト後にlocalStorageをクリア
    localStorage.clear();
  });

  describe('saveTimerConfig / loadTimerConfig', () => {
    it('should save and load timer config correctly', () => {
      const config = { durationMinutes: 10, durationSeconds: 30 };

      StorageService.saveTimerConfig(config);
      const loaded = StorageService.loadTimerConfig();

      expect(loaded).toEqual(config);
    });

    it('should return default config when no data is stored', () => {
      const loaded = StorageService.loadTimerConfig();
      const defaultConfig = createDefaultTimerConfig();

      expect(loaded).toEqual(defaultConfig);
    });

    it('should throw error when saving invalid config', () => {
      const invalidConfig = { durationMinutes: -1, durationSeconds: 70 };

      expect(() => {
        StorageService.saveTimerConfig(invalidConfig);
      }).toThrow('Invalid TimerConfig');
    });

    it('should return default config when stored data is invalid', () => {
      // 無効なJSONを直接保存
      localStorage.setItem(StorageService.KEYS.TIMER_CONFIG, JSON.stringify({ invalid: 'data' }));

      const loaded = StorageService.loadTimerConfig();
      const defaultConfig = createDefaultTimerConfig();

      expect(loaded).toEqual(defaultConfig);
    });

    it('should handle localStorage errors gracefully', () => {
      // localStorageのsetItemをモック化してエラーを発生させる
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const config = { durationMinutes: 5, durationSeconds: 0 };

      expect(() => {
        StorageService.saveTimerConfig(config);
      }).toThrow('QuotaExceededError');

      setItemSpy.mockRestore();
    });
  });

  describe('saveAlertConfig / loadAlertConfig', () => {
    it('should save and load alert config correctly', () => {
      const config = {
        enabled: true,
        volume: 0.5,
        points: [
          { seconds: 180, soundType: 'gong' },
          { seconds: 60, soundType: 'bell' },
          { seconds: 0, soundType: 'gong' },
        ],
      };

      StorageService.saveAlertConfig(config);
      const loaded = StorageService.loadAlertConfig();

      expect(loaded).toEqual(config);
    });

    it('should return default config when no data is stored', () => {
      const loaded = StorageService.loadAlertConfig();
      const defaultConfig = createDefaultAlertConfig();

      expect(loaded).toEqual(defaultConfig);
    });

    it('should throw error when saving invalid config', () => {
      const invalidConfig = { enabled: true, volume: 2.0, points: [] };

      expect(() => {
        StorageService.saveAlertConfig(invalidConfig);
      }).toThrow('Invalid AlertConfig');
    });

    it('should return default config when stored data is invalid', () => {
      // 無効なJSONを直接保存
      localStorage.setItem(StorageService.KEYS.ALERT_CONFIG, JSON.stringify({ invalid: 'data' }));

      const loaded = StorageService.loadAlertConfig();
      const defaultConfig = createDefaultAlertConfig();

      expect(loaded).toEqual(defaultConfig);
    });

    it('should handle volume boundary values correctly', () => {
      const configs = [
        {
          enabled: true,
          volume: 0.0,
          points: [
            { seconds: 60, soundType: 'gong' },
            { seconds: 0, soundType: 'gong' },
          ],
        },
        {
          enabled: true,
          volume: 1.0,
          points: [
            { seconds: 60, soundType: 'gong' },
            { seconds: 0, soundType: 'gong' },
          ],
        },
        {
          enabled: true,
          volume: 0.5,
          points: [
            { seconds: 60, soundType: 'gong' },
            { seconds: 0, soundType: 'gong' },
          ],
        },
      ];

      configs.forEach((config) => {
        StorageService.saveAlertConfig(config);
        const loaded = StorageService.loadAlertConfig();
        expect(loaded).toEqual(config);
      });
    });

    it('should handle empty alert points array', () => {
      // pointsが空配列でも有効（アラートを使用しない設定）
      const config = { enabled: false, volume: 0.8, points: [] };

      StorageService.saveAlertConfig(config);
      const loaded = StorageService.loadAlertConfig();

      expect(loaded).toEqual(config);
    });
  });

  describe('clear', () => {
    it('should clear all stored data', () => {
      const timerConfig = { durationMinutes: 10, durationSeconds: 30 };
      const alertConfig = {
        enabled: true,
        volume: 0.8,
        points: [
          { seconds: 60, soundType: 'gong' },
          { seconds: 0, soundType: 'gong' },
        ],
      };

      StorageService.saveTimerConfig(timerConfig);
      StorageService.saveAlertConfig(alertConfig);

      StorageService.clear();

      const loadedTimer = StorageService.loadTimerConfig();
      const loadedAlert = StorageService.loadAlertConfig();

      expect(loadedTimer).toEqual(createDefaultTimerConfig());
      expect(loadedAlert).toEqual(createDefaultAlertConfig());
    });

    it('should handle errors when clearing storage', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      removeItemSpy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        StorageService.clear();
      }).toThrow('Storage error');

      removeItemSpy.mockRestore();
    });
  });

  describe('migrateAlertConfig', () => {
    it('should migrate old format (number[]) to new format (AlertPoint[])', () => {
      const oldConfig = {
        enabled: true,
        volume: 0.8,
        points: [60, 30, 0],
      };

      const migrated = StorageService.migrateAlertConfig(oldConfig);

      expect(migrated).toEqual({
        enabled: true,
        volume: 0.8,
        points: [
          { seconds: 60, soundType: 'gong' },
          { seconds: 30, soundType: 'gong' },
          { seconds: 0, soundType: 'gong' },
        ],
      });
    });

    it('should keep new format (AlertPoint[]) unchanged', () => {
      const newConfig = {
        enabled: true,
        volume: 0.5,
        points: [
          { seconds: 120, soundType: 'bell' },
          { seconds: 60, soundType: 'gong' },
          { seconds: 0, soundType: 'bell' },
        ],
      };

      const migrated = StorageService.migrateAlertConfig(newConfig);

      expect(migrated).toEqual(newConfig);
    });

    it('should preserve enabled and volume properties', () => {
      const oldConfig = {
        enabled: false,
        volume: 0.3,
        points: [120, 60, 30],
      };

      const migrated = StorageService.migrateAlertConfig(oldConfig);

      expect(migrated.enabled).toBe(false);
      expect(migrated.volume).toBe(0.3);
      expect(migrated.points).toHaveLength(3);
      expect(migrated.points[0]).toEqual({ seconds: 120, soundType: 'gong' });
    });

    it('should return default config for invalid input', () => {
      const invalidConfigs = [
        null,
        undefined,
        {},
        { enabled: true },
        { enabled: true, volume: 0.8 },
        { points: 'invalid' },
      ];

      invalidConfigs.forEach((invalidConfig) => {
        const migrated = StorageService.migrateAlertConfig(invalidConfig);
        expect(migrated).toEqual(createDefaultAlertConfig());
      });
    });

    it('should handle empty points array', () => {
      const config = {
        enabled: false,
        volume: 0.5,
        points: [],
      };

      const migrated = StorageService.migrateAlertConfig(config);

      expect(migrated).toEqual(config);
    });
  });

  describe('KEYS', () => {
    it('should have correct key names', () => {
      expect(StorageService.KEYS.TIMER_CONFIG).toBe('presentation-timer:config');
      expect(StorageService.KEYS.ALERT_CONFIG).toBe('presentation-timer:alert');
    });

    it('should not conflict with other localStorage keys', () => {
      // 他のアプリのキーを設定
      localStorage.setItem('other-app:config', 'other-data');

      // StorageServiceでデータを保存
      const timerConfig = { durationMinutes: 5, durationSeconds: 0 };
      StorageService.saveTimerConfig(timerConfig);

      // 他のアプリのデータが影響を受けないことを確認
      expect(localStorage.getItem('other-app:config')).toBe('other-data');

      // StorageServiceのデータが正しく保存されていることを確認
      const loaded = StorageService.loadTimerConfig();
      expect(loaded).toEqual(timerConfig);
    });
  });
});
