# Tasks: プレゼンテーション・タイマー

**Input**: Design documents from `/specs/001-presentation-timer/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Tests**: このプロジェクトはTDD（テスト駆動開発）を採用します。憲法原則に従い、すべてのビジネスロジックにテストタスクが含まれます。

**Organization**: タスクはユーザーストーリーごとにグループ化され、各ストーリーを独立して実装・テストできるようにします。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するユーザーストーリー（US1, US2, US3）
- 説明には正確なファイルパスを含む

## Path Conventions
- GitHub Pages用静的サイト構造（ルートディレクトリベース）
- メインコード: `js/` 以下
- テスト: `tests/` 以下
- スタイル: `css/` 以下
- 設定ファイル: ルート直下

---

## Phase 1: Setup（プロジェクト初期化）

**Purpose**: プロジェクト構造の作成と開発環境のセットアップ

- [ ] T001 プロジェクトディレクトリ構造を作成（plan.md に従う）
- [ ] T002 [P] package.json を作成し、開発依存関係を追加（Vitest, Playwright, ESLint, Prettier）
- [ ] T003 [P] .gitignore を作成（node_modules, dist/, coverage/, .DS_Store）
- [ ] T004 [P] ESLint設定ファイル（.eslintrc.json）を作成（eslint:recommended + ES2022）
- [ ] T005 [P] Prettier設定ファイル（.prettierrc.json）を作成
- [ ] T006 [P] JSDoc + TypeScript checkJs 設定（jsconfig.json）を作成
- [ ] T007 [P] Vitest設定ファイル（vitest.config.js）を作成
- [ ] T008 [P] Playwright設定ファイル（playwright.config.js）を作成（Chromium, Firefox, WebKit）
- [ ] T009 [P] GitHub Actions CI/CDワークフローファイル（.github/workflows/test.yml）を作成
- [ ] T010 [P] GitHub Actions デプロイワークフローファイル（.github/workflows/deploy.yml）を作成
- [ ] T011 README.md を作成（プロジェクト概要、セットアップ手順、デプロイ方法）
- [ ] T012 [P] デフォルトアラート音ファイル（assets/sounds/alert.mp3）を配置

**Checkpoint**: プロジェクト構造とツール設定が完了

---

## Phase 2: Foundational（基盤実装）

**Purpose**: すべてのユーザーストーリーで使用する基盤コンポーネント

**⚠️ CRITICAL**: このフェーズが完了するまで、ユーザーストーリーの実装は開始できません

- [ ] T013 [P] TimerState モデルの型定義を js/models/TimerState.js に作成（JSDoc完備）
- [ ] T014 [P] TimerConfig モデルの型定義を js/models/TimerConfig.js に作成（JSDoc完備）
- [ ] T015 [P] AlertConfig モデルの型定義を js/models/AlertConfig.js に作成（JSDoc完備）
- [ ] T016 StorageService の静的メソッドを js/services/StorageService.js に実装（loadTimerConfig, saveTimerConfig, loadAlertConfig, saveAlertConfig, clear）
- [ ] T017 [P] StorageService のユニットテストを tests/unit/StorageService.test.js に作成（TDD: 赤→緑→リファクタリング）
- [ ] T018 基本的な index.html を作成（viewport設定、ES Modules対応、main.css/responsive.css読み込み）
- [ ] T019 [P] ベーススタイルシート css/main.css を作成（変数定義、リセットCSS、基本レイアウト）
- [ ] T020 [P] レスポンシブスタイルシート css/responsive.css を作成（iPad縦横、モバイル、デスクトップ対応）

**Checkpoint**: 基盤実装完了 - ユーザーストーリーの実装開始可能

---

## Phase 3: User Story 1 - 基本的なタイマー操作と表示 (Priority: P1) 🎯 MVP

**Goal**: タイムキーパーが時間を設定し、大きく表示されたカウントダウンを視認しながら、タイマーを操作（開始・停止・リセット）できる最小限の機能を提供

**Independent Test**: 任意の時間（例：5分）を設定し、タイマーを開始して画面に大きく表示されることを確認し、一時停止・再開・リセットが正しく動作することをテスト

### Tests for User Story 1（TDD: テストファースト）

**NOTE: これらのテストを先に書き、失敗することを確認してから実装を開始する**

- [ ] T021 [P] [US1] TimerService の契約テストを tests/unit/TimerService.test.js に作成（start, pause, resume, reset, setDuration, getState メソッド）
- [ ] T022 [P] [US1] TimerService のイベントテスト（tick, complete イベント発火）を tests/unit/TimerService.test.js に追加
- [ ] T023 [P] [US1] TimerDisplay の統合テストを tests/integration/TimerFlow.test.js に作成（UI更新ロジック）
- [ ] T024 [P] [US1] E2Eテスト（基本操作フロー）を tests/e2e/userJourney.spec.js に作成（設定→開始→停止→再開→リセット）

### Implementation for User Story 1

- [ ] T025 [US1] TimerService クラスを js/services/TimerService.js に実装（constructor, start, pause, resume, reset, setDuration, getRemainingTime, getState メソッド）
- [ ] T026 [US1] TimerService に tick イベントロジックを実装（100ms間隔更新、秒変更時のみイベント発火）
- [ ] T027 [US1] TimerService に complete イベントロジックを実装（0秒到達時）
- [ ] T028 [US1] TimerService の状態遷移ロジックを実装（idle ↔ running ↔ paused）
- [ ] T029 [US1] formatTime ユーティリティ関数を js/services/TimerService.js に実装（MM:SS形式変換）
- [ ] T030 [US1] TimerDisplay コンポーネントを js/ui/TimerDisplay.js に実装（render, update メソッド）
- [ ] T031 [US1] TimerDisplay の DOM構造を実装（大きなフォント、中央配置、アクセシビリティ対応）
- [ ] T032 [US1] ControlPanel コンポーネントを js/ui/ControlPanel.js に実装（render, updateButtonStates メソッド）
- [ ] T033 [US1] ControlPanel のボタンイベントハンドラを実装（Start/Pause/Resume, Reset）
- [ ] T034 [US1] SettingsPanel コンポーネントを js/ui/SettingsPanel.js に実装（render, saveSettings メソッド）
- [ ] T035 [US1] SettingsPanel の時間入力UI を実装（分・秒フィールド、バリデーション）
- [ ] T036 [US1] アプリケーションエントリポイント js/app.js を実装（モジュール初期化、イベント接続）
- [ ] T037 [US1] index.html に TimerDisplay, ControlPanel, SettingsPanel のコンテナ要素を追加
- [ ] T038 [US1] css/main.css にタイマー表示スタイルを追加（大きいフォントサイズ、視認性重視）
- [ ] T039 [US1] css/main.css にボタンスタイルを追加（タッチフレンドリー、明確なフィードバック）
- [ ] T040 [US1] css/responsive.css にiPad縦横対応を追加（メディアクエリ）
- [ ] T041 [US1] アクセシビリティ対応を実装（ARIAラベル、role属性、キーボードナビゲーション）
- [ ] T042 [US1] すべてのテストを実行し、User Story 1が独立して動作することを検証

**Checkpoint**: User Story 1（MVP）が完全に機能し、独立してテスト可能

---

## Phase 4: User Story 2 - 時間経過後のマイナス表示 (Priority: P2)

**Goal**: 予定時間を超過した場合、タイムキーパーが超過時間を視覚的に認識できる（赤色マイナス表示）

**Independent Test**: タイマーを「0:03」などの短い時間に設定し、0秒を経過した後も動作を継続させ、マイナス表示（例：「-0:05」）が赤色で表示されることを確認

### Tests for User Story 2（TDD: テストファースト）

- [ ] T043 [P] [US2] マイナス時間表示のユニットテストを tests/unit/TimerService.test.js に追加（負の remainingSeconds）
- [ ] T044 [P] [US2] マイナス時間の formatTime テストを tests/unit/TimerService.test.js に追加（-MM:SS形式）
- [ ] T045 [P] [US2] 赤色表示の統合テストを tests/integration/TimerFlow.test.js に追加（CSSクラス変更）
- [ ] T046 [P] [US2] E2Eテスト（マイナス時間フロー）を tests/e2e/userJourney.spec.js に追加（0秒超過シナリオ）

### Implementation for User Story 2

- [ ] T047 [US2] TimerService にマイナス時間継続ロジックを実装（0秒以降もカウント継続）
- [ ] T048 [US2] formatTime 関数にマイナス時間対応を追加（負の値の処理）
- [ ] T049 [US2] TimerDisplay.update() メソッドに赤色表示ロジックを追加（isNegative フラグ）
- [ ] T050 [US2] css/main.css に赤色表示スタイルクラスを追加（.timer-negative、コントラスト比4.5:1以上）
- [ ] T051 [US2] css/main.css にマイナス時間のアニメーション効果を追加（オプション：警告アニメーション）
- [ ] T052 [US2] リセット時に赤色表示をクリアするロジックを ControlPanel に実装
- [ ] T053 [US2] すべてのテストを実行し、User Story 2が独立して動作することを検証

**Checkpoint**: User Story 1 と User Story 2 が両方とも独立して動作

---

## Phase 5: User Story 3 - アラート音の設定と再生 (Priority: P3)

**Goal**: タイムキーパーが特定のタイミング（残り1分、0秒到達時など）で音声アラートを設定し、音で時間を知らせることができる

**Independent Test**: タイマーに複数のアラートポイント（例：1分前、0秒）を設定し、それぞれのタイミングで音が鳴ることを確認。アラート設定を変更（例：30秒前を追加）して、カスタマイズが正しく反映されることをテスト

### Tests for User Story 3（TDD: テストファースト）

- [ ] T054 [P] [US3] AudioService のユニットテストを tests/unit/AudioService.test.js に作成（initialize, play, setVolume メソッド）
- [ ] T055 [P] [US3] アラート発火ロジックのユニットテストを tests/unit/TimerService.test.js に追加（alert イベント）
- [ ] T056 [P] [US3] アラート設定UIの統合テストを tests/integration/TimerFlow.test.js に追加（SettingsPanel）
- [ ] T057 [P] [US3] E2Eテスト（アラート機能フロー）を tests/e2e/userJourney.spec.js に追加（設定→アラート発火シナリオ）

### Implementation for User Story 3

- [ ] T058 [P] [US3] AudioService クラスを js/services/AudioService.js に実装（constructor, initialize, play, setVolume メソッド）
- [ ] T059 [US3] AudioService に Web Audio API 初期化ロジックを実装（Safari対応、ユーザーインタラクション後）
- [ ] T060 [US3] AudioService に音声ファイル読み込み・デコードロジックを実装（fetch + decodeAudioData）
- [ ] T061 [US3] TimerService に AlertState 管理ロジックを追加（firedPoints の Set管理）
- [ ] T062 [US3] TimerService にアラート発火判定ロジックを実装（remainingSeconds と AlertConfig.points の比較）
- [ ] T063 [US3] TimerService に alert イベント発火ロジックを実装（一時停止中は発火しない）
- [ ] T064 [US3] TimerService のリセット時に AlertState をクリアするロジックを追加
- [ ] T065 [US3] SettingsPanel にアラートポイント設定UIを実装（リスト表示、追加/削除ボタン）
- [ ] T066 [US3] SettingsPanel にアラート有効/無効トグルを実装
- [ ] T067 [US3] SettingsPanel に音量スライダーを実装（0.0～1.0、デフォルト0.8）
- [ ] T068 [US3] StorageService に AlertConfig 保存/読み込み機能を実装（既に T016 で実装済みの場合はスキップ）
- [ ] T069 [US3] app.js に AudioService 初期化ロジックを追加（ユーザーインタラクション後）
- [ ] T070 [US3] app.js に TimerService の alert イベントリスナーを追加（AudioService.play() 呼び出し）
- [ ] T071 [US3] css/main.css にアラート設定パネルのスタイルを追加
- [ ] T072 [US3] すべてのテストを実行し、User Story 3が独立して動作することを検証

**Checkpoint**: すべてのユーザーストーリー（US1, US2, US3）が独立して動作

---

## Phase 6: PWA & Offline対応

**Purpose**: Service WorkerによるオフラインサポートとPWA機能の追加

- [ ] T073 [P] Service Worker（sw.js）を実装（キャッシュ戦略: Cache-First）
- [ ] T074 [P] PWA Manifest（manifest.json）を作成（アプリ名、アイコン、表示モード）
- [ ] T075 Service Worker 登録ロジックを app.js に追加（navigator.serviceWorker.register）
- [ ] T076 [P] アプリアイコン画像を assets/icons/ に配置（192x192, 512x512）
- [ ] T077 index.html に manifest.json のリンクを追加
- [ ] T078 [P] Service Worker のキャッシュ更新ロジックを実装（バージョン管理）

**Checkpoint**: PWA対応完了、オフラインで動作可能

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 品質向上、最適化、ドキュメント整備

- [ ] T079 [P] すべてのJavaScriptファイルにJSDocを追加/レビュー（型注釈完備）
- [ ] T080 [P] ESLintですべてのコードをチェックし、警告をゼロにする
- [ ] T081 [P] Prettierですべてのコードをフォーマット
- [ ] T082 [P] 型チェック（JSDoc + checkJs）を実行し、型エラーをゼロにする
- [ ] T083 ユニットテストのカバレッジを測定し、80%以上を確保
- [ ] T084 [P] パフォーマンステストを実行（Lighthouse: Performance 95+, TTI < 1秒）
- [ ] T085 [P] アクセシビリティテストを実行（Lighthouse: Accessibility 95+, WCAG 2.1 Level AA）
- [ ] T086 [P] クロスブラウザテスト（Playwright: Chromium, Firefox, WebKit）
- [ ] T087 バンドルサイズを測定し、50KB以下（gzip後）を確認
- [ ] T088 [P] メモリリークチェック（Chrome DevTools Performance Monitor）
- [ ] T089 [P] README.md を更新（機能説明、スクリーンショット、使用方法）
- [ ] T090 [P] quickstart.md の検証（手順通りにセットアップできることを確認）
- [ ] T091 [P] CHANGELOG.md を作成（バージョン1.0.0の変更内容）
- [ ] T092 コードレビューを実施（憲法原則への準拠確認）
- [ ] T093 GitHub Pages デプロイテスト（本番環境でスモークテスト）

**Checkpoint**: すべての品質基準を満たし、本番デプロイ準備完了

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし - 即座に開始可能
- **Foundational (Phase 2)**: Phase 1 完了後 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3-5)**: Phase 2 完了後
  - 並列実行可能（チーム人数に応じて）
  - または優先順位順に実行（P1 → P2 → P3）
- **PWA (Phase 6)**: User Story 1 完了後に開始可能（MVP後の追加機能）
- **Polish (Phase 7)**: 希望するすべてのユーザーストーリー完了後

### User Story Dependencies

- **User Story 1 (P1)**: Phase 2 完了後に開始 - 他のストーリーに依存なし（MVP）
- **User Story 2 (P2)**: Phase 2 完了後に開始 - User Story 1 と独立してテスト可能
- **User Story 3 (P3)**: Phase 2 完了後に開始 - User Story 1, 2 と独立してテスト可能

### Within Each User Story

1. **テスト（TDD）**: 実装前に書き、失敗することを確認
2. **モデル**: サービスより先に実装
3. **サービス**: UIコンポーネントより先に実装
4. **UIコンポーネント**: サービス完了後
5. **統合**: コア実装完了後
6. **検証**: ストーリー完了後、次の優先度に進む前

### Parallel Opportunities

#### Setup (Phase 1)
```bash
# [P]マークのあるタスクを並列実行可能
T002, T003, T004, T005, T006, T007, T008, T009, T010, T012
```

#### Foundational (Phase 2)
```bash
# モデル定義（並列可能）
T013, T014, T015

