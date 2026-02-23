import { test, expect } from '@playwright/test';

test.describe('Checkout Page', () => {
  test('redirects to cart if empty', async ({ page }) => {
    // Clear cart
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('ayanda_cart');
    });

    // Try to access checkout directly
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Should redirect to cart
    await expect(page).toHaveURL(/.*cart/);
  });

  test('displays checkout form with cart items', async ({ page }) => {
    // First add item to cart
    await page.goto('/store');
    await page.waitForLoadState('networkidle');

    const productCards = page.locator('[class*="card"]').filter({ hasText: /R\s*\d/ });

    if (await productCards.count() > 0) {
      await productCards.first().click();
      await page.waitForLoadState('networkidle');

      const addToCartBtn = page.locator('button').filter({ hasText: /add to cart/i });
      if (await addToCartBtn.count() > 0) {
        await addToCartBtn.click();
        await page.waitForTimeout(1500);

        // Navigate to checkout
        await page.goto('/checkout');
        await page.waitForLoadState('networkidle');

        // Should show checkout form
        await expect(page.locator('text=/customer details/i')).toBeVisible();
        await expect(page.locator('text=/payment/i')).toBeVisible();
      }
    }
  });

  test('validates required fields', async ({ page }) => {
    // Setup: add item to cart first
    await page.goto('/store');
    await page.waitForLoadState('networkidle');

    const productCards = page.locator('[class*="card"]').filter({ hasText: /R\s*\d/ });

    if (await productCards.count() > 0) {
      await productCards.first().click();
      await page.waitForLoadState('networkidle');

      const addToCartBtn = page.locator('button').filter({ hasText: /add to cart/i });
      if (await addToCartBtn.count() > 0) {
        await addToCartBtn.click();
        await page.waitForTimeout(1500);

        await page.goto('/checkout');
        await page.waitForLoadState('networkidle');

        // Clear any pre-filled fields
        await page.fill('input[id="firstName"], input[name="firstName"]', '');
        await page.fill('input[id="lastName"], input[name="lastName"]', '');
        await page.fill('input[id="email"], input[name="email"], input[type="email"]', '');

        // Try to submit
        const payBtn = page.locator('button').filter({ hasText: /pay/i });
        await payBtn.click();

        // Should show validation error
        await expect(page.locator('text=/required|fill in/i')).toBeVisible();
      }
    }
  });

  test('shows PayFast payment option', async ({ page }) => {
    // Setup: add item to cart first
    await page.goto('/store');
    await page.waitForLoadState('networkidle');

    const productCards = page.locator('[class*="card"]').filter({ hasText: /R\s*\d/ });

    if (await productCards.count() > 0) {
      await productCards.first().click();
      await page.waitForLoadState('networkidle');

      const addToCartBtn = page.locator('button').filter({ hasText: /add to cart/i });
      if (await addToCartBtn.count() > 0) {
        await addToCartBtn.click();
        await page.waitForTimeout(1500);

        await page.goto('/checkout');
        await page.waitForLoadState('networkidle');

        // Should show PayFast logo
        const payFastLogo = page.locator('img[alt*="PayFast" i]');
        await expect(payFastLogo).toBeVisible();

        // Logo should use local SVG
        await expect(payFastLogo).toHaveAttribute('src', '/payfast.svg');
      }
    }
  });
});
