/**
 * @file TimerConfig.js
 * @description タイマーの設定を表すデータモデル
 * @since 1.0.0
 */

/**
 * タイマーの設定
 *
 * @typedef {Object} TimerConfig
 * @property {number} durationMinutes - タイマーの設定時間（分）。1以上の整数
 * @property {number} durationSeconds - タイマーの設定時間（秒）。0-59の整数
 *
 * @example
 * ```javascript
 * // 5分30秒のタイマー設定
 * const config = {
 *   durationMinutes: 5,
 *   durationSeconds: 30
 * };
 *
 * // 合計秒数に変換
 * const totalSeconds = config.durationMinutes * 60 + config.durationSeconds; // 330
 * ```
 */

/**
 * デフォルトのTimerConfigを作成する
 *
 * @param {number} [minutes=5] - タイマーの設定時間（分）
 * @param {number} [seconds=0] - タイマーの設定時間（秒）
 * @returns {TimerConfig} 初期化されたタイマー設定
 *
 * @example
 * ```javascript
 * const defaultConfig = createDefaultTimerConfig(); // 5分0秒
 * const customConfig = createDefaultTimerConfig(10, 30); // 10分30秒
 * ```
 */
export function createDefaultTimerConfig(minutes = 5, seconds = 0) {
  return {
    durationMinutes: minutes,
    durationSeconds: seconds,
  };
}

/**
 * TimerConfigをトータル秒数に変換する
 *
 * @param {TimerConfig} config - タイマー設定
 * @returns {number} トータル秒数
 *
 * @example
 * ```javascript
 * const config = { durationMinutes: 5, durationSeconds: 30 };
 * const totalSeconds = getTotalSeconds(config); // 330
 * ```
 */
export function getTotalSeconds(config) {
  return config.durationMinutes * 60 + config.durationSeconds;
}

/**
 * トータル秒数からTimerConfigを作成する
 *
 * @param {number} totalSeconds - トータル秒数
 * @returns {TimerConfig} タイマー設定
 *
 * @example
 * ```javascript
 * const config = fromTotalSeconds(330); // { durationMinutes: 5, durationSeconds: 30 }
 * const config2 = fromTotalSeconds(125); // { durationMinutes: 2, durationSeconds: 5 }
 * ```
 */
export function fromTotalSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    durationMinutes: minutes,
    durationSeconds: seconds,
  };
}

/**
 * TimerConfigが有効かどうかを検証する
 *
 * @param {TimerConfig} config - 検証するタイマー設定
 * @returns {boolean} 有効な場合はtrue、無効な場合はfalse
 *
 * @example
 * ```javascript
 * const validConfig = { durationMinutes: 5, durationSeconds: 30 };
 * console.log(isValidTimerConfig(validConfig)); // true
 *
 * const invalidConfig = { durationMinutes: -1, durationSeconds: 70 };
 * console.log(isValidTimerConfig(invalidConfig)); // false
 * ```
 */
export function isValidTimerConfig(config) {
  if (!config || typeof config !== 'object') {
    return false;
  }

  return (
    typeof config.durationMinutes === 'number' &&
    typeof config.durationSeconds === 'number' &&
    Number.isInteger(config.durationMinutes) &&
    Number.isInteger(config.durationSeconds) &&
    config.durationMinutes >= 0 &&
    config.durationSeconds >= 0 &&
    config.durationSeconds < 60 &&
    getTotalSeconds(config) > 0
  );
}
