// packages/api/src/services/leaderboardService.ts
import { Pool } from 'pg';
import { config } from '../config';
import { 
  LeaderboardRequest, 
  LeaderboardEntry, 
  UserScopes, 
  ScopeType, 
  LeaderboardMetric,
  LeaderboardPeriod 
} from '@sportsraiser/core/types';
import { RBACService } from '@sportsraiser/core/rbac';

export class LeaderboardService {
  private db: Pool;

  constructor() {
    this.db = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async getLeaderboard(request: LeaderboardRequest, userScopes: UserScopes): Promise<LeaderboardEntry[]> {
    // Check if user can access this scope
    if (!RBACService.canAccessScope(userScopes, { type: request.scope_type, id: request.scope_id })) {
      throw new Error('Insufficient permissions to access this scope');
    }

    const query = `
      SELECT 
        scope_type,
        scope_id,
        metric,
        value_num,
        rank,
        period,
        updated_at
      FROM leaderboard_entries
      WHERE scope_type = $1 
        AND scope_id = $2 
        AND metric = $3 
        AND period = $4
      ORDER BY rank ASC
      LIMIT 100
    `;

    const result = await this.db.query(query, [
      request.scope_type,
      request.scope_id,
      request.metric,
      request.period
    ]);

    return result.rows;
  }

  async getTeamVsTeam(request: LeaderboardRequest, userScopes: UserScopes): Promise<any[]> {
    // Get all teams in the program
    const teamsQuery = `
      SELECT 
        t.id,
        t.name,
        t.goal_cards,
        t.goal_revenue,
        COALESCE(SUM(tr.quantity), 0) as total_cards,
        COALESCE(SUM(tr.amount), 0) as total_revenue,
        COUNT(DISTINCT ap.user_id) as athlete_count,
        COUNT(DISTINCT CASE WHEN tr.id IS NOT NULL THEN ap.user_id END) as active_sellers
      FROM teams t
      LEFT JOIN athlete_profiles ap ON t.id = ap.team_id
      LEFT JOIN transactions tr ON ap.user_id = tr.seller_user_id
      WHERE t.program_id = $1
      GROUP BY t.id, t.name, t.goal_cards, t.goal_revenue
      ORDER BY 
        CASE WHEN $2 = 'cards' THEN COALESCE(SUM(tr.quantity), 0) END DESC,
        CASE WHEN $2 = 'revenue' THEN COALESCE(SUM(tr.amount), 0) END DESC,
        CASE WHEN $2 = 'pct_goal' THEN (COALESCE(SUM(tr.amount), 0)::float / NULLIF(t.goal_revenue, 0)) END DESC,
        CASE WHEN $2 = 'participation' THEN (COUNT(DISTINCT CASE WHEN tr.id IS NOT NULL THEN ap.user_id END)::float / NULLIF(COUNT(DISTINCT ap.user_id), 0)) END DESC,
        CASE WHEN $2 = 'avg_per_athlete' THEN (COALESCE(SUM(tr.amount), 0)::float / NULLIF(COUNT(DISTINCT ap.user_id), 0)) END DESC
    `;

    const result = await this.db.query(teamsQuery, [request.scope_id, request.metric]);
    
    return result.rows.map((row, index) => ({
      ...row,
      rank: index + 1,
      participation_rate: row.athlete_count > 0 ? (row.active_sellers / row.athlete_count) : 0,
      goal_percentage: row.goal_revenue > 0 ? (row.total_revenue / row.goal_revenue) : 0,
      avg_per_athlete: row.athlete_count > 0 ? (row.total_revenue / row.athlete_count) : 0
    }));
  }

  async getAthleteLeaderboard(request: LeaderboardRequest, userScopes: UserScopes): Promise<any[]> {
    const query = `
      SELECT 
        u.id,
        u.name,
        ap.jersey,
        COALESCE(SUM(tr.quantity), 0) as total_cards,
        COALESCE(SUM(tr.amount), 0) as total_revenue,
        COUNT(tr.id) as transaction_count,
        MIN(tr.created_at) as first_sale_date,
        MAX(tr.created_at) as last_sale_date
      FROM users u
      JOIN athlete_profiles ap ON u.id = ap.user_id
      LEFT JOIN transactions tr ON u.id = tr.seller_user_id
      WHERE ap.team_id = $1
      GROUP BY u.id, u.name, ap.jersey
      ORDER BY 
        CASE WHEN $2 = 'cards' THEN COALESCE(SUM(tr.quantity), 0) END DESC,
        CASE WHEN $2 = 'revenue' THEN COALESCE(SUM(tr.amount), 0) END DESC,
        CASE WHEN $2 = 'avg_per_athlete' THEN COALESCE(SUM(tr.amount), 0) END DESC
    `;

    const result = await this.db.query(query, [request.scope_id, request.metric]);
    
    return result.rows.map((row, index) => ({
      ...row,
      rank: index + 1,
      avg_per_transaction: row.transaction_count > 0 ? (row.total_revenue / row.transaction_count) : 0
    }));
  }

  async getProgramLeaderboard(request: LeaderboardRequest, userScopes: UserScopes): Promise<any[]> {
    const query = `
      SELECT 
        p.id,
        p.sport,
        COALESCE(SUM(tr.quantity), 0) as total_cards,
        COALESCE(SUM(tr.amount), 0) as total_revenue,
        COUNT(DISTINCT t.id) as team_count,
        COUNT(DISTINCT ap.user_id) as athlete_count,
        COUNT(DISTINCT CASE WHEN tr.id IS NOT NULL THEN ap.user_id END) as active_sellers
      FROM programs p
      LEFT JOIN teams t ON p.id = t.program_id
      LEFT JOIN athlete_profiles ap ON t.id = ap.team_id
      LEFT JOIN transactions tr ON ap.user_id = tr.seller_user_id
      WHERE p.org_id = $1
      GROUP BY p.id, p.sport
      ORDER BY 
        CASE WHEN $2 = 'cards' THEN COALESCE(SUM(tr.quantity), 0) END DESC,
        CASE WHEN $2 = 'revenue' THEN COALESCE(SUM(tr.amount), 0) END DESC,
        CASE WHEN $2 = 'participation' THEN (COUNT(DISTINCT CASE WHEN tr.id IS NOT NULL THEN ap.user_id END)::float / NULLIF(COUNT(DISTINCT ap.user_id), 0)) END DESC,
        CASE WHEN $2 = 'avg_per_athlete' THEN (COALESCE(SUM(tr.amount), 0)::float / NULLIF(COUNT(DISTINCT ap.user_id), 0)) END DESC
    `;

    const result = await this.db.query(query, [request.scope_id, request.metric]);
    
    return result.rows.map((row, index) => ({
      ...row,
      rank: index + 1,
      participation_rate: row.athlete_count > 0 ? (row.active_sellers / row.athlete_count) : 0,
      avg_per_athlete: row.athlete_count > 0 ? (row.total_revenue / row.athlete_count) : 0
    }));
  }

  async getTerritoryLeaderboard(request: LeaderboardRequest, userScopes: UserScopes): Promise<any[]> {
    const query = `
      SELECT 
        o.id,
        o.name,
        o.type,
        COALESCE(SUM(tr.quantity), 0) as total_cards,
        COALESCE(SUM(tr.amount), 0) as total_revenue,
        COUNT(DISTINCT p.id) as program_count,
        COUNT(DISTINCT t.id) as team_count,
        COUNT(DISTINCT ap.user_id) as athlete_count,
        COUNT(DISTINCT CASE WHEN tr.id IS NOT NULL THEN ap.user_id END) as active_sellers
      FROM organizations o
      LEFT JOIN programs p ON o.id = p.org_id
      LEFT JOIN teams t ON p.id = t.program_id
      LEFT JOIN athlete_profiles ap ON t.id = ap.team_id
      LEFT JOIN transactions tr ON ap.user_id = tr.seller_user_id
      WHERE o.id IN (
        SELECT DISTINCT org_id 
        FROM users 
        WHERE territory_id = $1 AND org_id IS NOT NULL
      )
      GROUP BY o.id, o.name, o.type
      ORDER BY 
        CASE WHEN $2 = 'cards' THEN COALESCE(SUM(tr.quantity), 0) END DESC,
        CASE WHEN $2 = 'revenue' THEN COALESCE(SUM(tr.amount), 0) END DESC,
        CASE WHEN $2 = 'participation' THEN (COUNT(DISTINCT CASE WHEN tr.id IS NOT NULL THEN ap.user_id END)::float / NULLIF(COUNT(DISTINCT ap.user_id), 0)) END DESC,
        CASE WHEN $2 = 'avg_per_athlete' THEN (COALESCE(SUM(tr.amount), 0)::float / NULLIF(COUNT(DISTINCT ap.user_id), 0)) END DESC
    `;

    const result = await this.db.query(query, [request.scope_id, request.metric]);
    
    return result.rows.map((row, index) => ({
      ...row,
      rank: index + 1,
      participation_rate: row.athlete_count > 0 ? (row.active_sellers / row.athlete_count) : 0,
      avg_per_athlete: row.athlete_count > 0 ? (row.total_revenue / row.athlete_count) : 0
    }));
  }

  async getStateLeaderboard(request: LeaderboardRequest, userScopes: UserScopes): Promise<any[]> {
    const query = `
      SELECT 
        o.id,
        o.name,
        o.type,
        COALESCE(SUM(tr.quantity), 0) as total_cards,
        COALESCE(SUM(tr.amount), 0) as total_revenue,
        COUNT(DISTINCT p.id) as program_count,
        COUNT(DISTINCT t.id) as team_count,
        COUNT(DISTINCT ap.user_id) as athlete_count,
        COUNT(DISTINCT CASE WHEN tr.id IS NOT NULL THEN ap.user_id END) as active_sellers
      FROM organizations o
      LEFT JOIN programs p ON o.id = p.org_id
      LEFT JOIN teams t ON p.id = t.program_id
      LEFT JOIN athlete_profiles ap ON t.id = ap.team_id
      LEFT JOIN transactions tr ON ap.user_id = tr.seller_user_id
      WHERE o.id IN (
        SELECT DISTINCT org_id 
        FROM users 
        WHERE state_code = $1 AND org_id IS NOT NULL
      )
      GROUP BY o.id, o.name, o.type
      ORDER BY 
        CASE WHEN $2 = 'cards' THEN COALESCE(SUM(tr.quantity), 0) END DESC,
        CASE WHEN $2 = 'revenue' THEN COALESCE(SUM(tr.amount), 0) END DESC,
        CASE WHEN $2 = 'participation' THEN (COUNT(DISTINCT CASE WHEN tr.id IS NOT NULL THEN ap.user_id END)::float / NULLIF(COUNT(DISTINCT ap.user_id), 0)) END DESC,
        CASE WHEN $2 = 'avg_per_athlete' THEN (COALESCE(SUM(tr.amount), 0)::float / NULLIF(COUNT(DISTINCT ap.user_id), 0)) END DESC
    `;

    const result = await this.db.query(query, [request.scope_id, request.metric]);
    
    return result.rows.map((row, index) => ({
      ...row,
      rank: index + 1,
      participation_rate: row.athlete_count > 0 ? (row.active_sellers / row.athlete_count) : 0,
      avg_per_athlete: row.athlete_count > 0 ? (row.total_revenue / row.athlete_count) : 0
    }));
  }

  async getRegionLeaderboard(request: LeaderboardRequest, userScopes: UserScopes): Promise<any[]> {
    const query = `
      SELECT 
        o.id,
        o.name,
        o.type,
        COALESCE(SUM(tr.quantity), 0) as total_cards,
        COALESCE(SUM(tr.amount), 0) as total_revenue,
        COUNT(DISTINCT p.id) as program_count,
        COUNT(DISTINCT t.id) as team_count,
        COUNT(DISTINCT ap.user_id) as athlete_count,
        COUNT(DISTINCT CASE WHEN tr.id IS NOT NULL THEN ap.user_id END) as active_sellers
      FROM organizations o
      LEFT JOIN programs p ON o.id = p.org_id
      LEFT JOIN teams t ON p.id = t.program_id
      LEFT JOIN athlete_profiles ap ON t.id = ap.team_id
      LEFT JOIN transactions tr ON ap.user_id = tr.seller_user_id
      WHERE o.id IN (
        SELECT DISTINCT org_id 
        FROM users 
        WHERE region_code = $1 AND org_id IS NOT NULL
      )
      GROUP BY o.id, o.name, o.type
      ORDER BY 
        CASE WHEN $2 = 'cards' THEN COALESCE(SUM(tr.quantity), 0) END DESC,
        CASE WHEN $2 = 'revenue' THEN COALESCE(SUM(tr.amount), 0) END DESC,
        CASE WHEN $2 = 'participation' THEN (COUNT(DISTINCT CASE WHEN tr.id IS NOT NULL THEN ap.user_id END)::float / NULLIF(COUNT(DISTINCT ap.user_id), 0)) END DESC,
        CASE WHEN $2 = 'avg_per_athlete' THEN (COALESCE(SUM(tr.amount), 0)::float / NULLIF(COUNT(DISTINCT ap.user_id), 0)) END DESC
    `;

    const result = await this.db.query(query, [request.scope_id, request.metric]);
    
    return result.rows.map((row, index) => ({
      ...row,
      rank: index + 1,
      participation_rate: row.athlete_count > 0 ? (row.active_sellers / row.athlete_count) : 0,
      avg_per_athlete: row.athlete_count > 0 ? (row.total_revenue / row.athlete_count) : 0
    }));
  }

  async getNationalLeaderboard(request: LeaderboardRequest, userScopes: UserScopes): Promise<any[]> {
    const query = `
      SELECT 
        o.id,
        o.name,
        o.type,
        COALESCE(SUM(tr.quantity), 0) as total_cards,
        COALESCE(SUM(tr.amount), 0) as total_revenue,
        COUNT(DISTINCT p.id) as program_count,
        COUNT(DISTINCT t.id) as team_count,
        COUNT(DISTINCT ap.user_id) as athlete_count,
        COUNT(DISTINCT CASE WHEN tr.id IS NOT NULL THEN ap.user_id END) as active_sellers
      FROM organizations o
      LEFT JOIN programs p ON o.id = p.org_id
      LEFT JOIN teams t ON p.id = t.program_id
      LEFT JOIN athlete_profiles ap ON t.id = ap.team_id
      LEFT JOIN transactions tr ON ap.user_id = tr.seller_user_id
      GROUP BY o.id, o.name, o.type
      ORDER BY 
        CASE WHEN $1 = 'cards' THEN COALESCE(SUM(tr.quantity), 0) END DESC,
        CASE WHEN $1 = 'revenue' THEN COALESCE(SUM(tr.amount), 0) END DESC,
        CASE WHEN $1 = 'participation' THEN (COUNT(DISTINCT CASE WHEN tr.id IS NOT NULL THEN ap.user_id END)::float / NULLIF(COUNT(DISTINCT ap.user_id), 0)) END DESC,
        CASE WHEN $1 = 'avg_per_athlete' THEN (COALESCE(SUM(tr.amount), 0)::float / NULLIF(COUNT(DISTINCT ap.user_id), 0)) END DESC
    `;

    const result = await this.db.query(query, [request.metric]);
    
    return result.rows.map((row, index) => ({
      ...row,
      rank: index + 1,
      participation_rate: row.athlete_count > 0 ? (row.active_sellers / row.athlete_count) : 0,
      avg_per_athlete: row.athlete_count > 0 ? (row.total_revenue / row.athlete_count) : 0
    }));
  }

  // Background worker method to update leaderboards
  async updateLeaderboard(scopeType: ScopeType, scopeId: string, metric: LeaderboardMetric, period: LeaderboardPeriod): Promise<void> {
    // This would be called by the background worker to update materialized leaderboard entries
    // Implementation would depend on the specific aggregation logic for each scope type
    console.log(`Updating leaderboard: ${scopeType}/${scopeId}/${metric}/${period}`);
  }
}
