# Quick Start Guide - Broadcaster

## What's Been Created

 **Complete Backend Implementation**
- Authentication system (signup, login, JWT)
- WhatsApp QR code integration
- Campaign management (CRUD)
- Contact management
- Campaign statistics
- Winston logging
- TypeScript support
- Prisma ORM setup

 **Database Schema**
- 11 Prisma models
- All relationships configured
- Ready for migrations

 **API (10 Endpoints)**
- 3 Auth endpoints
- 3 WhatsApp endpoints  
- 4 Campaign endpoints

## Installation & Setup

### 1. Install Node Dependencies

```bash
cd backend
npm install
```

This installs all 30+ dependencies including:
- Express.js
- Prisma
- JWT
- bcryptjs
- Winston logging
- TypeScript
- And more...

### 2. Setup PostgreSQL Database

```bash
# Create database and user
psql -U postgres
CREATE DATABASE broadcaster;
CREATE USER broadcaster_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE broadcaster TO broadcaster_user;
\q
```

### 3. Run Database Migrations

```bash
cd backend
npm run prisma:migrate
```

This creates all database tables from the Prisma schema.

### 4. Start Backend Server

```bash
npm run dev
```

Server starts on http://localhost:3000

### 5. Test Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected: `{"status":"ok","timestamp":"..."}`

## Available Commands

```bash
npm run dev              # Start dev server
npm run build            # Compile TypeScript
npm run start            # Run compiled app
npm run lint             # Run ESLint
npm run test             # Run tests
npm run prisma:studio    # Open database UI
npm run prisma:migrate   # Run migrations
```

## API Examples

### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'
```

Response: User data + JWT token

### Get QR Code
```bash
curl -X GET http://localhost:3000/api/whatsapp/qr \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response: QR code data URL for scanning

### Create Campaign
```bash
curl -X POST http://localhost:3000/api/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Holiday Sale",
    "messageBody": "Check out our sale!",
    "delayType": "balanced"
  }'
```

### Add Contacts
```bash
curl -X POST http://localhost:3000/api/campaigns/CAMPAIGN_ID/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "contacts": [
      {"phone": "919876543210", "name": "Customer 1"},
      {"phone": "919876543211", "name": "Customer 2"}
    ]
  }'
```

### Send Campaign
```bash
curl -X POST http://localhost:3000/api/campaigns/CAMPAIGN_ID/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Campaign Stats
```bash
curl -X GET http://localhost:3000/api/campaigns/CAMPAIGN_ID/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response: Delivery metrics (sent, delivered, failed, pending)

## Project Structure

```
WATI/
 backend/
    src/
       server.ts                 # Express app
       middleware/
          authMiddleware.ts     # JWT auth
       services/                 # Business logic
          authService.ts        # Auth
          whatsappService.ts    # WhatsApp
          campaignService.ts    # Campaigns
       routes/                   # API endpoints
          authRoutes.ts         # /api/auth/*
          whatsappRoutes.ts     # /api/whatsapp/*
          campaignRoutes.ts     # /api/campaigns/*
       types/
          index.ts              # TypeScript interfaces
       utils/
           logger.ts             # Winston logging
    prisma/
       schema.prisma             # Database models
       migrations/               # Migration files
    .env                          # Configuration
    tsconfig.json                 # TypeScript config
    package.json                  # Dependencies
 frontend/
    src/
       pages/                    # React pages
       components/               # React components
       api/                      # API client
       ...
    package.json
 README.md                         # Full documentation
 IMPLEMENTATION_STATUS.md          # What was built
```

## Deployment Checklist

- [ ] npm install completed
- [ ] PostgreSQL database created
- [ ] Migrations ran successfully
- [ ] Backend server starts without errors
- [ ] Health endpoint responds
- [ ] Signup endpoint works
- [ ] Login endpoint works and returns JWT
- [ ] Get profile endpoint works with JWT
- [ ] QR code generation works
- [ ] Campaign endpoints work

## Support

For issues or questions, check:
1. IMPLEMENTATION_STATUS.md
2. README.md
3. Backend logs: `npm run dev` shows Winston logs
4. Database: `npm run prisma:studio` opens web UI

## Next Phase

Day 3-7: Message queuing, scheduling, retry logic
Day 8-15: Frontend pages, deployment

Ready to build! 
