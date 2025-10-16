---
description: 'Task list for alert sound selection feature implementation'
---

# Tasks: アラート音選択機能

**Input**: Design documents from `/specs/002-alert-sound-selection/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: This feature follows TDD (Test-Driven Development) as mandated by the project constitution. All test tasks are REQUIRED and must be completed BEFORE implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a single-page web application. File paths follow this structure:
- **Models**: `js/models/`
- **Services**: `js/services/`
- **UI Components**: `js/ui/`
- **Assets**: `assets/sounds/`
- **Tests**: `tests/unit/`, `tests/integration/`, `tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Create SoundType enum file at js/models/SoundType.js
- [x] T002 [P] Add bell.mp3 sound file to assets/sounds/ directory
- [x] T003 [P] Verify existing gong.mp3 sound file in assets/sounds/ directory

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Extend AlertConfig.js to support AlertPoint type (js/models/AlertConfig.js)
- [x] T005 [P] Add migrateAlertConfig function to StorageService.js (js/services/StorageService.js)
- [x] T006 Extend AudioService.js to support multiple sound buffers (js/services/AudioService.js)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - アラート音の種類選択 (Priority: P1) 🎯 MVP

**Goal**: タイムキーパーが、各アラートポイント（例：残り1分、0秒到達時）に対して、異なるアラート音（「ベル」または「銅鑼」）を選択できる。

**Independent Test**: アラート設定画面で「残り1分」に「ベル」、「0秒到達時」に「銅鑼」を設定し、タイマーを動作させて各タイミングで正しい音が再生されることを確認できます。

### Tests for User Story 1 (TDD Required) ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T007 [P] [US1] Unit test for SoundType enum in tests/unit/SoundType.test.js
- [x] T008 [P] [US1] Unit test for AlertPoint creation and validation in tests/unit/AlertConfig.test.js
- [x] T009 [P] [US1] Unit test for updateAlertPointSound function in tests/unit/AlertConfig.test.js
- [x] T010 [P] [US1] Unit test for AudioService.initialize with multiple sounds in tests/unit/AudioService.test.js
- [x] T011 [P] [US1] Unit test for AudioService.play with specific soundType in tests/unit/AudioService.test.js
- [x] T012 [P] [US1] Integration test for sound selection and playback flow in tests/integration/TimerFlow.test.js

### Implementation for User Story 1

- [x] T013 [US1] Implement SoundType enum with BELL and GONG constants in js/models/SoundType.js
- [x] T014 [US1] Implement isValidSoundType function in js/models/SoundType.js
- [x] T015 [US1] Add AlertPoint typedef and createAlertPoint function in js/models/AlertConfig.js
- [x] T016 [US1] Add isValidAlertPoint validation function in js/models/AlertConfig.js
- [x] T017 [US1] Update createDefaultAlertConfig to use AlertPoint objects in js/models/AlertConfig.js
- [x] T018 [US1] Implement updateAlertPointSound function in js/models/AlertConfig.js
- [x] T019 [US1] Update addAlertPoint to support AlertPoint objects in js/models/AlertConfig.js
- [x] T020 [US1] Update isValidAlertConfig to validate AlertPoint array in js/models/AlertConfig.js
- [x] T021 [US1] Extend AudioService._audioBuffers to Map<SoundType, AudioBuffer> in js/services/AudioService.js
- [x] T022 [US1] Update AudioService.initialize to accept soundConfigs array in js/services/AudioService.js
- [x] T023 [US1] Update AudioService.play to accept soundType parameter in js/services/AudioService.js
- [x] T024 [US1] Add error handling and fallback for failed sound loads in js/services/AudioService.js
- [x] T025 [US1] Update SettingsPanel._addAlertPoint to create AlertPoint with soundType in js/ui/SettingsPanel.js
- [x] T026 [US1] Add sound selection dropdown to alert point UI in js/ui/SettingsPanel.js
- [x] T027 [US1] Update SettingsPanel._getAlertConfig to read soundType from UI in js/ui/SettingsPanel.js
- [x] T028 [US1] Update SettingsPanel._loadSettings to render soundType in dropdown in js/ui/SettingsPanel.js
- [x] T029 [US1] Update app.js to initialize AudioService with both bell and gong sounds in js/app.js
- [x] T030 [US1] Update TimerService to pass soundType to AudioService.play in js/services/TimerService.js

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - デフォルト音の設定と変更 (Priority: P2)

