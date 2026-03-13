---
sidebar_position: 2
title: "Development Dependencies"
---

# Development Dependencies

All development dependencies installed in the OCFCrews project, grouped by category. These packages are used during development, testing, and building but are not included in the production deployment.

## Testing

| Package | Version | Purpose |
|---------|---------|---------|
| `vitest` | 4.0.18 | Fast unit and integration test runner powered by Vite; used for integration tests that connect to real Payload/PostgreSQL instances |
| `@playwright/test` | 1.58.2 | End-to-end testing framework with multi-browser support; tests are located in `tests/e2e/` |
| `@testing-library/react` | 16.3.0 | React component testing utilities that encourage testing from the user's perspective |
| `jsdom` | 28.0.0 | JavaScript implementation of the DOM used as a test environment for component tests |
| `@vitejs/plugin-react` | 4.5.2 | Vite plugin for React; enables Fast Refresh and JSX transform in the Vitest test environment |
| `vite-tsconfig-paths` | 6.0.5 | Vite plugin that resolves TypeScript path aliases (e.g., `@/`) in the test environment |
| `tsx` | 4.21.0 | TypeScript execution engine; used with Playwright via `--import=tsx/esm` for running TypeScript test files directly |

## Linting and Formatting

| Package | Version | Purpose |
|---------|---------|---------|
| `eslint` | ^9.16.0 | JavaScript/TypeScript linter for catching code quality issues and enforcing conventions |
| `@eslint/eslintrc` | ^3.2.0 | ESLint configuration file resolution utilities for the flat config format |
| `eslint-config-next` | 15.1.0 | Next.js-specific ESLint configuration including rules for App Router, Image component, and link handling |
| `@next/eslint-plugin-next` | ^15.5.4 | ESLint plugin with Next.js-specific rules (e.g., no `<img>` tags, proper `<Link>` usage) |
| `eslint-plugin-react` | ^7.37.5 | ESLint rules for React best practices (hooks rules, JSX conventions) |
| `eslint-plugin-react-hooks` | ^5.2.0 | ESLint rules for React Hooks (dependency arrays, rules of hooks) |
| `eslint-plugin-jsx-a11y` | ^6.10.2 | ESLint rules for JSX accessibility (ARIA attributes, alt text, keyboard navigation) |
| `prettier` | ^3.4.2 | Opinionated code formatter for consistent code style across the entire codebase |
| `prettier-plugin-tailwindcss` | ^0.6.11 | Prettier plugin that automatically sorts Tailwind CSS classes in a consistent order |
| `lint-staged` | ^15.2.2 | Runs linters on staged git files before commit; configured via the `@vercel/git-hooks` package |

## TypeScript

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | 5.7.2 | TypeScript compiler for static type checking and transpilation |
| `@types/node` | 22.19.9 | Type definitions for Node.js built-in modules |
| `@types/react` | 19.2.9 | Type definitions for React 19 including server component types |
| `@types/react-dom` | 19.2.3 | Type definitions for React DOM |
| `@types/jsonwebtoken` | ^9.0.7 | Type definitions for the `jsonwebtoken` package |

## Build Tools

| Package | Version | Purpose |
|---------|---------|---------|
| `@vercel/git-hooks` | ^1.0.0 | Git hooks management for Vercel-deployed projects; runs `lint-staged` on pre-commit |

## CSS

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^4.1.18 | Utility-first CSS framework; v4 with the new Oxide engine for faster builds and smaller output |
| `@tailwindcss/postcss` | 4.1.18 | PostCSS plugin for Tailwind CSS v4; integrates Tailwind into the Next.js build pipeline |
| `@tailwindcss/typography` | ^0.5.19 | Typography plugin providing `prose` classes for rich text content styling |
| `postcss` | ^8.4.38 | CSS post-processor used by Tailwind CSS and Next.js for transforming CSS |
| `tw-animate-css` | ^1.4.0 | Animation utilities for Tailwind CSS; provides pure CSS animation classes without JavaScript runtime |

## Development Workflow

### Test Commands

```bash
# Run integration tests (Vitest with real Payload/PostgreSQL)
pnpm test:int

# Run end-to-end tests (Playwright)
pnpm test:e2e

# Run all tests
pnpm test
```

### Lint Commands

```bash
# Run ESLint
pnpm lint

# Run ESLint with auto-fix
pnpm lint:fix
```

### Build Commands

```bash
# Production build (8GB memory allocation)
pnpm build

# CI build (same as production build)
pnpm ci

# Development server
pnpm dev

# Production-like development (clean build + start)
pnpm dev:prod
```

## Engine Requirements

The project requires Node.js 18.20.2+ or 20.9.0+:

```json
{
  "engines": {
    "node": "^18.20.2 || >=20.9.0"
  }
}
```

This requirement comes from:
- **Next.js 15**: Requires Node.js 18.17+
- **Payload CMS 3.x**: Requires Node.js 18.20.2+ or 20.9.0+
- **Sharp 0.34.x**: Requires Node.js 18.17+

## Package Manager

The project uses **pnpm** as its package manager. The `pnpm` configuration in `package.json` specifies that only `sharp` should run native build scripts during installation:

```json
{
  "pnpm": {
    "onlyBuiltDependencies": [
      "sharp"
    ]
  }
}
```

This speeds up installation by skipping unnecessary post-install scripts for other packages while still allowing Sharp to compile its native bindings.
