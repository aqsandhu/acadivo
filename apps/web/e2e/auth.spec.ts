import { test, expect } from '@playwright/test';

const testUsers = {
  teacher: {
    email: 'fatima.zahra@govtpilot.edu.pk',
    password: 'TeacherPass123!',
    name: 'Fatima Zahra',
  },
  student: {
    email: 'ahmad.raza.student@example.com',
    password: 'StudentPass123!',
    name: 'Ahmad Raza',
  },
  parent: {
    email: 'raza.ahmed@example.com',
    password: 'ParentPass123!',
    name: 'Raza Ahmed',
  },
  admin: {
    email: 'admin@acadivo.edu.pk',
    password: 'AdminPass123!',
    name: 'System Administrator',
  },
};

test.describe('E2E: Authentication Flow', () => {
  test('login → dashboard → logout for teacher', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login|Acadivo/);

    // Fill login form
    await page.fill('[data-testid="email-input"]', testUsers.teacher.email);
    await page.fill('[data-testid="password-input"]', testUsers.teacher.password);
    await page.click('[data-testid="login-btn"]');

    // Should redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('Dashboard');

    // Verify user info is displayed
    await expect(page.locator('[data-testid="user-name"]')).toContainText(testUsers.teacher.name);

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-btn"]');

    // Should redirect to login
    await page.waitForURL('/login', { timeout: 10000 });
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUsers.teacher.email);
    await page.fill('[data-testid="password-input"]', 'WrongPassword123!');
    await page.click('[data-testid="login-btn"]');

    await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-error"]')).toContainText(/invalid|incorrect|wrong/i);
  });

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('/login', { timeout: 10000 });
    await expect(page).toHaveURL('/login');
  });

  test('forgot password flow', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('h1')).toContainText(/forgot password/i);

    await page.fill('[data-testid="email-input"]', 'test@school.edu.pk');
    await page.click('[data-testid="submit-btn"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText(/sent|check your email/i);
  });
});
