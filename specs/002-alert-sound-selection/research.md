# Research: アラート音選択機能

**Feature**: 002-alert-sound-selection
**Date**: 2025-10-16
**Purpose**: Phase 0 - 技術的な未知要素の調査と設計判断の根拠を文書化

## 調査項目と決定事項

### 1. 複数音声ファイルの管理方法

**調査内容**: 既存のAudioServiceは単一の音声ファイルのみをサポートしています。複数の音声ファイル（「ベル」と「銅鑼」）を効率的に管理する方法を調査しました。

**選択肢**:

1. **AudioServiceを拡張してMap<SoundType, AudioBuffer>で管理**
2. SoundType ごとに個別のAudioServiceインスタンスを作成
3. 新しいMultiAudioServiceクラスを作成

**決定**: **選択肢1: AudioServiceを拡張**

**根拠**:
- **既存コードとの一貫性**: 既存のAudioServiceのパターンを踏襲し、学習コストを最小化
- **メモリ効率**: すべての音声バッファを1つのAudioContextで管理することで、リソースを効率的に使用
- **保守性**: 単一のサービスクラスで音声管理が完結し、デバッグとテストが容易
- **拡張性**: 将来的に音の種類を増やす場合も、Mapに追加するだけで対応可能

**実装詳細**:
```javascript
// SoundType enum
export const SoundType = {
  BELL: 'bell',
  GONG: 'gong',
};

// AudioServiceの拡張
class AudioService {
  constructor() {
    this._audioBuffers = new Map(); // Map<SoundType, AudioBuffer>
    // ... 既存のフィールド
  }

  async initialize(soundConfigs) {
    // soundConfigs = [{ type: 'bell', url: '/assets/sounds/bell.mp3' }, ...]
    for (const config of soundConfigs) {
      const buffer = await this._loadAndDecodeAudio(config.url);
      this._audioBuffers.set(config.type, buffer);
    }
  }

  play(soundType) {
    const buffer = this._audioBuffers.get(soundType);
    // ... 再生ロジック
  }
}
```

### 2. アラートポイントごとの音設定の永続化

**調査内容**: 各アラートポイント（例：60秒、0秒）に紐づく音の種類をlocalStorageでどのように保存・復元するかを調査しました。

**選択肢**:

1. **AlertConfigを拡張してMap<seconds, soundType>を含める**
2. points配列を{seconds, soundType}オブジェクトの配列に変更
3. 別途SoundMappingConfigを作成

**決定**: **選択肢2: pointsを{seconds, soundType}オブジェクトの配列に変更**

**根拠**:
- **データの結合性**: アラートポイント(seconds)と音の種類(soundType)は密接に関連しており、1つのデータ構造で管理すべき
- **型安全性**: JSDocで明確に型定義でき、バリデーションが容易
- **シンプルさ**: 追加のマッピングデータ構造が不要で、コードが簡潔になる
- **既存コードへの影響**: AlertConfigの変更は局所的で、移行も容易

**実装詳細**:
```javascript
/**
 * @typedef {Object} AlertPoint
 * @property {number} seconds - アラートを鳴らすタイミング（秒）
 * @property {SoundType} soundType - 使用する音の種類
 */

/**
 * @typedef {Object} AlertConfig
 * @property {boolean} enabled
 * @property {number} volume
 * @property {AlertPoint[]} points - アラートポイントの配列
 */

// 例
const alertConfig = {
  enabled: true,
  volume: 0.8,
  points: [
    { seconds: 60, soundType: 'bell' },
    { seconds: 0, soundType: 'gong' }
  ]
};
```

**後方互換性の対応**:
既存のlocalStorageデータ（`points: [60, 0]`形式）を新形式に自動移行する移行ロジックを実装します。

```javascript
function migrateAlertConfig(config) {
  if (config.points.length > 0 && typeof config.points[0] === 'number') {
    // 旧形式を検出
    config.points = config.points.map(seconds => ({
      seconds,
      soundType: SoundType.GONG, // デフォルトは銅鑼（仕様要件: FR-004）
    }));
  }
  return config;
}
```

### 3. 音声プレビュー機能の実装パターン

**調査内容**: 設定画面で音を事前に試聴する機能の実装方法を調査しました。

**選択肢**:

1. **AudioServiceのplayメソッドを直接使用**
2. 専用のpreviewメソッドを実装
3. 別途PreviewServiceを作成

**決定**: **選択肢2: AudioServiceに専用のpreviewメソッドを実装**

**根拠**:
- **責任分離**: プレビュー再生は通常のアラート再生と異なる（例：再生中の音を停止する必要がある）
- **制御性**: プレビュー再生中のAudioBufferSourceNodeを追跡し、新しいプレビュー開始時に前の音を停止できる
- **既存パターンとの一貫性**: AudioServiceに音声関連の機能を集約

**実装詳細**:
```javascript
class AudioService {
  constructor() {
    // ... 既存のフィールド
    this._previewSource = null; // 現在再生中のプレビュー音
  }

  preview(soundType) {
    // 再生中のプレビュー音があれば停止（仕様要件: FR-010）
    if (this._previewSource) {
      this._previewSource.stop();
      this._previewSource = null;
    }

    const buffer = this._audioBuffers.get(soundType);
    if (!buffer) return;

    const source = this._audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this._gainNode);

    // 再生終了時にクリア
    source.onended = () => {
      this._previewSource = null;
    };

    this._previewSource = source;
    source.start(0);
  }
}
```

### 4. UIデザインパターン

**調査内容**: アラートポイントごとに音を選択するUIの最適なパターンを調査しました。

**選択肢**:

1. **各アラートポイント入力行にドロップダウン（セレクトボックス）を配置**
2. 各アラートポイント入力行にラジオボタンを配置
3. グローバルな音設定と個別設定の2段階構成

