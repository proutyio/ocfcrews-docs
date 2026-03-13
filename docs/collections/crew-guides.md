---
sidebar_position: 13
title: "Crew Guides"
---

# Crew Guides Collection

**Slug**: `crew-guides`

Wiki-style knowledge base documents per crew. See [Crew Guides Feature](../features/guides/overview) for full documentation.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | Text | Guide title |
| `content` | Rich text (Lexical) | Guide body |
| `category` | Relationship → guide-categories | Optional category grouping |
| `status` | Enum | `draft` / `published` |
| `pinned` | Boolean | Pinned guides appear at the top of the sidebar |
| `sortOrder` | Number | Controls ordering within a category |
| `locked` | Checkbox | When true, only coordinators and leaders can edit this guide |
| `plainText` | Textarea (hidden) | Auto-populated plain text extract of `content` for full-text search (up to 50,000 chars) |
| `relatedGuides` | Relationship → crew-guides (hasMany, max 5) | Related guides shown as "See also" links (filtered to same crew, published only) |
| `tags` | Relationship → guide-tags (hasMany) | Tags for categorization (filtered to same crew) |
| `reviewDate` | Date | Optional date when this guide should be reviewed for accuracy |
| `attachments` | Array (max 20 rows) | File attachments (each row has `file` → guide-media upload and optional `label` text) |
| `crew` | Relationship → crews (required, indexed) | Owning crew (auto-set from author's crew) |
| `createdBy` | Relationship → users (read-only) | Author |
| `updatedBy` | Relationship → users (read-only) | Last user who updated the guide |
| `createdAt` | Date | Auto-set |
| `updatedAt` | Date | Auto-set |

## Versioning

Uses Payload's built-in versioning system with the following configuration:

```ts
versions: {
  drafts: false,
  maxPerDoc: 25,
}
```

Up to 25 versions are retained per document. Drafts are not used (the `status` field is a custom select field, not Payload's draft system).

## Access Control

| Operation | Who |
|-----------|-----|
| View published guides | All confirmed crew members |
| View own draft | Author, admin |
| Create | All confirmed crew members |
| Edit own | Author |
| Edit any (own crew) | Coordinator, elder, admin |
| Delete | Coordinator, admin |
| Pin / change category | Coordinator, elder, admin |

## Crew Scoping

Crew guides are strictly scoped to the owning crew. Members cannot view guides from other crews. Admins can view and edit guides for any crew.
