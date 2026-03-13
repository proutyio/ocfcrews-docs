---
sidebar_position: 3
title: "Database Indexing"
---

# Database Indexing

OCFCrews uses PostgreSQL indexes extensively to ensure fast query performance, particularly for crew-scoped queries that filter by the `crew` field. Payload CMS automatically creates indexes for fields marked with `index: true` in the collection configuration via the `@payloadcms/db-postgres` adapter (Drizzle ORM).

## Why Indexes Matter

Without indexes, PostgreSQL must perform a sequential scan (examine every row) to find matching records. With crew isolation enforcing `{ crew: { equals: crewId } }` Where clauses on nearly every query, the `crew` field index is critical for performance.

For a table with 10,000 rows across 20 crews:
- **Without index**: PostgreSQL scans all 10,000 rows to find the ~500 belonging to one crew
- **With index**: PostgreSQL directly looks up the ~500 matching rows using the B-tree index

## Indexed Fields by Collection

### Users

| Field | Index | Reason |
|-------|-------|--------|
| `crew` | `index: true` | Crew isolation queries: find all members of a crew |
| `crewRole` | `index: true` | Filter users by crew role (e.g., find all coordinators, find unassigned users) |
| `email` | Built-in (unique) | Payload auto-indexes the auth email field for login lookups |
| `lastVerificationEmailSentAt` | `index: true` | Rate limiting queries for resend-verification |

### Crews

| Field | Index | Reason |
|-------|-------|--------|
| `slug` | `unique: true` | Unique constraint implies index; used for URL-based lookups |

### Schedules

| Field | Index | Reason |
|-------|-------|--------|
| `crew` | `index: true` | Crew isolation: fetch all schedules for a specific crew |
| `date` | `index: true` | Date-range queries: upcoming shifts, past shifts, specific day |

### Schedule Positions

| Field | Index | Reason |
|-------|-------|--------|
| `crew` | `index: true` | Crew isolation: positions belonging to a specific crew |

### Time Entries

| Field | Index | Reason |
|-------|-------|--------|
| `user` | `index: true` | Per-user queries: "my hours", hours recalculation |
| `schedule` | `index: true` | Upsert lookup: find existing entry for a user + schedule combination |
| `crew` | `index: true` | Crew isolation: all time entries for a crew |
| `date` | `index: true` | Date-based queries and the upsert pattern for manual entries |

### Posts

| Field | Index | Reason |
|-------|-------|--------|
| `crew` | `index: true` | Crew-scoped post queries |
| `slug` | `unique: true` | URL-based lookups; unique constraint implies index |

### Emails

No explicit `index: true` on custom fields, but Payload indexes `id` and relationships automatically.

### Email Templates

| Field | Index | Reason |
|-------|-------|--------|
| `key` | `unique: true` | Programmatic lookup by template key (e.g., `forgot_password`) |

### Inventory Items

| Field | Index | Reason |
|-------|-------|--------|
| `crew` | `index: true` | Crew isolation: all inventory for a crew |
| `category` | `index: true` | Category-based filtering and grouping |
| `subCategory` | `index: true` | Sub-category filtering |
| `storageType` | `index: true` | Filter by storage type (dry, refrigerated, frozen) |
| `useByDate` | `index: true` | Expiry date queries for dashboard alerts |

### Inventory Categories

| Field | Index | Reason |
|-------|-------|--------|
| `crew` | `index: true` | Crew isolation |

### Inventory Sub-Categories

| Field | Index | Reason |
|-------|-------|--------|
| `category` | `index: true` | Parent category lookups |
| `crew` | `index: true` | Crew isolation |

### Inventory Transactions

| Field | Index | Reason |
|-------|-------|--------|
| `item` | `index: true` | Find all transactions for a specific inventory item |
| `crew` | `index: true` | Crew isolation |
| `user` | `index: true` | Audit trail: who logged the transaction |

### Inventory Media

| Field | Index | Reason |
|-------|-------|--------|
| `crew` | `index: true` | Crew isolation for media files |

### Recipes

| Field | Index | Reason |
|-------|-------|--------|
| `crew` | `index: true` | Crew isolation |
| `group` | `index: true` | Recipe group filtering (Breakfast, Lunch, Dinner, etc.) |
| `status` | `index: true` | Filter by published/draft status |

