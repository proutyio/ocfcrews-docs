---
sidebar_position: 1
title: "CMS Pages"
---

# CMS Pages

The **Pages** collection is the primary page-builder in OCFCrews, allowing admins and editors to create fully customizable pages with hero sections, layout blocks, versioning, and SEO metadata. Pages are served on the frontend via slug-based routing at `/<slug>`.

## Collection Overview

| Property | Value |
|---|---|
| Slug | `pages` |
| Admin group | Content |
| Title field | `title` (text, required, max 200 characters) |
| Slug field | Auto-generated via `slugField()` from Payload |
| Versions | Enabled with drafts and autosave, up to 50 versions per document |
| Live preview | Supported via `generatePreviewPath` |

## Access Control

| Operation | Rule |
|---|---|
| **Create** | Admin only |
| **Read** | Admin or published status (draft documents are hidden from non-admins) |
| **Update** | Admin or editor |
| **Delete** | Admin or editor |

## Page Structure

Each page is organized into tabbed sections in the admin panel:

### Hero Tab

The hero section supports four display types:

- **None** -- No hero section rendered
- **High Impact** -- Full hero with rich text, link buttons, and a required media image
- **Medium Impact** -- Similar to high impact with rich text, links, and a required media image
- **Low Impact** (default) -- Rich text and link buttons only, no background media

The hero includes:
- A rich text field with heading support (h1-h4), fixed and inline toolbars
- A link group allowing up to 2 call-to-action buttons
- A media upload field (required for high and medium impact types, using the `media` collection)

### Content Tab (Layout Blocks)

The content tab uses Payload's **blocks** field type, providing a page-builder experience. The `layout` field is required and supports the following block types:

#### Call to Action (`cta`)
Rich text content with heading support (h1-h4) plus a link group with up to 2 buttons. Buttons support `default` and `outline` appearance styles.

#### Content (`content`)
A multi-column layout block. Each column includes:
- A **size** selector: one-third, half, two-thirds, or full width
- Rich text content with heading support (h2-h4)
- An optional link toggle with a configurable link field

#### Media Block (`mediaBlock`)
A single required media upload from the `media` collection. Used for embedding images or other media assets inline within the page.

#### Archive (`archive`)
Displays a collection of items. Supports two population modes:
- **Collection** -- Automatically pulls items from a selected collection (products), optionally filtered by categories, with a configurable limit (default: 10)
- **Individual Selection** -- Manually pick specific documents to display

#### Carousel (`carousel`)
Similar to the Archive block but rendered as a carousel/slider. Supports the same two population modes (collection or individual selection) with auto-populated document fields that are filled after read.

#### Three Item Grid (`threeItemGrid`)
Displays exactly 3 product items in a grid layout. The products field is sortable and enforces a strict minimum and maximum of 3 rows.

#### Banner (`banner`)
A styled notification or callout banner with:
- A **style** selector: `info`, `warning`, `error`, or `success`
- Required rich text content

#### Form Block (`formBlock`)
Embeds a form from the `forms` collection (managed by the Payload Form Builder plugin). Includes:
- A required relationship to a form document
- An optional intro content toggle with a rich text field (with heading support h1-h4)

### SEO Tab

The SEO tab contains metadata fields for search engine optimization. See the [SEO documentation](./seo.md) for details.

## Published Date

The `publishedOn` date field appears in the sidebar. If a page is published and no date has been set, it auto-stamps the current date via a `beforeChange` hook.

## Slug-Based Routing

Pages use Payload's built-in `slugField()` for URL generation. On the frontend, pages are served at `/<slug>` via the Next.js App Router catch-all route at `src/app/(app)/[slug]/page.tsx`.

The special slug `home` maps to the root path `/`.

Static params are pre-generated at build time for all published pages (excluding `home`), and pages use ISR (Incremental Static Regeneration) with a 60-second revalidation window.

## Cache Revalidation

Pages use Next.js cache tags for efficient revalidation:

- **`afterChange` hook (`revalidatePage`)** -- When a page is published, both the specific path (`/<slug>` or `/` for home) and the `pages` cache tag are revalidated. If a previously published page is unpublished, the old path is also revalidated.
- **`afterDelete` hook (`revalidateDelete`)** -- On deletion, the page path and the `pages` cache tag are revalidated.

Revalidation is skipped when `context.disableRevalidate` is set, which is useful for bulk operations or seed scripts.

## Versioning and Drafts

Pages support full versioning with:

- **Drafts** -- Pages can be saved as drafts before publishing
- **Autosave** -- Changes are automatically saved as draft versions while editing
- **Version history** -- Up to 50 versions per document are retained, allowing rollback to any previous state

The `_status` field (managed by Payload) tracks whether a page is `draft` or `published`. Only published pages are visible to non-admin users via the `adminOrPublishedStatus` access control.

## Source Files

| File | Purpose |
|---|---|
| `src/collections/Pages/index.ts` | Collection configuration |
| `src/collections/Pages/hooks/revalidatePage.ts` | Cache revalidation hooks |
| `src/fields/hero.ts` | Hero field group definition |
| `src/blocks/*/config.ts` | Individual block configurations |
| `src/app/(app)/[slug]/page.tsx` | Frontend page route |
