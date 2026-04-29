import { test, expect } from '@playwright/test';

const studentCredentials = {
  email: 'ahmad.raza.student@example.com',
  password: 'StudentPass123!',
};

test.describe('E2E: Student Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', studentCredentials.email);
    await page.fill('[data-testid="password-input"]', studentCredentials.password);
    await page.click('[data-testid="login-btn"]');
    await page.waitForURL('/student/dashboard', { timeout: 10000 });
  });

  test('student views homework', async ({ page }) => {
    await page.click('[data-testid="nav-item-homework"]');
    await page.waitForURL(/\/homework/, { timeout: 10000 });

    await expect(page.locator('[data-testid="homework-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="homework-list"]')).toContainText('Mathematics');
  });

  test('student submits homework', async ({ page }) => {
    await page.goto('/homework');
    await page.click('[data-testid="homework-item-hw_001"]');
    await page.click('[data-testid="submit-homework-btn"]');

    await page.fill('[data-testid="submission-text"]', 'Completed all 12 problems with detailed steps.');
    await page.click('[data-testid="upload-attachment-btn"]');

    await page.click('[data-testid="submit-btn"]');
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('student asks question', async ({ page }) => {
    await page.click('[data-testid="nav-item-messages"]');
    await page.waitForURL(/\/messages/, { timeout: 10000 });

    await page.click('[data-testid="ask-question-btn"]');
    await page.fill('[data-testid="question-input"]', 'How do we factorize quadratic equations?');
    await page.selectOption('[data-testid="subject-select"]', 'sub_math_8');

    await page.click('[data-testid="submit-question-btn"]');
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('student views timetable', async ({ page }) => {
    await page.click('[data-testid="nav-item-timetable"]');
    await page.waitForURL(/\/timetable/, { timeout: 10000 });

    await expect(page.locator('[data-testid="timetable-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="period-1"]')).toContainText('Mathematics');
  });

  test('student logout', async ({ page }) => {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-btn"]');
    await page.waitForURL('/login', { timeout: 10000 });
  });
});