# スタイルシート（並列可能）
T019, T020

# StorageService実装とそのテスト（順次）
T016 → T017
```

#### User Story 1 Tests（並列可能）
```bash
T021, T022, T023, T024
```

#### User Story 1 Implementation（一部並列可能）
```bash
# コアロジック（順次）
T025 → T026 → T027 → T028 → T029

# UIコンポーネント（並列可能、ただしT025完了後）
T030, T032, T034

# スタイル（並列可能）
T038, T039, T040
```

#### User Story 2 Tests（並列可能）
```bash
T043, T044, T045, T046
```

#### User Story 3 Tests（並列可能）
```bash
T054, T055, T056, T057
```

#### User Story 3 Implementation（一部並列可能）
```bash
# AudioService（並列可能）
T058, T059, T060

# TimerService拡張（順次）
T061 → T062 → T063 → T064

# SettingsPanel拡張（並列可能）
T065, T066, T067
```

#### PWA (Phase 6)
```bash
# Service Worker関連（並列可能）
T073, T074, T076, T078
```

#### Polish (Phase 7)
```bash
# ドキュメント・テスト（並列可能）
T079, T080, T081, T082, T084, T085, T086, T088, T089, T090, T091
```

---

## Parallel Example: User Story 1

```bash
# ステップ1: テストを並列作成（TDDの赤）
Task: "TimerService の契約テストを tests/unit/TimerService.test.js に作成"
Task: "TimerService のイベントテストを tests/unit/TimerService.test.js に追加"
Task: "TimerDisplay の統合テストを tests/integration/TimerFlow.test.js に作成"
Task: "E2Eテスト（基本操作フロー）を tests/e2e/userJourney.spec.js に作成"

