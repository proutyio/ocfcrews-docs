---
sidebar_position: 3
title: "Role System"
---

# Role System

OCFCrews implements a dual-layer role system: **global roles** stored directly on each user, and **crew roles** that represent a user's position within their crew. The two layers are synchronized automatically.

## Global Roles

Global roles are stored in the `users.roles` field as a multi-select array. Each user can have multiple roles simultaneously.

### Role Definitions

| Role | Value | Scope | Description |
|------|-------|-------|-------------|
| Admin | `admin` | Global | Full system access. Bypasses all access control checks. Can see and modify all data across all crews. |
| Site Manager | `site_manager` | Global | Global operational access. Can manage schedules, emails, crews, chat moderation, and users within constraints. Has admin panel access. |
| Editor | `editor` | Global | Content management access. Can manage pages (update only), posts, guides, media, and categories. No access to scheduling, email campaigns, user management, or other operational features. |
| Viewer | `viewer` | Global | Read-only access to the Payload admin panel. Limited write capabilities. |
| Crew Coordinator | `crew_coordinator` | Crew | Primary crew administrator. Manages crew members, schedules, and can adopt unassigned users. |
| Crew Elder | `crew_elder` | Crew | Senior crew member role. Currently has the same access as a regular crew member in most collections. |
| Crew Leader | `crew_leader` | Crew | Shift lead role. Can create and update schedules, remove members from positions and assign multiple members to a single position, create and manage crew posts (restricted to crew visibility), read crew availability and shift swaps, and update camping tag status for crew members. Cannot manage schedule positions or read all crew time entries. |
| Crew Member | `crew_member` | Crew | Standard crew member. Can view crew data, sign up for shifts, and log time entries. |
| Inventory Admin | `inventory_admin` | Domain | Full inventory management. Can create, update, and delete inventory items, categories, and transactions within their crew. |
| Inventory Editor | `inventory_editor` | Domain | Can create and update inventory items and log transactions, but cannot delete items or modify restricted fields like `initialAmount`. |
| Inventory Viewer | `inventory_viewer` | Domain | Read-only access to inventory data within their crew. |
| Shop Admin | `shop_admin` | Domain | Full shop management. Can manage products, orders, transactions, and shop settings. |
| Shop Editor | `shop_editor` | Domain | Can create and update shop products and manage orders. |
| Shop Viewer | `shop_viewer` | Domain | Read-only access to shop data. |
| Unassigned | `other` | Default | Default role assigned on registration. No crew-specific access. Users with only this role see minimal data. |

### Role Options (from source)

Defined in `/src/constants/roles.ts`:

```typescript
export const ROLE_OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'Site Manager', value: 'site_manager' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
  { label: 'Crew Coordinator', value: 'crew_coordinator' },
  { label: 'Crew Elder', value: 'crew_elder' },
  { label: 'Crew Leader', value: 'crew_leader' },
  { label: 'Crew Member', value: 'crew_member' },
  { label: 'Inventory Admin', value: 'inventory_admin' },
  { label: 'Inventory Editor', value: 'inventory_editor' },
  { label: 'Inventory Viewer', value: 'inventory_viewer' },
  { label: 'Shop Admin', value: 'shop_admin' },
  { label: 'Shop Editor', value: 'shop_editor' },
  { label: 'Shop Viewer', value: 'shop_viewer' },
  { label: 'Unassigned', value: 'other' },
] as const
```

## Crew Roles

Crew roles are stored in the `users.crewRole` field as a single select value. This represents the user's position within their crew.

### Crew Role Options

| Crew Role | Value | Maps to Global Role |
|-----------|-------|-------------------|
| Coordinator | `coordinator` | `crew_coordinator` |
| Elder | `elder` | `crew_elder` |
| Leader | `leader` | `crew_leader` |
| Member | `member` | `crew_member` |
| Unassigned | `other` | *(none -- crew global roles are removed)* |

### Crew Role Options (from source)

```typescript
export const CREW_ROLE_OPTIONS = [
  { label: 'Coordinator', value: 'coordinator' },
  { label: 'Elder', value: 'elder' },
  { label: 'Leader', value: 'leader' },
  { label: 'Member', value: 'member' },
  { label: 'Unassigned', value: 'other' },
] as const
```

## Crew Role to Global Role Sync

When a user's `crewRole` is changed, the corresponding global role is automatically synchronized via the `syncCrewRole` field hook on `users.crewRole`.

