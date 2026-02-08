# Elegant Limo - Component Documentation

## Overview

This document provides detailed information about all custom components in the Elegant Limo application.

---

## Page Components

### HomePage
**Location**: `/src/app/pages/HomePage.tsx`

**Description**: Landing page with hero section and booking form.

**Features**:
- Luxury hero image with gradient overlay
- Booking form with validation
- Date picker with calendar
- Time picker
- Passenger selector (1-8)
- Location inputs (from/to)
- Responsive design

**State Management**:
- Uses `BookingContext` to save form data
- Uses `react-hook-form` for form validation
- Local state for date selection

**Props**: None (Route component)

**Navigation**: 
- On successful submission → `/calculate-price`

---

### CalculatePricePage
**Location**: `/src/app/pages/CalculatePricePage.tsx`

**Description**: Price calculation page with route summary and add-ons selection.

**Features**:
- Loading state while calculating price
- Route summary card (sticky on desktop)
- 4 premium add-ons with selection
- Real-time price calculation
- Responsive layout (sidebar on desktop, stacked on mobile)

**State Management**:
- Reads from `BookingContext`
- Local state for selected add-ons and base price
- Mobile viewport detection

**Props**: None (Route component)

**Navigation**: 
- On "Book Now" → `/checkout`
- Redirects to `/` if no booking data

**Add-ons Available**:
1. Champagne Service - $150
2. Airport Meet & Greet - $75
3. Child Safety Seat - $25
4. Red Carpet Service - $200

---

### CheckoutPage
**Location**: `/src/app/pages/CheckoutPage.tsx`

**Description**: Final checkout page with customer details and payment form.

**Features**:
- Customer information form
- Payment details form
- Special requests textarea
- Terms & Privacy checkboxes
- Booking summary (sticky on desktop)
- Success confirmation dialog
- Form validation with instant feedback

**State Management**:
- Reads from `BookingContext`
- Uses `react-hook-form` for validation
- Local state for submission and success dialog

**Props**: None (Route component)

**Navigation**: 
- On success → Shows dialog, then redirects to `/`
- Redirects to `/` if no booking data

**Form Fields**:
- First Name (required)
- Last Name (required)
- Email (required, validated)
- Phone (required)
- Special Requests (optional)
- Card Number (required, pattern validated)
- Expiry Date (required, MM/YY format)
- CVV (required, 3-4 digits)
- Terms checkbox (required)
- Privacy checkbox (required)

---

## Utility Components

### LoadingSpinner
**Location**: `/src/app/components/LoadingSpinner.tsx`

**Description**: Reusable loading spinner component.

**Props**:
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';  // Default: 'md'
  message?: string;                    // Optional loading message
  fullPage?: boolean;                  // Default: false
  color?: 'gold' | 'white';           // Default: 'gold'
}
```

**Usage**:
```tsx
// Inline spinner
<LoadingSpinner size="sm" />

// With message
<LoadingSpinner message="Loading..." />

// Full page loader
<LoadingSpinner 
  fullPage 
  size="xl" 
  message="Processing your booking..." 
/>

// White spinner (for dark backgrounds)
<LoadingSpinner color="white" />
```

**Accessibility**:
- `role="status"`
- `aria-label="Loading"`
- Message has `role="alert"`

---

## Context Providers

### BookingProvider
**Location**: `/src/app/contexts/BookingContext.tsx`

**Description**: Global state management for booking flow.

**State Structure**:
```typescript
interface BookingData {
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
  basePrice?: number;
  selectedAddOns?: string[];
  totalPrice?: number;
  customerDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  paymentDetails?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  };
}
```

**API**:
```typescript
const { bookingData, updateBookingData, resetBooking } = useBooking();

// Update booking data
updateBookingData({ 
  from: 'JFK Airport', 
  to: 'Times Square' 
});

// Reset booking (used after successful booking)
resetBooking();
```

**Usage**:
```tsx
import { useBooking } from '../contexts/BookingContext';

