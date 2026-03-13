---
sidebar_position: 4
title: "Recipe Favorites"
---

# Recipe Favorites

The favorites system allows individual users to bookmark recipes for quick access. Favorites are per-user and crew-scoped, appearing in a dedicated "Your Favorites" section on the recipes home page.

## RecipeFavorites Collection

The `recipe-favorites` collection stores the relationship between a user and a recipe they have favorited.

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `user` | relationship | Yes | The user who favorited the recipe (indexed) |
| `recipe` | relationship | Yes | The recipe that was favorited (indexed) |
| `crew` | relationship | Yes | The crew scope (indexed) |

The collection is hidden from the Payload admin panel (`admin.hidden: true`) since it is managed entirely through the frontend UI.

## Access Control

The favorites collection uses strict per-user access control:

| Operation | Rule |
|---|---|
| **Create** | Any authenticated user |
| **Read** | Admin users see all favorites (`return true`); non-admin users see only their own (`{ user: { equals: req.user.id } }`) |
| **Update** | No one (favorites are immutable -- toggle by create/delete) |
| **Delete** | Admin users can delete any favorite (`return true`); non-admin users can only delete their own (`{ user: { equals: req.user.id } }`) |

Non-admin users can never see, modify, or delete other users' favorites. The `update` operation is completely disabled since favorites are binary -- they exist or they do not.

## Crew Validation

The `beforeChange` hook performs crew validation to prevent users from favoriting recipes belonging to other crews:

1. Auto-stamps `user` from the authenticated user's ID
2. Auto-stamps `crew` from the authenticated user's crew
3. Fetches the recipe document being favorited
4. Compares the recipe's crew with the user's crew
5. If they do not match, throws: `"Cannot favorite recipes from other crews."`

This validation ensures data isolation -- a user in Crew A cannot create a favorite record pointing to a recipe owned by Crew B.

## RecipeFavoriteButton Component

The `RecipeFavoriteButton` is a client-side toggle component rendered on recipe detail pages. It receives:

- `recipeId` -- The ID of the current recipe
- `initialFavoriteId` -- The ID of the existing favorite record (or `null` if not favorited)

The button displays a heart icon that toggles between filled (favorited) and outline (not favorited) states. When clicked:

- **To favorite**: Creates a new `recipe-favorites` document via the Payload API
- **To unfavorite**: Deletes the existing favorite document by its ID

The button is only rendered when a user is authenticated (`user` exists in the recipe context).

## How Favorites Appear

### Recipes Home Page (`/recipes`)

The home page fetches the current user's favorites:

```typescript
const favoriteRecipes = await payload.find({
  collection: 'recipe-favorites',
  where: { user: { equals: user.id } },
  limit: 100,
  depth: 1,
})
```

Favorites are displayed in a "Your Favorites" section with:
- Red heart icons
- Red-tinted card borders
- Recipe name and group label
- Links to the recipe detail page

The favorites section only appears when the user has at least one favorite and is not currently searching.

### Recipe Detail Page (`/recipes/[group]/[id]`)

The detail page checks for an existing favorite:

```typescript
const favoriteResult = await payload.find({
  collection: 'recipe-favorites',
  where: { user: { equals: user.id }, recipe: { equals: id } },
  limit: 1,
  depth: 0,
})
```

The `RecipeFavoriteButton` is rendered in the action buttons area alongside Print, Clone, and Edit buttons. It appears on both standard recipes and image-only recipes.

## Hooks

### `beforeValidate`

Stamps `user` and `crew` from the authenticated user's profile before Payload's validation runs, preventing "required field" errors.

### `beforeChange`

1. Force-stamps `user` to the authenticated user's ID (prevents spoofing)
2. Force-stamps `crew` from the user's profile
3. Validates that the recipe being favorited belongs to the user's crew
