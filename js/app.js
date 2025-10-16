/**
 * @file app.js
 * @description アプリケーションのエントリポイント
 * @since 1.0.0
 */

import { TimerService } from './services/TimerService.js';
import { StorageService } from './services/StorageService.js';
import { TimerDisplay } from './ui/TimerDisplay.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { SettingsPanel } from './ui/SettingsPanel.js';
import { getTotalSeconds } from './models/TimerConfig.js';

/**
 * アプリケーションクラス
 *
 * @description
 * タイマーアプリケーション全体を初期化し、
 * 各コンポーネント間のイベントを接続します。
 */
class App {
  constructor() {
    /**
     * タイマーサービス
     * @private
     * @type {TimerService}
     */
    this._timerService = null;

    /**
     * タイマー表示コンポーネント
     * @private
     * @type {TimerDisplay}
     */
    this._timerDisplay = null;

    /**
     * コントロールパネルコンポーネント
     * @private
     * @type {ControlPanel}
     */
    this._controlPanel = null;

    /**
     * 設定パネルコンポーネント
     * @private
     * @type {SettingsPanel}
     */
    this._settingsPanel = null;
  }

  /**
   * アプリケーションを初期化する
   *
   * @description
   * 各コンポーネントを作成し、イベントハンドラを接続します。
   */
  init() {
    // localStorageから設定を読み込む
    const config = StorageService.loadTimerConfig();
    const totalSeconds = getTotalSeconds(config);
    // eslint-disable-next-line no-console
    console.log('Loading config:', config, 'Total seconds:', totalSeconds);

    // TimerServiceを初期化
    this._timerService = new TimerService(totalSeconds);

    // UIコンポーネントを初期化
    this._initializeUI();

    // イベントハンドラを接続
    this._connectEvents();

    // 初期表示を更新
    this._updateUI();
    // eslint-disable-next-line no-console
    console.log('Initial UI updated with state:', this._timerService.getState());
  }

  /**
   * UIコンポーネントを初期化する
   *
   * @private
   */
  _initializeUI() {
    // TimerDisplay
    const timerDisplayContainer = document.getElementById('timer-display');
    if (timerDisplayContainer) {
      this._timerDisplay = new TimerDisplay(timerDisplayContainer);
      this._timerDisplay.render();
    } else {
      console.error('Timer display container not found');
    }

    // ControlPanel
    const controlPanelContainer = document.getElementById('control-panel');
    if (controlPanelContainer) {
      this._controlPanel = new ControlPanel(controlPanelContainer);
      this._controlPanel.render();
    } else {
      console.error('Control panel container not found');
    }

    // SettingsPanel
    const settingsPanelContainer = document.getElementById('settings-panel');
    if (settingsPanelContainer) {
      this._settingsPanel = new SettingsPanel(settingsPanelContainer);
      this._settingsPanel.render();
    } else {
      console.error('Settings panel container not found');
    }
  }

  /**
   * イベントハンドラを接続する
   *
   * @private
   */
  _connectEvents() {
    // TimerServiceのイベントリスナー
    this._timerService.on('tick', () => {
      this._updateUI();
    });

    this._timerService.on('complete', () => {
      // eslint-disable-next-line no-console
      console.log('Timer completed!');
      // completeイベント後もカウントを継続するため、UIは更新し続ける
    });

    // ControlPanelのイベントハンドラ
    if (this._controlPanel) {
      this._controlPanel.onStart = () => {
        // eslint-disable-next-line no-console
        console.log('Start button clicked, current state:', this._timerService.getState());
        this._timerService.start();
        // eslint-disable-next-line no-console
        console.log('After start, state:', this._timerService.getState());
        this._updateUI();
      };

      this._controlPanel.onPause = () => {
        this._timerService.pause();
        this._updateUI();
      };

      this._controlPanel.onResume = () => {
        this._timerService.resume();
        this._updateUI();
      };

      this._controlPanel.onReset = () => {
        this._timerService.reset();
        this._updateUI();
      };
    }

    // SettingsPanelのイベントハンドラ
    if (this._settingsPanel) {
      this._settingsPanel.onSave = (totalSeconds) => {
        this._timerService.setDuration(totalSeconds);
        this._updateUI();
        // eslint-disable-next-line no-console
        console.log(`Timer duration set to ${totalSeconds} seconds`);
      };
    }
  }

  /**
   * UIを更新する
   *
   * @private
   */
  _updateUI() {
    const state = this._timerService.getState();

    // TimerDisplayを更新
    if (this._timerDisplay) {
      this._timerDisplay.update(state);
    }

    // ControlPanelのボタン状態を更新
    if (this._controlPanel) {
      this._controlPanel.updateButtonStates(state);
    }

    // SettingsPanelの入力欄状態を更新
    if (this._settingsPanel) {
      this._settingsPanel.updateInputStates(state);
    }
  }
}

/**
 * アプリケーションを初期化する
 */
function initializeApp() {
  // DOMの読み込みが完了したら初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const app = new App();
      app.init();
      // eslint-disable-next-line no-console
      console.log('Presentation Timer initialized');
    });
  } else {
    // 既にDOMが読み込まれている場合はすぐに初期化
    const app = new App();
    app.init();
    // eslint-disable-next-line no-console
    console.log('Presentation Timer initialized');
  }
}

// アプリケーションを初期化
initializeApp();
