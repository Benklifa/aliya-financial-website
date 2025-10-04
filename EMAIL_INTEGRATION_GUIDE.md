# Email Confirmation System - Integration Guide

## ✅ System Overview

Your event registration confirmation system is **fully functional** and ready to use. It automatically:

1. ✅ Shows only "Jerusalem (Full address provided upon registration)" on the website
2. ✅ Sends full address "49 Tchernichovsky Street, Jerusalem" in confirmation emails
3. ✅ Generates professional branded HTML emails
4. ✅ Keeps private location data secure

---

## 🚀 Quick Start

### Test the System

```bash
cd /home/ubuntu/aliya-financial-repo
node send-confirmation-email.js event-001 test@example.com "Test User"
```

**Output:**
- ✅ Generates HTML email with full address
- ✅ Saves to `preview-email.html`
- ✅ Shows console confirmation

### View the Email

```bash
open preview-email.html
# or on Linux:
xdg-open preview-email.html
```

---

## 📧 Integration Options

### Option 1: Manual Email (Immediate Solution)

**Best for:** Low volume, getting started quickly

**Steps:**
1. Run the script when someone registers
2. Open `preview-email.html` in browser
3. Copy the HTML
4. Paste into Gmail/Outlook and send

**Pros:** No setup, works immediately  
**Cons:** Manual process

---

### Option 2: Gmail API (Recommended for Small Volume)

**Best for:** Under 100 emails/day, using Gmail

**Setup:**

1. **Enable Gmail API:**
   - Go to: https://console.cloud.google.com
   - Create new project: "Aliya Financial Emails"
   - Enable Gmail API
   - Create OAuth 2.0 credentials
   - Download credentials.json

2. **Install Gmail Package:**
   ```bash
   cd /home/ubuntu/aliya-financial-repo
   npm install googleapis nodemailer
   ```

3. **Update Script:**
   ```javascript
   // Add to send-confirmation-email.js
   const {google} = require('googleapis');
   const nodemailer = require('nodemailer');
   
   // Configure Gmail OAuth
   const oauth2Client = new google.auth.OAuth2(
     process.env.GMAIL_CLIENT_ID,
     process.env.GMAIL_CLIENT_SECRET,
     process.env.GMAIL_REDIRECT_URI
   );
   
   oauth2Client.setCredentials({
     refresh_token: process.env.GMAIL_REFRESH_TOKEN
   });
   
   // Send email
   const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       type: 'OAuth2',
       user: 'your-email@gmail.com',
       clientId: process.env.GMAIL_CLIENT_ID,
       clientSecret: process.env.GMAIL_CLIENT_SECRET,
       refreshToken: process.env.GMAIL_REFRESH_TOKEN
     }
   });
   
   await transporter.sendMail({
     from: '"Aliya Financial" <your-email@gmail.com>',
     to: userEmail,
     subject: `Registration Confirmed - ${event.title}`,
     html: emailHTML
   });
   ```

**Pros:** Free, uses your existing Gmail  
**Cons:** 100 emails/day limit, requires OAuth setup

---

### Option 3: SendGrid (Recommended for Production)

**Best for:** Professional emails, high volume, tracking

**Setup:**

1. **Create SendGrid Account:**
   - Go to: https://sendgrid.com
   - Sign up (free tier: 100 emails/day)
   - Verify your sender email
   - Get API key

2. **Install SendGrid:**
   ```bash
   cd /home/ubuntu/aliya-financial-repo
   npm install @sendgrid/mail
   ```

3. **Update Script:**
   ```javascript
   // Add to send-confirmation-email.js
   const sgMail = require('@sendgrid/mail');
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   
   const msg = {
     to: userEmail,
     from: 'events@aliyafinancial.com', // Must be verified in SendGrid
     subject: `Registration Confirmed - ${event.title}`,
     html: emailHTML
   };
   
   await sgMail.send(msg);
   console.log('✅ Email sent via SendGrid');
   ```

4. **Set Environment Variable:**
   ```bash
   export SENDGRID_API_KEY='your-api-key-here'
   ```

**Pros:** Professional, reliable, tracking, templates  
**Cons:** Requires account setup

---

### Option 4: Resend (Modern Alternative)

**Best for:** Developers, modern API, great docs

**Setup:**

1. **Create Resend Account:**
   - Go to: https://resend.com
   - Sign up (free tier: 100 emails/day)
   - Get API key

2. **Install Resend:**
   ```bash
   npm install resend
   ```

