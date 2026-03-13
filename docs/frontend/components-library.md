---
sidebar_position: 4
title: "Components Library"
---

# Components Library

All reusable React components live under `src/components/`, organized by domain. This page provides an overview of every component directory and the components within it.

## Directory Overview

```
src/components/
├── Account/            # User account management
├── AdminAvatar/        # Admin panel custom avatar
├── AdminBar/           # Admin toolbar for quick CMS access
├── BeforeHeader/       # Payload admin custom component (before header)
├── BeforeLogin/        # Payload admin custom login page component
├── CampingTagImage/    # Custom image component for camping tags
├── CollectionArchive/  # Generic collection listing
├── CustomDashboard/    # Payload admin custom dashboard
├── Footer/             # Site footer
├── Forms/              # Authentication and account forms
├── Grid/               # Product grid layout
├── Header/             # Site header and navigation
├── Home/               # Home page components
├── Inventory/          # Inventory management
├── layout/             # Layout sub-components (search, filters)
├── Link/               # CMS-managed link component
├── LivePreviewListener/# Payload live preview integration
├── LoadingSpinner/     # Loading indicator
├── Logo/               # Site logo and icon
├── Media/              # Image and video rendering
├── Message/            # Message display component
├── Recipes/            # Recipe management
├── RenderParams/       # URL parameter reader
├── RichText/           # Rich text renderer
├── Onboarding/         # Getting Started checklist
├── Schedule/           # Crew scheduling
├── Search/             # Search input
├── Shop/               # E-commerce components
├── ViewToggle/         # Grid/list view toggle
└── ui/                 # shadcn/ui primitives (see separate page)
```

## Account Components

**Directory:** `src/components/Account/`

| Component | File | Type | Description |
|---|---|---|---|
| `AccountNav` | `AccountNav/index.tsx` | Client | Sidebar navigation for account pages. Renders links to profile, addresses, hours, schedule, crew, and orders. Highlights active link using `usePathname()`. Accepts `crewSlug` prop to link to the user's crew page. Hidden on mobile. |
| `AddressListing` | `addresses/AddressListing.tsx` | Client | Displays a list of saved addresses with edit and delete actions. |
| `AddressItem` | `addresses/AddressItem.tsx` | Client | Individual address card with action buttons. |
| `CreateAddressModal` | `addresses/CreateAddressModal.tsx` | Client | Modal dialog for creating a new address using the `Dialog` UI component. |

## Onboarding Components

**Directory:** `src/components/Onboarding/`

| Component | File | Type | Description |
|---|---|---|---|
| `OnboardingCard` | `OnboardingCard.tsx` | Client | Getting Started checklist shown on the home page for new users. Displays a list of steps (profile, schedule, guides, chat) with completion state, progress bar, and links. Dismissible via `DismissOnboardingButton` which calls `/api/account/dismiss-onboarding`. Responsive layout: CTA below text on mobile, inline on desktop. |
| `DismissOnboardingButton` | `DismissOnboardingButton.tsx` | Client | Button to dismiss the onboarding card permanently (sets `onboardingDismissedAt` on user record). |

## ViewToggle Component

**Directory:** `src/components/ViewToggle/`

| Component | File | Type | Description |
|---|---|---|---|
| `ViewToggle` | `index.tsx` | Client | Grid/list view toggle button. Persists selection via `?view=list` URL search parameter using `useSearchParams` + `useTransition`. Used on crews page, inventory items, and other list/grid pages. |

## Schedule Components

**Directory:** `src/components/Schedule/`

| Component | File | Type | Description |
|---|---|---|---|
| `ScheduleCalendar` | `ScheduleCalendar/index.tsx` | Client | The main calendar component. Manages calendar state (current date, view mode), optimistic sign-up overrides, hours logging (shift-specific and extra/daily), and API interactions. Contains a toolbar with prev/next navigation, "Today" button, and month/week/day view toggles. |
| `MonthView` | `ScheduleCalendar/MonthView.tsx` | Client | Monthly calendar grid. Displays shift counts per day with color indicators. Shows hours logged. Click on a day to drill into day view. |
| `WeekView` | `ScheduleCalendar/WeekView.tsx` | Client | Weekly view showing 7 days (Monday-Sunday). Displays shift cards for each day with sign-up capability. |
| `DayView` | `ScheduleCalendar/DayView.tsx` | Client | Detailed single-day view. Shows all shifts with position details, assigned members, sign-up/leave buttons, member removal (for coordinators), and hour logging. Supports both shift-specific and extra daily hour entries. |
| `ShiftCard` | `ShiftCard/index.tsx` | Client | Compact card representing a single shift. Shows time, position info, and assigned member count. Used in week and month views. |

