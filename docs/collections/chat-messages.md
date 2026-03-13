---
sidebar_position: 2
title: "Chat Messages"
---

# Chat Messages

## Overview

The **Chat Messages** collection stores individual messages in PeachChat channels. Messages support markdown content, file attachments, emoji reactions, threading, pinning, edit history, and soft-delete.

**Source:** `src/collections/ChatMessages/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `chat-messages` |
| **Admin Group** | Chat |
| **Default Columns** | channel, user, content, createdAt |

## Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `content` | textarea | Yes | maxLength: 4000 | Message text. Rendered as markdown on the frontend. |
| `channel` | relationship | Yes | Relation to `chat-channels`, indexed | Parent channel. |
| `user` | relationship | Yes | Relation to `users`, indexed | Message author. Auto-stamped. |
| `crew` | relationship | No | Relation to `crews`, indexed | Crew context. Auto-stamped from channel. |
| `attachments` | array | No | maxRows: 5, with `file` upload sub-field (relation to `chat-media`, required) | File attachments. |
| `reactions` | JSON | No | Default: `[]` | Array of `{ emoji: string, users: string[] }`. |
| `mentions` | JSON | No | Default: `[]` | Array of mentioned user IDs. |
| `parentMessage` | relationship | No | Relation to `chat-messages` | Thread parent. If set, this is a thread reply. |
| `threadReplyCount` | number | No | Default: 0 | Auto-incremented count of thread replies. |
| `threadLastReplyAt` | date | No | | Timestamp of most recent thread reply. |
| `pinned` | checkbox | No | Default: false | Whether the message is pinned. |
| `pinnedBy` | relationship | No | Relation to `users` | User who pinned the message. |
| `pinnedAt` | date | No | | When the message was pinned. |
| `editedAt` | date | No | | Last edit timestamp. |
| `editHistory` | JSON | No | Default: `[]` | Array of `{ content, editedAt }`. Capped at 50 entries. |
| `deleted` | checkbox | No | Default: false | Soft-delete flag. |
| `deletedAt` | date | No | | When the message was deleted. |

## Access Control

| Operation | admin | coordinator | author | crew member | unassigned |
|---|---|---|---|---|---|
| **Create** | Yes | Yes | — | Yes | No |
| **Read** | All | Own crew channels | — | Own crew channels | No |
| **Update** | Yes | No | Own messages | No | No |
| **Delete** | Yes | Own crew | Own messages | No | No |

## Hooks

- **beforeValidate**: Auto-sets `user` from authenticated user; auto-sets `crew` from user's crew

## Indexes

| Field(s) | Type | Source |
|---|---|---|
| `channel` | Standard | Collection config |
| `user` | Standard | Collection config |
| `crew` | Standard | Collection config |
| `{ channel: 1, createdAt: -1 }` | Compound | `ensureCompoundIndexes()` |
| `{ parentMessage: 1, createdAt: 1 }` | Compound | `ensureCompoundIndexes()` |
