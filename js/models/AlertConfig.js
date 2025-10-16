/**
 * @file AlertConfig.js
 * @description アラート音の設定を表すデータモデル
 * @since 1.0.0
 */

/**
 * アラート音の設定
 *
 * @typedef {Object} AlertConfig
 * @property {boolean} enabled - アラート音が有効かどうか
 * @property {number} volume - 音量（0.0～1.0）。0.0は無音、1.0は最大音量
 * @property {number[]} points - アラート音を鳴らすタイミング（秒）。降順にソート推奨
 *
 * @example
 * ```javascript
 * // デフォルト設定：1分前と0秒でアラート
 * const config = {
 *   enabled: true,
 *   volume: 0.8,
 *   points: [60, 0]
 * };
 *
 * // カスタム設定：3分前、1分前、30秒前、0秒でアラート
 * const customConfig = {
 *   enabled: true,
 *   volume: 0.5,
 *   points: [180, 60, 30, 0]
 * };
 * ```
 */

/**
 * デフォルトのAlertConfigを作成する
 *
 * @returns {AlertConfig} 初期化されたアラート設定
 *
 * @example
 * ```javascript
 * const config = createDefaultAlertConfig();
 * // { enabled: true, volume: 0.8, points: [60, 0] }
 * ```
 */
export function createDefaultAlertConfig() {
  return {
    enabled: true,
    volume: 0.8,
    points: [60, 0], // 1分前と0秒
  };
}

/**
 * アラートポイントを追加する
 *
 * @param {AlertConfig} config - アラート設定
 * @param {number} seconds - 追加するアラートポイント（秒）
 * @returns {AlertConfig} 更新されたアラート設定（降順ソート済み）
 *
 * @example
 * ```javascript
 * const config = createDefaultAlertConfig(); // { points: [60, 0] }
 * const updated = addAlertPoint(config, 30); // { points: [60, 30, 0] }
 * ```
 */
export function addAlertPoint(config, seconds) {
  if (config.points.includes(seconds)) {
    return config; // 既に存在する場合は追加しない
  }

  return {
    ...config,
    points: [...config.points, seconds].sort((a, b) => b - a), // 降順ソート
  };
}

/**
 * アラートポイントを削除する
 *
 * @param {AlertConfig} config - アラート設定
 * @param {number} seconds - 削除するアラートポイント（秒）
 * @returns {AlertConfig} 更新されたアラート設定
 *
 * @example
 * ```javascript
 * const config = { enabled: true, volume: 0.8, points: [60, 30, 0] };
 * const updated = removeAlertPoint(config, 30); // { points: [60, 0] }
 * ```
 */
export function removeAlertPoint(config, seconds) {
  return {
    ...config,
    points: config.points.filter((point) => point !== seconds),
  };
}

/**
 * 音量を設定する（0.0～1.0の範囲にクランプ）
 *
 * @param {AlertConfig} config - アラート設定
 * @param {number} volume - 音量（0.0～1.0）
 * @returns {AlertConfig} 更新されたアラート設定
 *
 * @example
 * ```javascript
 * const config = createDefaultAlertConfig();
 * const updated = setVolume(config, 0.5); // { volume: 0.5 }
 * const clamped = setVolume(config, 1.5); // { volume: 1.0 }
 * ```
 */
export function setVolume(config, volume) {
  return {
    ...config,
    volume: Math.max(0, Math.min(1, volume)), // 0.0～1.0にクランプ
  };
}

/**
 * アラートの有効/無効を切り替える
 *
 * @param {AlertConfig} config - アラート設定
 * @param {boolean} enabled - 有効にする場合はtrue、無効にする場合はfalse
 * @returns {AlertConfig} 更新されたアラート設定
 *
 * @example
 * ```javascript
 * const config = createDefaultAlertConfig(); // { enabled: true }
 * const disabled = setEnabled(config, false); // { enabled: false }
 * ```
 */
export function setEnabled(config, enabled) {
  return {
    ...config,
    enabled,
  };
}

/**
 * AlertConfigが有効かどうかを検証する
 *
 * @param {AlertConfig} config - 検証するアラート設定
 * @returns {boolean} 有効な場合はtrue、無効な場合はfalse
 *
 * @example
 * ```javascript
 * const validConfig = createDefaultAlertConfig();
 * console.log(isValidAlertConfig(validConfig)); // true
 *
 * const invalidConfig = { enabled: true, volume: 2.0, points: [] };
 * console.log(isValidAlertConfig(invalidConfig)); // false
 * ```
 */
export function isValidAlertConfig(config) {
  if (!config || typeof config !== 'object') {
    return false;
  }

  return (
    typeof config.enabled === 'boolean' &&
    typeof config.volume === 'number' &&
    config.volume >= 0 &&
    config.volume <= 1 &&
    Array.isArray(config.points) &&
    config.points.every(
      (point) => typeof point === 'number' && Number.isInteger(point) && point >= 0
    )
  );
}
