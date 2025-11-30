# BROADCASTER: SPRINT PLANNING & USER STORIES

## PROJECT OVERVIEW

**Product:** Broadcaster (WhatsApp Bulk Messaging SaaS)
**Timeline:** 15 Days (2 Sprints)
**Sprint Duration:** 7-8 days each
**Team Size:** 1 Developer
**Target:** MVP Launch with 99.5% reliability

---

## EPIC BREAKDOWN

### EPIC 1: Authentication & User Management (Sprint 1)
**Story Points:** 21
**Duration:** Days 1-2
**Dependency:** None
**Goal:** Users can sign up, login, and authenticate with WhatsApp

#### USER STORY 1.1: User Registration (8 SP)
```
As a new user
I want to sign up with email/password
So that I can create an account and start using Broadcaster

Acceptance Criteria:
- [ ] User can enter email, password, full name
- [ ] Email validation (unique, valid format)
- [ ] Password requirements enforced (min 8 chars, special char)
- [ ] Terms of Service checkbox required
- [ ] Welcome email sent after signup
- [ ] User automatically enrolled in 7-day trial
- [ ] Redirect to WhatsApp QR code page after signup
- [ ] Error messages clear and helpful

Tasks:
- Create signup form component (React)
- Implement POST /api/auth/signup endpoint
- Add email validation middleware
- Create user record in database
- Generate trial expiry date
- Integrate email service (Sendmail)
- Add form error handling
- Write tests for signup flow

Story Points: 8
Priority: Critical
Assigned To: Developer
Estimated Hours: 8
```

#### USER STORY 1.2: User Login (5 SP)
```
As a registered user
I want to login with email/password
So that I can access my account and campaigns

Acceptance Criteria:
- [ ] User can enter email and password
- [ ] Password verification works correctly
- [ ] JWT token generated on successful login
- [ ] Token stored in httpOnly cookie
- [ ] "Remember me" option available
- [ ] Password reset link functional
- [ ] Error message for invalid credentials
- [ ] Session persists across page refreshes

Tasks:
- Create login form component
- Implement POST /api/auth/login endpoint
- Add JWT token generation
- Setup cookie storage
- Implement "Remember me" functionality
- Create password reset flow
- Add rate limiting to prevent brute force
- Write login tests

Story Points: 5
Priority: Critical
Assigned To: Developer
Estimated Hours: 5
```

#### USER STORY 1.3: WhatsApp QR Code Authentication (8 SP)
```
As a user
I want to scan a QR code with my phone
So that I can authenticate my WhatsApp account without entering credentials

Acceptance Criteria:
- [ ] QR code displays on first login
- [ ] QR code unique per user session
- [ ] User can scan with WhatsApp on phone
- [ ] Session validates after scan
- [ ] Phone number stored in database
- [ ] Session expires after 30 days
- [ ] User notified when authenticated
- [ ] Can initiate new QR scan anytime

Tasks:
- Implement Baileys QR code generation
- Create QR display page (React)
- Setup session validation polling
- Store session credentials in Redis
- Setup 30-day session expiry
- Add session refresh logic
- Create "Re-authenticate" button
- Add error handling for failed scans

Story Points: 8
Priority: Critical
Assigned To: Developer
Estimated Hours: 8
```

---

### EPIC 2: Campaign Management (Sprint 1)
**Story Points:** 34
**Duration:** Days 3-4
**Dependency:** Epic 1 (Authentication)
**Goal:** Users can create, view, and manage messaging campaigns

#### USER STORY 2.1: Create Campaign (8 SP)
```
As a user
I want to create a new campaign
So that I can send messages to my contacts

Acceptance Criteria:
- [ ] Campaign form with name and message fields
- [ ] Message preview displays in real-time
- [ ] Character count shown (max 1000 chars)
- [ ] Emoji support
- [ ] Save as draft option
- [ ] Campaign stored in database
- [ ] User sees success notification
- [ ] Validation prevents empty fields

Tasks:
- Create campaign builder form (React)
- Implement POST /api/campaigns endpoint
- Add form validation (Zod)
- Create campaign record in DB
- Add character counter
- Implement emoji picker
- Add error handling
- Write campaign creation tests

Story Points: 8
Priority: Critical
Assigned To: Developer
Estimated Hours: 8
```

