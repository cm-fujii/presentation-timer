# プレゼンテーション・タイマー

プレゼンテーション中に残り時間を大きく表示し、アラート音で知らせるタイムキーパーアプリ

## 特徴

- ⏱️ **大きく見やすい表示**: 3メートル離れた位置からでも明瞭に読み取れる大型タイマー表示
- ⏯️ **簡単操作**: 開始・一時停止・再開・リセットをワンタップで制御
- 🔴 **マイナス時間表示**: 予定時間超過を赤色で視覚的に表示（0秒以降も継続カウント）
- 🔔 **カスタマイズ可能なアラート**: 任意のタイミングで音声通知（Web Audio API使用）
  - 複数のアラートポイントを設定可能（例：1分前、30秒前、0秒）
  - 音量調整機能（0-100%）
  - アラートの有効/無効切り替え
- 📱 **PWAサポート**: ホーム画面への追加、オフライン動作、アプリライクな体験
- 📴 **完全オフライン対応**: Service Workerによるキャッシュ戦略（Cache-First）
- 📱 **iPad対応**: タッチフレンドリーなUI、縦横対応、全画面表示対応
- ♿ **アクセシビリティ**: WCAG 2.1 Level AA準拠、ARIAラベル、キーボードナビゲーション
- ⚡ **超高速**: バニラJavaScript、外部依存なし、TTI < 1秒

## クイックスタート

### 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/[username]/presentation-timer.git
cd presentation-timer

# ブランチを切り替え
git checkout 001-presentation-timer

# 依存関係をインストール
npm ci

# 開発サーバー起動
npm run dev
```

ブラウザで `http://localhost:5173` を開く

### 使い方

1. **時間設定**: 分・秒を入力してタイマー時間を設定
2. **開始**: 「Start」ボタンをクリックしてカウントダウン開始
3. **一時停止/再開**: 「Pause」ボタンで一時停止、「Resume」で再開
4. **リセット**: 「Reset」ボタンで初期時間に戻す
5. **アラート設定**: 設定パネルでアラートポイントをカスタマイズ

### テスト

```bash
# ユニットテスト
npm test

# カバレッジ付きテスト
npm run test:coverage

# E2Eテスト
npm run test:e2e

# すべてのチェック（lint + format + type + test）
npm run check-all
```

### ビルド & デプロイ

```bash
# プロダクションビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

GitHub Pagesへのデプロイは `main` ブランチへのマージ時に自動実行されます。

## プロジェクト構造

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
│   └── sounds/            # アラート音
├── tests/
│   ├── unit/              # ユニットテスト
│   ├── integration/       # 統合テスト
│   └── e2e/               # E2Eテスト
└── specs/                  # 設計ドキュメント
```

## 技術スタック

- **言語**: JavaScript (ES2022) - バニラJS、フレームワークなし
- **モジュール**: ES Modules (ブラウザネイティブ)
- **ストレージ**: localStorage
- **音声**: Web Audio API
- **オフライン**: Service Worker + Cache API
- **テスト**: Vitest (ユニット・統合) + Playwright (E2E)
- **品質**: ESLint + Prettier + JSDoc + TypeScript checkJs

## 開発ワークフロー

このプロジェクトは **TDD（テスト駆動開発）** を採用しています：

1. **赤**: テストを先に書き、失敗することを確認
2. **緑**: 最小限の実装でテストをパス
3. **リファクタリング**: コードを改善

詳細は [quickstart.md](specs/001-presentation-timer/quickstart.md) を参照してください。

## ブラウザ対応

- Chrome 90+
- Firefox 88+
- Safari 15+ (iPad Safari含む)
- Edge 90+

## ライセンス

MIT License

## コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ドキュメント

- [仕様書](specs/001-presentation-timer/spec.md)
- [実装計画](specs/001-presentation-timer/plan.md)
- [技術調査](specs/001-presentation-timer/research.md)
- [データモデル](specs/001-presentation-timer/data-model.md)
- [API契約](specs/001-presentation-timer/contracts/api.md)
- [タスクリスト](specs/001-presentation-timer/tasks.md)

## サポート

問題が発生した場合は、[Issues](https://github.com/[username]/presentation-timer/issues) で報告してください。
