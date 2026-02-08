// Pricing Engine - Swiss Limousine Service

import { Vehicle, VehicleType } from './fleet';

/**
 * Fixed-price routes
 * These override per-km pricing when from/to locations match
 */
export interface FixedRoute {
  id: string;
  from: string[];
  to: string[];
  prices: {
    [VehicleType.STANDARD]: number;
    [VehicleType.PREMIUM]: number;
    [VehicleType.VAN]: number;
  };
  description: string;
}

// All fixed routes with location synonyms
export const FIXED_ROUTES: FixedRoute[] = [
  {
    id: 'zrh-zurich-city',
    from: ['zürich airport', 'zrh', 'zurich airport', 'zürich flughafen', 'zurich flughafen'],
    to: ['zürich city', 'zurich city', 'zurich stadt', 'zürich stadt', 'zurich', 'zürich'],
    prices: {
      [VehicleType.STANDARD]: 80,
      [VehicleType.PREMIUM]: 100,
      [VehicleType.VAN]: 90,
    },
    description: 'Zürich Airport → Zürich City',
  },
  {
    id: 'zrh-basel-city',
    from: ['zürich airport', 'zrh', 'zurich airport', 'zürich flughafen', 'zurich flughafen'],
    to: ['basel city', 'basel stadt', 'basel', 'bsl'],
    prices: {
      [VehicleType.STANDARD]: 420,
      [VehicleType.PREMIUM]: 500,
      [VehicleType.VAN]: 450,
    },
    description: 'Zürich Airport → Basel City',
  },
  {
    id: 'zrh-stmoritz',
    from: ['zürich airport', 'zrh', 'zurich airport', 'zürich flughafen', 'zurich flughafen'],
    to: ['st. moritz', 'st moritz', 'saint moritz', 'stmoritz'],
    prices: {
      [VehicleType.STANDARD]: 800,
      [VehicleType.PREMIUM]: 1000,
      [VehicleType.VAN]: 1000,
    },
    description: 'Zürich Airport → St. Moritz',
  },
];

/**
 * Add-ons available for booking
 */
export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number; // CHF
  icon?: string;
}

export const ADD_ONS: AddOn[] = [
  {
    id: 'vip-meet-inside',
    name: 'VIP Service',
    description: 'Airport meet-and-greet inside the terminal (chauffeur enters the terminal to pick you up)',
    price: 100,
    icon: '✈️',
  },
];

/**
 * Normalize location string for matching
 */
function normalizeLocation(location: string): string {
  return location
    .toLowerCase()
    .trim()
    .replace(/[^a-zäöü0-9\s]/g, '') // Keep only letters, numbers, spaces, and German umlauts
    .replace(/\s+/g, ' ');
}

/**
 * Find matching fixed route
 */
export function findFixedRoute(from: string, to: string): FixedRoute | null {
  const normalizedFrom = normalizeLocation(from);
  const normalizedTo = normalizeLocation(to);

  for (const route of FIXED_ROUTES) {
    const fromMatch = route.from.some((f) => normalizeLocation(f) === normalizedFrom);
    const toMatch = route.to.some((t) => normalizeLocation(t) === normalizedTo);

    if (fromMatch && toMatch) {
      return route;
    }
  }

  // Also check reverse direction
  for (const route of FIXED_ROUTES) {
    const fromMatch = route.to.some((t) => normalizeLocation(t) === normalizedFrom);
    const toMatch = route.from.some((f) => normalizeLocation(f) === normalizedTo);

    if (fromMatch && toMatch) {
      return route;
    }
  }

  return null;
}

/**
 * Price calculation result
 */
export interface PriceCalculation {
  basePrice: number;
  pricingMethod: 'fixed-route' | 'per-km';
  fixedRoute?: FixedRoute;
  distance?: number; // km
  perKmRate?: number;
  addOns: {
    id: string;
    name: string;
    price: number;
  }[];
  addOnsTotal: number;
  subtotal: number;
  currency: 'CHF';
  breakdown: {
    label: string;
    amount: number;
  }[];
}

/**
 * Calculate price for a booking
 */
export function calculatePrice(params: {
  from: string;
  to: string;
  vehicle: Vehicle;
  distance?: number; // km, required if not a fixed route
  selectedAddOns?: string[];
}): PriceCalculation {
  const { from, to, vehicle, distance, selectedAddOns = [] } = params;

  // Check for fixed route first
  const fixedRoute = findFixedRoute(from, to);

  let basePrice: number;
  let pricingMethod: 'fixed-route' | 'per-km';
  let breakdown: { label: string; amount: number }[] = [];

  if (fixedRoute) {
    // Use fixed price
    basePrice = fixedRoute.prices[vehicle.type];
    pricingMethod = 'fixed-route';
    breakdown.push({
      label: fixedRoute.description,
      amount: basePrice,
    });
  } else {
    // Calculate per-km
    if (!distance || distance <= 0) {
      throw new Error('Distance is required for non-fixed routes');
    }
    basePrice = distance * vehicle.perKmRate;
    pricingMethod = 'per-km';
    breakdown.push({
      label: `Distance: ${distance.toFixed(1)} km × ${vehicle.perKmRate.toFixed(2)} CHF/km`,
      amount: basePrice,
    });
  }

  // Add-ons
  const addOns = ADD_ONS.filter((addon) => selectedAddOns.includes(addon.id)).map((addon) => ({
    id: addon.id,
    name: addon.name,
    price: addon.price,
  }));

  const addOnsTotal = addOns.reduce((sum, addon) => sum + addon.price, 0);

  // Add-ons to breakdown
  addOns.forEach((addon) => {
    breakdown.push({
      label: addon.name,
      amount: addon.price,
    });
  });

  const subtotal = basePrice + addOnsTotal;

  return {
    basePrice,
    pricingMethod,
    fixedRoute: fixedRoute || undefined,
    distance: pricingMethod === 'per-km' ? distance : undefined,
    perKmRate: pricingMethod === 'per-km' ? vehicle.perKmRate : undefined,
    addOns,
    addOnsTotal,
    subtotal,
    currency: 'CHF',
    breakdown,
  };
}

/**
 * Format CHF currency
 */
export function formatCHF(amount: number): string {
  return `${amount.toFixed(2)} CHF`;
}

/**
 * Get add-on by ID
 */
export function getAddOnById(id: string): AddOn | undefined {
  return ADD_ONS.find((addon) => addon.id === id);
}
