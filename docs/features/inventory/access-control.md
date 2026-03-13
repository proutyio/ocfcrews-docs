---
sidebar_position: 8
title: "Inventory Access Control"
---

# Inventory Access Control

The inventory system uses a layered access control model combining Payload CMS collection-level access, field-level access, and frontend route guards. All access functions are defined in `/src/access/inventoryAccess.ts`.

## Role Hierarchy

```
admin (system-wide)
  └── Full access to all inventory data across all crews

inventory_admin (crew-scoped)
  └── Full CRUD within own crew
  └── Can manage categories and subcategories
  └── Can create and delete items
  └── Can modify initialAmount field

inventory_editor (crew-scoped)
  └── Can create transactions (usage, waste, restock, adjustment)
  └── Can read and update items within own crew
  └── Cannot create or delete items
  └── Cannot modify initialAmount after creation
  └── Cannot manage categories

inventory_viewer (crew-scoped)
  └── Read-only access to own crew's data
  └── Cannot create transactions
  └── Cannot modify any data
```

## Access Functions

### `inventoryCrewAccess(crewField)`

**Purpose**: Collection-level read/write access for inventory collections.

**Parameters**: `crewField` -- the name of the field on the collection that holds the crew relationship (defaults to `'crew'`).

**Logic**:
- If no user: **denied**
- If user is `admin`: returns `true` (full access, all crews)
- If user has a crew and has any inventory role (`inventory_admin`, `inventory_editor`, `inventory_viewer`): returns a `Where` clause `{ [crewField]: { equals: crewId } }` to scope results to their crew
- Otherwise: **denied**

**Used by**: `InventoryCategories.read`, `InventorySubCategories.read`

### `inventoryAdminAccess`

**Purpose**: Collection-level access for create/delete operations.

**Logic**:
- If no user: **denied**
- If user is `admin`: returns `true`
- If user has a crew and is `inventory_admin`: returns `{ crew: { equals: crewId } }` (scoped to own crew)
- Otherwise: **denied** (inventory_editor and inventory_viewer cannot create or delete)

**Used by**: `InventoryItems.create`, `InventoryItems.delete`, `InventoryCategories.create/update/delete`, `InventorySubCategories.create/update/delete`

### `initialAmountFieldAccess`

**Purpose**: Field-level access for the `initialAmount` field on inventory items.

**Logic**:
- If no user: **denied**
- Returns `true` if user has `admin` or `inventory_admin` role
- Returns `false` for `inventory_editor` (they can see but not modify `initialAmount` after creation)

**Used by**: `InventoryItems.fields.initialAmount.access.update`

## Collection Access Matrix

### InventoryItems

| Operation | admin | inventory_admin | inventory_editor | inventory_viewer |
|---|---|---|---|---|
| **Create** | All | Own crew | No | No |
| **Read** | All | Own crew | Own crew | Own crew |
| **Update** | All | Own crew | Own crew | No |
| **Delete** | All | Own crew | No | No |

The `update` access for InventoryItems uses a custom inline function (not `inventoryAdminAccess`) that allows both `inventory_admin` and `inventory_editor` to update items within their crew.

### InventoryCategories

| Operation | admin | inventory_admin | inventory_editor | inventory_viewer |
|---|---|---|---|---|
| **Create** | All | Own crew | No | No |
| **Read** | All | Own crew | Own crew | Own crew |
| **Update** | All | Own crew | No | No |
| **Delete** | All | Own crew | No | No |

### InventorySubCategories

| Operation | admin | inventory_admin | inventory_editor | inventory_viewer |
|---|---|---|---|---|
| **Create** | All | Own crew | No | No |
| **Read** | All | Own crew | Own crew | Own crew |
| **Update** | All | Own crew | No | No |
| **Delete** | All | Own crew | No | No |

### InventoryTransactions

| Operation | admin | inventory_admin | inventory_editor | inventory_viewer |
|---|---|---|---|---|
| **Create** | Yes | Yes | Yes | No |
| **Read** | All | Own crew | Own crew | Own crew |
| **Update** | Yes | No | No | No |
| **Delete** | Yes | No | No | No |

Transactions use custom inline access functions. Note that transactions are designed as immutable records -- only admins can update or delete them.

## Crew Isolation

All inventory collections enforce crew isolation through two mechanisms:

### 1. Access Control Where Clauses

When a non-admin user reads data, the access function returns a `Where` clause like `{ crew: { equals: crewId } }`. Payload CMS automatically appends this to every query, ensuring users only see data belonging to their crew.

### 2. beforeChange Crew Stamping

Every collection includes `beforeChange` hooks that:
- Auto-set the `crew` field from the authenticated user's crew ID
- Prevent non-admin users from changing the `crew` field on existing documents
- Throw an error if a non-admin user attempts to assign data to a different crew

## Frontend Route Guards

The inventory layout (`/inventory/layout.tsx`) adds an additional layer of protection:

1. **Authentication check**: Redirects to `/login` if the user's session has expired
2. **Role check**: Verifies the user has one of the required roles (`admin`, `inventory_admin`, `inventory_editor`, `inventory_viewer`)
3. **Admin flag**: Passes an `isAdmin` prop (true for `admin` and `inventory_admin`) to the navigation, controlling which links are visible

Individual pages add further guards:
- The categories page redirects non-admin users back to the dashboard
- Item creation is restricted to admin roles via the "Add Item" button visibility
- The quick transaction form is hidden from viewers on the item detail page

## Role Constants

The inventory roles are defined as constants in `/src/constants/roles.ts`:

```typescript
/** Roles that grant access to inventory (read/write/view) */
export const INVENTORY_ROLES = [
  'inventory_admin',
  'inventory_editor',
  'inventory_viewer',
] as const

/** Roles shown in the header nav for inventory link (includes admin) */
export const INVENTORY_HEADER_ROLES = [
  'admin',
  'inventory_admin',
  'inventory_editor',
] as const
```

Note that `inventory_viewer` is not included in `INVENTORY_HEADER_ROLES`, meaning viewers do not see the inventory link in the main header navigation. They can still access inventory pages directly via URL if they have the viewer role.
