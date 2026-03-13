---
sidebar_position: 2
title: "Scheduled Emails"
---

# Scheduled Emails

Scheduled emails allow crew coordinators to set up **recurring email campaigns** that are delivered automatically on a defined cadence. They are managed from `/crew/communications/scheduled`.

## Frequency Options

| Value | Description |
|-------|-------------|
| `daily` | Sent every day |
| `weekly` | Sent every 7 days from the last send date |
| `biweekly` | Sent every 14 days |
| `monthly` | Sent on the same day each calendar month |

## Configuration Fields

Each scheduled email document stores:

| Field | Description |
|-------|-------------|
| `name` | Internal label for the coordinator's reference |
| `frequency` | Recurrence interval (daily / weekly / biweekly / monthly) |
| `template` | Linked `email-templates` document used as the email body (optional) |
| `subject` | Email subject line (required, max 500 chars) |
| `headline` | Email headline (optional, max 300 chars) |
| `body` | Rich text email body (Lexical editor) |
| `ctaText` | Optional CTA button text (max 100 chars) |
| `ctaUrl` | Optional CTA button URL |
| `recipientType` | `all_crew_members` or `specific_roles` |
| `roles` | Array of role strings (when `recipientType = specific_roles`) |
| `crew` | Owning crew (auto-set from coordinator's crew) |
| `status` | Select: `active` or `paused` (default `paused`) |
| `dayOfWeek` | Day of week for weekly/biweekly frequency (0=Sunday through 6=Saturday) |
| `dayOfMonth` | Day of month for monthly frequency (1-28) |
| `timeOfDay` | Time in HH:mm format (default 09:00) |
| `timezone` | Timezone for the scheduled send time (default America/Los_Angeles) |
| `lastRunAt` | Timestamp of the last successful delivery |
| `nextRunAt` | Computed next delivery timestamp |
| `createdBy` | User who created the scheduled email (read-only) |

## Cron Processing

A Vercel cron job runs at a configurable interval (default: every hour) and calls `POST /api/cron/process-scheduled-emails`. The handler:

1. Queries for all scheduled emails where `status: 'active'` and `nextRunAt <= now()`.
2. For each match, resolves the recipient list and renders the email via the linked template.
3. Delivers via SMTP and creates an `emails` record with `status: 'sent'`.
4. Updates `lastRunAt = now()` and computes the next `nextRunAt` based on frequency.

## Pause / Resume

Coordinators can toggle the `status` field from the scheduled email list or edit page. Paused scheduled emails are skipped by the cron processor. The `nextRunAt` date is recalculated when reactivated so a long pause does not cause an immediate batch of sends.

## Access Control

- Coordinators can create, edit, pause, resume, and delete scheduled emails for their own crew.
- Admins can manage scheduled emails for any crew.
- Scheduled emails are crew-scoped — a coordinator cannot create or view another crew's scheduled emails.

## Related

- [Crew Communications Overview](./overview)
- [Email Templates](../email/templates)
- [ScheduledEmails Collection](../../collections/scheduled-emails)
