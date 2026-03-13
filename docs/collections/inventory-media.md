---
sidebar_position: 10
title: "Inventory Media"
---

# Inventory Media

## Overview

The **Inventory Media** collection stores file uploads used by inventory items and recipes. It is a Payload upload collection configured to accept image files and PDFs. Each uploaded file is associated with a crew and includes alt text for accessibility.

**Source:** `src/collections/InventoryMedia.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `inventory-media` |
| **Admin Group** | Inventory |
| **Default Columns** | filename, alt, crew, updatedAt |
| **Upload Static Dir** | `public/inventory-media` |
| **Allowed MIME Types** | `image/*`, `application/pdf` |

## Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `alt` | text | Yes | maxLength: 500 | Alt text for accessibility. Defaults to "Inventory file" if not provided during upload. |
| `crew` | relationship | No | Relation to `crews`, indexed | The crew this image belongs to. Not required at schema level -- crew is always stamped via hook for non-admins or set explicitly via the PATCH step in the two-step upload flow. |

In addition to the explicitly defined fields above, Payload automatically adds standard upload fields: `filename`, `mimeType`, `filesize`, `width`, `height`, `url`, etc.

## Access Control

| Operation | admin | inventory_admin | inventory_editor | inventory_viewer | All Others |
|---|---|---|---|---|---|
| **Create** | Yes | Yes | No | No | No |
| **Read** | All | Own crew only | Own crew only | Own crew only | No |
| **Update** | All | Own crew only | No | No | No |
| **Delete** | Yes | No | No | No | No |

## Hooks

### `beforeValidate`

1. **Default alt text**: If `alt` is not provided in the upload data, it defaults to `"Inventory file"`. This handles a Payload v3 limitation where non-file multipart fields are not reliably parsed during upload. The real alt text can be written via a subsequent PATCH (JSON) request.

2. **Auto-stamp crew**: If the requesting user has a crew and no crew is set on the data, the user's crew ID is assigned.

### `beforeChange`

1. **Force crew for non-admins**: Non-admin users always have the crew field stamped to their own crew ID, preventing cross-crew media uploads.

## Upload Flow

Inventory media uses a **two-step upload pattern**:

1. **Step 1 (POST)**: Upload the image file via multipart form data. The `alt` field defaults to "Inventory file" and `crew` is auto-stamped from the user.
2. **Step 2 (PATCH)**: Update the document with the real `alt` text and any other metadata via a JSON request.

This pattern works around Payload v3's unreliable parsing of non-file multipart fields.

## Relationships

| Related Collection | Field | Direction | Description |
|---|---|---|---|
| `crews` | `crew` | Inventory Media --> Crews | Owning crew |

Inventory Media documents are referenced by:
- `inventory-items` via `item.image`
- `recipes` via `recipe.image`

## Indexes

| Field | Type |
|---|---|
| `crew` | Standard |
