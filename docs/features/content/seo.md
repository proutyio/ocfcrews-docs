---
sidebar_position: 5
title: "SEO"
---

# SEO

OCFCrews integrates the **`@payloadcms/plugin-seo`** plugin to provide search engine optimization fields on content collections. The plugin adds metadata fields to the admin panel and generates Open Graph tags for the frontend.

## Plugin Configuration

The SEO plugin is configured in `src/plugins/index.ts`:

```typescript
seoPlugin({
  generateTitle,
  generateURL,
})
```

Two generator functions are provided:

### `generateTitle`

Generates a default SEO title from the document:

```typescript
const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | ocfcrews` : 'ocfcrews'
}
```

This appends `| ocfcrews` as a suffix to the document title, or falls back to just `ocfcrews` if no title is set.

### `generateURL`

Generates the canonical URL for the document:

```typescript
const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()
  return doc?.slug ? `${url}/${doc.slug}` : url
}
```

This constructs a full URL using the server URL and the document slug.

## Collections with SEO Fields

The SEO tab is present on the following collections:

| Collection | SEO Fields |
|---|---|
| **Pages** | Title, description, image, overview, preview |

The Pages collection explicitly defines the SEO tab with the following Payload SEO fields:

### OverviewField

Displays a read-only overview panel showing the current state of the SEO metadata. It references:
- `meta.title` for the title
- `meta.description` for the description
- `meta.image` for the image

### MetaTitleField

A text field for the page's meta title. Has `hasGenerateFn: true`, which enables a "Generate" button that calls the `generateTitle` function to auto-fill the field.

### MetaImageField

An upload field related to the `media` collection. Used for the Open Graph image (`og:image`).

### MetaDescriptionField

A text field for the page's meta description. Used for both the HTML `<meta name="description">` tag and the Open Graph description.

### PreviewField

Displays a preview of how the page will appear in search results. Configured with `hasGenerateFn: true` and references `meta.title` and `meta.description` for the preview content.

## How Meta Tags Are Rendered

On the frontend, SEO metadata is rendered via Next.js's `generateMetadata` function. The `src/utilities/generateMeta.ts` utility handles this:

```typescript
export const generateMeta = async (args: { doc: Page | Product }): Promise<Metadata> => {
  const { doc } = args || {}

  const ogImage =
    typeof doc?.meta?.image === 'object' &&
    doc.meta.image !== null &&
    'url' in doc.meta.image &&
    `${process.env.NEXT_PUBLIC_SERVER_URL}${doc.meta.image.url}`

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      ...(doc?.meta?.description ? { description: doc?.meta?.description } : {}),
      images: ogImage ? [{ url: ogImage }] : undefined,
      title: doc?.meta?.title || doc?.title || 'ocfcrews',
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title: doc?.meta?.title || doc?.title || 'ocfcrews',
  }
}
```

This function:

1. Extracts the OG image URL from the meta image relationship, prepending the server URL
2. Sets the `description` meta tag from `meta.description`
3. Sets the `title` with a fallback chain: `meta.title` -> `doc.title` -> `'ocfcrews'`
4. Constructs Open Graph metadata by merging with defaults

## Open Graph Metadata Merging

The `src/utilities/mergeOpenGraph.ts` utility provides default Open Graph values that are merged with per-page overrides:

### Default Open Graph Values

| Property | Default Value |
|---|---|
| `type` | `website` |
| `description` | `ocfcrews` |
| `images` | `[{ url: '/favicon.png' }]` |
| `siteName` | `ocfcrews` |
| `title` | `ocfcrews` |

The merge function combines page-specific values with these defaults. If a page provides its own images, they replace the defaults entirely (no merging of image arrays).

## Page Route Integration

The `[slug]/page.tsx` route calls `generateMeta` in its `generateMetadata` export:

```typescript
export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = 'home' } = await params
  const page = await queryPageBySlug({ slug })
  return generateMeta({ doc: page })
}
```

This ensures every CMS page automatically gets proper `<title>`, `<meta description>`, and Open Graph tags in the rendered HTML.

## Source Files

| File | Purpose |
|---|---|
| `src/plugins/index.ts` | SEO plugin configuration with `generateTitle` and `generateURL` |
| `src/collections/Pages/index.ts` | SEO tab field definitions on the Pages collection |
| `src/utilities/generateMeta.ts` | Metadata generation utility for Next.js |
| `src/utilities/mergeOpenGraph.ts` | Open Graph defaults and merge function |
| `src/app/(app)/[slug]/page.tsx` | Route-level `generateMetadata` integration |
