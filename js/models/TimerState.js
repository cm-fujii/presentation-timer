/**
 * @file TimerState.js
 * @description タイマーの実行時状態を表すデータモデル
 * @since 1.0.0
 */

/**
 * タイマーの状態を表す列挙型
 * @typedef {'idle' | 'running' | 'paused'} TimerStatus
 */

/**
 * タイマーの実行時状態
 *
 * @typedef {Object} TimerState
 * @property {TimerStatus} status - タイマーの現在の状態（idle: 停止中, running: 実行中, paused: 一時停止中）
 * @property {number} remainingSeconds - 残り時間（秒）。0以下でマイナス表示
 * @property {number} durationSeconds - タイマーの設定時間（秒）
 * @property {number | null} startedAt - タイマー開始時のタイムスタンプ（ミリ秒）。nullの場合は未開始
 * @property {number} elapsedSeconds - 経過時間（秒）。一時停止時の累積時間を保持
 *
 * @example
 * ```javascript
 * // 初期状態（5分タイマー）
 * const initialState = {
 *   status: 'idle',
 *   remainingSeconds: 300,
 *   durationSeconds: 300,
 *   startedAt: null,
 *   elapsedSeconds: 0
 * };
 *
 * // 実行中の状態
 * const runningState = {
 *   status: 'running',
 *   remainingSeconds: 180,
 *   durationSeconds: 300,
 *   startedAt: Date.now() - 120000,
 *   elapsedSeconds: 120
 * };
 *
 * // マイナス表示（超過）
 * const overtimeState = {
 *   status: 'running',
 *   remainingSeconds: -30,
 *   durationSeconds: 300,
 *   startedAt: Date.now() - 330000,
 *   elapsedSeconds: 330
 * };
 * ```
 */

/**
 * デフォルトのTimerStateを作成する
 *
 * @param {number} [durationSeconds=300] - タイマーの設定時間（秒）。デフォルトは5分
 * @returns {TimerState} 初期化されたタイマー状態
 *
 * @example
 * ```javascript
 * const state = createDefaultTimerState(600); // 10分タイマー
 * console.log(state.status); // 'idle'
 * console.log(state.remainingSeconds); // 600
 * ```
 */
export function createDefaultTimerState(durationSeconds = 300) {
  return {
    status: 'idle',
    remainingSeconds: durationSeconds,
    durationSeconds: durationSeconds,
    startedAt: null,
    elapsedSeconds: 0,
  };
}

/**
 * TimerStateが有効かどうかを検証する
 *
 * @param {TimerState} state - 検証するタイマー状態
 * @returns {boolean} 有効な場合はtrue、無効な場合はfalse
 *
 * @example
 * ```javascript
 * const validState = createDefaultTimerState();
 * console.log(isValidTimerState(validState)); // true
 *
 * const invalidState = { status: 'unknown' };
 * console.log(isValidTimerState(invalidState)); // false
 * ```
 */
export function isValidTimerState(state) {
  if (!state || typeof state !== 'object') {
    return false;
  }

  const validStatuses = ['idle', 'running', 'paused'];
  return (
    validStatuses.includes(state.status) &&
    typeof state.remainingSeconds === 'number' &&
    typeof state.durationSeconds === 'number' &&
    state.durationSeconds > 0 &&
    (state.startedAt === null || typeof state.startedAt === 'number') &&
    typeof state.elapsedSeconds === 'number' &&
    state.elapsedSeconds >= 0
  );
}
