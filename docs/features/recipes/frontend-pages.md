---
sidebar_position: 6
title: "Recipe Frontend"
---

# Recipe Frontend

The recipe frontend is built as a set of Next.js App Router pages under `/recipes`. All pages are server-rendered and protected by layout-level auth guards.

## Route Structure

| Route | Page Component | Description |
|---|---|---|
| `/recipes` | `RecipesPage` | Home page with search, favorites, featured, and group grid |
| `/recipes/new` | `NewRecipePage` | Create a new recipe |
| `/recipes/[group]` | `RecipeGroupPage` | Group listing with filters and subgroup organization |
| `/recipes/[group]/[id]` | `RecipeDetailPage` | Full recipe view with scaling, printing, favorites |
| `/recipes/[group]/[id]/edit` | Edit page | Edit an existing recipe |
| `/recipes/tags` | `RecipeTagsPage` | Subgroup and tag management (admin only) |
| `/recipes/shopping-list` | `ShoppingListPage` | Ingredient-based shopping list generator |

## Layout

The recipe layout (`/recipes/layout.tsx`) wraps all recipe pages and provides:

1. **Authentication**: Verifies the user's session via `payload.auth({ headers })`. Redirects to `/login` if expired.
2. **Authorization**: Allows access for users with admin/inventory roles OR any user with a crew assigned. Redirects to `/account` if the user has no crew.
3. **Navigation**: Renders the `RecipeNav` component in two modes:
   - **Desktop sidebar** (hidden below `md`): Vertical navigation in a `max-w-52` sidebar
   - **Mobile tab bar** (visible below `md`): Horizontal scrollable tab navigation

## RecipeNav Component

The `RecipeNav` is a client component that renders navigation links with icons:

**Links shown to all users:**
- All Recipes (`/recipes`)
- Breakfast (`/recipes/breakfast`) -- with group icon
- Lunch (`/recipes/lunch`) -- with group icon
- Dinner (`/recipes/dinner`) -- with group icon
- Bakery (`/recipes/bakery`) -- with group icon
- Drinks (`/recipes/drinks`) -- with group icon
- Salad Bar (`/recipes/salad_bar`) -- with group icon
- Shopping List (`/recipes/shopping-list`) -- with ShoppingCart icon

**Links shown only to admins (`isAdmin` prop):**
- Sub-Groups & Tags (`/recipes/tags`)

Active links are highlighted with the primary text color. Each group link displays its corresponding `RecipeIcon`.

## Recipes Home (`/recipes`)

The home page provides multiple ways to discover recipes:

### Global Search
A search form at the top searches across all published recipes by name. Results are displayed in a card grid showing recipe name and group. A "Clear" link resets the search.

### Your Favorites
When the user has favorited recipes, they appear in a dedicated section with red heart icons and red-tinted card borders. Each card links to the recipe detail page. Hidden during search.

### Featured
Up to 6 featured recipes (across all groups) are displayed with gold star icons and amber-tinted card borders. Hidden during search.

### Browse by Group
A grid of `RecipeGroupCard` components shows each of the 6 recipe groups with their recipe count and featured count. Hidden during search.

### New Recipe Button
Editors and admins see a "New Recipe" button in the header.

### Empty State
When no recipes exist, a centered message with a chef hat icon and "Add the first recipe" button is shown (for editors/admins).

## Group Page (`/recipes/[group]`)

Displays all recipes within a specific group, organized by subgroup.

### Header
Shows the group icon, label, recipe count, and a "New Recipe" button (pre-filling the group) for editors/admins.

