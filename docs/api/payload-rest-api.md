---
sidebar_position: 6
title: "Payload REST API"
---

# Payload REST API

## Overview

Payload CMS automatically generates a full REST API for every collection and global registered in the configuration. These endpoints handle CRUD operations, authentication, file uploads, and complex queries without any custom code.

**Base URL:** `/api`

## Authentication

### Cookie-Based (Browser)

When using the admin panel or frontend application, authentication is handled via HTTP-only session cookies set during login.

### Token-Based (Programmatic)

For programmatic API access, include the JWT token in the `Authorization` header:

```
Authorization: JWT <token>
```

### Login Endpoint

```
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "exp": 1234567890,
  "user": { "id": "...", "email": "...", ... }
}
```

### Other Auth Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/users/logout` | POST | Invalidate session |
| `/api/users/me` | GET | Get current authenticated user |
| `/api/users/forgot-password` | POST | Request password reset email |
| `/api/users/reset-password` | POST | Reset password with token |
| `/api/users/verify/{token}` | POST | Verify email address |
| `/api/users/refresh-token` | POST | Refresh JWT token |

## Collection Endpoints

### List / Query Documents

```
GET /api/{collection}
```

Returns a paginated list of documents.

#### Query Parameters

| Parameter | Type | Description | Example |
|---|---|---|---|
| `where` | object | Filter documents using Payload query syntax | `where[status][equals]=published` |
| `sort` | string | Field to sort by (prefix with `-` for descending) | `sort=-createdAt` |
| `limit` | number | Number of documents per page (default: 10) | `limit=25` |
| `page` | number | Page number for pagination | `page=2` |
| `depth` | number | Depth of relationship population (default: 1) | `depth=2` |
| `select` | object | Fields to include in the response | `select[email]=true` |
| `populate` | object | Control which relationships to populate | `populate[crew]=true` |
| `locale` | string | Locale for localized fields | `locale=en` |

#### Response Shape

```json
{
  "docs": [
    { "id": "...", ... }
  ],
  "totalDocs": 100,
  "limit": 10,
  "totalPages": 10,
  "page": 1,
  "pagingCounter": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevPage": null,
  "nextPage": 2
}
```

### Create Document

```
POST /api/{collection}
Content-Type: application/json

{
  "field1": "value1",
  "field2": "value2"
}
```

For file uploads (media collections), use `multipart/form-data`:

```
POST /api/media
Content-Type: multipart/form-data

file: <binary>
alt: "Description"
```

### Get Document by ID

```
GET /api/{collection}/{id}
```

Optional query parameters: `depth`, `select`, `populate`, `locale`.

### Update Document

```
PATCH /api/{collection}/{id}
Content-Type: application/json

{
  "field1": "updated value"
}
```

Only include the fields you want to update. Omitted fields remain unchanged.

### Delete Document

```
DELETE /api/{collection}/{id}
```

## Global Endpoints

### Get Global

```
GET /api/globals/{slug}
```

### Update Global

```
POST /api/globals/{slug}
Content-Type: application/json

{
  "field1": "value"
}
```

## Where Query Syntax

Payload's `where` parameter supports a rich query syntax for filtering documents.

### Operators

| Operator | Description | Example |
|---|---|---|
| `equals` | Exact match | `where[status][equals]=published` |
| `not_equals` | Not equal | `where[role][not_equals]=other` |
| `in` | Value in array | `where[status][in]=draft,published` |
| `not_in` | Value not in array | `where[status][not_in]=archived` |
| `exists` | Field exists (true/false) | `where[schedule][exists]=true` |
| `greater_than` | Greater than | `where[hours][greater_than]=4` |
| `greater_than_equal` | Greater than or equal | `where[hours][greater_than_equal]=4` |
| `less_than` | Less than | `where[hours][less_than]=8` |
| `less_than_equal` | Less than or equal | `where[hours][less_than_equal]=8` |
| `like` | Case-insensitive substring match | `where[name][like]=john` |
| `contains` | Contains substring | `where[email][contains]=@gmail` |

### Compound Queries

Use `and` / `or` for compound conditions:

```
where[and][0][status][equals]=published
where[and][1][crew][equals]=crew-id
```

```
where[or][0][role][equals]=admin
where[or][1][role][equals]=editor
```

## Available Collections

| Collection Slug | REST Path | Description |
|---|---|---|
| `users` | `/api/users` | User accounts and authentication |
| `crews` | `/api/crews` | Crew organizations |
| `pages` | `/api/pages` | CMS pages |
| `categories` | `/api/categories` | Content categories |
| `media` | `/api/media` | Uploaded media files |
| `avatars` | `/api/avatars` | User avatar images |
| `schedule-positions` | `/api/schedule-positions` | Reusable position templates |
| `schedules` | `/api/schedules` | Crew shift schedules |
| `time-entries` | `/api/time-entries` | Logged work hours |
| `posts` | `/api/posts` | Blog/announcement posts |
| `email-templates` | `/api/email-templates` | Reusable email templates |
| `emails` | `/api/emails` | Email campaign documents |
| `inventory-media` | `/api/inventory-media` | Inventory item images |
| `inventory-categories` | `/api/inventory-categories` | Inventory categories |
| `inventory-subcategories` | `/api/inventory-subcategories` | Inventory subcategories |
| `inventory-items` | `/api/inventory-items` | Inventory items |
| `inventory-transactions` | `/api/inventory-transactions` | Inventory stock transactions |
| `recipes` | `/api/recipes` | Crew recipes |
| `recipe-favorites` | `/api/recipe-favorites` | User recipe favorites |
| `recipe-sub-groups` | `/api/recipe-sub-groups` | Recipe sub-groups |
| `recipe-tags` | `/api/recipe-tags` | Recipe tags |

## Available Globals

| Global Slug | REST Path | Description |
|---|---|---|
| `header` | `/api/globals/header` | Site header navigation |
| `footer` | `/api/globals/footer` | Site footer navigation |
| `settings` | `/api/globals/settings` | Global feature flags |
| `pass-settings` | `/api/globals/pass-settings` | Pass image configuration |

## Access Control

All REST API requests are subject to the access control rules defined on each collection and global. Payload evaluates the `read`, `create`, `update`, and `delete` access functions for each operation. Requests that fail access control receive a `403 Forbidden` response or have their results filtered to only include permitted documents.

See the individual collection reference pages for detailed access control rules.

## Examples

### Query schedules for a specific crew

```bash
curl -X GET 'https://ocfcrews.org/api/schedules?where[crew][equals]=CREW_ID&sort=date&limit=50' \
  -H 'Authorization: JWT <token>'
```

### Create a new inventory item

```bash
curl -X POST 'https://ocfcrews.org/api/inventory-items' \
  -H 'Authorization: JWT <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Paper Towels",
    "category": "category-id",
    "quantity": 24,
    "crew": "crew-id"
  }'
```

### Update a user's role

```bash
curl -X PATCH 'https://ocfcrews.org/api/users/USER_ID' \
  -H 'Authorization: JWT <token>' \
  -H 'Content-Type: application/json' \
  -d '{ "crewRole": "crew_leader" }'
```
