# Data Model: プレゼンテーション・タイマー

**Feature**: 001-presentation-timer
**Date**: 2025-10-16
**Status**: Draft

## Overview

このドキュメントは、プレゼンテーション・タイマーのデータモデルを定義します。すべてのデータはクライアントサイドで管理され、localStorageに永続化されます。

---

## Core Entities

### 1. TimerState（タイマー状態）

タイマーの現在の実行状態とカウントダウン情報を保持します。

#### Properties

| フィールド         | 型                                | 説明                              | デフォルト値 | 制約             |
| ------------------ | --------------------------------- | --------------------------------- | ------------ | ---------------- |
| `status`           | `'idle' \| 'running' \| 'paused'` | タイマーの動作状態                | `'idle'`     | 必須             |
| `initialSeconds`   | `number`                          | 設定された初期秒数                | `600` (10分) | >= 0             |
| `remainingSeconds` | `number`                          | 残り秒数（負の値も許容）          | `600`        | 整数             |
| `startedAt`        | `number \| null`                  | 開始時刻（Unix timestamp ms）     | `null`       | >= 0 または null |
| `pausedAt`         | `number \| null`                  | 一時停止時刻（Unix timestamp ms） | `null`       | >= 0 または null |

#### State Transitions

```
idle → running: タイマー開始
  - startedAt = Date.now()
  - remainingSeconds = initialSeconds

running → paused: 一時停止
  - pausedAt = Date.now()
  - remainingSeconds を現在値で固定

paused → running: 再開
  - startedAt = Date.now() - (initialSeconds - remainingSeconds) * 1000
  - pausedAt = null

running/paused → idle: リセット
  - remainingSeconds = initialSeconds
  - startedAt = null
  - pausedAt = null
```

#### Validation Rules

- `remainingSeconds`は実数だが、表示時は整数に丸める
- `status === 'running'` の場合、`startedAt !== null`
- `status === 'paused'` の場合、`pausedAt !== null`
- `status === 'idle'` の場合、`startedAt === null && pausedAt === null`

#### Example

```javascript
// 初期状態
{
  status: 'idle',
  initialSeconds: 600,      // 10分
  remainingSeconds: 600,
  startedAt: null,
  pausedAt: null
}

// 実行中（5分30秒経過）
{
  status: 'running',
  initialSeconds: 600,
  remainingSeconds: 330,    // 5:30残り
  startedAt: 1697452800000,
  pausedAt: null
}

// 一時停止中
{
  status: 'paused',
  initialSeconds: 600,
  remainingSeconds: 330,
  startedAt: 1697452800000,
  pausedAt: 1697453130000,
}

// マイナス時間（超過）
{
  status: 'running',
  initialSeconds: 600,
  remainingSeconds: -45,    // -0:45（45秒超過）
  startedAt: 1697452800000,
  pausedAt: null
}
```

---

### 2. TimerConfig（タイマー設定）

ユーザーが設定する初期時間の情報です。

#### Properties

| フィールド | 型       | 説明           | デフォルト値 | 制約          |
| ---------- | -------- | -------------- | ------------ | ------------- |
| `minutes`  | `number` | 初期時間（分） | `10`         | 0 <= n <= 999 |
| `seconds`  | `number` | 初期時間（秒） | `0`          | 0 <= n <= 59  |

#### Derived Values

- `totalSeconds = minutes * 60 + seconds`

#### Validation Rules

- `minutes`は0以上999以下の整数
- `seconds`は0以上59以下の整数
- `minutes === 0 && seconds === 0` の場合、即座にマイナス表示開始

#### Example

```javascript
// 10分00秒
{
  minutes: 10,
  seconds: 0
}

// 1分30秒
{
  minutes: 1,
  seconds: 30
}

// 最小値（0秒）
{
  minutes: 0,
  seconds: 0
}

// 最大値（999分59秒 = 16時間39分59秒）
{
  minutes: 999,
  seconds: 59
}
```

---

### 3. AlertConfig（アラート設定）

音声通知のタイミングを管理します。

#### Properties

| フィールド | 型         | 説明                         | デフォルト値 | 制約                 |
| ---------- | ---------- | ---------------------------- | ------------ | -------------------- |
| `points`   | `number[]` | アラートを鳴らす秒数のリスト | `[60, 0]`    | 重複なし、降順ソート |
| `enabled`  | `boolean`  | アラート機能の有効/無効      | `true`       | 必須                 |
| `volume`   | `number`   | 音量（0.0～1.0）             | `0.8`        | 0.0 <= n <= 1.0      |

#### Validation Rules

- `points`配列は降順ソート（例: `[300, 60, 0]`）
- 重複した値は含まない
- 負の値は含まない（0秒到達時のみ許容）
- 最大20個まで

#### Example

```javascript
// デフォルト設定（1分前と0秒）
{
  points: [60, 0],
  enabled: true,
  volume: 0.8
}

// カスタム設定（5分前、3分前、1分前、30秒前、0秒）
{
  points: [300, 180, 60, 30, 0],
  enabled: true,
  volume: 1.0
}

// アラート無効
{
  points: [60, 0],
  enabled: false,
  volume: 0.8
}
```

---

### 4. AlertState（アラート実行状態）

アラートの発火状況を追跡します（メモリ上のみ、永続化不要）。

#### Properties

| フィールド    | 型            | 説明                         | デフォルト値 |
| ------------- | ------------- | ---------------------------- | ------------ |
| `firedPoints` | `Set<number>` | 既に鳴らしたアラートポイント | `new Set()`  |

#### Behavior

