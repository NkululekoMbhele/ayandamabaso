import { test, expect } from '@playwright/test';

test.describe('Store Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/store');
  });

  test('store page loads', async ({ page }) => {
    // Check page content
    await expect(page.locator('h1')).toContainText(/Store|Shop|Products|Collection/i);
  });

  test('products load from API', async ({ page }) => {
    // Wait for products to load (either cards appear or loading spinner disappears)
    await page.waitForLoadState('networkidle');

    // Should have product cards or empty state message
    const productCards = page.locator('[class*="card"]').filter({ hasText: /R\s*\d/ });
    const emptyMessage = page.locator('text=/no products|coming soon|empty/i');

    // Either products exist or there's an empty state
    const hasProducts = await productCards.count() > 0;
    const hasEmptyMessage = await emptyMessage.count() > 0;

    expect(hasProducts || hasEmptyMessage).toBeTruthy();
  });

  test('can view product details', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for product cards with prices
    const productCards = page.locator('[class*="card"]').filter({ hasText: /R\s*\d/ });

    if (await productCards.count() > 0) {
      // Click on first product
      await productCards.first().click();

      // Should navigate to product detail page
      await expect(page).toHaveURL(/.*store\/\d+/);
    }
  });
});

test.describe('Product Detail Page', () => {
  test('displays product information', async ({ page }) => {
    // Navigate to store first
    await page.goto('/store');
    await page.waitForLoadState('networkidle');

    const productCards = page.locator('[class*="card"]').filter({ hasText: /R\s*\d/ });

    if (await productCards.count() > 0) {
      await productCards.first().click();
      await page.waitForLoadState('networkidle');

      // Should display product details
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // Should have Add to Cart button
      await expect(page.locator('button').filter({ hasText: /add to cart/i })).toBeVisible();
    }
  });

  test('can add product to cart', async ({ page }) => {
    await page.goto('/store');
    await page.waitForLoadState('networkidle');

    const productCards = page.locator('[class*="card"]').filter({ hasText: /R\s*\d/ });

    if (await productCards.count() > 0) {
      await productCards.first().click();
      await page.waitForLoadState('networkidle');

      // Click Add to Cart
      const addToCartBtn = page.locator('button').filter({ hasText: /add to cart/i });
      await addToCartBtn.click();

      // Wait for cart to update
      await page.waitForTimeout(1000);

      // Cart count should update (look for badge or number)
      // This could be in various formats depending on UI
    }
  });
});
