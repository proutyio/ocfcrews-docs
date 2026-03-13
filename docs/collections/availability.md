---
sidebar_position: 11
title: "Availability"
---

# Availability Collection

**Slug**: `availability`

Stores crew member date-range availability declarations. See [Member Availability Feature](../features/scheduling/availability) for coordinator usage.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `user` | Relationship → users (indexed, required) | The crew member (auto-set via hook for non-admins) |
| `crew` | Relationship → crews (indexed, required) | Auto-set from the member's active crew (via hook for non-admins) |
| `startDate` | Date (required) | First day of the availability range (day-only picker) |
| `endDate` | Date (required) | Last day of the range (day-only picker). Must be on or after `startDate` (validated in `beforeChange` hook) |
| `type` | Select (required) | `available` / `unavailable` / `preferred` |
| `shiftAvailability` | Array (max 3) | Per-shift availability details. Hidden when `type` is `unavailable`. Each entry has: `shiftType` (select: morning/afternoon/night) and `status` (select: available/preferred) |
| `preferredShifts` | Select (hasMany) | DEPRECATED — use `shiftAvailability` instead. Hidden in admin UI |
| `preferredPositions` | Relationship → schedule-positions (hasMany, max 20) | Which positions the member prefers. Hidden when `type` is `unavailable` |
| `willBeLate` | Checkbox | Will the member arrive late? Hidden when `type` is `unavailable` (default: false) |
| `lateArrivalTime` | Text (max 10) | Estimated arrival time in `H:MM AM/PM` format. Shown only when `willBeLate` is true |
| `recurrence` | Select | `none` (default, one-time) / `weekly` / `biweekly` — repeat this availability on the same day(s) of the week |
| `recurrenceDays` | Select (hasMany) | Days of the week for recurrence: `0`–`6` (Sunday–Saturday). Shown only when `recurrence` is not `none` |
| `recurrenceEndDate` | Date | Stop repeating after this date (optional, defaults to 12 weeks). Shown only when `recurrence` is not `none` |
| `note` | Textarea (max 500) | Optional free-text context |
| `createdAt` | Date | Auto-set |
| `updatedAt` | Date | Auto-set |

## Hooks

### `beforeValidate`

For non-admin users, auto-stamps `user` from the authenticated session and `crew` from the user's active crew. This prevents members from creating availability entries for other users.

### `beforeChange`

Validates that `endDate` is on or after `startDate`, throwing an `APIError` (400) if not. Also derives the `type` field from `shiftAvailability` when shift entries are present (sets to `preferred` if any shift has `preferred` status, otherwise `available`).

## Access Control

| Operation | Who |
|-----------|-----|
| Create | Any confirmed crew member (must have an active crew) |
| Read | Admin/editor see all; coordinator/leader see all entries in own crew; members see only their own entries |
| Update | Admin only, or the member updating their own entries. Coordinators do NOT have update access |
| Delete | Admin only, or the member deleting their own entries. Coordinators do NOT have delete access |

## Notes

- Overlapping ranges are permitted. Coordinators see all entries and interpret them when scheduling.
- There is no automatic conflict detection or enforcement based on availability — it is purely advisory information for coordinators.
