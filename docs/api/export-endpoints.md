---
sidebar_position: 11
title: "Export & Reports API"
---

# Export & Reports API

## Overview

The Export & Reports API provides six endpoints for downloading crew data as CSV files or PDF reports. CSV endpoints return raw tabular data suitable for spreadsheet import. PDF endpoints generate formatted reports using `@react-pdf/renderer`.

All export endpoints are rate limited to **5 requests per 60 seconds** per user and enforce **crew isolation** -- users can only export data for their own crew.

## Authentication & Authorization

All export endpoints require authentication via session cookie or JWT token.

| Header | Required | Description |
|---|---|---|
| `Cookie` | Yes | Payload session cookie |
| `Authorization` | Alt | `JWT <token>` for programmatic access |

Role requirements vary by endpoint:

| Endpoint | Allowed Roles |
|---|---|
| Hours CSV | `admin`, `editor`, `crew_coordinator`, `crew_leader` |
| Schedule CSV | `admin`, `editor`, `crew_coordinator`, `crew_leader` |
| Inventory CSV | `admin`, `inventory_admin`, `inventory_editor`, `inventory_viewer` |
| Crew Summary PDF | `admin`, `editor`, `crew_coordinator`, `crew_leader` |
| Annual Hours PDF | `admin`, `editor`, `crew_coordinator`, `crew_leader` |
| Inventory Valuation PDF | `admin`, `inventory_admin`, `inventory_editor`, `inventory_viewer` |

---

## CSV Exports

### 1. Hours Export

**Endpoint:** `GET /api/export/hours`

**Source:** `src/app/(app)/api/export/hours/route.ts`

Exports time entries as a CSV file. Can be filtered by year and/or month.

#### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `year` | `string` | No | Four-digit year (2000-2100). Filters entries to this year. |
| `month` | `string` | No | Month number (1-12). Used with `year` to filter to a specific month. |

If neither is provided, all time entries for the crew are exported.

#### Validation Rules

1. `year` must be a 4-digit number between 2000 and 2100.
2. `month` must be a number between 1 and 12.

#### CSV Columns

| Column | Description |
|---|---|
| `Member Name` | Name of the crew member |
| `Email` | Email address |
| `Date` | Date of the time entry |
| `Hours` | Hours worked |
| `Shift Meal` | Meal type from the associated schedule |

#### Response

- **Content-Type:** `text/csv; charset=utf-8`
- **Content-Disposition:** `attachment; filename=hours-export.csv`

#### Error Responses

| Status | Error | Cause |
|---|---|---|
| 400 | `Invalid year` | Year is not a valid 4-digit number in range |
| 400 | `Invalid month` | Month is not between 1 and 12 |
| 401 | `Unauthorized` | Not authenticated |
| 403 | `Forbidden` | Insufficient role |
| 403 | `No crew` | User has no crew assignment |
| 429 | `Too many requests` | Rate limit exceeded |
| 500 | `Export failed` | Server error |

---

### 2. Schedule Export

**Endpoint:** `GET /api/export/schedule`

**Source:** `src/app/(app)/api/export/schedule/route.ts`

Exports all schedules for the crew as a CSV file, with one row per position per schedule.

#### Query Parameters

None.

#### CSV Columns

| Column | Description |
|---|---|
| `Date` | Schedule date (YYYY-MM-DD) |
| `Shift Type` | Type of shift |
| `Meal` | Meal type |
| `Start Time` | Estimated start time |
| `End Time` | Estimated end time |
| `Position` | Position name |
| `Assigned Members` | Semicolon-separated list of assigned member names |
| `Note` | Schedule notes |

Schedules with no positions produce a single row with empty position and member columns. Schedules with multiple positions produce one row per position.

#### Response

- **Content-Type:** `text/csv; charset=utf-8`
- **Content-Disposition:** `attachment; filename=schedule-export.csv`

#### Error Responses

| Status | Error | Cause |
|---|---|---|
| 401 | `Unauthorized` | Not authenticated |
| 403 | `Forbidden` | Insufficient role |
| 403 | `No crew` | User has no crew assignment |
| 429 | `Too many requests` | Rate limit exceeded |
| 500 | `Export failed` | Server error |

---

### 3. Inventory Export

**Endpoint:** `GET /api/export/inventory`

**Source:** `src/app/(app)/api/export/inventory/route.ts`

Exports all inventory items for the crew as a CSV file.

#### Query Parameters

None.

#### CSV Columns

| Column | Description |
|---|---|
| `Package Name` | Name of the inventory item |
| `Nickname` | Short name / alias |
| `Category` | Category name |
| `Current Amount` | Current quantity on hand |
| `Unit` | Unit of measurement |
| `Par Level` | Target stock level |
| `Item Cost` | Cost per unit |
| `Total Cost` | Total value (cost x quantity) |
| `Storage Type` | Storage location type |
| `Use By Date` | Expiration date |

