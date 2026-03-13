---
sidebar_position: 8
title: "Bulk Orders"
---

# Bulk Orders

The bulk order feature allows crew coordinators to place a single coordinated order on behalf of multiple crew members. Each member receives their own individual order record and is responsible for their own payment.

## Route

`/shop/bulk-order` — accessible to users with the `crew_coordinator`, `shop_admin`, or `admin` role.

## How It Works

1. The coordinator opens the bulk order form and selects a product (or multiple products).
2. They choose which crew members to include — via a searchable member picker.
3. For each selected member, they specify the quantity and any variant options.
4. The coordinator submits the bulk order.
5. The system creates a separate `order` document for each selected member with `status: 'pending'`.
6. Each member receives a notification (and optionally an email) with a link to their individual order to complete payment.

## Coordinator View

Coordinators can view all bulk orders they have created from the **Crew Payments** page (`/crew/payments`) or from the `orders` collection in the admin panel, filtering by the crew.

## Member Experience

Each member sees their individual order in `/orders`. They can pay for it independently using the standard checkout flow — Stripe handles payment per order.

## Access Control

| Action | Who |
|--------|-----|
| Create bulk order | Coordinator, Shop Admin, Admin |
| View bulk orders (all crew) | Coordinator, Shop Admin, Admin |
| View own order | The individual member |
| Pay for an order | The individual member |

## Related

- [E-commerce Overview](./overview)
- [Orders](./orders)
- [Stripe Integration](./stripe-integration)
