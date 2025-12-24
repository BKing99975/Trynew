# Production Services MVP - Self-Hosting Deployment Guide

## Overview

This is a full-stack TypeScript application built with React 19, Express 4, tRPC 11, and MySQL. It includes Stripe integration for subscriptions and one-time purchases, OAuth authentication, and a comprehensive content management system.

## Architecture

- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Backend:** Express 4 + tRPC 11 + Node.js
- **Database:** MySQL 8.0+
- **Authentication:** Manus OAuth (can be replaced with custom auth)
- **Payments:** Stripe (subscriptions + one-time purchases)
- **Storage:** AWS S3 (for file uploads)

## Prerequisites

- Node.js 18+ (recommended 22.13.0)
- MySQL 8.0+
- Vercel account (for deployment)
- Stripe account (test and production keys)
- Custom domain (for subdomain hosting)

## Environment Variables

### Required for All Environments

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database_name

# Authentication
VITE_APP_ID=your_manus_app_id
JWT_SECRET=your_jwt_secret_key_min_32_chars
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your_owner_open_id
OWNER_NAME=Your Name

# Stripe
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_test_... or whsec_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=your_analytics_endpoint
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# App Configuration
VITE_APP_TITLE=TD Services
VITE_APP_LOGO=/logo.svg
NODE_ENV=production
```

## Database Schema

The application uses 15 MySQL tables with the following structure:

### Users Table
- id (PK)
- openId (unique)
- name, email
- role (guest, free, pro, premium, admin)
- stripeCustomerId, stripeSubscriptionId
- stripeSubStatus (active, trialing, past_due, canceled, unpaid, none)
- subscriptionStatus, subscriptionTier
- currentPeriodEnd
- createdAt, updatedAt, lastSignedIn

### Subscriptions Table
- id (PK)
- userId (unique)
- tier (free, pro, premium)
- stripeSubscriptionId, stripeCustomerId
- status, currentPeriodStart, currentPeriodEnd
- createdAt, updatedAt

### Resources Table
- id (PK)
- title, slug (unique)
- description, category
- accessLevel (free, pro)
- content, downloadUrl
- featured
- createdAt, updatedAt

### Products Table
- id (PK)
- title, slug (unique)
- description, price
- stripeProductId, stripePriceId
- downloadUrl, featured
- createdAt, updatedAt

### Orders & OrderItems Tables
- Orders: id, userId, email, stripePaymentIntentId, status, total
- OrderItems: id, orderId, productId, quantity, price

### Learning Modules & Progress
- LearningModules: id, title, slug, description, videoUrl, duration, order
- ModuleProgress: id, userId, moduleId, completed, watchedSeconds, completedAt

### Portfolio & Testimonials
- PortfolioProjects: id, title, slug, description, role, venue, highlights, imageUrl, videoUrl, featured, order
- Testimonials: id, projectId, author, title, content, rating, featured

### Support & Bookings
- SupportTickets: id, userId, title, description, status, priority
- TicketReplies: id, ticketId, userId, message
- Bookings: id, name, email, phone, serviceType, eventDate, description, status

### Contact Submissions
- ContactSubmissions: id, name, email, subject, message

## Stripe Webhook Endpoints

The application handles these Stripe webhook events at `/api/webhooks/stripe`:

### Events

**checkout.session.completed**
- Triggered when user completes checkout
- Creates/updates Stripe customer ID in database
- Syncs subscription status to user record

**customer.subscription.created**
- Triggered when new subscription starts
- Sets user role to "pro" if status is active/trialing
- Stores stripeSubscriptionId and status

**customer.subscription.updated**
- Triggered when subscription details change
- Updates subscription status in database
- Syncs user role: active/trialing → pro, others → free

**customer.subscription.deleted**
- Triggered when subscription is canceled
- Reverts user role to "free"
- Clears subscription status

### Webhook Setup Instructions

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
5. Copy the signing secret
6. Set as `STRIPE_WEBHOOK_SECRET` environment variable

## Deployment to Vercel

### Step 1: Prepare Repository

```bash
# Clone the project
git clone <your-repo-url>
cd production_services_mvp

# Create .vercelignore
echo "node_modules" > .vercelignore
echo ".env.local" >> .vercelignore
echo "dist" >> .vercelignore
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select "Other" as framework preset
4. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

### Step 3: Set Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```
DATABASE_URL
VITE_APP_ID
JWT_SECRET
OAUTH_SERVER_URL
VITE_OAUTH_PORTAL_URL
OWNER_OPEN_ID
OWNER_NAME
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
VITE_STRIPE_PUBLISHABLE_KEY
BUILT_IN_FORGE_API_URL
BUILT_IN_FORGE_API_KEY
VITE_FRONTEND_FORGE_API_KEY
VITE_FRONTEND_FORGE_API_URL
VITE_APP_TITLE
VITE_APP_LOGO
NODE_ENV=production
```

### Step 4: Configure Custom Domain

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain (e.g., `td.yourdomain.com`)
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate to be issued

### Step 5: Database Setup

1. Create MySQL database on your hosting provider:
   - AWS RDS
   - PlanetScale
   - DigitalOcean
   - Heroku Postgres (with MySQL add-on)

2. Set `DATABASE_URL` in Vercel environment variables

3. After first deployment, run migrations:
   ```bash
   # SSH into Vercel deployment or run locally with production DB
   npm run db:push
   ```

### Step 6: Deploy

```bash
# Push to GitHub
git push origin main

# Vercel automatically deploys
# Monitor in Vercel dashboard
```

## Local Development

### Setup

```bash
# Install dependencies
pnpm install

