---
sidebar_position: 7
title: "Payload GraphQL API"
---

# Payload GraphQL API

## Overview

Payload CMS automatically generates a full GraphQL API based on the registered collections and globals. The GraphQL API provides an alternative to the REST API with the ability to request exactly the fields you need in a single query.

## Endpoints

| URL | Description |
|---|---|
| `/api/graphql` | GraphQL API endpoint (accepts POST requests) |
| `/api/graphql-playground` | Interactive GraphQL Playground (disabled in production) |

:::info
The GraphQL Playground is disabled in production via the `disablePlaygroundInProduction: true` configuration in `payload.config.ts`. It is available in development and staging environments for exploring the schema and testing queries.
:::

## Authentication

GraphQL requests use the same authentication mechanisms as the REST API:

### Cookie-Based

Include the Payload session cookie in the request (automatic in browser contexts).

### Token-Based

```
POST /api/graphql
Authorization: JWT <token>
Content-Type: application/json
```

## Querying Collections

Payload generates two query types for each collection:

- **Singular** -- Fetch a single document by ID (e.g., `User`, `Schedule`).
- **Plural** -- Fetch a paginated list with filtering (e.g., `Users`, `Schedules`).

### Query a Single Document

```graphql
query {
  User(id: "user-id") {
    id
    email
    name
    crewRole
    crew {
      id
      name
    }
  }
}
```

### Query a Collection (List)

```graphql
query {
  Users(
    where: { crewRole: { not_equals: "other" } }
    sort: "name"
    limit: 20
    page: 1
  ) {
    docs {
      id
      email
      name
      crewRole
    }
    totalDocs
    totalPages
    page
    hasNextPage
    hasPrevPage
  }
}
```

### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `where` | Object | Filter using Payload query operators |
| `sort` | String | Field to sort by (prefix with `-` for descending) |
| `limit` | Int | Documents per page |
| `page` | Int | Page number |
| `depth` | Int | Relationship population depth |

## Querying Globals

Each global is available as a top-level query:

```graphql
query {
  Header {
    navItems {
      link {
        type
        label
        url
        newTab
        reference {
          ... on Page {
            id
            slug
          }
        }
      }
    }
  }
}
```

```graphql
query {
  Setting {
    shopDisabled
    accountCreationDisabled
  }
}
```

```graphql
query {
  PassSetting {
    crewPassImages {
      year
      image {
        url
        alt
      }
    }
    parkingPassImages {
      year
      image {
        url
        alt
      }
    }
    campingTagImages {
      year
      image {
        url
        alt
      }
    }
  }
}
```

## Mutations

Payload generates create, update, and delete mutations for each collection.

### Create a Document

```graphql
mutation {
  createSchedule(
    data: {
      crew: "crew-id"
      date: "2025-07-20"
      positions: [
        { position: "Gate A" }
        { position: "Gate B" }
      ]
    }
  ) {
    id
    date
    crew {
      name
    }
  }
}
```

### Update a Document

```graphql
mutation {
  updateUser(
    id: "user-id"
    data: {
      crewRole: "crew_leader"
    }
  ) {
    id
    crewRole
  }
}
```

### Delete a Document

```graphql
mutation {
  deleteTimeEntry(id: "entry-id") {
    id
  }
}
```

### Update a Global

```graphql
mutation {
  updateSetting(
    data: {
      shopDisabled: true
    }
  ) {
    shopDisabled
  }
}
```

## Authentication Mutations

```graphql
mutation {
  loginUser(email: "user@example.com", password: "secret") {
    token
    exp
    user {
      id
      email
      name
    }
  }
}
```

```graphql
mutation {
  logoutUser
}
```

```graphql
mutation {
  forgotPasswordUser(email: "user@example.com")
}
```

```graphql
mutation {
  resetPasswordUser(token: "reset-token", password: "newpassword") {
    token
    user {
      id
      email
    }
  }
}
```

## Where Filter Syntax

GraphQL where filters mirror the REST API operators but use GraphQL input types:

```graphql
query {
  Schedules(
    where: {
      AND: [
        { crew: { equals: "crew-id" } }
        { date: { greater_than_equal: "2025-07-01" } }
        { date: { less_than_equal: "2025-07-31" } }
      ]
    }
    sort: "date"
  ) {
    docs {
      id
      date
      positions {
        position
        assignedMembers {
          id
          name
        }
      }
    }
  }
}
```

### Available Operators

| Operator | Description |
|---|---|
| `equals` | Exact match |
| `not_equals` | Not equal |
| `in` | Value in array |
| `not_in` | Value not in array |
| `exists` | Field exists (boolean) |
| `greater_than` | Greater than |
| `greater_than_equal` | Greater than or equal |
| `less_than` | Less than |
| `less_than_equal` | Less than or equal |
| `like` | Case-insensitive substring |
| `contains` | Contains substring |

### Compound Filters

Use `AND` and `OR` for compound conditions:

```graphql
where: {
  OR: [
    { crewRole: { equals: "admin" } }
    { crewRole: { equals: "editor" } }
  ]
}
```

## Available Types

Payload generates GraphQL types for every collection. The key types in OCFCrews include:

| GraphQL Type | Collection Slug | Description |
|---|---|---|
| `User` / `Users` | `users` | User accounts |
| `Crew` / `Crews` | `crews` | Crew organizations |
| `Schedule` / `Schedules` | `schedules` | Shift schedules |
| `TimeEntry` / `TimeEntries` | `time-entries` | Logged hours |
| `InventoryItem` / `InventoryItems` | `inventory-items` | Inventory items |
| `InventoryTransaction` / `InventoryTransactions` | `inventory-transactions` | Stock transactions |
| `Recipe` / `Recipes` | `recipes` | Crew recipes |
| `Post` / `Posts` | `posts` | Blog posts |
| `Email` / `Emails` | `emails` | Email campaigns |
| `Media` / `allMedia` | `media` | Uploaded files |
| `Page` / `Pages` | `pages` | CMS pages |

## Access Control

GraphQL operations are subject to the same access control rules as the REST API. Unauthorized queries will either return `null` for individual documents or filter out inaccessible documents from list queries.

## Introspection

In development, you can use the GraphQL Playground at `/api/graphql-playground` to explore the full schema, including all available types, queries, mutations, and their arguments. The playground provides auto-completion and inline documentation.

Alternatively, use standard GraphQL introspection queries:

```graphql
query {
  __schema {
    types {
      name
      fields {
        name
        type {
          name
        }
      }
    }
  }
}
```
