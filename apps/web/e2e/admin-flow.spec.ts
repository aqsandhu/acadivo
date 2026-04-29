import { test, expect } from '@playwright/test';

const adminCredentials = {
  email: 'admin@acadivo.edu.pk',
  password: 'AdminPass123!',
};

test.describe('E2E: Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', adminCredentials.email);
    await page.fill('[data-testid="password-input"]', adminCredentials.password);
    await page.click('[data-testid="login-btn"]');
    await page.waitForURL('/admin/dashboard', { timeout: 10000 });
  });

  test('admin creates teacher', async ({ page }) => {
    await page.click('[data-testid="nav-item-teachers"]');
    await page.click('[data-testid="add-teacher-btn"]');

    await page.fill('[data-testid="name-input"]', 'Ayesha Siddiqui');
    await page.fill('[data-testid="email-input"]', 'ayesha.siddiqui@govtpilot.edu.pk');
    await page.fill('[data-testid="password-input"]', 'TeacherPass123!');
    await page.fill('[data-testid="phone-input"]', '+92-300-9998887');
    await page.fill('[data-testid="employee-id-input"]', 'EMP-2024-015');
    await page.selectOption('[data-testid="qualification-select"]', 'MSc English');
    await page.selectOption('[data-testid="specialization-select"]', 'English');

    await page.click('[data-testid="save-teacher-btn"]');
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('admin creates student', async ({ page }) => {
    await page.click('[data-testid="nav-item-students"]');
    await page.click('[data-testid="add-student-btn"]');

    await page.fill('[data-testid="name-input"]', 'Hassan Raza');
    await page.fill('[data-testid="email-input"]', 'hassan.raza.student@example.com');
    await page.fill('[data-testid="password-input"]', 'StudentPass123!');
    await page.fill('[data-testid="roll-number-input"]', 'R-2024-009-A');
    await page.fill('[data-testid="dob-input"]', '2010-08-20');
    await page.selectOption('[data-testid="gender-select"]', 'MALE');
    await page.selectOption('[data-testid="class-select"]', 'cls_8th_a');
    await page.fill('[data-testid="parent-name-input"]', 'Raza Ahmed');
    await page.fill('[data-testid="parent-phone-input"]', '+92-300-4445556');

    await page.click('[data-testid="save-student-btn"]');
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('admin logout', async ({ page }) => {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-btn"]');
    await page.waitForURL('/login', { timeout: 10000 });
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });
});
