---
sidebar_position: 5
title: "Running Tests"
---

# Running Tests

This page covers how to run the test suite and the prerequisites needed for each test tier.

## Quick Reference

| Command | What it runs | Prerequisites |
|---------|-------------|---------------|
| `pnpm test:int` | Integration tests (Vitest) | PostgreSQL running, `.env` configured |
| `pnpm test:e2e` | E2E tests (Playwright) | Dev server running on port 3000 |
| `pnpm test` | Both (integration first, then e2e) | Both prerequisites above |

## Prerequisites

### PostgreSQL

Integration tests connect to a real PostgreSQL instance. You need PostgreSQL running locally or accessible via a connection string.

**Local PostgreSQL:**

```bash
# macOS (via Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Verify PostgreSQL is running
pg_isready
```

**Supabase (remote):**

Set your `DATABASE_URL` to your Supabase connection string in `.env`.

### Environment Variables

Both test tiers require a valid `.env` file in the project root. At minimum:

```env
PAYLOAD_SECRET=mygeneratedsecret
DATABASE_URL=postgresql://postgres:password@localhost:5432/ocfcrews
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

The `tests/vitest.setup.ts` file loads these automatically via `dotenv/config`.

### Playwright Browsers

If running E2E tests for the first time, install the Playwright browsers:

```bash
npx playwright install chromium
```

Only Chromium is needed since that is the only configured browser.

## Running Integration Tests

```bash
pnpm test:int
```

This executes:

```bash
cross-env NODE_OPTIONS=--no-deprecation vitest run --config ./vitest.config.mts
```

### What happens:

1. Vitest loads the configuration from `vitest.config.mts`
2. The setup file (`tests/vitest.setup.ts`) loads environment variables
3. Test files are found matching `tests/int/**/*.int.spec.ts`
4. Tests run **sequentially** (`fileParallelism: false`) to prevent database race conditions
5. Each test file connects to Payload/PostgreSQL, seeds data, runs tests, and cleans up

### Running a specific test file:

```bash
pnpm test:int -- tests/int/schedule.int.spec.ts
```

### Running a specific test by name:

```bash
pnpm test:int -- -t "crew A member can only read"
```

### Watch mode (for development):

```bash
cross-env NODE_OPTIONS=--no-deprecation vitest --config ./vitest.config.mts
```

Note: `pnpm test:int` uses `vitest run` (single run). Remove `run` for watch mode.

## Running E2E Tests

### Step 1: Start the dev server

```bash
pnpm dev
```

Wait for the server to be available at `http://localhost:3000`.

Alternatively, Playwright can start the dev server automatically. The `playwright.config.ts` includes a `webServer` configuration:

```ts
webServer: {
  command: 'pnpm dev',
  reuseExistingServer: true,
  url: 'http://localhost:3000',
},
```

If a server is already running on port 3000, Playwright reuses it. Otherwise, it starts one.

### Step 2: Run the tests

```bash
pnpm test:e2e
```

This executes:

```bash
cross-env NODE_OPTIONS="--no-deprecation --import=tsx/esm" playwright test --config=playwright.config.ts
```

The `--import=tsx/esm` flag enables TypeScript execution for the test helper files (which use `import` syntax and reference the Payload config).

### Running a specific test file:

```bash
pnpm test:e2e -- tests/e2e/crews.e2e.spec.ts
```

### Running with UI mode:

```bash
npx playwright test --ui
```

### Running with headed browser (visible):

```bash
npx playwright test --headed
```

### Viewing the HTML report:

```bash
npx playwright show-report
```

## Running All Tests

```bash
pnpm test
```

This runs integration tests first, then e2e tests (sequentially):

```bash
pnpm run test:int && pnpm run test:e2e
```

If integration tests fail, e2e tests will not run (due to `&&` chaining).

## CI Considerations

The Playwright configuration includes CI-specific settings:

```ts
forbidOnly: !!process.env.CI,     // Fail if test.only is left in code
retries: process.env.CI ? 3 : 1,  // More retries for flaky tests
workers: process.env.CI ? 1 : undefined, // Sequential execution
```

### Recommended CI Setup

1. **Start PostgreSQL** - Use a PostgreSQL service container or Supabase
2. **Set environment variables** - `DATABASE_URL`, `PAYLOAD_SECRET`, etc.
3. **Install dependencies** - `pnpm install`
4. **Install Playwright browsers** - `npx playwright install chromium --with-deps`
5. **Run integration tests** - `pnpm test:int`
6. **Build the application** - `pnpm build`
7. **Start the server** - `pnpm start &` (or let Playwright start dev server)
8. **Run e2e tests** - `pnpm test:e2e`

### CI Environment Variables

```env
CI=true                           # Enables CI-specific test settings
DATABASE_URL=postgresql://...      # CI PostgreSQL connection string
PAYLOAD_SECRET=ci-test-secret     # Any string for CI
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

## Troubleshooting

### Tests hang or time out

- **Check PostgreSQL connection**: Ensure `DATABASE_URL` points to a running PostgreSQL instance. Verify with `pg_isready`
- **Check timeout**: Integration tests have a 30-second timeout. If your database is slow, you may need to increase `testTimeout` in `vitest.config.mts`

### E2E tests fail on first run

- **Install browsers**: Run `npx playwright install chromium`
- **Server not ready**: Ensure the dev server is fully loaded before running tests. Look for "Ready" in the dev server output.

### Cleanup failures

If tests leave behind stale data (e.g., after a crash), you can manually clean up by running the seed helpers' cleanup functions, or by dropping the test database:

```bash
psql -U postgres
DROP DATABASE ocfcrews;
CREATE DATABASE ocfcrews;
```

### Port conflicts

If port 3000 is in use, the dev server will fail to start. Kill any existing processes:

```bash
lsof -ti:3000 | xargs kill -9
```

### Trace debugging

When an E2E test fails on retry, Playwright captures a trace. View it with:

```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```
