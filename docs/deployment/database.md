---
sidebar_position: 5
title: "PostgreSQL Database"
---

# PostgreSQL Database

OCFCrews uses **PostgreSQL** as its primary database, hosted on **Supabase** and connected through Payload CMS's official `@payloadcms/db-postgres` adapter (which uses Drizzle ORM under the hood).

## Database Configuration

**File:** `src/payload.config.ts`

```ts
import { postgresAdapter } from '@payloadcms/db-postgres'

db: postgresAdapter({
  pool: {
    connectionString: process.env.DATABASE_URL,
  },
}),
```

The configuration is intentionally minimal — the PostgreSQL adapter handles connection pooling, schema management, and migrations automatically.

## Connection String Format

### Local Development

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ocfcrews
```

### Supabase (Production)

Use the **Transaction** pooler URL (port 6543) for serverless compatibility:

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@[region].pooler.supabase.com:6543/postgres
```

**Example:**

```env
DATABASE_URL=postgresql://postgres.abc123:secretpassword@us-east-1.pooler.supabase.com:6543/postgres
```

## Supabase (Recommended for Production)

[Supabase](https://supabase.com) is the recommended hosted PostgreSQL service for production deployments.

### Why Supabase?

- **Managed PostgreSQL** — Automatic backups, monitoring, and security patches
- **Connection pooling** — Built-in Supavisor pooler supports thousands of concurrent connections
- **No IOPS cap** — No throttling under load
- **Dashboard** — SQL editor, table viewer, and real-time logs
- **Pro plan** — $25/mo for dedicated compute, 8GB storage, daily backups

### Recommended Setup

1. **Create a Supabase project** in the same region as your Vercel functions (e.g., `us-east-1`)
2. **Use the Transaction pooler URL** (port 6543) — required for serverless environments like Vercel
3. **Get the connection string** from Settings > Database > Connection string > Transaction
4. **Use separate projects** for dev and production environments

## Indexed Fields

Payload CMS supports field-level indexing via the `index: true` property. The PostgreSQL adapter auto-creates indexes for relationship foreign keys and unique constraints. Additional compound indexes are defined in `src/utilities/ensureIndexes.ts`.

### Users Collection

| Field | Type | Purpose |
|-------|------|---------|
| `crew` | relationship | Crew isolation queries |
| `crewRole` | select | Role-based filtering |
| `lastVerificationEmailSentAt` | date | Rate-limiting email verification |

### Schedules Collection

| Field | Type | Purpose |
|-------|------|---------|
| `crew` | relationship | Crew isolation |
| `date` | date | Date range queries |

### Time Entries Collection

| Field | Type | Purpose |
|-------|------|---------|
| `user` | relationship | Per-user hour lookups |
| `schedule` | relationship | Schedule-entry joins |
| `crew` | relationship | Crew isolation |
| `date` | text | Date-based queries |

### Inventory Items Collection

| Field | Type | Purpose |
|-------|------|---------|
| `storageType` | select | Filter by storage type |
| `useByDate` | date | Expiration queries |
| `category` | relationship | Category filtering |
| `subCategory` | relationship | Subcategory filtering |
| `crew` | relationship | Crew isolation |

### Inventory Categories Collection

| Field | Type | Purpose |
|-------|------|---------|
| `crew` | relationship | Crew isolation |

### Inventory Subcategories Collection

| Field | Type | Purpose |
|-------|------|---------|
| `category` | relationship | Parent category lookup |
| `crew` | relationship | Crew isolation |

### Inventory Transactions Collection

| Field | Type | Purpose |
|-------|------|---------|
| `item` | relationship | Item transaction history |
| `crew` | relationship | Crew isolation |
| `user` | relationship | User activity tracking |

### Inventory Media Collection

| Field | Type | Purpose |
|-------|------|---------|
| `crew` | relationship | Crew isolation |

### Schedule Positions Collection

| Field | Type | Purpose |
|-------|------|---------|
| `crew` | relationship | Crew isolation |

### Posts Collection

| Field | Type | Purpose |
|-------|------|---------|
| `crew` | relationship | Crew isolation |

### Recipes Collection

| Field | Type | Purpose |
|-------|------|---------|
| `group` | select | Recipe group filtering |
| `status` | select | Status filtering |
| `crew` | relationship | Crew isolation |

### Recipe Favorites Collection

| Field | Type | Purpose |
|-------|------|---------|
| `user` | relationship | Per-user favorite lookups |
| `recipe` | relationship | Recipe popularity |
| `crew` | relationship | Crew isolation |

### Recipe Tags Collection

| Field | Type | Purpose |
|-------|------|---------|
| `crew` | relationship | Crew isolation |

### Recipe Sub Groups Collection

| Field | Type | Purpose |
|-------|------|---------|
| `crew` | relationship | Crew isolation |

## Common Index Pattern

The most common indexed field across collections is `crew` (relationship to the `crews` collection). This supports the **crew isolation** access control pattern where every query filters by the current user's crew:

```ts
// Access control pattern used across collections
where: {
  crew: { equals: userCrewId }
}
```

The index on `crew` ensures these filtered queries remain fast even as the database grows.

## Database Maintenance

### Backups & Disaster Recovery

#### Supabase Backups

Supabase Pro provides automatic daily backups with point-in-time recovery (PITR):

1. **Daily backups** are enabled by default on Pro plans
2. **PITR** is available as an add-on for continuous backup
3. **Restore methods:**
   - **Point-in-time:** Restore to any point within the retention window
   - **Download backup:** Download a SQL dump for local analysis

#### Cloudflare R2 Media Backups

R2 stores all uploaded media (avatars, chat attachments, guide files, inventory photos). R2 provides 99.999999999% durability by default. For additional safety:

- Enable **Object Lock** on the R2 bucket to prevent accidental deletion
- Periodically sync the bucket to a secondary location using `rclone` or the S3-compatible API

#### Manual Database Backup

```bash
# Manual backup using pg_dump
pg_dump "$DATABASE_URL" > ./backup-$(date +%Y%m%d).sql

# Restore to a local instance
psql "postgresql://postgres:password@localhost:5432/ocfcrews" < ./backup-20260305.sql
```

#### Full Recovery Procedure

If you need to rebuild the entire environment:

1. **Vercel:** Redeploy from the `main` branch — all code and configuration is in git
2. **Database:** Restore from Supabase backup or `pg_dump` snapshot
3. **R2 media:** Already durable; if needed, restore from backup sync
4. **Environment variables:** Stored in Vercel project settings — document them in a secure location (1Password, etc.)
5. **DNS:** Managed via Cloudflare or your registrar — no recovery needed unless domain changes
6. **Cron secrets:** Rotate `CRON_SECRET` and update in Vercel env vars
7. **Stripe/Resend:** API keys are in provider dashboards — regenerate if compromised

#### Recovery Time Objectives

| Component | RTO | RPO |
|-----------|-----|-----|
| Application (Vercel) | ~5 min (git push) | 0 (code is in git) |
| Database (Supabase) | ~15 min (PITR restore) | Seconds (with PITR add-on) |
| Media (R2) | 0 (always available) | 0 (11 nines durability) |
| Email (Resend) | ~5 min (API key rotation) | N/A |

### Monitoring

- **Supabase:** Built-in query performance monitoring, connection pooling stats, and real-time logs
- **Local:** Use `pg_stat_statements` extension for query analysis

### Performance Tips

1. **Region alignment** — Keep your Supabase project and Vercel functions in the same cloud region
2. **Connection pooling** — Use the Transaction pooler URL (port 6543) for serverless; Supavisor handles pooling automatically
3. **Index coverage** — Ensure all frequently queried fields have indexes (Payload's `index: true` handles this)
4. **Compound indexes** — Additional indexes defined in `src/utilities/ensureIndexes.ts` run on first deploy with `RUN_MIGRATIONS=true`
5. **Query optimization** — Use `select` and minimal `depth` on all Payload queries to reduce data transfer