#### USER STORY 2.2: Upload Contacts (13 SP)
```
As a user
I want to upload a CSV file with phone numbers
So that I can send messages to multiple contacts at once

Acceptance Criteria:
- [ ] CSV upload form with drag-and-drop
- [ ] Supported format: phone numbers (one per line)
- [ ] Auto-format phone numbers (add country code)
- [ ] Detect and show duplicates
- [ ] Show preview of first 10 rows
- [ ] Import button imports all contacts
- [ ] Success message shows count imported
- [ ] Error handling for invalid formats
- [ ] Duplicate prevention (skip duplicates)
- [ ] Progress bar during import

Tasks:
- Create CSV upload component (React)
- Implement file parsing (Papa Parse)
- Add drag-and-drop functionality
- Create POST /api/contacts/import endpoint
- Add phone number validation/formatting
- Implement duplicate detection
- Add progress tracking
- Create contacts table in DB
- Add error handling and logging
- Write CSV import tests

Story Points: 13
Priority: Critical
Assigned To: Developer
Estimated Hours: 13
```

#### USER STORY 2.3: View & Manage Campaigns (7 SP)
```
As a user
I want to see all my campaigns in a list
So that I can manage and track them

Acceptance Criteria:
- [ ] Campaign list displays all user campaigns
- [ ] Shows campaign name, status, date created
- [ ] Shows recipient count and message count
- [ ] Can sort by date or status
- [ ] Can filter by status (draft, scheduled, sending, completed)
- [ ] Can delete campaign (with confirmation)
- [ ] Can edit draft campaigns
- [ ] Pagination for many campaigns (20 per page)

Tasks:
- Create campaign list view (React)
- Implement GET /api/campaigns endpoint
- Add sorting and filtering logic
- Add delete campaign functionality
- Add edit draft campaign flow
- Add pagination
- Create list animations
- Write list view tests

Story Points: 7
Priority: High
Assigned To: Developer
Estimated Hours: 7
```

#### USER STORY 2.4: Campaign Templates (6 SP)
```
As a user
I want to use pre-built message templates
So that I can quickly create campaigns without writing messages

Acceptance Criteria:
- [ ] 10+ pre-built templates available
- [ ] Templates include: order confirmation, reminder, promo, feedback, etc.
- [ ] Can select template and preview it
- [ ] Can customize template text before sending
- [ ] Can save custom templates
- [ ] Can view all saved templates
- [ ] Can delete saved templates

Tasks:
- Create templates table in DB
- Seed 10+ default templates
- Create template selector UI
- Implement POST /api/templates endpoint
- Add template customization form
- Add save/delete template functionality
- Create template list view
- Write template tests

Story Points: 6
Priority: High
Assigned To: Developer
Estimated Hours: 6
```

---

### EPIC 3: Message Delivery (Sprint 1)
**Story Points:** 34
**Duration:** Days 4-5
**Dependency:** Epic 2 (Campaign Management)
**Goal:** Messages sent reliably with 99.5% delivery rate

#### USER STORY 3.1: Send Campaign (13 SP)
```
As a user
I want to send a campaign to all contacts
So that my message reaches my audience

Acceptance Criteria:
- [ ] Send button visible on campaign detail page
- [ ] Clicking send adds all messages to queue
- [ ] Campaign status changes to "sending"
- [ ] Real-time progress bar shows sent count
- [ ] Delivery confirmation received for each message
- [ ] Campaign auto-completes when all messages sent
- [ ] Can view delivery status per message
- [ ] Failed messages tracked separately

Tasks:
- Create send campaign endpoint (POST /api/campaigns/:id/send)
- Implement Bull queue integration
- Add messages to queue with campaign details
- Create message sender worker (Baileys)
- Implement delivery tracking
- Add real-time progress updates (WebSocket)
- Create campaign detail view with stats
- Write send campaign tests

Story Points: 13
Priority: Critical
Assigned To: Developer
Estimated Hours: 13
```

