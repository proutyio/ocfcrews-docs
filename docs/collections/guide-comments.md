---
sidebar_position: 20
title: "Guide Comments"
---

# Guide Comments

The `guide-comments` collection stores per-guide discussion threads for crew guides.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `guide` | Relationship (crew-guides) | The guide this comment belongs to |
| `user` | Relationship (users) | The comment author |
| `crew` | Relationship (crews) | The crew (for crew isolation) |
| `content` | Textarea | Comment text (max 2000 characters) |
| `createdAt` | Date | Auto-set creation timestamp |

## Behavior

- Comments are **immutable** — they can be created and deleted but not edited
- Any confirmed crew member can post comments on published guides in their crew
- Authors can delete their own comments
- Coordinators and admins can delete any comment in their crew
- Comments are crew-scoped

## Related

- [Crew Guides Overview](../features/guides/overview)
- [Crew Guides Collection](./crew-guides)
