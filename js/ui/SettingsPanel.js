/**
 * @file SettingsPanel.js
 * @description タイマー設定パネルを管理するUIコンポーネント
 * @since 1.0.0
 */

import { StorageService } from '../services/StorageService.js';
import { getTotalSeconds, isValidTimerConfig } from '../models/TimerConfig.js';

/**
 * SettingsPanel - タイマーの設定を管理するコンポーネント
 *
 * @description
 * タイマーの時間設定（分・秒）を入力し、localStorageに保存します。
 * バリデーション機能を持ち、無効な入力を防ぎます。
 *
 * @example
 * ```javascript
 * const panel = new SettingsPanel(document.getElementById('settings-panel'));
 * panel.render();
 *
 * // 設定保存時のコールバックを設定
 * panel.onSave = (totalSeconds) => {
 *   timer.setDuration(totalSeconds);
 * };
 *
 * // タイマーの状態に応じて入力欄の有効/無効を切り替え
 * panel.updateInputStates(timer.getState());
 * ```
 */
export class SettingsPanel {
  /**
   * SettingsPanelのコンストラクタ
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
     * 分入力欄
     * @private
     * @type {HTMLInputElement | null}
     */
    this._minutesInput = null;

    /**
     * 秒入力欄
     * @private
     * @type {HTMLInputElement | null}
     */
    this._secondsInput = null;

    /**
     * 保存ボタン
     * @private
     * @type {HTMLButtonElement | null}
     */
    this._saveButton = null;

    /**
     * エラー表示要素
     * @private
     * @type {HTMLDivElement | null}
     */
    this._errorElement = null;

