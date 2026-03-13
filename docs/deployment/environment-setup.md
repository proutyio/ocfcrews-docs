---
sidebar_position: 2
title: "Production Environment"
---

# Production Environment

This page documents all environment variables needed to run OCFCrews in production and how to configure them in the Vercel dashboard.

## Required Environment Variables

### Core Application

| Variable | Example | Description |
|----------|---------|-------------|
| `PAYLOAD_SECRET` | `a-long-random-string` | Secret key for Payload CMS JWT signing and encryption. Must be a strong random string. |
| `DATABASE_URL` | `postgresql://user:pass@db.xxxx.supabase.co:5432/postgres` | PostgreSQL connection string. Use Supabase for production. |
| `NEXT_PUBLIC_SERVER_URL` | `https://ocfcrews.org` | The public URL of the deployed application. Used for generating absolute URLs in emails, SEO, and API responses. |
| `PAYLOAD_PUBLIC_SERVER_URL` | `https://ocfcrews.org` | Server URL used by Payload CMS internally. Should match `NEXT_PUBLIC_SERVER_URL`. |

### Site Identity

| Variable | Example | Description |
|----------|---------|-------------|
| `COMPANY_NAME` | `ocfcrews` | Organization name displayed in the UI |
| `SITE_NAME` | `ocfcrews` | Site name used in metadata and emails |

### Cloudflare R2 Storage

Required for file uploads (media, avatars, inventory images):

| Variable | Example | Description |
|----------|---------|-------------|
| `R2_ENDPOINT` | `https://<account_id>.r2.cloudflarestorage.com` | Cloudflare R2 S3-compatible endpoint |
| `R2_BUCKET` | `ocfcrews-media` | R2 bucket name |
| `R2_ACCESS_KEY_ID` | `abc123...` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | `xyz789...` | R2 API token secret key |

If `R2_BUCKET` is not set, the S3 storage adapter is not loaded and file uploads will use local storage (not suitable for production on Vercel, since serverless functions have ephemeral filesystems).

### Email (Resend/SMTP)

| Variable | Example | Description |
|----------|---------|-------------|
| `RESEND_API_KEY` | `re_...` | Resend API key for transactional emails |
| `EMAIL_FROM` | `noreply@ocfcrews.org` | Default "from" email address |
| `EMAIL_FROM_NAME` | `OCF Crews` | Default "from" display name |

If `RESEND_API_KEY` is not set, email functionality is disabled. The application uses Nodemailer configured to connect to `smtp.resend.com` on port 465 (TLS).

### Stripe (E-Commerce)

| Variable | Example | Description |
|----------|---------|-------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe secret key for server-side operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe publishable key for client-side Stripe.js |
| `STRIPE_WEBHOOKS_SIGNING_SECRET` | `whsec_...` | Webhook endpoint signing secret for verifying Stripe events |

### Draft Preview

| Variable | Example | Description |
|----------|---------|-------------|
| `PREVIEW_SECRET` | `a-random-secret` | Secret token for enabling draft preview mode |

## Setting Variables in Vercel

### Via Dashboard

1. Go to your Vercel project
2. Navigate to **Settings > Environment Variables**
3. Add each variable with the appropriate scope:
   - **Production** - Variables for the live site
   - **Preview** - Variables for PR preview deployments
   - **Development** - Variables for `vercel dev` (local)

### Variable Scoping

| Variable | Production | Preview | Development |
|----------|:---------:|:-------:|:-----------:|
| `PAYLOAD_SECRET` | Unique per env | Different value | Local value |
| `DATABASE_URL` | Production Supabase | Staging Supabase | `postgresql://postgres:password@localhost:5432/ocfcrews` |
| `NEXT_PUBLIC_SERVER_URL` | `https://ocfcrews.org` | Auto-set by Vercel | `http://localhost:3000` |
| `R2_*` | Production R2 | Same or separate bucket | Optional |
| `STRIPE_SECRET_KEY` | Live key | Test key | Test key |
| `RESEND_API_KEY` | Production key | Test key or omit | Omit |

### Sensitive Variables

Mark these as **Sensitive** in the Vercel dashboard (they will be encrypted and hidden from logs):

- `PAYLOAD_SECRET`
- `DATABASE_URL`
- `R2_SECRET_ACCESS_KEY`
- `R2_ACCESS_KEY_ID`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOKS_SIGNING_SECRET`

### Via CLI

```bash
# Add a variable
vercel env add PAYLOAD_SECRET production

# List all variables
vercel env ls

# Pull variables to local .env
vercel env pull .env.local
```

## Secrets Management Best Practices

1. **Never commit secrets to Git.** The `.env` file is in `.gitignore`. Use `.env.example` as a template.

2. **Use different secrets per environment.** Production, preview, and development should each have unique values for `PAYLOAD_SECRET` and `DATABASE_URL`.

3. **Rotate secrets periodically.** Update `PAYLOAD_SECRET`, R2 keys, and API keys on a regular schedule.

4. **Use Vercel's built-in encryption.** Sensitive variables marked as such in the dashboard are encrypted at rest and in transit.

5. **Minimize `NEXT_PUBLIC_` variables.** Only `NEXT_PUBLIC_SERVER_URL` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` should be public. Everything else should be server-only.

6. **Audit access.** Limit who can view production environment variables in the Vercel team settings.

## `.env.example` Template

The repository includes an `.env.example` file with all required variables and placeholder values:

```env
PAYLOAD_SECRET=mygeneratedsecret
DATABASE_URL=postgresql://postgres:password@localhost:5432/ocfcrews

COMPANY_NAME="ocfcrews"
SITE_NAME="ocfcrews"

PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

PREVIEW_SECRET=demo-draft-secret

STRIPE_SECRET_KEY=sk_test_
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_
STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_

RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=ocfcrews

R2_ENDPOINT=
R2_BUCKET=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
```

Copy this file to `.env` and fill in your values for local development.
