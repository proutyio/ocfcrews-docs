---
sidebar_position: 10
title: "Stock Notifications"
---

# Stock Notifications

When a product is out of stock, users can opt in to be notified by email when it becomes available again.

## User Flow

1. A user visits a product detail page for an out-of-stock item.
2. They click **"Notify me when available"**.
3. A `stock-notifications` record is created linking the user to the product (and optionally a specific variant).
4. When a shop admin restocks the product (sets `inStock: true` or updates the inventory quantity), the notification records for that product are found and notification emails are sent.
5. Notification records are flagged with `notified: true` and `notifiedAt` is set to the current timestamp. Records are **not** deleted after notification.

## Data Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `product` | relationship | Yes | Linked product document (indexed) |
| `variant` | relationship | No | Linked variant document (for variant-specific notifications) |
| `user` | relationship | Yes | Linked user document (indexed). Auto-stamped from authenticated user via `beforeValidate` hook. |
| `notified` | checkbox | No | Whether the notification email has been sent (default: false) |
| `notifiedAt` | date | No | Timestamp when the notification was sent |
| `createdAt` | date | -- | Auto-set on creation |

## Sending Notifications

Notification emails are triggered either:
- **Automatically**: via an `afterChange` hook on the `products` collection when `inStock` transitions from `false` to `true`.
- **Manually**: from the admin panel product detail page via an action button.

The email is sent using the standard email infrastructure (Resend SMTP) from `noreply@ocfcrews.org`.

## Deduplication

If a user clicks "Notify me" multiple times for the same product, the system upserts the record rather than creating duplicates.

## Access Control

| Operation | Rule |
|-----------|------|
| **Create** | Any authenticated user |
| **Read** | Admin: all notifications. Regular users: only their own (`{ user: { equals: user.id } }`) |
| **Update** | Admin only |
| **Delete** | Admin: all notifications. Regular users: only their own (`{ user: { equals: user.id } }`) |

Guest (unauthenticated) users cannot subscribe for notifications.

## Related

- [Stock Notifications Collection](../../collections/stock-notifications)
- [Products](./products)
- [E-commerce Overview](./overview)
