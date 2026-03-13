---
sidebar_position: 1
title: "E-commerce Overview"
---

# E-commerce Overview

OCFCrews includes a built-in shop system powered by the official `@payloadcms/plugin-ecommerce` plugin. The shop enables crews to sell merchandise, event tickets, or other items to members and optionally to the public.

## Plugin Architecture

The e-commerce functionality is provided by `@payloadcms/plugin-ecommerce`, which is configured in `src/plugins/index.ts`. The plugin automatically creates and manages several collections:

| Collection | Purpose |
|------------|---------|
| `products` | Product catalog with variants, pricing, and gallery |
| `orders` | Completed purchase records |
| `transactions` | Immutable payment transaction records |
| `carts` | Active shopping carts |
| `addresses` | Customer shipping/billing addresses |
| `variantTypes` | Product variant type definitions (e.g., "Size", "Color") |
| `variantOptions` | Individual variant options (e.g., "Small", "Medium", "Large") |

The plugin is configured with collection overrides that customize access control and admin grouping for the OCFCrews application.

## Key Features

### Products and Variants

Products support optional variants (e.g., sizes, colors) with per-variant pricing. Each product has:

- Title, description (rich text), and gallery images
- Optional variant configuration with variant-specific pricing
- Categories for organization and filtering
- Optional crew association for crew-specific products
- SEO metadata
- Related products
- Inventory tracking

### Cart System

The cart is managed through the ecommerce plugin's built-in cart system. Users can:

- Add products (with variant selection) to their cart
- Update quantities
- Remove items
- View cart total

The cart is persisted server-side and associated with the authenticated user. Cart access is restricted so users can only update their own cart (`isDocumentOwner` access).

### Checkout and Payments

Checkout is handled through Stripe Elements, providing a secure, PCI-compliant payment flow. The process includes:

1. Address collection (billing and optional separate shipping)
2. Payment initiation via Stripe
3. Order confirmation

### Orders

Completed purchases create order records that are visible to the customer and admins.

## Shop Disabled Toggle

The shop can be temporarily disabled via the **Global Settings** (`settings` global). The `shopDisabled` checkbox, when enabled, replaces the entire shop layout with a "Shop Temporarily Unavailable" message.

**Source**: `src/globals/Settings/index.ts`

```typescript
{
  name: 'shopDisabled',
  type: 'checkbox',
  label: 'Disable Shop',
  defaultValue: false,
  admin: {
    description: 'When enabled, the shop will show a "temporarily unavailable" message to all users.',
  },
}
```

The shop layout checks this setting on every render:

```typescript
const settings = await getCachedGlobal('settings', 0)()
if (settings.shopDisabled) {
  return <ShopTemporarilyUnavailable />
}
```

Only admins can toggle this setting. The cache is revalidated via an `afterChange` hook that calls `revalidateTag('global_settings')`.

## Stripe Integration

The shop uses Stripe as its payment processor, configured through the `stripeAdapter` from `@payloadcms/plugin-ecommerce/payments/stripe`. Three environment variables are required:

- `STRIPE_SECRET_KEY` -- Server-side Stripe API key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` -- Client-side Stripe publishable key
- `STRIPE_WEBHOOKS_SIGNING_SECRET` -- Webhook signature verification secret

## Admin Grouping

All e-commerce collections are grouped under the **Shop** section in the Payload admin panel for easy management.

## Access Control Summary

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| Products | Published or admin | admin, crew_coordinator | admin or own crew (coordinator) | admin or own crew (coordinator) |
| Orders | admin or own orders | Plugin-managed | Plugin-managed | Plugin-managed |
| Transactions | admin or own transactions | Disabled (webhook only) | Disabled (immutable) | Disabled |
| Carts | Plugin-managed | Plugin-managed | Document owner | Plugin-managed |
| Addresses | admin or own addresses | Any user | admin or own addresses | admin or own addresses |
