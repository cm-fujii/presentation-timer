# Quickstart Guide: アラート音選択機能

**Feature**: 002-alert-sound-selection
**Date**: 2025-10-16
**Audience**: 開発者

## 概要

このガイドでは、アラート音選択機能の実装方法と使用方法を説明します。この機能により、各アラートポイント（例:残り1分、0秒）に対して個別のアラート音（「ベル」または「銅鑼」）を選択できます。

## 前提条件

- Node.js 18以上
- npm または pnpm
- モダンブラウザ（Chrome, Firefox, Safari, Edge）

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                       │
│                  (SettingsPanel.js)                     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [60秒] [▼ Bell] [🔊] [Remove]                  │   │
│  │ [ 0秒] [▼ Gong] [🔊] [Remove]                  │   │
│  │ [+ Add Alert Point]                             │   │
│  └─────────────────────────────────────────────────┘   │
└─────────┬───────────────────────────────┬───────────────┘
          │                               │
          │ updateAlertPointSound()       │ preview()
          │                               │
          ▼                               ▼
┌──────────────────────┐         ┌────────────────────────┐
│   AlertConfig.js     │         │   AudioService.js      │
│──────────────────────│         │────────────────────────│
│ - points: [{         │◄────────│ + initialize(configs)  │
│     seconds: 60,     │         │ + play(soundType)      │
│     soundType: 'bell'│         │ + preview(soundType)   │
│   }]                 │         │ - _audioBuffers: Map   │
│ - enabled            │         │                        │
│ - volume             │         │ Map<SoundType,         │
└──────────┬───────────┘         │     AudioBuffer>       │
           │                     └────────────────────────┘
           │ save/load                   △
           ▼                             │ load sound files
┌──────────────────────┐                 │
│  StorageService.js   │                 │
│──────────────────────│         ┌───────┴────────────────┐
│ + saveAlertConfig()  │         │  assets/sounds/        │
│ + loadAlertConfig()  │         │──────────────────────  │
│ + migrateConfig()    │         │ - bell.mp3             │
└──────────────────────┘         │ - gong.mp3             │
           │                     └────────────────────────┘
           ▼
┌──────────────────────┐
│    localStorage      │
│──────────────────────│
│ alertConfig: JSON    │
└──────────────────────┘
```

## クイックスタート

### 1. 依存関係のインストール

```bash
cd /path/to/presentation-timer
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

### 3. 新機能の確認

1. 「Settings」パネルを開く
2. 「Alert Settings」セクションで各アラートポイントの音を選択
3. 🔊 ボタンで音をプレビュー
4. 「Save Settings」で設定を保存
5. タイマーを開始して、設定したタイミングで音が鳴ることを確認

## 実装ガイド

### Step 1: SoundType enumの定義

`js/models/SoundType.js` を新規作成:

```javascript
/**
 * @file SoundType.js
 * @description アラート音の種類を表すEnum
 */

export const SoundType = Object.freeze({
  BELL: 'bell',
  GONG: 'gong',
});

export function isValidSoundType(soundType) {
  return Object.values(SoundType).includes(soundType);
}
```

### Step 2: AlertConfig.jsの拡張

既存の`js/models/AlertConfig.js`を拡張し、`AlertPoint`型を導入:

```javascript
import { SoundType } from './SoundType.js';

/**
 * @typedef {Object} AlertPoint
 * @property {number} seconds
 * @property {string} soundType
 */

/**
 * @typedef {Object} AlertConfig
 * @property {boolean} enabled
 * @property {number} volume
 * @property {AlertPoint[]} points  // 変更: number[] → AlertPoint[]
 */

export function createDefaultAlertConfig() {
  return {
    enabled: true,
    volume: 0.8,
    points: [
      { seconds: 60, soundType: SoundType.GONG },
      { seconds: 0, soundType: SoundType.GONG },
    ],
  };
}

export function updateAlertPointSound(config, seconds, newSoundType) {
  return {
    ...config,
    points: config.points.map(point =>
      point.seconds === seconds
        ? { ...point, soundType: newSoundType }
        : point
    ),
  };
}

// その他の関数: addAlertPoint, removeAlertPoint, isValidAlertConfig, etc.
```

### Step 3: AudioService.jsの拡張

既存の`js/services/AudioService.js`を拡張し、複数音声ファイルに対応:

