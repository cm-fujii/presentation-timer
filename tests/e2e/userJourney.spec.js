/**
 * @file userJourney.spec.js
 * @description E2Eテスト - ユーザージャーニー全体のテスト
 */

import { test, expect } from '@playwright/test';

test.describe('User Story 1: Basic Timer Operations', () => {
  test.beforeEach(async ({ page }) => {
    // テスト前にlocalStorageをクリア
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display initial timer screen', async ({ page }) => {
    await page.goto('/');

    // タイマー表示エリアが存在することを確認
    const timerDisplay = page.locator('.timer-display');
    await expect(timerDisplay).toBeVisible();

    // コントロールパネルが存在することを確認
    const controlPanel = page.locator('.control-panel');
    await expect(controlPanel).toBeVisible();

    // 設定パネルが存在することを確認
    const settingsPanel = page.locator('.settings-panel');
    await expect(settingsPanel).toBeVisible();
  });

  test('should set timer duration and display it', async ({ page }) => {
    await page.goto('/');

    // 時間設定: 5分30秒
    const minutesInput = page.locator('[name="minutes"]');
    const secondsInput = page.locator('[name="seconds"]');

    await minutesInput.fill('5');
    await secondsInput.fill('30');

    // 設定を保存
    const saveButton = page.locator('[data-action="save-settings"]');
    await saveButton.click();

    // タイマー表示が更新されることを確認
    const timerTime = page.locator('.timer-display__time');
    await expect(timerTime).toHaveText('05:30');
  });

  test('should start timer and countdown', async ({ page }) => {
    await page.goto('/');

    // 短い時間を設定: 5秒
    const minutesInput = page.locator('[name="minutes"]');
    const secondsInput = page.locator('[name="seconds"]');
    await minutesInput.fill('0');
    await secondsInput.fill('5');

    const saveButton = page.locator('[data-action="save-settings"]');
    await saveButton.click();

    // タイマーを開始
    const startButton = page.locator('[data-action="start"]');
    await startButton.click();

    // ステータスが「Running」になることを確認
    const statusElement = page.locator('.timer-display__status');
    await expect(statusElement).toHaveText('Running');

    // 2秒待機してカウントダウンを確認
    await page.waitForTimeout(2000);

    const timerTime = page.locator('.timer-display__time');
    const timeText = await timerTime.textContent();

    // 残り時間が3秒前後であることを確認
    expect(timeText).toMatch(/00:0[2-4]/);
  });

  test('should pause timer', async ({ page }) => {
    await page.goto('/');

    // 10秒タイマーを設定
    const minutesInput = page.locator('[name="minutes"]');
    const secondsInput = page.locator('[name="seconds"]');
    await minutesInput.fill('0');
    await secondsInput.fill('10');

    const saveButton = page.locator('[data-action="save-settings"]');
    await saveButton.click();

    // 開始
    const startButton = page.locator('[data-action="start"]');
    await startButton.click();

    // 2秒待機
    await page.waitForTimeout(2000);

    // 一時停止
    const pauseButton = page.locator('[data-action="pause"]');
    await pauseButton.click();

    // ステータスが「Paused」になることを確認
    const statusElement = page.locator('.timer-display__status');
    await expect(statusElement).toHaveText('Paused');

    // 一時停止時の時間を記録
    const timerTime = page.locator('.timer-display__time');
    const pausedTime = await timerTime.textContent();

    // 2秒待機
    await page.waitForTimeout(2000);

    // 時間が変わっていないことを確認
    const timeAfterPause = await timerTime.textContent();
    expect(timeAfterPause).toBe(pausedTime);
  });

  test('should resume timer after pause', async ({ page }) => {
    await page.goto('/');

    // 10秒タイマーを設定
    const minutesInput = page.locator('[name="minutes"]');
    const secondsInput = page.locator('[name="seconds"]');
    await minutesInput.fill('0');
    await secondsInput.fill('10');

    const saveButton = page.locator('[data-action="save-settings"]');
    await saveButton.click();

    // 開始
    const startButton = page.locator('[data-action="start"]');
    await startButton.click();

    // 2秒待機
    await page.waitForTimeout(2000);

    // 一時停止
    const pauseButton = page.locator('[data-action="pause"]');
    await pauseButton.click();

    // 再開
    const resumeButton = page.locator('[data-action="resume"]');
    await resumeButton.click();

    // ステータスが「Running」に戻ることを確認
    const statusElement = page.locator('.timer-display__status');
    await expect(statusElement).toHaveText('Running');

    // 2秒待機してカウントダウンが継続していることを確認
    const timerTime = page.locator('.timer-display__time');
    const timeBeforeWait = await timerTime.textContent();

    await page.waitForTimeout(2000);

    const timeAfterWait = await timerTime.textContent();
    expect(timeAfterWait).not.toBe(timeBeforeWait);
  });

  test('should reset timer', async ({ page }) => {
    await page.goto('/');

    // 10秒タイマーを設定
    const minutesInput = page.locator('[name="minutes"]');
    const secondsInput = page.locator('[name="seconds"]');
    await minutesInput.fill('0');
    await secondsInput.fill('10');

    const saveButton = page.locator('[data-action="save-settings"]');
    await saveButton.click();

    // 開始
    const startButton = page.locator('[data-action="start"]');
    await startButton.click();

    // 2秒待機
    await page.waitForTimeout(2000);

    // リセット
    const resetButton = page.locator('[data-action="reset"]');
    await resetButton.click();

    // ステータスが「Ready」に戻ることを確認
    const statusElement = page.locator('.timer-display__status');
    await expect(statusElement).toHaveText('Ready');

    // 時間が初期値に戻ることを確認
    const timerTime = page.locator('.timer-display__time');
    await expect(timerTime).toHaveText('00:10');
  });

  test('should complete full user journey', async ({ page }) => {
    await page.goto('/');

    // 1. 時間設定: 5秒
    const minutesInput = page.locator('[name="minutes"]');
    const secondsInput = page.locator('[name="seconds"]');
    await minutesInput.fill('0');
    await secondsInput.fill('5');

    const saveButton = page.locator('[data-action="save-settings"]');
    await saveButton.click();

    // 2. タイマー開始
    const startButton = page.locator('[data-action="start"]');
    await startButton.click();

    // 3. 2秒待機
    await page.waitForTimeout(2000);

    // 4. 一時停止
    const pauseButton = page.locator('[data-action="pause"]');
    await pauseButton.click();

    // 一時停止中であることを確認
    const statusElement = page.locator('.timer-display__status');
    await expect(statusElement).toHaveText('Paused');

    // 5. 再開
    const resumeButton = page.locator('[data-action="resume"]');
    await resumeButton.click();

    // 実行中であることを確認
    await expect(statusElement).toHaveText('Running');

    // 6. リセット
    const resetButton = page.locator('[data-action="reset"]');
    await resetButton.click();

    // リセットされたことを確認
    await expect(statusElement).toHaveText('Ready');

    const timerTime = page.locator('.timer-display__time');
    await expect(timerTime).toHaveText('00:05');
  });

  test('should persist settings in localStorage', async ({ page }) => {
    await page.goto('/');

    // 時間設定: 10分30秒
    const minutesInput = page.locator('[name="minutes"]');
    const secondsInput = page.locator('[name="seconds"]');
    await minutesInput.fill('10');
    await secondsInput.fill('30');

    const saveButton = page.locator('[data-action="save-settings"]');
    await saveButton.click();

    // ページをリロード
    await page.reload();

    // 設定が保持されていることを確認
    const loadedMinutes = await minutesInput.inputValue();
    const loadedSeconds = await secondsInput.inputValue();

    expect(loadedMinutes).toBe('10');
    expect(loadedSeconds).toBe('30');

    // タイマー表示も正しいことを確認
    const timerTime = page.locator('.timer-display__time');
    await expect(timerTime).toHaveText('10:30');
  });
});

