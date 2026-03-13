---
sidebar_position: 15
title: "Event Periods"
---

# Event Periods Collection

**Slug**: `event-periods`

Named time periods for grouping scheduling data (e.g., "Week 1", "Pre-Event Setup"). Used to organize meal logs and scheduling analytics into meaningful segments.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | Text | Period display name (required, max 100 chars) |
| `startDate` | Date | Period start, day-only picker (required, indexed) |
| `endDate` | Date | Period end, day-only picker (required, indexed). Must be on or after startDate. |
| `crew` | Relationship → crews | Owning crew (required, auto-set, indexed) |
| `year` | Number | Year for grouping (required) |
| `order` | Number | Sort order within the year (default: 0) |
| `description` | Textarea | Optional notes (max 500 chars) |

## Access Control

| Operation | Who |
|-----------|-----|
| Create | Admin, editor, coordinator, leader |
| Read | Admin/editor (all), crew members (own crew) |
| Update | Admin/editor (all), coordinator/leader (own crew) |
| Delete | Admin only |

## Hooks

- **beforeValidate**: Auto-sets `crew` from user; validates that `endDate` is not before `startDate`
- **beforeChange**: Enforces crew isolation — non-admins cannot manage event periods for other crews

## Related

- [Meal Logs Collection](./meal-logs) — Logs reference event periods for grouping
