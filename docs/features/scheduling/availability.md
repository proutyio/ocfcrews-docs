---
sidebar_position: 10
title: "Member Availability"
---

# Member Availability

The availability feature allows crew members to declare their availability for date ranges. Coordinators use this information when planning the shift schedule.

## Member UI

Members manage their availability at `/account/availability`. The UI shows a calendar-style interface where they can add, edit, and delete date range entries.

Each availability entry has:
- **Start date** and **End date**
- **Status**: `available`, `unavailable`, or `preferred`
- **Preferred shifts**: optional shift type preferences (morning, afternoon, night)
- **Preferred positions**: optional position preferences
- **Late arrival**: flag + optional arrival time if the member will be late
- **Note**: optional free-text note for coordinators
- **Recurrence**: optional recurring pattern (weekly or biweekly) with specific days of the week

| Status | Meaning |
|--------|---------|
| `available` | Member is free and willing to work |
| `unavailable` | Member cannot work (vacation, conflict, etc.) |
| `preferred` | Member is available and actively prefers to be scheduled |

## Recurrence

Availability entries support **recurring patterns**:

- **Weekly**: repeats every week on specified days
- **Biweekly**: repeats every two weeks on specified days
- **Recurrence days**: 0–6 (Sunday–Saturday) via `Date.getDay()`

Recurring entries are expanded server-side in the `crew-availability` API route using `expandRecurringAvailability()`, which generates individual date entries within a configurable horizon (default 12 weeks).

## Coordinator View — Availability Matrix

Coordinators can view all crew members' availability from the **Availability Matrix** at `/crew/scheduling/availability`. This is a color-coded grid showing each member's status for each date.

### Features

| Feature | Description |
|---------|-------------|
| **Range modes** | Week, 2-week, or month views |
| **Date range label** | Shows the visible date range (e.g., "Mar 3 – 16") |
| **Sort options** | Sort by name, most available, least available, or most assigned |
| **Status filter** | Filter by all, available/preferred, preferred only, unavailable, or no data |
| **Coverage bars** | Column headers show how many members are available for each day |
| **Low-coverage highlighting** | Days with < 50% available members are highlighted in amber |
| **Search** | Filter members by name |
| **Rich CSV export** | Includes shift preferences, position preferences, late arrival notes |
| **Sticky header** | Column headers stay visible while scrolling vertically |
| **Auto-expand today** | On mobile, today's column is auto-expanded on load |
| **Smart tooltips** | Position-aware tooltips that flip direction near edges |
| **No-data indicator** | Dash (`–`) in empty cells |
| **Escape key** | Closes any open tooltip |

### Color Coding

| Color | Meaning |
|-------|---------|
| Emerald | Morning shift preference |
| Blue | Afternoon shift preference |
| Purple | Night shift preference |

These colors are consistent with `SHIFT_BADGE` colors used across the platform.

### Tooltip Details

Clicking a cell shows a tooltip with the member's full availability detail for that date:
- Availability status (available/preferred/unavailable)
- Preferred shift types
- Preferred positions
- Late arrival flag and estimated arrival time
- Notes

The Availability Matrix is read-only for coordinators — they cannot modify a member's availability on their behalf.

## Data Model

| Field | Type | Description |
|-------|------|-------------|
| `user` | Relationship | The crew member |
| `crew` | Relationship | Auto-set from the member's crew |
| `startDate` | Date | First day of the range |
| `endDate` | Date | Last day of the range |
| `type` | Enum | `available` / `unavailable` / `preferred` |
| `note` | Text | Optional free-text note |
| `preferredShifts` | Array | Optional shift type preferences (morning, afternoon, night) |
| `preferredPositions` | Relationship (hasMany) | Optional preferred positions |
| `willBeLate` | Boolean | Whether the member will arrive late |
| `lateArrivalTime` | Text | Optional estimated arrival time |
| `recurrenceType` | Enum | `none` / `weekly` / `biweekly` |
| `recurrenceDays` | Array | Days of the week (0–6) for recurring entries |

When overlapping entries exist, priority ordering is: `unavailable` > `preferred` > `available`.

## Access Control

- Members can **create, edit, and delete** their own availability records.
- Coordinators can **read** all availability records for their crew.
- Admins can read and edit any availability record.
- Members cannot see other members' availability — only coordinators and admins have the aggregate view.

## Related

- [Availability Collection](../../collections/availability)
- [Scheduling Overview](./overview)
- [Crew Hub & Shift Management](./shift-management)
