---
sidebar_position: 6
title: "Field-Level Access Control"
---

# Field-Level Access Control

Beyond collection-level access control, Payload CMS supports field-level access -- the ability to restrict who can `create`, `read`, or `update` individual fields within a document. OCFCrews uses this extensively to protect sensitive fields and enforce business rules.

## How Field-Level Access Works

Each field in a Payload collection can define an `access` object with up to three functions:

```typescript
{
  name: 'fieldName',
  type: 'text',
  access: {
    create: ({ req }) => boolean,  // Can this user set this field when creating?
    read: ({ req, doc }) => boolean,    // Can this user see this field?
    update: ({ req, doc }) => boolean,  // Can this user modify this field?
  },
}
```

**Key differences from collection-level access:**

- Field-level access functions return only **booleans** (not `Where` clauses).
- When a field's `read` access returns `false`, the field is omitted from the API response entirely -- the client never sees it.
- When a field's `create` or `update` access returns `false`, any value submitted for that field is silently ignored.

## Admin-Only Field Access

The most common field-level restriction: only users with the `admin` role can read or modify the field.

### adminOnlyFieldAccess

Defined in `/src/access/adminOnlyFieldAccess.ts`:

```typescript
export const adminOnlyFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (user) return checkRole(['admin'], user)
  return false
}
```

### Fields using adminOnlyFieldAccess

| Collection | Field | Operations | Purpose |
|---|---|---|---|
| `users` | `roles` | create, read, update | Prevents non-admins from seeing or changing role assignments |
| `users` | `photo` | create | Only admin can set photo during creation (users upload their own later) |
| `users` | `termsAcceptedAt` | create | Prevents clients from spoofing the timestamp (stamped server-side) |
| `users` | `crewRole` | create | Only admin can set crew role during user creation |
| `users` | `crewPassEligibility` | *(admin/site_manager/coordinator)* | Admin, site_manager, and coordinators can read and update |
| `users` | `tShirtSize` | create | Only admin can set during creation |
| `users` | `passStatus` | create | Only admin can set initial pass status (auto-initialized by hook) |
| `users` | `hoursPerYear` | create, update | Computed field -- nobody can write it directly |
| `users` | `lastVerificationEmailSentAt` | create, update | System field -- only readable by admin |
| `emails` | `fromAddress` | create, update | Only admin can override the sender email address |

## Inventory Field Access

### initialAmountFieldAccess

The `initialAmount` field on inventory items is protected so that only admin and inventory_admin roles can modify it. This prevents editors from changing the starting quantity after an item is created.

Defined in `/src/access/inventoryAccess.ts`:

```typescript
export const initialAmountFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (!user) return false
  return checkRole(['admin', 'inventory_admin'], user)
}
```

Usage on the `inventory-items` collection:

```typescript
{
  name: 'initialAmount',
  type: 'number',
  label: 'Initial Amount',
  required: true,
  access: {
    read: () => true,                    // Everyone with collection read access can see it
    create: ({ req: { user } }) => {
      if (!user) return false
      return checkRole(['admin', 'inventory_admin'], user)
    },
    update: initialAmountFieldAccess,    // Only admin/inventory_admin can change after creation
  },
},
```

This means:
- `inventory_editor` users can see the initial amount but cannot change it.
- `inventory_viewer` users can see it (read-only by collection access anyway).
- Only `admin` and `inventory_admin` can set it during creation or change it later.

## Read-Only / Computed Fields

Several fields are computed automatically and should never be directly written by users.

### Inventory Transactions: Audit Fields

```typescript
{
  name: 'quantityBefore',
  type: 'number',
  admin: {
    readOnly: true,
    description: 'Snapshot of currentAmount before this transaction. Set automatically.',
  },
},
{
  name: 'quantityAfter',
  type: 'number',
  admin: {
    readOnly: true,
    description: 'Resulting currentAmount after this transaction. Set automatically.',
  },
},
```

These fields are computed in the `beforeChange` hook from the current item's `currentAmount` and the transaction quantity. The `admin.readOnly: true` setting prevents editing in the admin panel, but does not enforce API-level restrictions. The immutability of these fields is enforced by the collection-level access control: transactions are immutable after creation (only admin can update).

