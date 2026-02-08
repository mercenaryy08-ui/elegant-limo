# Elegant Limo - API Endpoints Documentation

## Base URL
```
Production: https://api.elegantlimo.com/v1
Development: http://localhost:3000/api/v1
```

## Authentication
All API endpoints (except public routes) require Bearer token authentication:
```
Authorization: Bearer {access_token}
```

---

## Endpoints

### 1. Bookings

#### POST /bookings
Create a new booking

**Request Body:**
```json
{
  "from": "string (required) - Pickup location",
  "to": "string (required) - Dropoff location",
  "date": "string (required) - ISO 8601 date (YYYY-MM-DD)",
  "time": "string (required) - Time in HH:MM format",
  "passengers": "number (required) - Number of passengers (1-8)",
  "basePrice": "number (required) - Base price in USD",
  "selectedAddOns": "array[string] (optional) - Array of add-on IDs",
  "totalPrice": "number (required) - Total price including add-ons",
  "customerDetails": {
    "firstName": "string (required)",
    "lastName": "string (required)",
    "email": "string (required) - Valid email address",
    "phone": "string (required) - Phone number",
    "specialRequests": "string (optional)"
  },
  "paymentDetails": {
    "cardNumber": "string (required) - Encrypted card number",
    "expiryDate": "string (required) - MM/YY format",
    "cvv": "string (required) - Encrypted CVV"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "bookingReference": "string - e.g., EL12345678",
    "status": "pending | confirmed | completed | cancelled",
    "from": "string",
    "to": "string",
    "date": "string",
    "time": "string",
    "passengers": "number",
    "basePrice": "number",
    "selectedAddOns": "array[string]",
    "totalPrice": "number",
    "customerDetails": {
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "specialRequests": "string"
    },
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**
- 400 Bad Request - Invalid input data
- 401 Unauthorized - Missing or invalid authentication
- 422 Unprocessable Entity - Validation errors
- 500 Internal Server Error

---

#### GET /bookings/:id
Retrieve a specific booking by ID

**Parameters:**
- `id` (path parameter) - Booking UUID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "bookingReference": "string",
    "status": "string",
    "from": "string",
    "to": "string",
    "date": "string",
    "time": "string",
    "passengers": "number",
    "basePrice": "number",
    "selectedAddOns": "array[string]",
    "totalPrice": "number",
    "customerDetails": { },
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

---

#### GET /bookings
List all bookings (Admin only)

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page
- `status` (optional) - Filter by status: pending | confirmed | completed | cancelled
- `startDate` (optional) - Filter bookings from this date
- `endDate` (optional) - Filter bookings until this date

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "bookings": [ ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "totalPages": "number"
    }
  }
}
```

---

#### PATCH /bookings/:id
Update booking status or details (Admin only)

**Request Body:**
```json
{
  "status": "pending | confirmed | completed | cancelled (optional)",
  "specialRequests": "string (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { }
}
```

---

#### DELETE /bookings/:id
Cancel a booking

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

---

### 2. Price Calculation

#### POST /calculate-price
Calculate price for a route

**Request Body:**
```json
{
  "from": "string (required)",
  "to": "string (required)",
  "date": "string (required)",
  "time": "string (required)",
  "passengers": "number (required)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "basePrice": "number",
    "distance": "number - Distance in miles",
    "estimatedDuration": "number - Duration in minutes",
    "availableAddOns": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "price": "number"
      }
    ]
  }
}
```

---

### 3. Add-ons

#### GET /add-ons
Get all available add-ons

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "icon": "string",
      "available": "boolean"
    }
  ]
}
```

---

### 4. Notifications

#### POST /notifications/booking-confirmation
Send booking confirmation email

**Request Body:**
```json
{
  "bookingId": "uuid (required)",
  "email": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Confirmation email sent successfully"
}
```

#### POST /notifications/new-booking-alert
Send “new booking alert” email to ops (e.g. aid@sdit-services.com). Body: `{ "to": "aid@sdit-services.com", "booking": { ... } }`.

#### POST /notifications/whatsapp-alert
Send WhatsApp alert to ops/admin number immediately after booking. Body: `{ "message": "string", "bookingId": "string" }`.

#### POST /notifications/24h-reminder-email
Send 24h-before reminder email to customer. Body: `{ "bookingId", "email", "message" }`. Message must include booking ID, vehicle type, pickup time/date, from/to, passengers, add-ons, total price, payment method, cancellation summary.

#### POST /notifications/24h-reminder-whatsapp
Send 24h-before reminder to ops via WhatsApp. Body: `{ "message", "bookingId" }`. Same message content as reminder email.

---

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "string - Error code",
    "message": "string - Human-readable error message",
    "details": "object (optional) - Additional error details"
  }
}
```

