---
sidebar_position: 22
title: "Guide Read Receipts"
---

# Guide Read Receipts

The `guide-read-receipts` collection tracks when each crew member reads a guide.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `guide` | Relationship (crew-guides) | The guide that was read |
| `user` | Relationship (users) | The member who read the guide |
| `crew` | Relationship (crews) | The crew (for crew isolation) |
| `lastReadAt` | Date | Timestamp of when the guide was last read |

## Behavior

- Automatically recorded when a member views a published guide
- Fire-and-forget POST with `useRef` to prevent duplicate submissions during the same session
- Updated (not duplicated) if the same user reads the same guide again — `lastReadAt` is refreshed

## Access Control

- **Coordinators** can see all read receipts for their crew — showing who has and hasn't read each guide
- **Regular members** (including elders and leaders) only see their own read status
- Admins can see all read receipts

## Related

- [Crew Guides Overview](../features/guides/overview)
- [Crew Guides Collection](./crew-guides)
- [Guide Assignments Collection](./guide-assignments)
