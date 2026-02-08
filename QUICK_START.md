# Elegant Limo - Quick Start Guide

> 🚀 Get up and running in 5 minutes

## Prerequisites

- Node.js 18+ 
- npm or pnpm

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Overview

### 📁 Key Files

```
src/
├── app/
│   ├── App.tsx                    # Main app with routing
│   ├── pages/
│   │   ├── HomePage.tsx           # Landing + booking form
│   │   ├── CalculatePricePage.tsx # Price + add-ons
│   │   └── CheckoutPage.tsx       # Customer details + payment
│   ├── contexts/
│   │   └── BookingContext.tsx     # Global booking state
│   ├── lib/
│   │   └── translations.ts        # i18n (EN/AL)
│   └── docs/                      # Full documentation
└── styles/
    └── theme.css                  # White/gold design tokens
```

---

## 🎯 Quick Navigation

### Pages
- `/` - Home page with booking form
- `/calculate-price` - Price breakdown with add-ons
- `/checkout` - Final checkout and confirmation

### Key Components
- `BookingContext` - Manages booking state across pages
- `LoadingSpinner` - Reusable loading indicator
- `ui/*` - shadcn/ui components (pre-built)

---

## 🎨 Design System

### Colors
```css
--gold: #d4af37;           /* Primary actions */
--gold-light: #f4e4b7;     /* Backgrounds */
--gold-dark: #b8941f;      /* Gradients */
--black: #0a0a0a;          /* Text */
--white: #ffffff;          /* Backgrounds */
```

### Common Patterns

**Gold Gradient Button**:
```tsx
<Button className="bg-gradient-to-r from-[#d4af37] to-[#b8941f]">
  Premium Action
</Button>
```

**Gold Border Card**:
```tsx
<Card className="border-[#d4af37]/30">
  Content
</Card>
```

---

## 📋 User Flow

```
Home → Calculate Price → Checkout → Confirmation
  ↓            ↓              ↓           ↓
Form      Add-ons        Payment     Success
```

---

## 🔧 Common Tasks

### Adding a New Page

1. Create file in `src/app/pages/`:
```tsx
// NewPage.tsx
export function NewPage() {
  return <div>New Page</div>;
}
```

2. Add route in `App.tsx`:
```tsx
<Route path="/new" element={<NewPage />} />
```

### Using Booking Context

```tsx
import { useBooking } from '../contexts/BookingContext';

function MyComponent() {
  const { bookingData, updateBookingData } = useBooking();
  
  // Read data
  console.log(bookingData.from);
  
  // Update data
  updateBookingData({ passengers: 4 });
}
```

### Adding a Translation

```tsx
// In translations.ts
const en = {
  // ... existing translations
  newSection: {
    title: 'New Title',
    description: 'Description'
  }
};

// Usage
const t = useTranslations('en');
<h1>{t.newSection.title}</h1>
```

### Showing a Toast

```tsx
import { toast } from 'sonner';

toast.success('Success!');
toast.error('Error occurred');
toast.info('Information');
```

---

## 📚 Documentation

Full documentation in `/src/app/docs/`:

- `API_ENDPOINTS.md` - Complete API reference
- `DATABASE_SCHEMA.md` - PostgreSQL schema
- `UI_STATES.md` - All UI states (loading, error, success)
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `COMPONENTS.md` - Component documentation
- `BUSINESS_LOGIC.md` - Business rules

---

## 🧪 Testing the Flow

### Manual Testing Checklist

**Home Page**:
- [ ] Enter pickup location
- [ ] Enter dropoff location
- [ ] Select future date
- [ ] Select time
- [ ] Choose passengers (1-8)
- [ ] Click "Continue"

**Calculate Price Page**:
- [ ] Verify route summary displays
- [ ] See calculated base price
- [ ] Select add-ons (Champagne, Airport, Child Seat, Red Carpet)
- [ ] Verify price updates
- [ ] Click "Book Now"

**Checkout Page**:
- [ ] Fill customer details (first name, last name, email, phone)
- [ ] Add special requests (optional)
- [ ] Fill payment details (card, expiry, CVV)
- [ ] Check Terms & Privacy checkboxes
- [ ] Click "Confirm Booking"
- [ ] See success dialog with booking reference
- [ ] Click "Return to Home"

---

## 🐛 Common Issues

### Issue: Page redirects to home
**Cause**: Booking context is empty
**Fix**: Complete the previous step first (follow the flow)

### Issue: Form validation errors
**Cause**: Required fields are empty or invalid
**Fix**: Fill all required fields with valid data

### Issue: Date picker not showing
**Cause**: Browser compatibility
**Fix**: Use a modern browser (Chrome, Firefox, Safari, Edge)

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
npm i -g vercel
vercel --prod
```

### Backend Setup Needed
- PostgreSQL database (see `DATABASE_SCHEMA.md`)
- API endpoints (see `API_ENDPOINTS.md`)
- Payment integration (Stripe recommended)
- Email service (SendGrid recommended)

---

## 🔐 Environment Variables

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_GOOGLE_MAPS_API_KEY=...
```

---

## 🎯 Next Steps

1. **Backend**: Set up API endpoints (see `API_ENDPOINTS.md`)
2. **Database**: Create PostgreSQL database (see `DATABASE_SCHEMA.md`)
3. **Payments**: Integrate Stripe for real payments
4. **Maps**: Add Google Maps for address autocomplete
5. **Emails**: Set up SendGrid for confirmations
6. **Analytics**: Add Google Analytics tracking

---

## 💡 Tips

- **Use React DevTools** to inspect component state
- **Check Console** for errors and warnings
- **Test Mobile** using Chrome DevTools device emulation
- **Read Docs** in `/src/app/docs/` for detailed info

---

## 🆘 Need Help?

- Check documentation: `/src/app/docs/`
- Review code comments in components
- See README.md for full overview

---

**Happy Coding! 🚗✨**
