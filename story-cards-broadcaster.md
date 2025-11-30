# BROADCASTER: DETAILED STORY CARDS (QUICK REFERENCE)

## EPIC 1: AUTHENTICATION & USER MANAGEMENT

### Card 1.1: User Registration
```
STORY ID: 1.1
EPIC: Authentication & User Management
TITLE: User Registration
TYPE: Feature
PRIORITY: Critical 
STORY POINTS: 8
ESTIMATED HOURS: 8
SPRINT: 1 (Day 1)
TEAM: Developer
STATUS: Backlog 

USER STORY:
As a new user
I want to sign up with email/password
So that I can create an account and start using Broadcaster

ACCEPTANCE CRITERIA:
 User can enter email, password, full name
 Email validation (unique, valid format)
 Password requirements enforced (min 8 chars, special char)
 Terms of Service checkbox required
 Welcome email sent after signup
 User automatically enrolled in 7-day trial
 Redirect to WhatsApp QR code page after signup
 Error messages clear and helpful

IMPLEMENTATION TASKS:
[] Create signup form component (React) [2h]
[] Implement POST /api/auth/signup endpoint [2h]
[] Add email validation middleware [1h]
[] Create user record in database [1h]
[] Generate trial expiry date [0.5h]
[] Integrate email service (Sendmail) [1h]
[] Add form error handling [0.5h]
[] Write tests for signup flow [0.5h]

DEPENDENCIES:
- Database schema ready 
- Email service available 
- No dependencies from other stories

TECHNICAL NOTES:
- Use Express-validator for email/password validation
- Hash password with bcrypt before storing
- Send welcome email with verification link
- Trial expires_at = now + 7 days

TESTING:
- Unit: Email validation, password hashing
- Integration: Full signup flow
- E2E: Signup via UI
- Coverage: >85%

DEFINITION OF DONE:
- Code merged to main
- All tests passing
- Password hashed securely
- Email sent successfully
- User can login after signup
- No console errors
```

### Card 1.2: User Login
```
STORY ID: 1.2
EPIC: Authentication & User Management
TITLE: User Login
TYPE: Feature
PRIORITY: Critical 
STORY POINTS: 5
ESTIMATED HOURS: 5
SPRINT: 1 (Day 1)
TEAM: Developer
STATUS: Backlog 

USER STORY:
As a registered user
I want to login with email/password
So that I can access my account and campaigns

ACCEPTANCE CRITERIA:
 User can enter email and password
 Password verification works correctly
 JWT token generated on successful login
 Token stored in httpOnly cookie
 "Remember me" option available
 Password reset link functional
 Error message for invalid credentials
 Session persists across page refreshes

IMPLEMENTATION TASKS:
[] Create login form component [1h]
[] Implement POST /api/auth/login endpoint [1.5h]
[] Add JWT token generation [1h]
[] Setup cookie storage [0.5h]
[] Implement "Remember me" functionality [1h]
[] Create password reset flow [0.5h]
[] Add rate limiting to prevent brute force [0.5h]
[] Write login tests [0.5h]

DEPENDENCIES:
- User Registration (1.1) must be complete

TECHNICAL NOTES:
- Use bcrypt.compare() for password verification
- JWT secret in environment variable
- httpOnly cookie (no JS access)
- Rate limit: 5 attempts per 15 minutes
- Password reset via email link

TESTING:
- Unit: Password verification, JWT validation
- Integration: Login flow
- E2E: Login via UI
- Coverage: >85%
```

