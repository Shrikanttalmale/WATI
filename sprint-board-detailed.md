# BROADCASTER: DETAILED SPRINT BOARD & TASK BREAKDOWN

## SPRINT 1: BACKEND & CORE FEATURES (Days 1-7)

### Daily Sprint View

---

## DAY 1: Authentication Phase 1 (21 SP)

### 1.1: User Registration (8 SP)  START
```

 TASK 1.1.1: React Signup Form Component    [2h] 

 Deliverable: /frontend/src/pages/Auth/Signup.tsx
 
 SUBTASKS:
   Create form layout (email, password, name)
   Add input validation feedback
   Add "I agree to Terms" checkbox
   Create submit button
   Add password strength indicator
 
 TESTING:
   Form renders correctly
   Validation shows errors
   Submit calls API
   Responsive on mobile
 
 ACCEPTANCE:
   All inputs accept user data
   Form validates before submit
   Success/error messages show



 TASK 1.1.2: Node.js Signup API Endpoint    [2h] 

 Deliverable: /backend/src/routes/auth.ts
 
 SUBTASKS:
   Create POST /api/auth/signup endpoint
   Validate email format & uniqueness
   Hash password with bcrypt
   Create user in database
   Generate JWT token
   Send welcome email
   Set trial expires_at (7 days)
 
 TESTING:
   Can create new user
   Duplicate email rejected
   Password hashed correctly
   Email sent successfully
   JWT token generated
   User has trial = true
   Error handling works
 
 ACCEPTANCE:
   User created in DB
   Email sent
   Trial activated (7 days)
   Can login after signup



 TASK 1.1.3: Email Service Integration      [1h] 

 Deliverable: /backend/src/services/email.ts
 
 SUBTASKS:
   Configure Sendmail
   Create welcome email template
   Add verification link
   Test email sending
 
 TESTING:
   Email sent to new user
   Welcome template renders correctly
   Links work in email
 
 ACCEPTANCE:
   Email delivered
   Contains verification link
   Professional formatting



 TASK 1.1.4: Form Validation & Error Handling[1h]

 Deliverable: /backend/src/middleware/validate.ts
 
 SUBTASKS:
   Implement password validation (8+ chars, special)
   Implement email validation (format, unique)
   Add error messages
   Add frontend error display
 
 TESTING:
   Weak passwords rejected
   Invalid emails rejected
   Error messages helpful
 
 ACCEPTANCE:
   All validation rules enforced
   Clear error messages



 TASK 1.1.5: Unit Tests               [0.5h] 

 Deliverable: /backend/tests/auth.test.ts
 
 TESTS:
   Password hashing
   Email validation
   User creation
   Duplicate prevention
   Error handling
 
 COVERAGE: >85%

```

### 1.2: User Login (5 SP)  START
```

 TASK 1.2.1: React Login Form              [1h] 

 Deliverable: /frontend/src/pages/Auth/Login.tsx
 
 SUBTASKS:
   Create login form (email, password)
   Add "Remember me" checkbox
   Add "Forgot password?" link
   Create submit button
   Add loading state
 
 TESTING:
   Form renders
   Submit calls API
   Loading state shows
   Responsive design
 
 ACCEPTANCE:
   All fields functional
   Proper UX/loading states



 TASK 1.2.2: Login API Endpoint           [1.5h] 

 Deliverable: POST /api/auth/login
 
 SUBTASKS:
   Validate credentials
   Compare password with bcrypt
   Generate JWT token
   Set httpOnly cookie
   Return user data
 
 TESTING:
   Valid login succeeds
   Invalid password rejected
   User not found handled
   JWT token valid
   Cookie set correctly
 
 ACCEPTANCE:
   JWT token generated
   Cookie stored securely
   Session persists



 TASK 1.2.3: Password Reset Flow          [1h] 

 Deliverable: Password reset endpoints
 
 SUBTASKS:
   Create "Forgot password?" page
   Send reset email with token
   Create reset password page
   Validate reset token
   Update password
 
 TESTING:
   Email sent with reset link
   Token expires after 1 hour
   Password updated successfully
 
 ACCEPTANCE:
   Reset flow works end-to-end
   Token validation works



 TASK 1.2.4: Rate Limiting & Tests        [0.5h] 

 Deliverable: Rate limiting middleware
 
 SUBTASKS:
   Add express-rate-limit
   5 attempts per 15 minutes
   Return 429 when exceeded
   Write tests
 
 TESTING:
   5 attempts allowed
   6th attempt blocked
   Lockout lasts 15 minutes

```

