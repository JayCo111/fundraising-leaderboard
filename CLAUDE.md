# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SportsRaiser Platform** - A multi-role fundraising platform with role-based access control (RBAC), real-time leaderboards, referral CRM, and Google Sheets integration. Built with React 18 and designed for students, parents, coaches, sales reps, and organizational directors.

## Commands

### Development
```bash
npm start                 # Start React app (fast mode, no source maps)
npm run start:fast        # Start with Fast Refresh enabled
npm run start:analyze     # Start with bundle analyzer
```

### Build & Testing
```bash
npm run build            # Build production bundle
npm run build:analyze    # Build with bundle size analysis
npm test                 # Run tests in watch mode
```

### Code Quality
```bash
npm run lint             # Lint and auto-fix
npm run lint:check       # Lint without fixing
npm run format           # Format with Prettier
npm run clean            # Clean build artifacts
```

## Architecture

### Multi-Role Dashboard System

The application uses **role-based routing** to serve different dashboards based on user roles:

- **DashboardRouter** (`src/components/DashboardRouter.js`) - Main routing logic that determines which dashboard to render
- **Roles** (`src/types/`) - Type definitions for all user roles:
  - `OWNER`, `CEO` - National scope
  - `REGIONAL_DIRECTOR`, `STATE_DIRECTOR`, `TERRITORY_DIRECTOR` - Geographic hierarchy
  - `SALES_REP` - Territory-level CRM and prospecting
  - `ORG_OWNER`, `PROGRAM_DIRECTOR` - Organization/program management
  - `HEAD_COACH` - Team-level management
  - `PARENT_STUDENT` - Student fundraising portal

### Data Architecture

**Google Sheets Backend**: The app uses Google Sheets as a database with four main sheets:
- **Students** (A2:K1000): StudentID, FirstName, LastName, Team, Goal_$, ParentEmail, PersonalLink, QR_URL, Avatar_URL, Program, QR_Link
- **Orders** (A2:I1000): Timestamp, OrderID, BuyerName, BuyerEmail, BuyerPhone, Quantity, TotalPaid, StudentID, Status
- **Referrals** (A2:J1000): ReferralID, StudentID, ReferralName, ReferralEmail, ReferralPhone, Organization, Stage, Points, DateAdded, LastUpdated
- **Programs** (A2:B1000): Team, Program

**Configuration**: `src/config/googleSheets.js` defines ranges and uses environment variables:
- `REACT_APP_GOOGLE_SHEET_ID` - Sheet ID
- `REACT_APP_GOOGLE_API_KEY` - API key for reads
- `REACT_APP_GOOGLE_APPS_SCRIPT_URL` - Apps Script endpoint for writes

### Data Flow Pattern

1. **Read Operations**: Direct Google Sheets API calls in `App.js` `useEffect`
2. **Write Operations**: Google Apps Script web app endpoint (see `WRITE_FUNCTIONALITY_SETUP.md`)
3. **Data Enrichment**: `useMemo` hooks calculate derived fields:
   - `enrichedStudents` - Adds CardsSold, NetRaised, ReferralPoints, TotalRewards
   - `rankedStudents` - Adds OverallRank, Medal
   - `studentsWithTeamStats` - Adds Team_Cards, Team_Net, TeamRank, Rel_TeamMates
   - `teamRankings` - Aggregates team-level statistics
   - `referralRankings` - Ranks students by referral performance

### Component Architecture

**Main App** (`src/App.js`):
- Handles authentication state
- Fetches all data from Google Sheets
- Computes derived data (rankings, team stats, referral points)
- Routes to tab components based on `activeTab` state

**Tab Components**:
- `MyTeamTab` - Team member list with stats
- `EveryoneTab` - All students leaderboard
- `TeamVsTeamTab` - Team-level competition view
- `ReferralsTab` - Student referral CRM with prospect tracking
- `ProfilePage` - Student profile management

**Demo Components**:
- `DashboardDemo` - Shows all role-based dashboards
- `DirectorDashboard` - For executives and directors
- `SalesRepCRM` - Sales rep prospecting and pipeline
- `ClubSchoolDirector` - Organization/program management
- `HeadCoachDashboard` - Team management for coaches
- `AdvancedReferralCRM` - Enterprise referral management
- `MessagingCenter` - Communication hub
- `PayoutsRewards` - Payout tracking
- `AuditExports` - Data export and audit logs

### Webpack Optimization