### Inventory Items: totalCost

```typescript
{
  name: 'totalCost',
  type: 'number',
  admin: {
    readOnly: true,
    description: 'Auto-calculated: unit cost x current amount.',
  },
},
```

Computed in a `beforeChange` hook: `totalCost = itemCost * currentAmount`.

### Recipes: createdBy and updatedBy

```typescript
{
  name: 'createdBy',
  type: 'relationship',
  relationTo: 'users',
  admin: { readOnly: true, position: 'sidebar' },
},
{
  name: 'updatedBy',
  type: 'relationship',
  relationTo: 'users',
  admin: { readOnly: true, position: 'sidebar' },
},
```

These are auto-stamped in the `beforeChange` hook:

```typescript
({ data, req, operation }) => {
  if (!req.user) return data
  if (operation === 'create') data.createdBy = req.user.id
  data.updatedBy = req.user.id
  return data
},
```

### Users: hoursPerYear

```typescript
{
  name: 'hoursPerYear',
  type: 'array',
  admin: { readOnly: true },
  access: {
    create: () => false,   // Cannot be set during creation
    read: ({ req: { user }, doc }) => {
      if (!user) return false
      if (checkRole([...ADMIN_ROLES, 'crew_coordinator'], user)) return true
      // ADMIN_ROLES = ['admin', 'site_manager']
      return doc?.id === user.id  // Users can see their own hours
    },
    update: () => false,   // Cannot be directly updated
  },
},
```

This computed field is recalculated by the `recalcUserHours` function in `time-entries/index.ts` whenever a time entry is created, updated, or deleted. The `create: () => false` and `update: () => false` access ensures no one can directly write to this field through the API.

## Crew Role Field Access

The `crewRole` field has nuanced access control involving coordinators, the user being edited, and the "unassigned" crew:

### crewRoleFieldAccess

Defined in `/src/access/adminOrCrewCoordinator.ts`:

```typescript
export const crewRoleFieldAccess: FieldAccess = async ({ req: { user, payload }, doc }) => {
  if (!user) return false
  if (checkRole(['admin'], user)) return true

  // Site manager can update crewRole for any user
  if (checkRole(['site_manager'], user) && !checkRole(['crew_coordinator'], user)) return true

  if (checkRole(['crew_coordinator'], user)) {
    const userCrewId = /* extract crew ID from user */
    const docCrewId = /* extract crew ID from doc */

    if (!userCrewId) return false

    // Direct match: coordinator editing a member in their crew (but not themselves)
    if (docCrewId && String(userCrewId) === String(docCrewId)) {
      return user.id !== doc?.id  // Cannot change own crew role
    }

    // Adoption case: member is in the unassigned crew
    if (docCrewId) {
      const unassignedId = await getUnassignedCrewId(payload)
      if (unassignedId && String(docCrewId) === String(unassignedId)) {
        return true
      }
    }
  }

  return false
}
```

This function implements three important rules:

1. **Admins and site managers** can always update crew roles.
2. **Coordinators** can update crew roles for members of their own crew, but **not their own** crew role (prevents self-demotion/promotion).
3. **Coordinators** can set the crew role for users currently in the "unassigned" crew (the adoption workflow).

The unassigned crew ID is cached in a module-level variable to avoid repeated database lookups on every field-access evaluation.

## Name and Contact Field Access

The `nameOrContactFieldAccess` function controls who can update profile fields like `name`, `nickname`, `phone`, and `tShirtSize`:

```typescript
export const nameOrContactFieldAccess: FieldAccess = ({ req: { user }, doc }) => {
  if (!user) return false
  if (checkRole(ADMIN_ROLES, user)) return true  // ['admin', 'site_manager']

  // Self can update their own fields
  if (user.id === doc?.id) return true

  // Coordinator can update fields for members in their crew
  if (checkRole(['crew_coordinator'], user)) {
    const userCrewId = /* extract from user */
    const docCrewId = /* extract from doc */
    if (userCrewId && docCrewId && String(userCrewId) === String(docCrewId)) {
      return true
    }
  }

  return false
}
```

