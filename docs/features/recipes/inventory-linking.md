---
sidebar_position: 3
title: "Inventory Linking"
---

# Inventory Linking

Recipe ingredients can be linked to inventory items, creating a connection between what a recipe needs and what the crew has on hand. This linking enables stock-aware recipe views and shopping list generation.

## Dual-Mode Ingredient Entry

Each ingredient in a recipe supports two entry modes:

### 1. Inventory Item Link

When the `inventoryItem` relationship field is populated, the ingredient is linked to a tracked inventory item. The frontend uses a debounced autocomplete search to find items by name.

Benefits of linking:
- The recipe detail page shows real-time stock status indicators (in stock, low, out) next to each linked ingredient
- The recipe shopping list can aggregate quantities across multiple recipes
- Item name is pulled from the inventory record (using nickname if available, falling back to packageName)

### 2. Custom Item Name

When no inventory item is selected, the `customName` text field becomes required. This is used for items not tracked in the inventory system (e.g., "salt and pepper to taste", "fresh herbs from garden").

On the recipe shopping list, custom items are visually distinguished with an amber "Custom" badge, indicating they are not tracked in inventory.

## Ingredient Fields

Each ingredient entry captures:

| Field | Type | Purpose |
|---|---|---|
| `inventoryItem` | relationship | Link to `inventory-items` collection |
| `customName` | text | Fallback name when no inventory item is selected |
| `quantity` | number | Amount needed for the recipe |
| `unit` | select | Unit of measurement (18 options including `to_taste` and `as_needed`) |
| `preparation` | text | Preparation note (e.g., "finely chopped", "room temperature", "divided") |
| `optional` | checkbox | Whether this ingredient is optional |

## Validation

The `beforeChange` hook on the Recipes collection validates that every ingredient has either:
- An `inventoryItem` relationship selected, OR
- A non-empty `customName`

If neither is provided, the save is rejected with the error: "Each ingredient must have either an inventory item selected or a custom name."

## Stock Status on Recipe Detail

When an editor or admin views a recipe detail page, the system fetches stock information for all linked inventory items in a single batch query:

```typescript
const result = await payload.find({
  collection: 'inventory-items',
  where: { id: { in: itemIds } },
  limit: 200,
  depth: 0,
})
```

Each item is classified into a stock status:

| Status | Condition | Indicator |
|---|---|---|
| `in-stock` | `currentAmount > lowStockThreshold` | Green dot |
| `low` | `currentAmount > 0` AND `currentAmount < lowStockThreshold` | Amber dot |
| `out` | `currentAmount <= 0` | Red dot |

The `RecipeScaler` component displays these indicators next to each linked ingredient, providing at-a-glance stock awareness.

## Cost Estimation

For editors and admins, the recipe detail page calculates an estimated cost per batch by multiplying each linked ingredient's quantity by the inventory item's unit cost:

```
costEstimate = sum(ingredient.quantity * inventoryItem.currentCost)
```

This estimate is displayed below the ingredients list with a dollar sign icon.

## Recipe Shopping List

The recipe shopping list (`/recipes/shopping-list`) uses inventory linking to generate a consolidated ingredient list from selected recipes.

### How It Works

1. **Recipe selection**: Users check recipes from a grouped list (organized by recipe group).
2. **Serving adjustment**: Each selected recipe shows a serving size input, allowing users to scale ingredient quantities up or down.
3. **Quantity scaling**: Ingredient quantities are multiplied by the ratio `targetServings / originalServings`.
4. **Consolidation**: Ingredients are aggregated by their inventory item ID (or custom name for unlinked items). Quantities with matching units are summed.
5. **Special units**: Items with `to_taste` or `as_needed` units are shown separately as "as needed" without quantity summation.

### Display

The consolidated list shows:
- **Quantity and unit** for each ingredient (or "as needed" for special units)
- **Item name** (inventory nickname/packageName or custom name)
- **Optional flag** if all occurrences of that ingredient are optional
- **Custom badge** (amber) for ingredients not linked to inventory
- **Print button** for browser print output

### Unit Options

Recipe ingredients support 18 unit options:

| Unit | Display | Category |
|---|---|---|
| `lbs` | lbs | Weight |
| `oz` | oz | Weight |
| `kg` | kg | Weight |
| `g` | g | Weight |
| `cup` | cup | Volume |
| `tbsp` | tbsp | Volume |
| `tsp` | tsp | Volume |
| `fl_oz` | fl oz | Volume |
| `gallons` | gallons | Volume |
| `liters` | liters | Volume |
| `pinch` | pinch | Approximate |
| `clove` | clove | Count |
| `bunch` | bunch | Count |
| `units` | units | Count |
| `cases` | cases | Bulk |
| `bags` | bags | Bulk |
| `boxes` | boxes | Bulk |
| `to_taste` | to taste | Special |
| `as_needed` | as needed | Special |
