---
sidebar_position: 7
title: "Inventory Categories"
---

# Inventory Categories

## Overview

The **Inventory Categories** collection provides top-level groupings for inventory items within a crew. Each category has a name, optional description, an icon for UI display, and is scoped to a single crew. Categories contain sub-categories (via a join) and are referenced by inventory items for organization and filtering.

**Source:** `src/collections/InventoryCategories/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `inventory-categories` |
| **Admin Group** | Inventory |
| **Use as Title** | `name` |
| **Default Columns** | name, crew, updatedAt |

## Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `name` | text | Yes | maxLength: 100 | Category name (e.g., Meat, Produce, Dairy, Dry Goods). |
| `crew` | relationship | Yes | Relation to `crews`, indexed | The crew this category belongs to. |
| `icon` | select | No | See options below | Icon displayed alongside the category name in the UI. |
| `description` | textarea | No | maxLength: 500 | Optional description of the category. |

### Icon Options

| Value | Label |
|---|---|
| `Package` | Package (Default) |
| `Apple` | Apple (Produce) |
| `Beef` | Beef (Meat) |
| `Fish` | Fish (Seafood) |
| `Milk` | Milk (Dairy) |
| `Egg` | Egg (Eggs) |
| `Coffee` | Coffee (Beverages) |
| `Wine` | Wine (Beverages) |
| `Wheat` | Wheat (Grains/Bread) |
| `Leaf` | Leaf (Fresh/Organic) |
| `Flame` | Flame (Spices/Hot) |
| `Droplets` | Droplets (Liquids) |
| `Box` | Box (Storage) |
| `Archive` | Archive (Dry Storage) |
| `Layers` | Layers (General) |
| `ChefHat` | ChefHat (Kitchen) |
| `Utensils` | Utensils (Food) |
| `ShoppingBag` | ShoppingBag (Supplies) |
| `Wrench` | Wrench (Equipment) |
| `Star` | Star (Specialty) |

### Joins

| Join Field | Collection | Foreign Key | Description |
|---|---|---|---|
| `subCategories` | `inventory-subcategories` | `category` | Sub-categories belonging to this category. |

## Access Control

| Operation | admin | inventory_admin | inventory_editor | inventory_viewer | All Others |
|---|---|---|---|---|---|
| **Create** | Yes | Own crew only | No | No | No |
| **Read** | All | Own crew only | Own crew only | Own crew only | No |
| **Update** | Yes | Own crew only | No | No | No |
| **Delete** | Yes | Own crew only | No | No | No |

Read access uses the `inventoryCrewAccess('crew')` helper, which grants access to all three inventory roles scoped to their crew.

Create, update, and delete use `inventoryAdminAccess`, which restricts to admin and inventory_admin only.

## Hooks

### `beforeValidate`

1. **Auto-stamp crew**: If the requesting user has a crew and no crew is set on the data, the user's crew ID is automatically assigned.

### `beforeChange`

1. **Force crew for non-admins**: Non-admin users always have the crew field stamped to their own crew ID, preventing cross-crew category creation or reassignment.

## Relationships

| Related Collection | Field | Direction | Description |
|---|---|---|---|
| `crews` | `crew` | Categories --> Crews | Owning crew |
| `inventory-subcategories` | `subCategories` | Subcategories --> Categories (join) | Child sub-categories |

Categories are referenced by `inventory-items` via `item.category`.

## Indexes

| Field | Type |
|---|---|
| `crew` | Standard |
