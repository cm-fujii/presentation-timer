# Implementation Plan: プレゼンテーション・タイマー

**Branch**: `001-presentation-timer` | **Date**: 2025-10-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-presentation-timer/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

プレゼンテーション中にタイムキーパーが残り時間を大きく表示し、リアルタイムでカウントダウンを行うWebアプリケーションを構築します。iPad Safari上で動作し、GitHub Pagesで静的ホスティングされます。基本的なタイマー操作（設定・開始・停止・リセット）、マイナス時間の赤色表示、カスタマイズ可能なアラート音機能を提供します。

## Technical Context

**Language/Version**: HTML5 + CSS3 + JavaScript (ES2022) - バニラJavaScript、フレームワークなし
**Primary Dependencies**: なし（完全に自己完結型、外部ライブラリ不使用）
**Storage**: localStorage（タイマー設定とアラートポイントの永続化）
**Testing**: Vitest（ユニットテスト）+ Playwright（E2Eテスト）
**Target Platform**: iPad Safari（iOS 15+）、モダンブラウザ全般対応
**Project Type**: web（シングルページアプリケーション）
**Performance Goals**:

- Time to Interactive (TTI): 1秒以内
- First Contentful Paint (FCP): 0.5秒以内
- タイマー更新遅延: 50ms以内（実時間との誤差1秒以内を保証）
  **Constraints**:
- オフライン対応（Service Worker + Cache API）
- バンドルサイズ: 50KB以内（gzip圧縮後）
- メモリ使用量: 10MB以内
- バッテリー効率: requestAnimationFrameではなくsetIntervalを使用
  **Scale/Scope**:
- 1画面のみ（シンプルなSPA）
- 同時ユーザー数: 制限なし（完全クライアントサイド）
- 複雑度: 低（約500行のJavaScript想定）

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. コード品質第一 ✅

- **型安全性**: バニラJavaScriptを使用しますが、JSDocで型注釈を追加し、TypeScriptのチェックモード（checkJs）を有効化
- **リンティング**: ESLintで標準ルールセット適用、警告ゼロを強制
- **フォーマット**: Prettierで自動フォーマット
- **命名**: 意味のある変数名・関数名、マジックナンバーは定数化
- **DRY/単一責任**: モジュール化されたコード構造

**判定**: ✅ PASS - JSDoc + checkJsでTypeScript並みの型安全性を確保

### II. テスト駆動開発 ✅

- **TDDワークフロー**: 赤→緑→リファクタリングを厳守
- **テストカバレッジ**: 80%以上を目標
- **テスト種別**:
  - ユニットテスト: タイマーロジック、状態管理、アラート機能
  - インテグレーションテスト: UI操作とロジックの統合
  - E2Eテスト: 主要ユーザーフロー（設定→開始→停止→リセット）

**判定**: ✅ PASS - Vitest + Playwrightで包括的なテスト戦略

### III. ユーザー体験の一貫性 ✅

- **デザイン言語**: シンプルで一貫したUIデザイン、ボタン配置は統一
- **アクセシビリティ**: WCAG 2.1 Level AA準拠
  - キーボードナビゲーション対応
  - ARIAラベル設定
  - 色のコントラスト比確保（赤色表示含む）
- **レスポンシブ**: iPad縦横、デスクトップ、モバイルすべてで動作
- **エラーメッセージ**: 明確で実行可能なガイダンス

**判定**: ✅ PASS - アクセシビリティとレスポンシブ対応を設計段階で組み込み

### IV. パフォーマンス基準 ✅

- **初期ロード**: 1秒以内（バニラJSで依存関係なし、極めて軽量）
- **TTI**: 1秒以内
- **FCP**: 0.5秒以内
- **バンドルサイズ**: 50KB以内（gzip後）
- **メモリリーク**: タイマークリーンアップを適切に実装
- **60fps**: アニメーションなし、シンプルなDOM更新のみ

**判定**: ✅ PASS - 外部依存なしの軽量設計で全基準を余裕で達成

### V. ドキュメンテーション卓越性 ✅

- **JSDoc**: すべてのパブリック関数にドキュメント
- **README**: クイックスタート、アーキテクチャ概要、デプロイ手順
- **ADR**: 技術選択の理由（バニラJS選択、localStorage使用など）
- **quickstart.md**: 開発環境セットアップとローカル実行手順
- **トラブルシューティング**: よくある問題と解決策

**判定**: ✅ PASS - Phase 1でquickstart.md生成、継続的にドキュメント更新

### 総合判定: ✅ すべてのゲートをPASS

この設計は憲法のすべての原則を満たしていますわ。軽量でシンプルな技術スタック（バニラJS）により、品質・テスト・パフォーマンス基準を自然に達成できます。

## Project Structure

### Documentation (this feature)

