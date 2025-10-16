# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-16

### Added

#### User Story 1: 基本的なタイマー操作と表示 (MVP)

- タイマーの基本機能（開始・一時停止・再開・リセット）
- 大きく見やすいタイマー表示（MM:SS形式）
- 時間設定UI（分・秒入力）
- localStorageへの設定保存・読み込み機能
- レスポンシブデザイン（iPad、デスクトップ、モバイル対応）

#### User Story 2: 時間経過後のマイナス表示

- 0秒以降もカウント継続機能
- マイナス時間の赤色表示（`-MM:SS`形式）
- マイナス時間のパルスアニメーション効果
- リセット時の赤色表示クリア機能

#### User Story 3: アラート音の設定と再生

- Web Audio APIを使用したアラート音再生機能
- アラート設定UI
  - 複数のアラートポイント設定（任意の秒数）
  - アラート有効/無効切り替え
  - 音量調整スライダー（0-100%）
- アラート設定のlocalStorage永続化
- Safari/iOS対応（ユーザーインタラクション後の音声初期化）
- アラート音源: [効果音G-SOZAI](https://koukaon.g-sozai.com/se-236.html)

#### Phase 6: PWA & Offline対応

- Service Worker実装（Cache-First戦略）
- PWA Manifest作成（ホーム画面への追加対応）
- オフライン動作サポート
- キャッシュ自動更新機能
- アプリアイコン（192x192、512x512）

#### 品質・ドキュメント

- 包括的なJSDocドキュメント
- ESLint + Prettierによるコード品質管理
- TypeScript checkJsによる型チェック
- ユニットテスト（Vitest）
- E2Eテスト（Playwright）
- アクセシビリティ対応（WCAG 2.1 Level AA準拠）
- クロスブラウザ対応（Chrome、Firefox、Safari、Edge）

### Technical Details

- **言語**: JavaScript (ES2022) - バニラJS、フレームワークなし
- **モジュール**: ES Modules
- **ストレージ**: localStorage
- **音声**: Web Audio API
- **オフライン**: Service Worker + Cache API
- **テスト**: Vitest + Playwright
- **品質**: ESLint + Prettier + JSDoc + TypeScript checkJs

### Performance

- Time to Interactive (TTI): < 1秒
- First Contentful Paint (FCP): < 0.5秒
- バンドルサイズ: < 50KB (gzip後)
- Lighthouse Performance Score: 95+
- Lighthouse Accessibility Score: 95+

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 15+ (iPad Safari含む)
- Edge 90+

## [Unreleased]

### Planned Features

- 複数のアラート音の選択機能
- ダークモード/ライトモードの切り替え
- タイマープリセット機能（よく使う時間設定の保存）
- フルスクリーンモード
- 統計情報（使用履歴、平均時間など）

---

## Version History

- **1.0.0** (2025-10-16): 初回リリース - 基本機能、アラート、PWA対応