### Recipe Sub-Groups

| Field | Index | Reason |
|-------|-------|--------|
| `crew` | `index: true` | Crew isolation |

### Recipe Tags

| Field | Index | Reason |
|-------|-------|--------|
| `crew` | `index: true` | Crew isolation |

### Recipe Favorites

| Field | Index | Reason |
|-------|-------|--------|
| `user` | `index: true` | Per-user favorite lookups |
| `recipe` | `index: true` | Check if a recipe is favorited |
| `crew` | `index: true` | Crew isolation |

### Chat Channels

| Field | Index | Reason |
|-------|-------|--------|
| `crew` | `index: true` | Crew isolation: channels belonging to a specific crew |

### Chat Messages

| Field | Index | Reason |
|-------|-------|--------|
| `channel` | `index: true` | Find all messages in a channel |
| `user` | `index: true` | Per-user message lookups |
| `crew` | `index: true` | Crew isolation |

### Chat Media

| Field | Index | Reason |
|-------|-------|--------|
| `crew` | `index: true` | Crew isolation for chat file uploads |

### Chat Read State

| Field | Index | Reason |
|-------|-------|--------|
| `user` | `index: true` | Per-user read state lookups |
| `channel` | `index: true` | Per-channel read state lookups |

### Crew Memberships

| Field | Index | Reason |
|-------|-------|--------|
| `user` | `index: true` | Find all memberships for a user |
| `crew` | `index: true` | Find all members of a crew |
| `active` | `index: true` | Filter active vs inactive memberships |

## The Crew Index Pattern

The `crew` field appears as an indexed field on **20 collections** across the system. This is the foundation of crew isolation performance:

```
Users, Schedules, SchedulePositions, TimeEntries, Posts, Products,
InventoryItems, InventoryCategories, InventorySubCategories,
InventoryTransactions, InventoryMedia,
Recipes, RecipeSubGroups, RecipeTags, RecipeFavorites, Emails (via specificCrew),
ChatChannels, ChatMessages, ChatMedia, CrewMemberships
```

Every access control function that returns a `Where` clause like `{ crew: { equals: crewId } }` benefits from this index, turning what would be a full collection scan into an efficient index lookup.

## Compound Query Patterns

Some queries effectively use multiple indexed fields. PostgreSQL can combine individual indexes or use compound indexes for these patterns:

| Query Pattern | Fields Used | Example |
|--------------|------------|---------|
| User's time entries | `user` + `schedule` | Upsert: find existing entry for user + shift |
| Crew's schedules by date | `crew` + `date` | Dashboard: upcoming shifts for my crew |
| Inventory by category | `crew` + `category` | Inventory list filtered by category |
| Expiring items | `crew` + `useByDate` | Dashboard alerts for items near expiry |
| Recipe by group | `crew` + `group` | Recipe book: all breakfast recipes for my crew |
| Channel messages (latest first) | `channel` + `createdAt` | Chat: paginated messages for a channel (compound index) |
| Thread replies | `parentMessage` + `createdAt` | Chat: replies in a thread (compound index) |
| User's read state per channel | `user` + `channel` | Chat: unique compound index for unread calculation |
| Crew channels by archive status | `crew` + `archived` | Chat: list active or archived channels (compound index) |
| User's memberships | `user` + `crew` | Multi-crew: unique compound index per user+crew |

## Automatic Payload Indexes

In addition to explicitly marked `index: true` fields, Payload CMS automatically creates indexes for:

- **`id`**: Primary key on every collection
- **`createdAt` / `updatedAt`**: Timestamp fields used for sorting
- **`_status`**: Draft/published status on versioned collections (Pages)
- **Relationship fields**: Payload may index relationship fields used in `join` configurations
- **Unique fields**: Any field with `unique: true` gets a unique index

## Performance Considerations

1. **Index selectivity**: The `crew` index is highly selective in multi-tenant scenarios. With 20 crews, each query immediately eliminates ~95% of rows.

2. **Write overhead**: Each index slightly increases write time (insert/update must update the index). The collections with the most indexes (Inventory Items with 5 custom indexes) are still well within acceptable limits for the write patterns in this application.

3. **Memory**: PostgreSQL keeps frequently-used indexes in its shared buffer cache. For the expected data volumes (hundreds to low thousands of rows per table), the entire index set fits comfortably in memory.
