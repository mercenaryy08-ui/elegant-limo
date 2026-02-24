# Cancellations & Refunds – Elegant Limo

## Policy summary

- **≥48 hours before pickup:** Free cancellation, full refund.
- **24–48 hours before pickup:** Free cancellation (grace period), full refund.
- **<24 hours before pickup:** 50% cancellation fee; 50% of the amount paid is refunded.

Refunds are processed within 5–7 business days to the original payment method.

---

## How customers request a cancellation

1. **Contact you** by:
   - **WhatsApp** (use the floating button or the number on the site), or  
   - **Email** (your contact email).

2. **Provide:**
   - Booking reference (e.g. `EL12345678`) and  
   - The email address used for the booking.

3. **You then:**
   - Confirm the booking and the pickup time.
   - Apply the policy:
     - If cancellation is **≥24h before pickup**: refund 100% (full amount).
     - If cancellation is **<24h before pickup**: refund 50%; keep 50% as cancellation fee.
   - Process the refund in Stripe (Dashboard → Payments → [payment] → Refund, or Stripe API).
   - Optionally send a short confirmation email to the customer.

---

## Processing refunds in Stripe

- **Full refund:** Stripe Dashboard → Payment → **Refund** → Full amount.
- **Partial refund (50%):** Same flow → **Refund** → Enter 50% of the amount (or the exact centimes).

Stripe does not enforce your policy; you decide the refund amount per case and issue it manually.

---

## Implemented: “Request cancellation” on the website

If you want a dedicated flow later, you can add:

- A **“Cancel my booking”** link (e.g. in the footer or on the success page) that:
  - Opens a simple form: **Booking reference** + **Email**.
  - On submit: sends an email to you (or stores the request) so you can process the cancellation and refund as above.

- **Link:** Footer and success page. **Page:** `/cancel-booking`. **API:** `POST /api/send-cancellation-request` emails ADMIN_EMAIL via Brevo; reply-to = customer email. Process refund per policy.
