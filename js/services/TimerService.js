/**
 * @file TimerService.js
 * @description タイマーのビジネスロジックを管理するサービスクラス
 * @since 1.0.0
 */

import { createDefaultTimerState } from '../models/TimerState.js';

/**
 * タイマーサービス - タイマーの状態管理とイベント発行
 *
 * @description
 * タイマーの開始・停止・リセットなどの操作を管理し、
 * tick/completeイベントを発行します。
 *
 * @example
 * ```javascript
 * const timer = new TimerService();
 *
 * // イベントリスナーを設定
 * timer.on('tick', (state) => {
 *   console.log(`Remaining: ${state.remainingSeconds}s`);
 * });
 *
 * timer.on('complete', () => {
 *   console.log('Timer completed!');
 * });
 *
 * // タイマーを設定して開始
 * timer.setDuration(300); // 5分
 * timer.start();
 * ```
 */
export class TimerService {
  /**
   * TimerServiceのコンストラクタ
   *
   * @param {number} [durationSeconds=300] - 初期タイマー時間（秒）
   */
  constructor(durationSeconds = 300) {
    /**
     * タイマーの現在の状態
     * @private
     * @type {import('../models/TimerState.js').TimerState}
     */
    this._state = createDefaultTimerState(durationSeconds);

    /**
     * タイマーのインターバルID
     * @private
     * @type {number | null}
     */
    this._intervalId = null;

    /**
     * 最後にtickイベントを発火した秒数
     * @private
     * @type {number}
     */
    this._lastTickSecond = this._state.remainingSeconds;

    /**
     * completeイベントが発火済みかどうか
     * @private
     * @type {boolean}
     */
    this._completeFired = false;

    /**
     * イベントリスナーのマップ
     * @private
     * @type {Map<string, Set<Function>>}
     */
    this._listeners = new Map();
  }

  /**
   * タイマーの時間を設定する
   *
   * @param {number} durationSeconds - タイマー時間（秒）
   *
   * @example
   * ```javascript
   * const timer = new TimerService();
   * timer.setDuration(600); // 10分に設定
   * ```
   */
  setDuration(durationSeconds) {
    // 実行中の場合は停止
    if (this._state.status === 'running') {
      this._stopInterval();
    }

    this._state = createDefaultTimerState(durationSeconds);
    this._lastTickSecond = durationSeconds;
    this._completeFired = false;
  }

  /**
   * タイマーを開始する
   *
   * @description
   * idle状態の場合のみタイマーを開始します。
   * 既に実行中の場合は何もしません。
   *
   * @example
   * ```javascript
   * const timer = new TimerService();
   * timer.setDuration(300);
   * timer.start();
   * ```
   */
  start() {
    if (this._state.status !== 'idle') {
      return; // 既に実行中またはマーズ中の場合は何もしない
    }

    this._state.status = 'running';
    this._state.startedAt = Date.now();
    this._startInterval();
  }

  /**
   * タイマーを一時停止する
   *
   * @description
   * running状態の場合のみ一時停止します。
   *
   * @example
   * ```javascript
   * timer.start();
   * // ... 時間が経過
   * timer.pause();
   * ```
   */
  pause() {
    if (this._state.status !== 'running') {
      return; // 実行中でない場合は何もしない
    }

    // 現在の経過時間を確定
    this._updateElapsedTime();

    this._state.status = 'paused';
    this._state.startedAt = null;
    this._stopInterval();
  }

  /**
   * タイマーを再開する
   *
   * @description
   * paused状態の場合のみ再開します。
   *
   * @example
   * ```javascript
   * timer.pause();
   * // ... しばらく待機
   * timer.resume();
   * ```
   */
  resume() {
    if (this._state.status !== 'paused') {
      return; // 一時停止中でない場合は何もしない
    }

    this._state.status = 'running';
    // 既に経過した時間を考慮して startedAt を設定
    this._state.startedAt = Date.now() - this._state.elapsedSeconds * 1000;
    this._startInterval();
  }