### Filters
The `RecipeFilters` component provides:
- **Text search** by recipe name
- **Subgroup** dropdown (populated from crew's subgroups for this group)
- **Tags** multi-select filter
- **Dietary** multi-select filter
- **Difficulty** multi-select filter

### Recipe Display

**When not filtering** (organized view):
1. **Featured** section with star icons -- recipes marked as featured
2. **Subgroup sections** -- each subgroup with its name as a heading, showing recipes in a card grid
3. **Other** section -- recipes without a subgroup assignment

**When filtering** (flat view):
All matching recipes displayed in a single flat grid.

### Recipe Cards
The `RecipeCard` component shows the recipe name, status badge (for drafts), and links to the detail page.

Editors and admins see both published and draft recipes. Non-editor users only see published recipes.

### Truncation Warning
If there are more than 200 matching recipes, an amber warning banner shows the total count and suggests using filters.

## Recipe Detail (`/recipes/[group]/[id]`)

A comprehensive recipe view with multiple sections.

### Image-Only Mode
When `imageOnly` is enabled, the page shows a simplified view:
- Recipe name with featured star
- Subgroup name
- `RecipeImageDisplay` component (full-width image)
- Tags
- Action buttons: Favorite, Print, Clone, Edit, Delete

### Full Recipe View

**Breadcrumb**: Links back to the group page with the subgroup name.

**Hero Section**:
- Recipe image (via `RecipeImageDisplay`) or icon placeholder
- Recipe name with featured star and draft badge
- Subgroup name
- Last cooked date
- Description
- Source/credit

**Action Buttons** (in the hero):
- `RecipeFavoriteButton` -- heart toggle for favorites
- `PrintButton` -- triggers browser print dialog
- `CloneRecipeButton` -- duplicates the recipe as a draft
- Edit button -- links to the edit form
- All hidden during print

**Meta Bar**:
- Servings count with Users icon
- Yield description with ChefHat icon
- Portion size
- Temperature with Thermometer icon
- Prep time, cook time, rest time
- Total time (sum of all times) with Clock icon
- Difficulty badge (color-coded: green=easy, amber=medium, orange=hard, red=expert)

**Dietary and Allergens**: Emerald badges for dietary tags, red badges with "Contains:" prefix for allergens.

**Tags**: Muted badges for crew-specific tags.

**Ingredients Section**:
- `RecipeScaler` component with serving size adjuster
- Stock status indicators (green/amber/red dots) for linked inventory items (editors/admins only)
- Cost estimate per batch (editors/admins only)

**Instructions Section**:
- **Steps mode**: Numbered steps with emerald circular step numbers
- **Freeform mode**: Plain text with preserved whitespace

**Notes and Extras**:
- Chef's Notes -- tips, substitutions, serving suggestions
- Equipment list with emerald bullet points
- Storage instructions
- Make-Ahead & Freezing notes
- Scaling Notes

**Delete Section** (admin only):
- Warning message about permanent deletion
- `DeleteRecipeButton` component

## New Recipe (`/recipes/new`)

Restricted to editors and admins. Renders the `RecipeForm` component in `create` mode.

- Breadcrumb link back to recipes home
- Pre-populates the group if `?group=` query parameter is provided
- Fetches crew's subgroups and tags for the form selectors

## Edit Recipe (`/recipes/[group]/[id]/edit`)

Renders the `RecipeForm` component in `edit` mode with the existing recipe data pre-filled.

## Tags Management (`/recipes/tags`)

Restricted to admin and inventory_admin users. Others are redirected with a warning.

Renders the `SubGroupTagManager` client component which provides:
- **Subgroup management**: Create, view (grouped by parent recipe group), and delete subgroups
- **Tag management**: Create, view, and delete tags

## Recipe Shopping List (`/recipes/shopping-list`)

Renders the `RecipeShoppingListClient` client component.

### Layout
Two-column layout on large screens:
- **Left column** (print hidden): Recipe selector organized by group with checkboxes and serving size inputs
- **Right column**: Consolidated shopping list with quantities and item names

### Features
- Select multiple recipes to generate a consolidated ingredient list
- Adjust serving sizes per recipe to scale ingredient quantities
- Quantities with matching units are automatically summed across recipes
- "To taste" and "as needed" items shown separately without quantity summation
- Custom (non-inventory) items marked with an amber badge
- Optional ingredients shown with reduced opacity and "(optional)" label
- Print button for browser print output

## Shared Utilities

### `getRecipeContext()`

A server-side helper used by all recipe pages:
1. Authenticates the user via `payload.auth({ headers })`
2. Extracts crew ID from the user profile
3. Determines role flags: `isAdmin`, `isEditor`, `canDelete`
4. Returns `{ payload, user, crewId, isAdmin, isEditor, canDelete }`

### `RecipeIcon`

A component that renders the appropriate Lucide icon based on an icon name string (e.g., `"Utensils"`, `"ChefHat"`, `"Apple"`).

### `RecipeImageDisplay`

A component that displays recipe images with responsive sizing.
