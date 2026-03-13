---
sidebar_position: 3
title: "E2E Tests"
---

# E2E Tests

End-to-end tests use Playwright to validate user-facing workflows through a real browser against a running development server.

## Playwright Configuration

**File:** `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    reuseExistingServer: true,
    url: 'http://localhost:3000',
  },
})
```

### Key Settings

| Setting | Value | Description |
|---------|-------|-------------|
| `testDir` | `./tests/e2e` | Only scans the e2e directory |
| `forbidOnly` | `!!process.env.CI` | Fails build if `test.only` is left in code on CI |
| `retries` | CI: 3, Local: 1 | More retries on CI for flaky network conditions |
| `workers` | CI: 1, Local: auto | Sequential on CI to avoid resource contention |
| `reporter` | `'html'` | Generates an HTML report with screenshots and traces |
| `trace` | `'on-first-retry'` | Captures trace data on first retry for debugging |

### Browser Configuration

Tests run only on **Chromium** (Desktop Chrome). No Firefox or WebKit projects are configured, keeping the test suite fast and focused.

### Web Server

Playwright automatically starts the dev server (`pnpm dev`) if it is not already running. The `reuseExistingServer: true` setting means if you already have a dev server running on port 3000, Playwright will use it instead of starting a new one.

## Test Files

### `admin.e2e.spec.ts` - Admin Panel

Tests basic admin panel navigation using a seeded test user.

**Setup:** Seeds a test user via the `seedUser` helper, logs in via the `login` helper (admin panel login flow).

**Test cases:**
- Can navigate to the admin dashboard
- Can navigate to the Users list view
- Can navigate to the user create/edit view

```ts
test('can navigate to dashboard', async () => {
  await page.goto('http://localhost:3000/admin')
  await expect(page).toHaveURL('http://localhost:3000/admin')
  const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
  await expect(dashboardArtifact).toBeVisible()
})
```

### `crews.e2e.spec.ts` - Crew Schedule

Tests crew-specific workflows from the frontend (not admin panel).

**Setup:** Seeds a full crew with member, coordinator, and a future schedule via the `seedCrew` helper.

**Test cases:**

**Access Control:**
- Unauthenticated users are redirected from schedule to login
- Users without a crew assignment are redirected away from the schedule
- Crew members can view the schedule calendar
- Coordinators can view the schedule

**Calendar Interaction:**
- Members can switch between Month, Week, and Day calendar views
- Active view button has the `bg-emerald-600` class

**Account Pages:**
- Members can view "My Schedule" page (`/account/schedule`)
- Members can view "My Hours" page (`/account/hours`)
- Unauthenticated users are redirected from "My Hours" to login
- Schedule link is visible in header for authenticated crew members

### `frontend.e2e.spec.ts` - Frontend & E-Commerce

Tests the main frontend pages and the full e-commerce checkout flow.

**Setup:** Creates an admin user via API, uploads a test image, and creates test products with variants.

**Test cases:**

**Basic Navigation:**
- Homepage loads with correct title
- Can sign up and subsequently log in

**Cart Operations:**
- Can add products to cart
- Can add products with variants to cart
- Can remove products from cart
- Cart content persists across hard refresh

**Search:**
- Can view and sort products via the search page

**Account Management:**
- Authenticated users can view account settings
- Authenticated users can update their name
- Authenticated users can view orders page

**Checkout:**
- Authenticated users can complete checkout and view order details
- Guest users can create orders
- Guest users can find their order via the find-order page

**Admin Operations:**
- Admins can update product prices
- Admins can update variant prices
- Admins can create new products with new variants
- Admins can view transactions and orders
- Non-admin customers cannot access `/admin`

**Inventory:**
- Products with no inventory have a disabled "Add to Cart" button

## Authentication in E2E Tests

There are two authentication approaches used across the test files:

### Admin Panel Login (via helper)

Used in `admin.e2e.spec.ts`, navigates to `/admin/login` and fills in credentials:

```ts
import { login } from '../helpers/login'

await login({ page, user: testUser })
```

### Frontend Login (via UI)

Used in `crews.e2e.spec.ts` and `frontend.e2e.spec.ts`, navigates to `/login` and fills the form:

```ts
async function loginFromUI(page: Page, email: string, password: string) {
  await page.goto('http://localhost:3000/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/account/)
}
```

### API Login

Used in `frontend.e2e.spec.ts` for faster user creation:

```ts
async function createUserAndLogin(request: APIRequestContext, email: string, password: string) {
  await request.post('http://localhost:3000/api/users', { data: { email, password, roles: ['admin'] } })
  await request.post('http://localhost:3000/api/users/login', { data: { email, password } })
}
```

## Page Object Pattern

While the tests do not use a formal Page Object Model, they extract reusable operations into helper functions at the bottom of each test file:

- `loginFromUI()` - Log in via the frontend form
- `logoutAndExpectSuccess()` - Log out and verify
- `addToCartAndConfirm()` - Navigate to product, add to cart, verify cart count
- `removeFromCartAndConfirm()` - Remove item and verify empty cart
- `checkout()` - Complete the Stripe checkout flow
- `expectOrderIsDisplayed()` - Verify order confirmation page

## Stripe Testing

The checkout tests use Stripe test mode with a test card number:

```ts
const testPaymentDetails = {
  cardNumber: '5454 5454 5454 5454',
  expiryDate: '0330',
  cvc: '737',
  postcode: 'WS11 1DB',
}
```

The Stripe payment form is accessed via an iframe locator:

```ts
const stripeIframe = page.frameLocator('iframe[title="Secure payment input frame"]')
await stripeIframe.locator('#Field-numberInput').fill(cardNumber)
```
