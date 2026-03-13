---
sidebar_position: 21
title: "Guide Media"
---

# Guide Media

The `guide-media` collection stores file attachments on crew guides.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `filename` | Text | Original filename |
| `label` | Text | Optional human-readable label for the attachment |
| `guide` | Relationship (crew-guides) | The guide this attachment belongs to |
| `crew` | Relationship (crews) | The crew (for crew isolation) |
| `url` | Text | Storage URL for the file |
| `mimeType` | Text | MIME type of the uploaded file |
| `filesize` | Number | File size in bytes |

## Supported File Types

- PDF documents
- Images (JPG, PNG, WebP, GIF)
- Text files

## Access Control

- Any confirmed crew member can upload attachments to guides in their crew
- Attachments are crew-scoped — only visible to members of the guide's crew
- Stored in Cloudflare R2 under a dedicated prefix

## Related

- [Crew Guides Overview](../features/guides/overview)
- [Crew Guides Collection](./crew-guides)
