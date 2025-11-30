# BROADCASTER: PRODUCT REQUIREMENTS DOCUMENT

## EXECUTIVE SUMMARY

**Product Name:** Broadcaster
**Tagline:** The fastest, easiest way to broadcast WhatsApp messages at 1/5th the cost
**Target Users:** Solo entrepreneurs, SMBs, agencies, e-commerce businesses
**Launch Timeline:** 15 days (MVP)
**Key Differentiators:** 
- Dead simple UI (get first message out in < 2 minutes)
- Blazing fast setup (single QR scan, auto-ready)
- 5-7x cheaper than WATI/Interakt
- Multi-language support (Hindi, Marathi, English)
- Reliable (99.5%+ delivery via Baileys + Web JS dual integration)

---

## PROBLEM STATEMENT

### What Problem Are We Solving?

**Current Market Pain Points:**
1. **High Cost Barrier** - WATI (₹4,000+/month), Interakt (₹3,000+/month), Twilio (₹10,000+/month)
   - Problem: SMBs & solo founders can't afford bulk messaging
   - Our Solution: ₹299-₹999/month (5-7x cheaper)

2. **Complex Setup** - Competitors require technical knowledge
   - Problem: User needs to understand APIs, webhooks, integrations
   - Our Solution: Single QR code scan, fully automated setup (< 2 minutes)

3. **Slow Time-to-Value** - Days to send first campaign
   - Problem: Onboarding flow is confusing, manual configuration required
   - Our Solution: Sign up  Scan QR  Send message in 60 seconds

4. **Unreliable Delivery** - Single integration method fails without notice
   - Problem: User doesn't know if messages are reaching customers
   - Our Solution: Dual-method failover (99.5% reliability) with real-time feedback

5. **Language Barrier** - No multi-language support in India
   - Problem: Businesses in Tier 2/3 cities can't use English-only platforms
   - Our Solution: Hindi, Marathi, English from Day 1

### Target User Personas

**Persona 1: Rahul (Solo Entrepreneur)**
- Age: 28, runs local e-commerce business
- Current pain: Sending ~100 messages/day manually via WhatsApp
- Wants: Bulk messaging at <₹500/month
- Success metric: Send 500 messages in 5 minutes

**Persona 2: Priya (SMB Owner)**
- Age: 35, beauty salon with 200+ regular customers
- Current pain: Using WATI (₹4K/month) but finds it overcomplicated
- Wants: Simple, affordable, in Hindi
- Success metric: Send weekly promotional messages without confusion

**Persona 3: Amit (Agency Manager)**
- Age: 32, digital marketing agency with 15+ clients
- Current pain: Managing multiple WATI/Interakt accounts (expensive)
- Wants: Multi-account support, bulk pricing, API for automation
- Success metric: Manage 20 client accounts from one dashboard

**Persona 4: Zara (E-commerce Manager)**
- Age: 26, manages customer communication for online store
- Current pain: Manual follow-ups, no order status notifications
- Wants: Templates, easy integration, reporting
- Success metric: Send order confirmations + follow-ups automatically

---

## PRODUCT VISION

### Vision Statement
"Make WhatsApp messaging accessible to every business in India, regardless of size or budget."

### Mission
Broadcaster is the fastest, cheapest, easiest way to send bulk WhatsApp messages. We remove complexity, reduce cost, and ensure reliability—so businesses can focus on growing, not on managing integrations.

### Success Criteria (First 90 Days)
1. **Ease of Use** - 95% of users send first message within 2 minutes of signup
2. **Retention** - 70% of users who send 1 campaign send a 2nd campaign within 7 days
3. **Reliability** - 99.5%+ message delivery rate
4. **Pricing** - Average customer acquisition cost < ₹500, LTV > ₹15,000
5. **Growth** - 100 paying customers by Month 3

---

## CORE FEATURES (MVP - 15 Days)

### Tier 1: Critical (Day 1-5)

**1. User Authentication & Onboarding**
- Instant signup (email/phone only)
- 7-day free trial (100 messages, no credit card)
- WhatsApp QR code login (single step)
- Auto Web JS initialization (background)
- Session management (30-day auto-refresh)

**2. Campaign Builder**
- Send single message to single number (1-click)
- Send bulk to contact list
- Upload CSV/Excel with phone numbers
- De-duplicate phone numbers automatically
- Preview message before sending
- Cancel sending in-progress (safety)

