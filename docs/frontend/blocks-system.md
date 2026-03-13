---
sidebar_position: 5
title: "Page Builder Blocks"
---

# Page Builder Blocks

OCFCrews uses Payload CMS's **blocks** field type to implement a modular page builder. Content editors can compose pages by adding, removing, and reordering blocks in the Payload admin panel. Each block type represents a distinct section of a page with its own fields and rendering logic.

## How Blocks Work

Blocks are defined as Payload `Block` configurations that specify the fields available to content editors. At runtime, the page's `layout` field contains an array of block data, and the `RenderBlocks` component maps each block to its corresponding React component.

### Data Flow

```
Payload Admin (editor adds blocks)
  → Page document stored in MongoDB with layout: [{ blockType, blockName, ...fields }]
    → Server component fetches page data
      → RenderBlocks iterates over blocks array
        → Each block rendered by its matching React component
```

## Block Types

All blocks are defined in the `src/blocks/` directory. Each block has:
- A **config file** (`config.ts`) that defines the Payload block schema
- A **component file** (`Component.tsx`) that renders the block on the frontend

### Archive Block

**Directory:** `src/blocks/ArchiveBlock/`
**Slug:** `archive`

Displays a collection of documents (products) in a grid layout with optional intro content.

| Field | Type | Description |
|---|---|---|
| `introContent` | Rich Text | Optional introductory content displayed above the archive grid |
| `populateBy` | Select | `collection` (auto-populate) or `selection` (manual pick) |
| `relationTo` | Select | Which collection to show (currently: Products) |
| `categories` | Relationship | Filter by categories (when using collection mode) |
| `limit` | Number | Maximum number of items to display (default: 10) |
| `selectedDocs` | Relationship | Manually selected documents (when using selection mode) |

### Banner Block

**Directory:** `src/blocks/Banner/`
**Slug:** `banner`

A styled alert/notification banner with configurable styles.

| Field | Type | Description |
|---|---|---|
| `style` | Select | Visual style: `info`, `warning`, `error`, or `success` |
| `content` | Rich Text | The banner message content |

### Call to Action Block

**Directory:** `src/blocks/CallToAction/`
**Slug:** `cta`

A prominent section with rich text content and up to two action buttons.

| Field | Type | Description |
|---|---|---|
| `richText` | Rich Text | Heading and body content |
| `links` | Link Group | Up to 2 links with `default` or `outline` button appearances |

### Carousel Block

**Directory:** `src/blocks/Carousel/`
**Slug:** `carousel`

A scrollable product carousel. Can be auto-populated from a collection or manually curated.

| Field | Type | Description |
|---|---|---|
| `populateBy` | Select | `collection` or `selection` |
| `relationTo` | Select | Collection to show (Products) |
| `categories` | Relationship | Category filter for collection mode |
| `limit` | Number | Maximum items (default: 10) |
| `selectedDocs` | Relationship | Manual selection of products |
| `populatedDocs` | Relationship | Auto-populated after read (disabled in admin) |
| `populatedDocsTotal` | Number | Total count of populated docs (auto-filled) |

This block uses a split rendering approach:
- `Component.tsx` -- Server component that fetches and prepares data
- `Component.client.tsx` -- Client component that renders the interactive carousel using the shadcn/ui `Carousel` component

### Code Block

**Directory:** `src/blocks/Code/`
**Slug:** `code`

Displays syntax-highlighted code snippets with a copy button.

| Field | Type | Description |
|---|---|---|
| `language` | Select | `typescript`, `javascript`, or `css` |
| `code` | Code | The code content |

This block also uses a split rendering approach:
- `Component.tsx` -- Server component wrapper
- `Component.client.tsx` -- Client component for syntax highlighting
- `CopyButton.tsx` -- Client component for the copy-to-clipboard button

### Content Block

**Directory:** `src/blocks/Content/`
**Slug:** `content`

A flexible multi-column content section. Each column can have its own width and optional link.

| Field | Type | Description |
|---|---|---|
| `columns` | Array | Array of content columns |
| `columns[].size` | Select | Column width: `oneThird`, `half`, `twoThirds`, or `full` |
| `columns[].richText` | Rich Text | Column content with headings (h2-h4) |
| `columns[].enableLink` | Checkbox | Whether to show a link below the content |
| `columns[].link` | Link | Optional CMS-managed link |

