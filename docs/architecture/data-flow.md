---
sidebar_position: 3
title: "Data Flow"
---

# Data Flow

This page explains how data flows through the OCFCrews application for the most common operations: page loads, client-side mutations, and authentication.

## The In-Process Advantage

The most important architectural detail to understand is that **Payload CMS runs inside the same Node.js process as Next.js**. When a server component calls `getPayload()`, it gets a direct reference to the Payload instance -- there is no HTTP request between Next.js and Payload. This eliminates network latency for all server-side data access and means the "API call" is actually a function call within the same process.

```typescript
// This is a direct in-process call, NOT an HTTP request
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const payload = await getPayload({ config: configPromise })
const schedules = await payload.find({ collection: 'schedules', where: { ... } })
```

## Server Component Render

The most common data flow is a server component fetching data during SSR. No client-side fetch calls are needed for the initial page load.

```mermaid
sequenceDiagram
    participant Browser
    participant Next as Next.js Server
    participant Payload as Payload CMS (in-process)
    participant DB as MongoDB Atlas

    Browser->>Next: GET /schedule
    Note over Next: Server Component executes
    Next->>Payload: getPayload() + payload.find()
    Note over Next,Payload: Direct function call (no HTTP)
    Payload->>DB: Mongoose query
    DB-->>Payload: Documents
    Payload-->>Next: Typed result
    Note over Next: Render React to HTML
    Next-->>Browser: HTML + RSC payload
    Note over Browser: Hydrate client components
```

**Key points:**
- The server component imports `getPayload` and calls the Local API directly.
- Payload applies access control based on the authenticated user (extracted from the `payload-token` cookie via `headers()`).
- The HTML is streamed to the browser along with the React Server Component payload for hydration.
- Client components (marked with `'use client'`) hydrate on the browser and become interactive.

## Client-Side Mutation (API Route)

When a user performs an action (e.g., signing up for a shift position), the client component sends a fetch request to a Next.js API route, which then calls Payload's Local API.

```mermaid
sequenceDiagram
    participant Client as Client Component
    participant API as API Route Handler
    participant Payload as Payload CMS (in-process)
    participant DB as MongoDB Atlas

    Client->>Client: Optimistic UI update
    Client->>API: POST /api/schedule/sign-up
    Note over Client,API: payload-token cookie sent automatically
    API->>Payload: payload.auth({ headers })
    Payload-->>API: Authenticated user
    API->>Payload: payload.findByID() + payload.update()
    Note over API,Payload: Direct function call (no HTTP)
    Payload->>DB: Mongoose update
    DB-->>Payload: Updated document
    Payload-->>API: Result
    API-->>Client: JSON response
    Client->>Client: Confirm or rollback optimistic update
```

**Key points:**
- The client component performs an **optimistic UI update** before the server responds, so the UI feels instant.
- The `payload-token` cookie is sent automatically with the fetch request (same-origin).
- The API route authenticates the user via `payload.auth({ headers: await getHeaders() })`.
- On success, the optimistic state is confirmed. On failure, the UI reverts to the previous state and displays a toast error via `sonner`.

### Example: Schedule Sign-Up API Route

The `/api/schedule/sign-up` route demonstrates the complete mutation pattern:

```typescript
// src/app/(app)/api/schedule/sign-up/route.ts
export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestHeaders = await getHeaders()
  const payload = await getPayload({ config: configPromise })

  // 1. Authenticate the user from the cookie
  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Validate the request body
  const { shiftId, positionIndex, action } = await req.json()

  // 3. Fetch the schedule and verify crew membership
  const schedule = await payload.findByID({
    collection: 'schedules', id: shiftId, depth: 0, overrideAccess: true
  })

  // 4. Apply business rules (past-shift guard, crew isolation, capacity)
  // 5. Update the document
  await payload.update({
    collection: 'schedules', id: shiftId,
    data: { positions: updatedPositions }, overrideAccess: true
  })

  return NextResponse.json({ success: true, action })
}
```

## Authentication Flow

Authentication uses Payload's built-in JWT cookie system. There are no third-party auth providers.

