---
sidebar_position: 1
title: "App Router Structure"
---

# App Router Structure

OCFCrews uses the **Next.js 15 App Router** with file-system based routing. All routes live under `src/app/` and are organized using route groups to separate the public-facing site from the Payload CMS admin panel.

## Route Groups

The top-level `src/app/` directory contains two route groups:

| Route Group | Purpose |
|---|---|
| `(app)` | Main site -- all public and authenticated user-facing pages |
| `(payload)` | Payload CMS admin panel and API endpoints |

Route groups (directories wrapped in parentheses) do **not** affect the URL path. They exist solely to organize code and apply shared layouts.

### Nested Route Groups

Within `(app)`, there is a nested route group:

- **`(account)`** -- Groups all pages that require authentication. This route group applies the account layout which performs an auth guard and renders the `AccountNav` sidebar.

## Directory Tree

```
src/app/
├── (app)/
│   ├── layout.tsx                          # Root app layout (fonts, providers, header, footer)
│   ├── page.tsx                            # / (home page)
│   ├── error.tsx                           # Global error boundary
│   ├── not-found.tsx                       # 404 page
│   ├── globals.css                         # Global styles
│   ├── robots.ts                           # robots.txt generation
│   │
│   ├── (account)/                          # Auth-protected route group
│   │   ├── layout.tsx                      # Auth guard + AccountNav sidebar
│   │   ├── error.tsx                       # Account error boundary
│   │   ├── account/
│   │   │   ├── page.tsx                    # /account (profile)
│   │   │   ├── addresses/
│   │   │   │   └── page.tsx               # /account/addresses
│   │   │   ├── hours/
│   │   │   │   └── page.tsx               # /account/hours
│   │   │   └── schedule/
│   │   │       └── page.tsx               # /account/schedule
│   │   ├── crew/
│   │   │   ├── page.tsx                    # /crew (crew dashboard)
│   │   │   └── members/
│   │   │       ├── page.tsx               # /crew/members
│   │   │       └── [id]/
│   │   │           └── edit/
│   │   │               ├── page.tsx       # /crew/members/[id]/edit
│   │   │               └── EditMemberForm.tsx
│   │   └── orders/
│   │       ├── page.tsx                    # /orders
│   │       └── [id]/
│   │           └── page.tsx               # /orders/[id]
│   │
│   ├── login/
│   │   └── page.tsx                        # /login
│   ├── create-account/
│   │   └── page.tsx                        # /create-account
│   ├── forgot-password/
│   │   └── page.tsx                        # /forgot-password
│   ├── resend-verification/
│   │   └── page.tsx                        # /resend-verification
│   ├── verify-email/
│   │   └── page.tsx                        # /verify-email
│   ├── logout/
│   │   ├── page.tsx                        # /logout
│   │   └── LogoutPage/
│   │       └── index.tsx
│   │
│   ├── crews/
│   │   ├── page.tsx                        # /crews (list all crews)
│   │   └── [slug]/
│   │       ├── page.tsx                    # /crews/[slug] (crew detail)
│   │       ├── CrewMembersTable.tsx
│   │       └── schedule/
│   │           └── page.tsx               # /crews/[slug]/schedule
│   │
│   ├── schedule/
│   │   └── page.tsx                        # /schedule (redirect to user's crew schedule)
│   │
│   ├── inventory/
│   │   ├── layout.tsx                      # Inventory layout (role-based access guard)
│   │   ├── page.tsx                        # /inventory (dashboard)
│   │   ├── error.tsx                       # Inventory error boundary
│   │   ├── _lib/
│   │   │   └── getInventoryContext.ts
│   │   ├── items/
│   │   │   ├── page.tsx                   # /inventory/items
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # /inventory/items/new
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # /inventory/items/[id]
│   │   │       └── edit/
│   │   │           └── page.tsx          # /inventory/items/[id]/edit
│   │   ├── categories/
│   │   │   └── page.tsx                   # /inventory/categories
│   │   └── shopping-list/
│   │       └── page.tsx                   # /inventory/shopping-list
│   │
│   ├── recipes/
│   │   ├── layout.tsx                      # Recipes layout (crew/role access guard)
│   │   ├── page.tsx                        # /recipes (recipe groups)
│   │   ├── new/
│   │   │   └── page.tsx                   # /recipes/new
│   │   ├── tags/
│   │   │   └── page.tsx                   # /recipes/tags
│   │   ├── shopping-list/
│   │   │   ├── page.tsx                   # /recipes/shopping-list
│   │   │   └── _components/
│   │   │       └── RecipeShoppingListClient.tsx
│   │   ├── _lib/
│   │   │   ├── getRecipeContext.ts
│   │   │   └── recipeGroups.ts
│   │   └── [group]/
│   │       ├── page.tsx                   # /recipes/[group]
│   │       └── [id]/
│   │           ├── page.tsx              # /recipes/[group]/[id]
│   │           ├── _components/
│   │           │   └── DeleteRecipeButton.tsx
│   │           └── edit/
│   │               └── page.tsx          # /recipes/[group]/[id]/edit
│   │
│   ├── shop/
│   │   ├── layout.tsx                      # Shop layout (categories sidebar, filters)
│   │   ├── loading.tsx                     # Shop loading skeleton
│   │   └── page.tsx                        # /shop
│   ├── products/
│   │   └── [slug]/
│   │       └── page.tsx                    # /products/[slug]
│   ├── checkout/
│   │   ├── page.tsx                        # /checkout
│   │   └── confirm-order/
│   │       └── page.tsx                   # /checkout/confirm-order
│   ├── find-order/
│   │   └── page.tsx                        # /find-order
│   │
│   ├── posts/
│   │   ├── page.tsx                        # /posts (blog listing)
│   │   └── [slug]/
│   │       └── page.tsx                   # /posts/[slug]
│   │
│   ├── help/
│   │   └── page.tsx                        # /help
│   ├── site-guide/
│   │   └── page.tsx                        # /site-guide
│   ├── terms/
│   │   └── page.tsx                        # /terms
│   │
│   ├── [slug]/
│   │   └── page.tsx                        # /[slug] (CMS-managed pages)
│   │
│   ├── api/
│   │   ├── resend-verification/
│   │   │   └── route.ts                   # POST /api/resend-verification
│   │   ├── schedule/
│   │   │   ├── sign-up/
│   │   │   │   └── route.ts              # POST /api/schedule/sign-up
│   │   │   └── log-hours/
│   │   │       └── route.ts              # POST /api/schedule/log-hours
│   │   └── send-email/
│   │       └── route.ts                   # POST /api/send-email
│   │
│   └── next/
│       ├── preview/
│       │   └── route.ts                   # Live preview entry
│       └── exit-preview/
│           ├── route.ts                   # Exit preview
│           └── GET.ts
│
└── (payload)/
    ├── layout.tsx                          # Payload admin root layout (auto-generated)
    ├── admin/
    │   └── [[...segments]]/
    │       ├── page.tsx                   # /admin (catch-all admin routes)
    │       └── not-found.tsx
    └── api/
        ├── [...slug]/
        │   └── route.ts                   # Payload REST API (catch-all)
        ├── graphql/
        │   └── route.ts                   # GraphQL endpoint
        └── graphql-playground/
            └── route.ts                   # GraphQL playground
```

