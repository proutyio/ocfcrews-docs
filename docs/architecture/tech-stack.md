---
sidebar_position: 2
title: "Tech Stack"
---

# Tech Stack

A comprehensive breakdown of every technology used in the OCFCrews project, organized by category. All versions are sourced from `package.json`.

## Runtime & Framework

| Package | Version | Purpose |
|---------|---------|---------|
| **Next.js** | 15.4.11 | App Router framework, server components, API routes, middleware |
| **React** | 19.2.1 | UI rendering (server and client components) |
| **React DOM** | 19.2.1 | Browser DOM rendering and hydration |
| **TypeScript** | 5.7.2 | Static type checking across the entire codebase |
| **Node.js** | ^18.20.2 or >=20.9.0 | Server runtime (required, no edge runtime support) |

Next.js 15 with the App Router provides the foundational framework. The entire application uses React Server Components by default, with client components opted-in via the `'use client'` directive only where interactivity is needed (forms, calendar UI, modals).

## CMS & Database

| Package | Version | Purpose |
|---------|---------|---------|
| **Payload CMS** | 3.76.1 | Headless CMS running in-process within Next.js |
| **@payloadcms/next** | 3.76.1 | Next.js integration layer for Payload |
| **@payloadcms/db-postgres** | 3.76.1 | PostgreSQL database adapter (Drizzle ORM-based) |
| **@payloadcms/ui** | 3.76.1 | Admin panel UI components |
| **@payloadcms/admin-bar** | 3.76.1 | Frontend admin toolbar for live editing |
| **graphql** | ^16.8.2 | GraphQL API support (auto-generated from collections) |

Payload CMS is the core of the backend. It provides the data layer, authentication, admin panel, and API (both REST and GraphQL). The PostgreSQL adapter uses Drizzle ORM internally for all database operations.

## Rich Text Editor

| Package | Version | Purpose |
|---------|---------|---------|
| **@payloadcms/richtext-lexical** | 3.76.1 | Lexical-based rich text editor for Payload |
| **lexical** | ^0.41.0 | Facebook's extensible text editor framework |

The Lexical editor is configured with specific features: Bold, Italic, Underline, Ordered Lists, Unordered Lists, Links, Indentation, and an experimental Table feature. This provides a focused editing experience for content fields across Posts, Pages, email templates, and recipe instructions.

## Styling & UI

| Package | Version | Purpose |
|---------|---------|---------|
| **Tailwind CSS** | ^4.1.18 | Utility-first CSS framework |
| **@tailwindcss/postcss** | 4.1.18 | PostCSS integration for Tailwind |
| **@tailwindcss/typography** | ^0.5.19 | Prose styling for rich text content |
| **tw-animate-css** | ^1.4.0 | Animation utilities for Tailwind |
| **tailwind-merge** | ^3.4.0 | Intelligent Tailwind class merging |
| **class-variance-authority** | ^0.7.0 | Variant-based component styling (used by shadcn/ui) |
| **clsx** | ^2.1.0 | Conditional className utility |

The project uses **shadcn/ui** (built on Radix primitives) as the component library. shadcn/ui components are installed directly into the codebase (not as a dependency), providing full customization control. The primary brand color is **emerald**.

### Radix UI Primitives (via shadcn/ui)

| Package | Version | Purpose |
|---------|---------|---------|
| **@radix-ui/react-accordion** | 1.2.11 | Collapsible accordion sections |
| **@radix-ui/react-checkbox** | ^1.1.4 | Accessible checkbox inputs |
| **@radix-ui/react-dialog** | ^1.1.14 | Modal dialogs and sheets |
| **@radix-ui/react-label** | ^2.1.2 | Form label components |
| **@radix-ui/react-select** | ^2.1.6 | Custom select dropdowns |
| **@radix-ui/react-slot** | ^1.1.2 | Slot component for composition |

