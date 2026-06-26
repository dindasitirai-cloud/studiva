# Studiva Website

Full-stack website for **Studiva**, an inclusive education school in Bukittinggi, covering both
the Tier 1 school program and the Tier 2 national digital platform.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS (Create React App)
- **Backend:** Node.js + Express.js + TypeScript
- **Database:** SQLite3
- **Auth:** JWT (JSON Web Tokens), bcrypt password hashing
- **Payments:** Stripe Checkout (subscriptions)

## Project Structure

```
studiva-website/
├── frontend/   # React app (pages, components, auth context)
├── backend/    # Express API (routes, models, middleware)
└── database/   # schema.sql (reference copy of the SQLite schema)
```

## Getting Started

### 1. Backend

```bash
cd backend
npm install
npm run dev      # starts the API on http://localhost:5001 and creates database.db
npm run seed      # inserts sample users, children, updates, and resources (run once)
```

The backend reads config from `backend/.env`:

```
DATABASE_URL=./database.db
JWT_SECRET=your-secret-key-change-this
PORT=5001
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_REPLACE_ME
STRIPE_PUBLIC_KEY=pk_test_REPLACE_ME
STRIPE_WEBHOOK_SECRET=whsec_REPLACE_ME
PSIKOLOG_WHATSAPP_NUMBER=6281211470407
PSIKOLOG_NAME=Fitri Effendy
CONSULTATION_ONLINE_PRICE=300000
CONSULTATION_OFFLINE_PRICE=350000
CONSULTATION_ONLINE_DURATION=50
CONSULTATION_OFFLINE_DURATION=60
```

Note: port 5000 is used by macOS's AirPlay Receiver by default, so this project uses 5001 instead.

`STRIPE_SECRET_KEY`/`STRIPE_PUBLIC_KEY`/`STRIPE_WEBHOOK_SECRET` are placeholders. Payment endpoints
will return an "Invalid API Key" error until you replace them with real Stripe **test mode** keys
(see Payments &amp; Subscriptions below).

### 2. Frontend

```bash
cd frontend
npm install
npm start         # starts the React app on http://localhost:3000
```

The frontend reads config from `frontend/.env`:

```
REACT_APP_API_URL=http://localhost:5001
```

## Test Credentials

| Role           | Email               | Password            |
|----------------|---------------------|----------------------|
| Parent         | test@studiva.id     | password123          |
| Teacher        | teacher@studiva.id  | password123          |
| Admin          | admin@studiva.id    | password123          |
| Admin / Expert | fitri@studiva.id    | Studiva@Fitri2026!   |

The seed script creates the parent's child **Rafa** (age 6) and a second child **Maya** (age 7),
both assigned to the teacher account, plus 5 sample daily updates, 10 sample resources, and an
**active Tier 1 subscription** for the parent and teacher accounts (so they can access their
dashboards out of the box — see Payments &amp; Subscriptions below for why this is needed). Admin
accounts have no subscription requirement. `fitri@studiva.id` is the Psikolog Fitri Effendy
account — see "Psikolog Fitri Admin/Expert Role" below.

## API Endpoints

- `POST /api/auth/signup`, `/login`, `/logout`, `GET /api/auth/verify`
- `GET/PUT /api/users/me`, `/api/users/:id`
- `GET/POST/PUT /api/children`, `/api/children/:id` (requires active subscription, Tier 1 or Tier 2)
- `GET/POST /api/updates`, `DELETE /api/updates/:id`, `POST /api/updates/insights` (requires active **Tier 1** subscription specifically — see Tier Differentiation below)
- `GET /api/resources`, `/api/resources?category=`, `/api/resources/:id`, `POST /api/resources` (admin only — public, no subscription required)
- `POST /api/payments/create-checkout-session`, `POST /api/payments/webhook`
- `GET /api/subscriptions/check`, `GET /api/subscriptions/my-subscription`, `POST /api/subscriptions/cancel`
- `GET /api/consultations/config`, `/available-slots`, `POST /request`, `GET /my-bookings`, `DELETE /:id` (all require active subscription, Tier 1 or Tier 2)
- `GET /api/admin/consultations?status=`, `POST /:id/confirm`, `POST /:id/complete` (admin only)
- `POST /api/enrollment/request`, `GET /api/enrollment/my-requests` (parent — request Tier 1 enrollment for a child)
- `GET /api/admin/enrollment-requests?status=`, `POST /:id/approve`, `POST /:id/reject`, `GET /api/admin/teachers` (admin only)
- `GET /api/community/discussions`, `GET /api/community/discussions/:id`, `POST /api/community/discussions` (requires active subscription; tier1/tier2 categories further restricted), `PATCH`/`DELETE /:id`, `POST /:id/like`, `/:id/mark-solved`
- `POST /api/community/discussions/:id/comments` (requires active subscription), `PATCH`/`DELETE /api/community/comments/:id`, `POST /:id/like`, `/:id/mark-helpful`
- `GET /api/community/categories`, `/tags`, `/search?q=`, `/stats`, `/stats/user`, `/myactivity`
- `GET /api/community/profile/:userId`, `PATCH /profile/me`, `GET /profiles/champions`
- `POST /api/community/report`
- `POST /api/admin/community/discussions/:id/pin`, `DELETE /:id`, `DELETE /api/admin/community/comments/:id`, `GET /api/admin/community/reports?status=`, `PATCH /:id`, `POST /api/admin/community/champions/:userId` (admin only)
- `GET /api/admin-profiles/featured`, `/:userId` (public — no auth, used on About/Consultation)
- `POST /api/admin/community/experts/:userId`, `GET /api/admin/users`, `GET /api/admin/dashboard-stats` (admin only)
- `POST /api/admin/consultations/:id/complete` now accepts `{ outcomeNotes }` in the body

