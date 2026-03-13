---
sidebar_position: 11
title: "Crew Events"
---

# Crew Events Collection

**Slug**: `crew-events`

Crew activities and events — parties, meetings, trainings, deadlines, and other activities that appear on the schedule calendar alongside regular shifts.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | Text | Event name (required, max 200 chars) |
| `date` | Date | Event date, day-only picker (required, indexed) |
| `endDate` | Date | For multi-day events; leave blank for single-day |
| `startTime` | Text | Start time in "9:00 AM" format (max 10 chars) |
| `endTime` | Text | End time in "9:00 AM" format (max 10 chars) |
| `description` | Textarea | Event details (max 5000 chars) |
| `location` | Text | Where the event takes place (max 300 chars) |
| `eventType` | Select | `party` / `meeting` / `deadline` / `training` / `other` (required) |
| `crew` | Relationship → crews | Owning crew (required, auto-set) |
| `allCrews` | Checkbox | When checked, visible to all crews |
| `createdBy` | Relationship → users | Who created the event (auto-set, read-only) |
| `rsvpEnabled` | Checkbox | Whether RSVP is enabled for this event |
| `rsvpDeadline` | Date | RSVP cutoff date (shown when RSVP enabled) |
| `rsvpMaxAttendees` | Number | Maximum capacity, 1–1000 (shown when RSVP enabled) |
| `recurrence` | Group | Recurring event settings (frequency, end date, count) |
| `parentEvent` | Relationship → crew-events | Parent event for recurring instances (read-only) |
| `attachments` | Relationship → media | File attachments (max 10) |
| `reminders` | Array | Reminder settings (max 3): time, unit (hours/days), type (push/email/both) |

## Access Control

| Operation | Who |
|-----------|-----|
| Create | Admin, site manager, coordinator |
| Read | Admin/site manager (all), crew members (own crew + allCrews events) |
| Update | Admin/site manager (all), coordinator (own crew) |
| Delete | Admin/site manager (all), coordinator (own crew) |

## Hooks

- **beforeValidate**: Auto-sets `crew` from user and `createdBy` from current user
- **beforeChange**: Enforces crew isolation — non-admins cannot manage events for other crews

## Related

- [Event RSVPs Collection](./event-rsvps) — RSVP responses for events
- [Scheduling Overview](../features/scheduling/overview)
