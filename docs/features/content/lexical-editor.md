---
sidebar_position: 4
title: "Lexical Rich Text Editor"
---

# Lexical Rich Text Editor

OCFCrews uses Payload CMS's **Lexical** rich text editor (`@payloadcms/richtext-lexical`) for all rich text fields. There are two distinct editor configurations: a **global default** used by most fields, and a **posts editor** with an expanded feature set.

## Global Default Editor

The global editor is configured in `src/payload.config.ts` and serves as the default for all rich text fields that do not specify their own editor. It provides a baseline feature set suitable for general content.

### Enabled Features

| Feature | Description |
|---|---|
| `BoldFeature` | Bold text formatting |
| `ItalicFeature` | Italic text formatting |
| `UnderlineFeature` | Underline text formatting |
| `OrderedListFeature` | Numbered lists |
| `UnorderedListFeature` | Bulleted lists |
| `LinkFeature` | Hyperlinks (internal links to `pages` collection, or external URLs) |
| `IndentFeature` | Text indentation |
| `EXPERIMENTAL_TableFeature` | Table support (experimental) |

The `LinkFeature` is configured with internal linking restricted to the `pages` collection. The URL field is conditionally hidden when the link type is `internal`, showing only the relationship selector.

## Posts Editor

The Posts collection uses a more feature-rich editor configured directly on the `content` field in `src/collections/Posts/index.ts`. This editor is tailored for long-form content creation.

### Enabled Features

| Feature | Description |
|---|---|
| `FixedToolbarFeature` | Persistent toolbar pinned above the editor |
| `HeadingFeature` | Headings at h2, h3, and h4 levels |
| `BoldFeature` | Bold text formatting |
| `ItalicFeature` | Italic text formatting |
| `UnderlineFeature` | Underline text formatting |
| `StrikethroughFeature` | Strikethrough text formatting |
| `AlignFeature` | Text alignment (left, center, right, justify) |
| `IndentFeature` | Text indentation |
| `OrderedListFeature` | Numbered lists |
| `UnorderedListFeature` | Bulleted lists |
| `ChecklistFeature` | Interactive checklists |
| `BlockquoteFeature` | Block quotations |
| `HorizontalRuleFeature` | Horizontal divider lines |
| `InlineCodeFeature` | Inline code spans |
| `LinkFeature` | Hyperlinks (internal links to `pages` and `posts` collections) |
| `UploadFeature` | Inline media uploads from the `media` collection |

Note that the posts editor does **not** inherit from the global root features -- it defines its feature set from scratch using a function that returns an explicit array.

## Block-Level Editors

Several layout blocks used in the Pages collection define their own editor configurations. These typically extend the root features with additional capabilities:

| Block | Extra Features |
|---|---|
| Call to Action | Headings (h1-h4), fixed toolbar, inline toolbar |
| Content (columns) | Headings (h2-h4), fixed toolbar, inline toolbar |
| Archive | Headings (h1-h4), fixed toolbar, inline toolbar |
| Banner | Fixed toolbar, inline toolbar (no extra heading sizes) |
| Form Block | Headings (h1-h4), fixed toolbar, inline toolbar |

These block editors use `({ rootFeatures }) => [...rootFeatures, ...]` to inherit the global default features and add block-specific enhancements.

## Hero Editor

The hero section rich text field (used on Pages) also extends root features with headings (h1-h4), fixed toolbar, and inline toolbar.

## How Rich Text Is Stored

Lexical stores content as a **serialized JSON editor state** (`SerializedEditorState`). This JSON structure represents the document as a tree of nodes, where each node corresponds to a paragraph, heading, list, inline format, link, or embedded block.

This approach:
- Preserves the full document structure without relying on HTML parsing
- Supports embedded blocks (media, banners, CTAs) as first-class nodes within the content tree
- Is portable and can be rendered server-side or client-side

## How Rich Text Is Rendered

On the frontend, rich text is rendered using the `RichText` component at `src/components/RichText/index.tsx`. This component wraps Payload's `RichTextWithoutBlocks` from `@payloadcms/richtext-lexical/react` and provides custom JSX converters for embedded block types:

| Block Node | Renderer |
|---|---|
| `banner` | `BannerBlock` component |
| `mediaBlock` | `MediaBlock` component (full-width, no gutter) |
| `code` | `CodeBlock` component |
| `cta` | `CallToActionBlock` component |

The component accepts the following props:

| Prop | Default | Description |
|---|---|---|
| `data` | -- | The `SerializedEditorState` JSON to render |
| `enableGutter` | `true` | Wraps content in a container with gutters |
| `enableProse` | `true` | Applies Tailwind prose typography classes (`prose md:prose-md dark:prose-invert`) |

All standard node types (paragraphs, headings, lists, links, etc.) are handled by the default converters provided by `@payloadcms/richtext-lexical/react`.

## Source Files

| File | Purpose |
|---|---|
| `src/payload.config.ts` | Global default Lexical editor configuration |
| `src/collections/Posts/index.ts` | Posts-specific editor with expanded features |
| `src/fields/hero.ts` | Hero rich text editor configuration |
| `src/blocks/*/config.ts` | Per-block editor configurations |
| `src/components/RichText/index.tsx` | Frontend rendering component with JSX converters |