**Goal**: 既存のアラート音が「銅鑼」として認識され、タイムキーパーは必要に応じてアラート音を変更できる。

**Independent Test**: 新しいアラートポイントを追加した際、音が自動的に「銅鑼」に設定されることを確認し、その後「ベル」に変更できることをテストできます。

### Tests for User Story 2 (TDD Required) ⚠️

- [ ] T031 [P] [US2] Unit test for migrateAlertConfig with old format data in tests/unit/StorageService.test.js
- [ ] T032 [P] [US2] Unit test for migrateAlertConfig with new format data in tests/unit/StorageService.test.js
- [ ] T033 [P] [US2] Integration test for data migration on app load in tests/integration/TimerFlow.test.js

### Implementation for User Story 2

- [ ] T034 [US2] Implement migrateAlertConfig function in js/services/StorageService.js
- [ ] T035 [US2] Update StorageService.loadAlertConfig to call migrateAlertConfig in js/services/StorageService.js
- [ ] T036 [US2] Ensure new alert points default to GONG soundType in js/models/AlertConfig.js (verify createAlertPoint)
- [ ] T037 [US2] Update SettingsPanel._addAlertPoint to default soundType to GONG in js/ui/SettingsPanel.js
- [ ] T038 [US2] Add visual indicator showing current default sound in js/ui/SettingsPanel.js

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 音のプレビュー機能 (Priority: P3)

**Goal**: タイムキーパーは、アラート設定画面で各音（「ベル」「銅鑼」）を事前に試聴でき、適切な音を選択できる。

**Independent Test**: アラート設定画面で「ベル」のプレビューボタンを押すと「ベル」の音が再生され、「銅鑼」のプレビューボタンを押すと「銅鑼」の音が再生されることを確認できます。

### Tests for User Story 3 (TDD Required) ⚠️

- [ ] T039 [P] [US3] Unit test for AudioService.preview method in tests/unit/AudioService.test.js
- [ ] T040 [P] [US3] Unit test for preview stopping previous sound in tests/unit/AudioService.test.js
- [ ] T041 [P] [US3] E2E test for preview button functionality in tests/e2e/userJourney.spec.js

### Implementation for User Story 3

- [ ] T042 [US3] Add _previewSource field to AudioService in js/services/AudioService.js
- [ ] T043 [US3] Implement AudioService.preview(soundType) method in js/services/AudioService.js
- [ ] T044 [US3] Add preview button to each alert point row in js/ui/SettingsPanel.js
- [ ] T045 [US3] Wire preview button click to AudioService.preview in js/ui/SettingsPanel.js
- [ ] T046 [US3] Add ARIA labels and accessibility attributes to preview buttons in js/ui/SettingsPanel.js
- [ ] T047 [US3] Pass AudioService instance to SettingsPanel in js/app.js

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T048 [P] Add CSS styles for sound selection dropdown in css/main.css
- [ ] T049 [P] Add CSS styles for preview buttons in css/main.css
- [ ] T050 [P] Ensure responsive design for new UI elements in css/responsive.css
- [ ] T051 [P] Update README.md with alert sound selection feature description
- [ ] T052 [P] Add JSDoc comments to all new public APIs
- [ ] T053 Run npm run lint and fix all linting errors
- [ ] T054 Run npm run format to format all modified files
- [ ] T055 Run npm run type-check and fix all type errors
- [ ] T056 Run npm run test and ensure 80%+ coverage
- [ ] T057 Run npm run test:e2e and verify all E2E tests pass
- [ ] T058 Update service worker (sw.js) to cache new sound files
- [ ] T059 Test offline functionality with both sound files
- [ ] T060 Run quickstart.md validation steps
- [ ] T061 Performance audit: verify SC-002 (preview < 0.5s)
- [ ] T062 Performance audit: verify SC-003 (save < 1s)
- [ ] T063 Performance audit: verify SC-004 (alert < 1s)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 models but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 AudioService extension but should be independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD required)
- Models before services
- Services before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase (Phase 1)**:
```
T001 [P] SoundType.js
T002 [P] bell.mp3
T003 [P] gong.mp3 verification
```

