---
sidebar_position: 2
title: "CSS Variables"
---

# CSS Variables

OCFCrews uses a comprehensive CSS custom property system defined in `src/app/(app)/globals.css`. All color values use the **OKLCH** color space for perceptually uniform color adjustments.

## Color System Overview

The color system follows the shadcn/ui convention: each semantic color is defined as a CSS variable holding an OKLCH value. Tailwind classes reference these variables through `hsl(var(--color))` wrappers in the Tailwind config, but the actual values are OKLCH.

## Light Mode Variables (`:root`)

### Core Colors

| Variable | OKLCH Value | Description |
|----------|-------------|-------------|
| `--background` | `oklch(100% 0 0deg)` | Page background (white) |
| `--foreground` | `oklch(14.5% 0 0deg)` | Primary text (near-black) |

### Surface Colors

| Variable | OKLCH Value | Description |
|----------|-------------|-------------|
| `--card` | `oklch(96.5% 0.005 265deg)` | Card backgrounds (very light blue tint) |
| `--card-foreground` | `oklch(14.5% 0 0deg)` | Card text |
| `--popover` | `oklch(100% 0 0deg)` | Popover/dropdown backgrounds |
| `--popover-foreground` | `oklch(14.5% 0 0deg)` | Popover text |

### Brand / Interactive Colors

| Variable | OKLCH Value | Description |
|----------|-------------|-------------|
| `--primary` | `oklch(20.5% 0 0deg)` | Primary actions (dark) |
| `--primary-foreground` | `oklch(98.5% 0 0deg)` | Text on primary |
| `--secondary` | `oklch(97% 0 0deg)` | Secondary actions (light gray) |
| `--secondary-foreground` | `oklch(20.5% 0 0deg)` | Text on secondary |

### Neutral / Muted Colors

| Variable | OKLCH Value | Description |
|----------|-------------|-------------|
| `--muted` | `oklch(97% 0 0deg)` | Muted backgrounds |
| `--muted-foreground` | `oklch(55.6% 0 0deg)` | Muted/placeholder text |
| `--accent` | `oklch(97% 0 0deg)` | Accent backgrounds |
| `--accent-foreground` | `oklch(20.5% 0 0deg)` | Accent text |

### Feedback Colors

| Variable | OKLCH Value | Description |
|----------|-------------|-------------|
| `--destructive` | `oklch(57.7% 0.245 27.325deg)` | Error/destructive actions |
| `--destructive-foreground` | `oklch(57.7% 0.245 27.325deg)` | Destructive text |
| `--success` | `oklch(78% 0.08 200deg)` | Success feedback |
| `--warning` | `oklch(89% 0.1 75deg)` | Warning feedback |
| `--error` | `oklch(75% 0.15 25deg)` | Error feedback |

### Border / Input / Ring

| Variable | OKLCH Value | Description |
|----------|-------------|-------------|
| `--border` | `oklch(92.2% 0 0deg)` | Default borders |
| `--input` | `oklch(92.2% 0 0deg)` | Input borders |
| `--ring` | `oklch(70.8% 0 0deg)` | Focus ring color |

### Chart Colors

| Variable | OKLCH Value |
|----------|-------------|
| `--chart-1` | `oklch(64.6% 0.222 41.116deg)` |
| `--chart-2` | `oklch(60% 0.118 184.704deg)` |
| `--chart-3` | `oklch(39.8% 0.07 227.392deg)` |
| `--chart-4` | `oklch(82.8% 0.189 84.429deg)` |
| `--chart-5` | `oklch(76.9% 0.188 70.08deg)` |

### Sidebar Colors

| Variable | OKLCH Value |
|----------|-------------|
| `--sidebar` | `oklch(98.5% 0 0deg)` |
| `--sidebar-foreground` | `oklch(14.5% 0 0deg)` |
| `--sidebar-primary` | `oklch(20.5% 0 0deg)` |
| `--sidebar-primary-foreground` | `oklch(98.5% 0 0deg)` |
| `--sidebar-accent` | `oklch(97% 0 0deg)` |
| `--sidebar-accent-foreground` | `oklch(20.5% 0 0deg)` |
| `--sidebar-border` | `oklch(92.2% 0 0deg)` |
| `--sidebar-ring` | `oklch(70.8% 0 0deg)` |