```mermaid
sequenceDiagram
    participant Browser
    participant MW as Middleware
    participant Next as Next.js Server
    participant Payload as Payload CMS (in-process)
    participant DB as MongoDB Atlas

    Note over Browser: User submits login form

    Browser->>Next: POST /api/users/login
    Next->>Payload: payload.login({ collection: 'users', data })
    Payload->>DB: Find user, verify password
    DB-->>Payload: User document
    Payload-->>Next: { user, token, exp }
    Next-->>Browser: Set-Cookie: payload-token=<JWT>

    Note over Browser: Subsequent requests

    Browser->>MW: GET /account (with cookie)
    MW->>MW: Check payload-token exists
    MW-->>Next: Allow request
    Next->>Payload: payload.auth({ headers })
    Payload->>Payload: Verify JWT signature
    Payload-->>Next: { user } (decoded from JWT)
    Next-->>Browser: Rendered page
```

**Key points:**
- Login produces a `payload-token` JWT cookie with a **14-day expiration** (1,209,600 seconds).
- The **middleware** (`src/middleware.ts`) runs on every request to protected routes and checks only for cookie _existence_ (not validity) for fast redirection. Full JWT verification happens in the Payload layer.
- Protected route prefixes: `/account`, `/inventory`, `/recipes`, `/shop`, `/orders`, `/checkout`.
- Unauthenticated users hitting protected routes are redirected to `/login` with a warning message.
- Already-authenticated users hitting `/login` or `/create-account` are redirected to `/account`.

### Account Creation Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Next as Next.js Server
    participant Payload as Payload CMS
    participant DB as MongoDB
    participant Email as Resend SMTP

    Browser->>Next: POST /api/users (create account form)
    Next->>Payload: payload.create({ collection: 'users', data })
    Note over Payload: beforeChange hooks run:<br/>1. Auto-assign 'unassigned' crew<br/>2. Stamp termsAcceptedAt<br/>3. Initialize passStatus
    Payload->>DB: Insert user document
    Payload->>Email: Send verification email
    Email-->>Browser: Email with verify link
    DB-->>Payload: Created user
    Payload-->>Next: User + token
    Next-->>Browser: Set-Cookie + redirect

    Note over Browser: User clicks email link

    Browser->>Next: GET /verify-email?token=xxx
    Next->>Payload: Verify token
    Payload->>DB: Set _verified = true
    Payload-->>Next: Verified
    Next-->>Browser: Redirect to /account
```

## Optimistic UI Pattern

The scheduling calendar uses an optimistic update pattern to make shift sign-ups feel instant. This pattern is used throughout the application wherever client mutations occur.

```mermaid
flowchart TB
    A[User clicks Sign Up] --> B[Update local state immediately]
    B --> C[Render updated UI]
    C --> D[Send POST to API route]
    D --> E{Server response}
    E -->|Success| F[Keep optimistic state]
    E -->|Error| G[Rollback to previous state]
    G --> H[Show toast.error via Sonner]
```

The implementation tracks optimistic overrides using a `Record<string, string[]>` keyed by `${shiftId}-${positionIndex}`. The ShiftCard component checks for optimistic overrides before rendering the canonical server data:

```typescript
// If there is an optimistic override for this position, use it;
// otherwise fall back to the actual assigned members from the server.
const members =
  optimisticOverrides[key] !== undefined
    ? optimisticOverrides[key]
    : (pos.assignedMembers ?? []).map((m) => (typeof m === 'object' ? m.id : m))
```

This approach ensures the UI responds instantly to user actions while maintaining consistency with the server state. If a request fails (e.g., position already filled, past shift), the optimistic state is rolled back and the user sees an error toast.

## Data Fetching Patterns Summary

| Scenario | Mechanism | Where Code Runs |
|----------|-----------|-----------------|
| Initial page load | Server Component + `getPayload()` | Server only |
| Protected data access | `payload.auth({ headers })` in API route | Server only |
| User mutation | `fetch('/api/...')` from client component | Client initiates, server executes |
| Real-time preview | `@payloadcms/live-preview-react` | Admin panel (client) |
| Static metadata | `generateMetadata()` server function | Build time / server |
