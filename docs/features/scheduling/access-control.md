---
sidebar_position: 8
title: "Schedule Access Control"
---

# Schedule Access Control

The scheduling system enforces role-based access control at both the collection level (Payload CMS access functions) and the API route level. All access control uses **crew isolation** -- users can only interact with schedules belonging to their own crew (with the exception of admins and site managers who have global access).

## Role Hierarchy

The following roles are relevant to the scheduling system, listed from most to least privileged:

| Role | Scope | Description |
|------|-------|-------------|
| `admin` | Global | Full access to all schedules, positions, and time entries across all crews |
| `site_manager` | Global | Full read/write access to all scheduling data |
| `crew_coordinator` | Crew-scoped | Can manage schedules, positions, and time entries for their own crew |
| `crew_leader` | Crew-scoped | Can create/update shifts and manage sign-ups for their own crew |
| `crew_member` | Self-scoped | Can sign up for positions and log their own hours |
| `other` | Self-scoped | Minimal access, can view and log own hours |

## Schedules Collection Access

**Source**: `src/collections/Schedules/index.ts`

### Create

```
admin, site_manager, crew_coordinator, crew_leader
```

Non-admin users are restricted to creating schedules for their own crew via `beforeChange` hooks. The hook auto-populates the `crew` field from the user's crew and throws an error if a non-admin attempts to set a different crew.

### Read

| Role | Access |
|------|--------|
| admin, site_manager | All schedules |
| Any user with a crew | Schedules where `crew` equals their crew ID |
| No crew | No access |

This is implemented as a `Where` constraint: `{ crew: { equals: crewId } }`.

### Update

| Role | Access |
|------|--------|
| admin, site_manager | All schedules |
| crew_coordinator, crew_leader | Schedules where `crew` equals their crew ID |
| Others | No update access |

### Delete

```
admin, site_manager only
```

Coordinators and leaders cannot delete schedules. This prevents accidental loss of historical scheduling data.

## SchedulePositions Collection Access

**Source**: `src/collections/SchedulePositions/index.ts`

### Create

```
admin, site_manager, crew_coordinator
```

Note that `crew_leader` is **not** included -- only coordinators can define new position types.

### Read

| Role | Access |
|------|--------|
| admin, site_manager | All positions |
| Any user with a crew | Positions where `crew` equals their crew ID |

### Update

| Role | Access |
|------|--------|
| admin, site_manager | All positions |
| crew_coordinator | Positions where `crew` equals their crew ID |

### Delete

| Role | Access |
|------|--------|
| admin, site_manager | All positions |
| crew_coordinator | Positions where `crew` equals their crew ID |

## TimeEntries Collection Access

**Source**: `src/collections/TimeEntries/index.ts`

### Create

| Role | Access |
|------|--------|
| admin, site_manager | All time entries (`return true`) |
| crew_coordinator | Time entries within their own crew (`{ crew: { equals: crewId } }`) |
| Others | Only their own time entries (`{ user: { equals: user.id } }`) |

All creates are further subject to `beforeChange` hook validations (crew stamping, edit window, shift assignment check).

### Read

| Role | Access |
|------|--------|
| admin, site_manager | All time entries |
| crew_coordinator | Time entries where `crew` equals their crew ID |
| Others | Only their own time entries (`user` equals their ID) |

### Update

| Role | Access |
|------|--------|
| admin, site_manager | All time entries |
| Others | Only their own time entries |

### Delete

```
admin only
```

No other role can delete time entries, ensuring audit integrity.

## TimeEntries Hook-Level Guards

Beyond collection access control, the TimeEntries collection has `beforeChange` hooks that enforce additional business rules:

1. **Crew stamping**: The `crew` field is always set from the authenticated user's crew
2. **Cross-crew prevention**: Non-admins cannot create entries for other crews
3. **30-day edit window**: Non-admin/site_manager users cannot create or modify entries older than 30 days
4. **Shift assignment check**: On create, non-privileged users must be assigned to the linked shift (leads or position members)

## Sign-Up API Route Access

**Source**: `src/app/(app)/api/schedule/sign-up/route.ts`

The sign-up route enforces its own access control:

| Check | Description |
|-------|-------------|
| Authentication | User must be logged in (401 if not) |
| Crew membership | User's crew must match the schedule's crew (403 if not) |
| Past-shift guard | Cannot modify past shifts (400 if shift date is before today) |
| Remove authorization | `remove` action requires admin, site_manager, crew_coordinator, crew_leader, or shift lead status (403 if not) |
| Capacity | Regular members cannot join a position that already has 1 member (409). Privileged users can double-staff. |

## Log-Hours API Route Access

**Source**: `src/app/(app)/api/schedule/log-hours/route.ts`

| Check | Description |
|-------|-------------|
| Authentication | User must be logged in |
| Crew membership | User must belong to a crew |
| Crew match | For shift-specific entries, user's crew must match the schedule's crew |
| Shift assignment | For shift-specific entries, user must be a lead or assigned to a position |
| Future date guard | Cannot log hours for future dates |

## Crew Isolation Pattern

The consistent pattern across all scheduling collections is **crew isolation via `Where` constraints**:

```typescript
read: ({ req: { user } }) => {
  if (!user) return false
  if (checkRole(ADMIN_ROLES, user)) return true  // ['admin', 'site_manager']
  const crewId = getUserCrewId(user)
  if (crewId) {
    return { crew: { equals: crewId } } as Where
  }
  return false
}
```

This pattern returns a query constraint rather than a boolean, which Payload CMS applies to all database queries. This means:

- Users never see data from other crews in list views
- API queries automatically filter to the user's crew
- No application code needs to manually filter results

The `getUserCrewId` utility handles the polymorphic crew field (which can be either a string ID or a populated object):

```typescript
export const getUserCrewId = (user: User | null | undefined): string | undefined => {
  if (!user?.crew) return undefined
  const crew = user.crew
  return typeof crew === 'object' && crew !== null ? crew.id : crew
}
```
