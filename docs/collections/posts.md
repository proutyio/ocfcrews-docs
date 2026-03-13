---
sidebar_position: 16
title: "Posts"
---

# Posts

## Overview

The **Posts** collection stores crew announcements and news articles with visibility controls. Posts can be scoped to the public, all crew members, or a specific crew. The collection supports rich text content with a Lexical editor, hero images, slug-based URLs, and optional email notifications to crew members upon publishing.

## Configuration

| Property | Value |
|---|---|
| **Slug** | `posts` |
| **Admin Group** | Content |
| **Use As Title** | `title` |
| **Default Columns** | `title`, `visibility`, `crew`, `publishedAt` |

## Fields

| Name | Type | Required | Position | Description |
|---|---|---|---|---|
| `title` | `text` | Yes | Main | Post title (max 200 characters). |
| `heroImage` | `upload` (media) | No | Sidebar | Optional hero/featured image for the post. |
| `content` | `richText` | Yes | Main | Post body using a Lexical editor with a curated feature set (see below). |
| `visibility` | `select` | Yes | Sidebar | Controls who can see the post. Default: `crew`. Options: `public` (everyone), `all_crews` (all logged-in crew members), `crew` (specific crew only). |
| `crew` | `relationship` (crews) | No | Sidebar | The crew this post belongs to. Indexed. Only shown when visibility is `crew`. Required for crew-only posts. |
| `notifyCrewMembers` | `checkbox` | No | Sidebar | When checked, sends email notifications to relevant crew members on save. Auto-unchecked after sending. Only shown when visibility is `crew` or `all_crews`. |
| `publishedAt` | `date` | No | Sidebar | Publication date with day-and-time picker. Auto-set to current date if not provided. |
| `author` | `relationship` (users) | No | Sidebar | The user who created the post. Read-only; auto-populated on creation. |
| `slug` | `text` | No | Sidebar | URL-friendly slug (unique, max 100 characters). Auto-generated from title. Only lowercase letters, numbers, and hyphens allowed. |

### Rich Text Editor Features

The content field uses a Lexical editor with these enabled features:

- Fixed toolbar, headings (h2, h3, h4), bold, italic, underline, strikethrough
- Text alignment, indentation, ordered lists, unordered lists, checklists
- Blockquotes, horizontal rules, inline code
- Links (to Pages and Posts collections)
- Upload (media embeds)

## Access Control

| Operation | admin | editor | crew_coordinator | crew_leader | crew_member | Unauthenticated |
|---|---|---|---|---|---|---|
| **Create** | Yes | Yes | Yes | Yes | No | No |
| **Read** | Full access | Full access | Filtered (see below) | Filtered (see below) | Filtered (see below) | Public posts only |
| **Update** | Full access | Full access | Own crew only | Own posts only | No | No |
| **Delete** | Full access | Full access | Own crew only | Own posts only | No | No |

### Read Access Details

Read access uses a visibility-based filter:

- **Unauthenticated users**: Can only see posts where `visibility = 'public'`.
- **Admin / Editor**: Full access to all posts.
- **Authenticated crew members** (non-admin/editor): Can see:
  - All `public` posts
  - All `all_crews` posts (if they have a crew role other than `other`)
  - `crew` posts belonging to their own crew

## Hooks

### `beforeChange` -- `populateAuthor`

On the `create` operation, auto-populates the `author` field with the authenticated user's ID if not already set.

### `beforeValidate` -- `enforceCrewVisibility`

Forces non-admin users to always use `visibility = 'crew'`. Only admin roles can set visibility to `public` or `all_crews`. Also auto-fills the `crew` field from the user's profile when not explicitly set.

### `afterChange` -- `sendPostNotification`

Sends email notifications to crew members when `notifyCrewMembers` is checked:

1. Immediately resets the `notifyCrewMembers` flag to `false` to prevent duplicate sends on subsequent saves.
2. Only processes posts with `crew` or `all_crews` visibility.
3. Resolves recipients: for `all_crews`, finds all users with a crew role; for `crew`, finds all members of the specific crew.
4. Caps recipients at 500 to prevent overwhelming the email service.
5. Sends emails in batches of 10, with error logging for individual failures.
6. The email includes the post title and a link to the post.

### `afterChange` -- `revalidatePostCache`

Revalidates the `posts` Next.js cache tag after any post change. Respects the `disableRevalidate` context flag.

### `afterDelete` -- `revalidatePostDelete`

Revalidates the `posts` Next.js cache tag when a post is deleted. Respects the `disableRevalidate` context flag.

### Field Hook: `publishedAt.beforeChange`

Auto-sets the `publishedAt` date to the current timestamp if no value is provided.

### Field Hook: `slug.beforeValidate`

Auto-generates a URL-friendly slug from the title if no slug is explicitly set. Converts to lowercase, replaces spaces with hyphens, and strips non-alphanumeric characters (except hyphens).

## Relationships

| Related Collection | Field | Relationship Type | Description |
|---|---|---|---|
| **Media** | `heroImage` | Many-to-one | Optional hero image for the post. |
| **Crews** | `crew` | Many-to-one | The crew a crew-scoped post belongs to. |
| **Users** | `author` | Many-to-one | The user who created the post. |
