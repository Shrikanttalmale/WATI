# BROADCASTER: ARCHITECTURE & TECHNICAL DESIGN DOCUMENT

## EXECUTIVE SUMMARY

**Product:** Broadcaster (WhatsApp Bulk Messaging SaaS)
**Architecture Type:** Microservices (phased)  Monolith (MVP 15-day launch)
**Deployment Model:** Cloud-native (Vercel + Railway + Managed Services)
**Target Scale:** 100+ paying customers, 99.5% reliability, <2 second latency
**Infrastructure Cost:** ₹1,050/month (MVP phase), ₹5,125/month (1K customers)

---

## SYSTEM ARCHITECTURE OVERVIEW

### High-Level Architecture Diagram (ASCII)

```

                         CLIENT LAYER                             

  React Frontend (Vercel)                                         
  - Dashboard                                                     
  - Campaign Builder                                              
  - Analytics                                                     
  - Admin Panel                                                   

                      HTTPS + JWT

                     API GATEWAY / BFF                            

  Express.js Backend (Railway)                                    
  - Authentication & Session Management                          
  - REST API Endpoints                                           
  - Rate Limiting & Validation                                   
  - Error Handling & Logging                                     

                     
        
                                
         
   Database    Queue    Session
              System    Store  
         
                    
        
                               
           
     Message           Failover 
     Sender             Logic   
   (Baileys)          (Web JS)  
           
                            
        
                 
          
            WhatsApp   
            Network    
          
```

### Component Breakdown

| Layer | Component | Technology | Purpose |
|-------|-----------|-----------|---------|
| **Frontend** | Web App | React + Tailwind + i18next | User interface (dashboard, campaigns, analytics) |
| **Backend** | API Server | Node.js + Express | REST API, business logic, auth |
| **Database** | Primary Store | PostgreSQL | Users, campaigns, messages, billing data |
| **Cache** | Session Store | Redis | Session tokens, temporary data |
| **Queue** | Message Queue | Bull + Upstash Redis | Message delivery queue, retry logic |
| **Message Sender** | Primary Method | Baileys | 95% delivery success rate |
| **Failover** | Secondary Method | Puppeteer + Web JS | 99% delivery success rate |
| **Logging** | Error Tracking | Sentry | Error monitoring, alerts |
| **Payment** | Billing | Razorpay API | Payment processing |
| **Email** | Notifications | SendGrid / AWS SES | Transactional emails |

---

## DETAILED ARCHITECTURE

### 1. FRONTEND ARCHITECTURE

#### Stack
```
React 18
 State Management: Zustand or Redux Toolkit
 UI Framework: Tailwind CSS + Headless UI
 Routing: React Router v6
 HTTP Client: Axios with interceptors
 i18n: i18next (Hindi, Marathi, English)
 Charts: Recharts (analytics)
 Forms: React Hook Form + Zod validation
 Deployment: Vercel
```

#### Page Structure
```
/src
 pages/
    Auth/
       SignUp.tsx
       Login.tsx
       QRCode.tsx (WhatsApp login)
       TrialBanner.tsx
    Dashboard/
       Overview.tsx (key metrics)
       RecentCampaigns.tsx
       QuickActions.tsx
    Campaigns/
       List.tsx
       Create.tsx (campaign builder)
       BulkUpload.tsx (CSV parser)
       Details.tsx (campaign stats)
    Analytics/
       Dashboard.tsx
       DeliveryChart.tsx
       Export.tsx
    Contacts/
       List.tsx
       Import.tsx
       Groups.tsx
    Templates/
       List.tsx
       Create.tsx
       Category.tsx
    Settings/
       Account.tsx
       Billing.tsx
       Preferences.tsx
       Help.tsx
    Admin/ (admin only)
       Users.tsx
       Plans.tsx
       SystemHealth.tsx
    404.tsx
 components/
    Auth/
    Campaign/
    Analytics/
    Common/
 services/
    api.ts (Axios instance)
    auth.ts (auth logic)
    campaign.ts (campaign API calls)
    analytics.ts (analytics API calls)
 hooks/
    useAuth.ts
    useCampaign.ts
    useAnalytics.ts
 store/ (Zustand)
    authStore.ts
    campaignStore.ts
    uiStore.ts
 utils/
    validators.ts
    formatters.ts
    constants.ts
 styles/
     globals.css (Tailwind)
```