```javascript
export class AudioService {
  constructor() {
    this._audioContext = null;
    this._audioBuffers = new Map(); // 変更: 単一バッファ → Map
    this._gainNode = null;
    this._volume = 0.8;
    this._initialized = false;
    this._previewSource = null; // 追加: プレビュー用
  }

  async initialize(soundConfigs) {
    // soundConfigs = [
    //   { type: 'bell', url: '/assets/sounds/bell.mp3' },
    //   { type: 'gong', url: '/assets/sounds/gong.mp3' }
    // ]

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this._audioContext = new AudioContextClass();
    this._gainNode = this._audioContext.createGain();
    this._gainNode.connect(this._audioContext.destination);
    this._gainNode.gain.value = this._volume;

    for (const config of soundConfigs) {
      try {
        const buffer = await this._loadAndDecodeAudio(config.url);
        this._audioBuffers.set(config.type, buffer);
      } catch (error) {
        console.error(`Failed to load sound: ${config.type}`, error);
        // フォールバック: 銅鑼の音を使用
        const fallback = this._audioBuffers.get(SoundType.GONG);
        if (fallback) {
          this._audioBuffers.set(config.type, fallback);
        }
      }
    }

    this._initialized = true;
  }

  play(soundType) {
    const buffer = this._audioBuffers.get(soundType);
    if (!buffer || !this._audioContext) return;

    if (this._audioContext.state === 'suspended') {
      this._audioContext.resume();
    }

    const source = this._audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this._gainNode);
    source.start(0);
  }

  preview(soundType) {
    // 再生中のプレビューがあれば停止
    if (this._previewSource) {
      this._previewSource.stop();
      this._previewSource = null;
    }

    const buffer = this._audioBuffers.get(soundType);
    if (!buffer || !this._audioContext) return;

    const source = this._audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this._gainNode);

    source.onended = () => {
      this._previewSource = null;
    };

    this._previewSource = source;
    source.start(0);
  }
}
```

### Step 4: StorageService.jsの拡張

既存の`js/services/StorageService.js`にマイグレーション機能を追加:

```javascript
import { SoundType } from '../models/SoundType.js';
import { createDefaultAlertConfig } from '../models/AlertConfig.js';

export class StorageService {
  static loadAlertConfig() {
    const saved = localStorage.getItem('alertConfig');
    if (!saved) {
      return createDefaultAlertConfig();
    }

    try {
      const config = JSON.parse(saved);
      return migrateAlertConfig(config); // マイグレーション
    } catch (error) {
      console.error('Failed to parse alertConfig:', error);
      return createDefaultAlertConfig();
    }
  }

  static saveAlertConfig(config) {
    localStorage.setItem('alertConfig', JSON.stringify(config));
  }
}

function migrateAlertConfig(config) {
  if (!config || !Array.isArray(config.points)) {
    return createDefaultAlertConfig();
  }

  // 旧形式を検出: points が number[] の場合
  if (config.points.length > 0 && typeof config.points[0] === 'number') {
    return {
      ...config,
      points: config.points.map(seconds => ({
        seconds,
        soundType: SoundType.GONG, // デフォルトは銅鑼
      })),
    };
  }

  return config;
}
```

### Step 5: SettingsPanel.jsのUI拡張

既存の`js/ui/SettingsPanel.js`のアラートポイント行に音選択セレクトボックスを追加:

```javascript
_addAlertPoint(seconds = 60, soundType = SoundType.GONG) {
  const pointItem = document.createElement('div');
  pointItem.className = 'alert-point-item';

  // 秒数入力
  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'form-group__input alert-point-item__input';
  input.value = String(seconds);

  // 音選択セレクトボックス
  const soundSelect = document.createElement('select');
  soundSelect.className = 'form-group__select alert-point-item__sound-select';
  soundSelect.setAttribute('aria-label', 'Select alert sound');

  const bellOption = document.createElement('option');
  bellOption.value = SoundType.BELL;
  bellOption.textContent = 'Bell (ベル)';

  const gongOption = document.createElement('option');
  gongOption.value = SoundType.GONG;
  gongOption.textContent = 'Gong (銅鑼)';

  soundSelect.appendChild(bellOption);
  soundSelect.appendChild(gongOption);
  soundSelect.value = soundType;

  // プレビューボタン
  const previewButton = document.createElement('button');
  previewButton.type = 'button';
  previewButton.className = 'btn btn--icon';
  previewButton.textContent = '🔊';
  previewButton.setAttribute('aria-label', 'Preview sound');
  previewButton.addEventListener('click', () => {
    this._audioService.preview(soundSelect.value);
  });

  // 削除ボタン
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'btn btn--danger btn--small';
  removeButton.textContent = 'Remove';
  removeButton.addEventListener('click', () => {
    this._alertPointsContainer?.removeChild(pointItem);
  });

  pointItem.appendChild(input);
  pointItem.appendChild(soundSelect);
  pointItem.appendChild(previewButton);
  pointItem.appendChild(removeButton);
  this._alertPointsContainer.appendChild(pointItem);
}
```