    /**
     * 設定保存時のコールバック
     * @type {Function | null}
     */
    this.onSave = null;
  }

  /**
   * コンポーネントをレンダリングする
   *
   * @description
   * 設定フォームを作成し、localStorageから保存済みの設定を読み込みます。
   * アクセシビリティ対応として、適切なラベルとARIA属性を設定します。
   *
   * @example
   * ```javascript
   * const panel = new SettingsPanel(container);
   * panel.render();
   * ```
   */
  render() {
    // 既存の内容をクリア
    this._container.innerHTML = '';

    // タイトル
    const title = document.createElement('h2');
    title.className = 'settings-panel__title';
    title.textContent = 'Timer Settings';

    // 時間入力グループ
    const timeGroup = document.createElement('div');
    timeGroup.className = 'form-group';

    const timeLabel = document.createElement('label');
    timeLabel.className = 'form-group__label';
    timeLabel.textContent = 'Duration';

    const timeInputGroup = document.createElement('div');
    timeInputGroup.className = 'time-input-group';

    // 分入力
    this._minutesInput = this._createNumberInput('minutes', 'Minutes', 0, 999);
    const minutesLabel = document.createElement('label');
    minutesLabel.textContent = 'min';
    minutesLabel.htmlFor = 'minutes';
    minutesLabel.className = 'sr-only';

    // セパレータ
    const separator = document.createElement('span');
    separator.className = 'time-input-group__separator';
    separator.textContent = ':';

    // 秒入力
    this._secondsInput = this._createNumberInput('seconds', 'Seconds', 0, 59);
    const secondsLabel = document.createElement('label');
    secondsLabel.textContent = 'sec';
    secondsLabel.htmlFor = 'seconds';
    secondsLabel.className = 'sr-only';

    timeInputGroup.appendChild(minutesLabel);
    timeInputGroup.appendChild(this._minutesInput);
    timeInputGroup.appendChild(separator);
    timeInputGroup.appendChild(secondsLabel);
    timeInputGroup.appendChild(this._secondsInput);

    timeGroup.appendChild(timeLabel);
    timeGroup.appendChild(timeInputGroup);

    // エラー表示
    this._errorElement = document.createElement('div');
    this._errorElement.className = 'form-error';
    this._errorElement.style.display = 'none';
    this._errorElement.setAttribute('role', 'alert');
    this._errorElement.setAttribute('aria-live', 'assertive');

    // 保存ボタン
    this._saveButton = document.createElement('button');
    this._saveButton.className = 'btn btn--primary';
    this._saveButton.textContent = 'Save Settings';
    this._saveButton.setAttribute('data-action', 'save-settings');
    this._saveButton.setAttribute('aria-label', '設定を保存');
    this._saveButton.type = 'button';
    this._saveButton.addEventListener('click', () => this._handleSave());

    // コンテナに追加
    this._container.appendChild(title);
    this._container.appendChild(timeGroup);
    this._container.appendChild(this._errorElement);
    this._container.appendChild(this._saveButton);

    // localStorageから設定を読み込む
    this._loadSettings();
  }

  /**
   * 入力欄の有効/無効を切り替える
   *
   * @param {import('../models/TimerState.js').TimerState} state - タイマーの状態
   *
   * @description
   * タイマーが実行中の場合は入力欄を無効化します。
   *
   * @example
   * ```javascript
   * const state = timer.getState();
   * panel.updateInputStates(state);
   * ```
   */
  updateInputStates(state) {
    if (!this._minutesInput || !this._secondsInput || !this._saveButton) {
      console.error('SettingsPanel not rendered yet');
      return;
    }

    const isRunning = state.status === 'running';
    this._minutesInput.disabled = isRunning;
    this._secondsInput.disabled = isRunning;
    this._saveButton.disabled = isRunning;
  }

  /**
   * 数値入力欄を作成する
   *
   * @private
   * @param {string} name - input要素のname属性
   * @param {string} ariaLabel - aria-label属性の値
   * @param {number} min - 最小値
   * @param {number} max - 最大値
   * @returns {HTMLInputElement} 作成された入力欄
   */
  _createNumberInput(name, ariaLabel, min, max) {
    const input = document.createElement('input');
    input.type = 'number';
    input.name = name;
    input.id = name;
    input.min = String(min);
    input.max = String(max);
    input.className = 'form-group__input time-input-group__input';
    input.setAttribute('aria-label', ariaLabel);
    input.required = true;
    return input;
  }

  /**
   * localStorageから設定を読み込む
   *
   * @private
   */
  _loadSettings() {
    const config = StorageService.loadTimerConfig();
    if (this._minutesInput && this._secondsInput) {
      this._minutesInput.value = String(config.durationMinutes);
      this._secondsInput.value = String(config.durationSeconds);
    }
  }

  /**
   * 設定を保存する
   *
   * @private
   */
  _handleSave() {
    if (!this._minutesInput || !this._secondsInput || !this._errorElement) {
      return;
    }

    // 入力値を取得
    const minutes = parseInt(this._minutesInput.value, 10);
    const seconds = parseInt(this._secondsInput.value, 10);

    // バリデーション
    const config = {
      durationMinutes: minutes,
      durationSeconds: seconds,
    };

    if (!isValidTimerConfig(config)) {
      this._showError('Invalid time setting. Please check the input.');
      return;
    }

    const totalSeconds = getTotalSeconds(config);
    if (totalSeconds === 0) {
      this._showError('Duration must be at least 1 second.');
      return;
    }

    // エラーをクリア
    this._hideError();

    // localStorageに保存
    try {
      StorageService.saveTimerConfig(config);
    } catch (error) {
      console.error('Failed to save timer config:', error);
      this._showError('Failed to save settings. Please try again.');
      return;
    }

    // コールバックを呼び出す
    if (this.onSave) {
      this.onSave(totalSeconds);
    }
  }

  /**
   * エラーメッセージを表示する
   *
   * @private
   * @param {string} message - エラーメッセージ
   */
  _showError(message) {
    if (this._errorElement) {
      this._errorElement.textContent = message;
      this._errorElement.style.display = 'block';
    }
  }

  /**
   * エラーメッセージを非表示にする
   *
   * @private
   */
  _hideError() {
    if (this._errorElement) {
      this._errorElement.textContent = '';
      this._errorElement.style.display = 'none';
    }
  }
}
