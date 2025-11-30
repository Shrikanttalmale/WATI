# BROADCASTER: SPRINT BACKLOG SUMMARY

## EXECUTIVE SUMMARY

**Total Scope:** 259 Story Points
**Sprint 1 (Backend):** 157 SP over 7 days (22 SP/day)
**Sprint 2 (Frontend):** 102 SP over 7 days (14.5 SP/day)
**Day 15:** Final testing & go-live
**Team:** 1 Developer (Solo Founder)

---

## SPRINT 1 BACKLOG (Days 1-7) - BACKEND & CORE FEATURES

### Epic Overview
| Epic | Focus | SP | Days | Status |
|------|-------|----|----|---------|
| 1. Authentication | User signup, login, WhatsApp auth | 21 | 1-2 | Backlog |
| 2. Campaign Mgmt | Create, upload, manage campaigns | 34 | 3-4 | Backlog |
| 3. Message Delivery | Send, delays, Baileys, fallback | 34 | 4-5 | Backlog |
| 4. Campaign Scheduling | Schedule campaigns for later | 13 | 5-6 | Backlog |
| 5. Analytics | Dashboards, reporting, ban risk | 21 | 5-6 | Backlog |
| 6. Billing & Plans | Payment integration, usage tracking | 21 | 5-7 | Backlog |
| 7. Admin Panel | Admin dashboard, user management | 13 | 6-7 | Backlog |
| **TOTAL** | | **157 SP** | |  |

---

## SPRINT 1 DETAILED BACKLOG - SEQUENCED BY DAY

###  DAY 1-2: AUTHENTICATION (21 SP)

#### 1.1 - User Registration (8 SP)  CRITICAL
```
Assignee: Developer
Day: 1
Status:  Not Started
Dependencies: PostgreSQL schema ready

Tasks:
[1h] Frontend: Create React signup form (email, password, name)
[2h] Backend: POST /api/auth/signup endpoint
[1h] Backend: Email validation middleware
[0.5h] Backend: User record creation + trial setup
[1h] Backend: Email service integration (Sendmail)
[1h] Testing: Unit tests for signup flow
[0.5h] Documentation: API docs

Testing Requirements:
-  Email validation (format, uniqueness)
-  Password hashing (bcrypt)
-  Welcome email sent
-  Trial expires in 7 days
-  Error handling for duplicates

Acceptance Criteria (ALL must pass):
 User can create account with email/password/name
 Email must be unique and valid format
 Password minimum 8 chars with special character
 Welcome email sent with verification link
 Trial auto-enrolled (expires_at = now + 7 days)
 Redirect to WhatsApp QR page on success
 Error messages clear and actionable
```

#### 1.2 - User Login (5 SP)  CRITICAL
```
Assignee: Developer
Day: 1
Status:  Not Started
Dependencies: 1.1 (User Registration) 

Tasks:
[1h] Frontend: React login form (email, password)
[1.5h] Backend: POST /api/auth/login endpoint
[1h] Backend: JWT token generation
[0.5h] Backend: HttpOnly cookie setup
[0.5h] Backend: Rate limiting (5 attempts/15min)
[0.5h] Testing: Login flow tests
[0.5h] Documentation: Session management docs

Testing Requirements:
-  Valid credentials accepted
-  Invalid password rejected
-  JWT token valid
-  Cookie persists across page refresh
-  Rate limiting blocks 6th attempt

Acceptance Criteria (ALL must pass):
 User can login with email/password
 JWT token generated and stored in httpOnly cookie
 Session persists across page refreshes
 "Remember me" option available
 Rate limiting prevents brute force (5 attempts/15min)
 Error messages for invalid credentials
 Password reset flow functional
```

#### 1.3 - WhatsApp QR Code Authentication (8 SP)  CRITICAL
```
Assignee: Developer
Day: 2
Status:  Not Started
Dependencies: 1.2 (User Login) 

Tasks:
[2h] Backend: Baileys QR code generation
[1.5h] Frontend: QR display page + instructions
[1.5h] Backend: Session validation polling (GET /api/auth/qr-status)
[1h] Backend: Redis session storage (30-day TTL)
[0.5h] Backend: Session refresh logic
[0.5h] Testing: QR validation tests
[0.5h] Documentation: Auth flow docs

Technical Implementation:
```javascript
// Baileys QR Generation
const sock = makeWASocket({
  auth: state,
  printQRInTerminal: false
});

// QR Display (React)
const [qr, setQr] = useState(null);
useEffect(() => {
  const poll = setInterval(async () => {
    const response = await fetch('/api/auth/qr-status');
    if(response.authenticated) {
      navigate('/dashboard');
    }
  }, 1000);
}, []);

// Redis Storage
redis.setex(
  `session:${userId}`,
  30 * 24 * 60 * 60,
  JSON.stringify({ phone, token, expiresAt })
);
```

Testing Requirements:
-  QR code unique per session
-  User can scan with WhatsApp
-  Auto-redirect after successful scan
-  Session stored in Redis with 30-day TTL

Acceptance Criteria (ALL must pass):
 QR code displays on screen
 QR code unique per user session
 User scans with WhatsApp on phone
 Session validates after scan
 Phone number stored in database
 Session expires after 30 days
 User notified when authenticated
 Can re-authenticate anytime from settings
```

---

