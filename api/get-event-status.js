// Vercel Serverless Function to get event registration status
import { readFileSync, writeFileSync, existsSync } from 'fs';

// Path to store registration counts (in /tmp for serverless)
const REGISTRATIONS_FILE = '/tmp/registrations.json';

// Initialize registrations file if it doesn't exist
function initRegistrations() {
  if (!existsSync(REGISTRATIONS_FILE)) {
    writeFileSync(REGISTRATIONS_FILE, JSON.stringify({}));
  }
}

// Get registration count for an event
function getRegistrationCount(eventId) {
  initRegistrations();
  try {
    const data = JSON.parse(readFileSync(REGISTRATIONS_FILE, 'utf8'));
    return data[eventId] || 0;
  } catch (error) {
    return 0;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch public events to get capacity
    const publicEventsUrl = `${req.headers.origin || 'https://aliyafinancial.com'}/public-events.json`;
    const response = await fetch(publicEventsUrl);
    const data = await response.json();

    if (!data.success || !data.events) {
      return res.status(500).json({ error: 'Failed to fetch events' });
    }

    // Build status for each event
    const eventStatuses = data.events.map(event => {
      const registrationCount = getRegistrationCount(event.id);
      const isFull = registrationCount >= event.capacity;
      
      return {
        id: event.id,
        capacity: event.capacity,
        registered: registrationCount,
        available: event.capacity - registrationCount,
        isFull: isFull
      };
    });

    return res.status(200).json({
      success: true,
      events: eventStatuses
    });

  } catch (error) {
    console.error('Error getting event status:', error);
    return res.status(500).json({
      error: 'Failed to get event status'
    });
  }
}
