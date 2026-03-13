---
sidebar_position: 3
title: "Server vs Client Components"
---

# Server vs Client Components

OCFCrews follows the Next.js 15 App Router pattern where **components are server components by default** and only opt into client-side rendering when they need browser APIs, event handlers, or React state. This maximizes the amount of work done on the server while keeping the client bundle small.

## The Core Pattern

The standard pattern used throughout OCFCrews is:

1. **Server component** fetches data using the Payload SDK (Local API)
2. Server component passes data as **props** to a client component
3. **Client component** handles interactivity (forms, state, event handlers)

```
Server Component (page.tsx)
  └── Fetches data via Payload SDK
      └── Passes props to Client Component ('use client')
          └── Handles user interaction
```

### Example: Header

The Header follows this pattern precisely:

**Server component** (`src/components/Header/index.tsx`):
```tsx
export async function Header() {
  const header = await getCachedGlobal('header', 1)()
  return <HeaderClient header={header} />
}
```

**Client component** (`src/components/Header/index.client.tsx`):
```tsx
'use client'
export function HeaderClient({ header }: Props) {
  const { user, initialized } = useAuth()
  const pathname = usePathname()
  // ... interactive navigation rendering
}
```

The server component fetches the CMS-managed navigation items using the cached global utility. The client component receives them as props and handles interactive features like active link highlighting, role-based nav item visibility, and the mobile menu.

## Server Components

Server components are the **default** in the App Router. They run only on the server, can directly access the database and file system, and their code is never sent to the browser.

### Where Server Components Are Used

| Category | Examples |
|---|---|
| **All page files** | Every `page.tsx` in the app |
| **All layout files** | `layout.tsx` files (root, account, inventory, recipes, shop) |
| **Header (server half)** | `src/components/Header/index.tsx` |
| **Footer** | `src/components/Footer/index.tsx` |
| **Data-fetching wrappers** | `CollectionArchive`, `Grid` container, `ProductItem` |
| **CMS rendering** | `RenderBlocks`, `RichText`, `Media` |
| **Block components** | `ArchiveBlock`, `BannerBlock`, `ContentBlock`, `MediaBlock`, `ThreeItemGridBlock` |
| **Not Found page** | `src/app/(app)/not-found.tsx` |

### Server Component Data Fetching

Server components fetch data using the Payload Local API, which bypasses the REST/GraphQL layer for zero-overhead database access:

```tsx
const payload = await getPayload({ config: configPromise })
const { user } = await payload.auth({ headers })

const items = await payload.find({
  collection: 'inventory-items',
  where: { crew: { equals: userCrewId } },
  depth: 2,
})
```

Cached globals use a utility wrapper:
```tsx
const header = await getCachedGlobal('header', 1)()
```

## Client Components

Client components are marked with the `'use client'` directive at the top of the file. They are needed when a component uses browser APIs, React hooks, or event handlers.

### Key Client Components

#### Forms

All form components are client-side because they manage form state and handle submissions:

| Component | Path | Why Client |
|---|---|---|
| `LoginForm` | `src/components/Forms/LoginForm/` | Form state, `fetch()` for auth |
| `CreateAccountForm` | `src/components/Forms/CreateAccountForm/` | Form state, validation |
| `ForgotPasswordForm` | `src/components/Forms/ForgotPasswordForm/` | Form state, `fetch()` |
| `ResendVerificationForm` | `src/components/Forms/ResendVerificationForm/` | Form state, `fetch()` |
| `AccountForm` | `src/components/Forms/AccountForm/` | Profile editing, form state |
| `AddressForm` | `src/components/Forms/AddressForm/` | Address CRUD, form state |
| `CheckoutForm` | `src/components/Forms/CheckoutForm/` | Stripe integration, form state |
| `FindOrderForm` | `src/components/Forms/FindOrderForm/` | Form state, `fetch()` |
| `InventoryItemForm` | `src/components/Inventory/InventoryItemForm/` | Complex form with image upload, category selection |
| `RecipeForm` | `src/components/Recipes/RecipeForm/` | Complex form with ingredients, steps, image upload |
| `EditMemberForm` | `src/app/(app)/(account)/crew/members/[id]/edit/` | Role/crew editing |
| `QuickTransactionForm` | `src/components/Inventory/QuickTransactionForm/` | Inline transaction recording |

#### Schedule Components

| Component | Path | Why Client |
|---|---|---|
| `ScheduleCalendar` | `src/components/Schedule/ScheduleCalendar/` | Calendar navigation state, view toggling (month/week/day), optimistic sign-ups |
| `MonthView` | `src/components/Schedule/ScheduleCalendar/MonthView.tsx` | Click handlers for day selection |
| `WeekView` | `src/components/Schedule/ScheduleCalendar/WeekView.tsx` | Shift sign-up interactions |
| `DayView` | `src/components/Schedule/ScheduleCalendar/DayView.tsx` | Shift management, hour logging |
| `ShiftCard` | `src/components/Schedule/ShiftCard/` | Interactive shift display with sign-up/leave actions |

#### Inventory Components

| Component | Path | Why Client |
|---|---|---|
| `InventoryFilters` | `src/components/Inventory/InventoryFilters/` | Filter state, URL param updates |
| `InventoryNav` | `src/components/Inventory/InventoryNav/` | Active link highlighting with `usePathname()` |
| `CategoryManager` | `src/components/Inventory/CategoryManager/` | CRUD operations for categories |
| `InventoryImageLightbox` | `src/components/Inventory/InventoryImageLightbox/` | Image zoom/lightbox UI state |

#### Recipe Components

