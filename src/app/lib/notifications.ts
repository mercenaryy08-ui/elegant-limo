/**
 * Notification content and API calls for booking lifecycle.
 * Backend implements the actual email/WhatsApp sending.
 */

import { PAYMENT_POLICY, CANCELLATION_POLICY } from './policies';
import { formatCHF } from './pricing';
import { getVehicleById } from './fleet';

const ADMIN_EMAIL = 'aid@sdit-services.com';

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

/**
 * Content for 24h-before pickup reminder (email + WhatsApp).
 * Must include: booking ID, vehicle type, pickup time/date, from/to, passengers,
 * add-ons (VIP), total price, payment method, cancellation policy summary.
 */
export function build24hReminderMessage(booking: BookingForNotification): string {
  const vehicle = getVehicleById(booking.vehicleId);
  const vehicleName = vehicle ? `${vehicle.name} (${vehicle.className})` : '—';
  const addOnsText = booking.addOns?.length ? booking.addOns.join(', ') : 'None';
  const lines = [
    `Booking: ${booking.bookingReference}`,
    `Vehicle: ${vehicleName}`,
    `Pickup: ${booking.date} at ${booking.time}`,
    `From: ${booking.from}`,
    `To: ${booking.to}`,
    `Passengers: ${booking.passengers}`,
    `Add-ons: ${addOnsText}`,
    `Total: ${formatCHF(booking.totalPrice)}`,
    `Payment: ${PAYMENT_POLICY.method}`,
    `Cancellation: ${CANCELLATION_POLICY.summary}`,
  ];
  return lines.join('\n');
}

/**
 * API base URL (from env or default).
 */
function apiBase(): string {
  const env = (import.meta as unknown as { env: Record<string, string> }).env;
  return env?.VITE_API_BASE_URL ?? '/api/v1';
}

/**
 * Send booking confirmation email to customer (immediate, after successful booking).
 */
export async function sendBookingConfirmationEmail(bookingId: string, email: string): Promise<void> {
  await fetch(`${apiBase()}/notifications/booking-confirmation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, email }),
  });
}

/**
 * Send "new booking alert" email to ops (aid@sdit-services.com).
 */
export async function sendNewBookingAlertEmail(booking: BookingForNotification): Promise<void> {
  await fetch(`${apiBase()}/notifications/new-booking-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: ADMIN_EMAIL, booking }),
  });
}

/**
 * Send WhatsApp alert to ops/admin number (immediate, after booking).
 */
export async function sendWhatsAppBookingAlert(booking: BookingForNotification): Promise<void> {
  const text = build24hReminderMessage(booking);
  await fetch(`${apiBase()}/notifications/whatsapp-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, bookingId: booking.id }),
  });
}

/**
 * Trigger 24h-before reminder: email to customer + WhatsApp to ops.
 * Normally called by backend scheduler, not from frontend.
 */
export async function send24hReminder(booking: BookingForNotification): Promise<void> {
  const message = build24hReminderMessage(booking);
  await Promise.all([
    fetch(`${apiBase()}/notifications/24h-reminder-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, email: booking.customerEmail, message }),
    }),
    fetch(`${apiBase()}/notifications/24h-reminder-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, bookingId: booking.id }),
    }),
  ]);
}
