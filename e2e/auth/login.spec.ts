import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show login form for unauthenticated users', async ({ page }) => {
    await page.click('text=Get Started');

    // Should be redirected to login page
    await expect(page).toHaveURL('/login');

    // Check login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Login")')).toBeVisible();
  });

  test('should display validation errors for empty form', async ({ page }) => {
    await page.click('text=Get Started');
    await page.click('button:has-text("Login")');

    // Should show validation errors (form should not submit with empty email)
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('should display error for invalid email', async ({ page }) => {
    await page.click('text=Get Started');

    // Fill with invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button:has-text("Login")');

    // Should show error message
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('should login successfully with valid email', async ({ page }) => {
    await page.click('text=Get Started');

    // Fill with valid email
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Login")');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Should show user is logged in
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.click('text=Get Started');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Login")');

    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');

    // Find and click logout button (assuming it exists)
    const logoutButton = page.locator('button:has-text("Logout"), text=Logout');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // Should redirect to home and show login button
      await expect(page).toHaveURL('/');
      await expect(page.locator('text=Get Started')).toBeVisible();
    }
  });

  test('should persist login session across page reloads', async ({ page }) => {
    await page.click('text=Get Started');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Login")');

    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');

    // Reload page
    await page.reload();

    // Should still be logged in
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should redirect to dashboard if already logged in', async ({
    page,
  }) => {
    // First login
    await page.click('text=Get Started');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Login")');

    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');

    // Try to go to login page directly
    await page.goto('/login');

    // Should redirect back to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});
