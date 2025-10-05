#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

const SHEET_ID = '1qlYUC6pAoo_XMxT9uldytnuqK8aC4YBgxiCYMgKIbvs';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

function fetchSheetData() {
  return new Promise((resolve, reject) => {
    https.get(CSV_URL, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  const events = [];
  for (let i = 1; i < lines.length; i++) {
    // Parse CSV line handling quoted fields
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length >= 7) {
      const eventId = `event-${String(i).padStart(3, '0')}`;
      
      // Parse date (MM/DD/YYYY to YYYY-MM-DD)
      const dateParts = values[2].split('/');
      const isoDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
      
      // Parse time (convert to 24-hour format)
      const timeMatch = values[3].match(/(\d+):(\d+):(\d+)\s*(AM|PM)/i);
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2];
      if (timeMatch[4].toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (timeMatch[4].toUpperCase() === 'AM' && hours === 12) hours = 0;
      const time24 = `${String(hours).padStart(2, '0')}:${minutes}`;
      
      events.push({
        id: eventId,
        name: values[0],
        subtitle: values[1],
        date: isoDate,
        time: time24,
        city: values[4],
        capacity: parseInt(values[5]) || 0,
        exactAddress: values[6],
        registrationOpen: true
      });
    }
  }
  
  return events;
}

async function main() {
  try {
    console.log('Fetching event data from Google Sheets...');
    const csvData = await fetchSheetData();
    const events = parseCSV(csvData);
    
    // Public events JSON (for website - columns A-F, NO exact address)
    const publicEvents = events.map(e => ({
      id: e.id,
      title: e.name,
      description: e.subtitle,
      date: e.date,
      time: e.time,
      location: e.city,
      capacity: e.capacity,
      registrationOpen: e.registrationOpen
    }));
    
    fs.writeFileSync('public-events.json', JSON.stringify({
      success: true,
      events: publicEvents
    }, null, 2));
    
    // Private events JSON (for emails - columns A-E + G with exact address)
    const privateEvents = events.map(e => ({
      id: e.id,
      title: e.name,
      description: e.subtitle,
      date: e.date,
      time: e.time,
      location: e.exactAddress,  // Use exact address from column G
      capacity: e.capacity,
      registrationOpen: e.registrationOpen
    }));
    
    fs.writeFileSync('private-events.json', JSON.stringify({
      success: true,
      events: privateEvents
    }, null, 2));
    
    console.log(`✓ Generated public-events.json (${publicEvents.length} events)`);
    console.log(`✓ Generated private-events.json (${privateEvents.length} events)`);
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
