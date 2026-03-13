---
sidebar_position: 13
title: "Recipe Sub-Groups"
---

# Recipe Sub-Groups

## Overview

The **Recipe Sub-Groups** collection provides crew-defined sub-categories within each recipe group. For example, the "Breakfast" group might have sub-groups like "Eggs", "Pancakes & Waffles", and "Smoothies". Each sub-group belongs to a specific recipe group and crew, allowing different crews to organize their recipes differently.

**Source:** `src/collections/RecipeSubGroups/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `recipe-subgroups` |
| **Admin Group** | Recipes |
| **Use as Title** | `name` |
| **Default Columns** | name, group, crew, updatedAt |

## Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `name` | text | Yes | minLength: 1, maxLength: 100 | Sub-group name (e.g., "Eggs", "Sandwiches", "Pasta"). |
| `group` | select | Yes | Options: `breakfast`, `lunch`, `dinner`, `bakery`, `drinks`, `salad_bar` | Which recipe group this sub-group belongs to. |
| `crew` | relationship | Yes | Relation to `crews`, indexed | The crew this sub-group belongs to. |

## Access Control

| Operation | admin | inventory_admin | inventory_editor | Any crew member | Unauthenticated |
|---|---|---|---|---|---|
| **Create** | Yes | Own crew only | Own crew only | No | No |
| **Read** | All | Own crew only | Own crew only | Own crew only | No |
| **Update** | All | Own crew only | Own crew only | No | No |
| **Delete** | Yes | Own crew only | No | No | No |

- **Read**: Any authenticated user with a crew can read their own crew's sub-groups (`recipeReadAccess`).
- **Create/Update**: Requires `inventory_admin` or `inventory_editor` role, scoped to own crew (`recipeEditorAccess`).
- **Delete**: Requires `inventory_admin` role, scoped to own crew (`recipeAdminAccess`).

## Hooks

### `beforeValidate`

1. **Auto-stamp crew**: If the requesting user has a crew and no crew is set on the data, the user's crew ID is assigned.

### `beforeChange`

1. **Force crew for non-admins**: Non-admin users always have the crew field stamped to their own crew ID, preventing cross-crew sub-group creation or reassignment.

## Relationships

| Related Collection | Field | Direction | Description |
|---|---|---|---|
| `crews` | `crew` | Sub-Groups --> Crews | Owning crew |

Recipe Sub-Groups are referenced by the `Recipes` collection via `recipe.subGroup`.

## Indexes

| Field | Type |
|---|---|
| `crew` | Standard |
