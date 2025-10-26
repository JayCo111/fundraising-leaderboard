/**
 * Vercel Serverless Function: Verify Magic Link Token
 *
 * This function runs when a user clicks the magic link in their email.
 * It verifies the token and returns the student data for authentication.
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { token } = req.body;

    // Validate token format
    if (!token || typeof token !== 'string' || token.length !== 64) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token format'
      });
    }

    // Look up token in Vercel KV
    const email = await kv.get(`magic-link:${token}`);

    if (!email) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired login link. Please request a new one.'
      });
    }

    // Delete token immediately (one-time use)
    await kv.del(`magic-link:${token}`);

    // Fetch student data from Google Sheets
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

    // Find student by email
    const student = students.find(s =>
      s.ParentEmail.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    console.log('✅ User authenticated:', {
      studentId: student.StudentID,
      email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email for privacy
      team: student.Team
    });

    // Return student data
    return res.status(200).json({
      success: true,
      user: {
        StudentID: student.StudentID,
        FirstName: student.FirstName,
        LastName: student.LastName,
        Team: student.Team,
        Goal_$: student.Goal_$,
        ParentEmail: student.ParentEmail,
        PersonalLink: student.PersonalLink,
        QR_URL: student.QR_URL,
        Avatar_URL: student.Avatar_URL,
        Program: student.Program,
        QR_Link: student.QR_Link
      }
    });

  } catch (error) {
    console.error('Verify token error:', error);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again.'
    });
  }
}