#### USER STORY 3.2: Message Delay Options (8 SP)
```
As a user
I want to configure delay between messages
So that I don't get my account banned for spam

Acceptance Criteria:
- [ ] 3 preset options: Fast (2-5s), Balanced (5-10s), Safe (10-30s)
- [ ] Show ban risk % for each option
- [ ] Show estimated time to send 1000 messages
- [ ] User can select delay before sending
- [ ] Default to "Balanced"
- [ ] Batch pausing every 100 messages (30s pause)
- [ ] Real-time delay application during send

Tasks:
- Create delay options UI
- Implement applyDelay function in worker
- Add batch pause logic
- Calculate estimated send time
- Display ban risk percentages
- Add delay type to campaign
- Implement random delay within range
- Write delay logic tests

Story Points: 8
Priority: Critical
Assigned To: Developer
Estimated Hours: 8
```

#### USER STORY 3.3: Baileys Integration (7 SP)
```
As the system
I want to send messages via Baileys
So that I can deliver messages reliably

Acceptance Criteria:
- [ ] Messages sent successfully via Baileys
- [ ] 95%+ delivery success rate
- [ ] Session credentials stored securely
- [ ] Failed messages logged
- [ ] Retry logic for failed messages
- [ ] Error messages informative

Tasks:
- Install and configure Baileys library
- Implement sendViaBaileys function
- Add credential storage (encrypted)
- Implement message sending logic
- Add success/failure tracking
- Implement retry mechanism
- Add logging for debugging
- Write Baileys integration tests

Story Points: 7
Priority: Critical
Assigned To: Developer
Estimated Hours: 7
```

#### USER STORY 3.4: Web JS Fallback (6 SP)
```
As the system
I want to fallback to Web JS if Baileys fails
So that messages still deliver when primary method fails

Acceptance Criteria:
- [ ] Detects Baileys failure
- [ ] Automatically tries Web JS
- [ ] 99%+ combined delivery success
- [ ] Fallback transparent to user
- [ ] Fallback tracked in analytics

Tasks:
- Install Puppeteer
- Implement sendViaWebJS function
- Add auto-failover logic
- Track delivery method used
- Add fallback logging
- Implement cron retry (5 min intervals)
- Write fallback tests

Story Points: 6
Priority: High
Assigned To: Developer
Estimated Hours: 6
```

---

### EPIC 4: Campaign Scheduling (Sprint 1)
**Story Points:** 13
**Duration:** Days 4-5
**Dependency:** Epic 2 (Campaign Management)
**Goal:** Users can schedule campaigns for later

#### USER STORY 4.1: Schedule Campaign (8 SP)
```
As a user
I want to schedule a campaign for a specific date/time
So that I can send messages at optimal times

Acceptance Criteria:
- [ ] Date/time picker in campaign form
- [ ] Timezone selector (default IST)
- [ ] Can set recurring campaigns (daily/weekly/monthly)
- [ ] Campaign stored with scheduled status
- [ ] Scheduler checks every minute
- [ ] Campaign auto-sends at scheduled time
- [ ] User notified when campaign sent
- [ ] Can cancel scheduled campaign

Tasks:
- Add date/time picker to campaign form
- Add timezone selector
- Add recurrence options
- Create scheduler worker
- Implement cron job every minute
- Add scheduled campaign detection
- Implement auto-send logic
- Write scheduler tests

Story Points: 8
Priority: High
Assigned To: Developer
Estimated Hours: 8
```

#### USER STORY 4.2: Schedule Management (5 SP)
```
As a user
I want to view and manage scheduled campaigns
So that I can track what's scheduled to send

Acceptance Criteria:
- [ ] Separate view for scheduled campaigns
- [ ] Shows scheduled date/time
- [ ] Can edit scheduled campaign
- [ ] Can cancel scheduled campaign
- [ ] Can see scheduling history

Tasks:
- Create scheduled campaigns view
- Add edit scheduled campaign flow
- Add cancel functionality
- Create scheduling history
- Write schedule management tests

Story Points: 5
Priority: Medium
Assigned To: Developer
Estimated Hours: 5
```

---

### EPIC 5: Analytics & Reporting (Sprint 1)
**Story Points:** 21
**Duration:** Days 5-6
**Dependency:** Epic 3 (Message Delivery)
**Goal:** Users can track message delivery and performance

