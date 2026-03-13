---
sidebar_position: 11
title: "Recipes"
---

# Recipes

## Overview

The **Recipes** collection stores crew recipes with full structured data including ingredients, instructions, cooking details, dietary tags, allergens, and more. Recipes support three modes: a full structured recipe with ingredients and steps, an "image-only" mode for photographed handwritten recipe cards, or a "PDF recipe" mode for uploaded PDF documents. Recipes are organized by group (Breakfast, Lunch, Dinner, etc.) and optional crew-defined sub-groups.

**Source:** `src/collections/Recipes/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `recipes` |
| **Admin Group** | Recipes |
| **Use as Title** | `name` |
| **Default Columns** | name, group, subGroup, status, featured, crew, updatedAt |

## Fields

### Identity

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `name` | text | Yes | minLength: 1, maxLength: 200 | Recipe name. |
| `description` | textarea | No | maxLength: 1000 | Recipe description. Hidden when `imageOnly` is true. |
| `source` | text | No | maxLength: 200 | Source or credit (e.g., "Chef Maria", "Adapted from AllRecipes"). Hidden when `imageOnly`. |

### Classification

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `group` | select | Yes | Indexed. Options: `breakfast`, `lunch`, `dinner`, `bakery`, `drinks`, `salad_bar` | Recipe group (meal category). |
| `subGroup` | relationship | No | Relation to `recipe-subgroups` | Optional crew-defined sub-category within the group. |
| `tags` | relationship (hasMany) | No | Relation to `recipe-tags` | Crew-defined labels for filtering (e.g., "Quick & Easy", "Make Ahead"). Hidden when `imageOnly`. |
| `featured` | checkbox | No | Default: `false` | Pin this recipe to the top of its group. |
| `status` | select | No | Indexed. Default: `published`. Options: `published`, `draft` | Publication status. |

### Visual

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `imageOnly` | checkbox | No | Default: `false` | Image-only recipe mode. Shows only the image (e.g., a photo of a handwritten recipe card). Hides all structured fields. |
| `pdfRecipe` | checkbox | No | Default: `false` | PDF recipe mode. Upload a PDF (e.g., a scanned recipe or formatted document). Hides all structured fields. |
| `pdf` | upload | No | Relation to `inventory-media` | Recipe PDF file. Only shown when `pdfRecipe` is true. |
| `imageType` | select | No | Default: `none`. Options: `none`, `icon`, `upload` | Choose between no image, an icon, or an uploaded photo. Hidden when `imageOnly`. |
| `icon` | select | No | See icon options below | Icon displayed on the recipe card. Shown when `imageType` is `icon`. |
| `image` | upload | No | Relation to `inventory-media` | Recipe photo. Shown when `imageOnly` is true or `imageType` is `upload`. |

#### Icon Options

`Utensils`, `ChefHat`, `Apple`, `Beef`, `Fish`, `Coffee`, `Wine`, `Wheat`, `Leaf`, `Flame`, `Egg`, `Milk`, `Droplets`, `Star`, `Layers`, `Archive`, `Package`

### Cooking Details

All cooking detail fields are hidden when `imageOnly` is true.

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `servings` | number | No | min: 1, step: 1 | Number of servings. |
| `yield` | text | No | maxLength: 100 | Yield description (e.g., "1 full tray", "24 cookies"). |
| `prepTime` | number | No | min: 0, step: 1 | Prep time in minutes. |
| `cookTime` | number | No | min: 0, step: 1 | Cook time in minutes. |
| `restTime` | number | No | min: 0, step: 1 | Rest, marinate, or cool time in minutes. |
| `temperature` | number | No | min: 0, step: 1 | Oven/grill/serving temperature. |
| `temperatureUnit` | select | No | Default: `F`. Options: `F`, `C` | Temperature unit (Fahrenheit or Celsius). |
| `portionSize` | text | No | maxLength: 100 | Portion size description (e.g., "1 cup", "1 burger"). |
| `lastCooked` | date | No | -- | When this recipe was last prepared. |
| `sortOrder` | number | No | Default: 0 | Sort order within sub-group. Lower numbers display first. |
| `difficulty` | select | No | Options: `easy`, `medium`, `hard`, `expert` | Difficulty level. |

### Dietary and Allergens

Hidden when `imageOnly` is true.

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `dietaryTags` | select (hasMany) | No | Options: `vegan`, `vegetarian`, `gluten_free`, `dairy_free`, `nut_free`, `kosher`, `halal` | Dietary classification tags. |
| `allergens` | select (hasMany) | No | Options: `tree_nuts`, `peanuts`, `dairy`, `gluten`, `shellfish`, `eggs`, `soy`, `fish` | Allergen warnings. |

### `ingredients` Array

Hidden when `imageOnly` is true. Max 200 rows.

| Sub-Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `inventoryItem` | relationship | No | Relation to `inventory-items` | Link to an inventory item. Leave blank to enter a custom name. |
| `customName` | text | No | maxLength: 200 | Custom item name. Required when no inventory item is selected. Shown conditionally. |
| `quantity` | number | No | min: 0, step: 0.01 | Amount needed. |
| `unit` | select | No | Options: `lbs`, `oz`, `kg`, `g`, `cup`, `tbsp`, `tsp`, `pinch`, `clove`, `bunch`, `units`, `fl_oz`, `gallons`, `liters`, `cases`, `bags`, `boxes`, `to_taste`, `as_needed` | Unit of measurement. |
| `preparation` | text | No | maxLength: 200 | Preparation note (e.g., "finely chopped", "room temperature"). |
| `optional` | checkbox | No | Default: `false` | Whether this ingredient is optional. |

### Instructions

Hidden when `imageOnly` is true.

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `instructionType` | select | No | Default: `steps`. Options: `steps`, `freeform` | Choose between numbered steps or freeform text. |
| `steps` | array | No | Max 200 rows. Each row has `step` (textarea, required, maxLength: 5000) | Numbered instruction steps. Shown when `instructionType` is `steps`. |
| `instructions` | textarea | No | maxLength: 10000 | Freeform instruction text. Shown when `instructionType` is `freeform`. |

### Notes and Extras

Hidden when `imageOnly` is true.

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `notes` | textarea | No | maxLength: 2000 | Chef's notes, substitutions, tips, and serving suggestions. |
| `equipment` | array | No | Max 50 rows. Each row has `item` (text, required, maxLength: 200) | Required equipment list (e.g., "12-inch cast iron skillet"). |
| `storage` | textarea | No | maxLength: 500 | How to store leftovers, shelf life. |
| `makeAhead` | textarea | No | maxLength: 500 | Make-ahead and freezing notes. |
| `scalingNotes` | textarea | No | maxLength: 500 | Tips for scaling up/down for large groups. |

### Ownership

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `crew` | relationship | Yes | Relation to `crews`, indexed | The crew this recipe belongs to. Only admins can change this. |
| `createdBy` | relationship | No | Relation to `users`, read-only, sidebar | User who created this recipe. Auto-stamped. |
| `updatedBy` | relationship | No | Relation to `users`, read-only, sidebar | User who last updated this recipe. Auto-stamped. |

## Access Control

| Operation | admin | inventory_admin | inventory_editor | Any crew member | Unauthenticated |
|---|---|---|---|---|---|
| **Create** | Yes | Own crew only | Own crew only | No | No |
| **Read** | All | Own crew only | Own crew only | Own crew only | No |
| **Update** | All | Own crew only | Own crew only | No | No |
| **Delete** | Yes | Own crew only | No | No | No |

- **Read**: Any authenticated user with a crew can read their own crew's recipes (`recipeReadAccess`).
- **Create/Update**: Requires `inventory_admin` or `inventory_editor` role, scoped to own crew (`recipeEditorAccess`).
- **Delete**: Requires `inventory_admin` role, scoped to own crew (`recipeAdminAccess`).

## Hooks

### `beforeValidate`

1. **Auto-stamp crew**: If the requesting user has a crew and no crew is set on the data, the user's crew ID is assigned.

### `beforeChange`

1. **Enforce crew isolation**: Non-admin users cannot change the crew assigned to an existing recipe. On update, if `data.crew` differs from the user's crew, throws `"You cannot change the crew assigned to this recipe."` The crew is always force-stamped for non-admins.

2. **Stamp createdBy / updatedBy**: On create, sets `createdBy` to the requesting user. On every save, sets `updatedBy` to the requesting user.

3. **Validate instructions and ingredients**:
   - **Instructions validation** (when not `imageOnly` and not `pdfRecipe`):
     - If `instructionType` is `steps`: requires at least one non-empty step. Throws `"Please add at least one step."`
     - If `instructionType` is `freeform`: requires non-empty `instructions` text. Throws `"Please add instructions."`
   - **Ingredients validation**: Each ingredient must have either an `inventoryItem` selected or a non-empty `customName`. Throws `"Each ingredient must have either an inventory item selected or a custom name."`

## Relationships

| Related Collection | Field | Direction | Description |
|---|---|---|---|
| `crews` | `crew` | Recipes --> Crews | Owning crew |
| `recipe-subgroups` | `subGroup` | Recipes --> Sub-Groups | Sub-group within recipe group |
| `recipe-tags` | `tags` | Recipes --> Tags | Filtering labels (hasMany) |
| `inventory-media` | `image` | Recipes --> Inventory Media | Recipe photo |
| `inventory-media` | `pdf` | Recipes --> Inventory Media | Recipe PDF |
| `inventory-items` | `ingredients[].inventoryItem` | Recipes --> Inventory Items | Linked inventory ingredients |
| `users` | `createdBy` | Recipes --> Users | Creator |
| `users` | `updatedBy` | Recipes --> Users | Last editor |

## Indexes

| Field | Type |
|---|---|
| `group` | Standard |
| `status` | Standard |
| `crew` | Standard |