### Progress: Day 1 End
-  User Registration complete (8 SP)
-  User Login complete (5 SP)
-  WhatsApp QR Auth in progress
- **Total Completed:** 13 SP / 21 SP for day

---

## DAY 2: Authentication Phase 2 (8 SP)

### 1.3: WhatsApp QR Code Authentication (8 SP)  START
```

 TASK 1.3.1: Baileys QR Code Generation   [2h] 

 Deliverable: /backend/src/services/whatsapp.ts
 
 SUBTASKS:
   Install @whiskeysockets/baileys
   Create makeWASocket instance
   Generate QR code image
   Convert to base64 for frontend
   Setup session file storage
 
 CODE:
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });
  
  sock.ev.on('connection.update', update => {
    const { qr } = update;
    if(qr) {
      // Generate QR image
      // Send to frontend
    }
  });
 
 TESTING:
   QR code generated
   QR code is unique
   QR code as base64 string
 
 ACCEPTANCE:
   QR code displays
   Unique per session



 TASK 1.3.2: QR Display Page (React)      [1.5h] 

 Deliverable: /frontend/src/pages/Auth/QRCode.tsx
 
 SUBTASKS:
   Display QR code image
   Show "Scan with WhatsApp" instruction
   Add loading state
   Auto-redirect after successful scan
   Add "Re-scan" button
 
 LAYOUT:
  
   Scan QR Code             
     
    (QR CODE IMAGE)      
    250px x 250px        
     
   "Scan with WhatsApp"     
   [Re-scan] [Skip]         
  
 
 TESTING:
   QR displays correctly
   Image loads
   Responsive layout
 
 ACCEPTANCE:
   QR visible and scannable
   Clear instructions



 TASK 1.3.3: Session Validation Polling   [1.5h] 

 Deliverable: WebSocket polling logic
 
 SUBTASKS:
   Frontend polls every 1 second
   GET /api/auth/qr-status endpoint
   Return { authenticated: boolean, phone: "..." }
   Stop polling after success
   Redirect to QR page after success
 
 CODE (Frontend):
  const pollInterval = setInterval(async () => {
    const response = await fetch('/api/auth/qr-status');
    const { authenticated, phone } = await response.json();
    
    if(authenticated) {
      clearInterval(pollInterval);
      navigate('/dashboard');
    }
  }, 1000);
 
 TESTING:
   Polls every second
   Detects authentication
   Redirects on success
 
 ACCEPTANCE:
   Polling works
   Auto-redirect after scan



 TASK 1.3.4: Redis Session Storage        [1h] 

 Deliverable: Session storage in Redis
 
 SUBTASKS:
   Store session in Redis on successful scan
   Key format: session:{userId}
   TTL: 30 days
   Store phone number in session
 
 TESTING:
   Session stored in Redis
   TTL correctly set to 30 days
   Phone number stored
 
 ACCEPTANCE:
   Session persisted in Redis
   Auto-expires after 30 days



 TASK 1.3.5: Error Handling & Tests       [0.5h] 

 Deliverable: Error handling and tests
 
 SUBTASKS:
   Handle QR scan failures
   Handle session expiry
   Add retry logic
   Write integration tests
 
 TESTING:
   QR timeout handled
   Invalid QR rejected
   Session validation works
 
 ACCEPTANCE:
   Error messages clear
   User can retry
   All error cases handled



 TASK 1.3.6: Re-authenticate Option       [0.5h] 

 Deliverable: Re-authenticate button
 
 SUBTASKS:
   Add "Re-authenticate" button in settings
   Clear old session
   Generate new QR code
   Update session on scan
 
 TESTING:
   Old session cleared
   New session created
 
 ACCEPTANCE:
   Can re-authenticate anytime

```

### Progress: Day 2 End
-  WhatsApp QR Auth complete (8 SP)
- **Total Completed This Sprint:** 21 SP / 157 SP
- **Cumulative:** 21 SP

---

## DAY 3: Campaign Creation (15 SP)

