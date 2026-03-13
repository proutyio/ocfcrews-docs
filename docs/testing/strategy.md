---
sidebar_position: 1
title: "Testing Strategy"
---

# Testing Strategy

OCFCrews uses a **two-tier testing approach** that prioritizes real-world accuracy over mocked abstractions.

## Testing Tiers

### Tier 1: Integration Tests (Vitest)

Integration tests validate business logic by running against the **real Payload SDK connected to a real PostgreSQL instance**. These tests exercise:

- Collection access control (crew isolation, role-based permissions)
- Hook logic (e.g., transaction hooks that update inventory amounts)
- Data model relationships and constraints
- Field-level access control (e.g., `initialAmount` locked for editors)

**Tool:** [Vitest](https://vitest.dev/) v4
**Location:** `tests/int/`
**File pattern:** `*.int.spec.ts`

### Tier 2: E2E Tests (Playwright)

End-to-end tests validate user workflows through a real browser. These tests exercise:

- Authentication flows (login, signup, logout)
- Admin panel navigation and CRUD operations
- Crew schedule viewing and interaction
- Access control from the user's perspective (redirects for unauthorized users)
- E-commerce flows (cart, checkout, orders)

**Tool:** [Playwright](https://playwright.dev/) v1.58
**Location:** `tests/e2e/`
**File pattern:** `*.e2e.spec.ts`

## Why Real Database Instead of Mocks?

The project deliberately avoids mocking the database layer for integration tests. Here is why:

1. **Payload hooks run at the database layer.** Mocking would skip the exact code paths that need testing (e.g., `beforeChange` hooks that capture `quantityBefore`, `afterChange` hooks that update `currentAmount`).

2. **Access control is applied by Payload internally.** Testing with `overrideAccess: false` against a real database validates that the Where constraints and role checks work as configured.

3. **Relationship validation requires real documents.** Tests that verify crew isolation need actual crew, user, and schedule documents to exist in the database so that foreign key relationships are enforced.

4. **Database-specific behavior matters.** The project uses the `@payloadcms/db-postgres` adapter (Drizzle ORM), and real tests catch issues like UUID handling, index uniqueness, and transaction semantics.

## Test File Organization

```
tests/
  int/                          # Integration tests
    api.int.spec.ts             # Hours recalculation logic
    schedule.int.spec.ts        # Schedule access control & position assignment
    inventory.int.spec.ts       # Inventory RBAC, transactions, crew isolation
  e2e/                          # End-to-end tests
    admin.e2e.spec.ts           # Admin panel navigation
    crews.e2e.spec.ts           # Crew schedule and member flows
    frontend.e2e.spec.ts        # Frontend pages, cart, checkout, orders
  helpers/                      # Shared test utilities
    login.ts                    # Playwright login helper
    seedCrew.ts                 # Crew + member + coordinator seed/cleanup
    seedUser.ts                 # Admin user seed/cleanup
    seedInventory.ts            # Inventory multi-role seed/cleanup
```

## Test Data Lifecycle

Both tiers follow the same pattern for test data:

1. **`beforeAll`** - Seed test data using `overrideAccess: true` to bypass access control during setup
2. **Test execution** - Tests run against the seeded data
3. **`afterAll`** - Clean up test data in **reverse dependency order** to avoid foreign key constraint issues

### Cleanup Order Example

```
1. Delete schedules (depends on crews, users)
2. Delete users (depends on crews)
3. Delete crews (no dependencies)
```

## Coverage Areas

| Area | Integration Tests | E2E Tests |
|------|:-:|:-:|
| Access control (crew isolation) | Yes | Yes |
| Role-based permissions | Yes | Partial |
| Hook logic (transactions) | Yes | No |
| Field-level access | Yes | No |
| Authentication flows | No | Yes |
| UI navigation | No | Yes |
| Cart / Checkout | No | Yes |
| Calendar interactions | No | Yes |
| Data validation | Yes | Partial |
