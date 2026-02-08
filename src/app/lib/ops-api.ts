/**
 * Ops/Admin API: bookings list, resend email, decline, working hours (closed slots).
 * Uses localStorage-based bookings store for persistence without a backend.
 */

import type { ClosedSlot } from './availability';
import { closedSlotManager } from './admin-config';
import { getVehicleById } from './fleet';
import {
  getBookings as storeGetBookings,
  updateBookingStatus as storeUpdateStatus,
} from './bookings-store';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface AdminBooking {
  id: string;
  bookingReference: string;
  status: BookingStatus;
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
  vehicleId: string;
  totalPrice: number;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/** Fetch all bookings from localStorage store */
export async function fetchBookings(params?: {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}): Promise<AdminBooking[]> {
  return storeGetBookings(params);
}

/** Resend confirmation email (placeholder — logs to console) */
export async function resendBookingConfirmation(bookingId: string): Promise<void> {
  console.log('Resend confirmation for:', bookingId);
  await new Promise((r) => setTimeout(r, 300));
}

/** Decline/cancel booking — updates localStorage */
export async function declineBooking(bookingId: string, _reason?: string): Promise<void> {
  storeUpdateStatus(bookingId, 'cancelled');
}

/** Confirm a pending booking — updates localStorage */
export async function confirmBooking(bookingId: string): Promise<void> {
  storeUpdateStatus(bookingId, 'confirmed');
}

// —— Closed slots (working hours): use in-memory manager; in production call API ——

export function getClosedSlots(): ClosedSlot[] {
  return closedSlotManager.getAll();
}

export function createClosedSlot(slot: Omit<ClosedSlot, 'id'>): { success: boolean; slot?: ClosedSlot; error?: string } {
  const valid = closedSlotManager.validate(slot);
  if (!valid.valid) return { success: false, error: valid.error };
  const created = closedSlotManager.create(slot);
  return { success: true, slot: created };
}

export function updateClosedSlot(id: string, updates: Partial<Omit<ClosedSlot, 'id'>>): { success: boolean; error?: string } {
  const slot = closedSlotManager.getAll().find((s) => s.id === id);
  if (!slot) return { success: false, error: 'Slot not found' };
  const merged = { ...slot, ...updates };
  const valid = closedSlotManager.validate(merged);
  if (!valid.valid) return { success: false, error: valid.error };
  closedSlotManager.update(id, updates);
  return { success: true };
}

export function deleteClosedSlot(id: string): boolean {
  return closedSlotManager.delete(id);
}

/** Human-readable vehicle name */
export function getVehicleName(vehicleId: string): string {
  const v = getVehicleById(vehicleId);
  return v ? `${v.name} (${v.className})` : vehicleId;
}
