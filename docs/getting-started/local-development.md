---
sidebar_position: 3
title: "Local Development"
---

# Local Development

This guide walks through setting up OCFCrews for local development from scratch.

## 1. Clone the Repository

```bash
git clone <your-repo-url> ocfcrews
cd ocfcrews
```

## 2. Install Dependencies

```bash
pnpm install
```

This installs all dependencies listed in `package.json`, including Payload CMS, Next.js 15, and Sharp for image processing.

## 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

At minimum, configure these two variables:

```env
# A secret key used by Payload CMS for authentication tokens.
# Generate one with: openssl rand -hex 32
PAYLOAD_SECRET=your-generated-secret-here

# Your PostgreSQL connection string
DATABASE_URL=postgresql://postgres:password@localhost:5432/ocfcrews
```

See the [Environment Variables](./environment-variables) reference for the full list of configuration options.

## 4. Start the Development Server

```bash
pnpm dev
```

This starts the Next.js development server with hot module replacement. The app will be available at:

| URL | Description |
|---|---|
| [http://localhost:3000](http://localhost:3000) | Frontend application |
| [http://localhost:3000/admin](http://localhost:3000/admin) | Payload CMS admin panel |

## 5. Create Your First Admin User

When you navigate to `http://localhost:3000/admin` for the first time, Payload CMS will prompt you to create the initial user account. **The first user created automatically receives the `admin` role**, giving you full access to all features and settings.

## 6. Optional: Stripe Webhook Forwarding

If you are working on the e-commerce shop, forward Stripe webhook events to your local server:

```bash
pnpm stripe-webhooks
```

This runs `stripe listen --forward-to localhost:3000/api/stripe/webhooks`. You will need to be logged into the Stripe CLI first (`stripe login`). Copy the webhook signing secret it outputs and set it as `STRIPE_WEBHOOKS_SIGNING_SECRET` in your `.env` file.

## Available Scripts

All scripts are defined in `package.json` and run with `pnpm`:

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server with hot reload |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server (after build) |
| `pnpm dev:prod` | Clean `.next`, build, and start in production mode |
| `pnpm generate:types` | Regenerate Payload TypeScript types (`payload-types.ts`) |
| `pnpm generate:importmap` | Regenerate Payload import map |
| `pnpm lint` | Run ESLint on the codebase |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm test` | Run all tests (integration + e2e) |
| `pnpm test:int` | Run Vitest integration tests |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm stripe-webhooks` | Forward Stripe webhooks to localhost:3000 |
| `pnpm payload` | Run Payload CLI commands directly |
| `pnpm docs:dev` | Start the Docusaurus documentation site locally |
| `pnpm docs:build` | Build the documentation site |

## Development Workflow Tips

### Regenerate Types After Collection Changes

Whenever you modify a Payload collection or global configuration, regenerate the TypeScript types so your editor has accurate type information:

```bash
pnpm generate:types
```

This outputs the updated types to `src/payload-types.ts`.

### Running Tests

**Integration tests** use Vitest and connect to a real Payload/PostgreSQL instance. They use the configuration in `vitest.config.mts` and environment variables from `test.env`:

```bash
pnpm test:int
```

**End-to-end tests** use Playwright and run against a live instance of the application. Configuration is in `playwright.config.ts`:

```bash
pnpm test:e2e
```

### Protected Routes

The middleware at `src/middleware.ts` protects several route prefixes and redirects unauthenticated users to `/login`:

- `/account`
- `/inventory`
- `/recipes`
- `/shop`
- `/orders`
- `/checkout`

If you are already logged in and visit `/login` or `/create-account`, you will be redirected to `/account`.