### Layout

| Variable | Value | Description |
|----------|-------|-------------|
| `--radius` | `0.625rem` | Base border radius (10px) |

## Dark Mode Variables (`[data-theme='dark']`)

All variables are overridden under the `[data-theme='dark']` selector:

### Core Colors

| Variable | OKLCH Value | Description |
|----------|-------------|-------------|
| `--background` | `oklch(14.5% 0 0deg)` | Dark page background |
| `--foreground` | `oklch(98.5% 0 0deg)` | Light text on dark |

### Surface Colors

| Variable | OKLCH Value |
|----------|-------------|
| `--card` | `oklch(17% 0 0deg)` |
| `--card-foreground` | `oklch(98.5% 0 0deg)` |
| `--popover` | `oklch(14.5% 0 0deg)` |
| `--popover-foreground` | `oklch(98.5% 0 0deg)` |

### Brand / Interactive Colors

| Variable | OKLCH Value |
|----------|-------------|
| `--primary` | `oklch(98.5% 0 0deg)` |
| `--primary-foreground` | `oklch(20.5% 0 0deg)` |
| `--secondary` | `oklch(26.9% 0 0deg)` |
| `--secondary-foreground` | `oklch(98.5% 0 0deg)` |

### Neutral / Muted Colors

| Variable | OKLCH Value |
|----------|-------------|
| `--muted` | `oklch(26.9% 0 0deg)` |
| `--muted-foreground` | `oklch(70.8% 0 0deg)` |
| `--accent` | `oklch(26.9% 0 0deg)` |
| `--accent-foreground` | `oklch(98.5% 0 0deg)` |

### Feedback Colors (Dark Mode)

| Variable | OKLCH Value |
|----------|-------------|
| `--destructive` | `oklch(39.6% 0.141 25.723deg)` |
| `--destructive-foreground` | `oklch(63.7% 0.237 25.331deg)` |
| `--success` | `oklch(28% 0.1 200deg)` |
| `--warning` | `oklch(35% 0.08 70deg)` |
| `--error` | `oklch(45% 0.1 25deg)` |

### Border / Input / Ring (Dark Mode)

| Variable | OKLCH Value |
|----------|-------------|
| `--border` | `oklch(26.9% 0 0deg)` |
| `--input` | `oklch(26.9% 0 0deg)` |
| `--ring` | `oklch(43.9% 0 0deg)` |

## Tailwind v4 Theme Mapping

The `@theme inline` block maps CSS variables to Tailwind's internal color system, allowing the use of Tailwind classes like `bg-primary`, `text-muted-foreground`, etc.:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-error: var(--error);
  /* ... and all other mappings */

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

## Base Layer Defaults

Global base styles ensure consistent defaults:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground min-h-[100vh] flex flex-col;
  }
}
```

Heading elements have their default browser styles reset:

```css
@layer base {
  h1, h2, h3, h4, h5, h6 {
    font-weight: unset;
    font-size: unset;
  }
}
```

## Focus Styles

All interactive elements share consistent focus styles:

```css
a, input, button {
  @apply focus-visible:outline-hidden
         focus-visible:ring-2
         focus-visible:ring-neutral-400
         focus-visible:ring-offset-2
         focus-visible:ring-offset-neutral-50
         dark:focus-visible:ring-neutral-600
         dark:focus-visible:ring-offset-neutral-900;
}
```

Touch elements also have `touch-action: manipulation` to eliminate the 300ms tap delay on mobile:

```css
a, button {
  touch-action: manipulation;
}
```

## Flash-of-Unstyled-Content Prevention

The HTML element starts invisible and only becomes visible once the theme attribute is set:

```css
html {
  opacity: 0;
}

html[data-theme='dark'],
html[data-theme='light'] {
  opacity: initial;
}
```

This prevents a flash of the wrong theme on initial page load.
