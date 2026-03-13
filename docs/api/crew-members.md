---
sidebar_position: 10
title: "Crew Members API"
---

# Crew Members API

## Overview

The Crew Members API returns a list of members belonging to the authenticated user's crew. Contact information visibility is controlled by role-based access rules.

**Endpoint:** `GET /api/crews/members`

**Source:** `src/app/(app)/api/crews/members/route.ts`

## Request

### Headers

| Header | Required | Description |
|---|---|---|
| `Cookie` | Yes | Payload session cookie for authentication |
| `Authorization` | Alt | `JWT <token>` for programmatic access |

### Query Parameters

None.

## Authentication & Authorization

- **Required roles:** `admin`, `editor`, `crew_coordinator`, or `crew_leader`.
- The user must belong to a crew.
- Users with other roles (e.g., `crew_member`, `crew_elder`) will receive a `403` error.
- Results are scoped to the authenticated user's crew only (crew isolation).

## Validation Rules

1. The user must be authenticated.
2. The user must belong to a crew (`getUserCrewId` must return a valid crew ID).
3. The user must have one of the permitted roles: `admin`, `editor`, `crew_coordinator`, or `crew_leader`.

## Response

### Success Response

**200 OK**

```json
{
  "members": [
    {
      "id": "string",
      "name": "string",
      "email": "string (only if viewer has contact access)"
    }
  ]
}
```

#### Field Details

| Field | Type | Always Present | Description |
|---|---|---|---|
| `id` | `string` | Yes | The user's document ID |
| `name` | `string` | Yes | Display name: uses `nickname` if set, falls back to `name`, then `email` (if contact access), then `"Unknown"` |
| `email` | `string` | No | Only included when the requesting user has contact access (admin or crew coordinator roles) |

### Error Responses

| Status | Error | Cause |
|---|---|---|
| 401 | `Unauthorized` | Not authenticated |
| 403 | `No crew` | User does not belong to a crew |
| 403 | `Forbidden` | User does not have a permitted role |
| 429 | `Too many requests` | Rate limit exceeded (30 requests per 60 seconds) |

## Implementation Details

### Contact Information Access

Contact information (email) is conditionally included based on the requesting user's role:

| Role | Can See Email |
|---|---|
| `admin` | Yes |
| `crew_coordinator` | Yes |
| `editor` | No |
| `crew_leader` | No |

This follows the project-wide `contactReadAccess` pattern defined in `src/access/adminOrCrewCoordinator.ts`. Phone numbers are not returned by this endpoint.

### Name Resolution

The `name` field in each member object is resolved using this priority order:

1. `nickname` -- if the user has set a nickname
2. `name` -- the user's full name
3. `email` -- only used as a fallback if the requesting user has contact access
4. `"Unknown"` -- final fallback if no identifying information is available

### Crew Isolation

The endpoint queries users with `crew: { equals: crewId }`, ensuring that only members of the authenticated user's own crew are returned. There is no way to query members of other crews through this endpoint.

### Pagination

The endpoint does not support pagination. It returns up to **200 members** in a single response with pagination disabled. This is sufficient for the expected crew sizes in this application.

### Rate Limiting

- **Limit:** 30 requests per 60-second window per user
- **Key:** `crew-members:{userId}`