#### USER STORY 5.1: Delivery Analytics Dashboard (8 SP)
```
As a user
I want to see delivery statistics for my campaigns
So that I can understand campaign performance

Acceptance Criteria:
- [ ] Dashboard shows key metrics:
  - Total messages sent today
  - Delivery rate (%)
  - Failed messages count
  - Average delivery time
- [ ] Time-series chart showing sends/hour
- [ ] Campaign comparison table
- [ ] Export data to CSV
- [ ] Refresh every 5 seconds (real-time)

Tasks:
- Create analytics dashboard page (React)
- Implement GET /api/analytics/overview endpoint
- Add real-time WebSocket updates
- Create time-series chart (Recharts)
- Implement data export to CSV
- Add filtering by date range
- Write analytics tests

Story Points: 8
Priority: High
Assigned To: Developer
Estimated Hours: 8
```

#### USER STORY 5.2: Message-Level Analytics (8 SP)
```
As a user
I want to see delivery status for each message
So that I can identify which messages failed

Acceptance Criteria:
- [ ] Campaign detail page shows all messages
- [ ] Filter messages by status (sent, delivered, failed)
- [ ] Show phone number, message, status, timestamp
- [ ] Can retry individual failed messages
- [ ] Show failure reason for failed messages
- [ ] Pagination (100 messages per page)

Tasks:
- Create message list view
- Implement GET /api/campaigns/:id/messages endpoint
- Add filtering by status
- Add retry button for failed messages
- Implement pagination
- Add failure reason display
- Write message list tests

Story Points: 8
Priority: High
Assigned To: Developer
Estimated Hours: 8
```

#### USER STORY 5.3: Ban Risk Tracking (5 SP)
```
As a user
I want to see ban risk score
So that I understand account safety

Acceptance Criteria:
- [ ] Ban risk score shown (1-10 scale)
- [ ] Color-coded: green (1-3), yellow (4-7), red (8-10)
- [ ] Updated in real-time
- [ ] Alert if risk > 7
- [ ] Recommendations if risk high

Tasks:
- Calculate ban risk score
- Implement ban risk tracking
- Add real-time updates
- Create visual indicator
- Add alerts/recommendations
- Write ban risk tests

Story Points: 5
Priority: Medium
Assigned To: Developer
Estimated Hours: 5
```

---

### EPIC 6: Billing & Plans (Sprint 1)
**Story Points:** 21
**Duration:** Days 5-6
**Dependency:** Epic 1 (Authentication)
**Goal:** Users can select plans and make payments

#### USER STORY 6.1: Billing Plans Display (5 SP)
```
As a user
I want to see available plans and pricing
So that I can choose the right plan for my needs

Acceptance Criteria:
- [ ] Display 3 plans: Starter, Pro, Business
- [ ] Show features for each plan
- [ ] Show price and message limit
- [ ] Show currently selected plan
- [ ] "Upgrade" button visible for other plans

Tasks:
- Create pricing page (React)
- Implement GET /api/billing/plans endpoint
- Design plan cards
- Add feature comparison
- Write pricing page tests

Story Points: 5
Priority: High
Assigned To: Developer
Estimated Hours: 5
```

#### USER STORY 6.2: Razorpay Integration (11 SP)
```
As a user
I want to upgrade to a paid plan
So that I can send more messages

Acceptance Criteria:
- [ ] Click "Upgrade" button on plan card
- [ ] Razorpay payment modal opens
- [ ] Can enter card details securely
- [ ] Payment processed successfully
- [ ] Plan updated immediately after payment
- [ ] Invoice generated and emailed
- [ ] Failed payment shows error message
- [ ] Receipt stored in system

Tasks:
- Create upgrade flow
- Implement POST /api/billing/checkout endpoint
- Integrate Razorpay payment modal
- Implement POST /api/billing/verify endpoint
- Update user plan on success
- Generate invoice
- Send invoice email
- Write payment flow tests

Story Points: 11
Priority: Critical
Assigned To: Developer
Estimated Hours: 11
```

