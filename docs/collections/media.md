---
sidebar_position: 18
title: "Media"
---

# Media

## Overview

The **Media** collection is the primary media library for the application. It stores uploaded images, videos, and PDF files used across the site -- in page heroes, post hero images, content blocks, and SEO metadata. Each media item includes required alt text for accessibility and an optional rich text caption.

## Configuration

| Property | Value |
|---|---|
| **Slug** | `media` |
| **Admin Group** | Content |
| **Static Directory** | `public/media` (relative to project root) |
| **Allowed MIME Types** | `image/*`, `video/*`, `application/pdf` |

## Fields

| Name | Type | Required | Description |
|---|---|---|---|
| `alt` | `text` | Yes | Alternative text for the media item (max 500 characters). Required for accessibility compliance. |
| `caption` | `richText` | No | Optional rich text caption using a Lexical editor with fixed and inline toolbar features. |

:::note
In addition to the fields defined above, Payload automatically adds standard upload fields such as `filename`, `mimeType`, `filesize`, `width`, `height`, and `url` for all upload-enabled collections.
:::

## Access Control

| Operation | admin | editor | Any Authenticated User | Unauthenticated |
|---|---|---|---|---|
| **Create** | Yes | Yes | Yes | No |
| **Read** | Yes | Yes | Yes | Yes |
| **Update** | Yes | Yes | No | No |
| **Delete** | Yes | Yes | No | No |

- **Read**: Fully public -- returns `true` for all users.
- **Create**: Any authenticated user can upload media (returns `true` if user exists).
- **Update / Delete**: Restricted to users with `admin` or `editor` roles.

## Hooks

### `beforeValidate`

1. **Default alt text**: If `alt` is not provided in the upload data, it defaults to `"Media file"`. This handles a Payload v3 limitation where non-file multipart fields are not reliably parsed during file-only POST uploads.

## Relationships

| Related Collection | Referenced By | Description |
|---|---|---|
| **Pages** | `hero.media`, `meta.image`, content blocks | Pages reference media for hero images, SEO images, and within content blocks. |
| **Posts** | `heroImage`, content embeds | Posts reference media for hero images and inline uploads in rich text. |
| **Avatars** | (separate collection) | User avatars are stored in the separate Avatars collection, not in Media. |
