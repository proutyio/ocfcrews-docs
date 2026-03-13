---
sidebar_position: 14
title: "Recipe Tags"
---

# Recipe Tags

## Overview

The **Recipe Tags** collection stores user-defined tags for categorizing recipes within a crew. Tags allow crew members to label recipes with descriptors like "Quick & Easy", "Make Ahead", "Crowd Favorite", or "Camp Classic", making it easier to filter and discover recipes.

Each tag is scoped to a specific crew, ensuring crew isolation for recipe organization.

## Configuration

| Property | Value |
|---|---|
| **Slug** | `recipe-tags` |
| **Admin Group** | Recipes |
| **Use As Title** | `name` |
| **Default Columns** | `name`, `crew`, `updatedAt` |

## Fields

| Name | Type | Required | Description |
|---|---|---|---|
| `name` | `text` | Yes | The display name of the tag (1-100 characters). Examples: "Quick & Easy", "Make Ahead", "Crowd Favorite", "Camp Classic". |
| `crew` | `relationship` (crews) | Yes | The crew this tag belongs to. Indexed for query performance. Auto-populated from the creating user's crew. |

## Access Control

| Operation | admin | inventory_admin | inventory_editor | All Other Roles |
|---|---|---|---|---|
| **Create** | Full access | Own crew only | Own crew only | Denied |
| **Read** | Full access | Own crew only | Own crew only | Denied (unless authenticated with a crew) |
| **Update** | Full access | Own crew only | Own crew only | Denied |
| **Delete** | Full access | Own crew only | Denied | Denied |

Access control is provided by the shared recipe access helpers:

- **`recipeReadAccess`** -- Admins get full access; authenticated users with a crew can read their own crew's tags only.
- **`recipeEditorAccess`** -- Admins get full access; `inventory_admin` and `inventory_editor` roles can create/update within their own crew.
- **`recipeAdminAccess`** -- Admins get full access; only `inventory_admin` can delete within their own crew.

## Hooks

### `beforeValidate`

Auto-populates the `crew` field from the authenticated user's crew if not already set. This ensures new tags are automatically associated with the correct crew.

### `beforeChange`

Enforces crew assignment for non-admin users. Even if a non-admin user attempts to set a different crew, the hook overrides it with their actual crew ID. Admin users are exempt and can assign tags to any crew.

## Relationships

| Related Collection | Field | Relationship Type | Description |
|---|---|---|---|
| **Crews** | `crew` | Many-to-one | Each tag belongs to exactly one crew. |
| **Recipes** | (referenced by) | Many-to-many | Recipes reference tags via their `tags` field. |
