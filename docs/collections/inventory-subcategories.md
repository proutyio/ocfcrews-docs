---
sidebar_position: 8
title: "Inventory Subcategories"
---

# Inventory Subcategories

## Overview

The **Inventory Subcategories** collection provides a second level of categorization for inventory items, nested under a parent `inventory-categories` document. Each sub-category must belong to both a parent category and a crew, and the crew must match between the sub-category and its parent category.

**Source:** `src/collections/InventorySubCategories/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `inventory-subcategories` |
| **Admin Group** | Inventory |
| **Use as Title** | `name` |
| **Default Columns** | name, category, crew, updatedAt |

## Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `name` | text | Yes | maxLength: 100 | Sub-category name (e.g., Peppers, Onions, Chicken Breast). |
| `category` | relationship | Yes | Relation to `inventory-categories`, indexed | Parent category this sub-category belongs to. |
| `crew` | relationship | Yes | Relation to `crews`, indexed | The crew this sub-category belongs to. Must match the parent category's crew. |

## Access Control

| Operation | admin | inventory_admin | inventory_editor | inventory_viewer | All Others |
|---|---|---|---|---|---|
| **Create** | Yes | Own crew only | No | No | No |
| **Read** | All | Own crew only | Own crew only | Own crew only | No |
| **Update** | Yes | Own crew only | No | No | No |
| **Delete** | Yes | Own crew only | No | No | No |

Uses the same `inventoryAdminAccess` and `inventoryCrewAccess` helpers as `inventory-categories`.

## Hooks

### `beforeValidate`

1. **Auto-stamp crew from user**: If the requesting user has a crew and no crew is set on the data, the user's crew ID is assigned.

2. **Infer crew from parent category**: If crew is still unset (e.g., for admins without a crew), the hook fetches the parent category and copies its crew ID. This ensures the crew field is always populated before Payload's required-field validation runs. The fetched category is cached on `req.context` for reuse in `beforeChange`.

### `beforeChange`

1. **Force crew for non-admins**: Non-admin users always have the crew field stamped to their own crew ID.

2. **Validate crew matches parent category**: The hook fetches the parent category (or uses the cached version) and verifies that the sub-category's crew matches the parent category's crew. Throws `"Sub-category crew must match the parent category crew."` if there is a mismatch. If the category lookup fails entirely, throws `"Could not verify parent category. Please try again."`.

## Relationships

| Related Collection | Field | Direction | Description |
|---|---|---|---|
| `inventory-categories` | `category` | Subcategories --> Categories | Parent category |
| `crews` | `crew` | Subcategories --> Crews | Owning crew |

Subcategories are referenced by `inventory-items` via `item.subCategory`.

## Indexes

| Field | Type |
|---|---|
| `category` | Standard |
| `crew` | Standard |
