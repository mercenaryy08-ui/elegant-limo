# Swiss Limousine Booking System - Complete Documentation

## Overview

This is a **production-ready** Swiss limousine booking platform with CHF pricing, fleet management, overlap protection, and comprehensive business rules.

---

## Fleet Configuration

### Available Vehicles (Only These 3 Exist)

| Vehicle | Class | Capacity | Rate | Description |
|---------|-------|----------|------|-------------|
| **Standard** | Mercedes E-Class | 1-3 passengers | **4.20 CHF/km** | Elegant and comfortable |
| **Premium** | Mercedes S-Class | 1-3 passengers | **5.00 CHF/km** | Ultimate luxury |
| **Van** | Mercedes V-Class | 1-7 passengers | **4.50 CHF/km** | Spacious for groups |

### Overbooking Prevention

✅ **Automatic overlap detection**: Each vehicle can only be booked once per time slot  
✅ **30-minute buffer**: Added before and after each booking  
✅ **Capacity filtering**: Vehicles shown only if they can accommodate passenger count  
✅ **Closed slots**: Admin can block specific dates/times per vehicle or globally

---

## Pricing System

### A) Per-Kilometer Pricing (Default)

**Formula**: `Distance (km) × Per-km Rate (CHF)`

**Example**:
```
Route: Zurich to Bern (125 km)
Vehicle: Standard (4.20 CHF/km)
Calculation: 125 × 4.20 = 525.00 CHF
```

### B) Fixed-Route Pricing (Overrides Per-km)

When pickup/dropoff matches these exact routes, **fixed prices apply**:

#### Route 1: Zürich Airport → Zürich City

| Vehicle | Fixed Price |
|---------|-------------|
| Standard | **80 CHF** |
| Premium | **100 CHF** |
| Van | **90 CHF** |

**Synonyms recognized**:
- From: `Zürich Airport`, `ZRH`, `Zurich Airport`, `Zürich Flughafen`
- To: `Zürich City`, `Zurich Stadt`, `Zurich`, `Zürich`

#### Route 2: Zürich Airport → Basel City

| Vehicle | Fixed Price |
|---------|-------------|
| Standard | **420 CHF** |
| Premium | **500 CHF** |
| Van | **450 CHF** |

**Synonyms recognized**:
- From: `Zürich Airport`, `ZRH`, `Zurich Airport`
- To: `Basel City`, `Basel Stadt`, `Basel`, `BSL`

#### Route 3: Zürich Airport → St. Moritz

| Vehicle | Fixed Price |
|---------|-------------|
| Standard | **800 CHF** |
| Premium | **1000 CHF** |
| Van | **1000 CHF** |

**Synonyms recognized**:
- From: `Zürich Airport`, `ZRH`, `Zurich Airport`
- To: `St. Moritz`, `St Moritz`, `Saint Moritz`, `StMoritz`

**Note**: Fixed routes work **bidirectionally** (e.g., Basel → ZRH also uses fixed pricing).

---

## Add-ons

### VIP Meet Inside Airport

- **Price**: +100 CHF
- **Description**: Personal meet and greet service inside the airport terminal
- **Icon**: ✈️
- **Availability**: Can be added to any booking

---

## Payment Policy

### 💳 Card on Vehicle (Only Payment Method)

**Important**: 
- ❌ **No cash accepted**
- ❌ **No upfront payment required**
- ✅ **Pay by card to driver** at the end of the trip

**Details**:
1. Payment is collected by the driver using a mobile card terminal
2. All major cards accepted (Visa, Mastercard, American Express)
3. Receipt provided immediately after payment
4. Secure payment processing
5. Customer does NOT enter card details during booking

**Customer sees this message at checkout**:
> "Payment by card directly to the driver. Cash payments are not accepted. You will pay at the end of your trip using our secure mobile terminal."

---

## Cancellation Policy

### Free Cancellation Windows

| Time Before Pickup | Refund | Fee |
|-------------------|--------|-----|
| **≥48 hours** | **100%** | None |
| **24-48 hours** | **100%** | None (grace period) |
| **<24 hours** | **50%** | 50% cancellation fee |

### Examples

**Scenario 1**: Pickup on Friday 10:00, cancel on Wednesday 09:00 (49 hours before)
- ✅ **Full refund** (100%)

**Scenario 2**: Pickup on Friday 10:00, cancel on Thursday 15:00 (19 hours before)
- ⚠️ **50% refund** (50% cancellation fee applies)