## Rate Limiting

- Public endpoints: 100 requests per 15 minutes
- Authenticated endpoints: 1000 requests per 15 minutes
- Admin endpoints: 5000 requests per 15 minutes

---

## Exact APIs for Maps-First Booking & Ops

### POST /api/v1/bookings
**Create booking** (after checkout). Returns booking `id` and `bookingReference`. Triggers: customer confirmation email, new-booking alert to aid@sdit-services.com, WhatsApp alert to ops.

### POST /api/v1/calculate-route-price (recalc)
**Recalculate route, price and available cars.**

**Request:**
```json
{
  "from": "string",
  "to": "string",
  "fromLatLon": { "lat": number, "lng": number },
  "toLatLon": { "lat": number, "lng": number },
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "passengers": number
}
```
**Response:**
```json
{
  "distanceKm": number,
  "durationMinutes": number,
  "priceCalculation": { "basePrice", "subtotal", "breakdown", ... },
  "availableVehicleIds": ["vehicle-standard-eclass", "vehicle-premium-sclass", "vehicle-van-vclass"]
}
```

### GET /api/v1/fleet/availability
**Fleet availability check** for a time window.

**Query:** `?date=YYYY-MM-DD&time=HH:MM&durationMinutes=90&passengers=3`  
**Response:**
```json
{
  "available": [
    { "id": "vehicle-standard-eclass", "name": "Standard", "available": true },
    { "id": "vehicle-premium-sclass", "name": "Premium", "available": false, "reason": "Already booked" },
    { "id": "vehicle-van-vclass", "name": "Van", "available": true }
  ]
}
```

### DELETE /api/v1/bookings/:id
**Cancel booking.** Idempotent; returns 200 with `{ "success": true, "message": "Booking cancelled successfully" }`. Calendar ICS and internal calendar must reflect cancellation (event removed or marked cancelled).

### GET /api/v1/calendar/ics
**ICS feed endpoint** – public, no auth. Returns `Content-Type: text/calendar`. Each booking is a VEVENT; closed slots are blocking events. Calendar clients (Google Calendar, Apple Calendar, Outlook) subscribe via this URL. Events must update when a booking is edited or cancelled (e.g. UID stable, DTSTAMP/LAST-MODIFIED updated).

**Example response (fragment):**
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Elegant Limo//Bookings//EN
BEGIN:VEVENT
UID:booking-{id}@elegantlimo.com
DTSTAMP:...
DTSTART:...
DTEND:...
SUMMARY:EL12345678 - Zurich Airport → Geneva
DESCRIPTION:Vehicle: Premium. Passengers: 2.
END:VEVENT
...
END:VCALENDAR
```

---

## Scheduler / Queue Design for 24h Reminders & Retry

- **24h-before pickup reminder**: Run a scheduled job (e.g. cron every 15 min) that:
  1. Queries bookings with `date + time` in the window [now+23h, now+25h] and status `confirmed`.
  2. For each booking, enqueue a job: “send 24h reminder” (email to customer + WhatsApp to ops). Message content: booking ID, vehicle type, pickup time/date, from/to, passengers, add-ons (VIP), total price, payment method (“Card on vehicle”), cancellation policy summary (see `build24hReminderMessage` in `lib/notifications.ts`).

- **Queue**: Use a job queue (e.g. Bull/BullMQ, SQS, or DB-backed “pending_reminders” table). Each job payload: `{ bookingId, type: '24h_reminder' }`. Consumer sends email via SendGrid/Postmark and WhatsApp via Twilio/WhatsApp Business API.

- **Retry logic**:
  - On transient failure (5xx, network error): retry with exponential backoff (e.g. 1min, 2min, 4min, max 3 retries). Mark job failed after max retries and optionally alert ops.
  - On 4xx (e.g. invalid email): do not retry; log and mark failed.
  - Idempotency: store “reminder_sent_at” on the booking so the same booking is not sent twice if the job is retried.

- **Calendar events**: On booking create/update/cancel, emit an event or call a service that refreshes the ICS feed (e.g. regenerates the calendar feed or invalidates cache) so subscribers see updated events.

---

## Webhooks

### POST /webhooks/payment-status
Webhook endpoint for payment provider callbacks

**Request Body:**
```json
{
  "bookingId": "uuid",
  "status": "success | failed | pending",
  "transactionId": "string",
  "timestamp": "ISO 8601 timestamp"
}
```
