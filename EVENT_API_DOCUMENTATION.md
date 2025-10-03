# Event Management API Documentation

## Overview
This system provides two separate API endpoints for managing event locations:
1. **Public API** - For displaying events on the website (city only)
2. **Private API** - For sending confirmation emails (full address)

---

## Data Structure

### Events Data File: `data/events.json`

```json
{
  "events": [
    {
      "id": "event-001",
      "title": "Event Title",
      "date": "2025-11-15",
      "time": "18:00",
      "description": "Event description",
      "publicLocation": "Jerusalem (Full address provided upon registration)",
      "privateLocation": "49 Tchernichovsky Street, Jerusalem\nTake elevator to 4th floor Penthouse",
      "capacity": 30,
      "registrationOpen": true
    }
  ]
}
```

---

## API Endpoints

### 1. Public Events API (Website Display)

**Endpoint:** `GET /api/events`

**Purpose:** Fetch events for public website display

**Authentication:** None required

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": "event-001",
      "title": "Aliyah Financial Planning Workshop",
      "date": "2025-11-15",
      "time": "18:00",
      "description": "Learn about cross-border financial planning",
      "location": "Jerusalem (Full address provided upon registration)",
      "capacity": 30,
      "registrationOpen": true
    }
  ]
}
```

**Usage Example:**
```javascript
fetch('https://aliyafinancial.com/api/events')
  .then(res => res.json())
  .then(data => {
    console.log(data.events); // Display on website
  });
```

---

### 2. Private Event Details API (Email Confirmations)

**Endpoint:** `GET /api/event-details?eventId={eventId}`

**Purpose:** Fetch full event details including private location for confirmation emails

**Authentication:** Required - Bearer token in Authorization header

**Headers:**
```
Authorization: Bearer aliya-financial-secret-2025
```

**Query Parameters:**
- `eventId` (required) - The ID of the event

**Response:**
```json
{
  "success": true,
  "event": {
    "id": "event-001",
    "title": "Aliyah Financial Planning Workshop",
    "date": "2025-11-15",
    "time": "18:00",
    "description": "Learn about cross-border financial planning",
    "publicLocation": "Jerusalem (Full address provided upon registration)",
    "privateLocation": "49 Tchernichovsky Street, Jerusalem\nTake elevator to 4th floor Penthouse",
    "capacity": 30,
    "registrationOpen": true
  }
}
```

**Usage Example (for email system):**
```javascript
fetch('https://aliyafinancial.com/api/event-details?eventId=event-001', {
  headers: {
    'Authorization': 'Bearer aliya-financial-secret-2025'
  }
})
  .then(res => res.json())
  .then(data => {
    const fullAddress = data.event.privateLocation;
    // Use in confirmation email template
  });
```

---

## Security

### Authentication Token
The private API uses a bearer token for authentication. 

**Setting the Token:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `EVENT_API_TOKEN` = `your-secure-token-here`
3. Redeploy the project

**Default Token (for testing):** `aliya-financial-secret-2025`

⚠️ **Important:** Change this token in production!

---

## Managing Events

### Adding a New Event

1. Edit `data/events.json`
2. Add a new event object with both `publicLocation` and `privateLocation`
3. Commit and push to GitHub
4. Vercel will auto-deploy

**Example:**
```json
{
  "id": "event-002",
  "title": "Retirement Planning Seminar",
  "date": "2025-12-01",
  "time": "19:00",
  "description": "U.S.-Israel retirement strategies",
  "publicLocation": "Tel Aviv (Full address provided upon registration)",
  "privateLocation": "123 Rothschild Blvd, Tel Aviv\nSuite 500",
  "capacity": 25,
  "registrationOpen": true
}
```

### Updating an Event

1. Edit the event in `data/events.json`
2. Commit and push changes
3. Changes are live immediately after deployment

---

## Email Confirmation Template

When a user registers for an event, your email system should:

1. Call the **Private API** with authentication
2. Get the `privateLocation` field
3. Include it in the confirmation email

**Email Template Example:**
```
Subject: Registration Confirmed - [Event Title]

Dear [Name],

Thank you for registering for [Event Title]!

Event Details:
📅 Date: [Date]
🕐 Time: [Time]
📍 Location:
[privateLocation from API]

We look forward to seeing you there!

Best regards,
Aliya Financial Team
```

---

## Testing the APIs

### Test Public API:
```bash
curl https://aliyafinancial.com/api/events
```

### Test Private API:
```bash
curl -H "Authorization: Bearer aliya-financial-secret-2025" \
  "https://aliyafinancial.com/api/event-details?eventId=event-001"
```

---

## Deployment Checklist

✅ Push code to GitHub
✅ Vercel auto-deploys
✅ Set `EVENT_API_TOKEN` environment variable in Vercel
✅ Test both API endpoints
✅ Update website to fetch from `/api/events`
✅ Configure email system to use `/api/event-details`

---

## Support

For questions or issues, refer to:
- Vercel Serverless Functions: https://vercel.com/docs/functions
- This documentation file
