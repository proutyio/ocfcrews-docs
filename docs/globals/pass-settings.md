---
sidebar_position: 4
title: "Pass Settings"
---

# Pass Settings

## Overview

The **Pass Settings** global stores crew pass, parking pass, and camping tag images organized by year. Coordinators upload images for each event year, and crew members see the relevant pass image for their year when viewing their passes.

## Configuration

| Property | Value |
|---|---|
| **Slug** | `pass-settings` |
| **Label** | Pass Settings |
| **Admin Group** | Settings |

**Source:** `src/globals/PassSettings.ts`

## Fields

The global contains three array fields, each with an identical structure -- a year string and an image upload. Each array enforces unique years through a custom validator.

### `crewPassImages` (array)

Images for crew passes, organized by year.

| Sub-field | Type | Required | Description |
|---|---|---|---|
| `year` | `text` | Yes | A 4-digit year string (e.g., `2025`). Must be unique within the array. |
| `image` | `upload` (media) | No | The crew pass image for this year. Uploaded to the `media` collection. |

### `parkingPassImages` (array)

Images for parking passes, organized by year.

| Sub-field | Type | Required | Description |
|---|---|---|---|
| `year` | `text` | Yes | A 4-digit year string (e.g., `2025`). Must be unique within the array. |
| `image` | `upload` (media) | No | The parking pass image for this year. Uploaded to the `media` collection. |

### `campingTagImages` (array)

Images for camping tags, organized by year.

| Sub-field | Type | Required | Description |
|---|---|---|---|
| `year` | `text` | Yes | A 4-digit year string (e.g., `2025`). Must be unique within the array. |
| `image` | `upload` (media) | No | The camping tag image for this year. Uploaded to the `media` collection. |

## Validation

### Year Field Validation

Each `year` field validates that the value is a non-empty 4-digit number:

```ts
if (!/^\d{4}$/.test(value)) return 'Year must be a 4-digit number (e.g. 2025)'
```

### Unique Year Validation

Each array enforces year uniqueness through a custom `uniqueYearValidate` function applied at the array level. If two entries share the same year, validation fails with the message: `"Each year must be unique"`.

## Access Control

| Operation | Who Can Access |
|---|---|
| **Read** | `admin`, `editor`, `crew_coordinator` |
| **Update** | Admin only |

The read access is broader than most globals -- coordinators and editors can read pass settings so they can view pass images for their crew members. However, only admins can update the pass images.

## Usage

### Fetching Pass Images

```ts
const passSettings = await payload.findGlobal({ slug: 'pass-settings' })

// Find the crew pass image for a specific year
const year = '2025'
const crewPass = passSettings.crewPassImages?.find(
  (entry) => entry.year === year
)
const imageUrl = crewPass?.image // media document or ID
```

### Data Shape Example

```json
{
  "crewPassImages": [
    { "year": "2024", "image": "media-id-abc" },
    { "year": "2025", "image": "media-id-def" }
  ],
  "parkingPassImages": [
    { "year": "2025", "image": "media-id-ghi" }
  ],
  "campingTagImages": [
    { "year": "2025", "image": "media-id-jkl" }
  ]
}
```

## Relationships

| Related Collection | Field | Description |
|---|---|---|
| **Media** | `image` (in each array entry) | Each pass image is stored as an upload in the `media` collection. |