This allows:
- **Admins/site managers**: Can edit anyone's profile fields
- **Users themselves**: Can edit their own name, nickname, phone, t-shirt size
- **Coordinators**: Can edit these fields for members of their crew

## Pass Status Field Access

The `passStatus` array field uses a combination of array-level and sub-field-level access:

```typescript
// Array-level access
{
  name: 'passStatus',
  type: 'array',
  access: {
    create: adminOnlyFieldAccess,
    read: ({ req: { user }, doc }) => {
      if (!user) return false
      if (checkRole([...ADMIN_ROLES, 'crew_coordinator'], user)) return true
      // ADMIN_ROLES = ['admin', 'site_manager']
      return doc?.id === user.id  // Users can see their own pass status
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      return checkRole(['admin', 'crew_coordinator', 'crew_leader'], user)
    },
  },
  fields: [
    // Sub-field level: crewPassReceived and parkingPassReceived
    {
      name: 'crewPassReceived',
      type: 'checkbox',
      access: {
        update: ({ req: { user } }) => {
          if (!user) return false
          return checkRole(['admin', 'crew_coordinator'], user)  // Leaders cannot toggle
        },
      },
    },
    {
      name: 'parkingPassReceived',
      type: 'checkbox',
      access: {
        update: ({ req: { user } }) => {
          if (!user) return false
          return checkRole(['admin', 'crew_coordinator'], user)  // Leaders cannot toggle
        },
      },
    },
    // campingTagReceived has no sub-field access restriction
    // Leaders can update it via the parent array's update access
  ],
},
```

This creates a layered permission model:
- **Leaders** can update the `passStatus` array (parent-level access) but can only toggle `campingTagReceived` -- the `crewPassReceived` and `parkingPassReceived` sub-fields have their own access restrictions limiting updates to admin and coordinator.
- **Coordinators** can toggle all three checkboxes.
- **Users** can read their own pass status but cannot modify it.

## User Crew Field Access

The `crew` field on users has carefully controlled access:

```typescript
{
  name: 'crew',
  type: 'relationship',
  access: {
    create: ({ req: { user } }) => {
      if (!user) return false
      return checkRole([...ADMIN_ROLES, 'crew_coordinator'], user)
      // ADMIN_ROLES = ['admin', 'site_manager']
    },
    read: ({ req: { user } }) => !!user,  // Any authenticated user can see crew assignment
    update: ({ req: { user } }) => {
      if (!user) return false
      if (checkRole(['admin'], user)) return true
      return checkRole(['crew_coordinator'], user)
    },
  },
},
```

Additionally, a `beforeChange` hook prevents non-admin users from **removing** a crew assignment:

```typescript
({ data, req, operation, originalDoc }) => {
  const user = req.user
  if (!user || checkRole(['admin'], user)) return data
  if (
    operation === 'update' &&
    originalDoc?.crew &&
    (data.crew === null || data.crew === undefined)
  ) {
    data.crew = originalDoc.crew  // Restore the original crew
  }
  return data
},
```

## Summary Table

| Collection | Field | Create | Read | Update | Notes |
|---|---|---|---|---|---|
| `users` | `roles` | admin | admin | admin | Core role assignments |
| `users` | `crew` | admin/site_manager/coord | any user | admin/coord | Hook prevents crew removal |
| `users` | `crewRole` | admin | any user | admin/site_manager/coord* | *Coord cannot change own role |
| `users` | `photo` | admin | all | self/coord/admin | Upload restricted on create |
| `users` | `passStatus` | admin | self/coord/admin/site_manager | coord/leader/admin | Sub-fields restrict leaders |
| `users` | `hoursPerYear` | never | self/coord/admin/site_manager | never | Computed from time entries |
| `users` | `termsAcceptedAt` | admin | coord/admin/site_manager | admin/site_manager | Server-stamped on registration |
| `users` | `tShirtSize` | admin | self/coord/admin/site_manager | self/coord/admin/site_manager | Contact field pattern |
| `inventory-items` | `initialAmount` | admin/inv_admin | all | admin/inv_admin | Locked after creation for editors |
| `emails` | `fromAddress` | admin | all | admin | Prevents sender spoofing |
