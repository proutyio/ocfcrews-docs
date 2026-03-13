---
sidebar_position: 1
title: "Tailwind Configuration"
---

# Tailwind Configuration

OCFCrews uses **Tailwind CSS v4** with a hybrid configuration approach. The legacy `tailwind.config.mjs` file provides theme extensions and plugins, while the global CSS file (`globals.css`) uses Tailwind v4's native `@theme` and `@custom-variant` directives.

## Configuration Files

| File | Purpose |
|------|---------|
| `tailwind.config.mjs` | Legacy config with theme extensions, keyframes, animations, plugins |
| `src/app/(app)/globals.css` | Tailwind v4 directives, CSS variables, breakpoints, container utility |
| `components.json` | shadcn/ui integration settings |

## Content Sources

```js
content: [
  './pages/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './app/**/*.{ts,tsx}',
  './src/**/*.{ts,tsx}',
]
```

## Dark Mode

Dark mode is configured with the `selector` strategy using the `data-theme="dark"` attribute:

```js
darkMode: ['selector', '[data-theme="dark"]'],
```

In `globals.css`, the corresponding custom variant is defined:

```css
@custom-variant dark (&:is([data-theme='dark'] *));
```

## Responsive Breakpoints

Custom breakpoints are defined in both the legacy config and the `@theme` block in `globals.css`:

| Breakpoint | Width | Container Max-Width | Padding |
|------------|-------|---------------------|---------|
| `sm` | `40rem` (640px) | `40rem` | `1rem` |
| `md` | `48rem` (768px) | `48rem` | `2rem` |
| `lg` | `64rem` (1024px) | `64rem` | `2rem` |
| `xl` | `80rem` (1280px) | `80rem` | `2rem` |
| `2xl` | `86rem` (1376px) | `86rem` | `2rem` |

```css
@theme {
  --breakpoint-sm: 40rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;
  --breakpoint-xl: 80rem;
  --breakpoint-2xl: 86rem;
}
```

## Custom Container

The container utility is manually defined in the CSS utilities layer rather than relying on Tailwind's built-in container plugin. It uses centered margins and responsive padding:

```css
@layer utilities {
  .container {
    width: 100%;
    margin-inline: auto;
    padding-inline: 1rem;
  }

  @variant sm {
    .container { max-width: var(--breakpoint-sm); }
  }

  @variant md {
    .container {
      max-width: var(--breakpoint-md);
      padding-inline: 2rem;
    }
  }
  /* ... lg, xl, 2xl follow the same pattern */
}
```

## Custom Animations

The config defines a rich set of keyframe animations used across the UI:

### Fade Animations

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| `fadeIn` | 300ms | ease-in-out | General entrance animations |
| `fadeOut` | 300ms | ease-in-out | General exit animations |

### Slide Animations

| Animation | Duration | Direction |
|-----------|----------|-----------|
| `in` | 200ms | translateX(100% -> 0%) |
| `out` | 200ms | translateX(0% -> 100%) |
| `slide-in-from-left` | 200ms | translateX(-100% -> 0) |
| `slide-out-to-left` | 200ms | translateX(0 -> -100%) |
| `slide-in-from-right` | 200ms | translateX(100% -> 0) |
| `slide-out-to-right` | 200ms | translateX(0 -> 100%) |

### Accordion Animations

Used with Radix UI accordion components:

```js
'accordion-down': {
  from: { height: '0' },
  to: { height: 'var(--radix-accordion-content-height)' },
},
'accordion-up': {
  from: { height: 'var(--radix-accordion-content-height)' },
  to: { height: '0' },
},
```

### Marquee / Carousel

The `marquee` keyframe provides a continuous horizontal scroll, used for carousel components:

```js
marquee: {
  '0%': { transform: 'translateX(0%)' },
  '100%': { transform: 'translateX(-100%)' },
},
// Used as: animation: 'marquee 60s linear infinite'
```

### Blink

A loading indicator animation that fades opacity in and out:

```js
blink: {
  '0%': { opacity: 0.2 },
  '20%': { opacity: 1 },
  '100%': { opacity: 0.2 },
},
// Duration: 1.4s, runs infinitely
```

## Animation Delay Utility Plugin

A custom Tailwind plugin provides an `animation-delay` utility class that maps to `transitionDelay` theme values. This allows staggering animations:

```js
plugins: [
  require('@tailwindcss/typography'),
  plugin(({ matchUtilities, theme }) => {
    matchUtilities(
      {
        'animation-delay': (value) => ({
          'animation-delay': value,
        }),
      },
      { values: theme('transitionDelay') },
    )
  }),
]
```

**Usage in templates:**

```html
<div class="animate-fadeIn animation-delay-200">First item</div>
<div class="animate-fadeIn animation-delay-500">Second item (staggered)</div>
```

## Safelist

Several utility classes are safelisted to ensure they are always included in the build output, even when generated dynamically:

```js
safelist: [
  'lg:col-span-4', 'lg:col-span-6', 'lg:col-span-8', 'lg:col-span-12',
  'border-border', 'bg-card',
  'border-error', 'bg-error/30',
  'border-success', 'bg-success/30',
  'border-warning', 'bg-warning/30',
]
```

In `globals.css`, these are also declared using the `@source inline()` directive for Tailwind v4 compatibility:

```css
@source inline("lg:col-span-4");
@source inline("border-error");
@source inline("bg-error/30");
/* ... etc */
```

## Typography Plugin

The `@tailwindcss/typography` plugin is configured with custom prose defaults:

```js
typography: ({ theme }) => ({
  DEFAULT: {
    css: {
      '--tw-prose-body': 'var(--text)',
      '--tw-prose-headings': 'var(--text)',
      h1: { fontSize: '4rem', fontWeight: 'normal', marginBottom: '0.25em' },
      a: { color: 'inherit' },
    },
  },
}),
```

## Future Flags

```js
future: {
  hoverOnlyWhenSupported: true,
},
```

This enables the `@media (hover: hover)` wrapper around hover styles, preventing sticky hover states on touch devices.
