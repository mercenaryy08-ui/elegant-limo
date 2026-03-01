# Stripe setup (live / production)

The app currently uses **test** Stripe keys. To switch to your **live** Stripe account, you need the following from the Stripe side.

---

## 1. What you need from Stripe (API / Dashboard)

### 1.1 API keys (required)

| Key | Where to get it | Used by | Purpose |
|-----|-----------------|--------|---------|
| **Secret key** | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Developers → API keys → **Secret key** (use **Live** tab, not Test) | Backend (Vercel serverless) | Creating Checkout Sessions and retrieving session data |
| **Publishable key** | Same page → **Publishable key** (Live) | Frontend (optional; only if you add Stripe.js later) | Client-side Stripe.js; not used by current Checkout redirect flow |

For the **current** implementation (redirect to Stripe Checkout, no Stripe.js on the frontend), you only **must** configure the **Secret key** on the server. The frontend does not send the publishable key to the API; it only redirects to the URL returned by your API.

### 1.2 Webhook (optional but recommended for production)

If you later add webhooks (e.g. `checkout.session.completed` to confirm payments or send emails):

- **Webhook signing secret** (`whsec_...`): Dashboard → Developers → Webhooks → Add endpoint → select events → reveal **Signing secret**.

Right now the app does **not** use webhooks for payment confirmation; success is handled via the redirect to `/booking-success?session_id=...` and the `stripe-session-success` API. So you can connect live Stripe **without** a webhook first.

### 1.3 Account and product (no change needed)

- Use your **live** Stripe account (same account, switch from Test to Live mode in the Dashboard).
- The server creates a **dynamic** Checkout Session with `price_data` (no fixed Product/Price IDs). So you do **not** need to create a product or price in the Dashboard for “Elegant Limo – Transfer”.

---

## 2. What to set in your project (env)

### Backend (Vercel / server)

| Variable | Value | Notes |
|----------|--------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | From Stripe Dashboard → API keys → **Live** → Secret key. **Never** commit this or expose it in the frontend. |

Set this in:

- **Vercel**: Project → Settings → Environment Variables → add `STRIPE_SECRET_KEY` = `sk_live_...` for Production (and Preview if you want).
- **Local**: `.env` (and ensure `.env` is in `.gitignore`).

### reCAPTCHA v2 (before payment)

A reCAPTCHA v2 checkbox is shown before the “Pay with Stripe” button. Set both keys so the API verifies the token:

| Variable | Where | Notes |
|----------|--------|--------|
| `VITE_RECAPTCHA_SITE_KEY` | Frontend (e.g. Vercel env or `.env`) | Public; used by the checkout page. |
| `RECAPTCHA_SECRET_KEY` | Backend only (Vercel / server) | **Never** commit; set in Vercel Dashboard. |

If `RECAPTCHA_SECRET_KEY` is not set, the API skips verification (useful for local dev). See `.env.example` for the variable names.

### Frontend (optional for current flow)

The current flow does **not** use a frontend Stripe key: the frontend only calls your API `POST /api/create-stripe-checkout-session` and redirects to the returned URL. If you later add Stripe.js (e.g. Payment Element), you would set:

| Variable | Value |
|----------|--------|
| `VITE_STRIPE_PUBLIC_KEY` | `pk_live_...` (Live publishable key) |

---

## 3. Checklist before going live

- [ ] In [Stripe Dashboard](https://dashboard.stripe.com), switch to **Live** mode (toggle top-right).
- [ ] Copy the **Secret key** (sk_live_...) and set it as `STRIPE_SECRET_KEY` in Vercel (and local `.env` if you test locally).
- [ ] Ensure your Stripe account has **activated** live payments (Dashboard may ask you to complete identity/verification).
- [ ] Test a real booking end-to-end with a small amount; confirm the payment appears in Stripe Dashboard → Payments (Live).
- [ ] (Optional) Later: add a webhook endpoint and set `STRIPE_WEBHOOK_SECRET` if you implement webhook handling.

---

## 4. Summary: minimum to connect the “correct” (live) Stripe

From the **API side of Stripe** you only need:

1. **Live Secret key** (`sk_live_...`)  
   → Set as **`STRIPE_SECRET_KEY`** in the server environment (e.g. Vercel).

Nothing else is required for the current redirect-to-Checkout flow. Once that is set, the app will create live Checkout Sessions and charge the card in CHF using the amount computed from the booking (from/to, vehicle, add-ons).
