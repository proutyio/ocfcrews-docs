---
sidebar_position: 5
title: "shadcn/ui Setup"
---

# shadcn/ui Setup

OCFCrews uses [shadcn/ui](https://ui.shadcn.com/) as its component library foundation. Rather than being a traditional npm dependency, shadcn/ui provides copy-paste component code that lives directly in your project, built on top of Radix UI primitives and Tailwind CSS.

## Configuration

The project's shadcn/ui configuration is defined in `components.json` at the project root:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/(app)/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/utilities"
  }
}
```

### Key Settings

| Setting | Value | Description |
|---------|-------|-------------|
| `style` | `"default"` | Uses the default shadcn/ui style (not "new-york") |
| `rsc` | `true` | Components are React Server Component compatible |
| `tsx` | `true` | Components use TypeScript JSX |
| `baseColor` | `"slate"` | Base neutral color palette |
| `cssVariables` | `true` | Uses CSS variables for theming (not hardcoded colors) |
| `aliases.components` | `"@/components"` | Components install to `src/components/` |
| `aliases.utils` | `"@/utilities"` | Utility functions resolve to `src/utilities/` |

## Installed Components

Component files live in `src/components/ui/`. The following components are currently installed:

| Component | File | Radix Primitive |
|-----------|------|-----------------|
| Accordion | `accordion.tsx` | `@radix-ui/react-accordion` |
| Button | `button.tsx` | `@radix-ui/react-slot` |
| Card | `card.tsx` | None (pure HTML) |
| Carousel | `carousel.tsx` | Embla Carousel |
| Checkbox | `checkbox.tsx` | `@radix-ui/react-checkbox` |
| Dialog | `dialog.tsx` | `@radix-ui/react-dialog` |
| Input | `input.tsx` | None (pure HTML) |
| Label | `label.tsx` | `@radix-ui/react-label` |
| Pagination | `pagination.tsx` | None (pure HTML) |
| Select | `select.tsx` | `@radix-ui/react-select` |
| Sheet | `sheet.tsx` | `@radix-ui/react-dialog` |
| Sonner | `sonner.tsx` | `sonner` |
| Textarea | `textarea.tsx` | None (pure HTML) |

## Core Dependencies

### Radix UI

Radix UI provides unstyled, accessible primitives. The following Radix packages are installed:

- `@radix-ui/react-accordion`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-dialog`
- `@radix-ui/react-label`
- `@radix-ui/react-select`
- `@radix-ui/react-slot`

### Class Variance Authority (CVA)

[CVA](https://cva.style/) (`class-variance-authority`) manages component variants. It defines variant maps that produce the correct Tailwind class combinations:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // Base classes applied to all variants
  "inline-flex items-center justify-center rounded-md text-sm font-medium ...",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive: 'bg-destructive text-white shadow-xs hover:bg-destructive/90',
        outline: 'border border-input bg-card shadow-xs hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'text-primary/50 hover:text-primary uppercase font-mono tracking-widest text-xs',
        link: 'text-primary underline-offset-4 hover:underline',
        nav: 'text-primary/50 hover:text-primary uppercase font-mono tracking-widest text-xs',
      },
      size: {
        clear: '',
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md gap-1.5 px-3',
        lg: 'h-10 rounded-md px-6',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
```

### The `cn()` Utility

The `cn()` function combines `clsx` for conditional class names with `tailwind-merge` to resolve conflicting Tailwind classes. It is located at `src/utilities/cn.ts`:

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Usage:**

```tsx
import { cn } from '@/utilities/cn'

<div className={cn(
  'rounded-lg border p-4',
  isActive && 'border-emerald-500',
  className  // allows parent component to override styles
)} />
```

**Why both `clsx` and `tailwind-merge`?**

- `clsx` handles conditional logic: falsy values, arrays, objects
- `tailwind-merge` intelligently resolves conflicts (e.g., `p-4` + `p-6` = `p-6`, not both)

## Component Pattern

Every shadcn/ui component follows the same pattern:

```tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utilities/cn'

// 1. Define variants with CVA
const buttonVariants = cva("base-classes", { variants: { ... } })

// 2. Define props type extending HTML element + CVA variants
export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

// 3. Component implementation
function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// 4. Export component and variants
export { Button, buttonVariants }
```

The `asChild` prop (via Radix `Slot`) allows rendering the button as a child element (e.g., wrapping a `<Link>`) while preserving all button styling.

## Adding New Components

To add a new shadcn/ui component:

```bash
# Using the shadcn CLI
npx shadcn@latest add <component-name>

# Examples:
npx shadcn@latest add tooltip
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
```

The CLI reads `components.json` and places the component file in `src/components/ui/` with the correct import paths.

### Manual Installation

If you prefer to add components manually:

1. Copy the component code from the [shadcn/ui docs](https://ui.shadcn.com/docs/components)
2. Place it in `src/components/ui/`
3. Update the import path for `cn` from `@/lib/utils` to `@/utilities/cn`
4. Install any required Radix UI dependencies

## Toast Notifications

The `sonner` package is used for toast notifications instead of shadcn/ui's built-in toast. The `SonnerProvider` component is mounted in the provider tree:

```tsx
import { toast } from 'sonner'

// Success notification
toast.success('Schedule updated successfully')

// Error notification
toast.error('Failed to sign up for shift')
```

## Animation Integration

Several shadcn/ui components use the custom animations defined in `tailwind.config.mjs`:

- **Accordion:** Uses `accordion-down` and `accordion-up` keyframes
- **Sheet/Dialog:** Uses `slide-in-from-left`, `slide-out-to-left`, etc.
- **General transitions:** Uses `fadeIn` and `fadeOut`

The `tw-animate-css` package is also imported in `globals.css` to provide additional animation utilities:

```css
@import 'tw-animate-css';
```
