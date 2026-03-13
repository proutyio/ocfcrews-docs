---
sidebar_position: 3
title: "Access Control"
---

# PeachChat Access Control

Chat access is enforced at both the collection level (Payload access functions) and the API route level (role checks, crew isolation).

## Channel Visibility

Channels are filtered by crew:

```typescript
read: ({ req: { user } }) => {
  if (!user) return false
  if (checkRole(['admin', 'editor'], user)) return true
  const crewId = getUserCrewId(user)
  if (!crewId || user.crewRole === 'other') return false
  // User sees their crew's channels + global channels (no crew set)
  return {
    or: [
      { crew: { exists: false } },
      { crew: { equals: crewId } },
    ],
  }
}
```

- **Crew channels**: Only visible to members of that crew
- **Global channels** (crew field empty): Visible to all confirmed crew members across every crew
- **Unassigned users**: Cannot access any channels

## Message Visibility

Messages inherit visibility from their channel. The access layer filters by channels the user can access:

- Read: Users see messages in channels they have access to
- Create: Any authenticated crew member can send messages to accessible channels
- Update (edit): Author only, or admin
- Delete (soft-delete): Author can delete own; coordinators and admins can delete any message in their crew

## API Route Security

Every chat API route implements:

1. **Authentication**: `payload.auth({ headers })` — rejects 401 if no valid session
2. **Rate limiting**: `rateLimit(key, limit, windowMs)` on all routes (GET and mutation)
3. **CSRF**: `csrfCheck(headers)` on all mutation endpoints
4. **Crew isolation**: Channels filtered by `crew: { equals: crewId }` or global
5. **Input validation**: Max lengths, type checks, sanitization on all user input

### Channel Creation

| Role | Can create crew channels | Can create global channels |
|------|:------------------------:|:--------------------------:|
| Admin | Yes (any crew) | Yes |
| Coordinator | Yes (own crew only) | No |
| Other roles | No | No |

### Channel Management

| Action | Admin | Coordinator | Other |
|--------|:-----:|:-----------:|:-----:|
| Rename channel | Yes | Own crew | No |
| Update description | Yes | Own crew | No |
| Archive/unarchive | Yes | Own crew | No |
| Delete non-custom channels (general, announcements) | No | No | No |
| Change sort order | Yes | Own crew | No |

### Message Actions

| Action | Admin | Coordinator | Author | Other |
|--------|:-----:|:-----------:|:------:|:-----:|
| Send message | Yes | Yes | — | Yes (crew member) |
| Edit message | Yes (no time limit) | No | Yes (15-min window) | No |
| Delete message | Yes | Yes (own crew) | Yes | No |
| Pin/unpin | Yes | Yes (own crew) | No | No |
| React | Yes | Yes | Yes | Yes (crew member) |

## @Mention Member Scope

The `/api/chat/members` endpoint returns crew members for autocomplete. It is crew-scoped:

- **Regular users**: See only members of their own crew
- **Admins**: See all users with a crew role

This prevents cross-crew data leakage through the mention system.
