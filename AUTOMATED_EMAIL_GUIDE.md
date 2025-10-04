# 🚀 Automated Email Confirmation Guide

This guide explains how to use the fully automated email confirmation system. It sends professional, branded HTML emails with the private event address to registered attendees.

**The solution is designed to be as simple as possible, as requested.**

---

## ✅ System Overview

- **Automated:** Sends emails by running a single command.
- **Secure:** Keeps your private event addresses safe and only sends them to registered users.
- **Professional:** Uses a branded HTML email template.
- **Reliable:** Powered by SendGrid for excellent email deliverability.

---

## ⚙️ One-Time Setup (5-10 minutes)

You only need to do this once. After this, sending emails is a single command.

### Step 1: Sign Up for SendGrid

1.  Go to [sendgrid.com](https://sendgrid.com) and sign up for a **Free** account.
2.  The free plan includes **100 emails per day**, which is more than enough for your current needs.

### Step 2: Verify Your Sender Email

1.  In your SendGrid dashboard, you must verify the email address you want to send emails *from* (e.g., `contact@aliyafinancial.com`).
2.  This is a required step to prevent spam and ensures your emails are delivered.
3.  Follow SendGrid's instructions for [Sender Authentication](https://docs.sendgrid.com/for-senders/sending-email/sender-authentication).

### Step 3: Get Your SendGrid API Key

1.  In your SendGrid dashboard, go to **Settings -> API Keys**.
2.  Click **Create API Key**.
3.  Give it a name (e.g., "Aliya Financial Website") and choose **Full Access** permissions.
4.  **Copy the API key immediately.** You will not be able to see it again.

### Step 4: Configure Your Project

1.  **Create the `.env` file:**
    - In the project directory (`/home/ubuntu/aliya-financial-repo/`), there is a file named `.env.example`.
    - Make a copy of it and rename the copy to `.env`.

2.  **Add your API Key:**
    - Open the new `.env` file.
    - Paste your SendGrid API key into it, replacing the placeholder text.
    - It should look like this:
      ```
      SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxx
      ```

3.  **Set Your Sender Email:**
    - Open the file `send-email-sendgrid.js`.
    - On line 20, change `your-email@example.com` to the email address you verified in SendGrid.
      ```javascript
      // BEFORE
      const SENDER_EMAIL = 'your-email@example.com';

      // AFTER
      const SENDER_EMAIL = 'contact@aliyafinancial.com'; // Or your verified email
      ```

**That's it! Your system is now configured.**

---

## ✉️ How to Send a Confirmation Email

Whenever a user registers for an event, run the following command in your server's terminal.

### Command

```bash
cd /home/ubuntu/aliya-financial-repo
node send-email-sendgrid.js <EVENT_ID> <ATTENDEE_EMAIL> "<ATTENDEE_NAME>"
```

### Arguments

-   `<EVENT_ID>`: The ID of the event from `data/events.json` (e.g., `event-001`).
-   `<ATTENDEE_EMAIL>`: The email address of the person who registered.
-   `"<ATTENDEE_NAME>"`: The name of the person who registered. **Must be in quotes.**

### Example

To send a confirmation to John Doe for the Aliyah Financial Planning Workshop:

```bash
node send-email-sendgrid.js event-001 john.doe@email.com "John Doe"
```

**Result:** John Doe will instantly receive a confirmation email containing the full private address: `49 Tchernichovsky Street, Jerusalem`.

---

## 🌐 Integrating with Your Website Form

To make this fully automatic, your website's registration form should trigger the command above.

When your website's backend (e.g., on Vercel Serverless Functions) processes a new registration, it should execute the `send-email-sendgrid.js` script with the registrant's details.

Here is a simplified example of how that would look in a Node.js backend:

```javascript
// Example of a serverless function for /api/register
const { exec } = require("child_process");

// Get registration data from the form submission
const eventId = "event-001"; // From the form
const attendeeEmail = "jane.doe@example.com"; // From the form
const attendeeName = "Jane Doe"; // From the form

// Construct the command
const command = `node send-email-sendgrid.js ${eventId} ${attendeeEmail} "${attendeeName}"`;

// Execute the script to send the email
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Email sending error: ${error.message}`);
    return;
  }
  console.log(`Email sent successfully: ${stdout}`);
});
```

---

## 🛠️ Testing Your Setup

Before sending real emails, you can use the built-in test script to make sure everything is configured correctly.

```bash
cd /home/ubuntu/aliya-financial-repo
node test-email-setup.js
```

This script will check for your API key, event data, and sender email configuration and report any issues.

---

## 📂 File Summary

-   `AUTOMATED_EMAIL_GUIDE.md`: **(This file)** Your guide to the system.
-   `send-email-sendgrid.js`: The main script that sends emails.
-   `test-email-setup.js`: The script to test your configuration.
-   `data/events.json`: Your event database. Edit this to add new events or change details.
-   `.env`: Your private configuration file for the API key. **(Do not share this file)**
-   `.env.example`: A template for the `.env` file.

