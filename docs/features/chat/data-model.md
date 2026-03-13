---
sidebar_position: 2
title: "Data Model"
---

# PeachChat Data Model

PeachChat uses four collections to store all messaging data. All collections enforce crew isolation through access control and hooks.

## Chat Channels

**Source:** `src/collections/ChatChannels/index.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | text | Yes | Channel display name (max 60 chars) |
| `description` | textarea | No | Channel description (max 500 chars) |
| `crew` | relationship → crews | No | Owning crew. Empty = global channel visible to all crews |
| `type` | select | Yes | `general`, `announcements`, or `custom` (default) |
| `createdBy` | relationship → users | No | Auto-stamped creator (read-only) |
| `sortOrder` | number | No | Display order (-999 to 999, default 0) |
| `archived` | checkbox | No | When true, channel is read-only |
| `pinned` | checkbox | No | Whether the channel is pinned |
| `restricted` | checkbox | No | When enabled, only allowed users (plus coordinators and admins) can see this channel (custom crew channels only) |
| `allowedUsers` | relationship → users | No | Users who can access this restricted channel (hasMany, max 200) |

### Hooks

- **beforeValidate**: Auto-sets `crew` from user's crew if not provided (on create); auto-sets `createdBy`; strips restriction fields from non-custom or global channels
- **beforeDelete**: Blocks deletion of all non-custom channels (general and announcements)

### Indexes

| Index | Type | Source |
|-------|------|--------|
| `crew` | Standard | Collection config |
| `{ crew: 1, archived: 1 }` | Compound | `ensureCompoundIndexes()` |
| `sortOrder` | Standard | Collection config |

---

## Chat Messages

**Source:** `src/collections/ChatMessages/index.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | textarea | Yes | Message text (max 4000 chars), supports markdown |
| `channel` | relationship → chat-channels | Yes | Parent channel |
| `user` | relationship → users | Yes | Message author |
| `crew` | relationship → crews | No | Crew context (auto-stamped from channel) |
| `attachments` | array (maxRows: 5) | No | File attachments — each item has an `upload` sub-field referencing `chat-media` |
| `reactions` | JSON | No | Array of `{ emoji, users[] }` objects |
| `parentMessage` | relationship → chat-messages | No | Thread parent (if this is a reply) |
| `threadReplyCount` | number | No | Count of thread replies (auto-updated) |
| `threadLastReplyAt` | date | No | Timestamp of most recent thread reply |
| `mentions` | JSON | No | Array of mentioned user IDs (default `[]`) |
| `pinned` | checkbox | No | Whether message is pinned |
| `pinnedBy` | relationship → users | No | Who pinned the message |
| `pinnedAt` | date | No | When the message was pinned |
| `editedAt` | date | No | Last edit timestamp |
| `editHistory` | JSON | No | Array of `{ content, editedAt }` (capped at 50 entries) |
| `deleted` | checkbox | No | Soft-delete flag |
| `deletedAt` | date | No | When the message was deleted |

### Hooks

- **beforeValidate**: Auto-sets `user` from authenticated user; auto-sets `crew` from user's crew

### Indexes

| Index | Type | Source |
|-------|------|--------|
| `channel` | Standard | Collection config |
| `user` | Standard | Collection config |
| `crew` | Standard | Collection config |
| `{ channel: 1, createdAt: -1 }` | Compound | `ensureCompoundIndexes()` |
| `{ parentMessage: 1, createdAt: 1 }` | Compound | `ensureCompoundIndexes()` |

---

## Chat Media

**Source:** `src/collections/ChatMedia.ts`

Upload collection for file attachments in chat messages. Stored in Cloudflare R2 under a `chat-media/` prefix.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `crew` | relationship → crews | No | Owning crew (auto-stamped) |
| *(upload fields)* | — | — | Standard Payload upload fields (filename, mimeType, filesize, url, etc.) |

### Access Control

- Create: Any authenticated crew member
- Read: Admin sees all; crew members see own crew's media
- Delete: Admin only

---

## Chat Read State

**Source:** `src/collections/ChatReadState/index.ts`

Tracks per-user read position in each channel for unread count calculation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user` | relationship → users | Yes | The user |
| `channel` | relationship → chat-channels | Yes | The channel |
| `lastReadAt` | date | Yes | Timestamp of last read |
| `muted` | checkbox | No | Whether unread badges are suppressed |

### Indexes

| Index | Type | Source |
|-------|------|--------|
| `user` | Standard | Collection config |
| `channel` | Standard | Collection config |
| `{ user: 1, channel: 1 }` | Compound unique | `ensureCompoundIndexes()` |

### Access Control

- Create: Server-only (overrideAccess)
- Read/Update/Delete: Own records only (`{ user: { equals: user.id } }`)
