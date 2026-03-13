---
sidebar_position: 5
title: "Low Stock Alerts"
---

# Low Stock Alerts

The inventory system provides automatic alerting when items fall below configurable thresholds. Alerts appear on the inventory dashboard and drive the shopping list.

## Threshold Fields

Each inventory item has three stock-level fields that control alerting behavior:

| Field | Description | Default |
|---|---|---|
| `lowStockThreshold` | Alert threshold. When `currentAmount` is at or below this value, the item appears as "Running Low" on the dashboard. | None (no alert) |
| `parLevel` | Target full-stock level. Used for the stock progress bar and "Below Par" detection on the shopping list. Falls back to `initialAmount` if not set. | None |
| `reorderQuantity` | Suggested quantity to order when restocking. Used on the shopping list's "To Order" column. | None |

## Stock Status Categories

The dashboard classifies every item into one of these statuses:

| Status | Condition | Dashboard Card | Color |
|---|---|---|---|
| **Out of Stock** | `currentAmount === 0` | Out of Stock card | Red |
| **Running Low** | `currentAmount > 0` AND `lowStockThreshold > 0` AND `currentAmount <= lowStockThreshold` | Running Low card | Amber |
| **Overstocked** | `currentAmount > parLevel` (or `currentAmount > initialAmount` if no parLevel) | Overstocked card | Blue |
| **Expiring Soon** | `useByDate` is within the next 14 days | Expiring Soon card | Orange |
| **Expired** | `useByDate` is in the past | Included in Expiring Soon count | Red |
| **Normal** | None of the above | Total Items card | Emerald |

## Dashboard Alerts

The inventory dashboard (`/inventory`) displays five KPI stat cards at the top:

1. **Total Items** -- Count of all items in the crew's inventory. Links to `/inventory/items`.
2. **Out of Stock** -- Count of items with `currentAmount === 0`. Links to the shopping list.
3. **Running Low** -- Count of items at or below their `lowStockThreshold`. Links to the shopping list.
4. **Expiring Soon** -- Combined count of expired items and items expiring within 14 days.
5. **Overstocked** -- Count of items exceeding their par level (or initial amount).

Below the stat cards, four analytics cards provide detail:

### Most Used (last 30 days)
Shows the top 5 most-used items by aggregating `usage` type transactions from the past 30 days. Displays the item name and total quantity used.

### Running Low
Lists up to 5 items that are running low, each with:
- Item name (linked to detail page)
- Current amount remaining
- A visual progress bar showing percentage of par/initial amount
- The threshold value

### Expiry Alerts
Shows up to 8 items with expiry concerns, sorted with expired items first:
- Item name
- Remaining quantity
- Days until expiry or "Expired" badge
- Color coding: red for expired or 3 days or less, orange for 4--14 days

### Out of Stock
Lists up to 5 out-of-stock items with their unit type. Shows a "more on shopping list" link if there are more than 5.

## Expiry Tracking with `useByDate`

The `useByDate` field is an indexed date field on inventory items. The dashboard queries all crew items and categorizes them:

- **Expired**: `useByDate < today` (today normalized to midnight)
- **Expiring Soon**: `today <= useByDate <= today + 14 days`

Items without a `useByDate` are not included in expiry alerts.

## Stock Progress Bar

On both the dashboard's Running Low card and the item detail page, a visual progress bar shows stock level:

```
fullAmount = (parLevel > 0) ? parLevel : initialAmount
percentage = min(round(currentAmount / fullAmount * 100), 100)
```

The bar color changes based on status:
- **Emerald**: Normal stock level
- **Amber**: Low stock (at or below threshold)
- **Blue**: Overstocked (above par/initial)

## How Alerts Drive the Shopping List

The [Shopping List](./shopping-list.md) page uses the same threshold logic to determine which items need restocking. Items appear on the shopping list when they are:

1. **Out of stock** (`currentAmount === 0`)
2. **Low stock** (`currentAmount <= lowStockThreshold`)
3. **Below par** (`currentAmount < parLevel` when parLevel is set)

The "To Order" quantity is calculated as:
- `reorderQuantity` if set and greater than 0
- Otherwise: `fullAmount - currentAmount` (difference to reach par/initial level)