### 2.1: Create Campaign (8 SP)  START
```
TASK 2.1.1: Campaign Form UI (React) [2h]
TASK 2.1.2: API Endpoint [2h]
TASK 2.1.3: Validation & Error Handling [1h]
TASK 2.1.4: Emoji Picker Integration [1h]
TASK 2.1.5: Tests [0.5h]
TASK 2.1.6: Character Counter [0.5h]

STATUS: Complete by EOD
DELIVERABLES:
   Campaign form page
   POST /api/campaigns endpoint
   Campaign record in database
   Real-time character count
```

### 2.2: Upload Contacts (Part 1 - Day 3) [7 SP]
```
TASK 2.2.1: CSV Upload Component [2h]
TASK 2.2.2: File Parsing [1.5h]
TASK 2.2.3: Drag-and-Drop [1.5h]
TASK 2.2.4: CSV Preview [1.5h]
TASK 2.2.5: Phone Formatting [0.5h]

STATUS: In Progress (continues to Day 4)
DELIVERABLES:
   File upload UI
   CSV parsing logic
   Preview display
```

### Progress: Day 3 End
-  Create Campaign complete (8 SP)
-  Upload Contacts in progress (7/13 SP)
- **Cumulative:** 28 SP

---

## DAY 4: Contact Management & Campaign Listing (20 SP)

### 2.2: Upload Contacts (Completed) [13 SP]
```
CONTINUATION FROM DAY 3
TASK 2.2.6: API Endpoint [2h]
TASK 2.2.7: Duplicate Detection [1.5h]
TASK 2.2.8: Database Storage [1h]
TASK 2.2.9: Progress Tracking [1h]
TASK 2.2.10: Error Handling [1h]
TASK 2.2.11: Tests [1h]

STATUS: Complete by EOD
```

### 2.3: View & Manage Campaigns (7 SP)  START
```
TASK 2.3.1: Campaign List UI [2h]
TASK 2.3.2: API Endpoint (GET) [1.5h]
TASK 2.3.3: Filtering & Sorting [1.5h]
TASK 2.3.4: Delete Functionality [1h]
TASK 2.3.5: Tests [0.5h]

STATUS: Complete by EOD
```

### Progress: Day 4 End
-  Upload Contacts complete (13 SP)
-  View & Manage Campaigns complete (7 SP)
- **Cumulative:** 48 SP

---

## DAY 5: Message Delivery System (34 SP)

### 3.1: Send Campaign (13 SP) [CORE FEATURE]  START
```
TASK 3.1.1: Send Endpoint [2h]
TASK 3.1.2: Queue Integration (Bull) [2h]
TASK 3.1.3: Message Creation [1.5h]
TASK 3.1.4: Real-time Progress [2h]
TASK 3.1.5: Delivery Tracking [1.5h]
TASK 3.1.6: Campaign Status Updates [1h]
TASK 3.1.7: WebSocket Setup [1.5h]
TASK 3.1.8: Tests [0.5h]

STATUS: Complete by EOD
```

### 3.2: Message Delay Options (8 SP)  START
```
TASK 3.2.1: UI Component [1h]
TASK 3.2.2: Delay Logic [1.5h]
TASK 3.2.3: Ban Risk Display [0.5h]
TASK 3.2.4: Estimated Time Calc [1h]
TASK 3.2.5: Batch Pause Logic [1.5h]
TASK 3.2.6: Tests [0.5h]
TASK 3.2.7: Documentation [0.5h]

STATUS: Complete by EOD
```

### 3.3: Baileys Integration (7 SP)  START
```
TASK 3.3.1: Message Sender [2h]
TASK 3.3.2: Error Handling [1h]
TASK 3.3.3: Retry Logic [1.5h]
TASK 3.3.4: Logging [0.5h]
TASK 3.3.5: Tests [1h]
TASK 3.3.6: Session Management [1h]

STATUS: Complete by EOD
```

### 3.4: Web JS Fallback (6 SP)
```
TASK 3.4.1: Puppeteer Setup [0.5h]
TASK 3.4.2: Web JS Sender [2h]
TASK 3.4.3: Failover Logic [1h]
TASK 3.4.4: Logging [0.5h]
TASK 3.4.5: Tests [1.5h]
TASK 3.4.6: Cron Retry [0.5h]

STATUS: Complete by EOD
```

