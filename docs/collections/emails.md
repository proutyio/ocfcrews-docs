---
sidebar_position: 21
title: "Emails"
---

# Emails

## Overview

The **Emails** collection powers the email campaign system. It allows admin, site manager, and crew coordinator users to compose and send email campaigns to crew members. Each email record tracks its subject, recipients, body content, sending status, and delivery metadata. The collection supports multiple recipient targeting modes -- from all users to specific crews to manual address lists.

## Configuration

| Property | Value |
|---|---|
| **Slug** | `emails` |
| **Admin Group** | Emails |
| **Use As Title** | `subject` |
| **Default Columns** | `subject`, `recipientType`, `status`, `sentAt`, `recipientCount` |
| **Description** | "Compose and send email campaigns to crew members." |

## Fields

### Sidebar Fields

| Name | Type | Required | Description |
|---|---|---|---|
| `sendButton` | `ui` | -- | Custom UI component (`SendEmailButton`) that triggers the email send action. |
| `status` | `select` | Yes | Current sending status. Default: `draft`. Options: `draft`, `sending`, `sent`. Auto-updated when an email is sent. |
| `sentAt` | `date` | No | Timestamp of when the email was sent. Read-only; auto-populated on send. Displayed with day-and-time format. |
| `recipientCount` | `number` | No | Number of recipients the email was sent to. Read-only; auto-populated on send. |

### Main Fields

| Name | Type | Required | Description |
|---|---|---|---|
| `template` | `relationship` (email-templates) | No | Optional template to prefill subject and headline. |
| `subject` | `text` | Yes | Email subject line (max 500 characters). Line breaks are not allowed. |
| `fromName` | `text` | No | Sender display name (max 200 characters). Default: `"OCF Crews"`. Line breaks are not allowed. |
| `fromAddress` | `email` | No | Sender email address. Default: `noreply@ocfcrews.org`. **Admin-only field** -- only admins can create or update this field. |
| `recipientType` | `select` | Yes | Determines the recipient list. Default: `specific_crew`. Options: see table below. |
| `specificCrew` | `relationship` (crews) | No | The crew to send to. Only shown when `recipientType` is `specific_crew`. |
| `manualRecipients` | `array` | No | Manual list of email addresses. Only shown when `recipientType` is `manual`. Each entry has `email` (required) and `name` (optional) fields. |
| `additionalTo` | `array` | No | Extra email addresses added to the resolved recipient list. Each entry has an `email` field (required). |
| `cc` | `array` | No | CC email addresses. Each entry has an `email` field (required). |
| `bcc` | `array` | No | BCC email addresses. Each entry has an `email` field (required). |
| `headline` | `text` | No | Large heading displayed at the top of the email body (max 300 characters). Line breaks are not allowed. |
| `body` | `richText` | No | Email body content using the shared email body Lexical editor. |
| `ctaText` | `text` | No | Optional call-to-action button label (max 100 characters). Line breaks are not allowed. |
| `ctaUrl` | `text` | No | URL the CTA button links to (max 2000 characters). Must use `http` or `https` protocol. Validated as a valid URL. |

### Recipient Type Options

| Value | Label | Availability |
|---|---|---|
| `all_users` | All Users | Admin only (enforced by hook) |
| `all_crew_members` | All Crew Members | Admin and site manager only (coordinators are redirected to `specific_crew`) |
| `specific_crew` | Specific Crew | All permitted roles |
| `manual` | Manual List | All permitted roles |

## Access Control

| Operation | admin | site_manager | crew_coordinator | All Other Roles |
|---|---|---|---|---|
| **Create** | Yes | Yes | Yes | No |
| **Read** | Full access | Full access | Own crew emails only | No |
| **Update** | Full access | Full access | Own crew emails only | No |
| **Delete** | Yes | No | No | No |

### Access Details

- **Create**: Available to `admin`, `site_manager`, and `crew_coordinator` roles.
- **Read / Update**: Admin and site manager get full access. Crew coordinators can only see/edit emails where `specificCrew` matches their crew. Other roles are denied.
- **Delete**: Restricted to `admin` only via the `adminOnly` access function.

### Field-Level Access

| Field | Create | Update | Description |
|---|---|---|---|
| `fromAddress` | Admin only | Admin only | Only admins can set or change the sender address. Non-admins see the default value but cannot modify it. |

## Hooks

### `beforeChange`

A single `beforeChange` hook enforces multiple business rules:

1. **Restrict `all_users` recipient type**: Non-admin users who attempt to set `recipientType` to `all_users` are automatically redirected to `specific_crew`.

2. **Restrict `all_crew_members` for coordinators**: Crew coordinators (who are not also admin/site_manager) cannot use the `all_crew_members` recipient type. It is redirected to `specific_crew` to ensure the send route correctly scopes to their crew.

3. **Lock coordinators to their own crew**: Crew coordinators (who are not also admin/site_manager) have their `specificCrew` field automatically set to their own crew ID, preventing them from sending emails to other crews.

## Relationships

| Related Collection | Field | Relationship Type | Description |
|---|---|---|---|
| **Email Templates** | `template` | Many-to-one | Optionally references a template to prefill subject and headline. |
| **Crews** | `specificCrew` | Many-to-one | The target crew for `specific_crew` recipient type emails. |
