import { test, expect } from '@playwright/test';

const parentCredentials = {
  email: 'raza.ahmed@example.com',
  password: 'ParentPass123!',
};

test.describe('E2E: Parent Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', parentCredentials.email);
    await page.fill('[data-testid="password-input"]', parentCredentials.password);
    await page.click('[data-testid="login-btn"]');
    await page.waitForURL('/parent/dashboard', { timeout: 10000 });
  });

  test('parent views child overview', async ({ page }) => {
    await expect(page.locator('[data-testid="parent-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="child-name"]')).toContainText('Ahmad Raza');
    await expect(page.locator('[data-testid="child-attendance"]')).toContainText('92%');
  });

  test('parent requests progress report', async ({ page }) => {
    await page.click('[data-testid="request-report-btn"]');
    await page.fill('[data-testid="request-message"]', 'Please provide monthly progress report for March.');
    await page.click('[data-testid="submit-request-btn"]');

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('parent views fee status', async ({ page }) => {
    await page.click('[data-testid="nav-item-fee"]');
    await page.waitForURL(/\/fee/, { timeout: 10000 });

    await expect(page.locator('[data-testid="fee-status-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="fee-status-list"]')).toContainText('PKR');
  });

  test('parent messages teacher', async ({ page }) => {
    await page.click('[data-testid="nav-item-messages"]');
    await page.waitForURL(/\/messages/, { timeout: 10000 });

    await page.click('[data-testid="new-message-btn"]');
    await page.selectOption('[data-testid="teacher-select"]', 'usr_teacher_001');
    await page.fill('[data-testid="message-input"]', 'Assalam-o-Alaikum, can we schedule a meeting?');
    await page.click('[data-testid="send-message-btn"]');

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('parent logout', async ({ page }) => {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-btn"]');
    await page.waitForURL('/login', { timeout: 10000 });
  });
});
