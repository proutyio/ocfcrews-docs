---
sidebar_position: 3
title: "Crew Isolation Pattern"
---

# Crew Isolation Pattern

Crew isolation is the foundational data security pattern in OCFCrews. Almost all data is scoped to a specific crew, ensuring that members of one crew cannot see or modify data belonging to another crew.

## Core Principle

Every crew-scoped collection has a `crew` relationship field that links each document to a `crews` document. Access control functions return a `Where` clause that filters results to only the authenticated user's crew:

```typescript
{ crew: { equals: userCrewId } }
```

This pattern is enforced at two layers:

1. **Access control layer** -- Payload's `read`, `update`, and `delete` access functions return `Where` clauses that filter query results to the user's crew.
2. **Hook layer** -- `beforeValidate` and `beforeChange` hooks automatically stamp the `crew` field from the authenticated user's profile, preventing users from assigning data to a different crew.

## The Utility Functions

Two utility functions in `/src/access/utilities.ts` power the entire access control system:

### `checkRole()`

Checks whether a user has any of the specified roles:

```typescript
export const checkRole = (allRoles: string[] = [], user?: User | null): boolean => {
  if (user && allRoles) {
    return allRoles.some((role) => {
      return user?.roles?.some((individualRole) => {
        return individualRole === role
      })
    })
  }
  return false
}
```

### `getUserCrewId()`

Extracts the crew ID from a user object, handling both populated (object) and unpopulated (string) crew references:

```typescript
export const getUserCrewId = (user: User | null | undefined): string | undefined => {
  if (!user?.crew) return undefined
  const crew = user.crew
  return typeof crew === 'object' && crew !== null
    ? (crew as { id: string }).id
    : (crew as string)
}
```

## Crew Stamping in Hooks

Every crew-scoped collection follows a two-hook pattern to ensure the crew field is always correctly set:

### beforeValidate Hook

Stamps the crew from the user's profile **before** Payload runs field validation. This prevents "Crew is required" errors when users submit forms without explicitly setting the crew field:

```typescript
beforeValidate: [
  ({ data, req }) => {
    if (!data || !req.user) return data
    const crewId = getUserCrewId(req.user)
    if (crewId && !data.crew) data.crew = crewId
    return data
  },
],
```

### beforeChange Hook

Force-stamps the crew from the authenticated user for non-admins, and blocks attempts to assign data to a different crew:

```typescript
beforeChange: [
  ({ data, req }) => {
    if (!req.user || checkRole(['admin'], req.user)) return data
    const crewId = getUserCrewId(req.user)
    if (!crewId) return data
    if (data.crew && String(data.crew) !== String(crewId)) {
      throw new Error('You cannot create schedules for other crews.')
    }
    data.crew = crewId
    return data
  },
],
```

## Admin Bypass

Users with the `admin` role bypass crew isolation entirely. When an admin makes a request:

- **Access control** returns `true` instead of a `Where` clause, granting access to all documents across all crews.
- **beforeChange hooks** check for `checkRole(['admin'], req.user)` and return early, allowing admins to assign data to any crew.

Users with the `editor` role also receive broader access in many collections (seeing all data across crews for read operations), but their write operations may still be scoped.

## Collections That Enforce Crew Isolation

| Collection | Crew Field | Isolation Level |
|------------|-----------|-----------------|
| `schedules` | `crew` (required) | Full -- read, update filtered by crew |
| `schedule-positions` | `crew` (required) | Full -- CRUD filtered by crew |
| `time-entries` | `crew` (required) | Read filtered by crew for coordinators; by user for members |
| `inventory-items` | `crew` (required) | Full -- requires inventory roles + crew match |
| `inventory-categories` | `crew` (required) | Full -- requires inventory roles + crew match |
| `inventory-subcategories` | `crew` (required) | Full -- requires inventory roles + crew match |
| `inventory-transactions` | `crew` (required) | Full -- requires inventory roles + crew match |
| `inventory-media` | `crew` (optional) | Full -- requires inventory roles + crew match |
| `recipes` | `crew` (required) | Full -- any crew member can read; inventory roles for write |
| `recipe-subgroups` | `crew` (required) | Full -- same as recipes |
| `recipe-tags` | `crew` (required) | Full -- same as recipes |
| `recipe-favorites` | `crew` (required) | User-scoped within crew |
| `posts` | `crew` (optional) | Visibility-based -- crew posts filtered by crew |
| `emails` | `specificCrew` | Coordinators see only their crew's emails |
| `products` | `crew` (optional) | Coordinator-scoped for writes |
| `chat-channels` | `crew` (optional) | Crew-scoped + global (null crew) channels visible to all authenticated users |
| `chat-messages` | `crew` (optional) | Auto-stamped from channel's crew; filtered by channel access |
| `chat-media` | `crew` (optional) | Crew-scoped file uploads |
| `crew-memberships` | `crew` (required) | User sees own memberships; admin sees all |

## Collections Without Crew Isolation

| Collection | Reason |
|------------|--------|
| `users` | Special access rules -- admins see all; coordinators see their crew + unassigned users; members see only themselves |
| `crews` | Publicly readable (all users can see crew names); write access is admin/editor/coordinator-restricted |
| `pages` | Public content -- published pages are visible to everyone |
| `categories` | Publicly readable content categories |
| `media` | Publicly readable media assets |
| `avatars` | Publicly readable profile photos |
| `email-templates` | Admin/editor-only -- no crew scoping needed |
| `orders` | Customer-scoped (by `customer` field, not crew) |
| `carts` | Customer-scoped |
| `addresses` | Customer-scoped |
| `transactions` | Customer-scoped (Stripe payment transactions) |
| `chat-read-state` | User-scoped (each user manages their own read state) |
