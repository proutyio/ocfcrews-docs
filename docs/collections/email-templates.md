---
sidebar_position: 20
title: "Email Templates"
---

# Email Templates

## Overview

The **Email Templates** collection stores reusable email templates used by the email campaign system. Each template has a unique key identifier, a customizable subject line, headline, and rich text body. Templates are auto-seeded on first access with sensible defaults and can be edited by admin and editor users to customize the organization's email communications.

## Configuration

| Property | Value |
|---|---|
| **Slug** | `email-templates` |
| **Admin Group** | Emails |
| **Use As Title** | `label` |
| **Default Columns** | `label`, `key`, `defaultSubject`, `crew`, `updatedAt` |
| **Description** | "Reusable email templates. Edit the body, subject, and headline for each template type." |

## Fields

| Name | Type | Required | Position | Description |
|---|---|---|---|---|
| `key` | `select` | No | Sidebar | Unique internal identifier used to look up the template programmatically. Options: `general_announcement`, `crew_announcement`, `forgot_password`. Leave empty for custom crew templates. |
| `crew` | `relationship` | No | Sidebar | Relation to `crews`, indexed. Leave empty for global templates. Set to a crew for crew-specific templates. |
| `createdBy` | `relationship` | No | Sidebar | Relation to `users`, read-only. |
| `label` | `text` | Yes | Main | Human-readable template name (max 200 characters). |
| `defaultSubject` | `text` | No | Main | Default email subject line (max 500 characters). Used when no campaign-level subject is provided. |
| `defaultHeadline` | `text` | No | Main | Default headline (max 300 characters). Displayed as a large heading at the top of the email body. |
| `body` | `richText` | No | Main | Email body content using the shared email body Lexical editor. Supports bold, italic, lists, and links. |

### Template Keys

| Key | Label | Default Subject | Default Headline |
|---|---|---|---|
| `general_announcement` | General Announcement | "Important announcement from OCF Crews" | "Announcement" |
| `crew_announcement` | Crew Announcement | "Message from your crew coordinator" | "Message from your coordinator" |
| `forgot_password` | Forgot Password | "Reset your OCF Crews password" | "Reset Your Password" |

## Access Control

| Operation | admin | editor | crew_coordinator | All Other Roles |
|---|---|---|---|---|
| **Create** | Yes | Yes | Yes | No |
| **Read** | All | All | Global templates + own crew templates | No |
| **Update** | All | All | Own crew templates only | No |
| **Delete** | Yes | No | Own crew templates only | No |

- **Create**: Available to `admin`, `editor`, and `crew_coordinator` roles.
- **Read**: Admin and editor see all templates. Coordinators see global templates (no crew set) plus their own crew's templates.
- **Update**: Admin and editor can update all. Coordinators can only update templates scoped to their crew.
- **Delete**: Admin can delete any. Coordinators can only delete their own crew's templates.

## Hooks

### `afterOperation` -- `seedDefaultTemplates`

Seeds the three default email templates on first access. This hook:

1. Only runs on `find` operations.
2. Uses a module-level flag (`seeded`) to avoid redundant database checks after the first seed.
3. For each template key (`general_announcement`, `crew_announcement`, `forgot_password`), checks if a template with that key already exists.
4. If missing, creates the template with the default label, subject, and headline.
5. Logs success or failure for each seed operation.
6. Is idempotent -- safe to run multiple times without creating duplicates.

### `beforeChange` -- Force coordinator's crew

When a `crew_coordinator` (who is not also an admin or editor) creates or updates a template, the `crew` field is automatically set to their own crew. This prevents coordinators from creating templates for other crews.

## Relationships

| Related Collection | Field | Relationship Type | Description |
|---|---|---|---|
| **Emails** | Referenced by `template` field | One-to-many | Email campaigns can optionally reference a template to prefill subject and headline. |
