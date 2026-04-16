# CalBook – Scheduling Platform (Cal.com Clone)

A full-featured scheduling/booking web application built as a Cal.com clone for the SDE Intern Full-Stack Assignment.

---

## Live Demo

> Deploy to Vercel (see deployment section below) and paste your URL here.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|----------------------------------------|
| Framework | **Next.js 14** (App Router, TypeScript) |
| Styling   | **Tailwind CSS** (custom design tokens) |
| Database  | **PostgreSQL** via **Prisma ORM**       |
| Validation| **Zod** (server-side schema validation) |
| Icons     | **Lucide React**                        |
| Dates     | **date-fns**                            |
| Toast     | **react-hot-toast**                     |
| Testing   | **Jest** + **React Testing Library**    |

---

## Features

### Core (All Implemented)

| Feature | Details |
|---------|---------|
| **Event Types** | Create, edit, delete event types with title, description, duration, URL slug, color, and location |
| **Availability** | Set available days, time ranges per day, and timezone. Saved to DB. |
| **Public Booking Page** | Calendar with disabled days, time slots based on availability, double-booking prevention |
| **Booking Form** | Collects name, email, optional notes. Validates inputs. |
| **Confirmation Page** | Shows booking details after successful booking |
| **Bookings Dashboard** | Tabbed view: Upcoming / Past / Cancelled with cancel action |

### Bonus

- Responsive design (mobile, tablet, desktop)
- Date override schema in DB (ready for implementation)
- Cal.com-inspired UI: dark sidebar, color-coded event cards, branded calendar
- Booking conflict detection (prevents double booking)
- Status badges (Confirmed / Cancelled / Completed)
- Copy booking link to clipboard
- Color picker for event types

---

## Project Structure

```
src/
├── app/
│   ├── (admin)/                # Admin layout with sidebar
│   │   ├── layout.tsx          # Sidebar + Toaster wrapper
│   │   ├── event-types/        # /event-types — dashboard
│   │   ├── availability/       # /availability — schedule settings
│   │   └── bookings/           # /bookings — manage bookings
│   ├── [username]/[slug]/      # /:username/:slug — public booking page
│   ├── booking/confirmed/      # /booking/confirmed — confirmation page
│   ├── api/
│   │   ├── event-types/        # CRUD for event types
│   │   ├── availability/       # GET + PUT weekly schedule
│   │   ├── bookings/           # GET list + POST create
│   │   │   └── [id]/cancel/    # POST cancel booking
│   │   ├── public/[username]/[slug]/
│   │   │   └── slots/          # GET available time slots for a date
│   │   └── user/               # GET default user profile
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── booking/                # Calendar, TimeSlots, BookingForm
│   ├── bookings/               # BookingCard
│   ├── event-types/            # EventTypeCard, EventTypeModal
│   ├── layout/                 # Sidebar, AdminLayout
│   └── ui/                     # Modal, Badge, ConfirmDialog, LoadingSpinner
├── lib/
│   ├── prisma.ts               # Singleton Prisma client
│   ├── utils.ts                # Time slots, date helpers, cn()
│   └── constants.ts            # Days, timezones, colors
prisma/
├── schema.prisma               # DB schema
└── seed.ts                     # Sample data
```

---

## Database Schema

```
User ─────────────────────── 1:N ──── EventType
                              1:N ──── Availability
                              1:N ──── DateOverride (bonus)

EventType ────────────────── 1:N ──── Booking
```

### Tables

| Table | Key Columns |
|-------|-------------|
| `users` | id, name, email, username (unique), timezone, bio, avatar |
| `event_types` | id, userId, title, slug, description, duration, color, location, isActive |
| `availability` | id, userId, dayOfWeek (0-6), startTime, endTime, isAvailable |
| `date_overrides` | id, userId, date, isBlocked, startTime, endTime |
| `bookings` | id, uid, eventTypeId, bookerName, bookerEmail, startTime, endTime, status, notes, cancelReason |

---

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or use a cloud DB)
- npm 9+

### 1. Clone and Install