# Create .env.local file with your credentials
# (See Environment Variables section above)

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

### Development URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- tRPC Endpoint: http://localhost:3000/api/trpc

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests
pnpm db:push      # Run database migrations
pnpm check        # TypeScript type checking
pnpm format       # Format code with Prettier
```

## Testing Stripe Integration

### Using Stripe Test Mode

1. Use Stripe test keys (sk_test_*, pk_test_*)
2. Test card number: `4242 4242 4242 4242`
3. Any future expiry date (e.g., 12/25)
4. Any CVC (e.g., 123)

### Testing Webhooks Locally

Use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to local development server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test webhook events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

### Testing Subscription Flow

1. Go to `/pricing` page
2. Click "Start Free Trial" for Pro plan
3. Complete checkout with test card
4. Verify webhook fires and user role updates to "pro"
5. Go to `/resources` and verify Pro content is unlocked
6. Go to `/portal` and verify subscription status displays

## Production Checklist

- [ ] Set `NODE_ENV=production` in Vercel
- [ ] Use Stripe live keys (sk_live_*, pk_live_*)
- [ ] Create separate production database
- [ ] Configure Stripe webhook endpoint for production domain
- [ ] Set up custom domain in Vercel
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Configure database backups
- [ ] Set up monitoring/error tracking (e.g., Sentry)
- [ ] Test complete checkout flow in production
- [ ] Verify subscription webhook sync works
- [ ] Test resource gating for all user types
- [ ] Verify Portal displays correct subscription status
- [ ] Set up email notifications
- [ ] Configure analytics

## Troubleshooting

### Database Connection Issues

```bash
# Test MySQL connection
mysql -h your-host -u your-user -p your-database

# Verify DATABASE_URL format
# mysql://username:password@hostname:3306/database_name
```

### Stripe Webhook Not Firing

1. Verify webhook endpoint is publicly accessible
2. Check webhook signing secret matches `STRIPE_WEBHOOK_SECRET`
3. Review Stripe dashboard → Developers → Webhooks → Events
4. Check application logs for webhook errors
5. Verify webhook is configured for all required events

### Build Failures on Vercel

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Ensure database connection works
4. Run `npm run check` locally to verify TypeScript

### 500 Errors on Deployment

1. Check Vercel function logs
2. Verify database is accessible from Vercel region
3. Check environment variables are correctly set
4. Verify Stripe keys are correct

## File Structure

```
production_services_mvp/
├── client/                    # React frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities
│   │   ├── _core/            # Core hooks
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── index.html            # HTML template
│   └── vite.config.ts        # Vite configuration
├── server/                    # Express backend
│   ├── _core/                # Core infrastructure
│   │   ├── index.ts          # Express app setup
│   │   ├── env.ts            # Environment config
│   │   ├── context.ts        # tRPC context
│   │   ├── trpc.ts           # tRPC setup
│   │   ├── cookies.ts        # Cookie utilities
│   │   └── llm.ts            # LLM integration
│   ├── routers.ts            # tRPC procedure definitions
│   ├── db.ts                 # Database query helpers
│   ├── webhooks/             # Webhook handlers
│   │   └── stripe.ts         # Stripe webhook logic
│   ├── stripe/               # Stripe utilities
│   │   ├── checkout.ts       # Checkout session creation
│   │   └── checkout.test.ts  # Tests
│   ├── storage.ts            # S3 storage helpers
│   └── *.test.ts             # Test files
├── drizzle/                  # Database schema
│   ├── schema.ts             # Table definitions
│   ├── config.ts             # Drizzle config
│   └── migrations/           # SQL migration files
├── shared/                   # Shared code
│   ├── const.ts              # Constants
│   └── types.ts              # Shared types
├── storage/                  # S3 helpers
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind config
├── vite.config.ts            # Vite config
└── drizzle.config.ts         # Drizzle config
```

## API Endpoints

### Authentication
- `POST /api/oauth/callback` - OAuth callback handler
- `GET /api/trpc/auth.me` - Get current user
- `POST /api/trpc/auth.logout` - Logout

### Stripe
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `POST /api/trpc/subscription.createCheckout` - Create checkout session

### Resources
- `GET /api/trpc/resources.getByAccessLevel` - Get resources by access level

### System
- `POST /api/trpc/system.notifyOwner` - Send notification to owner

## Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Image optimization
- CSS minification (Tailwind)
- JavaScript minification (Vite)

### Backend
- Database query optimization with Drizzle ORM
- Connection pooling
- Request caching
- Webhook retry logic

### Database
- Proper indexing on frequently queried columns
- Connection pooling
- Query optimization
- Regular backups

## Security Considerations

1. **Environment Variables:** Never commit `.env` files
2. **Stripe Keys:** Use separate test/production keys
3. **Database:** Use strong passwords, enable SSL
4. **CORS:** Configure properly for your domain
5. **Rate Limiting:** Implement on API endpoints
6. **Input Validation:** Validate all user inputs
7. **SQL Injection:** Use parameterized queries (Drizzle ORM)
8. **CSRF:** Implement CSRF tokens for state-changing operations

## Support & Maintenance

### Monitoring
- Set up error tracking (Sentry, Rollbar)
- Monitor database performance
- Track Stripe webhook failures
- Monitor API response times

### Updates
- Keep dependencies updated: `pnpm update`
- Run tests before deploying: `pnpm test`
- Test in staging environment first
- Review breaking changes in dependencies

### Scaling
- Use database read replicas
- Implement Redis caching
- Use CDN for static assets
- Consider serverless functions for heavy operations

## License

MIT

---

For questions or issues, refer to the source code comments and test files for implementation details.
