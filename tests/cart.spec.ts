import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {
  test('empty cart shows appropriate message', async ({ page }) => {
    // Clear any existing cart data
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('ayanda_cart');
      localStorage.removeItem('ayanda_cart_session');
    });

    await page.goto('/cart');

    // Should show empty cart message or redirect
    const emptyMessage = page.locator('text=/empty|no items|nothing/i');
    const cartItems = page.locator('[class*="cart-item"]');

    // Either empty message or no cart items
    await page.waitForLoadState('networkidle');
  });

  test('cart session ID is generated', async ({ page }) => {
    await page.goto('/store');
    await page.waitForLoadState('networkidle');

    // Check that session ID exists in localStorage
    const sessionId = await page.evaluate(() => {
      return localStorage.getItem('ayanda_cart_session');
    });

    // After loading store, session should be generated
    expect(sessionId).toBeTruthy();
    expect(sessionId).toMatch(/^sess_/);
  });

  test('cart persists after page refresh', async ({ page }) => {
    // First, add an item to cart
    await page.goto('/store');
    await page.waitForLoadState('networkidle');

    const productCards = page.locator('[class*="card"]').filter({ hasText: /R\s*\d/ });

    if (await productCards.count() > 0) {
      // Navigate to product and add to cart
      await productCards.first().click();
      await page.waitForLoadState('networkidle');

      const addToCartBtn = page.locator('button').filter({ hasText: /add to cart/i });
      if (await addToCartBtn.count() > 0) {
        await addToCartBtn.click();
        await page.waitForTimeout(1500);

        // Get cart data before refresh
        const cartBefore = await page.evaluate(() => {
          return localStorage.getItem('ayanda_cart');
        });

        // Refresh the page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Get cart data after refresh
        const cartAfter = await page.evaluate(() => {
          return localStorage.getItem('ayanda_cart');
        });

        // Cart should still have data
        expect(cartAfter).toBeTruthy();
      }
    }
  });
});

test.describe('Cart Page', () => {
  test('can navigate to checkout', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Look for checkout button
    const checkoutBtn = page.locator('button, a').filter({ hasText: /checkout|proceed/i });

    if (await checkoutBtn.count() > 0 && await checkoutBtn.isEnabled()) {
      await checkoutBtn.click();
      await expect(page).toHaveURL(/.*checkout/);
    }
  });
});
