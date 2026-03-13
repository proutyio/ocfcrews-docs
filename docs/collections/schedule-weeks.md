---
sidebar_position: 14
title: "Schedule Weeks"
---

# Schedule Weeks Collection

**Slug**: `schedule-weeks`

Weekly schedule containers that control draft/published status. Coordinators use these to prepare a week's shifts before making them visible to crew members.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `crew` | Relationship → crews | Owning crew (required, indexed) |
| `weekStart` | Date | Start of the week, day-only picker (required, indexed). Automatically normalized to the crew's configured week start day. |
| `status` | Select | `draft` / `published` (required, default: `draft`) |
| `publishedAt` | Date | When the week was published (auto-set, read-only) |
| `publishedBy` | Relationship → users | Who published the week (auto-set, read-only) |

## Status Workflow

```
draft → published   (coordinator/leader sets publishedAt + publishedBy)
published → draft   (coordinator/leader clears publishedAt + publishedBy)
```

When a week is in `draft` status, non-privileged crew members cannot see any shifts within that week on the schedule calendar.

## Access Control

| Operation | Who |
|-----------|-----|
| Create | Admin, editor, coordinator, leader |
| Read | Admin/editor (all), crew members (own crew) |
| Update | Admin/editor (all), coordinator/leader (own crew) |
| Delete | Admin, editor |

## Hooks

- **beforeValidate**: Auto-sets `crew`, normalizes `weekStart` to crew's configured start day (monday/saturday/sunday), sets `publishedAt`/`publishedBy` on status change
- **beforeChange**: Enforces crew isolation — non-admins cannot manage schedule weeks for other crews

## Related

- [Schedules Collection](./schedules) — Individual shifts within the week
- [Scheduling Overview](../features/scheduling/overview)
