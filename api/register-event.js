// Vercel Serverless Function for Event Registration with Gmail SMTP
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventId, eventTitle, name, email, phone } = req.body;

    // Validate required fields
    if (!eventId || !eventTitle || !name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch the private events data to get the exact address
    const privateEventsUrl = `${req.headers.origin || 'https://aliyafinancial.com'}/private-events.json`;
    
    let exactAddress = '';
    let eventDetails = null;
    
    try {
      const response = await fetch(privateEventsUrl);
      const data = await response.json();
      
      if (data.success && data.events) {
        eventDetails = data.events.find(e => e.id === eventId);
        if (eventDetails && eventDetails.exactAddress) {
          exactAddress = eventDetails.exactAddress;
        }
      }
    } catch (error) {
      console.error('Error fetching private events:', error);
      return res.status(500).json({ error: 'Failed to fetch event details' });
    }

    if (!exactAddress) {
      return res.status(404).json({ error: 'Event address not found' });
    }

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'michael@aliyafinancial.com',
        pass: 'yvwm jimu fsoo xwsv'
      }
    });

    // Format date and time for email
    const eventDate = new Date(eventDetails.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const [hours, minutes] = eventDetails.time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const formattedTime = `${displayHour}:${minutes} ${ampm}`;

    // Email content
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9fafb; padding: 30px; }
          .event-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #1e3a8a; }
          .address-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Registration Confirmed!</h1>
          </div>
          
          <div class="content">
            <p>Dear ${name},</p>
            
            <p>Thank you for registering for <strong>${eventTitle}</strong>!</p>
            
            <div class="event-details">
              <h2 style="color: #1e3a8a; margin-top: 0;">Event Details</h2>
              
              <div class="detail-row">
                <span class="label">Date:</span> ${formattedDate}
              </div>
              
              <div class="detail-row">
                <span class="label">Time:</span> ${formattedTime}
              </div>
              
              <div class="detail-row">
                <span class="label">Capacity:</span> ${eventDetails.capacity} attendees
              </div>
              
              <div class="address-box">
                <div class="detail-row">
                  <span class="label">📍 Event Address:</span><br>
                  <strong style="font-size: 16px;">${exactAddress}</strong>
                </div>
              </div>
            </div>
            
            <p><strong>About the Event:</strong></p>
            <p>${eventDetails.description}</p>
            
            <p>We look forward to seeing you there!</p>
            
            <p>If you have any questions, please don't hesitate to contact us at michael@aliyafinancial.com.</p>
            
            <p>Best regards,<br>
            <strong>Michael Benklifa</strong><br>
            Aliya Financial</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Aliya Financial. All rights reserved.</p>
            <p>Highland Park, NJ (USA) | Jerusalem, Israel</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send confirmation email to registrant
    await transporter.sendMail({
      from: '"Aliya Financial" <michael@aliyafinancial.com>',
      to: email,
      subject: `Registration Confirmed: ${eventTitle}`,
      html: emailHTML
    });

    // Send notification email to michael@aliyafinancial.com with registrant info
    const notificationHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9fafb; padding: 30px; }
          .registrant-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { margin: 10px 0; padding: 10px; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; color: #1e3a8a; display: inline-block; width: 120px; }
          .value { color: #374151; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Event Registration</h1>
          </div>
          
          <div class="content">
            <h2 style="color: #1e3a8a;">New Registrant for ${eventTitle}</h2>
            
            <div class="registrant-details">
              <h3 style="margin-top: 0; color: #059669;">Registrant Information</h3>
              
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">${name}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value"><a href="mailto:${email}">${email}</a></span>
              </div>
              
              <div class="detail-row">
                <span class="label">Phone:</span>
                <span class="value"><a href="tel:${phone}">${phone}</a></span>
              </div>
              
              <div class="detail-row">
                <span class="label">Event:</span>
                <span class="value">${eventTitle}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${formattedDate}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${formattedTime}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Location:</span>
                <span class="value">${exactAddress}</span>
              </div>
              
              <div class="detail-row" style="border-bottom: none;">
                <span class="label">Registered:</span>
                <span class="value">${new Date().toLocaleString('en-US', { 
                  dateStyle: 'full', 
                  timeStyle: 'short' 
                })}</span>
              </div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification. The registrant has been sent a confirmation email with the event address.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: '"Aliya Financial Registration System" <michael@aliyafinancial.com>',
      to: 'michael@aliyafinancial.com',
      subject: `New Registration: ${name} - ${eventTitle}`,
      html: notificationHTML
    });

    // Log the registration
    console.log('Event Registration:', {
      eventId,
      eventTitle,
      name,
      email,
      phone,
      exactAddress,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Registration successful! Check your email for confirmation with the event address.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Registration failed. Please try again.',
      details: error.message
    });
  }
}
