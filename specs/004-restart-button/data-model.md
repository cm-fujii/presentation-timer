# Data Model: Restart Button

**Feature**: 004-restart-button | **Date**: 2025-10-16
**Phase**: 1 - Design & Contracts

## Overview

Restartボタン機能は**新しいデータモデルを導入しません**。既存のTimerState、TimerConfig、AlertConfig等のモデルをそのまま使用します。このドキュメントでは、既存モデルとの関係性と、変更がないことを明確に記録します。

## Existing Models (No Changes)

### TimerState

**Location**: `js/models/TimerState.js`

**Structure**:

```javascript
/**
 * @typedef {Object} TimerState
 * @property {'idle'|'running'|'paused'} status - タイマーの状態
 * @property {number} durationSeconds - タイマーの総時間（秒）
 * @property {number} elapsedSeconds - 経過時間（秒）
 * @property {number} remainingSeconds - 残り時間（秒）
 * @property {number|null} startedAt - 開始時刻（エポックミリ秒）
 */
```

**Usage in Restart Feature**:

- Restartボタンの有効/無効状態の判定に`status`を使用
- restart()実行時に`status`が'idle' → 'running'に遷移
- reset()により`elapsedSeconds`と`remainingSeconds`がリセットされる

**No Changes Required**: 既存の状態遷移ロジックで十分

---

### TimerConfig

**Location**: `js/models/TimerConfig.js`

**Structure**:

```javascript
/**
 * @typedef {Object} TimerConfig
 * @property {number} durationSeconds - タイマー時間（秒）
 */
```

**Usage in Restart Feature**:

- restart()実行時にreset()が`durationSeconds`を使用して初期化
- ユーザーが設定した時間に正しくリセットされることを保証

**No Changes Required**: 既存の設定読み込みロジックで十分

---

### AlertConfig

**Location**: `js/models/AlertConfig.js`

**Structure**:

```javascript
/**
 * @typedef {Object} AlertPoint
 * @property {number} seconds - アラートポイント（秒）
 * @property {'bell'|'gong'} soundType - 音の種類
 */

/**
 * @typedef {Object} AlertConfig
 * @property {boolean} enabled - アラート有効/無効
 * @property {number} volume - ボリューム（0.0-1.0）
 * @property {AlertPoint[]} points - アラートポイントの配列
 */
```

**Usage in Restart Feature**:

- restart()実行時にreset()が発火済みアラートポイント（`_firedAlertPoints`）をクリア
- 新しいカウントダウンで再度アラートが発火可能になる

**No Changes Required**: 既存のアラート発火ロジックで十分

---

## Component State (Internal State Only)

### ControlPanel Internal State

**Location**: `js/ui/ControlPanel.js`

**New Properties** (追加のみ、既存構造変更なし):

```javascript
/**
 * Restartボタン
 * @private
 * @type {HTMLButtonElement | null}
 */
this._restartButton = null;

/**
 * Restartボタンクリックイベントハンドラ
 * @type {Function | null}
 */
this.onRestart = null;
```

**Rationale**:

- 既存のボタン（\_startButton, \_pauseButton等）と同じパターン
- コンポーネント内部の状態管理、外部モデルには影響しない
- null初期化により、レンダリング前の誤操作を防止

---

### TimerService Internal State

**Location**: `js/services/TimerService.js`

**No New State**: 既存のプライベート変数をそのまま使用

- `_state`: TimerState（reset()で初期化）
- `_intervalId`: setIntervalのID（reset()でクリア、start()で再設定）
- `_firedAlertPoints`: Set<number>（reset()でクリア）
- `_lastTickSecond`: 最後にtickした秒数（reset()で初期化）
- `_completeFired`: complete イベント発火フラグ（reset()でリセット）

**Rationale**: restart()は既存のreset()とstart()を呼び出すだけなので、新しい状態管理は不要

---

## State Transitions

### Restart Operation State Diagram

```
初期状態: idle/running/paused
     |
     | (ユーザーがRestartボタンクリック)
     v
+------------------------+
| restart() 実行          |
+------------------------+
     |
     | (1) reset() 呼び出し
     v
+------------------------+
| 状態: idle に遷移       |
| elapsedSeconds: 0      |
| remainingSeconds:      |
|   durationSeconds      |
| _firedAlertPoints:     |
|   クリア                |
+------------------------+
     |
     | (2) start() 呼び出し
     v
+------------------------+
| 状態: running に遷移    |
| startedAt: Date.now()  |
| インターバル開始        |
+------------------------+
     |
     v
   タイマーカウントダウン開始
```

**State Validity**:

