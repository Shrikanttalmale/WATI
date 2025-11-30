# MVP Feature Specification - 60 Day Build Plan

## Core Principle
Ship ONLY what's needed to send bulk WhatsApp messages and collect payment.
Everything else = distraction.

---

## Feature Tiers

### TIER 1: Launch Blockers (Week 1-4)
These MUST work or the product doesn't launch.

#### 1. User Authentication
- **Signup**: Email + password
- **Login**: Email + password
- **Password Reset**: Email link
- **Session Management**: JWT tokens, 30-day expiry
- **Google Login**: Optional (nice-to-have, skip if time-constrained)

#### 2. WhatsApp Account Connection
- **QR Code Auth**: User scans QR  phone authenticates
- **Session Persistence**: Store session, reuse for 30 days (no daily QR scan)
- **Account Management**: Show connected phone number
- **Disconnect**: Allow user to disconnect and connect different number

#### 3. Bulk Message Sending
- **CSV Upload**: Upload file with phone numbers + message text
- **Validation**: Check phone format (Indian: 10 digits)
- **Send Messages**: Queue and send via Baileys
- **Rate Limiting**: Max 30 msgs/minute per account (avoid ban)
- **Delivery Tracking**: Sent/Delivered/Read status
- **Real-time Progress**: Show "3/100 sent" during sending

#### 4. Message Templates
- **Pre-built Templates**: 5-10 common templates (welcome, promo, reminder)
- **Custom Templates**: Users can create custom templates
- **Template Variables**: Support {{first_name}}, {{phone}}, etc.
- **Preview**: Show how message looks before sending

#### 5. Billing & Plans
- **Plan Selection**: Free, Starter (₹199), Growth (₹499), Pro (₹999)
- **Usage Tracking**: Show "150/1000 messages used this month"
- **Auto-renewal**: Automatic subscription renewal
- **Invoice Generation**: PDF invoice for each billing cycle
- **Payment Gateway**: Razorpay or PayU integration

#### 6. Admin Dashboard
- **User Management**: View all users, see their usage
- **Plan Management**: Create/edit plans, set message limits
- **Analytics**: Total messages sent, active users, MRR
- **Billing Dashboard**: See all payments, refunds

#### 7. Multi-language UI
- **Language Toggle**: English  Hindi (at minimum)
- **Translations**: All UI in English + Hindi
- **Later**: Tamil, Telugu, Marathi (v1.1)

---

### TIER 2: Core Usability (Week 5-7)
These make the product feel polished and usable.

#### 8. Contact Management
- **Import Contacts**: CSV with name, phone, metadata
- **View Contacts**: List of all imported contacts
- **Export Contacts**: Download as CSV
- **Tag/Segment**: Basic grouping (e.g., "customers", "leads")
- **Delete Contacts**: Bulk delete

#### 9. Send History
- **Campaign List**: See all previous messages sent
- **Campaign Details**: Who received, delivery status, timestamp
- **Resend Campaign**: Ability to resend to failed recipients
- **Export Results**: Download CSV of results

#### 10. Dashboard & Analytics
- **Home Dashboard**: Key metrics at a glance
  - Messages sent today/this month
  - Active users
  - Recent campaigns
- **Message Stats**: Sent/Delivered/Read breakdown
- **Daily/Monthly Charts**: Visual trend lines

#### 11. Settings & Account
- **Profile**: Edit name, email
- **Change Password**: User can update password
- **Notification Preferences**: Email on campaign completion (optional)
- **Delete Account**: User can delete account + all data

#### 12. Onboarding Flow
- **Step 1**: Sign up
- **Step 2**: Connect WhatsApp (QR scan)
- **Step 3**: Send first test message
- **Step 4**: Choose plan
- **Step 5**: Add payment method
- Goal: Complete in <5 minutes

---

### TIER 3: Polish & Edge Cases (Week 8-9)
These prevent user complaints.

#### 13. Error Handling & Validation
- **Invalid Phone Numbers**: Show clear error, skip row
- **Rate Limit Hit**: Queue remaining messages, show status
- **Account Ban**: Detect and alert user
- **Session Expired**: Auto re-authenticate or clear prompt
- **Network Errors**: Retry logic with exponential backoff