```bash
git clone https://github.com/your-username/calcom-clone.git
cd calcom-clone
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and update `DATABASE_URL`:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/calcom_clone"
```

### 3. Set Up Database

```bash
# Create the database (in psql or pgAdmin)
createdb calcom_clone

# Generate Prisma client
npm run db:generate

# Apply migrations (creates all tables)
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/event-types`.

---

## Key URLs

| URL | Description |
|-----|-------------|
| `http://localhost:3000/event-types` | Admin dashboard – manage event types |
| `http://localhost:3000/availability` | Set your weekly schedule |
| `http://localhost:3000/bookings` | View and manage bookings |
| `http://localhost:3000/john/30min` | **Public booking page** (30-min meeting) |
| `http://localhost:3000/john/60min` | Public booking page (1-hour consultation) |
| `http://localhost:3000/john/15min` | Public booking page (15-min quick chat) |

---

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Test Coverage

| Area | Tests |
|------|-------|
| `src/lib/utils.ts` | `cn()`, `getDurationLabel()`, `isValidSlug()`, `slugify()`, `generateTimeSlots()`, `formatDate()`, `formatTime()` |
| `GET /api/event-types` | Returns list, handles DB error |
| `POST /api/event-types` | Creates type, validates slug/title/duration, handles conflicts |
| `GET /api/availability` | Returns schedule + timezone |
| `PUT /api/availability` | Saves schedule, validates time ranges |
| `GET /api/bookings` | Returns paginated bookings |
| `POST /api/bookings` | Creates booking, validates inputs, prevents double booking |
| `<Calendar />` | Renders, navigation, date selection, disabled days, selected date |
| `<EventTypeCard />` | Renders metadata, dropdown actions, booking count |
| `<Badge />` | All three status variants |
| `<Modal />` | Open/close, Escape key, overlay click, sizes |
| `<TimeSlots />` | Loading state, empty state, renders available slots, handles selection |
| `<BookingCard />` | Renders details, cancel action visibility rules |

---

## Deployment (Vercel)

```bash
# 1. Push to GitHub
git add -A && git commit -m "Initial implementation" && git push

# 2. Import the repo on vercel.com

# 3. Set environment variable:
#    DATABASE_URL = your production PostgreSQL URL (e.g., Neon, Supabase, Railway)

# 4. Add build command override:
#    npm run db:generate && npm run build

# 5. After first deploy, run seed (one-time):
#    vercel env pull .env.local
#    DATABASE_URL=<prod_url> npm run db:seed
```

---

## API Reference

### Event Types

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/event-types` | List all event types |
| POST | `/api/event-types` | Create event type |
| GET | `/api/event-types/:id` | Get single event type |
| PATCH | `/api/event-types/:id` | Update event type |
| DELETE | `/api/event-types/:id` | Delete event type |

### Availability

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/availability` | Get weekly schedule + timezone |
| PUT | `/api/availability` | Replace full schedule |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings?status=upcoming\|past\|cancelled` | List bookings |
| POST | `/api/bookings` | Create a booking |
| POST | `/api/bookings/:id/cancel` | Cancel a booking |

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/:username/:slug` | Get public event type + user |
| GET | `/api/public/:username/:slug/slots?date=YYYY-MM-DD` | Get available time slots |

---

## Assumptions Made

1. **Single admin user**: No authentication. A pre-seeded user (`john`, `john@example.com`) represents the logged-in host. All admin APIs operate on this user.
2. **Timezone display**: Availability is stored and served in the host's configured timezone. Bookers see times in that timezone (simplified — no auto-conversion for the booker's local timezone in this version).
3. **No email notifications**: Booking confirmation is shown on-screen only. A real implementation would send emails via SendGrid/Resend.
4. **Buffer time**: Not implemented in this version (schema supports it via DateOverride).
5. **Past booking auto-completion**: Bookings past their end time are shown as "past" via query filters; status remains `CONFIRMED` in DB until manually changed.

---

## Author

Built for the SDE Intern Full-Stack Assignment.
