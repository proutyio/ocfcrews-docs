---
sidebar_position: 5
title: "Project Structure"
---

# Project Structure

This page describes the directory layout and key files in the OCFCrews codebase.

## Top-Level Files

```
ocfcrews/
├── package.json              # Dependencies, scripts, and engine constraints
├── next.config.js            # Next.js configuration (withPayload wrapper, security headers, image remotes)
├── tailwind.config.mjs       # Tailwind CSS theme, colors, animations, and plugins
├── postcss.config.js         # PostCSS configuration for Tailwind
├── tsconfig.json             # TypeScript compiler options and path aliases
├── eslint.config.mjs         # ESLint flat config
├── vitest.config.mts         # Vitest configuration for integration tests
├── playwright.config.ts      # Playwright configuration for e2e tests
├── components.json           # shadcn/ui component configuration
├── pnpm-lock.yaml            # pnpm lockfile
└── docs/                     # Docusaurus documentation site
```

## Source Directory (`src/`)

```
src/
├── redirects.js              # URL redirect rules loaded by next.config.js
├── payload.config.ts         # Payload CMS root configuration
├── payload-types.ts          # Auto-generated TypeScript types (from pnpm generate:types)
├── middleware.ts              # Next.js middleware for route protection
├── cssVariables.js           # CSS variable definitions for theming
│
├── app/                      # Next.js App Router
│   ├── (app)/                # Public-facing frontend routes
│   │   ├── layout.tsx        # Root frontend layout (header, footer, providers)
│   │   ├── page.tsx          # Homepage
│   │   ├── globals.css       # Global CSS styles
│   │   ├── not-found.tsx     # Custom 404 page
│   │   ├── error.tsx         # Error boundary
│   │   ├── robots.ts         # robots.txt generation
│   │   ├── (account)/        # Account management (profile, crew, orders)
│   │   ├── schedule/         # Crew schedule viewing and sign-ups
│   │   ├── inventory/        # Inventory management UI
│   │   ├── recipes/          # Recipe browsing and management
│   │   ├── shop/             # E-commerce product listings
│   │   ├── checkout/         # Checkout flow
│   │   ├── products/         # Individual product pages
│   │   ├── posts/            # Blog posts
│   │   ├── crews/            # Crew information pages
│   │   ├── login/            # Login page
│   │   ├── create-account/   # Registration page
│   │   ├── forgot-password/  # Password reset request
│   │   ├── verify-email/     # Email verification
│   │   ├── resend-verification/ # Resend verification email
│   │   ├── logout/           # Logout handler
│   │   ├── find-order/       # Order lookup
│   │   ├── help/             # Help pages
│   │   ├── site-guide/       # Site guide
│   │   ├── terms/            # Terms and conditions
│   │   ├── [slug]/           # Dynamic CMS page routes
│   │   ├── next/             # Next.js utilities (preview, etc.)
│   │   └── api/              # API routes (schedule, email, verification)
│   │
│   └── (payload)/            # Payload CMS admin panel
│       ├── admin/            # Admin panel routes
│       ├── api/              # Payload REST API
│       ├── layout.tsx        # Admin layout
│       └── custom.scss       # Admin panel style overrides
│
├── collections/              # Payload CMS collection definitions
│   ├── Users/                # User accounts with roles and crew assignments
│   ├── Crews/                # Crew definitions and member rosters
│   ├── Schedules/            # Shift schedules with date, time, and positions
│   ├── SchedulePositions/    # Position definitions for schedule sign-ups
│   ├── TimeEntries/          # Time tracking entries
│   ├── Pages/                # CMS page builder pages
│   ├── Posts/                # Blog posts with categories
│   ├── Categories.ts         # Post categories
│   ├── Media.ts              # General media uploads
│   ├── Avatars.ts            # User avatar uploads
│   ├── InventoryItems/       # Inventory items with stock tracking
│   ├── InventoryCategories/  # Inventory category hierarchy
│   ├── InventorySubCategories/ # Inventory subcategories
│   ├── InventoryTransactions/ # Inventory stock change records
│   ├── InventoryMedia.ts     # Inventory image uploads
│   ├── Recipes/              # Recipe definitions with ingredients
│   ├── RecipeFavorites/      # User recipe favorites
│   ├── RecipeSubGroups/      # Recipe sub-group classifications
│   ├── RecipeTags/           # Recipe tag taxonomy
│   ├── Products/             # E-commerce product definitions
│   ├── EmailTemplates/       # Reusable email templates
│   └── Emails/               # Sent email campaign records
│
├── globals/                  # Payload CMS global configurations
│   ├── Header.ts             # Site header navigation
│   ├── Footer.ts             # Site footer content
│   ├── Settings/             # Global site settings
│   └── PassSettings.ts       # Pass/ticket settings
│
├── access/                   # Access control functions for Payload collections
│   ├── adminOnly.ts          # Restrict to admin role
│   ├── adminOnlyFieldAccess.ts # Field-level admin restriction
│   ├── adminOrCrewCoordinator.ts # Admin or crew coordinator access
│   ├── adminOrCustomerOwner.ts # Admin or document customer
│   ├── adminOrEditor.ts      # Admin or editor role
│   ├── adminOrPublishedStatus.ts # Admin or published documents only
│   ├── adminOrSelf.ts        # Admin or the user themselves
│   ├── customerOnlyFieldAccess.ts # Customer-only field visibility
│   ├── inventoryAccess.ts    # Inventory role-based access
│   ├── isAdmin.ts            # Admin role check
│   ├── isDocumentOwner.ts    # Document ownership check
│   ├── publicAccess.ts       # Public (unauthenticated) access
│   ├── recipeAccess.ts       # Recipe role-based access
│   └── utilities.ts          # Shared access control helpers (checkRole, etc.)
│
├── blocks/                   # Page builder block components
│   ├── ArchiveBlock/         # Collection archive/listing block
│   ├── Banner/               # Banner/alert block
│   ├── CallToAction/         # CTA block with links
│   ├── Carousel/             # Image/content carousel
│   ├── Code/                 # Code snippet block
│   ├── Content/              # Rich text content block
│   ├── Form/                 # Form builder block
│   ├── MediaBlock/           # Media display block
│   ├── ThreeItemGrid/        # Three-item grid layout
│   └── RenderBlocks.tsx      # Block renderer that maps block types to components
│
├── components/               # React components
│   ├── Account/              # Account management UI
│   ├── AdminAvatar/          # Custom admin panel avatar
│   ├── AdminBar/             # Frontend admin toolbar
│   ├── BeforeHeader/         # Admin panel header actions (nav links, theme toggle)
│   ├── BeforeLogin/          # Admin login page customization
│   ├── CollectionArchive/    # Collection listing component
│   ├── CustomDashboard/      # Custom admin dashboard
│   ├── Footer/               # Site footer
│   ├── Forms/                # Form components (inputs, selects, etc.)
│   ├── Grid/                 # Grid layout components
│   ├── Header/               # Site header and navigation
│   ├── Home/                 # Homepage components
│   ├── Inventory/            # Inventory management components
│   ├── Link/                 # Internal/external link component
│   ├── LivePreviewListener/  # Payload live preview integration
│   ├── LoadingSpinner/       # Loading state component
│   ├── Logo/                 # Site and admin logos
│   ├── Media/                # Media rendering (images, video)
│   ├── Message/              # Alert/message component
│   ├── Recipes/              # Recipe UI components
│   ├── RenderParams/         # URL parameter renderer
│   ├── RichText/             # Rich text display component
│   ├── Schedule/             # Schedule viewing and sign-up components
│   ├── Search/               # Search functionality
│   ├── Shop/                 # E-commerce shop components
│   ├── layout/               # Layout primitives
│   └── ui/                   # Base UI primitives (buttons, dialogs, etc.)
│
├── constants/                # Constants and enum definitions
│   ├── roles.ts              # User and crew role definitions
│   ├── schedules.ts          # Schedule-related constants
│   ├── users.ts              # User-related constants
│   ├── inventory.ts          # Inventory constants
│   ├── recipes.ts            # Recipe constants
│   ├── food.ts               # Food-related constants
│   └── posts.ts              # Post-related constants
│
├── emails/                   # React Email templates
│   ├── BaseLayout.tsx        # Shared email layout wrapper
│   ├── AnnouncementEmail.tsx # Campaign/announcement email template
│   ├── ForgotPasswordEmail.tsx # Password reset email
│   ├── VerifyEmailEmail.tsx  # Email verification email
│   ├── emailEditor.ts       # Email editor configuration
│   └── utils/                # Email utility functions
│
├── fields/                   # Custom Payload field configurations
│   ├── hero.ts               # Hero section field group
│   ├── link.ts               # Link field (internal/external)
│   └── linkGroup.ts          # Group of link fields
│
├── heros/                    # Hero section components
│   ├── HighImpact/           # Full-width hero with background media
│   ├── MediumImpact/         # Medium-sized hero section
│   ├── LowImpact/            # Minimal hero section
│   ├── RenderHero.tsx        # Hero type router
│   └── config.ts             # Hero type configuration
│
├── hooks/                    # Custom Payload hooks
│   └── populatePublishedAt.ts # Auto-set publishedAt timestamp
│
├── lib/                      # Library utilities
│   └── constants.ts          # Shared constants
│
├── plugins/                  # Payload plugin configuration
│   └── index.ts              # Plugin registry (SEO, form builder, ecommerce)
│
├── providers/                # React context providers
│   ├── index.tsx             # Combined provider wrapper
│   ├── Auth/                 # Authentication context provider
│   ├── HeaderTheme/          # Header theme context
│   ├── Theme/                # Dark/light theme provider
│   └── Sonner.tsx            # Toast notification provider (sonner)
│
├── utilities/                # Helper functions
│   ├── cachedQueries.ts      # Cached Payload queries for performance
│   ├── cn.ts                 # Tailwind class merge utility (clsx + tailwind-merge)
│   ├── formatDateTime.ts     # Date/time formatting helpers
│   ├── generateMeta.ts       # Page metadata generation
│   ├── generatePreviewPath.ts # Draft preview URL generation
│   ├── getDocument.ts        # Document fetching helper
│   ├── getGlobals.ts         # Global config fetching
│   ├── getURL.ts             # Server/client URL resolution
│   ├── mergeOpenGraph.ts     # OpenGraph metadata merging
│   ├── canUseDOM.ts          # DOM availability check
│   ├── capitaliseFirstLetter.ts # String capitalization
│   ├── createUrl.ts          # URL construction helper
│   ├── deepMerge.ts          # Deep object merging
│   ├── ensureStartsWith.ts   # String prefix helper
│   ├── toKebabCase.ts        # String case conversion
│   └── useClickableCard.ts   # Clickable card interaction hook
│
└── fonts/                    # Custom font files
    └── Inter-Bold.ttf        # Inter Bold (used in email templates)
```

