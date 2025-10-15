# Google Sheets Service Setup Guide

## Overview

The **Google Sheets Service** acts as a database layer for the Node.js/TypeScript backend while keeping Google Sheets as the data store. This hybrid approach gives you:

✅ **Professional API** with validation, auth, rate limiting
✅ **Keep Google Sheets** - no data migration needed
✅ **Type safety** with TypeScript
✅ **Easy migration path** to PostgreSQL later

---

## Architecture

```
┌─────────────┐          ┌──────────────────┐          ┌──────────────┐
│   React     │          │   Node.js API    │          │   Google     │
│   Frontend  │ ─────────▶│   + TypeScript   │─────────▶│   Sheets     │
│             │  REST/JWT │                  │  OAuth   │  (Database)  │
└─────────────┘          └──────────────────┘          └──────────────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │    Resend    │
                          │    Email     │
                          └──────────────┘
```

---

## Step 1: Create Google Service Account

### 1.1 Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Create a new project or select existing one

### 1.2 Enable Google Sheets API
1. Go to **APIs & Services** → **Library**
2. Search for "Google Sheets API"
3. Click **Enable**

### 1.3 Create Service Account
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Name: `sportsraiser-backend`
4. Role: **Editor** (or create custom role with Sheets access)
5. Click **Done**

### 1.4 Generate Service Account Key
1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create New Key**
4. Choose **JSON** format
5. Download the JSON file (keep it secure!)

The JSON file looks like:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "sportsraiser-backend@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

## Step 2: Share Google Sheet with Service Account

1. Open your Google Sheet
2. Click **Share** button
3. Add the service account email: `sportsraiser-backend@your-project.iam.gserviceaccount.com`
4. Give **Editor** permission
5. Click **Done**

---

## Step 3: Create AuthTokens Sheet

1. Open your Google Sheet
2. Create a new sheet (tab) named: **AuthTokens**
3. Add the following headers in row 1:

| A      | B     | C         | D         | E    |
|--------|-------|-----------|-----------|------|
| Token  | Email | ExpiresAt | CreatedAt | Used |

This sheet will store magic link authentication tokens.

---

## Step 4: Setup Environment Variables

### 4.1 Copy Service Account JSON to .env

Convert the entire JSON file to a single-line string and add to `.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# Google Sheets (Database)
GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS='{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"...@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'

# JWT
JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h

# CORS (Add your frontend URLs)
CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app

# Resend Email
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Important:**
- Escape newlines in the private key: `\n` → `\\n`
- Wrap the entire JSON in single quotes
- Alternatively, use a file path instead:

```env
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_FILE=./credentials/service-account.json
```

### 4.2 Get Google Sheet ID
From your Google Sheet URL:
```
https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit
                                          ↑ This is your Sheet ID
```

### 4.3 Get Resend API Key
1. Go to https://resend.com/signup
2. Create account and verify email
3. Go to **API Keys** → **Create API Key**
4. Copy the key: `re_...`

---

## Step 5: Install Dependencies

```bash
cd packages/api

# Install required packages
npm install googleapis resend express cors helmet express-rate-limit
npm install jsonwebtoken joi uuid dotenv

# Install dev dependencies
npm install --save-dev @types/express @types/cors @types/jsonwebtoken
npm install --save-dev tsx typescript
```

---

## Step 6: Update API Index

Edit `packages/api/src/index.ts` to include the auth routes:

```typescript
import { authRoutes } from './routes/auth';

// ... existing middleware ...

// API routes
app.use('/api/v1/auth', authRoutes);

// ... rest of routes ...
```

---

## Step 7: Test the API

### 7.1 Start the API Server

```bash
cd packages/api
npm run dev
```

You should see:
```
🚀 SportsRaiser API server running on port 3001
📊 Health check: http://localhost:3001/health
🔗 API base URL: http://localhost:3001/api/v1
```

### 7.2 Test Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 7.3 Test Magic Link (using curl)

```bash
curl -X POST http://localhost:3001/api/v1/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "parent@example.com"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Magic link sent successfully. Check your email!",
  "emailId": "abc123..."
}
```

### 7.4 Check Email

Check the inbox for `parent@example.com` - you should receive an email with a magic link button.

### 7.5 Test Token Verification

Copy the token from the magic link URL (`?token=abc123...`) and verify it:

```bash
curl -X POST http://localhost:3001/api/v1/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "abc123..."}'
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "StudentID": "STU-001",
    "FirstName": "John",
    "LastName": "Doe",
    "ParentEmail": "parent@example.com",
    "Team": "U12 Eagles",
    "Program": "Soccer"
  }
}
```

### 7.6 Test JWT Authentication

Use the JWT token from the previous step:

```bash
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Expected response:
```json
{
  "success": true,
  "user": {
    "StudentID": "STU-001",
    "FirstName": "John",
    "LastName": "Doe",
    "ParentEmail": "parent@example.com",
    "Team": "U12 Eagles",
    "Program": "Soccer"
  }
}
```

