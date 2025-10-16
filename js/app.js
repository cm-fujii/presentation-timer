/**
 * @file app.js
 * @description アプリケーションのエントリポイント
 * @since 1.0.0
 */

import { TimerService } from './services/TimerService.js';
import { StorageService } from './services/StorageService.js';
import { AudioService } from './services/AudioService.js';
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
     * オーディオサービス
     * @private
     * @type {AudioService}
     */
    this._audioService = null;

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
    const timerConfig = StorageService.loadTimerConfig();
    const alertConfig = StorageService.loadAlertConfig();
    const totalSeconds = getTotalSeconds(timerConfig);

    // TimerServiceを初期化
    this._timerService = new TimerService(totalSeconds, alertConfig);

    // AudioServiceを初期化（ユーザーインタラクション後に音声を読み込む）
    this._audioService = new AudioService();
    this._audioService.setVolume(alertConfig.volume);

    // UIコンポーネントを初期化
    this._initializeUI();

    // イベントハンドラを接続
    this._connectEvents();

    // 初期表示を更新
    this._updateUI();

    // ユーザーインタラクション後にAudioServiceを初期化
    this._initializeAudioOnUserInteraction();
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

    // アラートイベントリスナー
    this._timerService.on('alert', (alertData) => {
      // eslint-disable-next-line no-console
      console.log(`🔔 Alert fired at ${alertData.remainingSeconds} seconds`);
      // AudioServiceが初期化済みで、アラートが有効な場合のみ音を再生
      if (this._audioService && this._audioService.isInitialized()) {
        const alertConfig = this._timerService.getAlertConfig();
        // eslint-disable-next-line no-console
        console.log(`🔊 Alert config:`, alertConfig);
        if (alertConfig && alertConfig.enabled) {
          // eslint-disable-next-line no-console
          console.log(`🎵 Playing alert sound...`);
          this._audioService.play();
        } else {
          // eslint-disable-next-line no-console
          console.warn(`⚠️ Alert is disabled or config is missing`);
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn(`⚠️ AudioService not initialized yet`);
      }
    });

    // ControlPanelのイベントハンドラ
    if (this._controlPanel) {
      this._controlPanel.onStart = () => {
        this._timerService.start();
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
        // タイマー時間を更新
        this._timerService.setDuration(totalSeconds);

        // アラート設定を再読み込みしてサービスに反映
        const alertConfig = StorageService.loadAlertConfig();
        this._timerService.setAlertConfig(alertConfig);
        if (this._audioService) {
          this._audioService.setVolume(alertConfig.volume);
        }

        this._updateUI();
        // eslint-disable-next-line no-console
        console.log(`Settings saved: ${totalSeconds}s, alerts: ${alertConfig.enabled}`);
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

  /**
   * ユーザーインタラクション後にAudioServiceを初期化する
   *
   * @private
   * @description
   * Web Audio APIの制限により、ユーザーインタラクション後に音声を初期化する必要があります。
   * 最初のクリックまたはタッチイベントでAudioServiceを初期化します。
   */
  _initializeAudioOnUserInteraction() {
    const initAudio = async () => {
      try {
        // 音声ファイルのパス（Vite base pathを考慮）
        const audioUrl = '/presentation-timer/assets/sounds/alert.mp3';

        // AudioServiceを初期化
        await this._audioService.initialize(audioUrl);

        // eslint-disable-next-line no-console
        console.log('AudioService initialized successfully');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to initialize AudioService:', error);
        // 音声が読み込めない場合でもアプリは動作続行
      }
    };

    // 最初のユーザーインタラクションでAudioServiceを初期化
    const events = ['click', 'touchstart', 'keydown'];
    const handleUserInteraction = () => {
      initAudio();
      // イベントリスナーを削除（1回のみ実行）
      events.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };

    // 各イベントにリスナーを追加
    events.forEach((event) => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });
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
