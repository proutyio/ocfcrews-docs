---
sidebar_position: 2
title: "Posts"
---

# Posts

The **Posts** collection provides a blog and announcement system for OCFCrews. Posts support rich text content, crew-scoped visibility, author tracking, hero images, email notifications, and automatic cache revalidation.

## Collection Overview

| Property | Value |
|---|---|
| Slug | `posts` |
| Admin group | Content |
| Title field | `title` (text, required, max 200 characters) |
| Default columns | title, visibility, crew, publishedAt |

## Access Control

| Operation | Who | Constraint |
|---|---|---|
| **Create** | Admin, editor, crew coordinator, crew leader | -- |
| **Read** | Unauthenticated | Only posts with `visibility: public` |
| **Read** | Authenticated (non-admin) | Public posts + `all_crews` posts (if user has a crew role) + `crew` posts matching the user's crew |
| **Read** | Admin, editor | All posts |
| **Update** | Admin, editor | All posts |
| **Update** | Crew coordinator | Only posts belonging to their crew |
| **Update** | Any authenticated author | Only their own posts |
| **Delete** | Admin, editor | All posts |
| **Delete** | Crew coordinator | Only posts belonging to their crew |
| **Delete** | Any authenticated author | Only their own posts |

## Fields

### Core Fields

| Field | Type | Details |
|---|---|---|
| `title` | Text | Required, max 200 characters |
| `content` | Rich Text | Required, uses a custom Lexical editor configuration (see [Lexical Editor](./lexical-editor.md)) |
| `slug` | Text | Unique, max 100 characters. Auto-generated from the title if not provided. Validated to allow only lowercase letters, numbers, and hyphens. |

### Sidebar Fields

| Field | Type | Details |
|---|---|---|
| `heroImage` | Upload (media) | Optional hero/banner image for the post |
| `visibility` | Select | Required, defaults to `crew`. Options: `public`, `all_crews`, `crew`. See [Visibility](./visibility.md) |
| `crew` | Relationship (crews) | Conditionally shown when visibility is `crew`. Links the post to a specific crew |
| `notifyCrewMembers` | Checkbox | Conditionally shown when visibility is `crew` or `all_crews`. Triggers email notification on save |
| `publishedAt` | Date | Auto-stamped with the current date if not set. Displays a day-and-time picker |
| `author` | Relationship (users) | Read-only, auto-populated from the creating user |

## Author Auto-Stamping

The `populateAuthor` hook runs on `beforeChange` during the `create` operation. If the request has an authenticated user and no author is already set, it automatically assigns `req.user.id` as the author. The author field is read-only in the admin panel.

## Slug Generation

If no slug is provided, the `beforeValidate` hook on the slug field auto-generates one from the title by:

1. Converting to lowercase
2. Replacing whitespace with hyphens
3. Stripping any characters that are not lowercase letters, numbers, or hyphens

The slug must be unique across all posts and is validated against the pattern `/^[a-z0-9-]+$/`.

## PublishedAt Auto-Stamping

The `publishedAt` field includes a `beforeChange` hook that sets the value to the current date if no value is provided. This ensures every post has a publication timestamp from the moment it is first saved.

## Email Notifications

When the **notifyCrewMembers** checkbox is enabled and the post is saved, the `sendPostNotification` hook fires:

1. **Resets the flag** -- Immediately unchecks `notifyCrewMembers` to prevent duplicate sends on subsequent saves.
2. **Determines recipients** based on visibility:
   - `all_crews` -- All users with a crew role (i.e., `crewRole` is not `other`), capped at 500 recipients
   - `crew` -- Only users belonging to the post's associated crew, capped at 500 recipients
   - `public` -- No notification sent (returns early)
3. **Sends emails** in batches of 10 using `req.payload.sendEmail()`. Each email includes:
   - A subject line indicating whether the post is for a specific crew or all crews
   - An HTML body with the post title and a link button to the post at `/posts/<slug>`
   - The emerald brand color for the call-to-action button
4. **Error handling** -- Failed email sends are logged but do not block the hook. `Promise.allSettled` ensures one failure does not prevent other emails from sending.

The notification checkbox is only shown in the admin panel when visibility is set to `crew` or `all_crews`.

## Cache Revalidation

Two hooks handle cache invalidation:

- **`revalidatePostCache`** (afterChange) -- Calls `revalidateTag('posts')` unless `context.disableRevalidate` is set
- **`revalidatePostDelete`** (afterDelete) -- Same behavior on deletion

This ensures the posts listing pages and any cached post queries are refreshed when content changes.

## Frontend Rendering

Posts are rendered at `/posts/<slug>` via the route at `src/app/(app)/posts/[slug]/page.tsx`. The page:

- Fetches the post by slug with `depth: 2` to populate related documents (crew, author, hero image)
- Enforces access control by passing the authenticated user (posts the user cannot see return a 404)
- Renders the hero image as a full-width banner with gradient overlay (if present)
- Displays a visibility badge (color-coded: emerald for crew, violet for all crews, sky for public)
- Shows the publication date and author name (for crew/all-crews posts)
- Renders the rich text content using the `RichText` component

## Lexical Editor Features

The Posts collection uses a custom Lexical editor configuration with the following features enabled:

- Fixed toolbar, headings (h2, h3, h4), bold, italic, underline, strikethrough
- Text alignment, indentation, ordered and unordered lists, checklists
- Blockquotes, horizontal rules, inline code
- Links (to pages and posts collections), media uploads

See the [Lexical Rich Text Editor](./lexical-editor.md) page for full details.

## Source Files

| File | Purpose |
|---|---|
| `src/collections/Posts/index.ts` | Collection configuration, hooks, and access control |
| `src/constants/posts.ts` | Visibility option constants |
| `src/app/(app)/posts/[slug]/page.tsx` | Frontend post detail page |
| `src/components/RichText/index.tsx` | Rich text rendering component |
