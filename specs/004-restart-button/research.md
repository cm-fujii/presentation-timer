# Research: Restart Button

**Feature**: 004-restart-button | **Date**: 2025-10-16
**Phase**: 0 - Outline & Research

## Research Questions & Findings

### 1. UIボタン配置パターンとベストプラクティス

**Question**: Restartボタンをコントロールパネル内のどの位置に配置すべきか？既存のボタン順序との整合性は？

**Research Findings**:

既存のControlPanelコンポーネント分析（js/ui/ControlPanel.js:94-142）:

- 現在のボタン順序: Start → Pause/Resume → Reset
- DOMへの追加順序が表示順序を決定
- ボタンの表示/非表示はdisplay: noneで制御

**Decision**: Restartボタンは**Resetボタンの後**に配置する

**Rationale**:

1. **操作フローの論理性**: Start → Pause/Resume → Reset → Restart という順序が、タイマー操作の自然な流れを反映
2. **破壊的操作の分離**: ResetとRestartは両方とも現在の状態をリセットする「破壊的操作」なので、非破壊的操作（Start/Pause/Resume）と分離して配置
3. **視覚的なグルーピング**: 左側に開始/一時停止操作、右側にリセット系操作という明確なグループ化
4. **既存コードへの影響最小化**: 新しいボタンを末尾に追加することで、既存のボタンインデックスやテストへの影響を最小限に抑える

**Alternatives Considered**:

- StartとResetの間に配置: 操作頻度が低いRestart を中央に置くのは非効率
- Startの前に配置: 「開始」操作が最初にあるべきという慣習に反する
- Resetの代わりにRestartのみ: 既存ユーザーの操作習慣を破壊する

**Implementation Note**: `this._container.appendChild(this._restartButton);` をRe setボタン追加後に実行

---

### 2. ボタン状態管理のパターン

**Question**: Restartボタンの有効/無効状態をどのように管理すべきか？

**Research Findings**:

既存の状態管理パターン分析（js/ui/ControlPanel.js:161-195）:

```javascript
updateButtonStates(state) {
  switch (state.status) {
    case 'idle':    // Start有効、Reset無効
    case 'running': // Start無効、Pause表示、Reset有効
    case 'paused':  // Resume表示、Reset有効
  }
}
```

**Decision**: Restartボタンは**idle時無効、running/paused時有効**

**Rationale**:

1. **整合性**: Resetボタンと同じ状態管理パターンを使用（idle時は無効化）
2. **ユーザビリティ**: タイマーが動いていない状態でRestartしても意味がない
3. **エラー防止**: 意図しないクリックを防ぐ（idle時は視覚的にdisabled状態）
4. **テスト可能性**: 明確な状態遷移により、テストケースが簡潔になる

**Alternatives Considered**:

- 常に有効: idle時のRestartは実質的にStartと同じ動作になり、混乱を招く
- running時のみ有効: paused状態からのRestartニーズを満たさない

**Implementation Pattern**:

```javascript
case 'idle':
  this._restartButton.disabled = true;
  break;
case 'running':
case 'paused':
  this._restartButton.disabled = false;
  break;
```

---

### 3. TimerService.restart()の実装アプローチ

**Question**: restart()メソッドはreset()とstart()を呼び出すだけで十分か、それとも最適化が必要か？

**Research Findings**:

既存のreset()とstart()メソッド分析（js/services/TimerService.js:203-137）:

- reset(): インターバル停止、状態初期化、発火済みアラートクリア
- start(): idle状態チェック、running状態設定、インターバル開始

**Decision**: **単純な委譲パターン** - `reset()`を呼び出してから`start()`を呼び出す

**Rationale**:

1. **コードの再利用**: 既存の完全にテストされたロジックを活用
2. **保守性**: reset()やstart()の変更がrestart()に自動的に反映される
3. **テスト容易性**: restart()のテストはreset()とstart()が正しく呼ばれることを検証するだけ
4. **パフォーマンス**: reset()とstart()の処理は十分高速（合計で数ミリ秒）で、0.5秒要件を満たす

**Alternatives Considered**:

- 最適化版restart(): reset()とstart()の処理を統合してインライン化
  - **却下理由**: 早すぎる最適化、保守性の低下、DRY原則違反
- 新しいタイマーインスタンス生成: 既存のTimerServiceを破棄して新規作成
  - **却下理由**: イベントリスナーの再設定が必要、メモリ使用量増加

**Implementation**:

````javascript
/**
 * タイマーをリセットして自動的に開始する
 *
 * @description
 * reset()を実行した後、自動的にstart()を呼び出します。
 * これにより、ユーザーは1回のクリックでタイマーを再開始できます。
 *
 * @example
 * ```javascript
 * timer.restart(); // リセット + 開始を1ステップで実行
 * ```
 */
restart() {
  this.reset();
  this.start();
}
````

---

### 4. アクセシビリティのベストプラクティス