function MyComponent() {
  const { bookingData, updateBookingData } = useBooking();
  
  // Access booking data
  console.log(bookingData.from);
  
  // Update data
  updateBookingData({ passengers: 4 });
}
```

---

## UI Components (shadcn/ui)

The application uses pre-built accessible components from shadcn/ui. Below are the most commonly used ones:

### Button
**Location**: `/src/app/components/ui/button.tsx`

**Usage**:
```tsx
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button disabled>Disabled</Button>
```

**Custom Styling**:
```tsx
<Button className="bg-gradient-to-r from-[#d4af37] to-[#b8941f]">
  Gold Gradient
</Button>
```

---

### Input
**Location**: `/src/app/components/ui/input.tsx`

**Usage**:
```tsx
<Input 
  type="text" 
  placeholder="Enter location" 
  className="h-14"
/>

<Input 
  type="email" 
  autoComplete="email"
  aria-invalid={hasError ? 'true' : 'false'}
/>
```

---

### Label
**Location**: `/src/app/components/ui/label.tsx`

**Usage**:
```tsx
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />

// With icon
<Label htmlFor="phone" className="flex items-center gap-2">
  <Phone className="w-4 h-4 text-[#d4af37]" />
  Phone Number
</Label>
```

---

### Card
**Location**: `/src/app/components/ui/card.tsx`

**Usage**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>

// Custom styling
<Card className="border-[#d4af37]/30 bg-gradient-to-br from-white to-[#fafafa]">
  Luxury styled card
</Card>
```

---

### Checkbox
**Location**: `/src/app/components/ui/checkbox.tsx`

**Usage**:
```tsx
<div className="flex items-center gap-2">
  <Checkbox 
    id="terms" 
    checked={accepted}
    onCheckedChange={(checked) => setAccepted(checked as boolean)}
    className="border-[#d4af37] data-[state=checked]:bg-[#d4af37]"
  />
  <label htmlFor="terms">I accept the terms</label>
</div>
```

---

### Calendar
**Location**: `/src/app/components/ui/calendar.tsx`

**Usage**:
```tsx
const [date, setDate] = useState<Date>();

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, 'PPP') : 'Pick a date'}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      initialFocus
    />
  </PopoverContent>
</Popover>
```

---

### Select
**Location**: `/src/app/components/ui/select.tsx`

**Usage**:
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="h-14">
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
    <SelectItem value="3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

---

### Dialog
**Location**: `/src/app/components/ui/dialog.tsx`

**Usage**:
```tsx
const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description goes here
      </DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Separator
**Location**: `/src/app/components/ui/separator.tsx`

**Usage**:
```tsx
<div>Section 1</div>
<Separator className="bg-[#d4af37]/20" />
<div>Section 2</div>

// Vertical separator
<Separator orientation="vertical" />
```

---

### Badge
**Location**: `/src/app/components/ui/badge.tsx`

**Usage**:
```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>

// Custom styling
<Badge 
  variant="outline" 
  className="border-[#d4af37] text-[#d4af37]"
>
  Premium
</Badge>
```

---

### Textarea
**Location**: `/src/app/components/ui/textarea.tsx`

**Usage**:
```tsx
<Textarea 
  placeholder="Enter your message..." 
  rows={4}
  className="border-[#d4af37]/30"
/>
```

---

### Toast (Sonner)
**Location**: `/src/app/components/ui/sonner.tsx`

**Setup**:
```tsx
// In App.tsx
import { Toaster } from './components/ui/sonner';

<Toaster />
```

**Usage**:
```tsx
import { toast } from 'sonner';

// Success
toast.success('Booking confirmed!');

// Error
toast.error('Something went wrong');

// Info
toast.info('Price updated');

// Loading
const toastId = toast.loading('Processing...');
// Later update it
toast.success('Done!', { id: toastId });

