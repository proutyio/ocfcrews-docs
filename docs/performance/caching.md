---
sidebar_position: 1
title: "Caching Strategies"
---

# Caching Strategies

OCFCrews employs several layers of caching to minimize response times and reduce database load. The caching strategy varies by content type -- public content is aggressively cached, while crew-specific data is served fresh to ensure accuracy.

## In-Process Payload SDK

The most significant performance advantage comes from the architecture itself. Payload CMS runs as an embedded library within the Next.js process rather than as a separate service:

```typescript
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config: configPromise })
const result = await payload.find({ collection: 'schedules', ... })
```

This means:
- **Zero HTTP overhead**: Database queries go directly through the Payload SDK without any network round-trip
- **No serialization cost**: Data is returned as native JavaScript objects, not parsed from JSON
- **Shared connection pool**: The PostgreSQL connection pool is shared across all routes in the same process
- **No cold-start penalty for queries**: The Payload SDK is initialized once when the Next.js server starts

## getCachedGlobal for Header, Footer, and Settings

Global content that appears on every page (header navigation, footer navigation, settings) is cached using Next.js `unstable_cache` with cache tags:

```typescript title="src/utilities/getGlobals.ts"
import { unstable_cache } from 'next/cache'

async function getGlobal<T extends Global>(slug: T, depth = 0) {
  const payload = await getPayload({ config: configPromise })
  const global = await payload.findGlobal({ slug, depth })
  return global
}

export const getCachedGlobal = <T extends Global>(slug: T, depth = 0) =>
  unstable_cache(async () => getGlobal<T>(slug, depth), [slug], {
    tags: [`global_${slug}`],
  })
```

This function is used throughout the application:

```typescript
// In Header component
const headerData = await getCachedGlobal('header', 1)()

// In Footer component
const footerData = await getCachedGlobal('footer', 1)()
```

**Cache tags used:**
- `global_header` -- invalidated when header navigation is updated
- `global_footer` -- invalidated when footer navigation is updated
- `global_settings` -- invalidated when global settings change

Each global's `afterChange` hook calls `revalidateTag()` to invalidate the corresponding cache entry when the content is modified. See [Cache Revalidation](./revalidation.md) for details.

## Cached Queries for Public Content

Public-facing content that does not change frequently is cached with both time-based and tag-based revalidation:

```typescript title="src/utilities/cachedQueries.ts"
export const getCachedPublicPosts = unstable_cache(
  async (limit = 100) => {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      where: { visibility: { equals: 'public' } },
      sort: '-publishedAt',
      limit,
      depth: 1,
      overrideAccess: true,
    })
    return result.docs
  },
  ['public-posts'],
  { revalidate: 60, tags: ['posts'] },
)

export const getCachedPostBySlug = unstable_cache(
  async (slug: string) => {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
      overrideAccess: true,
    })
    return result.docs[0] || null
  },
  ['post-by-slug'],
  { revalidate: 60, tags: ['posts'] },
)
```

These caches have a dual invalidation strategy:
- **Time-based**: Automatically refreshes every 60 seconds (`revalidate: 60`)
- **Tag-based**: Immediately invalidated when posts change (via the `posts` tag)

## Next.js App Router Caching

Next.js 15 App Router provides several built-in caching layers:

### Static Generation for Public Pages

Pages that use only cached data (such as the home page and public post pages) are statically generated at build time and served from the edge. The `[slug]/page.tsx` route fetches page data at build time:

```typescript
// Pages use getCachedGlobal and getCachedPostBySlug
// which allows Next.js to statically render these routes
```

### Route Segment Caching

Server components in the App Router are cached by default. When a page is rendered on the server, the result is stored and reused for subsequent requests until the cache is invalidated via `revalidatePath()` or `revalidateTag()`.

## Cloudflare R2 CDN for Media

Media files (images, documents) are stored in Cloudflare R2 object storage, which provides:

- **Global CDN**: Files served from edge locations close to the user
- **No egress fees**: R2 does not charge for bandwidth
- **Prefix-based organization**: Files are organized by collection:
  - `media/` -- general content media
  - `avatars/` -- user profile photos
  - `inventory-media/` -- inventory item images
  - `guide-media/` -- crew guide attachments
  - `chat-media/` -- chat message attachments

The R2 storage is configured via the `@payloadcms/storage-s3` plugin:

```typescript title="src/payload.config.ts"
s3Storage({
  collections: {
    media: { prefix: 'media' },
    avatars: { prefix: 'avatars' },
    'inventory-media': { prefix: 'inventory-media' },
    'guide-media': { prefix: 'guide-media' },
    'chat-media': { prefix: 'chat-media' },
  },
  bucket: process.env.R2_BUCKET,
  config: {
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
  },
})
```

## PostgreSQL Query Efficiency

Several factors contribute to efficient database queries:

- **Indexed fields**: The `crew` field is indexed on nearly every collection, making crew-scoped `Where` clause queries efficient. See [Database Indexing](./database-indexing.md).
- **Selective field loading**: Queries use `select` to fetch only needed fields (e.g., `select: { email: true }` for recipient resolution)
- **Depth control**: Relationship population depth is carefully controlled to avoid unnecessary joins (e.g., `depth: 0` for schedule lookups in hooks)
- **Pagination**: Large result sets use `limit` and `pagination: false` as appropriate

## Summary

| Layer | What's Cached | Invalidation |
|-------|---------------|-------------|
| In-process SDK | N/A (eliminates network overhead) | N/A |
| `getCachedGlobal` | Header, footer, settings | Tag-based (`revalidateTag`) |
| `getCachedPublicPosts` | Public post listings | Tag-based + 60s time-based |
| `getCachedPostBySlug` | Individual public posts | Tag-based + 60s time-based |
| Next.js static generation | Public pages | `revalidatePath` / `revalidateTag` |
| Cloudflare R2 CDN | Media files (images, docs) | Upload/replacement |
| PostgreSQL indexes | Query execution plans | Automatic (shared buffer cache) |