### Progress: Day 5 End
-  Send Campaign complete (13 SP)
-  Message Delay Options complete (8 SP)
-  Baileys Integration complete (7 SP)
-  Web JS Fallback complete (6 SP)
- **Cumulative:** 82 SP

---

## DAY 6: Analytics & Billing Foundation (26 SP)

### 4.1: Schedule Campaign (8 SP)
### 5.1: Analytics Dashboard (8 SP)
### 5.2: Message Analytics (8 SP)
### 6.1: Plans Display (5 SP)

**Progress: Day 6 End**
- **Cumulative:** 108 SP

---

## DAY 7: Billing & Admin (24 SP)

### 6.2: Razorpay Integration (11 SP) [CRITICAL REVENUE]
### 6.3: Usage Tracking (5 SP)
### 7.1: Admin Dashboard (8 SP)

**Progress: Day 7 End**
- **Cumulative:** 157 SP / 157 SP
-  **SPRINT 1 COMPLETE**

---

## SPRINT 2: FRONTEND & DEPLOYMENT (Days 8-15)

---

## DAY 8: Frontend Auth & Dashboard (21 SP)

### 8.1: Authentication Pages (8 SP)
### 8.2: Dashboard Page (13 SP - Part 1)

**Progress: Day 8 End**
- **Cumulative:** 21 SP

---

## DAY 9-10: Campaign Builder (21 SP)

### 8.2: Dashboard Page (completed)
### 8.3: Campaign Builder Page (21 SP) [CRITICAL]

**Progress: Day 10 End**
- **Cumulative:** 42 SP

---

## DAY 11-12: Analytics & Localization (26 SP)

### 8.4: Analytics Page (13 SP)
### 9.1: i18n Implementation (8 SP)
### 9.2: Localized Content (5 SP)

**Progress: Day 12 End**
- **Cumulative:** 68 SP

---

## DAY 13-14: Testing, Security & Deployment (34 SP)

### 10.1: Unit & Integration Tests (13 SP)
### 10.2: Load Testing (8 SP)
### 10.3: Security Audit (8 SP)
### 10.4: VPS Deployment (5 SP)

**Progress: Day 14 End**
- **Cumulative:** 102 SP / 102 SP
-  **SPRINT 2 COMPLETE**

---

## CUMULATIVE PROGRESS

```
SPRINT 1 (Backend):
Days 1-7:  157 SP 

SPRINT 2 (Frontend):
Days 8-14:  102 SP 

DAY 15: Final Testing, Go-Live

TOTAL: 259 SP 
```

---

## RESOURCE ALLOCATION

### Developer: 100% Capacity
- Sprint 1: 22 SP/day  7 days = 157 SP
- Sprint 2: 14.5 SP/day  7 days = 102 SP
- Day 15: Testing + Launch

### Work Schedule
- **Morning (3-4 hours):** Code implementation
- **Midday (1 hour):** Testing
- **Afternoon (2-3 hours):** Documentation + reviews
- **Evening (1-2 hours):** Buffer for debugging

---

## CRITICAL PATH

### Must Complete on Schedule:
1.  Authentication (Day 1-2)  All other features depend on this
2.  Campaign Creation (Day 3)  Prerequisite for sending
3.  Message Delivery (Day 5)  Core business logic
4.  Razorpay (Day 7)  Revenue functionality
5.  Frontend (Days 8-12)  User-facing features
6.  Tests & Deploy (Days 13-14)  Production readiness

### Risk Items:
- Baileys breaks  Web JS fallback must work
- Razorpay integration delays  Sandbox testing needed early
- Frontend complexity  Start campaign builder early (Day 9)

---

## SPRINT METRICS & KPIs

### Sprint 1 Goals:
- [ ] 0 critical bugs in production
- [ ] 99.5%+ message delivery success
- [ ] All APIs fully tested
- [ ] Database optimized
- [ ] Zero downtime deployments

### Sprint 2 Goals:
- [ ] >80% code coverage
- [ ] All UI responsive (mobile/tablet/desktop)
- [ ] <200ms API response time
- [ ] Load test passes (100 concurrent users)
- [ ] Security audit passes

### Launch Criteria (Day 15):
- [ ] All 259 SP completed
- [ ] All tests passing
- [ ] Production deployment successful
- [ ] Monitoring active
- [ ] Customer support ready

