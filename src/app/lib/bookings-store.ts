/**
 * localStorage-based bookings store.
 * Persists bookings across page reloads so the ops dashboard/calendar can display them.
 */

import type { AdminBooking, BookingStatus } from './ops-api';

const STORAGE_KEY = 'elegant_limo_bookings';

function readAll(): AdminBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AdminBooking[];
  } catch {
    return [];
  }
}

function writeAll(bookings: AdminBooking[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.warn('Failed to write bookings to localStorage:', e);
  }
}

/** Get all bookings, optionally filtered */
export function getBookings(params?: {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}): AdminBooking[] {
  let list = readAll();
  if (params?.status) {
    list = list.filter((b) => b.status === params.status);
  }
  if (params?.startDate) {
    list = list.filter((b) => b.date >= params.startDate!);
  }
  if (params?.endDate) {
    list = list.filter((b) => b.date <= params.endDate!);
  }
  // Sort by date descending (newest first)
  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return list;
}

/** Get bookings for a specific date (yyyy-MM-dd) */
export function getBookingsForDate(date: string): AdminBooking[] {
  return readAll().filter((b) => b.date === date && b.status !== 'cancelled');
}

/** Add a new booking */
export function addBooking(booking: AdminBooking): void {
  const all = readAll();
  // Prevent duplicates by bookingReference
  if (all.some((b) => b.bookingReference === booking.bookingReference)) return;
  all.push(booking);
  writeAll(all);
}

/** Update booking status */
export function updateBookingStatus(bookingId: string, status: BookingStatus): void {
  const all = readAll();
  const idx = all.findIndex((b) => b.id === bookingId);
  if (idx !== -1) {
    all[idx].status = status;
    all[idx].updatedAt = new Date().toISOString();
    writeAll(all);
  }
}

/** Delete a booking */
export function deleteBooking(bookingId: string): void {
  const all = readAll().filter((b) => b.id !== bookingId);
  writeAll(all);
}

/** Get a single booking by ID */
export function getBookingById(id: string): AdminBooking | undefined {
  return readAll().find((b) => b.id === id);
}
