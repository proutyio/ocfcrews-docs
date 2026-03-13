---
sidebar_position: 8
title: "Schedule Swap Board API"
---

# Schedule Swap Board API

## Overview

The Swap Board lets crew members post shifts they can no longer cover so other members can claim them. Posting removes the user from the position; claiming assigns the claimer.

**Source:** `src/app/(app)/api/schedule/swap-board/route.ts`

## List Open Swaps

**Endpoint:** `GET /api/schedule/swap-board`

Returns all open shifts posted to the swap board for the authenticated user's crew.

### Headers

| Header | Required | Description |
|---|---|---|
| `Cookie` | Yes | Payload session cookie |
| `Authorization` | Alt | `JWT <token>` |

### Success Response

**Status:** `200 OK`

```json
{
  "swaps": [
    {
      "id": "swap123",
      "requestor": { "id": "u1", "name": "Jane Smith" },
      "schedule": {
        "id": "sched456",
        "date": "2026-03-15",
        "meal": "morning",
        "shiftType": "morning"
      },
      "positionIndex": 0,
      "positionName": "Serving",
      "message": "Can't make it this week",
      "createdAt": "2026-03-01T10:00:00.000Z"
    }
  ]
}
```

## Post a Shift to the Swap Board

**Endpoint:** `POST /api/schedule/swap-board`

### Request Body

```json
{
  "scheduleId": "sched456",
  "positionIndex": 0,
  "message": "Can't make it this week"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `scheduleId` | `string` | Yes | Schedule document ID |
| `positionIndex` | `integer` | Yes | Zero-based position index |
| `message` | `string` | No | Optional message explaining the swap (max 500 characters) |

### Validation Rules

1. **Authentication** — User must be logged in.
2. **Schedule existence** — Schedule must exist.
3. **Crew isolation** — User's crew must match the schedule's crew.
4. **Assignment check** — User must be currently assigned to the specified position.
5. **Not already posted** — The same shift/position combination cannot be posted twice.
6. **Future shifts only** — Cannot post past shifts to the swap board.

### Success Response

**Status:** `200 OK`

```json
{ "success": true }
```

## Claim a Shift from the Swap Board

**Endpoint:** `PATCH /api/schedule/swap-board`

### Request Body

```json
{
  "swapId": "swap123"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `swapId` | `string` | Yes | The swap board entry ID |

### Validation Rules

1. **Authentication** — User must be logged in.
2. **Swap existence** — Swap must exist and still be open.
3. **Crew isolation** — User's crew must match the swap's crew.
4. **Not your own swap** — Cannot claim a shift you posted.
5. **Position capacity** — Position must not already be full.

### What Happens on Claim

1. The swap entry is updated to `status: 'approved'` with `claimedBy` set to the claimer's user ID (using a conditional update to prevent race conditions).
2. The original requestor is replaced by the claimer in-place within the position's `assignedMembers` array (swapped, not removed then added).
3. The original requestor receives a notification that their shift was claimed.

### Success Response

**Status:** `200 OK`

```json
{ "success": true }
```

## Error Responses

| Status | Error | Cause |
|---|---|---|
| 400 | Missing fields | Required fields not provided |
| 400 | You cannot claim your own swap | Claimer is the same user who posted the swap |
| 400 | Swap is not available | Swap is not `open` or not `pending` |
| 400 | Position no longer valid | Position index is out of bounds on the current schedule |
| 400 | Original member is no longer assigned | Requestor was already removed from the position |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Crew mismatch |
| 404 | Not found | Invalid `scheduleId` or `swapId` |
| 409 | Already posted | Duplicate swap board entry |
| 409 | Swap was already claimed | Another user claimed the swap first (race condition) |
| 429 | Too many requests | Rate limit exceeded |
