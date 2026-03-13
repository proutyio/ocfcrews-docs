---
sidebar_position: 1
title: "Chat Channels"
---

# Chat Channels

## Overview

The **Chat Channels** collection stores messaging channels for PeachChat. Each crew has an auto-created `general` channel; coordinators can create additional `custom` channels. Channels without a crew are global, visible to all confirmed crew members.

**Source:** `src/collections/ChatChannels/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `chat-channels` |
| **Admin Group** | Chat |
| **Default Columns** | name, type, crew, createdAt |

## Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `name` | text | Yes | maxLength: 60 | Channel display name. Unique per crew (enforced by hook). |
| `description` | textarea | No | maxLength: 500 | Channel description shown in header. |
| `crew` | relationship | No | Relation to `crews`, indexed | Owning crew. Empty for global channels. |
| `type` | select | Yes | Default: `custom` | `general` (auto-created, protected), `announcements`, or `custom`. Read-only in admin. |
| `createdBy` | relationship | No | Relation to `users` | Auto-stamped channel creator. Read-only. |
| `sortOrder` | number | No | Default: 0, min: -999, max: 999, indexed | Controls display order in the sidebar. |
| `archived` | checkbox | No | Default: false, indexed | When true, channel is read-only. |
| `pinned` | checkbox | No | Default: false | Whether the channel is pinned. |
| `restricted` | checkbox | No | Default: false, indexed | When enabled, only allowed users (plus coordinators and admins) can see this channel. Only applicable to custom crew channels. |
| `allowedUsers` | relationship | No | hasMany, relation to `users`, maxRows: 200 | Users who can access this restricted channel. Coordinators and admins always have access. Only shown when `restricted` is true on a custom crew channel. |

## Access Control

| Operation | admin | coordinator | crew member | unassigned |
|---|---|---|---|---|
| **Create** | Any crew | Own crew | No | No |
| **Read** | All | Own crew + global | Own crew + global | No |
| **Update** | All | Own crew | No | No |
| **Delete** | Yes | Own crew | No | No |

## Hooks

- **beforeValidate**: Trims and validates channel name; strips restriction fields from non-custom or global channels; clears `allowedUsers` when restriction is toggled off; auto-sets `crew` from user profile if not provided (on create); auto-sets `createdBy` (on create)
- **beforeDelete**: Prevents deletion of non-custom channels (general, announcements). Throws `"Default channels cannot be deleted."`

## Indexes

| Field(s) | Type | Source |
|---|---|---|
| `crew` | Standard | Collection config |
| `sortOrder` | Standard | Collection config |
| `archived` | Standard | Collection config |
| `restricted` | Standard | Collection config |
| `{ crew: 1, archived: 1 }` | Compound | `ensureCompoundIndexes()` |
