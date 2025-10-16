/**
 * @file TimerFlow.test.js
 * @description タイマーの統合テスト - TimerServiceとTimerDisplayの連携
 */

import { describe, it, expect } from 'vitest';
import { StorageService } from '../../js/services/StorageService.js';
import { SoundType } from '../../js/models/SoundType.js';

describe('TimerFlow Integration Tests', () => {
  describe('TimerDisplay - UI Update Logic', () => {
    it.todo('should update display when tick event fires', () => {
      // TODO: Implement TimerService and TimerDisplay
      // const service = new TimerService();
      // const display = new TimerDisplay(document.body);
      // display.render();
      //
      // service.on('tick', (state) => {
      //   display.update(state);
      // });
      //
      // service.setDuration(10);
      // service.start();
      // await new Promise(resolve => setTimeout(resolve, 1500));
      //
      // const timeElement = document.querySelector('.timer-display__time');
      // expect(timeElement.textContent).toMatch(/0[0-8]:[0-5][0-9]/);
    });

    it.todo('should display initial time correctly', () => {
      // TODO: Implement TimerDisplay
      // const display = new TimerDisplay(document.body);
      // const state = {
      //   status: 'idle',
      //   remainingSeconds: 300,
      //   durationSeconds: 300,
      //   startedAt: null,
      //   elapsedSeconds: 0
      // };
      // display.render();
      // display.update(state);
      //
      // const timeElement = document.querySelector('.timer-display__time');
      // expect(timeElement.textContent).toBe('05:00');
    });

    it.todo('should format time correctly (MM:SS)', () => {
      // TODO: Implement TimerDisplay
      // const display = new TimerDisplay(document.body);
      // const testCases = [
      //   { seconds: 300, expected: '05:00' },
      //   { seconds: 125, expected: '02:05' },
      //   { seconds: 60, expected: '01:00' },
      //   { seconds: 59, expected: '00:59' },
      //   { seconds: 0, expected: '00:00' },
      // ];
      //
      // display.render();
      // testCases.forEach(({ seconds, expected }) => {
      //   const state = { status: 'running', remainingSeconds: seconds, durationSeconds: 300, startedAt: Date.now(), elapsedSeconds: 0 };
      //   display.update(state);
      //   const timeElement = document.querySelector('.timer-display__time');
      //   expect(timeElement.textContent).toBe(expected);
      // });
    });

    it.todo('should apply negative class when time is negative', () => {
      // TODO: Implement TimerDisplay with negative time support
      // const display = new TimerDisplay(document.body);
      // display.render();
      //
      // const negativeState = {
      //   status: 'running',
      //   remainingSeconds: -30,
      //   durationSeconds: 300,
      //   startedAt: Date.now(),
      //   elapsedSeconds: 330
      // };
      // display.update(negativeState);
      //
      // const timeElement = document.querySelector('.timer-display__time');
      // expect(timeElement.classList.contains('timer-display__time--negative')).toBe(true);
    });

    it.todo('should remove negative class when reset to positive time', () => {
      // TODO: Implement TimerDisplay
      // const display = new TimerDisplay(document.body);
      // display.render();
      //
      // // マイナス時間に設定
      // const negativeState = { status: 'running', remainingSeconds: -10, durationSeconds: 300, startedAt: Date.now(), elapsedSeconds: 310 };
      // display.update(negativeState);
      //
      // // プラス時間にリセット
      // const positiveState = { status: 'idle', remainingSeconds: 300, durationSeconds: 300, startedAt: null, elapsedSeconds: 0 };
      // display.update(positiveState);
      //
      // const timeElement = document.querySelector('.timer-display__time');
      // expect(timeElement.classList.contains('timer-display__time--negative')).toBe(false);
    });

    it.todo('should update status label based on timer state', () => {
      // TODO: Implement TimerDisplay with status display
      // const display = new TimerDisplay(document.body);
      // display.render();
      //
      // const states = [
      //   { status: 'idle', expected: 'Ready' },
      //   { status: 'running', expected: 'Running' },
      //   { status: 'paused', expected: 'Paused' },
      // ];
      //
      // states.forEach(({ status, expected }) => {
      //   const state = { status, remainingSeconds: 300, durationSeconds: 300, startedAt: null, elapsedSeconds: 0 };
      //   display.update(state);
      //   const statusElement = document.querySelector('.timer-display__status');
      //   expect(statusElement.textContent).toBe(expected);
      // });
    });
  });

  describe('ControlPanel - Button State Management', () => {
    it.todo('should enable Start button when idle', () => {
      // TODO: Implement ControlPanel
      // const panel = new ControlPanel(document.body);
      // panel.render();
      //
      // const state = { status: 'idle', remainingSeconds: 300, durationSeconds: 300, startedAt: null, elapsedSeconds: 0 };
      // panel.updateButtonStates(state);
      //
      // const startButton = document.querySelector('[data-action="start"]');
      // expect(startButton.disabled).toBe(false);
    });

    it.todo('should disable Start button when running', () => {
      // TODO: Implement ControlPanel
      // const panel = new ControlPanel(document.body);
      // panel.render();
      //
      // const state = { status: 'running', remainingSeconds: 300, durationSeconds: 300, startedAt: Date.now(), elapsedSeconds: 0 };
      // panel.updateButtonStates(state);
      //
      // const startButton = document.querySelector('[data-action="start"]');
      // expect(startButton.disabled).toBe(true);
    });

    it.todo('should show Pause button when running', () => {
      // TODO: Implement ControlPanel with dynamic button display
      // const panel = new ControlPanel(document.body);
      // panel.render();
      //
      // const state = { status: 'running', remainingSeconds: 300, durationSeconds: 300, startedAt: Date.now(), elapsedSeconds: 0 };
      // panel.updateButtonStates(state);
      //
      // const pauseButton = document.querySelector('[data-action="pause"]');
      // const resumeButton = document.querySelector('[data-action="resume"]');
      // expect(pauseButton.style.display).not.toBe('none');
      // expect(resumeButton.style.display).toBe('none');
    });

    it.todo('should show Resume button when paused', () => {
      // TODO: Implement ControlPanel with dynamic button display
      // const panel = new ControlPanel(document.body);
      // panel.render();
      //
      // const state = { status: 'paused', remainingSeconds: 250, durationSeconds: 300, startedAt: null, elapsedSeconds: 50 };
      // panel.updateButtonStates(state);
      //
      // const pauseButton = document.querySelector('[data-action="pause"]');
      // const resumeButton = document.querySelector('[data-action="resume"]');
      // expect(pauseButton.style.display).toBe('none');
      // expect(resumeButton.style.display).not.toBe('none');
    });

    it.todo('should enable Reset button when not idle', () => {
      // TODO: Implement ControlPanel
      // const panel = new ControlPanel(document.body);
      // panel.render();
      //
      // const runningState = { status: 'running', remainingSeconds: 300, durationSeconds: 300, startedAt: Date.now(), elapsedSeconds: 0 };
      // panel.updateButtonStates(runningState);
      //
      // const resetButton = document.querySelector('[data-action="reset"]');
      // expect(resetButton.disabled).toBe(false);
    });
  });

  describe('SettingsPanel - Configuration Management', () => {
    it.todo('should save timer configuration to localStorage', () => {
      // TODO: Implement SettingsPanel
      // const panel = new SettingsPanel(document.body);
      // panel.render();
      //
      // const minutesInput = document.querySelector('[name="minutes"]');
      // const secondsInput = document.querySelector('[name="seconds"]');
      // minutesInput.value = '10';
      // secondsInput.value = '30';
      //
      // const saveButton = document.querySelector('[data-action="save-settings"]');
      // saveButton.click();
      //
      // const savedConfig = StorageService.loadTimerConfig();
      // expect(savedConfig.durationMinutes).toBe(10);
      // expect(savedConfig.durationSeconds).toBe(30);
    });

    it.todo('should load timer configuration from localStorage', () => {
      // TODO: Implement SettingsPanel
      // StorageService.saveTimerConfig({ durationMinutes: 15, durationSeconds: 45 });
      //
      // const panel = new SettingsPanel(document.body);
      // panel.render();
      //
      // const minutesInput = document.querySelector('[name="minutes"]');
      // const secondsInput = document.querySelector('[name="seconds"]');
      // expect(minutesInput.value).toBe('15');
      // expect(secondsInput.value).toBe('45');
    });

    it.todo('should validate input values', () => {
      // TODO: Implement SettingsPanel with validation
      // const panel = new SettingsPanel(document.body);
      // panel.render();
      //
      // const minutesInput = document.querySelector('[name="minutes"]');
      // const secondsInput = document.querySelector('[name="seconds"]');
      //
      // // 無効な値を入力
      // minutesInput.value = '-1';
      // secondsInput.value = '70';
      //
      // const saveButton = document.querySelector('[data-action="save-settings"]');
      // saveButton.click();
      //
      // // バリデーションエラーが表示されることを確認
      // const errorElement = document.querySelector('.form-error');
      // expect(errorElement).not.toBeNull();
    });

    it.todo('should disable settings inputs when timer is running', () => {
      // TODO: Implement SettingsPanel
      // const panel = new SettingsPanel(document.body);
      // panel.render();
      //
      // const state = { status: 'running', remainingSeconds: 300, durationSeconds: 300, startedAt: Date.now(), elapsedSeconds: 0 };
      // panel.updateInputStates(state);
      //
      // const minutesInput = document.querySelector('[name="minutes"]');
      // const secondsInput = document.querySelector('[name="seconds"]');
      // expect(minutesInput.disabled).toBe(true);
      // expect(secondsInput.disabled).toBe(true);
    });
  });

  describe('Sound Selection and Playback Flow', () => {
    it.todo('should play correct sound type at each alert point', () => {
      // TODO: Implement AudioService and AlertConfig integration
      // const audioService = new AudioService();
      // const timerService = new TimerService();
      //
      // await audioService.initialize([
      //   { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
      //   { type: SoundType.GONG, url: '/assets/sounds/gong.mp3' }
      // ]);
      //
      // const alertConfig = {
      //   enabled: true,
      //   volume: 0.8,
      //   points: [
      //     { seconds: 60, soundType: SoundType.BELL },
      //     { seconds: 0, soundType: SoundType.GONG }
      //   ]
      // };
      //
      // let bellPlayed = false;
      // let gongPlayed = false;
      //
      // audioService.play = vi.fn((soundType) => {
      //   if (soundType === SoundType.BELL) bellPlayed = true;
      //   if (soundType === SoundType.GONG) gongPlayed = true;
      // });
      //
      // timerService.setAlertConfig(alertConfig);
      // timerService.setDuration(120); // 2分
      // timerService.start();
      //
      // // 60秒経過を待つ
      // await new Promise(resolve => setTimeout(resolve, 61000));
      //
      // expect(bellPlayed).toBe(true);
      // expect(gongPlayed).toBe(false);
      //
      // // さらに60秒経過を待つ（合計120秒）
      // await new Promise(resolve => setTimeout(resolve, 61000));
      //
      // expect(gongPlayed).toBe(true);
    });

    it.todo('should update sound type when alert point is modified', () => {
      // TODO: Implement sound type update flow
      // const config = createDefaultAlertConfig();
      // // デフォルト: [{ 60, 'gong' }, { 0, 'gong' }]
      //
      // const updated = updateAlertPointSound(config, 60, SoundType.BELL);
      //
      // expect(updated.points).toContainEqual({
      //   seconds: 60,
      //   soundType: SoundType.BELL
      // });
      //
      // StorageService.saveAlertConfig(updated);
      // const loaded = StorageService.loadAlertConfig();
      //
      // expect(loaded.points).toContainEqual({
      //   seconds: 60,
      //   soundType: SoundType.BELL
      // });
    });

    it.todo('should preview sound before selecting', () => {
      // TODO: Implement preview functionality
      // const audioService = new AudioService();
      //
      // await audioService.initialize([
      //   { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
      //   { type: SoundType.GONG, url: '/assets/sounds/gong.mp3' }
      // ]);
      //
      // let previewedSound = null;
      // audioService.preview = vi.fn((soundType) => {
      //   previewedSound = soundType;
      // });
      //
      // // ユーザーがベルをプレビュー
      // audioService.preview(SoundType.BELL);
      // expect(previewedSound).toBe(SoundType.BELL);
      //
      // // ユーザーが銅鑼をプレビュー（前のプレビューは停止される）
      // audioService.preview(SoundType.GONG);
      // expect(previewedSound).toBe(SoundType.GONG);
    });

    it('should migrate old alert config to new format', () => {
      // 旧形式のデータをlocalStorageに保存
      const oldConfig = {
        enabled: true,
        volume: 0.8,
        points: [60, 0], // 旧形式: number[]
      };

      localStorage.setItem('presentation-timer:alert', JSON.stringify(oldConfig));

      // 読み込み時に自動マイグレーション
      const loaded = StorageService.loadAlertConfig();

      expect(loaded.points).toHaveLength(2);
      expect(loaded.points[0]).toEqual({
        seconds: 60,
        soundType: SoundType.GONG, // デフォルトは銅鑼
      });
      expect(loaded.points[1]).toEqual({
        seconds: 0,
        soundType: SoundType.GONG,
      });
    });

    it.todo('should handle multiple alert points with different sounds', () => {
      // TODO: Implement multi-point alert flow
      // const config = {
      //   enabled: true,
      //   volume: 0.8,
      //   points: [
      //     { seconds: 180, soundType: SoundType.GONG },
      //     { seconds: 60, soundType: SoundType.BELL },
      //     { seconds: 30, soundType: SoundType.BELL },
      //     { seconds: 0, soundType: SoundType.GONG }
      //   ]
      // };
      //
      // const audioService = new AudioService();
      // await audioService.initialize([
      //   { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
      //   { type: SoundType.GONG, url: '/assets/sounds/gong.mp3' }
      // ]);
      //
      // const playedSounds = [];
      // audioService.play = vi.fn((soundType) => {
      //   playedSounds.push(soundType);
      // });
      //
      // const timerService = new TimerService();
      // timerService.setAlertConfig(config);
      // timerService.setDuration(180); // 3分
      // timerService.start();
      //
      // // 各アラートポイントで正しい音が再生されることを確認
      // // (実際のテストでは時間経過をモックする)
      // expect(playedSounds).toEqual([
      //   SoundType.GONG, // 3分時点
      //   SoundType.BELL, // 1分時点
      //   SoundType.BELL, // 30秒時点
      //   SoundType.GONG  // 0秒時点
      // ]);
    });
  });

  describe('Full Timer Flow', () => {
    it.todo('should complete full timer lifecycle', () => {
      // TODO: Implement full integration
      // const service = new TimerService();
      // const display = new TimerDisplay(document.body);
      // const control = new ControlPanel(document.body);
      //
      // display.render();
      // control.render();
      //
      // service.on('tick', (state) => {
      //   display.update(state);
      //   control.updateButtonStates(state);
      // });
      //
      // // 設定
      // service.setDuration(5);
      //
      // // 開始
      // service.start();
      // await new Promise(resolve => setTimeout(resolve, 2000));
      //
      // // 一時停止
      // service.pause();
      // const pausedRemaining = service.getRemainingTime();
      //
      // // 再開
      // service.resume();
      // await new Promise(resolve => setTimeout(resolve, 2000));
      //
      // // リセット
      // service.reset();
      // const resetRemaining = service.getRemainingTime();
      //
      // expect(pausedRemaining).toBeLessThan(5);
      // expect(pausedRemaining).toBeGreaterThan(3);
      // expect(resetRemaining).toBe(5);
    });
  });
});
