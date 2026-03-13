---
sidebar_position: 4
title: "Collection Relationships"
---

# Collection Relationships

This page documents every relationship between collections in the OCFCrews data model.

## Direct Relationships

Direct relationships use Payload's `type: 'relationship'` field, which stores a document ID (or array of IDs for `hasMany`) referencing another collection.

| Source Collection | Field | Target Collection | Cardinality | Description |
|---|---|---|---|---|
| `users` | `crew` | `crews` | Many-to-One | The crew a user belongs to |
| `users` | `photo` | `avatars` | Many-to-One | User's profile photo |
| `crews` | `coordinators` | `users` | Many-to-Many | Designated coordinators for the crew |
| `crews` | `image` | `media` | Many-to-One | Crew profile/banner image |
| `schedules` | `crew` | `crews` | Many-to-One | The crew this schedule belongs to |
| `schedules` | `leads` | `users` | Many-to-Many | Users designated as shift leads |
| `schedules` | `positions[].position` | `schedule-positions` | Many-to-One | Named position within the shift |
| `schedules` | `positions[].assignedMembers` | `users` | Many-to-Many | Members signed up for a position |
| `schedule-positions` | `crew` | `crews` | Many-to-One | The crew this position belongs to |
| `time-entries` | `user` | `users` | Many-to-One | The user who worked |
| `time-entries` | `schedule` | `schedules` | Many-to-One | Optional link to the shift worked |
| `time-entries` | `crew` | `crews` | Many-to-One | The crew this entry belongs to |
| `inventory-items` | `crew` | `crews` | Many-to-One | Owning crew |
| `inventory-items` | `category` | `inventory-categories` | Many-to-One | Item's category |
| `inventory-items` | `subCategory` | `inventory-subcategories` | Many-to-One | Item's sub-category |
| `inventory-items` | `image` | `inventory-media` | Many-to-One | Item photo |
| `inventory-categories` | `crew` | `crews` | Many-to-One | Owning crew |
| `inventory-subcategories` | `category` | `inventory-categories` | Many-to-One | Parent category |
| `inventory-subcategories` | `crew` | `crews` | Many-to-One | Owning crew |
| `inventory-transactions` | `item` | `inventory-items` | Many-to-One | The item affected |
| `inventory-transactions` | `crew` | `crews` | Many-to-One | Owning crew |
| `inventory-transactions` | `user` | `users` | Many-to-One | User who logged the transaction |
| `inventory-media` | `crew` | `crews` | Many-to-One | Owning crew (optional) |
| `recipes` | `crew` | `crews` | Many-to-One | Owning crew |
| `recipes` | `subGroup` | `recipe-subgroups` | Many-to-One | Recipe sub-group classification |
| `recipes` | `tags` | `recipe-tags` | Many-to-Many | Crew-defined tags |
| `recipes` | `image` | `inventory-media` | Many-to-One | Recipe photo |
| `recipes` | `createdBy` | `users` | Many-to-One | Auto-stamped creator |
| `recipes` | `updatedBy` | `users` | Many-to-One | Auto-stamped last editor |
| `recipes` | `ingredients[].inventoryItem` | `inventory-items` | Many-to-One | Linked inventory item (optional per ingredient) |
| `recipe-favorites` | `user` | `users` | Many-to-One | The user who favorited |
| `recipe-favorites` | `recipe` | `recipes` | Many-to-One | The favorited recipe |
| `recipe-favorites` | `crew` | `crews` | Many-to-One | Crew context |
| `recipe-subgroups` | `crew` | `crews` | Many-to-One | Owning crew |
| `recipe-tags` | `crew` | `crews` | Many-to-One | Owning crew |
| `posts` | `crew` | `crews` | Many-to-One | Crew scope (for crew-only posts) |
| `posts` | `author` | `users` | Many-to-One | Auto-stamped post author |
| `posts` | `heroImage` | `media` | Many-to-One | Post banner image |
| `emails` | `template` | `email-templates` | Many-to-One | Optional template to prefill content |
| `emails` | `specificCrew` | `crews` | Many-to-One | Target crew for crew-scoped emails |
| `products` | `categories` | `categories` | Many-to-Many | Product categories |
| `products` | `crew` | `crews` | Many-to-One | Optional crew scoping |
| `products` | `gallery[].image` | `media` | Many-to-One | Product gallery images |
| `products` | `relatedProducts` | `products` | Many-to-Many | Related product suggestions |
| `orders` | `customer` | `users` | Many-to-One | The purchasing user |
| `carts` | `customer` | `users` | Many-to-One | The cart owner |
| `addresses` | `customer` | `users` | Many-to-One | The address owner |
| `crew-memberships` | `user` | `users` | Many-to-One | The member |
| `crew-memberships` | `crew` | `crews` | Many-to-One | The crew |
| `chat-channels` | `crew` | `crews` | Many-to-One | Owning crew (null for global channels) |
| `chat-channels` | `createdBy` | `users` | Many-to-One | Channel creator |
| `chat-messages` | `channel` | `chat-channels` | Many-to-One | Parent channel |
| `chat-messages` | `user` | `users` | Many-to-One | Message author (auto-stamped) |
| `chat-messages` | `crew` | `crews` | Many-to-One | Crew context (auto-stamped from channel) |
| `chat-messages` | `attachments` | `chat-media` | Many-to-Many | File attachments |
| `chat-messages` | `parentMessage` | `chat-messages` | Many-to-One | Thread parent (self-referential) |
| `chat-messages` | `pinnedBy` | `users` | Many-to-One | User who pinned the message |
| `chat-media` | `crew` | `crews` | Many-to-One | Owning crew (auto-stamped) |
| `chat-read-state` | `user` | `users` | Many-to-One | The reader |
| `chat-read-state` | `channel` | `chat-channels` | Many-to-One | The channel being tracked |

