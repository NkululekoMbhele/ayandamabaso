import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('home page loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Ayanda Mabaso/);

    // Check hero section is visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('can navigate to store', async ({ page }) => {
    await page.goto('/');

    // Click store link in navigation
    await page.click('a[href="/store"]');

    // Verify we're on the store page
    await expect(page).toHaveURL(/.*store/);
  });

  test('can navigate to booking', async ({ page }) => {
    await page.goto('/');

    await page.click('a[href="/booking"]');

    await expect(page).toHaveURL(/.*booking/);
  });

  test('can navigate to cart', async ({ page }) => {
    await page.goto('/');

    // Click cart icon
    await page.click('a[href="/cart"]');

    await expect(page).toHaveURL(/.*cart/);
  });

  test('can navigate to about', async ({ page }) => {
    await page.goto('/');

    await page.click('a[href="/about"]');

    await expect(page).toHaveURL(/.*about/);
  });

  test('can navigate to contact', async ({ page }) => {
    await page.goto('/');

    await page.click('a[href="/contact"]');

    await expect(page).toHaveURL(/.*contact/);
  });
});

test.describe('Responsive Navigation', () => {
  test('mobile menu button appears on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Mobile menu button should be visible
    const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await expect(menuButton).toBeVisible();
  });
});
