---
sidebar_position: 6
title: "shadcn/ui Components"
---

# shadcn/ui Components

OCFCrews uses [shadcn/ui](https://ui.shadcn.com/) as its base UI component library. These are not installed as a package dependency -- they are copied into the project as source files under `src/components/ui/` and can be freely customized.

## Component Inventory

All shadcn/ui components live in `src/components/ui/`:

| Component | File | Radix Primitive | Description |
|---|---|---|---|
| **Accordion** | `accordion.tsx` | `@radix-ui/react-accordion` | Collapsible content sections. Used for FAQ-style content and expandable details. |
| **Button** | `button.tsx` | `@radix-ui/react-slot` | Versatile button component with multiple variants and sizes. The most-used UI primitive in the project. |
| **Card** | `card.tsx` | None (native `div`) | Container component with header, content, and footer sections. Used for inventory items, recipe cards, product cards, and more. |
| **Carousel** | `carousel.tsx` | None (uses `embla-carousel-react`) | Scrollable carousel for product displays. Used by the Carousel block. |
| **Checkbox** | `checkbox.tsx` | `@radix-ui/react-checkbox` | Styled checkbox input. Used in forms and filter interfaces. |
| **Dialog** | `dialog.tsx` | `@radix-ui/react-dialog` | Modal dialog overlay. Used for address creation, confirmations, and lightbox views. |
| **Input** | `input.tsx` | None (native `input`) | Styled text input field. Used throughout all forms. |
| **Label** | `label.tsx` | `@radix-ui/react-label` | Accessible form label component. Paired with Input, Select, and other form fields. |
| **Pagination** | `pagination.tsx` | None (native elements) | Page navigation controls. Used for paginated lists (inventory items, recipes). |
| **Select** | `select.tsx` | `@radix-ui/react-select` | Dropdown select component with search and custom option rendering. Used for category selection, role assignment, and more. |
| **Sheet** | `sheet.tsx` | `@radix-ui/react-dialog` | Slide-out panel from screen edge. Used for the mobile navigation menu and cart drawer. |
| **Sonner** | `sonner.tsx` | None (uses `sonner`) | Toast notification provider. Configured with theme awareness and the project's font. |
| **Textarea** | `textarea.tsx` | None (native `textarea`) | Multi-line text input. Used for notes, descriptions, and recipe steps. |

## The `cn()` Utility

**File:** `src/utilities/cn.ts`

All shadcn/ui components use the `cn()` utility for class name composition:

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

This combines two libraries:

- **`clsx`** -- Conditionally joins class names. Handles strings, objects, arrays, and falsy values.
- **`tailwind-merge`** -- Intelligently merges Tailwind CSS classes, resolving conflicts. For example, `cn('px-4', 'px-8')` produces `'px-8'` rather than `'px-4 px-8'`.

### Usage Example

```tsx
<div className={cn(
  'base-classes text-sm',
  isActive && 'bg-emerald-600 text-white',
  className  // allow parent override
)} />
```

## Button Component (Deep Dive)

**File:** `src/components/ui/button.tsx`

The Button component is built with [Class Variance Authority (CVA)](https://cva.style/) for type-safe variant management.

### Variant Definitions

```tsx
const buttonVariants = cva(
  // Base classes applied to all buttons
  "relative inline-flex items-center justify-center hover:cursor-pointer gap-2 ...",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive: 'bg-destructive text-white shadow-xs hover:bg-destructive/90 ...',
        outline: 'border border-input bg-card shadow-xs hover:bg-accent ...',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'text-primary/50 hover:text-primary [&.active]:text-primary ...',
        link: 'text-primary underline-offset-4 hover:underline',
        nav: 'text-primary/50 hover:text-primary [&.active]:text-primary p-0 pt-2 pb-6 ...',
      },
      size: {
        clear: '',        // No size styles (for custom sizing)
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',   // Square button for icon-only usage
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
```

### Available Variants

| Variant | Use Case |
|---|---|
| `default` | Primary actions (submit, save, confirm) |
| `destructive` | Dangerous actions (delete, remove) |
| `outline` | Secondary actions with border |
| `secondary` | Alternative secondary style |
| `ghost` | Minimal style for toolbars and nav items |
| `link` | Styled as a text link with underline on hover |
| `nav` | Navigation links in the header with active state support via `[&.active]` |

### Available Sizes

| Size | Use Case |
|---|---|
| `clear` | No size constraints -- used with `nav` variant and custom layouts |
| `default` | Standard button height (h-9) |
| `sm` | Compact button (h-8) |
| `lg` | Large button (h-10) |
| `icon` | Square 36px button for icon-only usage |

### The `asChild` Pattern

The Button supports polymorphic rendering via `@radix-ui/react-slot`:

```tsx
// Renders as a <button>
<Button>Click me</Button>

// Renders as an <a> via Next.js Link, with Button styles
<Button asChild variant="default">
  <Link href="/account">My Account</Link>
</Button>
```

When `asChild` is true, the Button's styles are applied to its child element instead of rendering a `<button>` tag. This is used extensively in the Header for navigation links that should look like buttons.

## Card Component

**File:** `src/components/ui/card.tsx`

A composable card component with named sub-components:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Item Name</CardTitle>
    <CardDescription>Item description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

Each sub-component uses the `data-slot` attribute pattern for styling hooks:

| Sub-component | Slot | Default Classes |
|---|---|---|
| `Card` | `card` | `bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm` |
| `CardHeader` | `card-header` | `flex flex-col gap-1.5 px-6` |
| `CardTitle` | `card-title` | `leading-none font-semibold` |
| `CardDescription` | `card-description` | `text-muted-foreground text-sm` |
| `CardContent` | `card-content` | `px-6` |
| `CardFooter` | `card-footer` | `flex items-center px-6` |

## Radix UI Primitives

Most shadcn/ui components are built on top of [Radix UI](https://www.radix-ui.com/) primitives, which provide:

- **Accessible by default** -- Proper ARIA attributes, keyboard navigation, focus management
- **Unstyled** -- Only behavior, no visual opinions (styling is handled by Tailwind classes)
- **Composable** -- Each primitive exposes sub-components (Trigger, Content, Item, etc.)

### Radix Dependencies Used

| Radix Package | Used By |
|---|---|
| `@radix-ui/react-accordion` | Accordion |
| `@radix-ui/react-checkbox` | Checkbox |
| `@radix-ui/react-dialog` | Dialog, Sheet |
| `@radix-ui/react-label` | Label |
| `@radix-ui/react-select` | Select |
| `@radix-ui/react-slot` | Button (`asChild` prop) |

## Sonner (Toast Notifications)

**File:** `src/components/ui/sonner.tsx`

The Sonner component configures the toast notification system:

```tsx
import { Toaster as Sonner } from 'sonner'

const Toaster = ({ ...props }) => {
  return <Sonner theme={theme} className="toaster group" richColors {...props} />
}
```

Usage throughout the application:

```tsx
import { toast } from 'sonner'

// Success notification
toast.success('Item saved successfully')

// Error notification
toast.error('Failed to update sign-up. Please try again.')

// From API error responses
const data = await res.json()
toast.error(data?.error ?? 'Something went wrong.')
```

The `SonnerProvider` is mounted in the root provider stack so toasts are available on all pages.

## Adding New shadcn/ui Components

To add a new shadcn/ui component to the project:

### Option 1: Using the CLI

```bash
npx shadcn@latest add [component-name]
```

This downloads the component source into `src/components/ui/` and installs any required Radix dependencies.

### Option 2: Manual Installation

1. Copy the component source from the [shadcn/ui docs](https://ui.shadcn.com/docs/components)
2. Place it in `src/components/ui/[component-name].tsx`
3. Install any required Radix UI packages: `pnpm add @radix-ui/react-[primitive]`
4. Ensure the component imports `cn` from `@/utilities/cn`

### Configuration

The project's shadcn/ui configuration is defined in `components.json` at the project root. This controls:
- Component output directory (`src/components/ui`)
- Utility function path (`@/utilities/cn`)
- Tailwind CSS configuration
- TypeScript path aliases
