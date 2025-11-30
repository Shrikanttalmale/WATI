# MVP UI/UX Specification - Templates, Campaigns, Messaging

## Overview: What Users Actually See

This is NOT going to be as feature-rich as WATI. It's simpler, cleaner, India-focused.

---

## 1. SIGNUP & ONBOARDING (5 minutes)

### Page 1: Language Selection
\\\

  WHATSAPP BULK MESSAGING            
  Select Your Language:              
                                     
  [ English]  [ हद]        
  [ मरठ]                        
                                     
  Version: ₹99/month for 1K msgs     

\\\

### Page 2: Signup Form
\\\

  Sign Up (In selected language)      
                                     
  Email: [________________]          
  Password: [________________]       
  Company: [________________]        
  Phone: [________________]          
                                     
  [Create Account]                  
                                     
  Already have account? [Login]     

\\\

### Page 3: Plan Selection
\\\

  Choose Your Plan:                  
                                     
   Free: ₹0 (100 msgs/month)       
   Starter: ₹99 (1K msgs/month)    
   Growth: ₹249 (5K msgs/month)    
   Pro: ₹499 (20K msgs/month)      
                                     
  [Continue to Payment]              

\\\

### Page 4: WhatsApp QR Code Setup
\\\

  Scan QR Code to Connect WhatsApp   
                                     
      
    [QR CODE HERE]                 
    (Regenerate every 30 secs)     
      
                                     
   Open WhatsApp on phone         
     Settings  Linked Devices      
     Scan this QR code              
                                     
  Status: [Waiting for scan...]     
                                     
  [Already scanned? Continue]        

\\\

---

## 2. MAIN DASHBOARD (After Login)

\\\

  Dashboard         Profile   Settings       

                                                   
  Welcome, Shrikant!                            
  Plan: Starter | Used: 450 / 1,000 msgs         
  Renewal: Dec 30, 2025 (₹99)                    
                                                   

                                                   
  QUICK STATS:                                    
            
   Sent       Delivered   Read            
   450        438 (97%)   205 (46%)      
            
                                                   
  Messages This Month: 450 / 1,000               
   45%                                  
                                                   

                                                   
  QUICK ACTIONS:                                  
  [+ Send Messages] [ Templates] [ Contacts] 
  [ Analytics] [ Account Settings]            
                                                   

                                                   
  RECENT CAMPAIGNS:                               
  1. Diwali Offer - 250 msgs sent (Dec 1)        
  2. Feedback Survey - 180 msgs sent (Nov 28)    
  3. Welcome Msg - 20 msgs sent (Nov 25)         
                                                   

\\\

---

## 3. SEND MESSAGES (Core Feature)

### Option A: Quick Send (Simple)
\\\

  Dashboard                    [Send Messages]    

                                                   
  MESSAGE:                                        
   
   Hi {name}, Checkout our new products!        
   https://shop.example.com                     
   
  (Remaining: 550 chars)                          
                                                   
  RECIPIENTS:                                     
   Upload CSV [Browse] (phone, name)            
   Select Contact Group [Dropdown]              
   Paste Numbers (comma-separated)              
                                                   
  Selected: 250 contacts                          
               
   9876543210, John                           
   9876543211, Priya                          
   9876543212, Rahul                          
   ...                                        
               
  [Load More]                                     
                                                   
  SCHEDULING:                                     
   Send Now     Schedule for:                  
                                                   
  [Preview Message]  [Send]  [Cancel]            
                                                   

\\\

### Preview Modal
\\\

 Preview (250 messages)       

                              
 To: 9876543210               
 
 Hi John, Checkout our new   
 products!                    
 https://shop.example.com     
                              
 Read delivery & read status  
 in Analytics tab             
                              
 
                              
 Cost: 0 additional messages  
 (using personalization)      
                              
 [Confirm & Send]  [Back]     
                              

\\\

---

## 4. MESSAGE TEMPLATES

### Template Library (Pre-built)
\\\

  Dashboard                    [Templates]        

                                                   
  [My Templates] [Pre-built] [+ Create New]      
                                                   
  SEARCH: [________________]                      
                                                   
  MY TEMPLATES (5):                               
  1.  Diwali Offer                              
     Hi {name}, 50% off this Diwali!             
     [Use] [Edit] [Delete]                       
                                                   
  2.  Feedback Survey                           
     Please rate our service: {survey_link}      
     [Use] [Edit] [Delete]                       
                                                   
  3.  Welcome Message                           
     Welcome to our store! Click here: {link}    
     [Use] [Edit] [Delete]                       
                                                   
  PRE-BUILT TEMPLATES:                            
  1.  Festival Offer                            
     "Hi {name}, {discount}% off {product}!"    
     [Use]                                        
                                                   
  2.  App Download                              
     "Download our app: {app_link}"              
     [Use]                                        
                                                   
  3.  New Product Launch                        
     "New! {product_name} just launched!"        
     [Use]                                        
                                                   

