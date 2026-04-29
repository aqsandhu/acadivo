import { test, expect } from '@playwright/test';

const teacherCredentials = {
  email: 'fatima.zahra@govtpilot.edu.pk',
  password: 'TeacherPass123!',
};

test.describe('E2E: Teacher Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as teacher
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', teacherCredentials.email);
    await page.fill('[data-testid="password-input"]', teacherCredentials.password);
    await page.click('[data-testid="login-btn"]');
    await page.waitForURL('/teacher/dashboard', { timeout: 10000 });
  });

  test('teacher marks attendance', async ({ page }) => {
    // Navigate to attendance page
    await page.click('[data-testid="nav-item-attendance"]');
    await page.waitForURL(/\/attendance/, { timeout: 10000 });

    // Select class
    await page.selectOption('[data-testid="class-select"]', 'cls_8th_a');
    await page.selectOption('[data-testid="section-select"]', 'sec_8th_a');

    // Wait for student list
    await expect(page.locator('[data-testid="attendance-list"]')).toBeVisible();

    // Mark all present
    await page.click('[data-testid="mark-all-present"]');

    // Save attendance
    await page.click('[data-testid="save-attendance-btn"]');

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(/saved|success/i);
  });

  test('teacher creates homework', async ({ page }) => {
    // Navigate to homework page
    await page.click('[data-testid="nav-item-homework"]');
    await page.waitForURL(/\/homework/, { timeout: 10000 });

    // Click create homework
    await page.click('[data-testid="create-homework-btn"]');

    // Fill form
    await page.fill('[data-testid="title-input"]', 'Quadratic Equations - Exercise 5.3');
    await page.fill('[data-testid="description-input"]', 'Complete all problems with detailed steps.');
    await page.selectOption('[data-testid="subject-select"]', 'sub_math_8');
    await page.selectOption('[data-testid="class-select"]', 'cls_8th_a');
    await page.fill('[data-testid="due-date-input"]', '2024-03-25');
    await page.fill('[data-testid="max-marks-input"]', '20');

    // Submit
    await page.click('[data-testid="submit-homework-btn"]');

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="homework-list"]')).toContainText('Quadratic Equations');
  });

  test('teacher grades homework submissions', async ({ page }) => {
    await page.goto('/homework');
    await page.click('[data-testid="homework-item-hw_001"]');
    await page.click('[data-testid="view-submissions-btn"]');

    // Grade first submission
    await page.click('[data-testid="grade-btn-sub_001"]');
    await page.fill('[data-testid="marks-input"]', '18');
    await page.fill('[data-testid="feedback-input"]', 'Excellent work! Minor errors in Q5.');
    await page.click('[data-testid="save-grade-btn"]');

    await expect(page.locator('[data-testid="graded-badge-sub_001"]')).toBeVisible();
  });

  test('teacher enters exam marks', async ({ page }) => {
    await page.click('[data-testid="nav-item-marks"]');
    await page.waitForURL(/\/marks/, { timeout: 10000 });

    await page.selectOption('[data-testid="class-select"]', 'cls_8th_a');
    await page.selectOption('[data-testid="subject-select"]', 'sub_math_8');
    await page.selectOption('[data-testid="exam-type-select"]', 'MID_TERM');

    await expect(page.locator('[data-testid="marks-entry-table"]')).toBeVisible();

    // Enter marks for first student
    await page.fill('[data-testid="marks-std_001"]', '42');
    await page.fill('[data-testid="marks-std_002"]', '45');

    await page.click('[data-testid="save-marks-btn"]');
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('teacher logout', async ({ page }) => {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-btn"]');
    await page.waitForURL('/login', { timeout: 10000 });
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });
});
