# API Contracts: プレゼンテーション・タイマー

**Feature**: 001-presentation-timer
**Date**: 2025-10-16
**Status**: Draft

## Overview

このドキュメントは、プレゼンテーション・タイマーのモジュール間API契約を定義します。すべてのインターフェースはJSDocで型注釈され、実装時にコントラクトテストで検証されます。

---

## Module Architecture

```
┌─────────────────┐
│  UI Components  │  (TimerDisplay, ControlPanel, SettingsPanel)
└────────┬────────┘
         │ uses
         ↓
┌─────────────────┐
│    Services     │  (TimerService, StorageService, AudioService)
└────────┬────────┘
         │ uses
         ↓
┌─────────────────┐
│     Models      │  (TimerState, AlertConfig)
└─────────────────┘
```

---

## 1. TimerService

タイマーのビジネスロジックを管理します。

### Constructor

```javascript
/**
 * タイマーサービスを初期化
 * @param {TimerConfig} config - 初期タイマー設定
 * @param {AlertConfig} alertConfig - アラート設定
 */
constructor(config, alertConfig);
```

### Methods

#### start()

```javascript
/**
 * タイマーを開始します
 * @throws {Error} 既に実行中の場合
 * @fires TimerService#tick
 * @fires TimerService#complete
 * @fires TimerService#alert
 */
start(): void
```

**事前条件**:

- `state.status === 'idle'`

**事後条件**:

- `state.status === 'running'`
- `state.startedAt !== null`
- 100msごとに`tick`イベント発火

**イベント**:

- `tick`: 100ms毎に発火、`remainingSeconds`を通知
- `alert`: アラートポイント到達時に発火
- `complete`: 0秒到達時に発火（1回のみ）

---

#### pause()

```javascript
/**
 * タイマーを一時停止します
 * @throws {Error} 実行中でない場合
 */
pause(): void
```

**事前条件**:

- `state.status === 'running'`

**事後条件**:

- `state.status === 'paused'`
- `state.pausedAt !== null`
- `tick`イベント停止

---

#### resume()

```javascript
/**
 * 一時停止したタイマーを再開します
 * @throws {Error} 一時停止中でない場合
 */
resume(): void
```

**事前条件**:

- `state.status === 'paused'`

**事後条件**:

- `state.status === 'running'`
- `state.pausedAt === null`
- `tick`イベント再開

---

#### reset()

```javascript
/**
 * タイマーを初期状態にリセットします
 */
reset(): void
```

**事前条件**: なし

**事後条件**:

- `state.status === 'idle'`
- `state.remainingSeconds === state.initialSeconds`
- `state.startedAt === null`
- `state.pausedAt === null`
- `alertState.firedPoints.clear()`

---

#### setDuration()

```javascript
/**
 * タイマーの初期時間を設定します（idle状態のみ）
 * @param {number} minutes - 分（0-999）
 * @param {number} seconds - 秒（0-59）
 * @throws {Error} 範囲外の値または実行中の場合
 */
setDuration(minutes, seconds): void
```

**事前条件**:

- `state.status === 'idle'`
- `0 <= minutes <= 999`
- `0 <= seconds <= 59`

**事後条件**:

- `state.initialSeconds = minutes * 60 + seconds`
- `state.remainingSeconds = state.initialSeconds`

---

#### getRemainingTime()

```javascript
/**
 * 現在の残り時間を取得します
 * @returns {{ minutes: number, seconds: number, isNegative: boolean }}
 */
getRemainingTime(): { minutes: number, seconds: number, isNegative: boolean }
```

**戻り値**:

```javascript
{
  minutes: 5,        // 絶対値の分
  seconds: 30,       // 絶対値の秒
  isNegative: false  // 負の値かどうか
}
```

---

#### getState()

```javascript
/**
 * 現在のタイマー状態を取得します（読み取り専用）
 * @returns {Readonly<TimerState>}
 */
getState(): Readonly<TimerState>
```

**戻り値**: `TimerState`の読み取り専用コピー

---

### Events

`TimerService`は`EventTarget`を継承し、以下のイベントを発火します。

#### tick

```javascript
/**
 * @event TimerService#tick
 * @type {CustomEvent}
 * @property {number} detail.remainingSeconds - 現在の残り秒数
 * @property {string} detail.formattedTime - 表示用文字列（例: "5:30"）
 */
```

**発火頻度**: 100ms間隔（ただし、秒が変わったときのみ詳細更新）

---

#### alert

```javascript
/**
 * @event TimerService#alert
 * @type {CustomEvent}
 * @property {number} detail.point - 発火したアラートポイント（秒）
 */
```

**発火条件**:

- `remainingSeconds`がアラートポイントを通過
- 該当ポイントが未発火（`!firedPoints.has(point)`）
- タイマーがrunning状態

