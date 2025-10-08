// packages/core/src/types/index.ts
export type Role = 
  | 'OWNER'
  | 'CEO'
  | 'REGIONAL_DIRECTOR'
  | 'STATE_DIRECTOR'
  | 'TERRITORY_DIRECTOR'
  | 'SALES_REP'
  | 'ORG_OWNER'
  | 'PROGRAM_DIRECTOR'
  | 'HEAD_COACH'
  | 'PARENT_STUDENT';

export type OrgType = 'club' | 'school';
export type ProspectStage = 'ADDED' | 'SIGNED' | 'STARTED' | 'COMPLETED';
export type ScopeType = 'team' | 'program' | 'org' | 'territory' | 'state' | 'region' | 'national';
export type CampaignType = 'pizza_card';
export type ProcessorType = 'paypal';
export type RewardType = 'commission' | 'prize' | 'gift_card' | 'multiplier';
export type LeaderboardPeriod = 'daily' | 'weekly' | 'all_time';
export type LeaderboardMetric = 'cards' | 'revenue' | 'pct_goal' | 'avg_per_athlete' | 'participation';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  org_id?: string;
  program_id?: string;
  team_id?: string;
  territory_id?: string;
  state_code?: string;
  region_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  address?: string;
  district?: string;
  owner_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  org_id: string;
  sport: string;
  director_user_id?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  program_id: string;
  name: string;
  head_coach_user_id?: string;
  goal_cards: number;
  goal_revenue: number; // in cents
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

export interface AthleteProfile {
  user_id: string;
  team_id: string;
  jersey?: string;
  grad_year?: number;
  parent_contact_json: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Prospect {
  id: string;
  referrer_user_id: string;
  org_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  state_code?: string;
  notes?: string;
  stage: ProspectStage;
  stage_dates_json: Record<string, string>;
  owner_user_id?: string;
  source_tag?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  scope_type: ScopeType;
  scope_id: string;
  type: CampaignType;
  start_at?: string;
  end_at?: string;
  goal_cards: number;
  goal_revenue: number; // in cents
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  campaign_id: string;
  seller_user_id: string;
  amount: number; // in cents
  quantity: number;
  sku?: string;
  processor: ProcessorType;
  external_txn_id?: string;
  attributed_affiliate_id?: string;
  created_at: string;
}

export interface ReferralEvent {
  id: string;
  prospect_id: string;
  stage: ProspectStage;
  points: number;
  awarded_at: string;
}

export interface LeaderboardEntry {
  scope_type: ScopeType;
  scope_id: string;
  metric: LeaderboardMetric;
  value_num: number;
  rank: number;
  period: LeaderboardPeriod;
  updated_at: string;
}

export interface PayoutReward {
  id: string;
  user_id: string;
  type: RewardType;
  value_num_or_code: string;
  source_event_id?: string;
  released_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  action: string;
  target_type: string;
  target_id?: string;
  before_json?: Record<string, any>;
  after_json?: Record<string, any>;
  created_at: string;
}

// Permission types
export interface Permission {
  resource: string;
  action: string;
  scope?: {
    type: ScopeType;
    id?: string;
  };
}

export interface UserScopes {
  org_id?: string;
  program_id?: string;
  team_id?: string;
  territory_id?: string;
  state_code?: string;
  region_code?: string;
  role: Role;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request types
export interface CreateProspectRequest {
  org_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  state_code?: string;
  notes?: string;
  source_tag?: string;
}

export interface UpdateProspectRequest {
  stage?: ProspectStage;
  notes?: string;
  owner_user_id?: string;
}

export interface CreateCampaignRequest {
  scope_type: ScopeType;
  scope_id: string;
  start_at?: string;
  end_at?: string;
  goal_cards: number;
  goal_revenue: number;
}

export interface LeaderboardRequest {
  scope_type: ScopeType;
  scope_id: string;
  metric: LeaderboardMetric;
  period?: LeaderboardPeriod;
}

export interface MessageRequest {
  template_id: string;
  recipients: string[];
  substitutions: Record<string, string>;
}
