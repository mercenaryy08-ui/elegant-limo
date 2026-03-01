# Security – Elegant Limo (payments & site)

Recommendations and what is already in place for a site that handles payments (Stripe).

---

## Already in place

- **Stripe secret only on server** – `STRIPE_SECRET_KEY` is used only in Vercel serverless API routes; the frontend never sees it.
- **No card data on your server** – Card details go directly to Stripe Checkout; you never handle PAN/CVC.
- **Amount checks** – Minimum CHF 0.50 and maximum CHF 15,000 on the create-checkout-session API to limit abuse.
- **Redirect URL validation** – When `ALLOWED_ORIGINS` is set, success/cancel URLs must point to your allowed domains (avoids open redirect / phishing).
- **Security headers** – `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy` are set in `vercel.json`.
- **Metadata length limits** – Booking data stored in Stripe metadata is truncated (e.g. 500 chars per field).

---

## Recommended for production

### 1. Environment variables (Vercel / server)

| Variable | Purpose |
|--------|---------|
| `STRIPE_SECRET_KEY` | Live key for payments (see [STRIPE_SETUP.md](./STRIPE_SETUP.md)). |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed hostnames for Stripe redirect URLs, e.g. `elegantlimo.ch,www.elegantlimo.ch,elegant-limo.vercel.app`. If unset, redirect validation is skipped (ok for dev, not for production). |

### 2. HTTPS only

- Vercel serves over HTTPS by default. Do not allow payment or login over plain HTTP in production.

### 3. Ops dashboard

- Set `VITE_OPS_PASSWORD` so the `/ops` area is protected. Without it, anyone can open the ops dashboard.

### 4. No secrets in the frontend

- Only `VITE_*` variables are exposed to the client. Never put Stripe secret, API secrets, or database URLs in `VITE_*` or in client-side code.

### 5. Stripe best practices

- Use Stripe **live** keys only in production; keep test keys for development.
- In Stripe Dashboard: enable **radar** (fraud) and review **webhooks** if you add them later (e.g. `checkout.session.completed`).
- Optionally set a **maximum amount** in Stripe (e.g. Radar rules) as a second layer; the API already caps at CHF 15,000.

### 6. Optional: Content Security Policy (CSP)

- For stricter XSS protection you can add a CSP header in `vercel.json` (e.g. `Content-Security-Policy`). This may require tuning for Stripe, Google Maps, and any inline scripts. Start with the current headers and add CSP only if you have time to test.

### 7. Optional: rate limiting

- Vercel does not provide built-in rate limiting. For high traffic or abuse concerns, add rate limiting (e.g. Vercel Firewall, or a middleware/API gateway that limits requests per IP to `/api/create-stripe-checkout-session` and other sensitive routes).

### 8. Emails and cancellation

- Booking and cancellation APIs (e.g. Brevo, send-cancellation-request) should use env-based API keys and be called only from your server/API routes, not from the client with a secret.

---

## Quick checklist before go-live

- [ ] `STRIPE_SECRET_KEY` set to live key on Vercel (and never in repo or client).
- [ ] `ALLOWED_ORIGINS` set in production to your real domain(s).
- [ ] `VITE_OPS_PASSWORD` set so `/ops` is protected.
- [ ] Site and Stripe redirect URLs use HTTPS only.
- [ ] No secrets in `VITE_*` or in frontend code.

---

## If you add more backend later

- Use **parameterized queries** (or an ORM) for any database; never concatenate user input into SQL.
- Validate and sanitize all inputs; treat booking and payment data as untrusted until validated.
- Prefer **Stripe webhooks** for critical actions (e.g. confirming payment) so you don’t rely only on the client redirect.
