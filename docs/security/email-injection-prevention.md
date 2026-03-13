---
sidebar_position: 4
title: "Email Injection Prevention"
---

# Email Injection Prevention

OCFCrews includes an email campaign system that allows coordinators and administrators to send bulk emails to crew members. Securing email sending is critical because email injection attacks can turn a legitimate email system into a spam relay or phishing vector. This page documents the multiple layers of protection in place.

## Recipient Resolution from Database

Email recipients are never taken directly from user input. Instead, recipients are resolved server-side by querying the `users` collection based on the `recipientType` configured on the email document.

The `resolveRecipients()` function in `/src/app/(app)/api/send-email/route.ts` determines the recipient list:

| Recipient Type | Resolution Logic |
|---------------|-----------------|
| `all_users` | Query all users (admin only, limit 1000) |
| `all_crew_members` | Query users where `crewRole !== 'other'` (limit 500-1000) |
| `specific_crew` | Query users where `crew === crewId` (limit 500) |
| `manual` | Email addresses from the `manualRecipients` array field |

In every case except `manual`, email addresses come from the database, not from the request body. Even for manual recipients, the addresses are stored as structured `email` type fields in Payload, which enforces email format validation.

## Email Header Sanitization

The send-email route includes a dedicated `sanitizeHeader()` function that strips all ASCII control characters from user-supplied strings used in email headers:

```typescript
function sanitizeHeader(value: string): string {
  return value.replace(/[\x00-\x1F\x7F]/g, ' ').trim()
}
```

This function is applied to:
- **From address**: `sanitizeHeader((emailDoc.fromAddress) || 'noreply@ocfcrews.org')`
- **From name**: `sanitizeHeader((emailDoc.fromName) || 'OCF Crews')`
- **CC addresses**: Each CC entry is individually sanitized
- **BCC addresses**: Each BCC entry is individually sanitized

This prevents email header injection via CRLF (`\r\n`) sequences. Without this sanitization, an attacker could inject additional email headers (such as extra `To:`, `Bcc:`, or `Subject:` headers) by embedding newline characters in fields like the from name.

## Email Subject Line Break Prevention

Email subjects and other header-adjacent fields are validated at the Payload field level to reject line breaks before they even reach the send route:

```typescript
// Email subject
validate: (value) => {
  if (!value) return true
  if (/[\r\n]/.test(value)) return 'Subject may not contain line breaks.'
  return true
}

// From name
validate: (value) => {
  if (!value) return true
  if (/[\r\n]/.test(value)) return 'From name may not contain line breaks.'
  return true
}

// Headline
validate: (value) => {
  if (!value) return true
  if (/[\r\n]/.test(value)) return 'Headline may not contain line breaks.'
  return true
}
```

## CTA URL Protocol Validation

The call-to-action URL in emails is validated twice: once at the field level and again at send time. The send route re-validates the URL to ensure only `http:` and `https:` protocols are allowed:

```typescript
const ctaUrl = rawCtaUrl
  ? (() => {
      try {
        const parsed = new URL(rawCtaUrl)
        return ['https:', 'http:'].includes(parsed.protocol) ? rawCtaUrl : null
      } catch {
        return null
      }
    })()
  : null
```

This prevents `javascript:`, `data:`, or other dangerous protocol schemes from being embedded in email content.

## Rate Limiting on Verification Emails

The resend-verification endpoint (`/api/resend-verification`) implements per-email rate limiting to prevent abuse:

```typescript
const RATE_LIMIT_MS = 60_000 // 1 request per minute per email

// Rate limit: check the persisted timestamp on the user record
const lastSent = user.lastVerificationEmailSentAt
  ? new Date(user.lastVerificationEmailSentAt).getTime()
  : 0
if (Date.now() - lastSent < RATE_LIMIT_MS) {
  // Silently succeed to prevent enumeration
  return NextResponse.json({ success: true })
}
```

