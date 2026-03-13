---
sidebar_position: 4
title: "Test Helpers"
---

# Test Helpers

Test helpers are shared utility functions used across test files. They live in the `tests/helpers/` directory and provide seed data creation, cleanup, and authentication utilities.

## Directory Structure

```
tests/helpers/
  login.ts           # Playwright admin panel login
  seedCrew.ts        # Crew + member + coordinator + schedule
  seedUser.ts        # Basic admin test user
  seedInventory.ts   # Multi-role inventory setup with two crews
```

## `login.ts` - Admin Panel Login

**Purpose:** Logs a user into the Payload admin panel via the browser.

### Interface

```ts
export interface LoginOptions {
  page: Page
  serverURL?: string  // defaults to 'http://localhost:3000'
  user: {
    email: string
    password: string
  }
}

export async function login({ page, serverURL, user }: LoginOptions): Promise<void>
```

### Behavior

1. Navigates to `/admin/login`
2. Fills the email and password fields (using `#field-email` and `#field-password` selectors)
3. Clicks the submit button
4. Waits for redirect to `/admin`
5. Asserts the Dashboard indicator (`span[title="Dashboard"]`) is visible

### Usage

```ts
import { login } from '../helpers/login'

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext()
  page = await context.newPage()
  await login({ page, user: { email: 'admin@test.com', password: 'admin' } })
})
```

## `seedUser.ts` - Basic Test User

**Purpose:** Creates and cleans up a simple test user for admin panel tests.

### Exported Data

```ts
export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
}
```

### Functions

#### `seedTestUser()`

Creates a fresh test user after deleting any existing user with the same email:

```ts
export async function seedTestUser(): Promise<void>
```

1. Connects to Payload via `getPayload({ config })`
2. Deletes any existing user with the test email
3. Creates a new user with the test credentials

#### `cleanupTestUser()`

Removes the test user:

```ts
export async function cleanupTestUser(): Promise<void>
```

### Usage

```ts
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.beforeAll(async () => {
  await seedTestUser()
})

test.afterAll(async () => {
  await cleanupTestUser()
})
```

## `seedCrew.ts` - Crew Schedule Test Data

**Purpose:** Creates a complete crew setup for testing schedule-related workflows. This is the primary helper for crew E2E tests.

### Exported Data

```ts
export const crewTestData = {
  crew: {
    name: 'E2E Test Crew',
    slug: 'e2e-test-crew',
  },
  member: {
    email: 'e2e-member@test.local',
    password: 'test1234',
    name: 'E2E Member',
  },
  coordinator: {
    email: 'e2e-coordinator@test.local',
    password: 'test1234',
    name: 'E2E Coordinator',
  },
}
```

### Functions

#### `seedCrewTestData()`

Creates a crew, two users (member and coordinator), and a future schedule:

```ts
export async function seedCrewTestData(): Promise<{
  crewId: string
  memberId: string
  coordinatorId: string
  scheduleId: string
}>
```

**What it creates:**

| Document | Collection | Details |
|----------|------------|---------|
| Crew | `crews` | Name: "E2E Test Crew", Slug: "e2e-test-crew" |
| Member | `users` | Role: `crew_member`, assigned to crew |
| Coordinator | `users` | Role: `crew_coordinator`, assigned to crew |
| Schedule | `schedules` | Future date (next year), morning shift, two positions (serving, drinks) |

The function calls `cleanupCrewTestData()` first to remove any leftover data from previous runs.

#### `cleanupCrewTestData()`

Removes all seeded data in reverse dependency order:

```ts
export async function cleanupCrewTestData(): Promise<void>
```

**Cleanup order:**
1. Schedules (by meal name `'E2E Test Breakfast'`)
2. Users (by email addresses)
3. Crews (by slug `'e2e-test-crew'`)

Each deletion is wrapped in `.catch(() => {})` to continue even if the document does not exist.

### Usage

```ts
import { seedCrewTestData, cleanupCrewTestData, crewTestData } from '../helpers/seedCrew'

test.beforeAll(async () => {
  await seedCrewTestData()
})

test.afterAll(async () => {
  await cleanupCrewTestData()
})

test('member can view schedule', async ({ page }) => {
  // Use crewTestData.member.email to log in
  // Use crewTestData.crew.slug to navigate to the schedule
})
```

