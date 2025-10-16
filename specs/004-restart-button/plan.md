# Implementation Plan: Restart Button

**Branch**: `004-restart-button` | **Date**: 2025-10-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-restart-button/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Restartボタンは、プレゼンテーション中にタイマーを1回のクリックでリセット+開始できる新機能です。従来のReset→Startの2ステップ操作を1クリックに統合することで、プレゼンターの操作効率を50%向上させ、聴衆の注意を逸らさずに次のセッションへスムーズに移行できます。

**技術アプローチ**: 既存のControlPanelコンポーネントに新しいRestartボタンを追加し、TimerServiceの既存reset()とstart()メソッドを組み合わせた新しいrestart()メソッドを実装します。ボタンの状態管理は既存のパターンに従い、TDD（Test-Driven Development）で開発します。

## Technical Context

**Language/Version**: JavaScript (ES2022) - バニラJavaScript、フレームワークなし
**Primary Dependencies**:

- Vite 5.0 (開発サーバー・ビルドツール)
- Vitest 1.0 (ユニットテスト・インテグレーションテスト)
- Playwright 1.40 (E2Eテスト)
- ESLint 8.55 (リンティング)
- Prettier 3.1 (フォーマット)

**Storage**: localStorage（タイマー設定とアラート設定の永続化）
**Testing**: Vitest (ユニット・インテグレーション), Playwright (E2E)
**Target Platform**: モダンブラウザ（Chrome, Firefox, Safari, Edge）+ PWA対応
**Project Type**: single (バニラJavaScript PWA)
**Performance Goals**:

- ボタンクリックから新しいカウントダウン開始まで0.5秒以内
- 60fps のスムーズなUI更新
- 初期ページロード3秒以内

**Constraints**:

- フレームワークなし（バニラJavaScript）
- 外部ライブラリ不使用（完全に自己完結型）
- PWA要件（オフライン動作、レスポンシブデザイン）
- アクセシビリティ基準（WCAG 2.1 Level AA）

**Scale/Scope**:

- 小規模プロジェクト（単一HTMLページ）
- 5つのUIコンポーネント（TimerDisplay, ControlPanel, SettingsPanel等）
- 既存ボタン4つ + 新規Restartボタン1つ

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. コード品質第一 ✓ PASS

- ✓ 型安全性: JSDocによる型注釈（既存プロジェクトパターン）
- ✓ リンティング: ESLint 8.55で厳格なルール適用
- ✓ フォーマッティング: Prettier 3.1で自動フォーマット
- ✓ 命名規則: 既存の明確な命名パターンに従う（\_createButton, onRestart等）
- ✓ DRY原則: 既存のボタン作成ロジックを再利用
- ✓ 単一責任原則: Restartボタンは既存パターンに従う

### II. テスト駆動開発（非交渉事項） ✓ PASS

**TDDワークフロー**:

1. ✓ Restartボタンのユニットテスト作成（ControlPanel.test.js拡張）
2. ✓ TimerService.restart()のユニットテスト作成
3. ✓ インテグレーションテスト作成（TimerFlow.test.js拡張）
4. ✓ E2Eテスト作成（Playwright）
5. ✓ すべてのテストが失敗することを確認（赤）
6. ✓ 最小限の実装でテストを通過（緑）
7. ✓ リファクタリング

**テストカバレッジ要件**:

- ✓ ユニットテスト: ControlPanel.render(), updateButtonStates(), TimerService.restart()
- ✓ インテグレーションテスト: Restartボタンクリック→タイマーリセット+開始フロー
- ✓ E2Eテスト: idle/running/paused各状態からのRestartシナリオ
- ✓ エッジケース: 連続クリック、マイナス時間、レンダリング前呼び出し
- ✓ 80%カバレッジ閾値維持

### III. ユーザー体験の一貫性 ✓ PASS

- ✓ 統一デザイン言語: 既存のbtn, btn--warningクラス使用
- ✓ 予測可能なインタラクション: Start/Pause/Resume/Resetと同じパターン
- ✓ アクセシビリティ: aria-label="タイマーをリセットして開始", キーボード操作対応
- ✓ レスポンシブデザイン: 既存CSSグリッドシステム利用
- ✓ ローディング状態: 既存のタイマー状態管理に統合
- ✓ キーボードナビゲーション: Tabキーでフォーカス、Enter/Spaceで実行