Key features:
- **Per-email tracking**: The `lastVerificationEmailSentAt` timestamp is stored on the user document, persisted across server restarts
- **60-second cooldown**: Only one verification email per email address per minute
- **Silent success**: Rate-limited requests return the same `{ success: true }` response as successful sends to prevent email enumeration
- **Enumeration prevention**: Non-existent and already-verified emails also return `{ success: true }`

## Coordinator Restrictions

Crew coordinators face additional restrictions when sending emails:

### Recipient Type Restrictions

The `Emails` collection `beforeChange` hook restricts what coordinators can do:

```typescript
// Non-admins cannot set recipientType to all_users
if (!checkRole(['admin'], user) && data.recipientType === 'all_users') {
  data.recipientType = 'specific_crew'
}

// Coordinators cannot use all_crew_members (which would fan out to every crew)
if (
  checkRole(['crew_coordinator'], user) &&
  !checkRole(['admin', 'editor'], user) &&
  data.recipientType === 'all_crew_members'
) {
  data.recipientType = 'specific_crew'
}
```

### Crew Scope Enforcement

Coordinators are locked to their own crew at multiple levels:

1. **Collection hook**: `specificCrew` is forced to the coordinator's crew ID on save
2. **Send route**: The route verifies the email document's `specificCrew` matches the requesting user's crew
3. **Recipient resolution**: The `resolveRecipients` function throws an error if a coordinator tries to send to a different crew

```typescript
// From the send-email route
if (isCoordinatorOnly && crewId !== userCrewId()) {
  throw new Error('Coordinators can only send to their own crew.')
}
```

### From Address Restriction

The `fromAddress` field has field-level access control restricting create and update to admin only (`adminOnlyFieldAccess`), preventing coordinators from spoofing the sender address.

## Batch Size Limits

Emails are sent in batches to prevent overwhelming the email service (Resend via SMTP):

| Context | Batch Size | Max Recipients |
|---------|-----------|----------------|
| Email campaigns (send-email route) | 10 per batch | 500 (specific crew), 1000 (all users) |
| Post notifications (afterChange hook) | 10 per batch | 500 |

```typescript
// Send in batches of 10
const batchSize = 10
for (let i = 0; i < allTo.length; i += batchSize) {
  const batch = allTo.slice(i, i + batchSize)
  const results = await Promise.allSettled(
    batch.map((to) => payload.sendEmail({ to, from, subject, html: emailHtml })),
  )
}
```

When the recipient list exceeds the query limit, a truncation warning is logged server-side and returned to the client:

```typescript
if (result.totalDocs > result.docs.length) {
  truncated = true
  payload.logger.warn(
    `[send-email] Recipient list truncated: fetched ${result.docs.length} of ${result.totalDocs} users.`
  )
}
```

## Double-Send Prevention

The send-email route implements a locking mechanism to prevent the same email campaign from being sent twice:

1. Checks if the email status is `sent` or `sending` and rejects with a 409 Conflict
2. Sets the status to `sending` before beginning delivery
3. If all sends fail, reverts the status to `draft`
4. On success (partial or full), marks the status as `sent` with a timestamp

```typescript
if (emailDoc.status === 'sent') {
  return NextResponse.json({ error: 'This email has already been sent.' }, { status: 409 })
}
if (emailDoc.status === 'sending') {
  return NextResponse.json({ error: 'This email is currently being sent.' }, { status: 409 })
}
```

## Summary of Protections

| Layer | Protection |
|-------|-----------|
| Recipient resolution | Addresses come from database, not user input |
| Header sanitization | Control characters stripped from all header fields |
| Field validation | Line breaks rejected in subject, from name, headline |
| URL validation | Only `http:` and `https:` protocols allowed in CTA URLs |
| Rate limiting | 60-second per-email cooldown on verification emails |
| Coordinator scope | Forced to own crew; cannot send to all_users or other crews |
| From address | Admin-only field access prevents spoofing |
| Batch limits | 10 per batch, 500-1000 max recipients |
| Double-send lock | Status-based locking prevents duplicate sends |
| Enumeration prevention | Consistent responses regardless of email existence |
