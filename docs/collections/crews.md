---
sidebar_position: 2
title: "Crews"
---

# Crews

## Overview

The **Crews** collection represents the organizational units (crews/camps) in the system. Each crew has a name, optional description, camp location, image, and a list of designated coordinators. Users are assigned to crews, and most data in the system (schedules, inventory, recipes) is scoped to a crew.

**Source:** `src/collections/Crews/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `crews` |
| **Admin Group** | Crews |
| **Use as Title** | `name` |
| **Default Columns** | name, campLocation, coordinators, image |

## Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `name` | text | Yes | maxLength: 100 | Display name of the crew. |
| `image` | upload | No | Relation to `media` | Crew profile image or banner photo. Sidebar position. |
| `slug` | text | No | Unique, maxLength: 100, regex: `/^[a-z0-9-]+$/` | URL-safe identifier. Auto-generated from name if not provided. Sidebar position. |
| `description` | textarea | No | maxLength: 2000 | Description of the crew. Displayed with 4 rows in admin. |
| `weekStartDay` | select | No | Default: `monday`. Options: `monday`, `saturday`, `sunday`. Sidebar position. | Day the scheduling week begins. |
| `campLocation` | text | No | maxLength: 200 | Physical camp location at the event. |
| `coordinators` | relationship (hasMany) | No | Relation to `users` | The designated crew coordinator(s). Automatically synced when users' `crewRole` changes. |
| `stripeAccountId` | text | No | Indexed | Stripe Connect account ID for this crew. Set automatically during Stripe onboarding. |
| `stripeOnboardingComplete` | checkbox | No | Default: `false` | Whether the Stripe Connect onboarding flow has been completed for this crew. |
| `stripePaymentsEnabled` | checkbox | No | Default: `true` | When disabled, checkout is blocked for products scoped to this crew. |

### `landingPage` Group

Configures the public join page for recruiting new volunteers. These fields are nested under the `landingPage` group.

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `joinEnabled` | checkbox | No | Default: `false` | When enabled, a public join page is available at `/crews/[slug]/join`. |
| `welcomeMessage` | textarea | No | maxLength: 2000 | Welcome message shown on the join page. Supports markdown. |
| `requirements` | array | No | maxRows: 20 | Requirements for joining the crew. Each row has a `text` (required, maxLength: 500). |
| `agreements` | array | No | maxRows: 20 | Agreements applicants must acknowledge. Each row has a `text` (required, maxLength: 500) and optional `required` checkbox (default: `true`). |
| `faq` | array | No | maxRows: 30 | FAQ entries displayed on the join page. Each row has `question` (required, maxLength: 200) and `answer` (required, maxLength: 2000, supports markdown). |
| `applicationFields` | array | No | maxRows: 10 | Custom questions on the application form. Each row has `label` (required, maxLength: 200), `required` checkbox, and `type` select (`short_text` or `long_text`). |

### Joins

| Join Field | Collection | Foreign Key | Description |
|---|---|---|---|
| `members` | `users` | `crew` | All users assigned to this crew. |
| `memberships` | `crew-memberships` | `crew` | All crew membership records for this crew. |

## Access Control

| Operation | admin | editor | crew_coordinator | All Others |
|---|---|---|---|---|
| **Create** | Yes | No | No | No |
| **Read** | Yes | Yes | Yes | Yes (public) |
| **Update** | Yes | Yes | Own crew only | No |
| **Delete** | Yes | No | No | No |

Read access is public (returns `true` for all requests), allowing crew listings to be displayed without authentication restrictions.

Crew coordinators can only update the crew document that matches their own crew ID.

## Hooks

### `afterChange`

Calls `revalidateTag('crews')` to bust the Next.js cache for any data cached under the `'crews'` tag whenever a crew document is created or updated.

### `slug.beforeValidate`

Auto-generates a URL-safe slug from the crew `name` if the slug field is empty. The generation process:
1. Converts the name to lowercase
2. Replaces whitespace with hyphens
3. Removes non-alphanumeric characters (except hyphens)

## Relationships

| Related Collection | Field | Direction | Description |
|---|---|---|---|
| `media` | `image` | Crews --> Media | Crew banner/profile image |
| `users` | `coordinators` | Crews --> Users | Designated coordinators (hasMany) |
| `users` | `members` | Users --> Crews (join) | All crew members via `user.crew` |

## Indexes

| Field | Type |
|---|---|
| `slug` | Unique + Standard |
| `stripeAccountId` | Standard |
