-- SportsRaiser Platform Database Schema
-- PostgreSQL with Row Level Security (RLS)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE role AS ENUM (
  'OWNER',
  'CEO', 
  'REGIONAL_DIRECTOR',
  'STATE_DIRECTOR',
  'TERRITORY_DIRECTOR',
  'SALES_REP',
  'ORG_OWNER',
  'PROGRAM_DIRECTOR',
  'HEAD_COACH',
  'PARENT_STUDENT'
);

CREATE TYPE org_type AS ENUM ('club', 'school');
CREATE TYPE prospect_stage AS ENUM ('ADDED', 'SIGNED', 'STARTED', 'COMPLETED');
CREATE TYPE scope_type AS ENUM ('team', 'program', 'org', 'territory', 'state', 'region', 'national');
CREATE TYPE campaign_type AS ENUM ('pizza_card');
CREATE TYPE processor_type AS ENUM ('paypal');
CREATE TYPE reward_type AS ENUM ('commission', 'prize', 'gift_card', 'multiplier');
CREATE TYPE leaderboard_period AS ENUM ('daily', 'weekly', 'all_time');
CREATE TYPE leaderboard_metric AS ENUM ('cards', 'revenue', 'pct_goal', 'avg_per_athlete', 'participation');

-- Users table (central identity)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role role NOT NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  org_id UUID,
  program_id UUID,
  team_id UUID,
  territory_id UUID,
  state_code TEXT,
  region_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations (Clubs/Schools)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type org_type NOT NULL,
  address TEXT,
  district TEXT,
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programs (by sport within an org)
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  director_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  head_coach_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  goal_cards INTEGER DEFAULT 0,
  goal_revenue INTEGER DEFAULT 0, -- in cents
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Athlete profiles (links to existing Parents/Students users)
CREATE TABLE athlete_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  jersey TEXT,
  grad_year INTEGER,
  parent_contact_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prospects (Referral CRM)
CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  state_code TEXT,
  notes TEXT,
  stage prospect_stage DEFAULT 'ADDED',
  stage_dates_json JSONB DEFAULT '{}',
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  source_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns/Fundraisers
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope_type scope_type NOT NULL,
  scope_id UUID NOT NULL,
  type campaign_type DEFAULT 'pizza_card',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  goal_cards INTEGER DEFAULT 0,
  goal_revenue INTEGER DEFAULT 0, -- in cents
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions (PayPal webhook data)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  seller_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- in cents
  quantity INTEGER NOT NULL,
  sku TEXT,
  processor processor_type DEFAULT 'paypal',
  external_txn_id TEXT UNIQUE,
  attributed_affiliate_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral events (for points tracking)
CREATE TABLE referral_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  stage prospect_stage NOT NULL,
  points INTEGER NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard entries (materialized for performance)
CREATE TABLE leaderboard_entries (
  scope_type scope_type NOT NULL,
  scope_id UUID NOT NULL,
  metric leaderboard_metric NOT NULL,
  value_num NUMERIC NOT NULL,
  rank INTEGER NOT NULL,
  period leaderboard_period DEFAULT 'all_time',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (scope_type, scope_id, metric, period, rank)
);

-- Payouts and rewards
CREATE TABLE payouts_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type reward_type NOT NULL,
  value_num_or_code TEXT NOT NULL,
  source_event_id UUID,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  before_json JSONB,
  after_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraints for users table
ALTER TABLE users ADD CONSTRAINT fk_users_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_program FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_program_id ON users(program_id);
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_territory_id ON users(territory_id);
CREATE INDEX idx_users_state_code ON users(state_code);
CREATE INDEX idx_users_region_code ON users(region_code);

CREATE INDEX idx_programs_org_id ON programs(org_id);
CREATE INDEX idx_programs_director_user_id ON programs(director_user_id);

CREATE INDEX idx_teams_program_id ON teams(program_id);
CREATE INDEX idx_teams_head_coach_user_id ON teams(head_coach_user_id);

CREATE INDEX idx_athlete_profiles_team_id ON athlete_profiles(team_id);

CREATE INDEX idx_prospects_referrer_user_id ON prospects(referrer_user_id);
CREATE INDEX idx_prospects_owner_user_id ON prospects(owner_user_id);
CREATE INDEX idx_prospects_stage ON prospects(stage);
CREATE INDEX idx_prospects_state_code ON prospects(state_code);