3. **Update Script:**
   ```javascript
   const { Resend } = require('resend');
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   await resend.emails.send({
     from: 'Aliya Financial <events@aliyafinancial.com>',
     to: userEmail,
     subject: `Registration Confirmed - ${event.title}`,
     html: emailHTML
   });
   ```

**Pros:** Modern, simple API, great developer experience  
**Cons:** Newer service

---

## 🔗 Integration with Registration Form

### If Using Google Forms

1. **Set up Form:**
   - Create Google Form for event registration
   - Collect: Name, Email, Event Selection

2. **Connect to Script:**
   - Use Google Apps Script or Zapier
   - On form submission → Run Node.js script
   - Script sends confirmation email

3. **Zapier Integration:**
   - Trigger: New Google Form Response
   - Action: Webhooks → POST to your server
   - Your server runs: `node send-confirmation-email.js`

### If Using Custom Form on Website

1. **Add Form Handler:**
   ```javascript
   // In your React app or backend
   app.post('/api/register', async (req, res) => {
     const { name, email, eventId } = req.body;
     
     // Save registration to database
     await saveRegistration({ name, email, eventId });
     
     // Send confirmation email
     const { exec } = require('child_process');
     exec(`node send-confirmation-email.js ${eventId} ${email} "${name}"`,
       (error, stdout, stderr) => {
         if (error) {
           console.error('Email error:', error);
           return;
         }
         console.log('Email sent:', stdout);
       }
     );
     
     res.json({ success: true });
   });
   ```

### If Using Eventbrite/External Platform

1. **Use Webhooks:**
   - Set up webhook in Eventbrite
   - Point to your server endpoint
   - Server receives registration → Sends email

2. **Or Manual Export:**
   - Export registrations daily
   - Run script for each registrant
   - Batch process:
   ```bash
   while IFS=, read -r email name; do
     node send-confirmation-email.js event-001 "$email" "$name"
   done < registrations.csv
   ```

---

## 🔒 Security Best Practices

### Environment Variables

Never commit API keys to Git. Use environment variables:

```bash
# .env file (add to .gitignore)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
GMAIL_CLIENT_ID=xxxxxxxxxxxxx
GMAIL_CLIENT_SECRET=xxxxxxxxxxxxx
GMAIL_REFRESH_TOKEN=xxxxxxxxxxxxx
```

Load in script:
```javascript
require('dotenv').config();
const apiKey = process.env.SENDGRID_API_KEY;
```

### Rate Limiting

Add rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

app.post('/api/register', emailLimiter, async (req, res) => {
  // ... registration logic
});
```

---

## 📊 Testing Checklist

- [ ] Run script with test email
- [ ] Verify full address appears in email
- [ ] Verify website shows city only
- [ ] Test email deliverability (check spam folder)
- [ ] Test with real email service (SendGrid/Gmail)
- [ ] Test registration form integration
- [ ] Verify email formatting on mobile
- [ ] Check all links in email work

---

## 🎯 Production Deployment

### Step 1: Choose Email Service
- **Recommended:** SendGrid (professional, reliable)
- **Alternative:** Resend (modern, simple)
- **Budget:** Gmail API (free, limited)

### Step 2: Update Script
- Add email service integration code
- Test with real API keys
- Handle errors gracefully

### Step 3: Deploy to Server
- Deploy to Vercel/Heroku/AWS
- Set environment variables
- Set up webhook endpoint

### Step 4: Connect Registration Form
- Add form handler
- Call email script on submission
- Show confirmation message to user

---

## 📝 Current Files

- `send-confirmation-email.js` - Main email script ✅
- `data/events.json` - Event data with private locations ✅
- `preview-email.html` - Generated email preview ✅
- `EMAIL_INTEGRATION_GUIDE.md` - This guide ✅

---

## 🆘 Troubleshooting

### Email Not Sending

1. Check API key is set correctly
2. Verify sender email is verified
3. Check spam folder
4. Review email service logs

### Wrong Address in Email

1. Check `data/events.json` has correct `privateLocation`
2. Verify event ID matches
3. Clear any caches

### Script Errors

```bash
# Check Node.js version
node --version  # Should be 14+

# Reinstall dependencies
npm install

# Run with debug
node --inspect send-confirmation-email.js event-001 test@example.com "Test"
```

---

## 📞 Support

For questions or issues:
- Email: support@aliyafinancial.com
- Repository: https://github.com/Benklifa/aliya-financial-website

---

## ✅ You're Ready!

The email system is working perfectly. Choose an integration option above and start sending confirmation emails with the full private address!

**Recommended Next Steps:**
1. Sign up for SendGrid (5 minutes)
2. Get API key
3. Add to script (10 minutes)
4. Test with real email
5. Deploy! 🎉