#### Response

- **Content-Type:** `text/csv; charset=utf-8`
- **Content-Disposition:** `attachment; filename=inventory-export.csv`

#### Error Responses

| Status | Error | Cause |
|---|---|---|
| 401 | `Unauthorized` | Not authenticated |
| 403 | `Forbidden` | Insufficient role (requires admin or inventory role) |
| 403 | `No crew` | User has no crew assignment |
| 429 | `Too many requests` | Rate limit exceeded |
| 500 | `Export failed` | Server error |

---

## PDF Reports

### 4. Crew Summary Report

**Endpoint:** `GET /api/export/crew-summary`

**Source:** `src/app/(app)/api/export/crew-summary/route.ts`

Generates a monthly PDF report summarizing crew activity including total hours, shifts, fill rate, and member participation.

#### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `year` | `string` | No | Four-digit year. Defaults to the current year. |
| `month` | `string` | No | Month number (1-12). Defaults to the current month. |

#### Validation Rules

1. `year` must be between 2000 and 2100.
2. `month` must be between 1 and 12.

#### Report Contents

The PDF includes:

- **Crew name**, **month**, and **year** header
- **Total hours** worked across all members
- **Total shifts** scheduled in the month
- **Active members** vs. **total members** counts
- **Fill rate** percentage (filled slots / total slots across all positions)
- **Per-member breakdown**: name, hours worked, and days worked

#### Response

- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="crew-summary-YYYY-MM.pdf"`

#### Error Responses

| Status | Error | Cause |
|---|---|---|
| 400 | `Invalid year` | Year out of range |
| 400 | `Invalid month` | Month out of range |
| 401 | `Unauthorized` | Not authenticated |
| 403 | `Forbidden` | Insufficient role |
| 403 | `No crew` | User has no crew assignment |
| 429 | `Too many requests` | Rate limit exceeded |
| 500 | `Export failed` | Server error |

---

### 5. Annual Hours Report

**Endpoint:** `GET /api/export/annual-hours`

**Source:** `src/app/(app)/api/export/annual-hours/route.ts`

Generates a yearly PDF report with monthly hour breakdowns and year-over-year comparisons.

#### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `year` | `string` | No | Four-digit year. Defaults to the current year. |

#### Validation Rules

1. `year` must be between 2000 and 2100.

#### Report Contents

The PDF includes:

- **Crew name** and **year** header
- **Total crew hours** for the year
- **Total days worked** across all members
- **Monthly breakdown**: month, hours, active members per month
- **Per-member breakdown**: name, total hours, days worked, previous year hours (for year-over-year comparison from `hoursPerYear` user field)

#### Response

- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="annual-hours-YYYY.pdf"`

#### Error Responses

| Status | Error | Cause |
|---|---|---|
| 400 | `Invalid year` | Year out of range |
| 401 | `Unauthorized` | Not authenticated |
| 403 | `Forbidden` | Insufficient role |
| 403 | `No crew` | User has no crew assignment |
| 429 | `Too many requests` | Rate limit exceeded |
| 500 | `Export failed` | Server error |

---

### 6. Inventory Valuation Report

**Endpoint:** `GET /api/export/inventory-valuation`

**Source:** `src/app/(app)/api/export/inventory-valuation/route.ts`

Generates a PDF inventory valuation report with category breakdowns, reorder recommendations, and item-level detail.

#### Query Parameters

None.

#### Report Contents

The PDF includes:

- **Crew name** header
- **Summary**: total items, total valuation, reorder count
- **Category breakdown**: category name, item count, total cost, percent of total valuation (sorted by cost descending)
- **Reorder needed list**: items below par level with package name, current amount, par level, unit, and deficit (sorted by deficit descending)
- **All items detail**: package name, category, current amount, unit, par level, item cost, total cost, and status (`ok`, `low`, or `out`)

Item status logic:
- `out` -- current amount is 0 or less
- `low` -- current amount is at or below the low stock threshold, or below par level
- `ok` -- everything else

#### Response

- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="inventory-valuation.pdf"`

#### Error Responses

| Status | Error | Cause |
|---|---|---|
| 401 | `Unauthorized` | Not authenticated |
| 403 | `Forbidden` | Insufficient role (requires admin or inventory role) |
| 403 | `No crew` | User has no crew assignment |
| 429 | `Too many requests` | Rate limit exceeded |
| 500 | `Export failed` | Server error |

---

## CSV Security

All CSV exports apply formula injection protection by prefixing formula-triggering characters (`=`, `+`, `-`, `@`, tab, carriage return) at the start of cell values with a single quote (`'`). Values containing commas, double quotes, or newlines are properly quoted.