| Component | Path | Why Client |
|---|---|---|
| `RecipeFilters` | `src/components/Recipes/RecipeFilters/` | Filter state, URL param updates |
| `RecipeNav` | `src/components/Recipes/RecipeNav/` | Active link highlighting |
| `RecipeFavoriteButton` | `src/components/Recipes/RecipeFavoriteButton/` | Toggle favorite state |
| `CloneRecipeButton` | `src/components/Recipes/CloneRecipeButton/` | Click handler, navigation |
| `PrintButton` | `src/components/Recipes/PrintButton/` | `window.print()` API |
| `RecipeScaler` | `src/components/Recipes/RecipeScaler/` | Ingredient scaling state |
| `RecipeImageDisplay` | `src/components/Recipes/RecipeImageDisplay/` | Image interaction state |
| `SubGroupTagManager` | `src/components/Recipes/SubGroupTagManager/` | Tag CRUD operations |
| `RecipeShoppingListClient` | `src/app/(app)/recipes/shopping-list/_components/` | Shopping list state management |
| `DeleteRecipeButton` | `src/app/(app)/recipes/[group]/[id]/_components/` | Confirmation dialog, delete action |

#### Shop Components

| Component | Path | Why Client |
|---|---|---|
| `Cart` / `CartModal` | `src/components/Shop/Cart/` | Cart state from EcommerceProvider context |
| `AddToCart` | `src/components/Shop/Cart/AddToCart.tsx` | Cart mutations |
| `DeleteItemButton` | `src/components/Shop/Cart/DeleteItemButton.tsx` | Cart mutations |
| `EditItemQuantityButton` | `src/components/Shop/Cart/EditItemQuantityButton.tsx` | Cart mutations |
| `CheckoutPage` | `src/components/Shop/checkout/CheckoutPage.tsx` | Stripe payment flow |
| `CheckoutAddresses` | `src/components/Shop/checkout/CheckoutAddresses.tsx` | Address selection state |
| `ConfirmOrder` | `src/components/Shop/checkout/ConfirmOrder.tsx` | Order confirmation state |
| `Gallery` | `src/components/Shop/product/Gallery.tsx` | Image carousel state |
| `VariantSelector` | `src/components/Shop/product/VariantSelector.tsx` | Variant selection state |
| `StockIndicator` | `src/components/Shop/product/StockIndicator.tsx` | Real-time stock display |
| `ProductDescription` | `src/components/Shop/product/ProductDescription.tsx` | Interactive product info |
| `CategoryTabs` | `src/components/Shop/CategoryTabs/` | Tab selection state |
| `Price.client` | `src/components/Shop/Price.client.tsx` | Currency formatting |

#### Global UI Components

| Component | Path | Why Client |
|---|---|---|
| `HeaderClient` | `src/components/Header/index.client.tsx` | `usePathname()`, `useAuth()`, role-based nav |
| `MobileMenu` | `src/components/Header/MobileMenu.tsx` | Sheet open/close state, responsive behavior |
| `AdminBar` | `src/components/AdminBar/` | `useAuth()`, `useSelectedLayoutSegments()` |
| `FooterMenu` | `src/components/Footer/menu.tsx` | Active link detection |
| `AccountNav` | `src/components/Account/AccountNav/` | `usePathname()` for active state |
| `HomeClient` | `src/components/Home/HomeClient.tsx` | Interactive home page elements |
| `Logo` | `src/components/Logo/` | SVG with client-side interactivity |
| `Search` | `src/components/Search/` | Search input state, URL param updates |
| `ThemeSelector` | `src/providers/Theme/ThemeSelector` | Theme toggle interaction |
| `LoadingSpinner` | `src/components/LoadingSpinner/` | Animation state |
| `RenderParams` | `src/components/RenderParams/Component.tsx` | URL search param reading |

## Hydration Considerations

### suppressHydrationWarning

The root `<html>` element includes `suppressHydrationWarning`:

```tsx
<html
  className={[GeistSans.variable, GeistMono.variable].filter(Boolean).join(' ')}
  lang="en"
  suppressHydrationWarning
>
```

This is necessary because the `<InitTheme />` component injects an inline script in `<head>` that sets a `data-theme` attribute on `<html>` before React hydrates. Without this attribute, there would be a hydration mismatch between the server-rendered HTML (no theme attribute) and the client (theme attribute set by the script).

### Theme Initialization

The `<InitTheme />` component prevents a flash of incorrect theme by running before React hydrates:

1. The inline script reads the theme preference from `localStorage`
2. It sets the `data-theme` attribute on `<html>` immediately
3. React hydrates and the `ThemeProvider` picks up the existing theme

## File Naming Convention

OCFCrews uses a naming convention to distinguish server and client files when both exist for the same component:

- `index.tsx` -- Server component (default)
- `index.client.tsx` -- Client component
- `Component.client.tsx` -- Client component variant of a block

Examples:
- `Header/index.tsx` (server) + `Header/index.client.tsx` (client)
- `Carousel/Component.tsx` (server) + `Carousel/Component.client.tsx` (client)
- `Code/Component.tsx` (server) + `Code/Component.client.tsx` (client)

## Best Practices in This Codebase

1. **Keep client components as leaf nodes.** Push `'use client'` as far down the component tree as possible. The page itself should remain a server component.

2. **Fetch data in server components.** Never use `fetch()` in server components to call your own API routes. Use the Payload Local API directly.

3. **Pass serializable props.** Data passed from server to client components must be serializable (no functions, classes, or symbols). Dates should be passed as ISO strings.

4. **Use optimistic updates in client components.** The `ScheduleCalendar` demonstrates this pattern: update the UI immediately, send the API request, and revert on failure. Previous values are captured before mutation and restored precisely on error.

5. **Co-locate client components near their usage.** Route-specific client components like `EditMemberForm` and `DeleteRecipeButton` live in `_components/` directories adjacent to their page files rather than in the global `src/components/` tree.
