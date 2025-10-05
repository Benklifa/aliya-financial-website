// Vercel Serverless Function to sync events from Google Sheets
import { google } from 'googleapis';

export default async function handler(req, res) {
  // Allow both GET and POST for testing and webhook
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Google Sheets configuration
    const SHEET_ID = '1qlYUC6pAoo_XMxT9uldytnuqK8aC4YBgxiCYMgKIbvs';
    const RANGE = 'Sheet1!A2:F100'; // Adjust sheet name if needed

    // Set up Google Sheets API with service account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No events found in sheet',
        events: []
      });
    }

    // Parse events from sheet
    const publicEvents = [];
    const privateEvents = [];

    rows.forEach((row, index) => {
      // Skip empty rows
      if (!row[0] || !row[2]) return;

      const eventId = `event-${String(index + 1).padStart(3, '0')}`;
      const title = row[0] || '';
      const description = row[1] || '';
      const date = parseDate(row[2]);
      const time = parseTime(row[3]);
      const city = row[4] || '';
      const exactAddress = row[5] || '';

      // Public event (without exact address)
      publicEvents.push({
        id: eventId,
        title: title,
        description: description,
        date: date,
        time: time,
        location: `${city} (Full address provided upon registration)`,
        registrationOpen: true
      });

      // Private event (with exact address)
      privateEvents.push({
        id: eventId,
        title: title,
        description: description,
        date: date,
        time: time,
        location: `${city} (Full address provided upon registration)`,
        exactAddress: exactAddress,
        registrationOpen: true
      });
    });

    // Create JSON objects
    const publicJSON = {
      success: true,
      events: publicEvents
    };

    const privateJSON = {
      success: true,
      events: privateEvents
    };

    // In production, we would write these to files or a database
    // For now, return the data so it can be manually updated or 
    // used by a GitHub Actions workflow

    return res.status(200).json({
      success: true,
      message: `Synced ${publicEvents.length} events from Google Sheets`,
      publicJSON: publicJSON,
      privateJSON: privateJSON,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to sync events',
      details: error.message
    });
  }
}

// Helper function to parse date from various formats
function parseDate(dateStr) {
  if (!dateStr) return '';
  
  // Try to parse the date
  const date = new Date(dateStr);
  
  if (isNaN(date.getTime())) {
    // If parsing fails, return as-is
    return dateStr;
  }
  
  // Return in YYYY-MM-DD format
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Helper function to parse time to 24-hour format
function parseTime(timeStr) {
  if (!timeStr) return '';
  
  // If already in HH:MM format, return as-is
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    const [hours, minutes] = timeStr.split(':');
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }
  
  // Try to parse time with AM/PM
  const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2] || '00';
    const period = match[3].toLowerCase();
    
    if (period === 'pm' && hours !== 12) {
      hours += 12;
    } else if (period === 'am' && hours === 12) {
      hours = 0;
    }
    
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }
  
  // Return as-is if can't parse
  return timeStr;
}
