---
sidebar_position: 1
title: "Crew Guides Overview"
---

# Crew Guides

Crew Guides is a wiki-style knowledge base built into the platform. Crews use it to maintain shared documentation — safety procedures, setup checklists, training materials, operational notes, and anything else the crew needs to remember across seasons.

Guides live at `/crew/guides` and are accessible from the account navigation once a user is assigned to a crew.

## Structure

```
Crew Guides
├── Sidebar (navigation)
│   ├── Pinned guides (top)
│   ├── Categories (grouped)
│   │   ├── Safety
│   │   │   ├── Sub-category: Equipment
│   │   │   │   └── Fire Extinguisher Guide
│   │   │   └── Injury Protocol
│   │   ├── Operations
│   │   └── Training
│   └── Uncategorized guides
└── Reading Pane (right side)
    ├── Guide content (Lexical rich text)
    ├── Table of contents (auto-generated from headings)
    ├── File attachments
    └── Comment thread
```

The sidebar uses a search box to filter guides by title. Pinned guides always appear at the top.

## Guide Fields

| Field | Description |
|-------|-------------|
| `title` | Guide title (required) |
| `content` | Rich text body (Lexical editor) |
| `category` | Optional linked `guide-categories` document |
| `status` | `draft` or `published` |
| `pinned` | Boolean — pinned guides appear at the top of the sidebar |
| `locked` | Boolean — locked guides can only be edited by coordinators, leaders, and admins |
| `sortOrder` | Numeric — controls ordering within a category |
| `crew` | Owning crew (auto-set from the creating user's crew) |
| `createdBy` | User who created the guide |
| `updatedBy` | User who last updated the guide |
| `relatedGuides` | Up to 5 related guides shown as "See also" links |
| `tags` | Tags for categorizing guides (relationship to `guide-tags`) |
| `reviewDate` | Optional date when the guide should be reviewed for accuracy |
| `plainText` | Auto-populated plain text version of the content for full-text search (hidden, read-only) |

## Permissions

| Action | Who Can Do It |
|--------|--------------|
| View all guides (including drafts) | All confirmed crew members |
| Create a guide | All confirmed crew members |
| Edit any guide in crew | All confirmed crew members |
| Lock / unlock guides | Coordinator, Leader, Admin |
| Delete a guide | Coordinator, Admin |
| Manage guide categories | All confirmed crew members |
| Pin guides | Coordinator, Elder, Admin |
| Post comments | All confirmed crew members |
| Delete own comments | Comment author |
| Delete any comment in crew | Coordinator, Admin |
| Upload file attachments | All confirmed crew members |
| View read receipts | Coordinator, Admin |
| Manage required reading | Coordinator, Admin |

Crew guides are **crew-scoped** — a member can only see guides from their own crew. Admins can view and edit any crew's guides.

## Templates

When creating a new guide, users can start from a **template** to pre-fill structured content:

| Template | Purpose |
|----------|---------|
| Onboarding Checklist | Step-by-step checklist for new crew members |
| Equipment Operation | Operating procedures for crew equipment |
| Safety Procedure | Safety protocols and emergency procedures |
| Meeting Notes | Template for recording meeting minutes |

Templates inject content into the Lexical editor via `parseEditorState` + `setEditorState`.

## Locking

Coordinators and leaders can **lock** a guide to prevent edits by other members. Locked guides display a lock icon. Only coordinators, leaders, and admins can edit a locked guide. Lock/unlock is performed via `POST /api/crew-guides/update`.

## Version History & Diffs

Crew Guides uses Payload's built-in versioning system (`{ drafts: false, maxPerDoc: 25 }`). Every save to an existing guide automatically creates a version snapshot. Up to **25 versions** are retained per guide. Users can:

- View the full revision history (who made each change and when)
- Compare any two versions with a readable **diff view**
- The diff view uses `extractPlainText` to convert Lexical JSON to markdown-like text for human-readable comparison

## Comments

Each published guide has a **comment thread** at the bottom. Comments are:

- **Immutable** — they can be created and deleted but not edited
- Posted by any confirmed crew member
- Limited to 2000 characters per comment
- Coordinators can delete any comment in their crew
- Stored in the `guide-comments` collection

## File Attachments

Guides support **file attachments** (PDFs, images, text files). Each attachment can have an optional label. Attachments appear below the guide content for readers to download. Stored in the `guide-media` collection and crew-scoped.

## Read Tracking

The platform tracks when each crew member reads a guide via the `guide-read-receipts` collection. Read receipts record a `lastReadAt` timestamp and are automatically created when viewing a published guide (fire-and-forget POST with `useRef` to prevent duplicates).

- **Coordinators** can see who has and hasn't read each guide
- **Regular members** (including elders and leaders) only see their own read status

## Required Reading

Coordinators can assign guides as **required reading** for specific roles with optional due dates:

| Field | Description |
|-------|-------------|
| `guide` | The guide to assign |
| `targetRoles` | Roles required to read (coordinator, elder, leader, member) |
| `dueDate` | Optional due date |
| `crew` | Owning crew |

Members see their required reading list at `/crew/guides/required` and unread count appears on the home page dashboard. Coordinators can track progress from the required reading management page. Stored in the `guide-assignments` collection.

## Draft vs Published

- **Draft**: visible only to the author and site admins. Useful for work-in-progress.
- **Published**: visible to all confirmed members of the crew.

Switching a guide from published back to draft does not delete it — it simply becomes hidden from other members until published again.

## Guide Categories

All confirmed crew members can create **Guide Categories** (e.g. Safety, Operations, Training) with optional **sub-categories** (one level of nesting). Categories control how guides are grouped in the sidebar. A guide can have at most one category, or be uncategorized.

Categories are crew-scoped — each crew manages its own category list.

## Rich Text Editor

The guide editor uses the **Lexical** rich text editor with a custom toolbar supporting:

- Headings (H2–H4)
- Bold, italic, underline, strikethrough
- Text alignment and indentation
- Ordered and unordered lists, checklists
- Links
- Block quotes, horizontal rules
- Inline code
- Media uploads
- Tables
- Callout blocks

## Printing

Users can print any guide using the **Print** button. Navigation and action buttons are hidden from the printed output.

## Related Collections

- [Crew Guides Collection](../../collections/crew-guides)
- [Guide Categories Collection](../../collections/guide-categories)
- [Guide Comments Collection](../../collections/guide-comments) (if available)
- [Guide Media Collection](../../collections/guide-media) (if available)
- [Guide Read Receipts Collection](../../collections/guide-read-receipts) (if available)
- [Guide Assignments Collection](../../collections/guide-assignments) (if available)
