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
    const { action, sheetId, data: requestData, referralId } = data;
    
    let result;
    
    switch (action) {
      case 'addReferral':
        result = addReferral(sheetId, requestData);
        break;
      case 'updateReferral':
        result = updateReferral(sheetId, referralId, requestData);
        break;
      default:
        throw new Error('Invalid action');
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
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