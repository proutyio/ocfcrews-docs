---
sidebar_position: 3
title: "Content Visibility"
---

# Content Visibility

Posts in OCFCrews support three visibility levels that control who can see the content. Visibility is enforced both at the database query level (via Payload access control) and in the admin UI.

## Visibility Levels

| Value | Label | Who Can See |
|---|---|---|
| `public` | Public (everyone) | Anyone, including unauthenticated visitors |
| `all_crews` | All Crews (members only) | Any authenticated user who has a crew role (i.e., their `crewRole` is not `other`) |
| `crew` | Crew only | Only members of the specific crew associated with the post |

The default visibility for new posts is `crew`.

## How Access Control Enforces Visibility

The Posts collection's `read` access function builds a dynamic query filter based on the requesting user's identity and role:

### Unauthenticated Users

When no user is present on the request, a `Where` constraint is returned that limits results to public posts only:

```typescript
{ visibility: { equals: 'public' } }
```

### Admin and Editor Users

Admins and editors bypass all visibility restrictions and can read every post.

### Authenticated Crew Members

For authenticated users who are not admins or editors, the access function builds an `or` query with the following conditions:

1. **Public posts** -- Always included: `{ visibility: { equals: 'public' } }`
2. **All-crews posts** -- Included only if the user's `crewRole` is not `other`: `{ visibility: { equals: 'all_crews' } }`
3. **Crew-specific posts** -- Included only if the user belongs to a crew, requiring both conditions:
   - `{ visibility: { equals: 'crew' } }`
   - `{ crew: { equals: userCrewId } }`

This means a user with `crewRole: 'other'` (unassigned) can only see public posts, even when authenticated.

## Visibility Enforcement on Create/Update

### Non-Admin Restriction

The `enforceCrewVisibility` hook runs on every `beforeValidate` event. It checks whether the user has the `admin` role. If they do not, it forces the `visibility` field to `'crew'`, regardless of what value was submitted.

This means:
- **Crew coordinators, crew leaders, and all non-admin users** can only create or edit posts with `crew` visibility
- **Admins** can set any of the three visibility levels

### Crew Association

When visibility is set to `crew`, the `crew` field becomes visible in the admin sidebar (via a `condition` function). This relationship field links the post to a specific crew and is required for crew-only posts.

## Update and Delete Restrictions

Visibility also impacts who can modify or remove posts:

| Role | Can Update | Can Delete |
|---|---|---|
| Admin, editor | All posts | All posts |
| Crew coordinator | Only posts matching their crew | Only posts matching their crew |
| Any authenticated author | Only their own posts | Only their own posts |
| Other roles (non-author) | No | No |

These constraints use the same `{ crew: { equals: crewId } }` Where filter to scope operations to the user's crew.

## Frontend Display

On the post detail page, visibility is indicated with a color-coded badge:

- **Crew only** -- Emerald badge with a lock icon and the crew name
- **All Crews** -- Violet badge with a users icon
- **Public** -- Sky blue badge with a globe icon

The author name is displayed only for crew and all-crews posts (not for public posts), providing appropriate attribution context.

## Notification Behavior

The `notifyCrewMembers` checkbox (which triggers email notifications) is only available when visibility is `crew` or `all_crews`. Public posts do not support email notifications. See the [Posts documentation](./posts.md) for details on the notification system.

## Visibility Options Constant

The visibility options are defined in `src/constants/posts.ts`:

```typescript
export const POST_VISIBILITY_OPTIONS = [
  { label: 'Public (everyone)', value: 'public' },
  { label: 'All Crews (members only)', value: 'all_crews' },
  { label: 'Crew only', value: 'crew' },
] as const
```

## Source Files

| File | Purpose |
|---|---|
| `src/collections/Posts/index.ts` | Access control functions and `enforceCrewVisibility` hook |
| `src/constants/posts.ts` | Visibility option constants |
| `src/app/(app)/posts/[slug]/page.tsx` | Frontend visibility badge rendering |
