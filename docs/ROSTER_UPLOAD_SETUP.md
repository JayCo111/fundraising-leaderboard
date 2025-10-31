# Roster Upload Setup Guide

This guide explains how to configure the Google Apps Script backend for the CSV roster upload feature.

## Overview

The roster upload feature allows Head Coaches to bulk import student rosters via CSV files. The frontend sends the data to a Google Apps Script endpoint which validates and inserts students into the Google Sheets database.

## Prerequisites

1. Google Apps Script web app already deployed (from initial setup)
2. Access to Google Apps Script Editor
3. Students sheet with columns A-M configured

## Setup Instructions

### Step 1: Update Google Apps Script

1. Go to your existing Google Apps Script project
2. The updated script is in `docs/google-apps-script.js`
3. Copy the entire contents and replace your existing script
4. The key additions are:
   - `bulkAddStudents()` function
   - `setSheetId()` helper function
   - `testBulkAddStudents()` test function

### Step 2: Configure Sheet ID

The script uses Script Properties to store your Sheet ID securely.

1. In the Google Apps Script Editor, update the `setSheetId()` function:
   ```javascript
   function setSheetId() {
     const sheetId = 'YOUR_ACTUAL_SHEET_ID_HERE'; // Replace this
     PropertiesService.getScriptProperties().setProperty('SHEET_ID', sheetId);
     console.log('Sheet ID configured successfully');
   }
   ```

2. Replace `'YOUR_ACTUAL_SHEET_ID_HERE'` with your Google Sheet ID (found in the Sheet URL)

3. Run the `setSheetId` function:
   - Select `setSheetId` from the function dropdown
   - Click the "Run" button (▶)
   - Authorize the script if prompted
   - Check the logs (View > Logs) to confirm "Sheet ID configured successfully"

### Step 3: Test the Function

Before deploying, test the bulk add functionality:

1. Update the test data in `testBulkAddStudents()` if needed (optional)
2. Select `testBulkAddStudents` from the function dropdown
3. Click "Run" to execute
4. Check the execution log for results
5. Verify students were added to the Students sheet

Expected test output:
```json
{
  "success": true,
  "count": 2,
  "message": "Successfully added 2 students"
}
```

### Step 4: Redeploy the Web App

Since you've updated the script, you need to create a new deployment:

1. Click "Deploy" > "New deployment"
2. Select "Web app" type
3. Configuration:
   - **Description**: "Roster upload support" (or similar)
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click "Deploy"
5. Copy the new deployment URL (optional - you can keep using the existing URL if you prefer)

**Important**: If you create a new deployment, update your `.env` file:
```
REACT_APP_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/NEW_DEPLOYMENT_ID/exec
```

Alternatively, you can update an existing deployment:
1. Click "Deploy" > "Manage deployments"
2. Click the edit icon (pencil) next to your active deployment
3. Under "Version", select "New version"
4. Click "Deploy"
5. Your existing URL will continue to work

## How It Works

### StudentID Generation

The script automatically generates unique StudentIDs:
- Format: `TEAMNAME_###` (e.g., `JADE_001`, `SUNSTONES_042`)
- Team name is uppercased and spaces removed
- Numbers are padded to 3 digits
- Increments based on existing students in the team

### Data Insertion

Students are inserted into the Students sheet (columns A-M):
- **A**: StudentID (auto-generated)
- **B**: FirstName
- **C**: LastName
- **D**: Team
- **E**: Goal_$ (defaults to $500)
- **F**: ParentEmail
- **G**: PersonalLink (auto-generated as `https://sportsraise.org/donate/STUDENTID`)
- **H**: QR_URL (empty, can be populated later)
- **I**: Avatar_URL (empty)
- **J**: Program
- **K**: QR_Link (empty, can be populated later)
- **L**: RegisteredDate (timestamp)
- **M**: RegistrationStatus (set to "PENDING")

### Registration Status

Students are created with `RegistrationStatus: PENDING`:
- Status changes to `REGISTERED` when parent first logs in via magic link
- Used to track which parents have activated their accounts

## Frontend Integration

The frontend (RosterUpload component) calls the endpoint with:

```javascript
fetch(process.env.REACT_APP_GOOGLE_APPS_SCRIPT_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'bulkAddStudents',
    students: [
      {
        firstName: 'John',
        lastName: 'Smith',
        studentEmail: 'john@email.com',
        studentPhone: '(555) 123-4567',
        parentFirstName: 'Jane',
        parentLastName: 'Smith',
        parentEmail: 'jane@email.com',
        parentPhone: '(555) 123-4568',
        goal: 500,
        team: 'Jade',
        program: 'IDOL Cheer'
      }
      // ... more students
    ]
  })
})
```

Expected response:
```json
{
  "success": true,
  "count": 25,
  "message": "Successfully added 25 students"
}
```

## Error Handling

The script handles common errors:

1. **SHEET_ID not configured**: Run `setSheetId()` first
2. **Students sheet not found**: Verify sheet name is exactly "Students"
3. **Invalid data**: Check that all required fields are provided
4. **Permission errors**: Ensure script is deployed with "Execute as: Me"

## Troubleshooting

### Error: "SHEET_ID not configured"
- Run the `setSheetId()` function from the Script Editor
- Verify it appears in Script Properties (File > Project properties > Script properties)

### Students not appearing
- Check the execution log for errors (View > Executions)
- Verify the sheet name is "Students" (case-sensitive)
- Ensure columns A-M exist in the Students sheet

### CORS errors
- Verify deployment settings: "Who has access" = "Anyone"
- Ensure you're using the correct web app URL
- Try redeploying the script

### Duplicate StudentIDs
- The script should prevent this by incrementing based on existing IDs
- If duplicates occur, check that existing StudentIDs follow the format: `TEAM_###`

## Security Considerations

1. **Script Properties**: Sheet ID stored in Script Properties (not in code)
2. **Validation**: Frontend validates data before sending
3. **Batch Limits**: Consider adding max batch size limit for production (e.g., 100 students)
4. **Rate Limiting**: Google Apps Script has execution time limits (6 minutes)
5. **Access Control**: Only authenticated coaches can access the upload feature

## Future Enhancements

Potential improvements for production:

1. **QR Code Generation**: Integrate QR code API to populate QR_URL and QR_Link
2. **Email Notifications**: Send welcome emails to parents after bulk upload
3. **Duplicate Detection**: Check for existing parent emails before inserting
4. **Progress Reporting**: For large batches, return progress updates
5. **Avatar Assignment**: Assign default avatars or generate initials-based avatars
6. **Rollback**: Implement transaction-like rollback on partial failures

## Testing Checklist

Before going live, test:

- [ ] Upload CSV with 2-3 students (small batch)
- [ ] Verify StudentIDs are unique and sequential
- [ ] Verify all fields are correctly mapped to columns
- [ ] Test with duplicate parent emails (should succeed - this is allowed)
- [ ] Upload to multiple teams (verify separate ID sequences)
- [ ] Test error handling (invalid sheet ID, missing sheet, etc.)
- [ ] Verify RegistrationStatus is set to "PENDING"
- [ ] Confirm PersonalLink is generated correctly

## Support

If you encounter issues:
1. Check the Google Apps Script execution logs (View > Executions)
2. Verify your `.env` configuration
3. Test the `testBulkAddStudents()` function directly in Script Editor
4. Check browser console for frontend errors
