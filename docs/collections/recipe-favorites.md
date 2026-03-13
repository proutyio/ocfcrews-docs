---
sidebar_position: 12
title: "Recipe Favorites"
---

# Recipe Favorites

## Overview

The **Recipe Favorites** collection tracks which recipes individual users have favorited. Each document is a simple junction record linking a user to a recipe, scoped to a crew. This collection is hidden from the admin panel and is managed entirely through the frontend UI.

**Source:** `src/collections/RecipeFavorites/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `recipe-favorites` |
| **Admin Group** | Recipes |
| **Hidden** | Yes (not shown in admin sidebar) |

## Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `user` | relationship | Yes | Relation to `users`, indexed | The user who favorited the recipe. |
| `recipe` | relationship | Yes | Relation to `recipes`, indexed | The favorited recipe. |
| `crew` | relationship | Yes | Relation to `crews`, indexed | The crew context for this favorite. |

## Access Control

| Operation | Authenticated User | Unauthenticated |
|---|---|---|
| **Create** | Yes | No |
| **Read** | Own favorites only | No |
| **Update** | No (denied for all) | No |
| **Delete** | Own favorites only | No |

- Read and delete access use `{ user: { equals: req.user.id } }` to restrict users to their own favorites.
- Update is completely denied -- favorites are immutable (create or delete only).
- Any authenticated user can create a favorite.

## Hooks

### `beforeValidate`

1. **Auto-stamp user and crew**: Sets `data.user` to `req.user.id` and `data.crew` to the user's crew ID if not already set. Ensures the favorite is always attributed to the correct user and crew.

### `beforeChange`

1. **Force user and crew stamps**: Always overwrites `data.user` with `req.user.id` and `data.crew` with the user's crew ID. This prevents any client-side manipulation of the user or crew fields.

2. **Cross-crew validation**: If the user has a crew and is favoriting a recipe, the hook fetches the recipe and verifies its `crew` matches the user's crew. Throws `"Cannot favorite recipes from other crews."` if there is a mismatch. If the recipe lookup fails, throws `"Could not verify recipe. Please try again."`.

## Relationships

| Related Collection | Field | Direction | Description |
|---|---|---|---|
| `users` | `user` | Favorites --> Users | The user who favorited |
| `recipes` | `recipe` | Favorites --> Recipes | The favorited recipe |
| `crews` | `crew` | Favorites --> Crews | Crew context |

## Indexes

| Field | Type |
|---|---|
| `user` | Standard |
| `recipe` | Standard |
| `crew` | Standard |
