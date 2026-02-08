# Elegant Limo - Deployment & Production Guide

## Overview

This guide covers deploying the Elegant Limo booking application to production, including frontend deployment, backend API setup, database configuration, and ongoing maintenance.

---

## Frontend Deployment

### Recommended Platforms

1. **Vercel** (Recommended)
2. **Netlify**
3. **AWS Amplify**
4. **Cloudflare Pages**

### Vercel Deployment Steps

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Deploy
   vercel
   ```

2. **Environment Variables**
   Set these in Vercel dashboard:
   ```env
   VITE_API_BASE_URL=https://api.elegantlimo.com/v1
   VITE_STRIPE_PUBLIC_KEY=pk_live_...
   VITE_GOOGLE_MAPS_API_KEY=...
   VITE_ANALYTICS_ID=...
   ```

3. **Build Configuration**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

### Performance Optimizations

1. **Image Optimization**
   - Use WebP format
   - Implement lazy loading
   - Set proper cache headers

2. **Code Splitting**
   - Already configured with Vite
   - Route-based code splitting active

3. **CDN Configuration**
   - Enable edge caching
   - Set cache TTL for static assets: 1 year
   - HTML/JSON TTL: 0 (always revalidate)

---

## Backend API Deployment

### Recommended Platforms

1. **Railway** (Easy deployment)
2. **AWS ECS/Fargate** (Scalable)
3. **DigitalOcean App Platform**
4. **Heroku**

### Node.js/Express API Example

```javascript
// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API routes
import bookingRoutes from './routes/bookings.js';
import priceRoutes from './routes/pricing.js';

app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/calculate-price', priceRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
```

### Environment Variables (Backend)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/elegantlimo

# API Keys
STRIPE_SECRET_KEY=sk_live_...
GOOGLE_MAPS_API_KEY=...
SENDGRID_API_KEY=...

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://elegantlimo.com

# Node
NODE_ENV=production
PORT=3000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

---

## Database Setup

### PostgreSQL on Railway

1. **Create Database**
   - Go to Railway dashboard
   - Create new PostgreSQL service
   - Copy connection string

2. **Run Migrations**
   ```bash
   # Using node-postgres or Prisma
   npm run migrate:deploy
   ```

3. **Seed Initial Data**
   ```bash
   npm run seed:production
   ```

### Database Connection Pooling

```javascript
// db.js
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

### Backup Strategy

1. **Automated Daily Backups**
   - Configure on Railway/AWS RDS
   - Retention: 30 days

2. **Manual Backup Command**
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

3. **Restore Command**
   ```bash
   psql $DATABASE_URL < backup_20260207.sql
   ```

---

## Payment Integration

### Stripe Setup

1. **Install Stripe**
   ```bash
   npm install stripe
   ```

2. **Backend Integration**
   ```javascript
   import Stripe from 'stripe';
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

   async function createPaymentIntent(amount, bookingId) {
     const paymentIntent = await stripe.paymentIntents.create({
       amount: amount * 100, // Convert to cents
       currency: 'usd',
       metadata: { bookingId }
     });
     return paymentIntent;
   }
   ```

3. **Frontend Integration**
   ```bash
   npm install @stripe/stripe-js
   ```

   ```tsx
   import { loadStripe } from '@stripe/stripe-js';
   const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY);
   ```

### PCI Compliance
- Never store card details on your server
- Use Stripe Elements for card input
- Always use HTTPS
- Implement proper access controls

---

## Email Notifications

### SendGrid Setup

1. **Install SendGrid**
   ```bash
   npm install @sendgrid/mail
   ```

2. **Email Service**
   ```javascript
   import sgMail from '@sendgrid/mail';
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);

   async function sendBookingConfirmation(booking) {
     const msg = {
       to: booking.customerEmail,
       from: 'bookings@elegantlimo.com',
       subject: `Booking Confirmed - ${booking.bookingReference}`,
       templateId: 'd-...',
       dynamicTemplateData: {
         firstName: booking.customerFirstName,
         bookingReference: booking.bookingReference,
         pickupDate: booking.pickupDate,
         pickupTime: booking.pickupTime,
         from: booking.from,
         to: booking.to,
         totalPrice: booking.totalPrice
       }
     };
     
     await sgMail.send(msg);
   }
   ```