## Join Fields (Virtual Reverse Lookups)

Join fields use Payload's `type: 'join'` to display reverse relationships in the admin panel. These do not store data -- they query the target collection at render time.

| Source Collection | Join Field | Target Collection | On Field | Description |
|---|---|---|---|---|
| `crews` | `members` | `users` | `crew` | All users belonging to this crew |
| `users` | `timeEntries` | `time-entries` | `user` | All time entries for this user |
| `users` | `orders` | `orders` | `customer` | All orders placed by this user |
| `users` | `cart` | `carts` | `customer` | Cart for this user |
| `users` | `addresses` | `addresses` | `customer` | Addresses for this user |
| `avatars` | `usedBy` | `users` | `photo` | Users using this avatar |
| `inventory-categories` | `subCategories` | `inventory-subcategories` | `category` | Sub-categories under this category |

## Relationship Resolution

When querying the Payload API, relationships can be resolved in two ways:

### ID-Only (depth: 0)

Returns only the document ID:

```json
{
  "crew": "65f1a2b3c4d5e6f7a8b9c0d1"
}
```

### Populated (depth: 1+)

Returns the full referenced document:

```json
{
  "crew": {
    "id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Kitchen Crew Alpha",
    "slug": "kitchen-crew-alpha",
    "campLocation": "West Field"
  }
}
```

The `depth` parameter controls how many levels of relationships are resolved. Higher depth values increase response size and query time. Most frontend pages use `depth: 1` or `depth: 2`.

## Array-Embedded Relationships

Some collections embed relationships inside arrays, creating a pattern where each array row contains one or more relationship fields:

### Schedules: Positions Array

Each schedule has a `positions` array where each entry links a `schedule-positions` document to an array of assigned `users`:

```typescript
positions: [
  {
    position: 'schedule-positions/abc123',  // relationship
    assignedMembers: ['users/def456', 'users/ghi789'],  // hasMany relationship
  },
]
```

### Recipes: Ingredients Array

Each recipe has an `ingredients` array where each entry optionally links to an `inventory-items` document:

```typescript
ingredients: [
  {
    inventoryItem: 'inventory-items/abc123',  // optional relationship
    customName: null,
    quantity: 2,
    unit: 'cups',
    preparation: 'diced',
  },
]
```

## Global Relationships

Globals can also reference collections. The `pass-settings` global contains arrays of year-image pairs that reference the `media` collection:

```typescript
crewPassImages: [
  { year: '2025', image: 'media/abc123' },
  { year: '2026', image: 'media/def456' },
]
```
