# Data Model: アラート音選択機能

**Feature**: 002-alert-sound-selection
**Date**: 2025-10-16
**Purpose**: Phase 1 - データモデルとエンティティの詳細定義

## エンティティ概要

本機能では、既存の`AlertConfig`モデルを拡張し、新たに`SoundType` enumと`AlertPoint`型を導入します。

## 1. SoundType (Enum)

アラート音の種類を表す列挙型です。

### 定義

```javascript
/**
 * アラート音の種類
 *
 * @readonly
 * @enum {string}
 *
 * @example
 * ```javascript
 * const soundType = SoundType.BELL; // 'bell'
 * ```
 */
export const SoundType = Object.freeze({
  /**
   * ベルの音
   */
  BELL: 'bell',

  /**
   * 銅鑼の音
   */
  GONG: 'gong',
});
```

### フィールド

| フィールド | 型     | 値      | 説明           |
| ---------- | ------ | ------- | -------------- |
| BELL       | string | `'bell'` | ベルの音を表す |
| GONG       | string | `'gong'` | 銅鑼の音を表す |

### バリデーション

```javascript
/**
 * 有効なSoundTypeかどうかを検証する
 *
 * @param {string} soundType - 検証する音の種類
 * @returns {boolean} 有効な場合はtrue
 */
export function isValidSoundType(soundType) {
  return Object.values(SoundType).includes(soundType);
}
```

### 使用例

```javascript
import { SoundType, isValidSoundType } from './models/SoundType.js';

// 音の種類を指定
const bellSound = SoundType.BELL;

// バリデーション
console.log(isValidSoundType('bell')); // true
console.log(isValidSoundType('invalid')); // false
```

## 2. AlertPoint (Type)

個々のアラートポイント（秒数と音の種類）を表す型です。

### 定義

```javascript
/**
 * アラートポイント設定
 *
 * @typedef {Object} AlertPoint
 * @property {number} seconds - アラートを鳴らすタイミング（秒）。0以上の整数
 * @property {SoundType} soundType - 使用する音の種類
 *
 * @example
 * ```javascript
 * // 残り60秒でベルの音を鳴らす
 * const alertPoint = {
 *   seconds: 60,
 *   soundType: SoundType.BELL
 * };
 *
 * // 0秒到達時に銅鑼の音を鳴らす
 * const zeroPoint = {
 *   seconds: 0,
 *   soundType: SoundType.GONG
 * };
 * ```
 */
```

### フィールド

| フィールド | 型       | 制約                      | 説明                           |
| ---------- | -------- | ------------------------- | ------------------------------ |
| seconds    | number   | >= 0, 整数                | アラートを鳴らすタイミング（秒） |
| soundType  | SoundType | SoundType enumのいずれか | 使用する音の種類               |

### ファクトリー関数

```javascript
/**
 * デフォルトのAlertPointを作成する
 *
 * @param {number} seconds - アラートポイント（秒）
 * @param {SoundType} [soundType=SoundType.GONG] - 音の種類（デフォルト: 銅鑼）
 * @returns {AlertPoint}
 *
 * @example
 * ```javascript
 * const point1 = createAlertPoint(60); // { seconds: 60, soundType: 'gong' }
 * const point2 = createAlertPoint(30, SoundType.BELL); // { seconds: 30, soundType: 'bell' }
 * ```
 */
export function createAlertPoint(seconds, soundType = SoundType.GONG) {
  return {
    seconds,
    soundType,
  };
}
```

### バリデーション

```javascript
/**
 * AlertPointが有効かどうかを検証する
 *
 * @param {AlertPoint} point - 検証するアラートポイント
 * @returns {boolean} 有効な場合はtrue
 */
export function isValidAlertPoint(point) {
  if (!point || typeof point !== 'object') {
    return false;
  }

  return (
    typeof point.seconds === 'number' &&
    Number.isInteger(point.seconds) &&
    point.seconds >= 0 &&
    isValidSoundType(point.soundType)
  );
}
```

## 3. AlertConfig (拡張モデル)

アラート音の設定全体を表すモデルです。既存の`AlertConfig`を拡張し、`points`フィールドの型を`number[]`から`AlertPoint[]`に変更します。

### 定義

