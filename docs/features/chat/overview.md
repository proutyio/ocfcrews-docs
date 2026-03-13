---
sidebar_position: 1
title: "Overview"
---

# PeachChat — Real-Time Messaging

PeachChat is the built-in crew messaging system for OCF Crews. It provides channel-based real-time communication scoped to crews, with support for threads, reactions, @mentions, markdown, file attachments, pinned messages, and more.

## Architecture

PeachChat uses a **polling-based** architecture (not WebSockets) designed for serverless deployment on Vercel:

- **Poll endpoint** (`/api/chat/poll`): Clients poll every 3–15 seconds (adaptive) for new messages, typing indicators, and optionally unread counts.
- **Adaptive intervals**: After 3 consecutive empty polls, the interval escalates from 3s → 5s → 10s → 15s. Resets on new activity or tab visibility change.
- **Optimistic UI**: Messages appear immediately on send; confirmed on next poll cycle.

### Key API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chat/channels` | GET, POST | List channels for active crew; create new channel |
| `/api/chat/channels/[channelId]` | PATCH | Update channel (name, description, archive, sortOrder) |
| `/api/chat/messages` | GET, POST | Fetch messages (cursor-paginated); send a message |
| `/api/chat/messages/[messageId]` | PATCH, DELETE | Edit or soft-delete a message |
| `/api/chat/messages/[messageId]/react` | POST | Toggle an emoji reaction |
| `/api/chat/messages/[messageId]/pin` | POST | Toggle pin status |
| `/api/chat/poll` | GET | Poll for new/updated messages since a timestamp |
| `/api/chat/typing` | POST | Send typing heartbeat (in-memory, 5s TTL) |
| `/api/chat/search` | GET | Full-text search across accessible channels |
| `/api/chat/unread` | GET | Get unread counts per channel |
| `/api/chat/members` | GET | List crew members for @mention autocomplete |
| `/api/chat/read-state` | POST | Mark a channel as read |
| `/api/chat/read-state` | PATCH | Toggle mute on a channel |

## Collections

PeachChat uses four collections:

| Collection | Purpose |
|-----------|---------|
| `chat-channels` | Channel definitions with crew scoping, type, archive status |
| `chat-messages` | Messages with content, attachments, reactions, thread info, edit history |
| `chat-media` | File attachments uploaded in messages |
| `chat-read-state` | Per-user-per-channel read position and mute settings |

See the [Collections Reference](/docs/collections/chat-channels) for full field details.

## Features

### Channels

- **Crew channels**: Scoped to a single crew. Only members of that crew see them. Members who belong to multiple crews can see channels from each of their crews.
- **Global channels**: No crew set — visible to all confirmed crew members across every crew (e.g., "All Crews").
- **Default channel**: Each crew has a `general` type channel created automatically. It cannot be deleted.
- **Custom channels**: Coordinators create additional channels with a name, optional description, and sort order.
- **Archive**: Coordinators can archive channels to make them read-only. Archived channels appear in a collapsed sidebar section.

### Messaging

- **Markdown**: Full GitHub-flavored markdown via `react-markdown` + `remark-gfm` (lazily loaded). Supports bold, italic, links, code blocks, lists, tables, and blockquotes.
- **Edit/Delete**: Authors can edit (with full edit history, capped at 50 entries) or soft-delete their messages. Coordinators and admins can delete any message.
- **@Mentions**: Type `@` to trigger autocomplete. Mentioned names are highlighted with orange styling.
- **File attachments**: Upload images, PDFs, and documents via the paperclip icon. Images render as thumbnails; other files as download links.

### Threads

- Reply to any message to start a thread. Replies open in a resizable side panel.
- The main feed shows a reply count and time of last reply for threaded messages.
- Thread panel uses adaptive polling (5s → 10s → 15s).

### Reactions

- Click the smiley icon on any message to open the reaction picker.
- Categorized emoji grid with ~50 emojis (Smileys, Gestures, Hearts, Objects, Nature).
- Quick-access row with 6 common emoji.
- Reactions use optimistic UI with exponential-backoff retry on conflict.

### Pinned Messages

- Coordinators and admins can pin/unpin messages.
- View all pinned messages via the pin icon in the channel header.

### Typing Indicators

- In-memory server-side store with 5s TTL per user per channel.
- Heartbeat sent every 3s while composing.
- Display: "Alice is typing...", "Alice and Bob are typing...", "3 people are typing..."
- Graceful degradation across serverless instances (no shared state required).

### Link Previews

- When a URL is pasted into a message, the server extracts Open Graph metadata (title, description, image) from the linked page.
- Metadata fetching is **fire-and-forget** in the POST handler — message is saved immediately, link preview is added asynchronously.
- SSRF protection: DNS `lookup()` + private IP rejection before fetching, `redirect: 'manual'` with per-hop DNS validation (max 3 redirects), protocol validation on OG image URLs (only `http:`/`https:`).
- Response capped at 50KB, 5-second timeout.
- `LinkPreviewCard` renders the preview below the message content with title, description, and optional image.
- Stored as a `linkPreview` JSON field on `ChatMessages` (title, description, image, url).

