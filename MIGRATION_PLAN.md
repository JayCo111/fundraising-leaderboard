# SportsRaiser Migration Plan: Google Sheets → PostgreSQL + Node.js/TypeScript Backend

## Executive Summary

Migrate from Google Sheets database + Google Apps Script backend to a production-ready **Node.js/TypeScript API** with **PostgreSQL** database and **Resend** email integration.

---

## Current Architecture

```
┌─────────────┐          ┌──────────────────┐          ┌──────────────┐
│   React     │          │  Google Apps     │          │   Google     │
│   Frontend  │ ─────────▶│    Script       │─────────▶│   Sheets     │
│             │  POST     │  (Backend API)   │  Write   │  (Database)  │
└─────────────┘          └──────────────────┘          └──────────────┘
                                  │
                                  │ Resend API
                                  ▼
                          ┌──────────────┐
                          │    Email     │
                          │   Service    │
                          └──────────────┘
```

### Current Issues
- ❌ `/dev` endpoint used instead of production `/exec`
- ❌ No proper database schema, relationships, or constraints
- ❌ Limited query capabilities (no joins, aggregations)
- ❌ No proper authentication/session management
- ❌ Scalability limitations
- ❌ No transaction support
- ❌ Manual row-by-row operations

---

## Target Architecture

```
┌─────────────┐          ┌──────────────────┐          ┌──────────────┐
│   React     │          │   Node.js API    │          │  PostgreSQL  │
│   Frontend  │ ─────────▶│   (Express +     │─────────▶│   Database   │
│             │  REST/JWT │    TypeScript)   │  SQL     │   + RLS      │
└─────────────┘          └──────────────────┘          └──────────────┘
                                  │
                                  ├────────────────┐
                                  │                │
                                  ▼                ▼
                          ┌──────────────┐  ┌──────────┐
                          │    Resend    │  │  Redis   │
                          │    Email     │  │  Cache   │
                          └──────────────┘  └──────────┘
```

### Key Improvements
- ✅ Professional relational database (PostgreSQL)
- ✅ Row-level security policies
- ✅ JWT-based authentication with magic links
- ✅ RESTful API with proper validation
- ✅ Redis caching for performance
- ✅ Background job processing (Bull queues)
- ✅ Proper error handling and logging
- ✅ TypeScript for type safety

---

## Migration Phases

### Phase 1: Backend Setup (Week 1)

#### 1.1 Install Dependencies
```bash
cd packages/api
npm install dotenv express cors helmet express-rate-limit
npm install pg bcryptjs jsonwebtoken joi uuid
npm install resend  # Replace nodemailer with Resend SDK
npm install --save-dev @types/express @types/cors @types/pg @types/bcryptjs @types/jsonwebtoken tsx typescript
```

#### 1.2 Database Setup
```bash
# Install PostgreSQL locally or use cloud provider (Supabase, Railway, Neon)
# Option 1: Local PostgreSQL
brew install postgresql  # macOS
# OR
sudo apt-get install postgresql  # Linux

# Option 2: Cloud PostgreSQL (Recommended)
# - Supabase (free tier: 500MB)
# - Railway (free tier: $5 credit)
# - Neon (free tier: 10GB)

# Create database
createdb sportsraiser

# Run schema
psql sportsraiser < packages/db/schema.sql
```

#### 1.3 Environment Configuration
Create `packages/api/.env`:
```env
# Server
PORT=3001
NODE_ENV=development

# Database (Local)
DATABASE_URL=postgresql://localhost:5432/sportsraiser
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sportsraiser
DB_USER=postgres
DB_PASSWORD=your_password

# OR Database (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app

# Resend
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379
```

---

### Phase 2: Authentication with Magic Links (Week 1)

#### 2.1 Create Auth Service
File: `packages/api/src/services/authService.ts`

