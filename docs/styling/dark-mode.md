---
sidebar_position: 4
title: "Dark Mode"
---

# Dark Mode

OCFCrews implements a custom dark mode system built on `localStorage` persistence with a blocking script to prevent flash-of-wrong-theme (FOWT). The theme is applied via a `data-theme` attribute on the `<html>` element.

## Architecture Overview

```
                     ┌─────────────────────────┐
                     │   InitTheme (Script)     │
                     │  runs before paint       │
                     │  reads localStorage      │
                     │  sets data-theme attr    │
                     └──────────┬──────────────┘
                                │
                     ┌──────────▼──────────────┐
                     │   ThemeProvider          │
                     │  React context           │
                     │  syncs state with DOM    │
                     │  handles cross-tab sync  │
                     └──────────┬──────────────┘
                                │
                     ┌──────────▼──────────────┐
                     │   Components             │
                     │  useTheme() hook         │
                     │  dark: variant classes   │
                     └─────────────────────────┘
```

## Theme Types

The theme system supports two values, defined in `src/providers/Theme/types.ts`:

```ts
export type Theme = 'dark' | 'light'
```

## InitTheme Component

**Location:** `src/providers/Theme/InitTheme/index.tsx`

This component renders a `<Script>` tag with `strategy="beforeInteractive"` that runs before React hydration. It reads the theme preference from `localStorage` and sets the `data-theme` attribute on the document element immediately, preventing any visible flash.

```tsx
<Script
  id="theme-script"
  strategy="beforeInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      (function () {
        function getImplicitPreference() {
          var mql = window.matchMedia('(prefers-color-scheme: dark)')
          if (typeof mql.matches === 'boolean') {
            return mql.matches ? 'dark' : 'light'
          }
          return null
        }

        var themeToSet = 'light'  // default theme
        var preference = window.localStorage.getItem('payload-theme')

        if (preference === 'light' || preference === 'dark') {
          themeToSet = preference
        } else {
          var implicitPreference = getImplicitPreference()
          if (implicitPreference) {
            themeToSet = implicitPreference
          }
        }

        document.documentElement.setAttribute('data-theme', themeToSet)
      })();
    `,
  }}
/>
```

The InitTheme component is rendered in the `<head>` of the root layout:

```tsx
<head>
  <InitTheme />
</head>
```

## FOUC Prevention

The global CSS hides the page until the theme is set:

```css
html {
  opacity: 0;
}

html[data-theme='dark'],
html[data-theme='light'] {
  opacity: initial;
}
```

This ensures the page is invisible until `InitTheme` sets the `data-theme` attribute, preventing a flash of unstyled content.

## ThemeProvider

**Location:** `src/providers/Theme/index.tsx`

The `ThemeProvider` wraps the entire application and provides theme state via React Context:

```tsx
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(
    canUseDOM ? document.documentElement.getAttribute('data-theme') as Theme : undefined,
  )
  // ...
}
```

### Theme Resolution Priority

1. **localStorage** (`payload-theme` key) - User's explicit preference
2. **System preference** - `prefers-color-scheme` media query
3. **Default** - `'light'`

### Cross-Tab Synchronization

The provider listens for `storage` events to sync theme changes across browser tabs:

```tsx
const handleStorageChange = (e: StorageEvent) => {
  if (e.key === themeLocalStorageKey && e.newValue && themeIsValid(e.newValue)) {
    document.documentElement.setAttribute('data-theme', e.newValue)
    setThemeState(e.newValue)
  }
}
window.addEventListener('storage', handleStorageChange)
```

### Admin Panel Synchronization

A custom `themeChange` event is dispatched when the theme changes, allowing the Payload admin panel (which runs on the same page) to stay in sync:

```tsx
window.dispatchEvent(new CustomEvent('themeChange', { detail: themeToSet }))
```

## Using the Theme

### useTheme Hook

Components can read and set the theme via the `useTheme` hook:

```tsx
import { useTheme } from '@/providers/Theme'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  )
}
```

### Setting Theme to Null

Passing `null` to `setTheme` clears the localStorage preference and falls back to the system preference:

```tsx
setTheme(null) // Reset to system preference
```

### CSS Dark Variant

In templates, use the Tailwind `dark:` variant to apply dark mode styles. The custom variant in `globals.css` maps this to the `data-theme="dark"` selector:

```css
@custom-variant dark (&:is([data-theme='dark'] *));
```

```html
<div class="bg-white dark:bg-gray-900">
  <p class="text-gray-900 dark:text-white">Content</p>
</div>
```

## Provider Nesting

The `ThemeProvider` is the outermost provider in the application's provider tree:

```tsx
// src/providers/index.tsx
export const Providers = ({ children }) => (
  <ThemeProvider>
    <AuthProvider>
      <HeaderThemeProvider>
        <SonnerProvider />
        <EcommerceProvider>
          {children}
        </EcommerceProvider>
      </HeaderThemeProvider>
    </AuthProvider>
  </ThemeProvider>
)
```

## Root Layout Integration

The root layout (`src/app/(app)/layout.tsx`) ties everything together:

```tsx
export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={[GeistSans.variable, GeistMono.variable].join(' ')}
      lang="en"
      suppressHydrationWarning  // Required to prevent React hydration mismatch
    >
      <head>
        <InitTheme />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

The `suppressHydrationWarning` on `<html>` is required because the `data-theme` attribute is set by the inline script before React hydration, which would otherwise cause a hydration mismatch warning.

## Shared Constants

**Location:** `src/providers/Theme/shared.ts`

| Constant | Value | Description |
|----------|-------|-------------|
| `themeLocalStorageKey` | `'payload-theme'` | localStorage key for persistence |
| `defaultTheme` | `'light'` | Fallback theme |
| `getImplicitPreference()` | Function | Reads `prefers-color-scheme` media query |
