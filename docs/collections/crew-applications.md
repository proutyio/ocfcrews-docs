---
sidebar_position: 3
title: "Crew Applications"
---

# Crew Applications

## Overview

The **Crew Applications** collection stores public applications from people who want to join a crew. Coordinators review applications and can approve, reject, or waitlist applicants. Approved applicants with existing accounts are auto-assigned to the crew; new applicants receive an invite token to create an account.

**Source:** `src/collections/CrewApplications/index.ts`

## Configuration

| Property | Value |
|---|---|
| **Slug** | `crew-applications` |
| **Admin Group** | Crews |
| **Use as Title** | `applicantName` |
| **Default Columns** | applicantName, applicantEmail, crew, status, createdAt |
| **Default Sort** | `-createdAt` |

## Fields

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `applicantName` | text | Yes | maxLength: 100 | Applicant's full name. |
| `applicantEmail` | email | Yes | Indexed | Applicant's email address. |
| `applicantPhone` | text | No | maxLength: 20 | Applicant's phone number. |
| `crew` | relationship | Yes | Relation to `crews`, indexed | The crew being applied to. |
| `status` | select | Yes | Default: `pending`, indexed | Application status. Options: `pending`, `under_review`, `approved`, `rejected`, `waitlisted`. Sidebar position. |
| `message` | textarea | No | maxLength: 2000 | Free-form message ("Why do you want to join?"). |
| `customAnswers` | json | No | — | Answers to crew-defined custom application questions. |
| `agreedToRequirements` | checkbox | No | Default: `false` | Whether the applicant acknowledged the crew's agreements. |
| `coordinatorNotes` | textarea | No | maxLength: 2000 | Internal notes visible only to coordinators and admins. |
| `reviewedBy` | relationship | No | Relation to `users`, read-only | The user who reviewed the application. Auto-set when status changes. |
| `reviewedAt` | date | No | Read-only | Timestamp when the application was reviewed. Auto-set when status changes to approved/rejected/waitlisted. |
| `existingUser` | relationship | No | Relation to `users`, read-only | Set automatically if the applicant was logged in when submitting. |
| `inviteToken` | text | No | maxLength: 64, unique, indexed | Token sent to approved applicants without an account. Hidden in admin. |
| `ip` | text | No | maxLength: 45, read-only | IP address recorded at submission. Admin-only read access. |

## Access Control

| Operation | admin / editor | crew_coordinator | All Others |
|---|---|---|---|
| **Create** | Yes | Yes | Yes (public — API route validates Turnstile) |
| **Read** | Yes | Own crew only | No |
| **Update** | Yes | Own crew only | No |
| **Delete** | Admin only | No | No |

### Field-Level Access

| Field | Read | Update |
|---|---|---|
| `coordinatorNotes` | Admin, coordinator | Admin, coordinator |
| `inviteToken` | Admin only | Admin only |
| `ip` | Admin only | — |
| `reviewedAt` | Everyone with doc access | Denied (auto-set by hook) |

## Hooks

### `beforeValidate`

- **Stamp existingUser**: On create, if the request has an authenticated user, sets `existingUser` to their ID.

### `beforeChange`

- **Stamp review metadata**: When `status` changes to `approved`, `rejected`, or `waitlisted`, auto-sets `reviewedAt` to the current timestamp and `reviewedBy` to the requesting user.

## Application Flow

1. **Submission**: Public POST to `/api/crews/[crewId]/apply` with Turnstile verification, disposable email blocking, and IP rate limiting (3 per 5 min per IP).
2. **Duplicate check**: Only one non-rejected application per email per crew is allowed.
3. **Confirmation email**: `ApplicationReceivedEmail` sent to the applicant (fire-and-forget).
4. **Coordinator notification**: In-app `crew_application` notification sent to crew coordinators (fire-and-forget).
5. **Review**: Coordinators review at `/crews/[slug]/applications` via PATCH `/api/crews/[crewId]/applications/[applicationId]`.
6. **On approval**:
   - **Existing account on unassigned crew**: Auto-creates a `crew-memberships` record and sends a `crew_assignment` notification.
   - **No existing account**: Generates an `inviteToken` and includes an invite link in the approval email. The token is consumed during account creation via the `processInviteToken` hook on the Users collection.
7. **Status email**: `ApplicationStatusEmail` sent for approved, rejected, and waitlisted decisions (fire-and-forget).
8. **Audit log**: Both submission and review actions are logged.

## API Endpoints

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/crews/[crewId]/apply` | POST | Submit a new application | No (Turnstile + CSRF) |
| `/api/crews/[crewId]/applications` | GET | List applications for a crew | Coordinator or admin |
| `/api/crews/[crewId]/applications/[id]` | PATCH | Review an application (change status, add notes) | Coordinator or admin |

## Related

- [Crews Collection](./crews) — `landingPage` group configures the join page and application questions
- [Users Collection](./users) — `processInviteToken` hook handles invite token consumption
- [Crew Memberships Collection](./crew-memberships) — auto-created on approval for existing users