#### Key Features
- **Responsive Design:** Mobile-first, works on all devices
- **Real-time Status:** WebSocket for live campaign progress
- **Multi-language:** English, Hindi, Marathi via i18next
- **Theme Switching:** Light/dark mode toggle
- **Offline Fallback:** Service worker for critical actions
- **Performance:** Lazy loading, code splitting, image optimization

---

### 2. BACKEND ARCHITECTURE

#### Stack
```
Node.js + Express
 Runtime: Node.js 18+
 Framework: Express.js
 Authentication: JWT + bcrypt
 Database ORM: Prisma or TypeORM
 Validation: Joi or Zod
 HTTP: Axios for external APIs
 Task Scheduling: Bull (Redis-backed)
 Logging: Winston or Pino
 Error Tracking: Sentry
 Testing: Jest + Supertest
 Deployment: Railway
```

#### Project Structure
```
/backend
 src/
    server.ts (entry point)
    config/
       database.ts (Prisma)
       redis.ts (session + cache)
       env.ts (environment variables)
       constants.ts
    routes/
       auth.routes.ts (signup, login, QR)
       campaign.routes.ts (CRUD campaigns)
       message.routes.ts (send, schedule)
       analytics.routes.ts (metrics)
       contact.routes.ts (import, manage)
       template.routes.ts (CRUD templates)
       billing.routes.ts (plans, checkout)
       admin.routes.ts (admin panel)
       health.routes.ts (status checks)
    controllers/
       authController.ts
       campaignController.ts
       messageController.ts
       analyticsController.ts
       contactController.ts
       templateController.ts
       billingController.ts
       adminController.ts
    services/
       authService.ts
       campaignService.ts
       messageService.ts
       analyticsService.ts
       whatsappService.ts (Baileys integration)
       failoverService.ts (Web JS fallback)
       contactService.ts
       templateService.ts
       billingService.ts (Razorpay)
       emailService.ts (SendGrid)
    models/
       User.ts
       Campaign.ts
       Message.ts
       Session.ts
       Contact.ts
       Template.ts
       Billing.ts
    middleware/
       auth.ts (JWT verification)
       errorHandler.ts
       rateLimiter.ts
       requestLogger.ts
       validation.ts
    queues/
       messageQueue.ts (Bull)
       retryQueue.ts
       scheduleQueue.ts
    workers/
       messageSender.ts
       retryHandler.ts
       schedulerWorker.ts
    utils/
       validators.ts
       formatters.ts
       encryption.ts
       logger.ts
       errors.ts
    types/
        index.ts (TypeScript interfaces)
 prisma/
    schema.prisma (database schema)
 tests/
    auth.test.ts
    campaign.test.ts
    message.test.ts
 .env.example
 .env.production
 package.json
 tsconfig.json
```

#### Key API Endpoints

**Authentication:**
```
POST   /api/auth/signup              - Register new user
POST   /api/auth/login               - Login user
POST   /api/auth/logout              - Logout user
POST   /api/auth/qr-code             - Get QR code for WhatsApp
POST   /api/auth/qr-verify           - Verify QR scan
POST   /api/auth/session-refresh     - Refresh expired session
GET    /api/auth/profile             - Get current user
PUT    /api/auth/profile             - Update profile
```

