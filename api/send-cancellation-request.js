/**
 * Vercel serverless: send cancellation request to admin via Brevo.
 * POST body: { bookingReference: string, email: string }
 * Env: BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME, ADMIN_EMAIL
 */

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const DEFAULT_SENDER_EMAIL = 'info@sdit-services.com';
const DEFAULT_SENDER_NAME = 'Elegant Limo Switzerland';
const DEFAULT_ADMIN_EMAIL = 'info@sdit-services.com';

function getEnv(name, fallback) {
  const v = process.env[name];
  return (v && v.trim()) ? v.trim() : fallback;
}

function escapeHtml(s) {
  if (s == null) return '';
  const str = String(s);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendBrevo(apiKey, { sender, to, subject, htmlContent, replyTo }) {
  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: sender.name, email: sender.email },
      to: [{ email: to.email, name: to.name || to.email }],
      subject,
      htmlContent,
      replyTo: replyTo ? { email: replyTo } : undefined,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo API ${res.status}: ${text}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = getEnv('BREVO_API_KEY', '');
  if (!apiKey) {
    res.status(500).json({ error: 'BREVO_API_KEY not configured' });
    return;
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  const bookingReference = (body.bookingReference || '').trim().toUpperCase();
  const email = (body.email || '').trim();

  if (!bookingReference) {
    res.status(400).json({ error: 'bookingReference is required' });
    return;
  }
  if (!email) {
    res.status(400).json({ error: 'email is required' });
    return;
  }
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
    res.status(400).json({ error: 'Invalid email address' });
    return;
  }

  const senderEmail = getEnv('BREVO_SENDER_EMAIL', DEFAULT_SENDER_EMAIL);
  const senderName = getEnv('BREVO_SENDER_NAME', DEFAULT_SENDER_NAME);
  const adminEmail = getEnv('ADMIN_EMAIL', DEFAULT_ADMIN_EMAIL);
  const sender = { name: senderName, email: senderEmail };

  const now = new Date().toISOString();
  const htmlContent = `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;">
  <h2>Cancellation request</h2>
  <p>A customer has requested to cancel their booking.</p>
  <table style="border-collapse:collapse;">
    <tr><td style="padding:6px 12px;border:1px solid #eee;">Booking reference</td><td style="padding:6px 12px;border:1px solid #eee;">${escapeHtml(bookingReference)}</td></tr>
    <tr><td style="padding:6px 12px;border:1px solid #eee;">Customer email</td><td style="padding:6px 12px;border:1px solid #eee;">${escapeHtml(email)}</td></tr>
    <tr><td style="padding:6px 12px;border:1px solid #eee;">Requested at</td><td style="padding:6px 12px;border:1px solid #eee;">${escapeHtml(now)}</td></tr>
  </table>
  <p style="margin-top:16px;color:#666;">Process the cancellation and refund per your policy (≥24h before pickup: full refund; &lt;24h: 50% fee). You can reply to this email to contact the customer.</p>
</body>
</html>`;

  try {
    await sendBrevo(apiKey, {
      sender,
      to: { email: adminEmail, name: 'Admin' },
      subject: `[Elegant Limo] Cancellation request: ${bookingReference}`,
      htmlContent,
      replyTo: email,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('send-cancellation-request error:', err);
    res.status(500).json({ error: err.message || 'Failed to send cancellation request' });
  }
}