#### 14. Data Security & Privacy
- **HTTPS Only**: All traffic encrypted
- **Password Hashing**: bcrypt with salt
- **Session Tokens**: Secure JWT, HTTP-only cookies
- **GDPR/Privacy**: Terms of Service + Privacy Policy
- **Data Deletion**: Securely delete user data on account deletion

#### 15. Help & Documentation
- **FAQ Page**: 10-15 common questions
- **Getting Started Guide**: PDF or interactive tour
- **Contact Support**: Email link to support
- **Video Tutorials**: 2-3 short videos (Hindi + English)

#### 16. Mobile-Responsive UI
- **Responsive Design**: Works on mobile (80% feature parity)
- **Mobile Optimizations**: Touch-friendly buttons, readable text
- **Mobile Messaging**: CSV upload works on mobile browsers

---

### TIER 4: NOT in MVP (Delete These Ideas)
Do NOT build these in first 60 days.

 Omnichannel (Facebook, Instagram, SMS)
 AI/Chatbots
 CRM features (contact fields, pipelines)
 Automation workflows (scheduled sends, conditional logic)
 Mobile app (web-only, responsive)
 Advanced analytics (cohort analysis, funnels)
 API for third-party integrations
 White-label / reseller portal
 Two-factor authentication
 Team/multi-user accounts
 A/B testing
 Group message scheduling

**These are all v1.1+ features. Focus on core MVP.**

---

## Implementation Timeline (60 Days)

### Week 1-2: Setup & Core Architecture
**Time Allocation: 80 hours**

- [ ] GitHub repo setup + CI/CD
- [ ] Database schema (users, messages, contacts, billing)
- [ ] Baileys integration + QR code flow
- [ ] JWT authentication + login system
- [ ] Basic React skeleton + routing

**Output**: Developers can sign up, log in, see dashboard

### Week 3-4: WhatsApp Integration & Messaging
**Time Allocation: 80 hours**

- [ ] WhatsApp connection (QR code)
- [ ] CSV upload + validation
- [ ] Message queue (Bull + Redis)
- [ ] Send messages via Baileys
- [ ] Delivery status tracking
- [ ] Real-time progress UI

**Output**: User can upload CSV and send 100 messages

### Week 5-6: Billing & Admin
**Time Allocation: 80 hours**

- [ ] Plan management
- [ ] Razorpay/PayU integration
- [ ] Usage tracking
- [ ] Invoice generation
- [ ] Admin dashboard
- [ ] Multi-language UI (English/Hindi)

**Output**: Users can choose plan, pay, see usage

### Week 7: Contact Management & History
**Time Allocation: 40 hours**

- [ ] Contact import/export
- [ ] Contact tagging
- [ ] Campaign history
- [ ] Resend failed messages
- [ ] Basic analytics dashboard

**Output**: Users can manage contacts and view past campaigns

### Week 8: Polish & Edge Cases
**Time Allocation: 40 hours**

- [ ] Error handling
- [ ] Rate limiting
- [ ] Data validation
- [ ] Session expiry handling
- [ ] Mobile responsiveness

**Output**: No broken user flows, works on mobile

### Week 9: Documentation & Testing
**Time Allocation: 40 hours**

- [ ] Security audit (OWASP top 10)
- [ ] Load testing (1K concurrent users)
- [ ] FAQ + Getting started guide
- [ ] Video tutorials (2x 5-min videos)
- [ ] Terms of Service + Privacy Policy

**Output**: Safe to launch publicly

### Week 10: Deployment & Launch
**Time Allocation: 20 hours**

- [ ] Deploy to production VPS
- [ ] SSL setup + domain config
- [ ] Backup & monitoring
- [ ] ProductHunt launch prep
- [ ] Twitter/Reddit launch posts

**Output**: Live and accepting users

**Total: 380 hours (~10 dev months if solo, ~4 weeks if 2 devs)**

---

## Database Schema (Core Tables)

`sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  language VARCHAR(10) DEFAULT 'en',
  plan_id UUID REFERENCES plans(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- WhatsApp Sessions
CREATE TABLE whatsapp_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20),
  session_data TEXT,
  last_auth_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20),
  name VARCHAR(255),
  tags VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20),
  message_text TEXT,
  status VARCHAR(50) DEFAULT 'queued', -- queued, sent, delivered, read, failed
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  campaign_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Plans
CREATE TABLE plans (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  monthly_limit INT,
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'INR',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  payment_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired
  renewal_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'paid',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
`

---

## API Endpoints (Quick Reference)

### Auth
- POST /api/auth/signup - Create account
- POST /api/auth/login - Login
- POST /api/auth/logout - Logout
- POST /api/auth/reset-password - Password reset

### WhatsApp
- GET /api/whatsapp/qr - Get QR code
- POST /api/whatsapp/connect - Confirm connection
- GET /api/whatsapp/status - Check if connected
- POST /api/whatsapp/disconnect - Disconnect

### Messages
- POST /api/messages/send - Send bulk messages (CSV)
- GET /api/messages/history - Get past campaigns
- GET /api/messages/stats - Get analytics
- POST /api/messages/resend - Resend to failed recipients

### Contacts
- POST /api/contacts/import - Upload CSV
- GET /api/contacts/list - List all contacts
- POST /api/contacts/delete - Delete contact
- POST /api/contacts/export - Export as CSV

### Billing
- GET /api/plans - List all plans
- POST /api/billing/subscribe - Subscribe to plan
- GET /api/billing/usage - Current usage
- GET /api/invoices - List invoices

### Admin
- GET /api/admin/users - All users
- GET /api/admin/analytics - Platform analytics
- POST /api/admin/plans - Create/edit plans

---

## Frontend Screens (10 Total)

### Public Pages
1. **Landing** - Description, pricing, CTA
2. **Login/Signup** - Auth form

### Authenticated Pages
3. **Dashboard** - Overview, stats
4. **Connect WhatsApp** - QR code, instructions
5. **Send Messages** - CSV upload, preview, send
6. **Message History** - Past campaigns, resend
7. **Contacts** - Import, list, export
8. **Plans & Billing** - Choose plan, payment, invoices
9. **Settings** - Profile, password, language
10. **Admin Dashboard** - Users, analytics, plans (admin only)

---

## Success Criteria for MVP

- [ ] **Usability**: New user can send first message in <5 minutes
- [ ] **Reliability**: 99.9% message delivery rate
- [ ] **Performance**: Page load <2 seconds, message send <1 second
- [ ] **Security**: No data breaches, encrypted passwords, HTTPS
- [ ] **Profitability**: Positive margin from first paying customer
- [ ] **Scalability**: Handles 1K concurrent users, 100K msgs/hour

---

## What NOT to Do in MVP

 Don't optimize prematurely (96% of code is wasted)
 Don't add features you don't use (scope creep killer)
 Don't build for 1M users (build for 100, scale later)
 Don't over-engineer (KISS principle)
 Don't wait for perfection (ship fast, iterate)
 Don't build mobile app (responsive web is enough)
 Don't integrate 10 payment gateways (just Razorpay)
 Don't support omnichannel (WhatsApp only)
 Don't build multi-user teams (solo users only)
 Don't pre-optimize database (add indexes when needed)

---

## Launch Day Checklist

- [ ] All Tier 1 features working (no broken flows)
- [ ] No critical bugs (errors don't crash app)
- [ ] SSL certificate installed + HTTPS working
- [ ] Database backups automated
- [ ] Error tracking (Sentry) configured
- [ ] Payment processing tested (at least 5 test transactions)
- [ ] WhatsApp QR flow tested on multiple browsers
- [ ] Admin can create/edit plans
- [ ] Email verification working
- [ ] FAQ page live
- [ ] ProductHunt post scheduled
- [ ] Twitter/Reddit launch posts ready

---

## Summary: What Gets Built

**CORE**: Authentication, WhatsApp connect, bulk messaging, billing
**SECONDARY**: Contacts, history, analytics, multi-language
**POLISH**: Error handling, mobile responsiveness, docs
**NOT**: CRM, omnichannel, workflows, APIs, teams, mobile app

**Result**: Simple, profitable, ready to scale.

Ship Week 10. Launch Week 11. Profit immediately.
