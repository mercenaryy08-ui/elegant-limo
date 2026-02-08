# Elegant Limo - Business Logic & Rules

## Overview

This document outlines all business rules, calculations, and logic flows for the Elegant Limo booking system.

---

## 1. Booking Flow Logic

### Step 1: Home Page (Initial Booking)

**Input Requirements**:
- From Location (string, required, min 3 characters)
- To Location (string, required, min 3 characters)
- Date (Date, required, must be today or future)
- Time (string, required, HH:MM format)
- Passengers (number, required, 1-8 inclusive)

**Validation Rules**:
```typescript
// Date validation
const today = new Date();
today.setHours(0, 0, 0, 0);
if (selectedDate < today) {
  error('Date cannot be in the past');
}

// Passenger validation
if (passengers < 1 || passengers > 8) {
  error('Passengers must be between 1 and 8');
}

// Location validation
if (from.trim().length < 3 || to.trim().length < 3) {
  error('Location must be at least 3 characters');
}
```

**Business Rules**:
- Bookings can be made 24/7 year-round
- Minimum advance booking: Same day (no restriction)
- Maximum advance booking: 1 year (365 days)
- Same pickup and dropoff location: Not allowed
- International bookings: Not supported in Phase 1

**Data Storage**:
```typescript
BookingContext.updateBookingData({
  from: string,
  to: string,
  date: 'YYYY-MM-DD',
  time: 'HH:MM',
  passengers: number,
});
```

**Navigation**:
- Success → `/calculate-price`
- Cancel → Stay on page

---

### Step 2: Calculate Price Page

**Input from Previous Step**:
- From, To, Date, Time, Passengers (from context)

**Price Calculation Logic**:

```typescript
function calculateBasePrice(from: string, to: string, passengers: number): number {
  // Mock calculation for Phase 1
  // In production, this would call an API that:
  // 1. Geocodes addresses to coordinates
  // 2. Calculates distance using Google Maps
  // 3. Applies zone-based pricing
  
  // Simulated calculation:
  const baseRate = 100; // Base rate
  const randomDistance = Math.random() * 50; // 0-50 miles
  const perMileRate = 4; // $4 per mile
  const passengerMultiplier = 1 + (passengers - 1) * 0.1; // 10% per additional passenger
  
  const calculatedPrice = (baseRate + (randomDistance * perMileRate)) * passengerMultiplier;
  
  return Math.round(calculatedPrice);
}
```

**Real Price Calculation (Production)**:

```typescript
// POST /api/v1/calculate-price
interface PriceRequest {
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
}

interface PriceResponse {
  basePrice: number;
  distance: number; // miles
  estimatedDuration: number; // minutes
  priceBreakdown: {
    baseRate: number;
    distanceRate: number;
    timeRate: number;
    passengerSurcharge: number;
    peakHourSurcharge: number;
    totalBasePrice: number;
  };
  availableAddOns: AddOn[];
}
```

