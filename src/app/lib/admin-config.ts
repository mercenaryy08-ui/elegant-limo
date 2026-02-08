// Admin Configuration & Controls

import { ClosedSlot } from './availability';
import { FlightDelayConfig, DEFAULT_DELAY_CONFIG } from './policies';

/**
 * Admin configuration (in production, this would be stored in database)
 */
export interface AdminConfig {
  closedSlots: ClosedSlot[];
  flightDelayConfig: FlightDelayConfig;
  minimumAdvanceHours: number;
  bufferBetweenBookingsMinutes: number;
}

// Default admin configuration
// In production, this would be fetched from database/API
export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  closedSlots: [],
  flightDelayConfig: DEFAULT_DELAY_CONFIG,
  minimumAdvanceHours: 2,
  bufferBetweenBookingsMinutes: 30,
};

/**
 * Mock closed slots for demonstration
 * In production, these would be managed through an admin dashboard
 */
export const MOCK_CLOSED_SLOTS: ClosedSlot[] = [
  // Example: New Year's Eve - all vehicles closed
  {
    id: 'closed-nye-2026',
    date: '2026-12-31',
    startTime: '00:00',
    endTime: '23:59',
    reason: 'New Year\'s Eve - Closed',
  },
  // Example: Vehicle maintenance
  {
    id: 'maintenance-standard-2026-02-15',
    vehicleId: 'vehicle-standard-eclass',
    date: '2026-02-15',
    startTime: '08:00',
    endTime: '14:00',
    reason: 'Vehicle Maintenance',
  },
];

/**
 * Admin API endpoints documentation
 * These would be implemented in the backend
 */
export const ADMIN_API_ENDPOINTS = {
  // Closed Slots Management
  getClosedSlots: 'GET /api/admin/closed-slots',
  createClosedSlot: 'POST /api/admin/closed-slots',
  updateClosedSlot: 'PATCH /api/admin/closed-slots/:id',
  deleteClosedSlot: 'DELETE /api/admin/closed-slots/:id',

  // Delay Configuration
  getDelayConfig: 'GET /api/admin/delay-config',
  updateDelayConfig: 'PATCH /api/admin/delay-config',

  // Fixed Routes Management
  getFixedRoutes: 'GET /api/admin/fixed-routes',
  createFixedRoute: 'POST /api/admin/fixed-routes',
  updateFixedRoute: 'PATCH /api/admin/fixed-routes/:id',
  deleteFixedRoute: 'DELETE /api/admin/fixed-routes/:id',
  addRouteSynonym: 'POST /api/admin/fixed-routes/:id/synonyms',

  // Bookings Management
  getAllBookings: 'GET /api/admin/bookings',
  getBooking: 'GET /api/admin/bookings/:id',
  updateBookingStatus: 'PATCH /api/admin/bookings/:id/status',
  assignDriver: 'POST /api/admin/bookings/:id/assign-driver',

  // Reports
  getBookingStats: 'GET /api/admin/reports/booking-stats',
  getRevenueReport: 'GET /api/admin/reports/revenue',
  getVehicleUtilization: 'GET /api/admin/reports/vehicle-utilization',
};

/**
 * Admin dashboard data structures
 */
export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
}

export interface VehicleUtilization {
  vehicleId: string;
  vehicleName: string;
  totalBookings: number;
  totalHours: number;
  utilizationPercentage: number;
  revenue: number;
}

/**
 * Closed slot management functions
 * In production, these would call API endpoints
 */
export class ClosedSlotManager {
  private slots: ClosedSlot[] = [...MOCK_CLOSED_SLOTS];

  getAll(): ClosedSlot[] {
    return [...this.slots];
  }

  getByDate(date: string): ClosedSlot[] {
    return this.slots.filter((slot) => slot.date === date);
  }

  getByVehicle(vehicleId: string): ClosedSlot[] {
    return this.slots.filter((slot) => slot.vehicleId === vehicleId || !slot.vehicleId);
  }

