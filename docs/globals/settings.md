---
sidebar_position: 3
title: "Settings"
---

# Settings

## Overview

The **Settings** global (labeled "Global Settings" in the admin panel) provides application-wide feature flags that allow administrators to enable or disable major features without a code deployment. Each toggle uses a custom `ConfirmToggle` component that requires confirmation before changing state, preventing accidental modifications.

## Configuration

| Property | Value |
|---|---|
| **Slug** | `settings` |
| **Label** | Global Settings |
| **Admin Group** | Settings |
| **Cache Tag** | `global_settings` |

**Source:** `src/globals/Settings/index.ts`

## Fields

| Name | Type | Default | Description |
|---|---|---|---|
| `shopDisabled` | `checkbox` | `false` | When enabled, the shop displays a "temporarily unavailable" message to all users. Use this to take the shop offline during maintenance or outside of selling periods. |
| `accountCreationDisabled` | `checkbox` | `false` | When enabled, the "Create an account" button is disabled and direct registration is blocked. Use this to close registration during off-season or when membership is full. |

### Custom Admin Component: ConfirmToggle

Both fields use a custom admin UI component (`ConfirmToggle`) instead of the default checkbox. This component displays a confirmation dialog before toggling the value, ensuring administrators do not accidentally enable or disable critical features.

```
admin.components.Field: '@/globals/Settings/ConfirmToggle#ConfirmToggle'
```

## Access Control

| Operation | Who Can Access |
|---|---|
| **Read** | Admin only |
| **Update** | Admin only |

Access is enforced by the `adminOnly` access function. Only users with the `admin` role can view or modify global settings.

## Hooks

### `afterChange`

After any change to the Settings global, the `global_settings` cache tag is revalidated using Next.js `revalidateTag()`. This ensures that components relying on these settings (such as the shop layout and registration form) immediately reflect the updated configuration.

```ts
afterChange: [({ doc }) => { revalidateTag('global_settings'); return doc }]
```

## Usage

### Server-side

```ts
const settings = await payload.findGlobal({ slug: 'settings' })

if (settings.shopDisabled) {
  // Show "temporarily unavailable" message
}

if (settings.accountCreationDisabled) {
  // Hide or disable the registration form
}
```

### How Feature Flags Affect the Application

| Setting | When Enabled | Affected Areas |
|---|---|---|
| `shopDisabled` | Shop pages show an unavailability message; checkout is blocked | Shop pages, cart, checkout flow |
| `accountCreationDisabled` | Registration form is hidden/disabled; direct account creation API calls are rejected | Registration page, create account form, login page link |
