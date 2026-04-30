import { test, expect } from '@playwright/test';

test.describe.serial('Authentication Flow', () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Playwright Tester';

  test('should register a new user', async ({ page }) => {
    await page.goto('/');

    // Open signup modal
    await page.getByRole('button', { name: /Start Free Course/i }).first().click();

    // Fill the form
    await page.getByPlaceholder('Full Name').fill(testName);
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);

    // Submit
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Verify redirection to onboarding or dashboard
    await expect(page).toHaveURL(/.*(\/onboarding|\/dashboard)/);
  });

  test('should login and logout', async ({ page }) => {
    await page.goto('/');

    // Open login modal
    await page.getByRole('button', { name: /Log in/i }).click();

    // Fill the form
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);

    // Submit
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Verify redirection to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Logout
    await page.locator('button[aria-haspopup="true"]').first().click(); // Account dropdown
    await page.getByRole('menuitem', { name: /Logout/i }).click();

    // Verify redirection to home
    await expect(page).toHaveURL(/.*\//);
    await expect(page.getByRole('button', { name: /Log in/i })).toBeVisible();
  });
});
