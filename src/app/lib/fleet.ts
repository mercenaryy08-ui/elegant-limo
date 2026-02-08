// Fleet Management - Swiss Limousine Service

export enum VehicleType {
  STANDARD = 'standard',
  PREMIUM = 'premium',
  VAN = 'van',
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  name: string;
  className: string; // Mercedes class
  capacity: {
    min: number;
    max: number;
  };
  perKmRate: number; // CHF per kilometer
  description: string;
  features: string[];
  imageUrl?: string;
}

// The fleet: only these 3 vehicles exist
export const FLEET: Vehicle[] = [
  {
    id: 'vehicle-standard-eclass',
    type: VehicleType.STANDARD,
    name: 'Standard',
    className: 'Mercedes E-Class',
    capacity: { min: 1, max: 3 },
    perKmRate: 4.20,
    description: 'Elegant and comfortable for up to 3 passengers',
    features: ['Leather seats', 'Climate control', 'Wi-Fi'],
  },
  {
    id: 'vehicle-premium-sclass',
    type: VehicleType.PREMIUM,
    name: 'Premium',
    className: 'Mercedes S-Class',
    capacity: { min: 1, max: 3 },
    perKmRate: 5.00,
    description: 'Ultimate luxury for up to 3 passengers',
    features: ['Premium leather', 'Massage seats', 'Champagne bar', 'Wi-Fi'],
  },
  {
    id: 'vehicle-van-vclass',
    type: VehicleType.VAN,
    name: 'Van',
    className: 'Mercedes V-Class',
    capacity: { min: 1, max: 7 },
    perKmRate: 4.50,
    description: 'Spacious luxury for up to 7 passengers',
    features: ['Spacious interior', 'Captain seats', 'Extra luggage space', 'Wi-Fi'],
  },
];

/**
 * Get available vehicles based on passenger count
 */
export function getAvailableVehicles(passengerCount: number): Vehicle[] {
  return FLEET.filter(
    (vehicle) => passengerCount >= vehicle.capacity.min && passengerCount <= vehicle.capacity.max
  );
}

/**
 * Get a specific vehicle by ID
 */
export function getVehicleById(vehicleId: string): Vehicle | undefined {
  return FLEET.find((v) => v.id === vehicleId);
}

/**
 * Get a specific vehicle by type
 */
export function getVehicleByType(type: VehicleType): Vehicle | undefined {
  return FLEET.find((v) => v.type === type);
}

/**
 * Check if vehicle can accommodate passenger count
 */
export function canVehicleAccommodate(vehicleId: string, passengerCount: number): boolean {
  const vehicle = getVehicleById(vehicleId);
  if (!vehicle) return false;
  return passengerCount >= vehicle.capacity.min && passengerCount <= vehicle.capacity.max;
}
