---
sidebar_position: 7
title: "Discount Codes"
---

# Discount Codes

Discount codes allow shop admins and coordinators to offer promotions on shop purchases. Codes are validated at checkout and can be crew-specific, time-limited, or capped by usage.

## Code Fields

| Field | Type | Description |
|-------|------|-------------|
| `code` | text | The unique code string users enter at checkout (max 100, auto-uppercased, unique, indexed) |
| `description` | text | Internal description for this discount code (max 500 chars) |
| `discountType` | select | `percentage` or `fixed` (required, default: `percentage`) |
| `amount` | number | Discount amount -- percentage (0--100) or fixed USD amount (required, min 0). Percentage values validated to not exceed 100. |
| `minOrderTotal` | number | Minimum order total to apply this discount (min 0, default: 0 = no minimum) |
| `crew` | relationship | Optional -- restricts code to a specific crew's members |
| `expiresAt` | date | Optional expiry timestamp |
| `maxUses` | number | Optional cap on total redemptions (0 = unlimited) |
| `usedCount` | number | Auto-incremented on each successful use (read-only, default: 0) |
| `isActive` | checkbox | Admin toggle to enable or disable the code (default: true) |

## Validation

When a user enters a code at checkout:

1. `POST /api/discount/validate` is called with the code and the current user's crew.
2. The handler checks: code exists, `isActive: true`, not expired, usage below `maxUses`, order meets `minOrderTotal`, and if crew-restricted, the user belongs to that crew.
3. On success, the discounted amount is returned and applied to the order total.
4. On payment success, `usedCount` is incremented atomically.

## Access Control

| Operation | Roles |
|-----------|-------|
| **Create** | `admin`, `crew_coordinator`, `shop_admin`, `shop_editor` |
| **Read** | `admin` (all codes); `crew_coordinator`, `shop_admin`, `shop_editor`, `shop_viewer` (own crew's codes or non-crew-scoped codes) |
| **Update** | `admin` (all codes); `crew_coordinator`, `shop_admin`, `shop_editor` (own crew's codes) |
| **Delete** | `admin` (all codes); `shop_admin` (own crew's codes) |

Regular users can only apply codes at checkout -- they cannot view or manage them.

## Crew-Scoped Codes

If a code has a `crew` field set, it is only valid for users who are members of that crew. This allows crews to offer exclusive discounts to their members without leaking codes to other crews.

## Related

- [Discount Codes Collection](../../collections/discount-codes)
- [E-commerce Overview](./overview)
- [Checkout Flow](./checkout-flow)
