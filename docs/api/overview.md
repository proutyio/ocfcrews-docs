---
sidebar_position: 1
title: "API Overview"
---

# API Overview

OCFCrews exposes three categories of APIs: **custom route handlers** built with Next.js App Router, **Payload's auto-generated REST API**, and **Payload's auto-generated GraphQL API**.

## Custom API Routes

These are hand-written Next.js route handlers located under `src/app/(app)/api/`. They implement business logic that goes beyond simple CRUD operations.

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/schedule/sign-up` | POST | Join, leave, or remove a member from a schedule position | Yes |
| `/api/schedule/log-hours` | POST | Log or update hours worked for a shift or date | Yes |
| `/api/schedule/lock` | POST | Lock or unlock a shift (coordinator only) | Yes |
| `/api/schedule/copy-week` | POST | Copy an entire week of shifts to a target week | Yes (coordinator) |
| `/api/schedule/attendance` | POST | Record attendance for a past/today shift | Yes (coordinator) |
| `/api/schedule/waitlist` | GET/POST/DELETE | Query, join, or leave a position waitlist | Yes |
| `/api/schedule/swap-board` | GET/POST/DELETE | Query, post, or claim shifts on the Swap Board | Yes |
| `/api/schedule/ical` | GET | Download iCal file of assigned shifts | Yes |
| `/api/crew-availability` | GET | Fetch member availability for a date range (with recurrence expansion) | Yes (coordinator) |
| `/api/auth/sessions` | GET/DELETE | List active sessions or revoke a session | Yes |
| `/api/auth/2fa/setup` | POST | Generate 2FA TOTP secret and QR code | Yes |
| `/api/auth/2fa/verify` | POST | Verify a TOTP code during login | Yes |
| `/api/auth/2fa/disable` | POST | Disable 2FA on the account | Yes |
| `/api/magic-link/send` | POST | Send a magic link sign-in email | No |
| `/api/magic-link/verify` | GET | Verify and consume a magic link token | No |
| `/api/crew-guides/update` | POST | Update a crew guide (including lock/unlock) | Yes |
| `/api/crew-guides/read-receipt` | POST | Record a guide read receipt | Yes |
| `/api/notify` | POST | Create announcement tracking records | Yes (coordinator) |
| `/api/feedback` | POST | Submit a bug report or feature suggestion | Yes |
| `/api/email-preview` | POST | Preview an email campaign before sending | Yes (coordinator) |
| `/api/inventory/barcode-lookup` | GET | Look up an inventory item by barcode | Yes (inventory role) |
| `/api/page-view` | POST | Record an anonymous page view event | No |
| `/api/send-email` | POST | Send an email campaign to resolved recipients | Yes (admin, editor, or coordinator) |
| `/api/resend-verification` | POST | Resend email verification to an unverified user | No |
| `/api/crews/members` | GET | List members of the authenticated user's crew | Yes (coordinator+) |
| `/api/export/hours` | GET | Export time entries as CSV | Yes (coordinator+) |
| `/api/export/schedule` | GET | Export schedules as CSV | Yes (coordinator+) |
| `/api/export/inventory` | GET | Export inventory items as CSV | Yes (inventory role) |
| `/api/export/crew-summary` | GET | PDF monthly crew summary report | Yes (coordinator+) |
| `/api/export/annual-hours` | GET | PDF annual hours report with YoY comparison | Yes (coordinator+) |
| `/api/export/inventory-valuation` | GET | PDF inventory valuation report | Yes (inventory role) |
| `/api/push-subscriptions/subscribe` | POST | Register a browser push subscription | Yes |
| `/api/push-subscriptions/unsubscribe` | POST | Remove a push subscription | Yes |
| `/api/schedule/crew-availability` | GET | Expanded crew availability for a date range | Yes (coordinator+) |
| `/api/notifications` | GET | List notifications for the authenticated user | Yes |
| `/api/notifications/read` | PATCH | Mark notifications as read | Yes |
| `/api/account/dismiss-onboarding` | POST | Mark onboarding as dismissed | Yes |
| `/api/schedule/templates` | POST | Create or update schedule templates | Yes (coordinator+) |
| `/api/schedule/apply-template` | POST | Apply a template to a date range | Yes (coordinator+) |
| `/api/schedule/bulk-create` | POST | Bulk create shifts | Yes (coordinator+) |
| `/api/schedule/bulk-lock` | POST | Lock multiple shifts at once | Yes (coordinator+) |
| `/api/schedule/copy-week` | POST | Copy an entire week of shifts | Yes (coordinator+) |
| `/api/schedule/copy-day` | POST | Copy a single day's shifts | Yes (coordinator+) |
| `/api/schedule/send-reminders` | POST | Send shift reminder notifications | Yes (coordinator+) |
| `/api/schedule/swap` | POST | Request, approve, or deny a shift swap | Yes |
| `/api/schedule/swap/targets` | GET | Get available swap target shifts | Yes |
| `/api/notify` | POST | Send announcements to crew members | Yes (coordinator+) |
| `/api/notify/search-users` | GET | Search users for notification targeting | Yes (coordinator+) |
| `/api/notify/preview` | POST | Preview a notification before sending | Yes (coordinator+) |
| `/api/announcements/[id]/receipts` | POST | Record a read receipt for an announcement | Yes |
| `/api/announcements/[id]/remind` | POST | Send a reminder for an announcement | Yes (coordinator+) |
| `/api/crew-guides/lock` | POST | Lock or unlock a crew guide | Yes (coordinator+) |
| `/api/crew-guides/comments` | POST | Add a comment to a crew guide | Yes |
| `/api/email-preview` | POST | Preview an email campaign | Yes (coordinator+) |
| `/api/discount/validate` | POST | Validate a discount code | Yes |
| `/api/orders/[id]/receipt` | GET | Download order receipt as PDF | Yes |
| `/api/bulk-order` | POST | Create a bulk order | Yes (coordinator+) |
| `/api/search` | GET | Global search across crew data | Yes |
| `/api/ping` | GET | Health check endpoint | No |
| `/api/feedback` | POST | Submit a bug report or feature suggestion | Yes |
| `/api/site-traffic` | GET | Get site traffic analytics | Yes (admin) |
| `/api/analytics` | GET | Get shop analytics | Yes (admin) |
| `/api/cron/auto-schedule` | POST | Cron: auto-generate schedules from templates | Yes (cron secret) |
| `/api/cron/aggregate-page-views` | POST | Cron: aggregate daily page view stats | Yes (cron secret) |
| `/api/cron/process-scheduled-emails` | POST | Cron: send queued scheduled emails | Yes (cron secret) |
| `/api/cron/expire-shift-swaps` | POST | Cron: expire pending swaps past shift date | Yes (cron secret) |
| `/api/auth/passkeys/register/options` | POST | Generate passkey registration options | Yes |
| `/api/auth/passkeys/register/verify` | POST | Verify and store a new passkey | Yes |
| `/api/auth/passkeys/login/options` | POST | Generate passkey login options | No |
| `/api/auth/passkeys/login/verify` | POST | Verify passkey assertion and create session | No |
| `/api/auth/passkeys` | GET/DELETE | List or delete passkeys | Yes |
| `/api/crews/[crewId]/apply` | POST | Submit a public crew application (Turnstile + CSRF) | No |
| `/api/crews/[crewId]/applications` | GET | List applications for a crew | Yes (coordinator+) |
| `/api/crews/[crewId]/applications/[id]` | PATCH | Review an application (change status, add notes) | Yes (coordinator+) |

## Payload REST API

Payload CMS automatically generates a full REST API for every registered collection and global. These endpoints follow a consistent pattern:

| Pattern | Method | Description |
|---|---|---|
| `/api/{collection}` | GET | List/query documents |
| `/api/{collection}` | POST | Create a new document |
| `/api/{collection}/{id}` | GET | Get a single document by ID |
| `/api/{collection}/{id}` | PATCH | Update a document |
| `/api/{collection}/{id}` | DELETE | Delete a document |
| `/api/globals/{slug}` | GET | Get a global document |
| `/api/globals/{slug}` | POST | Update a global document |

### Available Collection Endpoints

| Collection | REST Path |
|---|---|
| Users | `/api/users` |
| Crews | `/api/crews` |
| Pages | `/api/pages` |
| Categories | `/api/categories` |
| Media | `/api/media` |
| Avatars | `/api/avatars` |
| Schedule Positions | `/api/schedule-positions` |
| Schedules | `/api/schedules` |
| Time Entries | `/api/time-entries` |
| Posts | `/api/posts` |
| Email Templates | `/api/email-templates` |
| Emails | `/api/emails` |
| Inventory Media | `/api/inventory-media` |
| Inventory Categories | `/api/inventory-categories` |
| Inventory Subcategories | `/api/inventory-subcategories` |
| Inventory Items | `/api/inventory-items` |
| Inventory Transactions | `/api/inventory-transactions` |
| Recipes | `/api/recipes` |
| Recipe Favorites | `/api/recipe-favorites` |
| Recipe Sub Groups | `/api/recipe-sub-groups` |
| Recipe Tags | `/api/recipe-tags` |
| Shift Swaps | `/api/shift-swaps` |
| Shift Comments | `/api/shift-comments` |
| Shift Waitlist | `/api/shift-waitlist` |
| Availability | `/api/availability` |
| Crew Guides | `/api/crew-guides` |
| Guide Categories | `/api/guide-categories` |
| Guide Comments | `/api/guide-comments` |
| Guide Media | `/api/guide-media` |
| Guide Read Receipts | `/api/guide-read-receipts` |
| Guide Assignments | `/api/guide-assignments` |
| Announcement Tracking | `/api/announcement-tracking` |
| Notifications | `/api/notifications` |
| Reviews | `/api/reviews` |
| Stock Notifications | `/api/stock-notifications` |
| Discount Codes | `/api/discount-codes` |
| Orders | `/api/orders` |
| Addresses | `/api/addresses` |
| Issues | `/api/issues` |
| Page Views | `/api/page-views` |
| Page Views Daily | `/api/page-views-daily` |
| Crew Applications | `/api/crew-applications` |
| Crew Memberships | `/api/crew-memberships` |
| Crew Events | `/api/crew-events` |
| Event RSVPs | `/api/event-rsvps` |
| Scheduled Emails | `/api/scheduled-emails` |
| Push Subscriptions | `/api/push-subscriptions` |
| Chat Channels | `/api/chat-channels` |
| Chat Messages | `/api/chat-messages` |
| Chat Media | `/api/chat-media` |
| Chat Read State | `/api/chat-read-state` |
| Guide Tags | `/api/guide-tags` |
| Schedule Weeks | `/api/schedule-weeks` |
| Schedule Templates | `/api/schedule-templates` |
| Event Periods | `/api/event-periods` |
| Meal Logs | `/api/meal-logs` |

### Available Global Endpoints

| Global | REST Path |
|---|---|
| Header | `/api/globals/header` |
| Footer | `/api/globals/footer` |
| Settings | `/api/globals/settings` |
| Pass Settings | `/api/globals/pass-settings` |

## Payload GraphQL API

Payload also generates a GraphQL API accessible at `/api/graphql`. A GraphQL Playground is available in non-production environments at `/api/graphql-playground`.

## Authentication

All API requests (except public endpoints like resend-verification and crew applications) require authentication via Payload's cookie-based auth system. The session cookie is set during login and included automatically by the browser. For programmatic access, include the `Authorization` header with a valid token:

```
Authorization: JWT <token>
```

See the individual API reference pages for detailed request/response schemas and behavior documentation.

## Centralized Utilities

### Error Responses (`src/utilities/apiResponses.ts`)

All API routes use centralized error response helpers instead of inline `NextResponse.json(...)`:

| Helper | Status | Response |
|--------|--------|----------|
| `unauthorized()` | 401 | `{ error: 'Unauthorized' }` |
| `forbidden()` | 403 | `{ error: 'Forbidden' }` |
| `noCrew()` | 400 | `{ error: 'No active crew' }` |
| `tooManyRequests(retryAfter?)` | 429 | `{ error: 'Too many requests' }` with optional `Retry-After` header |

Custom error messages (e.g., `'Guide not found'`) and 429s with specific `Retry-After` headers are route-specific and not centralized.

### Cache-Control Headers (`src/constants/cacheControl.ts`)

All GET routes use centralized cache tier constants:

| Constant | Value | Use Case |
|----------|-------|----------|
| `CACHE.REALTIME` | `private, max-age=30, stale-while-revalidate=60` | Frequently changing data (chat, notifications) |
| `CACHE.MODERATE` | `private, max-age=60, stale-while-revalidate=120` | Moderately stable data (schedule, members) |
| `CACHE.STABLE` | `private, max-age=300, stale-while-revalidate=600` | Rarely changing data (guides, templates) |
| `CACHE.NO_CACHE` | `private, no-cache` | Always revalidate |
| `CACHE.NO_STORE` | `private, no-store` | Never cache (sensitive data) |
