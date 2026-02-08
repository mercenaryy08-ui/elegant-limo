# Test Scenarios - Swiss Limousine Booking System

## Comprehensive test cases for validation

---

## 1. Fixed-Route Pricing Tests

### Test 1.1: ZRH → Zürich City (Standard)

**Input**:
```
From: "Zürich Airport"
To: "Zürich City"
Vehicle: Standard (E-Class)
Passengers: 2
Add-ons: None
```

**Expected Output**:
```
Pricing Method: Fixed-route
Base Price: 80.00 CHF
Add-ons: 0.00 CHF
Total: 80.00 CHF
Badge: "✓ Fixed-route pricing"
```

**Formula**: Fixed price (not distance-based)

---

### Test 1.2: ZRH → Zürich City with VIP

**Input**:
```
From: "ZRH"
To: "Zurich"
Vehicle: Premium (S-Class)
Passengers: 1
Add-ons: VIP Meet Inside Airport
```

**Expected Output**:
```
Pricing Method: Fixed-route
Base Price: 100.00 CHF
VIP Meet Inside Airport: 100.00 CHF
Total: 200.00 CHF
```

---

### Test 1.3: ZRH → Basel (Van)

**Input**:
```
From: "Zürich Flughafen"
To: "Basel Stadt"
Vehicle: Van (V-Class)
Passengers: 6
Add-ons: None
```

**Expected Output**:
```
Pricing Method: Fixed-route
Base Price: 450.00 CHF
Total: 450.00 CHF
Description: "Zürich Airport → Basel City"
```

---

### Test 1.4: ZRH → St. Moritz (Premium)

**Input**:
```
From: "ZRH"
To: "St Moritz"
Vehicle: Premium
Passengers: 2
Add-ons: VIP Meet Inside Airport
```

**Expected Output**:
```
Pricing Method: Fixed-route
Base Price: 1000.00 CHF
VIP Meet Inside Airport: 100.00 CHF
Total: 1100.00 CHF
```

---

### Test 1.5: Reverse Route (Basel → ZRH)

**Input**:
```
From: "Basel"
To: "Zürich Airport"
Vehicle: Standard
Passengers: 3
```

**Expected Output**:
```
Pricing Method: Fixed-route
Base Price: 420.00 CHF
Total: 420.00 CHF
Description: "Zürich Airport → Basel City" (reversed)
```

**Note**: Fixed routes work bidirectionally.

---

## 2. Per-km Pricing Tests

### Test 2.1: Custom Route (Zürich → Bern)

**Input**:
```
From: "Zürich"
To: "Bern"
Distance: 125 km
Vehicle: Standard (4.20 CHF/km)
Passengers: 2
```

**Expected Output**:
```
Pricing Method: Per-km
Distance: 125.0 km
Rate: 4.20 CHF/km
Base Price: 525.00 CHF (125 × 4.20)
Total: 525.00 CHF
Breakdown: "125.0 km × 4.20 CHF/km"
```

---

### Test 2.2: Long Distance (Zürich → Geneva)

**Input**:
```
From: "Zürich"
To: "Geneva"
Distance: 280 km
Vehicle: Premium (5.00 CHF/km)
Passengers: 3
Add-ons: VIP Meet Inside Airport
```

**Expected Output**:
```
Pricing Method: Per-km
Base Price: 1400.00 CHF (280 × 5.00)
VIP Meet Inside Airport: 100.00 CHF
Total: 1500.00 CHF
```

---

### Test 2.3: Short Distance with Van

**Input**:
```
From: "Zürich"
To: "Winterthur"
Distance: 25 km
Vehicle: Van (4.50 CHF/km)
Passengers: 5
```

**Expected Output**:
```
Pricing Method: Per-km
Base Price: 112.50 CHF (25 × 4.50)
Total: 112.50 CHF
```

---

## 3. Vehicle Capacity Tests

### Test 3.1: 1 Passenger

**Input**:
```
Passengers: 1
```

**Expected Available Vehicles**:
- ✅ Standard (E-Class) - Capacity: 1-3
- ✅ Premium (S-Class) - Capacity: 1-3
- ✅ Van (V-Class) - Capacity: 1-7

**Result**: All 3 vehicles shown

---

### Test 3.2: 3 Passengers