# ステップ2: コアロジックを実装（TDDの緑）
Task: "TimerService クラスを js/services/TimerService.js に実装"
Task: "TimerService に tick イベントロジックを実装"
Task: "TimerService に complete イベントロジックを実装"
# ... 順次実行

# ステップ3: UIコンポーネントを並列実装（コアロジック完了後）
Task: "TimerDisplay コンポーネントを js/ui/TimerDisplay.js に実装"
Task: "ControlPanel コンポーネントを js/ui/ControlPanel.js に実装"
Task: "SettingsPanel コンポーネントを js/ui/SettingsPanel.js に実装"

# ステップ4: スタイルを並列実装
Task: "css/main.css にタイマー表示スタイルを追加"
Task: "css/main.css にボタンスタイルを追加"
Task: "css/responsive.css にiPad縦横対応を追加"
```

---

## Implementation Strategy

### MVP First (User Story 1 のみ)

1. **Phase 1: Setup** を完了
2. **Phase 2: Foundational** を完了（CRITICAL - すべてをブロック）
3. **Phase 3: User Story 1** を完了
4. **STOP and VALIDATE**: User Story 1を独立してテスト
5. デプロイ/デモの準備完了（基本的なタイマー機能として使用可能）

### Incremental Delivery（段階的デリバリー）

1. Setup + Foundational 完了 → 基盤準備完了
2. User Story 1 追加 → 独立テスト → デプロイ/デモ（MVP!）
3. User Story 2 追加 → 独立テスト → デプロイ/デモ（マイナス表示機能追加）
4. User Story 3 追加 → 独立テスト → デプロイ/デモ（アラート機能追加）
5. PWA対応 → オフライン機能追加
6. 各ストーリーが独立して価値を追加し、前のストーリーを壊さない

### Parallel Team Strategy（並列チーム戦略）

複数の開発者がいる場合:

1. チーム全体で Setup + Foundational を完了
2. Foundational 完了後:
   - 開発者A: User Story 1
   - 開発者B: User Story 2
   - 開発者C: User Story 3
3. 各ストーリーが独立して完成し、統合される

---

## Notes

- **[P]タスク** = 異なるファイル、依存関係なし、並列実行可能
- **[Story]ラベル** = タスクを特定のユーザーストーリーにマッピング（トレーサビリティ）
- 各ユーザーストーリーは独立して完成可能・テスト可能
- **TDD厳守**: テストが失敗することを確認してから実装
- 各タスクまたは論理的なグループ後にコミット
- 任意のチェックポイントで停止し、ストーリーを独立して検証
- **避けるべきこと**: 曖昧なタスク、同じファイルの競合、ストーリー間の独立性を壊す依存関係

---

## Task Summary

- **総タスク数**: 93タスク
- **Setup (Phase 1)**: 12タスク
- **Foundational (Phase 2)**: 8タスク
- **User Story 1 (Phase 3)**: 22タスク（テスト4 + 実装18）
- **User Story 2 (Phase 4)**: 11タスク（テスト4 + 実装7）
- **User Story 3 (Phase 5)**: 19タスク（テスト4 + 実装15）
- **PWA (Phase 6)**: 6タスク
- **Polish (Phase 7)**: 15タスク

**並列実行可能タスク**: 約45タスク（[P]マーク付き）

**MVP範囲**: Phase 1 + Phase 2 + Phase 3（User Story 1のみ） = 42タスク

**推奨実装順序**:
1. MVP（User Story 1）で基本機能を完成させる
2. User Story 2でマイナス表示を追加（独立して価値を提供）
3. User Story 3でアラート機能を追加（独立して価値を提供）
4. PWA対応でオフライン機能を追加
5. Polishですべての品質基準を満たす
