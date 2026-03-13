---
sidebar_position: 2
title: "Integration Tests"
---

# Integration Tests

Integration tests use Vitest to validate business logic against a real Payload CMS instance connected to PostgreSQL.

## Vitest Configuration

**File:** `vitest.config.mts`

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
})
```

### Key Settings

| Setting | Value | Reason |
|---------|-------|--------|
| `environment` | `'jsdom'` | Provides DOM APIs for any components imported transitively |
| `setupFiles` | `['./vitest.setup.ts']` | Loads environment variables via `dotenv/config` |
| `include` | `['tests/int/**/*.int.spec.ts']` | Only runs `*.int.spec.ts` files |
| `fileParallelism` | `false` | **Sequential execution** - prevents race conditions when multiple test files operate on the same PostgreSQL instance |
| `testTimeout` | `30_000` | 30-second timeout per test (database operations can be slow) |
| `hookTimeout` | `30_000` | 30-second timeout for `beforeAll`/`afterAll` hooks |

### Setup File

**File:** `tests/vitest.setup.ts`

```ts
import 'dotenv/config'
```

Loads `.env` variables so that `DATABASE_URL` and `PAYLOAD_SECRET` are available to the Payload config.

## Connecting to Payload

Each test file initializes a Payload instance in `beforeAll`:

```ts
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'

let payload: Payload

beforeAll(async () => {
  const payloadConfig = await config
  payload = await getPayload({ config: payloadConfig })
})
```

This creates a real Payload instance that connects to the PostgreSQL database specified in `DATABASE_URL`. The `tsconfigPaths` plugin allows using the `@/` alias.

## Test Files

### `api.int.spec.ts` - Hours Recalculation

Tests the `hoursPerYear` auto-calculation on the Users collection, which is triggered by time-entry hooks.

**What it covers:**
- `hoursPerYear` is empty before any time entries exist
- Creating time entries recalculates hours and days worked per year
- Deleting a time entry triggers recalculation
- Two entries on the same day count as one day worked

**Example test:**

```ts
it('creates entries and recalculates hoursPerYear correctly', async () => {
  await payload.create({
    collection: 'time-entries',
    data: { user: userId, crew: crewId, date: '2025-08-01', hours: 4 },
    overrideAccess: true,
  })
  await payload.create({
    collection: 'time-entries',
    data: { user: userId, crew: crewId, date: '2025-08-02', hours: 6 },
    overrideAccess: true,
  })

  const user = await payload.findByID({
    collection: 'users',
    id: userId,
    overrideAccess: true,
  })

  const rows = (user as any).hoursPerYear
  const row2025 = rows.find((r) => r.year === '2025')
  expect(row2025?.hours).toBe(10)
  expect(row2025?.daysWorked).toBe(2)
})
```

### `schedule.int.spec.ts` - Schedule Access Control

Tests crew isolation for schedules and the position assignment/removal workflow.

**What it covers:**
- Admin can read schedules from any crew (via `overrideAccess: true`)
- Crew A member can only see Crew A schedules (via crew-filtered Where query)
- Crew B member can only see Crew B schedules
- Members can be assigned to and removed from schedule positions
- Coordinators can create schedules for their crew
- Past-shift guard logic (dates in the past are detectable)

**Example test (crew isolation):**

```ts
it('crew A member can only read crew A schedules via access filter', async () => {
  const user = await payload.findByID({
    collection: 'users',
    id: memberAId,
    overrideAccess: true,
  })

  const crewId = typeof user.crew === 'object' ? user.crew.id : user.crew
  const result = await payload.find({
    collection: 'schedules',
    where: { crew: { equals: crewId } },
    overrideAccess: true,
  })

  const ids = result.docs.map((d) => d.id)
  expect(ids).toContain(scheduleAId)
  expect(ids).not.toContain(scheduleBId)
})
```

### `inventory.int.spec.ts` - Inventory System

The most comprehensive test file, covering RBAC, hook logic, and cross-crew validation.

**What it covers:**

**Access Control:**
- `inventory_admin` can read/create items in own crew, cannot read other crew's items
- `inventory_editor` can read items, cannot create items, can update non-locked fields
- `inventory_viewer` can read items, cannot update or delete items
- `inventory_editor` cannot update `initialAmount` (field-level lock)

**Transaction Hook Logic:**
- `quantityBefore` is captured before a transaction is applied
- `currentAmount` on the inventory item is updated after transaction creation
- Usage transactions normalize quantity to negative
- Restock transactions keep quantity positive
- Deleting a transaction restores `currentAmount` to its pre-transaction value

**Cross-Crew Validation:**
- Subcategories reject creation when crew does not match parent category crew
- Subcategories allow creation when crews match

**Auto-Calculation:**
- `totalCost` is computed as `itemCost * currentAmount`

**Example test (transaction hook):**

```ts
it('quantityBefore is captured and currentAmount is updated after create', async () => {
  const itemBefore = await payload.findByID({
    collection: 'inventory-items', id: itemAId, overrideAccess: true,
  })
  const amountBefore = itemBefore.currentAmount

  const tx = await payload.create({
    collection: 'inventory-transactions',
    data: { item: itemAId, crew: crewAId, type: 'usage', quantity: 5 },
    user: invAdmin,
    overrideAccess: false,
  })

  expect(tx.quantityBefore).toBe(amountBefore)
  expect(tx.quantity).toBe(-5) // normalized to negative for usage
  expect(tx.quantityAfter).toBe(amountBefore - 5)
})
```

## Cleanup Patterns

All test files clean up their data in `afterAll`, deleting in **reverse dependency order**:

```ts
afterAll(async () => {
  // 1. Delete leaf documents first (depend on parents)
  await payload.delete({
    collection: 'inventory-transactions',
    where: { crew: { in: [crewAId, crewBId] } },
    overrideAccess: true,
  }).catch(() => {})

  // 2. Delete items
  await payload.delete({
    collection: 'inventory-items',
    where: { crew: { in: [crewAId, crewBId] } },
    overrideAccess: true,
  }).catch(() => {})

  // 3. Delete categories
  await payload.delete({
    collection: 'inventory-categories',
    where: { crew: { in: [crewAId, crewBId] } },
    overrideAccess: true,
  }).catch(() => {})

  // 4. Delete users
  for (const id of [invAdminId, invEditorId, invViewerId]) {
    await payload.delete({ collection: 'users', id, overrideAccess: true }).catch(() => {})
  }

  // 5. Delete crews (no dependencies)
  await payload.delete({ collection: 'crews', id: crewAId, overrideAccess: true }).catch(() => {})
})
```

The `.catch(() => {})` ensures cleanup continues even if a document was already deleted or never created.

## Using `overrideAccess`

| Value | When to Use |
|-------|-------------|
| `true` | Setup/teardown (seed data, cleanup) and simulating admin access |
| `false` | Testing access control by passing a `user` object to simulate their permissions |

```ts
// Testing that an editor cannot create items:
const invEditor = await payload.findByID({
  collection: 'users', id: invEditorId, overrideAccess: true,
})

await expect(
  payload.create({
    collection: 'inventory-items',
    data: { ... },
    user: invEditor,      // Simulate this user's request
    overrideAccess: false, // Enforce access control
  }),
).rejects.toThrow()
```