**Campaigns:**
```
POST   /api/campaigns                - Create campaign
GET    /api/campaigns                - List campaigns (paginated)
GET    /api/campaigns/:id            - Get campaign details
PUT    /api/campaigns/:id            - Update campaign
DELETE /api/campaigns/:id            - Delete campaign
POST   /api/campaigns/:id/send       - Send campaign now
POST   /api/campaigns/:id/schedule   - Schedule campaign
POST   /api/campaigns/:id/cancel     - Cancel in-progress campaign
```

**Messages:**
```
POST   /api/messages/send            - Send single message
POST   /api/messages/bulk            - Send bulk messages
GET    /api/messages/:id             - Get message status
POST   /api/messages/retry           - Retry failed message
```

**Contacts:**
```
POST   /api/contacts/import          - Upload CSV contacts
GET    /api/contacts                 - List contacts
DELETE /api/contacts/:id             - Delete contact
POST   /api/contacts/dedupe          - Find duplicates
```

**Templates:**
```
POST   /api/templates                - Create template
GET    /api/templates                - List templates
PUT    /api/templates/:id            - Update template
DELETE /api/templates/:id            - Delete template
```

**Analytics:**
```
GET    /api/analytics/overview       - Dashboard metrics
GET    /api/analytics/campaigns      - Campaign performance
GET    /api/analytics/delivery       - Delivery status breakdown
GET    /api/analytics/export         - Export data (CSV)
```

**Billing:**
```
GET    /api/billing/plans            - Get all plans
POST   /api/billing/checkout         - Create Razorpay order
POST   /api/billing/verify           - Verify payment
GET    /api/billing/invoice          - Get invoices
GET    /api/billing/usage            - Current usage stats
```

**Admin:**
```
GET    /api/admin/users              - List all users
PUT    /api/admin/users/:id/plan     - Update user plan
GET    /api/admin/system/health      - System health status
GET    /api/admin/analytics          - Business analytics
```

---

### 3. DATABASE ARCHITECTURE

#### Technology: PostgreSQL (Railway Managed)

#### Schema Design

**users table**
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  plan_id INTEGER REFERENCES plans(id),
  trial_started_at TIMESTAMP,
  trial_expires_at TIMESTAMP,
  messages_sent_this_month INTEGER DEFAULT 0,
  status ENUM('active', 'trial', 'suspended', 'inactive'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL,
  
  -- Indexes
  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_users_plan_id ON users(plan_id);
  CREATE INDEX idx_users_status ON users(status);
);
```

**whatsapp_sessions table**
```sql
CREATE TABLE whatsapp_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  qr_code TEXT,
  method ENUM('baileys', 'web_js') DEFAULT 'baileys',
  status ENUM('pending', 'connected', 'expired', 'failed'),
  expires_at TIMESTAMP,
  last_activity_at TIMESTAMP,
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CREATE INDEX idx_sessions_user_id ON whatsapp_sessions(user_id);
  CREATE INDEX idx_sessions_status ON whatsapp_sessions(status);
  CREATE INDEX idx_sessions_expires ON whatsapp_sessions(expires_at);
);
```

**campaigns table**
```sql
CREATE TABLE campaigns (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  message_body TEXT NOT NULL,
  template_id BIGINT REFERENCES templates(id),
  status ENUM('draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled'),
  total_recipients INTEGER,
  delay_type ENUM('fast', 'balanced', 'safe') DEFAULT 'balanced',
  scheduled_for TIMESTAMP NULL,
  recurrence ENUM('none', 'daily', 'weekly', 'monthly') DEFAULT 'none',
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
  CREATE INDEX idx_campaigns_status ON campaigns(status);
  CREATE INDEX idx_campaigns_scheduled ON campaigns(scheduled_for);
);
```

**messages table**
```sql
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT REFERENCES campaigns(id) ON DELETE CASCADE,
  recipient_phone VARCHAR(20) NOT NULL,
  message_body TEXT NOT NULL,
  status ENUM('queued', 'sent', 'delivered', 'failed', 'blocked'),
  delivery_method ENUM('baileys', 'web_js', 'fallback') DEFAULT 'baileys',
  send_attempt_count INTEGER DEFAULT 0,
  ban_risk_score INTEGER (1-10) DEFAULT 5,
  delay_applied_ms INTEGER,
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  failed_reason VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CREATE INDEX idx_messages_campaign_id ON messages(campaign_id);
  CREATE INDEX idx_messages_status ON messages(status);
  CREATE INDEX idx_messages_delivered ON messages(delivered_at);
);
```

**contacts table**
```sql
CREATE TABLE contacts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  group_id BIGINT REFERENCES contact_groups(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CREATE INDEX idx_contacts_user_phone ON contacts(user_id, phone);
  CREATE INDEX idx_contacts_group ON contacts(group_id);
  CREATE UNIQUE INDEX idx_contacts_unique ON contacts(user_id, phone);
);
```

**templates table**
```sql
CREATE TABLE templates (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  category ENUM('order', 'reminder', 'promo', 'feedback', 'custom'),
  placeholders TEXT[] (JSON array of {name, example}),
  is_builtin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CREATE INDEX idx_templates_user_id ON templates(user_id);
  CREATE INDEX idx_templates_category ON templates(category);
);
```

**billing table**
```sql
CREATE TABLE billing (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES plans(id),
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'INR',
  razorpay_order_id VARCHAR(255) UNIQUE,
  razorpay_payment_id VARCHAR(255) UNIQUE,
  status ENUM('pending', 'completed', 'failed', 'refunded'),
  next_renewal_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CREATE INDEX idx_billing_user_id ON billing(user_id);
  CREATE INDEX idx_billing_status ON billing(status);
);
```

**plans table** (read-only, seeded)
```sql
CREATE TABLE plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50),
  price DECIMAL(10, 2),
  messages_per_month INTEGER,
  support_level ENUM('email', 'chat', 'dedicated'),
  features TEXT[] (JSON array),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Indexes & Optimization