### Mobile Gestures

- **Long-press**: On mobile, long-pressing a message opens a `MessageActionSheet` (bottom sheet via Radix Dialog) with actions: Reply, React, Edit, Delete.
- **Swipe-to-quote**: Swiping right on a message quotes it in the reply input.
- Implemented via `useLongPress` and `useSwipeGesture` custom hooks.
- Stale closure safety: touch handlers use refs to mirror React state, ensuring correct values in `touchend` callbacks.
- `touchcancel` handler resets state for interrupted gestures (incoming calls, system gestures).

### Search

- Full-text search across all accessible channels.
- Cursor-based pagination with "Load more results" support.
- Results show channel name, author, timestamp, and matched content.

### Unread Counts

- Tracked via `chat-read-state` collection (per-user-per-channel `lastReadAt`).
- Computed via a single efficient query (not N+1).
- Sparse response: only non-zero counts included.
- Badge shown on sidebar channels and navigation tab.
- Muted channels excluded from badge counts.

## Frontend Components

All chat components are in `src/components/Chat/`:

| Component | Purpose |
|-----------|---------|
| `ChatContainer` | Main layout — sidebar + message feed + thread panel |
| `ChatSidebar` | Channel list with unread badges, archive section, create button |
| `ChannelHeader` | Channel name, description, member count, pin/search/settings icons |
| `MessageFeed` | Scrollable message list with infinite scroll |
| `MessageItem` | Individual message with actions (edit, delete, react, thread, pin) |
| `MessageInput` | Textarea with markdown, @mention autocomplete, file upload, typing heartbeat |
| `ThreadPanel` | Resizable side panel for thread replies |
| `ChatMarkdown` | Markdown renderer with @mention highlighting (lazy-loaded) |
| `MentionAutocomplete` | Dropdown for @mention user selection |
| `ReactionPicker` | Categorized emoji picker popover |
| `PinnedMessagesPanel` | Sheet showing all pinned messages for a channel |
| `ChatSearchDialog` | Search dialog with paginated results |
| `AttachmentPreview` | Image thumbnails and file download links |
| `FileUploadButton` | Hidden file input with paperclip icon |
| `TypingIndicator` | "X is typing..." display |
| `EditHistoryDialog` | View all past edits of a message |
| `CreateChannelDialog` | Form for creating new channels |
| `ChannelSettingsDialog` | Channel settings (archive/unarchive) |
| `LinkPreviewCard` | URL preview card (title, description, image) below message content |
| `MessageActionSheet` | Mobile bottom sheet with message actions (long-press trigger) |

## Hooks

| Hook | Purpose |
|------|---------|
| `useChat` | Core chat state — messages, channels, polling, send/edit/delete, unread counts |
| `useChatUnreadCount` | Lightweight unread count for navigation badges (used outside chat) |
| `useLongPress` | Detects long-press gestures for mobile message action sheet |
| `useSwipeGesture` | Detects horizontal swipe for mobile swipe-to-quote |

## Access Control

| Action | admin | editor | coordinator | elder/leader/member | unassigned |
|--------|:-----:|:------:|:-----------:|:-------------------:|:----------:|
| View crew channels | Yes | Yes | Yes | Yes | No |
| Send messages | Yes | Yes | Yes | Yes | No |
| Edit own messages | Yes | Yes | Yes | Yes | No |
| Delete own messages | Yes | Yes | Yes | Yes | No |
| Delete any message | Yes | No | Yes | No | No |
| Pin/unpin messages | Yes | No | Yes | No | No |
| Create crew channels | Yes | Yes | Yes | No | No |
| Create global channels | Yes | Yes | No | No | No |
| Archive channels | Yes | Yes | Yes | No | No |

## Performance Optimizations

- **Lazy-loaded markdown**: `react-markdown` and `remark-gfm` loaded via `React.lazy()` with `Suspense` fallback.
- **Avatar caching**: In-memory cache with 5-min TTL avoids repeated DB queries for user avatars.
- **Adaptive polling**: Reduces server load when chat is idle (3s → 5s → 10s → 15s).
- **Sparse unread counts**: Only non-zero channel counts in response, computed via efficient query.
- **Map-based message dedup**: New poll results merged with existing messages using a Map, preventing unnecessary re-renders.
- **Compound indexes**: `{ channel: 1, createdAt: -1 }` for message queries; `{ user: 1, channel: 1 }` (unique) for read state.

## Audit Logging

Chat actions are logged to the `audit-logs` collection:

| Action | Trigger |
|--------|---------|
| `chat_message_edit` | Message edited |
| `chat_message_delete` | Message deleted |
| `chat_message_pin` | Message pinned/unpinned |
| `chat_channel_create` | Channel created |
| `chat_channel_archive` | Channel archived/unarchived |
