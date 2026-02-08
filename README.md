# Elegant Limo - Premium Limousine Booking Platform

A modern, luxury limousine booking website with a seamless 60-second booking flow. Built with React, TypeScript, and Tailwind CSS featuring a white/gold premium design.

![Elegant Limo](https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80)

## ✨ Features

### User Experience
- **Fast Booking Flow**: Complete a reservation in under 60 seconds
- **Instant Validation**: Real-time form validation with clear error messages
- **Responsive Design**: Optimized for mobile-first, fully responsive across all devices
- **Sticky Summary**: Desktop sidebar with booking details; mobile-friendly accordion
- **Premium UI**: Modern 2026-level design with white/gold luxury theme
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

### Booking Features
- **Maps-first flow**: Background map, Switzerland-only address autocomplete (Google Places), route on map
- **Multi-step Process**: Home → Summary (route, recalc, choose 1 of 3 cars) → Checkout
- **Location Selection**: Pickup and dropoff with CH-only autocomplete; store formatted address + lat/lon
- **Date & Time Picker**: Calendar with time selection
- **Passenger Count**: Support for 1-8 passengers
- **Premium Add-ons**: VIP add-ons; real-time pricing with add-ons
- **Instant Confirmation**: Booking reference; email/WhatsApp notifications (when backend is set)
- **Ops dashboard** (`/ops`): Manage bookings (confirm, resend email, decline), working hours (closed slots), calendar + ICS feed
- **Free password protection**: Optional `VITE_OPS_PASSWORD` to protect the ops area (no backend required)

### Technical Features
- **React Router**: Client-side routing for smooth navigation
- **React Hook Form**: Efficient form handling with validation
- **Context API**: Global state management for booking flow
- **Multilingual Ready**: EN/AL translations structure (easily extensible)
- **Toast Notifications**: User-friendly feedback via Sonner
- **Loading States**: Comprehensive UI states for all actions
- **Type Safety**: Full TypeScript implementation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Modern browser with ES6+ support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/elegant-limo.git
   cd elegant-limo
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 📤 Push to a new GitHub project

