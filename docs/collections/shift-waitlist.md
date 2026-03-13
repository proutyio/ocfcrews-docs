---
sidebar_position: 8
title: "Shift Waitlist"
---

# Shift Waitlist

The `shift-waitlist` collection stores waitlist entries for fully-staffed shift positions. When all slots for a position are filled, members can join a waitlist for that specific position.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `schedule` | Relationship (schedules) | The shift this waitlist entry is for |
| `positionIndex` | Number | The index of the position slot within the shift's positions array |
| `user` | Relationship (users) | The member on the waitlist |
| `crew` | Relationship (crews) | The crew (for crew isolation) |
| `joinedAt` | Date | Timestamp when the member joined the waitlist |

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/schedule/waitlist?shiftId=X&positionIndex=Y` | GET | Get waitlist count and whether the current user is on it |
| `/api/schedule/waitlist` | POST | Join the waitlist for a position (`{ shiftId, positionIndex }`) |
| `/api/schedule/waitlist` | DELETE | Leave the waitlist for a position (`{ shiftId, positionIndex }`) |

All endpoints require authentication. POST and DELETE require CSRF headers. All are rate-limited (GET: 30/min, POST: 20/min, DELETE: 20/min).

## Access Control

- Any confirmed crew member can join a waitlist for a position in their crew's schedule
- Users can only leave their own waitlist entries
- Crew isolation is enforced — the schedule must belong to the user's crew
- Duplicate entries are prevented (409 Conflict)

## Validation

- `positionIndex` must be a non-negative integer within the bounds of the shift's positions array
- The position must be full (member is not already assigned)
- The user must not already be on the waitlist for that position

## Related

- [Scheduling Overview](../features/scheduling/overview)
- [Schedules Collection](./schedules)