**Pricing Factors**:
1. **Base Rate**: $100 (varies by vehicle class)
2. **Distance**: $4 per mile
3. **Time**: $1.50 per minute (for long trips)
4. **Passengers**: 10% surcharge per additional passenger beyond 1
5. **Peak Hours**: 20% surcharge (Mon-Fri 6-9am, 4-7pm)
6. **Special Dates**: 50% surcharge (New Year's Eve, major holidays)
7. **Airport Pickup/Dropoff**: $25 flat fee

**Add-ons**:

| Add-on | Price | Rules |
|--------|-------|-------|
| Champagne Service | $150 | Age verification required |
| Airport Meet & Greet | $75 | Only for airport pickups |
| Child Safety Seat | $25 | One per child, max 3 |
| Red Carpet Service | $200 | Requires 48hr advance notice |

**Selection Logic**:
```typescript
// Multiple add-ons allowed
const selectedAddOns = ['champagne', 'redCarpet'];

// Calculate total
const addOnTotal = ADD_ONS
  .filter(addon => selectedAddOns.includes(addon.id))
  .reduce((sum, addon) => sum + addon.price, 0);

const totalPrice = basePrice + addOnTotal;
```

**Business Rules**:
- Minimum booking total: $50
- Maximum booking total: $5,000 (contact for higher)
- Add-ons can be added/removed until checkout
- Prices shown in USD only (Phase 1)
- Tax calculation: 8.875% (NY State) - added at backend
- Prices include gratuity: No, customer pays 15-20% separately

**Data Storage**:
```typescript
BookingContext.updateBookingData({
  basePrice: number,
  selectedAddOns: string[],
  totalPrice: number,
});
```

**Navigation**:
- Success → `/checkout`
- Back → `/` (with data preserved)

---

### Step 3: Checkout Page

**Input from Previous Steps**:
- All booking data from context

**Customer Details Validation**:

```typescript
// Email validation
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
if (!emailRegex.test(email)) {
  error('Invalid email address');
}

// Phone validation (flexible format)
const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
if (!phoneRegex.test(phone)) {
  error('Invalid phone number');
}

// Name validation
if (firstName.length < 2 || lastName.length < 2) {
  error('Name must be at least 2 characters');
}
```

**Payment Validation**:

```typescript
// Card number (Luhn algorithm in production)
const cardRegex = /^[\d\s]{12,19}$/;

// Expiry date
const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
const [month, year] = expiryDate.split('/');
const expiryYear = parseInt('20' + year);
const expiryMonth = parseInt(month);
const now = new Date();
if (expiryYear < now.getFullYear() || 
   (expiryYear === now.getFullYear() && expiryMonth < now.getMonth() + 1)) {
  error('Card has expired');
}

// CVV
const cvvRegex = /^\d{3,4}$/;
```

**Special Requests**:
- Max length: 500 characters
- Allowed characters: Alphanumeric, spaces, basic punctuation
- Sanitized on backend to prevent XSS

**Terms & Conditions**:
- Both checkboxes must be checked
- User must actively check (not pre-checked)
- Terms link: `/terms` (to be created)
- Privacy link: `/privacy` (to be created)

**Booking Submission Flow**:

```typescript
async function submitBooking(data: BookingFormData) {
  // 1. Validate all data
  validateCustomerDetails(data);
  validatePaymentDetails(data);
  
  // 2. Create payment intent (Stripe)
  const paymentIntent = await createPaymentIntent({
    amount: bookingData.totalPrice,
    metadata: { ...bookingData }
  });
  
  // 3. Confirm payment
  const paymentResult = await stripe.confirmCardPayment(
    paymentIntent.client_secret,
    {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone
        }
      }
    }
  );
  
  if (paymentResult.error) {
    throw new Error(paymentResult.error.message);
  }
  
  // 4. Create booking in database
  const booking = await createBooking({
    ...bookingData,
    customerDetails: data,
    paymentTransactionId: paymentResult.paymentIntent.id,
    status: 'confirmed',
    paymentStatus: 'completed'
  });
  
  // 5. Send confirmation email
  await sendBookingConfirmation(booking);
  
  // 6. Send SMS notification (optional)
  await sendSMSConfirmation(booking);
  
  return booking;
}
```

**Booking Reference Generation**:
```typescript
function generateBookingReference(): string {
  // Format: EL + timestamp (8 digits)
  // Example: EL12345678
  const timestamp = Date.now().toString().slice(-8);
  return `EL${timestamp}`;
}
```

**Post-Booking Actions**:
1. Send confirmation email to customer
2. Send booking notification to operations team
3. Create assignment record (if auto-assignment enabled)
4. Log audit trail
5. Update customer record (total bookings, last booking date)
6. Clear booking context
7. Show success dialog with booking reference

**Error Handling**:
```typescript
// Payment failed
if (paymentError) {
  // Keep all form data
  // Show error message
  // Allow retry
  toast.error('Payment failed. Please check your card details and try again.');
  return;
}

// API error
if (apiError) {
  // Keep all form data
  // Show error message
  // Contact support message
  toast.error('Unable to complete booking. Please contact support with reference: ' + tempRef);
  return;
}
```

---

## 2. Pricing Business Rules

### Zone-Based Pricing

```typescript
// Example pricing zones
const PRICING_ZONES = {
  manhattan: {
    baseRate: 150,
    perMile: 5,
    perMinute: 2,
    minimumFare: 75
  },
  queens: {
    baseRate: 120,
    perMile: 4,
    perMinute: 1.5,
    minimumFare: 60
  },
  // ... other zones
};
```

### Peak Hour Pricing

```typescript
function isPeakHour(date: Date, time: string): boolean {
  const dayOfWeek = date.getDay(); // 0 = Sunday
  const [hours, minutes] = time.split(':').map(Number);
  
  // Monday-Friday
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    // Morning rush: 6am-9am
    if (hours >= 6 && hours < 9) return true;
    // Evening rush: 4pm-7pm
    if (hours >= 16 && hours < 19) return true;
  }
  
  return false;
}

function applyPeakHourSurcharge(basePrice: number, isPeak: boolean): number {
  return isPeak ? basePrice * 1.2 : basePrice;
}
```

### Special Date Pricing

```typescript
const SPECIAL_DATES = [
  { date: '12-31', name: 'New Year\'s Eve', surcharge: 0.5 },
  { date: '12-25', name: 'Christmas', surcharge: 0.5 },
  { date: '07-04', name: 'Independence Day', surcharge: 0.3 },
  { date: '02-14', name: 'Valentine\'s Day', surcharge: 0.2 },
];

function getSpecialDateSurcharge(date: Date): number {
  const monthDay = format(date, 'MM-dd');
  const special = SPECIAL_DATES.find(s => s.date === monthDay);
  return special ? special.surcharge : 0;
}
```

### Distance Calculation

```typescript
// Using Google Maps Distance Matrix API
async function calculateDistance(from: string, to: string): Promise<{
  distance: number; // miles
  duration: number; // minutes
}> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${from}&destinations=${to}&key=${API_KEY}`
  );
  const data = await response.json();
  
  const distanceMeters = data.rows[0].elements[0].distance.value;
  const durationSeconds = data.rows[0].elements[0].duration.value;
  
  return {
    distance: distanceMeters * 0.000621371, // Convert to miles
    duration: Math.ceil(durationSeconds / 60), // Convert to minutes
  };
}
```

---

## 3. Availability & Scheduling

### Vehicle Availability

```typescript
async function checkVehicleAvailability(
  date: Date,
  time: string,
  passengers: number
): Promise<boolean> {
  // 1. Find vehicles with sufficient capacity
  const suitableVehicles = await db.vehicles.findMany({
    where: {
      capacity: { gte: passengers },
      status: 'available'
    }
  });
  
  // 2. Check if any are available at the requested time
  const bookingDateTime = new Date(`${date} ${time}`);
  const bufferHours = 2; // Minimum time between bookings
  
  for (const vehicle of suitableVehicles) {
    const conflictingBookings = await db.assignments.count({
      where: {
        vehicleId: vehicle.id,
        booking: {
          pickupDate: date,
          pickupTime: {
            // Check for time conflicts with buffer
            gte: subtractHours(time, bufferHours),
            lte: addHours(time, bufferHours)
          }
        }
      }
    });
    
    if (conflictingBookings === 0) {
      return true;
    }
  }
  
  return false;
}
```

### Driver Availability

```typescript
async function checkDriverAvailability(
  date: Date,
  time: string
): Promise<boolean> {
  const availableDrivers = await db.drivers.count({
    where: {
      status: 'active',
      assignments: {
        none: {
          booking: {
            pickupDate: date,
            pickupTime: time
          }
        }
      }
    }
  });
  
  return availableDrivers > 0;
}
```

### Booking Time Restrictions

```typescript
function canBookAtTime(date: Date, time: string): {
  allowed: boolean;
  reason?: string;
} {
  const bookingDateTime = new Date(`${date.toDateString()} ${time}`);
  const now = new Date();
  
  // Minimum 2 hours advance notice
  const minimumAdvanceHours = 2;
  const minimumAdvanceTime = addHours(now, minimumAdvanceHours);
  
  if (bookingDateTime < minimumAdvanceTime) {
    return {
      allowed: false,
      reason: `Bookings require ${minimumAdvanceHours} hours advance notice`
    };
  }
  
  // No bookings between 2am-5am (maintenance window)
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 2 && hour < 5) {
    return {
      allowed: false,
      reason: 'Service not available between 2am and 5am'
    };
  }
  
  return { allowed: true };
}
```

---

## 4. Cancellation & Refund Policy

### Cancellation Windows

```typescript
interface CancellationPolicy {
  hoursBeforePickup: number;
  refundPercentage: number;
}

