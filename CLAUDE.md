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

### Monorepo (Workspaces)
```bash
npm run dev              # Run web + api concurrently
npm run dev:web          # Run web package only
npm run dev:api          # Run api package only
```

### Build & Testing
```bash
npm run build            # Build both web and api
npm run build:web        # Build web package
npm run build:api        # Build api package
npm run build:analyze    # Build with bundle size analysis
npm test                 # Run all tests
npm run test:web         # Test web package
npm run test:api         # Test api package
```

### Database (Workspaces)
```bash
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database
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

### Monorepo Structure
- **packages/web** - Frontend React app
- **packages/api** - Backend API services
- **packages/db** - Database migrations and models
- **packages/core** - Shared types and utilities
- **packages/infra** - Infrastructure as code
- **packages/workers** - Background job workers

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

## Important Notes

- **Demo data fallback**: If Google Sheets credentials missing, app uses hardcoded demo data
- **No real backend**: All writes go through Google Apps Script web app
- **QR functionality**: QR_Link column (K) stores shareable QR code URLs
- **Programs/Teams**: Multi-program support with Programs sheet mapping teams to programs
- **Type safety**: TypeScript types in `src/types/` for role definitions