- タイマーが`remainingSeconds`を通過した際、`firedPoints`に追加
- 既に存在する場合は再生しない（重複防止）
- リセット時に`firedPoints.clear()`で初期化
- 一時停止中は新規追加しない

#### Example

```javascript
// 初期状態
{
  firedPoints: new Set();
}

// 60秒と0秒のアラートを発火済み
{
  firedPoints: new Set([60, 0]);
}

// リセット後
{
  firedPoints: new Set();
}
```

---

## localStorage Schema

### Storage Keys

| キー                        | 値の型               | 説明             |
| --------------------------- | -------------------- | ---------------- |
| `presentation-timer.config` | `TimerConfig` (JSON) | タイマー初期設定 |
| `presentation-timer.alerts` | `AlertConfig` (JSON) | アラート設定     |

### Data Examples

```javascript
// localStorage['presentation-timer.config']
{
  "minutes": 15,
  "seconds": 0
}

// localStorage['presentation-timer.alerts']
{
  "points": [180, 60, 0],
  "enabled": true,
  "volume": 0.8
}
```

### Migration Strategy

将来的な設定変更に対応するため、バージョンフィールドを追加:

```javascript
{
  "version": 1,
  "minutes": 10,
  "seconds": 0
}
```

バージョン不一致時はデフォルト値にフォールバック。

---

## Computed Values

### Display Time（表示用時間）

`remainingSeconds`から表示用の文字列を生成します。

#### Format

- **正の値**: `MM:SS` (例: `10:00`, `5:30`, `0:05`)
- **0秒**: `0:00`
- **負の値**: `-MM:SS` (例: `-0:30`, `-2:15`)

#### Logic

```javascript
/**
 * 秒数を表示用文字列に変換
 * @param {number} totalSeconds - 残り秒数（負も可）
 * @returns {string} 表示文字列
 */
function formatTime(totalSeconds) {
  const isNegative = totalSeconds < 0;
  const absSeconds = Math.abs(Math.floor(totalSeconds));

  const minutes = Math.floor(absSeconds / 60);
  const seconds = absSeconds % 60;

  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  return isNegative ? `-${formatted}` : formatted;
}

// Examples:
formatTime(600); // "10:00"
formatTime(90); // "1:30"
formatTime(5); // "0:05"
formatTime(0); // "0:00"
formatTime(-30); // "-0:30"
formatTime(-135); // "-2:15"
```

---

## Relationships

```
TimerConfig
  ↓ (初期化)
TimerState.initialSeconds

TimerState.remainingSeconds
  ↓ (比較)
AlertConfig.points
  ↓ (一致時)
AlertState.firedPoints に追加
  ↓ (再生判定)
AudioService.play()
```

---

## Invariants（不変条件）

### タイマー状態の整合性

1. **idle状態**: `remainingSeconds === initialSeconds`
2. **running状態**: `startedAt`が設定され、`pausedAt === null`
3. **paused状態**: `startedAt`と`pausedAt`の両方が設定されている

### アラート発火条件

1. **タイマーがrunning状態**: `status === 'running'`
2. **アラート有効**: `AlertConfig.enabled === true`
3. **未発火**: `!AlertState.firedPoints.has(point)`
4. **閾値通過**: `remainingSeconds <= point`（前回のtickでは`> point`）

### データ永続化の一貫性

- `TimerConfig`と`AlertConfig`のみlocalStorageに保存
- `TimerState`と`AlertState`はメモリ上で管理（セッション内のみ）
- ページリロード時は必ずidle状態から開始

---

## Error Handling

### Invalid Data Recovery

localStorageから読み込んだデータが不正な場合:

1. **型エラー**: デフォルト値にフォールバック
2. **範囲外の値**: 最小/最大値にクランプ
3. **破損したJSON**: デフォルト設定を使用

```javascript
/**
 * localStorage から TimerConfig を安全に読み込み
 * @returns {TimerConfig}
 */
function loadTimerConfig() {
  try {
    const json = localStorage.getItem('presentation-timer.config');
    if (!json) return { minutes: 10, seconds: 0 };

    const data = JSON.parse(json);
    const minutes = Math.max(0, Math.min(999, parseInt(data.minutes) || 10));
    const seconds = Math.max(0, Math.min(59, parseInt(data.seconds) || 0));

    return { minutes, seconds };
  } catch (error) {
    console.error('Failed to load timer config:', error);
    return { minutes: 10, seconds: 0 };
  }
}
```

---

## Performance Considerations

### Update Frequency

- **タイマー更新**: 100ms間隔で`setInterval`実行
  - 実際の表示更新は秒が変わったときのみ（DOM操作最小化）
  - 精度: ±50ms以内

### Memory Management

- `firedPoints`は最大20要素（`AlertConfig.points`の上限）
- タイマーリセット時に`Set.clear()`でメモリ解放
- `setInterval`のIDを保持し、必ず`clearInterval`で解放

### localStorage Access

- 読み込み: アプリ起動時のみ（1回）
- 書き込み: 設定変更時のみ（頻繁ではない）
- 非同期不要: データサイズ小（数百バイト）

---

## Summary

このデータモデルは以下の特徴を持ちます:

1. **シンプル**: 4つの小さなエンティティのみ
2. **型安全**: 明確な型定義とバリデーションルール
3. **状態管理**: 明確な状態遷移とinvariants
4. **エラー耐性**: 不正データからの復旧機能
5. **パフォーマンス**: 最小限のDOM更新とメモリ使用

次のフェーズ（contracts/）で、これらのモデルを操作するサービスのインターフェースを定義します。
