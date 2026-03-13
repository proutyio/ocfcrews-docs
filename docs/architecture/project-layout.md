---
sidebar_position: 4
title: "Project Layout"
---

# Project Layout

This page provides a detailed walkthrough of the OCFCrews directory structure, explaining the purpose of each directory and the patterns used to organize code.

## Root Directory

```
ocfcrews/
├── docs/                    # Docusaurus documentation site
├── public/                  # Static assets (favicon, images)
├── scripts/                 # Utility scripts
├── src/                     # Application source code
├── tests/                   # Test suites (integration + e2e)
├── components.json          # shadcn/ui configuration
├── eslint.config.mjs        # ESLint flat config
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies and scripts
├── payload.config.ts        # -> re-exports from src/payload.config.ts
├── playwright.config.ts     # Playwright e2e test config
├── postcss.config.js        # PostCSS configuration (Tailwind)
├── tailwind.config.mjs      # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── vitest.config.mts        # Vitest integration test config
```

## The `src/` Directory

The `src/` directory contains all application source code, organized by concern:

```
src/
├── redirects.js             # URL redirect rules (imported by next.config.js)
├── access/                  # Access control functions
├── app/                     # Next.js App Router (pages + API routes)
├── blocks/                  # Payload CMS block components
├── collections/             # Payload CMS collection definitions
├── components/              # React components
├── constants/               # Centralized enums and option arrays
├── cssVariables.js          # CSS custom property definitions
├── emails/                  # React Email templates
├── fields/                  # Reusable Payload field definitions
├── fonts/                   # Custom font files
├── globals/                 # Payload CMS global definitions
├── heros/                   # Hero section components and config
├── hooks/                   # Reusable Payload lifecycle hooks
├── lib/                     # Shared library code and constants
├── middleware.ts             # Next.js middleware (auth guard)
├── payload-types.ts         # Auto-generated TypeScript types
├── payload.config.ts        # Main Payload CMS configuration
├── plugins/                 # Payload plugin configuration
├── providers/               # React context providers
└── utilities/               # Shared utility functions
```

## App Router Structure

The `src/app/` directory uses Next.js App Router conventions with **route groups** to separate the public-facing site from the Payload admin panel.

```
src/app/
├── (app)/                   # Public-facing site (main layout)
│   ├── (account)/           # Protected account pages (nested group)
│   ├── [slug]/              # Dynamic CMS page routes
│   ├── api/                 # API route handlers
│   ├── checkout/            # E-commerce checkout
│   ├── create-account/      # Registration page
│   ├── crews/               # Public crew listing
│   ├── inventory/           # Inventory management UI
│   ├── login/               # Login page
│   ├── logout/              # Logout handler
│   ├── posts/               # Blog/news posts
│   ├── recipes/             # Recipe browsing and management
│   ├── schedule/            # Scheduling calendar
│   ├── shop/                # E-commerce storefront
│   ├── layout.tsx           # Root layout (Header, Footer, Providers)
│   ├── page.tsx             # Homepage
│   ├── globals.css          # Global styles
│   └── ...
│
└── (payload)/               # Payload CMS admin panel
    ├── admin/               # Admin panel routes (auto-generated)
    ├── api/                 # Payload REST/GraphQL API
    ├── custom.scss          # Admin panel style overrides
    └── layout.tsx           # Admin layout
```

### Route Groups Explained

Next.js route groups (directories wrapped in parentheses) organize routes without affecting the URL path:

- **`(app)/`** -- Contains the entire public-facing site. Uses the main layout with Header, Footer, theme providers, and global styles.
- **`(payload)/`** -- Contains the Payload CMS admin panel at `/admin`. Uses Payload's own layout and styling with custom SCSS overrides.
- **`(account)/`** -- Nested inside `(app)`, this group wraps all authenticated account pages under a shared layout that verifies the user session and provides account navigation.

The `(account)` route group contains:

```
(app)/(account)/
├── account/
│   ├── page.tsx             # Account dashboard
│   ├── addresses/           # Shipping addresses
│   ├── hours/               # Logged hours view
│   └── schedule/            # Personal schedule view
├── crew/
│   ├── page.tsx             # Crew management dashboard
│   └── members/             # Crew member listing and editing
├── orders/
│   ├── page.tsx             # Order history
│   └── [id]/                # Individual order detail
├── layout.tsx               # Shared account layout (auth check)
└── error.tsx                # Error boundary for account pages
```

### API Routes

API routes live inside the `(app)/api/` directory and handle client-side mutations:

```
(app)/api/
├── schedule/
│   ├── sign-up/route.ts     # Join/leave/remove shift positions
│   └── log-hours/route.ts   # Log hours for a shift
├── send-email/route.ts      # Send email campaigns
└── resend-verification/     # Resend email verification
```

Each API route follows a consistent pattern: authenticate with `payload.auth({ headers })`, validate the request body, apply business rules, then call Payload's Local API to perform the operation.

## Collections Directory

Each Payload collection is defined in its own directory (or file for simple collections) under `src/collections/`. Collections with hooks get a directory; simple ones are single files.

