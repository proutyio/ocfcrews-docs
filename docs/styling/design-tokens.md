---
sidebar_position: 3
title: "Design Tokens"
---

# Design Tokens

This page documents the design tokens and visual patterns used throughout the OCFCrews application.

## Brand Colors

The primary brand color is **emerald green**, used for active states, accent bars, and interactive elements. While the semantic color system uses neutral tones for `--primary` (dark gray/black in light mode, white in dark mode), emerald is applied directly via Tailwind utility classes in specific UI components.

Common emerald usage patterns:

```html
<!-- Active button state -->
<button class="bg-emerald-600 text-white">Active</button>

<!-- Accent bar on cards -->
<div class="border-l-4 border-emerald-500">Card content</div>

<!-- Calendar active view indicator -->
<button class="bg-emerald-600 text-white rounded-lg">Month</button>
```

## Border Radius

All border radius values derive from the `--radius` base variable (`0.625rem` / 10px):

| Token | Value | Tailwind Class |
|-------|-------|----------------|
| `--radius-sm` | `calc(var(--radius) - 4px)` = 6px | `rounded-sm` |
| `--radius-md` | `calc(var(--radius) - 2px)` = 8px | `rounded-md` |
| `--radius-lg` | `var(--radius)` = 10px | `rounded-lg` |
| `--radius-xl` | `calc(var(--radius) + 4px)` = 14px | `rounded-xl` |

## Typography

### Font Families

OCFCrews uses the **Geist** font family by Vercel, loaded via the `geist` npm package:

| Font | Variable | Tailwind Class | Usage |
|------|----------|----------------|-------|
| Geist Sans | `--font-geist-sans` | `font-sans` | Body text, headings, UI labels |
| Geist Mono | `--font-geist-mono` | `font-mono` | Code, navigation labels, tracking-wide UI elements |

Fonts are loaded in the root layout and applied as CSS variable classes on the `<html>` element:

```tsx
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

<html className={[GeistSans.variable, GeistMono.variable].join(' ')}>
```

### Navigation Typography Pattern

Navigation buttons use a distinctive monospace uppercase style:

```html
<button class="uppercase font-mono tracking-widest text-xs">
  Schedule
</button>
```

This pattern is codified in the Button component's `ghost` and `nav` variants.

## Spacing Patterns

The project follows Tailwind's default spacing scale. Common patterns include:

| Pattern | Classes | Usage |
|---------|---------|-------|
| Page padding | `px-4 sm:px-6 lg:px-8` | Consistent horizontal padding |
| Section gaps | `gap-4`, `gap-6`, `gap-8` | Spacing between layout sections |
| Card padding | `p-4` or `p-6` | Internal card padding |
| Stack spacing | `space-y-4`, `space-y-6` | Vertical content stacking |

## Common Component Patterns

### Cards with Emerald Accent Bar

A common pattern for status cards and schedule entries is a card with a colored left border:

```html
<div class="bg-card rounded-lg border border-border p-4 border-l-4 border-l-emerald-500">
  <h3 class="font-medium">Card Title</h3>
  <p class="text-muted-foreground text-sm">Card description</p>
</div>
```

### Stat Cards

Dashboard stat cards follow a consistent structure:

```html
<div class="bg-card rounded-lg border border-border p-6">
  <div class="text-muted-foreground text-sm">Total Hours</div>
  <div class="text-2xl font-bold">128</div>
</div>
```

### Pill Badges

Status indicators use pill-shaped badges with semantic colors:

```html
<!-- Success state -->
<span class="bg-success/30 border border-success text-sm px-2 py-0.5 rounded-full">
  Filled
</span>

<!-- Warning state -->
<span class="bg-warning/30 border border-warning text-sm px-2 py-0.5 rounded-full">
  Partial
</span>

<!-- Error state -->
<span class="bg-error/30 border border-error text-sm px-2 py-0.5 rounded-full">
  Empty
</span>
```

These classes are safelisted in both the Tailwind config and the `@source inline()` directives to ensure they are always available, since they may be applied dynamically.

### Grid Layouts

Dynamic grid column spans are used for responsive layouts, also safelisted:

```html
<div class="grid grid-cols-12 gap-4">
  <div class="lg:col-span-4">Sidebar</div>
  <div class="lg:col-span-8">Main content</div>
</div>
```

## Prose / Rich Text

The `@tailwindcss/typography` plugin provides prose styling for rich text content from the Lexical editor. Custom overrides include:

- H1 headings: `4rem` font size with normal weight
- Body and heading colors mapped to `var(--text)` CSS variable
- Links inherit the parent text color

```html
<article class="prose">
  <!-- Lexical editor output renders here -->
</article>
```

## Focus States

All interactive elements share a consistent focus ring:

- **Light mode:** 2px neutral-400 ring with neutral-50 offset
- **Dark mode:** 2px neutral-600 ring with neutral-900 offset

This is applied globally in the CSS and augmented at the component level using shadcn/ui's `focus-visible:ring-ring/50` pattern.

## Hover Behavior

The `hoverOnlyWhenSupported: true` future flag wraps all hover styles in `@media (hover: hover)`, preventing sticky hover states on touch devices. This is a progressive enhancement that improves the mobile experience.
