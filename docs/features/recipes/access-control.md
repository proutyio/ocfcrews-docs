---
sidebar_position: 7
title: "Recipe Access Control"
---

# Recipe Access Control

The recipe system uses a simpler access model than inventory, reflecting that recipes are primarily a collaborative resource. All access functions are defined in `/src/access/recipeAccess.ts`.

## Access Functions

### `recipeReadAccess`

**Purpose**: Read access for recipes and recipe sub-collections.

**Logic**:
- If no user: **denied**
- If user is `admin`: returns `true` (full access, all crews)
- If user has a crew: returns `{ crew: { equals: crewId } }` (any authenticated user with a crew can read recipes)
- Otherwise: **denied**

**Key difference from inventory**: Recipe read access does not require any specific inventory role -- any authenticated user with a crew assignment can read recipes.

**Used by**: `Recipes.read`, `RecipeSubGroups.read`, `RecipeTags.read`

### `recipeEditorAccess`

**Purpose**: Create and update access for recipes.

**Logic**:
- If no user: **denied**
- If user is `admin`: returns `true`
- If user has a crew and has `inventory_admin` or `inventory_editor` role: returns `{ crew: { equals: crewId } }` (scoped to own crew)
- Otherwise: **denied**

**Used by**: `Recipes.create`, `Recipes.update`, `RecipeSubGroups.create/update`, `RecipeTags.create/update`

### `recipeAdminAccess`

**Purpose**: Delete access for recipes and sub-collections.

**Logic**:
- If no user: **denied**
- If user is `admin`: returns `true`
- If user has a crew and has `inventory_admin` role: returns `{ crew: { equals: crewId } }` (scoped to own crew)
- Otherwise: **denied** (inventory_editor cannot delete)

**Used by**: `Recipes.delete`, `RecipeSubGroups.delete`, `RecipeTags.delete`

## Role Permissions

### Recipes Collection

| Operation | admin | inventory_admin | inventory_editor | inventory_viewer | Other crew member |
|---|---|---|---|---|---|
| **Create** | All crews | Own crew | Own crew | No | No |
| **Read** | All crews | Own crew | Own crew | Own crew | Own crew |
| **Update** | All crews | Own crew | Own crew | No | No |
| **Delete** | All crews | Own crew | No | No | No |

### RecipeSubGroups Collection

| Operation | admin | inventory_admin | inventory_editor | inventory_viewer | Other crew member |
|---|---|---|---|---|---|
| **Create** | All crews | Own crew | Own crew | No | No |
| **Read** | All crews | Own crew | Own crew | Own crew | Own crew |
| **Update** | All crews | Own crew | Own crew | No | No |
| **Delete** | All crews | Own crew | No | No | No |

### RecipeTags Collection

| Operation | admin | inventory_admin | inventory_editor | inventory_viewer | Other crew member |
|---|---|---|---|---|---|
| **Create** | All crews | Own crew | Own crew | No | No |
| **Read** | All crews | Own crew | Own crew | Own crew | Own crew |
| **Update** | All crews | Own crew | Own crew | No | No |
| **Delete** | All crews | Own crew | No | No | No |

### RecipeFavorites Collection

Favorites use custom inline access rules rather than the shared access functions:

| Operation | Rule |
|---|---|
| **Create** | Any authenticated user |
| **Read** | Own favorites only (`{ user: { equals: req.user.id } }`) |
| **Update** | No one (disabled) |
| **Delete** | Own favorites only (`{ user: { equals: req.user.id } }`) |

## Comparison: Recipe vs. Inventory Access

| Aspect | Inventory | Recipes |
|---|---|---|
| **Read access** | Requires an inventory role | Any crew member can read |
| **Create/Update** | `inventory_admin` + `inventory_editor` | `inventory_admin` + `inventory_editor` |
| **Delete** | `inventory_admin` only | `inventory_admin` only |
| **Viewer role** | Explicit `inventory_viewer` role needed | Any crew member can view |

The key distinction is that recipe reading is more permissive. While inventory data requires an explicit `inventory_viewer` (or higher) role, recipes are accessible to any authenticated user who belongs to a crew. This makes recipes a shared crew resource that everyone can browse.

## Crew Isolation

All recipe collections enforce crew isolation through the same two mechanisms as inventory:

### 1. Access Control Where Clauses

Non-admin read queries return a `Where` clause that scopes results to the user's crew. Payload CMS automatically applies this to every query.

### 2. beforeChange Crew Stamping

Every recipe collection includes hooks that:
- Auto-stamp the `crew` field from the authenticated user
- Prevent non-admin users from changing the `crew` field
- Throw an error on crew change attempts: `"You cannot change the crew assigned to this recipe."`

## Frontend Route Guards

The recipe layout adds frontend-level protection:

1. **Authentication**: Redirects to `/login` if session expired
2. **Crew check**: Allows users with admin/inventory roles OR any user with a crew. Redirects to `/account` if no crew is assigned.
3. **Admin flag**: Passes `isAdmin` (true for `admin` and `inventory_admin`) to the navigation

Additional page-level guards:
- `/recipes/new`: Redirects non-editors back to `/recipes`
- `/recipes/tags`: Redirects non-admins back to `/recipes`
- Edit pages: Only accessible to editors/admins
- Delete button: Only shown to users with `canDelete` permission (admin, inventory_admin)

## Role Constants

Recipe-related role constants from `/src/constants/roles.ts`:

```typescript
/** Roles shown in the header nav for recipe link */
export const RECIPE_HEADER_ROLES = [
  'admin',
  'inventory_admin',
  'inventory_editor',
] as const
```

Note that `inventory_viewer` is not included in `RECIPE_HEADER_ROLES`. Viewers can access recipe pages directly via URL but do not see the recipes link in the main header navigation.