  create(slot: Omit<ClosedSlot, 'id'>): ClosedSlot {
    const newSlot: ClosedSlot = {
      ...slot,
      id: `closed-${Date.now()}`,
    };
    this.slots.push(newSlot);
    return newSlot;
  }

  update(id: string, updates: Partial<ClosedSlot>): ClosedSlot | null {
    const index = this.slots.findIndex((s) => s.id === id);
    if (index === -1) return null;

    this.slots[index] = { ...this.slots[index], ...updates };
    return this.slots[index];
  }

  delete(id: string): boolean {
    const index = this.slots.findIndex((s) => s.id === id);
    if (index === -1) return false;

    this.slots.splice(index, 1);
    return true;
  }

  /**
   * Validate closed slot
   */
  validate(slot: Omit<ClosedSlot, 'id'>): { valid: boolean; error?: string } {
    // Check date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(slot.date)) {
      return { valid: false, error: 'Invalid date format (use YYYY-MM-DD)' };
    }

    // Check time format
    if (!/^\d{2}:\d{2}$/.test(slot.startTime) || !/^\d{2}:\d{2}$/.test(slot.endTime)) {
      return { valid: false, error: 'Invalid time format (use HH:MM)' };
    }

    // Check start time is before end time
    const startMinutes = parseInt(slot.startTime.split(':')[0]) * 60 + parseInt(slot.startTime.split(':')[1]);
    const endMinutes = parseInt(slot.endTime.split(':')[0]) * 60 + parseInt(slot.endTime.split(':')[1]);

    if (startMinutes >= endMinutes) {
      return { valid: false, error: 'Start time must be before end time' };
    }

    return { valid: true };
  }
}

/**
 * Fixed route synonym management
 */
export interface RouteSynonym {
  routeId: string;
  location: string;
  type: 'from' | 'to';
}

export class RouteSynonymManager {
  /**
   * Add a synonym to a fixed route
   */
  addSynonym(synonym: RouteSynonym): { success: boolean; error?: string } {
    // In production, this would call API
    // Validate synonym
    if (!synonym.location || synonym.location.trim().length < 2) {
      return { success: false, error: 'Location name too short' };
    }

    return { success: true };
  }

  /**
   * Remove a synonym from a fixed route
   */
  removeSynonym(routeId: string, location: string, type: 'from' | 'to'): boolean {
    // In production, this would call API
    return true;
  }

  /**
   * Get all synonyms for a route
   */
  getSynonyms(routeId: string): { from: string[]; to: string[] } {
    // In production, this would call API
    return { from: [], to: [] };
  }
}

/**
 * Delay configuration management
 */
export class DelayConfigManager {
  private config: FlightDelayConfig = { ...DEFAULT_DELAY_CONFIG };

  get(): FlightDelayConfig {
    return { ...this.config };
  }

  update(updates: Partial<FlightDelayConfig>): FlightDelayConfig {
    this.config = { ...this.config, ...updates };
    return { ...this.config };
  }

  reset(): FlightDelayConfig {
    this.config = { ...DEFAULT_DELAY_CONFIG };
    return { ...this.config };
  }

  /**
   * Validate delay configuration
   */
  validate(config: Partial<FlightDelayConfig>): { valid: boolean; error?: string } {
    if (config.freeWaitingMinutes !== undefined && config.freeWaitingMinutes < 0) {
      return { valid: false, error: 'Free waiting minutes cannot be negative' };
    }

    if (config.fixedAmount !== undefined && config.fixedAmount < 0) {
      return { valid: false, error: 'Fixed amount cannot be negative' };
    }

    if (config.perIntervalAmount !== undefined && config.perIntervalAmount < 0) {
      return { valid: false, error: 'Per-interval amount cannot be negative' };
    }

    if (config.intervalMinutes !== undefined && config.intervalMinutes <= 0) {
      return { valid: false, error: 'Interval minutes must be positive' };
    }

    return { valid: true };
  }
}

// Singleton instances for development
export const closedSlotManager = new ClosedSlotManager();
export const routeSynonymManager = new RouteSynonymManager();
export const delayConfigManager = new DelayConfigManager();