**決定**: **選択肢1: 各アラートポイント入力行にセレクトボックスを配置**

**根拠**:
- **明確性**: 各アラートポイントに紐づく音が一目で分かる
- **拡張性**: 将来的に音の種類を増やす場合、ラジオボタンよりセレクトボックスの方がスケールする
- **既存UIとの一貫性**: 既存のフォーム要素パターンに合致
- **アクセシビリティ**: セレクトボックスはスクリーンリーダーで扱いやすい

**実装詳細**:
```html
<div class="alert-point-item">
  <input type="number" class="alert-point-item__input" value="60" />
  <select class="alert-point-item__sound-select" aria-label="Select alert sound">
    <option value="bell">Bell (ベル)</option>
    <option value="gong" selected>Gong (銅鑼)</option>
  </select>
  <button class="btn btn--icon" aria-label="Preview sound">🔊</button>
  <button class="btn btn--danger btn--small">Remove</button>
</div>
```

### 5. 音声ファイルの形式とサイズ

**調査内容**: PWAとしてオフライン動作をサポートするため、音声ファイルの最適な形式とサイズを調査しました。

**選択肢**:

1. **MP3（既存で使用中）**
2. OGG Vorbis（オープンフォーマット）
3. WebM/Opus（最新フォーマット）

**決定**: **選択肢1: MP3を継続使用**

**根拠**:
- **既存との一貫性**: 既存のgong.mp3と同じ形式で統一
- **ブラウザサポート**: すべてのモダンブラウザでMP3をサポート
- **ファイルサイズ**: 短い効果音（1～2秒）であればMP3でも十分小さい（10～30KB程度）
- **変換不要**: 既存の音声ファイルをそのまま使用可能

**サイズ目標**:
- ベルの音: ~20KB
- 銅鑼の音: ~20KB（既存）
- 合計: ~40KB（パフォーマンス要件SC-002を満たすため）

### 6. エラーハンドリング戦略

**調査内容**: 音声ファイルの読み込み失敗時の対応方法を調査しました。

**選択肢**:

1. **サイレント失敗（コンソールにログのみ）**
2. ユーザーにエラートーストを表示
3. フォールバック音声を使用

**決定**: **選択肢3: フォールバック音声 + ユーザー通知**

**根拠**:
- **ユーザー体験**: 音が鳴らない状態を避け、少なくとも何らかの音が鳴る
- **デバッグ可能性**: コンソールとUI両方でエラーを通知
- **既存音声の活用**: 銅鑼の音が既に動作している場合、それをフォールバックとして使用

**実装詳細**:
```javascript
async initialize(soundConfigs) {
  const fallbackBuffer = this._audioBuffers.get(SoundType.GONG);

  for (const config of soundConfigs) {
    try {
      const buffer = await this._loadAndDecodeAudio(config.url);
      this._audioBuffers.set(config.type, buffer);
    } catch (error) {
      console.error(`Failed to load sound: ${config.type}`, error);

      // フォールバック設定
      if (fallbackBuffer) {
        this._audioBuffers.set(config.type, fallbackBuffer);
      }

      // ユーザーに通知（UI実装時）
      this._notifyLoadError(config.type);
    }
  }
}
```

## ベストプラクティス調査

### Web Audio API - 複数音声の管理

**調査結果**:
- **単一AudioContext**: すべての音声バッファを1つのAudioContextで管理することが推奨されている
- **AudioBufferの再利用**: 同じ音を複数回再生する場合、AudioBufferSourceNodeを都度作成し、AudioBufferを再利用する
- **メモリ管理**: 使用しない音声バッファは適切に解放する

**適用**:
既存のAudioServiceのパターンを維持し、`_audioBuffers` Mapで複数のバッファを管理します。

### localStorage - データ移行パターン

**調査結果**:
- **バージョニング**: 設定データにバージョン番号を含めることがベストプラクティス
- **マイグレーション**: アプリケーション起動時に古い形式を検出し、自動変換する

**適用**:
StorageServiceに`migrateAlertConfig`関数を追加し、古い形式を検出して新形式に変換します。

### アクセシビリティ - 音声UI

**調査結果**:
- **ARIA属性**: 音声プレビューボタンには適切なaria-labelを設定
- **キーボード操作**: すべての音選択UIはキーボードのみで操作可能にする
- **フォーカス管理**: プレビュー再生中もフォーカスを適切に維持

**適用**:
既存のSettingsPanelのパターンに倣い、すべてのフォーム要素に適切なARIA属性を設定します。

## 技術的リスクと対策

### リスク1: 音声ファイルの読み込み失敗

**対策**: フォールバック音声（銅鑼）を使用し、ユーザーに通知

### リスク2: localStorage容量制限

**対策**: 音声設定は非常に小さい（<1KB）ため、容量問題は発生しない

### リスク3: ブラウザ互換性（Safari）

**対策**: 既存のAudioServiceはSafari対応済み。同じパターンを踏襲することで互換性を維持

## まとめ

すべての技術的未知要素が解決され、Phase 1（設計フェーズ）に進む準備が整いました。主要な設計判断は以下の通りです：

1. AudioServiceを拡張してMap<SoundType, AudioBuffer>で複数音声を管理
2. AlertConfigのpointsを{seconds, soundType}オブジェクトの配列に変更
3. AudioServiceにpreviewメソッドを追加
4. 各アラートポイント行にセレクトボックスで音を選択
5. MP3形式を継続使用
6. フォールバック音声 + ユーザー通知でエラーハンドリング

これらの決定は、既存コードとの一貫性、保守性、拡張性、ユーザー体験を総合的に考慮した結果です。