### Form Block

**Directory:** `src/blocks/Form/`
**Slug:** `formBlock`

Embeds a Payload CMS form (from the `forms` collection) into a page. Supports all standard form field types.

| Field | Type | Description |
|---|---|---|
| `form` | Relationship | Reference to a form document |
| `enableIntro` | Checkbox | Whether to show intro content above the form |
| `introContent` | Rich Text | Optional intro content (shown when enabled) |

The Form block includes sub-components for each field type:
- `Text`, `Email`, `Number`, `Textarea` -- Standard input fields
- `Select` -- Dropdown selection
- `Checkbox` -- Boolean toggle
- `Country`, `State` -- Location selectors with predefined option lists
- `Error`, `Message`, `Width` -- Layout and feedback components
- `buildInitialFormState` -- Utility to create initial form values from field definitions

### Media Block

**Directory:** `src/blocks/MediaBlock/`
**Slug:** `mediaBlock`

Displays a single media asset (image or video) from the media collection.

| Field | Type | Description |
|---|---|---|
| `media` | Upload | Reference to a media document (required) |

### Three Item Grid Block

**Directory:** `src/blocks/ThreeItemGrid/`
**Slug:** `threeItemGrid`

A curated grid of exactly three products, useful for featured product sections.

| Field | Type | Description |
|---|---|---|
| `products` | Relationship | Exactly 3 products (sortable, min/max rows: 3) |

## RenderBlocks Component

**File:** `src/blocks/RenderBlocks.tsx`

The central dispatcher that maps block data to React components. It is a server component.

```tsx
const blockComponents: Record<string, React.FC<any>> = {
  archive: ArchiveBlock,
  banner: BannerBlock,
  carousel: CarouselBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  threeItemGrid: ThreeItemGridBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props
  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockName, blockType } = block
          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]
            if (Block) {
              return (
                <div className="my-16" key={index}>
                  <Block id={toKebabCase(blockName!)} {...block} />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
```

### How it works

1. Receives an array of block objects from the page's `layout` field
2. Iterates over each block, looking up the component by `blockType` in the `blockComponents` map
3. Renders each block inside a `<div className="my-16">` wrapper for consistent vertical spacing
4. The block's `blockName` is converted to kebab-case and passed as the `id` prop for anchor linking
5. All block fields are spread as props to the component

## Adding a New Block

To add a new block type to OCFCrews:

### 1. Create the block directory

```
src/blocks/MyNewBlock/
├── config.ts       # Payload block schema
└── Component.tsx   # React component
```

### 2. Define the config

```ts
// src/blocks/MyNewBlock/config.ts
import type { Block } from 'payload'

export const MyNewBlock: Block = {
  slug: 'myNewBlock',
  interfaceName: 'MyNewBlockType',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    // ... more fields
  ],
  labels: {
    singular: 'My New Block',
    plural: 'My New Blocks',
  },
}
```

### 3. Create the component

```tsx
// src/blocks/MyNewBlock/Component.tsx
import React from 'react'
import type { MyNewBlockType } from '@/payload-types'

export const MyNewBlockComponent: React.FC<MyNewBlockType & { id?: string }> = ({
  id,
  title,
}) => {
  return (
    <div id={id} className="container">
      <h2>{title}</h2>
    </div>
  )
}
```

### 4. Register the block

Add the block config to your Payload page collection's `layout` field and register the component in `RenderBlocks.tsx`:

```tsx
// src/blocks/RenderBlocks.tsx
import { MyNewBlockComponent } from '@/blocks/MyNewBlock/Component'

const blockComponents: Record<string, React.FC<any>> = {
  // ... existing blocks
  myNewBlock: MyNewBlockComponent,
}
```

### 5. Regenerate types

Run `pnpm payload generate:types` to generate the TypeScript interface for your new block.

## Rich Text in Blocks

Several blocks use Payload's Lexical rich text editor with customized features:

```tsx
editor: lexicalEditor({
  features: ({ rootFeatures }) => [
    ...rootFeatures,
    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})
```

- **`HeadingFeature`** -- Controls which heading levels are available (varies by block)
- **`FixedToolbarFeature`** -- Shows a fixed formatting toolbar above the editor
- **`InlineToolbarFeature`** -- Shows a floating toolbar when text is selected
