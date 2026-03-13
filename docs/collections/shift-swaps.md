---
sidebar_position: 10
title: "Shift Swaps"
---

# Shift Swaps Collection

**Slug**: `shift-swaps`

Tracks position swap requests between crew members. See [Shift Swaps Feature](../features/scheduling/shift-swaps) for the full workflow documentation.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | Select (indexed) | `direct` (default) or `open` — direct targets a specific member, open is available for anyone to claim |
| `requestor` | Relationship → users (indexed) | Member initiating the swap (auto-set via hook) |
| `requestorSchedule` | Relationship → schedules | Requestor's schedule |
| `requestorPositionIndex` | Number (min: 0) | Position slot index in the requestor's schedule |
| `target` | Relationship → users (indexed) | Member being asked to swap (hidden for open swaps) |
| `targetSchedule` | Relationship → schedules | Target's schedule (hidden for open swaps) |
| `targetPositionIndex` | Number (min: 0) | Position slot index in the target's schedule (hidden for open swaps) |
| `claimedBy` | Relationship → users | User who claimed an open swap (visible only for open swaps) |
| `status` | Select (indexed) | `pending` (default) / `approved` / `rejected` / `cancelled` / `expired` |
| `targetAccepted` | Checkbox | Set to `true` when the target member accepts the swap |
| `crew` | Relationship → crews (indexed) | Owning crew (auto-set via hook) |
| `reviewedBy` | Relationship → users | Who approved or rejected |
| `reviewedAt` | Date | When the review action occurred |
| `message` | Textarea (max 500) | Optional note from the requestor |
| `createdAt` | Date | Auto-set on creation |

## Status Transitions

```
pending → cancelled     (requestor)
pending → expired       (daily cron — past shift date)
pending → targetAccepted (target accepts)
pending → rejected      (target declines)
targetAccepted → approved (auto-complete if no shift lead, or coordinator approves)
targetAccepted → rejected (coordinator rejects)
approved → [*]          (positions atomically swapped)
```

## Hooks

### `beforeValidate`

On create, the hook auto-stamps `requestor` from the authenticated user and `crew` from the user's active crew. Admin users are exempt from this override.

## Access Control

| Operation | Who |
|-----------|-----|
| Create | Any confirmed crew member (must have an active crew) |
| Read | Admin/editor see all; coordinator/leader see own crew; members see swaps where they are requestor or target, plus open swaps in their crew |
| Update | Admin/editor see all; coordinator/leader see own crew; requestor can update own pending swaps only |
| Delete | Admin only |

## Notifications Triggered

- `pending` created → notify target member
- Target accepts (auto-complete) → notify requestor
- Target accepts (needs coordinator) → notify requestor + coordinator
- Target declines → notify requestor
- Coordinator approves → notify requestor + target
- Coordinator rejects → notify requestor
- `cancelled` → notify target
- `expired` → notify both parties (direct) or requestor only (open)

## Auto-Expiry

A daily cron job (`/api/cron/expire-shift-swaps`, 1am UTC) finds pending swaps with past shift dates and updates them to `status: 'expired'`. API guards on approve/claim routes also reject and auto-expire past-date swaps.
