---
sidebar_position: 5
title: "Access Control Matrix"
---

# Access Control Matrix

This page provides a complete breakdown of access control rules for every collection and global in OCFCrews. Access control is implemented at three levels: collection-level operations, field-level restrictions, and `Where` clause filters that scope query results.

## Understanding Access Control Returns

Payload CMS access control functions can return:

| Return Value | Meaning |
|-------------|---------|
| `true` | Full access (no filtering) |
| `false` | Access denied |
| `Where` clause | Access granted, but scoped to matching documents only |

For example, `{ crew: { equals: crewId } }` means "allow access, but only to documents where the `crew` field matches the user's crew ID."

## Roles Reference

| Role | Code | Scope |
|------|------|-------|
| Admin | `admin` | Full system access |
| Site Manager | `site_manager` | Global operational access (schedules, emails, crews, chat moderation, users) |
| Editor | `editor` | Content management only (pages, posts, guides, media, categories) |
| Viewer | `viewer` | Admin panel read access |
| Crew Coordinator | `crew_coordinator` | Own crew management |
| Crew Leader | `crew_leader` | Own crew shifts |
| Crew Member | `crew_member` | Self-service |
| Inventory Admin | `inventory_admin` | Full inventory (own crew) |
| Inventory Editor | `inventory_editor` | Create/update inventory (own crew) |
| Inventory Viewer | `inventory_viewer` | Read-only inventory (own crew) |
| Other | `other` | Default / unassigned |

## Core Collections

### Users

| Operation | Access Rule |
|-----------|------------|
| **Admin Panel** | `admin`, `site_manager`, `editor`, `viewer` |
| **Create** | `admin`, `site_manager` (always); public self-registration (unless `accountCreationDisabled`) |
| **Read** | `admin`: all users. `site_manager`, `viewer`, `crew_coordinator`: self + own crew members (Where clause). Coordinators also see unassigned users (`crewRole: 'other'`). Others: self only (Where clause). |
| **Update** | `admin`: all users. `site_manager`, `crew_coordinator`: self + own crew (Where clause). Coordinators can also update unassigned users. Others: self only (Where clause). |
| **Delete** | `admin` only |

**Field-Level Access:**

| Field | Create | Read | Update |
|-------|--------|------|--------|
| `roles` | admin only | admin only | admin only |
| `crew` | admin, site_manager, coordinator | all authenticated | admin; coordinators (own crew only) |
| `crewRole` | admin only | all authenticated | admin, site_manager; coordinators (own crew via `crewRoleFieldAccess`) |
| `phone`, `name`, `nickname` | - | - | admin, site_manager, coordinator, or self (`nameOrContactFieldAccess`) |
| `tShirtSize` | admin only | admin, site_manager, coordinator, or self | admin, site_manager, coordinator, or self |
| `photo` | admin only | all | admin, site_manager, coordinator, or self |
| `termsAcceptedAt` | admin only (server-stamped) | admin, site_manager, coordinator | admin, site_manager |
| `passStatus` | admin only | admin, site_manager, coordinator, or self | admin, coordinator, leader |
| `passStatus.crewPassReceived` | - | - | admin, coordinator only |
| `passStatus.parkingPassReceived` | - | - | admin, coordinator only |
| `hoursPerYear` | denied (auto-calculated) | admin, site_manager, coordinator, or self | denied (auto-calculated) |
| `lastVerificationEmailSentAt` | denied | admin only | denied |

### Crews

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin` only |
| **Read** | Public (all users, including unauthenticated) |
| **Update** | `admin`, `site_manager`: all crews. `crew_coordinator`: own crew only (Where clause `{ id: { equals: crewId } }`). |
| **Delete** | `admin` only |

### Schedules

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin`, `site_manager`, `crew_coordinator`, `crew_leader` |
| **Read** | `admin`, `site_manager`: all. Others with crew: own crew only (Where clause). |
| **Update** | `admin`, `site_manager`: all. `crew_coordinator`, `crew_leader`: own crew only (Where clause). |
| **Delete** | `admin`, `site_manager` only |

