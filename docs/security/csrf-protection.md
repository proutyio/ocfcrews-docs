---
sidebar_position: 6
title: "CSRF Protection"
---

# CSRF Protection

Cross-Site Request Forgery (CSRF) is an attack where a malicious website tricks a user's browser into making requests to a trusted site where the user is already authenticated. OCFCrews mitigates CSRF through multiple complementary mechanisms.

## How CSRF Attacks Work

1. A user logs into OCFCrews and receives an authentication cookie
2. While still logged in, the user visits a malicious website
3. The malicious site contains a hidden form or script that sends a request to OCFCrews
4. The browser automatically includes the OCFCrews cookie with the forged request
5. OCFCrews processes the request as if it came from the legitimate user

## Protection Mechanisms

### Cookie-Based Authentication with SameSite

Payload CMS uses HTTP-only cookies for authentication. These cookies include the `SameSite` attribute, which tells the browser when to include the cookie in cross-origin requests:

- **`SameSite=Lax`** (default): Cookies are sent with top-level navigations (GET requests from link clicks) but **not** with cross-origin form POST requests, AJAX calls, or image loads
- This means a malicious site's `<form>` POST or `fetch()` call to OCFCrews will not include the authentication cookie

Key cookie properties:
- **HttpOnly**: Cookie is not accessible via JavaScript (`document.cookie`), preventing XSS from stealing the token
- **Secure**: Cookie is only sent over HTTPS connections
- **SameSite**: Prevents cross-origin requests from including the cookie

### Server-Side Authentication Verification

Every custom API route in OCFCrews verifies authentication server-side using Payload's `auth()` method, which validates the JWT token from the cookie:

```typescript
// Example from /api/send-email/route.ts
export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestHeaders = await getHeaders()
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... proceed with authenticated request
}
```

This pattern is consistent across all custom API routes:

| Route | Auth Check |
|-------|-----------|
| `/api/schedule/sign-up` | `payload.auth({ headers })` + role check |
| `/api/schedule/log-hours` | `payload.auth({ headers })` |
| `/api/send-email` | `payload.auth({ headers })` + role check (`admin`, `editor`, `crew_coordinator`) |
| `/api/resend-verification` | No auth required (public endpoint with rate limiting) |

### Origin Header Validation (`csrfCheck`)

The **primary** CSRF defense for custom API routes is the `csrfCheck()` utility function defined in `/src/utilities/csrfCheck.ts`. This function validates that the `Origin` header of the incoming request matches the expected server URL:

```typescript
import { getServerSideURL } from './getURL'

export function csrfCheck(headers: Headers): boolean {
  const origin = headers.get('origin')
  if (!origin) return false
  try {
    const expected = new URL(getServerSideURL()).origin
    return origin === expected
  } catch {
    return false
  }
}
```

This check is applied to **all state-changing (POST/PATCH/DELETE) API routes** -- it is used in 62+ route files across the codebase. If the origin does not match, the route returns a `403 Forbidden` response:

```typescript
if (!csrfCheck(requestHeaders)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

Browsers automatically include the `Origin` header on all cross-origin requests and same-origin POST/PUT/DELETE requests. Since this header cannot be forged by cross-origin JavaScript or HTML forms, it provides robust CSRF protection. Requests without an `Origin` header (e.g., direct API calls from non-browser clients) are also rejected.

### Payload CMS Built-In CSRF

Payload CMS includes built-in CSRF protection for its own admin panel and API endpoints. The `csrf` configuration accepts an array of trusted origins. In OCFCrews, the `serverURL` configuration determines the trusted origin:

```typescript
export default buildConfig({
  serverURL: getServerSideURL(),
  // ...
})
```

Payload verifies that the `Origin` header of incoming requests matches the configured `serverURL`, rejecting requests from unexpected origins.

### JSON Content Type Enforcement

All custom API routes expect JSON request bodies parsed via `req.json()`:

```typescript
let body: RequestBody
try {
  body = await req.json()
} catch {
  return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
}
```

This provides implicit CSRF protection because:
- HTML forms can only submit `application/x-www-form-urlencoded` or `multipart/form-data` content types
- Submitting `application/json` from a cross-origin form is not possible without JavaScript
- Cross-origin JavaScript `fetch()` with a non-simple content type triggers a CORS preflight request, which will be blocked because OCFCrews does not set permissive CORS headers

### Additional Safeguards

Several other measures reduce the impact of potential CSRF attacks:

1. **Role-based authorization**: Even if a CSRF attack bypassed cookie protections, the attacker would need to know the target user has the required role for the action
2. **Crew isolation**: Actions are scoped to the authenticated user's crew, limiting the blast radius
3. **Idempotency guards**: The email send route prevents double-sends via status locking (`sending` / `sent`), so replaying a CSRF request has no additional effect
4. **Past-shift guard**: Schedule modifications are rejected for past dates, limiting the window of exploitable actions

## Security Header Support

The security headers configured in `next.config.js` complement CSRF protection:

- **`X-Frame-Options: DENY`**: Prevents the site from being embedded in iframes, blocking clickjacking attacks that could be combined with CSRF
- **`Referrer-Policy: strict-origin-when-cross-origin`**: Limits referrer information in cross-origin requests, reducing information leakage that could aid in crafting CSRF attacks

## Summary

| Mechanism | How It Prevents CSRF |
|-----------|---------------------|
| `csrfCheck()` origin validation | Rejects requests where `Origin` header doesn't match server URL (62+ routes) |
| `SameSite` cookie attribute | Browser blocks cookie on cross-origin POST/AJAX |
| `HttpOnly` cookie flag | JavaScript cannot read the auth token |
| `Secure` cookie flag | Cookie only sent over HTTPS |
| Server-side auth verification | JWT validated on every API request |
| JSON content type | Cross-origin forms cannot submit JSON |
| Payload CSRF origin check | Rejects requests from untrusted origins |
| `X-Frame-Options: DENY` | Prevents clickjacking-assisted CSRF |
| Role-based authorization | Limits what forged requests can do |
| Crew isolation | Scopes damage to single crew |
