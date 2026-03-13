---
sidebar_position: 6
title: "React Email Components"
---

# React Email Components

OCFCrews uses [React Email](https://react.email) to build type-safe, reusable email templates. All email components are located in `src/emails/` and share a common layout through the `BaseLayout` component.

## Component Overview

```
src/emails/
  BaseLayout.tsx            # Shared email wrapper (header, footer, branding)
  AnnouncementEmail.tsx     # Campaign/announcement emails
  CrewAssignmentEmail.tsx   # Crew assignment notification emails
  ForgotPasswordEmail.tsx   # Password reset emails
  VerifyEmailEmail.tsx      # Email verification emails
  emailEditor.ts            # Shared Lexical editor configuration for email body fields
  utils/
    lexicalToHtml.ts        # Converts Lexical rich text to email-safe HTML
```

## BaseLayout

**Source**: `src/emails/BaseLayout.tsx`

The `BaseLayout` component provides the shared structure for all OCFCrews emails. Every email component wraps its content in `BaseLayout`.

### Props

```typescript
type BaseLayoutProps = {
  preview?: string       // Preview text shown in email client list views
  children: React.ReactNode
  serverUrl: string      // Base URL for assets and links
}
```

### Structure

```
+------------------------------------------+
|              HEADER                       |
|  (emerald gradient background)            |
|  [OCF Crews Logo - centered]              |
+------------------------------------------+
|                                           |
|  CONTENT                                  |
|  (passed as children)                     |
|                                           |
+------------------------------------------+
|  ─────────── divider ───────────          |
|  FOOTER                                   |
|  "OCF Crews - You're receiving this       |
|   because you're a crew member."          |
|  [server URL link in emerald]             |
+------------------------------------------+
```

### Styling

- **Body**: Light gray background (`#f3f4f6`), Inter font family
- **Container**: White background, 1px border, 10px border radius, 600px max width
- **Header**: Emerald gradient (`#064e3b` to `#059669`), centered logo
- **Content**: 32px padding on sides, 40px horizontal
- **Footer**: Gray text (`#9ca3af`), 12px font size, centered

## AnnouncementEmail

**Source**: `src/emails/AnnouncementEmail.tsx`

Used for campaign emails sent through the Emails collection.

### Props

```typescript
type AnnouncementEmailProps = {
  serverUrl: string
  headline: string        // Large heading at top of email
  bodyHtml: string        // Pre-converted HTML from lexicalToHtml()
  ctaText?: string | null // Optional CTA button label
  ctaUrl?: string | null  // Optional CTA button URL
  previewText?: string    // Email preview text (defaults to headline)
}
```

### Content

1. **Headline**: Emerald colored (`#065f46`), 24px, bold
2. **Body**: Rendered via `dangerouslySetInnerHTML` (safe because content is produced by `lexicalToHtml` which sanitizes URL schemes)
3. **CTA Button**: Optional emerald button (`#059669`) centered below the body

### Security Note

The `bodyHtml` prop must be produced by `lexicalToHtml()` only. That function strips `javascript:` and `data:` URL schemes from `href` and `src` attributes. Email clients do not execute JavaScript, so the XSS risk is limited to the email client context.

## CrewAssignmentEmail

**Source**: `src/emails/CrewAssignmentEmail.tsx`

Sent when a user is assigned to a crew via the cross-crew management board. The email is sent fire-and-forget from the management API route.

### Props

```typescript
type CrewAssignmentEmailProps = {
  serverUrl: string
  userName: string       // User's display name
  crewName: string       // Name of the assigned crew
  crewRole: string       // Role within the crew (coordinator/elder/leader/member/other)
}
```

### Content

- **Headline**: "You've Been Assigned to a Crew!"
- **Body**: Personalized message telling the user they've been assigned to `{crewName}` as a `{roleLabel}`.
- **Role label**: Uses a `roleLabels` map to convert crewRole values (`coordinator`, `elder`, `leader`, `member`, `other`) to display names.
- **CTA button**: "Go to Crew Hub" linking to `/crew/hub`
- Only sent if the user has `emailNotifications` enabled.

## ForgotPasswordEmail

**Source**: `src/emails/ForgotPasswordEmail.tsx`

Used when a user requests a password reset.

### Props

```typescript
type ForgotPasswordEmailProps = {
  serverUrl: string
  resetUrl: string       // Password reset URL with token
  headline?: string      // Custom headline from email template
  bodyHtml?: string      // Custom body HTML from email template
  userName?: string      // User's name for personalization
}
```

### Content Modes

**With template content** (headline and/or bodyHtml provided):

- Displays the custom headline
- Renders the template body HTML via `dangerouslySetInnerHTML`
- Always includes the "Reset Password" button

**Without template content** (fallback):

- Headline: "Reset Your Password"
- Personalized greeting: `Hi {userName},`
- Default body text explaining the reset process
- Note that the link expires in 1 hour
- Reassurance that ignoring the email is safe

### Common Elements

Both modes include:

- **Reset button**: Emerald CTA button linking to `resetUrl`
- **Fallback link**: Plain text URL below the button for email clients that do not render buttons

```text
Or copy this link into your browser: {resetUrl}
```

### Template Integration

The Users collection's `auth.forgotPassword.generateEmailHTML` function:

1. Queries for the `forgot_password` email template
2. If found, extracts `headline` and converts `body` to HTML
3. Passes both to `ForgotPasswordEmail`
4. If the template is not found, the component uses its built-in fallback text

## VerifyEmailEmail

**Source**: `src/emails/VerifyEmailEmail.tsx`

Used when a new user creates an account and needs to verify their email address.

### Props

```typescript
type VerifyEmailEmailProps = {
  serverUrl: string
  verifyUrl: string    // Verification URL with token
  userName?: string    // User's name for personalization
}
```

### Content

- **Headline**: "Verify Your Email Address"
- **Greeting**: `Hi {userName},` (if name is available)
- **Body**: "Thanks for signing up for OCF Crews! Click the button below to verify your email address and activate your account."
- **Safety note**: "If you didn't create an account, you can safely ignore this email."
- **CTA button**: "Verify Email Address" linking to `verifyUrl`
- **Fallback link**: Plain text URL for email clients that do not render buttons

### Integration

The Users collection's `auth.verify.generateEmailHTML` function:

```typescript
const verifyUrl = token
  ? `${serverUrl}/verify-email?token=${token}`
  : `${serverUrl}/resend-verification`

return render(VerifyEmailEmail({ serverUrl, verifyUrl, userName }))
```

If no token is available, the URL falls back to the resend verification page.

## Shared Styling

All email components use a consistent design language:

| Element | Style |
|---------|-------|
| Headings | `color: #065f46` (dark emerald), 24px, bold |
| Body text | `color: #374151` (dark gray), 15px, 1.7 line height |
| Buttons | `background: #059669` (emerald), white text, 6px border radius, 12px/28px padding |
| Fallback links | `color: #9ca3af` (light gray), 12px |
| Links | `color: #059669` (emerald), no decoration |

## lexicalToHtml Utility

**Source**: `src/emails/utils/lexicalToHtml.ts`

Converts Lexical SerializedEditorState (from Payload richText fields) to email-safe HTML.

```typescript
export async function lexicalToHtml(data: LexicalEditorData | null | undefined): Promise<string> {
  if (!data) return ''
  const html = await convertLexicalToHTMLAsync({ data, disableContainer: true })
  // Sanitize: only allow safe URL schemes in href/src attributes
  return html.replace(/((?:href|src)\s*=\s*["'])([^"']*)(["'])/gi, (match, prefix, url, suffix) => {
    const trimmed = url.trim().toLowerCase()
    if (trimmed.startsWith('http:') || trimmed.startsWith('https:') ||
        trimmed.startsWith('mailto:') || trimmed.startsWith('/') ||
        trimmed === '' || trimmed.startsWith('#')) {
      return match  // Safe scheme, keep as-is
    }
    return `${prefix}#${suffix}`  // Replace dangerous scheme with #
  })
}
```

Key features:

- Uses `convertLexicalToHTMLAsync` from `@payloadcms/richtext-lexical/html-async`
- `disableContainer: true` prevents wrapping in an extra container div
- **URL allowlisting**: Only permits `http:`, `https:`, `mailto:`, relative paths, empty, and fragment URLs
- All other schemes (e.g., `javascript:`, `data:`) are replaced with `#`
- Returns empty string for null/undefined input or on conversion errors

## Rendering to HTML

All React Email components are rendered to HTML strings using `@react-email/render`:

```typescript
import { render } from '@react-email/render'

const html = await render(
  AnnouncementEmail({ serverUrl, headline, bodyHtml, ctaText, ctaUrl })
)
```

The `render` function converts the React component tree into a complete HTML document that is compatible with email clients, including inline styles and email-specific markup.