---

## Step 8: Update React Frontend

### 8.1 Create API Client

File: `src/services/apiClient.js`

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth
  async sendMagicLink(email) {
    return this.request('/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyToken(token) {
    const response = await this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async refreshUserData() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  logout() {
    this.clearToken();
  }
}

export default new ApiClient();
```

### 8.2 Update LoginPage

Replace Google Apps Script calls with API client:

```javascript
import apiClient from '../services/apiClient';

const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoggingIn(true);
  setLoginError('');
  setLoginMessage('');

  try {
    await apiClient.sendMagicLink(formData.email);
    setLoginMessage('Check your email! We sent you a login link.');
  } catch (error) {
    setLoginError(error.message);
  } finally {
    setIsLoggingIn(false);
  }
};

const verifyTokenAndLogin = async (token) => {
  setIsLoggingIn(true);
  setLoginError('');

  try {
    const result = await apiClient.verifyToken(token);
    onLogin(result.user);
    window.history.replaceState({}, '', '/');
  } catch (error) {
    setLoginError(error.message);
  } finally {
    setIsLoggingIn(false);
  }
};
```

### 8.3 Update .env

```env
REACT_APP_API_URL=http://localhost:3001/api/v1
```

---

## API Endpoints Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/magic-link` | Send magic link email | No |
| POST | `/api/v1/auth/verify` | Verify token, get JWT | No |
| GET | `/api/v1/auth/me` | Get current user | Yes (JWT) |
| POST | `/api/v1/auth/refresh` | Refresh user data | Yes (JWT) |

---

## Troubleshooting

### Issue: "Failed to read from Students"
**Solution:** Make sure the service account email has Editor access to the Google Sheet.

### Issue: "AuthTokens sheet not found"
**Solution:** Create the AuthTokens sheet with the correct column headers (see Step 3).

### Issue: "Failed to send email"
**Solution:**
- Check that `RESEND_API_KEY` is correct
- Verify that `RESEND_FROM_EMAIL` is either `onboarding@resend.dev` or a verified domain

### Issue: "Invalid token"
**Solution:**
- Tokens expire in 15 minutes - request a new one
- Tokens can only be used once - request a new one if already used

### Issue: "CORS error"
**Solution:** Add your frontend URL to `CORS_ORIGINS` in `.env`:
```env
CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

---

## Deployment

### Backend (Railway)

```bash
cd packages/api

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set GOOGLE_SHEET_ID=your_sheet_id
railway variables set GOOGLE_SERVICE_ACCOUNT_CREDENTIALS='{"type":"service_account",...}'
railway variables set RESEND_API_KEY=re_your_key
railway variables set JWT_SECRET=your_secret_key
railway variables set CORS_ORIGINS=https://your-frontend.vercel.app

# Deploy
railway up
```

### Frontend (Vercel)

Update `.env` with production API URL:
```env
REACT_APP_API_URL=https://your-api.railway.app/api/v1
```

---

## Next Steps

1. **Add more endpoints** - Create routes for students, orders, referrals
2. **Add caching** - Use Redis to cache Google Sheets data
3. **Add rate limiting** - Protect against abuse
4. **Add logging** - Use Winston or Pino for structured logs
5. **Migrate to PostgreSQL** - When ready, follow the MIGRATION_PLAN.md

---

## Benefits of This Approach

✅ **No data migration** - Keep using Google Sheets
✅ **Professional API** - JWT auth, validation, error handling
✅ **Type safety** - TypeScript catches errors at compile time
✅ **Scalable** - Easy to add Redis caching, rate limiting
✅ **Migration path** - Can switch to PostgreSQL anytime
✅ **Better DX** - Organized code with services, utils, constants
✅ **Better UX** - Faster responses, better error messages

---

## Support

Need help? Check:
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Resend Docs](https://resend.com/docs)
- [Express.js Docs](https://expressjs.com/)