\\\

### Create/Edit Template
\\\

  Templates                    [Create Template]  

                                                   
  TEMPLATE NAME:                                  
  [New Offer________________]                     
                                                   
  MESSAGE TEXT:                                   
   
   Hi {name}, We have a special offer for you!  
   {discount}% off on {product}                
   Shop now: {shop_link}                        
   
  (Max 1,024 chars, 960 remaining)               
                                                   
  DYNAMIC FIELDS (Click to insert):              
  {name} {company} {phone} {product}             
  {discount} {shop_link} {offer_code}           
                                                   
  [Add Custom Field]                             
                                                   
  PREVIEW:                                        
    
  Hi Shrikant, We have a special offer for you! 
  25% off on Winter Collection                   
  Shop now: https://shop.example.com            
    
                                                   
  [Save Template]  [Cancel]                       
                                                   

\\\

---

## 5. CONTACTS MANAGEMENT

\\\

  Dashboard                    [Contacts]         

                                                   
  [Import CSV] [+ Add Manual] [Export] [Delete]  
                                                   
  SEARCH: [________________]  [Filter by Group]  
                                                   
  TOTAL CONTACTS: 1,250                           
                                                   
  GROUP: All (Default)                            
     
    Phone      Name        Company            
    9876543210 John Doe    XYZ Store          
    9876543211 Priya Singh ABC Corp           
    9876543212 Rahul Patel DEF Retail         
    9876543213 Neha Gupta  GHI Boutique       
   ... (1,246 more)                            
     
  [Load More]                                     
                                                   
  MY GROUPS (3):                                  
   Diwali Offers (250 contacts)                 
   Newsletter (500 contacts)                     
   VIP Customers (50 contacts)                  
                                                   
  [Create New Group]                              
                                                   

\\\

### CSV Upload
\\\

  Contacts                    [Import CSV]        

                                                   
  UPLOAD FILE:                                    
   
   [Drag CSV here or click to browse]           
   
                                                   
  FORMAT EXPECTED:                                
  phone,name,company                             
  9876543210,John,XYZ Store                      
  9876543211,Priya,ABC Corp                      
                                                   
  PREVIEW:                                        
     
   Row | Phone      | Name   | Company          
   1   | 9876543210 | John   | XYZ Store        
   2   | 9876543211 | Priya  | ABC Corp         
   3   | 9876543212 | Rahul  | DEF Retail       
     
                                                   
  VALIDATION:                                     
   3 valid rows                                  
   All phone numbers valid                       
   1 duplicate (will update existing)          
                                                   
  [Import]  [Cancel]                              
                                                   

\\\

---

## 6. ANALYTICS & REPORTING

\\\

  Dashboard                    [Analytics]        

                                                   
  DATE RANGE: [Nov 1 - Nov 30] [Change]          
                                                   
  OVERVIEW:                                       
       
   Messages      Delivered     Read Rate   
   450           438 (97%)     205 (46%)   
       
                                                   
  DAILY TREND (Chart):                            
  Messages Sent / Day                             
  30                                          
  20                                          
  10                                          
   0        
     1   5   10  15  20  25  30                   
                                                   
  DELIVERY STATUS:                                
     
   Status       Count    % of Total            
   Sent         450      100%       
   Delivered    438      97%         
   Read         205      46%              
   Failed       12       3%                   
     
                                                   
  TOP CAMPAIGNS:                                  
  1. Diwali Offer - 250 sent, 240 delivered     
  2. Feedback Survey - 180 sent, 175 delivered  
  3. Welcome Msg - 20 sent, 23 delivered        
                                                   
  [Export as CSV]  [Export as PDF]               
                                                   

\\\

---

## 7. ACCOUNT SETTINGS

\\\

  Dashboard                    [Settings]         

                                                   
  [Profile] [WhatsApp] [Billing] [Security]      
                                                   
  PROFILE:                                        
  Name: [Shrikant Talmale____]                   
  Email: [shrikant@example.com____]              
  Company: [My Business____]                      
  Language: [English ]                           
                                                   
  [Save Changes]                                   
                                                   
    
                                                   
  WHATSAPP ACCOUNT:                               
  Connected Account: 9876543210                   
  Status:  Active (Expires: Jan 15, 2026)       
                                                   
  [Disconnect & Re-scan QR]  [Add Backup Account]
                                                   
  RATE LIMITS:                                    
  Max Messages/Min: 30 msgs/min (enforced)       
  Daily Limit: 3,000 msgs/day (recommended)      
                                                   
   We auto-rotate between your accounts to     
     prevent bans. Read our Best Practices guide.
                                                   
    
                                                   
  BILLING:                                        
  Current Plan: Starter (₹99/month)              
  Next Billing: Dec 30, 2025                      
  Payment Method: Razorpay                        
                                                   
  [Upgrade Plan] [View Invoices]                  
                                                   
    
                                                   
  SECURITY:                                       
  Password: [Change Password]                     
  Two-Factor Auth: [Enable 2FA]                   
  Sessions: [View Active Sessions]                
                                                   
    
                                                   
  [Logout]  [Delete Account]                      
                                                   

