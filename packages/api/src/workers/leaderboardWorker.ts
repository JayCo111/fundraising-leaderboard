// packages/api/src/workers/leaderboardWorker.ts
import { Pool } from 'pg';
import { config } from '../config';
import { Transaction, ScopeType, LeaderboardMetric, LeaderboardPeriod } from '@sportsraiser/core/types';

export class LeaderboardWorker {
  private db: Pool;

  constructor() {
    this.db = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async processTransactionEvent(transaction: Transaction): Promise<void> {
    try {
      // Get campaign details to determine scope
      const campaignQuery = `
        SELECT scope_type, scope_id FROM campaigns WHERE id = $1
      `;
      const campaignResult = await this.db.query(campaignQuery, [transaction.campaign_id]);
      
      if (campaignResult.rows.length === 0) {
        console.error(`Campaign not found: ${transaction.campaign_id}`);
        return;
      }

      const campaign = campaignResult.rows[0];
      
      // Update leaderboards for all relevant scopes
      await this.updateLeaderboardForScope('team', campaign.scope_id, 'all_time');
      
      // Cascade updates upward
      await this.cascadeLeaderboardUpdates(campaign.scope_type, campaign.scope_id);
      
      console.log(`Leaderboard updated for transaction: ${transaction.id}`);
    } catch (error) {
      console.error('Error processing transaction event:', error);
    }
  }

  async processReferralEvent(referralEvent: any): Promise<void> {
    try {
      // Get prospect details to determine scope
      const prospectQuery = `
        SELECT referrer_user_id FROM prospects WHERE id = $1
      `;
      const prospectResult = await this.db.query(prospectQuery, [referralEvent.prospect_id]);
      
      if (prospectResult.rows.length === 0) {
        console.error(`Prospect not found: ${referralEvent.prospect_id}`);
        return;
      }

      const referrerUserId = prospectResult.rows[0].referrer_user_id;
      
      // Get user's scope
      const userQuery = `
        SELECT team_id, program_id, org_id, territory_id, state_code, region_code 
        FROM users WHERE id = $1
      `;
      const userResult = await this.db.query(userQuery, [referrerUserId]);
      
      if (userResult.rows.length === 0) {
        console.error(`User not found: ${referrerUserId}`);
        return;
      }

      const user = userResult.rows[0];
      
      // Update referral leaderboards for all relevant scopes
      if (user.team_id) {
        await this.updateReferralLeaderboard('team', user.team_id, 'all_time');
      }
      if (user.program_id) {
        await this.updateReferralLeaderboard('program', user.program_id, 'all_time');
      }
      if (user.org_id) {
        await this.updateReferralLeaderboard('org', user.org_id, 'all_time');
      }
      
      console.log(`Referral leaderboard updated for event: ${referralEvent.id}`);
    } catch (error) {
      console.error('Error processing referral event:', error);
    }
  }

  private async cascadeLeaderboardUpdates(scopeType: ScopeType, scopeId: string): Promise<void> {
    // Update parent scopes based on the current scope
    switch (scopeType) {
      case 'team':
        await this.updateParentScopesForTeam(scopeId);
        break;
      case 'program':
        await this.updateParentScopesForProgram(scopeId);
        break;
      case 'org':
        await this.updateParentScopesForOrg(scopeId);
        break;
      case 'territory':
        await this.updateParentScopesForTerritory(scopeId);
        break;
      case 'state':
        await this.updateParentScopesForState(scopeId);
        break;
      case 'region':
        await this.updateParentScopesForRegion(scopeId);
        break;
    }
  }

  private async updateParentScopesForTeam(teamId: string): Promise<void> {
    // Get program ID
    const programQuery = `SELECT program_id FROM teams WHERE id = $1`;
    const programResult = await this.db.query(programQuery, [teamId]);
    
    if (programResult.rows.length > 0) {
      const programId = programResult.rows[0].program_id;
      await this.updateLeaderboardForScope('program', programId, 'all_time');
      
      // Get org ID
      const orgQuery = `SELECT org_id FROM programs WHERE id = $1`;
      const orgResult = await this.db.query(orgQuery, [programId]);
      
      if (orgResult.rows.length > 0) {
        const orgId = orgResult.rows[0].org_id;
        await this.updateLeaderboardForScope('org', orgId, 'all_time');
        
        // Continue cascading up...
        await this.updateParentScopesForOrg(orgId);
      }
    }
  }

  private async updateParentScopesForProgram(programId: string): Promise<void> {
    // Get org ID
    const orgQuery = `SELECT org_id FROM programs WHERE id = $1`;
    const orgResult = await this.db.query(orgQuery, [programId]);
    
    if (orgResult.rows.length > 0) {
      const orgId = orgResult.rows[0].org_id;
      await this.updateLeaderboardForScope('org', orgId, 'all_time');
      await this.updateParentScopesForOrg(orgId);
    }
  }

  private async updateParentScopesForOrg(orgId: string): Promise<void> {
    // Get territory ID from users in this org
    const territoryQuery = `
      SELECT DISTINCT territory_id FROM users 
      WHERE org_id = $1 AND territory_id IS NOT NULL
      LIMIT 1
    `;
    const territoryResult = await this.db.query(territoryQuery, [orgId]);
    
    if (territoryResult.rows.length > 0) {
      const territoryId = territoryResult.rows[0].territory_id;
      await this.updateLeaderboardForScope('territory', territoryId, 'all_time');
      await this.updateParentScopesForTerritory(territoryId);
    }
  }

  private async updateParentScopesForTerritory(territoryId: string): Promise<void> {
    // Get state code from users in this territory
    const stateQuery = `
      SELECT DISTINCT state_code FROM users 
      WHERE territory_id = $1 AND state_code IS NOT NULL
      LIMIT 1
    `;
    const stateResult = await this.db.query(stateQuery, [territoryId]);
    
    if (stateResult.rows.length > 0) {
      const stateCode = stateResult.rows[0].state_code;
      await this.updateLeaderboardForScope('state', stateCode, 'all_time');
      await this.updateParentScopesForState(stateCode);
    }
  }

  private async updateParentScopesForState(stateCode: string): Promise<void> {
    // Get region code from users in this state
    const regionQuery = `
      SELECT DISTINCT region_code FROM users 
      WHERE state_code = $1 AND region_code IS NOT NULL
      LIMIT 1
    `;
    const regionResult = await this.db.query(regionQuery, [stateCode]);
    
    if (regionResult.rows.length > 0) {
      const regionCode = regionResult.rows[0].region_code;
      await this.updateLeaderboardForScope('region', regionCode, 'all_time');
      await this.updateParentScopesForRegion(regionCode);
    }
  }

  private async updateParentScopesForRegion(regionCode: string): Promise<void> {
    // Update national leaderboard
    await this.updateLeaderboardForScope('national', 'national', 'all_time');
  }

  private async updateLeaderboardForScope(scopeType: ScopeType, scopeId: string, period: LeaderboardPeriod): Promise<void> {
    const metrics: LeaderboardMetric[] = ['cards', 'revenue', 'pct_goal', 'avg_per_athlete', 'participation'];
    
    for (const metric of metrics) {
      await this.updateLeaderboardMetric(scopeType, scopeId, metric, period);
    }
  }

  private async updateLeaderboardMetric(
    scopeType: ScopeType, 
    scopeId: string, 
    metric: LeaderboardMetric, 
    period: LeaderboardPeriod
  ): Promise<void> {
    // Clear existing entries for this scope/metric/period
    const deleteQuery = `
      DELETE FROM leaderboard_entries 
      WHERE scope_type = $1 AND scope_id = $2 AND metric = $3 AND period = $4
    `;
    await this.db.query(deleteQuery, [scopeType, scopeId, metric, period]);

    // Get aggregated data based on scope type
    let aggregatedData: any[];
    
    switch (scopeType) {
      case 'team':
        aggregatedData = await this.getTeamAggregatedData(scopeId, metric);
        break;
      case 'program':
        aggregatedData = await this.getProgramAggregatedData(scopeId, metric);
        break;
      case 'org':
        aggregatedData = await this.getOrgAggregatedData(scopeId, metric);
        break;
      case 'territory':
        aggregatedData = await this.getTerritoryAggregatedData(scopeId, metric);
        break;
      case 'state':
        aggregatedData = await this.getStateAggregatedData(scopeId, metric);
        break;
      case 'region':
        aggregatedData = await this.getRegionAggregatedData(scopeId, metric);
        break;
      case 'national':
        aggregatedData = await this.getNationalAggregatedData(metric);
        break;
      default:
        return;
    }

    // Insert new leaderboard entries
    if (aggregatedData.length > 0) {
      const insertQuery = `
        INSERT INTO leaderboard_entries (
          scope_type, scope_id, metric, value_num, rank, period
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;

      for (let i = 0; i < aggregatedData.length; i++) {
        const entry = aggregatedData[i];
        await this.db.query(insertQuery, [
          scopeType,
          scopeId,
          metric,
          entry.value,
          i + 1,
          period
        ]);
      }
    }
  }

  private async getTeamAggregatedData(teamId: string, metric: LeaderboardMetric): Promise<any[]> {
    const query = `
      SELECT 
        ap.user_id as id,
        u.name,
        COALESCE(SUM(tr.quantity), 0) as cards,
        COALESCE(SUM(tr.amount), 0) as revenue,
        t.goal_revenue,
        COUNT(DISTINCT ap.user_id) as athlete_count
      FROM athlete_profiles ap
      JOIN users u ON ap.user_id = u.id
      JOIN teams t ON ap.team_id = t.id
      LEFT JOIN transactions tr ON ap.user_id = tr.seller_user_id
      WHERE ap.team_id = $1
      GROUP BY ap.user_id, u.name, t.goal_revenue
      ORDER BY 
        CASE WHEN $2 = 'cards' THEN COALESCE(SUM(tr.quantity), 0) END DESC,
        CASE WHEN $2 = 'revenue' THEN COALESCE(SUM(tr.amount), 0) END DESC,
        CASE WHEN $2 = 'pct_goal' THEN (COALESCE(SUM(tr.amount), 0)::float / NULLIF(t.goal_revenue, 0)) END DESC,
        CASE WHEN $2 = 'avg_per_athlete' THEN (COALESCE(SUM(tr.amount), 0)::float / NULLIF(COUNT(DISTINCT ap.user_id), 0)) END DESC
    `;

    const result = await this.db.query(query, [teamId, metric]);
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      value: this.getMetricValue(row, metric)
    }));
  }

  private async getProgramAggregatedData(programId: string, metric: LeaderboardMetric): Promise<any[]> {
    const query = `
      SELECT 
        t.id,
        t.name,
        COALESCE(SUM(tr.quantity), 0) as cards,
        COALESCE(SUM(tr.amount), 0) as revenue,
        COUNT(DISTINCT ap.user_id) as athlete_count,
        COUNT(DISTINCT CASE WHEN tr.id IS NOT NULL THEN ap.user_id END) as active_sellers
      FROM teams t
      LEFT JOIN athlete_profiles ap ON t.id = ap.team_id
      LEFT JOIN transactions tr ON ap.user_id = tr.seller_user_id
      WHERE t.program_id = $1
      GROUP BY t.id, t.name
      ORDER BY 
        CASE WHEN $2 = 'cards' THEN COALESCE(SUM(tr.quantity), 0) END DESC,
        CASE WHEN $2 = 'revenue' THEN COALESCE(SUM(tr.amount), 0) END DESC,
        CASE WHEN $2 = 'participation' THEN (COUNT(DISTINCT CASE WHEN tr.id IS NOT NULL THEN ap.user_id END)::float / NULLIF(COUNT(DISTINCT ap.user_id), 0)) END DESC,
        CASE WHEN $2 = 'avg_per_athlete' THEN (COALESCE(SUM(tr.amount), 0)::float / NULLIF(COUNT(DISTINCT ap.user_id), 0)) END DESC
    `;

    const result = await this.db.query(query, [programId, metric]);
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      value: this.getMetricValue(row, metric)
    }));
  }

  private async getOrgAggregatedData(orgId: string, metric: LeaderboardMetric): Promise<any[]> {
    const query = `
      SELECT 
        p.id,
        p.sport,
        COALESCE(SUM(tr.quantity), 0) as cards,
        COALESCE(SUM(tr.amount), 0) as revenue,
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

    const result = await this.db.query(query, [orgId, metric]);
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.sport,
      value: this.getMetricValue(row, metric)
    }));
  }

  private async getTerritoryAggregatedData(territoryId: string, metric: LeaderboardMetric): Promise<any[]> {
    // Similar implementation for territory level
    return [];
  }

  private async getStateAggregatedData(stateCode: string, metric: LeaderboardMetric): Promise<any[]> {
    // Similar implementation for state level
    return [];
  }

  private async getRegionAggregatedData(regionCode: string, metric: LeaderboardMetric): Promise<any[]> {
    // Similar implementation for region level
    return [];
  }

  private async getNationalAggregatedData(metric: LeaderboardMetric): Promise<any[]> {
    // Similar implementation for national level
    return [];
  }

  private getMetricValue(row: any, metric: LeaderboardMetric): number {
    switch (metric) {
      case 'cards':
        return row.cards || 0;
      case 'revenue':
        return row.revenue || 0;
      case 'pct_goal':
        return row.goal_revenue ? (row.revenue / row.goal_revenue) : 0;
      case 'participation':
        return row.athlete_count ? (row.active_sellers / row.athlete_count) : 0;
      case 'avg_per_athlete':
        return row.athlete_count ? (row.revenue / row.athlete_count) : 0;
      default:
        return 0;
    }
  }

  private async updateReferralLeaderboard(scopeType: ScopeType, scopeId: string, period: LeaderboardPeriod): Promise<void> {
    // Implementation for referral-specific leaderboards
    console.log(`Updating referral leaderboard for ${scopeType}/${scopeId}`);
  }
}
