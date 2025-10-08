# Passwordless Authentication with Resend - Simple Guide

## Overview

Replace password-based login with magic link emails sent via Resend. Users click a link in their email to log in - no passwords needed.

## Prerequisites

- Resend account (free tier: 100 emails/day)
- Google Apps Script (already set up)
- Google Sheets with Students tab

## Step 1: Get Resend API Key

1. Go to https://resend.com/signup
2. Create account and verify email
3. Go to **API Keys** → **Create API Key**
4. Copy the key: `re_...`
5. Add to `.env`:
   ```
   REACT_APP_RESEND_API_KEY=re_your_key_here
   ```

## Step 2: Add Auth Tokens Tab to Google Sheets

1. Open your Google Sheet
2. Create new tab: **AuthTokens**
3. Add headers in row 1:
   - A: `Token`
   - B: `Email`
   - C: `ExpiresAt`
   - D: `CreatedAt`
   - E: `Used`

## Step 3: Update Google Apps Script

Add to your existing `google-apps-script.js`:

```javascript
function sendMagicLink(e) {
  const data = JSON.parse(e.postData.contents);
  const { email, resendApiKey } = data;

  // Generate random token
  const token = Utilities.getUuid();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

  // Save to AuthTokens sheet
  const sheet = SpreadsheetApp.openById(data.sheetId).getSheetByName('AuthTokens');
  sheet.appendRow([token, email, expiresAt.toISOString(), new Date().toISOString(), false]);

  // Send email via Resend
  const magicLink = `${data.appUrl}/login?token=${token}`;

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
```

Update `doPost` to handle new actions:

```javascript
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
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Step 4: Update LoginPage Component

Replace password logic with magic link:

```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoggingIn(true);
  setLoginError('');

  try {
    // Check if email exists in Students sheet
    const student = studentsData.find(s =>
      s.ParentEmail?.toLowerCase().trim() === formData.email.toLowerCase().trim()
    );

    if (!student) {
      setLoginError('Email not found. Please check your email address.');
      setIsLoggingIn(false);
      return;
    }

    // Send magic link
    const response = await fetch(process.env.REACT_APP_GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendMagicLink',
        sheetId: process.env.REACT_APP_GOOGLE_SHEET_ID,
        email: formData.email,
        resendApiKey: process.env.REACT_APP_RESEND_API_KEY,
        appUrl: window.location.origin
      })
    });

    const result = await response.json();

    if (result.success) {
      setLoginMessage('Check your email! We sent you a login link.');
    } else {
      setLoginError('Failed to send login link. Please try again.');
    }
  } catch (error) {
    setLoginError('Something went wrong. Please try again.');
  } finally {
    setIsLoggingIn(false);
  }
};
```

Add token verification on page load:

```javascript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token) {
    verifyTokenAndLogin(token);
  }
}, []);

const verifyTokenAndLogin = async (token) => {
  try {
    const response = await fetch(process.env.REACT_APP_GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verifyToken',
        sheetId: process.env.REACT_APP_GOOGLE_SHEET_ID,
        token
      })
    });

    const result = await response.json();

    if (result.success) {
      // Find student by email
      const student = studentsData.find(s =>
        s.ParentEmail?.toLowerCase() === result.email.toLowerCase()
      );

      if (student) {
        onLogin(student);
        // Clear token from URL
        window.history.replaceState({}, '', '/');
      }
    } else {
      setLoginError(result.error || 'Invalid or expired login link.');
    }
  } catch (error) {
    setLoginError('Failed to verify login link.');
  }
};
```

## Step 5: Update Login Form UI

Simple email-only form:

```javascript
<form onSubmit={handleLogin}>
  <label>Parent Email Address</label>
  <input
    type="email"
    value={formData.email}
    onChange={(e) => setFormData({ email: e.target.value })}
    placeholder="Enter your email"
    required
  />

  <button type="submit" disabled={isLoggingIn}>
    {isLoggingIn ? 'Sending...' : 'Send Login Link'}
  </button>

  {loginMessage && <div className="success">{loginMessage}</div>}
  {loginError && <div className="error">{loginError}</div>}
</form>
```

## That's It!

### What Happens:
1. User enters email → System validates it exists
2. Magic link sent to email → User clicks link
3. Token verified → User logged in automatically

### Clean Up:
- Remove all password-related code
- Delete `passwordSecurity.js`
- Remove `PasswordResetModal.js`
- Update `LoginPage.js` to remove password fields

### Security Notes:
- Tokens expire in 15 minutes
- One-time use only
- Stored in Google Sheets (simple, no database needed)

### Resend Free Tier:
- 100 emails/day
- 3,000 emails/month
- Perfect for small-medium deployments

Need help implementing? Just follow the steps above or ask!