**3. Message Types**
- Plain text messages
- Emoji support
- Pre-built templates (10 common scenarios)
  - Order confirmation
  - Delivery update
  - Reminder/Follow-up
  - Promotional offer
  - Survey/Feedback request
  - Booking confirmation
  - Password reset
  - Welcome message
  - Discount code
  - Payment link

**4. Contact Management**
- Upload/import contacts (CSV/Excel)
- View contact list (paginated)
- Export contacts
- Auto phone number formatting (with country code)
- De-duplication on import

**5. Basic Analytics**
- Messages sent (total count)
- Messages delivered (count + %)
- Messages failed (count + %)
- Delivery status per message
- Time-series chart (messages/hour)
- Campaign performance (side-by-side comparison)

**6. Billing & Pricing Plans**
- Starter: ₹299/month (1,000 messages/month)
- Pro: ₹599/month (5,000 messages/month)
- Business: ₹999/month (20,000 messages/month)
- Pay-as-you-go: ₹0.30 per message (for spikes)
- Trial: 7 days free, 100 messages, no credit card

**7. Admin Panel**
- View all users (name, email, plan, status)
- Manual plan upgrades/changes
- View billing summary
- Monitor system health (delivery rate, uptime)

### Tier 2: Important (Day 6-10)

**8. Campaign Scheduling**
- Send now (immediate)
- Schedule for later (date + time picker)
- Recurring campaigns (daily/weekly/monthly)
- Time zone support (IST default)
- Timezone selector per campaign

**9. Anti-Ban Protection**
- Delay options (3 presets)
  - Fast: 2-5 second delays (5% ban risk, ~100 min for 1K)
  - Balanced: 5-10 second delays (2% ban risk, ~200 min for 1K)
  - Safe: 10-30 second delays (1% ban risk, ~400 min for 1K)
- Auto batch pausing (100 messages  30s pause)
- Daily caps (3,000 messages/day default)
- Safety score (1-10 scale, real-time)

**10. Multi-Language Support**
- UI language toggle (Hindi, Marathi, English)
- Message language support (send in any language)
- Auto-translate support (future, not MVP)

**11. Support & Help**
- In-app FAQ (top 20 questions)
- Video tutorials (3-5 min each)
  - How to send first message
  - How to upload contacts
  - How to schedule campaigns
  - How to understand delivery status
  - How to avoid bans
- Discord community
- Email support (24-48 hour response)

**12. Dashboard Overview**
- Key metrics (messages today, delivery rate, plan usage)
- Recent campaigns (last 5)
- Quick actions (send new, upload contacts, view analytics)
- Account status (trial/active/suspended)

### Tier 3: Nice-to-Have (Day 11-15)

**13. Multi-Account Support**
- Primary account + 2-3 backup accounts
- Account switching (dropdown)
- Auto-failover if primary account fails
- Load balancing (distribute messages across accounts)

**14. Message Templates**
- Create custom template with placeholders
- Save template for reuse
- Template library (shared + personal)
- Bulk send using template
- Preview with sample data

**15. Contact Groups**
- Create groups (e.g., "VIP customers", "Recent buyers")
- Add/remove contacts from groups
- Send to group (vs full list)
- Group-based segmentation

**16. Rate Limiting**
- Per-account limits (display to user)
- Soft limits (warning at 80%)
- Hard limits (block at 100%)
- Upgrade prompt when limit reached

---

## USER WORKFLOWS

### Workflow 1: First-Time User (Easiest Path)

```
1. Land on homepage
2. Click "Get Started" (free trial)
3. Enter email + password (2 fields)
4. Verify email (instant or skip for trial)
5. Click "Connect WhatsApp"
6. Scan QR code with phone
7. Phone shows "Connected "
8. Dashboard loads (pre-populated with tutorial)
9. Click "Send Test Message"
10. Enter phone number + message
11. Click "Send"
12. See "Message delivered " in real-time
13. Done! First campaign complete.

Total time: < 2 minutes
Friction points: 0 (single click per step)
```

### Workflow 2: Bulk Campaign (Common Path)

