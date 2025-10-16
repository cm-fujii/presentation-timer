# Quickstart: Restart Button

**Feature**: 004-restart-button | **Date**: 2025-10-16
**Phase**: 1 - Design & Contracts

## 概要

Restartボタンは、タイマーを1クリックでリセット+開始できる新機能です。プレゼンテーション中に次のセッションへ素早く移行したい時に最適です。

## 5分でRestartボタンを使う

### 前提条件

- プレゼンテーションタイマーアプリが起動している
- タイマーが設定されている（デフォルト5分）

### ステップ1: タイマーを開始

1. **Startボタン**をクリック
2. タイマーがカウントダウンを開始

**結果**: タイマー表示が「05:00」から「04:59」へ減少していく

---

### ステップ2: Restartボタンを使用

**シナリオA: 実行中にRestart**

1. タイマーが「03:45」まで進んだ時点で**Restartボタン**をクリック
2. タイマーが即座に「05:00」にリセットされ、自動的にカウントダウンが再開

**結果**: 2クリック（Reset→Start）が1クリックで完了

**シナリオB: 一時停止後にRestart**

1. **Pauseボタン**をクリックしてタイマーを一時停止（例: 「02:30」で停止）
2. **Restartボタン**をクリック
3. タイマーが「05:00」にリセットされ、自動的にカウントダウンが再開

**結果**: 一時停止状態を経由せずに、即座に新しいカウントダウン開始

---

### ステップ3: idle状態でのRestartボタン

1. タイマーがidle状態（初期状態）の時、**Restartボタンは無効**（グレーアウト）
2. クリックしても何も起こらない

**理由**: タイマーが動いていない状態でRestartは意味がないため、誤操作を防止

---

## ユースケース別ガイド

### ユースケース1: 複数回のプレゼンテーションセッション

**状況**: 5分のプレゼンを3回繰り返す必要がある

**従来の操作**:

1. Startボタンクリック → 1回目のプレゼン
2. タイマー終了後、Resetボタンクリック
3. Startボタンクリック → 2回目のプレゼン
4. （繰り返し）

**合計クリック数**: 3回 × 2クリック（Reset + Start）= **6クリック**

**Restartボタンを使用**:

1. Startボタンクリック → 1回目のプレゼン
2. タイマー終了後、**Restartボタンクリック** → 2回目のプレゼン即開始
3. タイマー終了後、**Restartボタンクリック** → 3回目のプレゼン即開始

**合計クリック数**: 1クリック（最初のStart）+ 2クリック（Restart × 2）= **3クリック**

**効果**: **50%の操作削減**、聴衆の注意を逸らさない

---

### ユースケース2: プレゼン中の時間配分ミス

**状況**: 5分のプレゼンで、2分経過時点で「最初からやり直したい」と判断

**従来の操作**:

1. Pauseボタンクリック（タイマー停止）
2. Resetボタンクリック（リセット）
3. Startボタンクリック（再開始）

**合計**: **3クリック + 思考時間**

**Restartボタンを使用**:

1. **Restartボタンクリック**（実行中でもOK）

**合計**: **1クリック**

**効果**: 素早い再開始、プレゼンテーションの流れを維持

---

### ユースケース3: 練習セッション

**状況**: プレゼン練習で何度もタイマーをリセットして練習

**Restartボタンの利点**:

- 手元を見ずにワンクリックで再開始（ボタンが大きく配置されている）
- Pauseしてから考える必要なし（実行中からでもRestart可能）
- リズムを崩さずに連続練習

---

## キーボードショートカット

### Tabキーでフォーカス移動

1. **Tab**キーを複数回押してRestartボタンにフォーカス
2. フォーカスインジケーター（青い枠線）が表示される
3. **Enter**キーまたは**Space**キーでRestart実行

**アクセシビリティ**: スクリーンリーダーが「タイマーをリセットして開始」と読み上げ

---

## よくある質問（FAQ）

### Q1: Restartボタンがグレーアウトして押せない

**A**: タイマーがidle状態（初期状態）の場合、Restartボタンは無効です。まず**Startボタン**でタイマーを開始してから、Restartボタンが有効になります。

**解決策**:

1. Startボタンをクリックしてタイマーを開始
2. Restartボタンが青くなり、クリック可能になる

---

### Q2: ResetボタンとRestartボタンの違いは？

**A**:

| ボタン  | 動作                             | 次のアクション            |
| ------- | -------------------------------- | ------------------------- |
| Reset   | タイマーをリセット               | ユーザーがStartをクリック |
| Restart | タイマーをリセット**+ 自動開始** | 何もしない（自動開始）    |

**使い分け**:

- **Reset**: タイマーをリセットして、しばらく待ってから開始したい時
- **Restart**: タイマーをリセットして、即座に次のカウントダウンを開始したい時

---

### Q3: タイマー実行中にRestartを押すとどうなる?

**A**: 安全にリセット+再開始されます。

**詳細**:

1. 現在のタイマーが停止
2. 経過時間がクリア
3. アラートポイント発火履歴がリセット
4. 設定された初期時間（例: 5分）から新しいカウントダウン開始

**データ損失**: なし（設定は保存されている）

---

### Q4: 一時停止中にRestartを押すとどうなる?

**A**: 一時停止状態を無視して、リセット+開始されます。

**動作**:

- Pauseボタンが非表示になる
- タイマーが初期時間から再開始
- Resume状態を経由せずに、直接Running状態へ