**Scenario 3**: Pickup on Friday 10:00, cancel on Thursday 11:00 (23 hours before)
- ⚠️ **50% refund** (under 24 hours)

### How to Cancel

Contact us by:
- **Phone**: +41 XX XXX XX XX
- **Email**: bookings@elegantlimo.ch
- Provide your **booking reference** (format: EL12345678)

Refunds are processed within **5-7 business days**.

---

## Flight Delay Policy

### Free Waiting Time

✅ **First 60 minutes of delay**: No extra charge

### Delay Surcharge (After 60 Minutes)

**Calculation**:
- **CHF 50 per 30-minute interval** (or part thereof)

**Examples**:

| Delay | Calculation | Surcharge |
|-------|-------------|-----------|
| 45 min | Within free 60 min | 0 CHF |
| 75 min | 15 min excess = 1 interval | 50 CHF |
| 90 min | 30 min excess = 1 interval | 50 CHF |
| 120 min | 60 min excess = 2 intervals | 100 CHF |
| 140 min | 80 min excess = 3 intervals | 150 CHF |

**Flight Tracking**:
- We monitor your flight automatically
- Driver adjusts pickup time
- You'll be notified of any delay charges before confirmation

---

## Booking Rules & Restrictions

### Time Requirements

✅ **Minimum advance notice**: 2 hours  
✅ **Maximum advance booking**: 1 year (365 days)  
❌ **Service hours**: Not available between 2:00 AM - 5:00 AM (maintenance window)

### Passenger Rules

- **Capacity must match vehicle**:
  - 1-3 passengers: Standard or Premium
  - 4-7 passengers: Van only
  - 8+ passengers: Not available (contact for special arrangements)

### Booking Validation

Before a booking is confirmed:
1. ✓ Date is not in the past
2. ✓ Minimum 2-hour advance notice
3. ✓ Vehicle available (no overlapping bookings)
4. ✓ Not in closed slot
5. ✓ Passenger count matches vehicle capacity

---

## Invoice Example

```
=== INVOICE ===

Zürich Airport → Zürich City         80.00 CHF
VIP Meet Inside Airport              100.00 CHF
────────────────────────────────────────────
Total                                180.00 CHF

Payment Method: Card on Vehicle
```

**With Per-km Pricing**:
```
=== INVOICE ===

Distance: 125.0 km × 4.20 CHF/km    525.00 CHF
VIP Meet Inside Airport              100.00 CHF
────────────────────────────────────────────
Total                                625.00 CHF

Payment Method: Card on Vehicle
```

---

## Booking Flow

```
1. HOME PAGE
   ↓
   Enter: From, To, Date, Time, Passengers
   ↓

2. VEHICLE SELECTION
   ↓
   • See available vehicles (filtered by capacity & availability)
   • View estimated price for each vehicle
   • Select vehicle
   ↓

3. CALCULATE PRICE
   ↓
   • See price breakdown (fixed-route or per-km)
   • Add optional VIP service (+100 CHF)
   • Review final price
   ↓

4. CHECKOUT
   ↓
   • Enter customer details (name, email, phone)
   • Add special requests
   • Review payment policy (card on vehicle)
   • Accept cancellation policy
   • Accept terms & conditions
   ↓

5. CONFIRMATION
   ↓
   • Receive booking reference (e.g., EL12345678)
   • Email confirmation sent
   • Reminder: Payment by card to driver
```

---

## Admin Controls Required

### 1. Closed Slots Management

**Purpose**: Block specific dates/times when vehicles are unavailable.

