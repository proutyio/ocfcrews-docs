---
sidebar_position: 6
title: "Inventory Items"
---

# Inventory Items

## Overview

The **Inventory Items** collection tracks physical goods managed by each crew -- food, supplies, equipment, and other consumables. Each item includes detailed tracking for quantities, costs, storage, dietary information, allergens, and expiration dates. Items are categorized via relationships to `inventory-categories` and `inventory-subcategories`, and their quantities are updated automatically through `inventory-transactions`.

**Source:** `src/collections/InventoryItems/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `inventory-items` |
| **Admin Group** | Inventory |
| **Use as Title** | `packageName` |
| **Default Columns** | packageName, category, currentAmount, unit, storageType, crew, updatedAt |

## Fields

### Identity

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `image` | upload | No | Relation to `inventory-media` | Item image. Sidebar position. |
| `packageName` | text | Yes | minLength: 1, maxLength: 200 | Full product name as it appears on the label. |
| `nickname` | text | No | minLength: 1, maxLength: 200 | Short informal name used by the crew. |
| `sku` | text | No | maxLength: 100 | Stock-keeping unit identifier. |
| `barcode` | text | No | maxLength: 128, indexed | UPC, EAN, or other barcode value. Scan or enter manually. Unique within crew (enforced by hook). |
| `brand` | text | No | maxLength: 100 | Brand name. |
| `supplier` | text | No | maxLength: 200 | Supplier or vendor name. |
| `donated` | checkbox | No | Default: `false` | Whether this item was donated rather than purchased. |

### Storage

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `storageType` | select | Yes | Indexed. Options: `frozen`, `refrigerated`, `fresh`, `dry` | How this item should be stored. |
| `location` | text | No | maxLength: 200 | Physical storage location (e.g., "Walk-in cooler shelf 3"). |
| `shelfLocation` | text | No | maxLength: 100, indexed | Specific shelf or bin (e.g., "Shelf 3", "Bin A2", "Rack B-top"). |

### Dates

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `dateReceived` | date | No | Day-only picker (MM/dd/yyyy) | When the item was received. |
| `useByDate` | date | No | Indexed, day-only picker (MM/dd/yyyy) | Expiration date. Used to flag expiring items on the dashboard. |
| `openedOn` | date | No | Day-only picker (MM/dd/yyyy) | When the item was first opened. |
| `openedAmount` | number | No | min: 0, step: 0.01 | How many units have been opened/in-use. |

### Quantity

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `unit` | select | Yes | Options: `lbs`, `oz`, `kg`, `g`, `units`, `cases`, `gallons`, `liters`, `fl_oz`, `bags`, `boxes` | Unit of measurement. |
| `initialAmount` | number | Yes | min: 0, step: 0.01 | Starting quantity when first received. Locked after creation for editors. |
| `currentAmount` | number | Yes | min: 0, step: 0.01 | Current quantity on hand. Updated automatically by transactions. |
| `lowStockThreshold` | number | No | min: 0, step: 0.01 | Alert threshold -- dashboard warning when `currentAmount` falls at or below this value. |
| `reorderQuantity` | number | No | min: 0, step: 0.01 | Suggested quantity to order when restocking. |
| `parLevel` | number | No | min: 0, step: 0.01 | Target full-stock level for progress bar display. Falls back to `initialAmount` if not set. |

### Cost

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `itemCost` | number | No | min: 0, step: 0.01 | Cost per unit in dollars. |
| `totalCost` | number | No | Read-only, step: 0.01 | Auto-calculated: `itemCost * currentAmount`. |

### Dietary and Allergens

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `dietaryTags` | select (hasMany) | No | Options: `vegan`, `vegetarian`, `gluten_free`, `dairy_free`, `nut_free`, `kosher`, `halal` | Dietary classification tags. |
| `allergens` | select (hasMany) | No | Options: `tree_nuts`, `peanuts`, `dairy`, `gluten`, `shellfish`, `eggs`, `soy`, `fish` | Allergen warnings. |

### Other

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `notes` | textarea | No | maxLength: 2000 | Free-form notes. |
| `category` | relationship | No | Relation to `inventory-categories`, indexed | Primary category. |
| `subCategory` | relationship | No | Relation to `inventory-subcategories`, indexed | Sub-category within the primary category. |
| `crew` | relationship | Yes | Relation to `crews`, indexed | The crew that owns this inventory item. |

## Access Control

| Operation | admin | inventory_admin | inventory_editor | inventory_viewer | All Others |
|---|---|---|---|---|---|
| **Create** | Yes | Own crew only | No | No | No |
| **Read** | All | Own crew only | Own crew only | Own crew only | No |
| **Update** | All | Own crew only | Own crew only | No | No |
| **Delete** | Yes | Own crew only | No | No | No |

### Field-Level Access

| Field | Create | Read | Update |
|---|---|---|---|
| `initialAmount` | admin, inventory_admin | Everyone | admin, inventory_admin only |

## Hooks

### `beforeValidate`

1. **Auto-stamp crew**: If the requesting user has a crew and no crew is set on the data, the user's crew ID is automatically assigned. Runs before Payload's required-field validation to prevent "Crew is required" errors.

### `beforeChange`

1. **Enforce crew isolation**: Non-admin users cannot change the crew assigned to an existing inventory item. On update, if `data.crew` differs from the user's crew, throws `"You cannot change the crew assigned to this inventory item."` The crew is always force-stamped for non-admins.

2. **Validate barcode uniqueness within crew**: If a barcode is provided, queries for existing items in the same crew with the same barcode. If a duplicate is found (excluding the current document on update), throws `"Barcode "<value>" is already assigned to "<packageName>"."`.

3. **Auto-calculate totalCost**: Computes `totalCost = itemCost * currentAmount` on every save, rounding to 2 decimal places.

## Relationships

| Related Collection | Field | Direction | Description |
|---|---|---|---|
| `inventory-media` | `image` | Items --> Inventory Media | Item photo |
| `inventory-categories` | `category` | Items --> Categories | Primary category |
| `inventory-subcategories` | `subCategory` | Items --> Subcategories | Sub-category |
| `crews` | `crew` | Items --> Crews | Owning crew |

## Indexes

| Field | Type |
|---|---|
| `barcode` | Standard |
| `storageType` | Standard |
| `shelfLocation` | Standard |
| `useByDate` | Standard |
| `category` | Standard |
| `subCategory` | Standard |
| `crew` | Standard |
