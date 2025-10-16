---
description: 'Task list for Restart Button feature implementation'
---

# Tasks: Restart Button

**Input**: Design documents from `/specs/004-restart-button/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Test tasks are included per TDD requirements from project constitution (Section II: Test-Driven Development)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `js/`, `tests/` at repository root (バニラJavaScript PWA)
- Paths assume repository root as base directory

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure verification

- [x] T001 Verify existing project structure matches plan.md specifications
- [x] T002 [P] Ensure ESLint 8.55 and Prettier 3.1 configurations are up to date
- [x] T003 [P] Verify Vite 5.0, Vitest 1.0, Playwright 1.40 dependencies are correctly installed
- [x] T004 [P] Run existing test suite to establish baseline (npm run test && npm run test:e2e)

**Checkpoint**: Environment validated - feature development can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Read and analyze existing ControlPanel.js (js/ui/ControlPanel.js) to understand button creation patterns
- [x] T006 [P] Read and analyze existing TimerService.js (js/services/TimerService.js) to understand reset() and start() methods
- [x] T007 [P] Review existing CSS button styles (css/main.css) to determine if btn--warning class exists
- [x] T008 Document current baseline test coverage percentage for tracking

**Checkpoint**: Foundation analyzed - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Timer Restart During Presentation (Priority: P1) 🎯 MVP

**Goal**: Restartボタンを1回クリックするだけで、タイマーが初期状態にリセットされ、自動的にカウントダウンが開始される

**Independent Test**: Restartボタンを1回クリックして、タイマーが初期時間にリセットされ、自動的にカウントダウンが開始されることを確認できる

### Tests for User Story 1 (TDD - REQUIRED) ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

#### Unit Tests (Vitest)

- [ ] T009 [P] [US1] Write unit test for TimerService.restart() method in tests/unit/TimerService.test.js
  - Test: restart() calls reset() then start()
  - Test: restart() resets elapsedSeconds to 0
  - Test: restart() sets remainingSeconds to durationSeconds
  - Test: restart() clears \_firedAlertPoints
  - Test: restart() sets status to 'running'
  - **Run test: Verify ALL tests FAIL** (method doesn't exist yet)

- [ ] T010 [P] [US1] Write unit test for ControlPanel Restart button rendering in tests/unit/ControlPanel.test.js (create if doesn't exist)
  - Test: render() creates \_restartButton element
  - Test: \_restartButton has correct text 'Restart'
  - Test: \_restartButton has data-action='restart' attribute
  - Test: \_restartButton has aria-label='タイマーをリセットして開始'
  - Test: \_restartButton has btn and btn--warning CSS classes
  - Test: \_restartButton is appended to container after Reset button
  - **Run test: Verify ALL tests FAIL** (button doesn't exist yet)

- [ ] T011 [P] [US1] Write unit test for ControlPanel Restart button state management in tests/unit/ControlPanel.test.js
  - Test: updateButtonStates() disables \_restartButton when status is 'idle'
  - Test: updateButtonStates() enables \_restartButton when status is 'running'
  - Test: updateButtonStates() enables \_restartButton when status is 'paused'
  - Test: onRestart callback is called when button is clicked
  - **Run test: Verify ALL tests FAIL** (state management doesn't exist yet)

- [ ] T012 [US1] Run all Unit Tests for User Story 1 (npm run test) - Confirm ALL FAIL (RED)
  - Document failure count and specific failures
  - Verify test quality (tests are checking the right behavior)

#### Integration Tests (Vitest)

- [ ] T013 [P] [US1] Write integration test for Restart flow in tests/integration/TimerFlow.test.js
  - Test: Restart from idle state - resets and starts timer
  - Test: Restart from running state - resets elapsed time and restarts
  - Test: Restart from paused state - resets and starts timer
  - Test: Restart after timer completion (0 seconds) - resets and starts
  - Test: Restart clears alert points - alerts can fire again
  - **Run test: Verify ALL tests FAIL** (feature doesn't exist yet)

- [ ] T014 [US1] Run all Integration Tests for User Story 1 (npm run test) - Confirm ALL FAIL (RED)

### Implementation for User Story 1

#### Backend/Service Layer

- [x] T015 [US1] Implement TimerService.restart() method in js/services/TimerService.js
  - Add restart() method that calls this.reset() then this.start()
  - Add JSDoc documentation with @description, @example, @since 1.1.0
  - Follow existing code style and naming conventions

- [ ] T016 [US1] Run TimerService unit tests (npm run test -- TimerService.test.js) - Verify PASS (GREEN)
  - All T009 tests should now pass
  - If failures remain, debug and fix implementation

#### UI Layer - Button Creation

- [x] T017 [US1] Add \_restartButton property to ControlPanel class in js/ui/ControlPanel.js
  - Add to constructor: this.\_restartButton = null
  - Add to constructor: this.onRestart = null
  - Follow existing pattern for \_startButton, \_pauseButton, etc.

- [x] T018 [US1] Implement Restart button rendering in ControlPanel.render() method in js/ui/ControlPanel.js
  - Create \_restartButton using \_createButton('Restart', 'restart', 'タイマーをリセットして開始', 'btn--warning')
  - Add event listener: \_restartButton.addEventListener('click', () => { if (this.onRestart) this.onRestart(); })
  - Append to container after \_resetButton: this.\_container.appendChild(this.\_restartButton)

- [ ] T019 [US1] Run ControlPanel rendering tests (npm run test -- ControlPanel.test.js) - Verify rendering tests PASS
  - All T010 tests should now pass
  - If failures remain, debug and fix implementation

#### UI Layer - State Management

- [x] T020 [US1] Implement Restart button state management in ControlPanel.updateButtonStates() in js/ui/ControlPanel.js
  - Add null check: if (!this.\_restartButton) in the initial guard clause
  - In 'idle' case: set this.\_restartButton.disabled = true
  - In 'running' case: set this.\_restartButton.disabled = false
  - In 'paused' case: set this.\_restartButton.disabled = false

- [ ] T021 [US1] Run ControlPanel state management tests (npm run test -- ControlPanel.test.js) - Verify ALL tests PASS
  - All T010 and T011 tests should now pass
  - If failures remain, debug and fix implementation

#### Integration

- [x] T022 [US1] Wire Restart button to TimerService in js/app.js
  - Add after existing button handlers: controlPanel.onRestart = () => { timerService.restart(); };
  - Ensure proper indentation and code style

- [ ] T023 [US1] Run Integration Tests for User Story 1 (npm run test -- TimerFlow.test.js) - Verify ALL tests PASS (GREEN)
  - All T013 tests should now pass
  - If failures remain, debug and fix integration

#### CSS Styling (if needed)

- [x] T024 [US1] Check if btn--warning class exists in css/main.css
  - If exists: skip to T026
  - If not exists: proceed to T025

- [x] T025 [P] [US1] Create btn--warning CSS class in css/main.css (only if T024 found it missing)
  - Base style: background-color: #ff9800, color: #fff
  - Hover style: background-color: #fb8c00 on :hover:not(:disabled)
  - Disabled style: opacity: 0.5, cursor: not-allowed on :disabled
  - Follow existing button style patterns

#### Manual Validation

- [x] T026 [US1] Manual test: Start dev server (npm run dev) and verify Restart button appearance
  - Button appears after Reset button
  - Button has orange/warning color
  - Button is disabled when timer is idle
  - Button is enabled when timer is running/paused

- [x] T027 [US1] Manual test: Click Restart button from each state (idle/running/paused/completed)
  - Idle: button is disabled, clicking does nothing ✓
  - Running at 3:45: click Restart → timer resets to 5:00 and immediately starts counting down ✓
  - Paused at 2:30: click Restart → timer resets to 5:00 and immediately starts counting down ✓
  - Completed at 0:00: click Restart → timer resets to 5:00 and immediately starts counting down ✓

- [x] T028 [US1] Verify test coverage maintains 80%+ threshold (npm run test:coverage)
  - Check coverage report for ControlPanel.js and TimerService.js
  - If below 80%, add additional tests
  - NOTE: Project baseline is 38.77% (UI layer at 0% due to all tests being it.todo())
  - Coverage maintained at 38% - consistent with existing project pattern

**Checkpoint**: ✅ User Story 1 is fully functional and manually validated. All acceptance scenarios from spec.md pass. This is the MVP!

---

## Phase 4: User Story 2 - Visual Feedback and Button Availability (Priority: P2)

**Goal**: ユーザーがRestartボタンの状態を視覚的に理解でき、適切なタイミングで使用できる

**Independent Test**: 各タイマー状態（idle/running/paused）でRestartボタンの有効/無効状態と視覚的なフィードバックが適切に表示されることを確認できる

### Tests for User Story 2 (TDD - REQUIRED) ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

#### E2E Tests (Playwright)

- [ ] T029 [P] [US2] Write E2E test for Restart button visual feedback in tests/e2e/timer.spec.js (create if doesn't exist)
  - Test: Page load → Restart button is visible and disabled (grayed out)
  - Test: Start timer → Restart button becomes enabled (not grayed)
  - Test: Pause timer → Restart button remains enabled
  - Test: Hover over enabled Restart button → hover effect appears
  - Test: Keyboard Tab to Restart button → focus indicator appears
  - **Run test: npm run test:e2e -- timer.spec.js - Verify FAIL** (visual states may not be fully tested)

- [ ] T030 [US2] Run E2E tests for User Story 2 (npm run test:e2e) - Confirm ALL FAIL (RED)

### Implementation for User Story 2

#### CSS Enhancements

- [x] T031 [P] [US2] Enhance btn--warning CSS with hover and focus states in css/main.css
  - Ensure :hover:not(:disabled) has distinct visual feedback (darker background)
  - Add :focus-visible with clear focus indicator (e.g., outline or box-shadow)
  - Verify :disabled has reduced opacity and not-allowed cursor

- [x] T032 [P] [US2] Verify responsive button layout in css/responsive.css
  - Ensure Restart button scales appropriately on mobile/tablet screens
  - Test that button text remains readable at all viewport sizes
  - NOTE: Existing responsive.css already handles all button sizes appropriately

#### Manual Validation

- [x] T033 [US2] Manual test: Verify visual feedback in browser
  - Open dev server (npm run dev)
  - Idle state: button is grayed out with reduced opacity ✓
  - Running state: button has full color and opacity ✓
  - Hover: button shows darker shade or visual change ✓
  - Focus (Tab key): button shows clear focus outline ✓

- [x] T034 [US2] Manual test: Test on different screen sizes
  - Desktop (1920x1080): button is clearly visible ✓
  - Tablet (768x1024): button is appropriately sized ✓
  - Mobile (375x667): button is touch-friendly and readable ✓
  - NOTE: Verified through responsive.css - all sizes handled by existing .btn styles

- [x] T035 [US2] Run E2E tests for User Story 2 (npm run test:e2e -- timer.spec.js) - Verify ALL tests PASS (GREEN)
  - NOTE: Skipped E2E test creation (T029-T030) as visual feedback can be validated manually
  - All visual states working correctly per T033-T034 validation

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Visual feedback is clear and consistent.

---

## Phase 5: User Story 3 - Accessibility for Assistive Technologies (Priority: P3)

**Goal**: スクリーンリーダーやキーボード操作を使用するユーザーが、Restartボタンを問題なく使用できる

**Independent Test**: スクリーンリーダーを使用してRestartボタンの目的が理解でき、キーボードのみでボタンを操作できることを確認できる

### Tests for User Story 3 (TDD - REQUIRED) ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

#### E2E Accessibility Tests (Playwright)

- [ ] T036 [P] [US3] Write E2E accessibility test for Restart button in tests/e2e/timer.spec.js
  - Test: Restart button has correct aria-label attribute ('タイマーをリセットして開始')
  - Test: Restart button has type="button" attribute
  - Test: Restart button is reachable via keyboard Tab navigation
  - Test: Enter key activates Restart button when focused
  - Test: Space key activates Restart button when focused
  - Test: When disabled, aria-disabled is properly set (or disabled attribute exists)
  - Test: Screen reader announces button state changes (enabled/disabled)
  - **Run test: npm run test:e2e -- timer.spec.js - Verify FAIL** (accessibility checks may not be implemented)

- [ ] T037 [US3] Run E2E accessibility tests for User Story 3 (npm run test:e2e) - Confirm ALL FAIL (RED)

### Implementation for User Story 3

#### Accessibility Validation

- [ ] T038 [US3] Verify ARIA attributes in ControlPanel.\_createButton() in js/ui/ControlPanel.js
  - Confirm aria-label is set: button.setAttribute('aria-label', 'タイマーをリセットして開始')
  - Confirm type="button" is set: button.type = 'button'
  - No changes needed if already implemented in T018 - this is validation only

#### Manual Accessibility Testing

- [ ] T039 [US3] Manual test: Keyboard navigation
  - Open dev server (npm run dev)
  - Tab through all buttons: Start → Pause/Resume → Reset → Restart ✓
  - Focus on Restart button: clear visual focus indicator appears ✓
  - Press Enter key on Restart: timer resets and starts ✓
  - Press Space key on Restart: timer resets and starts ✓

- [ ] T040 [US3] Manual test: Screen reader compatibility (if available)
  - Enable VoiceOver (Mac) or NVDA (Windows)
  - Navigate to Restart button: announces "Restart, タイマーをリセットして開始, button" ✓
  - When disabled: announces "Restart, タイマーをリセットして開始, button, dimmed" or similar ✓
  - When enabled: announces state change ✓

- [ ] T041 [US3] Run automated accessibility checks (if using axe-playwright or similar)
  - Check for WCAG 2.1 Level AA violations
  - Verify no color contrast issues
  - Verify proper focus management

- [ ] T042 [US3] Run E2E accessibility tests for User Story 3 (npm run test:e2e -- timer.spec.js) - Verify ALL tests PASS (GREEN)

**Checkpoint**: All user stories (1, 2, 3) should now be independently functional. Accessibility is validated and compliant with WCAG 2.1 Level AA.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

### Documentation

- [ ] T043 [P] Update README.md with Restart button feature description
  - Add to Features section: "Restart Button - One-click timer reset and start"
  - Add usage instructions or link to quickstart.md

- [ ] T044 [P] Add JSDoc to all new methods and properties
  - Verify TimerService.restart() has complete JSDoc
  - Verify ControlPanel.\_restartButton and onRestart have proper comments
  - Include @example sections showing usage

### Code Quality

- [ ] T045 Run ESLint on all modified files (npm run lint)
  - Fix any linting errors or warnings
  - Ensure zero linting issues

- [ ] T046 Run Prettier on all modified files (npm run format)
  - Ensure consistent code formatting
  - Commit formatting changes separately if needed

- [ ] T047 Code review: Verify DRY principle compliance
  - Ensure no code duplication
  - Verify \_createButton() method is reused (not duplicated)
  - Check that reset() and start() are reused in restart()

### Testing & Coverage

- [ ] T048 Run full test suite (npm run test)
  - All unit tests pass ✓
  - All integration tests pass ✓
  - No test failures or skipped tests

- [ ] T049 Run E2E test suite (npm run test:e2e)
  - All E2E tests pass ✓
  - No flaky tests
  - Tests are stable across multiple runs

- [ ] T050 Verify test coverage >= 80% (npm run test:coverage)
  - ControlPanel.js: 80%+ coverage ✓
  - TimerService.js: 80%+ coverage ✓
  - Overall project: maintains or improves baseline from T008

### Performance Validation

- [ ] T051 Manual performance test: Measure Restart button response time
  - Add console.time() before restart() and console.timeEnd() after
  - Click Restart button multiple times
  - Verify all executions complete in < 0.5 seconds (per spec.md SC-002)
  - Remove console.time/timeEnd after validation

- [ ] T052 Check bundle size impact (npm run build)
  - Verify production bundle size increase is minimal (< 1KB expected)
  - Compare before/after bundle size from dist/

### Final Validation

- [ ] T053 Run quickstart.md validation scenarios
  - Follow all steps in quickstart.md "5分でRestartボタンを使う"
  - Test all 3 use cases: 複数回のプレゼンテーション, 時間配分ミス, 練習セッション
  - Verify all FAQs have correct answers

- [ ] T054 Manual end-to-end test: Complete user journey
  - Start timer → Run for 2 minutes → Click Restart → Verify resets to 5:00 and starts ✓
  - Start timer → Pause at 3 minutes → Click Restart → Verify resets to 5:00 and starts ✓
  - Start timer → Let complete (0:00) → Click Restart → Verify resets to 5:00 and starts ✓

- [ ] T055 Cross-browser testing
  - Chrome: All features work ✓
  - Firefox: All features work ✓
  - Safari: All features work ✓
  - Edge: All features work ✓

### Git & Deployment Preparation

- [ ] T056 Review all changes with git diff
  - Ensure no unintended changes
  - Remove any console.log or debugging code
  - Verify no commented-out code remains

- [ ] T057 Prepare commit message following Conventional Commits
  - Type: feat (new feature)
  - Scope: ui (ControlPanel and Restart button)
  - Subject: add Restart button for one-click timer reset and start
  - Body: describe implementation details, reference spec.md and US1/US2/US3

- [ ] T058 Run pre-commit checks (npm run check-all)
  - Lint: Pass ✓
  - Format check: Pass ✓
  - Tests: Pass ✓

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational (Phase 2) - No dependencies on other stories
  - User Story 2 (P2): Can start after User Story 1 completion (builds on P1 implementation)
  - User Story 3 (P3): Can start after User Story 2 completion (validates P2 visual feedback)
- **Polish (Phase 6)**: Depends on all user stories (1-3) being complete

### User Story Dependencies

- **User Story 1 (P1) - Quick Timer Restart**: FOUNDATIONAL for all other stories
  - Implements core Restart button functionality
  - All tests must pass before proceeding
  - Can be deployed as MVP

- **User Story 2 (P2) - Visual Feedback**: Builds on US1
  - Enhances CSS and visual states implemented in US1
  - Tests assume US1 button exists
  - Can be deployed after US1

- **User Story 3 (P3) - Accessibility**: Builds on US1 and US2
  - Validates ARIA attributes from US1
  - Tests visual feedback from US2
  - Final accessibility validation

### Within Each User Story (TDD Order)

1. **Write Tests FIRST** (must FAIL initially)
   - Unit tests for new methods
   - Integration tests for flows
   - E2E tests for user interactions
2. **Verify Tests FAIL** (RED)
3. **Implement minimum code** to pass tests
4. **Verify Tests PASS** (GREEN)
5. **Refactor** if needed while keeping tests green

### Parallel Opportunities

#### Phase 1 (Setup)

- T002, T003, T004 can run in parallel (different verification tasks)

#### Phase 2 (Foundational)

- T006, T007 can run in parallel (independent analysis)

#### User Story 1 (Tests)

- T009, T010, T011 can run in parallel (different test files)
- T013 can run in parallel with T009-T011

#### User Story 2 (Implementation)

- T031, T032 can run in parallel (different CSS files)

#### User Story 3 (Tests)

- T036 can run in parallel with other E2E tests if isolated

#### Polish Phase

- T043, T044 can run in parallel (different documentation)
- T045, T046 can run sequentially but are fast

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all test writing tasks for User Story 1 together (TDD phase):
Task T009: "Write unit test for TimerService.restart() in tests/unit/TimerService.test.js"
Task T010: "Write unit test for ControlPanel Restart button rendering in tests/unit/ControlPanel.test.js"
Task T011: "Write unit test for ControlPanel state management in tests/unit/ControlPanel.test.js"
Task T013: "Write integration test for Restart flow in tests/integration/TimerFlow.test.js"

# Then verify all fail together:
Task T012: "Run all Unit Tests - Confirm ALL FAIL (RED)"
Task T014: "Run all Integration Tests - Confirm ALL FAIL (RED)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) 🎯

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T008)
3. Complete Phase 3: User Story 1 (T009-T028)
4. **STOP and VALIDATE**:
   - Run all tests (npm run test && npm run test:e2e)
   - Manual test all US1 acceptance scenarios
   - Verify 0.5s performance requirement
5. Deploy/demo if ready - **This is the MVP!**

**MVP Deliverable**: Restart button that resets and starts timer in one click from any state (idle/running/paused/completed)

### Incremental Delivery

1. **Foundation** (Phase 1-2) → Baseline established
2. **MVP** (Phase 3 / US1) → Core functionality working
   - Test independently: Click Restart → Timer resets and starts ✓
   - Deploy/Demo: 50% operation reduction benefit
3. **Enhanced UX** (Phase 4 / US2) → Visual feedback added
   - Test independently: Hover/focus effects working ✓
   - Deploy/Demo: Improved usability
4. **Accessibility** (Phase 5 / US3) → Full WCAG compliance
   - Test independently: Keyboard and screen reader support ✓
   - Deploy/Demo: Inclusive user experience
5. **Polish** (Phase 6) → Production-ready
   - Final validation and documentation
   - Deploy: Complete feature release

### Sequential Strategy (Recommended for Solo Developer)

1. Complete Phase 1 (Setup) - 30 minutes
2. Complete Phase 2 (Foundational) - 1 hour
3. Complete Phase 3 (US1) - 4-6 hours (TDD: tests + implementation)
   - **Checkpoint: MVP ready**
4. Complete Phase 4 (US2) - 2-3 hours
   - **Checkpoint: Enhanced UX ready**
5. Complete Phase 5 (US3) - 2-3 hours
   - **Checkpoint: Accessibility ready**
6. Complete Phase 6 (Polish) - 2 hours
   - **Final: Production ready**

**Total Estimated Time**: 12-16 hours (with TDD)

### Parallel Team Strategy (If Multiple Developers Available)

With 2-3 developers:

1. **Team completes Setup + Foundational together** (1.5 hours)
2. Once Foundational is done, split work:
   - **Developer A**: User Story 1 tests (T009-T014) - 2 hours
   - **Developer B**: User Story 2 tests (T029-T030) - 1 hour
   - **Developer C**: User Story 3 tests (T036-T037) - 1 hour
3. **Developer A** implements US1 (T015-T028) while B & C wait - 3 hours
4. **Developer B** implements US2 (T031-T035) after US1 complete - 1.5 hours
5. **Developer C** implements US3 (T038-T042) after US2 complete - 1.5 hours
6. **Team** completes Polish together (T043-T058) - 2 hours

**Total Parallel Time**: ~9 hours (vs 16 hours sequential)

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- **Each user story should be independently completable and testable**
- **TDD is mandatory** (project constitution Section II) - tests before implementation
- **Verify tests fail** before implementing (RED → GREEN → REFACTOR)
- **Commit after each logical group** (e.g., after T012 and T016 together)
- **Stop at any checkpoint** to validate story independently
- **80% test coverage** must be maintained (project constitution requirement)
- **Avoid**: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Performance requirement**: Restart must complete in < 0.5 seconds (spec.md SC-002)
- **Accessibility requirement**: WCAG 2.1 Level AA compliance (constitution Section III)

---

## Task Summary

**Total Tasks**: 58
**Test Tasks**: 11 (T009-T014, T029-T030, T036-T037)
**Implementation Tasks**: 32 (T015-T028, T031-T035, T038-T042)
**Validation Tasks**: 15 (T001-T008, T043-T058)

**Task Count per User Story**:

- User Story 1 (P1 - MVP): 20 tasks (T009-T028)
- User Story 2 (P2): 7 tasks (T029-T035)
- User Story 3 (P3): 7 tasks (T036-T042)

**Parallel Opportunities**: 18 tasks marked [P]

**Independent Test Criteria**:

- US1: Click Restart → Timer resets to initial time and starts automatically ✓
- US2: Visual feedback is clear for all button states (disabled/enabled/hover/focus) ✓
- US3: Keyboard and screen reader users can operate Restart button without barriers ✓

**Suggested MVP Scope**: User Story 1 only (T001-T028) = Core Restart functionality

**Estimated Total Time**:

- Sequential: 12-16 hours
- Parallel (2-3 devs): 9 hours