## Payments & Subscriptions

Dashboards (`/dashboard/parent`, `/dashboard/teacher`, `/dashboard/child/:id`) require an active
subscription: parents need Tier 1 or Tier 2, teachers need Tier 1. The `/resources` page remains
public, matching the original spec — it is **not** gated by subscription, since "courses" and
"paid webinars" don't exist as separate content types in this build (see note below).

### Local Stripe setup

1. Create a free Stripe account and switch to **Test mode**.
2. Get your test keys from the Stripe Dashboard → Developers → API keys, and put them in
   `backend/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLIC_KEY=pk_test_...
   ```
3. Forward webhooks to your local server using the [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:5001/api/payments/webhook
   ```
   This prints a `whsec_...` value — put it in `STRIPE_WEBHOOK_SECRET`.
4. Restart the backend, go to `/pricing`, choose a plan, and pay with a test card:
   - Success: `4242 4242 4242 4242`, any future expiry, any CVC
   - Decline: `4000 0000 0000 0002`

Without real keys, `/api/payments/create-checkout-session` returns a clear "Invalid API Key"
error rather than crashing the server — everything else (gating, login redirect, settings page)
works against the database directly and doesn't require Stripe to be configured.

### Scope notes

The original payment-system request also listed `/resources` (courses, paid webinars) as
subscription-gated. That wasn't built: this codebase only has generic articles/checklists/
videos/templates under Resources, not a separate courses/webinar catalog. Gating it would mean
building a new content type from scratch, out of scope for "add a payment system" — flagging it
here rather than quietly skipping it. (Consultation booking, listed as a separate unbuilt item at
the time, now exists — see below.)

## Consultation Booking

Tier 1 and Tier 2 subscribers can request a consultation with the psychologist (Fitri Effendy) at
`/consultation`. The flow is WhatsApp-based, not a real calendar:

1. Parent/teacher picks a child, online or offline, and optional notes, and submits.
2. The backend saves a `pending` consultation row and returns a `wa.me` link with the message
   pre-filled (e.g. *"Saya ingin konsultasi terkait anak saya Rafa secara online, kapan jadwal
   yang available? Topik: ..."*); the frontend opens it in a new tab.
3. The actual scheduling happens over WhatsApp between the parent and Fitri Effendy.
4. An admin account (`admin@studiva.id` / `password123`) can go to `/admin/consultations`, filter
   by status, set the agreed date/time to confirm a pending request, and mark it completed
   afterward. There's no automatic sync between WhatsApp and the database — the admin step is a
   manual reflection of what was agreed over chat.

Parents see their own bookings on `/dashboard/parent` (pending/confirmed only) and in full at
`/consultations/my-bookings`, where pending requests can be canceled. Price/duration per
consultation type come from `backend/.env` (`CONSULTATION_ONLINE_PRICE`, etc.) via
`GET /api/consultations/config`, so they're configurable in one place instead of being
hardcoded into the frontend.

## Tier Differentiation

Tier 1 (physical school) and Tier 2 (digital platform) now get materially different access,
dashboards, and onboarding rather than being treated identically once subscribed.

**Access control:** `requireActiveSubscription` (children, consultations) accepts Tier 1 *or*
Tier 2 for parents. `requireTier('tier1')` (daily updates / teacher messages / therapy notes —
all the same `daily_updates` table, differentiated only by `category`) requires Tier 1
specifically, regardless of role. A Tier 2-only parent can still see their child list and book
consultations, but gets a 402 from `/api/updates` since they have no child enrolled in the school
workflow.

**Database:** `children` gained `enrollment_status`, `tier1_start_date`, `school_class`,
`assigned_teacher_id`, and `emergency_contact` (migrated in on every backend startup via
`ALTER TABLE ... ADD COLUMN`, wrapped to ignore "duplicate column" errors on databases that
already have them). `GET /api/children` now also returns `assigned_teacher_name` via a `LEFT
JOIN`, so the Tier 1 dashboard can show "Meet your teacher" without a separate, more-restricted
`/api/users/:id` call. A new `enrollment_requests` table backs the upgrade path below.

**Signup (`/signup`):** now a wizard — choose Parent or Teacher; Teacher skips straight to a
plain signup form (teachers don't self-pay for Tier 1 — that's still a manually-created
subscription, same as the seeded `teacher@studiva.id`); Parent picks Tier 1 or Tier 2, fills the
account + child form, then immediately picks a plan and pays via the same Stripe Checkout flow as
`/pricing` (reused via the new `PricingCard`/`PlanConfirmModal` components instead of duplicating
that UI). `POST /api/auth/signup` now returns a token too, so the wizard can auto-login without a
second round trip.

**Dashboards:** `/dashboard/parent` is now a thin switcher reading `tier` from `AuthContext` and
rendering `ParentDashboardTier1` (child profile + class + teacher, daily updates, progress link)
or `ParentDashboardTier2` (consultation history, 3 recommended resources, and an "Upgrade to Tier
1" section) — not the same view with conditionally-hidden pieces.

**Onboarding:** `OnboardingModal` shows once per user (tracked via a `studiva_onboarding_done_<id>`
localStorage flag, not a DB column — it's cosmetic, not a permission, so a server round trip
felt unnecessary) right after reaching the dashboard. Tier 1 steps include a real "meet your
teacher" (reads `assigned_teacher_name`) and a real "emergency contact" form that saves via the
existing `PUT /api/children/:id`. Tier 2's "learning style quiz" is a genuine 3-question
quiz that computes a suggestion and saves it to `learning_style` on confirmation — not just
decorative. Its last step is "Book your first consultation" instead of "Browse courses", since
courses don't exist (see Scope notes below).

**Upgrade path (Tier 2 → Tier 1):** `UpgradeRequestForm` (shown on the Tier 2 dashboard) submits
to `POST /api/enrollment/request`, creating a `pending` row. Admin reviews it at
`/admin/enrollment-requests`, picks a teacher (`GET /api/admin/teachers`) and class, and
approving (`POST /:id/approve`) atomically creates a manual-payment Tier 1 subscription for that
parent (skipped if they already have one — e.g. enrolling a second child) and updates the child's
`enrollment_status`/`school_class`/`assigned_teacher_id`/`tier1_start_date`. This is intentionally
a *different* path than a brand-new self-serve Tier 1 signup (which pays via Stripe immediately,
no admin review) — upgrading an existing family involves school capacity/teacher assignment that
a brand-new enrollment also needs, but a fresh signup currently gets subscription access
immediately without that assignment step; only an admin manually setting `school_class`/
`assigned_teacher_id` later (no dedicated UI for that specific case yet) closes that gap. Flagging
this as a known simplification rather than building a second admin worklist for it.

### Scope notes

- Your spec asked for a `subscription_type` column on `subscriptions` — `subscriptions.tier`
  already stores exactly this (`'tier1' | 'tier2'`), added in the payments round. Adding a second,
  identical column would just create two sources of truth, so it wasn't added.
- Per your direction, the spec's Tier 1 "School calendar" and Tier 2 "Courses" nav/dashboard items
  weren't built — neither exists as a content type in this codebase (no events/calendar table, no
  course-enrollment system). Nav items link to real existing pages (Resources, Consultation,
  Subscription) instead of dead ends; the dashboard icon (🏫 / 💻) still differs per tier.
  ("Community forum" was also unbuilt at the time — it exists now, see below.)

## Community

A full discussion forum at `/community`, open to any logged-in user to **read**, but posting
requires an active subscription (Tier 1 or Tier 2). Categories: `general`, `topic`, and `fitri`
(With Fitri) are open to either tier; `tier1` and `tier2` categories are restricted both ways —
a Tier 2-only parent can't see or post in the Tier 1 forum and vice versa (admins see and can post
everywhere). Subcategories per category are defined once in `lib/communityCategories.ts` on the
backend and served via `GET /api/community/categories`, so the frontend doesn't hardcode them.

Core mechanics: flat comments (no nesting — matches the schema you gave, which has no
`parent_comment_id`), anonymous posting (displays as "Tier 1/2 Parent" based on the poster's
*current* subscription tier, computed at read time rather than frozen at post time), like
counters, the discussion author marking a reply "helpful" (moves it to the top, credits the
replier's profile), 24-hour edit windows, soft delete, content reporting, and an admin dashboard
at `/admin/community` for pinning/deleting discussions and resolving/dismissing reports. A
`community_profiles` row is created lazily on first interaction and tracks discussion/comment/
helpful/like counts plus an admin-settable "Community Champion" flag.

### Scope notes

- **No rich text editor** — plain textarea, consistent with every other form in this app.
- **No tag autocomplete** — a comma/Enter-separated input plus a clickable "popular tags" list
  fed by `GET /api/community/tags`.
- **No nested/threaded replies, notifications, DMs, or ban/suspend enforcement** — explicitly
  optional in your brief, or would need schema/fields you didn't specify (e.g. a ban flag on
  `users`).
- **No dedicated `/community/search` page or pagination UI** — search is the same search bar on
  `/community` (not a duplicate page+sidebar-filters UI), and the backend already supports
  `limit`/`offset` if pagination controls are added later.
- **`CommunityProfiles.tier`/`child_name`/`avatar_url` weren't stored as separate columns** — tier
  is read live from `subscriptions` (so it can't go stale if someone's plan changes), and avatars
  use the initials-circle pattern already used elsewhere in this app rather than a new upload flow.
- **Likes aren't deduplicated per user** — the schema you gave only has a `likes_count` integer on
  Discussions/Comments, with no separate likes table to track *who* liked what, so a user can click
  Like more than once. Matches the literal schema; flagging as a known gap rather than silently
  adding an un-asked-for table to fix it.

## Psikolog Fitri Admin/Expert Role

`fitri@studiva.id` (password `Studiva@Fitri2026!`) is a normal `role: 'admin'` user — every
permission in your "Can do" list (manage consultations, moderate community, view analytics, badge
Champions, etc.) already exists as an admin capability built in earlier rounds. What's new here is
display/identity, not a new permission tier: a public **`admin_profiles`** row (title, credentials,
bio, expertise areas, phone, WhatsApp, location — shown via `FitriProfileCard` on About,
Consultation, and the new Ask Psikolog Fitri page) and an **`is_expert`/`expert_badge`** flag on
her `community_profiles` row, which makes her name render in gold with a 👩‍⚕️ **Expert - Founder**
badge anywhere she posts.

**Ask Psikolog Fitri** (`/community/ask-fitri`) reuses the existing `fitri` discussion category
from the Community round rather than a parallel system: any subscriber can ask a question (create
a discussion in that category), but `POST /api/community/discussions/:id/comments` now rejects
non-admins on `fitri`-category discussions with "Hanya Psikolog Fitri yang dapat menjawab di forum
ini" — so only she can answer. Anonymous posting is also disabled for her specifically (an
"anonymous Tier 1 Parent" answer from the founder would be misleading), so her real name and badge
always show, including on `fitri`-category questions she didn't write anonymously.

**Psikolog Fitri Dashboard** (`/admin/fitri-dashboard`) is a metrics + quick-links view, not new
data: `GET /api/admin/dashboard-stats` aggregates counts that already existed across other tables
(total users, posts this week, active users this week from `community_profiles.last_active`,
pending reports, upcoming confirmed consultations, and total revenue summed from completed
`payments`). Consultation management got two small additions: an `outcome_notes` field saved when
marking a session complete, and a "Copy WhatsApp Confirmation Message" button.

### Scope notes

- **No `is_admin` column on `users`** — `role = 'admin'` already is that check everywhere in this
  codebase; a second boolean would just be a second source of truth for the same fact.
- **`is_expert` lives once, on `community_profiles`** — not duplicated onto `users` as the brief's
  schema suggested, for the same reason.
- **No actual "suspend/ban" enforcement** — your permissions list mentions it, but it needs a
  status field on `users` that wasn't specified, and was already flagged as deferred in the
  Community round. Still deferred.
- **No data export/CSV reports** — "View revenue data" is real (the dashboard sums completed
  payments), but generating downloadable reports is separate, unbuilt scope.
- **No calendar view of consultations** — the existing list+filter view at `/admin/consultations`
  (aliased to `/admin/consultations/manage` per your spec) already covers view/confirm/complete;
  a calendar is a bigger UI component for the same underlying data.
- **"Send WhatsApp confirmation to clients" copies a message instead of opening a chat** — this
  app has never collected a parent's phone number anywhere (the original consultation flow works
  because the *parent* messages in first); there's no number on file to build a `wa.me` link to.
  The button copies a ready-to-send confirmation message to the clipboard instead of pretending to
  know who to message.

## Notes

- Photos in daily updates are stored as data URLs (base64) for simplicity; for production, swap
  this for real file storage (e.g. S3) and store URLs instead.
- The teacher seed data assigns Rafa and Maya to `teacher@studiva.id` via the `teacher_children`
  join table.