**User Story 1 Tests**:
```
T007 [P] SoundType.test.js
T008 [P] AlertConfig.test.js (AlertPoint)
T009 [P] AlertConfig.test.js (updateAlertPointSound)
T010 [P] AudioService.test.js (initialize)
T011 [P] AudioService.test.js (play)
T012 [P] TimerFlow.test.js (integration)
```

**User Story 2 Tests**:
```
T031 [P] StorageService.test.js (migration old)
T032 [P] StorageService.test.js (migration new)
T033 [P] TimerFlow.test.js (migration)
```

**User Story 3 Tests**:
```
T039 [P] AudioService.test.js (preview)
T040 [P] AudioService.test.js (preview stop)
T041 [P] userJourney.spec.js (E2E)
```

**Polish Phase**:
```
T048 [P] main.css (dropdown)
T049 [P] main.css (preview button)
T050 [P] responsive.css
T051 [P] README.md
T052 [P] JSDoc comments
```

---

## Parallel Example: User Story 1

```bash
# Step 1: Launch all tests for User Story 1 together (TDD):
Task: "Unit test for SoundType enum in tests/unit/SoundType.test.js"
Task: "Unit test for AlertPoint creation in tests/unit/AlertConfig.test.js"
Task: "Unit test for updateAlertPointSound in tests/unit/AlertConfig.test.js"
Task: "Unit test for AudioService.initialize in tests/unit/AudioService.test.js"
Task: "Unit test for AudioService.play in tests/unit/AudioService.test.js"
Task: "Integration test for sound selection in tests/integration/TimerFlow.test.js"

# Step 2: Verify all tests FAIL (Red phase)

# Step 3: Implement SoundType.js and AlertConfig.js models in parallel:
Task: "Implement SoundType enum in js/models/SoundType.js"
Task: "Add AlertPoint typedef in js/models/AlertConfig.js"

# Step 4: Implement services and UI sequentially (due to dependencies)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006) - CRITICAL
3. Complete Phase 3: User Story 1 (T007-T030)
   - Write tests first (T007-T012)
   - Verify tests fail (Red)
   - Implement features (T013-T030)
   - Verify tests pass (Green)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Run npm run check-all (lint, format, type-check, test)
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
   - Users can now select different sounds for different alert points
3. Add User Story 2 → Test independently → Deploy/Demo
   - Existing users' data is preserved, defaults are handled
4. Add User Story 3 → Test independently → Deploy/Demo
   - Users can preview sounds before selecting
5. Add Polish phase → Final quality checks
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (sound selection core)
   - Developer B: User Story 2 (migration & defaults)
   - Developer C: User Story 3 (preview feature)
3. Stories complete and integrate independently
4. Final integration testing and polish together

---

## Task Summary

- **Total Tasks**: 63
- **Setup Tasks**: 3
- **Foundational Tasks**: 3
- **User Story 1 Tasks**: 24 (6 tests + 18 implementation)
- **User Story 2 Tasks**: 8 (3 tests + 5 implementation)
- **User Story 3 Tasks**: 9 (3 tests + 6 implementation)
- **Polish Tasks**: 16
- **Parallel Opportunities**: 26 tasks marked [P]

### Task Breakdown by User Story

- **US1 (P1) - Sound Selection**: 24 tasks (38% of total)
- **US2 (P2) - Defaults & Migration**: 8 tasks (13% of total)
- **US3 (P3) - Preview Feature**: 9 tasks (14% of total)

### Independent Test Criteria

- **US1**: Select different sounds for alert points, verify correct sounds play at correct times
- **US2**: Add new alert point, verify it defaults to gong, change to bell
- **US3**: Click preview buttons, verify sounds play, verify previous preview stops

### Suggested MVP Scope

**Minimum Viable Product = User Story 1 only** (24 tasks)

This delivers the core value: selecting different alert sounds for different alert points.

User Stories 2 and 3 enhance the experience but are not required for basic functionality.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **TDD Required**: Verify tests fail (Red) before implementing (Green)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Run `npm run check-all` before considering a phase complete
- Performance targets: SC-002 (preview < 0.5s), SC-003 (save < 1s), SC-004 (alert < 1s)
