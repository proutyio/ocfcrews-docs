---
sidebar_position: 5
title: "Crew Isolation Deep Dive"
---

# Crew Isolation Deep Dive

This page provides a detailed technical walkthrough of how crew isolation works at both the access layer and the hook layer, with code examples from actual collections.

## Two Layers of Defense

Crew isolation is enforced through two complementary mechanisms:

1. **Access Layer**: Payload's access control functions return `Where` clauses that filter query results to the user's crew. This prevents users from even *seeing* data from other crews.
2. **Hook Layer**: `beforeValidate` and `beforeChange` hooks automatically stamp the `crew` field and block attempts to assign data to a different crew. This prevents users from *writing* data to other crews.

Both layers work together. The access layer is the primary defense, while the hook layer provides defense-in-depth against crafted API requests.

## Access Layer: How Crew Filtering Works

### Inventory Items Example

The `inventory-items` collection demonstrates the standard crew-scoped access pattern:

```typescript
access: {
  create: inventoryAdminAccess,
  read: ({ req: { user } }) => {
    if (!user) return false
    if (checkRole(['admin'], user)) return true
    const crewId = getUserCrewId(user)
    if (crewId && checkRole(['inventory_admin', 'inventory_editor', 'inventory_viewer'], user)) {
      return { crew: { equals: crewId } } as Where
    }
    return false
  },
  update: ({ req: { user } }) => {
    if (!user) return false
    if (checkRole(['admin'], user)) return true
    const crewId = getUserCrewId(user)
    if (crewId && checkRole(['inventory_admin', 'inventory_editor'], user)) {
      return { crew: { equals: crewId } } as Where
    }
    return false
  },
  delete: inventoryAdminAccess,
},
```

When an `inventory_editor` with `crewId = "abc123"` queries `GET /api/inventory-items`, Payload appends `{ crew: { equals: "abc123" } }` to the database query. The user only sees items belonging to their crew, regardless of what query parameters they include in their request.

### Reusable Factory: inventoryCrewAccess

The `inventoryCrewAccess` factory in `/src/access/inventoryAccess.ts` generates crew-scoped access functions:

```typescript
export const inventoryCrewAccess = (crewField = 'crew'): Access => {
  return ({ req: { user } }) => {
    if (!user) return false
    if (checkRole(['admin'], user)) return true
    const crewId = getUserCrewId(user)
    if (crewId && checkRole([...INVENTORY_ROLES], user)) {
      return { [crewField]: { equals: crewId } }
    }
    return false
  }
}
```

The `crewField` parameter makes it reusable across collections where the crew reference might have a different field name.

### Schedule Collection Example

```typescript
read: ({ req: { user } }) => {
  if (!user) return false
  if (checkRole(ADMIN_ROLES, user)) return true  // ['admin', 'site_manager']
  const crewId = getUserCrewId(user)
  if (crewId) {
    return { crew: { equals: crewId } } as Where
  }
  return false
},
```

For schedules, any authenticated user with a crew can read their crew's schedules. No special domain role (like `inventory_editor`) is required -- being a crew member is sufficient.

## Hook Layer: How Crew Stamping Works

### Standard Two-Hook Pattern

Every crew-scoped collection implements this two-hook pattern:

#### beforeValidate: Default Stamping

```typescript
beforeValidate: [
  ({ data, req }) => {
    if (!data || !req.user) return data
    const crewId = getUserCrewId(req.user)
    if (crewId && !data.crew) data.crew = crewId
    return data
  },
],
```

This runs **before** Payload's field validation. It stamps the crew from the authenticated user's profile only if no crew is already set. This prevents "Crew is required" validation errors when the frontend form does not include a crew field.

#### beforeChange: Force Stamping and Cross-Crew Block

```typescript
beforeChange: [
  ({ data, req }) => {
    if (!req.user || checkRole(['admin'], req.user)) return data
    const crewId = getUserCrewId(req.user)
    if (!crewId) return data
    if (data.crew && String(data.crew) !== String(crewId)) {
      throw new Error('You cannot create schedules for other crews.')
    }
    data.crew = crewId
    return data
  },
],
```

This runs **after** validation but **before** the database write. For non-admin users:
1. If the user tries to set a different crew ID, the hook throws an error.
2. The crew is always force-stamped from the user's profile, overriding any client-submitted value.
3. Admins bypass this hook entirely, allowing them to assign data to any crew.

### Inventory Items: Richer beforeChange

The `inventory-items` collection adds extra logic:

```typescript
beforeChange: [
  // 1. Stamp crew; block cross-crew changes
  ({ data, req, operation }) => {
    if (!req.user || checkRole(['admin'], req.user)) return data
    const crewId = getUserCrewId(req.user)
    if (!crewId) return data
    if (operation === 'update' && data.crew && String(data.crew) !== String(crewId)) {
      throw new Error('You cannot change the crew assigned to this inventory item.')
    }
    data.crew = crewId
    return data
  },
  // 2. Auto-calculate totalCost
  ({ data }) => {
    const cost = typeof data.itemCost === 'number' ? data.itemCost : 0
    const amount = typeof data.currentAmount === 'number' ? data.currentAmount : 0
    if (cost > 0 || amount > 0) {
      data.totalCost = parseFloat((cost * amount).toFixed(2))
    }
    return data
  },
],
```

The first hook specifically blocks **updates** that try to change an item's crew. A user cannot move an inventory item from their crew to another crew.

### Inventory Subcategories: Cross-Collection Crew Validation

The `inventory-subcategories` collection validates that the subcategory's crew matches the parent category's crew:

