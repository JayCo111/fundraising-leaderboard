/**
 * Google Apps Script for Fundraising App
 * 
 * This script handles write operations to Google Sheets for the fundraising app.
 * Deploy this as a web app with execute permissions set to "Anyone".
 * 
 * Instructions:
 * 1. Create a new Google Apps Script project
 * 2. Replace the default code with this script
 * 3. Deploy as web app with execute permissions set to "Anyone"
 * 4. Copy the web app URL and set it as REACT_APP_GOOGLE_APPS_SCRIPT_URL in your .env file
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { action } = data;

    let result;

    switch (action) {
      case 'sendMagicLink':
        result = sendMagicLink(e);
        break;
      case 'verifyToken':
        result = verifyToken(e);
        break;
      case 'addReferral':
        result = addReferral(data.sheetId, data.data);
        break;
      case 'updateReferral':
        result = updateReferral(data.sheetId, data.referralId, data.data);
        break;
      default:
        throw new Error('Invalid action');
    }

    return result;

  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendMagicLink(e) {
  const data = JSON.parse(e.postData.contents);
  const { email, resendApiKey, sheetId, appUrl } = data;

  // Generate random token
  const token = Utilities.getUuid();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

  // Save to AuthTokens sheet
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('AuthTokens');
  sheet.appendRow([token, email, expiresAt.toISOString(), new Date().toISOString(), false]);

  // Send email via Resend
  const magicLink = `${appUrl}/login?token=${token}`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0891b2;">SportsRaiser Login</h2>
      <p>Click the button below to log in to your fundraising dashboard:</p>
      <a href="${magicLink}" style="display: inline-block; background: linear-gradient(to right, #0891b2, #2563eb); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
        Log In to SportsRaiser
      </a>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        This link expires in 15 minutes. If you didn't request this, ignore this email.
      </p>
    </div>
  `;

  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({
      from: 'SportsRaiser <noreply@yourdomain.com>',
      to: email,
      subject: 'Your SportsRaiser Login Link',
      html: emailHtml
    })
  };

  UrlFetchApp.fetch('https://api.resend.com/emails', options);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function verifyToken(e) {
  const data = JSON.parse(e.postData.contents);
  const { token, sheetId } = data;

  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('AuthTokens');
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === token) {
      const expiresAt = new Date(values[i][2]);
      const used = values[i][4];

      if (used) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Token already used'
        })).setMimeType(ContentService.MimeType.JSON);
      }

      if (expiresAt < new Date()) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Token expired'
        })).setMimeType(ContentService.MimeType.JSON);
      }

      // Mark as used
      sheet.getRange(i + 1, 5).setValue(true);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        email: values[i][1]
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: 'Invalid token'
  })).setMimeType(ContentService.MimeType.JSON);
}

function addReferral(sheetId, referralData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getSheetByName('Referrals');
    
    if (!sheet) {
      throw new Error('Referrals sheet not found');
    }
    
    // Generate unique referral ID
    const referralId = generateReferralId();
    const timestamp = new Date().toISOString();
    
    // Prepare row data
    const rowData = [
      referralId,                    // ReferralID
      referralData.studentId,        // StudentID
      referralData.referralName,     // ReferralName
      referralData.referralEmail,    // ReferralEmail
      referralData.referralPhone,    // ReferralPhone
      referralData.organization,     // Organization
      referralData.stage,            // Stage
      referralData.points || 0,      // Points
      timestamp,                     // DateAdded
      timestamp                      // LastUpdated
    ];
    
    // Add the row to the sheet
    sheet.appendRow(rowData);
    
    return {
      success: true,
      data: {
        referralId: referralId,
        message: 'Referral added successfully'
      }
    };
    
  } catch (error) {
    console.error('Error adding referral:', error);
    throw new Error('Failed to add referral: ' + error.message);
  }
}

function updateReferral(sheetId, referralId, updateData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getSheetByName('Referrals');
    
    if (!sheet) {
      throw new Error('Referrals sheet not found');
    }
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Find the row with the matching referral ID
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) { // Skip header row
      if (values[i][0] === referralId) {
        rowIndex = i + 1; // Convert to 1-based index
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error('Referral not found');
    }
    
    // Update the specific cells
    const timestamp = new Date().toISOString();
    
    if (updateData.referralName) sheet.getRange(rowIndex, 3).setValue(updateData.referralName);
    if (updateData.referralEmail) sheet.getRange(rowIndex, 4).setValue(updateData.referralEmail);
    if (updateData.referralPhone) sheet.getRange(rowIndex, 5).setValue(updateData.referralPhone);
    if (updateData.organization) sheet.getRange(rowIndex, 6).setValue(updateData.organization);
    if (updateData.stage) sheet.getRange(rowIndex, 7).setValue(updateData.stage);
    if (updateData.points !== undefined) sheet.getRange(rowIndex, 8).setValue(updateData.points);
    
    // Always update the LastUpdated timestamp
    sheet.getRange(rowIndex, 10).setValue(timestamp);
    
    return {
      success: true,
      data: {
        referralId: referralId,
        message: 'Referral updated successfully'
      }
    };
    
  } catch (error) {
    console.error('Error updating referral:', error);
    throw new Error('Failed to update referral: ' + error.message);
  }
}

function generateReferralId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  return `REF-${timestamp}-${random}`.toUpperCase();
}

// Test function to verify the script works
function testAddReferral() {
  const testData = {
    studentId: 'TEST-001',
    referralName: 'Test Referral',
    referralEmail: 'test@example.com',
    referralPhone: '555-1234',
    organization: 'Test Org',
    stage: 'Contacted',
    points: 10
  };
  
  const result = addReferral('YOUR_SHEET_ID_HERE', testData);
  console.log('Test result:', result);
}