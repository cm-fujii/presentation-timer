/**
 * @file StorageService.js
 * @description localStorage を使用してタイマー設定とアラート設定を永続化するサービス
 * @since 1.0.0
 */

import { createDefaultTimerConfig, isValidTimerConfig } from '../models/TimerConfig.js';
import { createDefaultAlertConfig, isValidAlertConfig } from '../models/AlertConfig.js';

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
   * アラート設定を読み込む
   *
   * @returns {import('../models/AlertConfig.js').AlertConfig} アラート設定。保存されていない場合はデフォルト設定
   *
   * @example
   * ```javascript
   * const config = StorageService.loadAlertConfig();
   * console.log(config.enabled); // true
   * console.log(config.points); // [60, 0]
   * ```
   */
  static loadAlertConfig() {
    try {
      const stored = localStorage.getItem(this.KEYS.ALERT_CONFIG);
      if (!stored) {
        return createDefaultAlertConfig();
      }

      const config = JSON.parse(stored);
      if (!isValidAlertConfig(config)) {
        console.warn('Invalid stored alert config, using default');
        return createDefaultAlertConfig();
      }

      return config;
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