## Test Directory

```
tests/
├── vitest.setup.ts           # Vitest global setup (loads dotenv)
├── test.env                  # Environment variables for test runs
├── int/                      # Vitest integration tests (real Payload + MongoDB)
├── e2e/                      # Playwright end-to-end tests
└── helpers/
    └── seedCrew.ts           # Crew seed/cleanup helper for e2e tests
```

## Key Configuration Files

### `src/payload.config.ts`

The root Payload CMS configuration. Defines:
- All collections and globals registered with the CMS
- Database adapter (`@payloadcms/db-mongodb`)
- Rich text editor (Lexical with bold, italic, underline, lists, links, indent, tables)
- Email adapter (conditionally enabled with Resend)
- S3 storage (conditionally enabled with R2)
- Admin panel customizations (custom dashboard, navigation links, login page, avatars)
- Plugins (SEO, form builder, ecommerce)

### `src/middleware.ts`

Next.js middleware that enforces route protection:
- Unauthenticated users are redirected to `/login` when accessing protected routes (`/account`, `/inventory`, `/recipes`, `/shop`, `/orders`, `/checkout`)
- Authenticated users are redirected to `/account` when visiting `/login` or `/create-account`
- Authentication is checked via the `payload-token` cookie (no database call in middleware)

### `next.config.js`

Next.js configuration wrapped with `withPayload()`:
- Security headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
- Image remote patterns for the server URL and R2 endpoint
- React strict mode enabled
- Custom webpack resolve aliases

### `tailwind.config.mjs`

Tailwind CSS configuration with:
- CSS variable-based color system (primary, secondary, accent, destructive, etc.)
- Geist font family (sans and mono)
- Dark mode via `[data-theme="dark"]` selector
- Typography plugin for prose content
- Custom animations (fade, slide, accordion, carousel, blink)