### Card 1.3: WhatsApp QR Code Authentication
```
STORY ID: 1.3
EPIC: Authentication & User Management
TITLE: WhatsApp QR Code Authentication
TYPE: Feature
PRIORITY: Critical 
STORY POINTS: 8
ESTIMATED HOURS: 8
SPRINT: 1 (Day 2)
TEAM: Developer
STATUS: Backlog 

USER STORY:
As a user
I want to scan a QR code with my phone
So that I can authenticate my WhatsApp account without entering credentials

ACCEPTANCE CRITERIA:
 QR code displays on first login
 QR code unique per user session
 User can scan with WhatsApp on phone
 Session validates after scan
 Phone number stored in database
 Session expires after 30 days
 User notified when authenticated
 Can initiate new QR scan anytime

IMPLEMENTATION TASKS:
[] Implement Baileys QR code generation [2h]
[] Create QR display page (React) [1.5h]
[] Setup session validation polling [1.5h]
[] Store session credentials in Redis [1h]
[] Setup 30-day session expiry [0.5h]
[] Add session refresh logic [0.5h]
[] Create "Re-authenticate" button [0.5h]
[] Add error handling for failed scans [0.5h]

DEPENDENCIES:
- User Login (1.2) must be complete
- Redis installed and running

TECHNICAL NOTES:
- Baileys: makeWASocket({ printQRInTerminal: false })
- Poll every 1 second for QR validation
- Store in Redis: key="session:{userId}", TTL=30 days
- Phone number extracted from Baileys response

TESTING:
- Unit: QR code generation
- Integration: QR validation, session storage
- E2E: Full auth flow
- Coverage: >85%
```

---

## EPIC 2: CAMPAIGN MANAGEMENT

### Card 2.1: Create Campaign
```
STORY ID: 2.1
EPIC: Campaign Management
TITLE: Create Campaign
TYPE: Feature
PRIORITY: Critical 
STORY POINTS: 8
ESTIMATED HOURS: 8
SPRINT: 1 (Day 3)
TEAM: Developer
STATUS: Backlog 

USER STORY:
As a user
I want to create a new campaign
So that I can send messages to my contacts

ACCEPTANCE CRITERIA:
 Campaign form with name and message fields
 Message preview displays in real-time
 Character count shown (max 1000 chars)
 Emoji support
 Save as draft option
 Campaign stored in database
 User sees success notification
 Validation prevents empty fields

IMPLEMENTATION TASKS:
[] Create campaign builder form (React) [2h]
[] Implement POST /api/campaigns endpoint [2h]
[] Add form validation (Zod) [1h]
[] Create campaign record in DB [0.5h]
[] Add character counter [0.5h]
[] Implement emoji picker [1h]
[] Add error handling [0.5h]
[] Write campaign creation tests [0.5h]

DEPENDENCIES:
- WhatsApp QR Code Auth (1.3) must be complete

TECHNICAL NOTES:
- Use emoji-picker library
- Max message length: 1000 chars
- Store in "draft" status initially
- Validate message not empty
- Use Zod for form validation

TESTING:
- Unit: Character counting, validation
- Integration: Campaign creation
- E2E: Full campaign creation via UI
- Coverage: >85%
```

### Card 2.2: Upload Contacts
```
STORY ID: 2.2
EPIC: Campaign Management
TITLE: Upload Contacts
TYPE: Feature
PRIORITY: Critical 
STORY POINTS: 13
ESTIMATED HOURS: 13
SPRINT: 1 (Days 3-4)
TEAM: Developer
STATUS: Backlog 

USER STORY:
As a user
I want to upload a CSV file with phone numbers
So that I can send messages to multiple contacts at once

ACCEPTANCE CRITERIA:
 CSV upload form with drag-and-drop
 Supported format: phone numbers (one per line)
 Auto-format phone numbers (add country code)
 Detect and show duplicates
 Show preview of first 10 rows
 Import button imports all contacts
 Success message shows count imported
 Error handling for invalid formats
 Duplicate prevention (skip duplicates)
 Progress bar during import

IMPLEMENTATION TASKS:
[] Create CSV upload component (React) [2h]
[] Implement file parsing (Papa Parse) [1.5h]
[] Add drag-and-drop functionality [1.5h]
[] Create POST /api/contacts/import endpoint [2h]
[] Add phone number validation/formatting [2h]
[] Implement duplicate detection [1.5h]
[] Add progress tracking [1h]
[] Create contacts table in DB [1h]
[] Add error handling and logging [1h]
[] Write CSV import tests [1h]

DEPENDENCIES:
- Create Campaign (2.1) must be complete
- contacts table must exist in DB

TECHNICAL NOTES:
- Use Papa Parse for CSV parsing
- Phone format: +91XXXXXXXXXX (India)
- Validate format: 10 digits after +91
- Check for duplicates per campaign
- Store in: contacts table (campaign_id, phone)

TESTING:
- Unit: Phone formatting, validation
- Integration: CSV import, duplicate detection
- E2E: Upload CSV via UI
- Edge cases: Empty file, invalid format, duplicates
- Coverage: >85%
```

