/**
 * @file SoundType.js
 * @description アラート音の種類を表すEnum
 * @since 1.0.0
 */

/**
 * アラート音の種類
 *
 * @readonly
 * @enum {string}
 *
 * @example
 * ```javascript
 * import { SoundType } from './SoundType.js';
 *
 * const soundType = SoundType.BELL; // 'bell'
 * console.log(SoundType.GONG); // 'gong'
 * ```
 */
export const SoundType = Object.freeze({
  /**
   * ベルの音
   */
  BELL: 'bell',

  /**
   * 銅鑼の音
   */
  GONG: 'gong',
});

/**
 * 有効なSoundTypeかどうかを検証する
 *
 * @param {string} soundType - 検証する音の種類
 * @returns {boolean} 有効な場合はtrue、無効な場合はfalse
 *
 * @example
 * ```javascript
 * import { isValidSoundType, SoundType } from './SoundType.js';
 *
 * console.log(isValidSoundType(SoundType.BELL)); // true
 * console.log(isValidSoundType('bell')); // true
 * console.log(isValidSoundType('invalid')); // false
 * console.log(isValidSoundType(null)); // false
 * ```
 */
export function isValidSoundType(soundType) {
  return Object.values(SoundType).includes(soundType);
}
