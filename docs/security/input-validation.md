---
sidebar_position: 3
title: "Input Validation"
---

# Input Validation

OCFCrews validates user inputs at multiple layers: Payload CMS field-level constraints, custom field validators, API route validation, and collection hook guards. This multi-layered approach ensures that invalid data is caught regardless of how it enters the system.

## Payload Field Constraints

Every collection defines explicit constraints on its fields. These are enforced by Payload CMS before any data reaches the database.

### Common Constraint Patterns

| Constraint | Usage | Example |
|-----------|-------|---------|
| `required: true` | Mandatory fields | `name`, `email`, `date`, `crew` |
| `maxLength` | String length cap | Crew name: 100, description: 2000, email subject: 500 |
| `minLength` | Minimum string length | Recipe name: 1, inventory package name: 1 |
| `min` / `max` | Numeric range | Hours: 0-24, servings: min 1, quantity: min 0 |
| `unique: true` | Duplicate prevention | Crew slug, post slug, email template key |
| `index: true` | Query performance + constraint support | crew, date, user, category fields |
| `maxRows` | Array length cap | Ingredients: 200, steps: 200, equipment: 50 |

### Examples from Collections

```typescript
// Time entry hours (TimeEntries collection)
{
  name: 'hours',
  type: 'number',
  required: true,
  min: 0,
  max: 24,
}

// Crew name (Crews collection)
{
  name: 'name',
  type: 'text',
  required: true,
  maxLength: 100,
}

// Inventory transaction quantity
{
  name: 'quantity',
  type: 'number',
  required: true,
  min: -99999,
  max: 99999,
}
```

## Custom Field Validators

Several fields use custom `validate` functions for more specific validation logic.

### Date Validation (YYYY-MM-DD)

The `time-entries` collection validates dates using a regex pattern combined with `Date` parsing:

```typescript
validate: (value: string | null | undefined) => {
  if (!value) return 'Date is required'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Date must be in YYYY-MM-DD format'
  if (isNaN(new Date(value).getTime())) return 'Date is invalid'
  return true
}
```

This ensures the date string matches the expected format and actually represents a valid calendar date.

### Phone Number Validation

The `users` collection validates phone numbers with a permissive international pattern:

```typescript
validate: (value: string | null | undefined) => {
  if (!value) return true  // optional field
  return /^[+\d][\d ()\-.]{4,28}$/.test(value) || 'Enter a valid phone number.'
}
```

This allows:
- International format with leading `+`
- Digits, spaces, parentheses, hyphens, and dots
- Length between 5 and 29 characters

### Slug Validation

Both `crews` and `posts` validate slug fields to ensure URL-safe values:

```typescript
validate: (value: string | null | undefined) => {
  if (!value) return true
  if (!/^[a-z0-9-]+$/.test(value))
    return 'Slug may only contain lowercase letters, numbers, and hyphens'
  return true
}
```

### Year Validation

The `pass-settings` global and the `passStatus` array in `users` both validate year fields:

```typescript
validate: (value: string | null | undefined) => {
  if (!value) return 'Year is required'
  if (!/^\d{4}$/.test(value)) return 'Year must be a 4-digit number (e.g. 2025)'
  return true
}
```

### Email Subject and Header Field Validation

Email-related fields (`subject`, `fromName`, `headline`, `ctaText`) reject line breaks to prevent header injection:

```typescript
validate: (value: string | null | undefined) => {
  if (!value) return true
  if (/[\r\n]/.test(value)) return 'Subject may not contain line breaks.'
  return true
}
```

### CTA URL Validation

The `ctaUrl` field on emails validates that URLs use only `http` or `https` protocols, preventing `javascript:` and other dangerous protocol schemes:

```typescript
validate: (value: string | null | undefined) => {
  if (!value) return true
  try {
    const parsed = new URL(value)
    if (!['https:', 'http:'].includes(parsed.protocol)) {
      return 'URL must use http or https.'
    }
    return true
  } catch {
    return 'Enter a valid URL (e.g. https://example.com).'
  }
}
```

## API Route Validation

Custom API routes perform additional server-side validation before processing requests.

### Log Hours Route (`/api/schedule/log-hours`)

```typescript
// Type check + range + finite check
if (typeof hours !== 'number' || !isFinite(hours) || hours < 0 || hours > 24) {
  return NextResponse.json({ error: 'hours must be between 0 and 24' }, { status: 400 })
}

// Half-hour increment check
if (Math.round(hours * 2) / 2 !== hours) {
  return NextResponse.json({ error: 'hours must be in 0.5-hour increments' }, { status: 400 })
}

// Date format validation using regex
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
if (date && (!DATE_RE.test(date) || isNaN(new Date(date).getTime()))) {
  return NextResponse.json({ error: 'date must be a valid date in YYYY-MM-DD format' }, { status: 400 })
}
```

Key validation features:
- **`isFinite` check**: Rejects `NaN`, `Infinity`, and `-Infinity` values
- **0.5-hour increments**: Uses `Math.round(hours * 2) / 2` to verify granularity
- **Future date prevention**: Cannot log hours for dates after today

### Sign-Up Route (`/api/schedule/sign-up`)

```typescript
// Action whitelist
if (!['join', 'leave', 'remove'].includes(action)) {
  return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 })
}

// Integer check for position index
typeof positionIndex !== 'number' || !Number.isInteger(positionIndex)

// Range check against actual positions array
if (positionIndex < 0 || positionIndex >= positions.length) {
  return NextResponse.json({ error: 'Invalid position index' }, { status: 400 })
}
```

### Resend Verification Route (`/api/resend-verification`)

```typescript
// Type + format validation
const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : null
if (!email) {
  return NextResponse.json({ error: 'email is required' }, { status: 400 })
}
```

## Rich Text Validation

The Lexical rich text editor is configured with a controlled feature set to prevent arbitrary HTML injection. The global editor configuration explicitly lists allowed features:

```typescript
editor: lexicalEditor({
  features: () => {
    return [
      UnderlineFeature(),
      BoldFeature(),
      ItalicFeature(),
      OrderedListFeature(),
      UnorderedListFeature(),
      LinkFeature({ enabledCollections: ['pages'] }),
      IndentFeature(),
      EXPERIMENTAL_TableFeature(),
    ]
  },
})
```

Key security aspects:
- **No raw HTML block**: Users cannot inject arbitrary HTML
- **Limited link targets**: Links are restricted to the `pages` collection for internal links
- **No script support**: No code block or raw JavaScript features are enabled
- **Per-collection overrides**: Posts use a slightly expanded feature set (headings, strikethrough, checklist, image upload) but still no arbitrary HTML

## Collection Hook Guards

Beyond field-level validation, `beforeChange` hooks enforce business logic constraints:

| Guard | Collection | Description |
|-------|-----------|-------------|
| Crew isolation | Schedules, TimeEntries, Inventory* | Non-admins cannot write data for other crews |
| Past-shift prevention | sign-up route | Cannot modify sign-ups for shifts before today |
| Time entry age limit | TimeEntries | Cannot create/edit entries older than 14 days (non-admin) |
| Shift assignment check | TimeEntries | On create, verifies user is assigned to the linked shift |
| Insufficient stock guard | InventoryTransactions | Prevents transactions that would reduce quantity below zero |
| Crew match validation | InventorySubCategories | Sub-category crew must match parent category crew |
| Recipe ingredient validation | Recipes | Each ingredient must have either an inventory item or a custom name |
| Instruction requirement | Recipes | Steps or freeform instructions must be non-empty |
