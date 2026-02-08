# Elegant Limo - UI States Documentation

## Overview

This document outlines all UI states (loading, error, success, empty) for each page and component in the Elegant Limo booking application.

---

## 1. Home Page States

### Initial State
- Form is empty with placeholders
- Date picker shows placeholder "Pick a date"
- Time input is empty
- Passengers defaults to 1
- Continue button is enabled

### Loading State
```tsx
// When form is submitting
<Button disabled className="opacity-50">
  <Spinner /> Loading...
</Button>
```
- Continue button shows loading spinner
- Button text changes to "Loading..."
- Form inputs remain enabled but button is disabled

### Validation Error States
**Empty Required Fields:**
- Red error message appears below field
- Field border turns red
- Error text: "This field is required"

**Past Date Selected:**
- Toast notification with error
- Error text: "Date cannot be in the past"

**Invalid Date:**
- Toast notification with error
- Error text: "Invalid date"

### Success State
- Form data saved to context
- User redirected to Calculate Price page

---

## 2. Calculate Price Page States

### Initial Loading State
```tsx
// Full-page loader while calculating price
<div className="min-h-screen flex items-center justify-center">
  <div className="text-center space-y-4">
    <Spinner />
    <p>Calculating your journey...</p>
  </div>
</div>
```
- Shows full-screen loading spinner
- Message: "Calculating your journey..."
- Duration: ~800ms simulation

### Loaded State
- Route summary displayed with all booking details
- Add-ons grid visible and interactive
- Price breakdown visible
- Book Now button enabled

### Add-on Selection States
**Unselected:**
- Border: `border-[#d4af37]/20`
- Background: white
- Checkbox unchecked

**Selected:**
- Border: `border-[#d4af37]` (thicker, gold)
- Background: `bg-[#f4e4b7]/10` (light gold tint)
- Checkbox checked with gold background
- Price updates in summary

**Hover:**
- Slight shadow increase
- Border opacity increases
- Smooth transition

### Sticky Summary Behavior
**Desktop (lg+):**
- Summary card sticks to top with `sticky top-24`
- Always visible while scrolling

**Mobile (<lg):**
- Summary card appears at bottom
- Not sticky, scrolls naturally
- Full summary visible

### Error State (Missing Booking Data)
```tsx
// Redirect to home with error toast
toast.error('Please complete the booking form first');
navigate('/');
```
- Toast error shown
- Immediate redirect to home page

### Success State
- Booking data updated with selections
- User redirected to Checkout page

---

## 3. Checkout Page States

### Initial State
- All form fields empty
- Terms checkboxes unchecked
- Submit button disabled (requires checkbox acceptance)
- Booking summary visible

### Form Validation States

**Field-Level Validation:**

*First Name / Last Name:*
- Error: "This field is required"
- Shows on blur if empty

*Email:*
- Error: "This field is required" (if empty)
- Error: "Invalid email address" (if format wrong)
- Validates against pattern: `/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i`

*Phone:*
- Error: "This field is required"

*Card Number:*
- Error: "This field is required" (if empty)
- Error: "Invalid card number" (if format wrong)
- Pattern: `/^[\d\s]{12,19}$/`

*Expiry Date:*
- Error: "This field is required" (if empty)
- Error: "Invalid format (MM/YY)" (if format wrong)
- Pattern: `/^(0[1-9]|1[0-2])\/\d{2}$/`

*CVV:*
- Error: "This field is required" (if empty)
- Error: "Invalid CVV" (if format wrong)
- Pattern: `/^\d{3,4}$/`

### Checkbox States
**Terms & Privacy Checkboxes:**
- Unchecked: Submit button disabled with reduced opacity
- Checked: Submit button enabled
- Both must be checked to proceed

### Submitting State
```tsx
<Button disabled>
  <Spinner className="mr-2" />
  Processing...
</Button>
```
- Submit button disabled
- Shows spinner
- Text changes to "Processing..."
- Duration: ~2s simulation

### Success State - Confirmation Dialog

**Dialog Appearance:**
```tsx
<Dialog open={showSuccess}>
  <CheckCircle2 icon />
  <DialogTitle>Your booking has been confirmed!</DialogTitle>
  <BookingReference>{bookingReference}</BookingReference>
</Dialog>
```

**Dialog Contains:**
- Gold gradient border at top
- Large success checkmark icon (gold gradient background)
- Title: "Your booking has been confirmed!"
- Confirmation message
- Booking reference display (format: EL12345678)
- "Return to Home" button

**On Dialog Close:**
- Booking context reset
- Redirect to home page
- Ready for new booking

### Error States

