# Broadcaster - WhatsApp Bulk Messaging SaaS

Complete backend implementation with auth, WhatsApp QR integration, and campaign management.

## Backend Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file in backend directory:
```env
DATABASE_URL="postgresql://broadcaster_user:password123@localhost:5432/broadcaster"
JWT_SECRET="your_jwt_secret_key_here_min_32_chars_required"
NODE_ENV="development"
PORT=3000
REDIS_URL="redis://localhost:6379"
CORS_ORIGIN="http://localhost:5173"
LOG_LEVEL="info"
```

3. Setup database:
```bash
npm run prisma:migrate
npm run seed
```

4. Start development server:
```bash
npm run dev
```

Server runs on http://localhost:3000

## API Endpoints

### Authentication
- **POST** `/api/auth/signup` - Register new user
  - Body: { email, password, name }
  
- **POST** `/api/auth/login` - Login user
  - Body: { email, password }
  
- **GET** `/api/auth/profile` - Get user profile (requires auth)

### WhatsApp
- **GET** `/api/whatsapp/qr` - Generate QR code (requires auth)
- **POST** `/api/whatsapp/verify-scan` - Verify QR scan (requires auth)
- **GET** `/api/whatsapp/status` - Get connection status (requires auth)

### Campaigns
- **POST** `/api/campaigns` - Create campaign (requires auth)
  - Body: { name, messageBody, delayType }
  
- **GET** `/api/campaigns` - List campaigns (requires auth)
  - Query: ?page=1&limit=10
  
- **GET** `/api/campaigns/:id` - Get campaign details (requires auth)

- **POST** `/api/campaigns/:id/contacts` - Add contacts (requires auth)
  - Body: { contacts: [{phone, name?, metadata?, tags?}] }
  
- **POST** `/api/campaigns/:id/send` - Send campaign (requires auth)

- **GET** `/api/campaigns/:id/stats` - Get campaign stats (requires auth)

- **DELETE** `/api/campaigns/:id` - Delete campaign (requires auth)

## Project Structure

```
backend/
 src/
    server.ts              # Express app setup
    middleware/
       authMiddleware.ts  # JWT verification
    services/
       authService.ts     # Auth logic
       whatsappService.ts # WhatsApp integration
       campaignService.ts # Campaign CRUD
    routes/
       authRoutes.ts      # Auth endpoints
       whatsappRoutes.ts  # WhatsApp endpoints
       campaignRoutes.ts  # Campaign endpoints
    types/
       index.ts           # TypeScript interfaces
    utils/
       logger.ts          # Winston logger
    middleware/
 prisma/
    schema.prisma          # Database schema (11 models)
    migrations/            # Database migrations
 package.json

```

## Database Models

- **User** - User accounts with trial tracking
- **Campaign** - WhatsApp campaigns
- **Message** - Individual messages in campaigns
- **Contact** - Recipients for campaigns
- **Template** - Message templates
- **Session** - WhatsApp session management
- **Plan** - Subscription tiers
- **BillingHistory** - Payment records
- **CampaignBatchLog** - Batch processing logs
- **BanRiskEvent** - Account safety monitoring
- **AdminAction** - Admin audit logs

## Development Commands

```bash
npm run dev              # Start dev server with hot reload
npm run build           # Build TypeScript
npm run start           # Start built application
npm run test            # Run tests
npm run lint            # Run ESLint
npm run prisma:studio   # Open Prisma Studio UI
npm run prisma:migrate  # Run pending migrations
npm run seed            # Seed database with sample data
```

## Next Steps

1. Install npm dependencies: `npm install`
2. Setup PostgreSQL database
3. Configure .env file
4. Run migrations: `npm run prisma:migrate`
5. Start backend: `npm run dev`
6. Start frontend: `cd frontend && npm install && npm run dev`

## Architecture

- **Authentication**: JWT tokens with 7-day expiry
- **Database**: PostgreSQL with Prisma ORM
- **Message Delivery**: Baileys (primary) + Web JS (fallback) for 99.5% reliability
- **Anti-ban**: Configurable delays (fast/balanced/safe)
- **API**: RESTful with comprehensive error handling
- **Logging**: Winston with file rotation

## Features

- User authentication with email/password
- 7-day free trial on signup
- WhatsApp QR code authentication
- Bulk campaign management
- Contact management with deduplication
- Campaign statistics and analytics
- Role-based billing (Free, Starter, Professional, Enterprise)
- API rate limiting (100 requests/15 minutes)
- Full TypeScript support
- Comprehensive error handling and logging
