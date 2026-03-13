---
sidebar_position: 1
title: "Scheduling Overview"
---

# Scheduling Overview

The scheduling system is the operational backbone of OCFCrews. It allows crew coordinators and leaders to create shifts (typically meals or events), define the positions needed for each shift, and enables crew members to self-sign-up for open positions.

## What the Scheduling System Does

At its core, the scheduling system solves the problem of coordinating volunteer labor across meals and events. Coordinators publish a schedule of shifts, each with a set of named positions (e.g., "Serving", "Drinks", "Cleanup"). Crew members browse the calendar and claim open slots. Hours worked are tracked per shift and aggregated into yearly totals on each user's profile.

## Key Concepts

### Shifts (Schedules)

A **shift** is a single scheduled event on a specific date, belonging to a specific crew. Each shift has:

- A **date** and **shift type** (Morning, Afternoon, or Night)
- A **meal name** describing what is being served or the event purpose
- Optional **estimated start and end times** (approximate time windows)
- Optional **notes** with instructions for volunteers
- One or more **leads** (designated shift leaders)
- An array of **positions** that need to be filled
- A **locked** flag — coordinators can lock shifts to prevent sign-up/leave changes

Shifts are managed through the Payload CMS admin panel, the Schedule Builder, and displayed on the frontend calendar.

### Positions

A **position** represents a role within a shift. Positions are defined per-crew in the `schedule-positions` collection (e.g., "Serving", "Drinks", "Cleanup", "Cooking"). Each shift contains an array of position slots, where each slot references a position type and holds an `assignedMembers` array.

A single shift can have multiple slots of the same position type (e.g., three "Serving" slots). Each slot nominally holds one person, though privileged users can double-staff a slot.

### Leads

Shift **leads** are users designated as responsible for a particular shift. They have additional permissions: they can remove other members from positions and are always considered "assigned" for hour-logging purposes.

### Locked Shifts

Coordinators can **lock** a shift to prevent further sign-up or leave changes. Locked shifts display a lock icon on the calendar. Members cannot join or leave a locked shift. Lock/unlock is performed via `POST /api/schedule/lock` with optimistic UI and rollback on error.

### Shift Waitlist

When all slots for a position are filled, members can **join a waitlist** for that specific position. The `shift-waitlist` collection stores entries with `{ schedule, positionIndex, user, crew, joinedAt }`. Coordinators and leaders can see waitlist counts in the Schedule Builder to help manage demand.

### Shift Comments

Each shift has a **comment thread** visible to all crew members. Comments are immutable — they can be created and deleted but not edited. All assigned members and leads are notified when a new comment is posted. Stored in the `shift-comments` collection.

### Shift Swaps & Swap Board

Members can **request a position swap** with another crew member. Swap requests go through an approval workflow (pending → approved/rejected/cancelled). See [Shift Swaps](./shift-swaps) for details.

The **Swap Board** (linked from the schedule toolbar) lets members post shifts they want to give up. Other crew members can claim an available shift directly from the board — this is separate from the formal swap request workflow.

### Time Entries

A **time entry** records hours worked by a user. Time entries can be:

- **Shift-specific**: Linked to a particular schedule (shift), recording hours worked on that shift
- **Extra daily hours**: Not linked to any shift, recording additional work done on a given date (e.g., setup, cleanup, or other crew tasks)

Time entries support 0.5-hour increments and are validated to be between 0 and 24 hours.

### Hours Tracking

Hours are automatically aggregated on the User document in the `hoursPerYear` array. Each entry contains:

- **year**: The calendar year
- **hours**: Total hours logged that year
- **daysWorked**: Count of distinct dates with logged hours

This aggregation is recalculated automatically whenever a time entry is created, updated, or deleted.

## Coordinator Tools

### Schedule Builder

The **Schedule Builder** (`/crew/scheduling/builder`) is a dedicated interface for coordinators and leaders to create and manage shifts. Features include:

- **Create shifts** with positions, leads, and estimated times
- **Apply templates** to populate an entire week quickly
- **Copy week** — duplicate an entire week of shifts to another week
- **Lock/unlock** shifts to prevent sign-up changes
- **Bulk create** shifts with conflict detection (warns on duplicate date + shift type combos)
- **Attendance mode** — mark who showed up on past/today shifts
- **Waitlist counts** shown on full positions
- **Suggest dropdown** that ranks members by availability, shift/position preference, and workload (with color-coded indicators: blue=preferred, green=available, amber=other)
- **Weekly coverage bar** showing fill rates at a glance above the grid
- Two-phase incremental loading for fast initial render

### Availability Matrix

The **Availability Matrix** (`/crew/scheduling/availability`) is a color-coded grid view of all member availability. Features include:

- **Range modes**: week, 2-week, or month views
- **Sort**: by name, most available, least available, or most assigned
- **Status filter**: all, available/preferred, preferred only, unavailable, or no data
- **Coverage bars** per day showing available member counts
- **Low-coverage highlighting** (amber when < 50% available)
- **Rich CSV export** with shift preferences, position preferences, late arrival notes
- **Sticky column headers** while scrolling
- **Search** by member name
- Smart tooltip positioning to avoid edge clipping

### Calendar Export

- **iCal**: download `.ics` file of assigned shifts (all members)
- **CSV**: export full schedule as spreadsheet (coordinators/leaders)
- Both linked from the secondary toolbar (Swap Board → iCal → Export CSV)

## System Flow

1. **Coordinators** create shifts via the Schedule Builder or admin panel
2. **Members** browse shifts on the crew schedule calendar
3. Members **sign up** for open positions by clicking "Join"
4. If a position is full, members can **join the waitlist**
5. After working a shift, members **log their hours** directly on the shift card
6. Hours are automatically **aggregated** on the user profile by year

## Related Routes

| Route | Purpose |
|-------|---------|
| `/schedule` | Redirects the authenticated user to their crew's schedule |
| `/crews/[slug]/schedule` | Full interactive schedule calendar for a specific crew |
| `/account/schedule` | Personal "My Schedule" view showing only shifts the user is assigned to |
| `/account/hours` | Hours summary page |
| `/crew/scheduling` | Scheduling hub for coordinators and leaders |
| `/crew/scheduling/builder` | Schedule Builder — create and assign shifts |
| `/crew/scheduling/availability` | Availability Matrix — view member availability |
| `/crew/scheduling/shifts` | Manage Shifts — list of upcoming shifts with open position counts |
| `/crew/dashboard` | Crew Dashboard — fill rate, unfilled shifts, member hours |

## Custom API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/schedule/sign-up` | POST | Join, leave, or remove a member from a position |
| `/api/schedule/log-hours` | POST | Log or update hours worked for a shift or date |
| `/api/schedule/lock` | POST | Lock or unlock a shift (coordinator only) |
| `/api/schedule/copy-week` | POST | Copy an entire week of shifts to a target week |
| `/api/schedule/attendance` | POST | Record attendance for a past/today shift |
| `/api/schedule/waitlist` | GET/POST/DELETE | Query, join, or leave a position waitlist |
| `/api/schedule/swap-board` | GET/POST/DELETE | Query, post, or claim shifts on the Swap Board |
| `/api/schedule/ical` | GET | Download iCal file of assigned shifts |
| `/api/crew-availability` | GET | Fetch member availability for a date range |
