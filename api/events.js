// Vercel Serverless Function - Public Events API
// Returns events with PUBLIC location only (for website display)

import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read events data
    const eventsPath = path.join(process.cwd(), 'data', 'events.json');
    const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

    // Return only public information (remove privateLocation)
    const publicEvents = eventsData.events.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      description: event.description,
      location: event.publicLocation, // Only public location
      capacity: event.capacity,
      registrationOpen: event.registrationOpen
    }));

    res.status(200).json({
      success: true,
      events: publicEvents
    });
  } catch (error) {
    console.error('Error reading events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load events'
    });
  }
}
