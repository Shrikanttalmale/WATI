# COMPREHENSIVE CODE AUDIT REPORT
## WATI Backend - Data Flow & Dependency Analysis
### December 3, 2025

---

## EXECUTIVE SUMMARY

Comprehensive audit of the WATI backend system covering:
-  Data capture (all INSERT operations)
-  Data storage (Prisma schema and operations)
-  Data retrieval (all SELECT/query operations)
-  Inter-module dependencies
-  Authorization checks
-  Data validation
-  Error handling

**Result: 10 CRITICAL/HIGH SEVERITY ISSUES FOUND**

---

## CRITICAL ISSUES (Fix Immediately)

###  ISSUE #1: MULTIPLE PRISMA CLIENT INSTANCES (Memory Leak)
**Severity:** CRITICAL
**Files Affected:** All service files
**Problem:** Each service creates new PrismaClient() instead of singleton
- authService.ts line 6
- campaignService.ts line 4
- messageService.ts line 6
- billingService.ts line 4
- adminService.ts line 4
- analyticsService.ts line 4
- queueService.ts line 19
- scheduleService.ts line 5
- templateService.ts line 4
- whatsappService.ts line 8
- baileysService.ts line 5
- webJsService.ts line XX
- deliveryPollingService.ts line 5

**Impact:**
- Accumulating database connections
- Connection pool exhaustion
- Memory leaks in long-running processes
- Server crash under load
- Cannot gracefully shutdown

**Fix:** Use singleton PrismaClient (see utils/prismaClient.ts)

---

###  ISSUE #2: UNVALIDATED WEBHOOK ENDPOINT
**Severity:** CRITICAL
**File:** messageRoutes.ts lines 164-210
**Endpoint:** POST /api/messages/webhook/delivery

**Problem:**
```typescript
router.post("/webhook/delivery", async (req: Request, res: Response) => {
  const { messageId, status, phoneNumber, campaignId, timestamp } = req.body;
  
  if (!messageId || !status) {
    return res.status(400).json({ error: "messageId and status required" });
  }
  
  //  NO WEBHOOK SIGNATURE VERIFICATION
  //  NO RATE LIMITING
  //  ACCEPTS ANY campaignId
  
  if (messageId && campaignId) {
    await messageService.updateMessageStatus(campaignId, phoneNumber, messageId, updateData);
  }
});
```

**Attack Vector:**
- External attacker can update ANY message status to ANY value
- Can mark failed messages as delivered
- No verification webhook came from WhatsApp API
- No rate limiting - DOS attack possible

**Fix:** Implement webhook signature validation and rate limiting

---

###  ISSUE #3: MISSING AUTHORIZATION IN MESSAGE STATS
**Severity:** CRITICAL
**File:** messageRoutes.ts line 101
**Endpoint:** GET /api/messages/campaign/:campaignId/stats

**Problem:**
```typescript
router.get("/campaign/:campaignId/stats", authMiddleware, async (req, res) => {
  //  userId not extracted/passed
  //  No authorization check
  const stats = await messageService.getMessageStats(req.params.campaignId);
  // User A can access User B's stats by knowing campaignId!
});
```

**messageService.ts getMessageStats:**
```typescript
async getMessageStats(campaignId: string, userId?: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  
  // userId is OPTIONAL - if not provided, NO CHECK happens!
  if (userId && campaign.userId !== userId) {
    throw new Error("Unauthorized");
  }
  
  return stats; // Returns without authorization!
}
```

**Attack:** User can access any campaign's stats if they know the ID

---

###  ISSUE #4: MISSING SERVICE METHODS
**Severity:** CRITICAL
**Routes that will CRASH when called:**

1. **authRoutes.ts line 49** - calls authService.getUser()
   - Method does NOT exist in authService.ts
   
2. **analyticsRoutes.ts line 49** - calls analyticsService.getBanRiskEvents()
   - Method does NOT exist
   
3. **analyticsRoutes.ts line 60** - calls analyticsService.getAccountSafetyScore()
   - Method does NOT exist
   
4. **billingRoutes.ts line 44** - calls billingService.checkUsageLimit()
   - Method does NOT exist
   
5. **billingRoutes.ts line 58** - calls billingService.getBillingHistory()
   - Method does NOT exist
   
6. **billingRoutes.ts line 71** - calls billingService.createInvoice()
   - Method does NOT exist
   
7. **adminRoutes.ts line 25** - calls adminService.getDashboard()
   - Method does NOT exist
   
8. **adminRoutes.ts line 80** - calls adminService.getAdminActionsLog()
   - Method does NOT exist
   
9. **adminRoutes.ts line 62** - calls adminService.deleteUser()
   - Method does NOT exist

**Result:** These endpoints will throw "X is not a function" errors

---

## HIGH SEVERITY ISSUES

###  ISSUE #5: INCONSISTENT USER ID EXTRACTION
**Severity:** HIGH
**Files Affected:**
- campaignRoutes.ts  uses req.user.userId
- messageRoutes.ts  uses req.user.userId
- templateRoutes.ts  uses (req as any).userId
- analyticsRoutes.ts  uses (req as any).userId
- billingRoutes.ts  uses (req as any).userId
- adminRoutes.ts  uses (req as any).userId || (req as any).user?.id

