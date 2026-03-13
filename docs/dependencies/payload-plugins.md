---
sidebar_position: 3
title: "Payload Plugins"
---

# Payload Plugins

OCFCrews uses several Payload CMS plugins to extend functionality. Plugins are registered in two locations: the `plugins` array in `/src/plugins/index.ts` and directly in `/src/payload.config.ts`.

## Plugin Registration

```typescript title="src/payload.config.ts"
export default buildConfig({
  // ...
  plugins: [
    ...plugins,              // From src/plugins/index.ts
    ...(process.env.R2_BUCKET // S3 storage (conditional)
      ? [s3Storage({ ... })]
      : []),
  ],
})
```

```typescript title="src/plugins/index.ts"
export const plugins: Plugin[] = [
  seoPlugin({ ... }),
  formBuilderPlugin({ ... }),
  ecommercePlugin({ ... }),
]
```

---

## @payloadcms/plugin-seo

**Purpose:** Adds SEO metadata fields to content collections.

### Configuration

```typescript
seoPlugin({
  generateTitle,
  generateURL,
})
```

### What It Does

- Adds a `meta` tab to configured collections with fields for:
  - **Meta Title** (`MetaTitleField`) -- with auto-generation from the document title
  - **Meta Description** (`MetaDescriptionField`) -- for search engine snippets
  - **Meta Image** (`MetaImageField`) -- Open Graph image, linked to the `media` collection
  - **Overview** (`OverviewField`) -- visual preview of how the page will appear in search results
  - **Preview** (`PreviewField`) -- live URL preview with auto-generation

### Collections Using SEO

| Collection | SEO Tab Location |
|-----------|-----------------|
| Pages | `meta` tab with title, description, image, overview, and preview fields |
| Products | `meta` tab with the same field set |

### Auto-Generation Functions

```typescript
const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | ocfcrews` : 'ocfcrews'
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()
  return doc?.slug ? `${url}/${doc.slug}` : url
}
```

---

## @payloadcms/plugin-form-builder

**Purpose:** Enables administrators to create dynamic forms without writing code.

### Configuration

```typescript
formBuilderPlugin({
  fields: {
    payment: false,  // Payment fields disabled
  },
  formSubmissionOverrides: {
    admin: { group: 'Content' },
    access: {
      create: adminOnly,
      update: adminOnly,
      delete: adminOnly,
    },
  },
  formOverrides: {
    admin: { group: 'Content' },
    access: {
      create: adminOnly,
      update: adminOnly,
      delete: adminOnly,
    },
    fields: ({ defaultFields }) => {
      // Add rich text toolbar to confirmation message
      return defaultFields.map((field) => {
        if ('name' in field && field.name === 'confirmationMessage') {
          return {
            ...field,
            editor: lexicalEditor({
              features: ({ rootFeatures }) => [
                ...rootFeatures,
                FixedToolbarFeature(),
                HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
              ],
            }),
          }
        }
        return field
      })
    },
  },
})
```

### What It Does

- Creates two collections:
  - **Forms** (`forms`) -- Admin-defined form configurations with fields, validation, and confirmation messages
  - **Form Submissions** (`form-submissions`) -- Stores submitted form data
- Both collections are restricted to admin-only access
- Payment fields are disabled since payments are handled by the ecommerce plugin
- The confirmation message field gets an enhanced Lexical editor with headings and a fixed toolbar

---

## @payloadcms/plugin-ecommerce

**Purpose:** Full e-commerce functionality with Stripe payment processing.

### Configuration

```typescript
ecommercePlugin({
  access: {
    adminOnlyFieldAccess,
    adminOrPublishedStatus,
    customerOnlyFieldAccess,
    isAdmin,
    isDocumentOwner,
  },
  customers: {
    slug: 'users',  // Uses the existing Users collection
  },
  payments: {
    paymentMethods: [
      stripeAdapter({
        secretKey: process.env.STRIPE_SECRET_KEY!,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
      }),
    ],
  },
  products: {
    productsCollectionOverride: ProductsCollection,
  },
  orders: { ... },
  transactions: { ... },
  addresses: { ... },
  carts: { ... },
})
```

### Collections Created

| Collection | Purpose | Access |
|-----------|---------|--------|
| **Products** | Product catalog with variants, pricing, gallery, and SEO | Create: admin, coordinator. Update/Delete: admin (all), coordinator (own crew). |
| **Orders** | Purchase orders linked to customers | Read: admin (all), customer (own orders) |
| **Transactions** | Payment records from Stripe webhooks | Create/Update/Delete: denied (webhook-only). Read: admin (all), customer (own). |
| **Addresses** | Customer shipping/billing addresses | CRUD: admin (all), customer (own) |
| **Carts** | Shopping cart state per customer | Update: document owner only |
| **Variant Types** | Product variant dimensions (size, color) | Plugin defaults |
| **Variant Options** | Values within variant types | Plugin defaults |

### Stripe Integration

The Stripe adapter handles:
- **Payment processing**: Secure checkout via Stripe Elements
- **Webhook handling**: Order creation and status updates from Stripe events (accessible at `/api/stripe/webhooks`)
- **Product sync**: Product and price management through the Payload admin panel

### Custom Product Collection

The Products collection is heavily customized via `ProductsCollection`:

```typescript
export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  access: {
    create: ({ req: { user } }) => checkRole(['admin', 'crew_coordinator'], user),
    update: ({ req: { user } }) => {
      if (checkRole(['admin'], user)) return true
      if (checkRole(['crew_coordinator'], user)) {
        const crewId = getCrewId(user)
        if (crewId) return { crew: { equals: crewId } }
      }
      return false
    },
    // ...
  },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 200 },
    // Content tab with description, gallery, layout blocks
    // Product Details tab with default ecommerce fields + relatedProducts
    // SEO tab with meta fields
    // Sidebar: categories, crew relationship
  ],
})
```

Products can be crew-scoped via the optional `crew` field, making them visible only to members of that crew.

---

## @payloadcms/storage-s3

**Purpose:** S3-compatible file storage for media uploads, configured for Cloudflare R2.

### Configuration

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
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT ?? '',
  },
})
```

