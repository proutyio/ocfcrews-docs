---
sidebar_position: 5
title: "Resend SMTP Configuration"
---

# Resend SMTP Configuration

OCFCrews uses [Resend](https://resend.com) as its email delivery service, connected via SMTP through the Payload CMS Nodemailer adapter. This configuration enables all email functionality including transactional emails (verification, password reset) and campaign emails.

## Configuration in payload.config.ts

**Source**: `src/payload.config.ts`

The email configuration is conditionally applied -- it only activates if the `RESEND_API_KEY` environment variable is set:

```typescript
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

export default buildConfig({
  // ... other config
  ...(process.env.RESEND_API_KEY
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: process.env.EMAIL_FROM ?? 'noreply@ocfcrews.org',
          defaultFromName: process.env.EMAIL_FROM_NAME ?? 'OCF Crews',
          transportOptions: {
            host: 'smtp.resend.com',
            port: 465,
            secure: true,
            auth: {
              user: 'resend',
              pass: process.env.RESEND_API_KEY,
            },
          },
        }),
      }
    : {}),
})
```

## SMTP Settings

| Setting | Value | Description |
|---------|-------|-------------|
| Host | `smtp.resend.com` | Resend's SMTP server |
| Port | `465` | SSL/TLS port |
| Secure | `true` | Full TLS encryption |
| Username | `resend` | Fixed username for all Resend accounts |
| Password | `RESEND_API_KEY` env var | Your Resend API key serves as the SMTP password |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESEND_API_KEY` | Yes (for email) | -- | Resend API key; doubles as SMTP password |
| `EMAIL_FROM` | No | `noreply@ocfcrews.org` | Default sender email address |
| `EMAIL_FROM_NAME` | No | `OCF Crews` | Default sender display name |

## Conditional Setup

The email configuration uses a **conditional spread** pattern:

```typescript
...(process.env.RESEND_API_KEY ? { email: nodemailerAdapter({ ... }) } : {})
```

This means:

- **If `RESEND_API_KEY` is set**: The Nodemailer adapter is configured and all email functionality works
- **If `RESEND_API_KEY` is not set**: No email adapter is configured; Payload will log a warning and email-dependent features (verification, password reset, campaigns) will silently fail

This design allows the application to start and run without email configuration during development or in environments where email is not needed.

## The Nodemailer Adapter

The `@payloadcms/email-nodemailer` package provides the bridge between Payload CMS and Nodemailer:

- **`defaultFromAddress`**: Used as the sender address when no explicit `from` is specified in `payload.sendEmail()`
- **`defaultFromName`**: Used as the sender display name
- **`transportOptions`**: Passed directly to Nodemailer's `createTransport()` function

Campaign emails can override the `from` address and name on a per-email basis (subject to access control -- only admins can change the `fromAddress`).

## How Emails Are Sent

All email sending in OCFCrews goes through Payload's `payload.sendEmail()` method, which delegates to the configured adapter:

```typescript
await payload.sendEmail({
  to: 'recipient@example.com',
  from: 'OCF Crews <noreply@ocfcrews.org>',
  subject: 'Your subject',
  html: '<html>...</html>',
})
```

This is used by:

1. **Transactional emails**: Payload's built-in auth system calls `sendEmail` for verification and password reset
2. **Campaign emails**: The `/api/send-email` route calls `sendEmail` for each recipient in batches
3. **Post notifications**: The `afterChange` hook calls `sendEmail` for each crew member

## Resend Setup

To configure Resend for your deployment:

1. Create a [Resend account](https://resend.com)
2. Add and verify your sending domain (e.g., `ocfcrews.org`)
3. Generate an API key
4. Set the `RESEND_API_KEY` environment variable in your deployment (Vercel environment variables for production)

### Domain Verification

Resend requires domain verification before you can send from addresses on that domain. This involves adding DNS records (SPF, DKIM, and optionally DMARC) to your domain's DNS configuration.

### Rate Limits

Resend has rate limits that vary by plan. The OCFCrews email system sends in batches of 10 to work within these limits. Campaign emails cap recipients at 500--1,000 depending on the recipient type.

## Development Without Email

During local development, if `RESEND_API_KEY` is not set:

- Account registration works but email verification emails are not sent
- Password reset requests succeed but no reset email is delivered
- Campaign sends will fail
- The application otherwise functions normally

For development, you can:

- Set `RESEND_API_KEY` with a test API key from Resend
- Check Payload's server logs for email-related activity
- Use Resend's test mode which provides API keys that simulate sending without actually delivering
