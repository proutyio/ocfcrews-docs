---
sidebar_position: 15
title: "Discount Codes"
---

# Discount Codes Collection

**Slug**: `discount-codes`

Promotional codes applied at checkout to reduce the order total. See [Discount Codes Feature](../features/ecommerce/discount-codes) for usage documentation.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `code` | Text (unique, indexed, max 100) | The code string entered by the user (auto-uppercased and trimmed) |
| `description` | Text (max 500) | Internal description for this discount code |
| `discountType` | Select | `percentage` (default) or `fixed` |
| `amount` | Number (required, min: 0) | Discount value — percentage (0–100) or fixed amount in USD. Percentage values over 100 are rejected by validation |
| `minOrderTotal` | Number (min: 0) | Minimum order total to apply this discount. 0 = no minimum (default: 0) |
| `maxUses` | Number (min: 0) | Maximum total redemptions. 0 = unlimited (default: 0) |
| `usedCount` | Number | How many times this code has been used (read-only, cannot be updated via API) |
| `crew` | Relationship → crews (indexed) | Optional crew restriction. Leave empty for all customers |
| `expiresAt` | Date | Optional expiry timestamp |
| `isActive` | Checkbox | Admin toggle (default: true) |
| `createdAt` | Date | Auto-set |

## Access Control

| Operation | Who |
|-----------|-----|
| Create | Admin, crew coordinator, shop admin, shop editor |
| Read | Admin see all; crew coordinator, shop admin, shop editor, shop viewer see own crew codes + global (no crew) codes |
| Update | Admin see all; crew coordinator, shop admin, shop editor see own crew codes |
| Delete | Admin see all; shop admin sees own crew codes |
| Validate (checkout) | Any logged-in user |

## Validation Endpoint

`POST /api/discount/validate` — validates a code against the current user's crew, expiry, and usage limits. Returns the discount amount on success.