### What It Does

- Redirects file uploads from local disk to Cloudflare R2 object storage
- Each collection gets its own prefix (folder) in the bucket for organized storage
- Configured conditionally: only active when `R2_BUCKET` environment variable is set
- In development (without R2), files fall back to the local `public/` directory

### Collections Configured

| Collection | R2 Prefix | Content |
|-----------|----------|---------|
| `media` | `media/` | General content images, videos, PDFs |
| `avatars` | `avatars/` | User profile photos |
| `inventory-media` | `inventory-media/` | Inventory item and recipe images |
| `guide-media` | `guide-media/` | Crew guide attachments and images |
| `chat-media` | `chat-media/` | Chat message attachments and images |

---

## @payloadcms/translations

**Purpose:** Internationalization support for the Payload admin panel.

### What It Does

- Provides translation strings for the Payload admin UI
- Allows the admin panel to be displayed in different languages
- Included as a dependency at version 3.76.1 to match the Payload CMS version

---

## @payloadcms/live-preview-react

**Purpose:** Real-time content preview for editors working on draft content.

### Configuration

Live preview is configured per-collection in the admin settings:

```typescript title="src/collections/Pages/index.ts"
admin: {
  livePreview: {
    url: ({ data, req }) =>
      generatePreviewPath({
        slug: data?.slug,
        collection: 'pages',
        req,
      }),
  },
  preview: (data, { req }) =>
    generatePreviewPath({
      slug: data?.slug as string,
      collection: 'pages',
      req,
    }),
}
```

### What It Does

- Renders a live preview iframe in the Payload admin panel alongside the content editor
- Updates in real-time as the editor makes changes, without requiring a save
- Uses the `generatePreviewPath` utility to construct the preview URL with draft parameters
- Configured for both Pages and Products collections

### Collections Using Live Preview

| Collection | Preview URL Pattern |
|-----------|-------------------|
| Pages | `/{slug}?draft=true&secret=...` |
| Products | `/products/{slug}?draft=true&secret=...` |

---

## Plugin Summary

| Plugin | Package | Collections Created/Modified | Primary Function |
|--------|---------|----------------------------|-----------------|
| SEO | `@payloadcms/plugin-seo` | Pages, Products (meta fields) | Search engine metadata |
| Form Builder | `@payloadcms/plugin-form-builder` | Forms, Form Submissions | Dynamic form creation |
| Ecommerce | `@payloadcms/plugin-ecommerce` | Products, Orders, Transactions, Addresses, Carts, Variants | Stripe-powered shop |
| S3 Storage | `@payloadcms/storage-s3` | Media, Avatars, Inventory Media, Guide Media, Chat Media (storage) | Cloudflare R2 CDN |
| Translations | `@payloadcms/translations` | None (admin UI) | Admin i18n |
| Live Preview | `@payloadcms/live-preview-react` | Pages, Products (admin UI) | Draft content preview |