## Route Summary

### Public Routes

| Route | Description |
|---|---|
| `/` | Home page |
| `/login` | Login form |
| `/create-account` | Registration form |
| `/forgot-password` | Password reset request |
| `/resend-verification` | Resend email verification |
| `/verify-email` | Email verification landing |
| `/logout` | Logout page |
| `/crews` | Public crew listing |
| `/crews/[slug]` | Crew detail with member table |
| `/crews/[slug]/schedule` | Crew schedule calendar |
| `/posts` | Blog post listing |
| `/posts/[slug]` | Individual blog post |
| `/shop` | Product shop |
| `/products/[slug]` | Product detail page |
| `/checkout` | Checkout page |
| `/checkout/confirm-order` | Order confirmation |
| `/find-order` | Look up an order |
| `/help` | Help page |
| `/site-guide` | Site guide |
| `/terms` | Terms of service |
| `/[slug]` | Dynamic CMS-managed pages |

### Authenticated Routes (Account Group)

| Route | Description |
|---|---|
| `/account` | User profile |
| `/account/addresses` | Manage addresses |
| `/account/hours` | View logged hours |
| `/account/schedule` | Personal schedule view |
| `/crew` | Crew dashboard (coordinator view) |
| `/crew/members` | Crew member management |
| `/crew/members/[id]/edit` | Edit a crew member |
| `/orders` | Order history |
| `/orders/[id]` | Order detail |

### Inventory Routes (Role-Protected)

| Route | Description |
|---|---|
| `/inventory` | Inventory dashboard |
| `/inventory/items` | Items list with filters |
| `/inventory/items/new` | Create new inventory item |
| `/inventory/items/[id]` | Item detail |
| `/inventory/items/[id]/edit` | Edit inventory item |
| `/inventory/categories` | Category management |
| `/inventory/shopping-list` | Shopping list |

### Recipe Routes (Crew/Role-Protected)

| Route | Description |
|---|---|
| `/recipes` | Recipe group listing |
| `/recipes/new` | Create new recipe |
| `/recipes/tags` | Tag management |
| `/recipes/shopping-list` | Recipe shopping list |
| `/recipes/[group]` | Recipes in a group |
| `/recipes/[group]/[id]` | Recipe detail |
| `/recipes/[group]/[id]/edit` | Edit recipe |

### Schedule Redirect

The `/schedule` route is a **server-side redirect**. It authenticates the user, looks up their assigned crew, and redirects to `/crews/[slug]/schedule`. If the user has no crew, it redirects to `/account` with a warning.

### API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/schedule/sign-up` | POST | Join or leave a shift position |
| `/api/schedule/log-hours` | POST | Log hours for a shift or date |
| `/api/resend-verification` | POST | Resend email verification |
| `/api/send-email` | POST | Send an email |

### Payload Admin Routes

| Route | Description |
|---|---|
| `/admin` | Payload CMS admin panel (catch-all) |
| `/api/*` | Payload REST API |
| `/api/graphql` | GraphQL endpoint |
| `/api/graphql-playground` | GraphQL playground |

## Conventions

- **Private directories** (`_lib/`, `_components/`) are used for route-specific utilities and components that are not pages themselves.
- **Dynamic segments** use the `[param]` syntax (e.g., `[slug]`, `[id]`, `[group]`).
- **Catch-all segments** use the `[[...segments]]` syntax for the Payload admin panel.
- **Route groups** `(app)` and `(payload)` separate concerns without affecting URLs.
- **Co-located components** like `EditMemberForm.tsx` and `CrewMembersTable.tsx` live alongside their page files when they are only used by that specific page.