- ✓ idle → restart → idle → running（初期状態からのRestart）
- ✓ running → restart → idle → running（実行中からのRestart）
- ✓ paused → restart → idle → running（一時停止中からのRestart）

**Invariants** (不変条件):

1. restart()後の状態は常に'running'
2. restart()後のelapsedSecondsは常に0
3. restart()後のremainingSecondsは常にdurationSeconds
4. restart()後の\_firedAlertPointsは常に空

---

## Data Persistence

### LocalStorage (No Changes)

**Affected Keys**:

- `timerConfig`: タイマー設定（durationSeconds）
- `alertConfig`: アラート設定（enabled, volume, points）

**Restart Feature Impact**:

- **読み取りのみ**: restart()はlocalStorageから設定を読み取るが、書き込まない
- **既存の保存ロジック**: ユーザーが設定を変更した時のみStorageService経由で保存
- **状態の永続化なし**: タイマーの現在状態（running/paused/elapsed等）は保存されない（既存仕様）

**No Changes Required**: RestartボタンはlocalStorageに新しいキーや値を追加しない

---

## Validation Rules

### Button State Validation

**Rule 1**: Restartボタンはidle状態では無効

```javascript
// ControlPanel.updateButtonStates()
if (state.status === 'idle') {
  this._restartButton.disabled = true;
}
```

**Rationale**: タイマーが動いていない時のRestartは無意味

**Rule 2**: Restartボタンはrunning/paused状態では有効

```javascript
if (state.status === 'running' || state.status === 'paused') {
  this._restartButton.disabled = false;
}
```

**Rationale**: タイマーが動作中または一時停止中のみRestart可能

### Service Method Validation

**Rule 3**: restart()はreset()とstart()を順次実行

```javascript
// TimerService.restart()
restart() {
  this.reset();  // 必ず最初に実行
  this.start();  // reset完了後に実行
}
```

**Rationale**: 順序が逆転すると、アラートポイントがクリアされない等の不具合が発生

**Rule 4**: レンダリング前の呼び出しを防止

```javascript
// ControlPanel (仮想コード)
if (!this._restartButton) {
  console.error('ControlPanel not rendered yet');
  return;
}
```

**Rationale**: DOMが存在しない状態でのアクセスを防止

---

## Model Relationships

### Component-Service Interaction

```
┌─────────────────┐
│  ControlPanel   │
│  (UI Component) │
└────────┬────────┘
         │
         │ onRestart callback
         │
         v
┌─────────────────┐
│  TimerService   │
│  (Business      │
│   Logic)        │
└────────┬────────┘
         │
         │ reads/writes
         │
         v
┌─────────────────┐
│  TimerState     │
│  (Data Model)   │
└─────────────────┘
```

**Data Flow**:

1. ユーザーがRestartボタンクリック
2. ControlPanelがonRestart()コールバック呼び出し
3. app.jsがTimerService.restart()実行
4. TimerServiceがTimerStateを更新（reset → start）
5. TimerServiceが'tick'イベント発火
6. app.jsがTimerDisplayとControlPanelを更新
7. UIが新しい状態を反映

**Separation of Concerns**:

- ControlPanel: UIのみ、ビジネスロジックなし
- TimerService: 状態管理とビジネスロジック、UIへの直接アクセスなし
- TimerState: データ構造のみ、メソッドなし

---

## Migration & Backward Compatibility

### No Migration Required

**Reason**: 既存のデータモデルに変更がないため、データマイグレーションは不要

**Backward Compatibility**: 完全互換

- 既存のlocalStorageデータはそのまま使用可能
- 既存のTimerState、TimerConfig、AlertConfigは変更なし
- 新しいRestartボタンを使用しない場合、従来通りReset→Startで操作可能

**Version Compatibility**:

- ✓ v1.0.0（現在）からv1.1.0（Restart機能追加後）へのアップグレード: 問題なし
- ✓ v1.1.0からv1.0.0へのダウングレード: 問題なし（Restartボタンが表示されないのみ）

---

## Summary

**Data Model Changes**: **なし（No changes）**

**Key Points**:

1. 既存のTimerState、TimerConfig、AlertConfigをそのまま使用
2. ControlPanelに新しい内部状態（\_restartButton, onRestart）を追加
3. TimerServiceに新しいメソッド（restart()）を追加、状態変更なし
4. localStorageスキーマ変更なし
5. データマイグレーション不要
6. 完全な後方互換性

**Design Principle**: 既存のアーキテクチャパターンに従い、新しいデータモデルを導入せずに機能を追加することで、複雑性を最小限に抑える。