```javascript
/**
 * アラート音の設定
 *
 * @typedef {Object} AlertConfig
 * @property {boolean} enabled - アラート音が有効かどうか
 * @property {number} volume - 音量（0.0～1.0）。0.0は無音、1.0は最大音量
 * @property {AlertPoint[]} points - アラートポイントの配列（降順ソート推奨）
 *
 * @example
 * ```javascript
 * // デフォルト設定：1分前にベル、0秒で銅鑼
 * const config = {
 *   enabled: true,
 *   volume: 0.8,
 *   points: [
 *     { seconds: 60, soundType: SoundType.BELL },
 *     { seconds: 0, soundType: SoundType.GONG }
 *   ]
 * };
 *
 * // カスタム設定：3分前、1分前、30秒前、0秒でアラート
 * const customConfig = {
 *   enabled: true,
 *   volume: 0.5,
 *   points: [
 *     { seconds: 180, soundType: SoundType.GONG },
 *     { seconds: 60, soundType: SoundType.BELL },
 *     { seconds: 30, soundType: SoundType.BELL },
 *     { seconds: 0, soundType: SoundType.GONG }
 *   ]
 * };
 * ```
 */
```

### フィールド

| フィールド | 型           | 制約          | デフォルト値 | 説明                           |
| ---------- | ------------ | ------------- | ------------ | ------------------------------ |
| enabled    | boolean      | true/false    | true         | アラート音が有効かどうか       |
| volume     | number       | 0.0～1.0      | 0.8          | 音量                           |
| points     | AlertPoint[] | 空配列可      | 下記参照     | アラートポイントの配列         |

**デフォルトpoints**:
```javascript
[
  { seconds: 60, soundType: SoundType.GONG },
  { seconds: 0, soundType: SoundType.GONG }
]
```

### ファクトリー関数

```javascript
/**
 * デフォルトのAlertConfigを作成する
 *
 * @returns {AlertConfig} 初期化されたアラート設定
 *
 * @example
 * ```javascript
 * const config = createDefaultAlertConfig();
 * // {
 * //   enabled: true,
 * //   volume: 0.8,
 * //   points: [
 * //     { seconds: 60, soundType: 'gong' },
 * //     { seconds: 0, soundType: 'gong' }
 * //   ]
 * // }
 * ```
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
```

### 操作関数

#### アラートポイントの追加

```javascript
/**
 * アラートポイントを追加する
 *
 * @param {AlertConfig} config - アラート設定
 * @param {AlertPoint} point - 追加するアラートポイント
 * @returns {AlertConfig} 更新されたアラート設定（降順ソート済み）
 *
 * @example
 * ```javascript
 * const config = createDefaultAlertConfig();
 * const newPoint = { seconds: 30, soundType: SoundType.BELL };
 * const updated = addAlertPoint(config, newPoint);
 * // points: [{ 60, 'gong' }, { 30, 'bell' }, { 0, 'gong' }]
 * ```
 */
export function addAlertPoint(config, point) {
  // 同じsecondsのポイントが既に存在する場合は置き換え
  const existingIndex = config.points.findIndex((p) => p.seconds === point.seconds);

  let newPoints;
  if (existingIndex !== -1) {
    // 既存のポイントを置き換え
    newPoints = [...config.points];
    newPoints[existingIndex] = point;
  } else {
    // 新しいポイントを追加
    newPoints = [...config.points, point];
  }

  return {
    ...config,
    points: newPoints.sort((a, b) => b.seconds - a.seconds), // 降順ソート
  };
}
```

#### アラートポイントの削除

```javascript
/**
 * アラートポイントを削除する
 *
 * @param {AlertConfig} config - アラート設定
 * @param {number} seconds - 削除するアラートポイントの秒数
 * @returns {AlertConfig} 更新されたアラート設定
 *
 * @example
 * ```javascript
 * const config = {
 *   enabled: true,
 *   volume: 0.8,
 *   points: [{ 60, 'bell' }, { 30, 'gong' }, { 0, 'gong' }]
 * };
 * const updated = removeAlertPoint(config, 30);
 * // points: [{ 60, 'bell' }, { 0, 'gong' }]
 * ```
 */
export function removeAlertPoint(config, seconds) {
  return {
    ...config,
    points: config.points.filter((point) => point.seconds !== seconds),
  };
}
```

#### アラートポイントの音変更

```javascript
/**
 * 特定のアラートポイントの音を変更する
 *
 * @param {AlertConfig} config - アラート設定
 * @param {number} seconds - 変更するアラートポイントの秒数
 * @param {SoundType} newSoundType - 新しい音の種類
 * @returns {AlertConfig} 更新されたアラート設定
 *
 * @example
 * ```javascript
 * const config = createDefaultAlertConfig();
 * const updated = updateAlertPointSound(config, 60, SoundType.BELL);
 * // points: [{ 60, 'bell' }, { 0, 'gong' }]
 * ```
 */
export function updateAlertPointSound(config, seconds, newSoundType) {
  return {
    ...config,
    points: config.points.map((point) =>
      point.seconds === seconds ? { ...point, soundType: newSoundType } : point
    ),
  };
}
```

