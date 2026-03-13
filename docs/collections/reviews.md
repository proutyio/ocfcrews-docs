---
sidebar_position: 16
title: "Reviews"
---

# Reviews Collection

**Slug**: `reviews`

Per-product ratings and written reviews submitted by users. See [Product Reviews Feature](../features/ecommerce/reviews).

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `product` | Relationship → products (indexed) | The reviewed product |
| `author` | Relationship → users (indexed, read-only) | The reviewer (auto-set via `beforeValidate` hook on create; cannot be updated) |
| `rating` | Number (1–5, required) | Star rating |
| `title` | Text (max 200) | Optional review title |
| `body` | Textarea (max 2000) | Optional written review |
| `status` | Select (indexed) | `pending` (default) / `approved` / `rejected` — only admin, crew coordinator, and shop admin can update this field |
| `createdAt` | Date | Auto-set |
| `updatedAt` | Date | Auto-set on edit |

## Access Control

| Operation | Who |
|-----------|-----|
| Create | Any logged-in user |
| Read (unauthenticated) | Only approved reviews |
| Read (authenticated) | Admin, crew coordinator, shop admin see all; other users see approved reviews + their own |
| Update | Admin, crew coordinator, shop admin see all; author can update own review |
| Delete | Admin only |

## Moderation Workflow

Reviews start in `pending` status and must be approved by an admin, crew coordinator, or shop admin before they are publicly visible. The `status` field is restricted so that only users with those roles can change it. The `author` field is auto-stamped from the authenticated user on creation via a `beforeValidate` hook and cannot be changed afterward.

## Constraints

- One review per user per product (upsert behavior enforced at API level).
