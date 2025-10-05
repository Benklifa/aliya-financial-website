# Google Sheets Auto-Sync Setup Guide

This guide will help you set up automatic synchronization between your Google Sheet and the Aliya Financial website.

## Overview

When you edit your Google Sheet, the changes will automatically sync to your website within minutes.

## Setup Steps

### Step 1: Set up Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create a Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Name it "aliya-events-sync"
   - Click "Create and Continue"
   - Skip optional steps and click "Done"
5. Create a key for the service account:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Click "Create" (a JSON file will download)

### Step 2: Share Google Sheet with Service Account

1. Open the downloaded JSON file
2. Find the `client_email` field (looks like: `aliya-events-sync@project-id.iam.gserviceaccount.com`)
3. Copy this email address
4. Open your Google Sheet
5. Click "Share" button
6. Paste the service account email
7. Give it "Viewer" access
8. Uncheck "Notify people"
9. Click "Share"

### Step 3: Add Environment Variables to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (aliya-financial-website)
3. Go to "Settings" > "Environment Variables"
4. Add the following variables from your JSON file:

   ```
   GOOGLE_PROJECT_ID = [from "project_id" in JSON]
   GOOGLE_PRIVATE_KEY_ID = [from "private_key_id" in JSON]
   GOOGLE_PRIVATE_KEY = [from "private_key" in JSON - keep the quotes and \\n]
   GOOGLE_CLIENT_EMAIL = [from "client_email" in JSON]
   GOOGLE_CLIENT_ID = [from "client_id" in JSON]
   ```

5. Make sure to select "Production", "Preview", and "Development" for each variable
6. Click "Save"

### Step 4: Install Google Apps Script

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1qlYUC6pAoo_XMxT9uldytnuqK8aC4YBgxiCYMgKIbvs/edit
2. Go to **Extensions** > **Apps Script**
3. Delete any existing code
4. Copy the entire content from `google-apps-script-sync.js`
5. Paste it into the Apps Script editor
6. Click the disk icon to save
7. Name the project "Event Sync"

### Step 5: Set up Trigger

1. In Apps Script editor, click the clock icon (Triggers) on the left
2. Click "+ Add Trigger" at bottom right
3. Configure:
   - Choose function: **onEdit**
   - Event source: **From spreadsheet**
   - Event type: **On edit**
4. Click "Save"
5. You may need to authorize the script:
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" > "Go to Event Sync (unsafe)"
   - Click "Allow"

### Step 6: Test the Sync

1. Go back to your Google Sheet
2. Make a small edit to any event (e.g., change a date)
3. You should see a toast notification: "Successfully synced X events to website!"
4. Wait 1-2 minutes for Vercel to redeploy
5. Check your website to see the changes

## Manual Sync

You can also manually trigger a sync:

1. In your Google Sheet, you'll see a new menu: **🔄 Event Sync**
2. Click it and select **"Sync to Website"**

## How It Works

1. **You edit the Google Sheet** → Apps Script detects the change
2. **Apps Script calls** `/api/sync-events` → Vercel API reads the sheet
3. **API returns formatted JSON** → GitHub Actions workflow updates files
4. **JSON files updated** → Vercel auto-deploys the changes
5. **Website updated** → Visitors see new event data

## Troubleshooting

### Sync not working?

1. Check Apps Script logs:
   - Go to Extensions > Apps Script
   - Click "Executions" on the left
   - Look for errors

2. Check Vercel logs:
   - Go to Vercel Dashboard > Your Project > Logs
   - Look for `/api/sync-events` calls

3. Verify service account has access:
   - Make sure the service account email is shared with the sheet
   - Check it has "Viewer" permission

### Events not updating?

1. Check the JSON files in your repo:
   - Go to https://github.com/Benklifa/aliya-financial-website
   - Look at `public-events.json` and `private-events.json`
   - See if they have the latest data

2. Hard refresh your browser:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

## Column Mapping

Your Google Sheet columns are mapped as follows:

- **Column A**: Event Name → `title`
- **Column B**: Event Subtitle → `description`
- **Column C**: Date → `date` (formatted as YYYY-MM-DD)
- **Column D**: Time → `time` (formatted as HH:MM in 24-hour)
- **Column E**: City → `location` (shown as "City (Full address provided upon registration)")
- **Column F**: Exact Address → `exactAddress` (only in private-events.json, sent in confirmation emails)

## Support

If you need help, check:
- Vercel logs for API errors
- Apps Script execution logs for sync errors
- GitHub Actions for workflow status