**Input**:
```
Passengers: 3
```

**Expected Available Vehicles**:
- ✅ Standard - Capacity: 1-3
- ✅ Premium - Capacity: 1-3
- ✅ Van - Capacity: 1-7

**Result**: All 3 vehicles shown

---

### Test 3.3: 5 Passengers

**Input**:
```
Passengers: 5
```

**Expected Available Vehicles**:
- ❌ Standard - Max 3 passengers
- ❌ Premium - Max 3 passengers
- ✅ Van - Capacity: 1-7

**Result**: Only Van shown

---

### Test 3.4: 8 Passengers

**Input**:
```
Passengers: 8
```

**Expected Result**:
- ❌ No vehicles available
- Error message: "No vehicles available for 8 passengers"
- Suggestion: "Contact us for special arrangements"

---

## 4. Availability & Overlap Tests

### Test 4.1: No Conflicts

**Setup**:
```
Date: 2026-02-08
Time: 10:00
Duration: 120 minutes
Vehicle: Standard
Existing Bookings: None
```

**Expected**:
```
✅ Standard: Available
✅ Premium: Available
✅ Van: Available
```

---

### Test 4.2: Direct Overlap

**Setup**:
```
Existing Booking:
  - Vehicle: Standard
  - Date: 2026-02-08
  - Time: 10:00
  - Duration: 120 min

New Booking Request:
  - Vehicle: Standard
  - Date: 2026-02-08
  - Time: 10:30
  - Duration: 120 min
```

**Expected**:
```
❌ Standard: Unavailable
   Reason: "Vehicle is already booked for an overlapping time"
✅ Premium: Available
✅ Van: Available
```

---

### Test 4.3: Buffer Overlap (Before)

**Setup**:
```
Existing Booking:
  - Vehicle: Standard
  - Date: 2026-02-08
  - Time: 10:00
  - Duration: 120 min (10:00-12:00)
  - Buffer: 30 min before/after (09:30-12:30)

New Booking Request:
  - Vehicle: Standard
  - Date: 2026-02-08
  - Time: 09:45
  - Duration: 60 min (09:45-10:45)
```

**Expected**:
```
❌ Standard: Unavailable (conflicts with buffer)
Conflict Time: New booking 09:45 overlaps with existing buffer 09:30-12:30
```

---

### Test 4.4: Buffer Overlap (After)

**Setup**:
```
Existing Booking:
  - Vehicle: Standard
  - Time: 10:00-12:00 (buffer: 09:30-12:30)

New Booking Request:
  - Vehicle: Standard
  - Time: 12:15-13:15
```

**Expected**:
```
❌ Standard: Unavailable (conflicts with buffer)
```

---

### Test 4.5: Just Outside Buffer

**Setup**:
```
Existing Booking:
  - Vehicle: Standard
  - Time: 10:00-12:00 (buffer: 09:30-12:30)

New Booking Request:
  - Vehicle: Standard
  - Time: 13:00-14:00
```

**Expected**:
```
✅ Standard: Available
Reason: New booking starts at 13:00, after buffer ends at 12:30
```

---

## 5. Closed Slots Tests

### Test 5.1: Vehicle-Specific Closed Slot

**Setup**:
```
Closed Slot:
  - Vehicle: Standard
  - Date: 2026-02-15
  - Time: 08:00-14:00
  - Reason: "Scheduled maintenance"

Booking Request:
  - Date: 2026-02-15
  - Time: 10:00
```

**Expected**:
```
❌ Standard: Unavailable
   Reason: "Scheduled maintenance"
✅ Premium: Available
✅ Van: Available
```

---

### Test 5.2: Global Closed Slot

**Setup**:
```
Closed Slot:
  - Vehicle: All (vehicleId: null)
  - Date: 2026-12-31
  - Time: 00:00-23:59
  - Reason: "New Year's Eve - Closed"

Booking Request:
  - Date: 2026-12-31
  - Time: 18:00
```

**Expected**:
```
❌ Standard: Unavailable - "New Year's Eve - Closed"
❌ Premium: Unavailable - "New Year's Eve - Closed"
❌ Van: Unavailable - "New Year's Eve - Closed"

Message: "This time slot is not available"
```

---

## 6. Cancellation Refund Tests

### Test 6.1: Cancel 3 Days Before (≥48 hours)

