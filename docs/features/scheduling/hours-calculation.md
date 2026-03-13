---
sidebar_position: 6
title: "Hours Calculation"
---

# Hours Calculation

Hours worked by each user are automatically aggregated into the `hoursPerYear` field on the User document. This provides a quick summary of total hours and days worked per calendar year without requiring expensive queries at read time.

## The `hoursPerYear` Field

The `hoursPerYear` field on the Users collection is a read-only array with the following structure:

```typescript
hoursPerYear: Array<{
  year: string      // e.g., "2025"
  hours: number     // Total hours logged that year
  daysWorked: number // Count of distinct dates with logged hours
}>
```

This field is:

- **Read-only** in the admin panel (`admin.readOnly: true`)
- **Not directly writable** by any user (`create: () => false`, `update: () => false`)
- **Readable** by admin, editor, crew_coordinator, and the user themselves

The array is sorted with the most recent year first.

## The `recalcUserHours` Function

**Source**: `src/collections/TimeEntries/index.ts`

The `recalcUserHours` function is responsible for recalculating and updating the `hoursPerYear` array whenever a time entry changes. It is defined as an async function that accepts a user ID, a Payload instance, and an optional request object.

### Algorithm

```typescript
async function recalcUserHours(userId: string, payload: BasePayload, req?: PayloadRequest): Promise<void> {
  // 1. Fetch ALL time entries for this user
  const result = await payload.find({
    collection: 'time-entries',
    where: { user: { equals: userId } },
    limit: 10000,
    depth: 0,
    select: { date: true, hours: true },
    overrideAccess: true,
  })

  // 2. Group by year (skip zero-hour entries so cleared days don't inflate counts)
  const byYear: Record<string, { hours: number; days: Set<string> }> = {}
  for (const entry of result.docs) {
    if (!entry.hours) continue
    const year = entry.date.slice(0, 4)
    if (!byYear[year]) byYear[year] = { hours: 0, days: new Set() }
    byYear[year].hours += entry.hours
    byYear[year].days.add(entry.date.slice(0, 10))
  }

  // 3. Build the hoursPerYear array (sorted newest first)
  const hoursPerYear = Object.keys(byYear)
    .sort()
    .reverse()
    .map((year) => ({
      year,
      hours: byYear[year].hours,
      daysWorked: byYear[year].days.size,
    }))

  // 4. Update the user document
  await payload.update({
    collection: 'users',
    id: userId,
    data: { hoursPerYear },
    overrideAccess: true,
  })
}
```

### Key Details

1. **Full recalculation**: The function fetches up to 10,000 time entries for the user (not just the changed one) and rebuilds the entire `hoursPerYear` array from scratch. This ensures consistency even if entries are edited or deleted.

2. **Year extraction**: The year is extracted from the first four characters of the date string (`date.slice(0, 4)`).

3. **Zero-hour entries skipped**: Entries with `hours` equal to 0 (or falsy) are excluded from aggregation so that cleared days do not inflate `daysWorked` counts.

4. **Distinct days**: The `daysWorked` count uses a `Set<string>` to count unique dates. If a user logs hours on two different shifts on the same day, it counts as one day worked.

5. **Newest first**: The results are sorted in reverse chronological order so the current year appears first.

6. **Override access**: Both the read and write operations use `overrideAccess: true` since this is a system-level operation that should not be subject to access control.

7. **Error handling**: The function wraps everything in a try/catch and logs errors rather than throwing, ensuring a failed recalculation does not break the triggering operation.

## Hook Triggers

The `recalcUserHours` function is called from two hooks on the TimeEntries collection:

### `afterChange` Hook

Fires whenever a time entry is created or updated:

```typescript
afterChange: [
  async ({ doc, req }) => {
    const userId = typeof doc.user === 'object' ? doc.user.id : doc.user
    if (userId) await recalcUserHours(String(userId), req.payload, req)
  },
],
```

### `afterDelete` Hook

Fires whenever a time entry is deleted:

```typescript
afterDelete: [
  async ({ doc, req }) => {
    const userId = typeof doc.user === 'object' ? doc.user.id : doc.user
    if (userId) await recalcUserHours(String(userId), req.payload, req)
  },
],
```

Both hooks extract the user ID from the document (handling both string and populated object forms) and trigger a full recalculation.

## Performance Considerations

The current implementation fetches up to 10,000 time entries for a user on every change. For typical crew scheduling workloads (tens to low hundreds of entries per user per year), this is efficient. The query uses `limit: 10000` and `depth: 0` to minimize overhead, and only selects the `date` and `hours` fields.

If a user were to accumulate thousands of time entries, the aggregation could be optimized by:

- Using MongoDB aggregation pipelines instead of application-level grouping
- Incrementally updating rather than fully recalculating
- Caching intermediate results

However, for the current scale of crew operations, the full recalculation approach is simple, correct, and fast enough.