```typescript
beforeChange: [
  // Force-stamp crew
  ({ data, req }) => {
    if (!req.user || checkRole(['admin'], req.user)) return data
    const crewId = getUserCrewId(req.user as User)
    if (crewId) data.crew = crewId
    return data
  },
  // Validate crew matches parent category
  async ({ data, req }) => {
    if (!data.category) return data
    const categoryId = typeof data.category === 'object'
      ? (data.category as { id: string }).id
      : data.category
    const category = await req.payload.findByID({
      collection: 'inventory-categories',
      id: categoryId,
      depth: 0,
      overrideAccess: true,
    })
    const catCrewId = typeof category.crew === 'object' && category.crew !== null
      ? (category.crew as { id: string }).id
      : category.crew
    const dataCrew = typeof data.crew === 'object' && data.crew !== null
      ? (data.crew as { id: string }).id
      : data.crew
    if (catCrewId && dataCrew && String(catCrewId) !== String(dataCrew)) {
      throw new Error('Sub-category crew must match the parent category crew.')
    }
  },
],
```

This prevents orphaned data -- a subcategory cannot belong to a different crew than its parent category.

## Coordinator Extra Access

Crew coordinators receive special access that goes beyond regular crew isolation in the `users` collection.

### Seeing Unassigned Users

Coordinators can see all users with `crewRole === 'other'`, regardless of which crew those users are in:

```typescript
read: ({ req: { user } }) => {
  if (!user) return false
  if (checkRole(['admin'], user)) return true

  if (checkRole(['site_manager', 'viewer', 'crew_coordinator'], user)) {
    const crewId = getUserCrewId(user)
    const orConditions: Where[] = [{ id: { equals: user.id } }]
    if (crewId) {
      orConditions.push({ crew: { equals: crewId } })
    }
    // Coordinators and site managers also see all unassigned users
    if (checkRole(['site_manager', 'crew_coordinator'], user)) {
      orConditions.push({ crewRole: { equals: 'other' } })
    }
    return { or: orConditions } as Where
  }

  return { id: { equals: user.id } } as Where
},
```

This enables the "adoption" workflow where coordinators browse unassigned users and bring them into their crew.

### Adopting Unassigned Users

Coordinators can update unassigned users (to set their crew and crew role):

```typescript
update: ({ req: { user } }) => {
  if (!user) return false
  if (checkRole(['admin'], user)) return true

  if (checkRole(['site_manager', 'crew_coordinator'], user)) {
    const crewId = getUserCrewId(user)
    const orConditions: Where[] = [{ id: { equals: user.id } }]
    if (crewId) {
      orConditions.push({ crew: { equals: crewId } })
    }
    // Coordinators and site managers can also update unassigned users to adopt them
    if (checkRole(['site_manager', 'crew_coordinator'], user)) {
      orConditions.push({ crewRole: { equals: 'other' } })
    }
    return { or: orConditions } as Where
  }

  return { id: { equals: user.id } } as Where
},
```

When a coordinator saves changes to an unassigned user (setting their crew role), the `beforeChange` hook on the `users` collection forces the crew field to the coordinator's crew:

```typescript
({ data, req }) => {
  const user = req.user
  if (!user || checkRole(['admin'], user)) return data
  if (checkRole(['crew_coordinator'], user)) {
    const coordinatorCrewId = getUserCrewId(user)
    if (coordinatorCrewId) {
      data.crew = coordinatorCrewId
    }
  }
  return data
},
```

## The "Unassigned" Crew

The "unassigned" crew (with `slug: 'unassigned'`) is a special crew that serves as a holding area for new users who have not yet been assigned to a real crew. Key behaviors:

- **Auto-assignment on registration**: When a new user registers and no crew is explicitly set, the `beforeChange` hook looks up the unassigned crew by slug and assigns it:

  ```typescript
  async ({ data, req, operation }) => {
    if (operation !== 'create') return data
    if (data.crew) return data
    const result = await req.payload.find({
      collection: 'crews',
      where: { slug: { equals: 'unassigned' } },
      limit: 1,
      overrideAccess: true,
      select: {},
    })
    if (result.docs[0]) {
      data.crew = result.docs[0].id
    }
    return data
  },
  ```

- **Coordinator visibility**: Coordinators can see users in the unassigned crew via the `{ crewRole: { equals: 'other' } }` condition.
- **Adoption**: Coordinators can update unassigned users to bring them into their crew. The `crewRoleFieldAccess` function specifically checks for the unassigned crew to allow setting the crew role during adoption.

## Time Entries: User + Crew Isolation

The `time-entries` collection uses a hybrid isolation model. Regular members only see their own entries, while coordinators see all entries for their crew:

```typescript
read: ({ req: { user } }) => {
  if (!user) return false
  if (checkRole(ADMIN_ROLES, user)) return true  // ['admin', 'site_manager']
  if (checkRole(['crew_coordinator'], user)) {
    const crewVal = user.crew
    const crewId = typeof crewVal === 'object' && crewVal !== null ? crewVal.id : crewVal
    if (crewId) return { crew: { equals: crewId } } as Where
  }
  return { user: { equals: user.id } } as Where
},
```

Additionally, the `beforeChange` hook validates that a user is actually assigned to the linked shift before allowing them to create a time entry:

```typescript
async ({ data, req, operation }) => {
  if (operation !== 'create') return data
  if (!req.user || checkRole([...ADMIN_ROLES, 'crew_coordinator'], req.user)) return data
  if (!data.schedule) return data
  // ... fetch schedule and check assigned members ...
  if (!assigned.some((id) => String(id) === String(req.user!.id))) {
    throw new Error('You are not assigned to this shift.')
  }
},
```
