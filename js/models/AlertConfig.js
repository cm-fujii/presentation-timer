/**
 * @file AlertConfig.js
 * @description アラート音の設定を表すデータモデル
 * @since 1.0.0
 */

import { SoundType, isValidSoundType } from './SoundType.js';

/**
 * アラートポイント設定
 *
 * @typedef {Object} AlertPoint
 * @property {number} seconds - アラートを鳴らすタイミング（秒）。0以上の整数
 * @property {string} soundType - 使用する音の種類 (SoundType.BELL または SoundType.GONG)
 *
 * @example
 * ```javascript
 * // 残り60秒でベルの音を鳴らす
 * const alertPoint = {
 *   seconds: 60,
 *   soundType: SoundType.BELL
 * };
 *
 * // 0秒到達時に銅鑼の音を鳴らす
 * const zeroPoint = {
 *   seconds: 0,
 *   soundType: SoundType.GONG
 * };
 * ```
 */

/**
 * アラート音の設定
 *
 * @typedef {Object} AlertConfig
 * @property {boolean} enabled - アラート音が有効かどうか
 * @property {number} volume - 音量（0.0～1.0）。0.0は無音、1.0は最大音量
 * @property {AlertPoint[]} points - アラートポイントの配列（降順ソート推奨）
 *
 * @example
 * ```javascript
 * // デフォルト設定：1分前と0秒でアラート（両方とも銅鑼）
 * const config = {
 *   enabled: true,
 *   volume: 0.8,
 *   points: [
 *     { seconds: 60, soundType: SoundType.GONG },
 *     { seconds: 0, soundType: SoundType.GONG }
 *   ]
 * };
 *
 * // カスタム設定：異なる音を設定
 * const customConfig = {
 *   enabled: true,
 *   volume: 0.5,
 *   points: [
 *     { seconds: 180, soundType: SoundType.GONG },
 *     { seconds: 60, soundType: SoundType.BELL },
 *     { seconds: 0, soundType: SoundType.GONG }
 *   ]
 * };
 * ```
 */

/**
 * デフォルトのAlertPointを作成する
 *
 * @param {number} seconds - アラートポイント（秒）
 * @param {string} [soundType=SoundType.GONG] - 音の種類（デフォルト: 銅鑼）
 * @returns {AlertPoint}
 *
 * @example
 * ```javascript
 * const point1 = createAlertPoint(60); // { seconds: 60, soundType: 'gong' }
 * const point2 = createAlertPoint(30, SoundType.BELL); // { seconds: 30, soundType: 'bell' }
 * ```
 */
export function createAlertPoint(seconds, soundType = SoundType.GONG) {
  return {
    seconds,
    soundType,
  };
}

/**
 * AlertPointが有効かどうかを検証する
 *
 * @param {AlertPoint} point - 検証するアラートポイント
 * @returns {boolean} 有効な場合はtrue
 *
 * @example
 * ```javascript
 * const validPoint = createAlertPoint(60, SoundType.BELL);
 * console.log(isValidAlertPoint(validPoint)); // true
 *
 * const invalidPoint = { seconds: -1, soundType: 'invalid' };
 * console.log(isValidAlertPoint(invalidPoint)); // false
 * ```
 */
export function isValidAlertPoint(point) {
  if (!point || typeof point !== 'object') {
    return false;
  }

  return (
    typeof point.seconds === 'number' &&
    Number.isInteger(point.seconds) &&
    point.seconds >= 0 &&
    isValidSoundType(point.soundType)
  );
}

/**
 * デフォルトのAlertConfigを作成する
 *
 * @returns {AlertConfig} 初期化されたアラート設定
 *
 * @example
 * ```javascript
 * const config = createDefaultAlertConfig();
 * // {
 * //   enabled: true,
 * //   volume: 0.8,
 * //   points: [
 * //     { seconds: 60, soundType: 'gong' },
 * //     { seconds: 0, soundType: 'gong' }
 * //   ]
 * // }
 * ```
 */
export function createDefaultAlertConfig() {
  return {
    enabled: true,
    volume: 0.8,
    points: [
      createAlertPoint(60, SoundType.GONG),
      createAlertPoint(0, SoundType.GONG),
    ],
  };
}

/**
 * アラートポイントを追加する
 *
 * @param {AlertConfig} config - アラート設定
 * @param {AlertPoint} point - 追加するアラートポイント
 * @returns {AlertConfig} 更新されたアラート設定（降順ソート済み）
 *
 * @example
 * ```javascript
 * const config = createDefaultAlertConfig();
 * const newPoint = createAlertPoint(30, SoundType.BELL);
 * const updated = addAlertPoint(config, newPoint);
 * // points: [{ 60, 'gong' }, { 30, 'bell' }, { 0, 'gong' }]
 * ```
 */
export function addAlertPoint(config, point) {
  // 同じsecondsのポイントが既に存在する場合は置き換え
  const existingIndex = config.points.findIndex((p) => p.seconds === point.seconds);

  let newPoints;
  if (existingIndex !== -1) {
    // 既存のポイントを置き換え
    newPoints = [...config.points];
    newPoints[existingIndex] = point;
  } else {
    // 新しいポイントを追加
    newPoints = [...config.points, point];
  }

  return {
    ...config,
    points: newPoints.sort((a, b) => b.seconds - a.seconds), // 降順ソート
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
 * const config = createDefaultAlertConfig();
 * const updated = removeAlertPoint(config, 60);
 * // points: [{ seconds: 0, soundType: 'gong' }]
 * ```
 */
export function removeAlertPoint(config, seconds) {
  return {
    ...config,
    points: config.points.filter((point) => point.seconds !== seconds),
  };
}

/**
 * アラートポイントの音を変更する
 *
 * @param {AlertConfig} config - アラート設定
 * @param {number} seconds - 変更するアラートポイント（秒）
 * @param {string} newSoundType - 新しい音の種類
 * @returns {AlertConfig} 更新されたアラート設定
 *
 * @example
 * ```javascript
 * const config = createDefaultAlertConfig();
 * const updated = updateAlertPointSound(config, 60, SoundType.BELL);
 * // points: [{ seconds: 60, soundType: 'bell' }, { seconds: 0, soundType: 'gong' }]
 * ```
 */
export function updateAlertPointSound(config, seconds, newSoundType) {
  return {
    ...config,
    points: config.points.map((point) =>
      point.seconds === seconds ? { ...point, soundType: newSoundType } : point
    ),
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
    config.points.every((point) => isValidAlertPoint(point))
  );
}
