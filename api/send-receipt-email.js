/**
 * Vercel serverless: send payment receipt email via Brevo.
 * POST body: { customerEmail, customerName, bookingReference, totalPrice }
 * Env: BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME
 */

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const DEFAULT_SENDER_EMAIL = 'info@sdit-services.com';
const DEFAULT_SENDER_NAME = 'Elegant Limo Switzerland';

function getEnv(name, fallback) {
  const v = process.env[name];
  return (v && v.trim()) ? v.trim() : fallback;
}

function escapeHtml(s) {
  if (s == null) return '';
  const str = String(s);
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildReceiptHtml(p) {
  const amount = (p.totalPrice != null && p.totalPrice !== '') ? Number(p.totalPrice).toFixed(2) : '0.00';
  const name = p.customerName || 'Customer';
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;">
<p>Dear ${escapeHtml(name)},</p>
<p>Thank you for your payment. This is your receipt for your Elegant Limo booking.</p>
<table style="border-collapse:collapse;max-width:400px;">
<tr><td style="padding:8px 12px;border:1px solid #eee;"><strong>Booking reference</strong></td><td style="padding:8px 12px;border:1px solid #eee;">${escapeHtml(p.bookingReference || '')}</td></tr>
<tr><td style="padding:8px 12px;border:1px solid #eee;"><strong>Amount paid</strong></td><td style="padding:8px 12px;border:1px solid #eee;">CHF ${escapeHtml(amount)}</td></tr>
</table>
<p>If you have any questions, reply to this email or contact us on WhatsApp.</p>
<p>Best regards,<br/>${escapeHtml(DEFAULT_SENDER_NAME)}</p>
</body></html>`;
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

  const email = (body.customerEmail || '').trim();
  if (!email) {
    res.status(400).json({ error: 'customerEmail required' });
    return;
  }

  const senderEmail = getEnv('BREVO_SENDER_EMAIL', DEFAULT_SENDER_EMAIL);
  const senderName = getEnv('BREVO_SENDER_NAME', DEFAULT_SENDER_NAME);

  try {
    const res2 = await fetch(BREVO_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email, name: body.customerName || '' }],
        subject: `Elegant Limo – Payment receipt ${body.bookingReference || ''}`,
        htmlContent: buildReceiptHtml(body),
        replyTo: senderEmail,
      }),
    });
    if (!res2.ok) {
      const text = await res2.text();
      throw new Error(`Brevo ${res2.status}: ${text}`);
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('send-receipt-email error:', err);
    res.status(500).json({ error: err.message || 'Failed to send receipt' });
  }
}