Key indexes for performance:
- `user_id` on all transaction tables (joins)
- `status` on campaigns, messages (filtering)
- `created_at`, `delivered_at` on messages (time-range queries)
- `expires_at` on sessions (cleanup queries)
- `phone` on contacts (lookups)

#### Data Retention Policy
- Messages: Keep for 90 days (archive older)
- Sessions: Auto-expire after 30 days
- Deleted users: Soft delete (retain for 180 days, then purge)

---

### 4. MESSAGE QUEUE ARCHITECTURE

#### Technology: Bull + Upstash Redis

#### Queue System Design

```

  Campaign Start  
   (API Call)     

         
    
       Message Queue (Bull)           
      - Add 1000s of messages         
      - Store in Redis (Upstash)      
      - Rate limit: 30 msgs/min       
    
         
    
      Message Worker               
      - Process queue items        
      - Apply delays               
      - Batch pause logic          
      - Send via Baileys/Web JS    
    
         
    
      Result Handler                      
      - Update message status             
      - Failed  Retry Queue              
      - Success  Update analytics        
      - Emit events for real-time UI      
    
```

#### Queue Configuration

**messageQueue:**
```javascript
const messageQueue = new Queue('messages', redisConnection, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  },
  settings: {
    maxStalledCount: 2,
    lockDuration: 30000,
    lockRenewTime: 15000
  }
});

messageQueue.process(
  30, // concurrency (30 messages/min = WhatsApp hard limit)
  async (job) => {
    // Process message send
    // Implement delay logic here
    // Call Baileys or Web JS
  }
);
```

**retryQueue:**
```javascript
const retryQueue = new Queue('retries', redisConnection);

// Failed messages retry after 5 minutes
retryQueue.process(async (job) => {
  const maxRetries = 3;
  if (job.attemptsMade < maxRetries) {
    // Re-add to messageQueue
  } else {
    // Move to dead letter queue
  }
});
```