const CANCELLATION_POLICY: CancellationPolicy[] = [
  { hoursBeforePickup: 48, refundPercentage: 100 }, // Full refund
  { hoursBeforePickup: 24, refundPercentage: 50 },  // 50% refund
  { hoursBeforePickup: 0, refundPercentage: 0 },    // No refund
];

function calculateRefund(
  booking: Booking,
  cancellationTime: Date
): number {
  const pickupDateTime = new Date(`${booking.pickupDate} ${booking.pickupTime}`);
  const hoursUntilPickup = differenceInHours(pickupDateTime, cancellationTime);
  
  const policy = CANCELLATION_POLICY.find(
    p => hoursUntilPickup >= p.hoursBeforePickup
  );
  
  if (!policy) {
    return 0; // No refund
  }
  
  return booking.totalPrice * (policy.refundPercentage / 100);
}
```

### Modification Policy

```typescript
function canModifyBooking(booking: Booking): {
  allowed: boolean;
  reason?: string;
} {
  const pickupDateTime = new Date(`${booking.pickupDate} ${booking.pickupTime}`);
  const now = new Date();
  const hoursUntilPickup = differenceInHours(pickupDateTime, now);
  
  // Must be at least 12 hours before pickup
  if (hoursUntilPickup < 12) {
    return {
      allowed: false,
      reason: 'Modifications not allowed within 12 hours of pickup'
    };
  }
  
  // Cannot modify completed or cancelled bookings
  if (['completed', 'cancelled'].includes(booking.status)) {
    return {
      allowed: false,
      reason: `Cannot modify ${booking.status} bookings`
    };
  }
  
  return { allowed: true };
}
```

---

## 5. Customer Loyalty & Discounts

### Loyalty Tiers

```typescript
enum LoyaltyTier {
  Regular = 'regular',
  Silver = 'silver',
  Gold = 'gold',
  Platinum = 'platinum',
}

