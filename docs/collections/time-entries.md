---
sidebar_position: 5
title: "Time Entries"
---

# Time Entries

## Overview

The **Time Entries** collection records hours worked by crew members. Each entry tracks a user, date, hours worked, and optionally links to a specific schedule (shift). Time entries automatically recalculate the parent user's `hoursPerYear` aggregation on create, update, and delete. Entries can be either shift-linked (validated against assigned positions) or manual/extra hours.

**Source:** `src/collections/TimeEntries/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `time-entries` |
| **Admin Group** | Crews |
| **Use as Title** | `date` |
| **Default Columns** | user, schedule, date, hours |

## Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `user` | relationship | Yes | Relation to `users`, indexed | The user who worked this time. |
| `schedule` | relationship | No | Relation to `schedules`, indexed | Optional link to a specific shift. Leave blank for extra/manual hours. |
| `crew` | relationship | Yes | Relation to `crews`, indexed | The crew this time entry belongs to. |
| `date` | text | Yes | Indexed, regex: `/^\d{4}-\d{2}-\d{2}$/` | YYYY-MM-DD date this work was performed. Stored as text for consistent formatting. |
| `hours` | number | Yes | min: 0, max: 24, step: 0.5 | Hours worked. Supports half-hour increments. |

## Access Control

| Operation | admin | editor | crew_coordinator | crew_leader / crew_member | Unauthenticated |
|---|---|---|---|---|---|
| **Create** | Yes | Yes | Yes | Yes (any authenticated user) | No |
| **Read** | All | All | Own crew only | Own entries only | No |
| **Update** | All | All | Own entries only | Own entries only | No |
| **Delete** | Yes | No | No | No | No |

- Coordinators can read all entries within their crew but can only update their own entries.
- Regular members can only read and update their own entries.

## Hooks

### `beforeValidate`

1. **Auto-stamp crew**: If the requesting user has a crew and no crew is set on the data, the user's crew ID is automatically assigned.

### `beforeChange`

1. **Enforce crew isolation**: Non-admin users cannot create entries for other crews. The crew is always force-stamped from the authenticated user. Throws `"Forbidden: cannot create entries for other crews"` if a mismatch is detected.

2. **30-day entry window**: Non-admin/editor users cannot create or edit time entries with a date more than 30 days in the past. Throws `"Cannot create or edit time entries more than 30 days old."` if the date exceeds the cutoff.

3. **Shift assignment verification** (create only): For non-admin/editor/coordinator users, when linking to a schedule, the hook verifies the requesting user is actually assigned to that shift (either as a lead or in a position's `assignedMembers`). Throws `"You are not assigned to this shift."` if not found.

### `afterChange`

1. **Recalculate user hours**: After any create or update, triggers `recalcUserHours()` which:
   - Fetches all time entries for the affected user
   - Groups entries by year
   - Calculates total hours and distinct days worked per year
   - Updates the user's `hoursPerYear` array

### `afterDelete`

1. **Recalculate user hours**: Same as `afterChange` -- recalculates the user's `hoursPerYear` after an entry is deleted.

## Helper Function: `recalcUserHours`

This utility function (defined in the same file) recalculates a user's annual hours summary:

1. Fetches all `time-entries` for the given user ID
2. Groups entries by the 4-digit year from the `date` field
3. Sums `hours` and counts distinct days (by `YYYY-MM-DD` date string)
4. Writes the result to `user.hoursPerYear` as a sorted (descending) array of `{ year, hours, daysWorked }`

## Relationships

| Related Collection | Field | Direction | Description |
|---|---|---|---|
| `users` | `user` | Time Entries --> Users | The worker |
| `schedules` | `schedule` | Time Entries --> Schedules | Optional linked shift |
| `crews` | `crew` | Time Entries --> Crews | Owning crew |

## Indexes

| Field | Type |
|---|---|
| `user` | Standard |
| `schedule` | Standard |
| `crew` | Standard |
| `date` | Standard |
