---
sidebar_position: 13
title: "Meal Logs"
---

# Meal Logs Collection

**Slug**: `meal-logs`

Historical records of meals served. Each log links to a schedule shift and records the meal name, number of people fed, and other metadata for tracking and reporting.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `schedule` | Relationship → schedules | The shift this meal log is for (required, indexed) |
| `crew` | Relationship → crews | Owning crew (required, auto-set, indexed) |
| `date` | Date | Date the meal was served, day-only picker (required, indexed) |
| `peopleFed` | Number | Number of people fed (required, 0–10,000) |
| `meal` | Text | Meal name (required, max 200 chars) |
| `shiftType` | Select | `morning` / `afternoon` / `night` (required) |
| `period` | Relationship → event-periods | Optional event period for grouping |
| `weekNumber` | Number | Optional week number for reporting |
| `notes` | Textarea | Optional notes (max 2000 chars) |
| `loggedBy` | Relationship → users | Who created the log (auto-set for non-admins) |

## Access Control

| Operation | Who |
|-----------|-----|
| Create | Admin, editor, coordinator, leader |
| Read | Admin/editor (all), crew members (own crew) |
| Update | Admin/editor (all), coordinator/leader (own crew) |
| Delete | Admin only |

## Hooks

- **beforeValidate**: Auto-sets `crew` from user and `loggedBy` from current user (non-admins)

## Related

- [Schedules Collection](./schedules) — Linked shifts
- [Event Periods Collection](./event-periods) — Named time periods for grouping
