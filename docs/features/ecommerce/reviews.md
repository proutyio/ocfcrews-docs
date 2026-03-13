---
sidebar_position: 9
title: "Product Reviews"
---

# Product Reviews

Registered users who have purchased a product can leave a star rating and optional written review. Reviews are displayed publicly on the product detail page.

## Review Fields

| Field | Type | Description |
|-------|------|-------------|
| `product` | relationship | The reviewed product (required, indexed) |
| `author` | relationship | The reviewer, auto-stamped on creation (required, indexed, read-only) |
| `rating` | number (1--5) | Star rating (required) |
| `title` | text | Review title/headline (max 200 chars) |
| `body` | textarea | Written review text (max 2000 chars) |
| `status` | select | Moderation status: `pending` (default), `approved`, or `rejected`. Only admin, coordinator, and shop_admin can update this field. Indexed. |
| `createdAt` | date | Auto-set on creation |

## Who Can Review

Any logged-in user with a completed order containing the product can submit a review. The system does not currently enforce purchase verification server-side, but the UI only shows the review form on product pages for authenticated users.

One review per user per product is enforced — submitting a second review for the same product updates the existing one.

## Display

Reviews are shown on the product detail page below the product description. Each review displays:
- Star rating (1--5)
- Review title (if provided)
- Reviewer's nickname or first name
- Written body text (if provided)
- Date posted

The aggregate average rating and total count are shown in the product header. Only approved reviews are displayed to non-admin visitors.

## Moderation Workflow

New reviews are created with a `status` of `pending`. They must be approved before they become publicly visible:

1. A user submits a review -- it is saved with `status: 'pending'`.
2. Admin, coordinator, or shop_admin reviews the submission and changes the status to `approved` or `rejected`.
3. Only `approved` reviews are visible to unauthenticated users and other regular users (who also see their own pending/rejected reviews).

The `status` field has field-level update access restricted to `admin`, `crew_coordinator`, and `shop_admin` roles. Only `admin` can delete reviews.

## Access Control

| Operation | Rule |
|-----------|------|
| **Create** | Any authenticated user |
| **Read** | Unauthenticated: only approved reviews (`{ status: { equals: 'approved' } }`). Admin / coordinator / shop_admin: all reviews. Regular authenticated users: approved reviews + their own (`{ or: [{ status: { equals: 'approved' } }, { author: { equals: user.id } }] }`) |
| **Update** | Admin / coordinator / shop_admin: all reviews. Regular users: only their own (`{ author: { equals: user.id } }`). The `status` field can only be changed by admin / coordinator / shop_admin. |
| **Delete** | Admin only |

## Related

- [Reviews Collection](../../collections/reviews)
- [Products](./products)
- [E-commerce Overview](./overview)