### Card 2.3: View & Manage Campaigns
```
STORY ID: 2.3
EPIC: Campaign Management
TITLE: View & Manage Campaigns
TYPE: Feature
PRIORITY: High 
STORY POINTS: 7
ESTIMATED HOURS: 7
SPRINT: 1 (Day 4)
TEAM: Developer
STATUS: Backlog 

USER STORY:
As a user
I want to see all my campaigns in a list
So that I can manage and track them

ACCEPTANCE CRITERIA:
 Campaign list displays all user campaigns
 Shows campaign name, status, date created
 Shows recipient count and message count
 Can sort by date or status
 Can filter by status (draft, scheduled, sending, completed)
 Can delete campaign (with confirmation)
 Can edit draft campaigns
 Pagination for many campaigns (20 per page)

IMPLEMENTATION TASKS:
[] Create campaign list view (React) [2h]
[] Implement GET /api/campaigns endpoint [1.5h]
[] Add sorting and filtering logic [1.5h]
[] Add delete campaign functionality [1h]
[] Add edit draft campaign flow [1h]
[] Add pagination [1h]
[] Create list animations [0.5h]
[] Write list view tests [0.5h]

DEPENDENCIES:
- Create Campaign (2.1) must be complete

TECHNICAL NOTES:
- Show: name, status, created_at, recipient_count
- Sort by: created_at, status
- Filter options: all, draft, scheduled, sending, completed
- Pagination: 20 items per page
- Delete requires confirmation modal

TESTING:
- Unit: Filtering, sorting logic
- Integration: List API
- E2E: Full list view interaction
- Coverage: >85%
```

### Card 2.4: Campaign Templates
```
STORY ID: 2.4
EPIC: Campaign Management
TITLE: Campaign Templates
TYPE: Feature
PRIORITY: High 
STORY POINTS: 6
ESTIMATED HOURS: 6
SPRINT: 1 (Day 4)
TEAM: Developer
STATUS: Backlog 

USER STORY:
As a user
I want to use pre-built message templates
So that I can quickly create campaigns without writing messages

ACCEPTANCE CRITERIA:
 10+ pre-built templates available
 Templates include: order confirmation, reminder, promo, feedback, etc.
 Can select template and preview it
 Can customize template text before sending
 Can save custom templates
 Can view all saved templates
 Can delete saved templates

TEMPLATES LIST:
1. Order Confirmation: "Your order {order_id} confirmed. Delivery in 2-3 days."
2. Payment Reminder: "Hi {name}, your payment of ₹{amount} is due. Please pay soon."
3. Promotional: " Special offer! Get 50% off on all products. Valid till {date}."
4. Feedback: "Hi {name}, please rate our service. Your feedback matters!"
5. Appointment: "Your appointment confirmed on {date} at {time}."
6. Birthday: " Happy Birthday {name}! Enjoy your special day."
7. Verification: "Your verification code is {code}. Do not share with anyone."
8. Welcome: "Welcome {name}! Thanks for joining us. Start exploring now."
9. Follow-up: "Hi {name}, just checking if you need any help?"
10. Event Reminder: "{event} starting in {time}. Don't miss it!"

IMPLEMENTATION TASKS:
[] Create templates table in DB [1h]
[] Seed 10+ default templates [0.5h]
[] Create template selector UI [1.5h]
[] Implement POST /api/templates endpoint [1h]
[] Add template customization form [1h]
[] Add save/delete template functionality [1h]
[] Create template list view [0.5h]
[] Write template tests [0.5h]

DEPENDENCIES:
- Create Campaign (2.1) must be complete

TECHNICAL NOTES:
- Store: templates table (id, name, body, is_default, user_id)
- Variables in templates: {var_name}
- Allow user-created templates
- Seed 10 default templates

TESTING:
- Unit: Template validation
- Integration: Template CRUD
- E2E: Template selection in campaign
- Coverage: >85%
```

---

## EPIC 3: MESSAGE DELIVERY

