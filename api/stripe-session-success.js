/**
 * Vercel serverless: get booking payload from a paid Stripe Checkout Session.
 * GET ?session_id=cs_xxx
 * Env: STRIPE_SECRET_KEY
 */

import Stripe from 'stripe';

function getEnv(name, fallback) {
  const v = process.env[name];
  return (v && v.trim()) ? v.trim() : fallback;
}

function metadataToBooking(metadata) {
  let addOns = [];
  try {
    addOns = JSON.parse(metadata.addOns || '[]');
  } catch {
    // ignore
  }
  return {
    id: metadata.id || '',
    bookingReference: metadata.bookingReference || '',
    from: metadata.from || '',
    to: metadata.to || '',
    date: metadata.date || '',
    time: metadata.time || '09:00',
    passengers: parseInt(metadata.passengers, 10) || 1,
    vehicleId: metadata.vehicleId || '',
    vehicleLabel: metadata.vehicleLabel || metadata.vehicleId || '',
    totalPrice: parseFloat(metadata.totalPrice, 10) || 0,
    customerEmail: metadata.customerEmail || '',
    customerPhone: metadata.customerPhone || '',
    customerName: metadata.customerName || '',
    customerFirstName: metadata.customerFirstName || '',
    customerLastName: metadata.customerLastName || '',
    addOns,
    paymentMethod: metadata.paymentMethod || 'Stripe',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secretKey = getEnv('STRIPE_SECRET_KEY', '');
  if (!secretKey) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
    return;
  }

  const sessionId = (req.query && req.query.session_id) || '';
  if (!sessionId) {
    res.status(400).json({ error: 'session_id required' });
    return;
  }

  const stripe = new Stripe(secretKey);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    if (session.payment_status !== 'paid') {
      res.status(400).json({ error: 'Session not paid', payment_status: session.payment_status });
      return;
    }

    const booking = metadataToBooking(session.metadata || {});
    res.status(200).json({ ok: true, booking });
  } catch (err) {
    console.error('stripe-session-success error:', err);
    res.status(500).json({ error: err.message || 'Failed to retrieve session' });
  }
}
