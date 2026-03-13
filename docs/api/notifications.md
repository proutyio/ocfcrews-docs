---
sidebar_position: 8
title: "Notifications API"
---

# Notifications API

## Overview

The notifications API provides endpoints for listing, marking as read, and deleting in-app notifications. Notifications are created automatically by system events (shift sign-ups, swap requests, announcements, comments) and by the admin notify endpoint.

**Source:** `src/app/(app)/api/notifications/`

## List Notifications

**Endpoint:** `GET /api/notifications`

Returns notifications for the authenticated user.

### Headers

| Header | Required | Description |
|---|---|---|
| `Cookie` | Yes | Payload session cookie |
| `Authorization` | Alt | `JWT <token>` |

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `unreadOnly` | `boolean` | If `true`, returns only unread notifications |
| `limit` | `integer` | Max results (default: 20, capped at 50) |
| `page` | `integer` | Page number (default: 1) |

### Success Response

**Status:** `200 OK`

The response uses standard Payload CMS pagination format (the result of `payload.find()` is returned directly):

```json
{
  "docs": [
    {
      "id": "abc123",
      "type": "schedule_update",
      "title": "Shift Update",
      "message": "You've been signed up for the Morning shift on March 15.",
      "read": false,
      "createdAt": "2026-03-01T10:00:00.000Z",
      "link": "/crew/schedule?date=2026-03-15"
    }
  ],
  "totalDocs": 12,
  "limit": 20,
  "page": 1,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

### Notification Types

| Type | Trigger |
|---|---|
| `schedule_update` | Member joins/leaves a shift, or is removed |
| `shift_swap` | Swap request sent to another user |
| `inventory_alert` | Low stock events |
| `announcement` | Manual/admin announcements |
| `comment` | New comment on a shift |

## Mark a Single Notification as Read

**Endpoint:** `PATCH /api/notifications/read`

Marks a single notification as read.

### Request Body

```json
{
  "id": "abc123"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | The notification ID to mark as read |

### Success Response

**Status:** `200 OK`

```json
{ "success": true }
```

### Error Responses

| Status | Error | Cause |
|---|---|---|
| 400 | `id is required` | Missing or invalid `id` in request body |
| 403 | `Forbidden` | Notification belongs to a different user |
| 404 | `Notification not found` | Invalid notification ID |

## Mark All Notifications as Read

**Endpoint:** `POST /api/notifications/read`

Marks all unread notifications for the authenticated user as read. No request body required.

### Success Response

**Status:** `200 OK`

```json
{ "success": true }
```

## Delete Notifications

**Endpoint:** `DELETE /api/notifications`

Deletes all notifications for the authenticated user.

### Success Response

**Status:** `200 OK`

```json
{ "success": true }
```

## Authentication & Authorization

All endpoints require authentication. Users can only access their own notifications — isolation is enforced via `{ user: { equals: userId } }` queries.

## Error Responses

| Status | Error | Cause |
|---|---|---|
| 401 | Unauthorized | Not authenticated |
| 400 | Bad request | Missing or invalid request body |