**scheduleQueue:**
```javascript
// Cron job to check scheduled campaigns
const scheduleQueue = new Queue('scheduler');

scheduleQueue.process(async () => {
  const scheduledCampaigns = await Campaign.find({
    status: 'scheduled',
    scheduled_for: { $lte: now }
  });
  
  for (const campaign of scheduledCampaigns) {
    // Move to messageQueue
    // Update status to 'sending'
  }
});

// Run every minute
const repeatableJob = await scheduleQueue.add(
  {},
  { repeat: { cron: '* * * * *' } }
);
```

#### Delay Logic Implementation

```javascript
// In messageQueue.process()
async function processMessage(job) {
  const { message, campaign } = job.data;
  const { delay_type } = campaign;
  
  // Calculate delay based on type
  let delayMs = 0;
  if (delay_type === 'fast') {
    delayMs = Math.random() * 3000 + 2000; // 2-5 seconds
  } else if (delay_type === 'balanced') {
    delayMs = Math.random() * 5000 + 5000; // 5-10 seconds
  } else if (delay_type === 'safe') {
    delayMs = Math.random() * 20000 + 10000; // 10-30 seconds
  }
  
  // Apply delay
  await sleep(delayMs);
  
  // Check batch pause (every 100 messages)
  if (message.position_in_batch % 100 === 0) {
    await sleep(30000); // 30-second pause
  }
  
  // Send message
  const result = await sendViaBaileys(message);
  
  if (!result.success) {
    // Try Web JS failover
    const fallbackResult = await sendViaWebJS(message);
    return fallbackResult;
  }
  
  return result;
}
```

#### Rate Limiting

WhatsApp enforces **30 messages/minute** hard limit per account.

Configuration:
```javascript
const concurrency = 30; // messages per minute
const jobsPerSecond = 30 / 60; // 0.5 jobs/second

messageQueue.process(concurrency, async (job) => {
  // Process at most 30 jobs in parallel
});

// Additionally, add delay between jobs
const delayBetweenJobs = 1000 / jobsPerSecond; // 2000ms = 2 seconds
```

---

### 5. MESSAGE DELIVERY SYSTEM

#### Method 1: Baileys (Primary - 95% Success)

**Implementation:**
```javascript
import makeWASocket from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

const baileys = async (phoneNumber, message, sessionId) => {
  try {
    const sock = await makeWASocket.default({
      auth: getStoredCredentials(sessionId),
      printQRInTerminal: false,
      browser: ['Chrome', '120.0.1', 'Linux']
    });
    
    // Send message
    await sock.sendMessage(phoneNumber, { text: message });
    
    // Mark delivered
    await updateMessageStatus(messageId, 'delivered');
    
    // Save credentials for next session
    saveCredentials(sessionId, sock.authState);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

**Advantages:**
- No login required after first scan
- Session lasts 30 days
- Lightweight, low resource usage
- Supports text + media

**Limitations:**
- WhatsApp can block if flagged
- Session expires every 30 days
- Rate limited by WhatsApp

---

#### Method 2: Web JS with Puppeteer (Fallback - 99% Success)

**Implementation:**
```javascript
import puppeteer from 'puppeteer';

