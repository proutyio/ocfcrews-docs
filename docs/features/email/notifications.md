---
sidebar_position: 4
title: "Post Notifications"
---

# Post Notifications

When a post is published with the `notifyCrewMembers` checkbox enabled, the system automatically sends email notifications to relevant crew members. This is implemented as an `afterChange` hook on the Posts collection.

**Source**: `src/collections/Posts/index.ts` (the `sendPostNotification` hook)

## How It Works

### The `notifyCrewMembers` Checkbox

The Posts collection includes a checkbox field:

```typescript
{
  name: 'notifyCrewMembers',
  type: 'checkbox',
  label: 'Send email notification to crew members',
  defaultValue: false,
  admin: {
    position: 'sidebar',
    condition: (data) => data?.visibility === 'crew' || data?.visibility === 'all_crews',
  },
}
```

Key details:

- Only visible when the post's visibility is `crew` or `all_crews` (not for `public` posts)
- Defaults to unchecked
- Automatically unchecked after sending to prevent duplicate notifications on subsequent saves

### The `sendPostNotification` Hook

The `afterChange` hook runs whenever a post is created or updated:

```typescript
const sendPostNotification: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (!doc.notifyCrewMembers) return doc  // Skip if not checked

  // 1. Reset the flag immediately
  await req.payload.update({
    collection: 'posts',
    id: doc.id,
    data: { notifyCrewMembers: false },
    overrideAccess: true,
  })

  // 2. Only send for crew-scoped posts
  const visibility = doc.visibility
  if (visibility !== 'crew' && visibility !== 'all_crews') return doc

  // 3. Resolve recipients
  // 4. Send emails in batches
}
```

## Recipient Resolution

Recipients are determined by the post's visibility setting:

### `crew` Visibility

All users belonging to the post's specific crew:

```typescript
recipientWhere = { crew: { equals: crewId } }
```

### `all_crews` Visibility

All users with a crew role other than "other" (i.e., all active crew members across all crews):

```typescript
recipientWhere = { crewRole: { not_equals: 'other' } }
```

### Recipient Limit

Recipients are capped at **500** to prevent overwhelming the email service in a single synchronous hook. This is sufficient for crew-scale deployments.

```typescript
usersResult = await req.payload.find({
  collection: 'users',
  where: recipientWhere,
  limit: 500,
  select: { email: true },
  overrideAccess: true,
})
```

## Email Content

Post notifications use inline HTML rather than React Email components. The email includes:

- A green heading with the post title (HTML-escaped for security)
- A message indicating the post type ("A new post has been published for your crew" or "for all crews")
- A CTA button linking to the post page (`/posts/{slug}`)
- A footer with the site URL

```html
<h2 style="color:#059669;">Post Title</h2>
<p>A new post has been published for your crew.</p>
<a href="{serverUrl}/posts/{slug}" style="background:#059669;color:white;...">
  Read the post
</a>
```

### Subject Line

The subject line varies by visibility:

| Visibility | Subject |
|------------|---------|
| `crew` | `New crew post: {title}` |
| `all_crews` | `New post for all crews: {title}` |

## Batch Sending

Emails are sent in **batches of 10** using `Promise.allSettled`, the same pattern used by campaign emails:

```typescript
const batchSize = 10
for (let i = 0; i < usersResult.docs.length; i += batchSize) {
  const batch = usersResult.docs.slice(i, i + batchSize)
  const results = await Promise.allSettled(
    batch
      .filter((u) => !!u.email)
      .map((u) => req.payload.sendEmail({ to: u.email, subject, html }))
  )
  // Log failures
}
```

Failed individual sends are logged but do not prevent other emails in the batch from being sent.

## Duplicate Prevention

The `notifyCrewMembers` flag is reset to `false` immediately at the start of the hook, before any email sending begins. This ensures that:

- If the post is saved again while emails are being sent, notifications will not be re-triggered
- The flag is always unchecked after use, requiring the author to explicitly re-check it for each notification

## Post Visibility

The Posts collection supports three visibility levels:

| Value | Label | Description |
|-------|-------|-------------|
| `public` | Public (everyone) | Visible to all visitors, including unauthenticated |
| `all_crews` | All Crews (members only) | Visible to all authenticated crew members |
| `crew` | Crew only | Visible only to members of the specified crew |

Notifications are only available for `crew` and `all_crews` visibility. Public posts do not support email notifications since they are visible to everyone.

### Visibility Enforcement

Non-admin, non-editor users (coordinators and leaders) are automatically forced to `crew` visibility by the `enforceCrewVisibility` hook:

```typescript
const enforceCrewVisibility: CollectionBeforeChangeHook = ({ data, req }) => {
  const { user } = req
  if (!user) return data
  if (!checkRole(['admin', 'editor'], user)) {
    data.visibility = 'crew'
  }
  return data
}
```

This means coordinators and leaders can only send notifications to their own crew members.
