/**
 * @file TimerDisplay.js
 * @description タイマー表示を管理するUIコンポーネント
 * @since 1.0.0
 */

import { formatTime } from '../services/TimerService.js';

/**
 * TimerDisplay - タイマーの表示を管理するコンポーネント
 *
 * @description
 * タイマーの残り時間と状態を大きく表示します。
 * マイナス時間の場合は赤色で表示します。
 *
 * @example
 * ```javascript
 * const display = new TimerDisplay(document.getElementById('timer-display'));
 * display.render();
 *
 * // タイマーの状態を更新
 * display.update({
 *   status: 'running',
 *   remainingSeconds: 180,
 *   durationSeconds: 300,
 *   startedAt: Date.now(),
 *   elapsedSeconds: 120
 * });
 * ```
 */
export class TimerDisplay {
  /**
   * TimerDisplayのコンストラクタ
   *
   * @param {HTMLElement} container - 表示先のコンテナ要素
   */
  constructor(container) {
    /**
     * コンテナ要素
     * @private
     * @type {HTMLElement}
     */
    this._container = container;

    /**
     * 時間表示要素
     * @private
     * @type {HTMLElement | null}
     */
    this._timeElement = null;

    /**
     * 状態表示要素
     * @private
     * @type {HTMLElement | null}
     */
    this._statusElement = null;
  }

  /**
   * コンポーネントをレンダリングする
   *
   * @description
   * DOM構造を作成し、コンテナに追加します。
   * アクセシビリティ対応として、適切なARIA属性を設定します。
   *
   * @example
   * ```javascript
   * const display = new TimerDisplay(container);
   * display.render();
   * ```
   */
  render() {
    // 既存の内容をクリア
    this._container.innerHTML = '';

    // 時間表示要素を作成
    this._timeElement = document.createElement('div');
    this._timeElement.className = 'timer-display__time';
    this._timeElement.setAttribute('role', 'timer');
    this._timeElement.setAttribute('aria-label', 'タイマー残り時間');
    this._timeElement.textContent = '00:00';

    // 状態表示要素を作成
    this._statusElement = document.createElement('div');
    this._statusElement.className = 'timer-display__status';
    this._statusElement.setAttribute('aria-label', 'タイマー状態');
    this._statusElement.textContent = 'Ready';

    // コンテナに追加
    this._container.appendChild(this._timeElement);
    this._container.appendChild(this._statusElement);
  }

  /**
   * タイマーの表示を更新する
   *
   * @param {import('../models/TimerState.js').TimerState} state - タイマーの状態
   *
   * @description
   * タイマーの状態に基づいて表示を更新します。
   * - 残り時間をMM:SS形式で表示
   * - マイナス時間の場合は赤色のクラスを追加
   * - 状態ラベルを更新（Ready/Running/Paused）
   *
   * @example
   * ```javascript
   * display.update({
   *   status: 'running',
   *   remainingSeconds: 180,
   *   durationSeconds: 300,
   *   startedAt: Date.now(),
   *   elapsedSeconds: 120
   * });
   * ```
   */
  update(state) {
    if (!this._timeElement || !this._statusElement) {
      // eslint-disable-next-line no-console
      console.error('TimerDisplay not rendered yet');
      return;
    }

    // 時間表示を更新
    const timeText = formatTime(state.remainingSeconds);
    // eslint-disable-next-line no-console
    console.log('TimerDisplay update:', state, 'Formatted time:', timeText);
    this._timeElement.textContent = timeText;

    // マイナス時間の場合は赤色クラスを追加、そうでなければ削除
    const isNegative = state.remainingSeconds < 0;
    if (isNegative) {
      this._timeElement.classList.add('timer-display__time--negative');
    } else {
      this._timeElement.classList.remove('timer-display__time--negative');
    }

    // 状態ラベルを更新
    const statusText = this._getStatusText(state.status);
    this._statusElement.textContent = statusText;

    // アクセシビリティ: aria-labelを更新
    this._timeElement.setAttribute(
      'aria-label',
      `タイマー残り時間 ${timeText} ${isNegative ? '超過' : ''}`
    );
    this._statusElement.setAttribute('aria-label', `タイマー状態 ${statusText}`);
  }

  /**
   * 状態テキストを取得する
   *
   * @private
   * @param {import('../models/TimerState.js').TimerStatus} status - タイマーの状態
   * @returns {string} 状態テキスト
   */
  _getStatusText(status) {
    switch (status) {
      case 'idle':
        return 'Ready';
      case 'running':
        return 'Running';
      case 'paused':
        return 'Paused';
      default:
        return 'Unknown';
    }
  }
}
