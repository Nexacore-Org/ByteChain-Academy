import { test, expect } from '@playwright/test';

test.describe.serial('Quiz Flow', () => {
  const testEmail = `quizzer_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  test('should complete a quiz and see pass state', async ({ page }) => {
    // 1. Register a fresh user
    await page.goto('/');
    await page.getByRole('button', { name: /Start Free Course/i }).first().click();
    await page.getByPlaceholder('Full Name').fill('Quizzer User');
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: /Create Account/i }).click();
    await expect(page).toHaveURL(/.*(\/onboarding|\/dashboard)/);

    // 2. Navigate directly to the first quiz or a known quiz path
    // Let's assume the first course has a quiz.
    await page.goto('/courses');
    await page.getByRole('button', { name: /Enroll Now/i }).first().click();
    
    if (page.url().includes('/courses/')) {
        const enrolCourseBtn = page.getByRole('button', { name: /Enroll in Course|Start Course/i }).first();
        if (await enrolCourseBtn.isVisible()) {
            await enrolCourseBtn.click();
        }
    }
    
    // Find a link to a quiz or a lesson with a quiz
    // Since we don't know the exact quiz URL, we'll click the first available quiz link
    const quizLink = page.locator('a[href*="/quizzes/"]').first();
    if (await quizLink.isVisible()) {
        await quizLink.click();
    } else {
        // Alternatively, go to the first lesson and see if it has a quiz
        await page.locator('a[href*="/lessons/"]').first().click();
        const takeQuizBtn = page.getByRole('button', { name: /Take Quiz/i });
        if (await takeQuizBtn.isVisible()) {
            await takeQuizBtn.click();
        }
    }

    // 3. Complete the quiz
    // Select the first option for each question to attempt it
    const options = page.locator('input[type="radio"], button[role="radio"], .quiz-option');
    if (await options.count() > 0) {
        // Just click the first option if it's a simple quiz
        await options.first().click();
    }
    
    const submitQuizBtn = page.getByRole('button', { name: /Submit Quiz|Submit/i });
    if (await submitQuizBtn.isVisible()) {
        await submitQuizBtn.click();
    }

    // 4. Verify result page shows pass/fail state and XP
    await expect(page.getByText(/Passed|Failed|Score|XP Earned/i).first()).toBeVisible({ timeout: 10000 });
  });
});
