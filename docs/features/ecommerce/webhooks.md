---
sidebar_position: 6
title: "Stripe Webhooks"
---

# Stripe Webhooks

Stripe webhooks allow the server to receive real-time notifications about payment events. The webhook endpoint is automatically configured by the `@payloadcms/plugin-ecommerce` Stripe adapter.

## Webhook Endpoint

The ecommerce plugin's Stripe adapter registers a webhook endpoint at:

```
POST /api/stripe/webhooks
```

This endpoint receives events from Stripe's servers, verifies the signature using the webhook signing secret, and processes relevant payment events.

## Configuration

The webhook secret is configured in the Stripe adapter:

```typescript
stripeAdapter({
  secretKey: process.env.STRIPE_SECRET_KEY!,
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
})
```

The `STRIPE_WEBHOOKS_SIGNING_SECRET` environment variable must match the signing secret from your Stripe webhook configuration.

## Signature Verification

Every incoming webhook request is verified using Stripe's signature verification. This ensures that:

- The request genuinely came from Stripe (not a malicious third party)
- The payload has not been tampered with in transit
- The request is fresh and not a replay attack

If signature verification fails, the webhook returns an error response and the event is discarded.

## Transaction Records

When payment events are processed, the plugin creates **transaction** records in the `transactions` collection. Transactions are immutable records of payment activity.

### Transaction Access Control

```typescript
transactions: {
  transactionsCollectionOverride: ({ defaultCollection }) => ({
    ...defaultCollection,
    admin: { ...defaultCollection?.admin, group: 'Shop' },
    access: {
      ...defaultCollection?.access,
      read: ({ req: { user } }) => {
        if (!user) return false
        if (checkRole(['admin'], user)) return true
        return { customer: { equals: user.id } }
      },
      create: () => false,  // Created only via Stripe webhook
      update: () => false,  // Immutable
      delete: () => false,  // Cannot be deleted
    },
  }),
}
```

Key characteristics:

- **Read**: Admins can see all transactions; customers can only see their own
- **Create**: Disabled for all users -- transactions are only created by the webhook handler
- **Update**: Disabled -- transactions are immutable once created
- **Delete**: Disabled -- transaction history cannot be destroyed

This ensures a tamper-proof audit trail of all payment activity.

## Local Testing

For local development, you need to forward Stripe webhook events to your local server using the Stripe CLI.

### Setup

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Authenticate with `stripe login`

### Running

Use the built-in npm script:

```bash
pnpm stripe-webhooks
```

This executes:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

The Stripe CLI will:

1. Connect to Stripe's servers
2. Listen for webhook events directed at your account
3. Forward them to `localhost:3000/api/stripe/webhooks`
4. Display the event type and response status in the terminal

The CLI will output a temporary webhook signing secret. You should set this as your `STRIPE_WEBHOOKS_SIGNING_SECRET` environment variable during local development, or use the one from the CLI output.

### Testing Flow

1. Start the development server: `pnpm dev`
2. In a separate terminal, start the webhook forwarder: `pnpm stripe-webhooks`
3. Make a test purchase through the checkout flow
4. Observe webhook events being forwarded and processed in the terminal
5. Verify that transaction and order records are created correctly

## Production Configuration

In production (Vercel deployment), configure the webhook endpoint in your Stripe Dashboard:

1. Go to **Developers > Webhooks** in the Stripe Dashboard
2. Add an endpoint URL: `https://your-domain.com/api/stripe/webhooks`
3. Select the relevant events to listen for
4. Copy the signing secret and set it as `STRIPE_WEBHOOKS_SIGNING_SECRET` in your Vercel environment variables

## Event Processing

The ecommerce plugin handles webhook events related to the payment lifecycle. Common events that are processed include:

| Event | Description |
|-------|-------------|
| `payment_intent.succeeded` | Payment was successful |
| `payment_intent.payment_failed` | Payment attempt failed |
| `charge.succeeded` | Charge was successful |

The exact set of processed events is managed by the ecommerce plugin's Stripe adapter. The plugin automatically maps these events to the appropriate order and transaction updates.
