---
sidebar_position: 1
title: "Overview"
---

# Overview

OCFCrews is a crew scheduling and management platform purpose-built for festivals and events. It enables coordinators to publish shifts with specific positions, and crew members to self-sign-up for the shifts they want to work. Beyond scheduling, OCFCrews provides a full suite of tools for managing inventory, recipes, an e-commerce shop, email campaigns, and CMS-powered content pages.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| CMS | [Payload CMS 3.76.1](https://payloadcms.com/) |
| Database | PostgreSQL (via `@payloadcms/db-postgres` with Drizzle ORM) |
| Styling | Tailwind CSS 4 with CSS variables and dark mode support |
| UI | Radix UI primitives, Lucide icons, Geist font family |
| Payments | Stripe (via `@payloadcms/plugin-ecommerce`) |
| Email | Resend (via `@payloadcms/email-nodemailer` + React Email templates) |
| File Storage | Cloudflare R2 (via `@payloadcms/storage-s3`) |
| Rich Text | Lexical editor (`@payloadcms/richtext-lexical`) |
| Testing | Vitest (integration), Playwright (end-to-end) |
| Deployment | Vercel (full Node.js runtime) |

## Key Features

### Crew Scheduling with Position-Based Sign-Ups

Coordinators create schedules with defined positions (e.g., "Gate Lead", "Parking Attendant"). Crew members browse available shifts and sign up for specific positions. The system enforces crew isolation so members only see and interact with their own crew's schedules.

### Inventory Management with Transaction Tracking

A complete inventory system with categories, subcategories, and items. Every stock change is recorded as a transaction (check-in, check-out, adjustment, disposal), providing a full audit trail. Role-based access controls separate inventory admins, editors, and viewers.

### Recipe System with Inventory Linking

Recipes can reference inventory items as ingredients, bridging meal planning and stock management. Recipes support sub-groups, tags, and user favorites.

### E-Commerce Shop with Stripe

A built-in shop powered by the Payload CMS ecommerce plugin and Stripe. Supports products, orders, shopping carts, customer addresses, and payment transactions.

### Email Campaigns with Resend

Create and send email campaigns using customizable React Email templates. Integrated with Resend's SMTP relay for reliable delivery.

### Role-Based Access Control with Crew Isolation

A granular role system with global roles (admin, editor, crew_coordinator, crew_elder, crew_leader, crew_member, inventory_admin, inventory_editor, inventory_viewer, shop_admin, shop_editor, shop_viewer) and crew-level roles (coordinator, elder, leader, member). Access control functions enforce that users can only view and modify resources within their assigned crew.

### CMS-Powered Pages and Posts

Content editors can build pages using a block-based page builder (archive blocks, banners, calls to action, carousels, code blocks, content sections, forms, and media blocks). Posts support categories, SEO metadata, and hero sections. The site header, footer, and global settings are all managed through the Payload admin panel.

## Target Users

OCFCrews is designed for **festival and event organizations** where:

- **Coordinators** create crews, define schedules with specific positions, and manage their crew's members
- **Crew members** browse published shifts and self-sign-up for positions they want to work
- **Inventory managers** track supplies, equipment, and food stock across the event
- **Admins** manage the entire platform including content, users, and site settings

## Documentation Sections

| Section | Description |
|---|---|
| [Getting Started](./overview) | Installation, setup, and configuration |
| [Prerequisites](./prerequisites) | Required software and services |
| [Local Development](./local-development) | Step-by-step development setup guide |
| [Environment Variables](./environment-variables) | Complete reference for all configuration variables |
| [Project Structure](./project-structure) | Codebase organization and directory layout |
