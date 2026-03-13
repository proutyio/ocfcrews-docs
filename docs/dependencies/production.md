---
sidebar_position: 1
title: "Production Dependencies"
---

# Production Dependencies

All production dependencies installed in the OCFCrews project, grouped by category. Versions are from `package.json`.

## Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 15.4.11 | React framework with App Router, server components, static generation, API routes, and image optimization |
| `react` | 19.2.1 | UI library for building component-based interfaces with server components and concurrent features |
| `react-dom` | 19.2.1 | React DOM renderer for web browser environments |
| `payload` | 3.76.1 | Headless CMS providing content management, authentication, access control, and database abstraction |
| `graphql` | ^16.8.2 | GraphQL query language implementation used by Payload's GraphQL API layer |
| `sharp` | 0.34.2 | High-performance native image processing (resize, crop, format conversion) using libvips; required by Payload for image uploads |
| `cross-env` | ^7.0.3 | Cross-platform environment variable setting for npm scripts; ensures `NODE_OPTIONS` works on Windows and Unix |
| `dotenv` | ^8.2.0 | Loads environment variables from `.env` files into `process.env` |

## Payload CMS Ecosystem

| Package | Version | Purpose |
|---------|---------|---------|
| `@payloadcms/next` | 3.76.1 | Next.js integration for Payload CMS including middleware, route handlers, and admin panel hosting |
| `@payloadcms/db-postgres` | 3.76.1 | PostgreSQL database adapter for Payload CMS using Drizzle ORM |
| `@payloadcms/richtext-lexical` | 3.76.1 | Lexical-based rich text editor for Payload with configurable features (bold, italic, lists, links, tables) |
| `@payloadcms/ui` | 3.76.1 | Payload admin panel UI components and utilities |
| `@payloadcms/admin-bar` | 3.76.1 | Admin toolbar shown to authenticated admins when viewing the frontend |
| `@payloadcms/live-preview-react` | 3.76.1 | Real-time draft preview for content editors; renders unsaved changes in the frontend |
| `@payloadcms/translations` | 3.76.1 | Internationalization support for the Payload admin panel |
| `@payloadcms/plugin-seo` | 3.76.1 | SEO plugin adding meta title, description, and image fields to pages and products |
| `@payloadcms/plugin-form-builder` | 3.76.1 | Dynamic form creation plugin; allows admins to build forms without code |
| `@payloadcms/plugin-ecommerce` | 3.76.1 | E-commerce plugin providing products, orders, carts, addresses, and payment processing collections |
| `@payloadcms/storage-s3` | ^3.76.1 | S3-compatible storage adapter; configured for Cloudflare R2 for media file storage and CDN delivery |
| `@payloadcms/email-nodemailer` | 3.76.1 | Nodemailer-based email adapter for Payload; configured to send via Resend SMTP |
| `lexical` | ^0.41.0 | Meta's extensible text editor framework; the foundation for Payload's rich text editor |

## UI and Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `lucide-react` | 0.563.0 | Tree-shakeable icon library with 1000+ icons; used throughout the UI for navigation, actions, and status indicators |
| `class-variance-authority` | ^0.7.0 | Utility for creating type-safe component variants with Tailwind CSS classes |
| `clsx` | ^2.1.0 | Tiny utility for conditionally joining class names |
| `tailwind-merge` | ^3.4.0 | Merges Tailwind CSS classes without style conflicts (e.g., resolves `p-2 p-4` to `p-4`) |
| `geist` | ^1.3.0 | Vercel's Geist font family (sans-serif and monospace) optimized for web applications |
| `sonner` | ^1.7.2 | Lightweight toast notification library; used for success/error feedback throughout the app |
| `prism-react-renderer` | ^2.3.1 | Syntax highlighting for code blocks in content pages |
| `nextjs-toploader` | ^3.9.17 | Slim progress bar at the top of the page during route transitions |
| `react-day-picker` | ^9.14.0 | Flexible date picker component for schedule and availability forms |

### Radix UI Primitives

| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/react-accordion` | 1.2.11 | Accessible accordion component for expandable content sections |
| `@radix-ui/react-checkbox` | ^1.1.4 | Accessible checkbox primitive for forms and settings |
| `@radix-ui/react-dialog` | ^1.1.14 | Accessible modal dialog for confirmations, forms, and detail views |
| `@radix-ui/react-label` | ^2.1.2 | Accessible label component that properly associates with form controls |
| `@radix-ui/react-select` | ^2.1.6 | Accessible select/dropdown component with search and multi-select support |
| `@radix-ui/react-slot` | ^1.1.2 | Composition primitive for forwarding props to child components |

### Carousel

| Package | Version | Purpose |
|---------|---------|---------|
| `embla-carousel-react` | ^8.5.2 | Lightweight, performant carousel component for image galleries and content carousels |
| `embla-carousel-auto-scroll` | ^8.1.5 | Auto-scroll plugin for Embla carousel; enables automatic cycling through slides |

## Forms

| Package | Version | Purpose |
|---------|---------|---------|
| `react-hook-form` | 7.71.1 | Performant form library with uncontrolled component support; used for registration, login, inventory forms, and recipe editing |

## Payments (Stripe)

| Package | Version | Purpose |
|---------|---------|---------|
| `stripe` | 18.5.0 | Server-side Stripe SDK for payment processing, webhook handling, and order management |
| `@stripe/stripe-js` | ^4.0.0 | Client-side Stripe.js loader for secure payment element rendering |
| `@stripe/react-stripe-js` | ^3 | React components for Stripe Elements (payment forms, card inputs) |

## Email

| Package | Version | Purpose |
|---------|---------|---------|
| `@react-email/components` | ^1.0.8 | React components for building email templates (buttons, headings, containers) |
| `@react-email/render` | ^2.0.4 | Renders React Email components to HTML strings for sending via nodemailer |
| `jsonwebtoken` | 9.0.1 | JWT token creation and verification; used by Payload's authentication system |

## PDF Generation

| Package | Version | Purpose |
|---------|---------|---------|
| `@react-pdf/renderer` | ^4.3.2 | React-based PDF generation for creating printable schedule reports and documents |

## PWA (Progressive Web App)

| Package | Version | Purpose |
|---------|---------|---------|
| `@serwist/next` | ^9.5.6 | Next.js integration for Serwist service worker; enables offline support and push notifications |
| `serwist` | ^9.5.6 | Service worker toolkit for caching strategies, precaching, and runtime caching |

## Analytics

| Package | Version | Purpose |
|---------|---------|---------|
| `@vercel/speed-insights` | ^1.3.1 | Vercel Speed Insights for real user monitoring of Core Web Vitals and page load performance |

## Communications

| Package | Version | Purpose |
|---------|---------|---------|
| `twilio` | ^5.12.2 | Twilio SDK for sending SMS notifications (shift reminders, alerts) |
| `web-push` | ^3.6.7 | Web Push protocol implementation for sending push notifications to subscribed browsers |

## Security and Authentication

| Package | Version | Purpose |
|---------|---------|---------|
| `otpauth` | ^9.5.0 | TOTP/HOTP one-time password generation and validation for two-factor authentication |

## Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `date-fns` | ^4.1.0 | Modern date utility library (tree-shakeable); used for date formatting and manipulation in schedules and time entries |
| `diff` | ^8.0.3 | Text diffing library for computing and displaying content changes in audit logs and edit history |
| `html5-qrcode` | ^2.3.8 | HTML5 QR code and barcode scanner using device camera; used for inventory barcode scanning |
| `qrcode` | ^1.5.4 | QR code generation for 2FA setup and shareable links |
| `react-markdown` | ^10.1.0 | Renders markdown content as React components; used by PeachChat for message rendering with sanitized output |
| `remark-gfm` | ^4 | GitHub-Flavored Markdown plugin for react-markdown; adds tables, strikethrough, autolinks, and task lists to chat messages |