### IV. パフォーマンス基準 ✓ PASS

- ✓ Restartボタンクリックから開始まで0.5秒以内（仕様要件）
- ✓ スムーズなアニメーション: 60fps維持（既存CSS transitionsに統合）
- ✓ バンドルサイズ: 新規コード最小限（約50行のJavaScript追加）
- ✓ メモリリーク: 適切なイベントリスナー管理（既存パターン踏襲）

### V. ドキュメンテーション卓越性 ✓ PASS

- ✓ JSDoc: すべての新規メソッドにドキュメント化
- ✓ README更新: 新しいRestartボタン機能を追加
- ✓ 使用例: JSDocに@exampleセクション追加
- ✓ コードレビュー: PRで同時にドキュメント更新

**Gate Result (Pre-Phase 0)**: ✅ **ALL GATES PASSED** - Phase 0研究に進む準備完了

---

## Constitution Re-Check (Post-Phase 1)

_Required: Re-evaluate gates after Phase 1 design completion_

### I. コード品質第一 ✓ PASS (Confirmed)

**Phase 1 Validation**:

- ✓ data-model.md: 既存モデルの再利用、新規モデル不要
- ✓ JSDocパターン確認済み（research.md: アクセシビリティセクション）
- ✓ DRY原則検証: 既存の\_createButton()メソッド再利用（research.md: ボタン配置パターン）
- ✓ 命名規則: \_restartButton, onRestart（既存パターンと一貫）

**Conclusion**: コード品質基準に完全準拠

---

### II. テスト駆動開発（非交渉事項） ✓ PASS (Confirmed)

**Phase 1 Validation**:

- ✓ テスト戦略文書化済み（research.md: Testing Strategy）
- ✓ ユニット/インテグレーション/E2Eの3層構造確認
- ✓ TDDワークフロー明確化（plan.md: Section II）
- ✓ 80%カバレッジ閾値維持計画

**Test Coverage Plan**:

```
Unit Tests:
  - ControlPanel.render() with restart button
  - ControlPanel.updateButtonStates() for restart
  - TimerService.restart() method

Integration Tests:
  - Restart button click → timer reset + start flow

E2E Tests:
  - Restart from idle/running/paused states
  - Accessibility validation
  - Visual feedback verification
```

**Conclusion**: TDD要件に完全準拠

---

### III. ユーザー体験の一貫性 ✓ PASS (Confirmed)

**Phase 1 Validation**:

- ✓ デザイン言語: btn--warningクラス使用（research.md: CSSスタイリング）
- ✓ アクセシビリティ: aria-label, キーボード操作（research.md: セクション4）
- ✓ インタラクションパターン: 既存ボタンと統一（quickstart.md: FAQ Q2）
- ✓ エラーメッセージ: console.error for defensive programming（research.md: エッジケース）

**UX Documentation**:

- quickstart.md: 5分でRestartボタンを使う
- FAQ: 7つの一般的な質問と回答
- トラブルシューティングガイド

**Conclusion**: UX一貫性基準に完全準拠

---

### IV. パフォーマンス基準 ✓ PASS (Confirmed)

**Phase 1 Validation**:

- ✓ 0.5秒要件: restart()はreset()+start()で数ミリ秒（research.md: セクション3）
- ✓ バンドルサイズ: 約50行のJavaScript追加（plan.md: Technical Context）
- ✓ メモリリーク防止: 既存イベントリスナーパターン踏襲
- ✓ 最適化戦略: 測定後に最適化（research.md: Performance Optimization）

**Performance Monitoring Plan**:

```javascript
// quickstart.md: カスタマイズ例
const startTime = Date.now();
timerService.restart();
const endTime = Date.now();
console.log(`Completed in ${endTime - startTime}ms`);
```

**Conclusion**: パフォーマンス基準に完全準拠

---

### V. ドキュメンテーション卓越性 ✓ PASS (Confirmed)

**Phase 1 Deliverables**:

1. ✓ research.md (6セクション、約2000行)
   - 設計判断の根拠
   - 代替案の評価
   - リスク評価