// Custom
toast.custom((t) => (
  <div className="bg-white p-4 rounded-lg">
    Custom toast content
  </div>
));
```

---

## Icons

### Lucide React
**Package**: `lucide-react`

**Commonly Used Icons**:
```tsx
import { 
  MapPin,         // Location markers
  Calendar,       // Date picker
  Clock,          // Time picker
  Users,          // Passenger count
  CheckCircle2,   // Success states
  ArrowRight,     // Navigation
  CreditCard,     // Payment
  User,           // User profile
  Mail,           // Email
  Phone,          // Phone
  Sparkles,       // Premium/featured
  AlertCircle,    // Warnings
  XCircle,        // Errors
} from 'lucide-react';
```

**Usage**:
```tsx
<MapPin className="w-4 h-4 text-[#d4af37]" />
<CheckCircle2 className="w-8 h-8 text-white" />
```

**Size Guidelines**:
- Small icons (inline with text): `w-4 h-4`
- Medium icons (form labels): `w-5 h-5`
- Large icons (headings): `w-6 h-6`
- Hero icons: `w-8 h-8` or larger

---

## Form Validation

### React Hook Form Integration

**Basic Setup**:
```tsx
import { useForm } from 'react-hook-form';

interface FormData {
  email: string;
  phone: string;
}

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
        aria-invalid={errors.email ? 'true' : 'false'}
      />
      {errors.email && (
        <p className="text-sm text-destructive" role="alert">
          {errors.email.message}
        </p>
      )}
      
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

## Responsive Design

### Breakpoints
```tsx
// Mobile first approach
<div className="p-4 md:p-6 lg:p-8">
  
// Grid layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Conditional rendering
const isMobile = window.innerWidth < 768;
{isMobile ? <MobileComponent /> : <DesktopComponent />}
```

### Tailwind Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## Styling Patterns

### Gold Gradient Button
```tsx
<Button className="bg-gradient-to-r from-[#d4af37] to-[#b8941f] hover:from-[#b8941f] hover:to-[#d4af37] text-white">
  Premium Action
</Button>
```

### Gold Border Card
```tsx
<Card className="border-[#d4af37]/30 hover:border-[#d4af37] transition-all">
  Content
</Card>
```

### Gold Accent Header
```tsx
<div className="border-b border-[#d4af37]/20 bg-white/95 backdrop-blur-sm">
  Header content
</div>
```

### Loading Overlay
```tsx
<div className="relative">
  <div className="opacity-50 pointer-events-none">
    Original content
  </div>
  <div className="absolute inset-0 flex items-center justify-center">
    <LoadingSpinner />
  </div>
</div>
```

---

## Best Practices

### Component Structure
1. **Imports** - React, libraries, components, types
2. **Types/Interfaces** - TypeScript definitions
3. **Component** - Main component function
4. **Hooks** - useState, useEffect, custom hooks
5. **Handlers** - Event handlers
6. **Render** - JSX return

### Naming Conventions
- Components: PascalCase (e.g., `BookingForm`)
- Files: PascalCase for components (e.g., `BookingForm.tsx`)
- Functions: camelCase (e.g., `handleSubmit`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Accessibility
- Always include `aria-label` or `aria-labelledby`
- Use `aria-invalid` for form errors
- Add `role="alert"` to error messages
- Ensure keyboard navigation works
- Maintain color contrast ratios

### Performance
- Use React.memo for expensive renders
- Lazy load images
- Debounce input handlers
- Use useCallback for stable function references
- Keep component trees shallow

---

## Testing Components

### Example Test
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders booking form', () => {
    render(<HomePage />);
    expect(screen.getByLabelText('Pickup Location')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<HomePage />);
    const submitButton = screen.getByText('Continue');
    fireEvent.click(submitButton);
    expect(await screen.findByText('This field is required')).toBeInTheDocument();
  });
});
```

---

## Component Checklist

When creating a new component:
- [ ] TypeScript types defined
- [ ] Props interface documented
- [ ] Responsive design implemented
- [ ] Accessibility attributes added
- [ ] Error states handled
- [ ] Loading states implemented
- [ ] Keyboard navigation working
- [ ] Form validation (if applicable)
- [ ] Mobile tested
- [ ] Desktop tested