---

#### complete

```javascript
/**
 * @event TimerService#complete
 * @type {CustomEvent}
 */
```

**発火条件**: `remainingSeconds`が0に到達（マイナスに移行する瞬間）

---

### Example Usage

```javascript
const config = { minutes: 10, seconds: 0 };
const alertConfig = { points: [60, 0], enabled: true, volume: 0.8 };
const timer = new TimerService(config, alertConfig);

// イベントリスナー登録
timer.addEventListener('tick', (e) => {
  console.log('Remaining:', e.detail.formattedTime);
});

timer.addEventListener('alert', (e) => {
  console.log('Alert at:', e.detail.point, 'seconds');
});

timer.addEventListener('complete', () => {
  console.log('Timer complete!');
});

// タイマー操作
timer.start(); // 開始
setTimeout(() => {
  timer.pause(); // 5秒後に一時停止
  setTimeout(() => {
    timer.resume(); // さらに3秒後に再開
  }, 3000);
}, 5000);
```

---

## 2. StorageService

localStorageへのデータ永続化を管理します。

### Methods

#### saveTimerConfig()

```javascript
/**
 * タイマー設定を保存します
 * @param {TimerConfig} config - 保存する設定
 * @throws {Error} localStorage利用不可の場合
 */
static saveTimerConfig(config: TimerConfig): void
```

**副作用**: `localStorage['presentation-timer.config']`に書き込み

---

#### loadTimerConfig()

```javascript
/**
 * タイマー設定を読み込みます
 * @returns {TimerConfig} 保存された設定、またはデフォルト値
 */
static loadTimerConfig(): TimerConfig
```

**戻り値**: 常に有効な`TimerConfig`（エラー時はデフォルト）

**エラーハンドリング**:

- localStorage無効: デフォルト値返却
- 破損データ: デフォルト値返却、エラーログ出力
- 範囲外の値: クランプして返却

---

#### saveAlertConfig()

```javascript
/**
 * アラート設定を保存します
 * @param {AlertConfig} config - 保存する設定
 * @throws {Error} localStorage利用不可の場合
 */
static saveAlertConfig(config: AlertConfig): void
```

---

#### loadAlertConfig()

```javascript
/**
 * アラート設定を読み込みます
 * @returns {AlertConfig} 保存された設定、またはデフォルト値
 */
static loadAlertConfig(): AlertConfig
```

---

#### clear()

```javascript
/**
 * すべての保存データをクリアします
 */
static clear(): void
```

**副作用**: `presentation-timer.*`のすべてのキーを削除

---

### Storage Keys

| キー                        | 値                                                       |
| --------------------------- | -------------------------------------------------------- |
| `presentation-timer.config` | `{ minutes: number, seconds: number }`                   |
| `presentation-timer.alerts` | `{ points: number[], enabled: boolean, volume: number }` |

---

### Example Usage

```javascript
// 保存
StorageService.saveTimerConfig({ minutes: 15, seconds: 0 });
StorageService.saveAlertConfig({
  points: [180, 60, 0],
  enabled: true,
  volume: 0.8,
});

// 読み込み
const config = StorageService.loadTimerConfig();
const alerts = StorageService.loadAlertConfig();

// クリア
StorageService.clear();
```

---

## 3. AudioService

音声アラートの再生を管理します。

### Constructor

```javascript
/**
 * オーディオサービスを初期化
 * @param {string} soundUrl - 音声ファイルのURL
 */
constructor(soundUrl: string)
```

---

### Methods

#### initialize()

```javascript
/**
 * Web Audio APIを初期化します（ユーザーインタラクション後に呼び出し）
 * @returns {Promise<void>}
 * @throws {Error} AudioContext作成失敗時
 */
async initialize(): Promise<void>
```

**事前条件**: ユーザーインタラクション（クリック等）後に呼び出し

**事後条件**:

- `AudioContext`が作成され、アクティブ状態
- 音声ファイルがデコードされ、バッファに保存

---

#### play()

```javascript
/**
 * アラート音を再生します
 * @param {number} volume - 音量（0.0～1.0）
 * @returns {Promise<void>}
 * @throws {Error} 初期化前に呼び出された場合
 */
async play(volume: number = 0.8): Promise<void>
```

**事前条件**: `initialize()`が完了している

**副作用**: 音声を1回再生

---

#### setVolume()

```javascript
/**
 * デフォルト音量を設定します
 * @param {number} volume - 音量（0.0～1.0）
 * @throws {RangeError} 範囲外の値の場合
 */
setVolume(volume: number): void
```

---

### Example Usage