### バリデーション

```javascript
/**
 * AlertConfigが有効かどうかを検証する
 *
 * @param {AlertConfig} config - 検証するアラート設定
 * @returns {boolean} 有効な場合はtrue、無効な場合はfalse
 *
 * @example
 * ```javascript
 * const validConfig = createDefaultAlertConfig();
 * console.log(isValidAlertConfig(validConfig)); // true
 *
 * const invalidConfig = { enabled: true, volume: 2.0, points: [] };
 * console.log(isValidAlertConfig(invalidConfig)); // false (volume > 1.0)
 * ```
 */
export function isValidAlertConfig(config) {
  if (!config || typeof config !== 'object') {
    return false;
  }

  return (
    typeof config.enabled === 'boolean' &&
    typeof config.volume === 'number' &&
    config.volume >= 0 &&
    config.volume <= 1 &&
    Array.isArray(config.points) &&
    config.points.every((point) => isValidAlertPoint(point))
  );
}
```

## 4. 後方互換性サポート

既存のlocalStorageデータ（`points: [60, 0]`形式）を新形式に自動移行します。

### マイグレーション関数

```javascript
/**
 * 旧形式のAlertConfigを新形式に移行する
 *
 * @param {Object} config - 旧形式または新形式のAlertConfig
 * @returns {AlertConfig} 新形式のAlertConfig
 *
 * @example
 * ```javascript
 * // 旧形式
 * const oldConfig = {
 *   enabled: true,
 *   volume: 0.8,
 *   points: [60, 0] // number[]
 * };
 *
 * const migratedConfig = migrateAlertConfig(oldConfig);
 * // {
 * //   enabled: true,
 * //   volume: 0.8,
 * //   points: [
 * //     { seconds: 60, soundType: 'gong' },
 * //     { seconds: 0, soundType: 'gong' }
 * //   ]
 * // }
 * ```
 */
export function migrateAlertConfig(config) {
  if (!config || !Array.isArray(config.points)) {
    return createDefaultAlertConfig();
  }

  // 旧形式を検出（pointsの最初の要素がnumber型）
  if (config.points.length > 0 && typeof config.points[0] === 'number') {
    return {
      ...config,
      points: config.points.map((seconds) => ({
        seconds,
        soundType: SoundType.GONG, // デフォルトは銅鑼（仕様要件: FR-004）
      })),
    };
  }

  // 既に新形式の場合はそのまま返す
  return config;
}
```

## データフロー

```
┌─────────────────┐
│  localStorage   │
│  (JSON)         │
└────────┬────────┘
         │
         ├─ 読み込み (StorageService.loadAlertConfig)
         │
         ▼
┌─────────────────┐
│ migrateAlert    │
│ Config()        │ ← 旧形式を検出・変換
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AlertConfig    │
│  (新形式)       │ ← isValidAlertConfig()でバリデーション
└────────┬────────┘
         │
         ├─ UI表示 (SettingsPanel)
         │
         ├─ 音選択 (updateAlertPointSound)
         │
         ├─ 保存 (StorageService.saveAlertConfig)
         │
         └─ AudioService.play(soundType)
```

## エンティティ関係図

```
┌──────────────────────┐
│     SoundType        │
│     (Enum)           │
│──────────────────────│
│ + BELL: 'bell'       │
│ + GONG: 'gong'       │
└──────────────────────┘
           △
           │ 使用
           │
┌──────────┴───────────┐
│    AlertPoint        │
│──────────────────────│
│ + seconds: number    │
│ + soundType: string  │ ──┐
└──────────────────────┘   │
           △               │
           │ 含む (配列)    │
           │               │
┌──────────┴───────────┐   │
│   AlertConfig        │   │
│──────────────────────│   │
│ + enabled: boolean   │   │
│ + volume: number     │   │
│ + points: AlertPoint[]│──┘
└──────────────────────┘
```

## まとめ

本データモデルは以下の要件を満たします：

- **仕様要件FR-001～FR-010**: すべてのアラート音選択機能を表現可能
- **仕様要件FR-004**: デフォルト音「銅鑼」をmigrateAlertConfigで保証
- **仕様要件FR-005**: AlertConfig全体をlocalStorageに永続化可能
- **後方互換性**: 既存データを自動移行
- **型安全性**: JSDocによる明確な型定義
- **バリデーション**: すべてのエンティティに検証関数を提供
- **不変性**: イミュータブルな操作関数（既存コードのパターンを踏襲）
