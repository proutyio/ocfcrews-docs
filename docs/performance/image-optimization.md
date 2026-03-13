---
sidebar_position: 4
title: "Image Optimization"
---

# Image Optimization

OCFCrews optimizes images at multiple stages: server-side processing with Sharp, client-side rendering with the Next.js Image component, and global delivery via Cloudflare R2 CDN.

## Server-Side Processing with Sharp

[Sharp](https://sharp.pixelplumbing.com/) (version 0.34.2) is configured as the image processing library in the Payload configuration:

```typescript title="src/payload.config.ts"
import sharp from 'sharp'

export default buildConfig({
  // ...
  sharp,
})
```

Sharp provides high-performance, native image processing capabilities:

### Resize and Crop

Payload uses Sharp to generate resized versions of uploaded images. When an image is uploaded through the admin panel or API, Sharp can:

- **Resize to fit**: Scale images down to maximum dimensions while preserving aspect ratio
- **Crop to fill**: Trim images to exact dimensions for consistent layouts
- **Focal point support**: Payload's admin UI allows setting a focal point on images, which Sharp uses to intelligently crop around the most important area of the image

### Format and Quality

Sharp supports modern image formats and quality optimization:
- Automatic format selection based on the upload MIME type
- Quality reduction for web-appropriate file sizes
- Support for JPEG, PNG, WebP, and AVIF output formats

### Why Sharp Requires Full Node.js Runtime

Sharp uses native C++ bindings (libvips) for image processing, which is why the project targets **Vercel** (full Node.js runtime) rather than edge runtimes or Cloudflare Workers. Edge runtimes do not support native Node.js modules.

## MIME Type Restrictions

Each upload collection restricts accepted MIME types to prevent arbitrary file uploads:

| Collection | Accepted MIME Types |
|-----------|-------------------|
| `media` | `image/*`, `video/*`, `application/pdf` |
| `avatars` | `image/*` |
| `inventory-media` | `image/*` |

```typescript title="src/collections/Media.ts"
upload: {
  staticDir: path.resolve(dirname, '../../public/media'),
  mimeTypes: ['image/*', 'video/*', 'application/pdf'],
}
```

```typescript title="src/collections/Avatars.ts"
upload: {
  staticDir: path.resolve(dirname, '../../public/avatars'),
  mimeTypes: ['image/*'],
}
```

## Next.js Image Component

The Next.js `<Image>` component is used throughout the frontend for responsive, optimized image rendering. Key benefits:

### Automatic Optimization

- **Lazy loading**: Images below the fold are loaded only when they scroll into view
- **Responsive sizes**: The `sizes` attribute generates appropriate `srcset` values for different viewport widths
- **Format negotiation**: Next.js serves WebP or AVIF when the browser supports it, falling back to the original format
- **Quality control**: Images are compressed to web-appropriate quality levels

### Image Formats and Caching

The `next.config.js` configures image format preferences and caching:

```javascript title="next.config.js"
images: {
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 3600,
  deviceSizes: [640, 750, 828, 1080, 1200],
  // ...
}
```

| Setting | Value | Purpose |
|---------|-------|---------|
| `formats` | `['image/avif', 'image/webp']` | Preferred output formats in priority order; AVIF is tried first for its superior compression, with WebP as fallback |
| `minimumCacheTTL` | `3600` (1 hour) | Minimum time in seconds that optimized images are cached by the CDN and browser |
| `deviceSizes` | `[640, 750, 828, 1080, 1200]` | Breakpoints used to generate responsive `srcset` entries for full-width images |

### Remote Patterns Configuration

The `next.config.js` configures allowed remote image domains for the Next.js Image component:

```typescript title="next.config.js"
images: {
  remotePatterns: [
    // Server URL (e.g., localhost in development, production domain)
    ...[NEXT_PUBLIC_SERVER_URL].map((item) => {
      const url = new URL(item)
      return {
        hostname: url.hostname,
        protocol: url.protocol.replace(':', ''),
      }
    }),
    // R2 CDN endpoint (when configured)
    ...(process.env.R2_ENDPOINT
      ? (() => {
          try {
            const r2Url = new URL(process.env.R2_ENDPOINT)
            return [{ hostname: r2Url.hostname, protocol: 'https' }]
          } catch {
            return []
          }
        })()
      : []),
  ],
}
```

This allows the Image component to optimize images from:
1. **The application server** (for locally stored media during development)
2. **Cloudflare R2** (for production media storage)

Any other remote image domains would need to be explicitly added to this configuration, preventing the application from being used as an image proxy for arbitrary URLs.

## Cloudflare R2 CDN Delivery

In production, media files are stored in Cloudflare R2 and served through its global CDN network:

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

### CDN Benefits

- **Edge caching**: Files are cached at Cloudflare edge locations worldwide, serving users from the nearest location
- **No egress fees**: Unlike AWS S3, R2 does not charge for data transfer out
- **Automatic cache headers**: R2 sets appropriate `Cache-Control` headers for static assets
- **Prefix-based organization**: Files are organized by collection type for clean storage management

### Upload Flow

1. User uploads an image through the admin panel or frontend form
2. Payload processes the image with Sharp (resize, crop, format conversion)
3. The `@payloadcms/storage-s3` plugin uploads the processed image to R2
4. The image URL points to the R2 CDN endpoint
5. Subsequent requests are served directly from R2's edge network

## Image Optimization Pipeline Summary

```mermaid
graph LR
    A[User Upload] --> B[MIME Type Check]
    B --> C[Sharp Processing]
    C --> D{Environment}
    D -->|Production| E[R2 CDN Upload]
    D -->|Development| F[Local Static Dir]
    E --> G[Edge Cache]
    G --> H[Next.js Image Component]
    F --> H
    H --> I[Responsive Rendering]
    I --> J[Lazy Loading + Format Negotiation]
```

## Performance Impact

| Optimization | Impact |
|-------------|--------|
| Sharp server-side processing | Reduces file sizes by 50-80% before storage |
| Next.js Image lazy loading | Reduces initial page load by deferring offscreen images |
| WebP/AVIF format negotiation | 25-50% smaller files compared to JPEG/PNG |
| R2 CDN edge caching | Sub-50ms image delivery worldwide |
| MIME type restrictions | Prevents non-image uploads from consuming storage |
| Remote patterns whitelist | Prevents unauthorized image proxy usage |