---

### Q5: Restartボタンを連続で押すとどうなる?

**A**: 1回目のRestartが完了した後、2回目のRestartが実行されます。

**詳細**:

- 1回目のRestart: idle → running遷移
- 2回目のRestart: running → idle → running遷移（即座にリセット+再開始）
- **意図しない動作ではない**: 既存のreset()とstart()のロジックが連続実行を安全に処理

**パフォーマンス**: 各Restartは0.5秒以内で完了するため、連続クリックでも問題なし

---

### Q6: Restartボタンの色が他のボタンと違う理由は?

**A**: 視覚的に区別するためです。

**色の意味**:

- **青（Start/Resume）**: 主要な開始アクション
- **グレー（Pause）**: 副次的な停止アクション
- **赤（Reset）**: 破壊的なリセットアクション
- **オレンジ（Restart）**: 複合アクション（リセット+開始）

**アクセシビリティ**: 色だけでなく、ボタンテキストとaria-labelで機能を明示

---

## トラブルシューティング

### 問題1: Restartボタンが表示されない

**原因**: ブラウザのキャッシュが古い

**解決策**:

1. ブラウザで**Ctrl+Shift+R**（または**Cmd+Shift+R**）を押してハードリロード
2. キャッシュクリア後、ページを再読み込み

---

### 問題2: Restartボタンをクリックしても何も起こらない

**原因1**: タイマーがidle状態

- **解決策**: 先にStartボタンでタイマーを開始

**原因2**: JavaScriptエラーが発生している

- **解決策**: ブラウザの開発者ツール（F12）でコンソールを確認
- エラーメッセージをコピーして開発チームに報告

**原因3**: ボタンがレンダリング前に呼び出された

- **解決策**: ページを再読み込みして、ControlPanelが完全にロードされるまで待つ

---

### 問題3: Restartボタンのアクセシビリティが機能しない

**症状**: スクリーンリーダーがボタンを正しく読み上げない

**確認事項**:

1. aria-label属性が設定されているか: `aria-label="タイマーをリセットして開始"`
2. button要素が使用されているか: `<button type="button">`
3. disabled状態が正しく設定されているか

**デバッグ方法**:

```javascript
// ブラウザコンソールで確認
const restartBtn = document.querySelector('[data-action="restart"]');
console.log(restartBtn.getAttribute('aria-label'));
console.log(restartBtn.disabled);
```

---

## 開発者向け: Restartボタンのカスタマイズ

### ボタンスタイルの変更

**CSSクラス**: `btn btn--warning`

**カスタマイズ例**:

```css
/* css/main.css に追加 */
.btn--warning {
  background-color: #4caf50; /* 緑色に変更 */
  color: white;
}

.btn--warning:hover:not(:disabled) {
  background-color: #45a049; /* ホバー時の濃い緑 */
}
```

---

### イベントハンドラのカスタマイズ

**Location**: `js/app.js`

**現在の実装**:

```javascript
controlPanel.onRestart = () => {
  timerService.restart();
};
```

**カスタマイズ例** (ログ追加):

```javascript
controlPanel.onRestart = () => {
  console.log('[Restart] User clicked restart button');
  const startTime = Date.now();

  timerService.restart();

  const endTime = Date.now();
  console.log(`[Restart] Completed in ${endTime - startTime}ms`);
};
```

---

### テストでのRestart使用

**ユニットテスト例**:

```javascript
// tests/unit/TimerService.test.js
describe('TimerService.restart()', () => {
  it('should reset and start the timer', () => {
    const timer = new TimerService(300);
    timer.start();

    // 時間を進める
    vi.advanceTimersByTime(5000);

    // Restart実行
    timer.restart();

    const state = timer.getState();
    expect(state.status).toBe('running');
    expect(state.elapsedSeconds).toBe(0);
    expect(state.remainingSeconds).toBe(300);
  });
});
```

**E2Eテスト例**:

```javascript
// tests/e2e/timer.spec.js
test('User can restart timer from running state', async ({ page }) => {
  await page.goto('/');

  // Startクリック
  await page.click('[data-action="start"]');

  // 3秒待つ
  await page.waitForTimeout(3000);

  // Restartクリック
  await page.click('[data-action="restart"]');

  // タイマーが初期時間に戻ったことを確認
  const timerText = await page.textContent('.timer-display__time');
  expect(timerText).toBe('05:00');
});
```

---

## 次のステップ

### ユーザー向け

1. **実際に使ってみる**: 5分間のプレゼンテーションを3回繰り返してRestartボタンの便利さを体感
2. **フィードバック送信**: 使用感や改善提案をGitHub Issuesで共有
3. **ショートカットをマスター**: Tabキー + Enterでキーボードのみで操作

### 開発者向け

1. **テストを実行**: `npm run test` でRestartボタンのテストがすべて成功することを確認
2. **E2Eテストを確認**: `npm run test:e2e` でブラウザ上での動作を検証
3. **Phase 2へ進む**: `/speckit.tasks` コマンドで実装タスクを生成

---

## 参考リンク

- [Feature Specification](./spec.md) - 詳細な仕様書
- [Implementation Plan](./plan.md) - 実装計画
- [Research Document](./research.md) - 設計判断の根拠
- [Data Model](./data-model.md) - データモデルの詳細

---

**最終更新**: 2025-10-16 | **バージョン**: 1.0.0 | **ステータス**: Phase 1 完了
