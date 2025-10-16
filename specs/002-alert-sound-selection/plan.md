# Implementation Plan: アラート音選択機能

**Branch**: `002-alert-sound-selection` | **Date**: 2025-10-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-alert-sound-selection/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

各アラートポイント（例：残り1分、0秒到達時）に対して、個別のアラート音（「ベル」または「銅鑼」）を選択できる機能を追加します。既存のAudioServiceを拡張し、複数の音声ファイルをサポートし、各アラートポイントに紐づく音の種類を管理できるようにします。

## Technical Context

**Language/Version**: JavaScript (ES2022) - バニラJavaScript、フレームワークなし
**Primary Dependencies**: Vite 5.0 (開発サーバー・ビルドツール)、Vitest 1.0 (テスト)、ESLint 8.55 (リンティング)、Prettier 3.1 (フォーマット)、Playwright 1.40 (E2Eテスト)
**Storage**: localStorage（タイマー設定とアラート設定の永続化）
**Testing**: Vitest (unit/integration)、Playwright (E2E)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) - PWA対応
**Project Type**: Single-page Web Application（フロントエンドのみ、バックエンドなし）
**Performance Goals**: プレビュー音再生開始0.5秒以内、設定保存反映1秒以内、アラート音再生開始1秒以内
**Constraints**: 完全に自己完結型（外部API不要）、オフライン動作可能（PWA）、アクセシビリティ基準（WCAG 2.1 Level AA）
**Scale/Scope**: 小規模アプリケーション（単一HTMLページ、10未満のJSモジュール、2種類のアラート音）

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Code Quality (✅ PASS)

- TypeScript strictモードまたは同等: ✅ JSDoc型アノテーション + TypeScript型チェック（tsc --noEmit）を使用
- リンティング・フォーマッティング: ✅ ESLint + Prettier設定済み
- DRY原則・単一責任原則: ✅ 既存コードが遵守、新機能も同様に設計
- マジックナンバー禁止: ✅ 定数を使用

### Test-Driven Development (✅ PASS)

- TDDワークフロー: ✅ Vitest + Playwrightでテストファースト
- テストカバレッジ: ✅ 80%以上のカバレッジ目標
- すべてのビジネスロジックのテスト: ✅ 新AudioService拡張機能とAlertConfig拡張に対応

### User Experience Consistency (✅ PASS)

- 統一デザイン言語: ✅ 既存UIコンポーネントスタイル（CSS）を踏襲
- アクセシビリティ: ✅ WCAG 2.1 Level AA準拠、ARIA属性・キーボードナビゲーション対応
- レスポンシブデザイン: ✅ 既存のresponsive.cssを活用

### Performance Standards (✅ PASS)

- 音声プレビュー再生: ✅ 0.5秒以内（仕様要件: SC-002）
- 設定保存反映: ✅ 1秒以内（仕様要件: SC-003）
- アラート音再生: ✅ 1秒以内（仕様要件: SC-004）

### Documentation Excellence (✅ PASS)

- JSDoc/TSDoc: ✅ 既存コードに倣い、すべてのパブリックAPIに詳細なJSDoc
- README更新: ✅ 新機能の説明を追加
- ADR: ✅ 音声管理アーキテクチャの選択理由を文書化

**全体判定**: ✅ **PASS** - すべての憲法原則を満たし、Phase 0に進行可能

## Project Structure

### Documentation (this feature)

```
specs/002-alert-sound-selection/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command) - N/A (no API endpoints)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
presentation-timer/
├── index.html                          # メインHTMLファイル
├── css/
│   ├── main.css                        # メインスタイル
│   └── responsive.css                  # レスポンシブ対応
├── js/
│   ├── app.js                          # アプリケーション初期化
│   ├── models/
│   │   ├── TimerConfig.js              # タイマー設定モデル
│   │   ├── TimerState.js               # タイマー状態モデル
│   │   └── AlertConfig.js              # [拡張] アラート設定モデル（音の種類追加）
│   ├── services/
│   │   ├── TimerService.js             # タイマーロジック
│   │   ├── AudioService.js             # [拡張] 複数音声対応
│   │   └── StorageService.js           # [拡張] 音の種類永続化
│   └── ui/
│       ├── TimerDisplay.js             # タイマー表示
│       ├── ControlPanel.js             # タイマー操作
│       └── SettingsPanel.js            # [拡張] 音選択UI追加
├── assets/
│   └── sounds/
│       ├── gong.mp3                    # [既存] 銅鑼の音
│       └── bell.mp3                    # [新規] ベルの音
├── tests/
│   ├── unit/
│   │   ├── TimerService.test.js
│   │   ├── AudioService.test.js        # [拡張] 複数音声テスト
│   │   └── StorageService.test.js      # [拡張] 音設定永続化テスト
│   ├── integration/
│   │   └── TimerFlow.test.js           # [拡張] 音選択フローテスト
│   └── e2e/
│       └── userJourney.spec.js         # [拡張] 音選択E2Eテスト
├── package.json
├── vite.config.js
├── vitest.config.js
└── playwright.config.js
```

**Structure Decision**: 既存の単一Webアプリケーション構造を維持します。バックエンドは不要で、すべてのロジックはクライアントサイドで完結します。音声ファイルは`assets/sounds/`ディレクトリに静的ファイルとして配置し、Web Audio APIで読み込みます。

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

本機能では憲法原則の違反はありません。すべてのゲートを通過しています。
