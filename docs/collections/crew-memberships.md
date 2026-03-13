---
sidebar_position: 5
title: "Crew Memberships"
---

# Crew Memberships

## Overview

The **Crew Memberships** collection is the source of truth for multi-crew support. Each record links a user to a crew with a crew role, active status, and pass eligibility fields. A user can have multiple memberships but only one can be active at a time.

**Source:** `src/collections/CrewMemberships/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `crew-memberships` |
| **Admin Group** | Crews |
| **Default Columns** | memberName, memberEmail, crew, crewRole, isActive |

## Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `memberName` | text (virtual) | No | Read-only | Populated from user relationship in `afterRead` hook. Shows user's name or email. |
| `memberEmail` | text (virtual) | No | Read-only | Populated from user relationship in `afterRead` hook. Shows user's email. |
| `user` | relationship | Yes | Relation to `users`, indexed | The user. Admin-only update. |
| `crew` | relationship | Yes | Relation to `crews`, indexed | The crew. Admin-only update. |
| `crewRole` | select | Yes | Default: `other` | Role within this crew: `coordinator`, `elder`, `leader`, `member`, `other`. |
| `isActive` | checkbox | No | Default: false | Whether this is the user's currently active crew. |
| `crewPassEligibility` | select | No | Default: `not_eligible` | Pass eligibility for this membership: `not_eligible`, `crew`, `so`, `so_paid`. |
| `crewPaymentStatus` | select | No | Default: `unpaid` | Crew pass payment status: `unpaid`, `paid`. |
| `parkingPaymentStatus` | select | No | Default: `unpaid` | Parking pass payment status: `unpaid`, `paid`. |
| `tShirtSize` | select | No | -- | T-shirt size for this crew membership. |
| `passStatus` | array | No | maxRows: 10 | Per-year pass receipt tracking (see below). |

### `passStatus` Array

Tracks pass and tag receipt status grouped by year. Auto-initialized with the current year on creation.

| Sub-Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `year` | text | Yes | maxLength: 4, regex: `/^\d{4}$/` | Four-digit year (e.g., 2025). |
| `crewPassReceived` | checkbox | No | Default: `false` | Whether the crew pass has been received. |
| `parkingPassReceived` | checkbox | No | Default: `false` | Whether the parking pass has been received. |
| `campingTagReceived` | checkbox | No | Default: `false` | Whether the camping tag has been received. |

## Constraints

Enforced via `beforeChange` hooks:

1. **Unique user+crew**: Only one membership per user+crew pair (compound unique index)
2. **Max 1 coordinator crew**: A user can only be coordinator for one crew at a time
3. **Pass eligibility exclusivity**: Only one membership across all crews can hold non-`not_eligible` pass eligibility

## Access Control

| Operation | admin | coordinator | crew member |
|---|---|---|---|
| **Create** | Yes | Own crew | No |
| **Read** | All | Own crew | Own records |
| **Update** | All | Own crew | No |
| **Delete** | Yes | No | No |

### Field-Level Access

| Field | Update |
|---|---|
| `user` | Admin only |
| `crew` | Admin only |
| `crewRole` | Admin or same-crew coordinator |
| `isActive` | Admin or same-crew coordinator |

## Hooks

### beforeValidate

- Auto-sets `crew` to coordinator's crew on create (non-admin coordinators)

### beforeChange

- Forces coordinator's crew on update (non-admin only)
- Enforces unique user+crew constraint (on create)
- Enforces max 1 coordinator crew constraint
- Enforces pass eligibility exclusivity
- Auto-initializes `passStatus` with the current year on creation (all pass checkboxes default to `false`)

### afterRead

- Populates virtual `memberName` and `memberEmail` fields from the related user document. Fetches the user if the relationship is not already populated.

### afterChange

When a membership is activated (`isActive` changes to `true`):

1. Syncs all fields to the user record: `crew`, `crewRole`, `crewPassEligibility`, pass status fields
2. Uses `skipMembershipSync` context guard to prevent infinite loops with the Users `afterChange` hook

When a membership is deactivated or its role changes, the corresponding user record is updated if it's the active membership.

## Bidirectional Sync

The Users collection has a corresponding `afterChange` hook (`syncMembership`) that upserts a membership record when user fields change. Both hooks use context guards to prevent infinite loops:

- `req.context.skipMembershipSync` — set by CrewMemberships hooks when updating users
- `req.context.skipUserSync` — set by Users hooks when updating memberships

## Indexes

| Field(s) | Type | Source |
|---|---|---|
| `user` | Standard | Collection config |
| `crew` | Standard | Collection config |
| `{ user: 1, crew: 1 }` | Compound unique | `ensureCompoundIndexes()` |
| `{ user: 1, isActive: 1 }` | Compound | `ensureCompoundIndexes()` |
| `{ crew: 1, crewRole: 1 }` | Compound | `ensureCompoundIndexes()` |

## Crew Switching

The `/api/crew/switch-crew` endpoint handles crew switching:

1. Deactivate all memberships for the user (`isActive = false`)
2. Activate the target membership (`isActive = true`)
3. Update the user record with the target membership's fields
4. All operations use context guards to prevent hook loops

The Crew Switcher UI component in the header calls this endpoint and handles:
- Concurrent switch prevention via `useRef` guard
- Error differentiation (401 session expired, 429 rate limit, other)
- Optimistic UI with rollback on failure