\\\

---

## 8. ADMIN PANEL (For Resellers/Agencies)

### List Users (Admin Only)
\\\

  ADMIN PANEL                [Manage Users]     

                                                   
  [Create New User] [+]                           
                                                   
  SEARCH: [________________]  [Filter by Plan]   
                                                   
  USER                EMAIL               PLAN    
    
  John Doe          john@example.com    Starter  
  [Edit] [Change Plan] [View Stats] [Delete]    
                                                   
  Priya Singh       priya@example.com   Growth   
  [Edit] [Change Plan] [View Stats] [Delete]    
                                                   
  Rahul Patel       rahul@example.com   Free     
  [Edit] [Change Plan] [View Stats] [Delete]    
                                                   
  PLATFORM STATS:                                 
  Total Users: 152                                
  Total MRR: ₹28,450                              
  Messages This Month: 1.2M                       
                                                   

\\\

### Create User
\\\

  Admin                        [Create User]      

                                                   
  NAME: [________________]                        
  EMAIL: [________________]                       
  PASSWORD: [Generate Random]                     
  PLAN: [Growth ]                               
                                                   
  Send Welcome Email:                           
  (User gets login link + onboarding)            
                                                   
  [Create User]  [Cancel]                         
                                                   

\\\

---

## FEATURE COMPARISON: Yours vs. WATI

| Feature | Your App | WATI | Notes |
|---------|----------|------|-------|
| **Signup** | 5 mins | 10 mins | Multi-language from Day 1 |
| **Bulk Messaging** |  Core |  Yes | Same core feature |
| **Templates** |  10 pre-built |  50+ | Simpler, easier to use |
| **Contacts** |  CSV import |  Yes | Same functionality |
| **Personalization** |  {name}, {discount} |  Yes | Basic, not AI-powered |
| **Analytics** |  Basic (sent/delivered/read) |  Advanced | You show key metrics only |
| **Scheduling** |  Not in MVP |  Yes | Add in Phase 2 (Month 6) |
| **Automation/Workflows** |  No |  Advanced | Add in Phase 2 (Month 8+) |
| **Omnichannel** |  WhatsApp only |  Multi | You stay focused |
| **CRM** |  No |  Yes | Contacts, not CRM |
| **Admin Panel** |  Yes |  No | Your differentiator! |
| **Multi-language UI** |  En/Hi/Mr |  En + a few | Your strength |
| **Cost** | ₹99/month | ₹500/month | 5x cheaper |

---

## Key Design Decisions

**Simplicity Over Features:**
- No complex workflows
- No AI chatbots
- No multi-channel
- Just bulk messaging + templates + contacts

**India-First Design:**
- All UI in Hindi, Marathi, English
- Payment in INR (Razorpay)
- Support for common use cases (e-commerce, retail, agencies)

**Mobile-Friendly:**
- Responsive design (works on phone)
- But focus is web (most SMBs use desktop)

**Performance:**
- Fast load times (2-3 seconds max)
- Simple, clean interface
- No JavaScript bloat

**Security:**
- HTTPS everywhere
- Password hashing (bcrypt)
- Rate limiting to prevent abuse
- Session management (30-day expiry)

---

## What's Missing (Intentionally)

 Scheduling (complex with Baileys)
 Automation workflows (MVP scope)
 AI/Chatbots (not core feature)
 Multi-channel (stay focused)
 Advanced segmentation (too much for MVP)
 Team collaboration (solo founder focus)
 Mobile app (web is enough)

All of these become Phase 2 (Month 6+).

---

## Summary

Your MVP is **deliberately simple**. It does one thing well:
- **Send WhatsApp messages at scale**

It doesn't compete with WATI on features. It competes on:
- **Price** (5x cheaper)
- **Language** (Hindi/Marathi)
- **Simplicity** (easy to use)
- **Admin panel** (agency-friendly)

A SMB who needs to send 100 WhatsApp messages/month doesn't need WATI's 100 features. They need YOUR simplicity.

**This UI is clean, functional, and buildable in 60 days.**