**Use Cases**:
- Vehicle maintenance
- Holidays (e.g., New Year's Eve)
- Driver unavailability
- Special events

**Fields**:
- Vehicle ID (optional, leave empty for all vehicles)
- Date (YYYY-MM-DD)
- Start Time (HH:MM)
- End Time (HH:MM)
- Reason (optional, shown to customers)

**Example**:
```
Vehicle: Standard (E-Class)
Date: 2026-02-15
Time: 08:00 - 14:00
Reason: Scheduled maintenance
```

**API Endpoints**:
```
GET    /api/admin/closed-slots
POST   /api/admin/closed-slots
PATCH  /api/admin/closed-slots/:id
DELETE /api/admin/closed-slots/:id
```

---

### 2. Delay Surcharge Configuration

**Settings**:
- Enable/disable delay charges
- Free waiting minutes (default: 60)
- Charge type: Fixed amount OR per-interval
- Fixed amount (CHF)
- Per-interval amount (CHF, default: 50)
- Interval duration (minutes, default: 30)

**Example Configurations**:

**Configuration A** (Current):
```json
{
  "enabled": true,
  "freeWaitingMinutes": 60,
  "chargeType": "per-interval",
  "perIntervalAmount": 50,
  "intervalMinutes": 30
}
```

**Configuration B** (Flat fee):
```json
{
  "enabled": true,
  "freeWaitingMinutes": 60,
  "chargeType": "fixed",
  "fixedAmount": 150
}
```

**API Endpoints**:
```
GET   /api/admin/delay-config
PATCH /api/admin/delay-config
```

---

### 3. Fixed-Route Management

**Purpose**: Add/edit/remove fixed-price routes and their synonyms.

**Operations**:
1. **Add new fixed route** with prices for all 3 vehicles
2. **Update existing route** prices
3. **Add location synonyms** (e.g., add "Geneva Airport" as synonym for "GVA")
4. **Delete route** (reverts to per-km pricing)

**Example Adding Synonym**:
```
Route: Zürich Airport → Zürich City
Add Synonym: "Kloten Airport" → From locations
Result: "Kloten Airport" now recognized as Zürich Airport
```

**API Endpoints**:
```
GET    /api/admin/fixed-routes
POST   /api/admin/fixed-routes
PATCH  /api/admin/fixed-routes/:id
DELETE /api/admin/fixed-routes/:id
POST   /api/admin/fixed-routes/:id/synonyms
```

---

### 4. Booking Management Dashboard

**Key Features**:
- View all bookings (pending, confirmed, completed, cancelled)
- Filter by date range, status, vehicle
- Search by booking reference or customer email
- Update booking status
- View customer details
- See pricing breakdown
- Export bookings (CSV/Excel)

**Booking Statuses**:
- **Pending**: Just created, awaiting confirmation
- **Confirmed**: Confirmed and scheduled
- **Completed**: Trip finished
- **Cancelled**: Customer cancelled

**API Endpoints**:
```
GET    /api/admin/bookings?status=confirmed&date=2026-02-08
GET    /api/admin/bookings/:id
PATCH  /api/admin/bookings/:id/status
```

---

### 5. Reports & Analytics

**Revenue Report**:
- Total revenue by period (day, week, month)
- Breakdown by vehicle type
- Add-ons revenue
- Average booking value

**Vehicle Utilization**:
- Bookings per vehicle
- Hours booked per vehicle
- Utilization percentage
- Revenue per vehicle

**Booking Stats**:
- Total bookings
- Conversion rate (views → bookings)
- Most popular routes
- Peak booking times
- Cancellation rate

**API Endpoints**:
```
GET /api/admin/reports/booking-stats?from=2026-01-01&to=2026-01-31
GET /api/admin/reports/revenue?period=month
GET /api/admin/reports/vehicle-utilization
```

---

## Database Schema Additions

### bookings table

```sql
-- Add Swiss-specific fields
ALTER TABLE bookings ADD COLUMN vehicle_id VARCHAR(50) NOT NULL;
ALTER TABLE bookings ADD COLUMN distance_km DECIMAL(10, 2);
ALTER TABLE bookings ADD COLUMN pricing_method VARCHAR(20); -- 'fixed-route' or 'per-km'
ALTER TABLE bookings ADD COLUMN fixed_route_id VARCHAR(50);
ALTER TABLE bookings ADD COLUMN estimated_duration_minutes INTEGER;

-- Add indexes
CREATE INDEX idx_bookings_vehicle ON bookings(vehicle_id);
CREATE INDEX idx_bookings_pricing_method ON bookings(pricing_method);
```

### closed_slots table (NEW)

```sql
CREATE TABLE closed_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id VARCHAR(50), -- NULL means all vehicles
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES admins(id),
  
  CHECK (start_time < end_time)
);

CREATE INDEX idx_closed_slots_date ON closed_slots(date);
CREATE INDEX idx_closed_slots_vehicle ON closed_slots(vehicle_id);
```

### fixed_routes table (NEW)

```sql
CREATE TABLE fixed_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'zrh-zurich'
  description TEXT NOT NULL,
  price_standard DECIMAL(10, 2) NOT NULL,
  price_premium DECIMAL(10, 2) NOT NULL,
  price_van DECIMAL(10, 2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Location synonyms for matching
CREATE TABLE route_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixed_route_id UUID NOT NULL REFERENCES fixed_routes(id) ON DELETE CASCADE,
  location_name VARCHAR(200) NOT NULL,
  location_type VARCHAR(10) NOT NULL, -- 'from' or 'to'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(fixed_route_id, location_name, location_type)
);

CREATE INDEX idx_route_locations_name ON route_locations(location_name);
CREATE INDEX idx_route_locations_route ON route_locations(fixed_route_id);
```

### delay_config table (NEW)

```sql
CREATE TABLE delay_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN DEFAULT true,
  free_waiting_minutes INTEGER DEFAULT 60,
  charge_type VARCHAR(20) DEFAULT 'per-interval', -- 'fixed' or 'per-interval'
  fixed_amount DECIMAL(10, 2),
  per_interval_amount DECIMAL(10, 2) DEFAULT 50,
  interval_minutes INTEGER DEFAULT 30,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES admins(id)
);

-- Only one config row should exist
INSERT INTO delay_config (enabled, free_waiting_minutes, charge_type, per_interval_amount, interval_minutes)
VALUES (true, 60, 'per-interval', 50, 30);
```

---

## Implementation Checklist

### ✅ Completed (Frontend)

- [x] Fleet data model (3 vehicles with capacity and rates)
- [x] Pricing engine (per-km + fixed-route)
- [x] Availability checking with overlap detection
- [x] Vehicle selection page with filtering
- [x] CHF price display throughout
- [x] Payment policy display (card on vehicle)
- [x] Cancellation policy with acceptance checkbox
- [x] Invoice line items generation
- [x] Booking flow (Home → Vehicle → Price → Checkout)
- [x] Success confirmation with booking reference
- [x] Mobile-responsive design
- [x] Loading states and error handling

### 🔲 Required (Backend)

- [ ] Database schema implementation (see above)
- [ ] API endpoints for bookings CRUD
- [ ] Overlap detection query (30-min buffer)
- [ ] Closed slots management API
- [ ] Delay configuration API
- [ ] Fixed routes + synonyms management
- [ ] Email confirmation system
- [ ] Admin dashboard backend
- [ ] Reports & analytics queries
- [ ] Flight tracking integration (optional)
- [ ] Payment terminal integration (driver app)

### 🔲 Admin Dashboard (To Build)

- [ ] Closed slots calendar view
- [ ] Booking management table
- [ ] Delay config editor
- [ ] Fixed routes manager
- [ ] Synonym editor
- [ ] Revenue reports
- [ ] Vehicle utilization charts
- [ ] Booking statistics

---

## Testing Scenarios

### Test 1: Fixed-Route Pricing

**Input**:
- From: "Zürich Airport"
- To: "Zürich City"
- Vehicle: Standard

**Expected**:
- Price: **80.00 CHF** (fixed)
- Method: "Fixed-route pricing"
- Badge: "✓ Fixed-route pricing"

### Test 2: Per-km Pricing

**Input**:
- From: "Zürich"
- To: "Bern"
- Distance: 125 km
- Vehicle: Premium (5.00 CHF/km)

**Expected**:
- Price: **625.00 CHF** (125 × 5.00)
- Method: "Per-km"
- Breakdown: "125.0 km × 5.00 CHF/km"

### Test 3: Capacity Filtering

**Input**:
- Passengers: 5

**Expected**:
- Only **Van** shown (1-7 capacity)
- Standard & Premium hidden (max 3 passengers)

### Test 4: Overlap Detection

**Setup**:
- Standard vehicle booked for 2026-02-08 at 10:00
- Duration: 2 hours

**Test Input**:
- Date: 2026-02-08
- Time: 11:00
- Vehicle: Standard

**Expected**:
- Standard: ❌ Unavailable (overlaps with buffer)
- Premium: ✅ Available
- Van: ✅ Available

### Test 5: Cancellation Refund

**Booking**:
- Pickup: 2026-02-15 10:00
- Total: 500 CHF

**Cancel at**: 2026-02-13 09:00 (49 hours before)
**Expected**: 100% refund (500 CHF)

**Cancel at**: 2026-02-14 15:00 (19 hours before)
**Expected**: 50% refund (250 CHF), 50% fee (250 CHF)

---

## Support & Maintenance

**Customer Support**:
- Phone: +41 XX XXX XX XX
- Email: bookings@elegantlimo.ch
- Operating hours: 24/7

**Technical Support**:
- Developer email: dev@elegantlimo.ch
- Bug reports: GitHub Issues

---

**Built with ❤️ for Swiss precision and reliability**
