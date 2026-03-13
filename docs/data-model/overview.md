---
sidebar_position: 1
title: "Data Model Overview"
---

# Data Model Overview

OCFCrews uses [Payload CMS 3.x](https://payloadcms.com/) with MongoDB as its database. Payload automatically generates both REST and GraphQL APIs for every collection and global defined in the configuration, so all data is accessible programmatically without writing custom endpoints.

## Collections by Domain

The application defines collections organized into several domains, plus plugin-generated collections from the ecommerce plugin.

### Account

| Slug | Description |
|------|-------------|
| `users` | All application users -- crew members, coordinators, admins. Auth-enabled collection with JWT tokens, email verification, and password reset. Users can belong to multiple crews via crew-memberships; the user record reflects the currently active crew. |
| `crews` | Crew organizations. Each crew has a name, camp location, coordinators, and a roster of members. |
| `crew-memberships` | Multi-crew support. Links a user to a crew with a role, active status, and pass eligibility. Users can have multiple memberships but only one active at a time. Switching crews syncs the active membership's fields to the user record. |

### Scheduling

| Slug | Description |
|------|-------------|
| `schedules` | Shift schedule entries for a crew, including date, shift type, meal, leads, and an array of position sign-ups. |
| `schedule-positions` | Named positions available for shift sign-ups (e.g. "Serving", "Drinks"). Each belongs to a single crew. |
| `schedule-weeks` | Weekly schedule containers controlling draft/published status. Non-privileged members cannot see shifts in draft weeks. |
| `schedule-templates` | Reusable shift definitions (shift type, meal, positions, leads, time windows) for populating a week quickly. |
| `time-entries` | Individual time log entries linking a user to a date and number of hours worked, optionally tied to a specific schedule. |
| `shift-swaps` | Position swap requests between crew members with an approval workflow (pending → approved/rejected/cancelled). |
| `shift-waitlist` | Waitlist entries for fully-staffed shift positions. |
| `availability` | Member availability records with date ranges and status (available, unavailable, preferred). |
| `crew-events` | Crew activities (parties, meetings, trainings, deadlines) visible on the schedule calendar, with optional RSVP settings. |
| `event-rsvps` | RSVP responses for crew events (going, maybe, not going). |
| `event-periods` | Named time periods for grouping meal logs and scheduling analytics. |
| `meal-logs` | Historical records of meals served, linked to schedule shifts, with people-fed counts and event period grouping. |

### Inventory

| Slug | Description |
|------|-------------|
| `inventory-items` | Physical inventory items tracked per crew -- food, supplies, equipment -- with quantity, cost, storage, dietary, and allergen data. |
| `inventory-categories` | Top-level categories for organizing inventory items (e.g. Meat, Produce, Dairy). |
| `inventory-subcategories` | Sub-categories nested under inventory categories (e.g. Peppers under Produce). |
| `inventory-transactions` | Immutable audit log of inventory changes (usage, waste, restock, adjustment) that automatically update item quantities. |
| `inventory-media` | Image uploads specifically for inventory items, scoped to a crew. |

### Recipes

| Slug | Description |
|------|-------------|
| `recipes` | Full recipe records with ingredients, instructions, cooking details, dietary tags, and crew ownership. |
| `recipe-favorites` | Per-user favorite bookmarks linking a user to a recipe within their crew. |
| `recipe-subgroups` | Crew-defined sub-categories within recipe groups (e.g. "Pancakes & Waffles" under Breakfast). |
| `recipe-tags` | Crew-defined labels for filtering recipes (e.g. "Quick & Easy", "Make Ahead"). |

### Content

| Slug | Description |
|------|-------------|
| `pages` | CMS-managed pages with hero sections, block-based layouts, SEO metadata, and draft/publish workflow. |
| `posts` | Blog/announcement posts with visibility controls (public, all crews, single crew) and optional email notifications. |
| `categories` | Content categories used for organizing shop products. |
| `media` | General-purpose media uploads (images, video, PDF) used across the site. |
| `avatars` | Profile photo uploads for user accounts. |

### Chat (PeachChat)

| Slug | Description |
|------|-------------|
| `chat-channels` | Messaging channels scoped to a crew (or global). Each crew has a default General channel; coordinators can create custom channels. |
| `chat-messages` | Individual messages with markdown content, file attachments, emoji reactions, threading, pinning, edit history, and soft-delete. |
| `chat-media` | File attachments uploaded in chat messages, stored in Cloudflare R2. |
| `chat-read-state` | Per-user-per-channel read position and mute settings for unread count calculation. |

### Email & Notifications

| Slug | Description |
|------|-------------|
| `email-templates` | Reusable email templates with rich-text body, subject, and headline for programmatic email sending. |
| `emails` | Email campaign records with recipient targeting, status tracking, and rich-text composition. |
| `scheduled-emails` | Recurring email campaigns with frequency (daily, weekly, biweekly, monthly), template, recipient targeting, and active/paused status. |
| `notifications` | In-app per-user notifications (schedule updates, shift swaps, comments, announcements). Created server-side only. |
| `push-subscriptions` | Browser push notification subscriptions storing Web Push API endpoint and encryption keys. |
| `announcement-tracking` | Read receipts for coordinator-sent notifications, tracking who has read each announcement. |

### Crew Guides

| Slug | Description |
|------|-------------|
| `crew-guides` | Wiki-style knowledge base documents per crew, with rich text content, categories, version history, and draft/published workflow. |
| `guide-categories` | Per-crew categories for organizing guides (e.g. Safety, Operations, Training) with optional sub-categories. |
| `guide-comments` | Per-guide discussion threads. Immutable — create and delete only, no editing. |
| `guide-media` | File attachments on crew guides (PDFs, images, text files). |
| `guide-read-receipts` | Tracks when each crew member reads a guide. |
| `guide-assignments` | Required reading assignments with role targeting and optional due dates. |

### Shop (Plugin-Generated)

These collections are created by the `@payloadcms/plugin-ecommerce` plugin:

| Slug | Description |
|------|-------------|
| `products` | Shop products with variants, pricing, gallery, and optional crew scoping. Customized via `ProductsCollection` override. |
| `orders` | Customer orders with line items and payment status. |
| `transactions` | Immutable Stripe payment transaction records. |
| `carts` | Shopping carts linked to authenticated users. |
| `addresses` | Customer shipping/billing addresses. |
| `discount-codes` | Promotional codes with percentage/fixed discounts, expiry dates, usage limits, and optional crew restrictions. |
| `reviews` | Product reviews with ratings and optional comments, displayed on product detail pages. |
| `stock-notifications` | Opt-in restock alerts for out-of-stock products. |

## Globals

The application defines **4 globals** -- singleton configuration objects that are not part of any collection:

| Slug | Label | Description |
|------|-------|-------------|
| `header` | Header | Site navigation header with an array of nav link items (max 6). Admin-only access. |
| `footer` | Footer | Site footer navigation with an array of nav link items (max 6). Admin-only access. |
| `settings` | Global Settings | Application-wide toggles: `shopDisabled` and `accountCreationDisabled`. Admin-only access. |
| `pass-settings` | Pass Settings | Crew/parking pass and camping tag images organized by year. Readable by coordinators, editable by admins only. |

## Auto-Generated APIs

Payload CMS automatically generates the following API endpoints for every collection:

- **REST API**: `GET /api/{collection}`, `POST /api/{collection}`, `GET /api/{collection}/{id}`, `PATCH /api/{collection}/{id}`, `DELETE /api/{collection}/{id}`
- **GraphQL API**: Available at `/api/graphql` with full query and mutation support (playground disabled in production)
- **Auth endpoints** (users collection only): `POST /api/users/login`, `POST /api/users/logout`, `POST /api/users/forgot-password`, `POST /api/users/reset-password`, `POST /api/users/verify/{token}`

All API endpoints respect the access control rules defined on each collection. See [Access Control Patterns](/docs/auth/access-control-patterns) for details.
