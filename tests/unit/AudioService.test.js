/**
 * @file AudioService.test.js
 * @description AudioService のユニットテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioService } from '../../js/services/AudioService.js';
import { SoundType } from '../../js/models/SoundType.js';

// Web Audio API のモック
class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.destination = {};
  }

  createGain() {
    return {
      gain: { value: 0 },
      connect: vi.fn(),
    };
  }

  createBufferSource() {
    return {
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
    };
  }

  async decodeAudioData() {
    return { duration: 1.0 }; // モックのAudioBuffer
  }

  resume() {
    this.state = 'running';
  }

  close() {
    this.state = 'closed';
  }
}

// グローバルのAudioContextをモック
global.AudioContext = MockAudioContext;
global.webkitAudioContext = MockAudioContext;

// fetch APIのモック
global.fetch = vi.fn();

describe('AudioService', () => {
  let audioService;

  beforeEach(() => {
    audioService = new AudioService();
    vi.clearAllMocks();

    // fetchのデフォルトモック実装
    global.fetch.mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    });
  });

  afterEach(() => {
    if (audioService) {
      audioService.dispose();
    }
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(audioService.isInitialized()).toBe(false);
      expect(audioService.getVolume()).toBe(0.8);
    });
  });

  describe('initialize - multiple sounds', () => {
    it('should initialize with multiple sound files', async () => {
      const soundConfigs = [
        { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
        { type: SoundType.GONG, url: '/assets/sounds/gong.mp3' },
      ];

      await audioService.initialize(soundConfigs);

      expect(audioService.isInitialized()).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith('/assets/sounds/bell.mp3');
      expect(global.fetch).toHaveBeenCalledWith('/assets/sounds/gong.mp3');
    });

    it('should not re-initialize if already initialized', async () => {
      const soundConfigs = [
        { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
      ];

      await audioService.initialize(soundConfigs);
      const firstCallCount = global.fetch.mock.calls.length;

      await audioService.initialize(soundConfigs);
      const secondCallCount = global.fetch.mock.calls.length;

      expect(firstCallCount).toBe(secondCallCount);
    });

    it('should continue loading other sounds if one fails', async () => {
      let callCount = 0;
      global.fetch.mockImplementation((url) => {
        callCount++;
        if (url.includes('bell.mp3')) {
          return Promise.reject(new Error('Failed to load bell.mp3'));
        }
        return Promise.resolve({
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(8),
        });
      });

      const soundConfigs = [
        { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
        { type: SoundType.GONG, url: '/assets/sounds/gong.mp3' },
      ];

      await audioService.initialize(soundConfigs);

      expect(audioService.isInitialized()).toBe(true);
      expect(callCount).toBe(2);
    });

    it('should create AudioContext and GainNode', async () => {
      const soundConfigs = [
        { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
      ];

      await audioService.initialize(soundConfigs);

      expect(audioService._audioContext).toBeDefined();
      expect(audioService._gainNode).toBeDefined();
    });

    it('should set gain node value to current volume', async () => {
      audioService.setVolume(0.5);

      const soundConfigs = [
        { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
      ];

      await audioService.initialize(soundConfigs);

      expect(audioService._gainNode.gain.value).toBe(0.5);
    });

    it('should handle empty sound configs array', async () => {
      await audioService.initialize([]);

      expect(audioService.isInitialized()).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('play - with soundType', () => {
    beforeEach(async () => {
      const soundConfigs = [
        { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
        { type: SoundType.GONG, url: '/assets/sounds/gong.mp3' },
      ];
      await audioService.initialize(soundConfigs);
    });

    it('should play specified sound type', () => {
      const createBufferSourceSpy = vi.spyOn(
        audioService._audioContext,
        'createBufferSource'
      );

      audioService.play(SoundType.BELL);

      expect(createBufferSourceSpy).toHaveBeenCalled();
    });

    it('should not play if not initialized', () => {
      const uninitializedService = new AudioService();
      const createBufferSourceSpy = vi.spyOn(
        MockAudioContext.prototype,
        'createBufferSource'
      );

      uninitializedService.play(SoundType.BELL);

      expect(createBufferSourceSpy).not.toHaveBeenCalled();
    });

    it('should not play if sound type not found', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      audioService.play('invalid-sound');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sound type not found')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should resume AudioContext if suspended', () => {
      audioService._audioContext.state = 'suspended';
      const resumeSpy = vi.spyOn(audioService._audioContext, 'resume');

      audioService.play(SoundType.BELL);

      expect(resumeSpy).toHaveBeenCalled();
    });

    it('should connect source to gain node', () => {
      const source = audioService._audioContext.createBufferSource();
      const connectSpy = vi.spyOn(source, 'connect');

      audioService._audioContext.createBufferSource = vi.fn(() => source);

      audioService.play(SoundType.GONG);

      expect(connectSpy).toHaveBeenCalledWith(audioService._gainNode);
    });

    it('should start playback', () => {
      const source = audioService._audioContext.createBufferSource();
      const startSpy = vi.spyOn(source, 'start');

      audioService._audioContext.createBufferSource = vi.fn(() => source);

      audioService.play(SoundType.BELL);

      expect(startSpy).toHaveBeenCalledWith(0);
    });
  });

  describe('preview', () => {
    beforeEach(async () => {
      const soundConfigs = [
        { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
        { type: SoundType.GONG, url: '/assets/sounds/gong.mp3' },
      ];
      await audioService.initialize(soundConfigs);
    });

    it('should preview specified sound type', () => {
      const createBufferSourceSpy = vi.spyOn(
        audioService._audioContext,
        'createBufferSource'
      );

      audioService.preview(SoundType.BELL);

      expect(createBufferSourceSpy).toHaveBeenCalled();
      expect(audioService._previewSource).not.toBeNull();
    });

    it('should stop previous preview before starting new one', () => {
      audioService.preview(SoundType.BELL);
      const firstSource = audioService._previewSource;
      const stopSpy = vi.spyOn(firstSource, 'stop');

      audioService.preview(SoundType.GONG);

      expect(stopSpy).toHaveBeenCalled();
      expect(audioService._previewSource).not.toBe(firstSource);
    });

    it('should not preview if not initialized', () => {
      const uninitializedService = new AudioService();
      const createBufferSourceSpy = vi.spyOn(
        MockAudioContext.prototype,
        'createBufferSource'
      );

      uninitializedService.preview(SoundType.BELL);

      expect(createBufferSourceSpy).not.toHaveBeenCalled();
    });

    it('should not preview if sound type not found', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      audioService.preview('invalid-sound');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sound type not found')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should clear preview source when playback ends', () => {
      audioService.preview(SoundType.BELL);
      const source = audioService._previewSource;

      // onended コールバックを手動で実行
      if (source.onended) {
        source.onended();
      }

      expect(audioService._previewSource).toBeNull();
    });

    it('should handle stop errors gracefully', () => {
      audioService.preview(SoundType.BELL);
      const firstSource = audioService._previewSource;
      firstSource.stop = vi.fn(() => {
        throw new Error('Already stopped');
      });

      // エラーが発生しても新しいプレビューは開始される
      expect(() => {
        audioService.preview(SoundType.GONG);
      }).not.toThrow();
    });
  });

  describe('setVolume', () => {
    it('should update volume value', () => {
      audioService.setVolume(0.5);
      expect(audioService.getVolume()).toBe(0.5);
    });

    it('should clamp volume to 0.0 minimum', () => {
      audioService.setVolume(-0.5);
      expect(audioService.getVolume()).toBe(0.0);
    });

    it('should clamp volume to 1.0 maximum', () => {
      audioService.setVolume(1.5);
      expect(audioService.getVolume()).toBe(1.0);
    });

    it('should update gain node value if initialized', async () => {
      const soundConfigs = [
        { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
      ];
      await audioService.initialize(soundConfigs);

      audioService.setVolume(0.3);

      expect(audioService._gainNode.gain.value).toBe(0.3);
    });

    it('should not error if gain node not created yet', () => {
      expect(() => {
        audioService.setVolume(0.5);
      }).not.toThrow();
    });
  });

  describe('dispose', () => {
    it('should close AudioContext', async () => {
      const soundConfigs = [
        { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
      ];
      await audioService.initialize(soundConfigs);

      const closeSpy = vi.spyOn(audioService._audioContext, 'close');

      audioService.dispose();

      expect(closeSpy).toHaveBeenCalled();
      expect(audioService.isInitialized()).toBe(false);
    });

    it('should stop preview source before disposing', async () => {
      const soundConfigs = [
        { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
      ];
      await audioService.initialize(soundConfigs);

      audioService.preview(SoundType.BELL);
      const previewSource = audioService._previewSource;
      const stopSpy = vi.spyOn(previewSource, 'stop');

      audioService.dispose();

      expect(stopSpy).toHaveBeenCalled();
    });

    it('should clear all buffers', async () => {
      const soundConfigs = [
        { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
        { type: SoundType.GONG, url: '/assets/sounds/gong.mp3' },
      ];
      await audioService.initialize(soundConfigs);

      audioService.dispose();

      expect(audioService._audioBuffers.size).toBe(0);
    });

    it('should handle errors when stopping preview source', async () => {
      const soundConfigs = [
        { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
      ];
      await audioService.initialize(soundConfigs);

      audioService.preview(SoundType.BELL);
      audioService._previewSource.stop = vi.fn(() => {
        throw new Error('Already stopped');
      });

      expect(() => {
        audioService.dispose();
      }).not.toThrow();
    });
  });

  describe('isInitialized', () => {
    it('should return false before initialization', () => {
      expect(audioService.isInitialized()).toBe(false);
    });

    it('should return true after initialization', async () => {
      const soundConfigs = [
        { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
      ];
      await audioService.initialize(soundConfigs);

      expect(audioService.isInitialized()).toBe(true);
    });

    it('should return false after dispose', async () => {
      const soundConfigs = [
        { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
      ];
      await audioService.initialize(soundConfigs);

      audioService.dispose();

      expect(audioService.isInitialized()).toBe(false);
    });
  });
});
