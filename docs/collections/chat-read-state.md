---
sidebar_position: 4
title: "Chat Read State"
---

# Chat Read State

## Overview

The **Chat Read State** collection tracks per-user-per-channel read positions for calculating unread message counts. Each record stores the last time a user read a specific channel, plus an optional mute flag.

**Source:** `src/collections/ChatReadState/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `chat-read-state` |
| **Admin Group** | Chat |
| **Default Columns** | user, channel, lastReadAt |

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `user` | relationship | Yes | Relation to `users`, indexed. |
| `channel` | relationship | Yes | Relation to `chat-channels`, indexed. |
| `lastReadAt` | date | Yes | When the user last read this channel. |
| `muted` | checkbox | No | Default: false. When true, unread badges are suppressed for this channel. |

## Access Control

| Operation | Who |
|---|---|
| **Create** | Server-only (via `overrideAccess`) |
| **Read** | Own records only (`{ user: { equals: user.id } }`) |
| **Update** | Own records only |
| **Delete** | Own records only |

## Indexes

| Field(s) | Type | Source |
|---|---|---|
| `user` | Standard | Collection config |
| `channel` | Standard | Collection config |
| `{ user: 1, channel: 1 }` | Compound unique | `ensureCompoundIndexes()` |

## Unread Count Calculation

Unread counts are computed by the `computeUnreadCounts` utility using an efficient database query:

1. Find all accessible channels for the user (crew channels + global channels)
2. For each channel, count messages where `createdAt > lastReadAt` and `deleted !== true`
3. Only non-zero counts are returned (sparse response)
4. Muted channels are excluded from the total badge count
