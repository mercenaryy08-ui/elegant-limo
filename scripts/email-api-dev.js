/**
 * Local dev server for POST /api/send-booking-emails (same logic as Vercel serverless).
 * Run: node scripts/email-api-dev.js
 * Loads .env from project root. Vite proxy forwards /api to this server (port 3001).
 */

import { createServer } from 'http';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Load .env manually (no dotenv dep)
try {
  const envPath = resolve(root, '.env');
  const env = readFileSync(envPath, 'utf8');
  env.split('\n').forEach((line) => {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  });
} catch {
  console.warn('No .env found; set BREVO_API_KEY in .env for emails to work.');
}

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const DEFAULT_SENDER_EMAIL = 'noreply@elegant-limo.ch';
const DEFAULT_SENDER_NAME = 'Elegant Limo Switzerland';
const DEFAULT_ADMIN_EMAIL = 'booking@elegant-limo.ch';
const PORT = 3001;

function getEnv(name, fallback) {
  const v = process.env[name];
  return (v && String(v).trim()) ? String(v).trim() : fallback;
}

function escapeHtml(s) {
  if (s == null) return '';
  const str = String(s);
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildAdminHtml(p) {
  const rows = [
    ['Booking Reference', p.bookingReference],
    ['From', p.from || ''],
    ['To', p.to || ''],
    ['Date', p.date || ''],
    ['Time', p.time || ''],
    ['Passengers', String(p.passengers ?? 1)],
    ['Vehicle', p.vehicleLabel || p.vehicleId],
    ['Total Price', `CHF ${(p.totalPrice ?? 0).toFixed(2)}`],
    ['Customer Name', p.customerName || ''],
    ['Customer Email', p.customerEmail || ''],
    ['Customer Phone', p.customerPhone || ''],
    ['Payment Method', p.paymentMethod || 'Card on vehicle'],
    ['Add-ons', (p.addOns && p.addOns.length) ? p.addOns.join(', ') : 'None'],
  ];
  const tr = rows.map(([k, v]) => `<tr><td style="padding:6px 12px;border:1px solid #eee;">${escapeHtml(k)}</td><td style="padding:6px 12px;border:1px solid #eee;">${escapeHtml(v)}</td></tr>`).join('');
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;"><h2>New booking: ${escapeHtml(p.bookingReference)}</h2><table style="border-collapse:collapse;">${tr}</table></body></html>`;
}

function buildGoogleCalendarUrl(p) {
  const date = p.date || '';
  const time = (p.time || '09:00').replace(/\s/g, '');
  const [h, m] = time.split(':').map((x) => parseInt(x, 10) || 0);
  const start = new Date(date + 'T' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':00');
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmtLocal = (d) => {
    const y = d.getFullYear().toString().padStart(4, '0');
    const mo = (d.getMonth() + 1).toString().padStart(2, '0');
    const da = d.getDate().toString().padStart(2, '0');
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    const ss = d.getSeconds().toString().padStart(2, '0');
    return `${y}${mo}${da}T${hh}${mm}${ss}`;
  };

  const text = encodeURIComponent('Elegant Limo – Booking ' + (p.bookingReference || ''));
  const lines = [
    'From: ' + (p.from || ''),
    'To: ' + (p.to || ''),
    'Pickup: ' + (p.date || '') + ' ' + (p.time || '') + ' (Zurich local time)',
    'Passengers: ' + String(p.passengers ?? 1),
    'Vehicle: ' + (p.vehicleLabel || p.vehicleId || ''),
    'Booking ID: ' + (p.bookingReference || ''),
  ];
  const details = encodeURIComponent(lines.join('\n'));
  const location = encodeURIComponent(p.to || p.from || '');

  return (
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + text +
    '&dates=' + fmtLocal(start) + '/' + fmtLocal(end) +
    '&details=' + details +
    (location ? '&location=' + location : '')
  );
}

function buildCustomerHtml(p, whatsappNumber) {
  const calendarUrl = buildGoogleCalendarUrl(p);
  const whatsappText = encodeURIComponent('Hi, I have a booking with Elegant Limo. My booking ID: ' + (p.bookingReference || '') + '.');
  const whatsappUrl = 'https://wa.me/' + (whatsappNumber || '41787495005') + '?text=' + whatsappText;

  const name = p.customerName || 'Customer';
  const body = `
Dear ${escapeHtml(name)},

Thank you for booking with Elegant Limo Switzerland.

Your booking <strong>${escapeHtml(p.bookingReference)}</strong> is confirmed.

<ul>
  <li><strong>Pickup:</strong> ${escapeHtml(p.date || '')} at ${escapeHtml(p.time || '')}</li>
  <li><strong>From:</strong> ${escapeHtml(p.from || '')}</li>
  <li><strong>To:</strong> ${escapeHtml(p.to || '')}</li>
  <li><strong>Vehicle:</strong> ${escapeHtml(p.vehicleLabel || p.vehicleId)}</li>
  <li><strong>Passengers:</strong> ${p.passengers ?? 1}</li>
  <li><strong>Total:</strong> CHF ${(p.totalPrice ?? 0).toFixed(2)}</li>
  <li><strong>Payment:</strong> ${escapeHtml(p.paymentMethod || 'Credit card in vehicle')}</li>
  <li><strong>Add-ons:</strong> ${(p.addOns && p.addOns.length) ? escapeHtml(p.addOns.join(', ')) : 'None'}</li>
</ul>
${p.cancellationSummary ? `<p><strong>Cancellation policy:</strong> ${escapeHtml(p.cancellationSummary)}</p>` : ''}

<p><strong>One click:</strong></p>
<p style="margin:12px 0;">
  <a href="${escapeHtml(calendarUrl)}" style="display:inline-block;padding:10px 18px;background:#d4af37;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;margin-right:10px;">📅 Add to Google Calendar</a>
  <a href="${escapeHtml(whatsappUrl)}" style="display:inline-block;padding:10px 18px;background:#25D366;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">💬 Contact us on WhatsApp</a>
</p>

<p>Please add this trip to your calendar and set a reminder about 30 minutes before pickup so you have enough time for any last preparations.</p>

For questions or changes, reply to this email or use the WhatsApp button above.

Best regards,<br/>
Elegant Limo Switzerland
`;
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;">${body.replace(/\n/g, '<br/>')}</body></html>`;
}

async function sendBrevo(apiKey, { sender, to, subject, htmlContent, replyTo }) {
  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
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

async function handleSendBookingEmails(body) {
  const apiKey = getEnv('BREVO_API_KEY', '');
  if (!apiKey) throw new Error('BREVO_API_KEY not set in .env');

  const senderEmail = getEnv('BREVO_SENDER_EMAIL', DEFAULT_SENDER_EMAIL);
  const senderName = getEnv('BREVO_SENDER_NAME', DEFAULT_SENDER_NAME);
  const adminEmail = getEnv('ADMIN_EMAIL', DEFAULT_ADMIN_EMAIL);
  const whatsappNumber = getEnv('WHATSAPP_NUMBER', '41787495005').replace(/\D/g, '');
  const sender = { name: senderName, email: senderEmail };
  const customerEmail = (body.customerEmail || '').trim();

  await sendBrevo(apiKey, {
    sender,
    to: { email: adminEmail, name: 'Admin' },
    subject: `[Elegant Limo] New booking ${body.bookingReference || ''}`,
    htmlContent: buildAdminHtml(body),
    replyTo: adminEmail,
  });

  if (customerEmail) {
    await sendBrevo(apiKey, {
      sender,
      to: { email: customerEmail, name: body.customerName || '' },
      subject: `Elegant Limo — Booking Confirmation ${body.bookingReference || ''}`,
      htmlContent: buildCustomerHtml(body, whatsappNumber),
      replyTo: adminEmail,
    });
  }

  return { ok: true, admin: 'sent', customer: customerEmail ? 'sent' : null };
}

const server = createServer((req, res) => {
  const allowCors = () => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  };

  if (req.method === 'OPTIONS') {
    allowCors();
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/api/send-booking-emails') {
    allowCors();
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  let raw = '';
  req.on('data', (ch) => { raw += ch; });
  req.on('end', async () => {
    allowCors();
    let body;
    try {
      body = JSON.parse(raw || '{}');
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }
    try {
      const result = await handleSendBookingEmails(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error('Email API error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Failed to send emails' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Email API dev server: http://localhost:${PORT}/api/send-booking-emails`);
  if (!getEnv('BREVO_API_KEY', '')) console.warn('BREVO_API_KEY not set in .env — emails will fail.');
});