### UI Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| **lucide-react** | 0.563.0 | Icon library (consistent line-icon set) |
| **sonner** | ^1.7.2 | Toast notifications (`toast.error()`, `toast.success()`) |
| **embla-carousel-react** | ^8.5.2 | Carousel/slider component |
| **embla-carousel-auto-scroll** | ^8.1.5 | Auto-scroll plugin for Embla carousel |
| **geist** | ^1.3.0 | Geist Sans and Geist Mono fonts (Vercel's typeface) |
| **next-themes** | 0.4.6 | Dark mode / theme switching |
| **prism-react-renderer** | ^2.3.1 | Syntax highlighting for code blocks |

## Authentication & Forms

| Package | Version | Purpose |
|---------|---------|---------|
| **Payload built-in auth** | (included) | JWT cookie-based authentication (`payload-token`) |
| **jsonwebtoken** | 9.0.1 | JWT token handling |
| **react-hook-form** | 7.71.1 | Form state management and validation |

Authentication is handled entirely by Payload CMS. Login produces a `payload-token` cookie (JWT) with a 14-day expiration (1,209,600 seconds). The middleware checks for this cookie on protected routes. No third-party auth providers (Auth0, Clerk, etc.) are used.

## Payments & E-commerce

| Package | Version | Purpose |
|---------|---------|---------|
| **stripe** | 18.5.0 | Stripe API SDK (server-side) |
| **@stripe/react-stripe-js** | ^3 | React components for Stripe Elements |
| **@stripe/stripe-js** | ^4.0.0 | Stripe.js browser SDK |
| **@payloadcms/plugin-ecommerce** | 3.76.1 | Payload e-commerce plugin (orders, carts, transactions) |

The e-commerce system uses Payload's official ecommerce plugin with the Stripe payment adapter. This provides collections for Products, Orders, Carts, Addresses, and Transactions, with Stripe webhook handling for payment confirmation.

## Email

| Package | Version | Purpose |
|---------|---------|---------|
| **@payloadcms/email-nodemailer** | 3.76.1 | Nodemailer adapter for Payload |
| **@react-email/components** | ^1.0.8 | React-based email template components |
| **@react-email/render** | ^2.0.4 | Server-side rendering of React email templates to HTML |

Transactional emails (verification, password reset, announcements) are sent via **Resend SMTP** (`smtp.resend.com:465`). Email templates are built as React components using `@react-email/components` and rendered to HTML strings server-side.

## File Storage & Image Processing

| Package | Version | Purpose |
|---------|---------|---------|
| **@payloadcms/storage-s3** | ^3.76.1 | S3-compatible storage adapter (Cloudflare R2) |
| **sharp** | 0.34.2 | Image resizing, cropping, and optimization |

File uploads (media, avatars, inventory photos) are stored in **Cloudflare R2** using the S3-compatible API. Three storage prefixes are configured: `media/`, `avatars/`, and `inventory-media/`. Sharp handles server-side image processing including automatic resizing and format optimization.

## Payload CMS Plugins

| Plugin | Version | Purpose |
|--------|---------|---------|
| **@payloadcms/plugin-ecommerce** | 3.76.1 | Full e-commerce system (products, orders, carts, Stripe) |
| **@payloadcms/plugin-form-builder** | 3.76.1 | Dynamic form creation and submission handling |
| **@payloadcms/plugin-seo** | 3.76.1 | SEO metadata fields (title, description, OG image) |
| **@payloadcms/translations** | 3.76.1 | i18n/translation support for Payload admin |
| **@payloadcms/live-preview-react** | 3.76.1 | Real-time content preview in the admin panel |

## Testing

| Package | Version | Purpose |
|---------|---------|---------|
| **vitest** | 4.0.18 | Integration test runner (connects to real Payload/PostgreSQL) |
| **@playwright/test** | 1.58.2 | End-to-end browser testing |
| **@testing-library/react** | 16.3.0 | React component testing utilities |
| **@vitejs/plugin-react** | 4.5.2 | React support for Vite/Vitest |
| **jsdom** | 28.0.0 | DOM environment for component tests |
| **vite-tsconfig-paths** | 6.0.5 | TypeScript path alias resolution in Vitest |
| **tsx** | 4.21.0 | TypeScript execution for test helpers and scripts |

Integration tests (`tests/int/`) use Vitest with a real Payload SDK connected to a test PostgreSQL instance. E2E tests (`tests/e2e/`) use Playwright for full browser-based testing.

## Development & Build Tools

| Package | Version | Purpose |
|---------|---------|---------|
| **eslint** | ^9.16.0 | Code linting |
| **eslint-config-next** | 15.1.0 | Next.js ESLint rules |
| **eslint-plugin-jsx-a11y** | ^6.10.2 | Accessibility linting |
| **eslint-plugin-react** | ^7.37.5 | React-specific lint rules |
| **eslint-plugin-react-hooks** | ^5.2.0 | React hooks lint rules |
| **prettier** | ^3.4.2 | Code formatting |
| **prettier-plugin-tailwindcss** | ^0.6.11 | Tailwind class sorting in Prettier |
| **postcss** | ^8.4.38 | CSS processing pipeline |
| **cross-env** | ^7.0.3 | Cross-platform environment variable setting |
| **lint-staged** | ^15.2.2 | Run linters on staged git files |
| **@vercel/git-hooks** | ^1.0.0 | Git hooks for Vercel projects |
| **dotenv** | ^8.2.0 | Environment variable loading |

## Utility Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| **date-fns** | ^4.1.0 | Date manipulation and formatting |
| **qs-esm** | ^7 | Query string serialization (ESM-compatible) |