```
1. Dashboard  "New Campaign"
2. Enter campaign name
3. Upload CSV (phone numbers)
   - Auto-formats numbers
   - Shows duplicates detected
4. Choose message type:
   - Paste message or
   - Select template
5. Pick delay option:
   - Fast (2-5s)
   - Balanced (5-10s) [default]
   - Safe (10-30s)
6. Set schedule:
   - Send now or
   - Schedule for later
7. Preview message
8. Confirm and send
9. See real-time progress bar
10. Get summary (sent/delivered/failed)
11. Access analytics

Total time: < 3 minutes
Friction points: Minimal (all pre-filled defaults)
```

### Workflow 3: Scheduled Campaign

```
1. Dashboard  "New Campaign"
2. Follow steps 2-5 from Workflow 2
3. Click "Schedule for later"
4. Pick date/time
5. Set repeat (daily/weekly/monthly) [optional]
6. Confirm
7. See scheduled campaign in list
8. Auto-sends at scheduled time
9. Get notification when sent

Total time: 2 minutes
Automation: Full (no manual intervention needed)
```

---

## TECHNICAL REQUIREMENTS

### Message Delivery Methods

**Primary Method: Baileys (95% success rate)**
- Node.js WhatsApp Web JS library
- No login required after first scan
- Session expires every 30 days (auto-refresh)
- Supports text, emojis, media (Phase 2)

