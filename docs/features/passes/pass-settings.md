---
sidebar_position: 3
title: "Pass Settings Global"
---

# Pass Settings Global

The **PassSettings** global configuration stores per-year images for crew passes, parking passes, and camping tags. These images serve as visual references so crew members can identify what their passes look like.

## Global Configuration

| Property | Value |
|---|---|
| Slug | `pass-settings` |
| Label | Pass Settings |
| Admin group | Settings |

## Access Control

| Operation | Allowed Roles |
|---|---|
| Read | Admin, editor, crew coordinator |
| Update | Admin only |

Only admins can upload or modify pass images. Editors and crew coordinators have read access so they can view the images when assisting members, but they cannot change them.

## Fields

The global contains three parallel array fields, one for each pass type. All three share the same structure.

### Crew Pass Images (`crewPassImages`)

| Property | Value |
|---|---|
| Type | Array |
| Label | Crew Pass Images by Year |
| Description | Upload a crew pass image for each year. Members will see the image for their year. |

Each entry contains:

| Field | Type | Description |
|---|---|---|
| `year` | Text | Required, 4-digit year (validated with `/^\d{4}$/`), max 4 characters |
| `image` | Upload (media) | The crew pass image for this year |

### Parking Pass Images (`parkingPassImages`)

| Property | Value |
|---|---|
| Type | Array |
| Label | Parking Pass Images by Year |
| Description | Upload a parking pass image for each year. Members will see the image for their year. |

Each entry contains:

| Field | Type | Description |
|---|---|---|
| `year` | Text | Required, 4-digit year (validated with `/^\d{4}$/`), max 4 characters |
| `image` | Upload (media) | The parking pass image for this year |

### Camping Tag Images (`campingTagImages`)

| Property | Value |
|---|---|
| Type | Array |
| Label | Camping Tag Images by Year |
| Description | Upload a camping tag image for each year. Members will see the image for their year. |

Each entry contains:

| Field | Type | Description |
|---|---|---|
| `year` | Text | Required, 4-digit year (validated with `/^\d{4}$/`), max 4 characters |
| `image` | Upload (media) | The camping tag image for this year |

## Unique Year Validation

All three arrays share a custom `uniqueYearValidate` function that prevents duplicate year entries:

```typescript
const uniqueYearValidate = (value: unknown) => {
  if (!Array.isArray(value)) return true
  const years = (value as { year?: string }[]).map((e) => e.year).filter(Boolean)
  if (new Set(years).size !== years.length) return 'Each year must be unique'
  return true
}
```

This ensures that each year appears at most once in each array. For example, you cannot upload two different crew pass images for the year 2025.

## Year Field Validation

The year field (shared across all three arrays via a reusable `yearField` constant) validates that:

1. The value is not empty (`'Year is required'`)
2. The value is exactly a 4-digit number matching `/^\d{4}$/` (`'Year must be a 4-digit number (e.g. 2025)'`)

## How Images Are Displayed to Users

On the account page (`/account`), the pass settings are fetched alongside the user's pass status data. The frontend:

1. Reads the `pass-settings` global with `depth: 1` (to resolve media relationships)
2. Builds lookup maps from year to image URL for each pass type (`crewPassImageByYear`, `parkingPassImageByYear`, `campingTagImageByYear`)
3. For each year in the user's `passStatus` array, looks up the corresponding image URL from these maps
4. Displays the pass image alongside the received/not-received status for that pass type

The passes section is only shown on the account page when:
- The user has at least one entry in their `passStatus` array
- The user's `crewRole` is not `other` (i.e., they are assigned to a crew)

## Admin Workflow

To set up pass images for a new year:

1. Navigate to **Settings > Pass Settings** in the Payload admin panel
2. For each pass type (Crew Pass Images, Parking Pass Images, Camping Tag Images):
   - Click "Add" to create a new array entry
   - Enter the 4-digit year (e.g., `2025`)
   - Upload the corresponding pass or tag image from the media library
3. Save the global

The images will immediately become visible to members who have a pass status entry for that year.

## Source Files

| File | Purpose |
|---|---|
| `src/globals/PassSettings.ts` | Global configuration with array fields and validation |
| `src/payload.config.ts` | Registers PassSettings as a global |
| `src/app/(app)/(account)/account/page.tsx` | Frontend rendering of pass images on the account page |