### Sync Mechanism

The `syncCrewRole` hook in `/src/collections/Users/hooks/syncCrewRole.ts`:

```typescript
export const syncCrewRole: FieldHook = ({ data, siblingData, value }) => {
  const newCrewRole = value ?? siblingData?.crewRole
  const currentRoles: string[] = siblingData?.roles ?? data?.roles ?? []

  // Remove all crew-related global roles
  const filteredRoles = currentRoles.filter(
    (r) => !(CREW_GLOBAL_ROLES as readonly string[]).includes(r)
  )

  // Add the new crew global role (if not 'other')
  const newGlobalRole = CREW_ROLE_TO_GLOBAL_ROLE[newCrewRole as string]
  if (newGlobalRole) {
    filteredRoles.push(newGlobalRole)
  }

  // Mutate sibling data so the roles field gets updated in the same save
  if (siblingData) {
    siblingData.roles = filteredRoles
  }

  return value
}
```

### How It Works

1. When `crewRole` changes (e.g., from `member` to `leader`), the hook fires.
2. All existing crew-related global roles (`crew_coordinator`, `crew_elder`, `crew_leader`, `crew_member`) are removed from the `roles` array.
3. The new corresponding global role is added (e.g., `crew_leader` for `leader`).
4. Non-crew roles (like `admin`, `inventory_admin`, etc.) are preserved.
5. The `roles` array is mutated on `siblingData` so both fields are saved in the same database write.

### Mapping Table

```typescript
export const CREW_ROLE_TO_GLOBAL_ROLE: Record<string, string> = {
  coordinator: 'crew_coordinator',
  elder: 'crew_elder',
  leader: 'crew_leader',
  member: 'crew_member',
}
```

The `other` crew role has no mapping -- when a user's crew role is set to `other`, all crew global roles are simply removed.

## Role Groups

Several role group constants are defined in `/src/constants/roles.ts` for convenience:

### Operational and Content Role Groups

```typescript
/** Admin + Site Manager: global operational access (schedules, emails, crews, chat moderation) */
export const ADMIN_ROLES = ['admin', 'site_manager'] as const

/** Admin + Editor + Site Manager: content management (pages, posts, guides, media) */
export const CONTENT_ROLES = ['admin', 'editor', 'site_manager'] as const

/** Admin + Site Manager + Coordinator: standard management (email campaigns, memberships) */
export const MANAGEMENT_ROLES = ['admin', 'site_manager', 'crew_coordinator'] as const

/** Admin + Site Manager + Coordinator + Leader: scheduling management */
export const SCHEDULING_ADMIN_ROLES = ['admin', 'site_manager', 'crew_coordinator', 'crew_leader'] as const

/** Admin + Site Manager + Coordinator: event management */
export const EVENT_MANAGEMENT_ROLES = ['admin', 'site_manager', 'crew_coordinator'] as const

/** Roles with Payload admin panel access */
export const ADMIN_PANEL_ROLES = ['admin', 'editor', 'site_manager', 'viewer'] as const
```

### Domain Role Groups

```typescript
/** Roles that grant access to inventory (read/write/view) */
export const INVENTORY_ROLES = ['inventory_admin', 'inventory_editor', 'inventory_viewer'] as const

/** Roles shown in the header nav for inventory link (includes admin) */
export const INVENTORY_HEADER_ROLES = ['admin', 'inventory_admin', 'inventory_editor'] as const

/** Roles shown in the header nav for recipe link */
export const RECIPE_HEADER_ROLES = ['admin', 'inventory_admin', 'inventory_editor'] as const

/** All shop management roles */
export const SHOP_ROLES = ['shop_admin', 'shop_editor', 'shop_viewer'] as const

/** Global roles that correspond to crew role assignments */
export const CREW_GLOBAL_ROLES = ['crew_coordinator', 'crew_elder', 'crew_leader', 'crew_member'] as const
```

## Role Capabilities Matrix

### System-Wide Operations

| Capability | admin | site_manager | editor | viewer | coordinator | leader | member | inv_admin | inv_editor | inv_viewer | other |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Access admin panel | Yes | Yes | Yes | Yes | -- | -- | -- | -- | -- | -- | -- |
| Create users | Yes | Yes | -- | -- | -- | -- | -- | -- | -- | -- | -- |
| Delete users | Yes | -- | -- | -- | -- | -- | -- | -- | -- | -- | -- |
| Manage globals | Yes | -- | -- | -- | -- | -- | -- | -- | -- | -- | -- |
| Manage pages (update) | Yes | Yes | Yes | -- | -- | -- | -- | -- | -- | -- | -- |
| Manage posts/guides/media | Yes | Yes | Yes | -- | -- | -- | -- | -- | -- | -- | -- |
| Manage email templates | Yes | Yes | -- | -- | -- | -- | -- | -- | -- | -- | -- |

