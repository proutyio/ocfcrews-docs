---
sidebar_position: 4
title: "Environment Variables"
---

# Environment Variables

All environment variables are configured in a `.env` file at the project root. Copy `.env.example` to get started:

```bash
cp .env.example .env
```

## Core

These variables are essential for running the application.

| Variable | Required | Description | Example |
|---|---|---|---|
| `PAYLOAD_SECRET` | **Yes** | Secret key used by Payload CMS for hashing, signing JWTs, and encrypting data. Generate with `openssl rand -hex 32`. | `a1b2c3d4e5f6...` |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string. Typically a Supabase connection string or local PostgreSQL URL. | `postgresql://postgres:password@localhost:5432/ocfcrews` |
| `PAYLOAD_PUBLIC_SERVER_URL` | No | The public-facing URL of the application. Used by Payload CMS for generating URLs in the admin panel. Defaults to `http://localhost:3000` in development. | `http://localhost:3000` |
| `NEXT_PUBLIC_SERVER_URL` | No | The public-facing URL exposed to the Next.js client bundle. Used for constructing API calls and links on the frontend. Defaults to `http://localhost:3000`. | `https://yourdomain.com` |

## Site Info

These variables control branding and display names throughout the application.

| Variable | Required | Description | Example |
|---|---|---|---|
| `COMPANY_NAME` | No | The organization/company name displayed in the application. | `"ocfcrews"` |
| `SITE_NAME` | No | The site name used in page titles and metadata. | `"ocfcrews"` |

## Preview / Draft

Variables used for Payload CMS draft preview functionality.

| Variable | Required | Description | Example |
|---|---|---|---|
| `PREVIEW_SECRET` | No | A shared secret used to authenticate draft preview requests. Must match the secret configured in your preview URL generation. | `demo-draft-secret` |

## Stripe

Required only if you are using the e-commerce shop features. The application uses the `@payloadcms/plugin-ecommerce` with Stripe as the payment adapter.

| Variable | Required | Description | Example |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | No | Your Stripe secret API key. Use a test-mode key (`sk_test_...`) for development. | `sk_test_abc123...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Your Stripe publishable API key. Exposed to the browser for Stripe.js initialization. Use a test-mode key (`pk_test_...`) for development. | `pk_test_xyz789...` |
| `STRIPE_WEBHOOKS_SIGNING_SECRET` | No | The webhook signing secret from the Stripe CLI or your Stripe dashboard. Used to verify incoming webhook events. | `whsec_abc123...` |

:::tip
For local development, run `pnpm stripe-webhooks` to start the Stripe CLI webhook listener. It will output a signing secret to use as `STRIPE_WEBHOOKS_SIGNING_SECRET`.
:::

## Email (Resend)

Email functionality is **conditionally enabled** -- the application only configures the nodemailer adapter when `RESEND_API_KEY` is set. Without it, the app runs normally but cannot send emails.

| Variable | Required | Description | Example |
|---|---|---|---|
| `RESEND_API_KEY` | No | API key from [Resend](https://resend.com). Used to authenticate with Resend's SMTP relay (`smtp.resend.com:465`). | `re_abc123...` |
| `EMAIL_FROM` | No | The "from" email address for outgoing emails. Must be a verified sender in your Resend account. Defaults to `noreply@ocfcrews.org`. | `noreply@yourdomain.com` |
| `EMAIL_FROM_NAME` | No | The display name shown alongside the "from" address. Defaults to `OCF Crews`. | `ocfcrews` |

## File Storage (Cloudflare R2)

File storage is **conditionally enabled** -- the S3-compatible storage plugin is only activated when `R2_BUCKET` is set. Without it, uploaded files are stored on the local filesystem.

When enabled, the plugin manages three collections of uploads:
- `media` -- stored under the `media/` prefix
- `avatars` -- stored under the `avatars/` prefix
- `inventory-media` -- stored under the `inventory-media/` prefix

| Variable | Required | Description | Example |
|---|---|---|---|
| `R2_ENDPOINT` | No | The Cloudflare R2 S3-compatible API endpoint. Format: `https://<account_id>.r2.cloudflarestorage.com`. | `https://abc123.r2.cloudflarestorage.com` |
| `R2_BUCKET` | No | The name of the R2 bucket to store files in. | `ocfcrews-uploads` |
| `R2_ACCESS_KEY_ID` | No | The access key ID for R2 API authentication. Generated in the Cloudflare dashboard. | `abc123...` |
| `R2_SECRET_ACCESS_KEY` | No | The secret access key for R2 API authentication. Generated in the Cloudflare dashboard. | `xyz789...` |

:::note
All four R2 variables must be set together for file storage to work. If `R2_BUCKET` is not set, the plugin is skipped entirely and files are stored locally.
:::

## Complete `.env.example`

For reference, here is the full `.env.example` file shipped with the project:

```env title=".env.example"
PAYLOAD_SECRET=mygeneratedsecret
DATABASE_URL=postgresql://postgres:password@localhost:5432/ocfcrews

COMPANY_NAME="ocfcrews"
SITE_NAME="ocfcrews"

PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Used to preview drafts
PREVIEW_SECRET=demo-draft-secret

# Stripe API keys
STRIPE_SECRET_KEY=sk_test_
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_
STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_

# Resend email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=ocfcrews

# Cloudflare R2 storage
# Endpoint: https://<account_id>.r2.cloudflarestorage.com
R2_ENDPOINT=
R2_BUCKET=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
```
