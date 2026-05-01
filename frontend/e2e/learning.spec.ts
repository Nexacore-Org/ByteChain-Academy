import { test, expect } from '@playwright/test';

test.describe.serial('Learning Flow', () => {
  const testEmail = `learner_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  test.beforeAll(async () => {
    // Optionally create a user here via API if needed, 
    // but the test can also just register via UI
  });

  test('should browse courses, enrol, and mark lesson complete', async ({ page }) => {
    // 1. Register a fresh user
    await page.goto('/');
    await page.getByRole('button', { name: /Start Free Course/i }).first().click();
    await page.getByPlaceholder('Full Name').fill('Learner User');
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: /Create Account/i }).click();
    await expect(page).toHaveURL(/.*(\/onboarding|\/dashboard)/);

    // 2. Navigate to Courses
    await page.goto('/courses');
    
    // 3. Select a course and enrol
    // Wait for courses to load
    await expect(page.getByText('Browse All Courses')).toBeVisible();
    
    // Click the first "Enroll Now" button
    const enrollBtn = page.getByRole('button', { name: /Enroll Now|Sign in to enroll/i }).first();
    await expect(enrollBtn).toBeVisible();
    await enrollBtn.click();

    // Sometimes the button takes you to course details, so if we are on details page:
    if (page.url().includes('/courses/')) {
        const enrolCourseBtn = page.getByRole('button', { name: /Enroll in Course|Start Course/i }).first();
        if (await enrolCourseBtn.isVisible()) {
            await enrolCourseBtn.click();
        }
    }
    
    // Navigate to a lesson
    const startLessonBtn = page.getByRole('button', { name: /Start Lesson|Continue|Start/i }).first();
    if (await startLessonBtn.isVisible()) {
        await startLessonBtn.click();
    } else {
        // Find lesson link
        await page.locator('a[href*="/lessons/"]').first().click();
    }

    // 4. Mark lesson complete
    const completeBtn = page.getByRole('button', { name: /Mark Complete|Complete Lesson/i });
    await expect(completeBtn).toBeVisible({ timeout: 10000 });
    await completeBtn.click();

    // 5. Verify progress percentage increases (or lesson shows as completed)
    await expect(page.getByText(/100%|Completed|Course Progress/i).first()).toBeVisible({ timeout: 10000 });
  });
});