###  DAY 3-4: CAMPAIGN MANAGEMENT (20 SP)

#### 2.1 - Create Campaign (8 SP)  CRITICAL
```
Assignee: Developer
Day: 3
Status:  Not Started
Dependencies: 1.3 (WhatsApp Auth) 

Tasks:
[2h] Frontend: Campaign builder form UI
[2h] Backend: POST /api/campaigns endpoint
[1h] Backend: Zod validation
[1h] Frontend: Emoji picker integration
[0.5h] Frontend: Character counter (max 1000)
[0.5h] Testing: Campaign creation tests
[0.5h] Documentation: Campaign API docs

Database Schema:
```sql
CREATE TABLE campaigns (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  message_body TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  total_recipients INTEGER DEFAULT 0,
  delay_type VARCHAR(20) DEFAULT 'balanced',
  scheduled_for TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

Acceptance Criteria (ALL must pass):
 User can enter campaign name and message
 Message preview updates in real-time
 Character count shown (max 1000)
 Emoji picker functional
 Save as draft option
 Campaign stored in database
 Success notification shown
 Validation prevents empty fields
```

#### 2.2 - Upload Contacts (13 SP)  CRITICAL
```
Assignee: Developer
Day: 3-4
Status:  Not Started
Dependencies: 2.1 (Create Campaign) 

Tasks:
[2h] Frontend: CSV upload component with drag-drop
[1.5h] Frontend: CSV parsing (Papa Parse)
[2h] Backend: POST /api/contacts/import endpoint
[2h] Backend: Phone number validation/formatting
[1.5h] Backend: Duplicate detection logic
[1h] Frontend: Progress bar during import
[1h] Frontend: Preview of first 10 rows
[1h] Testing: CSV import tests
[0.5h] Documentation: Contact import guide

Phone Number Formatting:
```javascript
// Format: +91XXXXXXXXXX
function formatPhone(phone) {
  phone = phone.replace(/\D/g, ''); // Remove non-digits
  if(phone.length === 10) {
    phone = '91' + phone; // Add India code
  }
  return '+' + phone;
}
```

Database Schema:
```sql
CREATE TABLE contacts (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT REFERENCES campaigns(id),
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contacts_campaign ON contacts(campaign_id);
```

Testing Requirements:
-  CSV parsing works correctly
-  Phone numbers formatted to +91XXXXXXXXXX
-  Duplicates detected and skipped
-  Preview shows first 10 rows
-  Progress bar updates
-  Error handling for invalid formats

Acceptance Criteria (ALL must pass):
 CSV upload form with drag-and-drop
 Auto-format phone numbers (add +91)
 Detect and show duplicates
 Preview of first 10 rows
 Import button imports all contacts
 Success message shows count
 Error handling for invalid formats
 Duplicate prevention per campaign
 Progress tracking during import
```

#### 2.3 - View & Manage Campaigns (7 SP)  HIGH
```
Assignee: Developer
Day: 4
Status:  Not Started
Dependencies: 2.1 (Create Campaign) 

Tasks:
[2h] Frontend: Campaign list page
[1.5h] Backend: GET /api/campaigns endpoint
[1.5h] Backend: Filtering/sorting logic
[1h] Backend: Delete campaign endpoint
[0.5h] Frontend: Delete confirmation modal
[0.5h] Testing: List view tests

API Response Format:
```javascript
GET /api/campaigns
Response: [
  {
    id: 1,
    name: "Summer Sale",
    status: "completed",
    recipient_count: 150,
    message_count: 150,
    created_at: "2025-01-10T10:00:00Z"
  }
]

Query Parameters:
?status=draft        // Filter by status
?sort=date_desc      // Sort options
?page=1&limit=20     // Pagination
```

Acceptance Criteria (ALL must pass):
 Campaign list displays all user campaigns
 Shows: name, status, date created, recipient count
 Can sort by date or status
 Can filter by status (draft/scheduled/sending/completed)
 Can delete campaign (with confirmation)
 Can edit draft campaigns
 Pagination for many campaigns (20 per page)
 Responsive design
```

#### 2.4 - Campaign Templates (6 SP)  HIGH
```
Assignee: Developer
Day: 4
Status:  Not Started
Dependencies: 2.1 (Create Campaign) 

Templates to Create (10+ default):
1. Order Confirmation
   "Your order {order_id} confirmed. Delivery in 2-3 days."
2. Payment Reminder
   "Hi {name}, your payment of ₹{amount} is due."
3. Promotional
   " Special offer! Get 50% off. Valid till {date}."
4. Feedback Request
   "Hi {name}, please rate our service."
5. Appointment Reminder
   "Your appointment confirmed on {date} at {time}."
6. Birthday Greeting
   " Happy Birthday {name}!"
7. OTP/Verification
   "Your verification code is {code}."
8. Welcome Message
   "Welcome {name}! Thanks for joining us."
9. Follow-up
   "Hi {name}, just checking if you need help?"
10. Event Reminder
    "{event} starting in {time}."

Tasks:
[1h] Backend: Create templates table
[0.5h] Backend: Seed default templates
[1.5h] Frontend: Template selector UI
[1h] Backend: POST /api/templates (save custom)
[1h] Backend: DELETE /api/templates/{id}
[0.5h] Frontend: Template list/management
[0.5h] Testing: Template tests

Acceptance Criteria (ALL must pass):
 10+ pre-built templates available
 Can select template and preview
 Can customize template text
 Can save custom templates
 Can delete saved templates
 Variables work in templates ({name}, {amount}, etc)
```

---

###  DAY 4-5: MESSAGE DELIVERY SYSTEM (34 SP)

#### 3.1 - Send Campaign (13 SP)  CRITICAL
```
Assignee: Developer
Day: 4-5
Status:  Not Started
Dependencies: 2.2 (Upload Contacts) 

Tasks:
[2h] Backend: POST /api/campaigns/:id/send endpoint
[2h] Backend: Bull queue integration
[1.5h] Backend: Message creation for all contacts
[3h] Backend: Message sender worker (Baileys)
[2h] Backend: Delivery tracking/status updates
[2h] Frontend: Real-time progress updates (WebSocket)
[0.5h] Testing: Send campaign tests
[0.5h] Documentation: Message delivery guide

Send Campaign Workflow:
```
1. User clicks "Send" on campaign
   
2. API validates campaign has contacts
   
3. Create message records for all contacts
   
4. Add all messages to Bull queue
   
5. Update campaign status: draft  sending
   
6. Message worker processes queue
   
7. Send via Baileys (with delay logic)
   
8. Update message status: queued  sent  delivered
   
9. Update campaign progress (real-time via WebSocket)
   
10. Auto-complete campaign when all messages sent
```

Database Schema:
```sql
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT REFERENCES campaigns(id),
  recipient_phone VARCHAR(20) NOT NULL,
  message_body TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'queued',
  delivery_method VARCHAR(20) DEFAULT 'baileys',
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  failed_reason VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_campaign ON messages(campaign_id);
CREATE INDEX idx_messages_status ON messages(status);
```

Testing Requirements:
-  Messages added to queue
-  Campaign status changes correctly
-  Real-time progress updates
-  Delivery status tracked
-  Failed messages logged

Acceptance Criteria (ALL must pass):
 Send button visible on campaign page
 Clicking send adds all messages to queue
 Campaign status changes to "sending"
 Real-time progress bar shows sent count
 Delivery confirmation received per message
 Campaign auto-completes when all sent
 Can view delivery status per message
 Failed messages tracked separately
```

#### 3.2 - Message Delay Options (8 SP)  CRITICAL
```
Assignee: Developer
Day: 5
Status:  Not Started
Dependencies: 3.1 (Send Campaign) 

Tasks:
[1h] Frontend: Delay options UI (3 buttons)
[1.5h] Backend: applyDelay function
[1.5h] Backend: Batch pause logic (30s pause after 100)
[1h] Backend: Calculate estimated send time
[0.5h] Frontend: Ban risk % display
[1h] Backend: Random delay within range
[0.5h] Testing: Delay logic tests
[0.5h] Documentation: Delay strategy guide

Delay Configuration:
```javascript
const delayOptions = {
  fast: {
    min: 2000,      // 2 seconds
    max: 5000,      // 5 seconds
    banRisk: '35%',
    time1000: '~1.5 hours'
  },
  balanced: {
    min: 5000,      // 5 seconds
    max: 10000,     // 10 seconds
    banRisk: '8%',
    time1000: '~2-3 hours' // DEFAULT
  },
  safe: {
    min: 10000,     // 10 seconds
    max: 30000,     // 30 seconds
    banRisk: '1-2%',
    time1000: '~5-8 hours'
  }
};

// Batch pause: Every 100 messages, pause 30 seconds
if(messageCount % 100 === 0) {
  await sleep(30000);
}
```

Testing Requirements:
-  Delays applied correctly
-  Batch pauses work
-  Ban risk % accurate
-  Estimated time calculated correctly

Acceptance Criteria (ALL must pass):
 3 preset options: Fast, Balanced, Safe
 Ban risk % shown for each option
 Estimated time to send 1000 messages shown
 User can select delay before sending
 Default to "Balanced"
 Batch pausing every 100 messages (30s pause)
 Real-time delay application during send
```

#### 3.3 - Baileys Integration (7 SP)  CRITICAL
```
Assignee: Developer
Day: 5
Status:  Not Started
Dependencies: 1.3 (WhatsApp QR Auth) 

Tasks:
[2h] Backend: sendViaBaileys function
[1h] Backend: Credential storage (encrypted)
[1h] Backend: Success/failure tracking
[1h] Backend: Retry logic (3 attempts)
[1h] Testing: Baileys integration tests
[0.5h] Documentation: Baileys setup guide

Implementation:
```javascript
// /backend/src/services/whatsapp.ts
export async function sendViaBaileys(
  phoneNumber: string,
  message: string,
  sessionId: string
) {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(
      `./sessions/${sessionId}`
    );
    
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    const result = await sock.sendMessage(
      phoneNumber + '@s.whatsapp.net',
      { text: message }
    );
    
    return { success: true, method: 'baileys', result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Retry logic
const maxRetries = 3;
for(let i = 0; i < maxRetries; i++) {
  const result = await sendViaBaileys(...);
  if(result.success) return result;
  await sleep(5000 * (i + 1)); // Exponential backoff
}
```

Success Rate Target: 95%+

Testing Requirements:
-  Messages sent successfully
-  Failed messages logged
-  Retry logic works
-  Session credentials stored

Acceptance Criteria (ALL must pass):
 Messages sent successfully via Baileys
 95%+ delivery success rate
 Session credentials stored securely
 Failed messages logged with reason
 Retry logic for failed messages (3 attempts)
 Error messages informative
```

#### 3.4 - Web JS Fallback (6 SP)  HIGH
```
Assignee: Developer
Day: 5
Status:  Not Started
Dependencies: 3.3 (Baileys Integration) 

Tasks:
[2h] Backend: sendViaWebJS function (Puppeteer)
[1h] Backend: Auto-failover logic
[1h] Backend: Fallback tracking
[0.5h] Backend: Cron retry (5 min intervals)
[1h] Testing: Fallback tests
[0.5h] Documentation: Fallback guide

Implementation:
```javascript
// Dual-method failover
export async function sendMessage(message, campaign) {
  // Try Baileys first
  let result = await sendViaBaileys(
    message.to,
    message.body,
    campaign.session_id
  );
  
  if(!result.success) {
    // Fallback to Web JS
    console.log(`Baileys failed, trying Web JS for ${message.to}`);
    result = await sendViaWebJS(message.to, message.body);
    result.fallback_used = true;
  }
  
  // Save result
  await Message.updateOne(
    { id: message.id },
    {
      delivery_method: result.method,
      status: result.success ? 'delivered' : 'failed',
      delivered_at: result.success ? new Date() : null
    }
  );
  
  return result;
}
```

Combined Success Rate Target: 99.5%+

Testing Requirements:
-  Baileys failure triggers fallback
-  Web JS sends successfully
-  Combined success rate 99%+
-  Fallback transparent to user

Acceptance Criteria (ALL must pass):
 Detects Baileys failure
 Automatically tries Web JS
 99%+ combined delivery success
 Fallback transparent to user
 Fallback tracked in analytics
```

---

###  DAY 5-6: CAMPAIGN SCHEDULING & ANALYTICS

#### 4.1 - Schedule Campaign (8 SP)  HIGH
```
Assignee: Developer
Day: 5
Status:  Not Started
Dependencies: 2.1 (Create Campaign) 

Tasks:
[1.5h] Frontend: Date/time picker
[1h] Frontend: Timezone selector
[1h] Backend: Scheduler worker
[2h] Backend: Cron job every minute
[1.5h] Backend: Auto-send logic
[0.5h] Testing: Scheduler tests
[0.5h] Documentation: Scheduling guide

Database Schema:
```sql
ALTER TABLE campaigns ADD COLUMN (
  scheduled_for TIMESTAMP NULL,
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  recurrence VARCHAR(50) NULL -- daily, weekly, monthly, once
);
```

Scheduler Worker:
```javascript
// Runs every 60 seconds
setInterval(async () => {
  const campaigns = await Campaign.find({
    status: 'scheduled',
    scheduled_for: { $lte: new Date() }
  });
  
  for(const campaign of campaigns) {
    await campaignQueue.add({ campaignId: campaign.id });
    await campaign.updateOne({ status: 'sending' });
  }
}, 60000);
```

Acceptance Criteria (ALL must pass):
 Date/time picker in campaign form
 Timezone selector (default IST)
 Recurrence options (daily/weekly/monthly)
 Campaign stored with scheduled status
 Scheduler checks every minute
 Campaign auto-sends at scheduled time
 User notified when campaign sent
 Can cancel scheduled campaign
```

#### 5.1 - Delivery Analytics Dashboard (8 SP)  HIGH
```
Assignee: Developer
Day: 5
Status:  Not Started
Dependencies: 3.1 (Send Campaign) 

Tasks:
[2h] Backend: GET /api/analytics/overview endpoint
[2h] Frontend: Analytics dashboard page
[1.5h] Frontend: Time-series chart (Recharts)
[1h] Frontend: Real-time WebSocket updates
[1h] Backend: CSV export functionality
[0.5h] Testing: Analytics tests

Metrics to Display:
- Total messages sent today
- Delivery rate (%)
- Failed messages count
- Average delivery time (seconds)
- Time-series chart: sends per hour
- Campaign comparison table

API Response:
```javascript
GET /api/analytics/overview
Response: {
  today: {
    sent: 1250,
    delivered: 1180,
    failed: 70,
    deliveryRate: 94.4,
    avgDeliveryTime: 2.3
  },
  hourly: [
    { hour: 0, count: 50 },
    { hour: 1, count: 75 },
    // ... rest of day
  ],
  campaigns: [
    {
      id: 1,
      name: "Summer Sale",
      sent: 500,
      delivered: 475,
      failed: 25
    }
  ]
}
```

Acceptance Criteria (ALL must pass):
 Dashboard shows all key metrics
 Time-series chart showing sends/hour
 Campaign comparison table
 Export data to CSV
 Refresh every 5 seconds (real-time)
 Mobile responsive
```

#### 5.2 - Message-Level Analytics (8 SP)  HIGH
```
Assignee: Developer
Day: 6
Status:  Not Started
Dependencies: 3.1 (Send Campaign) 

Tasks:
[2h] Frontend: Message list view
[1.5h] Backend: GET /api/campaigns/:id/messages
[1.5h] Backend: Filtering/sorting logic
[1h] Frontend: Retry failed messages button
[0.5h] Frontend: Pagination
[0.5h] Testing: Message list tests
[0.5h] Documentation: Analytics docs

Message List Display:
- Phone number (masked: +91XXXXX5678)
- Message body (truncated)
- Status (sent/delivered/failed)
- Timestamp
- Failure reason (if failed)
- Retry button (if failed)

Acceptance Criteria (ALL must pass):
 Campaign detail page shows all messages
 Filter messages by status
 Show phone, message, status, timestamp
 Can retry individual failed messages
 Show failure reason for failed
 Pagination (100 messages per page)
 Mobile responsive
```

---

###  DAY 5-7: BILLING & ADMIN

#### 6.1 - Billing Plans Display (5 SP)  HIGH
```
Assignee: Developer
Day: 5
Status:  Not Started
Dependencies: None

Tasks:
[1h] Frontend: Pricing page design
[1h] Backend: GET /api/billing/plans
[1.5h] Frontend: Plan cards with features
[0.5h] Frontend: Feature comparison
[0.5h] Testing: Pricing page tests

Plans to Display:
```

 STARTER          PRO            BUSINESS
 ₹299/month       ₹599/month     ₹999/month
                                
 5K msgs          25K msgs       100K msgs
 Basic support    Email support  Priority support
 Single account   Single account Team accounts

 [SELECT]         [SELECT]       [SELECT]

```

Acceptance Criteria (ALL must pass):
 Display 3 plans: Starter, Pro, Business
 Show features for each plan
 Show price and message limit
 Show currently selected plan
 "Upgrade" button visible for other plans
 Feature comparison table
 Mobile responsive
```

#### 6.2 - Razorpay Integration (11 SP)  CRITICAL
```
Assignee: Developer
Day: 6-7
Status:  Not Started
Dependencies: 6.1 (Plans Display) 

Tasks:
[1h] Backend: Setup Razorpay account + sandbox
[1.5h] Frontend: Upgrade button flow
[2h] Backend: POST /api/billing/checkout endpoint
[2h] Frontend: Razorpay payment modal integration
[2h] Backend: POST /api/billing/verify endpoint
[1h] Backend: Update user plan on success
[1.5h] Backend: Invoice generation + email
[1h] Testing: Payment flow tests (test mode)

Payment Flow:
```
1. User clicks "Upgrade to Pro"
   
2. Frontend calls POST /api/billing/checkout
   { planId: 2, amount: 599 }
   
3. Backend creates Razorpay order
   Returns orderId, amount, key
   
4. Frontend opens Razorpay modal
   
5. User enters card details
   
6. Razorpay processes payment
   
7. Frontend calls POST /api/billing/verify
   { orderId, paymentId, signature }
   
8. Backend verifies HMAC signature
   
9. Update user.plan_id + plan_expires_at
   
10. Generate invoice PDF
    
11. Send invoice email
    
12. Show success message
    
13. Redirect to dashboard
```

Implementation:
```javascript
// Checkout endpoint
app.post('/api/billing/checkout', async (req, res) => {
  const { planId } = req.body;
  const plan = plans[planId];
  
  const order = await razorpay.orders.create({
    amount: plan.price * 100, // In paise
    currency: 'INR',
    receipt: `plan_${Date.now()}`
  });
  
  res.json({
    orderId: order.id,
    amount: order.amount,
    key: process.env.RAZORPAY_KEY
  });
});

// Verify endpoint
app.post('/api/billing/verify', async (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  
  // Verify HMAC
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  
  if(signature !== expectedSignature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  // Update user plan
  await User.updateOne(
    { id: req.user.id },
    {
      plan_id: req.body.planId,
      plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  );
  
  // Generate invoice
  const invoice = await generateInvoice(req.user.id, orderId);
  
  // Send email
  await sendInvoiceEmail(req.user.email, invoice);
  
  res.json({ success: true, planId: req.body.planId });
});
```

Testing Requirements:
-  Payment flow works in sandbox
-  Signature verification works
-  User plan updated correctly
-  Invoice generated and emailed
-  Error handling for failed payments

Acceptance Criteria (ALL must pass):
 Click "Upgrade" button on plan card
 Razorpay payment modal opens
 Can enter card details securely
 Payment processed successfully
 Plan updated immediately after payment
 Invoice generated and emailed
 Failed payment shows error message
 Receipt stored in system
```

#### 6.3 - Usage Tracking (5 SP)  HIGH
```
Assignee: Developer
Day: 6
Status:  Not Started
Dependencies: 3.1 (Send Campaign) 

Tasks:
[1h] Backend: Track messages per user
[1h] Backend: GET /api/billing/usage endpoint
[1h] Frontend: Usage display component
[1h] Frontend: Upgrade prompts at 80%/95%
[0.5h] Testing: Usage tracking tests

Usage Display:
```

 Messages This Month          
                              
 4,250 / 5,000 used           
 [] 85%    
                              
 750 messages remaining       
 [UPGRADE PLAN]               

```

Acceptance Criteria (ALL must pass):
 Dashboard shows messages used this month
 Shows messages remaining
 Progress bar showing usage
 Upgrade prompt at 80% usage
 Warning at 95% usage
 Block new campaigns at 100%
```

#### 7.1 - Admin Dashboard (8 SP)  MEDIUM
```
Assignee: Developer
Day: 6
Status:  Not Started
Dependencies: None

Tasks:
[2h] Frontend: Admin dashboard page
[1.5h] Backend: GET /api/admin/stats endpoint
[1.5h] Frontend: Analytics visualizations
[1h] Backend: Activity logging
[0.5h] Backend: Admin role validation
[0.5h] Testing: Admin dashboard tests
[0.5h] Documentation: Admin guide

Admin Metrics:
- Total users count
- Total messages sent
- Daily active users
- Top campaigns
- System health status
- Recent activity log

Acceptance Criteria (ALL must pass):
 Total users count
 Total messages sent
 Daily active users
 Top campaigns
 System health status
 Recent activity log
 Export stats to CSV
```

#### 7.2 - User Management (5 SP)  MEDIUM
```
Assignee: Developer
Day: 7
Status:  Not Started
Dependencies: 7.1 (Admin Dashboard) 

Tasks:
[1.5h] Frontend: Users list page
[1.5h] Backend: GET /api/admin/users
[1h] Backend: Plan upgrade/downgrade
[0.5h] Backend: Suspend/unsuspend user
[0.5h] Testing: User management tests

Acceptance Criteria (ALL must pass):
 View all users list
 Search users by email
 View user details and usage
 Upgrade/downgrade user plan
 Suspend/unsuspend user
 View user activity
```

---

## SPRINT 1 SUMMARY TABLE

| Day | Epic | Story | SP | Hours | Status |
|-----|------|-------|----|----|----------|
| 1 | Auth | User Registration | 8 | 8 | Backlog |
| 1 | Auth | User Login | 5 | 5 | Backlog |
| 2 | Auth | WhatsApp QR Auth | 8 | 8 | Backlog |
| 3 | Campaign | Create Campaign | 8 | 8 | Backlog |
| 3-4 | Campaign | Upload Contacts | 13 | 13 | Backlog |
| 4 | Campaign | View & Manage | 7 | 7 | Backlog |
| 4 | Campaign | Templates | 6 | 6 | Backlog |
| 4-5 | Delivery | Send Campaign | 13 | 13 | Backlog |
| 5 | Delivery | Message Delays | 8 | 8 | Backlog |
| 5 | Delivery | Baileys Integration | 7 | 7 | Backlog |
| 5 | Delivery | Web JS Fallback | 6 | 6 | Backlog |
| 5-6 | Scheduling | Schedule Campaign | 8 | 8 | Backlog |
| 5 | Analytics | Analytics Dashboard | 8 | 8 | Backlog |
| 6 | Analytics | Message Analytics | 8 | 8 | Backlog |
| 5-6 | Analytics | Ban Risk Tracking | 5 | 5 | Backlog |
| 5 | Billing | Plans Display | 5 | 5 | Backlog |
| 6-7 | Billing | Razorpay Integration | 11 | 11 | Backlog |
| 6 | Billing | Usage Tracking | 5 | 5 | Backlog |
| 6-7 | Admin | Admin Dashboard | 8 | 8 | Backlog |
| 7 | Admin | User Management | 5 | 5 | Backlog |
| | | **SPRINT 1 TOTAL** | **157** | **157** |  |

---

## SPRINT 2 BACKLOG (Days 8-15) - FRONTEND, TESTING & DEPLOYMENT

###  DAY 8: FRONTEND AUTH & DASHBOARD (21 SP)

#### 8.1 - Authentication Pages (8 SP)  CRITICAL
```
Frontend pages for:
- Signup (already designed, now polish + integrate)
- Login (already designed, now polish + integrate)
- Password reset (already designed)
- QR code display (already designed)

Tasks:
[2h] Polish signup page design
[2h] Polish login page design
[1h] Password reset flow UI
[1h] Error state styling
[1h] Loading animations

Acceptance Criteria (ALL must pass):
 Signup page with email, password, name fields
 Login page with email, password fields
 Password reset flow
 Form validation with error messages
 Links between pages
 Responsive design (mobile/tablet/desktop)
 Loading states
 Success notifications
```

#### 8.2 - Dashboard Page (13 SP)  CRITICAL
```
Main dashboard showing:
- Key metrics (sent today, delivery rate, plan)
- Recent campaigns (5 most recent)
- Quick action buttons
- Account status

Tasks:
[2h] Design dashboard layout
[2h] Create metric cards components
[2h] Create recent campaigns widget
[2h] Add quick action buttons
[1h] Theme toggle (dark/light mode)
[1.5h] Responsive design
[1h] Real-time data integration
[0.5h] Testing

Dashboard Layout:
```

 Welcome, Shrikant! | Settings | Logout        

                                                
   
  Sent Today     Delivery Rate  Your    
  2,450          94.5%          Plan    
  messages                      Pro     
   
                                                
 Recent Campaigns                               
 
  Summer Sale     Completed  500 msgs     
  Birthday Offer  Sending    250 msgs     
  Product Launch  Draft      -            
 
                                                
 [NEW CAMPAIGN] [UPLOAD CONTACTS] [ANALYTICS] 

```

Acceptance Criteria (ALL must pass):
 Key metrics cards display correctly
 Recent campaigns list shows 5 campaigns
 Quick action buttons visible
 Account status displayed
 Responsive design (mobile to desktop)
 Dark/light theme toggle
 Real-time data updates
```

---

###  DAY 9-10: CAMPAIGN BUILDER PAGE (21 SP)

#### 8.3 - Campaign Builder Page (21 SP)  CRITICAL
```
Main feature: Complete campaign builder with:
- Campaign form (name, message)
- Template selector
- Contact import
- Delay options
- Schedule options
- Message preview
- Send/Draft buttons

Tasks:
[2h] Design builder layout (two-column)
[2h] Campaign name + message form
[2h] Template dropdown integration
[2h] Contact import/selection UI
[2h] Delay options selector
[1.5h] Date/time picker for scheduling
[2h] Message preview (real-time)
[1h] Form validation with Zod
[1h] Save draft button
[1h] Send button + confirmation
[1.5h] Responsive design
[0.5h] Testing

Builder Layout:
```

 LEFT PANEL           RIGHT PANEL              
 Campaign Builder     MESSAGE PREVIEW          
                                               
 Campaign Name:        
 [_________________]  Summer Sale Offer!   
                                            
 Message:              Get 50% off all      
 [_________________  products this week!  
  _________________                       
  _________________  123/1000 chars       
  _________________]  
                                             
 Template: [Select]  Emoji Picker: [ ]   
                                             
 Select Contacts:                            
 [Upload CSV] [OK]                          
 150 contacts                               
                                             
 Delay Type:                                
  Fast (35% risk)                           
  Balanced (8% risk)                        
  Safe (1-2% risk)                          
                                             
 Schedule:                                  
  Send Now                                 
  Schedule for:                            
   [Date] [Time]                            
                                             
 [SAVE DRAFT] [SEND]                         

```

Acceptance Criteria (ALL must pass):
 Campaign name field
 Message body textarea with character count
 Template selector
 Contact selection/import
 Delay options selector (Fast/Balanced/Safe)
 Schedule options (Send Now or Schedule)
 Message preview (real-time)
 Save as draft button
 Send button
 Form validation before send
 Responsive layout (mobile to desktop)
 All integrations working
```

---

###  DAY 11-12: ANALYTICS & LOCALIZATION (26 SP)

#### 8.4 - Analytics Page (13 SP)  HIGH
```
Complete analytics dashboard with:
- Time-series chart (messages/hour)
- Delivery status breakdown
- Campaign list with stats
- Date range filtering
- CSV export

Acceptance Criteria (ALL must pass):
 Time-series chart showing messages/hour
 Pie chart for delivery status breakdown
 Campaign list with stats
 Filter by date range
 Export to CSV button
 Real-time updates
 Mobile responsive
```

#### 9.1 - i18n Implementation (8 SP)  HIGH
```
Multi-language support: English, Hindi, Marathi

Tasks:
[2h] Setup i18next
[2h] Create translation files (en, hi, mr)
[2h] Extract all UI strings
[1h] Language toggle component
[1h] Test all translations

Languages:
- English (en)
- Hindi (hi)
- Marathi (mr)

All strings translated: Auth, Dashboard, Campaign Builder, Analytics, etc.

Acceptance Criteria (ALL must pass):
 Language toggle in header
 Support English, Hindi, Marathi
 All UI text translated
 Preference saved in localStorage
 Date formats localized
```

#### 9.2 - Localized Content (5 SP)  MEDIUM
```
India-specific localization:
- Currency: ₹ (INR)
- Country code: +91 (default)
- Timezone: IST (default)
- Localized help articles

Acceptance Criteria (ALL must pass):
 Currency shown as ₹ (INR)
 Country code default +91
 Timezone default IST
 Localized help articles
```

---

###  DAY 13-14: TESTING, SECURITY & DEPLOYMENT (34 SP)

#### 10.1 - Unit & Integration Tests (13 SP)  HIGH
```
Comprehensive test coverage >80%

Tests Required:
- Auth tests (signup, login, QR)
- Campaign tests (create, send, schedule)
- Message delivery (Baileys, Web JS)
- Analytics calculations
- Billing/payment flow
- API endpoints (Supertest)
- React components (React Testing Library)

Tasks:
[2h] Auth tests (Jest)
[2h] Campaign tests
[2h] Message delivery tests
[2h] Analytics tests
[1.5h] Billing tests
[1.5h] API endpoint tests
[1h] Component tests
[1h] Setup code coverage

Test Command:
```bash
npm test              # Run all tests
npm test -- --coverage  # Generate coverage report
npm test:watch      # Watch mode during development
```

Acceptance Criteria (ALL must pass):
 Auth tests passing
 Campaign tests passing
 Delivery tests passing
 Analytics tests passing
 Billing tests passing
 API tests passing
 Component tests passing
 >80% code coverage
```

#### 10.2 - Load Testing (8 SP)  HIGH
```
Performance testing: 100 concurrent users

Tools: Apache JMeter or Artillery

Scenarios:
1. API endpoint load test
2. Message queue under load
3. Database query performance
4. Real-time updates (WebSocket) under load

Load Test Configuration:
- 100 concurrent users
- 10-minute duration
- Ramping up 10 users per second

Success Criteria:
- API response time <200ms (95th percentile)
- Message queue handles 1000+ jobs
- Database handles spike
- No memory leaks
- WebSocket stable

Load Test Report Include:
- Avg response time
- 95th percentile response time
- Throughput (requests/sec)
- Error rate (should be 0%)
- Performance graphs

Acceptance Criteria (ALL must pass):
 API response time <200ms
 100 concurrent users handled
 Message queue stable under load
 Database optimized
 No memory leaks
 Performance report generated
```

#### 10.3 - Security Audit (8 SP)  CRITICAL
```
Security verification across all components

Checklist:
[x] HTTPS/TLS enabled (Let's Encrypt)
[x] Passwords hashed (bcrypt)
[x] JWT tokens secure (httpOnly cookies)
[x] SQL injection prevented (Prisma ORM)
[x] CORS properly configured
[x] Rate limiting enabled
[x] No secrets in code (env variables)
[x] Security headers set (Helmet.js)
[x] Input validation on all fields
[x] Output encoding (XSS prevention)
[x] CSRF protection
[x] Account enumeration prevented
[x] Brute force protection
[x] Session timeout
[x] Password reset token expiry

Security Headers to Add:
```javascript
// Helmet.js
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"]
  }
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate Limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
```

Acceptance Criteria (ALL must pass):
 HTTPS/TLS enabled
 Passwords hashed with bcrypt
 JWT tokens secure
 SQL injection prevention tested
 CORS properly configured
 Rate limiting enabled
 No secrets in code
 Security headers set
 Input validation on all fields
 Output encoding for XSS
 CSRF protection
 No account enumeration
 Brute force protection working
 Session timeout working
 Security audit report passed
```

#### 10.4 - VPS Deployment (5 SP)  CRITICAL
```
Production deployment to VPS

Pre-Deployment Checklist:
[x] VPS provisioned (Hetzner/Vultr/DigitalOcean)
[x] SSH key configured
[x] PostgreSQL installed
[x] Redis installed
[x] Node.js 18+ installed
[x] Nginx installed
[x] PM2 installed globally
[x] Domain registered
[x] SSL certificate (Let's Encrypt)

Deployment Steps:
1. SSH into VPS
2. Clone git repository
3. Install dependencies
4. Build frontend + backend
5. Run database migrations
6. Configure Nginx
7. Setup SSL
8. Start services with PM2
9. Configure cron backups
10. Test all features

Deployment Commands:
```bash
# SSH into VPS
ssh root@your-vps-ip

# Clone code
cd /app
git clone <repo> .

# Install dependencies
npm install

# Build frontend
cd frontend && npm run build && cd ..

# Build backend
cd backend && npm run build && cd ..

# Database migrations
npx prisma migrate deploy

# Start services
pm2 start ecosystem.config.js

# Save startup script
pm2 save
pm2 startup

# Verify deployment
curl https://broadcaster.in/api/health
```

Post-Deployment Checklist:
[x] HTTPS working
[x] Frontend loading
[x] API endpoints responding
[x] Database connected
[x] Redis connected
[x] Message sending working
[x] Payments processing (test mode)
[x] Analytics working
[x] Monitoring enabled
[x] Backups configured
[x] Error logging working

Acceptance Criteria (ALL must pass):
 VPS provisioned and configured
 PostgreSQL installed and running
 Redis installed and running
 Nginx configured
 SSL certificate installed
 PM2 running services
 Domain pointing to VPS
 Monitoring enabled (PM2+ or custom)
 All services accessible
 No console errors
 Backups automated
```

---

## SPRINT 2 SUMMARY TABLE

| Day | Epic | Story | SP | Hours | Status |
|-----|------|-------|----|----|----------|
| 8 | Frontend | Auth Pages | 8 | 8 | Backlog |
| 8 | Frontend | Dashboard | 13 | 13 | Backlog |
| 9-10 | Frontend | Campaign Builder | 21 | 21 | Backlog |
| 11 | Frontend | Analytics Page | 13 | 13 | Backlog |
| 11 | Localization | i18n | 8 | 8 | Backlog |
| 12 | Localization | Localized Content | 5 | 5 | Backlog |
| 13 | Testing | Unit & Integration Tests | 13 | 13 | Backlog |
| 13 | Testing | Load Testing | 8 | 8 | Backlog |
| 13 | Testing | Security Audit | 8 | 8 | Backlog |
| 14 | Deployment | VPS Deployment | 5 | 5 | Backlog |
| | | **SPRINT 2 TOTAL** | **102** | **102** |  |

---

## OVERALL PROJECT SUMMARY

**Total Scope:** 259 Story Points
**Total Effort:** 259 Hours
**Timeline:** 15 Days
**Team:** 1 Developer

**Sprint 1 (Days 1-7):** 157 SP - Backend & Core Features 
**Sprint 2 (Days 8-14):** 102 SP - Frontend, Testing & Deployment 
**Day 15:** Final Testing & Go-Live

**Critical Path Dependencies:**
1. Authentication  All features
2. Campaign Creation  Sending
3. Message Delivery  Analytics
4. Frontend  Deployment

**Risk Mitigations:**
- Baileys integration has Web JS fallback (99.5% combined)
- Razorpay has sandbox testing before production
- Load testing verifies scalability
- Security audit before go-live
- Automated backups configured

**Launch Readiness (Day 15):**
 All 259 SP completed
 All tests passing (>80% coverage)
 Load tested (100 concurrent users)
 Security audit passed
 Deployed to production VPS
 Monitoring active
 Customer support ready
 Documentation complete

