---
sidebar_position: 1
title: "Recipe Overview"
---

# Recipe Overview

The recipe system allows crews to create, organize, and share recipes within their team. It is tightly integrated with the inventory system, enabling ingredient-level linking to tracked inventory items for stock awareness and shopping list generation.

## Key Features

- **Recipe creation with linked ingredients** -- Ingredients can be linked to inventory items (with autocomplete search) or entered as custom names. Each ingredient specifies quantity, unit, preparation notes, and optional flags.
- **Dual instruction formats** -- Recipes support either numbered steps (structured array) or freeform text instructions.
- **Groups and subgroups** -- Recipes are organized into fixed groups (Breakfast, Lunch, Dinner, Bakery, Drinks, Salad Bar) with crew-specific subgroups for further classification.
- **Tags** -- Crew-specific labels for cross-cutting categorization (e.g., "Quick & Easy", "Make Ahead", "Crowd Favorite").
- **Favorites** -- Per-user favorite tracking with a toggle button on recipe detail pages. Favorites appear in a dedicated section on the recipes home page.
- **Image-only mode** -- A special mode for recipes that are just a photo (e.g., a picture of a handwritten recipe card). Hides all structured fields and displays only the image.
- **Serving scaling** -- The `RecipeScaler` component lets users adjust serving counts and automatically recalculates ingredient quantities proportionally.
- **Print support** -- A print button that triggers the browser's print dialog with a print-optimized layout.
- **Recipe cloning** -- The `CloneRecipeButton` duplicates a recipe for adaptation, creating a new draft copy.
- **Featured recipes** -- A `featured` checkbox pins recipes to the top of their group and displays them in a highlighted section on the home page.
- **Difficulty levels** -- Recipes can be tagged with difficulty: Easy, Medium, Hard, or Expert.
- **Cooking metadata** -- Fields for servings, yield, prep time, cook time, rest time, temperature, portion size, and last cooked date.
- **Dietary and allergen tracking** -- Same dietary tags (Vegan, Vegetarian, Gluten-Free, etc.) and allergen warnings as inventory items.
- **Equipment list** -- An array of required equipment items.
- **Storage and make-ahead notes** -- Text fields for leftovers storage instructions, make-ahead/freezing notes, and scaling tips.
- **Recipe shopping list** -- Select multiple recipes to generate a consolidated ingredient shopping list with automatic quantity aggregation and serving size adjustments.

## Recipe Groups

Recipes are organized into six fixed groups:

| Group | Value | Description |
|---|---|---|
| Breakfast | `breakfast` | Morning meals |
| Lunch | `lunch` | Midday meals |
| Dinner | `dinner` | Evening meals |
| Bakery | `bakery` | Baked goods |
| Drinks | `drinks` | Beverages |
| Salad Bar | `salad_bar` | Salads and salad bar items |

Each group can have crew-specific **subgroups** (e.g., Breakfast > Pancakes & Waffles) and recipes can be tagged with crew-specific **tags** that span across groups.

## Recipe Statuses

| Status | Description |
|---|---|
| `published` | Visible to all crew members |
| `draft` | Visible only to editors and admins |

## Collections

The recipe system comprises four Payload CMS collections:

| Collection | Slug | Purpose |
|---|---|---|
| **Recipes** | `recipes` | Core recipe documents with all structured fields |
| **RecipeFavorites** | `recipe-favorites` | Per-user, crew-scoped favorite bookmarks |
| **RecipeSubGroups** | `recipe-subgroups` | Crew-specific subcategories within recipe groups |
| **RecipeTags** | `recipe-tags` | Crew-specific labels for filtering |

## Related Documentation

- [Data Model](./data-model.md) -- Entity relationships and field reference
- [Inventory Linking](./inventory-linking.md) -- How ingredients connect to inventory items
- [Favorites](./favorites.md) -- Per-user favorite bookmarks
- [Groups & Tags](./groups-and-tags.md) -- Organization and filtering
- [Frontend Pages](./frontend-pages.md) -- UI routes and components
- [Access Control](./access-control.md) -- Role-based permissions
