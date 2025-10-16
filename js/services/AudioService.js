/**
 * @file AudioService.js
 * @description Web Audio APIを使用したアラート音の再生サービス
 * @since 1.0.0
 */

/**
 * AudioService - アラート音の再生を管理するサービス
 *
 * @description
 * Web Audio APIを使用して複数のアラート音を再生します。
 * Safari対応のため、ユーザーインタラクション後に初期化します。
 *
 * @example
 * ```javascript
 * import { SoundType } from '../models/SoundType.js';
 * const audioService = new AudioService();
 *
 * // ユーザーインタラクション後に初期化
 * document.addEventListener('click', async () => {
 *   await audioService.initialize([
 *     { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
 *     { type: SoundType.GONG, url: '/assets/sounds/gong.mp3' }
 *   ]);
 * }, { once: true });
 *
 * // 音声を再生
 * audioService.play(SoundType.BELL);
 *
 * // 音声をプレビュー
 * audioService.preview(SoundType.GONG);
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
     * 音の種類ごとのデコード済み音声バッファのマップ
     * @private
     * @type {Map<string, AudioBuffer>}
     */
    this._audioBuffers = new Map();

    /**
     * 音量ノード
     * @private
     * @type {GainNode | null}
     */
    this._gainNode = null;

    /**
     * プレビュー再生中のソースノード
     * @private
     * @type {AudioBufferSourceNode | null}
     */
    this._previewSource = null;

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
   * @param {Array<{type: string, url: string}>} soundConfigs - 音声ファイルの設定配列
   * @returns {Promise<void>}
   *
   * @description
   * Web Audio Contextを作成し、複数の音声ファイルを読み込んでデコードします。
   * Safari対応のため、ユーザーインタラクション後に呼び出す必要があります。
   *
   * @example
   * ```javascript
   * import { SoundType } from '../models/SoundType.js';
   * const audioService = new AudioService();
   *
   * // ユーザークリック後に初期化
   * document.addEventListener('click', async () => {
   *   try {
   *     await audioService.initialize([
   *       { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
   *       { type: SoundType.GONG, url: '/assets/sounds/gong.mp3' }
   *     ]);
   *     console.log('AudioService initialized');
   *   } catch (error) {
   *     console.error('Failed to initialize:', error);
   *   }
   * }, { once: true });
   * ```
   */
  async initialize(soundConfigs) {
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

      // 複数の音声ファイルを読み込んでデコード
      for (const config of soundConfigs) {
        try {
          const buffer = await this._loadAndDecodeAudio(config.url);
          this._audioBuffers.set(config.type, buffer);
        } catch (error) {
          console.error(`Failed to load sound: ${config.type}`, error);
          // エラーが発生しても他の音声は読み込み続ける
        }
      }

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
   * @returns {Promise<AudioBuffer>} デコードされた音声バッファ
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
      return await this._audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Failed to load and decode audio:', error);
      throw error;
    }
  }

  /**
   * アラート音を再生する
   *
   * @param {string} soundType - 再生する音の種類 (SoundType.BELL または SoundType.GONG)
   *
   * @description
   * 指定された種類の音声バッファを再生します。
   * 初期化されていない場合や音声バッファが見つからない場合は何もしません。
   *
   * @example
   * ```javascript
   * import { SoundType } from '../models/SoundType.js';
   * audioService.play(SoundType.BELL); // ベルの音を再生
   * audioService.play(SoundType.GONG); // 銅鑼の音を再生
   * ```
   */
  play(soundType) {
    if (!this._initialized || !this._audioContext) {
      console.warn('AudioService not initialized');
      return;
    }

    const buffer = this._audioBuffers.get(soundType);
    if (!buffer) {
      console.warn(`Sound type not found: ${soundType}`);
      return;
    }

    try {
      // AudioContextがsuspended状態の場合はresume
      if (this._audioContext.state === 'suspended') {
        this._audioContext.resume();
      }

      // AudioBufferSourceNodeを作成
      const source = this._audioContext.createBufferSource();
      source.buffer = buffer;
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
   * アラート音をプレビュー再生する
   *
   * @param {string} soundType - プレビューする音の種類 (SoundType.BELL または SoundType.GONG)
   *
   * @description
   * 指定された種類の音声をプレビュー再生します。
   * 既にプレビュー再生中の音がある場合は停止してから新しい音を再生します。
   *
   * @example
   * ```javascript
   * import { SoundType } from '../models/SoundType.js';
   * audioService.preview(SoundType.BELL); // ベルの音をプレビュー
   * ```
   */
  preview(soundType) {
    if (!this._initialized || !this._audioContext) {
      console.warn('AudioService not initialized');
      return;
    }

    // 既にプレビュー再生中の音があれば停止
    if (this._previewSource) {
      try {
        this._previewSource.stop();
      } catch (error) {
        // 既に停止している場合のエラーは無視
      }
      this._previewSource = null;
    }

    const buffer = this._audioBuffers.get(soundType);
    if (!buffer) {
      console.warn(`Sound type not found: ${soundType}`);
      return;
    }

    try {
      // AudioContextがsuspended状態の場合はresume
      if (this._audioContext.state === 'suspended') {
        this._audioContext.resume();
      }

      // AudioBufferSourceNodeを作成
      const source = this._audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this._gainNode);

      // 再生終了時のクリーンアップ
      source.onended = () => {
        this._previewSource = null;
      };

      // プレビューソースとして保存
      this._previewSource = source;

      // 再生開始
      source.start(0);
    } catch (error) {
      console.error('Failed to preview audio:', error);
    }
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
    // プレビュー再生中の音を停止
    if (this._previewSource) {
      try {
        this._previewSource.stop();
      } catch (error) {
        // 既に停止している場合のエラーは無視
      }
      this._previewSource = null;
    }

    if (this._audioContext) {
      this._audioContext.close();
      this._audioContext = null;
    }

    this._audioBuffers.clear();
    this._gainNode = null;
    this._initialized = false;
  }
}
