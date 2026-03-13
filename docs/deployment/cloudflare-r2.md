---
sidebar_position: 4
title: "Cloudflare R2 Storage"
---

# Cloudflare R2 Storage

OCFCrews uses **Cloudflare R2** for file storage, configured via the `@payloadcms/storage-s3` adapter. R2 is an S3-compatible object storage service with no egress fees, making it cost-effective for serving media files.

## Architecture

```
┌──────────────┐     S3 API      ┌──────────────┐     CDN      ┌──────────┐
│  Payload CMS │ ──────────────► │ Cloudflare   │ ──────────► │  Browser  │
│  (Upload)    │                 │ R2 Bucket    │              │  (View)   │
└──────────────┘                 └──────────────┘              └──────────┘
```

Payload CMS uploads files to R2 using the S3-compatible API. Files are stored in the R2 bucket with collection-specific prefixes. When users request images, they are served through Cloudflare's CDN.

## Configuration

The S3 storage adapter is configured in `src/payload.config.ts`:

```ts
import { s3Storage } from '@payloadcms/storage-s3'

plugins: [
  ...plugins,
  ...(process.env.R2_BUCKET
    ? [
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
              accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
            },
            region: 'auto',
            endpoint: process.env.R2_ENDPOINT ?? '',
          },
        }),
      ]
    : []),
],
```

### Conditional Loading

The S3 adapter is only loaded when `R2_BUCKET` is set. In local development without R2 credentials, files are stored on the local filesystem in the `media/`, `avatars/`, `inventory-media/`, `guide-media/`, and `chat-media/` directories.

## Storage Prefixes

Each Payload collection that handles file uploads has a dedicated prefix (virtual folder) in the R2 bucket:

| Collection | Prefix | Purpose |
|-----------|--------|---------|
| `media` | `media/` | General site media (page images, post images) |
| `avatars` | `avatars/` | User profile photos |
| `inventory-media` | `inventory-media/` | Inventory item photos |
| `guide-media` | `guide-media/` | Crew guide attachments and images |
| `chat-media` | `chat-media/` | Chat message attachments and images |

Files are stored as:

```
<bucket>/
  media/
    image-post1.webp
    image-post1-400x300.webp  (resized variant)
  avatars/
    user-avatar-123.jpg
  inventory-media/
    item-photo-456.png
  guide-media/
    guide-attachment-789.pdf
  chat-media/
    chat-image-012.jpg
```

## Environment Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `R2_ENDPOINT` | `https://<account_id>.r2.cloudflarestorage.com` | The S3-compatible API endpoint for your R2 account |
| `R2_BUCKET` | `ocfcrews-media` | The name of your R2 bucket |
| `R2_ACCESS_KEY_ID` | `abc123...` | API token access key ID |
| `R2_SECRET_ACCESS_KEY` | `xyz789...` | API token secret access key |

### Finding Your R2 Endpoint

The R2 endpoint follows the pattern:

```
https://<cloudflare_account_id>.r2.cloudflarestorage.com
```

You can find your account ID in the Cloudflare dashboard under **R2 > Overview**.

## Setting Up R2

### 1. Create an R2 Bucket

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2 Object Storage**
3. Click **Create bucket**
4. Name your bucket (e.g., `ocfcrews-media`)
5. Select a location hint (choose the region closest to your Vercel functions)

### 2. Create API Tokens

1. In the R2 section, go to **Manage R2 API Tokens**
2. Click **Create API token**
3. Grant the token **Object Read & Write** permissions for your bucket
4. Copy the **Access Key ID** and **Secret Access Key**

### 3. Configure Public Access (Optional)

To serve files directly from R2 via a custom domain:

1. In your R2 bucket settings, enable **Public access**
2. Connect a custom domain (e.g., `media.ocfcrews.org`)
3. Cloudflare automatically provisions SSL and CDN caching

Alternatively, files can be served through Payload's built-in file serving, which proxies requests through the Next.js server.

### 4. Set Environment Variables

Add the R2 credentials to your Vercel environment variables (see [Production Environment](./environment-setup)):

```env
R2_ENDPOINT=https://abc123.r2.cloudflarestorage.com
R2_BUCKET=ocfcrews-media
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
```

## Image Processing

OCFCrews uses **Sharp** for image processing (resizing, cropping, format conversion). Sharp runs on the server (Vercel Serverless Functions), and processed images are uploaded to R2.

Payload CMS automatically generates image variants (thumbnails, different sizes) based on each collection's `imageSizes` configuration. These variants are stored alongside the original file in R2 with size suffixes.

## Local Development

When `R2_BUCKET` is not set, the S3 storage plugin is not loaded. Uploads fall back to Payload's default local file storage. Files are saved to:

- `media/` - General media
- `avatars/` - User avatars
- `inventory-media/` - Inventory photos
- `guide-media/` - Guide attachments
- `chat-media/` - Chat attachments

These directories are in the project root and should be in `.gitignore`.

## CORS Configuration

If serving files directly from R2 (not through the Next.js proxy), you may need to configure CORS on your R2 bucket:

1. Go to your R2 bucket settings
2. Under **CORS policy**, add a rule:

```json
[
  {
    "AllowedOrigins": ["https://ocfcrews.org"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

This allows the frontend to load images directly from the R2 bucket URL.
