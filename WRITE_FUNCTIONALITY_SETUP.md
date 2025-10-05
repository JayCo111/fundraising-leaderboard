# Fundraising App - Write Functionality Setup

This document explains how to set up the write functionality for saving referrals to Google Sheets.

## Prerequisites

1. A Google Sheets document with the following structure:
   - **Students** sheet: Student data
   - **Orders** sheet: Order data  
   - **Referrals** sheet: Referral data (columns: ReferralID, StudentID, ReferralName, ReferralEmail, ReferralPhone, Organization, Stage, Points, DateAdded, LastUpdated)
   - **Programs** sheet: Team/Program mapping

2. Google Apps Script access
3. Environment variables configured

## Setup Steps

### 1. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Google Sheets Configuration
REACT_APP_GOOGLE_SHEET_ID=your_google_sheet_id_here
REACT_APP_GOOGLE_API_KEY=your_google_api_key_here

# Google Apps Script Web App URL (for write operations)
REACT_APP_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### 2. Google Apps Script Setup

1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Replace the default code with the contents of `google-apps-script.js`
4. Update the `testAddReferral` function with your actual sheet ID for testing
5. Save the project
6. Deploy as a web app:
   - Click "Deploy" > "New deployment"
   - Choose "Web app" as the type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
7. Copy the web app URL and add it to your `.env` file as `REACT_APP_GOOGLE_APPS_SCRIPT_URL`

### 3. Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Create credentials (API Key)
5. Add the API key to your `.env` file as `REACT_APP_GOOGLE_API_KEY`
6. Optionally, restrict the API key to your domain for security

### 4. Sheet Structure

Ensure your Google Sheet has a "Referrals" sheet with these columns (A-J):
- A: ReferralID (auto-generated)
- B: StudentID (linked to Students sheet)
- C: ReferralName
- D: ReferralEmail  
- E: ReferralPhone
- F: Organization
- G: Stage (Contacted, Interested, Meeting Scheduled, Signed Up)
- H: Points (numeric)
- I: DateAdded (timestamp)
- J: LastUpdated (timestamp)

## Features Added

### Form Validation
- Required field validation
- Email format validation
- Real-time error display
- Form reset functionality

### Save Functionality
- Saves referrals to Google Sheets via Apps Script
- Generates unique referral IDs
- Automatic timestamping
- Success/error feedback
- Loading states during save

### UI Improvements
- Enhanced form with validation styling
- Success/error message display
- Loading spinner during save
- Reset button for form clearing
- Required field indicators (*)

## Usage

1. Navigate to the "Referrals" tab
2. Click "Add New Referral" button
3. Fill out the form with required information:
   - Name (required)
   - Email (required, validated)
   - Phone (required)
   - Organization (required)
   - Stage (dropdown selection)
   - Points (optional, defaults to 0)
4. Click "Add Referral" to save
5. Form will show success message and refresh data
6. Use "Reset" button to clear form without saving

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your Google Apps Script is deployed as a web app with "Anyone" access
2. **Permission Denied**: Verify your Google Sheets API key has proper permissions
3. **Sheet Not Found**: Ensure the "Referrals" sheet exists in your Google Sheet
4. **Invalid Sheet ID**: Double-check your `REACT_APP_GOOGLE_SHEET_ID` in the `.env` file

### Testing

Use the `testAddReferral()` function in Google Apps Script to test the backend functionality before integrating with the frontend.

## Security Notes

- The Google Apps Script web app should be deployed with "Anyone" access for CORS compatibility
- Consider implementing additional validation in the Apps Script for production use
- API keys should be restricted to your domain in production
- Consider implementing rate limiting for production deployments
