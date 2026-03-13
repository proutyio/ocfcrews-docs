---
sidebar_position: 11
title: "Schedule Templates"
---

# Schedule Templates

Schedule templates allow coordinators to save reusable shift definitions and apply them to an entire week at once, saving time when the same shift lineup repeats across weeks.

## What a Template Stores

Each template belongs to a single crew and defines one shift's configuration:

| Field | Description |
|-------|-------------|
| `name` | Template name (e.g. "Morning Breakfast Standard") |
| `crew` | Owning crew |
| `shiftType` | `morning`, `afternoon`, or `night` |
| `mealName` | Name of the meal or shift (e.g. "Breakfast", "Lunch") |
| `positions` | Array of position slots (each referencing a Schedule Position) |
| `leads` | Array of user IDs pre-assigned as shift leads |
| `estimatedStart` | Optional start time string (e.g. `"8:00 AM"`) |
| `estimatedEnd` | Optional end time string (e.g. `"11:00 AM"`) |
| `note` | Optional note displayed on the shift |

## Using Templates

### Apply to a Week

From the **Schedule Builder** (`/crew/scheduling`), coordinators can:

1. Select a target week.
2. Click **Apply Template** and choose one or more saved templates.
3. Each template generates a shift for the selected day(s) of the week.
4. Positions, leads, and times from the template are pre-populated.
5. The coordinator can adjust individual shifts after applying.

### Saving a Template

Templates are managed via the admin panel under **Schedule Templates** or through the Schedule Builder UI. To save a new template:

1. Configure a shift with the desired positions, leads, and times.
2. Click **Save as Template** and give it a name.
3. The template appears in the template picker for future weeks.

## Access Control

- **Coordinators and admins** can create, edit, delete, and apply templates for their crew.
- **Crew leaders** can apply existing templates but may not be able to create or delete them (depending on configuration).
- Templates are crew-scoped — coordinators cannot see or use another crew's templates.

## Related

- [Schedule Templates Collection](../../collections/schedule-templates)
- [Scheduling Overview](./overview)
- [Shift Management](./shift-management)
