---
sidebar_position: 1
title: "Header"
---

# Header

## Overview

The **Header** global manages the site-wide navigation bar displayed at the top of every page. It stores an array of navigation items, each containing a configurable link (internal reference or custom URL).

## Configuration

| Property | Value |
|---|---|
| **Slug** | `header` |
| **Admin Group** | Navigation |
| **Cache Tag** | `global_header` |

**Source:** `src/globals/Header.ts`

## Fields

### `navItems` (array)

An array of navigation items displayed in the header. Maximum of **6 items**.

Each array entry contains a single `link` group field with the following sub-fields:

| Sub-field | Type | Required | Description |
|---|---|---|---|
| `link.type` | `radio` | No | Link type: `reference` (internal link to a Page) or `custom` (external URL). Defaults to `reference`. |
| `link.newTab` | `checkbox` | No | When checked, the link opens in a new browser tab. |
| `link.reference` | `relationship` (pages) | Yes (if type = reference) | The internal page to link to. Only shown when `type` is `reference`. |
| `link.url` | `text` | Yes (if type = custom) | A custom URL. Only shown when `type` is `custom`. |
| `link.label` | `text` | Yes | The display label for the navigation item. |

:::info
The `link` field is a shared field builder defined in `src/fields/link.ts`. For the Header global, the `appearances` option is set to `false`, so no appearance/style selector is included.
:::

## Access Control

| Operation | Who Can Access |
|---|---|
| **Read** | Admin only |
| **Update** | Admin only |

Access is enforced by the `adminOnly` access function, which checks that the authenticated user has the `admin` role.

## Hooks

### `afterChange`

After any change to the Header global, the `global_header` cache tag is revalidated using Next.js `revalidateTag()`. This ensures that all pages displaying the header re-render with the updated navigation items on the next request.

```ts
afterChange: [({ doc }) => { revalidateTag('global_header'); return doc }]
```

## Usage

The Header global is fetched server-side using Payload's global API:

```ts
const header = await payload.findGlobal({ slug: 'header' })
```

The returned data includes the `navItems` array, which the frontend header component iterates over to render navigation links.
