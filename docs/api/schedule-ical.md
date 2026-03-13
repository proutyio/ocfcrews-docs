---
sidebar_position: 5
title: "Schedule iCal Export API"
---

# Schedule iCal Export API

## Overview

The iCal endpoint returns an `.ics` file containing all shifts where the authenticated user is assigned (as a lead or in a position). This file can be subscribed to by Google Calendar, Apple Calendar, Outlook, or any iCal-compatible app.

**Endpoint:** `GET /api/schedule/ical`

**Source:** `src/app/(app)/api/schedule/ical/route.ts`

## Request

### Headers

| Header | Required | Description |
|---|---|---|
| `Cookie` | Yes | Payload session cookie (browser) |
| `Authorization` | Alt | `JWT <token>` for programmatic access |

No query parameters — returns all assigned shifts for the authenticated user.

## Authentication & Authorization

Any authenticated crew member can access their own iCal feed. No coordinator role required.

## Response

### Success Response

**Status:** `200 OK`

**Content-Type:** `text/calendar; charset=utf-8`

**Content-Disposition:** `attachment; filename=schedule.ics`

The response body is a valid iCalendar (RFC 5545) document:

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OCF Crews//Schedule//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:OCF Crews Schedule
BEGIN:VEVENT
UID:<schedule-id>@ocfcrews
DTSTART:20260301T100000
DTEND:20260301T140000
SUMMARY:Morning
DESCRIPTION:Shift: morning
END:VEVENT
...
END:VCALENDAR
```

Each `VEVENT` corresponds to a shift the user is assigned to (as lead or position member).

| Field | Source |
|---|---|
| `SUMMARY` | `meal \|\| shiftType \|\| 'Shift'` (just the meal name, shift type, or fallback "Shift" -- not a composite with position) |
| `DTSTART` | Schedule date + `estimatedStartTime` (timed event) or date only (all-day event if times not set) |
| `DTEND` | Schedule date + `estimatedEndTime` (timed event) or date only (all-day event) |
| `UID` | `{scheduleId}@ocfcrews` |
| `DESCRIPTION` | Shift note and/or shift type |

### All-Day Events

When `estimatedStartTime` and `estimatedEndTime` are not set on a schedule, the event is emitted as an all-day event using `DTSTART;VALUE=DATE` and `DTEND;VALUE=DATE` format (no time component).

### Draft Week Filtering

Shifts in unpublished (draft) schedule weeks are **filtered out** for non-privileged users. Only users with roles `admin`, `editor`, `crew_coordinator`, `crew_leader`, or `crew_elder` can see draft week shifts in their iCal feed. This prevents regular members from seeing shifts that have not yet been finalized.

### Error Responses

| Status | Error | Cause |
|---|---|---|
| 401 | Unauthorized | Not authenticated |
| 403 | No crew | User has no crew assignment |

## Google Calendar Integration

To subscribe your OCF schedule to Google Calendar:

1. Get the iCal endpoint URL for your server:
   ```
   https://your-ocfcrews.vercel.app/api/schedule/ical
   ```

2. In Google Calendar: **Other Calendars → From URL** → paste the URL.

3. For authentication, Google Calendar doesn't support custom headers. Options:
   - Use the browser session cookie (works in supported apps)
   - Generate a long-lived JWT and embed in a proxy URL

> **Note:** Google Calendar polls subscribed calendars every 8–24 hours. For real-time updates, members should check the app directly.
