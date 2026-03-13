---
sidebar_position: 20
title: "Integration Examples"
---

# Integration Examples

Practical code examples for common external integrations with OCFCrews.

## Authentication Helper

All examples share this base authentication flow. Complete this first, then use the token in subsequent requests.

```typescript
// TypeScript / JavaScript
const BASE_URL = 'https://your-ocfcrews.vercel.app'

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`Login failed: ${res.status}`)
  const { token } = await res.json()
  return token
}

function authedFetch(path: string, token: string, options: RequestInit = {}) {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
      ...options.headers,
    },
  })
}
```

---

## 1. Google Calendar Sync

Subscribe your personal OCFCrews schedule to Google Calendar using the iCal endpoint.

### Browser (Easiest)

While logged in to OCFCrews, open a new tab and navigate to:

```
https://your-ocfcrews.vercel.app/api/schedule/ical
```

The browser will download a `.ics` file. Open it to import shifts into any calendar app.

### Google Calendar Subscription

For automatic updates, subscribe Google Calendar to the feed:

1. Get your JWT token (from browser DevTools > Application > Cookies > `payload-token`, or via the login API)
2. In Google Calendar: click **+** next to "Other calendars" → **From URL**
3. Paste the URL (note: Google Calendar may not support JWT auth headers — this works best in apps that let you set headers, or use session cookie flows)

> **Tip:** For fully automated calendar sync, a server-side proxy that authenticates and forwards the iCal feed is more reliable than embedding credentials in calendar URLs.

### Server-Side iCal Proxy (Node.js)

```typescript
import express from 'express'

const app = express()
const BASE_URL = 'https://your-ocfcrews.vercel.app'

app.get('/ical/:userId', async (req, res) => {
  // Store tokens securely — this is just an example
  const token = process.env[`TOKEN_${req.params.userId}`]
  if (!token) return res.status(401).send('Unauthorized')

  const icalRes = await fetch(`${BASE_URL}/api/schedule/ical`, {
    headers: { Authorization: `JWT ${token}` },
  })

  res.setHeader('Content-Type', 'text/calendar')
  res.send(await icalRes.text())
})

app.listen(3001)
```

Subscribe Google Calendar to `http://your-proxy.example.com/ical/yourUserId`.

---

## 2. JavaScript / TypeScript Client

A full example of authenticating and querying schedules for a custom dashboard.

```typescript
const BASE_URL = 'https://your-ocfcrews.vercel.app'

async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  return { token: data.token as string, user: data.user }
}

async function getUpcomingSchedules(token: string, crewId: string) {
  const today = new Date().toISOString().slice(0, 10)
  const url = new URL(`${BASE_URL}/api/schedules`)
  url.searchParams.set('where[crew][equals]', crewId)
  url.searchParams.set('where[date][greater_than_equal]', today)
  url.searchParams.set('sort', 'date')
  url.searchParams.set('limit', '10')
  url.searchParams.set('depth', '1')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `JWT ${token}` },
  })
  return res.json()
}

// Usage
const { token, user } = await login('coordinator@example.com', 'password')
const crewId = typeof user.crew === 'object' ? user.crew.id : user.crew
const { docs: schedules } = await getUpcomingSchedules(token, crewId)
console.log('Upcoming shifts:', schedules.map((s: any) => s.date))
```

---

## 3. Python Script — Hours Export

Download and parse the hours CSV for reporting or payroll.

```python
import requests
import csv
import io
from datetime import datetime

BASE_URL = "https://your-ocfcrews.vercel.app"

def login(email: str, password: str) -> str:
    """Authenticate and return a JWT token."""
    res = requests.post(f"{BASE_URL}/api/users/login", json={
        "email": email,
        "password": password,
    })
    res.raise_for_status()
    return res.json()["token"]

def download_hours_csv(token: str, year: int, month: int) -> list[dict]:
    """Download and parse the hours export CSV."""
    res = requests.get(
        f"{BASE_URL}/api/export/hours",
        params={"year": year, "month": month},
        headers={"Authorization": f"JWT {token}"},
    )
    res.raise_for_status()

    reader = csv.DictReader(io.StringIO(res.text))
    return list(reader)

def main():
    token = login("coordinator@example.com", "your-password")

    now = datetime.now()
    rows = download_hours_csv(token, now.year, now.month)

    print(f"Hours for {now.strftime('%B %Y')}:")
    print(f"{'Member':<25} {'Date':<12} {'Hours':>6}")
    print("-" * 45)
    for row in rows:
        print(f"{row['Member Name']:<25} {row['Date']:<12} {row['Hours']:>6}")

    total = sum(float(r['Hours']) for r in rows)
    print(f"\nTotal: {total:.1f} hours across {len(rows)} entries")

if __name__ == "__main__":
    main()
```

---

## 4. Slack Bot Integration

Post upcoming shift summaries to a Slack channel.

```typescript
import { WebClient } from '@slack/web-api'

const BASE_URL = 'https://your-ocfcrews.vercel.app'
const slack = new WebClient(process.env.SLACK_TOKEN)
const SLACK_CHANNEL = '#crew-updates'

interface Schedule {
  id: string
  date: string
  meal: string
  shiftType: string
  positions: Array<{
    position: { name: string }
    assignedMembers: Array<{ name: string }>
  }>
}

async function postWeeklySchedule(ocfToken: string, crewId: string) {
  // Get schedules for the next 7 days
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  const url = new URL(`${BASE_URL}/api/schedules`)
  url.searchParams.set('where[crew][equals]', crewId)
  url.searchParams.set('where[date][greater_than_equal]', today.toISOString().slice(0, 10))
  url.searchParams.set('where[date][less_than_equal]', nextWeek.toISOString().slice(0, 10))
  url.searchParams.set('sort', 'date')
  url.searchParams.set('depth', '2')
  url.searchParams.set('limit', '20')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `JWT ${ocfToken}` },
  })
  const { docs: schedules }: { docs: Schedule[] } = await res.json()

  if (schedules.length === 0) {
    await slack.chat.postMessage({
      channel: SLACK_CHANNEL,
      text: 'No shifts scheduled for the next 7 days.',
    })
    return
  }

  const lines = schedules.map((s) => {
    const date = new Date(s.date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    const positions = s.positions
      .map((p) => {
        const names = p.assignedMembers.map((m) => m.name).join(', ') || '_Open_'
        return `  • ${p.position.name}: ${names}`
      })
      .join('\n')
    return `*${date} — ${s.meal || s.shiftType}*\n${positions}`
  })

  await slack.chat.postMessage({
    channel: SLACK_CHANNEL,
    text: `📅 *Upcoming Shifts (next 7 days)*\n\n${lines.join('\n\n')}`,
    mrkdwn: true,
  })
}

// Run it
const token = await login('coordinator@example.com', 'password')
const { user } = await fetch(`${BASE_URL}/api/users/me`, {
  headers: { Authorization: `JWT ${token}` },
}).then((r) => r.json())

const crewId = typeof user.crew === 'object' ? user.crew.id : user.crew
await postWeeklySchedule(token, crewId)
```
