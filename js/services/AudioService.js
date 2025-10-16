/**
 * @file AudioService.js
 * @description Web Audio APIを使用したアラート音の再生サービス
 * @since 1.0.0
 */

/**
 * AudioService - アラート音の再生を管理するサービス
 *
 * @description
 * Web Audio APIを使用してアラート音を再生します。
 * Safari対応のため、ユーザーインタラクション後に初期化します。
 *
 * @example
 * ```javascript
 * const audioService = new AudioService();
 *
 * // ユーザーインタラクション後に初期化
 * document.addEventListener('click', async () => {
 *   await audioService.initialize('/assets/sounds/alert.mp3');
 * }, { once: true });
 *
 * // 音声を再生
 * audioService.play();
 *
 * // 音量を変更
 * audioService.setVolume(0.5);
 * ```
 */
export class AudioService {
  /**
   * AudioServiceのコンストラクタ
   */
  constructor() {
    /**
     * Web Audio Context
     * @private
     * @type {AudioContext | null}
     */
    this._audioContext = null;

    /**
     * デコード済みの音声バッファ
     * @private
     * @type {AudioBuffer | null}
     */
    this._audioBuffer = null;

    /**
     * 音量ノード
     * @private
     * @type {GainNode | null}
     */
    this._gainNode = null;

    /**
     * 音量（0.0～1.0）
     * @private
     * @type {number}
     */
    this._volume = 0.8;

    /**
     * 初期化済みかどうか
     * @private
     * @type {boolean}
     */
    this._initialized = false;
  }

  /**
   * AudioServiceを初期化する
   *
   * @param {string} audioUrl - 音声ファイルのURL
   * @returns {Promise<void>}
   *
   * @description
   * Web Audio Contextを作成し、音声ファイルを読み込んでデコードします。
   * Safari対応のため、ユーザーインタラクション後に呼び出す必要があります。
   *
   * @example
   * ```javascript
   * const audioService = new AudioService();
   *
   * // ユーザークリック後に初期化
   * document.addEventListener('click', async () => {
   *   try {
   *     await audioService.initialize('/assets/sounds/alert.mp3');
   *     console.log('AudioService initialized');
   *   } catch (error) {
   *     console.error('Failed to initialize:', error);
   *   }
   * }, { once: true });
   * ```
   */
  async initialize(audioUrl) {
    if (this._initialized) {
      return; // 既に初期化済み
    }

    try {
      // AudioContextを作成（Safari対応）
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API is not supported');
      }

      this._audioContext = new AudioContextClass();

      // GainNodeを作成（音量調整用）
      this._gainNode = this._audioContext.createGain();
      this._gainNode.connect(this._audioContext.destination);
      this._gainNode.gain.value = this._volume;

      // 音声ファイルを読み込んでデコード
      await this._loadAndDecodeAudio(audioUrl);

      this._initialized = true;
    } catch (error) {
      console.error('Failed to initialize AudioService:', error);
      throw error;
    }
  }

  /**
   * 音声ファイルを読み込んでデコードする
   *
   * @private
   * @param {string} audioUrl - 音声ファイルのURL
   * @returns {Promise<void>}
   */
  async _loadAndDecodeAudio(audioUrl) {
    try {
      // 音声ファイルをfetch
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      // AudioBufferにデコード
      this._audioBuffer = await this._audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Failed to load and decode audio:', error);
      throw error;
    }
  }

  /**
   * アラート音を再生する
   *
   * @description
   * デコード済みの音声バッファを再生します。
   * 初期化されていない場合は何もしません。
   *
   * @example
   * ```javascript
   * audioService.play(); // アラート音を再生
   * ```
   */
  play() {
    if (!this._initialized || !this._audioBuffer || !this._audioContext) {
      console.warn('AudioService not initialized');
      return;
    }

    try {
      // AudioContextがsuspended状態の場合はresume
      if (this._audioContext.state === 'suspended') {
        this._audioContext.resume();
      }

      // AudioBufferSourceNodeを作成
      const source = this._audioContext.createBufferSource();
      source.buffer = this._audioBuffer;
      source.connect(this._gainNode);

      // 再生開始
      source.start(0);
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }

  /**
   * 音量を設定する
   *
   * @param {number} volume - 音量（0.0～1.0）
   *
   * @description
   * 音量を0.0～1.0の範囲で設定します。
   * 範囲外の値は自動的にクランプされます。
   *
   * @example
   * ```javascript
   * audioService.setVolume(0.5); // 音量を50%に設定
   * audioService.setVolume(1.5); // 1.0にクランプされる
   * ```
   */
  setVolume(volume) {
    // 0.0～1.0にクランプ
    this._volume = Math.max(0, Math.min(1, volume));

    // GainNodeが作成済みの場合は即座に反映
    if (this._gainNode) {
      this._gainNode.gain.value = this._volume;
    }
  }

  /**
   * 現在の音量を取得する
   *
   * @returns {number} 音量（0.0～1.0）
   *
   * @example
   * ```javascript
   * const volume = audioService.getVolume();
   * console.log(volume); // 0.8
   * ```
   */
  getVolume() {
    return this._volume;
  }

  /**
   * 初期化済みかどうかを取得する
   *
   * @returns {boolean} 初期化済みの場合はtrue
   *
   * @example
   * ```javascript
   * if (audioService.isInitialized()) {
   *   audioService.play();
   * }
   * ```
   */
  isInitialized() {
    return this._initialized;
  }

  /**
   * AudioServiceをクリーンアップする
   *
   * @description
   * AudioContextをクローズし、リソースを解放します。
   *
   * @example
   * ```javascript
   * audioService.dispose();
   * ```
   */
  dispose() {
    if (this._audioContext) {
      this._audioContext.close();
      this._audioContext = null;
    }

    this._audioBuffer = null;
    this._gainNode = null;
    this._initialized = false;
  }
}