```
src/collections/
├── Avatars.ts                     # Simple file (no hooks)
├── Categories.ts                  # Simple file
├── Media.ts                       # Simple file
├── InventoryMedia.ts              # Simple file
├── Crews/
│   └── index.ts                   # Collection config
├── Users/
│   ├── index.ts                   # Collection config
│   └── hooks/
│       ├── ensureFirstUserIsAdmin.ts
│       ├── syncCrewCoordinators.ts
│       └── syncCrewRole.ts
├── Schedules/
│   └── index.ts
├── SchedulePositions/
│   └── index.ts
├── TimeEntries/
│   └── index.ts
├── InventoryItems/
│   └── index.ts
├── InventoryCategories/
│   └── index.ts
├── InventorySubCategories/
│   └── index.ts
├── InventoryTransactions/
│   └── index.ts
├── Recipes/
│   └── index.ts
├── RecipeFavorites/
│   └── index.ts
├── RecipeSubGroups/
│   └── index.ts
├── RecipeTags/
│   └── index.ts
├── Pages/
│   └── ...
├── Posts/
│   └── ...
├── Products/
│   └── ...
├── EmailTemplates/
│   └── ...
└── Emails/
    └── ...
```

### Typical Collection Structure

A collection definition file exports a `CollectionConfig` object. Here is a simplified example showing the pattern:

```typescript
// src/collections/Schedules/index.ts
import type { CollectionConfig, Where } from 'payload'
import { checkRole, getUserCrewId } from '@/access/utilities'

export const Schedules: CollectionConfig = {
  slug: 'schedules',
  access: {
    create: ({ req: { user } }) => { /* role-based check */ },
    read: ({ req: { user } }) => {
      if (!user) return false
      if (checkRole(['admin', 'editor'], user)) return true
      // Crew isolation: only return schedules for the user's crew
      const crewId = getUserCrewId(user)
      if (crewId) return { crew: { equals: crewId } } as Where
      return false
    },
    update: ({ req: { user } }) => { /* role + crew check */ },
    delete: ({ req: { user } }) => { /* admin/editor only */ },
  },
  hooks: {
    beforeValidate: [/* auto-assign crew */],
    beforeChange: [/* enforce crew isolation on write */],
  },
  admin: {
    group: 'Crews',
    defaultColumns: ['crew', 'date', 'shiftType', 'meal'],
  },
  fields: [
    { name: 'crew', type: 'relationship', relationTo: 'crews', required: true },
    { name: 'date', type: 'date', required: true },
    // ... more fields
  ],
}
```

## Access Control Directory

The `src/access/` directory contains reusable access control functions shared across collections:

```
src/access/
├── adminOnly.ts              # Only admin role
├── adminOnlyFieldAccess.ts   # Field-level admin restriction
├── adminOrCrewCoordinator.ts # Admin or crew coordinator
├── adminOrCustomerOwner.ts   # Admin or document owner (e-commerce)
├── adminOrEditor.ts          # Admin or editor role
├── adminOrPublishedStatus.ts # Admin or published documents only
├── adminOrSelf.ts            # Admin or the user themselves
├── customerOnlyFieldAccess.ts # E-commerce customer field access
├── inventoryAccess.ts        # Inventory crew-scoped access
├── isAdmin.ts                # Simple admin check
├── isDocumentOwner.ts        # Check document ownership
├── publicAccess.ts           # Public (unauthenticated) access
├── recipeAccess.ts           # Recipe crew-scoped access
└── utilities.ts              # checkRole(), getUserCrewId() helpers
```

The two most important utility functions live in `utilities.ts`:

```typescript
// Check if a user has any of the specified roles
export function checkRole(roles: string[], user: User | null): boolean

// Extract the crew ID from a user (handles both populated and reference forms)
export function getUserCrewId(user: User): string | null
```

These are imported throughout the codebase wherever access control decisions are made.

## Constants Directory

All enums, option arrays, and magic values are centralized in `src/constants/`. This ensures consistency between collection field definitions, frontend UI dropdowns, and validation logic.

```
src/constants/
├── food.ts         # DIETARY_TAG_OPTIONS, ALLERGEN_OPTIONS
├── inventory.ts    # TRANSACTION_TYPE_OPTIONS, STORAGE_TYPE_OPTIONS, INVENTORY_UNIT_OPTIONS
├── posts.ts        # POST_VISIBILITY_OPTIONS, EMAIL_RECIPIENT_TYPE_OPTIONS
├── recipes.ts      # RECIPE_STATUS_OPTIONS, RECIPE_GROUP_OPTIONS, RECIPE_UNIT_OPTIONS, etc.
├── roles.ts        # ROLE_OPTIONS, CREW_ROLE_OPTIONS, role group arrays, role labels/colors
├── schedules.ts    # SHIFT_TYPE_OPTIONS, SHIFT_ORDER
└── users.ts        # TSHIRT_SIZE_OPTIONS
```

Example usage -- the same constant is used in both the collection definition and the frontend:

