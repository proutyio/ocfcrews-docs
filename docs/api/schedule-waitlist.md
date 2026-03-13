---
sidebar_position: 7
title: "Schedule Waitlist API"
---

# Schedule Waitlist API

## Overview

The waitlist allows crew members to express interest in a position that is already full. When a spot opens up (someone leaves), the coordinator can see who is waiting and manually assign from the waitlist.

**Source:** `src/app/(app)/api/schedule/waitlist/route.ts`

## Check Waitlist Status

**Endpoint:** `GET /api/schedule/waitlist`

Returns the waitlist entries for a given position.

### Headers

| Header | Required | Description |
|---|---|---|
| `Cookie` | Yes | Payload session cookie |
| `Authorization` | Alt | `JWT <token>` |

### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `shiftId` | `string` | Yes | Schedule document ID |
| `positionIndex` | `integer` | Yes | Zero-based position index |

### Success Response

**Status:** `200 OK`

```json
{
  "count": 3,
  "isOnWaitlist": true,
  "position": 1,
  "waitlistEntryId": "abc123"
}
```

| Field | Type | Description |
|---|---|---|
| `count` | `integer` | Total number of users on the waitlist for this position |
| `isOnWaitlist` | `boolean` | `true` if the authenticated user is currently on the waitlist |
| `position` | `integer \| null` | The user's 1-based position in the waitlist, or `null` if not on it |
| `waitlistEntryId` | `string \| null` | The ID of the user's waitlist entry, or `null` if not on it |

## Join Waitlist

**Endpoint:** `POST /api/schedule/waitlist`

### Request Body

```json
{
  "shiftId": "abc123",
  "positionIndex": 0
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `shiftId` | `string` | Yes | Schedule document ID |
| `positionIndex` | `integer` | Yes | Zero-based position index |

### Validation Rules

1. **Authentication** — User must be logged in.
2. **Schedule existence** — Schedule must exist.
3. **Crew isolation** — User's crew must match the schedule's crew.
4. **Position bounds** — `positionIndex` must be within the schedule's positions array.
5. **Not already assigned** — User cannot join the waitlist for a position they're already in.
6. **No duplicate entries** — User cannot join the same waitlist twice.

### Success Response

**Status:** `200 OK`

```json
{ "success": true }
```

## Leave Waitlist

**Endpoint:** `DELETE /api/schedule/waitlist`

### Request Body

```json
{
  "shiftId": "abc123",
  "positionIndex": 0
}
```

### Success Response

**Status:** `200 OK`

```json
{ "success": true }
```

Returns `404` with `"Not on waitlist"` if the user was not on the waitlist (not idempotent).

## Error Responses

| Status | Error | Cause |
|---|---|---|
| 400 | Missing fields | `shiftId` or `positionIndex` not provided |
| 400 | Invalid positionIndex | Index out of bounds |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Crew mismatch |
| 404 | Schedule not found | Invalid `shiftId` |
| 404 | Not on waitlist | User was not on the waitlist (DELETE only) |
| 409 | Already on waitlist | Duplicate entry attempt |
| 429 | Too many requests | Rate limit exceeded |