### ScheduleCalendar Architecture

The `ScheduleCalendar` receives all schedule data and time entries as props from its parent server component. It manages three types of local state:

- **`optimisticOverrides`** -- Maps position keys to optimistic member lists for instant sign-up feedback
- **`entryMap`** -- Maps schedule IDs to logged hours for shift-specific entries
- **`extraMap`** -- Maps date strings to extra hours for daily entries not tied to a specific shift

All mutations use optimistic updates: the UI updates immediately, an API call is made, and on failure the previous state is restored precisely.

## Inventory Components

**Directory:** `src/components/Inventory/`

| Component | File | Type | Description |
|---|---|---|---|
| `InventoryNav` | `InventoryNav/index.tsx` | Client | Navigation for inventory pages. Supports two display modes: vertical sidebar (desktop) and horizontal tabs (mobile). Shows admin-only links (categories) when `isAdmin` is true. |
| `InventoryItemForm` | `InventoryItemForm/index.tsx` | Client | Full-featured form for creating and editing inventory items. Handles image upload, category/subcategory selection, quantity fields, notes, and more. Uses `useRouter()` for navigation after save. |
| `InventoryItemCard` | `InventoryItemCard/index.tsx` | Server | Card display for an inventory item in list views. Shows image thumbnail, name, category, quantity, and status indicators. |
| `InventoryFilters` | `InventoryFilters/index.tsx` | Client | Filter controls for the inventory items list. Manages category, subcategory, search, and status filters via URL search parameters. |
| `QuickTransactionForm` | `QuickTransactionForm/index.tsx` | Client | Inline form for quickly recording inventory transactions (add/remove stock) without navigating away from the item detail page. |
| `CategoryManager` | `CategoryManager/index.tsx` | Client | Admin component for managing inventory categories and subcategories. Supports create, rename, reorder, and delete operations. |
| `CategoryIcon` | `CategoryIcon/index.tsx` | Server | Renders an icon for a given inventory category. Maps category slugs to appropriate icon components. |
| `InventoryImageLightbox` | `InventoryImageLightbox/index.tsx` | Client | Full-screen lightbox for viewing inventory item images. Handles zoom, pan, and close interactions. |

## Recipe Components

**Directory:** `src/components/Recipes/`

| Component | File | Type | Description |
|---|---|---|---|
| `RecipeNav` | `RecipeNav/index.tsx` | Client | Navigation for recipe pages. Dual-mode display (sidebar/tabs) like InventoryNav. Shows admin links when `isAdmin` is true. |
| `RecipeForm` | `RecipeForm/index.tsx` | Client | Complex form for creating and editing recipes. Manages ingredients array, steps array, image upload, group/tag selection, serving size, prep/cook time, and notes. |
| `RecipeCard` | `RecipeCard/index.tsx` | Server | Card display for a recipe in list views. Shows image, title, group, tags, prep time, and favorite status. |
| `RecipeGroupCard` | `RecipeGroupCard/index.tsx` | Server | Card representing a recipe group (e.g., "Breakfast", "Dinner"). Shows group icon, name, and recipe count. |
| `RecipeFilters` | `RecipeFilters/index.tsx` | Client | Filter controls for recipe lists. Manages search, group, tag, and favorite filters via URL search parameters. |
| `RecipeFavoriteButton` | `RecipeFavoriteButton/index.tsx` | Client | Toggle button for favoriting/unfavoriting a recipe. Sends API request and updates UI optimistically. |
| `CloneRecipeButton` | `CloneRecipeButton/index.tsx` | Client | Button that clones an existing recipe, creating a new draft copy. Navigates to the new recipe's edit page. |
| `PrintButton` | `PrintButton/index.tsx` | Client | Triggers the browser's print dialog via `window.print()`. Styled for recipe detail pages. |
| `RecipeScaler` | `RecipeScaler/index.tsx` | Client | Controls for scaling recipe ingredients up or down by a multiplier. Manages the scaling factor in local state. |
| `RecipeIcon` | `RecipeIcon/index.tsx` | Server | Renders an icon for a recipe group. Maps group identifiers to icon components. |
| `RecipeImageDisplay` | `RecipeImageDisplay/index.tsx` | Client | Displays recipe images with interaction support (click to enlarge). |
| `SubGroupTagManager` | `SubGroupTagManager/index.tsx` | Client | Admin component for managing recipe sub-group tags. Supports CRUD operations on tags within a group. |