```typescript
import { Resend } from 'resend';
import { config } from '../config';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const resend = new Resend(config.RESEND_API_KEY);
const pool = new Pool({ connectionString: config.DATABASE_URL });

export class AuthService {
  /**
   * Generate and send magic link
   */
  static async sendMagicLink(email: string, appUrl: string) {
    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, name, email, role FROM users WHERE email = $1 AND status = $2',
      [email.toLowerCase(), 'ACTIVE']
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token in database
    await pool.query(
      'INSERT INTO auth_tokens (token, user_id, expires_at, used) VALUES ($1, $2, $3, $4)',
      [token, user.id, expiresAt, false]
    );

    // Create magic link
    const magicLink = `${appUrl}/auth/verify?token=${token}`;

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: config.RESEND_FROM_EMAIL,
      to: email,
      subject: 'Your SportsRaiser Login Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0891b2;">SportsRaiser Login</h2>
          <p>Hi ${user.name},</p>
          <p>Click the button below to log in to your fundraising dashboard:</p>
          <a href="${magicLink}"
             style="display: inline-block; background: linear-gradient(to right, #0891b2, #2563eb);
                    color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;
                    font-weight: bold; margin: 20px 0;">
            Log In to SportsRaiser
          </a>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This link expires in 15 minutes. If you didn't request this, ignore this email.
          </p>
        </div>
      `
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, message: 'Magic link sent successfully' };
  }

  /**
   * Verify magic link token and return JWT
   */
  static async verifyToken(token: string) {
    const result = await pool.query(
      `SELECT t.id, t.user_id, t.expires_at, t.used,
              u.id, u.name, u.email, u.role, u.org_id, u.program_id, u.team_id
       FROM auth_tokens t
       JOIN users u ON u.id = t.user_id
       WHERE t.token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid token');
    }

    const tokenData = result.rows[0];

    // Check if already used
    if (tokenData.used) {
      throw new Error('Token already used');
    }

    // Check if expired
    if (new Date(tokenData.expires_at) < new Date()) {
      throw new Error('Token expired');
    }

    // Mark token as used
    await pool.query(
      'UPDATE auth_tokens SET used = true WHERE id = $1',
      [tokenData.id]
    );

    // Generate JWT
    const jwtToken = jwt.sign(
      {
        userId: tokenData.user_id,
        name: tokenData.name,
        email: tokenData.email,
        role: tokenData.role,
        org_id: tokenData.org_id,
        program_id: tokenData.program_id,
        team_id: tokenData.team_id
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    return {
      success: true,
      token: jwtToken,
      user: {
        id: tokenData.user_id,
        name: tokenData.name,
        email: tokenData.email,
        role: tokenData.role
      }
    };
  }
}
```

#### 2.2 Create Auth Routes
File: `packages/api/src/routes/auth.ts`

```typescript
import { Router } from 'express';
import { AuthService } from '../services/authService';

const router = Router();

/**
 * POST /api/v1/auth/magic-link
 * Send magic link to user's email
 */
router.post('/magic-link', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const appUrl = req.headers.origin || 'http://localhost:3000';
    const result = await AuthService.sendMagicLink(email, appUrl);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/auth/verify
 * Verify magic link token and return JWT
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    const result = await AuthService.verifyToken(token);

    res.json(result);
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/auth/me
 * Get current user info
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Verify token and return user
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;

    res.json({
      success: true,
      user: {
        id: decoded.userId,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

export { router as authRoutes };
```

#### 2.3 Update Config for Resend
File: `packages/api/src/config/index.ts`

```typescript
// Add Resend configuration
export const config = {
  // ... existing config ...

  // Resend Email
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
};
```

#### 2.4 Create Auth Tokens Table
Add to `packages/db/schema.sql`:

```sql
-- Auth tokens for magic link authentication
CREATE TABLE auth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_expires_at ON auth_tokens(expires_at);
```

---

### Phase 3: Data Migration (Week 2)

#### 3.1 Export Google Sheets Data
Create script: `scripts/export-google-sheets.js`

```javascript
const fs = require('fs');
const { google } = require('googleapis');

async function exportGoogleSheetsData() {
  // Authenticate with Google Sheets API
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.REACT_APP_GOOGLE_SHEET_ID;

  // Export Students
  const studentsResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Students!A2:K1000',
  });

  // Export Orders
  const ordersResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Orders!A2:I1000',
  });

  // Export Referrals
  const referralsResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Referrals!A2:J1000',
  });

  // Save to JSON files
  fs.writeFileSync('data/students.json', JSON.stringify(studentsResponse.data.values, null, 2));
  fs.writeFileSync('data/orders.json', JSON.stringify(ordersResponse.data.values, null, 2));
  fs.writeFileSync('data/referrals.json', JSON.stringify(referralsResponse.data.values, null, 2));

  console.log('✅ Data exported successfully');
}

exportGoogleSheetsData();
```

#### 3.2 Import to PostgreSQL
Create script: `scripts/import-to-postgres.ts`

```typescript
import { Pool } from 'pg';
import fs from 'fs';
import { config } from '../packages/api/src/config';

const pool = new Pool({ connectionString: config.DATABASE_URL });

async function importData() {
  // Read exported data
  const students = JSON.parse(fs.readFileSync('data/students.json', 'utf-8'));
  const orders = JSON.parse(fs.readFileSync('data/orders.json', 'utf-8'));
  const referrals = JSON.parse(fs.readFileSync('data/referrals.json', 'utf-8'));

  // Import students (map to users + athlete_profiles)
  for (const student of students) {
    const [studentId, firstName, lastName, team, goal, parentEmail, personalLink, qrUrl, avatarUrl, program, qrLink] = student;

    // Create user
    const userResult = await pool.query(
      `INSERT INTO users (name, email, role, team_id, status)
       VALUES ($1, $2, $3,
         (SELECT id FROM teams WHERE name = $4 LIMIT 1),
         'ACTIVE')
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [`${firstName} ${lastName}`, parentEmail, 'PARENT_STUDENT', team]
    );

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;

      // Create athlete profile
      await pool.query(
        `INSERT INTO athlete_profiles (user_id, team_id, parent_contact_json)
         VALUES ($1, (SELECT id FROM teams WHERE name = $2 LIMIT 1), $3)`,
        [userId, team, JSON.stringify({ personalLink, qrUrl, avatarUrl, qrLink })]
      );
    }
  }

  // Import orders (map to transactions)
  // Import referrals (map to prospects)
  // ...

  console.log('✅ Data imported successfully');
}

