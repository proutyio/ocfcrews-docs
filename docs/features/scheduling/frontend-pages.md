---
sidebar_position: 7
title: "Schedule Frontend"
---

# Schedule Frontend

The scheduling system's frontend is built as a set of React components that render an interactive calendar with shift cards, position sign-ups, and hour logging.

## Component Architecture

**Source**: `src/components/Schedule/`

```
Schedule/
  ScheduleCalendar/
    index.tsx          # Main calendar component with toolbar and state
    MonthView.tsx      # Month grid view
    WeekView.tsx       # Week column view
    DayView.tsx        # Single-day detailed view
  ShiftCard/
    index.tsx          # Individual shift card with positions and hours
  types.ts             # Shared TypeScript types and constants
```

## ScheduleCalendar Component

The `ScheduleCalendar` is the main entry point. It is a client component (`'use client'`) that manages all calendar state and user interactions.

### Props

```typescript
type ScheduleCalendarProps = {
  schedules: ScheduleDoc[]     // All schedules for this crew
  crewSlug: string             // Crew URL slug
  crewName: string             // Crew display name
  currentUserId: string        // Authenticated user's ID
  currentUserName: string      // User's display name (nickname || name || email)
  userRoles: string[]          // User's role array
  userCrewId: string           // User's crew ID
  timeEntries?: TimeEntryDoc[] // User's existing time entries
}
```

### View Modes

The calendar supports three view modes, toggled via a button group in the toolbar:

| View | Component | Description |
|------|-----------|-------------|
| **Month** | `MonthView` | Calendar grid showing the full month. Each day cell shows shift badges with color coding. Click a day to drill into day view. |
| **Week** | `WeekView` | Seven-column layout (Monday--Sunday) showing shift cards for each day of the week. Supports quick sign-up actions. |
| **Day** | `DayView` | Detailed single-day view showing full shift cards with position slots, member lists, hour logging, and extra daily hours input. |

### Group Modes

In **Week** and **Day** views, a toggle below the view switcher lets you change how shifts are grouped:

| Mode | Value | Description |
|------|-------|-------------|
| **List** | `default` | Default chronological order |
| **Type** | `shift-type` | Grouped by shift type (morning/afternoon/night) |
| **Role** | `position` | Grouped by position name |
| **Position** | `position` | Grouped by position slot |

The selected mode is persisted via the `?groupMode=` URL search parameter.

### Navigation

The toolbar provides:

- **Previous/Next buttons**: Navigate by month, week, or day depending on the current view
- **Today button**: Jump back to the current date
- **Header text**: Displays the current period (e.g., "January 2026", "Jan 15 -- 21, 2026", "Wednesday, January 15, 2026")

### State Management

The component manages several pieces of state:

| State | Type | Purpose |
|-------|------|---------|
| `currentDate` | `Date` | The focal date for the current view |
| `view` | `CalendarView` | Current view mode: `'month'`, `'week'`, or `'day'` |
| `optimisticOverrides` | `Record<string, string[]>` | Pending sign-up changes keyed by `{shiftId}-{positionIndex}` |
| `entryMap` | `Record<string, number>` | Shift-specific hours keyed by schedule ID |
| `extraMap` | `Record<string, number>` | Extra daily hours keyed by date string |

### Optimistic UI Pattern

All user interactions (sign-up, leave, remove, log hours) follow the optimistic UI pattern:

1. **Capture** the previous state value
2. **Apply** the expected new state immediately to the UI
3. **Send** the API request
4. **On failure**: Revert to the captured previous state and show an error toast via `sonner`

For sign-ups, the `optimisticOverrides` map stores the expected member list for each position slot. The key format is `{shiftId}-{positionIndex}`. When rendering, components check `optimisticOverrides[key]` first; if present, it overrides the server-side data.

For hours, `entryMap` and `extraMap` are updated immediately. On API failure, the previous value is precisely restored:

```typescript
const prev = entryMap[shiftId]
setEntryMap((m) => ({ ...m, [shiftId]: hours }))
try {
  const res = await fetch('/api/schedule/log-hours', { ... })
  if (!res.ok) {
    // Restore previous value precisely
    setEntryMap((m) => {
      const copy = { ...m }
      if (prev === undefined) delete copy[shiftId]
      else copy[shiftId] = prev
      return copy
    })
    toast.error(...)
  }
} catch {
  // Same revert logic
}
```

### Hours Maps

The component maintains two separate state maps for tracking hours:

- **`entryMap`**: Maps schedule IDs to hours (shift-specific entries). Initialized from `timeEntries` where `schedule` is set.
- **`extraMap`**: Maps date strings to hours (extra daily entries). Initialized from `timeEntries` where `schedule` is null.

A derived `hoursMap` combines both into a per-date total for display in the month and week views.

### Permission Check

The `canEdit` flag is derived from the user's roles:

```typescript
const canEdit = userRoles.some((r) =>
  ['admin', 'editor', 'crew_coordinator', 'crew_leader'].includes(r),
)
```

This controls whether edit links, remove buttons, and other management controls are shown.

