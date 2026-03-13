---
sidebar_position: 5
title: "Groups & Tags"
---

# Groups & Tags

Recipes in OCFCrews are organized through a three-level classification system: **groups** (fixed), **subgroups** (crew-specific), and **tags** (crew-specific, many-to-many).

## Recipe Groups

Groups are the top-level organizational unit. They are defined as a fixed set of options in the application constants and cannot be modified by users.

| Group | Value | Description |
|---|---|---|
| Breakfast | `breakfast` | Morning meals |
| Lunch | `lunch` | Midday meals |
| Dinner | `dinner` | Evening meals |
| Bakery | `bakery` | Baked goods |
| Drinks | `drinks` | Beverages |
| Salad Bar | `salad_bar` | Salads and salad bar items |

Every recipe must belong to exactly one group. Groups determine the primary URL structure (`/recipes/breakfast`, `/recipes/lunch`, etc.) and the browse-by-group grid on the recipes home page.

The `RecipeNav` sidebar displays each group as a navigation link with its associated icon.

## Subgroups

Subgroups are **crew-specific subcategories** within a group. They allow each crew to create their own organizational structure. For example:

```
Breakfast
  ├── Eggs
  ├── Pancakes & Waffles
  └── Cereals & Granola

Lunch
  ├── Sandwiches
  ├── Salads
  └── Wraps

Dinner
  ├── Grill
  ├── Pasta
  └── Casseroles
```

### SubGroup Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | text | Yes | Subgroup name (1--100 chars) |
| `group` | select | Yes | Parent recipe group (breakfast, lunch, dinner, bakery, drinks, salad_bar) |
| `crew` | relationship | Yes | Owning crew |

### How Subgroups Are Used

- **Recipe group page**: When not filtering, recipes are displayed organized by subgroup. Featured recipes appear first, then each subgroup section, then ungrouped recipes under "Other".
- **Filtering**: The `RecipeFilters` component includes a subgroup dropdown for the current group's subgroups.
- **Recipe form**: The create/edit form includes a subgroup selector filtered to the selected group.
- **Detail page**: The subgroup name appears in the breadcrumb and below the recipe title.

### Subgroup Sort Order

Within a subgroup, recipes are sorted by `sortOrder` (ascending) then `featured` (descending). The `sortOrder` field on recipes defaults to 0, and lower numbers display first.

## Tags

Tags are **crew-specific labels** that can be applied to any recipe regardless of group. Unlike subgroups which are bound to a single group, tags work across all groups. A recipe can have multiple tags (many-to-many relationship).

### Tag Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | text | Yes | Tag name (1--100 chars) |
| `crew` | relationship | Yes | Owning crew |

### Example Tags

- "Quick & Easy"
- "Make Ahead"
- "Crowd Favorite"
- "Camp Classic"
- "Vegetarian Option"

### How Tags Are Used

- **Filtering**: The `RecipeFilters` component on group pages includes a multi-select tag filter. Selected tags are applied as OR conditions (a recipe matching any selected tag is shown).
- **Display**: Tags appear as small badges on recipe detail pages.
- **Hidden in image-only mode**: Tags are not shown on image-only recipe cards.

## Management UI

### SubGroupTagManager Component

The `/recipes/tags` page (admin-only) renders the `SubGroupTagManager` client component, which provides inline CRUD for both subgroups and tags.

**Subgroup management**:
- Create new subgroups by selecting a parent group and entering a name
- View subgroups grouped by their parent recipe group
- Delete subgroups

**Tag management**:
- Create new tags by entering a name
- View all tags for the crew
- Delete tags

### Access Control

| Operation | Subgroups | Tags |
|---|---|---|
| **Create** | `admin`, `inventory_admin`, `inventory_editor` | `admin`, `inventory_admin`, `inventory_editor` |
| **Read** | All crew members | All crew members |
| **Update** | `admin`, `inventory_admin`, `inventory_editor` | `admin`, `inventory_admin`, `inventory_editor` |
| **Delete** | `admin`, `inventory_admin` | `admin`, `inventory_admin` |

The tags management page itself is restricted to admin and inventory_admin users. Regular editors can create subgroups and tags through the recipe form but cannot access the dedicated management page.

## Crew Scoping

Both subgroups and tags include the standard crew-stamping hooks:

- **`beforeValidate`**: Auto-stamps `crew` from the authenticated user
- **`beforeChange`**: Forces non-admin users to their own crew

All read queries return only data matching the user's crew, ensuring complete isolation between crews.

## Filtering on Group Pages

The `RecipeFilters` component on each group page provides multiple filter dimensions:

| Filter | Type | Behavior |
|---|---|---|
| Search (`q`) | Text input | Filters by recipe name using `like` operator |
| Subgroup | Dropdown | Filters to a single subgroup |
| Tags | Multi-select | OR filter across selected tags |
| Dietary | Multi-select | OR filter across dietary tags |
| Difficulty | Multi-select | Filters by difficulty levels |

When any filter is active, the page switches from the organized sub-group layout to a flat grid showing all matching recipes.
