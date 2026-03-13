---
sidebar_position: 2
title: "Layouts & Routing"
---

# Layouts & Routing

OCFCrews uses Next.js 15's nested layout system to provide shared UI chrome and access control at each level of the route hierarchy. Each layout wraps its child routes and persists across navigations within that segment.

## Layout Hierarchy

```
html (root app layout)
├── (app)/layout.tsx          # Providers, AdminBar, Header, Footer
│   ├── (account)/layout.tsx  # Auth guard, AccountNav sidebar
│   ├── inventory/layout.tsx  # Role guard, InventoryNav sidebar
│   ├── recipes/layout.tsx    # Crew/role guard, RecipeNav sidebar
│   └── shop/layout.tsx       # Shop-disabled check, search, category filters
│
└── (payload)/layout.tsx      # Payload CMS admin (auto-generated)
```

## Root App Layout

**File:** `src/app/(app)/layout.tsx`

The root layout for the public-facing site. It wraps every page within the `(app)` route group.

```tsx
export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={[GeistSans.variable, GeistMono.variable].filter(Boolean).join(' ')}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.png" rel="icon" type="image/png" />
      </head>
      <body>
        <Providers>
          <AdminBar />
          <LivePreviewListener />
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
```

### What it provides

| Feature | Details |
|---|---|
| **Fonts** | Geist Sans and Geist Mono loaded as CSS variable classes on `<html>` |
| **Theme initialization** | `<InitTheme />` runs an inline script in `<head>` to set the theme before paint, preventing flash of unstyled content |
| **Hydration safety** | `suppressHydrationWarning` on `<html>` prevents React warnings from theme attribute mismatch between server and client |
| **Providers** | Wraps the entire app in a provider stack (see below) |
| **AdminBar** | Shown only to admin users -- provides a quick link to the Payload admin panel |
| **LivePreviewListener** | Enables Payload CMS live preview for content editors |
| **Header** | Site-wide navigation header (server component that fetches nav items, delegates to client component) |
| **Footer** | Site-wide footer with CMS-managed navigation links |

### Provider Stack

The `<Providers>` component (`src/providers/index.tsx`) nests the following providers:

```
ThemeProvider
└── AuthProvider
    └── HeaderThemeProvider
        └── SonnerProvider (toast notifications)
            └── EcommerceProvider (Stripe + cart)
                └── {children}
```

| Provider | Purpose |
|---|---|
| `ThemeProvider` | Light/dark theme management with localStorage persistence |
| `AuthProvider` | User authentication state from Payload's cookie-based auth |
| `HeaderThemeProvider` | Per-page header theme overrides (e.g., transparent on hero sections) |
| `SonnerProvider` | Configures the `sonner` toast notification component |
| `EcommerceProvider` | Payload ecommerce plugin -- cart state, Stripe payment adapter, variant support |

## Account Layout

**File:** `src/app/(app)/(account)/layout.tsx`

Protects all routes under the `(account)` route group (`/account/*`, `/crew/*`, `/orders/*`).

### Auth Guard

```tsx
const headers = await getHeaders()
const payload = await getPayload({ config: configPromise })
const { user } = await payload.auth({ headers })

if (!user) {
  redirect(`/login?warning=${encodeURIComponent('Your session has expired. Please login again.')}`)
}
```

The middleware performs an initial cookie-existence check for performance. This layout guard catches **expired or invalid tokens** that passed the middleware check.

### AccountNav Sidebar

The layout renders an `AccountNav` sidebar on desktop that links to:
- Account profile
- Addresses
- Schedule
- Hours
- Crew management (if applicable)
- Orders

It also fetches the user's crew slug so the nav can link directly to the crew's public page.

### UI Structure

```tsx
<div className="container mt-16 pb-8 flex gap-8">
  <AccountNav className="max-w-62 ... hidden md:flex" crewSlug={crewSlug} />
  <div className="flex flex-col gap-12 grow">{children}</div>
</div>
```

On mobile, the sidebar is hidden and the account pages use a full-width layout.

## Inventory Layout

**File:** `src/app/(app)/inventory/layout.tsx`

Protects all `/inventory/*` routes with **role-based access control**.

### Access Requirements

