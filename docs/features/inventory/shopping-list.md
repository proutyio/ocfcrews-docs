---
sidebar_position: 6
title: "Shopping List"
---

# Shopping List

The inventory shopping list (`/inventory/shopping-list`) is an auto-generated view that shows all items needing restocking, organized by category with calculated reorder quantities.

## How It Works

The shopping list page fetches all inventory items for the current crew and evaluates each against three conditions:

### Inclusion Criteria

Items appear on the shopping list when any of these conditions are met:

| Priority | Reason | Condition | Status Badge |
|---|---|---|---|
| 1 | **Out of Stock** | `currentAmount === 0` | Red "Out of Stock" |
| 2 | **Low Stock** | `currentAmount > 0` AND `lowStockThreshold > 0` AND `currentAmount <= lowStockThreshold` | Amber "Low Stock" |
| 3 | **Below Par** | `parLevel > 0` AND `currentAmount < parLevel` | Orange "Below Par" |

Items are sorted within each group by priority first (out of stock, then low, then below par), then by percentage remaining in ascending order (most depleted first).

### Reorder Quantity Calculation

The "To Order" column shows how much to buy:

```
if (reorderQuantity > 0)
  toOrder = reorderQuantity
else
  toOrder = fullAmount - currentAmount
```

Where `fullAmount = (parLevel > 0) ? parLevel : initialAmount`.

If `reorderQuantity` is configured on the item, that value is always used. Otherwise, the system calculates the amount needed to bring the item back to its par level (or initial amount if no par level is set).

## Page Layout

The shopping list is rendered as a single table with the following columns:

| Column | Description |
|---|---|
| **Item** | Package name, nickname, and subcategory name |
| **Current** | Current amount with unit (color-coded: red for out of stock, amber for low) |
| **Par** | Full stock target (`parLevel` or `initialAmount`) with unit |
| **To Order** | Calculated reorder quantity in green |
| **Use By** | Expiry date if set (hidden on mobile) |
| **Status** | Color-coded badge: Out of Stock, Low Stock, or Below Par |

### Category Grouping

Items are grouped by their category name, displayed as section headers within the table. Each category header shows the category name and item count. Categories are sorted alphabetically, with uncategorized items appearing last under an "Uncategorized" section.

## Data Fetching

The page server component:

1. Authenticates the user and retrieves their crew ID via `getInventoryContext()`
2. Fetches up to 500 items for the crew, sorted by `packageName`, with depth 2 to resolve category and subcategory names
3. Iterates through all items, evaluating each against the inclusion criteria
4. Groups qualifying items by category
5. Renders the table with category sections

## Summary Footer

At the bottom of the table, a summary shows:
- Total number of items needing restocking
- Count of out-of-stock items (if any)

## Empty State

When all items are well stocked (no items meet any inclusion criteria), the page displays a centered message: "All items are well stocked. Nothing needs to be ordered right now."

## Access

The shopping list is visible to all users with inventory access (admin, inventory_admin, inventory_editor, inventory_viewer). It appears in the InventoryNav sidebar and mobile tab navigation for all users.
