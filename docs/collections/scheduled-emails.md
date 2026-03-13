---
sidebar_position: 12
title: "Scheduled Emails"
---

# Scheduled Emails Collection

**Slug**: `scheduled-emails`

Stores recurring email campaign configurations. See [Scheduled Emails Feature](../features/communications/scheduled-emails) for full documentation.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | Text (required, max 200) | Internal label for the coordinator |
| `template` | Relationship → email-templates | Optional template to use for default content |
| `subject` | Text (required, max 500) | Subject line for the email |
| `headline` | Text (max 300) | Email headline |
| `body` | Rich text (Lexical) | Email body content |
| `ctaText` | Text (max 100) | CTA button text |
| `ctaUrl` | Text (max 2000) | CTA button URL (must be http/https) |
| `recipientType` | Select (required) | `all_crew_members` / `specific_roles` (default: `all_crew_members`) |
| `roles` | Select (hasMany) | Roles to target (when `recipientType = specific_roles`): `coordinator`, `elder`, `leader`, `member` |
| `frequency` | Select (required) | `daily` / `weekly` / `biweekly` / `monthly` |
| `dayOfWeek` | Select | Day of week (0=Sunday through 6=Saturday), shown when frequency is `weekly` or `biweekly` |
| `dayOfMonth` | Number (1-28) | Day of the month, shown when frequency is `monthly` |
| `timeOfDay` | Text | Time in HH:mm format (default: `09:00`) |
| `timezone` | Select | Timezone for scheduled send time (default: `America/Los_Angeles`). Options include US timezones and UTC. |
| `crew` | Relationship → crews (required, indexed) | Owning crew |
| `status` | Select (required) | `active` / `paused` (default: `paused`) |
| `lastRunAt` | Date (read-only) | Timestamp of last successful send |
| `nextRunAt` | Date (read-only) | Computed next delivery time |
| `createdBy` | Relationship → users (read-only) | Creator |
| `createdAt` | Date | Auto-set |

## Access Control

| Operation | Who |
|-----------|-----|
| Create | admin, editor, crew_coordinator |
| Read | admin, editor, coordinator (own crew) |
| Update | admin, editor, coordinator (own crew) |
| Delete | admin, editor, coordinator (own crew) |

## Cron Processing

Processed by `POST /api/cron/process-scheduled-emails`. The cron job runs on a schedule defined in `vercel.json`. It finds all active documents where `nextRunAt <= now()`, sends the email, updates `lastRunAt`, and computes the next `nextRunAt`.
