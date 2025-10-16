# Feature Specification: Restart Button

**Feature Branch**: `004-restart-button`
**Created**: 2025-10-16
**Status**: Draft
**Input**: User description: "restartボタンを設置してください。このボタンを押すと、reset後にstartします。"

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Quick Timer Restart During Presentation (Priority: P1)

プレゼンテーション中にタイマーを素早く再開始したいユーザーが、Restartボタンを1回クリックするだけで、タイマーがリセットされ自動的に開始される。

**Why this priority**: プレゼンター にとって最も重要な機能で、従来はReset→Startの2回のクリックが必要だったが、1回で完了することで操作ミスを減らし、プレゼンテーションの流れをスムーズに保つことができる。これにより、聴衆の注意を逸らさずに次のセッションに移行できる。

**Independent Test**: Restartボタンを1回クリックするだけで、タイマーが初期状態にリセットされ、自動的にカウントダウンが開始されることを確認できる。ユーザーは追加の操作なしに、すぐに時間計測を開始できる価値を実感できる。

**Acceptance Scenarios**:

1. **Given** タイマーがidle状態（初期状態）で、**When** Restartボタンをクリックすると、**Then** タイマーが初期時間にリセットされ、自動的にカウントダウンが開始される
2. **Given** タイマーがrunning状態（カウントダウン中）で、**When** Restartボタンをクリックすると、**Then** タイマーが初期時間にリセットされ、即座に新しいカウントダウンが開始される
3. **Given** タイマーがpaused状態（一時停止中）で、**When** Restartボタンをクリックすると、**Then** タイマーが初期時間にリセットされ、自動的にカウントダウンが開始される
4. **Given** タイマーが時間切れ（0秒）に到達した後、**When** Restartボタンをクリックすると、**Then** タイマーが初期時間にリセットされ、自動的にカウントダウンが開始される

---

### User Story 2 - Visual Feedback and Button Availability (Priority: P2)

ユーザーがRestartボタンの状態を視覚的に理解でき、適切なタイミングで使用できる。

**Why this priority**: ユーザビリティの向上に貢献し、ユーザーがボタンの状態を明確に理解できることで、誤操作を防ぐ。ただし、基本機能が動作すれば価値を提供できるため、P1の後の優先度となる。

**Independent Test**: 各タイマー状態（idle/running/paused）でRestartボタンの有効/無効状態と視覚的なフィードバックが適切に表示されることを確認できる。

**Acceptance Scenarios**:

1. **Given** タイマーがidle状態で、**When** ユーザーがコントロールパネルを見ると、**Then** Restartボタンが無効状態（disabled）で表示され、クリックできないことが視覚的に分かる
2. **Given** タイマーがrunning状態またはpaused状態で、**When** ユーザーがコントロールパネルを見ると、**Then** Restartボタンが有効状態（enabled）で表示され、クリック可能であることが視覚的に分かる
3. **Given** Restartボタンが有効状態で、**When** ユーザーがボタンにカーソルを合わせると、**Then** ホバー効果が表示され、インタラクティブであることが伝わる

---

### User Story 3 - Accessibility for Assistive Technologies (Priority: P3)

スクリーンリーダーやキーボード操作を使用するユーザーが、Restartボタンを問題なく使用できる。

**Why this priority**: アクセシビリティの確保は重要だが、基本的な機能とユーザビリティが確立された後に対応することで、より包括的なユーザー体験を提供できる。

**Independent Test**: スクリーンリーダーを使用してRestartボタンの目的が理解でき、キーボードのみでボタンを操作できることを確認できる。

**Acceptance Scenarios**:

1. **Given** スクリーンリーダーが有効な状態で、**When** ユーザーがRestartボタンにフォーカスすると、**Then** 「タイマーをリセットして開始」という適切な説明が読み上げられる
2. **Given** キーボード操作を行うユーザーが、**When** Tabキーでボタン間を移動すると、**Then** Restartボタンに到達でき、Enterキーまたはスペースキーで実行できる
3. **Given** Restartボタンが無効状態で、**When** スクリーンリーダーユーザーがフォーカスすると、**Then** ボタンが無効であることが適切に伝えられる