### Card 3.1: Send Campaign
```
STORY ID: 3.1
EPIC: Message Delivery
TITLE: Send Campaign
TYPE: Feature
PRIORITY: Critical 
STORY POINTS: 13
ESTIMATED HOURS: 13
SPRINT: 1 (Days 4-5)
TEAM: Developer
STATUS: Backlog 

USER STORY:
As a user
I want to send a campaign to all contacts
So that my message reaches my audience

ACCEPTANCE CRITERIA:
 Send button visible on campaign detail page
 Clicking send adds all messages to queue
 Campaign status changes to "sending"
 Real-time progress bar shows sent count
 Delivery confirmation received for each message
 Campaign auto-completes when all messages sent
 Can view delivery status per message
 Failed messages tracked separately

IMPLEMENTATION TASKS:
[] Create send campaign endpoint (POST /api/campaigns/:id/send) [2h]
[] Implement Bull queue integration [2h]
[] Add messages to queue with campaign details [1.5h]
[] Create message sender worker (Baileys) [3h]
[] Implement delivery tracking [2h]
[] Add real-time progress updates (WebSocket) [2h]
[] Create campaign detail view with stats [0.5h]
[] Write send campaign tests [0.5h]

DEPENDENCIES:
- Upload Contacts (2.2) must be complete
- Baileys Integration (3.3) must be started

TECHNICAL NOTES:
- Create messages table records for all contacts
- Add to Bull queue: { campaignId, contactId, message }
- Update campaign status: draft  sending
- Real-time updates via WebSocket
- Track: sent_at, delivered_at, failed_reason

TESTING:
- Unit: Queue integration, message creation
- Integration: Full send flow
- E2E: Send campaign via UI
- Load test: 1000+ messages
- Coverage: >85%
```

### Card 3.2: Message Delay Options
```
STORY ID: 3.2
EPIC: Message Delivery
TITLE: Message Delay Options
TYPE: Feature
PRIORITY: Critical 
STORY POINTS: 8
ESTIMATED HOURS: 8
SPRINT: 1 (Day 5)
TEAM: Developer
STATUS: Backlog 

USER STORY:
As a user
I want to configure delay between messages
So that I don't get my account banned for spam

ACCEPTANCE CRITERIA:
 3 preset options: Fast (2-5s), Balanced (5-10s), Safe (10-30s)
 Show ban risk % for each option
 Show estimated time to send 1000 messages
 User can select delay before sending
 Default to "Balanced"
 Batch pausing every 100 messages (30s pause)
 Real-time delay application during send

DELAY CONFIGURATION:
- Fast:    2-5 sec   1000 msgs in ~1.5 hours  (Ban risk: 35%)
- Balanced: 5-10 sec  1000 msgs in ~2-3 hours (Ban risk: 8%)
- Safe:    10-30 sec  1000 msgs in ~5-8 hours (Ban risk: 1-2%)

IMPLEMENTATION TASKS:
[] Create delay options UI [1h]
[] Implement applyDelay function in worker [1.5h]
[] Add batch pause logic [1.5h]
[] Calculate estimated send time [1h]
[] Display ban risk percentages [0.5h]
[] Add delay type to campaign [1h]
[] Implement random delay within range [0.5h]
[] Write delay logic tests [1h]

DEPENDENCIES:
- Send Campaign (3.1) must be in progress

TECHNICAL NOTES:
- Delay = random(min, max) milliseconds
- Every 100 messages: pause 30 seconds
- Store: campaign.delay_type in DB
- Ban risk formula: based on delay_type

TESTING:
- Unit: Delay calculation, ban risk formula
- Integration: Delay application in queue
- E2E: Delay selection before send
- Load test: Verify delays applied correctly
```

