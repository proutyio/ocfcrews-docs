---
sidebar_position: 9
title: "Push Subscriptions API"
---

# Push Subscriptions API

## Overview

These endpoints register and unregister browser push notification subscriptions using the Web Push API. Once subscribed, the user receives push notifications for shifts, swaps, announcements, and other events even when the app is not open.

**Source:** `src/app/(app)/api/push-subscriptions/`

## Subscribe

**Endpoint:** `POST /api/push-subscriptions/subscribe`

Registers a push subscription for the authenticated user on the current device/browser.

### Headers

| Header | Required | Description |
|---|---|---|
| `Cookie` | Yes | Payload session cookie |
| `Authorization` | Alt | `JWT <token>` |
| `Content-Type` | Yes | `application/json` |

### Request Body

The request body is the `PushSubscription` object returned by `registration.pushManager.subscribe()`:

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "expirationTime": null,
  "keys": {
    "p256dh": "BNcRdreA...",
    "auth": "tBHItJ..."
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `endpoint` | `string` | Yes | Push service endpoint URL |
| `keys.p256dh` | `string` | Yes | Public encryption key |
| `keys.auth` | `string` | Yes | Authentication secret |

### Success Response

**Status:** `200 OK`

```json
{ "success": true }
```

If the subscription already exists for this user and endpoint, the existing record is updated (upsert behavior).

### Error Responses

| Status | Error | Cause |
|---|---|---|
| 400 | Missing subscription data | Invalid or missing push subscription object |
| 401 | Unauthorized | Not authenticated |

## Unsubscribe

**Endpoint:** `DELETE /api/push-subscriptions/unsubscribe`

Removes a push subscription for the current device/browser.

### Request Body

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `endpoint` | `string` | Yes | The endpoint URL of the subscription to remove |

### Success Response

**Status:** `200 OK`

```json
{ "success": true }
```

Returns `200` even if no matching subscription was found (idempotent).

## Browser Integration Example

```javascript
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY'

async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })

  await fetch('/api/push-subscriptions/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(subscription),
  })
}

async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return

  await fetch('/api/push-subscriptions/unsubscribe', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  })

  await subscription.unsubscribe()
}
```
