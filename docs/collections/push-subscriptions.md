---
sidebar_position: 16
title: "Push Subscriptions"
---

# Push Subscriptions Collection

**Slug**: `push-subscriptions`

Browser push notification subscriptions. Each record stores the Web Push API subscription data for a user's browser, enabling the platform to send push notifications.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `user` | Relationship → users | The subscribing user (required, indexed) |
| `endpoint` | Text | Push service endpoint URL (required, unique, max 2048 chars) |
| `keys.p256dh` | Text | Client public key for encryption (required, max 200 chars) |
| `keys.auth` | Text | Authentication secret (required, max 100 chars) |
| `expirationTime` | Date | Optional expiration provided by the browser push service |
| `userAgent` | Text | Browser/device info for debugging (max 512 chars) |

## Access Control

| Operation | Who |
|-----------|-----|
| Create | Server-only (via `overrideAccess`) |
| Read | Admin (all), users (own subscriptions only) |
| Update | Not allowed (subscriptions are immutable — re-subscribe creates a new record) |
| Delete | Admin (all), users (own subscriptions only) |

## API Routes

See [Push Subscriptions API](../api/push-subscriptions) for the subscription management endpoints.

## Related

- [Notifications Feature](../features/notifications) — In-app notification system
- [Push Subscriptions API](../api/push-subscriptions) — REST endpoints
