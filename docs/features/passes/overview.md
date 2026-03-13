---
sidebar_position: 1
title: "Pass Management Overview"
---

# Pass Management Overview

OCFCrews includes a pass management system for tracking the distribution of **crew passes**, **parking passes**, and **camping tags** to crew members. This system is designed around year-based tracking, allowing coordinators to manage pass distribution across multiple event years.

## What It Tracks

The pass management system tracks three types of items per member per year:

| Item | Description |
|---|---|
| **Crew Pass** | The primary event entry pass issued to eligible crew members |
| **Parking Pass** | Vehicle parking authorization for the event |
| **Camping Tag** | Tag authorizing on-site camping |

Each item is tracked as a simple received/not-received boolean per year.

## Key Concepts

### Year-Based Tracking

All pass tracking is organized by year. Each user has an array of pass status entries, one per year. When a new user account is created, the system automatically initializes a pass status entry for the current year with all items marked as not received.

### Eligibility

Before a crew member can receive a crew pass, their eligibility must be set. The `crewPassEligibility` field on each user determines their status:

| Status | Description |
|---|---|
| `not_eligible` | Member is not eligible for a crew pass (default) |
| `crew` | Eligible for a standard crew pass |
| `so` | Eligible for a significant other (S.O.) pass |
| `so_paid` | Eligible for a paid significant other pass |

Eligibility is managed by admins, editors, and crew coordinators.

> **Cross-crew constraint:** A user can only hold pass eligibility on one crew at a time. If a user belongs to multiple crews, only one membership can have a non-`not_eligible` value. To transfer eligibility to a different crew, the coordinator must first set the current crew's eligibility to `not_eligible`, then set the new crew's eligibility. This is enforced by a `beforeChange` hook in the Crew Memberships collection.

### Role-Based Access

Pass management is restricted by role:

| Role | Can View Pass Status | Can Update Crew/Parking Pass | Can Update Camping Tag |
|---|---|---|---|
| Admin | All users | Yes | Yes |
| Editor | All users in scope | No | No |
| Crew coordinator | Own crew members | Yes | Yes |
| Crew leader | -- | No | Yes |
| Crew member | Own status only | No | No |

Crew leaders have a special role in pass management: they can update the camping tag received status for members in their crew, but they cannot modify crew pass or parking pass status. This allows leaders to handle camping tag distribution in the field without needing full coordinator access.

### Pass Images

Admins can upload reference images for each pass type per year via the [Pass Settings](./pass-settings.md) global. These images are displayed to members on their account page so they know what their passes look like.

## Where It Lives

Pass management is implemented across two main locations:

1. **Users collection** (`src/collections/Users/index.ts`) -- The `passStatus` array field and `crewPassEligibility` field on each user document. See [Pass Status Tracking](./pass-status.md).

2. **PassSettings global** (`src/globals/PassSettings.ts`) -- Per-year images for each pass type that are shown to members. See [Pass Settings Global](./pass-settings.md).

## Account Page Integration

Members can view their pass status on the account page at `/account`. The account page:

- Fetches the user's `passStatus` array and the `PassSettings` global
- Only displays the passes section if the user has at least one pass status entry and has a crew role (not `other`)
- For each year entry, displays whether the crew pass, parking pass, and camping tag have been received
- Shows the corresponding pass image (from PassSettings) when available, allowing members to visually identify their passes

## Workflow

A typical pass management workflow:

1. **Before the event** -- A coordinator or admin sets `crewPassEligibility` for each member to indicate who qualifies for passes
2. **Pass images uploaded** -- An admin uploads the current year's pass/tag images to the PassSettings global
3. **Distribution** -- As passes are physically distributed, coordinators mark `crewPassReceived` and `parkingPassReceived` on each member's record. Crew leaders can mark `campingTagReceived` for their members.
4. **Member verification** -- Members view their account page to confirm their passes and see what their passes look like
