# Implementation Checklist - Event Management System

## ✅ What's Already Done

### Backend & API
- [x] Created `api/events.js` - Public API (returns `publicLocation` only)
- [x] Created `api/event-details.js` - Private API (returns `privateLocation` for emails)
- [x] Created `data/events.json` - Event data with both location fields
- [x] Configured Vercel routing for API endpoints
- [x] Added authentication to private API

### Frontend Integration
- [x] Created `events-api-integration.js` - Replaces hardcoded events with API data
- [x] Added script to `index.html` to load API events
- [x] Created admin interface at `/admin.html`

### Documentation & Templates
- [x] Created `SETUP_GUIDE.md` - Complete setup instructions
- [x] Created `EVENT_API_DOCUMENTATION.md` - Full API reference
- [x] Created `email-template-example.html` - Email template with privateLocation

---

## 🔧 What You Need To Do

### 1. Set Up Security (CRITICAL!)

**Status:** ⚠️ **REQUIRED** - Do this first!

**Steps:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - Name: `EVENT_API_TOKEN`
   - Value: Generate a secure token (use command below)
   - Environments: Check all (Production, Preview, Development)
5. Click **Save**
6. Redeploy your site

**Generate secure token:**
```bash
# Run this in terminal or use any random string generator
openssl rand -hex 32
```

**Why this matters:**
Without this, the private API (with full addresses) won't work properly.

---

### 2. Test the System

**Status:** ⏳ **Pending** - Test after deployment completes

**Steps:**

**A. Test Public API (Website)**
```bash
curl https://aliyafinancial.com/api/events
```

**Expected result:**
```json
{
  "success": true,
  "events": [{
    "location": "Jerusalem (Full address provided upon registration)"
  }]
}
```

**B. Test Private API (Email)**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://aliyafinancial.com/api/event-details?eventId=event-001"
```

**Expected result:**
```json
{
  "success": true,
  "event": {
    "privateLocation": "49 Tchernichovsky Street, Jerusalem\nTake elevator to 4th floor Penthouse"
  }
}
```

**C. Test Admin Interface**
1. Visit: https://aliyafinancial.com/admin.html
2. Click "Test Public API" button
3. Click "Test Private API" button
4. Verify events display correctly

---

### 3. Verify Website Shows Public Location Only

**Status:** ⏳ **Pending** - Check after deployment

**Steps:**
1. Visit: https://aliyafinancial.com/events
2. Look at event location
3. **Should see:** "Jerusalem (Full address provided upon registration)"
4. **Should NOT see:** "49 Tchernichovsky Street" or any full address

**If you still see the full address:**
- Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- Wait 2-3 minutes for Vercel deployment to complete
- Check browser console for errors (F12 → Console tab)

---

### 4. Set Up Email Confirmation System

**Status:** ⏳ **TODO** - Integrate with your email service

**Option A: Manual Process (Temporary)**
1. When someone registers, note their email and event ID
2. Use the admin interface to test private API
3. Copy the full address
4. Send email manually with the address

**Option B: Automated Email Service (Recommended)**

Choose an email service:
- **SendGrid** (recommended) - https://sendgrid.com
- **Mailgun** - https://mailgun.com
- **Resend** - https://resend.com
- **AWS SES** - https://aws.amazon.com/ses

**Example with SendGrid:**
```javascript
// After user registers for event-001
const eventResponse = await fetch(
  'https://aliyafinancial.com/api/event-details?eventId=event-001',
  {
    headers: {
      'Authorization': `Bearer ${process.env.EVENT_API_TOKEN}`
    }
  }
);

const { event } = await eventResponse.json();

