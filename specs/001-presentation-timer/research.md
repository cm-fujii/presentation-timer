# Research & Technical Decisions: プレゼンテーション・タイマー

**Feature**: 001-presentation-timer
**Date**: 2025-10-16
**Status**: Completed

## Overview

このドキュメントは、プレゼンテーション・タイマーの実装における技術選択の調査結果と決定の根拠をまとめたものです。

## Core Technology Stack

### Decision 1: バニラJavaScript（フレームワークなし）

**選択**: HTML5 + CSS3 + Vanilla JavaScript (ES2022)

**理由**:
1. **軽量性**: React/Vue/Angularなどのフレームワークは不要。単一画面のシンプルなUIにはオーバースペック
2. **パフォーマンス**: バンドルサイズを最小化（目標50KB以下）、TTI 1秒以内を容易に達成
3. **GitHub Pages互換性**: ビルドプロセス不要、静的ファイルを直接デプロイ可能
4. **学習曲線**: フレームワーク固有の知識不要、標準Web技術のみで完結
5. **長期保守性**: フレームワークのバージョンアップや破壊的変更の影響を受けない

**検討した代替案**:

| フレームワーク | 利点 | 却下理由 |
|--------------|------|---------|
| React | コンポーネント再利用、豊富なエコシステム | 40KB以上のバンドルサイズ、単一画面アプリには過剰 |
| Vue 3 | 軽量（約20KB）、学習容易 | 依然としてオーバーヘッドあり、素のJSで十分 |
| Svelte | コンパイル時最適化、非常に軽量 | ビルドプロセス必要、GitHub Pages直接デプロイが複雑化 |
| Alpine.js | 超軽量（15KB）、HTML中心 | 依存関係を追加する必要性がない |

