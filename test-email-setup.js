#!/usr/bin/env node

/**
 * Test Email Setup Script
 * 
 * This script validates your email configuration without sending actual emails.
 * Use this to verify everything is set up correctly before going live.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Testing Email Configuration...\n');

// Check 1: Node modules
console.log('✓ Checking dependencies...');
try {
  require('@sendgrid/mail');
  console.log('  ✅ SendGrid package installed');
} catch (error) {
  console.log('  ❌ SendGrid package not found');
  console.log('     Run: npm install @sendgrid/mail dotenv');
  process.exit(1);
}

// Check 2: Environment variables
console.log('\n✓ Checking environment variables...');
if (process.env.SENDGRID_API_KEY) {
  const key = process.env.SENDGRID_API_KEY;
  if (key.startsWith('SG.') && key.length > 20) {
    console.log('  ✅ SENDGRID_API_KEY found and looks valid');
  } else if (key.includes('DEMO') || key.includes('REPLACE')) {
    console.log('  ⚠️  SENDGRID_API_KEY found but is a placeholder');
    console.log('     Update .env with your real API key');
  } else {
    console.log('  ⚠️  SENDGRID_API_KEY found but format looks unusual');
    console.log('     Make sure it starts with "SG."');
  }
} else {
  console.log('  ❌ SENDGRID_API_KEY not found');
  console.log('     Create .env file with: SENDGRID_API_KEY=your_key_here');
  process.exit(1);
}

// Check 3: Events data
console.log('\n✓ Checking events data...');
const eventsPath = path.join(__dirname, 'data', 'events.json');
if (fs.existsSync(eventsPath)) {
  const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
  console.log('  ✅ events.json found');
  console.log(`  ✅ ${eventsData.events.length} event(s) configured`);
  
  eventsData.events.forEach(event => {
    console.log(`\n  Event: ${event.id}`);
    console.log(`    Title: ${event.title}`);
    console.log(`    Public Location: ${event.publicLocation}`);
    if (event.privateLocation) {
      console.log(`    Private Location: ✅ Configured`);
      console.log(`      → ${event.privateLocation.split('\n')[0]}`);
    } else {
      console.log(`    Private Location: ❌ Missing`);
    }
  });
} else {
  console.log('  ❌ events.json not found');
  process.exit(1);
}

// Check 4: Script files
console.log('\n✓ Checking script files...');
const scriptPath = path.join(__dirname, 'send-email-sendgrid.js');
if (fs.existsSync(scriptPath)) {
  console.log('  ✅ send-email-sendgrid.js found');
} else {
  console.log('  ❌ send-email-sendgrid.js not found');
  process.exit(1);
}

// Check 5: Sender email configuration
console.log('\n✓ Checking sender configuration...');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');
const senderMatch = scriptContent.match(/const SENDER_EMAIL = ['"](.+?)['"]/);
if (senderMatch) {
  const senderEmail = senderMatch[1];
  if (senderEmail.includes('example.com') || senderEmail.includes('your-email')) {
    console.log(`  ⚠️  Sender email is placeholder: ${senderEmail}`);
    console.log('     Update SENDER_EMAIL in send-email-sendgrid.js');
    console.log('     Must match a verified email in SendGrid');
  } else {
    console.log(`  ✅ Sender email configured: ${senderEmail}`);
    console.log('     Make sure this email is verified in SendGrid!');
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📋 SETUP SUMMARY');
console.log('='.repeat(60));

console.log('\nTo complete setup:');
console.log('1. Sign up at https://sendgrid.com (free tier available)');
console.log('2. Verify your sender email address');
console.log('3. Get API key from SendGrid dashboard');
console.log('4. Update .env file with real API key');
console.log('5. Update SENDER_EMAIL in send-email-sendgrid.js');
console.log('6. Run test: node send-email-sendgrid.js event-001 your@email.com "Your Name"');

console.log('\n✅ Configuration test complete!\n');
