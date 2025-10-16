/**
 * @file StorageService.js
 * @description localStorage を使用してタイマー設定とアラート設定を永続化するサービス
 * @since 1.0.0
 */

import { createDefaultTimerConfig, isValidTimerConfig } from '../models/TimerConfig.js';
import {
  createDefaultAlertConfig,
  isValidAlertConfig,
  createAlertPoint,
} from '../models/AlertConfig.js';
import { SoundType } from '../models/SoundType.js';

/**
 * StorageService - localStorage を使用したデータ永続化サービス
 *
 * @description
 * このサービスはすべて静的メソッドで構成され、以下の機能を提供します：
 * - タイマー設定の保存/読み込み
 * - アラート設定の保存/読み込み
 * - すべての設定のクリア
 *
 * @example
 * ```javascript
 * import { StorageService } from './services/StorageService.js';
 *
 * // タイマー設定を保存
 * const config = { durationMinutes: 10, durationSeconds: 30 };
 * StorageService.saveTimerConfig(config);
 *
 * // タイマー設定を読み込み
 * const loaded = StorageService.loadTimerConfig();
 * ```
 */
export class StorageService {
  /**
   * localStorageのキー名
   * @private
   */
  static KEYS = {
    TIMER_CONFIG: 'presentation-timer:config',
    ALERT_CONFIG: 'presentation-timer:alert',
  };

  /**
   * タイマー設定を保存する
   *
   * @param {import('../models/TimerConfig.js').TimerConfig} config - 保存するタイマー設定
   * @throws {Error} 無効な設定の場合
   *
   * @example
   * ```javascript
   * const config = { durationMinutes: 5, durationSeconds: 30 };
   * StorageService.saveTimerConfig(config);
   * ```
   */
  static saveTimerConfig(config) {
    if (!isValidTimerConfig(config)) {
      throw new Error('Invalid TimerConfig');
    }

    try {
      localStorage.setItem(this.KEYS.TIMER_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save timer config:', error);
      throw error;
    }
  }

  /**
   * タイマー設定を読み込む
   *
   * @returns {import('../models/TimerConfig.js').TimerConfig} タイマー設定。保存されていない場合はデフォルト設定
   *
   * @example
   * ```javascript
   * const config = StorageService.loadTimerConfig();
   * console.log(config.durationMinutes); // 5 (デフォルト)
   * ```
   */
  static loadTimerConfig() {
    try {
      const stored = localStorage.getItem(this.KEYS.TIMER_CONFIG);
      if (!stored) {
        return createDefaultTimerConfig();
      }

      const config = JSON.parse(stored);
      if (!isValidTimerConfig(config)) {
        console.warn('Invalid stored timer config, using default');
        return createDefaultTimerConfig();
      }

      return config;
    } catch (error) {
      console.error('Failed to load timer config:', error);
      return createDefaultTimerConfig();
    }
  }

  /**
   * アラート設定を保存する
   *
   * @param {import('../models/AlertConfig.js').AlertConfig} config - 保存するアラート設定
   * @throws {Error} 無効な設定の場合
   *
   * @example
   * ```javascript
   * const config = { enabled: true, volume: 0.8, points: [60, 0] };
   * StorageService.saveAlertConfig(config);
   * ```
   */
  static saveAlertConfig(config) {
    if (!isValidAlertConfig(config)) {
      throw new Error('Invalid AlertConfig');
    }

    try {
      localStorage.setItem(this.KEYS.ALERT_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save alert config:', error);
      throw error;
    }
  }

  /**
   * 旧形式のAlertConfigを新形式にマイグレーションする
   *
   * @param {Object} config - マイグレーション対象の設定
   * @returns {import('../models/AlertConfig.js').AlertConfig} マイグレーション済みの設定
   *
   * @description
   * 旧形式（points: number[]）を新形式（points: AlertPoint[]）に変換します。
   * - 旧形式の場合: 各numberをAlertPointに変換（soundTypeはGONGをデフォルト）
   * - 新形式の場合: そのまま返す
   * - 無効な設定の場合: デフォルト設定を返す
   *
   * @example
   * ```javascript
   * // 旧形式の変換
   * const oldConfig = { enabled: true, volume: 0.8, points: [60, 0] };
   * const migrated = StorageService.migrateAlertConfig(oldConfig);
   * // { enabled: true, volume: 0.8, points: [
   * //   { seconds: 60, soundType: 'gong' },
   * //   { seconds: 0, soundType: 'gong' }
   * // ]}
   * ```
   *
   * @since 1.0.0
   */
  static migrateAlertConfig(config) {
    // 基本的な検証
    if (!config || typeof config !== 'object' || !Array.isArray(config.points)) {
      console.warn('Invalid config structure, using default');
      return createDefaultAlertConfig();
    }

    // 空配列の場合はそのまま返す
    if (config.points.length === 0) {
      return { ...config, points: [] };
    }

    // 旧形式を検出: points が number[] の場合
    if (typeof config.points[0] === 'number') {
      console.info('Migrating old alert config format to new format');
      return {
        ...config,
        points: config.points.map((seconds) =>
          createAlertPoint(seconds, SoundType.GONG)
        ),
      };
    }

    // 新形式の場合はそのまま返す
    return config;
  }

  /**
   * アラート設定を読み込む
   *
   * @returns {import('../models/AlertConfig.js').AlertConfig} アラート設定。保存されていない場合はデフォルト設定
   *
   * @example
   * ```javascript
   * const config = StorageService.loadAlertConfig();
   * console.log(config.enabled); // true
   * console.log(config.points); // [{ seconds: 60, soundType: 'gong' }, ...]
   * ```
   */
  static loadAlertConfig() {
    try {
      const stored = localStorage.getItem(this.KEYS.ALERT_CONFIG);
      if (!stored) {
        return createDefaultAlertConfig();
      }

      const config = JSON.parse(stored);

      // マイグレーションを実行
      const migratedConfig = this.migrateAlertConfig(config);

      // マイグレーション後の検証
      if (!isValidAlertConfig(migratedConfig)) {
        console.warn('Invalid stored alert config after migration, using default');
        return createDefaultAlertConfig();
      }

      return migratedConfig;
    } catch (error) {
      console.error('Failed to load alert config:', error);
      return createDefaultAlertConfig();
    }
  }

  /**
   * すべての設定をクリアする
   *
   * @description
   * localStorageからタイマー設定とアラート設定を削除します。
   * 次回の読み込み時にはデフォルト設定が返されます。
   *
   * @example
   * ```javascript
   * StorageService.clear();
   * const config = StorageService.loadTimerConfig(); // デフォルト設定
   * ```
   */
  static clear() {
    try {
      localStorage.removeItem(this.KEYS.TIMER_CONFIG);
      localStorage.removeItem(this.KEYS.ALERT_CONFIG);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }
}
