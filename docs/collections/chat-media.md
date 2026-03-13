---
sidebar_position: 3
title: "Chat Media"
---

# Chat Media

## Overview

The **Chat Media** collection stores file attachments uploaded in PeachChat messages. Files are stored in Cloudflare R2 under a `chat-media/` prefix.

**Source:** `src/collections/ChatMedia/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `chat-media` |
| **Admin Group** | Chat |
| **Upload** | Enabled (Cloudflare R2 storage) |

## Upload

| Property | Value |
|---|---|
| **Allowed MIME Types** | `image/*`, `application/pdf`, `text/plain` |

## Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `alt` | text | Yes | maxLength: 500 | Description / alt text. Defaults to "Chat attachment" if not provided during upload. |
| `crew` | relationship | No | Relation to `crews`, indexed | Owning crew. Auto-stamped from uploading user's crew. |
| *(upload fields)* | — | — | — | Standard Payload upload fields: filename, mimeType, filesize, url, width, height, etc. |

## Access Control

| Operation | admin / editor | crew member (own crew) | other |
|---|---|---|---|
| **Create** | Yes | Yes | No |
| **Read** | All | Own crew + global media | No |
| **Update** | Yes | No | No |
| **Delete** | Admin only | No | No |
