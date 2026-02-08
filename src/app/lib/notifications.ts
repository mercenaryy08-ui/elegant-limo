/**
 * Notification emails for booking lifecycle.
 * Uses FormSubmit.co AJAX (no backend needed).
 *
 * 1) Admin alert  → info@sdit-services.com  (new booking details)
 * 2) Customer confirmation → customer email  (booking summary)
 *
 * NOTE: FormSubmit requires one-time email activation per target address.
 *       The first submission triggers a confirmation email — click the link to activate.
 */

import { PAYMENT_POLICY, CANCELLATION_POLICY } from './policies';
import { formatCHF } from './pricing';
import { getVehicleById } from './fleet';

const ADMIN_EMAIL = 'info@sdit-services.com';

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

/**
 * Send "new booking alert" email to admin (info@sdit-services.com) via FormSubmit AJAX.
 */
export async function sendAdminBookingAlert(booking: BookingFormSubmitPayload): Promise<void> {
  const payload: Record<string, string> = {
    _subject: `[Elegant Limo] New booking ${booking.bookingReference}`,
    _template: 'box',
    _captcha: 'false',
    'Booking Reference': booking.bookingReference,
    'From': booking.from ?? '',
    'To': booking.to ?? '',
    'Date': booking.date ?? '',
    'Time': booking.time ?? '',
    'Passengers': String(booking.passengers ?? 1),
    'Vehicle': vehicleLabel(booking.vehicleId),
    'Total Price': `CHF ${(booking.totalPrice ?? 0).toFixed(2)}`,
    'Customer Name': booking.customerName ?? '',
    'Customer Email': booking.customerEmail ?? '',
    'Customer Phone': booking.customerPhone ?? '',
    'Payment Method': booking.paymentMethod ?? 'Card on vehicle',
    'Add-ons': booking.addOns?.length ? booking.addOns.join(', ') : 'None',
  };

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.warn('FormSubmit admin alert response:', res.status);
  } catch (err) {
    console.warn('FormSubmit admin alert failed:', err);
  }
}

/**
 * Send booking confirmation email to the customer via FormSubmit AJAX.
 * The email goes TO the customer's address.
 *
 * FormSubmit sends to the address in the URL. To email the customer, we use
 * formsubmit.co/ajax/{customerEmail}. The customer must NOT need to activate —
 * FormSubmit activation is only needed for the target email the FIRST time.
 * If activation is not done yet, this will still succeed silently (FormSubmit queues it).
 */
export async function sendCustomerConfirmationEmail(booking: BookingFormSubmitPayload): Promise<void> {
  const customerEmail = booking.customerEmail?.trim();
  if (!customerEmail) return;

  const payload: Record<string, string> = {
    _subject: `Elegant Limo — Booking Confirmation ${booking.bookingReference}`,
    _template: 'box',
    _captcha: 'false',
    _replyto: ADMIN_EMAIL,
    'Booking Reference': booking.bookingReference,
    'Pickup': `${booking.date} at ${booking.time}`,
    'From': booking.from ?? '',
    'To': booking.to ?? '',
    'Vehicle': vehicleLabel(booking.vehicleId),
    'Passengers': String(booking.passengers ?? 1),
    'Total Price': `CHF ${(booking.totalPrice ?? 0).toFixed(2)}`,
    'Payment': booking.paymentMethod ?? 'Credit card in vehicle',
    'Add-ons': booking.addOns?.length ? booking.addOns.join(', ') : 'None',
    'Message': `Dear ${booking.customerName ?? 'Customer'},\n\nThank you for booking with Elegant Limo Switzerland.\n\nYour booking (${booking.bookingReference}) is confirmed.\nPickup: ${booking.date} at ${booking.time}\nFrom: ${booking.from}\nTo: ${booking.to}\nVehicle: ${vehicleLabel(booking.vehicleId)}\nTotal: CHF ${(booking.totalPrice ?? 0).toFixed(2)}\nPayment: ${booking.paymentMethod ?? 'Credit card in vehicle'}\n\nCancellation policy: ${CANCELLATION_POLICY.summary}\n\nFor questions or changes, reply to this email or contact us on WhatsApp.\n\nBest regards,\nElegant Limo Switzerland`,
  };

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${customerEmail}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.warn('FormSubmit customer confirmation response:', res.status);
  } catch (err) {
    console.warn('FormSubmit customer confirmation failed:', err);
  }
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