### Schedule Positions

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin`, `site_manager`, `crew_coordinator` |
| **Read** | `admin`, `site_manager`: all. Others with crew: own crew only (Where clause). |
| **Update** | `admin`, `site_manager`: all. `crew_coordinator`: own crew only (Where clause). |
| **Delete** | `admin`, `site_manager`: all. `crew_coordinator`: own crew only (Where clause). |

### Time Entries

| Operation | Access Rule |
|-----------|------------|
| **Create** | Any authenticated user |
| **Read** | `admin`, `site_manager`: all. `crew_coordinator`: own crew (Where clause). Others: own entries only (Where clause `{ user: { equals: user.id } }`). |
| **Update** | `admin`, `site_manager`: all. Others: own entries only (Where clause). |
| **Delete** | `admin` only |

### Posts

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin`, `site_manager`, `editor`, `crew_coordinator`, `crew_leader` |
| **Read** | Unauthenticated: `visibility: 'public'` only. `admin`, `site_manager`, `editor`: all. Others: public + all_crews (if not `other` role) + crew-specific (Where clause). |
| **Update** | `admin`, `site_manager`, `editor`: all. `crew_coordinator`, `crew_leader`: own crew only (Where clause). |
| **Delete** | `admin`, `site_manager`, `editor`: all. `crew_coordinator`, `crew_leader`: own crew only (Where clause). |

### Pages

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin` only |
| **Read** | `admin`, `site_manager`, `editor`, `viewer`: all (including drafts). Others: published only (Where clause `{ _status: { equals: 'published' } }`). |
| **Update** | `admin`, `site_manager`, `editor` |
| **Delete** | `admin`, `site_manager`, `editor` |

### Categories (Shop)

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin`, `site_manager`, `editor` |
| **Read** | Public (all users) |
| **Update** | `admin`, `site_manager`, `editor` |
| **Delete** | `admin`, `site_manager`, `editor` |

## Media Collections

### Media

| Operation | Access Rule |
|-----------|------------|
| **Create** | Any authenticated user |
| **Read** | Public (all users) |
| **Update** | `admin`, `site_manager`, `editor` |
| **Delete** | `admin`, `site_manager`, `editor` |

### Avatars

| Operation | Access Rule |
|-----------|------------|
| **Create** | Any authenticated user |
| **Read** | Public (all users) |
| **Update** | `admin` only |
| **Delete** | `admin` only |

### Inventory Media

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin`, `inventory_admin` |
| **Read** | `admin`: all. `inventory_admin`, `inventory_editor`, `inventory_viewer`: own crew (Where clause). |
| **Update** | `admin`: all. `inventory_admin`: own crew only (Where clause). |
| **Delete** | `admin` only |

## Email Collections

### Emails

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin`, `site_manager`, `crew_coordinator` |
| **Read** | `admin`, `site_manager`: all. `crew_coordinator`: own crew only (Where clause `{ specificCrew: { equals: crewId } }`). |
| **Update** | `admin`, `site_manager`: all. `crew_coordinator`: own crew only (Where clause). |
| **Delete** | `admin` only |

**Field-Level Access:**
- `fromAddress`: admin only (create + update)

### Email Templates

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin` only |
| **Read** | `admin`, `site_manager` |
| **Update** | `admin`, `site_manager` |
| **Delete** | `admin` only |

## Inventory Collections

### Inventory Items

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin`: all. `inventory_admin`: own crew (Where clause). |
| **Read** | `admin`: all. `inventory_admin`, `inventory_editor`, `inventory_viewer`: own crew (Where clause). |
| **Update** | `admin`: all. `inventory_admin`, `inventory_editor`: own crew (Where clause). |
| **Delete** | `admin`: all. `inventory_admin`: own crew (Where clause). |

**Field-Level Access:**
- `initialAmount` (create): `admin`, `inventory_admin` only
- `initialAmount` (update): `admin`, `inventory_admin` only (locked after creation for editors)

### Inventory Categories

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin`: all. `inventory_admin`: own crew. |
| **Read** | `admin`: all. Inventory roles: own crew (Where clause). |
| **Update** | `admin`: all. `inventory_admin`: own crew. |
| **Delete** | `admin`: all. `inventory_admin`: own crew. |

### Inventory Sub-Categories

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin`: all. `inventory_admin`: own crew. |
| **Read** | `admin`: all. Inventory roles: own crew (Where clause). |
| **Update** | `admin`: all. `inventory_admin`: own crew. |
| **Delete** | `admin`: all. `inventory_admin`: own crew. |

