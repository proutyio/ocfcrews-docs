---
sidebar_position: 23
title: "Guide Assignments"
---

# Guide Assignments

The `guide-assignments` collection stores required reading assignments for crew guides.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `guide` | Relationship (crew-guides) | The guide to assign as required reading |
| `targetRoles` | Select (hasMany) | Roles required to read: `coordinator`, `elder`, `leader`, `member` |
| `dueDate` | Date | Optional due date for completion |
| `crew` | Relationship (crews) | The crew (for crew isolation) |
| `createdBy` | Relationship (users) | The coordinator who created the assignment |

## Behavior

- Coordinators create assignments from the required reading management page
- Members see their unread required guides count on the **home page dashboard**
- The full required reading list is at `/crew/guides/required`
- Progress is tracked by cross-referencing with `guide-read-receipts`
- Role-based: a guide can be required for specific roles (e.g., all members, or just leaders)

## Access Control

- Only **Coordinators and Admins** can create, edit, or delete assignments
- All crew members can view assignments that apply to their role
- Crew-scoped — assignments only apply within the owning crew

## Related

- [Crew Guides Overview](../features/guides/overview)
- [Crew Guides Collection](./crew-guides)
- [Guide Read Receipts Collection](./guide-read-receipts)