### Card 3.3: Baileys Integration
```
STORY ID: 3.3
EPIC: Message Delivery
TITLE: Baileys Integration
TYPE: Feature
PRIORITY: Critical 
STORY POINTS: 7
ESTIMATED HOURS: 7
SPRINT: 1 (Day 5)
TEAM: Developer
STATUS: Backlog 

USER STORY:
As the system
I want to send messages via Baileys
So that I can deliver messages reliably

ACCEPTANCE CRITERIA:
 Messages sent successfully via Baileys
 95%+ delivery success rate
 Session credentials stored securely
 Failed messages logged
 Retry logic for failed messages
 Error messages informative

IMPLEMENTATION TASKS:
[] Install and configure Baileys library [1h]
[] Implement sendViaBaileys function [2h]
[] Add credential storage (encrypted) [1h]
[] Implement message sending logic [1.5h]
[] Add success/failure tracking [1h]
[] Implement retry mechanism [0.5h]
[] Add logging for debugging [0.5h]
[] Write Baileys integration tests [0.5h]

DEPENDENCIES:
- WhatsApp QR Code Auth (1.3) must be complete

TECHNICAL NOTES:
- npm install @whiskeysockets/baileys
- Session stored: /sessions/{userId}
- Message format: { to: "91XXXXXXXXXX", text: "message" }
- Retry: 3 attempts with exponential backoff
- Error tracking: why messages failed

TESTING:
- Unit: Message formatting
- Integration: Baileys sending
- E2E: Full message delivery
- Success rate: >95%
```

### Card 3.4: Web JS Fallback
```
STORY ID: 3.4
EPIC: Message Delivery
TITLE: Web JS Fallback
TYPE: Feature
PRIORITY: High 
STORY POINTS: 6
ESTIMATED HOURS: 6
SPRINT: 1 (Day 5)
TEAM: Developer
STATUS: Backlog 

USER STORY:
As the system
I want to fallback to Web JS if Baileys fails
So that messages still deliver when primary method fails

ACCEPTANCE CRITERIA:
 Detects Baileys failure
 Automatically tries Web JS
 99%+ combined delivery success
 Fallback transparent to user
 Fallback tracked in analytics

IMPLEMENTATION TASKS:
[] Install Puppeteer [0.5h]
[] Implement sendViaWebJS function [2h]
[] Add auto-failover logic [1h]
[] Track delivery method used [1h]
[] Add fallback logging [0.5h]
[] Implement cron retry (5 min intervals) [1h]
[] Write fallback tests [0.5h]

DEPENDENCIES:
- Baileys Integration (3.3) must be complete

TECHNICAL NOTES:
- npm install puppeteer
- Fallback triggered if Baileys returns error
- Web JS uses Puppeteer + WhatsApp Web
- Combined success rate: ~99.5%
- Log all fallback instances

TESTING:
- Unit: Fallback triggering
- Integration: Web JS sending
- Combined success rate: >99%
```

---

## EPIC 4: CAMPAIGN SCHEDULING

### Card 4.1: Schedule Campaign
```
STORY ID: 4.1
EPIC: Campaign Scheduling
TITLE: Schedule Campaign
TYPE: Feature
PRIORITY: High 
STORY POINTS: 8
ESTIMATED HOURS: 8
SPRINT: 1 (Day 5)
TEAM: Developer
STATUS: Backlog 

USER STORY:
As a user
I want to schedule a campaign for a specific date/time
So that I can send messages at optimal times

ACCEPTANCE CRITERIA:
 Date/time picker in campaign form
 Timezone selector (default IST)
 Can set recurring campaigns (daily/weekly/monthly)
 Campaign stored with scheduled status
 Scheduler checks every minute
 Campaign auto-sends at scheduled time
 User notified when campaign sent
 Can cancel scheduled campaign

IMPLEMENTATION TASKS:
[] Add date/time picker to campaign form [1.5h]
[] Add timezone selector [1h]
[] Add recurrence options [1h]
[] Create scheduler worker [2h]
[] Implement cron job every minute [1h]
[] Add scheduled campaign detection [0.5h]
[] Implement auto-send logic [1h]
[] Write scheduler tests [0.5h]

DEPENDENCIES:
- Send Campaign (3.1) must be complete

TECHNICAL NOTES:
- Use date-fns for date handling
- Timezones: IST (default), UTC, others
- Recurrence: daily, weekly, monthly, once
- Cron job every 60 seconds checks for scheduled campaigns
- Send if scheduled_at <= now

TESTING:
- Unit: Date/time validation
- Integration: Scheduler logic
- E2E: Schedule campaign via UI
- Coverage: >85%
```

---

## EPIC 5: ANALYTICS & REPORTING

