---
sidebar_position: 18
title: "Schedule Templates"
---

# Schedule Templates Collection

**Slug**: `schedule-templates`

Reusable shift definitions for quickly populating a week's schedule. See [Schedule Templates Feature](../features/scheduling/schedule-templates).

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | Text (required, max 100) | Template name (e.g. "Standard Week") |
| `crew` | Relationship → crews (indexed) | Owning crew (auto-set via hook if not provided) |
| `autoSchedule` | Checkbox | Automatically create shifts from this template on a weekly schedule (default: false) |
| `autoScheduleDay` | Select | Day of week to run auto-scheduling: `0`–`6` (Sunday–Saturday). Shown only when `autoSchedule` is true |
| `autoScheduleWeeksAhead` | Number (1–4) | How many weeks ahead to create shifts. Shown only when `autoSchedule` is true |
| `shifts` | Array (max 50) | Shift definitions — see sub-fields below |
| `createdAt` | Date | Auto-set |

### `shifts` Array Sub-fields

| Field | Type | Description |
|-------|------|-------------|
| `dayOffset` | Number (required, 0–6) | Day of the week: 0=Monday, 1=Tuesday, ..., 6=Sunday |
| `shiftType` | Select (required) | Shift type (uses `SHIFT_TYPE_OPTIONS` constant) |
| `meal` | Text (required, max 200) | Meal or shift name (e.g. "Breakfast") |
| `estimatedStartTime` | Text (max 10) | Optional start time string (e.g. `"8:00 AM"`) |
| `estimatedEndTime` | Text (max 10) | Optional end time string |
| `note` | Textarea (max 2000) | Optional shift note |
| `positions` | Relationship → schedule-positions (hasMany) | Position slots for this shift |

## Access Control

| Operation | Who |
|-----------|-----|
| Create | Coordinator, admin, editor |
| Read | Any crew member (scoped to own crew); admin/editor see all |
| Update | Coordinator (own crew), admin, editor |
| Delete | Coordinator (own crew), admin, editor |

## Crew Scoping

Templates are strictly crew-scoped. A coordinator can only view and apply templates belonging to their own crew.
