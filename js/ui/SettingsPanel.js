/**
 * @file SettingsPanel.js
 * @description タイマー設定パネルを管理するUIコンポーネント
 * @since 1.0.0
 */

import { StorageService } from '../services/StorageService.js';
import { getTotalSeconds, isValidTimerConfig } from '../models/TimerConfig.js';
import { createDefaultAlertConfig, isValidAlertConfig } from '../models/AlertConfig.js';

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
     * アラート有効化チェックボックス
     * @private
     * @type {HTMLInputElement | null}
     */
    this._alertEnabledCheckbox = null;

    /**
     * 音量スライダー
     * @private
     * @type {HTMLInputElement | null}
     */
    this._volumeSlider = null;

    /**
     * 音量値表示
     * @private
     * @type {HTMLSpanElement | null}
     */
    this._volumeValue = null;

    /**
     * アラートポイント入力欄のコンテナ
     * @private
     * @type {HTMLDivElement | null}
     */
    this._alertPointsContainer = null;

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

    // アラート設定セクション
    const alertSection = this._createAlertSettingsSection();

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
    this._container.appendChild(alertSection);
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

    // アラート設定も無効化
    if (this._alertEnabledCheckbox) {
      this._alertEnabledCheckbox.disabled = isRunning;
    }
    if (this._volumeSlider) {
      this._volumeSlider.disabled = isRunning;
    }
  }

  /**
   * アラート設定セクションを作成する
   *
   * @private
   * @returns {HTMLDivElement} アラート設定セクション
   */
  _createAlertSettingsSection() {
    const section = document.createElement('div');
    section.className = 'alert-settings';

    // セクションタイトル
    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'alert-settings__title';
    sectionTitle.textContent = 'Alert Settings';

    // アラート有効化チェックボックス
    const enabledGroup = document.createElement('div');
    enabledGroup.className = 'form-group';

    const enabledLabel = document.createElement('label');
    enabledLabel.className = 'form-group__label form-group__label--checkbox';
    enabledLabel.htmlFor = 'alert-enabled';

    this._alertEnabledCheckbox = document.createElement('input');
    this._alertEnabledCheckbox.type = 'checkbox';
    this._alertEnabledCheckbox.id = 'alert-enabled';
    this._alertEnabledCheckbox.className = 'form-group__checkbox';
    this._alertEnabledCheckbox.setAttribute('aria-label', 'Enable alert sound');

    const enabledText = document.createElement('span');
    enabledText.textContent = 'Enable Alert Sound';

    enabledLabel.appendChild(this._alertEnabledCheckbox);
    enabledLabel.appendChild(enabledText);
    enabledGroup.appendChild(enabledLabel);

    // 音量スライダー
    const volumeGroup = document.createElement('div');
    volumeGroup.className = 'form-group';

    const volumeLabel = document.createElement('label');
    volumeLabel.className = 'form-group__label';
    volumeLabel.htmlFor = 'alert-volume';
    volumeLabel.textContent = 'Volume';

    const volumeInputGroup = document.createElement('div');
    volumeInputGroup.className = 'volume-input-group';

    this._volumeSlider = document.createElement('input');
    this._volumeSlider.type = 'range';
    this._volumeSlider.id = 'alert-volume';
    this._volumeSlider.className = 'form-group__slider';
    this._volumeSlider.min = '0';
    this._volumeSlider.max = '100';
    this._volumeSlider.step = '1';
    this._volumeSlider.setAttribute('aria-label', 'Alert volume');
    this._volumeSlider.addEventListener('input', () => this._updateVolumeValue());

    this._volumeValue = document.createElement('span');
    this._volumeValue.className = 'volume-input-group__value';
    this._volumeValue.textContent = '80%';

    volumeInputGroup.appendChild(this._volumeSlider);
    volumeInputGroup.appendChild(this._volumeValue);

    volumeGroup.appendChild(volumeLabel);
    volumeGroup.appendChild(volumeInputGroup);

    // アラートポイント設定
    const pointsGroup = document.createElement('div');
    pointsGroup.className = 'form-group';

    const pointsLabel = document.createElement('label');
    pointsLabel.className = 'form-group__label';
    pointsLabel.textContent = 'Alert Points (seconds remaining)';

    this._alertPointsContainer = document.createElement('div');
    this._alertPointsContainer.className = 'alert-points-container';

    const addPointButton = document.createElement('button');
    addPointButton.type = 'button';
    addPointButton.className = 'btn btn--secondary btn--small';
    addPointButton.textContent = '+ Add Alert Point';
    addPointButton.setAttribute('aria-label', 'Add alert point');
    addPointButton.addEventListener('click', () => this._addAlertPoint());

    pointsGroup.appendChild(pointsLabel);
    pointsGroup.appendChild(this._alertPointsContainer);
    pointsGroup.appendChild(addPointButton);

    // セクションに追加
    section.appendChild(sectionTitle);
    section.appendChild(enabledGroup);
    section.appendChild(volumeGroup);
    section.appendChild(pointsGroup);

    return section;
  }

  /**
   * 音量値の表示を更新する
   *
   * @private
   */
  _updateVolumeValue() {
    if (this._volumeSlider && this._volumeValue) {
      const value = parseInt(this._volumeSlider.value, 10);
      this._volumeValue.textContent = `${value}%`;
    }
  }

  /**
   * アラートポイントを追加する
   *
   * @private
   * @param {number} [seconds=60] - 秒数（デフォルト: 60秒）
   */
  _addAlertPoint(seconds = 60) {
    if (!this._alertPointsContainer) {
      return;
    }

    const pointItem = document.createElement('div');
    pointItem.className = 'alert-point-item';

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-group__input alert-point-item__input';
    input.min = '0';
    input.max = '999999';
    input.value = String(seconds);
    input.setAttribute('aria-label', 'Alert point seconds');

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'btn btn--danger btn--small';
    removeButton.textContent = 'Remove';
    removeButton.setAttribute('aria-label', 'Remove this alert point');
    removeButton.addEventListener('click', () => {
      this._alertPointsContainer?.removeChild(pointItem);
    });

    pointItem.appendChild(input);
    pointItem.appendChild(removeButton);
    this._alertPointsContainer.appendChild(pointItem);
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
    // タイマー設定を読み込む
    const config = StorageService.loadTimerConfig();
    if (this._minutesInput && this._secondsInput) {
      this._minutesInput.value = String(config.durationMinutes);
      this._secondsInput.value = String(config.durationSeconds);
    }

    // アラート設定を読み込む
    const alertConfig = StorageService.loadAlertConfig();
    if (this._alertEnabledCheckbox) {
      this._alertEnabledCheckbox.checked = alertConfig.enabled;
    }
    if (this._volumeSlider) {
      this._volumeSlider.value = String(Math.round(alertConfig.volume * 100));
      this._updateVolumeValue();
    }

    // アラートポイントを読み込む
    if (this._alertPointsContainer) {
      // 既存のポイントをクリア
      this._alertPointsContainer.innerHTML = '';
      // 各ポイントを追加
      alertConfig.points.forEach((point) => {
        this._addAlertPoint(point);
      });
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

    // タイマー設定の入力値を取得
    const minutes = parseInt(this._minutesInput.value, 10);
    const seconds = parseInt(this._secondsInput.value, 10);

    // タイマー設定のバリデーション
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

    // アラート設定を取得
    const alertConfig = this._getAlertConfig();
    if (!alertConfig) {
      this._showError('Invalid alert settings. Please check the input.');
      return;
    }

    // エラーをクリア
    this._hideError();

    // localStorageに保存
    try {
      StorageService.saveTimerConfig(config);
      StorageService.saveAlertConfig(alertConfig);
    } catch (error) {
      console.error('Failed to save settings:', error);
      this._showError('Failed to save settings. Please try again.');
      return;
    }

    // コールバックを呼び出す
    if (this.onSave) {
      this.onSave(totalSeconds);
    }
  }

  /**
   * アラート設定を取得する
   *
   * @private
   * @returns {import('../models/AlertConfig.js').AlertConfig | null} アラート設定（無効な場合はnull）
   */
  _getAlertConfig() {
    if (!this._alertEnabledCheckbox || !this._volumeSlider || !this._alertPointsContainer) {
      return null;
    }

    // アラートポイントを収集
    const pointInputs = this._alertPointsContainer.querySelectorAll('input[type="number"]');
    const points = [];
    for (const input of pointInputs) {
      const value = parseInt(input.value, 10);
      if (isNaN(value) || value < 0) {
        return null; // 無効な値
      }
      points.push(value);
    }

    const alertConfig = {
      enabled: this._alertEnabledCheckbox.checked,
      volume: parseInt(this._volumeSlider.value, 10) / 100,
      points: points,
    };

    // バリデーション
    if (!isValidAlertConfig(alertConfig)) {
      return null;
    }

    return alertConfig;
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
