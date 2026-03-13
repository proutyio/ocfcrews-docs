---
sidebar_position: 12
title: "Event RSVPs"
---

# Event RSVPs Collection

**Slug**: `event-rsvps`

RSVP responses for crew events. Each record links a user and event with a status indicating their attendance intention.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `event` | Relationship → crew-events | The event being responded to (required, indexed) |
| `user` | Relationship → users | The member RSVPing (required, auto-set, indexed) |
| `status` | Select | `going` / `maybe` / `not_going` (required, default: `going`) |
| `crew` | Relationship → crews | Owning crew (required, auto-set, indexed) |

## Access Control

| Operation | Who |
|-----------|-----|
| Create | Any authenticated user |
| Read | Admin/editor (all), crew members (own crew) |
| Update | Admin (all), own RSVPs only |
| Delete | Admin (all), own RSVPs only |

## Hooks

- **beforeValidate**: Auto-sets `user` from current user and `crew` from user's active crew

## Related

- [Crew Events Collection](./crew-events) — The events that RSVPs respond to