```javascript
const audioService = new AudioService('/assets/sounds/alert.mp3');

// ユーザーがボタンをクリックした後に初期化
document.getElementById('start-btn').addEventListener('click', async () => {
  await audioService.initialize();
  // これでアラート音が再生可能
});

// アラート再生
timer.addEventListener('alert', async () => {
  await audioService.play(0.8);
});

// 音量変更
audioService.setVolume(1.0);
```

---

## 4. TimerDisplay (UI Component)

タイマーの表示を管理します。

### Constructor

```javascript
/**
 * タイマー表示コンポーネントを初期化
 * @param {HTMLElement} containerElement - 表示先のコンテナ
 * @param {TimerService} timerService - タイマーサービス
 */
constructor(containerElement: HTMLElement, timerService: TimerService)
```

---

### Methods

#### render()

```javascript
/**
 * 現在の状態を画面に描画します
 */
render(): void
```

**副作用**: DOM更新

---

#### update()

```javascript
/**
 * タイマーの値を更新します（tick イベントで呼び出し）
 * @param {string} formattedTime - 表示用時間文字列
 * @param {boolean} isNegative - マイナス時間かどうか
 */
update(formattedTime: string, isNegative: boolean): void
```

**副作用**:

- テキスト内容更新
- `isNegative === true`の場合、赤色クラス追加

---

### Example Usage

```javascript
const container = document.getElementById('timer-display');
const display = new TimerDisplay(container, timerService);

// 初期描画
display.render();

// 自動更新（TimerService の tick イベントで駆動）
timerService.addEventListener('tick', (e) => {
  const { formattedTime, isNegative } = e.detail;
  display.update(formattedTime, isNegative);
});
```

---

## 5. ControlPanel (UI Component)

タイマー操作ボタンを管理します。

### Constructor

```javascript
/**
 * コントロールパネルを初期化
 * @param {HTMLElement} containerElement - ボタン配置先
 * @param {TimerService} timerService - タイマーサービス
 */
constructor(containerElement: HTMLElement, timerService: TimerService)
```

---

### Methods

#### render()

```javascript
/**
 * ボタンを描画します
 */
render(): void
```

**生成ボタン**:

- Start/Pause（状態に応じて切り替え）
- Reset

---

#### updateButtonStates()

```javascript
/**
 * タイマー状態に応じてボタンの有効/無効を切り替えます
 * @param {'idle' | 'running' | 'paused'} status - 現在の状態
 */
updateButtonStates(status: 'idle' | 'running' | 'paused'): void
```

**状態別ボタン**:

| 状態    | Start/Pauseボタン | Resetボタン |
| ------- | ----------------- | ----------- |
| idle    | "Start" (有効)    | 無効        |
| running | "Pause" (有効)    | 有効        |
| paused  | "Resume" (有効)   | 有効        |

---

## 6. SettingsPanel (UI Component)

タイマー設定とアラート設定を管理します。

### Constructor

```javascript
/**
 * 設定パネルを初期化
 * @param {HTMLElement} containerElement - 設定UI配置先
 * @param {TimerService} timerService - タイマーサービス
 * @param {StorageService} storageService - ストレージサービス
 */
constructor(
  containerElement: HTMLElement,
  timerService: TimerService,
  storageService: typeof StorageService
)
```

---

### Methods

#### render()

```javascript
/**
 * 設定UIを描画します
 */
render(): void
```

**生成UI**:

- 時間設定（分・秒入力フィールド）
- アラートポイント設定（リスト + 追加/削除ボタン）
- アラート有効/無効トグル
- 音量スライダー

---

#### saveSettings()

```javascript
/**
 * 現在の設定をlocalStorageに保存します
 */
saveSettings(): void
```

---

## Contract Tests

各モジュールのコントラクトは以下のテストで検証します。

### TimerService Contract Test

```javascript
describe('TimerService Contract', () => {
  test('start() throws if already running', () => {
    const service = new TimerService(config, alertConfig);
    service.start();
    expect(() => service.start()).toThrow();
  });

  test('pause() changes status from running to paused', () => {
    const service = new TimerService(config, alertConfig);
    service.start();
    service.pause();
    expect(service.getState().status).toBe('paused');
  });

  test('tick event fires every 100ms', (done) => {
    const service = new TimerService(config, alertConfig);
    let tickCount = 0;
    service.addEventListener('tick', () => {
      tickCount++;
      if (tickCount === 3) {
        expect(tickCount).toBe(3);
        done();
      }
    });
    service.start();
  });
});
```

---

## Summary

このAPI契約は、以下の原則に基づいて設計されています:

1. **明確な責任分離**: Model-View-Service構造
2. **型安全**: JSDocによる完全な型注釈
3. **エラーハンドリング**: 事前条件と例外の明示
4. **テスト可能性**: コントラクトテストで検証
5. **イベント駆動**: 疎結合なコンポーネント連携

次のフェーズ（実装）で、このコントラクトに準拠したコードをTDDで作成します。