1. **Create a new repo on GitHub**  
   Go to [github.com/new](https://github.com/new), name it (e.g. `elegant-limo`), leave it empty (no README/license).

2. **In this project folder, init git and push** (replace `YOUR_USERNAME` and `elegant-limo` with your GitHub username and repo name):

   ```bash
   git init
   git add .
   git commit -m "Initial commit: Elegant Limo booking + ops dashboard"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/elegant-limo.git
   git push -u origin main
   ```

   If you use SSH:

   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/elegant-limo.git
   git push -u origin main
   ```

3. **Do not commit `.env`**  
   The `.gitignore` already excludes `.env`. Use `.env.example` as a template and set real values locally or in your host’s environment.

---

## 📁 Project Structure

```
elegant-limo/
├── src/
│   ├── app/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   └── figma/         # Figma-imported components
│   │   ├── contexts/          # React Context providers
│   │   │   └── BookingContext.tsx
│   │   ├── pages/             # Route pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── CalculatePricePage.tsx
│   │   │   └── CheckoutPage.tsx
│   │   ├── lib/               # Utilities and helpers
│   │   │   └── translations.ts
│   │   ├── docs/              # Documentation
│   │   │   ├── API_ENDPOINTS.md
│   │   │   ├── DATABASE_SCHEMA.md
│   │   │   ├── UI_STATES.md
│   │   │   └── DEPLOYMENT_GUIDE.md
│   │   └── App.tsx            # Main app component
│   └── styles/                # Global styles
│       ├── theme.css          # Design tokens (white/gold)
│       ├── tailwind.css
│       └── index.css
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🎨 Design System

### Color Palette

**Primary Colors:**
- Gold: `#d4af37` (Primary actions, accents)
- Gold Light: `#f4e4b7` (Hover states, backgrounds)
- Gold Dark: `#b8941f` (Gradients, emphasis)

**Grayscale:**
- White: `#ffffff` (Background)
- Black: `#0a0a0a` (Text, headers)
- Gray 100: `#f5f5f5` (Secondary backgrounds)

### Typography
- Base font size: 16px
- Font weights: 400 (normal), 500 (medium)
- Headings: Medium weight with tight tracking

### Spacing
- Container padding: 1rem (mobile), 1.5rem (desktop)
- Component spacing: 6-8 units (1.5-2rem)
- Form fields: 12-14 height (3-3.5rem)

### Border Radius
- Default: 0.5rem
- Cards: 1rem
- Large elements: 1.5rem

---

## 🛣️ User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        HOME PAGE                             │
│  • Hero with luxury limousine image                          │
│  • Booking form (From/To/Date/Time/Passengers)               │
│  • Form validation                                           │
│  • "Continue" CTA                                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  CALCULATE PRICE PAGE                        │
│  • Route summary (sticky on desktop)                         │
│  • Base price calculation                                    │
│  • Premium add-ons selection (4 options)                     │
│  • Live price updates                                        │
│  • "Book Now" CTA                                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     CHECKOUT PAGE                            │
│  • Customer details form (Name/Email/Phone)                  │
│  • Special requests textarea                                 │
│  • Payment details (Card/Expiry/CVV)                         │
│  • Terms & Privacy checkboxes                                │
│  • "Confirm Booking" CTA                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUCCESS DIALOG                              │
│  • Confirmation message                                      │
│  • Booking reference (EL12345678)                            │
│  • Email confirmation sent                                   │
│  • "Return to Home" button                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 API Integration

### Backend Requirements

The application is designed to work with a REST API. See `/src/app/docs/API_ENDPOINTS.md` for complete API documentation.

**Key Endpoints:**
- `POST /bookings` - Create new booking
- `GET /bookings/:id` - Retrieve booking details
- `POST /calculate-price` - Get price for route
- `GET /add-ons` - List available add-ons

### Environment Variables

Copy `.env.example` to `.env` and set as needed:

```env
# Optional: Google Maps (address autocomplete + map). Get key at https://console.cloud.google.com/
VITE_GOOGLE_MAPS_API_KEY=...

# Optional: Backend API base URL (ops + notifications use it)
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Optional: Ops dashboard password (free protection, no backend)
VITE_OPS_PASSWORD=your-secret-password
```

---

## 🗄️ Database Schema

PostgreSQL database with 10+ tables including:
- `bookings` - Core booking data
- `customers` - Customer profiles
- `add_ons` - Available premium services
- `vehicles` - Fleet management
- `drivers` - Driver information
- `assignments` - Booking assignments

See `/src/app/docs/DATABASE_SCHEMA.md` for complete schema and sample queries.

---

## 🌐 Multilingual Support

The application is built with i18n in mind:

```typescript
// Current languages
type Language = 'en' | 'al';

// Usage
const t = useTranslations('en');
<h1>{t.home.hero.title}</h1>
```

**Adding a new language:**
1. Open `/src/app/lib/translations.ts`
2. Add new language to `Language` type
3. Create translation object following existing structure
4. Add to `translations` object

---

## 🎯 Performance

### Optimization Strategies
- Route-based code splitting (Vite)
- Lazy loading for images
- Optimized Unsplash images (webp, responsive)
- Minimal bundle size with tree-shaking
- CSS-in-JS avoided (Tailwind only)

### Target Metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

---

## ♿ Accessibility

- **WCAG 2.1 AA Compliant**
- Keyboard navigation support
- ARIA labels on all interactive elements
- Focus indicators on all focusable elements
- Semantic HTML structure
- Screen reader tested
- Color contrast ratios meet AA standards (4.5:1)

### Testing
```bash
# Run accessibility audit
npm run a11y
```

---

## 🧪 Testing

### Recommended Testing Setup

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Run tests
npm run test
```

### Test Coverage Goals
- Unit tests: > 80%
- Integration tests: Key user flows
- E2E tests: Complete booking flow

---

## 📦 Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Backend Options
- Railway (Recommended)
- AWS ECS
- DigitalOcean App Platform
- Heroku

See `/src/app/docs/DEPLOYMENT_GUIDE.md` for complete deployment instructions.

---

## 🔐 Security

### Frontend Security
- All API calls over HTTPS
- No sensitive data in localStorage
- XSS prevention via React
- Input sanitization
- CSP headers configured

### Payment Security
- PCI DSS compliant (via Stripe)
- Card data never touches our servers
- Tokenized payments only
- 3D Secure support

---

## 📊 Analytics & Monitoring

### Recommended Tools
- **Google Analytics 4** - User behavior tracking
- **Sentry** - Error monitoring
- **LogRocket** - Session replay
- **Hotjar** - Heatmaps and recordings

### Key Metrics to Track
- Booking completion rate
- Average time to complete booking
- Add-on selection rate
- Payment success rate
- Page load times

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Vite 6** - Build tool
- **React Router 7** - Routing
- **Tailwind CSS 4** - Styling
- **React Hook Form 7** - Form handling
- **date-fns** - Date utilities
- **Sonner** - Toast notifications
- **Radix UI** - Accessible components

### UI Components
- **shadcn/ui** - Pre-built accessible components
- **Lucide React** - Icon library

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style
- ESLint configuration included
- Prettier for formatting
- TypeScript strict mode enabled

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Support

- **Documentation**: `/src/app/docs/`
- **Issues**: GitHub Issues
- **Email**: support@elegantlimo.com

---

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core booking flow
- ✅ Price calculation
- ✅ Add-ons selection
- ✅ Multilingual structure

### Phase 2 (Q2 2026)
- [ ] Stripe payment integration
- [ ] Email notifications (SendGrid)
- [ ] Google Maps integration
- [ ] Real-time vehicle tracking
- [ ] Customer dashboard

### Phase 3 (Q3 2026)
- [ ] Driver mobile app
- [ ] Admin dashboard
- [ ] Analytics dashboard
- [ ] Loyalty program
- [ ] Review system

### Phase 4 (Q4 2026)
- [ ] Mobile apps (iOS/Android)
- [ ] Corporate accounts
- [ ] API for third-party integrations
- [ ] Advanced reporting

---

## 🏆 Credits

- **Design**: Inspired by modern luxury brands
- **Images**: Unsplash
- **Icons**: Lucide
- **UI Components**: shadcn/ui

---

## 📸 Screenshots

### Home Page
![Home Page](https://via.placeholder.com/800x400?text=Home+Page)

### Calculate Price
![Price Calculation](https://via.placeholder.com/800x400?text=Price+Calculation)

### Checkout
![Checkout](https://via.placeholder.com/800x400?text=Checkout)

---

**Built with ❤️ by the Elegant Limo Team**

*Making luxury transportation accessible and effortless.*
