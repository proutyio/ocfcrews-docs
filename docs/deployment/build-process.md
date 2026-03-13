---
sidebar_position: 3
title: "Build Process"
---

# Build Process

The OCFCrews build process compiles the Next.js application and Payload CMS admin bundle into a production-ready output.

## Build Command

**From `package.json`:**

```json
{
  "build": "cd docs && npm ci && npm run build && cd .. && cp -r docs/build public/docs && cross-env NODE_OPTIONS=\"--no-deprecation --max-old-space-size=8000\" next build"
}
```

### Command Breakdown

| Part | Purpose |
|------|---------|
| `cd docs && npm ci && npm run build && cd ..` | Installs Docusaurus dependencies and builds the documentation site |
| `cp -r docs/build public/docs` | Copies the built Docusaurus output into `public/docs` so it is served as static files by Next.js |
| `cross-env` | Ensures environment variables work across Windows, macOS, and Linux |
| `NODE_OPTIONS="--no-deprecation"` | Suppresses Node.js deprecation warnings (Payload CMS triggers some warnings in newer Node.js versions) |
| `NODE_OPTIONS="--max-old-space-size=8000"` | Allocates **8 GB** of heap memory for the Node.js process |
| `next build` | Runs the Next.js production build |

### Why 8 GB Memory?

The build process is memory-intensive because it compiles:

1. **Next.js application** - All pages, API routes, and server components
2. **Payload CMS admin panel** - A full React SPA bundled with Webpack
3. **Payload type generation** - TypeScript types for all collections
4. **Static pages** - Any statically generated pages are rendered at build time

On Vercel, builds run with sufficient memory by default. For local builds on machines with limited RAM, you may need to adjust this value.

## CI Build Command

A separate `ci` script is available for CI environments:

```json
{
  "ci": "cross-env NODE_OPTIONS=\"--no-deprecation --max-old-space-size=8000\" next build"
}
```

Unlike the `build` script, `ci` skips the Docusaurus documentation build step and runs only the Next.js production build. This is useful in CI pipelines where the documentation site does not need to be rebuilt.

## What Happens During Build

### Phase 1: Next.js Compilation

1. **TypeScript compilation** - All `.ts` and `.tsx` files are type-checked and compiled
2. **Route analysis** - Next.js scans the `src/app/` directory for routes
3. **Server Components** - React Server Components are compiled for server-side rendering
4. **Client Components** - Client components (marked with `'use client'`) are bundled for the browser
5. **API Routes** - API endpoints are bundled as serverless functions

### Phase 2: Payload CMS Admin Bundle

Payload CMS builds its admin panel as part of the Next.js build. This includes:

1. **Import map generation** - Resolves all custom component paths defined in `payload.config.ts`
2. **Admin UI components** - Custom dashboard, login screen, header actions, and avatar components
3. **Collection admin views** - List views, edit views, and custom fields for all collections
4. **Lexical editor bundle** - The rich text editor with its configured features

### Phase 3: Static Generation

Pages that can be statically generated are rendered at build time. Dynamic pages use server-side rendering at request time.

### Phase 4: Output

The build produces the `.next/` directory containing:

```
.next/
  cache/          # Build cache for incremental builds
  server/         # Server-side bundles and serverless functions
  static/         # Static assets (CSS, JS, images)
  types/          # Generated TypeScript types
```

## Build Output on Vercel

When deployed to Vercel, the `.next/` output is further processed:

- **Static assets** are uploaded to Vercel's global CDN
- **Server-side code** is deployed as Serverless Functions (Node.js runtime)
- **Middleware** (if any) runs on the Edge Network

## Related Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Development server with hot reload |
| `start` | `next start` | Start the production server locally |
| `dev:prod` | `rm -rf .next && pnpm build && pnpm start` | Full production build and start locally |
| `generate:types` | `payload generate:types` | Regenerate Payload TypeScript types |
| `generate:importmap` | `payload generate:importmap` | Regenerate Payload import map |
| `lint` | `next lint` | Run ESLint |

## Troubleshooting Build Issues

### Out of Memory

If the build fails with a JavaScript heap out-of-memory error:

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

Increase the `--max-old-space-size` value:

```bash
cross-env NODE_OPTIONS="--no-deprecation --max-old-space-size=12000" next build
```

### Payload Import Map Errors

If the build fails with missing component errors, regenerate the import map:

```bash
pnpm generate:importmap
```

### Type Errors

If TypeScript errors block the build, regenerate Payload types first:

```bash
pnpm generate:types
```

### Slow Builds

For faster local builds during development:

1. Use `pnpm dev` instead of building for production
2. Delete `.next/cache` if the cache is corrupted: `rm -rf .next`
3. Ensure you have at least 8 GB of free RAM

## Engine Requirements

From `package.json`:

```json
{
  "engines": {
    "node": "^18.20.2 || >=20.9.0"
  }
}
```

The project requires Node.js 18.20.2+ or 20.9.0+. Node.js 20.x is recommended for production.