## ShiftCard Component

The `ShiftCard` renders an individual shift with its positions, assigned members, and hour logging.

### Visual Design

- A colored top bar indicates the shift type (emerald for morning, blue for afternoon, purple for night)
- A badge shows the shift type label
- The meal name is displayed prominently
- Leads are listed with member pills
- Notes are shown in italic
- Positions are grouped by type with individual slot rows

### Position Display

Positions are grouped by their position document (e.g., all "Serving" slots together):

1. Position groups are sorted alphabetically by name
2. Each group shows a header with the position name and slot count
3. Individual slots show assigned members as pills
4. The current user's pill is highlighted in emerald
5. Empty slots show "No one signed up yet"

### Actions

- **Join button**: Shown when the user is not assigned to the slot
- **Leave button**: Shown when the user is assigned; requires confirmation (Yes/No)
- **Remove button**: Shown on other members' pills when the current user is a lead or privileged

### Hours Logging

When the current user is assigned to the shift (either as a lead or in a position), an hours input section appears:

- Number input with min=0, max=24, step=0.5
- "Save" button to submit hours
- After saving, displays `{N} hrs logged` with an "Edit" link to modify

## Frontend Routes

### `/schedule` (Redirect Page)

**Source**: `src/app/(app)/schedule/page.tsx`

A server-rendered page that redirects the authenticated user to their crew's schedule:

1. Authenticates the user
2. If not logged in, redirects to `/login`
3. Looks up the user's crew slug
4. Redirects to `/crews/{slug}/schedule`

### `/crews/[slug]/schedule` (Crew Schedule)

**Source**: `src/app/(app)/crews/[slug]/schedule/page.tsx`

The main schedule page for a specific crew:

1. Authenticates the user and verifies crew membership (admins/editors can view any crew)
2. Fetches all schedules for the crew (up to 500, sorted by date, depth 1 for populated relationships)
3. Fetches the user's time entries for this crew
4. Renders the `ScheduleCalendar` component with all data

### `/account/schedule` (My Schedule)

**Source**: `src/app/(app)/(account)/account/schedule/page.tsx`

A personal schedule view showing only shifts where the user is assigned:

1. Fetches schedules for the user's crew (past year through future)
2. Filters to shifts where the user is a lead or has a position
3. Fetches time entries for those shifts
4. Groups shifts into "Upcoming" and "Past" sections
5. Displays a simplified shift row for each (no sign-up actions, just viewing)

### `/account/hours` (Hours Summary)

Displays the user's aggregated hours per year from the `hoursPerYear` field on the User document.

## Coordinator Tools

### `/crew/scheduling` (Scheduling Hub)

**Source**: `src/app/(app)/crew/scheduling/page.tsx`

The scheduling hub for coordinators and leaders. Provides an overview dashboard with:

- Fill rate across upcoming shifts
- List of unfilled shifts (next 4 weeks)
- Member hours summary
- Unscheduled member count
- Links to the Schedule Builder, Availability Matrix, and Manage Shifts pages

### `/crew/scheduling/builder` (Schedule Builder)

**Source**: `src/components/Scheduling/ScheduleBuilder/index.tsx`

An interactive tool for creating and managing shifts. Key features:

- **Two-phase incremental loading**: `?include=base` (members + availability + positions) fires in parallel with `?include=schedules` — UI unblocks after base resolves
- **Week view** with a day grid showing mini shift cards
- **Create shifts** by selecting positions, leads, estimated times
- **Apply templates** to populate a week
- **Copy week** — duplicate shifts from one week to another
- **Lock/unlock** shifts with optimistic UI
- **Bulk create** with conflict detection
- **Attendance mode** for past/today shifts
- **Suggest dropdown** — ranks members by availability score (preferred day, shift preference, position preference, workload balance) with color-coded indicators
- **Waitlist counts** on full positions
- **Weekly coverage bar** above the grid

Props: `currentUserId: string` + `isCoordinator: boolean` passed from the builder page.

### `/crew/scheduling/availability` (Availability Matrix)

**Source**: `src/components/Scheduling/AvailabilityMatrix/index.tsx`

A color-coded grid view of all crew members' availability. See [Member Availability](./availability) for full feature list.

Key implementation details:
- `dates` and `memberIds` arrays are memoized to prevent cascading memo invalidations
- Smart tooltip positioning using `isTopRow` / `isLeftEdge` / `isRightEdge` props
- Coverage bars computed from `getAvailableCountForDate()` utility
- Rich CSV export via `exportAvailabilityCSV()` utility with detail map

### `/crew/scheduling/shifts` (Manage Shifts)

**Source**: `src/app/(app)/crew/scheduling/shifts/page.tsx`

List of upcoming shifts with open position counts for quick triage. Coordinators can send shift reminders from here.

### `/crew/dashboard` (Crew Dashboard)

**Source**: `src/app/(app)/crew/dashboard/page.tsx`

Crew management dashboard for coordinators and leaders showing shift coverage at a glance, upcoming gaps, and hours logged by crew members.