### Card 5.1: Delivery Analytics Dashboard
```
STORY ID: 5.1
EPIC: Analytics & Reporting
TITLE: Delivery Analytics Dashboard
TYPE: Feature
PRIORITY: High 
STORY POINTS: 8
ESTIMATED HOURS: 8
SPRINT: 1 (Day 5)
TEAM: Developer
STATUS: Backlog 

USER STORY:
As a user
I want to see delivery statistics for my campaigns
So that I can understand campaign performance

ACCEPTANCE CRITERIA:
 Dashboard shows key metrics:
  - Total messages sent today
  - Delivery rate (%)
  - Failed messages count
  - Average delivery time
 Time-series chart showing sends/hour
 Campaign comparison table
 Export data to CSV
 Refresh every 5 seconds (real-time)

IMPLEMENTATION TASKS:
[] Create analytics dashboard page (React) [2h]
[] Implement GET /api/analytics/overview endpoint [1.5h]
[] Add real-time WebSocket updates [1.5h]
[] Create time-series chart (Recharts) [1.5h]
[] Implement data export to CSV [1h]
[] Add filtering by date range [1h]
[] Write analytics tests [0.5h]

DEPENDENCIES:
- Send Campaign (3.1) must be complete

TECHNICAL NOTES:
- Metrics: sent_today, delivery_rate, failed_count, avg_time
- Chart: X-axis (hour), Y-axis (message count)
- Real-time updates via WebSocket every 5s
- Export: CSV format with all campaigns

TESTING:
- Unit: Metric calculations
- Integration: Analytics API
- E2E: Dashboard refresh and export
- Coverage: >85%
```

---

## EPIC 6: BILLING & PLANS

### Card 6.2: Razorpay Integration
```
STORY ID: 6.2
EPIC: Billing & Plans
TITLE: Razorpay Integration
TYPE: Feature
PRIORITY: Critical 
STORY POINTS: 11
ESTIMATED HOURS: 11
SPRINT: 1 (Days 6-7)
TEAM: Developer
STATUS: Backlog 

USER STORY:
As a user
I want to upgrade to a paid plan
So that I can send more messages

ACCEPTANCE CRITERIA:
 Click "Upgrade" button on plan card
 Razorpay payment modal opens
 Can enter card details securely
 Payment processed successfully
 Plan updated immediately after payment
 Invoice generated and emailed
 Failed payment shows error message
 Receipt stored in system

PRICING PLANS:
- Starter: ₹299/month  5,000 msgs
- Pro: ₹599/month  25,000 msgs
- Business: ₹999/month  100,000 msgs

IMPLEMENTATION TASKS:
[] Create upgrade flow [1h]
[] Implement POST /api/billing/checkout endpoint [2h]
[] Integrate Razorpay payment modal [2h]
[] Implement POST /api/billing/verify endpoint [2h]
[] Update user plan on success [1h]
[] Generate invoice [1.5h]
[] Send invoice email [1h]
[] Write payment flow tests [1h]

DEPENDENCIES:
- Billing Plans Display (6.1) must be complete

TECHNICAL NOTES:
- Razorpay API keys in env variables
- Webhook verification: HMAC-SHA256
- Update user.plan_id and plan_expires_at
- Generate invoice with order ID, amount, date
- Send invoice PDF via email

TESTING:
- Unit: Payment verification
- Integration: Razorpay webhook
- E2E: Full payment flow (test mode)
- Coverage: >85%

RAZORPAY WEBHOOK:
```
POST /api/webhooks/razorpay
{
  event: 'payment.authorized' or 'payment.failed',
  payload: { ... }
}
```
- Verify signature
- Update payment status
- Trigger invoice generation
```

---

## EPIC 8: FRONTEND UI/UX

### Card 8.3: Campaign Builder Page
```
STORY ID: 8.3
EPIC: Frontend UI/UX
TITLE: Campaign Builder Page
TYPE: Feature
PRIORITY: Critical 
STORY POINTS: 21
ESTIMATED HOURS: 21
SPRINT: 2 (Days 9-10)
TEAM: Developer
STATUS: Backlog 

USER STORY:
As a user
I want to use an intuitive campaign builder
So that creating campaigns is quick and easy

ACCEPTANCE CRITERIA:
 Campaign name field
 Message body textarea with character count
 Template selector
 Contact selection/import
 Delay options selector
 Schedule options
 Message preview
 Save as draft button
 Send button
 Responsive layout

LAYOUT:
```

 Campaign Builder                        

 LEFT PANEL           RIGHT PANEL       
 - Campaign name      Message Preview   
 - Message body       - Real-time       
 - Template select    - Character count 
 - Contact upload     - Emoji preview   
 - Delay options                        
 - Schedule date                        
 - Send/Draft btns                      

