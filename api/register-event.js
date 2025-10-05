// Vercel Serverless Function for Event Registration
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
    try {
      const response = await fetch(privateEventsUrl);
      const data = await response.json();
      
      if (data.success && data.events) {
        const event = data.events.find(e => e.id === eventId);
        if (event && event.exactAddress) {
          exactAddress = event.exactAddress;
        }
      }
    } catch (error) {
      console.error('Error fetching private events:', error);
      // Continue without exact address if fetch fails
    }

    // For now, log the registration (in production, you'd send an email here)
    console.log('Event Registration:', {
      eventId,
      eventTitle,
      name,
      email,
      phone,
      exactAddress,
      timestamp: new Date().toISOString()
    });

    // TODO: Send confirmation email with exact address
    // This would integrate with SendGrid, Mailgun, or similar email service
    // Example:
    // await sendConfirmationEmail({
    //   to: email,
    //   subject: `Registration Confirmed: ${eventTitle}`,
    //   body: `
    //     Dear ${name},
    //     
    //     Thank you for registering for ${eventTitle}!
    //     
    //     Event Address:
    //     ${exactAddress}
    //     
    //     We look forward to seeing you!
    //   `
    // });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Registration successful! Check your email for confirmation.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Registration failed. Please try again.'
    });
  }
}