const webJSSend = async (phoneNumber, message, sessionId) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Load WhatsApp Web
    await page.goto('https://web.whatsapp.com/', { waitUntil: 'networkidle2' });
    
    // Check if session exists
    const sessionExists = await checkSessionStatus(page);
    if (!sessionExists) {
      // Auto-login via Web JS (handles QR internally)
      await autoLoginWebJS(page, sessionId);
    }
    
    // Send message
    await page.goto(`https://web.whatsapp.com/send?phone=${phoneNumber}`);
    await page.type('div[class*="input"]', message);
    await page.click('button[aria-label*="Send"]');
    
    // Wait for delivery confirmation
    await page.waitForTimeout(3000);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
};
```

**Advantages:**
- 99%+ success rate (mimics real user)
- Can handle complex scenarios
- Automatic recovery from bans

**Limitations:**
- Resource-intensive (spawns browser instance)
- Slower (5-10 seconds per message)
- Cost: ₹100-300/month for scale

---

#### Dual-Method Failover Strategy

**Auto-Switch Logic:**

```javascript
const sendMessage = async (message) => {
  // Track success rate hourly
  const hourlyStats = await getHourlyStats();
  
  let preferredMethod = 'baileys';
  
  // If Baileys < 95% success, use Web JS
  if (hourlyStats.baileys_success_rate < 0.95) {
    preferredMethod = 'web_js';
  }
  
  // Try preferred method first
  let result = await send(preferredMethod, message);
  
  if (!result.success && preferredMethod === 'baileys') {
    // Fallback to Web JS
    result = await send('web_js', message);
    result.method = 'failover';
  }
  
  return result;
};

// Cron: Every 5 minutes, retry failed messages via Web JS
const retryFailedMessages = async () => {
  const failedMessages = await Message.find({
    status: 'failed',
    send_attempt_count: 1,
    created_at: { $gte: 5 minutes ago }
  });
  
  for (const msg of failedMessages) {
    const result = await send('web_js', msg);
    if (result.success) {
      await msg.updateStatus('delivered');
    }
  }
};
```

---

### 6. SESSION MANAGEMENT ARCHITECTURE

#### Session Lifecycle

```
1. User QR Login (Day 0)
    Show QR code
    User scans with phone
    WhatsApp confirms login
    Save session token (30-day expiry)

2. Active Session (Day 1-30)
    User can send messages
    Auto-refresh every 24 hours
    Track last activity

3. Session Expiry (Day 30)
    Automatic logout
    User sees "Re-authenticate" button
    Requires new QR scan
    Back to step 1
```

**Implementation:**

```javascript
// Session stored in Redis (Upstash)
const sessionKey = `session:${userId}`;
const sessionTTL = 30 * 24 * 60 * 60; // 30 days

// On successful QR scan
await redis.setex(
  sessionKey,
  sessionTTL,
  JSON.stringify({
    userId,
    phone,
    token: generateToken(),
    method: 'baileys',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + sessionTTL * 1000)
  })
);

// Auto-refresh every 24 hours
const refreshSession = async (userId) => {
  const remaining = await redis.ttl(sessionKey);
  if (remaining < 7 * 24 * 60 * 60) { // Less than 7 days
    await redis.expire(sessionKey, sessionTTL);
    await logActivity(userId, 'session_refreshed');
  }
};

// Check session validity
const validateSession = async (userId) => {
  const session = await redis.get(sessionKey);
  if (!session) {
    throw new Error('Session expired');
  }
  return JSON.parse(session);
};
```

---

### 7. SCALING ARCHITECTURE

#### Phase 1 (MVP - 0-100 Customers)
**Current setup:** Monolith on Railway
- Single Node.js process
- PostgreSQL (managed)
- Redis (Upstash free tier)
- Baileys only (no Web JS)
- Cost: ₹1,050/month

#### Phase 2 (100-1K Customers)
**Optimize monolith:**
- Vertical scaling (Railway upgrade)
- Add Web JS failover
- Redis upgrade (Upstash paid)
- Message queue optimization
- Cost: ₹5,125/month

#### Phase 3 (1K-5K Customers)
**Microservices migration:**
- Separate API service
- Separate message worker
- Separate analytics service
- Multiple worker instances
- PostgreSQL replication
- Redis cluster
- Cost: ₹15K-20K/month

#### Phase 4 (5K+ Customers)
**Enterprise setup:**
- Kubernetes orchestration
- Auto-scaling based on load
- Dedicated WhatsApp Business API
- Global CDN
- Real-time analytics
- Cost: ₹50K+/month

---

### 8. MONITORING & OBSERVABILITY

#### Logging Strategy

**Levels:**
- ERROR: Failed message sends, payment failures, auth errors
- WARN: Rate limit warnings, session expiry approaching
- INFO: Campaign started, delivery stats, user actions
- DEBUG: API requests, queue operations (prod disabled)

**Implementation (Winston):**
```javascript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Sentry for error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1
});
```

#### Monitoring Dashboard (Sentry + Custom)

```

  Real-time Metrics                      

 Delivery Rate:  98.7% (target: 99.5%)   
 Uptime:         99.8% (target: 99.5%)   
 Avg Response:   120ms (target: <200ms)  
 Queue Depth:    45 jobs (target: <100)  
 Ban Rate:       0.3% (target: <1%)      
 Error Rate:     0.2% (target: <0.5%)    