#### USER STORY 6.3: Usage Tracking (5 SP)
```
As a user
I want to see my message usage
So that I know when I'll hit my limit

Acceptance Criteria:
- [ ] Dashboard shows messages used this month
- [ ] Shows messages remaining
- [ ] Progress bar showing usage
- [ ] Upgrade prompt at 80% usage
- [ ] Warning at 95% usage
- [ ] Block new campaigns at 100%

Tasks:
- Track messages per user
- Implement usage API endpoint
- Create usage display component
- Add upgrade prompts
- Add blocking logic at limit
- Write usage tracking tests

Story Points: 5
Priority: High
Assigned To: Developer
Estimated Hours: 5
```

---

### EPIC 7: Admin Panel (Sprint 1)
**Story Points:** 13
**Duration:** Day 6-7
**Dependency:** Epic 1 (Authentication)
**Goal:** Admin can manage users and system

#### USER STORY 7.1: Admin Dashboard (8 SP)
```
As an admin
I want to view user statistics
So that I can monitor platform health

Acceptance Criteria:
- [ ] Total users count
- [ ] Total messages sent
- [ ] Daily active users
- [ ] Top campaigns
- [ ] System health status
- [ ] Recent activity log

Tasks:
- Create admin dashboard
- Implement GET /api/admin/stats endpoint
- Create analytics visualizations
- Add activity logging
- Write admin dashboard tests

Story Points: 8
Priority: Medium
Assigned To: Developer
Estimated Hours: 8
```

#### USER STORY 7.2: User Management (5 SP)
```
As an admin
I want to manage user plans and accounts
So that I can override/modify user plans

Acceptance Criteria:
- [ ] View all users list
- [ ] Search users by email
- [ ] View user details and usage
- [ ] Upgrade/downgrade user plan
- [ ] Suspend/unsuspend user
- [ ] View user activity

Tasks:
- Create users list page
- Implement GET /api/admin/users endpoint
- Add plan management UI
- Add suspend/unsuspend functionality
- Write user management tests

Story Points: 5
Priority: Medium
Assigned To: Developer
Estimated Hours: 5
```

---

### EPIC 8: Frontend UI/UX (Sprint 2)
**Story Points:** 55
**Duration:** Days 8-12
**Dependency:** Backend APIs (Epic 1-7)
**Goal:** Complete, polished user interface

#### USER STORY 8.1: Authentication Pages (8 SP)
```
As a user
I want intuitive signup and login pages
So that I can easily access the system

Acceptance Criteria:
- [ ] Signup page with email, password, name fields
- [ ] Login page with email, password fields
- [ ] Password reset flow
- [ ] Form validation with error messages
- [ ] Links between pages
- [ ] Responsive design
- [ ] Loading states
- [ ] Success notifications

Tasks:
- Design signup form UI
- Design login form UI
- Create form components
- Add form validation
- Add error handling
- Style with Tailwind
- Write component tests
- Create password reset flow

Story Points: 8
Priority: Critical
Assigned To: Developer
Estimated Hours: 8
```

#### USER STORY 8.2: Dashboard Page (13 SP)
```
As a user
I want to see my dashboard with key metrics
So that I understand my usage at a glance

Acceptance Criteria:
- [ ] Key metrics cards (sent today, delivery rate, plan)
- [ ] Recent campaigns list (5 most recent)
- [ ] Quick action buttons (Send, Upload, View All)
- [ ] Account status indicator
- [ ] Responsive layout
- [ ] Dark/light theme toggle

Tasks:
- Design dashboard layout
- Create metric cards
- Create recent campaigns widget
- Add quick actions
- Implement theme toggle
- Style with Tailwind
- Add responsive design
- Write dashboard tests

Story Points: 13
Priority: Critical
Assigned To: Developer
Estimated Hours: 13
```

#### USER STORY 8.3: Campaign Builder Page (21 SP)
```
As a user
I want to use an intuitive campaign builder
So that creating campaigns is quick and easy

Acceptance Criteria:
- [ ] Campaign name field
- [ ] Message body textarea with character count
- [ ] Template selector
- [ ] Contact selection/import
- [ ] Delay options selector
- [ ] Schedule options
- [ ] Message preview
- [ ] Save as draft button
- [ ] Send button
- [ ] Responsive layout

Tasks:
- Design campaign builder layout
- Create form components
- Add template dropdown
- Create contact import UI
- Add delay options selector
- Add date/time picker
- Create message preview
- Add form validation
- Implement save draft logic
- Implement send logic
- Style with Tailwind
- Write builder tests

Story Points: 21
Priority: Critical
Assigned To: Developer
Estimated Hours: 21
```

