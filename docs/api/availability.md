---
sidebar_position: 6
title: "Availability API"
---

# Availability API

## Overview

The Availability API allows crew members to declare when they are available, unavailable, or have preferred scheduling times. Coordinators can query expanded availability across the entire crew for a date range, including recurring entries.

## Custom REST Endpoints

A custom route at `src/app/(app)/api/availability/route.ts` **overrides** Payload's auto-generated CRUD endpoints for the `availability` collection. All GET, POST, PATCH, and DELETE operations go through this custom handler, which provides additional validation, crew isolation, and features like recurring entry generation.

### List / Query Availability

**Endpoint:** `GET /api/availability`

**Source:** `src/app/(app)/api/availability/route.ts`

#### Headers

| Header | Required | Description |
|---|---|---|
| `Cookie` | Yes | Payload session cookie |
| `Authorization` | Alt | `JWT <token>` for programmatic access |

#### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `crewWide` | `boolean` | If `true` and the user is privileged (admin, editor, coordinator, or leader), returns all availability entries for the user's crew. Otherwise, returns only the user's own entries. |

#### Authentication & Authorization

- **Admin / Editor / Coordinator / Leader**: When `crewWide=true`, can read all entries within their crew (crew isolation enforced via `{ crew: { equals: crewId } }`).
- **Regular members**: Can only read their own entries (`{ user: { equals: userId } }`), regardless of `crewWide` parameter.

Results are sorted by `startDate` ascending, limited to 200 entries, with depth 1 (relationships populated).

#### Success Response

**200 OK**

Returns standard Payload pagination format:

