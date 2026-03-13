---
sidebar_position: 3
title: "Schedules"
---

# Schedules

## Overview

The **Schedules** collection stores shift entries for crew meal service. Each schedule record represents a single shift (morning, afternoon, or night) on a specific date, with a meal description, optional notes, shift leads, and an array of positions with assigned members. This is the core of the crew scheduling workflow where coordinators publish shifts and members self-sign-up.

**Source:** `src/collections/Schedules/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `schedules` |
| **Admin Group** | Crews |
| **Use as Title** | `meal` |
| **Default Columns** | crew, date, shiftType, meal |

## Fields

### Top-Level Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `crew` | relationship | Yes | Relation to `crews`, indexed | Which crew this schedule entry belongs to. |
| `date` | date | Yes | Indexed, day-only picker (MM/dd/yyyy) | The date of this shift. |
| `shiftType` | select | Yes | Options: `morning`, `afternoon`, `night` | Time of day for this shift. |
| `leads` | relationship (hasMany) | No | Relation to `users` | Users designated as leads for this shift. |
| `meal` | text | Yes | maxLength: 200 | What meal is being served during this shift. |
| `estimatedStartTime` | text | No | maxLength: 10 | Approximate start time for the shift (e.g., "7:00 AM"). |
| `estimatedEndTime` | text | No | maxLength: 10 | Approximate end time for the shift (e.g., "11:00 AM"). |
| `note` | textarea | No | maxLength: 2000 | Optional note or instructions for this shift. |
| `peopleFed` | number | No | min: 0, max: 10000, sidebar | Number of people fed during this shift. |
| `locked` | checkbox | No | Default: `false`, sidebar | When locked, members cannot join, leave, or be removed from this shift. |

### `positions` Array

| Sub-Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `position` | relationship | Yes | Relation to `schedule-positions` | The position type (e.g., "Serving", "Drinks"). Filtered to positions belonging to the same crew. |
| `assignedMembers` | relationship (hasMany) | No | Relation to `users` | Members who have signed up for this position. |
| `attendedMembers` | relationship (hasMany) | No | Relation to `users` | Members marked as having attended this position. Set by coordinators/leaders after the shift. |

## Access Control

| Operation | admin | editor | crew_coordinator | crew_leader | crew_member / other |
|---|---|---|---|---|---|
| **Create** | Yes | Yes | Yes | Yes | No |
| **Read** | All | All | Own crew only | Own crew only | Own crew only |
| **Update** | All | All | Own crew only | Own crew only | No |
| **Delete** | Yes | Yes | No | No | No |

All crew-scoped access uses a `Where` clause filtering by `{ crew: { equals: crewId } }`.

## Hooks

### `beforeValidate`

1. **Auto-stamp crew**: If the requesting user has a crew and no crew is set on the data, the user's crew ID is automatically assigned.

### `beforeChange`

1. **Enforce crew isolation**: Non-admin users cannot create or update schedules for crews other than their own. If `data.crew` differs from the user's crew, an error is thrown: `"You cannot create schedules for other crews."` The crew is always force-stamped to the user's crew for non-admins.

### `afterDelete`

1. **Audit logging**: Logs a `schedule_deleted` audit event via `auditLog()`, recording the user ID, crew ID, document ID, and schedule details (date, meal, shiftType).

## Relationships

| Related Collection | Field | Direction | Description |
|---|---|---|---|
| `crews` | `crew` | Schedules --> Crews | Owning crew |
| `users` | `leads` | Schedules --> Users | Shift lead assignments (hasMany) |
| `schedule-positions` | `positions[].position` | Schedules --> Schedule Positions | Position type definitions |
| `users` | `positions[].assignedMembers` | Schedules --> Users | Member sign-ups per position (hasMany) |

## Indexes

| Field | Type |
|---|---|
| `crew` | Standard |
| `date` | Standard |
