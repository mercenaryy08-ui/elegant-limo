# Elegant Limo - Database Schema

## Database: PostgreSQL 15+

---

## Tables

### 1. bookings

Primary table for storing all booking information.

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(20) UNIQUE NOT NULL,
  
  -- Route Information
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  passengers INTEGER NOT NULL CHECK (passengers >= 1 AND passengers <= 8),
  
  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL CHECK (base_price >= 0),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  
  -- Customer Information
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  special_requests TEXT,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  
  -- Payment
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_transaction_id VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_email ON bookings(customer_email);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_pickup_date ON bookings(pickup_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

### 2. booking_add_ons

Junction table for many-to-many relationship between bookings and add-ons.

```sql
CREATE TABLE booking_add_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  add_on_id UUID NOT NULL REFERENCES add_ons(id) ON DELETE RESTRICT,
  price_at_booking DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(booking_id, add_on_id)
);

CREATE INDEX idx_booking_add_ons_booking ON booking_add_ons(booking_id);
CREATE INDEX idx_booking_add_ons_add_on ON booking_add_ons(add_on_id);
```

---

### 3. add_ons

Master table for available add-on services.

```sql
CREATE TABLE add_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  icon VARCHAR(10),
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_add_ons_available ON add_ons(available);
CREATE INDEX idx_add_ons_sort_order ON add_ons(sort_order);

-- Seed data
INSERT INTO add_ons (code, name, description, price, icon, sort_order) VALUES
  ('champagne', 'Champagne Service', 'Dom Pérignon champagne service', 150.00, '🥂', 1),
  ('airportMeet', 'Airport Meet & Greet', 'Personal meet and greet at airport', 75.00, '✈️', 2),
  ('childSeat', 'Child Safety Seat', 'Premium child safety seat', 25.00, '👶', 3),
  ('redCarpet', 'Red Carpet Service', 'Red carpet roll-out service', 200.00, '🎭', 4);
```

---

### 4. customers

Separate customer table for repeat customers and CRM.

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  
  -- Preferences
  preferred_language VARCHAR(5) DEFAULT 'en',
  special_preferences TEXT,
  
  -- Stats
  total_bookings INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  
  -- Status
  vip_status BOOLEAN DEFAULT false,
  blocked BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_booking_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_vip ON customers(vip_status) WHERE vip_status = true;
```

---

### 5. vehicles

Table for managing the limousine fleet.

```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(30),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
  
  -- Details
  features TEXT[],
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_status ON vehicles(status);
```

---

### 6. drivers

Table for driver information.

```sql
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  
  -- License
  license_number VARCHAR(50) UNIQUE NOT NULL,
  license_expiry DATE NOT NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated')),
  
  -- Rating
  average_rating DECIMAL(3, 2) DEFAULT 5.00 CHECK (average_rating >= 0 AND average_rating <= 5),
  total_trips INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_email ON drivers(email);
```

---

### 7. assignments

Table linking bookings to drivers and vehicles.

```sql
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  
  -- Assignment status
  status VARCHAR(20) NOT NULL DEFAULT 'assigned'
    CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  
  -- Timestamps
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(booking_id)
);

CREATE INDEX idx_assignments_booking ON assignments(booking_id);
CREATE INDEX idx_assignments_driver ON assignments(driver_id);
CREATE INDEX idx_assignments_vehicle ON assignments(vehicle_id);
```

---

### 8. reviews

Customer reviews and ratings.

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_email VARCHAR(255) NOT NULL,
  
  -- Rating (1-5 stars)
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
  vehicle_rating INTEGER CHECK (vehicle_rating >= 1 AND vehicle_rating <= 5),
  
  -- Review
  comment TEXT,
  
  -- Moderation
  approved BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(booking_id)
);

CREATE INDEX idx_reviews_approved ON reviews(approved) WHERE approved = true;
CREATE INDEX idx_reviews_featured ON reviews(featured) WHERE featured = true;
CREATE INDEX idx_reviews_rating ON reviews(overall_rating DESC);
```

---

### 9. price_zones

Table for zone-based pricing.

```sql
CREATE TABLE price_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name VARCHAR(100) NOT NULL,
  base_rate DECIMAL(10, 2) NOT NULL,
  per_mile_rate DECIMAL(10, 2) NOT NULL,
  per_minute_rate DECIMAL(10, 2) NOT NULL,
  minimum_fare DECIMAL(10, 2) NOT NULL,
  
  -- Geographic boundaries (can use PostGIS for complex polygons)
  boundaries JSONB,
  
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### 10. audit_logs

Audit trail for compliance and debugging.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

---

## Views

### booking_summary_view

Convenient view for booking summaries with related data.

```sql
CREATE VIEW booking_summary_view AS
SELECT 
  b.id,
  b.booking_reference,
  b.from_location,
  b.to_location,
  b.pickup_date,
  b.pickup_time,
  b.passengers,
  b.total_price,
  b.status,
  b.payment_status,
  b.customer_first_name,
  b.customer_last_name,
  b.customer_email,
  b.customer_phone,
  COALESCE(
    json_agg(
      json_build_object(
        'name', ao.name,
        'price', bao.price_at_booking
      )
    ) FILTER (WHERE ao.id IS NOT NULL),
    '[]'
  ) as add_ons,
  d.first_name as driver_first_name,
  d.last_name as driver_last_name,
  v.make as vehicle_make,
  v.model as vehicle_model,
  b.created_at
FROM bookings b
LEFT JOIN booking_add_ons bao ON b.id = bao.booking_id
LEFT JOIN add_ons ao ON bao.add_on_id = ao.id
LEFT JOIN assignments a ON b.id = a.booking_id
LEFT JOIN drivers d ON a.driver_id = d.id
LEFT JOIN vehicles v ON a.vehicle_id = v.id
GROUP BY b.id, d.first_name, d.last_name, v.make, v.model;
```

---

## Sample Queries

### Get upcoming bookings
```sql
SELECT * FROM booking_summary_view
WHERE pickup_date >= CURRENT_DATE
  AND status IN ('pending', 'confirmed')
ORDER BY pickup_date, pickup_time;
```

### Calculate monthly revenue
```sql
SELECT 
  DATE_TRUNC('month', pickup_date) as month,
  COUNT(*) as total_bookings,
  SUM(total_price) as total_revenue,
  AVG(total_price) as average_booking_value
FROM bookings
WHERE status = 'completed'
  AND payment_status = 'completed'
GROUP BY DATE_TRUNC('month', pickup_date)
ORDER BY month DESC;
```

### Find VIP customers
```sql
UPDATE customers
SET vip_status = true
WHERE total_spent > 5000 OR total_bookings > 20;
```