```json
{
  "docs": [
    {
      "id": "abc123",
      "user": "user-id",
      "crew": "crew-id",
      "startDate": "2026-03-10T00:00:00.000Z",
      "endDate": "2026-03-10T00:00:00.000Z",
      "type": "available",
      "preferredShifts": ["morning", "afternoon"],
      "preferredPositions": ["position-id-1"],
      "willBeLate": false,
      "lateArrivalTime": null,
      "recurrence": "none",
      "recurrenceDays": null,
      "recurrenceEndDate": null,
      "note": "Available all day",
      "createdAt": "2026-03-01T12:00:00.000Z",
      "updatedAt": "2026-03-01T12:00:00.000Z"
    }
  ],
  "totalDocs": 1,
  "limit": 200,
  "page": 1,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

---

### Create Availability Entry

**Endpoint:** `POST /api/availability`

**Source:** `src/app/(app)/api/availability/route.ts`

#### Headers

| Header | Required | Description |
|---|---|---|
| `Cookie` | Yes | Payload session cookie |
| `Authorization` | Alt | `JWT <token>` for programmatic access |
| `Content-Type` | Yes | `application/json` |

#### Request Body

```json
{
  "startDate": "2026-03-10",
  "endDate": "2026-03-10",
  "type": "available",
  "preferredShifts": ["morning"],
  "preferredPositions": ["position-id"],
  "willBeLate": false,
  "lateArrivalTime": null,
  "recurrence": "weekly",
  "recurrenceDays": ["1", "3", "5"],
  "recurrenceEndDate": "2026-06-01",
  "note": "Prefer morning shifts"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `startDate` | `date` | Yes | Start date of the availability window |
| `endDate` | `date` | Yes | End date of the availability window |
| `type` | `string` | Yes | One of `available`, `unavailable`, `preferred` |
| `preferredShifts` | `string[]` | No | Array of `morning`, `afternoon`, `night`. Hidden when type is `unavailable`. |
| `preferredPositions` | `string[]` | No | Array of schedule-position IDs. Hidden when type is `unavailable`. |
| `willBeLate` | `boolean` | No | Whether the member will arrive late. Default `false`. Hidden when type is `unavailable`. |
| `lateArrivalTime` | `string` | No | Estimated arrival time (e.g., `10:00 AM`). Only shown when `willBeLate` is true. |
| `recurrence` | `string` | No | One of `none`, `weekly`, `biweekly`. Default `none`. |
| `recurrenceDays` | `string[]` | No | Days of week as JS `getDay()` values: `0`=Sunday through `6`=Saturday. Only used when recurrence is not `none`. |
| `recurrenceEndDate` | `date` | No | Stop repeating after this date. Defaults to 12 weeks from `startDate` if omitted. |
| `note` | `string` | No | Free-text note, max 500 characters. |

**Note:** The `user` and `crew` fields are **auto-populated** from the authenticated session via a `beforeValidate` hook. Non-admin users cannot set these fields manually.

#### Authentication & Authorization

- Any authenticated user with a crew assignment can create entries.
- The `user` and `crew` fields are forced to the authenticated user's values (unless the user is an admin).

#### Validation Rules

1. `startDate` and `endDate` are required date fields.
2. `type` must be one of `available`, `unavailable`, or `preferred`.
3. `endDate` must be on or after `startDate` (enforced by `beforeChange` hook).
4. `lateArrivalTime`, if provided, must match `H:MM AM/PM` format (e.g., `10:00 AM`).
5. `note` is limited to 500 characters.
6. `recurrenceDays` values must be `0`-`6`.

#### Success Response

**200 OK**

```json
{
  "success": true,
  "entry": { "id": "new-id", "..." : "..." },
  "totalCreated": 5
}
```

| Field | Type | Description |
|---|---|---|
| `success` | `boolean` | Always `true` on success |
| `entry` | `object` | The first created availability entry (the "base" entry) |
| `totalCreated` | `integer` | Total number of entries created (> 1 when recurring) |
| `truncated` | `boolean` | *(Optional)* Present and `true` when recurring entries were capped at 100 |
| `truncatedMessage` | `string` | *(Optional)* Message advising to use a shorter recurrence window |

For recurring entries, the custom route generates individual date-range entries per matching day-of-week per cycle. If the recurrence generates 100 or more entries, the result is truncated and the `truncated` field is included in the response.

#### Error Responses

| Status | Error | Cause |
|---|---|---|
| 400 | `startDate, endDate, and type are required` | Missing required fields |
| 400 | `Dates must be YYYY-MM-DD format` | Invalid date format |
| 400 | `Invalid availability type` | `type` is not one of `available`, `unavailable`, `preferred` |
| 400 | `End date must be on or after start date` | `endDate` is before `startDate` |
| 400 | `Invalid note format` | `note` is not a string |
| 401 | `Unauthorized` | Not authenticated |
| 403 | `No crew` | User has no crew assignment |

---

### Update Availability Entry

**Endpoint:** `PATCH /api/availability`

**Source:** `src/app/(app)/api/availability/route.ts`

#### Headers

| Header | Required | Description |
|---|---|---|
| `Cookie` | Yes | Payload session cookie |
| `Authorization` | Alt | `JWT <token>` for programmatic access |
| `Content-Type` | Yes | `application/json` |

#### Request Body

Partial update -- include only the fields you want to change. The `id` field is required in the request body.

```json
{
  "id": "abc123",
  "type": "unavailable",
  "note": "Doctor appointment"
}
```

#### Authentication & Authorization

- **Admin**: Can update any entry.
- **All other users**: Can only update their own entries (`{ user: { equals: userId } }`). Crew membership is also verified.

#### Success Response

**200 OK**

```json
{
  "success": true,
  "entry": { "id": "abc123", "..." : "..." }
}
```

---

### Delete Availability Entry

**Endpoint:** `DELETE /api/availability?id={id}`

**Source:** `src/app/(app)/api/availability/route.ts`

The entry ID is passed as a query parameter.

#### Authentication & Authorization

- **Admin**: Can delete any entry.
- **All other users**: Can only delete their own entries (`{ user: { equals: userId } }`). Crew membership is also verified.

#### Success Response

**200 OK**

```json
{ "success": true }
```

---

## Custom Route: Crew Availability View

**Endpoint:** `GET /api/schedule/crew-availability`

**Source:** `src/app/(app)/api/schedule/crew-availability/route.ts`

### Overview

Returns a consolidated view of all crew members, their availability entries (with recurring entries expanded into individual dates), schedule positions, and optionally existing schedules for a date range. Designed for the coordinator scheduling view.

### Headers

| Header | Required | Description |
|---|---|---|
| `Cookie` | Yes | Payload session cookie |
| `Authorization` | Alt | `JWT <token>` for programmatic access |

### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `startDate` | `string` | Yes | Start of range in `YYYY-MM-DD` format |
| `endDate` | `string` | Yes | End of range in `YYYY-MM-DD` format |
| `include` | `string` | No | `base` for members + availability + positions only, `schedules` for schedules only, omit for all data |

### Authentication & Authorization

- Requires one of: `admin`, `crew_coordinator`, or `crew_leader` role.
- Crew isolation: only returns data for the authenticated user's crew.
- Rate limited: 30 requests per 60 seconds per user.

### Validation Rules

1. Both `startDate` and `endDate` are required.
2. Both must be in `YYYY-MM-DD` format (regex validated).
3. `startDate` must not be after `endDate`.

### Recurrence Expansion

Recurring availability entries are expanded into individual per-date records within the requested range:

- **Weekly**: Repeats on the specified `recurrenceDays` each week.
- **Biweekly**: Repeats every other week, relative to the original `startDate` (week 0 is the origin week).
- **None**: Returned unchanged.

Expansion is bounded by the intersection of the requested range, the entry's own date range, and the `recurrenceEndDate` (defaults to 12 weeks from `startDate` if not set).

### Response

#### Success Response

**200 OK**

When `include` is omitted (full response):

```json
{
  "members": [
    { "id": "user-id", "name": "Jane Doe", "nickname": "Jane", "email": "jane@example.com" }
  ],
  "availability": [
    {
      "id": "avail-id",
      "user": "user-id",
      "startDate": "2026-03-10",
      "endDate": "2026-03-10",
      "type": "available",
      "recurrence": "none",
      "..."
    }
  ],
  "positions": [
    { "id": "pos-id", "name": "Dishwasher", "crew": "crew-id" }
  ],
  "schedules": [
    { "id": "sched-id", "date": "2026-03-10", "meal": "Dinner", "..." }
  ]
}
```

When `include=base`, only `members`, `availability`, and `positions` are returned.

When `include=schedules`, only `schedules` is returned.

#### Error Responses

| Status | Error | Cause |
|---|---|---|
| 400 | `startDate and endDate required` | Missing query parameters |
| 400 | `Dates must be YYYY-MM-DD format` | Invalid date format |
| 400 | `startDate must be before endDate` | Inverted date range |
| 401 | `Unauthorized` | Not authenticated |
| 403 | `Forbidden` | User lacks coordinator/leader/admin role |
| 403 | `No crew assigned` | User has no crew |
| 429 | `Too many requests` | Rate limit exceeded |
| 500 | `Failed to fetch data` | Server error |

## Hooks

### `beforeValidate`

Auto-populates `user` and `crew` from the authenticated session. Non-admin users cannot override these fields.

### `beforeChange`

Validates that `endDate` is on or after `startDate`. Throws an error if the date range is invalid.