Alerts:
- Delivery rate < 99%  Escalate to team
- Uptime < 99.5%  Page on-call engineer
- Ban rate > 1%  Reduce rate limit
- Queue backed up > 1000 jobs  Auto-scale
```

---

### 9. SECURITY ARCHITECTURE

#### Authentication & Authorization

**JWT Flow:**
```

  User Login    

         
    
      Generate JWT                 
      - Include: userId, plan, exp 
      - Sign with HS256            
      - Expiry: 24 hours           
    
         
    
      Return token to client       
      - Store in httpOnly cookie   
      - Auto-refresh on expiry     
    
         
    
      Each API request includes    
      token in Authorization header
    
         
    
      Middleware validates JWT     
      - Verify signature           
      - Check expiry               
      - Validate user permissions  
    
```

**Implementation:**
```javascript
// Middleware
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Password hashing
const hashPassword = (password) => bcrypt.hashSync(password, 10);
const comparePassword = (password, hash) => bcrypt.compareSync(password, hash);
```

#### Data Security

- **In Transit:** HTTPS/TLS 1.3
- **At Rest:** Database encryption (PostgreSQL with pgcrypto)
- **Sensitive Fields:** Encrypted (session tokens, API keys)
- **PCI Compliance:** No card data stored (Razorpay handles it)

#### Rate Limiting

```javascript
const rateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 100, // 100 requests per window
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', rateLimiter);
```

---

### 10. DEPLOYMENT ARCHITECTURE

#### Environments

```

  Development    
  (Local)        

 Node + SQLite   
 npm run dev     
 Auto-reload     



  Staging        
  (Railway)      

 Railway Deploy  
 PostgreSQL Dev  
 Upstash Redis   
 Test Payments   



  Production     
  (Railway)      

 Railway Deploy  
 PostgreSQL Prod 
 Upstash Redis   
 Live Payments   
 Monitoring On   

```

#### CI/CD Pipeline

```yaml
# GitHub Actions (on push to main)
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

#### Deployment Checklist

Before going live:
- [ ] All tests passing
- [ ] Environment variables set (.env)
- [ ] Database migrations run
- [ ] SSL certificate valid
- [ ] Monitoring enabled (Sentry)
- [ ] Backup created
- [ ] Load testing passed
- [ ] Security audit done
- [ ] Team sign-off

---

### 11. COST BREAKDOWN

#### Monthly Infrastructure Costs (MVP)

| Service | Tier | Cost | Purpose |
|---------|------|------|---------|
| Vercel | Free | ₹0 | Frontend hosting |
| Railway | Basic | ₹400 | Backend (Node.js) |
| PostgreSQL | 1GB | ₹150 | Database |
| Redis | Free | ₹0 | Session store (Upstash) |
| Sentry | Free | ₹0 | Error tracking |
| SendGrid | Free | ₹0 | Emails (12K/month) |
| **Total** | | **₹550/month** | |

#### At Scale (1K Customers)

