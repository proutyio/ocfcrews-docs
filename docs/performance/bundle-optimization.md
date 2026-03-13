---
sidebar_position: 5
title: "Bundle Optimization"
---

# Bundle Optimization

OCFCrews minimizes client-side JavaScript through Next.js 15 App Router conventions, React 19 optimizations, and build-time configuration. The goal is to deliver the minimum amount of code needed for each page.

## Server Components by Default

Next.js 15 App Router uses React Server Components (RSC) by default. This means that most components in OCFCrews run exclusively on the server and send zero JavaScript to the browser:

```
src/app/(app)/
  layout.tsx          -- Server Component (renders header, footer)
  page.tsx            -- Server Component (home page)
  [slug]/page.tsx     -- Server Component (CMS pages)
  posts/page.tsx      -- Server Component (post listings)
  inventory/          -- Mixed (layout is server, interactive forms are client)
  schedule/           -- Mixed (layout is server, sign-up buttons are client)
```

### What Stays on the Server

- **Data fetching**: All Payload SDK queries run on the server (no API keys or database connections in the client bundle)
- **Access control evaluation**: Role checks and crew isolation logic never reach the browser
- **Rich text rendering**: Lexical content is rendered to HTML on the server
- **Global data**: Header, footer, and settings are fetched and rendered server-side

### What Ships to the Client

Only components that require browser interactivity are marked with `'use client'`:

- **Form components**: Login, registration, schedule sign-up, time entry, inventory forms
- **Interactive UI**: Dropdowns, modals, accordions, carousels, theme toggle
- **Toast notifications**: Sonner toast library for user feedback
- **Stripe checkout**: Payment form components from `@stripe/react-stripe-js`
- **Live preview**: Payload's live preview component for draft content

## React 19 Optimizations

OCFCrews uses React 19.2.1, which includes several bundle and runtime optimizations:

### Automatic JSX Transform

React 19 eliminates the need for `import React from 'react'` in every file. The JSX transform is handled by the compiler, reducing unused imports.

### Server Actions

React 19's server actions pattern allows form submissions and mutations to be handled server-side without requiring client-side JavaScript for the submission logic. The action function runs on the server, and only the result is sent to the client.

### Streaming and Suspense

Server components can stream their rendered output to the client as it becomes available, rather than waiting for the entire page to render before sending anything. This improves perceived performance for pages with multiple data-fetching components.

## Build Configuration

The build process is optimized through several configuration choices:

### Memory Allocation

The build script allocates 8 GB of heap space to prevent out-of-memory errors during production builds:

```json title="package.json"
{
  "scripts": {
    "build": "cross-env NODE_OPTIONS=\"--no-deprecation --max-old-space-size=8000\" next build"
  }
}
```

This is necessary because the build process must:
- Compile all TypeScript source files
- Generate Payload CMS type definitions and import maps
- Statically render eligible pages
- Optimize and tree-shake the bundle
- Process Tailwind CSS classes

### Webpack Configuration

The `next.config.js` includes a custom webpack configuration for module resolution and warning suppression:

```javascript title="next.config.js"
webpack: (webpackConfig) => {
  webpackConfig.resolve.extensionAlias = {
    '.cjs': ['.cts', '.cjs'],
    '.js': ['.ts', '.tsx', '.js', '.jsx'],
    '.mjs': ['.mts', '.mjs'],
  }
  webpackConfig.ignoreWarnings = [{ module: /node_modules/ }]
  return webpackConfig
}
```

The `extensionAlias` configuration ensures proper resolution of TypeScript files when imported with `.js` extensions, which is required for ESM compatibility with `"type": "module"`.

### Optimized Package Imports

The `next.config.js` enables automatic tree-shaking for large packages via `optimizePackageImports`:

```javascript title="next.config.js"
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@payloadcms/ui',
    '@payloadcms/richtext-lexical',
  ],
}
```

This tells Next.js to transform barrel imports (e.g., `import { Check } from 'lucide-react'`) into direct module imports at build time, avoiding loading the entire package. This is particularly impactful for `lucide-react` (1000+ icons) and the Payload CMS UI/editor packages.

### Tree-Shaking with ES Modules

The project is configured as an ESM package (`"type": "module"` in `package.json`), which enables effective tree-shaking:

- **Dead code elimination**: Unused exports from imported modules are removed during the build
- **Constant folding**: Build-time constants are inlined and branches for unused code paths are eliminated
- **Side-effect-free modules**: Utility modules that export pure functions are aggressively tree-shaken

## CSS Optimization

### Tailwind CSS 4

OCFCrews uses Tailwind CSS v4.1.18 with the PostCSS plugin (`@tailwindcss/postcss`). Tailwind v4 includes:

- **Automatic purging**: Only CSS classes actually used in the source code are included in the production bundle
- **Zero-runtime**: Tailwind generates pure CSS at build time with no JavaScript runtime
- **Smaller output**: v4 produces smaller CSS output than v3 through improved internal architecture

### tw-animate-css

The `tw-animate-css` package provides animation utilities as pure CSS classes, avoiding JavaScript-based animation libraries that would increase the client bundle.

## Dynamic Imports

Heavy components that are not needed on initial page load can be dynamically imported to split them into separate chunks:

```typescript
// Example pattern used in the codebase
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
})
```

This pattern is particularly valuable for:
- **Stripe payment components**: Only loaded on checkout pages
- **Rich text editors**: Only loaded in admin/edit contexts
- **Carousel components**: Only loaded when carousels appear on the page

## Dependency Weight Management

The dependency selection prioritizes lightweight libraries:

| Library | Purpose | Why Chosen |
|---------|---------|-----------|
| `clsx` + `tailwind-merge` | Class name composition | ~2KB combined, tree-shakeable |
| `class-variance-authority` | Component variant management | ~1KB, works with Tailwind |
| `lucide-react` | Icons | Tree-shakeable (only used icons are bundled) |
| `date-fns` | Date utilities | Tree-shakeable (import individual functions) |
| `sonner` | Toast notifications | ~5KB, lightweight alternative to react-toastify |

### Radix UI Primitives

UI components are built on Radix UI primitives, which are:
- **Unstyled**: No CSS framework overhead
- **Tree-shakeable**: Each primitive is a separate package
- **Headless**: Logic only, styled with Tailwind CSS

Installed primitives:
- `@radix-ui/react-accordion`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-dialog`
- `@radix-ui/react-label`
- `@radix-ui/react-select`
- `@radix-ui/react-slot`

## React Strict Mode

React Strict Mode is enabled in `next.config.js`:

```javascript
reactStrictMode: true
```

While not directly a bundle optimization, Strict Mode helps identify:
- Components with side effects that would break with concurrent rendering
- Deprecated API usage that may be removed in future React versions
- Potential memory leaks from improper cleanup

## Build Output Summary

The production build results in:

| Output Type | Optimization |
|------------|-------------|
| Server components | Zero client JS (HTML only) |
| Client components | Minified, tree-shaken bundles |
| CSS | Purged Tailwind (only used classes) |
| Images | Sharp-processed, CDN-delivered |
| Static pages | Pre-rendered at build time |
| Dynamic pages | Streamed with React Suspense |
