---
sidebar_position: 7
title: "Inventory Frontend"
---

# Inventory Frontend

The inventory frontend is built as a set of Next.js App Router pages under `/inventory`. All pages are server-rendered and protected by both middleware (cookie existence check) and a layout-level auth guard.

## Route Structure

| Route | Page Component | Description |
|---|---|---|
| `/inventory` | `InventoryDashboardPage` | Dashboard with KPI stat cards and analytics |
| `/inventory/items` | `InventoryItemsPage` | Browseable grid of all items with filters |
| `/inventory/items/new` | New item form | Create a new inventory item |
| `/inventory/items/[id]` | `InventoryItemDetailPage` | Item detail with stock level, transactions, and quick transaction form |
| `/inventory/items/[id]/edit` | Edit item form | Edit an existing inventory item |
| `/inventory/categories` | `InventoryCategoriesPage` | Category and subcategory management (admin only) |
| `/inventory/shopping-list` | `ShoppingListPage` | Auto-generated reorder list |

## Layout

The inventory layout (`/inventory/layout.tsx`) wraps all inventory pages and provides:

1. **Authentication**: Verifies the user's session via `payload.auth({ headers })`. Redirects to `/login` if the session has expired.
2. **Authorization**: Checks that the user has one of the required roles: `admin`, `inventory_admin`, `inventory_editor`, or `inventory_viewer`. Redirects to `/account` with a warning if not.
3. **Navigation**: Renders the `InventoryNav` component in two modes:
   - **Desktop sidebar** (hidden below `md` breakpoint): Vertical navigation in a `max-w-62` sidebar
   - **Mobile tab bar** (visible below `md`): Horizontal tab navigation with bottom border

## InventoryNav Component

The `InventoryNav` is a client component that renders navigation links based on the user's role:

**Links shown to all users:**
- Dashboard (`/inventory`)
- Items (`/inventory/items`)
- Shopping List (`/inventory/shopping-list`)

**Links shown only to admins (`isAdmin` prop):**
- Categories (`/inventory/categories`)

The active link is highlighted with an emerald accent color. The component supports both horizontal (mobile tabs) and vertical (desktop sidebar) layouts via the `horizontal` prop.

## Dashboard (`/inventory`)

The dashboard is a server component that fetches all crew items and recent transactions in parallel.

### KPI Stat Cards

Five cards displayed in a responsive grid (2 cols on mobile, 3 on tablet, 5 on desktop):

| Card | Icon | Color | Links To |
|---|---|---|---|
| Total Items | Package | Emerald | `/inventory/items` |
| Out of Stock | Ban | Red | `/inventory/shopping-list` |
| Running Low | AlertTriangle | Amber | `/inventory/shopping-list` |
| Expiring Soon | Clock | Orange | -- |
| Overstocked | TrendingUp | Blue | `/inventory/items` |

Each card has a colored gradient accent bar at the top.

### Analytics Cards

Seven cards in a 2-column grid on large screens:

1. **Usage Velocity** -- Top 6 items by consumption rate (units/week) over the last 30 days, with days-until-depleted estimates.
2. **Cost Breakdown** -- Inventory cost grouped by storage type (Frozen, Refrigerated, Fresh, Dry) with percentage bars and total valuation.
3. **Most Used** -- Top 5 items by usage quantity over the last 30 days, aggregated from `usage` type transactions.
4. **Waste Tracking** -- Top 5 most wasted items over the last 30 days, with an overall waste rate percentage (waste vs usage).
5. **Running Low** -- Up to 5 items below their `lowStockThreshold` with progress bars.
6. **Expiry Alerts** -- Items grouped by urgency (Expired, Expires Today, This Week, Next Week), with day-countdown badges.
7. **Out of Stock** -- Up to 5 items with zero stock, with a link to the shopping list for overflow.

## Items List (`/inventory/items`)

A filterable grid view of all inventory items.

### Page Header Controls

The items list page header includes:
- **`InventoryViewToggle`**: Toggles between card grid view and list (table row) view. The preference is stored via a `view` URL search parameter.
- **`BarcodeScanButton`**: Opens a barcode scanner to look up items by barcode.
- **Add Item button**: Shown only to admin users; links to the new item form.

### Filters

The `InventoryFilters` component provides:
- **Text search** across `packageName`, `nickname`, `brand`, `sku`, and `barcode`
- **Category** dropdown filter
- **Subcategory** dropdown filter
- **Storage type** filter (Frozen, Refrigerated, Fresh, Dry)
- **Dietary tag** filter
- **Location** dropdown filter (auto-populated from distinct location values)
- **Status** filter (Out of Stock, Running Low, Expiring Soon, Overstocked)

Filters are applied via URL search parameters for shareable, bookmarkable filtered views.

### Item Display

Items can be rendered in two views:
- **Card view** (default): `InventoryItemCard` components in a responsive grid (1-4 columns depending on screen width).
- **List view**: `InventoryItemRow` components in a table-style layout with a CSS grid header row.

The list is capped at 200 items with a truncation warning shown when the total exceeds this limit.

Admin users see an "Add Item" button in the page header.

## Item Detail (`/inventory/items/[id]`)

A comprehensive view of a single inventory item, split into a 3-column grid on large screens (`lg:grid-cols-3`): the left column (`lg:col-span-1`) for stock level and the right column (`lg:col-span-2`) for details and transactions.

### Left Column: Stock Level Panel

- Large current amount display with unit
- Stock progress bar (emerald/amber/blue based on status)
- Percentage and par level indicators
- Low stock threshold display
- **Lifetime stats**: Total received, used, and wasted (aggregated from all transactions)
- **Quick Transaction Form** (`QuickTransactionForm` component): Inline form for logging usage, waste, restock, or adjustment transactions. Hidden from viewers.

### Right Column: Details and Transactions

**Details panel:**
- Brand, supplier, SKU, barcode, storage location, shelf location
- Date received, use-by date, opened status
- Unit cost and total cost
- Donated badge
- Category and subcategory
- Dietary tags (emerald badges) and allergens (red badges)
- Notes

**Image:** Displayed with the `InventoryImageLightbox` component for full-size viewing.

**Status badges** shown in the header:
- Storage type (Frozen/Refrigerated/Fresh/Dry with icon)
- Out of Stock, Low Stock, Overstocked, Donated, Expired, Expiring Soon

**Recent Transactions table:**
- Shows the 20 most recent transactions
- Columns: Type (color-coded), Delta (green for positive, red for negative), After, Logged By, Date
- Date and user columns hidden on smaller screens

Admin and editor users see an "Edit" button linking to the edit form.

## Item Forms (`/inventory/items/new` and `/inventory/items/[id]/edit`)

Create and edit forms are restricted to admin and inventory_admin roles for creation, and admin/inventory_admin/inventory_editor for editing.

## Categories (`/inventory/categories`)

Restricted to admin and inventory_admin users. Renders the `CategoryManager` client component which provides inline CRUD for:
- Creating new categories (with name, icon, description)
- Creating subcategories under existing categories
- Editing category and subcategory names
- Deleting categories and subcategories

## Shopping List (`/inventory/shopping-list`)

See the [Shopping List](./shopping-list.md) documentation for details.

## Shared Utilities

### `getInventoryContext()`

A server-side helper used by all inventory pages that:
1. Authenticates the user via `payload.auth({ headers })`
2. Extracts the crew ID from the user profile
3. Determines role flags: `isAdmin`, `isEditor`, `isViewer`
4. Returns `{ payload, user, crewId, isAdmin, isEditor, isViewer }`