### Inventory Transactions

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin`, `inventory_admin`, `inventory_editor` |
| **Read** | `admin`: all. Inventory roles: own crew (Where clause). |
| **Update** | `admin` only (transactions are immutable audit records) |
| **Delete** | `admin` only |

## Recipe Collections

### Recipes

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin`: all. `inventory_admin`, `inventory_editor`: own crew (Where clause). |
| **Read** | `admin`: all. Any user with crew: own crew only (Where clause). |
| **Update** | `admin`: all. `inventory_admin`, `inventory_editor`: own crew (Where clause). |
| **Delete** | `admin`: all. `inventory_admin`: own crew only (Where clause). |

### Recipe Sub-Groups

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin`: all. `inventory_admin`, `inventory_editor`: own crew. |
| **Read** | `admin`: all. Any user with crew: own crew only. |
| **Update** | `admin`: all. `inventory_admin`, `inventory_editor`: own crew. |
| **Delete** | `admin`: all. `inventory_admin`: own crew only. |

### Recipe Tags

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin`: all. `inventory_admin`, `inventory_editor`: own crew. |
| **Read** | `admin`: all. Any user with crew: own crew only. |
| **Update** | `admin`: all. `inventory_admin`, `inventory_editor`: own crew. |
| **Delete** | `admin`: all. `inventory_admin`: own crew only. |

### Recipe Favorites

| Operation | Access Rule |
|-----------|------------|
| **Create** | Any authenticated user |
| **Read** | Own favorites only (Where clause `{ user: { equals: user.id } }`) |
| **Update** | Denied for all users |
| **Delete** | Own favorites only (Where clause) |

## Shop Collections (Ecommerce Plugin)

### Products

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin`, `crew_coordinator` |
| **Read** | Inherited from plugin defaults (published products visible) |
| **Update** | `admin`: all. `crew_coordinator`: own crew products (Where clause). |
| **Delete** | `admin`: all. `crew_coordinator`: own crew products (Where clause). |

### Orders

| Operation | Access Rule |
|-----------|------------|
| **Read** | `admin`: all. Others: own orders only (Where clause `{ customer: { equals: user.id } }`). |

### Transactions (Payment)

| Operation | Access Rule |
|-----------|------------|
| **Create** | Denied (created only via Stripe webhook) |
| **Read** | `admin`: all. Others: own transactions only. |
| **Update** | Denied (immutable) |
| **Delete** | Denied |

### Addresses

| Operation | Access Rule |
|-----------|------------|
| **Create** | Any authenticated user |
| **Read** | `admin`: all. Others: own addresses only. |
| **Update** | `admin`: all. Others: own addresses only. |
| **Delete** | `admin`: all. Others: own addresses only. |

### Carts

| Operation | Access Rule |
|-----------|------------|
| **Update** | Document owner only (`isDocumentOwner`) |

## Globals

### Header / Footer

| Operation | Access Rule |
|-----------|------------|
| **Read** | `admin` only |
| **Update** | `admin` only |

### Settings

| Operation | Access Rule |
|-----------|------------|
| **Read** | `admin` only |
| **Update** | `admin` only |

### Pass Settings

| Operation | Access Rule |
|-----------|------------|
| **Read** | `admin`, `site_manager`, `crew_coordinator` |
| **Update** | `admin` only |

## Form Builder Collections

### Forms

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin` only |
| **Update** | `admin` only |
| **Delete** | `admin` only |

### Form Submissions

| Operation | Access Rule |
|-----------|------------|
| **Create** | `admin` only |
| **Update** | `admin` only |
| **Delete** | `admin` only |

## Crew Isolation via beforeChange Hooks

Beyond access control functions, `beforeChange` hooks provide a second enforcement layer for crew isolation. These hooks run after access control passes but before the database write:

| Collection | Hook Behavior |
|-----------|---------------|
| Schedules | Throws error if `data.crew` does not match user's crew |
| Time Entries | Throws error if `data.crew` does not match user's crew; force-stamps crew from user |
| Inventory Items | Throws error on crew change (update); force-stamps crew on create |
| Inventory Categories | Force-stamps crew from user for non-admins |
| Inventory Sub-Categories | Force-stamps crew; validates sub-category crew matches parent category crew |
| Inventory Transactions | Force-stamps crew from user for non-admins |
| Recipes | Throws error on crew change; force-stamps crew |
| Recipe Sub-Groups | Force-stamps crew from user for non-admins |
| Recipe Tags | Force-stamps crew from user for non-admins |
| Inventory Media | Force-stamps crew from user for non-admins |
| Users | Coordinators forced to their own crew; prevents removing crew assignment |
| Emails | Coordinators locked to `specific_crew`; redirected from `all_users`/`all_crew_members` |
| Products | Coordinators forced to their own crew |
