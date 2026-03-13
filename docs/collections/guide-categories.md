---
sidebar_position: 14
title: "Guide Categories"
---

# Guide Categories Collection

**Slug**: `guide-categories`

Per-crew categories for organizing crew guides in the sidebar (e.g. Safety, Operations, Training).

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | Text (maxLength: 100) | Category name |
| `parent` | Relationship → guide-categories | Optional parent category. Max 1 level deep (sub-categories cannot have their own sub-categories). Filtered to top-level categories in the same crew. |
| `sortOrder` | Number (default: 0, min: -999, max: 999) | Controls display order in the sidebar |
| `crew` | Relationship → crews (required, indexed) | Owning crew |
| `createdAt` | Date | Auto-set |

## Access Control

| Operation | Who |
|-----------|-----|
| Create | All confirmed crew members (admin, editor, or any crew member with crewRole other than `other`) |
| Read | All confirmed crew members (own crew only) |
| Update | All confirmed crew members (own crew only; admin/editor can update all) |
| Delete | Coordinator (own crew), admin |

## Notes

- Categories are crew-scoped — each crew manages its own category list independently.
- Deleting a category does not delete the guides within it; those guides become uncategorized.

## Related

- [Crew Guides Collection](./crew-guides)
- [Crew Guides Feature](../features/guides/overview)
