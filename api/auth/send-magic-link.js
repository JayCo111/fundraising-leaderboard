/**
 * Vercel Serverless Function: Send Magic Link
 *
 * This function runs on Vercel's servers when a user requests a login link.
 * It checks if the email exists in Google Sheets and sends a magic link via Resend.
 */

import { Resend } from 'resend';
import crypto from 'crypto';
import { createClient } from 'redis';

const resend = new Resend(process.env.RESEND_API_KEY);

// Create Redis client from REDIS_URL
let redisClient = null;
async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
  }
  return redisClient;
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { email } = req.body;

    // Validate email format
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Fetch students from Google Sheets
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.REACT_APP_GOOGLE_SHEET_ID}/values/Students!A2:K1000?key=${process.env.REACT_APP_GOOGLE_API_KEY}`;

    const sheetsResponse = await fetch(sheetsUrl);

    if (!sheetsResponse.ok) {
      console.error('Google Sheets API error:', sheetsResponse.status);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch student data'
      });
    }

    const sheetsData = await sheetsResponse.json();

    if (!sheetsData.values || sheetsData.values.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'No student data found'
      });
    }

    // Parse students data
    const students = sheetsData.values.map(row => ({
      StudentID: row[0] || '',
      FirstName: row[1] || '',
      LastName: row[2] || '',
      Team: row[3] || '',
      Goal_$: parseFloat(row[4]) || 0,
      ParentEmail: row[5] || '',
      PersonalLink: row[6] || '',
      QR_URL: row[7] || '',
      Avatar_URL: row[8] || '',
      Program: row[9] || '',
      QR_Link: row[10] || ''
    }));

    // Check if email exists
    const student = students.find(s =>
      s.ParentEmail.toLowerCase().trim() === cleanEmail
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Email not found. Please check your email address.'
      });
    }

    // Generate secure token (32 bytes = 64 hex characters)
    const token = crypto.randomBytes(32).toString('hex');

    // Store token in Redis with 15-minute expiry
    // Key: token, Value: email
    const redis = await getRedisClient();
    await redis.setEx(`magic-link:${token}`, 900, cleanEmail); // expires in 900 seconds (15 minutes)

    // Get the site URL (Vercel provides this automatically)
    const siteUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    // Create magic link
    const magicLink = `${siteUrl}?token=${token}`;

    // Send email via Resend
    console.log('📧 Attempting to send email via Resend:', {
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: cleanEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    });

    const emailResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: cleanEmail,
      subject: '🏆 Your SportsRaiser Login Link',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏆 SportsRaiser</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Fundraising Leaderboard</p>
          </div>

          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${student.FirstName}! 👋</h2>

            <p style="color: #4b5563; font-size: 16px;">
              Click the button below to securely log in to your fundraising dashboard.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}"
                 style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                🔐 Log In to Dashboard
              </a>
            </div>

            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                <strong>Team:</strong> ${student.Team}<br>
                <strong>Program:</strong> ${student.Program}
              </p>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              <strong>⏱️ This link expires in 15 minutes</strong> for your security.
            </p>

            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              If you didn't request this login link, you can safely ignore this email.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} SportsRaiser. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    });

    if (emailResult.error) {
      console.error('❌ Resend API error:', {
        error: emailResult.error,
        message: emailResult.error?.message,
        statusCode: emailResult.error?.statusCode,
        name: emailResult.error?.name
      });
      return res.status(500).json({
        success: false,
        error: 'Failed to send email. Please try again.',
        details: process.env.NODE_ENV === 'development' ? emailResult.error : undefined
      });
    }

    console.log('✅ Magic link sent:', {
      emailId: emailResult.data?.id,
      recipient: cleanEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email for privacy
      expiresIn: '15 minutes'
    });

    return res.status(200).json({
      success: true,
      message: 'Check your email! We sent you a login link.'
    });

  } catch (error) {
    console.error('❌ Send magic link error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    // Clean up Redis connection if needed
    if (redisClient) {
      try {
        await redisClient.quit();
        redisClient = null;
      } catch (err) {
        console.error('Redis cleanup error:', err);
      }
    }
  }
}
