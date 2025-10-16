# Quickstart Guide: プレゼンテーション・タイマー

**Feature**: 001-presentation-timer
**Date**: 2025-10-16
**Status**: Ready for Development

## Overview

このガイドでは、プレゼンテーション・タイマーの開発環境セットアップから、ローカル実行、テスト、デプロイまでの手順を説明します。

---

## Prerequisites

### Required

- **Node.js**: 20.x 以上（LTS推奨）
- **npm**: 10.x 以上（Node.jsに同梱）
- **Git**: 2.x 以上
- **モダンブラウザ**: Chrome 90+, Firefox 88+, Safari 15+

### Recommended

- **VS Code**: エディタ（ESLint/Prettier拡張機能推奨）
- **GitHub CLI**: `gh`コマンド（PR作成用）

---

## Quick Setup (5分で開始)

```bash
# 1. リポジトリをクローン
git clone https://github.com/[username]/presentation-timer.git
cd presentation-timer

# 2. ブランチを切り替え（開発中の場合）
git checkout 001-presentation-timer

# 3. 依存関係をインストール
npm ci

# 4. 開発サーバー起動
npm run dev

# 5. ブラウザで開く
# 自動的に http://localhost:5173 が開きます
```

**注**: 初回セットアップでは、音声ファイル（`assets/sounds/alert.mp3`）を配置する必要があります。

---

## Project Structure

```
presentation-timer/
├── index.html              # エントリポイント
├── css/
│   ├── main.css           # メインスタイル
│   └── responsive.css     # レスポンシブデザイン
├── js/
│   ├── models/            # データモデル
│   ├── services/          # ビジネスロジック
│   ├── ui/                # UIコンポーネント
│   └── app.js             # アプリケーション初期化
├── assets/
│   └── sounds/
│       └── alert.mp3      # アラート音
├── tests/
│   ├── unit/              # ユニットテスト
│   ├── integration/       # 統合テスト
│   └── e2e/               # E2Eテスト
├── specs/                  # 仕様書（このディレクトリ）
├── package.json
├── vitest.config.js       # Vitest設定
└── playwright.config.js   # Playwright設定
```

---

## Development Workflow

### 1. Local Development

```bash
# 開発サーバー起動（ホットリロード有効）
npm run dev

# 別ターミナルでテストを自動実行（ウォッチモード）
npm run test:watch
```

**開発サーバー**:
- URL: `http://localhost:5173`
- ファイル変更時に自動リロード
- ES Modulesをネイティブサポート

---

### 2. Code Quality Checks

```bash
# ESLintでコードをチェック
npm run lint

# Prettierでフォーマット
npm run format

# 型チェック（JSDoc + TypeScript checkJs）
npm run type-check

# すべてのチェックを一括実行
npm run check-all
```

**Pre-commit Hook**:
Git commitの前に自動的に以下が実行されます:
- ESLint
- Prettier
- 変更ファイルのユニットテスト

---

### 3. Testing

#### ユニットテスト

```bash
# すべてのユニットテストを実行
npm test

# ウォッチモード（ファイル変更時に自動実行）
npm run test:watch

# カバレッジレポート生成
npm run test:coverage
```

**カバレッジ目標**: 80%以上

#### インテグレーションテスト

```bash
# 統合テストを実行
npm run test:integration
```

#### E2Eテスト

```bash
# Playwright E2Eテストを実行
npm run test:e2e

# ヘッドレスモードで実行
npm run test:e2e:headless

# UIモードでデバッグ
npm run test:e2e:debug
```

**対象ブラウザ**: Chromium, Firefox, WebKit（Safari相当）

---

### 4. Building for Production

```bash
# プロダクションビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

**ビルド成果物**: `dist/`ディレクトリ（GitHub Pagesデプロイ用）

**最適化**:
- HTMLミニファイ
- CSSミニファイ
- JSモジュールの結合
- gzip圧縮（50KB以下目標）

---

## TDD Workflow（推奨）

プロジェクト憲法に従い、テスト駆動開発で進めます。

### Step 1: テストを先に書く（Red）

```bash
# 新しい機能のテストファイルを作成
touch tests/unit/NewFeature.test.js
```

```javascript
// tests/unit/NewFeature.test.js
import { describe, it, expect } from 'vitest';
import { NewFeature } from '../../js/services/NewFeature.js';

describe('NewFeature', () => {
  it('should do something', () => {
    const feature = new NewFeature();
    expect(feature.doSomething()).toBe(expected);
  });
});
```

**テストを実行して失敗を確認**:
```bash
npm test NewFeature.test.js
# ❌ FAIL (期待通り)
```

---

### Step 2: 実装（Green）

```javascript
// js/services/NewFeature.js
export class NewFeature {
  doSomething() {
    // 最小限の実装でテストをパス
    return expected;
  }
}
```

**テストを実行して成功を確認**:
```bash
npm test NewFeature.test.js
# ✅ PASS
```

---

### Step 3: リファクタリング

```javascript
// より良い実装に改善
export class NewFeature {
  doSomething() {
    // リファクタリング後のコード
    return this.calculateResult();
  }

