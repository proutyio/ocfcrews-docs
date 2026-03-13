---
sidebar_position: 5
title: "Hour Logging"
---

# Hour Logging

The hour logging system records time worked by crew members. It is implemented as a POST API route at `/api/schedule/log-hours`.

**Source**: `src/app/(app)/api/schedule/log-hours/route.ts`

## Two Types of Hour Entries

### Shift-Specific Hours

When a `scheduleId` is provided, the time entry is linked to a specific shift. The API:

1. Validates that the schedule exists and belongs to the user's crew
2. Verifies the user is assigned to the shift (either as a lead or in a position's `assignedMembers`)
3. Derives the entry date from the schedule's date
4. Prevents logging hours for future shifts

### Extra Daily Hours

When only a `date` is provided (no `scheduleId`), the time entry records additional work not tied to a specific shift. This covers activities like setup, cleanup, or other crew tasks. The API:

1. Validates the date format (`YYYY-MM-DD`)
2. Prevents logging hours for future dates

## Request Body

```typescript
type RequestBody = {
  scheduleId?: string   // Link to a specific shift (optional)
  date?: string         // YYYY-MM-DD, required when scheduleId is absent
  hours: number         // Hours worked
}
```

At least one of `scheduleId` or `date` must be provided.

## Upsert Semantics

The API uses **upsert semantics** -- it finds an existing entry or creates a new one:

- **Shift-specific**: Searches for an existing entry matching `{ user, schedule }`
- **Extra daily**: Searches for an existing entry matching `{ user, date, schedule: { exists: false } }`

If a matching entry is found, it is updated with the new hours value. If no match exists, a new time entry is created.

This means calling the API multiple times for the same shift or date will update the existing entry rather than creating duplicates.

## Validation Rules

### Hours Range

Hours must be a finite number between 0 and 24 inclusive:

```typescript
if (typeof hours !== 'number' || !isFinite(hours) || hours < 0 || hours > 24) {
  return NextResponse.json({ error: 'hours must be between 0 and 24' }, { status: 400 })
}
```

### Half-Hour Increments

Hours must be in 0.5-hour increments. The validation checks that rounding to the nearest half-hour produces the same value:

```typescript
if (Math.round(hours * 2) / 2 !== hours) {
  return NextResponse.json({ error: 'hours must be in 0.5-hour increments' }, { status: 400 })
}
```

Valid values include: 0, 0.5, 1, 1.5, 2, 2.5, ..., 23.5, 24.

### 30-Day Edit Window

Non-admin and non-editor users cannot create or edit time entries older than 30 days. This is enforced by a `beforeChange` hook on the TimeEntries collection:

```typescript
const cutoff = new Date()
cutoff.setDate(cutoff.getDate() - 30)
const cutoffStr = cutoff.toISOString().slice(0, 10)
if (entryDate < cutoffStr) {
  throw new Error('Cannot create or edit time entries more than 30 days old.')
}
```

Admins and editors are exempt from this restriction.

### No Future Dates

The API prevents logging hours for dates in the future, both for shift-specific entries (checks the shift's date) and extra daily entries (checks the provided date).

### Shift Assignment Verification

For shift-specific entries, the API verifies the user is actually assigned to the shift:

1. Fetches the schedule document
2. Checks if the user is in the `leads` array
3. Checks if the user is in any position's `assignedMembers` array
4. If neither, returns 403: *"Forbidden: not assigned to this shift"*

This check is performed at the API route level. Additionally, the TimeEntries collection has its own `beforeChange` hook that performs a similar check on create operations for non-privileged users.

## Crew Membership

The user must belong to a crew (`user.crew` must be set). If the user is not in a crew, the API returns 403: *"User is not in a crew"*.

For shift-specific entries, the user's crew must match the schedule's crew.

## Collection-Level Hooks

The TimeEntries collection applies additional validation through `beforeChange` hooks:

1. **Crew auto-stamping**: The crew field is automatically set from the authenticated user's crew
2. **Cross-crew prevention**: Non-admins cannot create entries for crews other than their own
3. **30-day window**: Entries older than 30 days are rejected for non-admin/editor users
4. **Shift assignment check**: On create, verifies the user is assigned to the linked shift (admin, editor, and crew_coordinator are exempt)

## Frontend Integration

Hours are logged from two places in the calendar UI:

1. **ShiftCard component**: Shows an hours input field for users who are assigned to the shift. The input accepts 0.5-hour increments (step 0.5) with a Save button.
2. **DayView component**: Provides an "Extra Hours" input for logging non-shift-specific work on a given day.

Both use optimistic UI: the value is updated immediately in the local state, and if the API call fails, the previous value is restored with an error toast.
