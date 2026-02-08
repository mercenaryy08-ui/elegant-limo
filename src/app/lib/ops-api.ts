/**
 * Ops/Admin API: bookings list, resend email, decline, working hours (closed slots).
 * In production, replace the mock implementations with real fetch() to your backend.
 */

import type { ClosedSlot } from './availability';
import { closedSlotManager } from './admin-config';
import { getVehicleById } from './fleet';

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

const apiBase = () =>
  (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_BASE_URL ?? '';

/** Fetch all bookings (admin). In production: GET /api/admin/bookings */
export async function fetchBookings(params?: {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}): Promise<AdminBooking[]> {
  if (apiBase()) {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);
    const res = await fetch(`${apiBase()}/api/admin/bookings?${q}`);
    if (res.ok) {
      const data = await res.json();
      return data.data?.bookings ?? data.bookings ?? [];
    }
  }
  return getMockBookings();
}

/** Resend confirmation email. In production: POST /api/admin/bookings/:id/resend-confirmation */
export async function resendBookingConfirmation(bookingId: string): Promise<void> {
  if (apiBase()) {
    await fetch(`${apiBase()}/api/admin/bookings/${bookingId}/resend-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return;
  }
  await new Promise((r) => setTimeout(r, 400));
}

/** Decline/cancel booking. In production: PATCH /api/admin/bookings/:id/status with status: 'cancelled' */
export async function declineBooking(bookingId: string, reason?: string): Promise<void> {
  if (apiBase()) {
    await fetch(`${apiBase()}/api/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled', declineReason: reason }),
    });
    return;
  }
  await new Promise((r) => setTimeout(r, 400));
}

/** Confirm a pending booking. In production: PATCH .../status with status: 'confirmed' */
export async function confirmBooking(bookingId: string): Promise<void> {
  if (apiBase()) {
    await fetch(`${apiBase()}/api/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' }),
    });
    return;
  }
  await new Promise((r) => setTimeout(r, 400));
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

function getMockBookings(): AdminBooking[] {
  return [
    {
      id: 'mock-1',
      bookingReference: 'EL12345001',
      status: 'pending',
      from: 'Zürich Airport',
      to: 'Zürich City',
      date: new Date().toISOString().slice(0, 10),
      time: '14:00',
      passengers: 2,
      vehicleId: 'vehicle-premium-sclass',
      totalPrice: 100,
      customerDetails: {
        firstName: 'Anna',
        lastName: 'Muster',
        email: 'anna@example.com',
        phone: '+41 79 123 4567',
        specialRequests: 'Flight LX 123',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mock-2',
      bookingReference: 'EL12345002',
      status: 'confirmed',
      from: 'Genève Airport',
      to: 'Lausanne',
      date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      time: '10:00',
      passengers: 3,
      vehicleId: 'vehicle-van-vclass',
      totalPrice: 280,
      customerDetails: {
        firstName: 'Max',
        lastName: 'Example',
        email: 'max@example.com',
        phone: '+41 78 987 6543',
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}
