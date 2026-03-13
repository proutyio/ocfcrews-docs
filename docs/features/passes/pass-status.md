---
sidebar_position: 2
title: "Pass Status Tracking"
---

# Pass Status Tracking

Pass distribution is tracked per-member through the `passStatus` array field and the `crewPassEligibility` select field on the **Users** collection. Together, these fields provide year-by-year tracking of which passes each crew member has received.

## crewPassEligibility Field

| Property | Value |
|---|---|
| Type | Select |
| Default | `not_eligible` |
| Label | Crew Pass Eligibility |

### Options

| Value | Label | Description |
|---|---|---|
| `not_eligible` | Not Eligible | Default status; member cannot receive a crew pass |
| `crew` | Crew | Eligible for a standard crew member pass |
| `so` | S.O. | Eligible for a significant other pass |
| `so_paid` | S.O. Paid | Eligible for a paid significant other pass |

### Access Control

| Operation | Allowed Roles |
|---|---|
| Create | Admin only |
| Read | Admin, editor, crew coordinator |
| Update | Admin, editor, crew coordinator |

This field is set by coordinators and admins before pass distribution begins. It determines whether the member qualifies for a crew pass and what type.

> **Cross-crew exclusivity:** Only one crew membership per user can hold non-`not_eligible` eligibility at a time. Attempting to set eligibility on a second crew returns a 409 error. Remove eligibility from the current crew first.

## passStatus Array Field

The `passStatus` field is an array where each entry represents a single year's pass tracking data.

| Property | Value |
|---|---|
| Type | Array |
| Label | Pass Status by Year |

### Array Entry Fields

Each entry in the array contains:

| Field | Type | Default | Description |
|---|---|---|---|
| `year` | Text | -- | Required, 4-digit year string (e.g., `"2025"`). Validated with regex `/^\d{4}$/` |
| `crewPassReceived` | Checkbox | `false` | Whether the member has received their crew pass for this year |
| `parkingPassReceived` | Checkbox | `false` | Whether the member has received their parking pass for this year |
| `campingTagReceived` | Checkbox | `false` | Whether the member has received their camping tag for this year |

### Access Control

The passStatus array has tiered access control:

#### Array-Level Access

| Operation | Allowed Roles |
|---|---|
| Create | Admin only |
| Read | Admin, editor, crew coordinator, or the user themselves |
| Update | Admin, crew coordinator, crew leader |

#### Sub-Field Access

The `crewPassReceived` and `parkingPassReceived` checkboxes have additional field-level update restrictions:

| Field | Update Access |
|---|---|
| `crewPassReceived` | Admin, crew coordinator only |
| `parkingPassReceived` | Admin, crew coordinator only |
| `campingTagReceived` | Inherits from array-level (admin, crew coordinator, crew leader) |

This means crew leaders can update the camping tag status (useful for on-site distribution) but cannot modify the crew pass or parking pass status, which requires coordinator or admin privileges.

### Self-Viewing

Individual members can read their own pass status (the read access checks `doc?.id === user.id`), but they cannot modify it. This allows members to check their pass receipt status on the account page.

## Auto-Initialization on User Creation

A `beforeChange` hook on the Users collection automatically initializes the `passStatus` array when a new user is created:

```typescript
({ data, operation }) => {
  if (operation !== 'create') return data
  if (data.passStatus?.length) return data
  const currentYear = String(new Date().getFullYear())
  data.passStatus = [
    {
      year: currentYear,
      crewPassReceived: false,
      parkingPassReceived: false,
      campingTagReceived: false,
    },
  ]
  return data
}
```

This hook:

1. Only runs on `create` operations (not updates)
2. Skips initialization if `passStatus` is already populated (e.g., an admin explicitly provided values)
3. Creates a single entry for the current calendar year with all receipt flags set to `false`

This ensures every new user starts with a pass tracking entry for the current year without manual setup.

## Managing Pass Status

### Adding a New Year

Coordinators or admins can add new array entries for additional years through the admin panel. The year field validates that values are 4-digit numbers.

### Tracking Distribution

As passes are physically handed out to members, the coordinator (or crew leader for camping tags):

1. Opens the user's record in the admin panel
2. Finds the relevant year entry in the passStatus array
3. Checks the appropriate received checkbox(es)
4. Saves the user document

### Bulk Visibility

In the admin panel, the Users collection default columns include `email`, `nickname`, `name`, `crew`, `crewRole`, and `roles`, which helps coordinators identify members when managing pass distribution. The passStatus data is accessible from each user's detail view.

## Source Files

| File | Purpose |
|---|---|
| `src/collections/Users/index.ts` | `passStatus` array field, `crewPassEligibility` field, and auto-initialization hook |
| `src/app/(app)/(account)/account/page.tsx` | Account page displaying pass status to members |