2. ✓ data-model.md (完全なモデル分析)
   - 既存モデルとの関係性
   - 状態遷移図
   - バリデーションルール
3. ✓ quickstart.md (包括的ユーザーガイド)
   - 5分クイックスタート
   - ユースケース別ガイド
   - FAQ (7項目)
   - トラブルシューティング
4. ✓ plan.md (この文書)
   - 技術コンテキスト
   - プロジェクト構造
   - 憲法チェック

**Documentation Coverage**:

- ユーザー向け: quickstart.md
- 開発者向け: research.md, data-model.md, plan.md
- ステークホルダー向け: spec.md (Phase 0から継続)

**Conclusion**: ドキュメンテーション基準に完全準拠

---

### Final Gate Assessment (Post-Phase 1)

| 原則                    | Pre-Phase 0 | Post-Phase 1 | 変更                 |
| ----------------------- | ----------- | ------------ | -------------------- |
| I. コード品質第一       | ✓ PASS      | ✓ PASS       | なし（設計で確認）   |
| II. テスト駆動開発      | ✓ PASS      | ✓ PASS       | テスト戦略文書化     |
| III. UX一貫性           | ✓ PASS      | ✓ PASS       | quickstart.md追加    |
| IV. パフォーマンス      | ✓ PASS      | ✓ PASS       | モニタリング計画追加 |
| V. ドキュメンテーション | ✓ PASS      | ✓ PASS       | 3ドキュメント追加    |

**Overall Result**: ✅ **ALL GATES PASSED (RE-CONFIRMED)** - Phase 2（タスク生成）へ進む準備完了

**No Violations**: 複雑性の正当化は不要

## Project Structure

### Documentation (this feature)

```
specs/004-restart-button/
├── spec.md              # Feature specification (/speckit.specify command output)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (below)
├── data-model.md        # Phase 1 output (below)
├── quickstart.md        # Phase 1 output (below)
├── contracts/           # Phase 1 output (N/A for this feature - UI only)
├── checklists/          # Validation checklists
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
# Single project structure (バニラJavaScript PWA)
/
├── index.html           # メインHTMLファイル
├── js/
│   ├── app.js           # アプリケーション初期化（変更不要）
│   ├── models/
│   │   ├── TimerState.js    # タイマー状態モデル（変更不要）
│   │   ├── TimerConfig.js   # タイマー設定モデル（変更不要）
│   │   ├── AlertConfig.js   # アラート設定モデル（変更不要）
│   │   └── SoundType.js     # 音種別モデル（変更不要）
│   ├── services/
│   │   ├── TimerService.js  # [MODIFY] restart()メソッド追加
│   │   ├── AudioService.js  # 音声サービス（変更不要）
│   │   └── StorageService.js # ストレージサービス（変更不要）
│   └── ui/
│       ├── ControlPanel.js  # [MODIFY] Restartボタン追加
│       ├── TimerDisplay.js  # タイマー表示（変更不要）
│       └── SettingsPanel.js # 設定パネル（変更不要）
├── css/
│   ├── main.css         # [MODIFY] Restartボタンスタイル追加（必要に応じて）
│   └── responsive.css   # レスポンシブデザイン（変更不要）
└── tests/
    ├── unit/
    │   ├── ControlPanel.test.js    # [MODIFY] Restartボタンテスト追加
    │   ├── TimerService.test.js    # [MODIFY] restart()テスト追加
    │   └── [existing test files]   # その他のユニットテスト（変更不要）
    ├── integration/
    │   └── TimerFlow.test.js       # [MODIFY] Restartフローテスト追加
    └── e2e/
        └── timer.spec.js           # [MODIFY] Restart E2Eテスト追加
```

**Structure Decision**: 既存の単一プロジェクト構造（バニラJavaScript PWA）を維持します。Restartボタン機能は以下の既存ファイルに小規模な変更を加えるのみです：

- `js/ui/ControlPanel.js`: Restartボタンの追加とイベントハンドラ
- `js/services/TimerService.js`: restart()メソッドの追加
- `tests/`: 各テストファイルへのテストケース追加

新しいファイルの作成は不要で、既存のアーキテクチャパターンに完全に統合されます。

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

**No violations detected** - すべての憲法原則に準拠しています。