**Question**: Restartボタンのアクセシビリティ属性は何が必要か？

**Research Findings**:

WCAG 2.1 Level AA要件とAria Authoring Practices Guide（APG）の推奨事項:

- 明確なaria-label: ボタンの目的を説明
- キーボード操作: Enter/Spaceでアクティベート（<button>要素で自動対応）
- フォーカスインジケーター: CSS :focus-visibleで視覚的フィードバック
- disabled状態の通知: aria-disabled="true"（disabled属性で自動設定）

既存パターン分析（js/ui/ControlPanel.js:207-214）:

```javascript
button.setAttribute('aria-label', ariaLabel);
button.type = 'button';
```

**Decision**: 以下のアクセシビリティ属性を設定

**Rationale**:

1. **明確なラベル**: 「タイマーをリセットして開始」という具体的な説明
2. **button type**: type="button"でフォーム送信を防止
3. **既存パターン踏襲**: 他のボタンと同じアクセシビリティレベルを維持
4. **ネイティブHTML機能活用**: disabled属性による自動aria-disabled設定

**Implementation**:

```javascript
this._restartButton = this._createButton(
  'Restart',
  'restart',
  'タイマーをリセットして開始',
  'btn--warning'
);
```

**Alternatives Considered**:

- role="button": 不要（<button>要素が既にボタンロールを持つ）
- tabindex: 不要（<button>要素が自動的にフォーカス可能）
- aria-describedby: 過剰（aria-labelで十分）

---

### 5. CSSスタイリングとデザイン一貫性

**Question**: RestartボタンのビジュアルスタイルはどのCSSクラスを使用すべきか？

**Research Findings**:

既存ボタンスタイル分析（js/ui/ControlPanel.js:99-130）:

- Start: `btn btn--primary` (主要アクション、青系)
- Pause: `btn btn--secondary` (副次的アクション、グレー系)
- Resume: `btn btn--primary` (主要アクション、青系)
- Reset: `btn btn--danger` (破壊的アクション、赤系)

CSSファイル確認が必要な項目:

- btn--warning クラスの存在確認
- 代替クラス（btn--info, btn--success等）の利用可能性

**Decision**: **btn--warning**クラスを使用（オレンジ/黄色系）

**Rationale**:

1. **視覚的差別化**: Resetの赤とStartの青の中間色で、「リセット+開始」の複合操作を表現
2. **注意喚起**: 警告色（warning）は「状態を変更する重要な操作」を示唆
3. **一貫性**: 既存のCSSフレームワークパターン（primary/secondary/danger/warning）に従う
4. **色のアクセシビリティ**: WCAGのコントラスト比要件を満たす（既存スタイルが準拠済み）

**Alternatives Considered**:

- btn--danger (Reset と同じ): 視覚的に区別できない、混乱を招く
- btn--primary (Start と同じ): 操作の重要性を過大評価、Start と混同される
- btn--info (情報系): 複合操作の性質を表現しない

**Fallback Plan**: btn--warningクラスが存在しない場合:

1. css/main.cssに新しいbtn--warningスタイルを追加
2. 既存のbtn--dangerをベースに、色相を調整（red → orange）
3. ホバー/フォーカス/アクティブ状態も統一

**CSS Implementation** (必要な場合):