| Service | Tier | Cost | Purpose |
|---------|------|------|---------|
| Vercel | Pro | ₹500 | Frontend + speed |
| Railway | Standard | ₹1,000 | Backend (2x instance) |
| PostgreSQL | 10GB | ₹1,500 | Database with replicas |
| Redis | Upstash | ₹500 | Paid tier (failover) |
| Sentry | Developer | ₹300 | Pro monitoring |
| Puppeteer | Web JS | ₹300 | Browser automation |
| SendGrid | Paid | ₹500 | Higher volume |
| Razorpay | 2% | ₹1,200 | Payment processing |
| Domain + DNS | Custom | ₹300 | domains.com + CloudFlare |
| **Total** | | **₹6,100/month** | |

---

### 12. ERROR HANDLING & RECOVERY

#### Failure Scenarios

**Scenario 1: Baileys Session Expires**
```
1. Message fails with "Session expired"
2. Catch error in messageQueue.process()
3. Re-trigger QR login flow
4. User notified (dashboard alert)
5. Message auto-retries after session refresh
6. If no response after 24h, move to retry queue
```

**Scenario 2: Network Timeout During Send**
```
1. Message send times out (>30s)
2. Mark as 'failed' with reason 'timeout'
3. Add to retry queue
4. Retry after 5 minutes (exponential backoff)
5. Max 3 retries, then move to dead letter queue
```

**Scenario 3: WhatsApp Rate Limit**
```
1. Receive 429 (rate limit) response
2. Pause message queue for 5 minutes
3. Update campaign status to 'paused'
4. User notified via dashboard
5. Resume automatically after wait period
6. Reduce delay per message to prevent future hits
```

**Scenario 4: Database Connection Lost**
```
1. Query fails with "Connection refused"
2. Attempt reconnect (3 retries)
3. If persistent, switch to read replica (if exists)
4. Queue goes into circuit breaker mode
5. Page on-call engineer
6. Transactions queued in memory (max 1000)
```

---

## TECHNOLOGY SELECTION RATIONALE

### Why These Choices?

| Technology | Alternative | Why Chosen |
|-----------|-------------|-----------|
| **React** | Vue, Angular | Largest ecosystem, best DX, most jobs |
| **Node.js** | Python, Go | JavaScript across stack, fast to build |
| **PostgreSQL** | MySQL, MongoDB | ACID compliance, JSON support, managed tier |
| **Redis** | Memcached | More features, better for our queues |
| **Bull** | RabbitMQ, Kafka | Lightweight, Redis-backed, easy to manage |
| **Baileys** | Official API | Free, immediate launch, Phase 2 migration ready |
| **Puppeteer** | Selenium, Playwright | Lightweight, good docs, Chrome-based |
| **Vercel** | Netlify, AWS | Zero-config, edge functions, fast deploys |
| **Railway** | Heroku, DigitalOcean | Simple pricing, good DX, Docker-native |

---

## DEPLOYMENT TIMELINE (15 Days)

**Week 1 (Days 1-7):** Backend + Database
- Day 1-2: Project setup, auth system
- Day 2-3: Campaign CRUD, message queue
- Day 3-4: Baileys integration
- Day 4-5: Analytics & billing
- Day 5-6: Admin panel
- Day 6-7: Deploy to Railway (staging)

**Week 2 (Days 8-14):** Frontend + Integration
- Day 8-9: React app scaffold, auth pages
- Day 9-10: Campaign builder, dashboard
- Day 10-11: Analytics dashboard
- Day 11-12: Billing integration
- Day 12-13: Testing & bug fixes
- Day 13-14: Deploy to Vercel (production)

**Day 15:** Go-Live
- Final monitoring setup
- Customer launch
- 24/7 support on-call

---

## CONCLUSION

This architecture supports:
 100+ paying customers on Day 1
 99.5% message delivery reliability
 < 2-second end-to-end latency
 Easy scaling to 1K+ customers
 Clear migration path (Baileys  Official API)
 Minimal infrastructure complexity
 Strong security & compliance posture

Ready for development kickoff!