importData();
```

---

### Phase 4: Frontend Integration (Week 2)

#### 4.1 Update Environment Variables
```env
# .env
REACT_APP_API_URL=http://localhost:3001/api/v1
```

#### 4.2 Create API Client
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

  // Students
  async getStudents() {
    return this.request('/students');
  }

  // Orders
  async getOrders() {
    return this.request('/orders');
  }

  // Referrals
  async getReferrals() {
    return this.request('/referrals');
  }

  async createReferral(data) {
    return this.request('/referrals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export default new ApiClient();
```

#### 4.3 Update LoginPage Component
Replace Google Apps Script calls with API client:

```javascript
import apiClient from '../services/apiClient';

const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoggingIn(true);

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
  try {
    const result = await apiClient.verifyToken(token);
    onLogin(result.user);
    window.history.replaceState({}, '', '/');
  } catch (error) {
    setLoginError(error.message);
  }
};
```

---

### Phase 5: Testing & Deployment (Week 3)

#### 5.1 Local Testing
```bash
# Terminal 1: Start API
cd packages/api
npm run dev

# Terminal 2: Start React frontend
npm start
```

#### 5.2 Deploy Backend

**Option 1: Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd packages/api
railway up
```

**Option 2: Render**
- Connect GitHub repo
- Create Web Service
- Set environment variables
- Deploy

**Option 3: Fly.io**
```bash
flyctl launch
flyctl deploy
```

#### 5.3 Update Frontend Environment
```env
REACT_APP_API_URL=https://your-api.railway.app/api/v1
```

---

## Rollback Plan

If issues occur:
1. Keep Google Sheets as read-only backup
2. Enable dual-write mode (write to both systems temporarily)
3. Monitor error rates and performance
4. Gradually shift traffic to new backend

---

## Timeline

| Week | Phase | Tasks |
|------|-------|-------|
| 1 | Backend Setup | Install deps, configure DB, setup Resend |
| 1 | Auth Implementation | Magic links, JWT, auth routes |
| 2 | Data Migration | Export Google Sheets, import to PostgreSQL |
| 2 | Frontend Integration | API client, update components |
| 3 | Testing | Integration tests, load testing |
| 3 | Deployment | Deploy backend, update frontend env |

---

## Cost Estimate (Free Tier)

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| Supabase DB | 500MB, 2 projects | $25/month |
| Railway | $5 credit | $5-20/month |
| Resend | 3,000 emails/month | $20/month (50k emails) |
| Redis (Upstash) | 10k requests/day | $0.20 per 100k requests |
| **Total** | **$0/month** | **$50-70/month** |

---

## Next Steps

1. **Decide on database hosting**: Supabase (easiest) vs Railway vs Neon
2. **Create Resend account**: Get API key and verify domain
3. **Install dependencies**: Run npm install in `packages/api`
4. **Run database migrations**: Create tables with schema.sql
5. **Start implementing auth routes**: Begin with Phase 2

Would you like me to start implementing any specific phase?