```
specs/001-presentation-timer/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api.md          # 内部API契約（モジュール間インターフェース）
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
/ (リポジトリルート - GitHub Pages用)
├── index.html           # メインHTML（エントリポイント）
├── css/
│   ├── main.css        # メインスタイルシート
│   └── responsive.css  # レスポンシブデザイン
├── js/
│   ├── models/
│   │   ├── TimerState.js      # タイマー状態モデル
│   │   └── AlertConfig.js     # アラート設定モデル
│   ├── services/
│   │   ├── TimerService.js    # タイマーロジック
│   │   ├── StorageService.js  # localStorage管理
│   │   └── AudioService.js    # 音声再生
│   ├── ui/
│   │   ├── TimerDisplay.js    # タイマー表示コンポーネント
│   │   ├── ControlPanel.js    # 操作パネル
│   │   └── SettingsPanel.js   # 設定パネル
│   └── app.js          # アプリケーションエントリポイント
├── assets/
│   └── sounds/
│       └── alert.mp3   # デフォルトアラート音
├── tests/
│   ├── unit/
│   │   ├── TimerService.test.js
│   │   ├── StorageService.test.js
│   │   └── AudioService.test.js
│   ├── integration/
│   │   └── TimerFlow.test.js
│   └── e2e/
│       └── userJourney.spec.js
├── .github/
│   └── workflows/
│       ├── test.yml     # CI: テスト実行
│       └── deploy.yml   # CD: GitHub Pagesデプロイ
├── sw.js                # Service Worker（オフライン対応）
├── manifest.json        # PWA manifest
├── package.json         # 開発依存関係（Vitest, Playwright, ESLint, Prettier）
├── vitest.config.js     # Vitest設定
└── playwright.config.js # Playwright設定
```

**Structure Decision**:

GitHub Pages用の静的サイト構造を採用。ルートディレクトリに`index.html`を配置し、`js/`以下にモジュール化されたJavaScriptコードを配置します。

**理由**:

1. **GitHub Pages互換**: ルートまたは`docs/`フォルダからホスティング可能（今回はルートを選択）
2. **シンプルさ**: ビルドプロセス不要、直接ブラウザで実行可能
3. **モジュール構造**: ES Modulesを使用し、責任ごとにファイルを分割
4. **テスト分離**: `tests/`ディレクトリで本番コードと分離
5. **PWA対応**: Service WorkerとManifestでオフライン機能とホーム画面追加をサポート

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

**該当なし**: すべての憲法原則を満たしており、違反はございません。

---

## Post-Design Constitution Re-Check

_Phase 1完了後の再評価_

### 設計成果物レビュー

以下の成果物が生成され、すべて憲法原則に準拠していますわ:

1. **research.md**: 技術選択の根拠を詳細に文書化
2. **data-model.md**: シンプルで型安全なデータモデル（4エンティティ）
3. **contracts/api.md**: 明確なモジュール間インターフェース定義
4. **quickstart.md**: 包括的な開発ガイド

### 憲法原則への準拠（再確認）

#### I. コード品質第一 ✅

**設計段階での保証**:

- JSDoc完備のAPI契約定義
- 明確な型定義（data-model.md）
- モジュール化された責任分離（MVS構造）
- バリデーションルールの明示

**判定**: ✅ 変更なし - 設計は品質基準を満たす

---

#### II. テスト駆動開発 ✅

**設計段階での保証**:

- コントラクトテストの例を提示（contracts/api.md）
- テスト構成の明示（unit/integration/e2e）
- TDDワークフローをquickstart.mdで説明
- カバレッジ目標80%を設定

**判定**: ✅ 変更なし - TDD実施準備完了

---

#### III. ユーザー体験の一貫性 ✅

**設計段階での保証**:

- アクセシビリティ要件を明示（WCAG 2.1 Level AA）
- レスポンシブデザインの構造化
- エラーハンドリング戦略の文書化
- UIコンポーネントの責任分離

**判定**: ✅ 変更なし - UX基準を満たす設計

---

#### IV. パフォーマンス基準 ✅

**設計段階での保証**:

- パフォーマンス予算を設定（50KB、TTI < 1秒）
- 軽量技術スタック（バニラJS、依存なし）
- 最適化戦略の文書化（メモリ管理、DOM更新最小化）
- Lighthouse目標スコア設定

**判定**: ✅ 変更なし - パフォーマンス基準達成可能

---

#### V. ドキュメンテーション卓越性 ✅

**設計段階での成果**:

- 4つの包括的な設計ドキュメント生成
- API契約の完全なJSDoc仕様
- 開発ガイド（quickstart.md）作成
- トラブルシューティング情報の提供

**判定**: ✅ 変更なし - ドキュメント基準を超過達成

---

### 総合判定（Phase 1完了時）: ✅ すべて合格

設計段階で作成されたすべての成果物が憲法原則に準拠していますわ。実装フェーズ（`/speckit.tasks`と`/speckit.implement`）に進む準備が整っております。

**特筆事項**:

- 違反・例外なし
- 複雑性の追加なし
- シンプルで保守性の高い設計
- すべての品質ゲートがクリア可能な構造