**Booking**:
```
Pickup: Friday, Feb 15, 2026 at 10:00
Total: 500 CHF
Cancellation: Tuesday, Feb 12, 2026 at 09:00
```

**Calculation**:
```
Hours until pickup: 73 hours
Policy: ≥48 hours → 100% refund
```

**Expected**:
```
Refund: 500.00 CHF (100%)
Cancellation Fee: 0.00 CHF
Reason: "Free cancellation (≥48 hours before pickup)"
```

---

### Test 6.2: Cancel 30 Hours Before (24-48 hours)

**Booking**:
```
Pickup: Friday, Feb 15 at 10:00
Total: 500 CHF
Cancellation: Thursday, Feb 14 at 04:00
```

**Calculation**:
```
Hours until pickup: 30 hours
Policy: 24-48 hours → 100% refund (grace period)
```

**Expected**:
```
Refund: 500.00 CHF (100%)
Cancellation Fee: 0.00 CHF
Reason: "Free cancellation (24-48 hours before pickup)"
```

---

### Test 6.3: Cancel 12 Hours Before (<24 hours)

**Booking**:
```
Pickup: Friday, Feb 15 at 10:00
Total: 500 CHF
Cancellation: Thursday, Feb 14 at 22:00
```

**Calculation**:
```
Hours until pickup: 12 hours
Policy: <24 hours → 50% refund
```

**Expected**:
```
Refund: 250.00 CHF (50%)
Cancellation Fee: 250.00 CHF (50%)
Reason: "Late cancellation (<24 hours): 50% cancellation fee applies"
```

---

### Test 6.4: Cancel 1 Hour Before

**Booking**:
```
Pickup: Friday, Feb 15 at 10:00
Total: 800 CHF
Cancellation: Friday, Feb 15 at 09:00
```

**Expected**:
```
Refund: 400.00 CHF (50%)
Cancellation Fee: 400.00 CHF (50%)
```

---

## 7. Flight Delay Surcharge Tests

### Test 7.1: 45-Minute Delay (Within Free Time)

**Input**:
```
Delay: 45 minutes
Config:
  - Free waiting: 60 minutes
  - Charge: 50 CHF per 30 min
```

**Expected**:
```
Surcharge: 0.00 CHF
Reason: "Free waiting time (60 minutes)"
```

---

### Test 7.2: 75-Minute Delay

**Input**:
```
Delay: 75 minutes
Config:
  - Free waiting: 60 minutes
  - Excess: 15 minutes
  - Intervals: ceil(15 / 30) = 1
```

**Expected**:
```
Surcharge: 50.00 CHF
Intervals: 1
Reason: "Delay charge: 1 × 30 min intervals"
```

---

### Test 7.3: 90-Minute Delay

**Input**:
```
Delay: 90 minutes
Excess: 30 minutes
Intervals: 1
```

**Expected**:
```
Surcharge: 50.00 CHF
Intervals: 1
```

---

### Test 7.4: 120-Minute Delay

**Input**:
```
Delay: 120 minutes
Excess: 60 minutes
Intervals: ceil(60 / 30) = 2
```

**Expected**:
```
Surcharge: 100.00 CHF
Intervals: 2
Reason: "Delay charge: 2 × 30 min intervals"
```

---

### Test 7.5: 140-Minute Delay

**Input**:
```
Delay: 140 minutes
Excess: 80 minutes
Intervals: ceil(80 / 30) = 3
```

**Expected**:
```
Surcharge: 150.00 CHF
Intervals: 3
```

---

## 8. Edge Cases

### Test 8.1: Zero Distance

**Input**:
```
From: "Zürich"
To: "Zürich"
Distance: 0 km
Vehicle: Standard
```

**Expected**:
```
Error: "Same pickup and dropoff location not allowed"
OR
Minimum charge: 50 CHF (if minimum fare applies)
```

---

### Test 8.2: Very Short Distance

**Input**:
```
From: "Zürich HB"
To: "Zürich Oerlikon"
Distance: 5 km
Vehicle: Premium (5.00 CHF/km)
```

**Expected**:
```
Base Price: 25.00 CHF
Total: 25.00 CHF
Note: Check if minimum fare applies
```

---

### Test 8.3: Past Date

