# What to do with the old "Calculate Price" page on Hostinger

The **hero section** now sends users to **elegant-limo.vercel.app** (From/To/Date pre-filled). The full flow (summary with map + 3 cars + Recalculate, then checkout) lives on Vercel.

The old Hostinger page you had after "Book now" (instant estimate, map, 3 cars, FormSubmit to info@sdit-services.com) is **no longer in the main flow**. You have three options:

---

## Option 1: Remove it (recommended)

- **Do:** Delete or unpublish the calculate-price page on Hostinger.
- **Result:** Everyone books only via Vercel. One flow, one place for notifications (customer email, aid@sdit-services.com, WhatsApp, etc.).

Use this if you don’t need the old URL for links/emails.

---

## Option 2: Replace with a redirect (good if you have old links)

- **Do:** Replace the **content** of your current calculate-price page with the file:
  - **`hostinger-calculate-price-redirect.html`** (in this repo under `public/`).
- **Result:** The URL stays the same (e.g. `yoursite.com/calculate-price`). Anyone opening it (with or without `?from=...&to=...&date=...`) is sent to **elegant-limo.vercel.app** with the same query params. The Vercel app then pre-fills the form.

Use this if you have old links or ads pointing to the calculate-price page.

---

## Option 3: Keep the old page as a second path

- **Do:** Nothing; leave the current HTML as is.
- **Downside:** Two different booking paths (Vercel flow vs FormSubmit form). Duplicate handling and the FormSubmit flow doesn’t use your Vercel notifications (email to customer, aid@sdit-services.com, WhatsApp, etc.). Not recommended unless you have a specific reason.

---

## Summary

| Option | Action | When to use |
|--------|--------|-------------|
| **1. Remove** | Delete/unpublish the page on Hostinger | You’re fine with only the Vercel flow |
| **2. Redirect** | Upload `hostinger-calculate-price-redirect.html` as the calculate-price page | You want to keep the URL for old links |
| **3. Keep** | Leave current page as is | Only if you need two separate booking forms |

Recommendation: **Option 1** if you don’t need the old URL; **Option 2** if you do.