```css
.btn--warning {
  background-color: #ff9800; /* Material Design Orange 500 */
  color: #fff;
}
.btn--warning:hover:not(:disabled) {
  background-color: #fb8c00; /* Orange 600 */
}
.btn--warning:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

### 6. エッジケースとエラーハンドリング

**Question**: 連続クリック、レンダリング前呼び出し等のエッジケースにどう対処すべきか？

**Research Findings**:

既存のエラーハンドリングパターン分析:

- ControlPanel.updateButtonStates（js/ui/ControlPanel.js:162-164）:
  ```javascript
  if (!this._startButton || ...) {
    console.error('ControlPanel not rendered yet');
    return;
  }
  ```
- TimerService.start（js/services/TimerService.js:129-132）:
  ```javascript
  if (this._state.status !== 'idle') {
    return; // 既に実行中の場合は何もしない
  }
  ```

**Decision**: 以下のエッジケース対策を実装

**1. レンダリング前呼び出し**:

```javascript
// ControlPanel.js
if (!this._restartButton) {
  console.error('ControlPanel not rendered yet');
  return;
}
```

**2. 連続クリック防止**:

- **決定**: TimerService.restart()内で状態チェック
- **理由**: reset()がインターバルを停止し、start()がidle状態をチェックするため、既存のロジックで自然に防止される
- **追加実装不要**: デバウンス処理は過剰設計

**3. マイナス時間からのリセット**:

- **決定**: 既存のreset()メソッドに依存
- **理由**: reset()はdurationSecondsを使用して初期化するため、現在の表示時間に関係なく正しく動作
- **検証**: E2Eテストでマイナス時間シナリオをカバー

**Rationale**:

1. **最小限の変更**: 既存のエラーハンドリングパターンを再利用
2. **防御的プログラミング**: null/undefinedチェックでクラッシュを防止
3. **デバッグ容易性**: console.errorで問題を即座に特定可能
4. **過剰設計の回避**: 既存のロジックで十分対応できるケースに追加コードを書かない

**Alternatives Considered**:

- カスタムデバウンス実装: 既存のstart()のidle チェックで十分
- エラーの throw: ユーザー体験を損なう、サイレントフォールバックの方が適切
- グローバルエラーハンドラー: 単一機能のために過剰

---

## Technology Decisions

### JavaScript ES2022 Features

**Decision**: async/await、Optional Chaining、Nullish Coalescing等のES2022機能を活用

**Rationale**: 既存コードベースがES2022を使用しており、モダンブラウザのサポートも十分

### Testing Strategy

**Decision**: TDD（Test-Driven Development）の厳格な適用

**Test Pyramid**:

1. **ユニットテスト（Vitest）**: 最多、最速
   - ControlPanel.\_createButton(), updateButtonStates()
   - TimerService.restart()
   - 各状態（idle/running/paused）からの動作検証

2. **インテグレーションテスト（Vitest）**: 中程度
   - ControlPanel + TimerService の統合
   - Restartボタンクリック → タイマーリセット+開始フロー

3. **E2Eテスト（Playwright）**: 最少、最遅
   - 実ブラウザでのRestartボタンクリック
   - 視覚的フィードバックの検証
   - アクセシビリティツールによる検証

**Rationale**:

- TDDにより、仕様が実装前に明確化される
- テストピラミッドにより、高速フィードバックと包括的カバレッジのバランスを実現
- 既存の80%カバレッジ閾値を維持

### Performance Optimization

**Decision**: 最適化は測定後に行う（Premature optimization is the root of all evil）

**Monitoring Points**:

- Restartボタンクリックイベントのタイムスタンプ記録
- タイマー開始時のタイムスタンプ記録
- 差分が0.5秒を超える場合のみ最適化を検討

**Rationale**: 既存のreset()とstart()は十分高速で、組み合わせても0.5秒要件を満たすと予想される

---

## Dependencies & Integration Points

### Modified Files

1. **js/ui/ControlPanel.js** (Primary modification)
   - 新規プロパティ: `this._restartButton`, `this.onRestart`
   - 新規メソッド: なし（既存の\_createButtonを再利用）
   - 変更メソッド: `render()`, `updateButtonStates()`

2. **js/services/TimerService.js** (Minor modification)
   - 新規メソッド: `restart()`

3. **js/app.js** (Integration point)
   - 新規イベントハンドラ: `controlPanel.onRestart = () => timerService.restart();`

### Test Files

1. **tests/unit/ControlPanel.test.js**
   - 新規テスト: Restartボタンレンダリング、状態管理、イベント発火

2. **tests/unit/TimerService.test.js**
   - 新規テスト: restart()メソッド、reset()+start()の呼び出し検証

3. **tests/integration/TimerFlow.test.js**
   - 新規テスト: Restart→リセット+開始フロー

4. **tests/e2e/timer.spec.js**
   - 新規テスト: 各状態からのRestartシナリオ、アクセシビリティ検証

### No Dependencies on External Libraries

**Decision**: 既存の「外部ライブラリ不使用」ポリシーを維持

**Rationale**: Restartボタンは既存のDOMAPIとイベントリスナーで実装可能

---

## Risk Assessment

### Low Risk Items

✓ **既存コードへの影響**: 新規ボタン追加のみ、既存ロジック変更なし
✓ **パフォーマンス**: 軽量な操作、0.5秒要件を十分満たす
✓ **ブラウザ互換性**: ES2022とDOMAPI のみ使用、モダンブラウザで完全サポート

### Medium Risk Items

⚠ **CSS btn--warningクラスの非存在**: Fallback実装が必要な可能性
⚠ **テストカバレッジ維持**: 新規コードも80%以上カバーする必要

### Mitigation Strategies

1. **CSS Fallback**: btn--warningが存在しない場合、Phase 1でカスタムスタイル追加
2. **継続的テスト**: TDDワークフローにより、テスト追加を実装前に完了
3. **コードレビュー**: 憲法チェックリストに従った厳格なレビュー

---

## Next Phase: Phase 1 Design

Phase 1で作成する成果物:

1. **data-model.md**: データモデル変更の詳細（今回は変更なし）
2. **quickstart.md**: Restartボタン使用方法のクイックスタート
3. **contracts/**: API契約（該当なし - UI機能のみ）

Phase 1の入力:

- この研究ドキュメント（research.md）
- 既存コードベースの詳細分析
- 憲法チェック結果

Phase 1の目標:

- すべてのNEEDS CLARIFICATIONが解決済み ✓
- 実装可能な設計ドキュメントの完成
- Phase 2（タスク生成）へのスムーズな移行
