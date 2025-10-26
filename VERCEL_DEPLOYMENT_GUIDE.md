# Vercel Deployment Guide

This guide walks you through deploying the SportsRaiser Fundraising Platform to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
2. Your project pushed to a GitHub repository
3. Google Sheets API credentials (see [WRITE_FUNCTIONALITY_SETUP.md](./WRITE_FUNCTIONALITY_SETUP.md))

## Quick Start

### 1. Connect Your Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Select the repository: `fundraising-app` (or your repo name)
5. Click **"Import"**

### 2. Configure Build Settings

Vercel should auto-detect the settings for Create React App, but verify:

- **Framework Preset**: `Create React App`
- **Build Command**: `react-scripts build` (or `npm run build`)
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 3. Add Environment Variables

**CRITICAL**: Before deploying, you must add the required environment variables.

1. In the Vercel import screen, expand **"Environment Variables"**
2. Add the following variables:

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `REACT_APP_GOOGLE_SHEET_ID` | Your Google Sheet ID | From your Google Sheet URL: `docs.google.com/spreadsheets/d/{SHEET_ID}/edit` |
| `REACT_APP_GOOGLE_API_KEY` | Your Google API Key | From [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials |
| `REACT_APP_GOOGLE_APPS_SCRIPT_URL` | Your Apps Script Web App URL | See [WRITE_FUNCTIONALITY_SETUP.md](./WRITE_FUNCTIONALITY_SETUP.md) |
| `REACT_APP_RESEND_API_KEY` | Your Resend API Key (optional) | From [Resend Dashboard](https://resend.com/api-keys) |

**Example Values** (replace with your actual values):
```
REACT_APP_GOOGLE_SHEET_ID=1cy2kLw3mCKhHzw1zVehAm1QOT5BfnKnnwtcfBFTf0ss
REACT_APP_GOOGLE_API_KEY=AIzaSyDYWJT7Uoe5PbEb_xyXWkbJx7s4DTFqYOU
REACT_APP_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
REACT_APP_RESEND_API_KEY=re_YourResendApiKey
```

3. Click **"Deploy"**

### 4. Set Up Google Apps Script (If Not Already Done)

If you haven't set up the Google Apps Script web app yet, follow these steps:

1. Open your Google Sheet
2. Click **Extensions → Apps Script**
3. Copy the code from [docs/google-apps-script.js](./docs/google-apps-script.js)
4. Click **Deploy → New deployment**
5. Choose type: **Web app**
6. Set **Execute as**: Your account
7. Set **Who has access**: Anyone
8. Click **Deploy**
9. Copy the **Web app URL**
10. Add it as `REACT_APP_GOOGLE_APPS_SCRIPT_URL` in Vercel

Full instructions: [WRITE_FUNCTIONALITY_SETUP.md](./WRITE_FUNCTIONALITY_SETUP.md)

### 5. Verify Deployment

1. Wait for the build to complete (2-3 minutes)
2. Click the deployment URL (e.g., `https://your-app.vercel.app`)
3. Verify the app loads without errors
4. Check the browser console for any warnings or errors
5. Test the login functionality with a parent email from your Google Sheet

## Troubleshooting

### "Failed to Fetch" Error

**Symptom**: The app shows a "Failed to Fetch" error when loading.

**Cause**: Missing or incorrect environment variables on Vercel.

**Solution**:
1. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Verify all required variables are set:
   - `REACT_APP_GOOGLE_SHEET_ID`
   - `REACT_APP_GOOGLE_API_KEY`
   - `REACT_APP_GOOGLE_APPS_SCRIPT_URL`
3. If any are missing, add them
4. Go to **Deployments** and click **Redeploy** on the latest deployment

### Environment Variables Not Taking Effect

**Symptom**: You added environment variables but the app still doesn't work.

**Cause**: Environment variables are only applied during build time for Create React App.

**Solution**:
1. After adding/changing environment variables, you must **trigger a new deployment**
2. Go to **Deployments** tab
3. Click the three dots (⋮) on the latest deployment
4. Click **Redeploy**
5. Check **"Use existing Build Cache"** = OFF (to force a fresh build)

### Google Sheets API Errors

**Symptom**: 403 Permission Denied or 404 Not Found errors.

**Causes & Solutions**:

| Error | Cause | Solution |
|-------|-------|----------|
| **403 Forbidden** | API key is invalid or restricted | 1. Check API key in Google Cloud Console<br>2. Verify Google Sheets API is enabled<br>3. Check API key restrictions |
| **404 Not Found** | Sheet ID is incorrect | 1. Double-check the Sheet ID from the URL<br>2. Ensure the sheet is not deleted |
| **CORS errors** | Direct API access blocked | Use the Apps Script web app for writes |

### Build Failures

**Symptom**: Vercel build fails with linting or compilation errors.

**Solution**:
1. Check the build logs in Vercel
2. Run locally to reproduce: `npm run build`
3. Fix any ESLint errors: `npm run lint:check`
4. Commit and push the fixes
5. Vercel will auto-redeploy

## Updating Environment Variables

To update environment variables after initial deployment:

1. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Find the variable you want to update
3. Click the three dots (⋮) → **Edit**
4. Update the value
5. Click **Save**
6. Go to **Deployments** and click **Redeploy** to apply changes

## Custom Domain (Optional)

To add a custom domain:

1. Go to **Vercel Dashboard → Your Project → Settings → Domains**
2. Click **Add Domain**
3. Enter your domain name
4. Follow the DNS configuration instructions
5. Wait for DNS propagation (up to 48 hours)

## Production Checklist

Before going live with real users:

- [ ] All environment variables are set correctly
- [ ] Google Sheets API is working (test read/write operations)
- [ ] Apps Script web app is deployed and accessible
- [ ] Test login with multiple student accounts
- [ ] Verify leaderboard data is accurate
- [ ] Test referral form submission
- [ ] Check mobile responsiveness
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Monitor Vercel Analytics for errors
- [ ] Set up error monitoring (optional: Sentry, LogRocket)

## Monitoring & Analytics

Vercel provides built-in analytics:

1. Go to **Vercel Dashboard → Your Project → Analytics**
2. View:
   - Page views
   - Top pages
   - Top referrers
   - Real-time visitors

For advanced monitoring, consider:
- [Sentry](https://sentry.io/) for error tracking
- [Google Analytics](https://analytics.google.com/) for user analytics
- [LogRocket](https://logrocket.com/) for session replay

## Support

If you encounter issues:

1. Check the [Vercel documentation](https://vercel.com/docs)
2. Review the [project README](./README.md)
3. Check the browser console for errors
4. Review Vercel build logs
5. Open an issue on GitHub

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
