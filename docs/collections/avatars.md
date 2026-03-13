---
sidebar_position: 19
title: "Avatars"
---

# Avatars

## Overview

The **Avatars** collection stores user profile photos. It is a dedicated upload collection separate from the general Media library, ensuring user avatars are stored in their own directory and have their own access control rules. Avatars are publicly readable (so they can be displayed on profiles and crew listings) but only admins can update or delete them directly.

## Configuration

| Property | Value |
|---|---|
| **Slug** | `avatars` |
| **Admin Group** | Account |
| **Default Columns** | `filename`, `usedBy`, `updatedAt` |
| **Static Directory** | `public/avatars` (relative to project root) |
| **Allowed MIME Types** | `image/*` |

## Fields

| Name | Type | Required | Description |
|---|---|---|---|
| `usedBy` | `join` | No | A virtual join field that displays which user(s) reference this avatar. Joins to the `users` collection on the `photo` field. This field is read-only and computed by Payload. |

:::note
In addition to the `usedBy` field, Payload automatically adds standard upload fields such as `filename`, `mimeType`, `filesize`, `width`, `height`, and `url` for all upload-enabled collections.
:::

## Access Control

| Operation | admin | Any Authenticated User | Unauthenticated |
|---|---|---|---|
| **Create** | Yes | Yes | No |
| **Read** | Yes | Yes | Yes |
| **Update** | Yes | No | No |
| **Delete** | Yes | No | No |

- **Read**: Fully public -- returns `true` for all users so avatars can be displayed anywhere.
- **Create**: Any authenticated user can upload an avatar (returns `true` if user exists).
- **Update / Delete**: Restricted to `admin` role only via the `adminOnly` access function.

## Hooks

This collection does not define any custom hooks.

## Relationships

| Related Collection | Field | Relationship Type | Description |
|---|---|---|---|
| **Users** | `usedBy` (join on `users.photo`) | One-to-many (virtual) | Shows which user(s) are using this avatar as their profile photo. The `users` collection has a `photo` field that references `avatars`. |
