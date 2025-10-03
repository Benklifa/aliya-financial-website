# Event Management System - Setup Guide

## 🎉 System Overview

You now have a complete event management system with:
- ✅ **Public API** - Shows city only on website
- ✅ **Private API** - Provides full address for emails
- ✅ **Admin Interface** - Easy event viewing and testing
- ✅ **JSON-based storage** - Simple to manage

---

## 📋 Quick Start

### 1. Access the Admin Interface

Visit: **https://aliyafinancial.com/admin.html**

This page shows:
- All current events
- Public locations (what visitors see)
- API testing buttons
- Documentation links

### 2. Set Up Security (Important!)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `aliya-financial-website`
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name:** `EVENT_API_TOKEN`
   - **Value:** `your-secure-random-token-here`
   - **Environments:** Production, Preview, Development
5. Click **Save**
6. Redeploy your site

**Generate a secure token:**
```bash
# Use this command or any random string generator
openssl rand -hex 32
```

---

## 📝 Managing Events

### Adding a New Event

1. Open `data/events.json` in your repository
2. Add a new event object:

```json
{
  "id": "event-002",
  "title": "Your Event Title",
  "date": "2025-12-15",
  "time": "19:00",
  "description": "Event description here",
  "publicLocation": "Tel Aviv (Full address provided upon registration)",
  "privateLocation": "123 Example Street, Tel Aviv\nFloor 5, Suite 100",
  "capacity": 25,
  "registrationOpen": true
}
```

3. Commit and push to GitHub
4. Vercel auto-deploys (1-2 minutes)
5. Check https://aliyafinancial.com/admin.html to verify

### Editing an Event

1. Find the event in `data/events.json`
2. Update any field (title, date, locations, etc.)
3. Commit and push
4. Changes are live after deployment

### Closing Registration

Change `"registrationOpen": true` to `"registrationOpen": false`

---

## 🔌 Using the APIs

### For Website Display

**Endpoint:** `GET /api/events`

**JavaScript Example:**
```javascript
fetch('https://aliyafinancial.com/api/events')
  .then(res => res.json())
  .then(data => {
    data.events.forEach(event => {
      console.log(event.location); // "Jerusalem (Full address provided upon registration)"
    });
  });
```

### For Email Confirmations

**Endpoint:** `GET /api/event-details?eventId=event-001`

**JavaScript Example:**
```javascript
fetch('https://aliyafinancial.com/api/event-details?eventId=event-001', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
  .then(res => res.json())
  .then(data => {
    const fullAddress = data.event.privateLocation;
    // Use in email template:
    // "49 Tchernichovsky Street, Jerusalem
    //  Take elevator to 4th floor Penthouse"
  });
```

---

## 📧 Email Integration

### Option 1: Manual Email Template

When someone registers:
1. Note their event ID
2. Call the private API with authentication
3. Get the `privateLocation`
4. Send email with full address

### Option 2: Automated Email System

Use services like:
- **SendGrid** - Email API
- **Mailgun** - Transactional emails
- **Resend** - Developer-friendly emails

**Example with SendGrid:**
```javascript
// After user registers for event-001
const eventDetails = await fetch('https://aliyafinancial.com/api/event-details?eventId=event-001', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
}).then(r => r.json());

// Send email via SendGrid
await sendEmail({
  to: user.email,
  subject: `Registration Confirmed - ${eventDetails.event.title}`,
  html: `
    <h2>Thank you for registering!</h2>
    <p><strong>Event:</strong> ${eventDetails.event.title}</p>
    <p><strong>Date:</strong> ${eventDetails.event.date}</p>
    <p><strong>Time:</strong> ${eventDetails.event.time}</p>
    <p><strong>Location:</strong><br>${eventDetails.event.privateLocation}</p>
  `
});
```

---

## 🧪 Testing

### Test Public API
```bash
curl https://aliyafinancial.com/api/events
```

Expected: List of events with public locations only

### Test Private API
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://aliyafinancial.com/api/event-details?eventId=event-001"
```

Expected: Full event details including private location

### Test in Browser
Visit: https://aliyafinancial.com/admin.html
Click the "Test" buttons

---

## 🔒 Security Notes

1. **Never expose the private API token publicly**
2. **Only use the private API server-side** (not in frontend JavaScript visible to users)
3. **Change the default token** in Vercel environment variables
4. **Use HTTPS** (Vercel provides this automatically)

---

## 📁 File Structure

```
aliya-financial-repo/
├── api/
│   ├── events.js              # Public API (city only)
│   └── event-details.js       # Private API (full address)
├── data/
│   └── events.json            # Event data storage
├── admin.html                 # Admin interface
├── EVENT_API_DOCUMENTATION.md # Full API docs
├── SETUP_GUIDE.md            # This file
└── vercel.json               # Vercel configuration
```

---

## ✅ Deployment Checklist

- [x] Code pushed to GitHub
- [x] Vercel auto-deploys
- [ ] Set `EVENT_API_TOKEN` in Vercel (DO THIS!)
- [ ] Test public API at /api/events
- [ ] Test private API with token
- [ ] Visit admin interface at /admin.html
- [ ] Update website to use /api/events
- [ ] Configure email system to use /api/event-details

---

## 🆘 Troubleshooting

### API returns 404
- Wait 2-3 minutes after deployment
- Check Vercel deployment logs
- Verify `api/` folder exists in repository

### Private API returns 401 Unauthorized
- Check Authorization header format: `Bearer YOUR_TOKEN`
- Verify token matches Vercel environment variable
- Ensure token is set in Vercel dashboard

### Events not showing
- Check `data/events.json` syntax (valid JSON)
- Verify file is committed to repository
- Check browser console for errors

---

## 📞 Support

For detailed API documentation, see: **EVENT_API_DOCUMENTATION.md**

For questions about Vercel deployment: https://vercel.com/docs