```

IMPLEMENTATION TASKS:
[] Design campaign builder layout [2h]
[] Create form components [2h]
[] Add template dropdown [1h]
[] Create contact import UI [2h]
[] Add delay options selector [1h]
[] Add date/time picker [1.5h]
[] Create message preview [2h]
[] Add form validation [1.5h]
[] Implement save draft logic [1h]
[] Implement send logic [1h]
[] Style with Tailwind [2h]
[] Write builder tests [1h]

DEPENDENCIES:
- All backend APIs must be complete (Epics 1-7)

TECHNICAL NOTES:
- React Hook Form + Zod validation
- Message preview updates in real-time
- Character counter: current / 1000
- Template dropdown auto-fills message
- Delay options: Fast/Balanced/Safe
- Date picker with timezone
- Mobile responsive (Tailwind grid)

TESTING:
- Unit: Form validation
- Integration: Full form submission
- E2E: Create campaign via UI
- Responsive: Mobile, tablet, desktop
- Coverage: >85%
```

---

## SUMMARY TABLE

| ID | Story | SP | Priority | Sprint | Status |
|-------|------|----|-----------|----|----------|
| 1.1 | User Registration | 8 | Critical | 1 | Backlog |
| 1.2 | User Login | 5 | Critical | 1 | Backlog |
| 1.3 | WhatsApp QR Auth | 8 | Critical | 1 | Backlog |
| 2.1 | Create Campaign | 8 | Critical | 1 | Backlog |
| 2.2 | Upload Contacts | 13 | Critical | 1 | Backlog |
| 2.3 | View & Manage | 7 | High | 1 | Backlog |
| 2.4 | Templates | 6 | High | 1 | Backlog |
| 3.1 | Send Campaign | 13 | Critical | 1 | Backlog |
| 3.2 | Message Delays | 8 | Critical | 1 | Backlog |
| 3.3 | Baileys Integration | 7 | Critical | 1 | Backlog |
| 3.4 | Web JS Fallback | 6 | High | 1 | Backlog |
| 4.1 | Schedule Campaign | 8 | High | 1 | Backlog |
| 4.2 | Schedule Management | 5 | Medium | 1 | Backlog |
| 5.1 | Analytics Dashboard | 8 | High | 1 | Backlog |
| 5.2 | Message Analytics | 8 | High | 1 | Backlog |
| 5.3 | Ban Risk Tracking | 5 | Medium | 1 | Backlog |
| 6.1 | Plans Display | 5 | High | 1 | Backlog |
| 6.2 | Razorpay Integration | 11 | Critical | 1 | Backlog |
| 6.3 | Usage Tracking | 5 | High | 1 | Backlog |
| 7.1 | Admin Dashboard | 8 | Medium | 1 | Backlog |
| 7.2 | User Management | 5 | Medium | 1 | Backlog |
| 8.1 | Auth Pages | 8 | Critical | 2 | Backlog |
| 8.2 | Dashboard Page | 13 | Critical | 2 | Backlog |
| 8.3 | Campaign Builder | 21 | Critical | 2 | Backlog |
| 8.4 | Analytics Page | 13 | High | 2 | Backlog |
| 9.1 | i18n Implementation | 8 | High | 2 | Backlog |
| 9.2 | Localized Content | 5 | Medium | 2 | Backlog |
| 10.1 | Unit & Integration Tests | 13 | High | 2 | Backlog |
| 10.2 | Load Testing | 8 | High | 2 | Backlog |
| 10.3 | Security Audit | 8 | Critical | 2 | Backlog |
| 10.4 | VPS Deployment | 5 | Critical | 2 | Backlog |

**SPRINT 1 TOTAL:** 157 SP
**SPRINT 2 TOTAL:** 102 SP
**TOTAL:** 259 SP

**Estimated delivery time: 15 days (with solo developer)**