#### USER STORY 8.4: Analytics Page (13 SP)
```
As a user
I want to view detailed analytics
So that I understand campaign performance

Acceptance Criteria:
- [ ] Time-series chart (messages/hour)
- [ ] Delivery status breakdown (pie chart)
- [ ] Campaign list with stats
- [ ] Filter by date range
- [ ] Export to CSV button
- [ ] Real-time updates
- [ ] Mobile responsive

Tasks:
- Design analytics layout
- Create time-series chart
- Create pie chart for status
- Create campaign stats table
- Add date range filter
- Add export functionality
- Add real-time updates
- Style with Tailwind
- Write analytics tests

Story Points: 13
Priority: High
Assigned To: Developer
Estimated Hours: 13
```

---

### EPIC 9: Multi-Language Support (Sprint 2)
**Story Points:** 13
**Duration:** Days 12-13
**Dependency:** Frontend (Epic 8)
**Goal:** Support Hindi, Marathi, and English

#### USER STORY 9.1: i18n Implementation (8 SP)
```
As a user
I want to use the app in my language
So that I can understand and use it better

Acceptance Criteria:
- [ ] Language toggle in top-right corner
- [ ] Support English, Hindi, Marathi
- [ ] All UI text translated
- [ ] Preference saved in localStorage
- [ ] Date formats localized
- [ ] Direction (LTR/RTL) if needed

Tasks:
- Setup i18next
- Create translation files (en, hi, mr)
- Extract all strings to translations
- Implement language toggle
- Test all translations
- Add date localization
- Write translation tests

Story Points: 8
Priority: High
Assigned To: Developer
Estimated Hours: 8
```

#### USER STORY 9.2: Localized Content (5 SP)
```
As an Indian user
I want localized content for India
So that features are relevant to me

Acceptance Criteria:
- [ ] Currency shown as ₹ (INR)
- [ ] Country code default +91
- [ ] Timezone default IST
- [ ] Localized help articles

Tasks:
- Add currency localization
- Set country code default
- Add timezone defaults
- Create help articles
- Write localization tests

Story Points: 5
Priority: Medium
Assigned To: Developer
Estimated Hours: 5
```

---

### EPIC 10: Testing & Deployment (Sprint 2)
**Story Points:** 34
**Duration:** Days 13-15
**Dependency:** All features (Epics 1-9)
**Goal:** Production-ready system with tests and monitoring

#### USER STORY 10.1: Unit & Integration Tests (13 SP)
```
As a developer
I want comprehensive test coverage
So that I can deploy confidently

Acceptance Criteria:
- [ ] Auth tests (signup, login, QR)
- [ ] Campaign tests (create, send, schedule)
- [ ] Message delivery tests (Baileys, Web JS)
- [ ] Analytics tests
- [ ] Billing tests
- [ ] API endpoint tests
- [ ] Component tests (React)
- [ ] >80% code coverage

Tasks:
- Write auth tests (Jest)
- Write campaign tests
- Write delivery tests
- Write analytics tests
- Write billing tests
- Write API tests (Supertest)
- Write component tests
- Setup code coverage reports
- Write test documentation

Story Points: 13
Priority: High
Assigned To: Developer
Estimated Hours: 13
```

#### USER STORY 10.2: Load Testing (8 SP)
```
As a system
I want to handle load
So that performance is reliable

Acceptance Criteria:
- [ ] Handle 100 concurrent users
- [ ] API response time <200ms
- [ ] Message queue handles 1000+ jobs
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Report generated

Tasks:
- Setup load testing (Apache JMeter or Artillery)
- Create load test scenarios
- Test API endpoints under load
- Test message queue under load
- Monitor performance metrics
- Optimize bottlenecks
- Generate report

Story Points: 8
Priority: High
Assigned To: Developer
Estimated Hours: 8
```

