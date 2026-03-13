---
sidebar_position: 3
title: "Email Campaigns"
---

# Email Campaigns

Email campaigns allow admins, site managers, and crew coordinators to compose and send bulk emails to crew members. Campaigns are managed through the Emails collection in the Payload CMS admin panel and sent via the `/api/send-email` route.

**Source**: `src/collections/Emails/index.ts`, `src/app/(app)/api/send-email/route.ts`

## Creating a Campaign

Campaigns are composed in the Payload admin panel at `/admin/collections/emails/create`. Each campaign has the following fields:

### Main Fields

| Field | Type | Description |
|-------|------|-------------|
| `template` | relationship (email-templates) | Optional template to prefill subject and headline |
| `subject` | text | Email subject line (required, max 500 chars, no line breaks) |
| `fromName` | text | Sender display name (default: "OCF Crews", max 200 chars) |
| `fromAddress` | email | Sender address (default: noreply@ocfcrews.org, admin only) |
| `headline` | text | Large heading at the top of the email body (max 300 chars) |
| `body` | richText | Email content using the shared email body editor |
| `ctaText` | text | Optional call-to-action button label (max 100 chars) |
| `ctaUrl` | text | CTA button URL, must use http or https (max 2000 chars) |

### Recipient Configuration

| Field | Type | Description |
|-------|------|-------------|
| `recipientType` | select | Who to send to (required) |
| `specificCrew` | relationship (crews) | Target crew (shown when recipientType is `specific_crew`) |
| `manualRecipients` | array | Individual email addresses (shown when recipientType is `manual`) |
| `additionalTo` | array | Extra addresses added to the resolved recipient list |
| `cc` | array | CC addresses |
| `bcc` | array | BCC addresses |

### Recipient Types

| Value | Label | Who Can Use | Description |
|-------|-------|-------------|-------------|
| `all_users` | All Users (admin only) | admin | Every registered user (up to 1,000) |
| `all_crew_members` | All Crew Members | admin, site_manager | All users with a crew role other than "other" |
| `specific_crew` | Specific Crew | admin, site_manager, crew_coordinator | All members of a selected crew (up to 500) |
| `manual` | Manual List | admin, site_manager, crew_coordinator | Individually entered email addresses |

### Sidebar Fields

| Field | Type | Description |
|-------|------|-------------|
| `sendButton` | UI field | Custom component that renders the "Send Campaign" button |
| `status` | select | Campaign status: `draft`, `sending`, `sent` |
| `sentAt` | date | Auto-populated timestamp when sent |
| `recipientCount` | number | Auto-populated count of recipients |

## Status Transitions

```
draft -> sending -> sent
```

| Status | Description |
|--------|-------------|
| `draft` | Campaign is being composed, not yet sent |
| `sending` | Campaign is currently being sent (prevents double-send) |
| `sent` | Campaign has been delivered |

If all sends fail, the status reverts from `sending` back to `draft`.

## Send Flow

When the "Send" button is clicked in the admin panel:

### 1. Authentication and Authorization

The `/api/send-email` route verifies:

- User is authenticated
- User has one of: admin, site_manager, or crew_coordinator roles

### 2. Document Validation

- Fetches the email document by ID
- For coordinators, verifies the email belongs to their crew
- Checks the status is not already `sent` or `sending`
- Validates the subject line is present

### 3. Status Lock

The email status is set to `sending` to prevent concurrent sends. Any subsequent request will see the `sending` status and be rejected.

### 4. Recipient Resolution

Recipients are resolved based on the `recipientType`:

- **`all_users`**: Fetches up to 1,000 users' email addresses
- **`all_crew_members`**: Fetches users where `crewRole` is not "other" (up to 1,000, or 500 for coordinator-scoped)
- **`specific_crew`**: Fetches users belonging to the specified crew (up to 500)
- **`manual`**: Uses the manually entered email addresses

Additional addresses from `additionalTo` are merged and deduplicated.

### 5. HTML Rendering

1. The Lexical rich text body is converted to HTML via `lexicalToHtml()`
2. The `AnnouncementEmail` React component is rendered with the headline, body HTML, CTA, and preview text
3. The result is a complete HTML email using the BaseLayout

### 6. Batch Sending

Emails are sent in **batches of 10** using `Promise.allSettled`:

```typescript
const batchSize = 10
for (let i = 0; i < allTo.length; i += batchSize) {
  const batch = allTo.slice(i, i + batchSize)
  const results = await Promise.allSettled(
    batch.map((to) => payload.sendEmail({ to, from, subject, html, cc, bcc }))
  )
}
```

Failed sends are counted but do not stop the remaining batches.

### 7. Status Update

- If **all sends fail**: Status reverts to `draft` and an error is returned
- If **some or all succeed**: Status is set to `sent`, with `sentAt` and `recipientCount` populated

The response includes:

```typescript
{
  success: true,
  recipientCount: number,
  deliveredCount: number,
  failCount?: number,       // Only if there were failures
  warning?: string,         // If some sends failed
  truncationWarning?: string // If recipient list was truncated
}
```

## Coordinator Restrictions

Crew coordinators have several restrictions enforced by `beforeChange` hooks:

1. **Cannot use `all_users`**: Redirected to `specific_crew`
2. **Cannot use `all_crew_members`**: Redirected to `specific_crew` (coordinators who are not also admin/site_manager are scoped to their crew)
3. **Locked to own crew**: The `specificCrew` field is always set to the coordinator's crew
4. **Cannot change `fromAddress`**: Admin-only field

## Access Control

| Operation | Access |
|-----------|--------|
| Create | admin, site_manager, crew_coordinator |
| Read | admin, site_manager see all; crew_coordinator sees emails for their specific crew |
| Update | admin, site_manager see all; crew_coordinator can update emails for their crew |
| Delete | admin only |

## Security Measures

- **Header injection prevention**: Subject, from name, from address, and all email addresses are sanitized to remove ASCII control characters
- **CTA URL validation**: Only `http:` and `https:` protocols are allowed
- **Double-send prevention**: Status-based locking prevents concurrent sends
- **Body content sanitization**: The `lexicalToHtml` function strips dangerous URL schemes from the rich text body