**Problem:** No consistent pattern for accessing userId

**Risk:** If authMiddleware breaks, undefined userId passed to services

**Fix:** Standardize to req.user.userId with proper TypeScript types

---

###  ISSUE #6: DENORMALIZED CAMPAIGN STATS SYNC ISSUES
**Severity:** HIGH
**Files Affected:**
- Campaign model: sentCount, deliveredCount, failedCount (denormalized fields)
- campaignService.ts: getCampaignStats() queries Message table
- deliveryPollingService.ts: updates Campaign denormalized fields
- messageService.ts: updates Campaign fields

**Problem - Data Divergence:**

Campaign table has:
- totalContacts (int)
- sentCount (int)
- deliveredCount (int)
- failedCount (int)

BUT services query Message table for accuracy:
```typescript
const messages = await prisma.message.groupBy({
  by: ["status"],
  where: { campaignId },
  _count: { id: true },
});
```

**Race Condition Example:**
1. Message created with status='sent'
2. messageService.sendMessage() completes
3. Campaign.sentCount updated
4. User queries stats
5. Later, another process queries and updates stats
6. Numbers don't match

**Impact:** Dashboard shows WRONG numbers

---

###  ISSUE #7: NO PHONE VALIDATION IN addContacts()
**Severity:** HIGH
**File:** campaignService.ts line 67

**Problem:**
```typescript
const createdContacts = await prisma.contact.createMany({
  data: contacts.map((c) => ({
    campaignId,
    userId,
    phone: c.phone, //  No validation
    name: c.name,
    metadata: c.metadata ? JSON.stringify(c.metadata) : null, //  No JSON validation
    tags: c.tags || [],
  })),
  skipDuplicates: true,
});
//  Returns count without checking if all contacts were created
```

**Missing Validations:**
- Phone number format (could be null)
- Phone number uniqueness across system
- Metadata JSON validation before stringify()
- Error if ALL contacts skipped as duplicates

---

###  ISSUE #8: SESSION RESTORATION INCOMPLETE
**Severity:** HIGH
**File:** baileysService.ts

**Problem:**
```typescript
// Session data saved in database but NOT used on restore
async restoreSessions() {
  const sessions = await prisma.session.findMany({
    where: { isActive: true },
  });
  
  for (const session of sessions) {
    //  Creates NEW session instead of loading saved sessionData
    await this.initializeSession(session.userId);
  }
}
```

**Issue:** 
- sessionData stored in DB but never loaded
- Every restart generates new QR codes
- Session persistence is ineffective

---

## MEDIUM SEVERITY ISSUES

###  ISSUE #9: CRON EXPRESSION GENERATION BUG
**Severity:** MEDIUM
**File:** scheduleService.ts dateToCron() line 43

**Problem:**
```typescript
private dateToCron(date: Date): string {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;
  const dayOfWeek = date.getDay();
  
  return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  //  If date is in past, cron never executes
  //  Doesn't repeat annually - will miss future years
}
```

**Example:** Schedule for Jan 1, 2024 but it's Jan 2, 2024 = NEVER EXECUTES

---

###  ISSUE #10: MISSING CONTACT UNIQUENESS VALIDATION
**Severity:** MEDIUM
**File:** Schema and addContacts()

**Problem:**
- Contact uniqueness is only (campaignId, phone)
- User can have duplicate phone across campaigns
- No global deduplication

---

## DATA FLOW VALIDATION

###  CORRECT FLOWS

**Campaign Creation Flow:**
```
POST /campaigns  campaignService.createCampaign()
   Saves: Campaign(userId, status='draft')
   Data captured with proper user association
```

**Message Sending Flow:**
```
POST /messages/send  messageService.sendMessage()
   Tries baileysService [primary]
   Falls back to webJsService [if fails]
   Fallback mechanism correct
```

**Template Management Flow:**
```
POST /templates  templateService.createTemplate(userId, ...)
GET /templates  WHERE (userId OR isDefault)
   User isolation correct
```

###  BROKEN FLOWS

**User Profile Retrieval:**
```
GET /auth/profile  authService.getUser() 
   METHOD DOESN'T EXIST
```

**Analytics Dashboard:**
```
GET /api/analytics/delivery-dashboard
   Fetches data correctly
   Uses denormalized fields that may be stale
```

---

## RECOMMENDED FIXES (Priority Order)

### IMMEDIATE (This Sprint)
1.  Create singleton PrismaClient in utils/prismaClient.ts
2.  Update all services to use singleton
3.  Implement webhook signature validation
4.  Add authorization checks to sensitive endpoints
5.  Implement missing service methods

### NEXT SPRINT
6. Standardize userId extraction pattern
7. Add phone validation in addContacts()
8. Fix session restoration in baileysService
9. Remove or sync denormalized campaign stats

### BEFORE PRODUCTION
10. Add comprehensive error handling
11. Implement webhook rate limiting
12. Add transaction support
13. Add input validation everywhere

---

## AUDIT SIGN-OFF

- [x] Data capture analysis
- [x] Data storage analysis
- [x] Data retrieval analysis
- [x] Dependency analysis
- [x] Authorization verification
- [x] Missing implementations identified
- [x] Race conditions identified
- [x] Error handling review
- [x] Data validation review

**Status:** READY FOR REMEDIATION

