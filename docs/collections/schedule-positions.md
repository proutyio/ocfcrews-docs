---
sidebar_position: 4
title: "Schedule Positions"
---

# Schedule Positions

## Overview

The **Schedule Positions** collection defines the types of positions available for shift sign-ups within a crew. Each crew manages its own list of positions (e.g., "Serving", "Drinks", "Prep", "Cleanup"). These positions are referenced by the `Schedules` collection in its `positions` array, where members can be assigned to specific roles for each shift.

**Source:** `src/collections/SchedulePositions/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `schedule-positions` |
| **Admin Group** | Crews |
| **Use as Title** | `name` |
| **Default Columns** | name, crew |
| **Description** | Positions available for shift sign-ups. Each crew manages its own list. |

## Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `name` | text | Yes | maxLength: 100 | Display name shown on the shift card (e.g., "Serving", "Drinks"). |
| `crew` | relationship | Yes | Relation to `crews`, indexed | The crew this position belongs to. |

## Access Control

| Operation | admin | editor | crew_coordinator | All Others |
|---|---|---|---|---|
| **Create** | Yes | Yes | Yes | No |
| **Read** | All | All | Own crew only | Own crew only (if authenticated) |
| **Update** | All | All | Own crew only | No |
| **Delete** | All | All | Own crew only | No |

All crew-scoped access uses a `Where` clause filtering by `{ crew: { equals: crewId } }`.

Unauthenticated users have no access.

## Hooks

### `beforeValidate`

1. **Auto-stamp crew**: If the requesting user has a crew and no crew is set on the data, the user's crew ID is automatically assigned.

### `beforeChange`

1. **Force crew for non-admins**: Non-admin/editor users always have the crew field stamped to their own crew ID, preventing cross-crew position creation or modification.

## Relationships

| Related Collection | Field | Direction | Description |
|---|---|---|---|
| `crews` | `crew` | Schedule Positions --> Crews | Owning crew |

Schedule Positions are referenced by the `Schedules` collection via `positions[].position`.

## Indexes

| Field | Type |
|---|---|
| `crew` | Standard |