## Shop Components

**Directory:** `src/components/Shop/`

### Cart

| Component | File | Type | Description |
|---|---|---|---|
| `Cart` | `Cart/index.tsx` | Server | Cart entry point. Wraps the cart modal. |
| `CartModal` | `Cart/CartModal.tsx` | Client | Slide-out cart drawer showing cart contents, quantities, and totals. Uses the `Sheet` UI component. |
| `AddToCart` | `Cart/AddToCart.tsx` | Client | "Add to Cart" button with variant awareness. Integrates with the `EcommerceProvider` context. |
| `OpenCartButton` | `Cart/OpenCart.tsx` | Client | Cart icon button showing item count badge. Opens the cart modal. |
| `CloseCart` | `Cart/CloseCart.tsx` | Client | Close button for the cart drawer. |
| `DeleteItemButton` | `Cart/DeleteItemButton.tsx` | Client | Remove item from cart with confirmation. |
| `EditItemQuantityButton` | `Cart/EditItemQuantityButton.tsx` | Client | Increment/decrement quantity buttons for cart items. |

### Product Display

| Component | File | Type | Description |
|---|---|---|---|
| `ProductGridItem` | `ProductGridItem/index.tsx` | Server | Product card for grid layouts. Shows image, title, price. Links to product detail. |
| `ProductItem` | `ProductItem/index.tsx` | Server | Alternative product display component. |
| `ProductDescription` | `product/ProductDescription.tsx` | Client | Interactive product description with variant information. |
| `Gallery` | `product/Gallery.tsx` | Client | Product image gallery with thumbnail navigation and main image display. |
| `VariantSelector` | `product/VariantSelector.tsx` | Client | Renders selectable variant options (size, color, etc.) and updates the selected variant in the ecommerce context. |
| `StockIndicator` | `product/StockIndicator.tsx` | Client | Shows real-time stock availability status for a product/variant. |
| `Price.client` | `Price.client.tsx` | Client | Formats and displays product prices with currency formatting. |

### Checkout

| Component | File | Type | Description |
|---|---|---|---|
| `CheckoutPage` | `checkout/CheckoutPage.tsx` | Client | Main checkout flow component. Integrates Stripe payment elements, order summary, and address selection. |
| `CheckoutAddresses` | `checkout/CheckoutAddresses.tsx` | Client | Address selection/entry component within the checkout flow. |
| `ConfirmOrder` | `checkout/ConfirmOrder.tsx` | Client | Order confirmation display after successful payment. |

### Other Shop

| Component | File | Type | Description |
|---|---|---|---|
| `CategoryTabs` | `CategoryTabs/index.tsx` | Server | Product category tab navigation for the shop page. |
| `CategoryTabs/Item` | `CategoryTabs/Item.tsx` | Client | Individual category tab with active state. |
| `OrderItem` | `OrderItem/index.tsx` | Server | Displays a single order line item. |
| `OrderStatus` | `OrderStatus/index.tsx` | Server | Renders the order status badge (pending, paid, shipped, etc.). |

## Forms

**Directory:** `src/components/Forms/`

| Component | File | Type | Description |
|---|---|---|---|
| `LoginForm` | `LoginForm/index.tsx` | Client | Email/password login form. Calls Payload auth API, redirects on success. |
| `CreateAccountForm` | `CreateAccountForm/index.tsx` | Client | Registration form with name, email, password fields. |
| `ForgotPasswordForm` | `ForgotPasswordForm/index.tsx` | Client | Password reset request form. Sends email via Payload. |
| `ResendVerificationForm` | `ResendVerificationForm/index.tsx` | Client | Resend email verification link form. |
| `AccountForm` | `AccountForm/index.tsx` | Client | Edit user profile (name, email, photo). |
| `AddressForm` | `AddressForm/index.tsx` | Client | Create/edit shipping or billing address. |
| `CheckoutForm` | `CheckoutForm/index.tsx` | Client | Checkout form wrapping Stripe elements. |
| `FindOrderForm` | `FindOrderForm/index.tsx` | Client | Look up an order by order number and email. |
| `FormError` | `FormError.tsx` | Server | Standardized form error message display. |
| `FormItem` | `FormItem.tsx` | Server | Standardized form field wrapper with label and error. |

## Header Components

**Directory:** `src/components/Header/`

