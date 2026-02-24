/**
 * Notification emails for booking lifecycle.
 * Uses Brevo via serverless API (api/send-booking-emails) when a booking is confirmed.
 *
 * 1) Admin alert  → info@sdit-services.com  (new booking details)
 * 2) Customer confirmation → customer email  (booking summary)
 */

import { CANCELLATION_POLICY, PAYMENT_POLICY } from './policies';
import { formatCHF } from './pricing';
import { getVehicleById } from './fleet';

export interface BookingForNotification {
  id: string;
  bookingReference: string;
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
  vehicleId: string;
  addOns?: string[];
  totalPrice: number;
  customerEmail?: string;
  customerPhone?: string;
}

export type BookingFormSubmitPayload = BookingForNotification & { customerName?: string; paymentMethod?: string };

/** Helper: human-readable vehicle name */
function vehicleLabel(vehicleId: string): string {
  const v = getVehicleById(vehicleId);
  return v ? `${v.name} (${v.className})` : vehicleId;
}

const getApiBase = () => (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL ?? '';

export interface SendBookingEmailsResult {
  ok: boolean;
  error?: string;
}

/**
 * Send booking emails via Brevo (admin alert + customer confirmation).
 * Calls the serverless API which uses BREVO_API_KEY. For local dev, run "npm run dev:email" and use "npm run dev:all" (or Vite proxies /api to the email server).
 */
export async function sendBookingEmails(booking: BookingFormSubmitPayload): Promise<SendBookingEmailsResult> {
  const apiBase = getApiBase().replace(/\/$/, '');
  const url = `${apiBase}/api/send-booking-emails`;
  const vehicleLabelStr = vehicleLabel(booking.vehicleId);
  const addOnsList = booking.addOns?.length ? booking.addOns : [];

  const payload = {
    ...booking,
    vehicleLabel: vehicleLabelStr,
    addOns: Array.isArray(booking.addOns) ? booking.addOns : addOnsList,
    cancellationSummary: CANCELLATION_POLICY.summary,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errBody = await res.text();
      let errMsg = `Emails failed (${res.status})`;
      try {
        const j = JSON.parse(errBody);
        if (j?.error) errMsg = j.error;
      } catch {
        if (errBody) errMsg = errBody.slice(0, 120);
      }
      console.warn('Brevo booking emails response:', res.status, errBody);
      return { ok: false, error: errMsg };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed';
    console.warn('Brevo booking emails request failed:', err);
    return { ok: false, error: message };
  }
}

/**
 * @deprecated Use sendBookingEmails instead. Kept for backwards compatibility (e.g. resend from ops).
 * Send "new booking alert" email to admin via Brevo API.
 */
export async function sendAdminBookingAlert(booking: BookingFormSubmitPayload): Promise<void> {
  await sendBookingEmails(booking);
}

/**
 * @deprecated Use sendBookingEmails instead. Kept for backwards compatibility.
 * Send booking confirmation email to the customer via Brevo API.
 */
export async function sendCustomerConfirmationEmail(booking: BookingFormSubmitPayload): Promise<void> {
  await sendBookingEmails(booking);
}

/**
 * Build text message for WhatsApp / reminder notifications.
 */
export function buildBookingMessage(booking: BookingForNotification): string {
  const addOnsText = booking.addOns?.length ? booking.addOns.join(', ') : 'None';
  return [
    `Booking: ${booking.bookingReference}`,
    `Vehicle: ${vehicleLabel(booking.vehicleId)}`,
    `Pickup: ${booking.date} at ${booking.time}`,
    `From: ${booking.from}`,
    `To: ${booking.to}`,
    `Passengers: ${booking.passengers}`,
    `Add-ons: ${addOnsText}`,
    `Total: ${formatCHF(booking.totalPrice)}`,
    `Payment: ${PAYMENT_POLICY.method}`,
    `Cancellation: ${CANCELLATION_POLICY.summary}`,
  ].join('\n');
}