CREATE INDEX idx_campaigns_scope ON campaigns(scope_type, scope_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

CREATE INDEX idx_transactions_campaign_id ON transactions(campaign_id);
CREATE INDEX idx_transactions_seller_user_id ON transactions(seller_user_id);
CREATE INDEX idx_transactions_external_txn_id ON transactions(external_txn_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

CREATE INDEX idx_referral_events_prospect_id ON referral_events(prospect_id);
CREATE INDEX idx_referral_events_awarded_at ON referral_events(awarded_at);

CREATE INDEX idx_leaderboard_entries_scope ON leaderboard_entries(scope_type, scope_id);
CREATE INDEX idx_leaderboard_entries_metric ON leaderboard_entries(metric);
CREATE INDEX idx_leaderboard_entries_period ON leaderboard_entries(period);

CREATE INDEX idx_payouts_rewards_user_id ON payouts_rewards(user_id);
CREATE INDEX idx_payouts_rewards_type ON payouts_rewards(type);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy Functions
CREATE OR REPLACE FUNCTION get_user_scopes(user_id UUID)
RETURNS TABLE (
  org_id UUID,
  program_id UUID,
  team_id UUID,
  territory_id UUID,
  state_code TEXT,
  region_code TEXT,
  role role
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.org_id,
    u.program_id,
    u.team_id,
    u.territory_id,
    u.state_code,
    u.region_code,
    u.role
  FROM users u
  WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users RLS Policies
CREATE POLICY users_select_policy ON users
  FOR SELECT
  USING (
    -- Users can see themselves
    id = current_setting('app.current_user_id')::UUID
    OR
    -- Owners and CEO can see all users
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role IN ('OWNER', 'CEO')
    )
    OR
    -- Regional Directors can see users in their region
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role = 'REGIONAL_DIRECTOR'
      AND u.region_code = users.region_code
    )
    OR
    -- State Directors can see users in their state
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role = 'STATE_DIRECTOR'
      AND u.state_code = users.state_code
    )
    OR
    -- Territory Directors can see users in their territory
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role = 'TERRITORY_DIRECTOR'
      AND u.territory_id = users.territory_id
    )
    OR
    -- Sales Reps can see users in their assigned accounts
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role = 'SALES_REP'
      AND u.territory_id = users.territory_id
    )
    OR
    -- Org Owners can see users in their org
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role = 'ORG_OWNER'
      AND u.org_id = users.org_id
    )
    OR
    -- Program Directors can see users in their program
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role = 'PROGRAM_DIRECTOR'
      AND u.program_id = users.program_id
    )
    OR
    -- Head Coaches can see users in their team and peer teams in same program
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role = 'HEAD_COACH'
      AND u.program_id = users.program_id
    )
  );

-- Organizations RLS Policies
CREATE POLICY organizations_select_policy ON organizations
  FOR SELECT
  USING (
    -- Owners and CEO can see all orgs
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role IN ('OWNER', 'CEO')
    )
    OR
    -- Regional Directors can see orgs in their region
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role = 'REGIONAL_DIRECTOR'
      AND EXISTS (
        SELECT 1 FROM users u2 
        WHERE u2.org_id = organizations.id 
        AND u2.region_code = u.region_code
      )
    )
    OR
    -- State Directors can see orgs in their state
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role = 'STATE_DIRECTOR'
      AND EXISTS (
        SELECT 1 FROM users u2 
        WHERE u2.org_id = organizations.id 
        AND u2.state_code = u.state_code
      )
    )
    OR
    -- Territory Directors can see orgs in their territory
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role = 'TERRITORY_DIRECTOR'
      AND EXISTS (
        SELECT 1 FROM users u2 
        WHERE u2.org_id = organizations.id 
        AND u2.territory_id = u.territory_id
      )
    )
    OR
    -- Sales Reps can see orgs in their territory
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role = 'SALES_REP'
      AND EXISTS (
        SELECT 1 FROM users u2 
        WHERE u2.org_id = organizations.id 
        AND u2.territory_id = u.territory_id
      )
    )
    OR
    -- Org Owners can see their own org
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role = 'ORG_OWNER'
      AND u.org_id = organizations.id
    )
    OR
    -- Program Directors can see their org
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role = 'PROGRAM_DIRECTOR'
      AND u.org_id = organizations.id
    )
    OR
    -- Head Coaches can see their org
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role = 'HEAD_COACH'
      AND u.org_id = organizations.id
    )
    OR
    -- Parents/Students can see their org
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = current_setting('app.current_user_id')::UUID 
      AND u.role = 'PARENT_STUDENT'
      AND u.org_id = organizations.id
    )
  );

-- Similar policies for other tables...
-- (Additional RLS policies would be created for programs, teams, prospects, etc.)

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_athlete_profiles_updated_at BEFORE UPDATE ON athlete_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON prospects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data function
CREATE OR REPLACE FUNCTION seed_initial_data()
RETURNS VOID AS $$
DECLARE
  owner_id UUID;
  ceo_id UUID;
  regional_dir_id UUID;
  state_dir_id UUID;
  territory_dir_id UUID;
  sales_rep_id UUID;
  org_owner_id UUID;
  program_dir_id UUID;
  head_coach_id UUID;
  parent_student_id UUID;
  org_id UUID;
  program_id UUID;
  team_id UUID;
