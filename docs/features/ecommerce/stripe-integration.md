---
sidebar_position: 2
title: "Stripe Integration"
---

# Stripe Integration

The OCFCrews e-commerce system uses Stripe for payment processing, integrated through the `@payloadcms/plugin-ecommerce` payment adapter system.

## Configuration

**Source**: `src/plugins/index.ts`

Stripe is configured as a payment method within the ecommerce plugin:

```typescript
import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'

ecommercePlugin({
  payments: {
    paymentMethods: [
      stripeAdapter({
        secretKey: process.env.STRIPE_SECRET_KEY!,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
      }),
    ],
  },
  // ...
})
```

## Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `STRIPE_SECRET_KEY` | Server-only | Stripe secret API key (starts with `sk_test_` or `sk_live_`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-accessible | Stripe publishable key (starts with `pk_test_` or `pk_live_`) |
| `STRIPE_WEBHOOKS_SIGNING_SECRET` | Server-only | Webhook endpoint signing secret (starts with `whsec_`) |

All three variables are required for the e-commerce system to function. Without them, the Stripe adapter will fail to initialize.

## Stripe Elements

The checkout page uses **Stripe Elements** for PCI-compliant credit card collection. Stripe Elements is loaded on the client side using the `@stripe/stripe-js` and `@stripe/react-stripe-js` packages.

**Source**: `src/components/Shop/checkout/CheckoutPage.tsx`

```typescript
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = loadStripe(apiKey)
```

The Elements provider wraps the `CheckoutForm` component and is configured with:

- A **client secret** obtained from the payment initiation step
- **Appearance** settings that adapt to the current theme (light/dark mode)
- Custom styling using CSS variables that match the OCFCrews design system

### Theme Integration

The Stripe Elements appearance is dynamically configured based on the current theme:

```typescript
appearance: {
  theme: 'stripe',
  variables: {
    colorBackground: theme === 'dark' ? '#0a0a0a' : cssVariables.colors.base0,
    colorText: theme === 'dark' ? '#858585' : cssVariables.colors.base1000,
    // ...
  },
}
```

## Payment Flow

### 1. Payment Initiation

When the user clicks "Go to payment", the `initiatePayment` function (from the ecommerce plugin's client hooks) is called:

```typescript
const paymentData = await initiatePayment('stripe', {
  additionalData: {
    customerEmail: email,
    billingAddress,
    shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
  },
})
```

This creates a Stripe PaymentIntent on the server and returns a `clientSecret` to the client.

### 2. Card Collection

The Stripe Elements form collects card details securely. The card data never touches the OCFCrews server -- it goes directly to Stripe.

### 3. Payment Confirmation

After the user submits payment, Stripe processes the charge and redirects to the confirmation page with a `payment_intent` query parameter.

### 4. Order Confirmation

The `ConfirmOrder` component calls `confirmOrder('stripe', { additionalData: { paymentIntentID } })` to finalize the order on the server.

## Error Handling

The checkout page handles several error scenarios:

- **Out of stock**: If items become unavailable during checkout, an appropriate error message is shown
- **Payment failure**: Stripe errors are surfaced to the user with a "Try again" option
- **Network errors**: General error handling with toast notifications

## Local Testing

For local Stripe webhook testing, use the Stripe CLI:

```bash
pnpm stripe-webhooks
```

This runs:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

The Stripe CLI forwards webhook events from Stripe's servers to your local development server, enabling full end-to-end testing of the payment flow.
