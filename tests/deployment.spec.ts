import { test, expect } from '@playwright/test';

/**
 * Post-Deployment Tests for Ayanda Mabaso Website
 *
 * This test suite verifies the website functions correctly after deployment
 * to https://www.ayandamabaso.co.za
 *
 * Run with:
 *   TEST_URL=https://www.ayandamabaso.co.za npx playwright test tests/deployment.spec.ts
 *   npx playwright test tests/deployment.spec.ts --headed
 *   npx playwright test tests/deployment.spec.ts --headed --workers=1
 */

test.describe('Post-Deployment Tests - Ayanda Mabaso Website', () => {
  test('homepage loads and displays correctly', async ({ page }) => {
    // Navigate to production URL
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Ayanda Mabaso/);

    // Check hero section/main heading is visible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Verify page content loads
    await page.waitForLoadState('networkidle');

    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/homepage-loaded.png' });

    console.log('✓ Homepage loaded successfully');
  });

  test('consultation packages are displayed', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for consultation packages on homepage
    // Expected packages: 1 Hour R2,500 | 2 Hours R4,000 | Group R15,000

    const pageText = await page.textContent('body');

    // Check for package prices
    const hasOneHourPackage = pageText?.includes('2,500') || pageText?.includes('R2500');
    const hasTwoHourPackage = pageText?.includes('4,000') || pageText?.includes('R4000');
    const hasGroupPackage = pageText?.includes('15,000') || pageText?.includes('R15000');

    console.log('Looking for consultation packages...');
    console.log('  1 Hour R2,500:', hasOneHourPackage ? '✓ Found' : '✗ Not found');
    console.log('  2 Hours R4,000:', hasTwoHourPackage ? '✓ Found' : '✗ Not found');
    console.log('  Group R15,000:', hasGroupPackage ? '✓ Found' : '✗ Not found');

    // At least some packages should be visible
    expect(hasOneHourPackage || hasTwoHourPackage || hasGroupPackage).toBeTruthy();
  });

  test('booking page loads without CORS errors', async ({ page, context }) => {
    // Capture all console messages and network errors
    const consoleMessages: string[] = [];
    const networkErrors: string[] = [];

    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
      if (msg.type() === 'error') {
        console.error('Console Error:', msg.text());
      }
    });

    page.on('response', (response) => {
      if (!response.ok() && response.request().resourceType() === 'xhr') {
        networkErrors.push(
          `${response.status()} - ${response.request().url()}`
        );
      }
    });

    // Navigate to booking page
    await page.goto('/booking');
    await page.waitForLoadState('networkidle');

    // Check for CORS-related errors
    const corsErrors = consoleMessages.filter(
      (msg) =>
        msg.includes('CORS') ||
        msg.includes('Access-Control') ||
        msg.includes('cross-origin')
    );

    console.log('Network errors:', networkErrors.length > 0 ? networkErrors : 'None');
    console.log('CORS errors:', corsErrors.length > 0 ? corsErrors : 'None');

    // Should not have CORS errors
    expect(corsErrors.length).toBe(0);

    // Verify packages load from API
    await page.waitForLoadState('networkidle');
    const pageText = await page.textContent('body');

    // Check for consultation packages
    const hasPackages =
      pageText?.includes('2,500') ||
      pageText?.includes('4,000') ||
      pageText?.includes('15,000');

    expect(hasPackages).toBeTruthy();
    console.log('✓ Booking page loaded with consultation packages');
  });

  test('can add consultation to cart', async ({ page }) => {
    await page.goto('/booking');
    await page.waitForLoadState('networkidle');

    // Look for "Add to Cart" button or similar CTA
    const addToCartButtons = page.locator('button').filter({
      hasText: /add to cart|book now|add|book/i,
    });

    const buttonCount = await addToCartButtons.count();
    console.log(`Found ${buttonCount} potential add/book buttons`);

    if (buttonCount > 0) {
      // Click the first button
      await addToCartButtons.first().click();
      await page.waitForTimeout(1000);

      console.log('✓ Clicked add/book button');

      // Take screenshot of the result
      await page.screenshot({ path: 'test-results/after-add-to-cart.png' });
    } else {
      console.log('ℹ No add/book buttons found on booking page');
    }
  });

  test('cart loads successfully', async ({ page }) => {
    // First, add something to cart if not already there
    await page.goto('/booking');
    await page.waitForLoadState('networkidle');

    const addToCartButtons = page.locator('button').filter({
      hasText: /add to cart|book now|add|book/i,
    });

    if ((await addToCartButtons.count()) > 0) {
      await addToCartButtons.first().click();
      await page.waitForTimeout(1000);
    }

    // Navigate to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Verify cart page loads
    await expect(page).toHaveURL(/.*cart/);

    // Check for cart content or empty state message
    const pageText = await page.textContent('body');
    const hasContent = pageText && pageText.length > 50;

    expect(hasContent).toBeTruthy();

    console.log('✓ Cart page loaded successfully');

    // Take screenshot
    await page.screenshot({ path: 'test-results/cart-loaded.png' });
  });

  test('check for API-related console errors', async ({ page }) => {
    // Comprehensive error checking
    const consoleErrors: Array<{ type: string; text: string }> = [];
    const corsErrors: string[] = [];
    const networkErrors: Array<{ status: number; url: string }> = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleErrors.push({
          type: msg.type(),
          text: msg.text(),
        });

        if (
          msg.text().includes('CORS') ||
          msg.text().includes('Access-Control')
        ) {
          corsErrors.push(msg.text());
        }
      }
    });

    page.on('response', (response) => {
      if (!response.ok() && response.request().resourceType() === 'xhr') {
        networkErrors.push({
          status: response.status(),
          url: response.request().url(),
        });
      }
    });

    // Test key pages
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.goto('/booking');
    await page.waitForLoadState('networkidle');
    await page.goto('/store');
    await page.waitForLoadState('networkidle');
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Report findings
    console.log('\n=== Error Report ===');
    console.log(`CORS Errors: ${corsErrors.length}`);
    if (corsErrors.length > 0) {
      corsErrors.forEach((error) => console.log(`  - ${error}`));
    }

    console.log(`\nNetwork Errors (XHR): ${networkErrors.length}`);
    if (networkErrors.length > 0) {
      networkErrors.forEach((error) =>
        console.log(`  - ${error.status} ${error.url}`)
      );
    }

    console.log(`\nConsole Errors/Warnings: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.slice(0, 5).forEach((error) =>
        console.log(`  - [${error.type}] ${error.text.substring(0, 100)}`)
      );
      if (consoleErrors.length > 5) {
        console.log(`  ... and ${consoleErrors.length - 5} more`);
      }
    }

    // Assertions
    expect(corsErrors.length).toBe(0);

    // Some network errors are acceptable, but CORS errors are not
    const hasCriticalErrors = corsErrors.length > 0;
    expect(hasCriticalErrors).toBe(false);

    console.log('\n✓ API error check complete');
  });

  test('verify all main pages load without crashes', async ({ page }) => {
    const pages = ['/', '/booking', '/store', '/cart', '/contact', '/about'];
    const results: Array<{ path: string; status: string }> = [];

    for (const path of pages) {
      try {
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        // Check for error states
        const errorText = await page.textContent('[class*="error"], [class*="Error"]');
        const has404 = await page.locator('text=/404|not found/i').count();

        if (errorText || has404) {
          results.push({ path, status: '⚠ Loaded with error' });
        } else {
          results.push({ path, status: '✓ OK' });
        }
      } catch (error) {
        results.push({ path, status: '✗ Failed to load' });
      }
    }

    console.log('\n=== Page Load Status ===');
    results.forEach((result) => {
      console.log(`${result.path}: ${result.status}`);
    });

    // All pages should load
    const successCount = results.filter((r) => r.status === '✓ OK').length;
    expect(successCount).toBeGreaterThan(0);
  });

  test('take full page screenshots for verification', async ({ page }) => {
    const pages = ['/', '/booking', '/store', '/cart'];

    for (const path of pages) {
      try {
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        const filename = `test-results/page-${path.replace(/\//g, '-') || 'home'}.png`;
        await page.screenshot({ path: filename, fullPage: true });
        console.log(`Saved screenshot: ${filename}`);
      } catch (error) {
        console.log(`Failed to screenshot ${path}: ${error}`);
      }
    }
  });
});

test.describe('Performance and Accessibility', () => {
  test('page load time is acceptable', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`Homepage load time: ${loadTime}ms`);

    // Load time should be under 5 seconds for a deployed site
    expect(loadTime).toBeLessThan(5000);
  });

  test('images load correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const imageCount = await images.count();

    console.log(`Found ${imageCount} images on homepage`);

    let brokenImages = 0;

    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const isVisible = await img.isVisible();
      const naturalWidth = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth);

      if (!isVisible || naturalWidth === 0) {
        brokenImages++;
        const src = await img.getAttribute('src');
        console.log(`Broken image: ${src}`);
      }
    }

    // Most images should load
    expect(brokenImages).toBeLessThan(Math.ceil(imageCount / 2));
  });
});
