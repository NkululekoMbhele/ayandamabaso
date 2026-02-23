# Ayanda Mabaso - Comprehensive Testing Guide

This document provides complete testing procedures for the Ayanda Mabaso website, covering manual testing, automated testing with Playwright, and UAT verification.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Test Environments](#test-environments)
3. [Manual Testing Checklist](#manual-testing-checklist)
4. [Playwright Automated Tests](#playwright-automated-tests)
5. [API Integration Testing](#api-integration-testing)
6. [Common Issues & Solutions](#common-issues--solutions)

---

## Environment Setup

### Prerequisites

```bash
# Ensure Node.js v18+ is installed
node --version

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Environment Variables

Create `.env` file with:

```env
VITE_API_URL=https://api.tredicik.com/api/external/v1
VITE_API_KEY=pk_live_tenant_41
```

For UAT testing:
```env
VITE_API_URL=https://api-uat.tredicik.com/api/external/v1
VITE_API_KEY=pk_test_tenant_41
```

---

## Test Environments

| Environment | Frontend URL | API URL |
|-------------|--------------|---------|
| Local Dev | http://localhost:5176 | http://localhost:8080/api/external/v1 |
| UAT | https://d1s5gxldjthzj1.cloudfront.net | https://api-uat.tredicik.com/api/external/v1 |
| Production | https://ayandamabaso.co.za | https://api.tredicik.com/api/external/v1 |

---

## Manual Testing Checklist

### 1. Landing Page (`/`)

- [ ] Hero section displays correctly with background image
- [ ] "Shop Collection" button navigates to `/store`
- [ ] "Book Consultation" button navigates to `/booking`
- [ ] Featured products section loads products from API
- [ ] Services section displays all service cards
- [ ] Testimonials section renders properly
- [ ] Footer links work correctly
- [ ] Mobile responsive layout

### 2. Navigation

- [ ] Logo links to home page
- [ ] All navigation links work (Home, Store, Booking, About, Contact)
- [ ] Cart icon shows correct item count
- [ ] Login/Register modal opens correctly
- [ ] Mobile hamburger menu works
- [ ] Sticky header on scroll

### 3. Store Page (`/store`)

- [ ] Products load from API
- [ ] Product cards display image, name, price
- [ ] Category filter works
- [ ] Price filter works
- [ ] Search functionality works
- [ ] Click product navigates to detail page
- [ ] "Add to Cart" button works
- [ ] Loading state shows spinner
- [ ] Empty state message when no products

### 4. Product Detail Page (`/store/[id]`)

- [ ] Product image displays correctly
- [ ] Product name and description show
- [ ] Price displays in ZAR (R format)
- [ ] Quantity selector works (+/- buttons)
- [ ] "Add to Cart" button adds to cart
- [ ] Toast notification appears on add
- [ ] Related products section loads
- [ ] Back button returns to store

### 5. Cart Page (`/cart`)

- [ ] Shows all cart items
- [ ] Item quantities can be updated
- [ ] Remove item button works
- [ ] Subtotal calculates correctly
- [ ] Promo code input works
- [ ] "Proceed to Checkout" button navigates
- [ ] Empty cart message when no items
- [ ] **Cart persists after page refresh** (Critical!)

### 6. Checkout Page (`/checkout`)

- [ ] Customer details form displays
- [ ] Pre-fills data for logged-in users
- [ ] Shipping address shows for physical products
- [ ] Digital delivery message shows for digital products
- [ ] PayFast payment section displays with local SVG
- [ ] Order summary shows all items
- [ ] Promo discount shows if applied
- [ ] Total calculates correctly
- [ ] "Pay" button initiates checkout
- [ ] Redirects to PayFast for payment
- [ ] **Session ID sent with order creation** (Critical!)

### 7. Checkout Success (`/checkout/success`)

- [ ] Success message displays
- [ ] Order number shown
- [ ] Order details displayed
- [ ] "Continue Shopping" button works
- [ ] Email confirmation message shown

### 8. Checkout Cancelled (`/checkout/cancelled`)

- [ ] Cancellation message displays
- [ ] "Return to Cart" button works
- [ ] "Try Again" button works

### 9. Booking Page (`/booking`)

- [ ] Package selection loads packages from API
- [ ] Package cards show name, description, price
- [ ] Date picker works
- [ ] Time slots load for selected date
- [ ] Available/unavailable slots distinguished
- [ ] Booking form collects required info
- [ ] Submit creates booking
- [ ] Confirmation displays after booking

### 10. Dashboard (`/dashboard`)

- [ ] Requires authentication (redirects if not logged in)
- [ ] User profile displays correctly
- [ ] Order history loads
- [ ] Order status shows correctly
- [ ] Appointment history loads
- [ ] Logout button works

### 11. Authentication

- [ ] Login modal opens
- [ ] Login with valid credentials works
- [ ] Login error message for invalid credentials
- [ ] Register modal opens
- [ ] Registration creates new account
- [ ] Validation errors display
- [ ] Logout clears session
- [ ] Protected routes redirect to login

### 12. Contact Page (`/contact`)

- [ ] Contact form displays
- [ ] All fields validate
- [ ] Form submission works
- [ ] Success message displays
- [ ] Contact information shows

### 13. About Page (`/about`)

- [ ] Page loads correctly
- [ ] Images display
- [ ] Content renders

### 14. Speaking Page (`/speaking`)

- [ ] Page loads correctly
- [ ] Content renders

---

## Playwright Automated Tests

### Setup

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.TEST_URL || 'http://localhost:5176',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Test Files

Create `tests/` directory with the following test files:

#### `tests/navigation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all main pages', async ({ page }) => {
    await page.goto('/');

    // Store
    await page.click('text=Store');
    await expect(page).toHaveURL(/.*store/);

    // Booking
    await page.click('text=Booking');
    await expect(page).toHaveURL(/.*booking/);

    // About
    await page.click('text=About');
    await expect(page).toHaveURL(/.*about/);

    // Contact
    await page.click('text=Contact');
    await expect(page).toHaveURL(/.*contact/);

    // Home (logo click)
    await page.click('[data-testid="logo"]');
    await expect(page).toHaveURL('/');
  });

  test('should show mobile menu on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });
});
```

#### `tests/store.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Store', () => {
  test('should load products', async ({ page }) => {
    await page.goto('/store');

    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({
      timeout: 10000
    });

    // Should have multiple products
    const products = page.locator('[data-testid="product-card"]');
    await expect(products).toHaveCount.greaterThan(0);
  });

  test('should navigate to product detail', async ({ page }) => {
    await page.goto('/store');

    await page.locator('[data-testid="product-card"]').first().click();

    await expect(page).toHaveURL(/.*store\/\d+/);
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    await page.goto('/store');

    // Click first product
    await page.locator('[data-testid="product-card"]').first().click();

    // Add to cart
    await page.click('text=Add to Cart');

    // Verify cart count updated
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
  });
});
```

#### `tests/cart.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Add item to cart first
    await page.goto('/store');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.click('text=Add to Cart');
  });

  test('should display cart items', async ({ page }) => {
    await page.goto('/cart');

    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
  });

  test('should persist cart after refresh', async ({ page }) => {
    await page.goto('/cart');

    // Get initial cart count
    const initialCount = await page.locator('[data-testid="cart-item"]').count();

    // Refresh page
    await page.reload();

    // Cart should still have items
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(initialCount);
  });

  test('should update quantity', async ({ page }) => {
    await page.goto('/cart');

    // Increase quantity
    await page.click('[data-testid="quantity-increase"]');

    // Verify quantity updated
    await expect(page.locator('[data-testid="item-quantity"]')).toContainText('2');
  });

  test('should remove item', async ({ page }) => {
    await page.goto('/cart');

    await page.click('[data-testid="remove-item"]');

    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });
});
```

#### `tests/checkout.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    // Add item to cart
    await page.goto('/store');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.click('text=Add to Cart');
    await page.goto('/cart');
    await page.click('text=Proceed to Checkout');
  });

  test('should display checkout form', async ({ page }) => {
    await expect(page.locator('text=Customer Details')).toBeVisible();
    await expect(page.locator('text=Payment Method')).toBeVisible();
    await expect(page.locator('text=Order Summary')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Clear fields and try to submit
    await page.fill('#firstName', '');
    await page.fill('#lastName', '');
    await page.fill('#email', '');

    await page.click('text=Pay');

    await expect(page.locator('text=Please fill in all required fields')).toBeVisible();
  });

  test('should show PayFast logo', async ({ page }) => {
    const payFastLogo = page.locator('img[alt="PayFast"]');
    await expect(payFastLogo).toBeVisible();
    await expect(payFastLogo).toHaveAttribute('src', '/payfast.svg');
  });
});
```

#### `tests/booking.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Booking', () => {
  test('should load booking packages', async ({ page }) => {
    await page.goto('/booking');

    await expect(page.locator('[data-testid="package-card"]').first()).toBeVisible({
      timeout: 10000
    });
  });

  test('should select package and show date picker', async ({ page }) => {
    await page.goto('/booking');

    await page.locator('[data-testid="package-card"]').first().click();

    await expect(page.locator('[data-testid="date-picker"]')).toBeVisible();
  });

  test('should show time slots for selected date', async ({ page }) => {
    await page.goto('/booking');

    // Select package
    await page.locator('[data-testid="package-card"]').first().click();

    // Select a date
    await page.locator('[data-testid="calendar-day"]:not([disabled])').first().click();

    // Should show time slots
    await expect(page.locator('[data-testid="time-slot"]').first()).toBeVisible({
      timeout: 10000
    });
  });
});
```

#### `tests/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should open login modal', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Login');

    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Login');
    await page.fill('#login-email', 'invalid@test.com');
    await page.fill('#login-password', 'wrongpassword');
    await page.click('[data-testid="login-submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should redirect to login for protected routes', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to home or show login modal
    await expect(page).toHaveURL('/');
  });
});
```

### Running Tests

```bash
# Run all tests
npx playwright test

