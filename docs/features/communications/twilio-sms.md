---
sidebar_position: 3
title: "Twilio SMS Integration"
---

# Twilio SMS Integration

OCF Crews uses [Twilio](https://www.twilio.com/) to send SMS notifications for critical schedule events. SMS is **opt-in** — users must enable it in their account settings and provide a valid phone number.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Sending phone number in E.164 format (e.g. `+15551234567`) |

All three must be set for SMS to function. If any are missing, the Twilio client is not initialized and SMS calls silently no-op.

## Core Utility

**Source:** `src/utilities/sendSms.ts`

Three exported functions:

### `sendSms(payload, to, body)`

Sends a single SMS to a phone number.

- Normalizes the phone number to E.164 format
- Enforces rate limiting (5 SMS per phone per hour)
- Truncates messages to 1600 characters (Twilio limit)
- Returns `true` on success, `false` on failure
- Logs errors with masked phone numbers (last 4 digits only)

### `sendSmsToUser(payload, userId, body)`

Sends SMS to a user by their ID. Checks that:

1. The user exists and has a `phone` field
2. The user has `smsNotifications` enabled

### `sendSmsToUsers(payload, userIds, body)`

Sends SMS to multiple users in batches of 10. Filters for users with `smsNotifications: true` and a valid phone number. Returns the count of messages sent.

## SMS Triggers

SMS is sent for three events:

| Trigger | API Route | Message |
|---------|-----------|---------|
| **Broadcast notification** | `POST /api/notify` | `[OCF Crews] {title}\n{link}` |
| **Shift removal** | `POST /api/schedule/sign-up` | `[OCF Crews] You were removed from the {date} shift. Check your schedule.` |
| **Swap approval** | `POST /api/schedule/swap` | `[OCF Crews] Your shift swap has been approved! Your positions have been swapped.` |

### Broadcast Notifications

Coordinators can check "Also send SMS" when sending a notification from `/crew/communications/notify`. The SMS toggle is **off by default** and includes a warning about per-message cost. The success toast shows the count of texts sent.

### Shift Removal & Swap Approval

These are automatic — when a coordinator removes a member from a shift or approves a swap, SMS is sent to the affected user(s) if they have SMS enabled.

## Architecture

```
Coordinator action (notify / remove / approve swap)
    │
    ▼
API Route handler
    │
    ├─ sendSmsToUser() or sendSmsToUsers()
    │       │
    │       ├─ Check user.smsNotifications === true
    │       ├─ Check user.phone exists
    │       ├─ Normalize phone to E.164
    │       ├─ Rate limit check (5/phone/hour)
    │       └─ Twilio API → SMS delivered
    │
    └─ Primary operation completes (fire-and-forget)
```

All SMS calls are **fire-and-forget** — failures are logged but never block the primary operation.

## Phone Number Handling

### Normalization

The `normalizePhone()` function in `sendSms.ts` converts various formats to E.164:

| Input | Output |
|-------|--------|
| `5551234567` (10 digits) | `+15551234567` (assumes US) |
| `15551234567` (11 digits, starts with 1) | `+15551234567` |
| `+445551234567` (international) | `+445551234567` (kept as-is) |
| `555-123` (too short) | `null` (invalid, SMS skipped) |

### User Phone Field

- **Collection:** `users`
- **Field:** `phone` (text, max 30 chars)
- **Validation:** `/^[+\d][\d ()\-.]{4,28}$/`
- **Read access:** Admin, coordinator (own crew), or self (`contactReadAccess`)
- **Update access:** Self or admin/editor

### SMS Opt-In

- **Field:** `users.smsNotifications` (checkbox, default `false`)
- **UI:** Only visible in account settings when a phone number is set
- **Description shown to users:** "Receive SMS alerts for critical schedule changes (same-day shift updates, swap approvals). Requires a valid phone number."

## Rate Limiting

| Scope | Limit | Window |
|-------|-------|--------|
| Per phone number | 5 SMS | 1 hour |

Uses the shared `rateLimit()` utility. If a phone is rate-limited, the SMS is silently skipped and a warning is logged.

## Error Handling

- All SMS operations use `try/catch` with fire-and-forget semantics
- Errors are logged via `payload.logger.error()` or `payload.logger.warn()` with `[sms]` prefix
- Phone numbers are masked in logs (only last 4 digits shown)
- SMS failures never surface as user-facing errors

## Testing

A test script is available for verifying Twilio configuration:

```bash
# Send default test message
pnpm tsx scripts/test-sms.ts +15551234567

# Send custom message
pnpm tsx scripts/test-sms.ts +15551234567 "Custom test message"
```

The script reads `TWILIO_*` env vars from `.env` and reports the message SID and delivery status.

## Related

- [Crew Communications Overview](./overview)
- [Notifications Feature](../notifications)
- [Send Email API](../../api/send-email)
- [Users Collection](../../collections/users)
