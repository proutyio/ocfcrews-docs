---
sidebar_position: 2
title: "Email Templates"
---

# Email Templates

The EmailTemplates collection provides reusable email templates that can be referenced by campaign emails and transactional flows.

**Source**: `src/collections/EmailTemplates/index.ts`

## Collection Structure

| Field | Type | Description |
|-------|------|-------------|
| `key` | select (unique) | Internal identifier used to look up templates programmatically |
| `label` | text | Human-readable template name (required, max 200 chars) |
| `defaultSubject` | text | Default email subject line when no campaign-level subject is provided (max 500 chars) |
| `defaultHeadline` | text | Default large heading at the top of the email body (max 300 chars) |
| `body` | richText | Rich text content using the shared email body editor |
| `crew` | relationship → crews | Optional crew association (indexed). Empty for global templates. |
| `createdBy` | relationship → users | Auto-stamped creator (read-only) |

### Template Keys

The `key` field is a select with the following options:

| Key | Label | Purpose |
|-----|-------|---------|
| `general_announcement` | General Announcement | Template for site-wide announcements |
| `crew_announcement` | Crew Announcement | Template for crew-specific communications |
| `forgot_password` | Forgot Password | Template for password reset emails |

The key field is unique, meaning only one template can exist per key.

## Seed Defaults

**Source**: `src/collections/EmailTemplates/hooks/seedTemplates.ts`

When the EmailTemplates collection is first queried, an `afterOperation` hook automatically seeds default templates if they do not already exist. This ensures the system has working templates from the start.

### Seed Data

```typescript
const SEED_DEFAULTS = {
  general_announcement: {
    label: 'General Announcement',
    defaultSubject: 'Important announcement from OCF Crews',
    defaultHeadline: 'Announcement',
  },
  crew_announcement: {
    label: 'Crew Announcement',
    defaultSubject: 'Message from your crew coordinator',
    defaultHeadline: 'Message from your coordinator',
  },
  forgot_password: {
    label: 'Forgot Password',
    defaultSubject: 'Reset your OCF Crews password',
    defaultHeadline: 'Reset Your Password',
  },
}
```

### Seed Behavior

The `seedDefaultTemplates` hook:

1. Only runs on `find` operations (not create, update, or delete)
2. Uses a module-level `seeded` flag to avoid redundant DB checks after the first seed
3. Sets the flag before making internal queries to prevent re-entrant triggering
4. For each template key, checks if a template already exists
5. If not found, creates a new template with the seed defaults
6. Logs a message for each successfully seeded template
7. Errors during seeding are logged but do not prevent other templates from being seeded

## How Templates Are Used

### In Campaign Emails

The Emails collection has an optional `template` relationship field. When a coordinator selects a template, the template's default subject and headline can prefill the campaign fields. The campaign can then override these values as needed.

### In Transactional Emails

The `forgot_password` template is used by the password reset flow. The Users collection's `auth.forgotPassword.generateEmailHTML` function:

1. Queries for the `forgot_password` template
2. If found, uses its `defaultHeadline` and converts its `body` to HTML via `lexicalToHtml`
3. Passes the headline and body HTML to the `ForgotPasswordEmail` React component
4. If the template is not found, the component uses its built-in fallback text

```typescript
const result = await req.payload.find({
  collection: 'email-templates',
  where: { key: { equals: 'forgot_password' } },
  limit: 1,
  overrideAccess: true,
})
const tmpl = result.docs[0]
if (tmpl) {
  headline = tmpl.defaultHeadline ?? undefined
  bodyHtml = await lexicalToHtml(tmpl.body)
}
```

## Rich Text Editor

The email body field uses the shared `emailBodyEditor` configuration defined in `src/emails/emailEditor.ts`:

```typescript
export const emailBodyEditor = lexicalEditor({
  features: () => [
    FixedToolbarFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    OrderedListFeature(),
    UnorderedListFeature(),
    LinkFeature({ enabledCollections: ['pages', 'posts'] }),
  ],
})
```

This provides a focused set of formatting options appropriate for email content: headings, bold, italic, underline, lists, and links.

## Access Control

| Operation | Access |
|-----------|--------|
| Create | admin, site_manager, crew_coordinator |
| Read | admin, site_manager |
| Update | admin, site_manager |
| Delete | admin only |

Templates are managed by administrators, site managers, and crew coordinators. Coordinators can create and manage crew-scoped templates, while global templates are managed by admins and site managers.

## Admin Configuration

- **Group**: Emails
- **Title field**: `label`
- **Default columns**: label, key, defaultSubject, crew, updatedAt
- **Description**: "Reusable email templates. Edit the body, subject, and headline for each template type."