**Input**:
```
Date: 2026-01-01 (past)
Current Date: 2026-02-08
```

**Expected**:
```
❌ Error: "Date cannot be in the past"
Form does not submit
```

---

### Test 8.4: Booking Too Soon (<2 hours)

**Input**:
```
Current Time: 2026-02-08 10:00
Requested Time: 2026-02-08 11:30 (1.5 hours away)
```

**Expected**:
```
❌ Error: "Bookings require at least 2 hours advance notice"
```

---

### Test 8.5: Invalid Time Slot (2-5 AM)

**Input**:
```
Date: 2026-02-10
Time: 03:00
```

**Expected**:
```
❌ Error: "Service not available between 2:00 AM and 5:00 AM"
```

---

## 9. Location Synonym Tests

### Test 9.1: Airport Variations

**All These Should Match ZRH**:
```
✅ "Zürich Airport"
✅ "ZRH"
✅ "Zurich Airport"
✅ "Zürich Flughafen"
✅ "zurich flughafen"
✅ "ZÜRICH AIRPORT"
```

**All Trigger Fixed-Route Pricing**

---

### Test 9.2: City Variations

**Zürich City Synonyms**:
```
✅ "Zürich City"
✅ "Zurich Stadt"
✅ "Zurich"
✅ "zürich"
✅ "ZURICH CITY"
```

---

### Test 9.3: Case Insensitivity

**Input**:
```
From: "ZÜRICH AIRPORT"
To: "zurich city"
```

**Expected**:
```
Matches: ZRH → Zürich City fixed route
Price: 80/100/90 CHF (depending on vehicle)
```

---

## 10. Invoice Generation Tests

### Test 10.1: Fixed-Route with Add-on

**Input**:
```
Route: ZRH → Zürich (Standard)
Base: 80 CHF
Add-ons: VIP Meet (100 CHF)
```

**Expected Invoice**:
```
Zürich Airport → Zürich City        80.00 CHF
VIP Meet Inside Airport            100.00 CHF
──────────────────────────────────────────
Total                              180.00 CHF
```

---

### Test 10.2: Per-km Without Add-ons

**Input**:
```
Distance: 125 km
Rate: 4.20 CHF/km
Vehicle: Standard
```

**Expected Invoice**:
```
Distance: 125.0 km × 4.20 CHF/km  525.00 CHF
──────────────────────────────────────────
Total                              525.00 CHF
```

---

### Test 10.3: Per-km with Multiple Add-ons

**Input**:
```
Base: 525 CHF (125 km × 4.20)
Add-ons: VIP Meet (100 CHF)
```

**Expected Invoice**:
```
Distance: 125.0 km × 4.20 CHF/km  525.00 CHF
VIP Meet Inside Airport            100.00 CHF
──────────────────────────────────────────
Total                              625.00 CHF
```

---

## Test Automation Template

```typescript
describe('Pricing Engine', () => {
  it('should calculate fixed-route pricing for ZRH to Zurich', () => {
    const vehicle = getVehicleByType(VehicleType.STANDARD);
    const price = calculatePrice({
      from: 'Zürich Airport',
      to: 'Zürich City',
      vehicle,
      selectedAddOns: [],
    });
    
    expect(price.pricingMethod).toBe('fixed-route');
    expect(price.basePrice).toBe(80);
    expect(price.subtotal).toBe(80);
  });

  it('should calculate per-km pricing for non-fixed routes', () => {
    const vehicle = getVehicleByType(VehicleType.STANDARD);
    const price = calculatePrice({
      from: 'Zürich',
      to: 'Bern',
      vehicle,
      distance: 125,
      selectedAddOns: [],
    });
    
    expect(price.pricingMethod).toBe('per-km');
    expect(price.basePrice).toBe(525);
    expect(price.distance).toBe(125);
  });

  it('should add VIP service correctly', () => {
    const vehicle = getVehicleByType(VehicleType.PREMIUM);
    const price = calculatePrice({
      from: 'ZRH',
      to: 'Zurich',
      vehicle,
      selectedAddOns: ['vip-meet-inside'],
    });
    
    expect(price.basePrice).toBe(100);
    expect(price.addOnsTotal).toBe(100);
    expect(price.subtotal).toBe(200);
  });
});
```

---

**All test scenarios should pass for production readiness.**