```typescript
// In the collection definition
import { SHIFT_TYPE_OPTIONS } from '@/constants/schedules'

export const Schedules: CollectionConfig = {
  fields: [
    { name: 'shiftType', type: 'select', options: [...SHIFT_TYPE_OPTIONS] },
  ],
}

// In a React component
import { SHIFT_TYPE_OPTIONS } from '@/constants/schedules'

function ShiftFilter() {
  return (
    <select>
      {SHIFT_TYPE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
```

## Globals Directory

Payload Globals are singleton documents (like site settings). Four globals are defined:

```
src/globals/
├── Header.ts         # Navigation menu items
├── Footer.ts         # Footer links and content
├── PassSettings.ts   # Crew pass distribution settings
└── Settings/
    ├── index.ts      # Global site settings
    └── ConfirmToggle/  # Custom admin UI component for settings
```

## Components Directory

React components are organized by feature domain:

```
src/components/
├── Account/           # Account dashboard, profile forms
├── AdminAvatar/       # Custom admin panel avatar
├── AdminBar/          # Frontend admin toolbar
├── BeforeHeader/      # Admin panel header action links
├── BeforeLogin/       # Admin login page customizations
├── CollectionArchive/ # Generic collection list/grid
├── CustomDashboard/   # Custom Payload admin dashboard
├── Footer/            # Site footer
├── Forms/             # Shared form components
├── Grid/              # Grid layout components
├── Header/            # Site header and navigation
├── Home/              # Homepage sections
├── Inventory/         # Inventory management UI components
├── Link/              # Internal/external link component
├── LivePreviewListener/ # Payload live preview integration
├── Logo/              # Site and admin logos
├── Media/             # Image/media rendering
├── Recipes/           # Recipe UI components
├── Schedule/          # Scheduling calendar and shift cards
├── Search/            # Search UI
├── Shop/              # E-commerce UI components
├── layout/            # Shared layout components
├── ui/                # shadcn/ui primitive components
│   ├── accordion.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── carousel.tsx
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── pagination.tsx
│   ├── select.tsx
│   ├── sheet.tsx
│   ├── sonner.tsx
│   └── textarea.tsx
└── ...
```

The `ui/` subdirectory contains shadcn/ui components -- these are installed directly into the project (not a library dependency) so they can be fully customized.

## Other Key Directories

### `src/blocks/`

Payload CMS content blocks for the page builder:

```
src/blocks/
├── ArchiveBlock/      # Collection archive/listing
├── Banner/            # Banner/callout block
├── CallToAction/      # CTA section
├── Carousel/          # Image/content carousel
├── Code/              # Code snippet block
├── Content/           # Rich text content block
├── Form/              # Embedded form block
├── MediaBlock/        # Image/video block
├── ThreeItemGrid/     # Three-column grid layout
└── RenderBlocks.tsx   # Block renderer (maps block type to component)
```

### `src/emails/`

React Email templates rendered server-side to HTML:

```
src/emails/
├── AnnouncementEmail.tsx    # Crew announcement emails
├── BaseLayout.tsx           # Shared email layout wrapper
├── ForgotPasswordEmail.tsx  # Password reset email
├── VerifyEmailEmail.tsx     # Email verification
├── emailEditor.ts           # Editor config for email content
└── utils/                   # Email utility functions
```

### `src/providers/`

React context providers wrapped around the application:

```
src/providers/
├── Auth/              # Authentication context (user state)
├── HeaderTheme/       # Header theme variant provider
├── Theme/             # Dark/light mode provider (next-themes)
├── Sonner.tsx         # Toast notification provider
└── index.tsx          # Combined provider tree
```

### `src/plugins/`

Payload plugin configuration in `index.ts`:

- **seoPlugin** -- Adds SEO fields (title, description, OG image) to Pages and Products
- **formBuilderPlugin** -- Enables dynamic form creation in the admin panel
- **ecommercePlugin** -- Full e-commerce system with Stripe integration, configured with custom access control overrides for orders, transactions, addresses, and carts

## Test Directory

```
tests/
├── vitest.setup.ts          # Vitest global setup (loads dotenv)
├── test.env                 # Environment variables for test runs
├── e2e/                     # Playwright end-to-end tests
│   └── ...
├── int/                     # Vitest integration tests
│   └── ...
└── helpers/
    └── seedCrew.ts          # Crew seed/cleanup helper
```

Integration tests connect to a real Payload/PostgreSQL instance (configured via `tests/test.env`). E2E tests use Playwright to run full browser scenarios.

## Key Configuration Files

| File | Purpose |
|------|---------|
| `src/payload.config.ts` | Main Payload CMS configuration (collections, globals, plugins, adapters) |
| `next.config.js` | Next.js configuration (redirects, image domains, webpack) |
| `tailwind.config.mjs` | Tailwind CSS theme customization |
| `tsconfig.json` | TypeScript compiler options and path aliases (`@/` maps to `src/`) |
| `src/middleware.ts` | Route protection middleware (cookie-based auth guard) |
| `components.json` | shadcn/ui configuration (style, aliases, component paths) |
| `vitest.config.mts` | Vitest configuration for integration tests |
| `playwright.config.ts` | Playwright configuration for e2e tests |