### Crew Operations

| Capability | admin | site_manager | coordinator | leader | member |
|---|:---:|:---:|:---:|:---:|:---:|
| Read crew schedules | All | All | Own crew | Own crew | Own crew |
| Create schedules | Yes | Yes | Own crew | Own crew | -- |
| Update schedules | All | All | Own crew | Own crew | -- |
| Delete schedules | Yes | Yes | -- | -- | -- |
| Manage positions | Yes | Yes | Own crew | -- | -- |
| Remove members / multi-staff positions | Yes | Yes | Own crew | Own crew | -- |
| Create/update/delete posts | Yes | Yes | Own crew | Own crew (crew visibility only) | -- |
| Log time entries | Yes | Yes | Own crew | Own | Own |
| Read all crew time entries | Yes | Yes | Own crew | -- | -- |
| Read availability | Yes | Yes | Own crew | Own crew | Own |
| Read shift swaps | Yes | Yes | Own crew | Own crew | -- |
| Set crew roles | Yes | Yes | Own crew | -- | -- |
| Adopt unassigned users | Yes | Yes | Yes | -- | -- |

### Inventory Operations

| Capability | admin | inv_admin | inv_editor | inv_viewer |
|---|:---:|:---:|:---:|:---:|
| Read inventory | All | Own crew | Own crew | Own crew |
| Create items | All | Own crew | -- | -- |
| Update items | All | Own crew | Own crew | -- |
| Delete items | All | Own crew | -- | -- |
| Modify initialAmount | Yes | Yes | -- | -- |
| Log transactions | All | Own crew | Own crew | -- |
| Delete transactions | Yes | -- | -- | -- |

### Recipe Operations

| Capability | admin | inv_admin | inv_editor | Any crew member |
|---|:---:|:---:|:---:|:---:|
| Read recipes | All | Own crew | Own crew | Own crew |
| Create/update recipes | All | Own crew | Own crew | -- |
| Delete recipes | All | Own crew | -- | -- |

### Chat (PeachChat) Operations

| Capability | admin | site_manager | coordinator | elder / leader / member | unassigned |
|---|:---:|:---:|:---:|:---:|:---:|
| View channels | All | All | Own crew + global | Own crew + global | -- |
| Create channels | Yes | Yes | Own crew | -- | -- |
| Archive/unarchive channels | Yes | Yes | Own crew | -- | -- |
| Delete default channel | Yes | -- | -- | -- | -- |
| Send messages | Yes | Yes | Own crew channels | Own crew channels | -- |
| Edit own messages | Yes | -- | -- | Own messages | -- |
| Delete messages | Yes | Yes | Own crew | Own messages | -- |
| Pin/unpin messages | Yes | Yes | Own crew | -- | -- |
| React to messages | Yes | Yes | Own crew channels | Own crew channels | -- |
| Search messages | Yes | Yes | Own crew | Own crew | -- |
| Upload attachments | Yes | Yes | Own crew | Own crew | -- |
| Mute channels | Yes | Yes | Own channels | Own channels | -- |

## Role Storage and Access

The `roles` field on the `users` collection has strict field-level access control:

- **Create**: Admin only (`adminOnlyFieldAccess`)
- **Read**: Admin only (`adminOnlyFieldAccess`)
- **Update**: Admin only (`adminOnlyFieldAccess`)

This means regular users cannot see or modify their own roles. Only administrators can assign or change roles through the admin panel. The `crewRole` field has slightly more relaxed access, allowing coordinators to set crew roles for members of their crew.

### First User Bootstrap

The `ensureFirstUserIsAdmin` hook automatically grants the `admin` role to the very first user created in the system. This bootstrapping mechanism ensures there is always at least one admin who can manage the application.

### Admin Role Protection

A `beforeChange` hook on the `roles` field prevents non-admin users from assigning the `admin` role:

```typescript
({ value, req }) => {
  if (!req.user) return value // Public registration
  if (checkRole(['admin'], req.user)) return value
  return (value || []).filter((r: string) => r !== 'admin')
}
```