## `seedInventory.ts` - Inventory System Test Data

**Purpose:** Creates a comprehensive multi-crew, multi-role setup for testing the inventory system. This is the most complex seed helper.

### Exported Data

```ts
export const inventoryTestData = {
  crewA: { name: 'Inv Test Crew A', slug: 'inv-test-crew-a' },
  crewB: { name: 'Inv Test Crew B', slug: 'inv-test-crew-b' },
  invAdmin:  { email: 'inv-admin@test.local',   password: 'test1234', name: 'Inv Admin' },
  invEditor: { email: 'inv-editor@test.local',  password: 'test1234', name: 'Inv Editor' },
  invViewer: { email: 'inv-viewer@test.local',  password: 'test1234', name: 'Inv Viewer' },
  invAdminB: { email: 'inv-admin-b@test.local', password: 'test1234', name: 'Inv Admin B' },
  category: { name: 'Inv Test Produce' },
  item:  { packageName: 'Inv Test Tomatoes', unit: 'lbs', initialAmount: 10, currentAmount: 10, storageType: 'fresh' },
  itemB: { packageName: 'Inv Test Onions',  unit: 'lbs', initialAmount: 20, currentAmount: 20, storageType: 'dry' },
}
```

### Return Type

```ts
export type InventorySeedResult = {
  crewAId: string
  crewBId: string
  invAdminId: string
  invEditorId: string
  invViewerId: string
  invAdminBId: string
  categoryAId: string
  itemAId: string
  itemBId: string
}
```

### Functions

#### `seedInventoryTestData()`

Creates the full inventory test environment:

```ts
export async function seedInventoryTestData(): Promise<InventorySeedResult>
```

**What it creates:**

| Document | Collection | Crew | Role/Details |
|----------|------------|------|-------------|
| Crew A | `crews` | - | First test crew |
| Crew B | `crews` | - | Second test crew (for isolation tests) |
| Inv Admin | `users` | A | Role: `inventory_admin` |
| Inv Editor | `users` | A | Role: `inventory_editor` |
| Inv Viewer | `users` | A | Role: `inventory_viewer` |
| Inv Admin B | `users` | B | Role: `inventory_admin` (cross-crew tests) |
| Category | `inventory-categories` | A | "Inv Test Produce" |
| Item A | `inventory-items` | A | Tomatoes, 10 lbs, fresh, linked to category |
| Item B | `inventory-items` | B | Onions, 20 lbs, dry, no category |

#### `cleanupInventoryTestData()`

Removes all seeded data in reverse dependency order:

```ts
export async function cleanupInventoryTestData(): Promise<void>
```

**Cleanup order:**
1. Inventory transactions (all)
2. Inventory items (by package name)
3. Inventory subcategories
4. Inventory categories (by name)
5. Users (by email addresses)
6. Crews (by slug)

### Usage

```ts
import { seedInventoryTestData, cleanupInventoryTestData } from '../helpers/seedInventory'

let seed: InventorySeedResult

test.beforeAll(async () => {
  seed = await seedInventoryTestData()
})

test.afterAll(async () => {
  await cleanupInventoryTestData()
})

test('admin can read items', async () => {
  // Use seed.invAdminId, seed.itemAId, etc.
})
```

## Common Patterns Across Helpers

### Payload Initialization

All seed helpers connect to Payload the same way:

```ts
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

const payload = await getPayload({ config })
```

### `overrideAccess: true`

All seed/cleanup operations use `overrideAccess: true` to bypass access control. This ensures test data can always be created and deleted regardless of the configured permissions.

### Idempotent Cleanup

Every seed function calls its corresponding cleanup function first, making it safe to run tests repeatedly without manual database cleanup:

```ts
export async function seedCrewTestData() {
  await cleanupCrewTestData()  // Always clean first
  // ... create fresh data
}
```

### Error Swallowing

Cleanup functions wrap each deletion in `.catch(() => {})` to handle cases where documents were already deleted or never created:

```ts
await payload.delete({
  collection: 'schedules',
  where: { meal: { equals: 'E2E Test Breakfast' } },
  overrideAccess: true,
}).catch(() => {})
```