```tsx
const hasAccess = checkRole(
  ['admin', 'inventory_admin', 'inventory_editor', 'inventory_viewer'],
  user,
)
if (!hasAccess) {
  redirect(`/account?warning=${encodeURIComponent('You do not have access to inventory.')}`)
}
```

Users must have one of: `admin`, `inventory_admin`, `inventory_editor`, or `inventory_viewer` roles.

### InventoryNav Sidebar

The layout renders an `InventoryNav` component in two modes:
- **Desktop:** Vertical sidebar (hidden on mobile)
- **Mobile:** Horizontal tab navigation (visible below `md` breakpoint)

An `isAdmin` flag is computed (`admin` or `inventory_admin` roles) and passed to the nav to conditionally show admin-only links like category management.

## Recipes Layout

**File:** `src/app/(app)/recipes/layout.tsx`

Protects all `/recipes/*` routes with **crew membership or role-based access**.

### Access Requirements

```tsx
const hasAdminOrInventoryRole = checkRole(
  ['admin', 'inventory_admin', 'inventory_editor', 'inventory_viewer'],
  user,
)
const hasCrew = !!user?.crew

if (!hasAdminOrInventoryRole && !hasCrew) {
  redirect(`/account?warning=${encodeURIComponent('You are not assigned to a crew. Contact an admin.')}`)
}
```

Access is granted if the user has an admin/inventory role **or** is assigned to any crew.

### RecipeNav Sidebar

Same dual-mode pattern as inventory: vertical sidebar on desktop, horizontal tabs on mobile. The `isAdmin` flag controls visibility of admin features like tag management.

## Shop Layout

**File:** `src/app/(app)/shop/layout.tsx`

The shop layout fetches the global `settings` document and can disable the shop entirely:

```tsx
const settings = await getCachedGlobal('settings', 0)()
if (settings.shopDisabled) {
  return <div>Shop Temporarily Unavailable</div>
}
```

When the shop is active, the layout renders:
- A `Search` component for product search
- A `Categories` sidebar for category filtering
- A `FilterList` for sort options

## Payload Admin Layout

**File:** `src/app/(payload)/layout.tsx`

This is an auto-generated layout from `@payloadcms/next`. It should not be modified manually as Payload may overwrite it. It configures:
- Payload CSS imports
- Server function handling
- Import map for the admin panel

## Error Boundaries

Error boundaries are `'use client'` components that catch rendering errors and provide a recovery mechanism.

### Global Error Boundary

**File:** `src/app/(app)/error.tsx`

Catches unhandled errors across the entire `(app)` route group. Displays a "Try Again" button that calls the `reset()` function to re-render the segment.

### Account Error Boundary

**File:** `src/app/(app)/(account)/error.tsx`

A more specific error boundary for account pages. Logs the error to the console and provides a styled "Try Again" button using the emerald brand color.

### Inventory Error Boundary

**File:** `src/app/(app)/inventory/error.tsx`

Handles errors specific to inventory pages with an inventory-themed error message.

## Not Found Page

**File:** `src/app/(app)/not-found.tsx`

A server component that renders a 404 page with a "Go home" button using the `Button` component from the UI library.

## Loading States

### Shop Loading Skeleton

**File:** `src/app/(app)/shop/loading.tsx`

Uses the Next.js `loading.tsx` convention to show a grid of 12 animated pulse placeholders while the shop page data loads:

```tsx
export default function Loading() {
  return (
    <Grid className="grid-cols-2 lg:grid-cols-3">
      {Array(12).fill(0).map((_, index) => (
        <div className="animate-pulse bg-neutral-100 dark:bg-neutral-900" key={index} />
      ))}
    </Grid>
  )
}
```

## Middleware

Authentication route protection has a two-layer approach:

1. **Middleware** (`middleware.ts`) -- Performs a fast cookie-existence check. If the `payload-token` cookie is missing, the user is redirected to `/login`. This avoids hitting the database for unauthenticated users.
2. **Layout guards** -- Each protected layout calls `payload.auth({ headers })` to validate the token server-side. This catches expired or invalid tokens that passed the middleware check.

## Metadata

The root layout sets a base metadata configuration:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots: { follow: true, index: true },
}
```

Individual pages can override or extend this metadata using Next.js's metadata API. The `siteUrl` defaults to the `NEXT_PUBLIC_SERVER_URL` environment variable or `https://ocfcrews.org`.