| Component | File | Type | Description |
|---|---|---|---|
| `Header` | `index.tsx` | Server | Fetches the header global from Payload CMS (cached). Passes nav items to the client component. |
| `HeaderClient` | `index.client.tsx` | Client | Full header navigation bar. Renders CMS-managed nav items, hardcoded links (Crews, Posts, Schedule), role-conditional links (Inventory in amber, Recipes in sky blue), theme toggle, cart, and user avatar/login button. Sticky positioned with emerald gradient background. |
| `MobileMenu` | `MobileMenu.tsx` | Client | Slide-out mobile navigation using the `Sheet` component. Shows all nav items, role-conditional links, user profile section, and logout. Auto-closes on navigation or window resize above `md` breakpoint. |

## Footer Components

**Directory:** `src/components/Footer/`

| Component | File | Type | Description |
|---|---|---|---|
| `Footer` | `index.tsx` | Server | Fetches the footer global from Payload CMS. Renders the logo, CMS-managed footer links, and copyright notice. |
| `FooterMenu` | `menu.tsx` | Client | Renders the footer navigation links with active state detection. |

## Layout Components

**Directory:** `src/components/layout/`

| Component | File | Type | Description |
|---|---|---|---|
| `Categories` | `layout/search/Categories.tsx` | Server | Fetches product categories for the shop sidebar. |
| `Categories.client` | `layout/search/Categories.client.tsx` | Client | Renders the category list with active state highlighting. |
| `FilterList` | `layout/search/filter/index.tsx` | Server | Filter list container for shop sorting options. |
| `FilterItem` | `layout/search/filter/FilterItem.tsx` | Client | Individual filter option with link-based state. |
| `FilterItemDropdown` | `layout/search/filter/FilterItemDropdown.tsx` | Client | Dropdown variant of filter selection. |

## Shared Components

### AdminBar

**File:** `src/components/AdminBar/index.tsx` (Client)

A toolbar visible only to admin users. Uses `@payloadcms/admin-bar` to provide quick access to edit the current page/post in the Payload admin panel. Only renders when the user is authenticated and has the `admin` role.

### Logo

**File:** `src/components/Logo/index.tsx` (Client)

Exports two components:
- `Logo` -- Full logo with text
- `Icon` -- Icon-only variant (used in footer and mobile menu header)

### Media

**Directory:** `src/components/Media/`

| Component | Type | Description |
|---|---|---|
| `Media` (index) | Server | Dispatcher that renders either `ImageMedia` or `VideoMedia` based on the media type. |
| `ImageMedia` | Client | Renders images using Next.js `Image` component with responsive sizing and blur placeholders. |
| `VideoMedia` | Client | Renders video elements with autoplay and loop support. |

### RichText

**File:** `src/components/RichText/index.tsx` (Server)

Renders Payload Lexical rich text content to React elements. Used throughout CMS-managed content areas (pages, posts, blocks).

### Link (CMSLink)

**File:** `src/components/Link/index.tsx` (Server)

A polymorphic link component that handles both internal and external CMS-managed links. Supports button appearances and integrates with the `Button` component variants.

### Grid

**Directory:** `src/components/Grid/`

| Component | Type | Description |
|---|---|---|
| `Grid` | Server | CSS grid container for product layouts. |
| `GridTileImage` | Server | Grid tile with image, label overlay. |
| `Label` | Server | Label overlay for grid tiles (title, price, etc.). |

### Other

| Component | Directory | Type | Description |
|---|---|---|---|
| `CollectionArchive` | `CollectionArchive/` | Server | Generic archive/listing component for Payload collections. |
| `Search` | `Search/` | Client | Search input with debounced URL parameter updates. |
| `LoadingSpinner` | `LoadingSpinner/` | Client | Animated loading indicator. |
| `RenderParams` | `RenderParams/` | Client | Reads URL search parameters (like `warning` or `success`) and displays them as notifications. |
| `LivePreviewListener` | `LivePreviewListener/` | Client | Listens for Payload CMS live preview messages and updates the page in real-time. |
| `Message` | `Message/` | Server | Styled message/alert component. |
| `HomeClient` | `Home/` | Client | Client-side interactive elements for the home page. |
| `AdminAvatar` | `AdminAvatar/` | Client | Custom avatar component for the Payload admin panel. |
| `CustomDashboard` | `CustomDashboard/` | Client | Custom dashboard for the Payload admin panel. |
| `BeforeHeader` | `BeforeHeader/` | Client | Payload admin custom component injected before the admin header. |
| `BeforeLogin` | `BeforeLogin/` | Client | Custom branding/content on the Payload admin login page. |
| `CampingTagImage` | `CampingTagImage/` | Client | Specialized image component for camping tag displays. |