#### USER STORY 10.3: Security Audit (8 SP)
```
As a developer
I want to ensure security
So that user data is protected

Acceptance Criteria:
- [ ] HTTPS/TLS enabled
- [ ] Passwords hashed (bcrypt)
- [ ] JWT tokens secure
- [ ] SQL injection prevented
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Secrets not in code
- [ ] Security headers set

Tasks:
- Enable SSL/TLS
- Verify password hashing
- Test JWT security
- Check SQL injection vulnerability
- Test CORS configuration
- Verify rate limiting
- Check for hardcoded secrets
- Add security headers
- Run security audit

Story Points: 8
Priority: Critical
Assigned To: Developer
Estimated Hours: 8
```

#### USER STORY 10.4: VPS Deployment (5 SP)
```
As a system
I want to deploy to production
So that users can access the app

Acceptance Criteria:
- [ ] VPS provisioned and configured
- [ ] PostgreSQL installed and running
- [ ] Redis installed and running
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] PM2 running services
- [ ] Domain pointing to VPS
- [ ] Monitoring enabled

Tasks:
- Provision VPS (Hetzner/Vultr)
- Install system dependencies
- Configure PostgreSQL
- Configure Redis
- Configure Nginx
- Setup SSL with Let's Encrypt
- Configure PM2
- Setup monitoring
- Deploy code
- Verify everything working

Story Points: 5
Priority: Critical
Assigned To: Developer
Estimated Hours: 5
```

---

## SPRINT 1 BACKLOG (Days 1-7)

### Sprint 1 Summary
- **Total Story Points:** 157
- **Duration:** 7 days
- **Daily Capacity:** ~22 SP/day
- **Focus:** Backend API + Core Features

### Sprint 1 Story Order (By Dependency & Priority)

| # | Story | SP | Priority | Duration | Day | Status |
|---|-------|----|-----------|-----------|----|--------|
| 1.1 | User Registration | 8 | Critical | 1 day | 1 | Backlog |
| 1.2 | User Login | 5 | Critical | 1 day | 1 | Backlog |
| 1.3 | WhatsApp QR Auth | 8 | Critical | 1 day | 2 | Backlog |
| 2.1 | Create Campaign | 8 | Critical | 1 day | 3 | Backlog |
| 2.2 | Upload Contacts | 13 | Critical | 1.5 days | 3-4 | Backlog |
| 2.3 | View & Manage Campaigns | 7 | High | 1 day | 4 | Backlog |
| 2.4 | Campaign Templates | 6 | High | 1 day | 4 | Backlog |
| 3.1 | Send Campaign | 13 | Critical | 1.5 days | 4-5 | Backlog |
| 3.2 | Message Delay Options | 8 | Critical | 1 day | 5 | Backlog |
| 3.3 | Baileys Integration | 7 | Critical | 1 day | 5 | Backlog |
| 3.4 | Web JS Fallover | 6 | High | 1 day | 5 | Backlog |
| 4.1 | Schedule Campaign | 8 | High | 1 day | 5 | Backlog |
| 4.2 | Schedule Management | 5 | Medium | 0.5 days | 6 | Backlog |
| 5.1 | Analytics Dashboard | 8 | High | 1 day | 5 | Backlog |
| 5.2 | Message Analytics | 8 | High | 1 day | 6 | Backlog |
| 5.3 | Ban Risk Tracking | 5 | Medium | 0.5 days | 6 | Backlog |
| 6.1 | Plans Display | 5 | High | 0.5 days | 5 | Backlog |
| 6.2 | Razorpay Integration | 11 | Critical | 1.5 days | 6-7 | Backlog |
| 6.3 | Usage Tracking | 5 | High | 0.5 days | 6 | Backlog |
| 7.1 | Admin Dashboard | 8 | Medium | 1 day | 6 | Backlog |
| 7.2 | User Management | 5 | Medium | 0.5 days | 7 | Backlog |

**Sprint 1 Total: 157 SP over 7 days = ~22 SP/day**

---

## SPRINT 2 BACKLOG (Days 8-15)

### Sprint 2 Summary
- **Total Story Points:** 68
- **Duration:** 7 days
- **Daily Capacity:** ~10 SP/day
- **Focus:** Frontend + Testing + Deployment

### Sprint 2 Story Order