### Step 6: app.jsでの初期化

`js/app.js`でAudioServiceを複数音声対応で初期化:

```javascript
import { SoundType } from './models/SoundType.js';
import { AudioService } from './services/AudioService.js';

const audioService = new AudioService();

document.addEventListener('click', async () => {
  if (!audioService.isInitialized()) {
    await audioService.initialize([
      { type: SoundType.BELL, url: '/assets/sounds/bell.mp3' },
      { type: SoundType.GONG, url: '/assets/sounds/gong.mp3' },
    ]);
  }
}, { once: true });
```

## テスト

### Unit Test

```bash
npm run test
```

```javascript
// tests/unit/AudioService.test.js
import { describe, it, expect, vi } from 'vitest';
import { AudioService } from '../../js/services/AudioService.js';
import { SoundType } from '../../js/models/SoundType.js';

describe('AudioService - Multiple Sounds', () => {
  it('should load and store multiple sound buffers', async () => {
    const service = new AudioService();
    await service.initialize([
      { type: SoundType.BELL, url: '/mock/bell.mp3' },
      { type: SoundType.GONG, url: '/mock/gong.mp3' },
    ]);

    expect(service.isInitialized()).toBe(true);
    // bufferが2つ読み込まれていることを確認
  });

  it('should preview specific sound type', () => {
    const service = new AudioService();
    // ... 初期化

    const playSpy = vi.spyOn(service, 'preview');
    service.preview(SoundType.BELL);

    expect(playSpy).toHaveBeenCalledWith(SoundType.BELL);
  });
});
```

### E2E Test

```bash
npm run test:e2e
```

```javascript
// tests/e2e/soundSelection.spec.js
import { test, expect } from '@playwright/test';

test('User can select different sounds for alert points', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Settings パネルを開く
  await page.click('text=Settings');

  // 1分前のアラートポイントの音をベルに変更
  await page.selectOption('.alert-point-item:nth-child(1) select', 'bell');

  // プレビューボタンをクリック
  await page.click('.alert-point-item:nth-child(1) [aria-label="Preview sound"]');

  // 設定を保存
  await page.click('text=Save Settings');

  // タイマーを開始（省略）
  // 1分後にベルの音が鳴ることを確認（E2Eでの音確認は困難なため、設定保存を確認）
});
```

## トラブルシューティング

### 問題: 音が再生されない

**原因**: AudioContextが初期化されていない、またはブラウザの自動再生ポリシー

**解決方法**:
1. ユーザーインタラクション後にAudioServiceを初期化していることを確認
2. ブラウザのコンソールでエラーを確認
3. `audioService.isInitialized()`がtrueであることを確認

### 問題: 設定が保存されない

**原因**: localStorageが無効、またはバリデーションエラー

**解決方法**:
1. ブラウザのlocalStorageが有効か確認
2. `isValidAlertConfig(config)`でバリデーション実行
3. コンソールでStorageServiceのエラーログを確認

### 問題: 旧データが移行されない

**原因**: migrateAlertConfig関数が呼ばれていない

**解決方法**:
1. StorageService.loadAlertConfig()内でmigrateAlertConfig()を呼んでいるか確認
2. localStorageのalertConfigを手動削除して再度テスト

## 次のステップ

- `/speckit.tasks`を実行してタスク一覧を生成
- 各タスクをTDD（テストファースト）で実装
- PR作成前に`npm run check-all`でリント・テスト・型チェックを実行

## リファレンス

- [data-model.md](./data-model.md) - データモデル詳細
- [research.md](./research.md) - 技術選定の根拠
- [plan.md](./plan.md) - 実装計画全体
- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [localStorage - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