**参考資料**:
- [You Might Not Need a Framework](https://youmightnotneedaframework.com/)
- [The Cost of JavaScript Frameworks](https://timkadlec.com/remembers/2020-04-21-the-cost-of-javascript-frameworks/)

---

### Decision 2: ES Modules for Code Organization

**選択**: ブラウザネイティブのES Modules（`type="module"`）

**理由**:
1. **標準化**: すべてのモダンブラウザでサポート（iPad Safari iOS 15+含む）
2. **ビルド不要**: Webpack/Rollup/Viteなどのバンドラー不要
3. **モジュール分割**: 責任分離を維持しながら、自然なコード構造を実現
4. **Tree Shaking**: 未使用コードの自動除外（ブラウザレベル）
5. **開発体験**: import/exportの直感的な構文

**実装例**:
```javascript
// app.js
import { TimerService } from './services/TimerService.js';
import { TimerDisplay } from './ui/TimerDisplay.js';

const timerService = new TimerService();
const display = new TimerDisplay(timerService);
```

**検討した代替案**:

| アプローチ | 利点 | 却下理由 |
|----------|------|---------|
| 単一ファイル | 最もシンプル | 500行以上のコードでメンテナンス困難 |
| IIFE（即時関数） | ES5互換 | モダンブラウザのみ対象、古い手法 |
| Webpack/Vite | 最適化、ホットリロード | ビルドプロセス追加、複雑性増加 |

**参考資料**:
- [MDN: JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Can I Use: ES6 Modules](https://caniuse.com/es6-module)

---

### Decision 3: localStorage for Persistence

**選択**: Web Storage API (localStorage)

**理由**:
1. **シンプルさ**: 同期APIで扱いやすい
2. **永続性**: ブラウザを閉じても設定が保持される
3. **十分な容量**: タイマー設定（数KB）には5-10MBで十分
4. **広範なサポート**: すべてのブラウザで利用可能
5. **サーバー不要**: 完全クライアントサイドで完結

**保存データ**:
- タイマー初期設定時間（分・秒）
- アラートポイントのリスト（例: [60, 0] = 1分前と0秒）
- ユーザー設定（音量、テーマなど、将来拡張）

**実装例**:
```javascript
// StorageService.js
export class StorageService {
  static KEYS = {
    TIMER_DURATION: 'presentation-timer.duration',
    ALERT_POINTS: 'presentation-timer.alerts'
  };

  saveTimerDuration(minutes, seconds) {
    const data = { minutes, seconds };
    localStorage.setItem(StorageService.KEYS.TIMER_DURATION, JSON.stringify(data));
  }

  loadTimerDuration() {
    const data = localStorage.getItem(StorageService.KEYS.TIMER_DURATION);
    return data ? JSON.parse(data) : { minutes: 10, seconds: 0 }; // デフォルト
  }
}
```

**検討した代替案**:

| ストレージ | 利点 | 却下理由 |
|----------|------|---------|
| IndexedDB | 大容量、非同期 | タイマー設定には過剰、複雑性増加 |
| Cookie | サーバー送信可能 | 容量制限（4KB）、サーバー不要のため不適 |
| sessionStorage | 同一タブ内持続 | ブラウザ再起動で消失、UXが悪化 |
| なし（メモリのみ） | 最もシンプル | リロードで設定消失、ユーザビリティ低下 |

**参考資料**:
- [MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

---

### Decision 4: Testing Strategy - Vitest + Playwright

**選択**: Vitest（ユニット・インテグレーション） + Playwright（E2E）

**理由**:

#### Vitest
1. **高速**: Viteベースで並列実行、HMR対応
2. **Jest互換**: Jest APIと互換性あり、移行容易
3. **ES Modules対応**: ネイティブサポート
4. **TypeScript不要**: JSDocで型チェック可能
5. **軽量**: 最小限の設定で動作

#### Playwright
1. **クロスブラウザ**: Chromium, Firefox, WebKit（Safari）すべてテスト可能
2. **iPad Safari対応**: WebKitエンジンでiPad Safariの挙動を再現
3. **自動待機**: 要素が表示されるまで自動で待機
4. **信頼性**: フレーク（不安定）テストが少ない
5. **デバッグ**: トレースビューアで詳細な実行記録

**テスト構成**:

```
tests/
├── unit/                      # ビジネスロジックのユニットテスト
│   ├── TimerService.test.js  # タイマー計算、状態遷移
│   ├── StorageService.test.js # localStorage操作
│   └── AudioService.test.js   # 音声再生ロジック
├── integration/               # モジュール間統合テスト
│   └── TimerFlow.test.js     # UI ↔ Service間の連携
└── e2e/                       # エンドツーエンドテスト
    └── userJourney.spec.js   # 実際のユーザーフロー
```

**検討した代替案**:

| ツール | 利点 | 却下理由 |
|-------|------|---------|
| Jest + Puppeteer | 人気、豊富な資料 | Vitestのほうが高速、Puppeteerはフレーク多い |
| Mocha + Chai | 柔軟性高い | 設定が複雑、Vitestのほうがモダン |
| Cypress | DX優秀、デバッグ容易 | WebKit未対応（iPad Safariテスト不可） |
| Testing Library単体 | React等で標準 | E2Eテスト不可、Playwrightと組み合わせ可能 |

**参考資料**:
- [Vitest Documentation](https://vitest.dev/)
- [Playwright for Web Testing](https://playwright.dev/)

---

### Decision 5: Web Audio API for Alerts

**選択**: Web Audio API + HTMLAudioElement

**理由**:
1. **低レイテンシ**: Web Audio APIはリアルタイム再生に最適
2. **制御性**: 音量、再生タイミングを細かく制御可能
3. **互換性**: iPad Safariを含むすべてのモダンブラウザでサポート
4. **ユーザーインタラクション要件対応**: Safariの自動再生ポリシーに準拠

**実装アプローチ**:
- デフォルト音源: 同梱のMP3ファイル（軽量、数KB）
- フォールバック: HTMLAudioElement（古いブラウザ対応）
- ユーザー設定: カスタム音源アップロード対応（将来拡張）

**Safari制約への対応**:
- 初回ユーザーインタラクション時にAudioContextを初期化
- `resume()`メソッドでコンテキストをアクティブ化
- タイマー開始ボタン押下時に準備完了

**実装例**:
```javascript
// AudioService.js
export class AudioService {
  constructor() {
    this.audioContext = null;
    this.buffer = null;
  }

  async initialize() {
    // ユーザーインタラクション後に呼び出し
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const response = await fetch('/assets/sounds/alert.mp3');
    const arrayBuffer = await response.arrayBuffer();
    this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
  }

  play() {
    if (!this.audioContext || !this.buffer) return;
    const source = this.audioContext.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
  }
}
```

**検討した代替案**:

| アプローチ | 利点 | 却下理由 |
|----------|------|---------|
| HTMLAudioElement単体 | シンプル | レイテンシやや高い、Safari制約あり |
| Howler.js | 高機能ライブラリ | 依存関係追加、シンプルな用途には過剰 |
| Tone.js | 音楽制作向け高機能 | 80KB以上、完全にオーバースペック |
| システムビープ | 依存なし | ブラウザAPIで不可、UX劣る |

**参考資料**:
- [MDN: Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Safari Audio Autoplay Policy](https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/)

---

### Decision 6: Service Worker for Offline Support

**選択**: Service Worker + Cache API

**理由**:
1. **オフライン動作**: ネットワーク不要で完全動作
2. **PWA対応**: ホーム画面追加でネイティブアプリ風体験
3. **パフォーマンス**: 初回以降はキャッシュから即座にロード
4. **標準技術**: 追加ライブラリ不要

**キャッシュ戦略**: Cache-First
- HTML/CSS/JS: すべてキャッシュ
- 音声ファイル: キャッシュ
- 更新: バージョン番号でキャッシュ無効化

**実装例**:
```javascript
// sw.js
const CACHE_NAME = 'presentation-timer-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/assets/sounds/alert.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

**検討した代替案**:

| アプローチ | 利点 | 却下理由 |
|----------|------|---------|
| AppCache（廃止） | 古いブラウザ対応 | 廃止済み、使用不可 |
| Workbox | Googleの高機能SW | 依存追加、シンプルなキャッシュには過剰 |
| なし | 最もシンプル | オフライン対応できない、UX低下 |

**参考資料**:
- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Best Practices](https://web.dev/pwa/)

---

## Development Tools

### Linting & Formatting

**ESLint**: JavaScript静的解析
- 設定: `eslint:recommended` + カスタムルール
- 目的: バグ防止、コード品質向上

**Prettier**: コードフォーマッター
- 設定: デフォルト（セミコロンあり、シングルクォート）
- 目的: 一貫したコードスタイル

**JSDoc + TypeScript checkJs**:
- すべての関数に型注釈
- `@param`, `@returns`, `@type`でドキュメント兼型チェック

```javascript
/**
 * タイマーを指定秒数でカウントダウンします
 * @param {number} totalSeconds - 開始秒数
 * @param {function(number): void} onTick - 1秒ごとのコールバック
 * @param {function(): void} onComplete - 完了時のコールバック
 * @returns {function(): void} タイマー停止関数
 */
function startCountdown(totalSeconds, onTick, onComplete) {
  // 実装
}
```

---

## CI/CD Pipeline

### GitHub Actions

**テストワークフロー** (`.github/workflows/test.yml`):
- トリガー: PR作成、mainへのpush
- ステップ:
  1. Node.js 20セットアップ
  2. `npm ci` で依存インストール
  3. `npm run lint` でESLint実行
  4. `npm test` でVitestユニットテスト実行
  5. `npm run test:e2e` でPlaywright E2Eテスト実行
  6. カバレッジレポート生成（Codecov連携）

**デプロイワークフロー** (`.github/workflows/deploy.yml`):
- トリガー: mainブランチへのマージ
- ステップ:
  1. テストワークフロー成功確認
  2. GitHub Pagesへデプロイ
  3. 本番環境でスモークテスト実行

---

## Architecture Patterns

### Model-View-Service (MVS)

**採用理由**:
1. **責任分離**: データ（Model）、UI（View）、ロジック（Service）を分離
2. **テスト容易性**: 各層を独立してテスト可能
3. **軽量MVC**: フレームワーク不要の軽量実装

**構成**:

```
Models (データ構造)
  ↓
Services (ビジネスロジック)
  ↓
UI Components (表示・イベント処理)
```

**具体例**:
- `TimerState.js` (Model): タイマーの状態データ
- `TimerService.js` (Service): カウントダウンロジック、状態更新
- `TimerDisplay.js` (UI): DOM操作、ユーザーイベント処理

---

## Browser Compatibility

### Target Browsers

| ブラウザ | 最小バージョン | 理由 |
|---------|--------------|------|
| Safari (iOS) | 15.0+ | iPad対応、ES2022サポート |
| Chrome | 90+ | ES Modules、Web Audio API |
| Firefox | 88+ | 同上 |
| Edge | 90+ | Chromiumベース |

### Polyfill不要

すべての使用APIがターゲットブラウザでネイティブサポートされているため、polyfill不要:
- ES Modules
- Web Storage API
- Web Audio API
- Service Worker
- Fetch API

---

## Performance Budget

| メトリクス | 目標値 | 測定方法 |
|----------|-------|---------|
| バンドルサイズ（gzip後） | < 50KB | Lighthouse, webpack-bundle-analyzer |
| Time to Interactive (TTI) | < 1秒 | Lighthouse |
| First Contentful Paint (FCP) | < 0.5秒 | Lighthouse |
| タイマー精度 | ±1秒/10分 | E2Eテストで検証 |
| メモリ使用量 | < 10MB | Chrome DevTools Performance Monitor |

---

## Security Considerations

### Content Security Policy (CSP)

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self';
               style-src 'self' 'unsafe-inline';
               media-src 'self'">
```

- **script-src 'self'**: 同一オリジンのスクリプトのみ許可
- **style-src 'unsafe-inline'**: インラインスタイル許可（最小限）
- **media-src 'self'**: 音声ファイルは同一オリジンのみ

### データ保護

- **localStorage**: 機密情報なし（タイマー設定のみ）
- **外部通信なし**: すべてクライアント完結、データ漏洩リスクなし

---

## Accessibility (WCAG 2.1 Level AA)

### 実装計画

1. **キーボードナビゲーション**:
   - すべてのコントロールに`tabindex`設定
   - ショートカットキー（Space: 開始/停止、R: リセット）

2. **ARIAラベル**:
   - `role="timer"` for タイマー表示
   - `aria-live="polite"` for 状態変更通知
   - `aria-label` for すべてのボタン

3. **色のコントラスト**:
   - 通常表示: 黒/白背景で4.5:1以上
   - 赤色マイナス表示: #D32F2F（赤）/ 白背景で4.5:1確保

4. **スクリーンリーダー対応**:
   - 残り時間変更を音声通知
   - アラート発火時に視覚+音声で通知

---

## Summary

この調査に基づき、以下の技術スタックで実装を進めます:

- **コア**: バニラJavaScript (ES2022) + ES Modules
- **ストレージ**: localStorage
- **音声**: Web Audio API
- **オフライン**: Service Worker + Cache API
- **テスト**: Vitest + Playwright
- **品質**: ESLint + Prettier + JSDoc
- **CI/CD**: GitHub Actions → GitHub Pages

すべての選択は、軽量性・シンプルさ・保守性を最優先し、憲法の原則（品質・テスト・パフォーマンス・アクセシビリティ）に準拠しています。