  calculateResult() {
    // 抽出したロジック
    return expected;
  }
}
```

**テストが引き続きパスすることを確認**:
```bash
npm test NewFeature.test.js
# ✅ PASS
```

---

## Git Workflow

### Branch Management

```bash
# 機能ブランチで作業
git checkout 001-presentation-timer

# 作業を小さくコミット（Conventional Commits形式）
git add .
git commit -m "feat(timer): add countdown logic"

# リモートにプッシュ
git push origin 001-presentation-timer
```

**Conventional Commits形式**:
- `feat(scope): description` - 新機能
- `fix(scope): description` - バグ修正
- `test(scope): description` - テスト追加
- `docs(scope): description` - ドキュメント
- `refactor(scope): description` - リファクタリング

---

### Pull Request

```bash
# GitHub CLIでPR作成
gh pr create --title "001: プレゼンテーション・タイマー" \
             --body "$(cat specs/001-presentation-timer/plan.md)"

# またはブラウザで作成
# https://github.com/[username]/presentation-timer/compare/main...001-presentation-timer
```

**PRチェックリスト**:
- [ ] すべてのテストがパス
- [ ] コードカバレッジ80%以上
- [ ] ESLint/Prettier通過
- [ ] 憲法チェック合格
- [ ] ドキュメント更新済み

---

## Deployment

### GitHub Pages Setup

```bash
# 1. GitHub Pagesを有効化
# Settings > Pages > Source: "GitHub Actions" を選択

# 2. デプロイワークフローは自動実行
# .github/workflows/deploy.yml が main へのマージ時に起動

# 3. デプロイ完了後、以下のURLで確認
# https://[username].github.io/presentation-timer/
```

**自動デプロイフロー**:
1. `main`ブランチへのマージ検知
2. テスト実行（すべてパス必須）
3. プロダクションビルド
4. GitHub Pagesへデプロイ
5. スモークテスト実行

---

## Troubleshooting

### 問題: `npm ci` が失敗する

**解決策**:
```bash
# package-lock.json を削除して再生成
rm package-lock.json
npm install
```

---

### 問題: 開発サーバーが起動しない

**解決策**:
```bash
# ポート5173が使用中の場合、別のポートを指定
npm run dev -- --port 3000
```

---

### 問題: Safari でアラート音が鳴らない

**原因**: Safari の自動再生ポリシー

**解決策**:
- `AudioService.initialize()` がユーザーインタラクション後に呼ばれていることを確認
- タイマー開始ボタンのクリックイベントで初期化

```javascript
document.getElementById('start-btn').addEventListener('click', async () => {
  await audioService.initialize();
  timer.start();
});
```

---

### 問題: テストが失敗する（Playwright）

**解決策**:
```bash
# ブラウザドライバーを再インストール
npx playwright install
```

---

### 問題: localStorage が保存されない

**原因**: プライベートブラウジングモード

**解決策**:
- 通常モードで開く
- またはテスト時は `sessionStorage` にフォールバック

---

## Performance Monitoring

### Lighthouse スコア目標

```bash
# Lighthouseで計測
npm run lighthouse
```

**目標スコア**:
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

**主要メトリクス**:
- First Contentful Paint (FCP): < 0.5秒
- Time to Interactive (TTI): < 1秒
- Total Blocking Time (TBT): < 100ms

---

## Accessibility Testing

```bash
# axe-coreで自動アクセシビリティチェック
npm run test:a11y
```

**手動チェック項目**:
1. キーボードナビゲーション（Tab/Shift+Tab）
2. スクリーンリーダー（VoiceOver/NVDA）
3. 色のコントラスト比（4.5:1以上）
4. フォーカス表示の明確性

---

## Useful Commands Cheat Sheet

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm test` | ユニットテスト実行 |
| `npm run test:e2e` | E2Eテスト実行 |
| `npm run lint` | ESLintチェック |
| `npm run format` | コードフォーマット |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルド結果プレビュー |
| `npm run check-all` | すべてのチェック実行 |

---

## Next Steps

1. **Phase 2: タスク生成**
   ```bash
   # /speckit.tasks コマンドで実装タスクを生成
   ```

2. **実装開始**
   - `tasks.md` の優先順位に従って実装
   - TDDワークフロー（赤→緑→リファクタリング）を厳守

3. **継続的改善**
   - コードレビュー
   - パフォーマンス最適化
   - アクセシビリティ改善

---

## Resources

- **仕様書**: `specs/001-presentation-timer/spec.md`
- **技術調査**: `specs/001-presentation-timer/research.md`
- **データモデル**: `specs/001-presentation-timer/data-model.md`
- **API契約**: `specs/001-presentation-timer/contracts/api.md`
- **憲法**: `.specify/memory/constitution.md`

---

## Support

問題が発生した場合:
1. このドキュメントのTroubleshootingセクションを確認
2. GitHubのIssuesで検索
3. 新しいIssueを作成（テンプレート使用）

Happy Coding! 🚀
