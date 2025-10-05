/**
 * Google Apps Script to sync events to website
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire script
 * 4. Click the clock icon (Triggers) on the left sidebar
 * 5. Click "+ Add Trigger" at bottom right
 * 6. Configure:
 *    - Choose function: onEdit
 *    - Event source: From spreadsheet
 *    - Event type: On edit
 * 7. Click "Save"
 * 8. Authorize the script when prompted
 */

// Configuration
const WEBHOOK_URL = 'https://aliyafinancial.com/api/sync-events';
const GITHUB_WEBHOOK_URL = 'https://api.github.com/repos/Benklifa/aliya-financial-website/dispatches';
const GITHUB_TOKEN = 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN'; // You'll need to create this

/**
 * Triggered automatically when the sheet is edited
 */
function onEdit(e) {
  // Only sync if editing the main data range (columns A-F)
  const range = e.range;
  const sheet = range.getSheet();
  
  // Check if edit is in columns A through F
  if (range.getColumn() >= 1 && range.getColumn() <= 6) {
    Logger.log('Edit detected in event data range. Triggering sync...');
    syncEvents();
  }
}

/**
 * Manually trigger sync (can be run from Apps Script editor)
 */
function manualSync() {
  syncEvents();
}

/**
 * Main sync function
 */
function syncEvents() {
  try {
    // Step 1: Call the Vercel API to process the data
    Logger.log('Calling sync API...');
    const response = UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'get',
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      Logger.log('✓ Sync API called successfully');
      const data = JSON.parse(responseText);
      Logger.log(`✓ Synced ${data.publicJSON?.events?.length || 0} events`);
      
      // Step 2: Trigger GitHub Actions to update the JSON files
      triggerGitHubSync();
      
      // Step 3: Show success notification
      SpreadsheetApp.getActiveSpreadsheet().toast(
        `Successfully synced ${data.publicJSON?.events?.length || 0} events to website!`,
        'Sync Complete',
        5
      );
    } else {
      Logger.log('✗ Sync API error: ' + responseCode);
      Logger.log('Response: ' + responseText);
      
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'Failed to sync events. Check Apps Script logs for details.',
        'Sync Error',
        5
      );
    }
  } catch (error) {
    Logger.log('✗ Sync error: ' + error.toString());
    
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Error during sync: ' + error.toString(),
      'Sync Error',
      5
    );
  }
}

/**
 * Trigger GitHub Actions workflow to update JSON files
 */
function triggerGitHubSync() {
  try {
    // Only trigger if GitHub token is configured
    if (GITHUB_TOKEN === 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN') {
      Logger.log('⚠ GitHub token not configured. Skipping GitHub sync.');
      return;
    }
    
    const payload = {
      event_type: 'sync-events'
    };
    
    const options = {
      method: 'post',
      headers: {
        'Authorization': 'token ' + GITHUB_TOKEN,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(GITHUB_WEBHOOK_URL, options);
    
    if (response.getResponseCode() === 204) {
      Logger.log('✓ GitHub Actions workflow triggered');
    } else {
      Logger.log('⚠ GitHub trigger response: ' + response.getResponseCode());
    }
  } catch (error) {
    Logger.log('⚠ GitHub trigger error: ' + error.toString());
  }
}

/**
 * Create a menu in the spreadsheet for manual sync
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔄 Event Sync')
    .addItem('Sync to Website', 'manualSync')
    .addToUi();
}
