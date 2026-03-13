---
sidebar_position: 1
title: "In-App Notifications"
---

# In-App Notifications

OCFCrews has a per-user in-app notification system backed by the `notifications` collection. Notifications are created server-side and surfaced at `/account/notifications`.

This is separate from the [email notification system](./email/notifications.md) (which sends emails when a post is published) and [email campaigns](./email/campaigns.md).

## Notification Types

| Type | Value | Icon | Triggered by |
|------|-------|------|--------------|
| Schedule Update | `schedule_update` | Calendar | Member joins or leaves a shift, or is removed |
| Shift Swap | `shift_swap` | Repeat | Swap request sent to another user |
| Inventory Alert | `inventory_alert` | Package | Low stock events (reserved for future use) |
| Announcement | `announcement` | Bell | Manual/admin use |
| Comment | `comment` | Message | New comment on a shift |
| Guide Comment | `guide_comment` | Message | New comment on a guide |
| Guide Assignment | `guide_assignment` | Book | Guide assigned as required reading |
| Chat Message | `chat_message` | MessageCircle | New chat message |
| Chat Mention | `chat_mention` | AtSign | User mentioned in a chat message |
| Chat Thread Reply | `chat_thread_reply` | MessageCircle | Reply to a thread the user participated in |

## Data Model

**Collection slug:** `notifications`

| Field | Type | Description |
|-------|------|-------------|
| `user` | Relationship → users | The recipient. Indexed. |
| `type` | Select | One of the types above. |
| `title` | Text (max 200) | Short heading shown in the list. |
| `message` | JSON | Optional body (Lexical editor state). |
| `link` | Text (max 500) | Optional relative path or HTTPS URL to navigate to on click. |
| `read` | Checkbox | `false` on creation. Indexed for unread queries. |
| `crew` | Relationship → crews | Optional crew context for the notification. |
| `announcementId` | Text (max 64, indexed) | Links notifications from the same announcement broadcast. Auto-generated UUID. |

## Access Control

Notifications are created **server-side only** — the collection `create` access always returns `false` for client requests. All creation goes through `overrideAccess: true`.

Each user can read, update (mark as read), and delete their **own** notifications. Admins can read all notifications across all users.

## When Notifications Are Created

### Schedule Sign-ups (`/api/schedule/sign-up`)

| Event | Who gets notified |
|-------|-------------------|
| Member **joins** a position | All other members already in that position, plus the shift's assigned leads |
| Member **leaves** a position | Remaining members in the position, plus leads |
| Member is **removed** by a coordinator/leader | The removed member |

Links point to `/schedule?view=day&date=YYYY-MM-DD`.

### Shift Swaps (`/api/schedule/swap`)

Swap notifications are sent at each stage of the workflow:
- **Request created**: target member receives a `shift_swap` notification
- **Target accepts** (auto-complete): requestor is notified
- **Target accepts** (needs approval): requestor and coordinator are notified
- **Target declines**: requestor is notified
- **Coordinator approves/rejects**: both parties are notified
- **Swap expires**: both parties (direct) or requestor only (open)

### Shift Comments (`/api/schedule/comments`)

When a comment is posted on a shift, all members assigned to that shift receive a `comment` notification (excluding the commenter).

### Chat Thread Replies (`/api/chat/messages` POST)

When someone replies to a chat thread, the parent message author receives a `chat_thread_reply` notification (excluding the replier). Deduplicated: only one unread notification per channel per user.

## Creating Notifications (Server-Side)

Use the utilities in `src/utilities/createNotification.ts`:

```typescript
// Single notification
await createNotification(payload, {
  userId: 'abc123',
  type: 'schedule_update',
  title: 'Someone joined your shift',
  message: 'Jane Doe signed up for Breakfast Prep.',
  link: '/schedule?view=day&date=2025-08-10',
  crewId: 'crew456',
})

// Multiple users at once
await createNotifications(payload, ['uid1', 'uid2'], {
  type: 'announcement',
  title: 'Crew meeting tomorrow',
  crewId: 'crew456',
})
```

Both functions are **fire-and-forget** — errors are logged but never thrown, so a notification failure will never break the calling request.

In addition to creating the database record, `createNotification` also sends a **web push notification** via `sendPushToUser` if the user has push subscriptions registered. The push notification is also fire-and-forget.

## Frontend

**Page:** `/account/notifications`

The page server-renders the initial list of notifications for the logged-in user. The client component (`NotificationsList.tsx`) handles:

- Displaying unread notifications with an emerald highlight and dot indicator
- **Mark as read** on individual click
- **Mark all as read** button (shown when any unread exist)
- **Unread only** toggle — client-side filter to show only unread notifications. Shows "No unread notifications" empty state when filter is active with zero results.
- Relative timestamps ("2m ago", "3d ago", etc.)
- Clicking a notification with a `link` navigates to that URL

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/notifications` | Fetch paginated notifications for the current user. Supports `?unreadOnly=true`. Rate limited: 30 req/min. |
| `DELETE` | `/api/notifications` | Clear (delete) all notifications for the current user. Rate limited: 5 req/min. |
| `PATCH` | `/api/notifications/read` | Mark a single notification as read. Body: `{ id: string }`. |
| `POST` | `/api/notifications/read` | Mark **all** notifications as read for the current user. |
