---
sidebar_position: 2
title: "Prerequisites"
---

# Prerequisites

Before setting up OCFCrews locally, make sure you have the following software and services available.

## Required

### Node.js

OCFCrews requires Node.js with the following version constraint (from `package.json` engines):

```
^18.20.2 || >=20.9.0
```

This means either:
- Node.js 18.20.2 or later in the 18.x line, **or**
- Node.js 20.9.0 or later (including 22.x+)

We recommend using the latest LTS release. You can check your version with:

```bash
node --version
```

If you need to manage multiple Node.js versions, consider using [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm).

### pnpm

OCFCrews uses [pnpm](https://pnpm.io/) as its package manager. Install it globally:

```bash
npm install -g pnpm
```

Or via Corepack (built into Node.js 16.13+):

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### PostgreSQL

OCFCrews uses PostgreSQL as its database through Payload CMS's `@payloadcms/db-postgres` adapter (Drizzle ORM). You need either:

- **Supabase** (cloud-hosted) -- used in production. Create a free project at [supabase.com](https://supabase.com/).
- **Local PostgreSQL** -- install via your system's package manager, [Homebrew](https://formulae.brew.sh/formula/postgresql), or [download directly](https://www.postgresql.org/download/).
- **Docker** -- `docker run --name ocfcrews-pg -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16`

Your connection string will look like:

```
# Supabase
postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# Local
postgresql://localhost:5432/ocfcrews
```

### Git

Git is required to clone the repository:

```bash
git --version
```

## Optional

### Stripe CLI

If you plan to work on the e-commerce shop or test payment flows, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhook events to your local development server:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Verify installation
stripe --version
```

You will also need a [Stripe account](https://dashboard.stripe.com/register) with test-mode API keys.

### Cloudflare R2 Account

In production, OCFCrews stores uploaded files (media, avatars, inventory images) in Cloudflare R2 via the `@payloadcms/storage-s3` plugin. For local development, file uploads are stored on disk by default -- R2 is only needed if you want to test cloud storage behavior.

To set up R2:

1. Create a [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. Navigate to R2 in the Cloudflare dashboard
3. Create a bucket
4. Generate an API token with R2 read/write permissions
5. Note the endpoint URL (`https://<account_id>.r2.cloudflarestorage.com`), bucket name, access key ID, and secret access key

### Resend Account

Email functionality (campaigns, verification emails, password resets) uses [Resend](https://resend.com/). For local development without email, you can skip this -- the app conditionally enables email only when `RESEND_API_KEY` is set.

To set up Resend:

1. Create a [Resend account](https://resend.com/signup)
2. Verify a sending domain
3. Generate an API key