// Send email via SendGrid
await sgMail.send({
  to: userEmail,
  from: 'events@aliyafinancial.com',
  subject: `Registration Confirmed - ${event.title}`,
  html: emailTemplate
    .replace('{{ATTENDEE_NAME}}', userName)
    .replace('{{EVENT_TITLE}}', event.title)
    .replace('{{EVENT_DATE}}', event.date)
    .replace('{{EVENT_TIME}}', event.time)
    .replace('{{PRIVATE_LOCATION}}', event.privateLocation) // FULL ADDRESS
    .replace('{{EVENT_DESCRIPTION}}', event.description)
});
```

**Use the template:** `email-template-example.html`

---

### 5. Add/Update Events

**Status:** ✅ **Ready to use**

**To add a new event:**

1. Open `data/events.json` in your repository
2. Add a new event:

```json
{
  "id": "event-002",
  "title": "Retirement Planning Seminar",
  "date": "2025-12-01",
  "time": "19:00",
  "description": "Learn about U.S.-Israel retirement strategies",
  "publicLocation": "Tel Aviv (Full address provided upon registration)",
  "privateLocation": "123 Rothschild Blvd, Tel Aviv\nSuite 500, 5th Floor",
  "capacity": 25,
  "registrationOpen": true
}
```

3. Commit and push to GitHub
4. Vercel auto-deploys (1-2 minutes)
5. Check admin interface to verify

---

## 📊 Current System Status

| Component | Status | Action Needed |
|-----------|--------|---------------|
| Public API | ✅ Deployed | Test after deployment |
| Private API | ⚠️ Needs token | Set ENV variable in Vercel |
| Admin Interface | ✅ Deployed | Visit /admin.html |
| Website Integration | ✅ Deployed | Verify events page |
| Email System | ⏳ Not set up | Choose email service |
| Documentation | ✅ Complete | Read SETUP_GUIDE.md |

---

## 🔍 Verification Checklist

After deployment completes, verify:

- [ ] Visit https://aliyafinancial.com/events
- [ ] Event location shows: "Jerusalem (Full address provided upon registration)"
- [ ] Event location does NOT show: "49 Tchernichovsky Street"
- [ ] Visit https://aliyafinancial.com/admin.html
- [ ] Admin interface loads successfully
- [ ] "Test Public API" button works
- [ ] "Test Private API" button works (after setting token)
- [ ] Public API returns city only
- [ ] Private API returns full address
- [ ] Email template ready to use

---

## 🆘 Troubleshooting

### Problem: Website still shows full address

**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Check browser console (F12) for JavaScript errors
3. Wait 2-3 minutes for Vercel deployment to complete
4. Verify `events-api-integration.js` is loading

### Problem: Private API returns 401 Unauthorized

**Solution:**
1. Verify `EVENT_API_TOKEN` is set in Vercel environment variables
2. Check Authorization header format: `Bearer YOUR_TOKEN`
3. Redeploy after setting environment variable

### Problem: Events not showing on website

**Solution:**
1. Check `data/events.json` syntax (must be valid JSON)
2. Verify file is committed to GitHub
3. Check Vercel deployment logs for errors
4. Test API directly: https://aliyafinancial.com/api/events

---

## 📞 Support Resources

- **Setup Guide:** `SETUP_GUIDE.md`
- **API Documentation:** `EVENT_API_DOCUMENTATION.md`
- **Email Template:** `email-template-example.html`
- **Admin Interface:** https://aliyafinancial.com/admin.html
- **Vercel Docs:** https://vercel.com/docs

---

## ✅ Final Checklist

Before considering this complete:

- [ ] Environment variable `EVENT_API_TOKEN` set in Vercel
- [ ] Vercel deployment completed successfully
- [ ] Public API tested and working
- [ ] Private API tested and working
- [ ] Website shows public location only (city + note)
- [ ] Email template configured with privateLocation
- [ ] Email service integrated (SendGrid/Mailgun/etc.)
- [ ] Test email sent with full address
- [ ] Documentation reviewed

---

**Current Status:** 🟡 **System deployed, awaiting configuration**

**Next Step:** Set `EVENT_API_TOKEN` in Vercel Dashboard
