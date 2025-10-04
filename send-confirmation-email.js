#!/usr/bin/env node

/**
 * Email Confirmation Script
 * 
 * This script sends confirmation emails with PRIVATE location details.
 * Run this script server-side when someone registers for an event.
 * 
 * Usage:
 *   node send-confirmation-email.js <eventId> <attendeeEmail> <attendeeName>
 * 
 * Example:
 *   node send-confirmation-email.js event-001 john@example.com "John Doe"
 */

const fs = require('fs');
const path = require('path');

// Read events data with private locations
function getEventDetails(eventId) {
  const eventsPath = path.join(__dirname, 'data', 'events.json');
  const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
  
  const event = eventsData.events.find(e => e.id === eventId);
  
  if (!event) {
    throw new Error(`Event not found: ${eventId}`);
  }
  
  if (!event.privateLocation) {
    throw new Error(`Event ${eventId} is missing privateLocation - cannot send confirmation`);
  }
  
  return event;
}

// Generate email HTML
function generateEmailHTML(event, attendeeName) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Registration Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Aliya Financial</h1>
        <p style="margin: 5px 0 0 0;">Event Registration Confirmed</p>
    </div>

    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        
        <p>Dear <strong>${attendeeName}</strong>,</p>

        <p>Thank you for registering for our upcoming event! We're excited to see you there.</p>

        <div style="background: white; border-left: 4px solid #1e3a8a; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Event Details</h2>
            
            <p style="margin: 10px 0;">
                <strong>📅 Event:</strong><br>
                ${event.title}
            </p>

            <p style="margin: 10px 0;">
                <strong>🗓️ Date:</strong><br>
                ${event.date}
            </p>

            <p style="margin: 10px 0;">
                <strong>🕐 Time:</strong><br>
                ${event.time}
            </p>

            <p style="margin: 10px 0;">
                <strong>📍 Location:</strong><br>
                <span style="color: #dc2626; white-space: pre-line;">${event.privateLocation}</span>
            </p>

            <p style="margin: 10px 0;">
                <strong>📝 Description:</strong><br>
                ${event.description}
            </p>
        </div>

        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0;"><strong>⚠️ Please Note:</strong></p>
            <p style="margin: 5px 0 0 0;">The full address above is provided for registered attendees only. Please keep this information private.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <p>Need to make changes to your registration?</p>
            <a href="https://aliyafinancial.com/contact" style="background: #1e3a8a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Contact Us</a>
        </div>

        <p>We look forward to seeing you at the event!</p>

        <p>
            Best regards,<br>
            <strong>The Aliya Financial Team</strong>
        </p>

    </div>

    <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
        <p>Aliya Financial - Cross-Border Financial Planning</p>
        <p>
            <a href="https://aliyafinancial.com" style="color: #1e3a8a; text-decoration: none;">Visit our website</a> | 
            <a href="https://aliyafinancial.com/contact" style="color: #1e3a8a; text-decoration: none;">Contact Us</a>
        </p>
    </div>

</body>
</html>
  `;
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: node send-confirmation-email.js <eventId> <attendeeEmail> <attendeeName>');
    console.error('Example: node send-confirmation-email.js event-001 john@example.com "John Doe"');
    process.exit(1);
  }
  
  const [eventId, attendeeEmail, attendeeName] = args;
  
  try {
    // Get event details with private location
    const event = getEventDetails(eventId);
    
    console.log('\n✅ Event found:', event.title);
    console.log('📍 Private Location:', event.privateLocation);
    console.log('\n📧 Email would be sent to:', attendeeEmail);
    console.log('👤 Attendee:', attendeeName);
    
    // Generate email HTML
    const emailHTML = generateEmailHTML(event, attendeeName);
    
    // Save to file for preview
    const outputPath = path.join(__dirname, 'preview-email.html');
    fs.writeFileSync(outputPath, emailHTML);
    console.log('\n✅ Email preview saved to:', outputPath);
    console.log('Open this file in a browser to see how the email will look.');
    
    console.log('\n📝 To actually send emails, integrate with an email service:');
    console.log('   - SendGrid: https://sendgrid.com');
    console.log('   - Mailgun: https://mailgun.com');
    console.log('   - Resend: https://resend.com');
    console.log('\nSee EMAIL_INTEGRATION_GUIDE.md for detailed instructions.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { getEventDetails, generateEmailHTML };