---

### Edge Cases

- Restartボタンを連続で素早くクリックした場合、複数回のreset+startが実行されないか（デバウンス処理が必要か）
- タイマーがマイナス時間（超過時間）を表示している状態でRestartボタンをクリックした場合、正常に初期時間にリセットされ開始されるか
- アラート音が鳴っている最中にRestartボタンをクリックした場合、音が停止されるか（実装詳細に依存するため、仕様レベルでは「中断された操作はキャンセルされる」と表現）
- Restartボタンがレンダリングされる前（コンポーネント初期化中）にプログラム的に呼び出された場合のエラーハンドリング

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: システムはコントロールパネルに「Restart」ボタンを表示しなければならない
- **FR-002**: Restartボタンをクリックすると、タイマーは現在の状態（idle/running/paused）に関わらず、設定された初期時間にリセットされなければならない
- **FR-003**: リセット後、タイマーは自動的にカウントダウンを開始しなければならない（ユーザーによる追加のStartボタンクリックは不要）
- **FR-004**: Restartボタンはタイマーがidle状態の時は無効（disabled）でなければならない
- **FR-005**: Restartボタンはタイマーがrunning状態またはpaused状態の時は有効（enabled）でなければならない
- **FR-006**: Restartボタンには適切なARIA属性（aria-label等）を設定し、スクリーンリーダーで「タイマーをリセットして開始」と読み上げられるようにしなければならない
- **FR-007**: Restartボタンはキーボード操作（Tab/Enter/Space）でアクセス可能でなければならない
- **FR-008**: Restartボタンをクリックすると、発火済みのアラートポイントがクリアされ、新しいカウントダウンで再度アラートが発火できるようにしなければならない
- **FR-009**: Restartボタンの視覚的スタイルは、既存のボタン（Start/Pause/Resume/Reset）と一貫性を持たせなければならない

### Key Entities

このフィーチャーは新しいデータエンティティを導入せず、既存のTimerStateとコントロールパネルのUIコンポーネントを拡張します。

- **ControlPanel**: Restartボタンと対応するイベントハンドラ（onRestart）を追加
- **TimerState**: 既存のstatus（idle/running/paused）とdurationSecondsを使用
- **TimerService**: 既存のreset()とstart()メソッドを組み合わせて使用

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: ユーザーはRestartボタンを1回クリックするだけで、タイマーを初期状態にリセットして開始できる（従来のReset→Startの2クリックから50%削減）
- **SC-002**: Restartボタンのクリックから新しいカウントダウンの開始までが0.5秒以内に完了する
- **SC-003**: 既存のテストスイート（ユニットテスト、統合テスト、E2Eテスト）にRestartボタンのテストが追加され、全テストが成功する
- **SC-004**: スクリーンリーダーユーザーがRestartボタンの目的を理解し、キーボードのみで操作できることが、アクセシビリティテストで確認される
- **SC-005**: プレゼンター が複数回のセッションでRestartボタンを使用し、「操作が簡単になった」とポジティブなフィードバックを得る

### Assumptions

- Restartボタンは既存のStart/Pause/Resume/Resetボタンと同じボタングループ（control-panel）に配置される
- ボタンの配置順序は、UI/UX設計によって決定されるが、仕様レベルでは「コントロールパネル内に表示される」ことのみを要求
- Restartボタンのスタイル（色、サイズ、アイコン等）は既存のボタンスタイルガイドに従う（例：btn--warningクラスを使用してResetとは異なる視覚的強調を行う可能性）
- デバウンス処理の実装の必要性は、実装フェーズで技術的に判断される。仕様レベルでは「連続クリックによる意図しない動作を防ぐ」ことを期待