  /**
   * タイマーをリセットする
   *
   * @description
   * タイマーを初期状態に戻します。
   * 実行中のインターバルを停止し、経過時間をクリアします。
   *
   * @example
   * ```javascript
   * timer.start();
   * // ... 時間が経過
   * timer.reset(); // 初期状態に戻る
   * ```
   */
  reset() {
    this._stopInterval();
    this._state = createDefaultTimerState(this._state.durationSeconds);
    this._lastTickSecond = this._state.durationSeconds;
    this._completeFired = false;
  }

  /**
   * タイマーの現在の状態を取得する
   *
   * @returns {import('../models/TimerState.js').TimerState} タイマーの状態
   *
   * @example
   * ```javascript
   * const state = timer.getState();
   * console.log(state.status); // 'idle' | 'running' | 'paused'
   * console.log(state.remainingSeconds); // 残り時間（秒）
   * ```
   */
  getState() {
    if (this._state.status === 'running') {
      this._updateElapsedTime();
    }
    return { ...this._state };
  }

  /**
   * 残り時間を取得する
   *
   * @returns {number} 残り時間（秒）。マイナスの場合は超過時間
   *
   * @example
   * ```javascript
   * const remaining = timer.getRemainingTime();
   * console.log(remaining); // 例: 120 (2分残り)
   * ```
   */
  getRemainingTime() {
    if (this._state.status === 'running') {
      this._updateElapsedTime();
    }
    return this._state.remainingSeconds;
  }

  /**
   * イベントリスナーを追加する
   *
   * @param {string} event - イベント名 ('tick' | 'complete')
   * @param {Function} callback - コールバック関数
   *
   * @example
   * ```javascript
   * timer.on('tick', (state) => {
   *   console.log(`Remaining: ${state.remainingSeconds}s`);
   * });
   * ```
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
  }

  /**
   * イベントリスナーを削除する
   *
   * @param {string} event - イベント名
   * @param {Function} callback - コールバック関数
   *
   * @example
   * ```javascript
   * const callback = (state) => console.log(state);
   * timer.on('tick', callback);
   * timer.off('tick', callback); // リスナーを削除
   * ```
   */
  off(event, callback) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).delete(callback);
    }
  }

  /**
   * イベントを発火する
   *
   * @private
   * @param {string} event - イベント名
   * @param {*} data - イベントデータ
   */
  _emit(event, data) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).forEach((callback) => {
        callback(data);
      });
    }
  }

  /**
   * インターバルを開始する
   *
   * @private
   */
  _startInterval() {
    this._intervalId = setInterval(() => {
      this._tick();
    }, 100); // 100ms間隔で更新
  }

  /**
   * インターバルを停止する
   *
   * @private
   */
  _stopInterval() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  /**
   * 経過時間を更新する
   *
   * @private
   */
  _updateElapsedTime() {
    if (this._state.status === 'running' && this._state.startedAt !== null) {
      const now = Date.now();
      const elapsed = Math.floor((now - this._state.startedAt) / 1000);
      this._state.elapsedSeconds = elapsed;
      this._state.remainingSeconds = this._state.durationSeconds - this._state.elapsedSeconds;
    }
  }

  /**
   * タイマーのティック処理
   *
   * @private
   * @description
   * 100ms間隔で呼ばれ、秒が変わった時のみイベントを発火します。
   */
  _tick() {
    this._updateElapsedTime();

    const currentSecond = this._state.remainingSeconds;

    // 秒が変わった時のみイベントを発火
    if (currentSecond !== this._lastTickSecond) {
      this._lastTickSecond = currentSecond;

      // tickイベントを発火
      this._emit('tick', this.getState());

      // 0秒に到達したらcompleteイベントを発火（1回のみ）
      if (currentSecond === 0 && !this._completeFired) {
        this._completeFired = true;
        this._emit('complete', this.getState());
      }
    }
  }
}

/**
 * 時間を MM:SS 形式にフォーマットする
 *
 * @param {number} seconds - フォーマットする秒数（負の値も対応）
 * @returns {string} フォーマットされた時間文字列
 *
 * @example
 * ```javascript
 * formatTime(125);  // "02:05"
 * formatTime(0);    // "00:00"
 * formatTime(-30);  // "-00:30"
 * ```
 */
export function formatTime(seconds) {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);
  const minutes = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;

  const formatted = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return isNegative ? `-${formatted}` : formatted;
}
