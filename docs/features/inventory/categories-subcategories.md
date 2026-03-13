---
sidebar_position: 4
title: "Categories & Subcategories"
---

# Categories & Subcategories

The inventory system uses a two-level category hierarchy to organize items. Categories and subcategories are **crew-specific** -- each crew defines its own organizational structure independently.

## Category Hierarchy

```
Category (e.g., "Produce")
  └── Subcategory (e.g., "Peppers")
  └── Subcategory (e.g., "Onions")
  └── Subcategory (e.g., "Leafy Greens")

Category (e.g., "Meat")
  └── Subcategory (e.g., "Chicken")
  └── Subcategory (e.g., "Beef")
```

Items reference both a category and an optional subcategory. On the items list page and shopping list, items are grouped and filtered by their category and subcategory.

## Category Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | text | Yes | Category name (max 100 chars), e.g., "Meat", "Produce", "Dairy", "Dry Goods" |
| `icon` | select | No | Visual icon displayed alongside the category name |
| `description` | textarea | No | Optional description (max 500 chars) |
| `crew` | relationship | Yes | The owning crew |
| `subCategories` | join | -- | Virtual join showing all subcategories under this category |

## Available Icons

Categories can display one of 20 icons to make visual identification easier:

| Icon | Value | Intended Use |
|---|---|---|
| Package | `Package` | Default / general |
| Apple | `Apple` | Produce |
| Beef | `Beef` | Meat |
| Fish | `Fish` | Seafood |
| Milk | `Milk` | Dairy |
| Egg | `Egg` | Eggs |
| Coffee | `Coffee` | Beverages |
| Wine | `Wine` | Beverages |
| Wheat | `Wheat` | Grains / Bread |
| Leaf | `Leaf` | Fresh / Organic |
| Flame | `Flame` | Spices / Hot |
| Droplets | `Droplets` | Liquids |
| Box | `Box` | Storage |
| Archive | `Archive` | Dry Storage |
| Layers | `Layers` | General |
| ChefHat | `ChefHat` | Kitchen |
| Utensils | `Utensils` | Food |
| ShoppingBag | `ShoppingBag` | Supplies |
| Wrench | `Wrench` | Equipment |
| Star | `Star` | Specialty |

## Subcategory Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | text | Yes | Subcategory name (max 100 chars), e.g., "Peppers", "Onions", "Chicken Breast" |
| `category` | relationship | Yes | Parent category |
| `crew` | relationship | Yes | Owning crew (must match parent category's crew) |

## Cross-Crew Validation

Subcategories include a `beforeChange` hook that validates the crew relationship:

1. The hook fetches the parent category document.
2. It compares the subcategory's `crew` with the parent category's `crew`.
3. If they do not match, the operation is rejected with the error: `"Sub-category crew must match the parent category crew."`

This prevents a subcategory from being created under a category belonging to a different crew, which could cause data isolation issues.

## Crew Auto-Stamping

Both categories and subcategories use the same crew-stamping pattern:

- **`beforeValidate`**: Stamps the `crew` field from the authenticated user's profile to prevent validation errors on create.
- **`beforeChange`**: Non-admin users are force-stamped to their own crew, preventing them from assigning categories to other crews.

For subcategories, if the user has no crew set, the hook falls back to inferring the crew from the parent category.

## How Items Are Classified

When creating or editing an inventory item, users can optionally select:

1. A **category** from the `inventory-categories` collection (filtered to their crew)
2. A **subcategory** from the `inventory-subcategories` collection (filtered to their crew)

These classifications are used for:

- **Filtering** on the items list page (filter by category and subcategory via URL query parameters)
- **Grouping** on the shopping list page (items grouped by category name)
- **Display** on the item detail page (category and subcategory shown in the details panel)

## Access Control

Category and subcategory management follows the inventory admin access pattern:

| Operation | Who Can Do It |
|---|---|
| **Create** | `admin`, `inventory_admin` |
| **Read** | `admin`, `inventory_admin`, `inventory_editor`, `inventory_viewer` (own crew) |
| **Update** | `admin`, `inventory_admin` |
| **Delete** | `admin`, `inventory_admin` |

The categories management page (`/inventory/categories`) is only accessible to users with admin or inventory_admin roles. It uses the `CategoryManager` client component for inline create, edit, and delete operations.
