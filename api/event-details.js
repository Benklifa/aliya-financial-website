// Vercel Serverless Function - Private Event Details API
// Returns event with PRIVATE location (for confirmation emails)
// Requires authentication token for security

const fs = require('fs');
const path = require('path');

// Simple token-based authentication
// In production, use environment variables for the token
const AUTH_TOKEN = process.env.EVENT_API_TOKEN || 'aliya-financial-secret-2025';

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid or missing authentication token'
    });
  }

  // Get event ID from query parameter
  const { eventId } = req.query;
  if (!eventId) {
    return res.status(400).json({
      success: false,
      error: 'Missing eventId parameter'
    });
  }

  try {
    // Read events data
    const eventsPath = path.join(process.cwd(), 'data', 'events.json');
    const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

    // Find the specific event
    const event = eventsData.events.find(e => e.id === eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Return full event details including PRIVATE location
    res.status(200).json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        description: event.description,
        publicLocation: event.publicLocation,
        privateLocation: event.privateLocation, // Full address for email
        capacity: event.capacity,
        registrationOpen: event.registrationOpen
      }
    });
  } catch (error) {
    console.error('Error reading event details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load event details'
    });
  }
};