# Run tests with UI
npx playwright test --ui

# Run specific test file
npx playwright test tests/cart.spec.ts

# Run tests against UAT
TEST_URL=https://d1s5gxldjthzj1.cloudfront.net npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Generate test report
npx playwright show-report
```

---

## API Integration Testing

### Test Session ID Persistence

```bash
# Open browser console and verify:
localStorage.getItem('ayanda_cart_session')
# Should return a session ID like: sess_abc123xyz789

# Add item to cart, refresh, check console:
# Should see: "Cart restored from storage: X items"
# Should NOT see: "Cart loaded: undefined items" after
```

### Test API Headers

Use browser Network tab to verify requests include:

1. **X-API-Key**: Should be present on all API requests
2. **X-Session-Id**: Should be present for cart/order operations
3. **Authorization**: Should be present when logged in

### Critical API Endpoints to Test

| Endpoint | Method | Test |
|----------|--------|------|
| `/offerings` | GET | Products load |
| `/cart` | GET | Cart retrieves with session |
| `/cart/items` | POST | Add to cart works |
| `/cart/items/{id}` | PUT | Update quantity works |
| `/cart/items/{id}` | DELETE | Remove item works |
| `/orders` | POST | Order creates with session |
| `/checkout/orders/{id}/initialize` | POST | Payment initializes |
| `/bookings/packages` | GET | Packages load |
| `/bookings/availability` | GET | Slots load |
| `/bookings` | POST | Booking creates |

---

## Common Issues & Solutions

### Issue: Cart Empty After Refresh

**Symptoms:**
- Console shows "Cart loaded: undefined items"
- Cart items disappear after page refresh

**Solution:**
1. Verify `ayanda_cart_session` exists in localStorage
2. Check Network tab for `X-Session-Id` header on cart requests
3. Verify CORS allows `X-Session-Id` header

### Issue: Checkout "Cart is empty or not found" (400)

**Symptoms:**
- Clicking Pay returns 400 error
- Console shows cart has items but checkout fails

**Solution:**
1. Verify checkout page sends `X-Session-Id` header
2. Check `localStorage.getItem('ayanda_cart_session')` returns value
3. Verify order creation uses direct API call (not SDK)

### Issue: CORS Errors

**Symptoms:**
- Network requests fail with CORS error
- Preflight OPTIONS returns error

**Solution:**
1. Verify frontend domain in backend ALLOWED_ORIGINS
2. Verify `X-Session-Id` in backend CORS allow_headers
3. Check backend is running with correct config

### Issue: Products Not Loading

**Symptoms:**
- Store shows empty or loading forever
- Console shows 401 or 403 errors

**Solution:**
1. Verify `VITE_API_KEY` is correct for environment
2. Check API URL is correct
3. Verify tenant ID matches API key

### Issue: PayFast Not Redirecting

**Symptoms:**
- Click Pay, order creates but no redirect
- Console shows payment initialization error

**Solution:**
1. Check PayFast credentials in backend
2. Verify return/cancel URLs are correct
3. Check form fields are properly populated

---

## Pre-Production Checklist

Before going to production, verify:

- [ ] All manual tests pass
- [ ] Playwright tests pass in all browsers
- [ ] Cart persists across sessions
- [ ] Checkout completes successfully
- [ ] PayFast redirect works
- [ ] Success/cancel pages work
- [ ] Mobile responsive on all pages
- [ ] Images load correctly
- [ ] No console errors
- [ ] Performance is acceptable (< 3s page load)
- [ ] SSL certificate valid
- [ ] Error tracking configured
- [ ] Analytics configured