**Missing Booking Data:**
```tsx
// Redirect to home
navigate('/');
```
- Immediate redirect if no booking data exists

**Form Submission Error:**
- Toast error notification
- Form remains filled
- User can retry

---

## 4. Responsive Behavior

### Mobile (<768px)
**Home Page:**
- Single column layout
- Hero height: 50vh
- Form padding: 6 (1.5rem)
- Full-width buttons

**Calculate Price Page:**
- Single column grid
- Add-ons: 1 column
- Summary at bottom (not sticky)
- Collapsible sections

**Checkout Page:**
- Single column form
- Name fields stack vertically
- Summary at bottom
- Full-width inputs

### Desktop (≥768px)
**Home Page:**
- Hero height: 60vh
- Form max-width: 4xl (56rem)
- 2-column date/time grid
- Centered layout

**Calculate Price Page:**
- 3-column grid (2 for content, 1 for summary)
- Add-ons: 2-column grid
- Sticky summary (right sidebar)

**Checkout Page:**
- 3-column grid (2 for form, 1 for summary)
- 2-column name fields
- 2-column expiry/CVV
- Sticky summary (right sidebar)

---

## 5. Component-Level States

### Button States
```tsx
// Default
className="bg-gradient-to-r from-[#d4af37] to-[#b8941f]"

// Hover
className="hover:from-[#b8941f] hover:to-[#d4af37]"

// Disabled
className="disabled:opacity-50"
disabled={isLoading || !formValid}

// Loading
{isLoading ? <Spinner /> : 'Submit'}
```

### Input States
```tsx
// Default
className="border-[#d4af37]/30 focus:border-[#d4af37]"

// Error
className="border-destructive"
aria-invalid="true"

// Disabled
disabled={isSubmitting}
className="opacity-50 cursor-not-allowed"
```

### Card States
```tsx
// Default
className="border-[#d4af37]/30"

// Hover (interactive)
className="hover:shadow-lg transition-all"

// Selected
className="border-[#d4af37] bg-[#f4e4b7]/10"
```

### Toast Notifications
```tsx
// Success
toast.success('Booking confirmed!');

// Error
toast.error('An error occurred');

// Info
toast.info('Price updated');
```

---

## 6. Loading Indicators

### Spinner Component
```tsx
<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
```

### Full-Page Loader
```tsx
<div className="min-h-screen flex items-center justify-center">
  <div className="text-center space-y-4">
    <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto" />
    <p className="text-lg text-muted-foreground">{message}</p>
  </div>
</div>
```

### Skeleton Loaders (Future Enhancement)
```tsx
// For content loading
<Skeleton className="h-12 w-full" />
<Skeleton className="h-24 w-full" />
```

---

## 7. Empty States

### No Bookings (Admin Dashboard - Future)
```tsx
<div className="text-center py-12">
  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
  <h3>No bookings yet</h3>
  <p className="text-muted-foreground">Bookings will appear here</p>
</div>
```

### No Add-ons Selected
- Summary shows only base price
- Add-ons section displays: "No add-ons selected"

---

## 8. Accessibility States

### Focus States
- All interactive elements have visible focus ring
- Focus ring color: `ring-[#d4af37]`
- Keyboard navigation fully supported

### ARIA Attributes
```tsx
aria-invalid={errors.field ? 'true' : 'false'}
aria-describedby="error-message-id"
role="alert" // For error messages
```

### Screen Reader Announcements
- Error messages have `role="alert"`
- Loading states announced
- Success confirmations announced

---

## 9. Animation States

### Transitions
```tsx
className="transition-all duration-300"
```

### Page Transitions
- Instant navigation (no page transition animations)
- Smooth scroll to top on route change

### Modal/Dialog Animations
- Fade in/out
- Slight scale animation
- Smooth backdrop transition

---

## 10. Network Error Handling

### API Error States

**Timeout:**
```tsx
toast.error('Request timed out. Please try again.');
```

**Network Offline:**
```tsx
toast.error('No internet connection. Please check your network.');
```

**Server Error (500):**
```tsx
toast.error('Server error. Please try again later.');
```

**Validation Error (422):**
```tsx
// Show field-specific errors
setError('fieldName', { message: error.message });
```

---

## Summary

All UI states follow these principles:
1. **Immediate Feedback**: Users get instant validation
2. **Clear Communication**: Error messages are specific and actionable
3. **Loading Transparency**: Users always know when actions are processing
4. **Accessibility**: All states are keyboard accessible and screen reader friendly
5. **Responsive**: States adapt to mobile and desktop viewports
6. **Graceful Degradation**: Errors never break the user flow
