/**
 * Vercel serverless: create Stripe Checkout Session for booking payment.
 * POST body: { ...bookingPayload, successUrl, cancelUrl }
 * Env: STRIPE_SECRET_KEY, optional: ALLOWED_ORIGINS (comma-separated, e.g. https://elegantlimo.ch,https://www.elegantlimo.ch)
 */

import Stripe from 'stripe';

const MIN_AMOUNT_CENTIMES = 50;   // CHF 0.50
const MAX_AMOUNT_CHF = 15000;     // Cap to prevent abuse

function getEnv(name, fallback) {
  const v = process.env[name];
  return (v && v.trim()) ? v.trim() : fallback;
}

/** Return allowed hostnames (e.g. elegantlimo.ch,www.elegantlimo.ch). Empty = skip redirect validation. */
function getAllowedHosts() {
  const raw = getEnv('ALLOWED_ORIGINS', '');
  if (!raw) return [];
  return raw.split(',').map((o) => o.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0]).filter(Boolean);
}

/** Ensure successUrl and cancelUrl point to allowed origins to prevent open redirect / phishing. */
function validateRedirectUrls(successUrl, cancelUrl) {
  const allowed = getAllowedHosts();
  if (allowed.length === 0) return { ok: true };
  try {
    const hostSuccess = new URL(successUrl).hostname.toLowerCase();
    const hostCancel = new URL(cancelUrl).hostname.toLowerCase();
    const ok = allowed.some((h) => hostSuccess === h || hostSuccess.endsWith('.' + h));
    const ok2 = allowed.some((h) => hostCancel === h || hostCancel.endsWith('.' + h));
    if (ok && ok2) return { ok: true };
    return { ok: false, error: 'successUrl and cancelUrl must point to your site (set ALLOWED_ORIGINS in production)' };
  } catch (e) {
    return { ok: false, error: 'Invalid successUrl or cancelUrl' };
  }
}

/** Metadata values must be strings, max 500 chars each */
function bookingToMetadata(p) {
  const addOns = Array.isArray(p.addOns) ? p.addOns : [];
  const name = (p.customerName || '').trim();
  const [first, ...rest] = name.split(/\s+/);
  const firstName = (p.customerFirstName != null ? String(p.customerFirstName) : first || '').slice(0, 500);
  const lastName = (p.customerLastName != null ? String(p.customerLastName) : rest.join(' ') || '').slice(0, 500);
  return {
    id: (p.id || '').slice(0, 500),
    bookingReference: (p.bookingReference || '').slice(0, 500),
    from: (p.from || '').slice(0, 500),
    to: (p.to || '').slice(0, 500),
    date: (p.date || '').slice(0, 500),
    time: (p.time || '').slice(0, 500),
    passengers: String(p.passengers ?? 1),
    vehicleId: (p.vehicleId || '').slice(0, 500),
    vehicleLabel: (p.vehicleLabel || p.vehicleId || '').slice(0, 500),
    totalPrice: String(p.totalPrice ?? 0),
    customerEmail: (p.customerEmail || '').slice(0, 500),
    customerPhone: (p.customerPhone || '').slice(0, 500),
    customerName: name.slice(0, 500),
    customerFirstName: firstName,
    customerLastName: lastName,
    addOns: JSON.stringify(addOns).slice(0, 500),
    paymentMethod: (p.paymentMethod || 'Stripe').slice(0, 500),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secretKey = getEnv('STRIPE_SECRET_KEY', '');
  if (!secretKey) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  const { successUrl, cancelUrl } = body;
  if (!successUrl || !cancelUrl) {
    res.status(400).json({ error: 'successUrl and cancelUrl required' });
    return;
  }

  const urlCheck = validateRedirectUrls(successUrl, cancelUrl);
  if (!urlCheck.ok) {
    res.status(400).json({ error: urlCheck.error });
    return;
  }

  const recaptchaSecret = getEnv('RECAPTCHA_SECRET_KEY', '');
  if (recaptchaSecret) {
    const token = (body.recaptchaToken || '').trim();
    if (!token) {
      res.status(400).json({ error: 'Please complete the security check (reCAPTCHA) and try again.' });
      return;
    }
    let verifyRes;
    try {
      verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: recaptchaSecret, response: token }).toString(),
      });
    } catch (e) {
      console.error('reCAPTCHA verify request failed:', e);
      res.status(500).json({ error: 'Security check temporarily unavailable. Please try again.' });
      return;
    }
    const verify = await verifyRes.json().catch(() => ({}));
    if (!verify.success) {
      res.status(400).json({ error: 'Security check failed. Please complete the "I\'m not a robot" check and try again.' });
      return;
    }
  }

  const totalPrice = Number(body.totalPrice) || 0;
  const amountCentimes = Math.round(totalPrice * 100); // CHF: 1 CHF = 100 centimes

  if (amountCentimes < MIN_AMOUNT_CENTIMES) {
    res.status(400).json({ error: 'Amount must be at least CHF 0.50' });
    return;
  }
  if (totalPrice > MAX_AMOUNT_CHF) {
    res.status(400).json({ error: `Amount must not exceed CHF ${MAX_AMOUNT_CHF.toLocaleString()}` });
    return;
  }

  const stripe = new Stripe(secretKey);

  const cancellationNote = 'Cancellation: free ≥24h before pickup; <24h before pickup: 50% cancellation fee applies.';
  const routeDesc = `${(body.from || '').slice(0, 80)} → ${(body.to || '').slice(0, 80)} • ${body.date || ''} ${body.time || ''}`;
  const fullDescription = `${routeDesc}. ${cancellationNote}`.slice(0, 500);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: (body.customerEmail || '').trim() || undefined,
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: 'Elegant Limo – Transfer',
              description: fullDescription,
              images: [],
            },
            unit_amount: amountCentimes,
          },
          quantity: 1,
        },
      ],
      metadata: bookingToMetadata(body),
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('create-stripe-checkout-session error:', err);
    res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
}
