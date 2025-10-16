/**
 * @file ControlPanel.js
 * @description タイマー操作パネルを管理するUIコンポーネント
 * @since 1.0.0
 */

/**
 * ControlPanel - タイマーの操作ボタンを管理するコンポーネント
 *
 * @description
 * Start/Pause/Resume/Resetボタンを表示し、
 * タイマーの状態に応じてボタンの有効/無効を切り替えます。
 *
 * @example
 * ```javascript
 * const panel = new ControlPanel(document.getElementById('control-panel'));
 * panel.render();
 *
 * // イベントハンドラを設定
 * panel.onStart = () => timer.start();
 * panel.onPause = () => timer.pause();
 * panel.onResume = () => timer.resume();
 * panel.onReset = () => timer.reset();
 *
 * // ボタンの状態を更新
 * panel.updateButtonStates(timer.getState());
 * ```
 */
export class ControlPanel {
  /**
   * ControlPanelのコンストラクタ
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
     * Startボタン
     * @private
     * @type {HTMLButtonElement | null}
     */
    this._startButton = null;

    /**
     * Pauseボタン
     * @private
     * @type {HTMLButtonElement | null}
     */
    this._pauseButton = null;

    /**
     * Resumeボタン
     * @private
     * @type {HTMLButtonElement | null}
     */
    this._resumeButton = null;

    /**
     * Resetボタン
     * @private
     * @type {HTMLButtonElement | null}
     */
    this._resetButton = null;

    /**
     * イベントハンドラ
     * @type {Function | null}
     */
    this.onStart = null;
    this.onPause = null;
    this.onResume = null;
    this.onReset = null;
  }

  /**
   * コンポーネントをレンダリングする
   *
   * @description
   * ボタンを作成し、イベントリスナーを設定します。
   * アクセシビリティ対応として、適切なARIA属性を設定します。
   *
   * @example
   * ```javascript
   * const panel = new ControlPanel(container);
   * panel.render();
   * ```
   */
  render() {
    // 既存の内容をクリア
    this._container.innerHTML = '';

    // Startボタンを作成
    this._startButton = this._createButton('Start', 'start', 'タイマーを開始', 'btn--primary');
    this._startButton.addEventListener('click', () => {
      // eslint-disable-next-line no-console
      console.log('Start button clicked, onStart:', this.onStart);
      if (this.onStart) {
        this.onStart();
      }
    });

    // Pauseボタンを作成
    this._pauseButton = this._createButton(
      'Pause',
      'pause',
      'タイマーを一時停止',
      'btn--secondary'
    );
    this._pauseButton.style.display = 'none'; // 初期状態では非表示
    this._pauseButton.addEventListener('click', () => {
      if (this.onPause) {
        this.onPause();
      }
    });

    // Resumeボタンを作成
    this._resumeButton = this._createButton('Resume', 'resume', 'タイマーを再開', 'btn--primary');
    this._resumeButton.style.display = 'none'; // 初期状態では非表示
    this._resumeButton.addEventListener('click', () => {
      if (this.onResume) {
        this.onResume();
      }
    });

    // Resetボタンを作成
    this._resetButton = this._createButton('Reset', 'reset', 'タイマーをリセット', 'btn--danger');
    this._resetButton.addEventListener('click', () => {
      if (this.onReset) {
        this.onReset();
      }
    });

    // コンテナに追加
    this._container.appendChild(this._startButton);
    this._container.appendChild(this._pauseButton);
    this._container.appendChild(this._resumeButton);
    this._container.appendChild(this._resetButton);
  }

  /**
   * ボタンの状態を更新する
   *
   * @param {import('../models/TimerState.js').TimerState} state - タイマーの状態
   *
   * @description
   * タイマーの状態に応じてボタンの有効/無効と表示/非表示を切り替えます。
   * - idle: Start有効、Pause/Resume非表示、Reset無効
   * - running: Start無効、Pause表示、Resume非表示、Reset有効
   * - paused: Start無効、Pause非表示、Resume表示、Reset有効
   *
   * @example
   * ```javascript
   * const state = timer.getState();
   * panel.updateButtonStates(state);
   * ```
   */
  updateButtonStates(state) {
    if (!this._startButton || !this._pauseButton || !this._resumeButton || !this._resetButton) {
      console.error('ControlPanel not rendered yet');
      return;
    }

    switch (state.status) {
      case 'idle':
        // idle: Start有効、Pause/Resume非表示、Reset無効
        this._startButton.disabled = false;
        this._pauseButton.style.display = 'none';
        this._resumeButton.style.display = 'none';
        this._resetButton.disabled = true;
        break;

      case 'running':
        // running: Start無効、Pause表示、Resume非表示、Reset有効
        this._startButton.disabled = true;
        this._pauseButton.style.display = 'inline-flex';
        this._resumeButton.style.display = 'none';
        this._resetButton.disabled = false;
        break;

      case 'paused':
        // paused: Start無効、Pause非表示、Resume表示、Reset有効
        this._startButton.disabled = true;
        this._pauseButton.style.display = 'none';
        this._resumeButton.style.display = 'inline-flex';
        this._resetButton.disabled = false;
        break;

      default:
        console.warn(`Unknown timer status: ${state.status}`);
    }
  }

  /**
   * ボタン要素を作成する
   *
   * @private
   * @param {string} text - ボタンのテキスト
   * @param {string} action - data-action属性の値
   * @param {string} ariaLabel - aria-label属性の値
   * @param {string} [extraClass=''] - 追加のCSSクラス
   * @returns {HTMLButtonElement} 作成されたボタン要素
   */
  _createButton(text, action, ariaLabel, extraClass = '') {
    const button = document.createElement('button');
    button.className = `btn ${extraClass}`.trim();
    button.textContent = text;
    button.setAttribute('data-action', action);
    button.setAttribute('aria-label', ariaLabel);
    button.type = 'button';
    return button;
  }
}
