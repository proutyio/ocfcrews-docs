---
sidebar_position: 17
title: "Stock Notifications"
---

# Stock Notifications Collection

**Slug**: `stock-notifications`

Opt-in email subscriptions for out-of-stock products. See [Stock Notifications Feature](../features/ecommerce/stock-notifications).

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `product` | Relationship → products (indexed, required) | The out-of-stock product |
| `variant` | Relationship → variants | Optional specific variant being watched |
| `user` | Relationship → users (indexed, required) | The subscribed user (auto-set via `beforeValidate` hook) |
| `notified` | Checkbox | Whether the user has been notified (default: false) |
| `notifiedAt` | Date | When the notification was sent |
| `createdAt` | Date | Auto-set |

## Access Control

| Operation | Who |
|-----------|-----|
| Create | Authenticated users only |
| Read | Admin sees all; authenticated users see their own notifications only |
| Update | Admin only |
| Delete | Admin sees all; authenticated users can delete their own notifications |

## Lifecycle

Records are created when an authenticated user clicks "Notify me when available". The `user` field is auto-set from the authenticated session via a `beforeValidate` hook. When the product is restocked, matching records are queried, notifications are sent, and the `notified` flag is set to true with a `notifiedAt` timestamp.