function getLoyaltyTier(customer: Customer): LoyaltyTier {
  const { totalBookings, totalSpent } = customer;
  
  if (totalBookings >= 50 || totalSpent >= 10000) {
    return LoyaltyTier.Platinum;
  } else if (totalBookings >= 20 || totalSpent >= 5000) {
    return LoyaltyTier.Gold;
  } else if (totalBookings >= 10 || totalSpent >= 2000) {
    return LoyaltyTier.Silver;
  }
  
  return LoyaltyTier.Regular;
}

function getLoyaltyDiscount(tier: LoyaltyTier): number {
  const discounts = {
    [LoyaltyTier.Regular]: 0,
    [LoyaltyTier.Silver]: 0.05,    // 5%
    [LoyaltyTier.Gold]: 0.10,      // 10%
    [LoyaltyTier.Platinum]: 0.15,  // 15%
  };
  
  return discounts[tier];
}
```

### Promo Codes

```typescript
interface PromoCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit: number;
  usageCount: number;
}

async function applyPromoCode(
  code: string,
  totalPrice: number
): Promise<{ discount: number; error?: string }> {
  const promo = await db.promoCodes.findUnique({ where: { code } });
  
  if (!promo) {
    return { discount: 0, error: 'Invalid promo code' };
  }
  
  const now = new Date();
  if (now < promo.validFrom || now > promo.validUntil) {
    return { discount: 0, error: 'Promo code has expired' };
  }
  
  if (promo.usageCount >= promo.usageLimit) {
    return { discount: 0, error: 'Promo code usage limit reached' };
  }
  
  if (promo.minPurchase && totalPrice < promo.minPurchase) {
    return { 
      discount: 0, 
      error: `Minimum purchase of $${promo.minPurchase} required` 
    };
  }
  
  let discount = 0;
  if (promo.type === 'percentage') {
    discount = totalPrice * (promo.value / 100);
  } else {
    discount = promo.value;
  }
  
  if (promo.maxDiscount) {
    discount = Math.min(discount, promo.maxDiscount);
  }
  
  // Increment usage count
  await db.promoCodes.update({
    where: { code },
    data: { usageCount: { increment: 1 } }
  });
  
  return { discount };
}
```

---

## 6. Operations & Management

### Assignment Algorithm

```typescript
async function assignBooking(bookingId: string): Promise<void> {
  const booking = await db.bookings.findUnique({ 
    where: { id: bookingId } 
  });
  
  // Find available drivers
  const availableDrivers = await db.drivers.findMany({
    where: {
      status: 'active',
      // No conflicting assignments
      assignments: {
        none: {
          booking: {
            pickupDate: booking.pickupDate,
            pickupTime: {
              gte: subtractHours(booking.pickupTime, 3),
              lte: addHours(booking.pickupTime, 3)
            }
          }
        }
      }
    },
    orderBy: {
      averageRating: 'desc' // Prioritize higher-rated drivers
    }
  });
  
  // Find available vehicles
  const availableVehicles = await db.vehicles.findMany({
    where: {
      capacity: { gte: booking.passengers },
      status: 'available',
      // No conflicting assignments
      assignments: {
        none: {
          booking: {
            pickupDate: booking.pickupDate,
            pickupTime: {
              gte: subtractHours(booking.pickupTime, 3),
              lte: addHours(booking.pickupTime, 3)
            }
          }
        }
      }
    }
  });
  
  if (availableDrivers.length === 0 || availableVehicles.length === 0) {
    throw new Error('No available drivers or vehicles');
  }
  
  // Create assignment
  await db.assignments.create({
    data: {
      bookingId,
      driverId: availableDrivers[0].id,
      vehicleId: availableVehicles[0].id,
      status: 'assigned',
      assignedAt: new Date()
    }
  });
  
  // Notify driver
  await notifyDriver(availableDrivers[0].id, bookingId);
}
```

---

## Summary

All business logic is documented here for reference during implementation. Key principles:

1. **User Experience First**: 60-second booking flow
2. **Transparency**: Clear pricing, no hidden fees
3. **Flexibility**: Easy modifications and cancellations
4. **Reliability**: Robust validation and error handling
5. **Scalability**: Designed for growth and expansion