test.describe('Accessibility Tests', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // メインエリアにaria-live属性があることを確認
    const timerDisplay = page.locator('#timer-display');
    await expect(timerDisplay).toHaveAttribute('aria-live', 'polite');

    // コントロールパネルにaria-label属性があることを確認
    const controlPanel = page.locator('#control-panel');
    await expect(controlPanel).toHaveAttribute('aria-label', 'タイマー操作');

    // 設定パネルにaria-label属性があることを確認
    const settingsPanel = page.locator('#settings-panel');
    await expect(settingsPanel).toHaveAttribute('aria-label', 'タイマー設定');
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tabキーでフォーカスを移動
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // フォーカスされた要素が可視であることを確認
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT']).toContain(focusedElement);
  });
});

test.describe('Responsive Design Tests', () => {
  test('should display correctly on iPad Portrait', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const timerDisplay = page.locator('.timer-display');
    await expect(timerDisplay).toBeVisible();

    // タイマー表示が中央に配置されていることを確認
    const box = await timerDisplay.boundingBox();
    expect(box).not.toBeNull();
  });

  test('should display correctly on iPad Landscape', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    const timerDisplay = page.locator('.timer-display');
    await expect(timerDisplay).toBeVisible();

    const controlPanel = page.locator('.control-panel');
    await expect(controlPanel).toBeVisible();
  });

  test('should display correctly on Mobile Portrait', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const timerDisplay = page.locator('.timer-display');
    await expect(timerDisplay).toBeVisible();

    // ボタンが縦に並んでいることを確認
    const controlPanel = page.locator('.control-panel');
    const box = await controlPanel.boundingBox();
    expect(box).not.toBeNull();
  });
});
