# UPDATES TO UI/UX SPECIFICATION

## NEW FEATURES ADDED

### 1. TRIAL PLAN
- Free 7-day trial (100 msgs/month)
- No credit card required
- Auto-converts to Free plan after 7 days (if user doesn't subscribe)
- Users can upgrade anytime during trial

### 2. THEME SWITCHING
- Light mode (default)
- Dark mode
- Toggle in navbar
- Settings persist in localStorage
- Available in all languages (Hindi, Marathi, English)

### 3. MULTI-ACCOUNT SUPPORT (In One Login)
Users can add multiple WhatsApp accounts:
- Primary account (main WhatsApp number)
- Backup accounts (2-3 additional numbers per user)
- Load balancing: System auto-distributes messages across accounts
- Account rotation: If one account hits rate limit, switch to next

### 4. ADMIN PLAN MANAGEMENT
Admins can:
- Create custom plans (not just Free/Starter/Growth/Pro)
- Modify message limits for any user
- Change pricing per user
- Set trial period duration
- Apply manual overrides

---

## 3. MULTI-ACCOUNT MANAGEMENT (NEW PAGE)

\\\

  Accounts        [Add Account]                  

                                                   
  YOUR WHATSAPP ACCOUNTS:                          
                                                   
  1. PRIMARY ACCOUNT                              
          
     Number: 9876543210                           
     Name: Shrikant Personal                      
     Status:  Active                             
     Added: Nov 15, 2025                          
     Messages Used Today: 45 / 3,000              
                                                   
     [Edit] [Make Backup] [Remove] [Test]         
                                                   
     
                                                   
  2. BACKUP ACCOUNT 1                             
          
     Number: 9876543211                           
     Name: Shrikant Backup 1                      
     Status:  Active                             
     Added: Nov 20, 2025                          
     Messages Used Today: 23 / 3,000              
                                                   
     [Edit] [Make Primary] [Remove] [Test]        
                                                   
     
                                                   
  AUTO-DISTRIBUTION ENABLED:                      
   Spread messages across accounts               
   Rotate if rate limit reached                  
  Daily Limit per Account: [3000 msgs]            
                                                   
   You can add 1 more backup account             
     (Total 3 accounts per plan)                  
                                                   

\\\

### Add New Account (QR Code Flow)
\\\

  Accounts                    [Add Account]       

                                                   
  NAME FOR THIS ACCOUNT:                          
  [My Backup Account_____________]                
                                                   
  Scan QR Code with Phone:                        
                  
    [QR CODE HERE]                             
    (Refreshes every 30 secs)                  
                  
                                                   
   Open WhatsApp on phone                       
     Settings  Linked Devices  Link a Device   
     Scan this QR code                           
                                                   
  Status: [Waiting for scan...]                  
                                                   
  [Already scanned? Continue]  [Cancel]           
                                                   

\\\

---

## 4. THEME SWITCHER (NAVBAR)

\\\

  Dashboard   Accounts   Profile             
                                       Dark |  Light 

                                                   
  (Page content changes colors based on theme)    
                                                   
  LIGHT MODE:                                     
  - White background                             
  - Black text                                    
  - Light gray sidebars                          
                                                   
  DARK MODE:                                      
  - Dark gray background (#1a1a1a)               
  - White text                                    
  - Darker sidebars                              
  - Reduced eye strain (blue light filter)        
                                                   
  Theme preference saved in browser               
                                                   

\\\

---

## 5. ADMIN PLAN MANAGEMENT (NEW ADMIN SECTION)

### Manage Plans
\\\

  ADMIN PANEL                [Manage Plans]     

                                                   
  [Create New Plan] [+]                           
                                                   
  BUILT-IN PLANS:                                 
     
  1. Free                                         
     Messages/Month: 100                          
     Backup Accounts: 0                           
     Price: ₹0                                    
     Trial Period: 7 days                         
     [Edit] [Duplicate] [Analytics]               
                                                   
  2. Starter                                      
     Messages/Month: 1,000                        
     Backup Accounts: 1                           
     Price: ₹99                                   
     Trial Period: 7 days                         
     [Edit] [Duplicate] [Analytics]               
                                                   
  3. Growth                                       
     Messages/Month: 5,000                        
     Backup Accounts: 2                           
     Price: ₹249                                  
     Trial Period: 7 days                         
     [Edit] [Duplicate] [Analytics]               
                                                   
  4. Pro                                          
     Messages/Month: 20,000                       
     Backup Accounts: 3                           
     Price: ₹499                                  
     Trial Period: 7 days                         
     [Edit] [Duplicate] [Analytics]               
                                                   
     
                                                   
  CUSTOM PLANS (Created by Admin):                
     
  1. Agency Plan                                  
     Messages/Month: 50,000                       
     Backup Accounts: 5                           
     Price: ₹999                                  
     Trial Period: 14 days                        
     [Edit] [Duplicate] [Analytics] [Delete]      
                                                   
  2. Enterprise Plan                              
     Messages/Month: Unlimited                    
     Backup Accounts: Unlimited                   
     Price: Custom (per negotiation)              
     Trial Period: 30 days                        
     [Edit] [Duplicate] [Analytics] [Delete]      
                                                   

\\\

### Create Custom Plan
\\\

  Admin Plans                    [Create Plan]    

                                                   
  PLAN NAME:                                      
  [Agency Plan___________________]                
                                                   
  PRICING:                                        
  Monthly Price: [₹ 999]                          
  Setup Fee (optional): [₹ 0]                     
  Annual Discount (%): [10%] (optional)           
                                                   
  LIMITS:                                         
  Messages/Month: [50,000]                        
   Unlimited                                    
  Backup Accounts: [5]                            
   Unlimited                                    
  Team Members: [3]                               
   Unlimited                                    
                                                   
  TRIAL:                                          
  Trial Duration (days): [14]                     
  Trial Message Limit: [100 msgs]                 
   Require credit card for trial                
                                                   
  FEATURES (Optional):                            
   Bulk Messaging                               
   Templates                                     
   Scheduled Messages                           
   Automation/Workflows                         
   Advanced Analytics                           
   API Access                                   
   Priority Support                             
                                                   
  VISIBILITY:                                     
   Show in signup (public plan)                 
   Hide from signup (hidden/custom)             
                                                   
  [Save Plan]  [Cancel]                           
                                                   

\\\

### Modify User Plan Limits
\\\

  Admin Users                    [Edit User]      

                                                   
  USER: John Doe (john@example.com)              
  Current Plan: Starter (₹99/month)              
                                                   
  CURRENT LIMITS:                                 
  Messages/Month: 1,000 (450 used)                
  Backup Accounts: 1 (1 used)                     
  Trial Status: Converted (Nov 15)                
                                                   
   
                                                   
  OVERRIDE LIMITS (Optional):                      
   Custom Monthly Limit: [2,000 msgs]           
   Custom Backup Accounts: [3]                  
   Custom Price: [₹149] (override ₹99)          
   Extend Trial: Until [Dec 15, 2025]          
   Grant Unlimited Messages: [Date Range]       
                                                   
  NOTES:                                          
  [This user is a beta tester, gave 50% discount ]
                                                   
  [Save Changes]  [Cancel]                        
                                                   

\\\

### Admin User List (Showing Trial Status)
\\\

  ADMIN PANEL                [Manage Users]     

                                                   
  [Create New User] [+]                           
                                                   
  SEARCH: [________________]  [Filter by Plan]   
                                                   
  USER          EMAIL              PLAN      TRIAL
    
  John Doe      john@ex.com        Starter   Converted (Nov 15)
  [Edit] [Change Plan] [Extend Trial] [Delete]  
                                                   
  Priya Singh   priya@ex.com       Growth    Active (expires Dec 2)
  [Edit] [Change Plan] [Extend Trial] [Delete]  
                                                   
  Rahul Patel   rahul@ex.com       Free      Active (expires Dec 7)
  [Edit] [Change Plan] [Extend Trial] [Delete]  
                                                   
  Neha Gupta    neha@ex.com        Pro       Converted (Nov 1)
  [Edit] [Change Plan] [Extend Trial] [Delete]  
                                                   
  PLATFORM STATS:                                 
  Total Users: 152                                
  Active Trials: 23 (15%)                         
  Converted: 129 (85%)                            
  Total MRR: ₹28,450                              
                                                   

\\\

---

## 6. UPDATED ACCOUNT SETTINGS (WITH ACCOUNTS & TRIAL INFO)

\\\

  Dashboard                    [Settings]         

                                                   
  [Profile] [WhatsApp Accounts] [Billing] [Security]
                                                   
  BILLING:                                        
     
  Current Plan: Starter (₹99/month)              
  Plan Type:  Trial (expires Dec 7, 2025)      
              Paid (renews Dec 30, 2025)       
                                                   
  Message Usage This Month:                       
  450 / 1,000 msgs used (45%)                    
   Progress                             
                                                   
  Payment Method: Razorpay (Card ending 4242)    
                                                   
  [Upgrade Plan] [View All Plans] [View Invoices]
                                                   
   
                                                   
  WHATSAPP ACCOUNTS:                              
     
  Connected Accounts: 2 of 3                      
                                                   
  Primary: 9876543210  Active                    
  Backup 1: 9876543211  Active                   
                                                   
   You can add 1 more backup account            
     (Upgrade to Growth plan for 2 backups)      
                                                   
  [Manage All Accounts] [Add New] [Remove]        
                                                   
   
                                                   
  PREFERENCES:                                    
  Language: [English ]                           
  Theme: [Light Mode ]                           
  Email Notifications:  Enabled                 
                                                   
  [Save Changes]                                   
                                                   

\\\

---

## PLAN & TRIAL SUMMARY

### Trial Plan Details
| Aspect | Details |
|--------|---------|
| **Duration** | 7 days |
| **Message Limit** | 100 msgs |
| **Credit Card** | Not required |
| **Auto-downgrade** | Converts to Free after 7 days if unpaid |
| **Early Upgrade** | Can upgrade anytime during trial |
| **Accounts** | 1 WhatsApp account |
| **Multiple Trials** | No (1 trial per email) |
| **Support** | Email only |

### Plan Comparison Table
| Feature | Free | Starter (₹99) | Growth (₹249) | Pro (₹499) | Custom |
|---------|------|---------------|---------------|-----------|--------|
| **Messages/Month** | 100 | 1K | 5K | 20K | Custom |
| **Backup Accounts** | 0 | 1 | 2 | 3 | Custom |
| **Templates** |  |  |  |  |  |
| **Analytics** | Basic | Basic | Advanced | Advanced | Custom |
| **Priority Support** |  |  |  |  | Custom |
| **API Access** |  |  |  |  | Custom |
| **SLA** | None | None | 99% | 99.9% | Custom |

### Admin Capabilities
**Create Plans:**
- Custom message limits per plan
- Custom pricing (INR)
- Custom backup account limits
- Custom trial periods
- Feature selection per plan
- Hide/show from public signup

**Modify User Plans:**
- Override message limits
- Override account limits
- Change pricing for specific user
- Extend trial period
- Grant temporary unlimited access
- Downgrade/upgrade user anytime

---

## MVP FEATURE ADDITIONS SUMMARY

 **Added Features (In Scope for MVP):**
- Trial plan (7 days, no credit card)
- Multi-account support (2-3 backups per user)
- Auto account rotation (prevents bans)
- Theme switcher (Light/Dark)
- Admin plan management (create, edit, delete custom plans)
- Admin user override capabilities (modify any user's limits)

 **Kept for Phase 2:**
- Scheduled messages (Month 6)
- Automation workflows (Month 8)
- Advanced analytics (Month 6)
- Team collaboration (Month 8)
- API access (Month 9)

