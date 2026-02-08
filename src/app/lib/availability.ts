// Availability & Overlap Detection

import { Vehicle } from './fleet';

/**
 * Booking record for overlap detection
 */
export interface BookingRecord {
  id: string;
  vehicleId: string;
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:MM
  estimatedDuration: number; // minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

/**
 * Closed slot (admin-defined)
 */
export interface ClosedSlot {
  id: string;
  vehicleId?: string; // If undefined, applies to all vehicles
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  reason?: string;
}

/**
 * Convert date and time to timestamp for comparison
 */
function toTimestamp(date: string, time: string): number {
  return new Date(`${date}T${time}:00`).getTime();
}

/**
 * Check if two time ranges overlap
 */
function doTimeRangesOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Check if a vehicle is available at the requested time
 * Considers existing bookings and closed slots
 */
export function isVehicleAvailable(params: {
  vehicleId: string;
  date: string;
  time: string;
  estimatedDuration: number; // minutes
  existingBookings: BookingRecord[];
  closedSlots: ClosedSlot[];
  excludeBookingId?: string; // For checking availability when modifying an existing booking
}): {
  available: boolean;
  reason?: string;
  conflictingBooking?: BookingRecord;
  conflictingSlot?: ClosedSlot;
} {
  const { vehicleId, date, time, estimatedDuration, existingBookings, closedSlots, excludeBookingId } =
    params;

  const requestStart = toTimestamp(date, time);
  const requestEnd = requestStart + estimatedDuration * 60 * 1000;

  // Add 30-minute buffer before and after each booking
  const bufferMinutes = 30;
  const requestStartWithBuffer = requestStart - bufferMinutes * 60 * 1000;
  const requestEndWithBuffer = requestEnd + bufferMinutes * 60 * 1000;

  // Check existing bookings for this vehicle
  const conflictingBookings = existingBookings.filter((booking) => {
    // Skip if it's the same booking (when modifying)
    if (excludeBookingId && booking.id === excludeBookingId) {
      return false;
    }

    // Skip cancelled bookings
    if (booking.status === 'cancelled') {
      return false;
    }

    // Only check same vehicle
    if (booking.vehicleId !== vehicleId) {
      return false;
    }

    // Only check same date
    if (booking.pickupDate !== date) {
      return false;
    }

    const bookingStart = toTimestamp(booking.pickupDate, booking.pickupTime);
    const bookingEnd = bookingStart + booking.estimatedDuration * 60 * 1000;
    const bookingStartWithBuffer = bookingStart - bufferMinutes * 60 * 1000;
    const bookingEndWithBuffer = bookingEnd + bufferMinutes * 60 * 1000;

    return doTimeRangesOverlap(
      requestStartWithBuffer,
      requestEndWithBuffer,
      bookingStartWithBuffer,
      bookingEndWithBuffer
    );
  });

  if (conflictingBookings.length > 0) {
    return {
      available: false,
      reason: 'Vehicle is already booked for an overlapping time',
      conflictingBooking: conflictingBookings[0],
    };
  }

  // Check closed slots
  const conflictingSlots = closedSlots.filter((slot) => {
    // Check if slot applies to this vehicle or all vehicles
    if (slot.vehicleId && slot.vehicleId !== vehicleId) {
      return false;
    }

    // Only check same date
    if (slot.date !== date) {
      return false;
    }

    const slotStart = toTimestamp(slot.date, slot.startTime);
    const slotEnd = toTimestamp(slot.date, slot.endTime);

    return doTimeRangesOverlap(requestStart, requestEnd, slotStart, slotEnd);
  });

  if (conflictingSlots.length > 0) {
    return {
      available: false,
      reason: conflictingSlots[0].reason || 'This time slot is not available',
      conflictingSlot: conflictingSlots[0],
    };
  }

  return { available: true };
}

/**
 * Get all available vehicles for a given time slot
 */
export function getAvailableVehicles(params: {
  vehicles: Vehicle[];
  date: string;
  time: string;
  estimatedDuration: number;
  passengerCount: number;
  existingBookings: BookingRecord[];
  closedSlots: ClosedSlot[];
}): Vehicle[] {
  const { vehicles, date, time, estimatedDuration, passengerCount, existingBookings, closedSlots } =
    params;

  return vehicles.filter((vehicle) => {
    // Check capacity
    if (passengerCount < vehicle.capacity.min || passengerCount > vehicle.capacity.max) {
      return false;
    }

    // Check availability
    const availability = isVehicleAvailable({
      vehicleId: vehicle.id,
      date,
      time,
      estimatedDuration,
      existingBookings,
      closedSlots,
    });

    return availability.available;
  });
}

/**
 * Estimate trip duration based on distance
 * Assumes average speed of 60 km/h
 */
export function estimateTripDuration(distanceKm: number): number {
  const averageSpeedKmh = 60;
  const durationHours = distanceKm / averageSpeedKmh;
  const durationMinutes = Math.ceil(durationHours * 60);
  
  // Add 15-minute buffer
  return durationMinutes + 15;
}

/**
 * Check if a date/time is in the past
 */
export function isDateTimeInPast(date: string, time: string): boolean {
  const dateTime = toTimestamp(date, time);
  return dateTime < Date.now();
}

/**
 * Check if booking meets minimum advance notice
 * Minimum 2 hours advance notice required
 */
export function meetsMinimumAdvanceNotice(date: string, time: string): {
  valid: boolean;
  reason?: string;
} {
  const bookingTime = toTimestamp(date, time);
  const now = Date.now();
  const minimumAdvanceMs = 2 * 60 * 60 * 1000; // 2 hours

  if (bookingTime < now + minimumAdvanceMs) {
    return {
      valid: false,
      reason: 'Bookings require at least 2 hours advance notice',
    };
  }

  return { valid: true };
}