BEGIN
  -- Create initial users
  INSERT INTO users (id, name, email, role) VALUES 
    (uuid_generate_v4(), 'System Owner', 'owner@sportsraiser.com', 'OWNER'),
    (uuid_generate_v4(), 'CEO', 'ceo@sportsraiser.com', 'CEO'),
    (uuid_generate_v4(), 'Regional Director', 'regional@sportsraiser.com', 'REGIONAL_DIRECTOR'),
    (uuid_generate_v4(), 'State Director', 'state@sportsraiser.com', 'STATE_DIRECTOR'),
    (uuid_generate_v4(), 'Territory Director', 'territory@sportsraiser.com', 'TERRITORY_DIRECTOR'),
    (uuid_generate_v4(), 'Sales Rep', 'sales@sportsraiser.com', 'SALES_REP'),
    (uuid_generate_v4(), 'Club Director', 'club@sportsraiser.com', 'ORG_OWNER'),
    (uuid_generate_v4(), 'Program Director', 'program@sportsraiser.com', 'PROGRAM_DIRECTOR'),
    (uuid_generate_v4(), 'Head Coach', 'coach@sportsraiser.com', 'HEAD_COACH'),
    (uuid_generate_v4(), 'Parent Student', 'parent@sportsraiser.com', 'PARENT_STUDENT')
  RETURNING id INTO owner_id;
  
  -- Get the IDs
  SELECT id INTO ceo_id FROM users WHERE role = 'CEO' LIMIT 1;
  SELECT id INTO regional_dir_id FROM users WHERE role = 'REGIONAL_DIRECTOR' LIMIT 1;
  SELECT id INTO state_dir_id FROM users WHERE role = 'STATE_DIRECTOR' LIMIT 1;
  SELECT id INTO territory_dir_id FROM users WHERE role = 'TERRITORY_DIRECTOR' LIMIT 1;
  SELECT id INTO sales_rep_id FROM users WHERE role = 'SALES_REP' LIMIT 1;
  SELECT id INTO org_owner_id FROM users WHERE role = 'ORG_OWNER' LIMIT 1;
  SELECT id INTO program_dir_id FROM users WHERE role = 'PROGRAM_DIRECTOR' LIMIT 1;
  SELECT id INTO head_coach_id FROM users WHERE role = 'HEAD_COACH' LIMIT 1;
  SELECT id INTO parent_student_id FROM users WHERE role = 'PARENT_STUDENT' LIMIT 1;
  
  -- Update user scopes
  UPDATE users SET 
    region_code = 'WEST',
    state_code = 'CA',
    territory_id = territory_dir_id
  WHERE role IN ('REGIONAL_DIRECTOR', 'STATE_DIRECTOR', 'TERRITORY_DIRECTOR', 'SALES_REP');
  
  -- Create sample organization
  INSERT INTO organizations (id, name, type, owner_user_id) VALUES 
    (uuid_generate_v4(), 'Sample Soccer Club', 'club', org_owner_id)
  RETURNING id INTO org_id;
  
  -- Update org owner
  UPDATE users SET org_id = org_id WHERE id = org_owner_id;
  
  -- Create sample program
  INSERT INTO programs (id, org_id, sport, director_user_id) VALUES 
    (uuid_generate_v4(), org_id, 'Soccer', program_dir_id)
  RETURNING id INTO program_id;
  
  -- Update program director
  UPDATE users SET program_id = program_id WHERE id = program_dir_id;
  
  -- Create sample team
  INSERT INTO teams (id, program_id, name, head_coach_user_id, goal_cards, goal_revenue) VALUES 
    (uuid_generate_v4(), program_id, 'U12 Eagles', head_coach_id, 100, 1000000)
  RETURNING id INTO team_id;
  
  -- Update head coach and parent student
  UPDATE users SET team_id = team_id WHERE id IN (head_coach_id, parent_student_id);
  
  -- Create athlete profile for parent student
  INSERT INTO athlete_profiles (user_id, team_id, jersey, grad_year) VALUES 
    (parent_student_id, team_id, '10', 2030);
  
  -- Create sample campaign
  INSERT INTO campaigns (id, scope_type, scope_id, goal_cards, goal_revenue, start_at, end_at) VALUES 
    (uuid_generate_v4(), 'team', team_id, 100, 1000000, NOW(), NOW() + INTERVAL '30 days');
  
END;
$$ LANGUAGE plpgsql;

-- Run seed data
SELECT seed_initial_data();
