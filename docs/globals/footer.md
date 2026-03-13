---
sidebar_position: 2
title: "Footer"
---

# Footer

## Overview

The **Footer** global manages the site-wide footer navigation displayed at the bottom of every page. Its structure mirrors the Header global -- it stores an array of navigation items, each containing a configurable link.

## Configuration

| Property | Value |
|---|---|
| **Slug** | `footer` |
| **Admin Group** | Navigation |
| **Cache Tag** | `global_footer` |

**Source:** `src/globals/Footer.ts`

## Fields

### `navItems` (array)

An array of navigation items displayed in the footer. Maximum of **6 items**.

Each array entry contains a single `link` group field with the following sub-fields:

| Sub-field | Type | Required | Description |
|---|---|---|---|
| `link.type` | `radio` | No | Link type: `reference` (internal link to a Page) or `custom` (external URL). Defaults to `reference`. |
| `link.newTab` | `checkbox` | No | When checked, the link opens in a new browser tab. |
| `link.reference` | `relationship` (pages) | Yes (if type = reference) | The internal page to link to. Only shown when `type` is `reference`. |
| `link.url` | `text` | Yes (if type = custom) | A custom URL. Only shown when `type` is `custom`. |
| `link.label` | `text` | Yes | The display label for the navigation item. |

:::info
Like the Header, the Footer uses the shared `link` field builder from `src/fields/link.ts` with `appearances` set to `false`.
:::

## Access Control

| Operation | Who Can Access |
|---|---|
| **Read** | Admin only |
| **Update** | Admin only |

Access is enforced by the `adminOnly` access function, which checks that the authenticated user has the `admin` role.

## Hooks

### `afterChange`

After any change to the Footer global, the `global_footer` cache tag is revalidated using Next.js `revalidateTag()`. This ensures that all pages displaying the footer re-render with the updated navigation items on the next request.

```ts
afterChange: [({ doc }) => { revalidateTag('global_footer'); return doc }]
```

## Usage

The Footer global is fetched server-side using Payload's global API:

```ts
const footer = await payload.findGlobal({ slug: 'footer' })
```

The returned data includes the `navItems` array, which the frontend footer component iterates over to render navigation links.

## Comparison with Header

The Header and Footer globals share an identical field structure. The key differences are:

| Aspect | Header | Footer |
|---|---|---|
| **Slug** | `header` | `footer` |
| **Cache Tag** | `global_header` | `global_footer` |
| **Rendered Location** | Top of every page | Bottom of every page |