**Fallback Method: Web JS with Puppeteer (99% success rate)**
- Automatic browser automation
- Kicks in when Baileys fails
- Auto-retry every 5 minutes
- Graceful degradation (Baileys failure doesn't block Web JS)

**Combined Reliability: 99.5%**
- Auto-switch based on hourly success rate
- If Baileys < 95% for 100 messages  use Web JS
- If Web JS < 99%  alert admin

### Infrastructure

**Frontend:**
- React + Tailwind CSS
- Vercel hosting (free tier)
- Responsive (mobile-first)
- Multi-language (i18next)
- Theme switching (light/dark)

**Backend:**
- Node.js + Express
- Railway (₹400/month)
- PostgreSQL (₹150/month)
- Redis for caching (₹500/month at scale)

**Message Queue:**
- Bull + Upstash Redis
- Handle 30 msgs/min (WhatsApp's hard limit)
- Retry logic with exponential backoff
- Dead letter queue for failures

**Database Schema:**
- users (id, email, phone, plan, status, trial_expires)
- whatsapp_sessions (account_id, session_token, qr_code, expires_at, method)
- campaigns (id, user_id, name, status, messages_count, created_at)
- messages (id, campaign_id, to, body, status, delivery_method, delivered_at)
- templates (id, user_id, name, body, category)
- contacts (id, user_id, phone, name, group_id)
- billing (id, user_id, plan, amount, renewal_date, status)

**Monitoring:**
- Sentry (error tracking)
- Custom logging (delivery status)
- Uptime monitoring (ping every 5 min)
- Alert thresholds (ban rate > 5%, uptime < 99%)

---

## ACCEPTANCE CRITERIA

### Feature 1: User Authentication
- [ ] User can sign up with email/password
- [ ] User can verify email (instant link)
- [ ] User can log in
- [ ] User can start 7-day free trial without payment method
- [ ] Trial expires after 7 days
- [ ] Session persists for 30 days
- [ ] User can log out

### Feature 2: WhatsApp QR Login
- [ ] QR code displays on first login
- [ ] User can scan with phone
- [ ] Session saves after successful scan
- [ ] Phone shows "Connected "
- [ ] Auto-refresh every 30 days
- [ ] User notified when session expires
- [ ] User can initiate manual refresh

### Feature 3: Send Single Message
- [ ] User can enter phone number
- [ ] User can enter message text
- [ ] User can preview message
- [ ] User can send with 1 click
- [ ] Message appears in delivery queue within 1 second
- [ ] User sees real-time status (pending  sent  delivered)
- [ ] Failure message shown if message fails

### Feature 4: Bulk Send
- [ ] User can upload CSV with phone numbers
- [ ] CSV parser auto-formats numbers
- [ ] Duplicates detected and shown
- [ ] User can proceed or edit
- [ ] Campaign sends to all contacts
- [ ] Real-time progress bar shows count
- [ ] Summary shown after completion

### Feature 5: Templates
- [ ] User can see 10 pre-built templates
- [ ] User can select template
- [ ] Template body fills message field
- [ ] User can customize before sending
- [ ] Customized version doesn't overwrite original

### Feature 6: Anti-Ban Protection
- [ ] Three delay options available (Fast/Balanced/Safe)
- [ ] Delay option applies during send
- [ ] Messages pause after 100-message batches
- [ ] Daily cap (3,000 messages) enforced
- [ ] Safety score displays (1-10)
- [ ] Ban risk % shown per delay option

### Feature 7: Analytics
- [ ] Dashboard shows key metrics (today's total, delivery rate)
- [ ] Time-series chart shows messages/hour
- [ ] Campaign list shows status (pending/sent/delivered/failed)
- [ ] Click on campaign shows detailed stats
- [ ] Export analytics (CSV format) available

### Feature 8: Billing & Plans
- [ ] Trial users see "Upgrade" button at limit
- [ ] Upgrade flow shows 3 plans + pricing
- [ ] Plan calculator shows messages included
- [ ] Payment via Razorpay works
- [ ] Invoice emailed after purchase
- [ ] Plan upgrades take effect immediately
- [ ] Usage tracked and enforced per plan

### Feature 9: Dashboard
- [ ] All key elements visible at a glance
- [ ] Recent campaigns show 5 most recent
- [ ] Quick action buttons (Send, Upload, Analytics)
- [ ] Account status clear (trial/active/suspended)
- [ ] No more than 3 clicks to start campaign

### Feature 10: Multi-Language UI
- [ ] Language toggle in top-right corner
- [ ] All text translates to selected language
- [ ] Choice persists across sessions
- [ ] Hindi and Marathi fonts render correctly
- [ ] No UI elements break with translation

---

## NON-FUNCTIONAL REQUIREMENTS

### Performance
- Page load time: < 2 seconds
- Message send latency: < 1 second (from click to queue)
- Bulk send: 30 messages/minute (WhatsApp's hard limit)
- Real-time status updates: < 2 second latency
- Dashboard load: < 1 second

### Reliability
- Uptime: 99.5% (target)
- Message delivery: 99.5% (dual method)
- Database: 99.99% availability (managed service)
- Auto-failover time: < 5 minutes

### Security
- HTTPS for all traffic (SSL/TLS)
- JWT for API authentication
- Password hashing (bcrypt)
- CORS enabled for trusted origins only
- No sensitive data in logs
- Session timeout after 30 days inactivity

### Compliance
- TRAI DND compliance (₹5K/month API)
- Terms of Service (WhatsApp ToS adherence)
- Privacy Policy (data retention, deletion)
- GDPR-lite (no EU data yet, India only)
- Audit logs for admin actions

---

## LAUNCH STRATEGY (15 Days)

### Week 1 (Days 1-7)
- Day 1-2: Auth + QR login
- Day 2-3: Single message send
- Day 3-4: Bulk send (CSV upload)
- Day 4-5: Templates + anti-ban
- Day 5-6: Analytics dashboard
- Day 6-7: Billing integration

### Week 2 (Days 8-14)
- Day 8-9: Multi-language UI
- Day 9-10: Admin panel
- Day 10-11: Help + FAQ
- Day 11-12: Testing + bug fixes
- Day 12-13: Performance optimization
- Day 13-14: Security audit

### Day 15
- Deploy to production
- Enable public signup (limited capacity)
- Monitor 24/7 for critical issues

---

## PRICING STRATEGY

### Plans (₹/month)

**Starter: ₹299**
- 1,000 messages/month (~33/day)
- Basic analytics
- Support: Email (72h response)
- Target: Solo entrepreneurs, small shops

**Pro: ₹599**
- 5,000 messages/month (~166/day)
- Advanced analytics (charts, exports)
- Templates + scheduling
- Support: Email (24h response)
- Target: SMBs, small agencies

**Business: ₹999**
- 20,000 messages/month (~666/day)
- All Pro features
- Multi-account support (up to 3)
- API access (Phase 2)
- Support: Email (12h response) + Discord
- Target: Agencies, large e-commerce

**Pay-as-You-Go: ₹0.30/message**
- No monthly commitment
- For one-off users or spikes
- Useful during seasonal campaigns

**Trial: Free**
- 7 days
- 100 messages
- All features unlocked
- No credit card required

### Pricing Rationale
- 5-7x cheaper than WATI (₹4K+/month)
- Covers infrastructure costs + margin
- Simple tiering (not too many options)
- Trial removes signup friction

---

## SUCCESS METRICS (90-Day Target)

### User Metrics
- **Signups:** 500+ (target: 100 paid, 400 trial)
- **Trial-to-Paid Conversion:** > 20% (100 customers)
- **Daily Active Users:** > 50 (sending at least 1 message)
- **Message Retention:** > 70% send 2+ campaigns within 7 days

### Product Metrics
- **Ease of Use:** 95% send first message < 2 minutes
- **Time-to-Value:** Average 90 seconds signup  first send
- **Feature Usage:** 80% use templates, 60% use scheduling, 40% use anti-ban
- **Error Rate:** < 0.5% (failed messages)

### Business Metrics
- **MRR:** ₹60K (100 customers  ₹599 avg)
- **CAC:** < ₹500 (cost per customer acquisition)
- **LTV:** > ₹15,000 (100 customers  24 month lifetime)
- **Churn:** < 5% (monthly)
- **Gross Margin:** > 85%

### Reliability Metrics
- **Delivery Rate:** > 99.5% (combined Baileys + Web JS)
- **Uptime:** > 99.5%
- **Ban Rate:** < 1% (with Safe delay option)
- **Average Response Time:** < 100ms (API)

---

## ROADMAP (Future Phases)

### Phase 2 (Month 2-3)
- Media messages (images, documents, audio)
- Webhook integration (incoming messages)
- API for developers
- Contact segmentation & groups

### Phase 3 (Month 3-4)
- WhatsApp Business API integration
- Broadcast lists
- Chatbot building
- CRM integration (Shopify, WooCommerce)

### Phase 4 (Month 4-6)
- Official WhatsApp API migration (Baileys  official)
- Advanced analytics (heatmaps, A/B testing)
- Email integration
- SMS gateway (backup channel)

---

## RISKS & MITIGATIONS

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| WhatsApp blocks Baileys | Medium | Critical | Official API Phase 2 ready, multi-account failover |
| User confusion (too many options) | High | Medium | Simplify to 3 core choices, hide advanced options |
| Delivery failures | Medium | Critical | Dual-method failover, real-time status updates |
| Ban wave affecting customers | Medium | High | Clear anti-ban guidelines, safety score feedback |
| Competitors copy pricing | High | Low | First-mover advantage + brand loyalty |
| Payment failures | Low | Low | Razorpay handles most errors, manual retry |

---

## GLOSSARY

- **Baileys:** Node.js WhatsApp Web JS library for sending messages
- **Web JS:** Browser automation tool (Puppeteer) for backup delivery
- **Failover:** Automatic switch to backup method when primary fails
- **QR Code:** Login method via WhatsApp Web
- **Session:** User's WhatsApp account authentication (30-day life)
- **Campaign:** Single bulk send to multiple contacts
- **Template:** Pre-written message for reuse
- **Ban Risk:** % chance WhatsApp temporarily blocks an account
- **Delivery:** Message reached WhatsApp servers
- **MRR:** Monthly Recurring Revenue

---

## SIGN-OFF

**Product Manager:** [Your Name]
**Version:** 1.0
**Date:** November 30, 2025
**Status:** Ready for Development
**Next Review:** After 15-day MVP launch

---

## APPENDIX A: USER FLOW DIAGRAMS

[Simplified text descriptions provided above]
[Detailed Figma diagrams to be created in design phase]

## APPENDIX B: COMPETITIVE FEATURE MATRIX

| Feature | Broadcaster | WATI | Interakt | Twilio |
|---------|-------------|------|----------|--------|
| Price | ₹299 | ₹4,000 | ₹3,000 | ₹10,000+ |
| Setup time | 2 min | 30 min | 20 min | 1 hour |
| QR login | Yes | No | No | API-only |
| Templates | 10+ | 50+ | 30+ | Custom |
| Scheduling | Yes | Yes | Yes | Yes |
| Multi-language | Yes | English | English | English |
| Analytics | Basic | Advanced | Advanced | Advanced |
| Support | Email | Email + Chat | Email + Chat | Dedicated |
| Target | SMB | Enterprise | Mid-market | Enterprise |

