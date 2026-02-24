/**
 * Vercel serverless: create Stripe Checkout Session for booking payment.
 * POST body: { ...bookingPayload, successUrl, cancelUrl }
 * Env: STRIPE_SECRET_KEY
 */

import Stripe from 'stripe';

function getEnv(name, fallback) {
  const v = process.env[name];
  return (v && v.trim()) ? v.trim() : fallback;
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

  const totalPrice = Number(body.totalPrice) || 0;
  const amountCentimes = Math.round(totalPrice * 100); // CHF: 1 CHF = 100 centimes

  if (amountCentimes < 50) {
    res.status(400).json({ error: 'Amount must be at least CHF 0.50' });
    return;
  }

  const stripe = new Stripe(secretKey);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: (body.customerEmail || '').trim() || undefined,
      // Cancellation policy for display on Stripe Checkout (refunds applied manually per policy)
      const cancellationNote = 'Cancellation: free ≥24h before pickup; <24h before pickup: 50% cancellation fee applies.';
      const routeDesc = `${(body.from || '').slice(0, 80)} → ${(body.to || '').slice(0, 80)} • ${body.date || ''} ${body.time || ''}`;
      const fullDescription = `${routeDesc}. ${cancellationNote}`.slice(0, 500);

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
