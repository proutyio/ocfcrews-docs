---
sidebar_position: 3
title: "Shift Management"
---

# Shift Management

Shifts (stored in the `schedules` collection) are the fundamental scheduling unit. Each shift represents a single event on a specific date, typically a meal service, belonging to a crew.

## Creating Shifts

Shifts are created through the Payload CMS admin panel at `/admin/collections/schedules/create`. The schedule calendar also provides a direct link for coordinators and leaders to create shifts.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `crew` | relationship | Which crew this shift belongs to. Auto-populated from the creating user's crew. |
| `date` | date | The date of the shift. Uses a day-only date picker (format: `MM/dd/yyyy`). |
| `shiftType` | select | The time of day for the shift. |
| `meal` | text | Name of the meal or event being served (max 200 characters). |

### Shift Types

Shift types are defined in `/src/constants/schedules.ts` and control the visual badge color and sort order on the calendar:

| Value | Label | Sort Order | Calendar Badge Color |
|-------|-------|------------|---------------------|
| `morning` | Morning | 0 | Emerald/green |
| `afternoon` | Afternoon | 1 | Blue |
| `night` | Night | 2 | Purple |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `leads` | relationship (users, hasMany) | Users designated as leads for this shift. Leads gain the ability to remove members from positions. |
| `estimatedStartTime` | text | Optional approximate start time for the shift (e.g., "8:00 AM"). |
| `estimatedEndTime` | text | Optional approximate end time for the shift (e.g., "11:00 AM"). |
| `note` | textarea | Optional instructions or notes for volunteers (max 2000 characters). |
| `locked` | checkbox | When true, the shift is locked — members cannot join or leave positions. Coordinators can toggle this via `POST /api/schedule/lock`. |
| `positions` | array | Array of position slots to be filled. See below. |

### Positions Array

Each element in the `positions` array defines a slot that can be filled by a member:

| Sub-field | Type | Description |
|-----------|------|-------------|
| `position` | relationship (schedule-positions) | References a position type defined for this crew. The admin panel filters position options to only show positions belonging to the same crew. |
| `assignedMembers` | relationship (users, hasMany) | Members who have signed up for or been assigned to this slot. |

A shift can have multiple slots of the same position type. For example, a dinner shift might have three "Serving" slots, two "Drinks" slots, and one "Cleanup" slot.

## Who Can Create Shifts

The following roles can create new schedules:

- **admin**: Can create shifts for any crew
- **editor**: Can create shifts for any crew
- **crew_coordinator**: Can create shifts for their own crew only
- **crew_leader**: Can create shifts for their own crew only

### Crew Enforcement

Two hooks ensure crew integrity:

1. **`beforeValidate`**: If the creating user has a crew and no crew is set on the data, the user's crew is auto-populated.
2. **`beforeChange`**: For non-admin users, the hook verifies the `crew` field matches the user's crew. If a non-admin attempts to create a schedule for a different crew, an error is thrown: *"You cannot create schedules for other crews."*

Admins are exempt from this restriction and can create schedules for any crew.

## Editing Shifts

Shifts can be updated by:

- **admin** and **editor**: Any shift
- **crew_coordinator** and **crew_leader**: Only shifts belonging to their own crew (enforced via a `Where` constraint: `{ crew: { equals: crewId } }`)

The calendar's ShiftCard component includes an "Edit" link that opens the shift in the admin panel for coordinators and leaders.

## Deleting Shifts

Only **admin** and **editor** roles can delete shifts. This prevents accidental deletion by coordinators or leaders.

## Schedule Builder

In addition to the admin panel, coordinators and leaders can create and manage shifts from the **Schedule Builder** at `/crew/scheduling/builder`. The builder provides:

- **Visual week view** with day selection and mini shift cards
- **Create shifts** by selecting positions, leads, and estimated times
- **Apply templates** to populate a week quickly
- **Copy week** — duplicate an entire week of shifts to a target week (`POST /api/schedule/copy-week`)
- **Lock/unlock shifts** — prevent sign-up changes (`POST /api/schedule/lock`)
- **Bulk create** shifts with conflict detection (warns on duplicate date + shift type combos)
- **Attendance mode** — mark who showed up on past/today shifts (`POST /api/schedule/attendance`)
- **Suggest dropdown** — ranks available members by availability, shift preference, position preference, and workload balance
- **Waitlist counts** shown on full positions

## Admin Panel Configuration

In the Payload admin panel, schedules are grouped under the "Crews" section with the following defaults:

- **Default columns**: crew, date, shiftType, meal
- **Title field**: `meal` (used as the document title in the admin panel)
