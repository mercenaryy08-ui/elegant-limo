# Pricing Rules - Quick Reference Card

## Fleet Rates

```
Standard (E-Class)  →  4.20 CHF/km  (1-3 pax)
Premium (S-Class)   →  5.00 CHF/km  (1-3 pax)
Van (V-Class)       →  4.50 CHF/km  (1-7 pax)
```

## Pricing Logic

### Default: Per-km Pricing
```
Price = Distance (km) × Per-km Rate
```

### Fixed Routes (Override Per-km)

#### ZRH → Zürich City
| Vehicle  | Price    |
|----------|----------|
| Standard | 80 CHF   |
| Premium  | 100 CHF  |
| Van      | 90 CHF   |

#### ZRH → Basel City
| Vehicle  | Price    |
|----------|----------|
| Standard | 420 CHF  |
| Premium  | 500 CHF  |
| Van      | 450 CHF  |

#### ZRH → St. Moritz
| Vehicle  | Price     |
|----------|-----------|
| Standard | 800 CHF   |
| Premium  | 1000 CHF  |
| Van      | 1000 CHF  |

## Add-ons

```
VIP Meet Inside Airport  →  +100 CHF
```

## Payment

```
✓ Card on Vehicle (ONLY payment method)
✗ Cash NOT accepted
✗ NO upfront payment required
```

## Cancellation

| Time Before Pickup | Refund | Fee     |
|--------------------|--------|---------|
| ≥48 hours          | 100%   | 0%      |
| 24-48 hours        | 100%   | 0%      |
| <24 hours          | 50%    | 50%     |

## Flight Delays

```
First 60 minutes:  FREE
After 60 minutes:  50 CHF per 30-min interval
```

**Examples**:
- 75 min delay  →  50 CHF
- 120 min delay →  100 CHF
- 140 min delay →  150 CHF

## Booking Rules

```
✓ Minimum advance: 2 hours
✓ Buffer between bookings: 30 minutes
✓ Max passengers per vehicle: See capacity
✗ Service NOT available: 2:00 AM - 5:00 AM
```

## Code Usage

### Calculate Price

```typescript
import { calculatePrice, formatCHF } from './lib/pricing';
import { getVehicleById } from './lib/fleet';

const vehicle = getVehicleById('vehicle-standard-eclass');
const price = calculatePrice({
  from: 'Zürich Airport',
  to: 'Zürich City',
  vehicle,
  distance: 15, // Only needed if not fixed-route
  selectedAddOns: ['vip-meet-inside'],
});

console.log(formatCHF(price.subtotal)); // "180.00 CHF"
console.log(price.pricingMethod); // "fixed-route" or "per-km"
```

### Check Availability

```typescript
import { isVehicleAvailable } from './lib/availability';

const availability = isVehicleAvailable({
  vehicleId: 'vehicle-standard-eclass',
  date: '2026-02-08',
  time: '10:00',
  estimatedDuration: 120, // minutes
  existingBookings: bookings, // from API
  closedSlots: slots, // from API
});

if (availability.available) {
  console.log('Vehicle is available');
} else {
  console.log(availability.reason); // "Vehicle is already booked..."
}
```

### Calculate Cancellation Refund

```typescript
import { calculateCancellationRefund } from './lib/policies';

const refund = calculateCancellationRefund(
  500, // total amount CHF
  new Date('2026-02-13 09:00'), // cancellation time
  new Date('2026-02-15 10:00')  // pickup time
);

console.log(refund.refundPercentage); // 100
console.log(refund.refundAmount);     // 500
console.log(refund.reason);           // "Free cancellation..."
```

### Calculate Delay Surcharge

```typescript
import { calculateFlightDelaySurcharge } from './lib/policies';

const delay = calculateFlightDelaySurcharge(
  140, // delay in minutes
  {
    enabled: true,
    freeWaitingMinutes: 60,
    chargeType: 'per-interval',
    perIntervalAmount: 50,
    intervalMinutes: 30,
  }
);

console.log(delay.surcharge);  // 150 CHF
console.log(delay.intervals);  // 3
console.log(delay.reason);     // "Delay charge: 3 × 30 min intervals"
```

### Generate Invoice

```typescript
import { generateInvoiceLineItems, formatCHF } from './lib/policies';

const items = generateInvoiceLineItems({
  basePrice: 80,
  basePriceDescription: 'Zürich Airport → Zürich City',
  addOns: [
    { name: 'VIP Meet Inside Airport', price: 100 }
  ],
});

items.forEach(item => {
  console.log(`${item.description}: ${formatCHF(item.amount)}`);
});
// Output:
// Zürich Airport → Zürich City: 80.00 CHF
// VIP Meet Inside Airport: 100.00 CHF
// Total: 180.00 CHF
```

## Location Synonym Matching

The system automatically recognizes these variations:

### Zürich Airport
```
✓ Zürich Airport
✓ ZRH
✓ Zurich Airport
✓ Zürich Flughafen
✓ Zurich Flughafen
```

### Zürich City
```
✓ Zürich City
✓ Zurich City
✓ Zurich Stadt
✓ Zürich Stadt
✓ Zurich
✓ Zürich
```

### Basel
```
✓ Basel City
✓ Basel Stadt
✓ Basel
✓ BSL
```

### St. Moritz
```
✓ St. Moritz
✓ St Moritz
✓ Saint Moritz
✓ StMoritz
```

**Note**: Matching is case-insensitive and ignores special characters.

---

## Quick Test Commands

```bash
# Test fixed-route detection
const route = findFixedRoute('ZRH', 'Zurich');
console.log(route?.id); // 'zrh-zurich-city'

# Test capacity filtering
const available = getAvailableVehicles(5);
console.log(available.length); // 1 (only Van)

# Format currency
console.log(formatCHF(123.45)); // "123.45 CHF"
```

---

**Last Updated**: 2026-02-08  
**System Version**: 2.0  
**Currency**: CHF (Swiss Francs)
