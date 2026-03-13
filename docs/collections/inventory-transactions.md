---
sidebar_position: 9
title: "Inventory Transactions"
---

# Inventory Transactions

## Overview

The **Inventory Transactions** collection is an immutable audit log of all quantity changes to inventory items. Each transaction records what item was affected, the type of change (restock, usage, waste, adjustment), the quantity delta, and before/after snapshots. Transactions automatically update the parent inventory item's `currentAmount` and `totalCost` on creation, and reverse those changes on deletion.

**Source:** `src/collections/InventoryTransactions/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `inventory-transactions` |
| **Admin Group** | Inventory |
| **Use as Title** | `type` |
| **Default Columns** | item, type, quantity, quantityAfter, user, createdAt |

## Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `item` | relationship | Yes | Relation to `inventory-items`, indexed | The inventory item affected by this transaction. |
| `crew` | relationship | Yes | Relation to `crews`, indexed | The crew this transaction belongs to. |
| `user` | relationship | No | Relation to `users`, indexed | User who created this transaction. Auto-stamped from authenticated user. |
| `type` | select | Yes | Options: `restock`, `usage`, `waste`, `adjustment` | The type of quantity change. |
| `quantity` | number | Yes | min: -99999, max: 99999, step: 0.01 | Quantity delta. For usage/waste: enter positive (auto-negated). For restock/adjustment: positive = add, negative = remove. |
| `quantityBefore` | number | No | Read-only, step: 0.01 | Snapshot of `currentAmount` before this transaction. Set automatically. |
| `quantityAfter` | number | No | Read-only, step: 0.01 | Resulting `currentAmount` after this transaction. Set automatically. |
| `notes` | textarea | No | maxLength: 1000 | Optional notes about this transaction. |

### Transaction Type Behavior

| Type | Input | Stored Delta | Effect |
|---|---|---|---|
| `restock` | Positive number | Positive (as-is) | Adds to current amount |
| `usage` | Positive number | Negative (auto-negated) | Subtracts from current amount |
| `waste` | Positive number | Negative (auto-negated) | Subtracts from current amount |
| `adjustment` | Positive or negative | As-is | Adds or subtracts depending on sign |

## Access Control

| Operation | admin | inventory_admin | inventory_editor | inventory_viewer | All Others |
|---|---|---|---|---|---|
| **Create** | Yes | Yes | Yes | No | No |
| **Read** | All | Own crew only | Own crew only | Own crew only | No |
| **Update** | Yes | No | No | No | No |
| **Delete** | Yes | No | No | No | No |

Transactions are treated as **immutable audit records**. Only system administrators can update or delete them. This ensures a reliable audit trail of all inventory changes.

## Hooks

### `beforeValidate`

1. **Auto-stamp crew from user**: If the requesting user has a crew and no crew is set on the data, the user's crew ID is assigned.

2. **Infer crew from item**: If crew is still unset, the hook fetches the linked inventory item and copies its crew ID. The fetched item is cached on `req.context.__txnItem` for reuse in `beforeChange` to avoid duplicate database lookups.

### `beforeChange`

1. **Force crew and user stamps**: Non-admin users have crew force-stamped. The `user` field is auto-set to `req.user.id` if not already populated.

2. **Capture quantity snapshots and compute delta** (create only):
   - Fetches the inventory item (or reuses the cached version from `beforeValidate`)
   - Records `quantityBefore` from the item's current `currentAmount`
   - Normalizes the quantity to a signed delta:
     - `usage` and `waste`: quantity is negated (user enters positive, stored as negative)
     - `restock` and `adjustment`: stored as-is
   - Computes `quantityAfter = quantityBefore + delta`
   - **Validates stock sufficiency**: If `quantityAfter < 0`, throws `"Insufficient stock: this transaction would reduce the quantity below zero (current: X, change: Y)."`

### `afterChange`

1. **Update inventory item amount** (create only): Calls `updateItemAmount()` to set the inventory item's `currentAmount` to `quantityAfter` and recalculate `totalCost = itemCost * currentAmount`. If `quantityAfter` is null (indicating a `beforeChange` error), the update is skipped and an error is logged rather than zeroing out the item.

### `afterDelete`

1. **Reverse transaction**: Restores the inventory item's `currentAmount` to `quantityBefore`, effectively undoing the transaction. Also recalculates `totalCost`.

## Helper Function: `updateItemAmount`

This utility function (defined in the same file):
1. Fetches the inventory item by ID
2. Reads the item's `itemCost`
3. Sets `currentAmount` to `max(0, newAmount)` (clamps to zero)
4. Recalculates `totalCost = itemCost * currentAmount` (rounded to 2 decimal places)
5. Updates the item with `overrideAccess: true`

Errors are logged and re-thrown to ensure the calling hook fails visibly rather than silently desyncing.

## Relationships

| Related Collection | Field | Direction | Description |
|---|---|---|---|
| `inventory-items` | `item` | Transactions --> Items | The affected inventory item |
| `crews` | `crew` | Transactions --> Crews | Owning crew |
| `users` | `user` | Transactions --> Users | User who logged the transaction |

## Indexes

| Field | Type |
|---|---|
| `item` | Standard |
| `crew` | Standard |
| `user` | Standard |
