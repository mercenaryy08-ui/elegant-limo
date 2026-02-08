# Ops Dashboard – How to Use and Implement

## What it is

The **ops dashboard** is the “door” where you receive client bookings and manage them: confirm, resend confirmation emails, decline bookings, and manage working hours (blocked slots). It lives at **`/ops`**.

---

## How to access

- From the main site: footer links **“Ops dashboard”** and **“Calendar”**.
- Direct URL: **`/ops`** (e.g. `https://yoursite.com/ops`).

## Free password protection (no backend)

The ops area can be protected with a **single shared password** (no accounts, no database).

1. Create a `.env` file in the project root (or set the variable in your host’s env):
   ```bash
   VITE_OPS_PASSWORD=your-secret-password
   ```
2. Restart the dev server or rebuild. Anyone opening `/ops` must enter that password.
3. The session is stored in **sessionStorage** (per tab). Closing the tab logs them out. Use **Log out** in the ops header to sign out without closing the tab.

If **`VITE_OPS_PASSWORD`** is not set, the ops dashboard is open (no login). Set it in production so only your team can access it.

---

## Sections

### 1. Bookings (`/ops`)

- **List** of bookings with status (Pending, Confirmed, Completed, Declined).
- **Filter** by status (All, Pending, Confirmed, etc.).
- **Actions per booking:**
  - **Confirm** – set status to “confirmed” (for pending only).
  - **Resend email** – send the confirmation email again to the customer.
  - **Decline** – cancel the booking (optional reason; you can use it in the decline email to the customer).

Data is loaded from `GET /api/admin/bookings` (or mock data if no backend). Resend uses `POST /api/admin/bookings/:id/resend-confirmation`, decline uses `PATCH /api/admin/bookings/:id/status` with `status: 'cancelled'`.

### 2. Working hours (`/ops/working-hours`)

- **List** of blocked slots (date + time range + optional vehicle + reason).
- **Add block** – e.g. holiday, maintenance, no availability.
- **Edit** / **Remove** existing blocks.

Blocked slots are used by the booking flow: clients cannot book in those windows. Data is currently in-memory (`ClosedSlotManager`); in production you’d use **GET/POST/PATCH/DELETE `/api/admin/closed-slots`** and store in the database.

### 3. Calendar (`/ops/calendar`)

- **ICS subscription link** – copy and subscribe in Google Calendar / Apple Calendar / Outlook to see bookings and blocked events.
- **Month / Week / Day / List** views (UI only for now; events would come from the API).

---

## Backend implementation checklist

| Feature | Endpoint | Notes |
|--------|----------|--------|
| List bookings | `GET /api/admin/bookings` | Optional query: `status`, `startDate`, `endDate`. Return array of bookings. |
| Confirm booking | `PATCH /api/admin/bookings/:id/status` | Body: `{ "status": "confirmed" }`. Optionally send confirmation email. |
| Resend confirmation | `POST /api/admin/bookings/:id/resend-confirmation` | Send same confirmation email to `customerDetails.email`. |
| Decline booking | `PATCH /api/admin/bookings/:id/status` | Body: `{ "status": "cancelled", "declineReason": "optional" }`. Optionally send “booking declined” email. |
| List closed slots | `GET /api/admin/closed-slots` | Return array of `{ id, date, startTime, endTime, vehicleId?, reason? }`. |
| Create closed slot | `POST /api/admin/closed-slots` | Body: same fields without `id`. Validate date/time. |
| Update closed slot | `PATCH /api/admin/closed-slots/:id` | Partial update. |
| Delete closed slot | `DELETE /api/admin/closed-slots/:id` | Remove block. |

Set **`VITE_API_BASE_URL`** in the frontend env to your API base (e.g. `https://api.yoursite.com`) so the ops dashboard calls these endpoints instead of mock data.

---

## Securing the ops dashboard

1. **Auth:** Add a login page (or use your existing auth). Only allow access to `/ops` when the user is logged in as staff/admin.
2. **Route guard:** In the app, wrap the `/ops` route in a component that checks auth and redirects to login if not authenticated.
3. **Backend:** All admin endpoints above should require a valid admin/session token and return 401 when missing or invalid.

Once you have auth, you can hide or remove the “Ops dashboard” link from the public footer and give staff the URL and credentials.