| # | Story | SP | Priority | Duration | Day | Status |
|---|-------|----|-----------|-----------|----|--------|
| 8.1 | Auth Pages | 8 | Critical | 1 day | 8 | Backlog |
| 8.2 | Dashboard Page | 13 | Critical | 1.5 days | 8-9 | Backlog |
| 8.3 | Campaign Builder | 21 | Critical | 2.5 days | 9-10 | Backlog |
| 8.4 | Analytics Page | 13 | High | 1.5 days | 10-11 | Backlog |
| 9.1 | i18n Implementation | 8 | High | 1 day | 11 | Backlog |
| 9.2 | Localized Content | 5 | Medium | 0.5 days | 12 | Backlog |
| 10.1 | Unit & Integration Tests | 13 | High | 1.5 days | 12-13 | Backlog |
| 10.2 | Load Testing | 8 | High | 1 day | 13 | Backlog |
| 10.3 | Security Audit | 8 | Critical | 1 day | 13 | Backlog |
| 10.4 | VPS Deployment | 5 | Critical | 0.5 days | 14 | Backlog |

**Sprint 2 Total: 102 SP over 7 days = ~14.5 SP/day**

---

## STORY POINT ESTIMATION GUIDE

### Story Point Reference
```
1 SP   = 1 hour (very simple task)
3 SP   = 3 hours (simple task)
5 SP   = 5 hours (medium task)
8 SP   = 8 hours (complex task)
13 SP  = 13 hours (very complex task)
21 SP  = 21 hours (epic scope)
```

### Effort Distribution
- **Frontend Component:** 3-5 SP
- **API Endpoint:** 5-8 SP
- **Database Feature:** 3-5 SP
- **Integration (External Service):** 8-13 SP
- **Testing:** 5-8 SP
- **Deployment:** 5-8 SP

---

## DEPENDENCY MAP

```
Authentication (Epic 1)
    
     Campaign Management (Epic 2)
         
          Message Delivery (Epic 3)
              
               Analytics (Epic 5)
         
          Campaign Scheduling (Epic 4)
               
                Analytics (Epic 5)
    
     Billing (Epic 6)
    
     Admin Panel (Epic 7)

All Backends Completed
    
     Frontend UI/UX (Epic 8)
         
          Multi-Language (Epic 9)
               
                Testing & Deployment (Epic 10)
```

---

## SPRINT PLANNING CHECKLIST

### Pre-Sprint (Day 0)
- [ ] Review all user stories
- [ ] Clarify acceptance criteria
- [ ] Identify dependencies
- [ ] Estimate story points
- [ ] Prioritize stories
- [ ] Setup development environment

### During Sprint
- [ ] Daily standup (if team > 1)
- [ ] Track progress in backlog
- [ ] Update story status
- [ ] Log blockers and issues
- [ ] Update time estimates if needed

### End of Sprint
- [ ] Complete sprint review
- [ ] Demo completed stories
- [ ] Retrospective
- [ ] Plan next sprint
- [ ] Update backlog

---

## SUCCESS CRITERIA FOR MVP

**By End of Day 7:**
- [ ] All Sprint 1 stories completed
- [ ] Backend APIs working
- [ ] Message delivery functional (99%+)
- [ ] Database optimized
- [ ] All tests passing

**By End of Day 15:**
- [ ] All Sprint 2 stories completed
- [ ] Frontend UI polished
- [ ] Full test coverage
- [ ] Security audit passed
- [ ] Deployed to production
- [ ] Ready for customer launch

---

## RISK & MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Baileys breaks (WhatsApp update) | Medium | Critical | Web JS fallback ready, alternative providers researched |
| Database performance issues | Low | High | Indexing planned, query optimization in sprint |
| Payment integration delays | Low | High | Razorpay tested, sandbox available |
| SSL certificate issues | Low | Medium | Let's Encrypt automated renewal |
| Message queue overflow | Low | High | Bull configured with max jobs, workers auto-scale |

---

## DEFINITION OF DONE

A story is "Done" when:
- [ ] Code written and reviewed
- [ ] All acceptance criteria met
- [ ] Tests written (unit + integration)
- [ ] Tests passing (>80% coverage)
- [ ] Performance tested
- [ ] Security reviewed
- [ ] Documentation updated
- [ ] Merged to main branch
- [ ] Ready for production deployment

