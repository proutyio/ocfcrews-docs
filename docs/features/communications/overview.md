---
sidebar_position: 1
title: "Crew Communications Overview"
---

# Crew Communications

The Crew Communications hub (`/crew/communications`) gives coordinators a dedicated set of tools for reaching their crew members via in-app notifications and email campaigns.

## Hub Navigation

| Section | Route | Description |
|---------|-------|-------------|
| Overview | `/crew/communications` | Hub landing page with quick links |
| Send Notification | `/crew/communications/notify` | In-app push + optional email |
| Compose Email | `/crew/communications/email` | Rich email campaign composer |
| Templates | `/crew/communications/templates` | Create and manage email templates |
| Scheduled Emails | `/crew/communications/scheduled` | Set up recurring email campaigns |
| History | `/crew/communications/history` | View sent email history and delivery data |
| Receipts | `/crew/communications/receipts` | View announcement read receipts and delivery tracking |

## Access Control

The communications hub is restricted to users with the `crew_coordinator` or `admin` role. Coordinators can only send to their own crew's members. Admins can send to any user or crew.

## Send Notification

The **Send Notification** form (`/crew/communications/notify`) allows coordinators to send in-app notifications with optional email and optional SMS to:

- **All crew members** — every confirmed member of their crew
- **All crews** — (admin-only) site-wide notification to every confirmed member across all crews
- **Specific roles** — e.g. leaders only
- **Individual members** — one or more selected users (user picker)

Each notification is created in the `notifications` collection with a type of `announcement`. If the email option is checked, a transactional email is also sent via the configured SMTP provider.

## Compose Email

The **Compose Email** page (`/crew/communications/email`) is a full email campaign composer. Features:

- **Recipients**: all crew, specific roles, or individual members selected via a searchable picker
- **Template picker**: apply a saved template to pre-fill subject, headline, body, and CTA
- **Rich text body**: Lexical-powered editor with headings, links, lists, and inline formatting
- **CTA button**: optional call-to-action link with customisable label and URL
- **Preview**: renders the email HTML before sending
- **Draft / Send**: save as draft (`status: 'draft'`) or send immediately (`status: 'sent'`)

Sent emails are stored in the `emails` collection and processed by the `/api/send-email` route which renders the React Email template and delivers via SMTP.

## Templates

Email templates (`/crew/communications/templates`) allow coordinators to save reusable email structures for common campaign types (e.g. "Weekly Shift Reminder", "Welcome Email").

- Coordinators can create **crew-specific** templates — only visible to their crew.
- **Global** templates are created by admins and available as read-only references.
- Templates store: subject, headline, body (rich text), and an optional CTA button.
- When composing an email, selecting a template pre-fills all fields, which can then be customised.

See also: [Email Templates Collection](../../collections/email-templates) | [Email System: Templates](../email/templates)

## History

The **History** page (`/crew/communications/history`) lists all emails sent by the coordinator (or for admins, all sent emails). Each row shows:

- Subject and send date
- Recipient count and type
- Status (`draft`, `sending`, `sent`)
- A detail view showing which recipients received the email

## Architecture

```
Coordinator fills ComposeEmailForm
    │
    ▼
POST /api/send-email
    │
    ├─ Resolve recipient user list from type/role/ids
    ├─ Render MemberEmailCampaign (React Email) for each recipient
    ├─ Send via Resend SMTP
    └─ Update Email document: status = 'sent', sentAt = now()
```

See also: [Email System Overview](../email/overview) | [Send Email API](../../api/send-email)
