---
sidebar_position: 1
title: "Users"
---

# Users

## Overview

The **Users** collection is the authentication collection for OCF Crews. It stores all user accounts including their profile information, crew assignments, roles, pass status tracking, and aggregated hours. This collection powers login, registration, email verification, and password reset flows.

**Source:** `src/collections/Users/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `users` |
| **Auth** | Enabled (cookie-based, 14-day token expiration) |
| **Email Verification** | Enabled (custom email template via `VerifyEmailEmail`) |
| **Forgot Password** | Enabled (custom email template via `ForgotPasswordEmail`, supports `email-templates` collection override) |
| **Admin Group** | Account |
| **Use as Title** | `email` |
| **Default Columns** | email, nickname, name, crew, crewRole, roles, photo |

## Fields

### Top-Level Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `email` | email | Yes | _(auth field)_ | Primary login identifier. Provided by Payload's auth system. |
| `photo` | upload | No | Relation to `avatars` | Rounded profile photo shown on account page and header. Sidebar position. |
| `termsAcceptedAt` | date | No | Day and time picker | Date and time the user agreed to the Terms of Service. Auto-stamped on self-registration. |
| `name` | text | No | minLength: 1, maxLength: 255 | User's full name. |
| `nickname` | text | No | maxLength: 100 | User's preferred display name. |
| `phone` | text | No | maxLength: 30, regex: `/^[+\d][\d ()\-.]{4,28}$/` | Phone number with basic international format validation. |
| `tShirtSize` | select | No | Options: XS, S, M, L, XL, 2XL, 3XL | Crew t-shirt size. |
| `roles` | select (hasMany) | No | Default: `['other']` | Global system roles. Options: `admin`, `editor`, `crew_coordinator`, `crew_elder`, `crew_leader`, `crew_member`, `inventory_admin`, `inventory_editor`, `inventory_viewer`, `shop_admin`, `shop_editor`, `shop_viewer`, `other`. |
| `crew` | relationship | No | Relation to `crews`, indexed | The crew this user belongs to. |
| `crewRole` | select | No | Default: `'other'`, indexed | Crew-level role. Options: `coordinator`, `elder`, `leader`, `member`, `other`. |
| `crewPassEligibility` | select | No | Default: `'not_eligible'` | Pass eligibility type. Options: `not_eligible`, `crew`, `so`, `so_paid`. |
| `onboardingDismissedAt` | date | No | Read-only, sidebar | Timestamp when the user dismissed the Getting Started card. Only self and admin can read. |
| `emailNotifications` | checkbox | No | Default: `true` | Receive email notifications for crew announcements. |
| `smsNotifications` | checkbox | No | Default: `false` | Receive SMS alerts for critical schedule changes. Only shown when phone is set. |
| `crewPaymentStatus` | select | No | Default: `unpaid` | Crew pass payment status: `unpaid`, `paid`. Synced from crew-memberships. |
| `parkingPaymentStatus` | select | No | Default: `unpaid` | Parking pass payment status: `unpaid`, `paid`. Synced from crew-memberships. |
| `wishlist` | relationship (hasMany) | No | Relation to `products` | Saved products for later. Only self and admin can read/update. |
| `magicLinkToken` | text | No | Indexed, hidden in admin | Magic link authentication token. All client access denied. |
| `magicLinkExpiry` | date | No | Hidden in admin | Magic link expiration timestamp. All client access denied. |
| `twoFactorSecret` | text | No | Hidden in admin | Encrypted TOTP secret for 2FA. All client access denied. |
| `twoFactorEnabled` | checkbox | No | Default: `false`, sidebar | Whether 2FA is enabled. Readable by admin and self only. |
| `twoFactorBackupCodes` | json | No | Hidden in admin | Hashed backup codes for 2FA recovery. All client access denied. |
| `lastVerificationEmailSentAt` | date | No | Indexed, hidden in admin | Internal timestamp tracking when the last verification email was sent. |

### `passStatus` Array

Tracks pass and tag receipt status grouped by year.

| Sub-Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `year` | text | Yes | maxLength: 4, regex: `/^\d{4}$/` | Four-digit year (e.g., 2025). |
| `crewPassReceived` | checkbox | No | Default: `false` | Whether the crew pass has been received. |
| `parkingPassReceived` | checkbox | No | Default: `false` | Whether the parking pass has been received. |
| `campingTagReceived` | checkbox | No | Default: `false` | Whether the camping tag has been received. |

### `hoursPerYear` Array

Read-only, automatically calculated from logged time entries.

| Sub-Field | Type | Required | Description |
|---|---|---|---|
| `year` | text | No | Four-digit year. |
| `hours` | number | No | Total hours worked. |
| `daysWorked` | number | No | Number of distinct days worked. |

### Joins

| Join Field | Collection | Foreign Key | Description |
|---|---|---|---|
| `memberships` | `crew-memberships` | `user` | All crew memberships for this user. |
| `timeEntries` | `time-entries` | `user` | All time entries logged by this user. |
| `orders` | `orders` | `customer` | Orders placed by this user. |
| `cart` | `carts` | `customer` | Shopping cart for this user. |
| `addresses` | `addresses` | `customer` | Saved addresses for this user. |

## Access Control

### Collection-Level Access

| Operation | admin | editor | viewer | crew_coordinator | crew_leader | crew_member | other / unauthenticated |
|---|---|---|---|---|---|---|---|
| **Admin Panel** | Yes | Yes | Yes | No | No | No | No |
| **Create** | Yes | Yes | No | No | No | No | Yes (unless `accountCreationDisabled` setting is on) |
| **Read** | All users | Self + own crew | Self + own crew | Self + own crew + unassigned users | Self only | Self only | No |
| **Update** | All users | Self + own crew | Self only | Self + own crew + unassigned users | Self only | Self only | No |
| **Delete** | Yes | No | No | No | No | No | No |

### Field-Level Access

| Field | Create | Read | Update |
|---|---|---|---|
| `photo` | admin only | Everyone | Self, admin, editor, or same-crew coordinator |
| `termsAcceptedAt` | admin only | admin, editor, crew_coordinator | admin, editor |
| `name` | Anyone | Anyone | Self, admin, editor, or same-crew coordinator |
| `nickname` | Anyone | Anyone | Self, admin, editor, or same-crew coordinator |
| `phone` | Anyone | Anyone | Self, admin, editor, or same-crew coordinator |
| `tShirtSize` | admin only | admin, editor, crew_coordinator, or self | Self, admin, editor, or same-crew coordinator |
| `roles` | admin only | admin, editor, self, or crew_coordinator | admin only |
| `crew` | admin, editor, crew_coordinator | Any authenticated user | admin, crew_coordinator |
| `crewRole` | admin only | Any authenticated user | admin, editor, same-crew coordinator (not self) |
| `crewPassEligibility` | admin only | admin, editor, crew_coordinator | admin, editor, crew_coordinator |
| `passStatus` | admin only | admin, editor, crew_coordinator, or self | admin, crew_coordinator, crew_leader |
| `passStatus.crewPassReceived` | _(inherits)_ | _(inherits)_ | admin, crew_coordinator only |
| `passStatus.parkingPassReceived` | _(inherits)_ | _(inherits)_ | admin, crew_coordinator only |
| `passStatus.campingTagReceived` | _(inherits)_ | _(inherits)_ | _(inherits from parent -- leaders can update)_ |
| `hoursPerYear` | Denied | admin, editor, crew_coordinator, or self | Denied |
| `lastVerificationEmailSentAt` | Denied | admin only | Denied |

## Hooks

### `beforeChange` Hooks

1. **Force coordinator crew assignment**: Non-admin coordinators have their `crew` field forced to their own crew ID, preventing them from assigning users to other crews.

2. **Prevent crew removal**: Non-admins cannot remove a crew assignment from a user who already has one. If `data.crew` is `null`/`undefined` on update, the original crew is restored.

3. **Password protection**: Non-admin/editor users cannot change passwords. The `password` and `confirm-password` fields are stripped from the data.

4. **Auto-assign unassigned crew**: On creation, if no crew is set, the system looks up the crew with slug `'unassigned'` and assigns it automatically.

5. **Stamp termsAcceptedAt**: During public self-registration (no `req.user`), automatically sets `termsAcceptedAt` to the current ISO timestamp.

6. **Auto-initialize passStatus**: On creation, if `passStatus` is empty, initializes it with the current year and all pass checkboxes set to `false`.

### `afterChange` Hooks

1. **syncCrewCoordinators**: When a user's `crewRole` changes to or from `'coordinator'`, or their crew assignment changes, the corresponding crew's `coordinators` relationship array is updated. Adds the user to the new crew's coordinators list and/or removes them from the old crew's coordinators list.

2. **auditRoleChange**: Logs an audit trail entry when a user's `roles` or `crewRole` fields change, recording the old and new values.

3. **autoAssignGuidesHook**: When a user is assigned to a crew, automatically creates guide assignment records for any guides in that crew that are configured for auto-assignment.

4. **syncMembership**: Upserts a `crew-memberships` record to keep it in sync with the user's `crew`, `crewRole`, `crewPassEligibility`, and pass status fields. Uses the `skipMembershipSync` context guard to prevent infinite loops with the CrewMemberships `afterChange` hook.

### `afterDelete` Hooks

1. **syncCrewCoordinatorsOnDelete**: When a user with `crewRole: 'coordinator'` is deleted, removes them from their crew's `coordinators` array.

2. **cleanupOnUserDelete**: Cascading cleanup when a user is deleted. Deletes records from 12 collections:
   - `passkeys`, `crew-memberships`, `push-subscriptions`, `chat-read-state`, `shift-waitlist`, `availability`, `stock-notifications`, `notifications`, `guide-bookmarks`, `recipe-favorites`, `event-rsvps`, `guide-read-receipts`
   - Cancels pending `shift-swaps` (sets status to `cancelled`)
   - Uses `$pull` to remove the user from `chat-channels.allowedUsers` arrays
   - Uses `$pull` to remove the user from future `schedules` position `assignedMembers` arrays
   - All operations run via `Promise.allSettled` (fire-and-forget) so partial failures don't block deletion

### `afterRead` Hooks

1. **Auto-verify legacy users**: Users created before email verification was enabled may have `_verified` as `null`/`undefined`. This hook patches the in-memory doc to `_verified: true` (so JWT validation succeeds immediately) -- patches in-memory only (no background DB write to avoid MongoDB write-conflict races). The DB value gets set permanently the next time the user is updated through any code path.

### Field-Level Hooks

1. **`roles.beforeChange` -- ensureFirstUserIsAdmin**: If no users exist in the database (first registration), the `admin` role is automatically added to the roles array.

2. **`roles.beforeChange` -- prevent non-admin role escalation**: Non-admin users cannot assign the `admin` role. The `admin` value is filtered out of the roles array for non-admin requestors.

3. **`crewRole.beforeChange` -- syncCrewRole**: When `crewRole` changes, the corresponding global role is synchronized in the `roles` array. All crew-related global roles (`crew_coordinator`, `crew_elder`, `crew_leader`, `crew_member`) are removed and the new matching role is added. Maps: `coordinator` to `crew_coordinator`, `elder` to `crew_elder`, `leader` to `crew_leader`, `member` to `crew_member`.

## Multi-Crew Memberships

Users can belong to multiple crews via the `crew-memberships` collection, but only one membership is active at a time. The `user.crew` field always points to the user's currently active crew.

- **Switching crews**: The `/api/crew/switch-crew` endpoint deactivates all memberships, activates the target, and syncs fields (crew, crewRole, pass eligibility) to the user record.
- **Pass eligibility exclusivity**: A user can only hold non-`not_eligible` pass eligibility on one crew at a time. This is enforced at the crew-memberships level.
- **Bidirectional sync**: Changes to user fields trigger membership upserts (`syncMembership` afterChange hook), and membership activation syncs fields back to the user record. Context guards (`skipMembershipSync` / `skipUserSync`) prevent infinite loops.
- **Crew Switcher UI**: Available in the header for users with multiple memberships.

See the [Crew Memberships](/docs/collections/crew-memberships) collection reference for full details.

## Relationships

| Related Collection | Field | Direction | Description |
|---|---|---|---|
| `avatars` | `photo` | Users --> Avatars | Profile photo upload |
| `crews` | `crew` | Users --> Crews | Active crew assignment |
| `crew-memberships` | *(reverse)* | Crew Memberships --> Users | All crew memberships for this user |
| `time-entries` | `timeEntries` | Time Entries --> Users (join) | User's logged hours |
| `orders` | `orders` | Orders --> Users (join) | User's orders |
| `carts` | `cart` | Carts --> Users (join) | User's shopping cart |
| `addresses` | `addresses` | Addresses --> Users (join) | User's saved addresses |

## Indexes

| Field | Type |
|---|---|
| `crew` | Standard |
| `crewRole` | Standard |
| `lastVerificationEmailSentAt` | Standard |