3. **Email Templates**
   - Booking Confirmation
   - Booking Reminder (24 hours before)
   - Payment Receipt
   - Cancellation Confirmation

---

## Monitoring & Analytics

### Application Monitoring

1. **Sentry (Error Tracking)**
   ```bash
   npm install @sentry/react @sentry/vite-plugin
   ```

   ```tsx
   import * as Sentry from '@sentry/react';
   
   Sentry.init({
     dsn: process.env.VITE_SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
   });
   ```

2. **LogRocket (Session Replay)**
   ```bash
   npm install logrocket
   ```

3. **Backend Logging**
   ```javascript
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```

### Analytics

1. **Google Analytics 4**
   ```tsx
   // Add to index.html or use react-ga4
   import ReactGA from 'react-ga4';
   ReactGA.initialize(process.env.VITE_GA4_ID);
   ```

2. **Custom Event Tracking**
   ```tsx
   // Track booking flow
   ReactGA.event({
     category: 'Booking',
     action: 'Started',
     label: 'Home Page'
   });
   ```

---

## Security Checklist

### Frontend Security
- ✅ All API calls use HTTPS
- ✅ No sensitive data in localStorage
- ✅ Input sanitization on all forms
- ✅ CSP headers configured
- ✅ XSS protection enabled

### Backend Security
- ✅ Rate limiting implemented
- ✅ CORS properly configured
- ✅ SQL injection prevention (parameterized queries)
- ✅ Environment variables for secrets
- ✅ JWT token expiration
- ✅ HTTPS only
- ✅ Security headers (helmet.js)

### Database Security
- ✅ SSL connection required
- ✅ Strong passwords
- ✅ Limited user permissions
- ✅ Regular backups
- ✅ Audit logging enabled

---

## Performance Benchmarks

### Target Metrics

- **Time to First Byte (TTFB)**: < 200ms
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5s

### Optimization Tools

1. **Lighthouse CI**
2. **WebPageTest**
3. **GTmetrix**

---

## Scaling Strategy

### Horizontal Scaling

1. **Load Balancer**
   - AWS ALB or Cloudflare Load Balancing
   - Health checks on `/health` endpoint
   - Session stickiness if needed

2. **Multiple API Instances**
   - Auto-scaling based on CPU/Memory
   - Min: 2 instances
   - Max: 10 instances

### Database Scaling

1. **Read Replicas**
   - Route read queries to replicas
   - Keep writes on primary

2. **Connection Pooling**
   - PgBouncer for PostgreSQL

3. **Caching Layer**
   - Redis for frequently accessed data
   - Cache price calculations
   - Cache add-ons list

---

## Maintenance

### Daily Tasks
- Monitor error logs
- Check payment success rate
- Review booking confirmations sent

### Weekly Tasks
- Database backup verification
- Performance metrics review
- Security updates

### Monthly Tasks
- Dependency updates
- Full system audit
- Disaster recovery drill

---

## Rollback Procedure

### Frontend Rollback
```bash
# Vercel
vercel rollback

# Or redeploy previous version
vercel --prod
```

### Backend Rollback
```bash
# Railway
railway rollback

# Or redeploy previous git commit
git revert HEAD
git push origin main
```

### Database Rollback
```bash
# Restore from backup
psql $DATABASE_URL < backup_20260206.sql
```

---

## Support & Documentation

### Internal Documentation
- Keep API docs updated
- Document all environment variables
- Maintain runbook for common issues

### Customer Support
- Have booking lookup tool ready
- Document cancellation process
- Create FAQ for common issues

---

## Cost Estimates (Monthly)

- **Frontend (Vercel Pro)**: $20
- **Backend (Railway)**: $20-50
- **Database (Railway)**: $10-30
- **Stripe**: 2.9% + $0.30 per transaction
- **SendGrid**: $15 (40k emails)
- **Domain & SSL**: $15/year

**Total Estimate**: ~$70-120/month (excluding transaction fees)

---

## Checklist Before Launch

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] SSL certificates active
- [ ] Payment gateway in live mode
- [ ] Email templates tested
- [ ] Error monitoring configured
- [ ] Analytics tracking verified
- [ ] Backup system active
- [ ] Rate limiting tested
- [ ] Mobile responsiveness verified
- [ ] Accessibility audit passed
- [ ] Legal pages (Terms, Privacy) published
- [ ] Custom domain configured
- [ ] DNS records updated