The project uses **CRACO** (`craco.config.js`) for custom webpack configuration:
- **Path aliases**: `@/`, `@components`, `@services`, `@utils`, `@types`
- **Development**: Fast refresh, optimized chunk splitting, `eval-cheap-module-source-map`
- **Production**: Tree shaking, vendor splitting per npm package

## Key Technical Details

### Authentication Pattern
- Email-based login (no passwords in current implementation)
- Parent email from Students sheet matches login input
- `currentStudent` state holds authenticated user
- Row-level privacy: parents only see their own student's order details

### Ranking System
1. Students ranked by `NetRaised` (sum of paid orders minus refunds)
2. Top 3 get medals (🥇🥈🥉)
3. Team rankings calculated within each team, sorted by NetRaised
4. Overall leaderboard shows all students across teams

### Referral Points System
- Referrals tracked in separate Google Sheet
- Stage progression: Contacted → Interested → Meeting Scheduled → Signed Up
- Points awarded per referral (configurable)
- `TotalRewards = NetRaised + ReferralPoints`

### Project Structure
- **src/** - Main React application
  - **components/** - React components including dashboards for different roles
  - **config/** - Configuration files (Google Sheets, etc.)
  - **services/** - Business logic services (MessageService, ReferralCRMService)
  - **utils/** - Utility functions (Google Sheets write, email, password security)
  - **types/** - TypeScript/JavaScript type definitions
- **packages/** - Future monorepo packages (api, db, core planned but not implemented)
  - Contains placeholder structure and type definitions for future backend services

## ESLint Rules
- Modern JS required: `prefer-const`, `no-var`, `arrow-spacing`
- React: No need to import React in JSX files
- Warnings: unused vars, console logs
- Errors: duplicate imports, useless renames

## Environment Setup
Copy `.env.example` to `.env` and configure:
```
REACT_APP_GOOGLE_SHEET_ID=your_sheet_id
REACT_APP_GOOGLE_API_KEY=your_api_key
REACT_APP_GOOGLE_APPS_SCRIPT_URL=your_apps_script_url
```

See `WRITE_FUNCTIONALITY_SETUP.md` for Google Apps Script deployment instructions.

## Code Quality Standards

### CRITICAL: Always Ensure Clean Builds

**Before committing ANY code, you MUST:**

1. **Check for all required imports**: Every icon, component, or utility used in JSX must be imported
2. **Run linting**: `npm run lint:check` to catch errors before commit
3. **Fix all ESLint errors**: Warnings are acceptable, but errors will break the build
4. **Test the build locally**: If possible, run `npm run build` to ensure production build succeeds

### Common Issues to Avoid

#### 1. Missing Icon Imports
❌ **WRONG:**
```javascript
import { Trophy } from 'lucide-react';

<DollarSign className="w-4 h-4" /> // DollarSign not imported!
```

✅ **CORRECT:**
```javascript
import { Trophy, DollarSign } from 'lucide-react';

<DollarSign className="w-4 h-4" />
```

#### 2. Template Variables in Strings
❌ **WRONG:**
```javascript
const template = `Total: ${{amount}}`; // ESLint error: 'amount' is not defined
```

✅ **CORRECT:**
```javascript
// eslint-disable-next-line no-template-curly-in-string
const template = `Total: $\${amount}`; // Escaped for Mustache templates
```

#### 3. Unused Variables
- Remove unused imports and variables
- If a variable is defined for future use, prefix with underscore: `_futureFeature`

#### 4. Console Statements
- Console logs are **warnings** (acceptable in development)
- Remove before production deployment when possible

### Pre-Commit Checklist

```bash
# 1. Lint the code
npm run lint:check

# 2. Fix auto-fixable issues
npm run lint

# 3. Format code
npm run format

# 4. Verify no ESLint ERRORS remain (warnings are OK)
# Errors = build will fail
# Warnings = build succeeds but code could be cleaner
```

### Build Error Recovery

If Vercel build fails:
1. Read the error log carefully - it shows exact file:line numbers
2. Fix all `react/jsx-no-undef` errors (missing imports)
3. Fix all `no-undef` errors (undefined variables)
4. Re-run `npm run lint:check` locally
5. Commit and push the fixes

## Important Notes

- **Demo data fallback**: If Google Sheets credentials missing, app uses hardcoded demo data
- **No real backend**: All writes go through Google Apps Script web app
- **QR functionality**: QR_Link column (K) stores shareable QR code URLs
- **Programs/Teams**: Multi-program support with Programs sheet mapping teams to programs
- **Type safety**: TypeScript types in `src/types/` for role definitions
