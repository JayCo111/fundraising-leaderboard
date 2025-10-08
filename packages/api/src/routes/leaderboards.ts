// packages/api/src/routes/leaderboards.ts
import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/auth';
import { LeaderboardService } from '../services/leaderboardService';
import { ApiResponse, LeaderboardRequest } from '@sportsraiser/core/types';

const router = Router();
const leaderboardService = new LeaderboardService();

// GET /api/v1/leaderboards
router.get('/', requirePermission('leaderboards', 'read'), async (req: AuthenticatedRequest, res) => {
  try {
    const { scope_type, scope_id, metric, period = 'all_time' } = req.query;
    
    if (!scope_type || !scope_id || !metric) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'scope_type, scope_id, and metric are required'
      });
    }

    const request: LeaderboardRequest = {
      scope_type: scope_type as any,
      scope_id: scope_id as string,
      metric: metric as any,
      period: period as any
    };

    const leaderboard = await leaderboardService.getLeaderboard(request, req.userScopes!);
    
    const response: ApiResponse = {
      success: true,
      data: leaderboard
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch leaderboard'
    });
  }
});

// GET /api/v1/leaderboards/programs/:id/team-vs-team
router.get('/programs/:id/team-vs-team', requirePermission('leaderboards', 'read', 'program'), async (req: AuthenticatedRequest, res) => {
  try {
    const programId = req.params.id;
    const { metric = 'cards', period = 'all_time' } = req.query;

    const request: LeaderboardRequest = {
      scope_type: 'program',
      scope_id: programId,
      metric: metric as any,
      period: period as any
    };

    const teamVsTeam = await leaderboardService.getTeamVsTeam(request, req.userScopes!);
    
    const response: ApiResponse = {
      success: true,
      data: teamVsTeam
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching team vs team leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch team vs team leaderboard'
    });
  }
});

// GET /api/v1/leaderboards/teams/:id/athlete-leaderboard
router.get('/teams/:id/athlete-leaderboard', requirePermission('leaderboards', 'read', 'team'), async (req: AuthenticatedRequest, res) => {
  try {
    const teamId = req.params.id;
    const { metric = 'cards', period = 'all_time' } = req.query;

    const request: LeaderboardRequest = {
      scope_type: 'team',
      scope_id: teamId,
      metric: metric as any,
      period: period as any
    };

    const athleteLeaderboard = await leaderboardService.getAthleteLeaderboard(request, req.userScopes!);
    
    const response: ApiResponse = {
      success: true,
      data: athleteLeaderboard
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching athlete leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch athlete leaderboard'
    });
  }
});

// GET /api/v1/leaderboards/orgs/:id/program-leaderboard
router.get('/orgs/:id/program-leaderboard', requirePermission('leaderboards', 'read', 'org'), async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.params.id;
    const { metric = 'cards', period = 'all_time' } = req.query;

    const request: LeaderboardRequest = {
      scope_type: 'org',
      scope_id: orgId,
      metric: metric as any,
      period: period as any
    };

    const programLeaderboard = await leaderboardService.getProgramLeaderboard(request, req.userScopes!);
    
    const response: ApiResponse = {
      success: true,
      data: programLeaderboard
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching program leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch program leaderboard'
    });
  }
});

// GET /api/v1/leaderboards/territories/:id/leaderboard
router.get('/territories/:id/leaderboard', requirePermission('leaderboards', 'read', 'territory'), async (req: AuthenticatedRequest, res) => {
  try {
    const territoryId = req.params.id;
    const { metric = 'cards', period = 'all_time' } = req.query;

    const request: LeaderboardRequest = {
      scope_type: 'territory',
      scope_id: territoryId,
      metric: metric as any,
      period: period as any
    };

    const territoryLeaderboard = await leaderboardService.getTerritoryLeaderboard(request, req.userScopes!);
    
    const response: ApiResponse = {
      success: true,
      data: territoryLeaderboard
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching territory leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch territory leaderboard'
    });
  }
});

// GET /api/v1/leaderboards/states/:code/leaderboard
router.get('/states/:code/leaderboard', requirePermission('leaderboards', 'read', 'state'), async (req: AuthenticatedRequest, res) => {
  try {
    const stateCode = req.params.code;
    const { metric = 'cards', period = 'all_time' } = req.query;

    const request: LeaderboardRequest = {
      scope_type: 'state',
      scope_id: stateCode,
      metric: metric as any,
      period: period as any
    };

    const stateLeaderboard = await leaderboardService.getStateLeaderboard(request, req.userScopes!);
    
    const response: ApiResponse = {
      success: true,
      data: stateLeaderboard
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching state leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch state leaderboard'
    });
  }
});

// GET /api/v1/leaderboards/regions/:code/leaderboard
router.get('/regions/:code/leaderboard', requirePermission('leaderboards', 'read', 'region'), async (req: AuthenticatedRequest, res) => {
  try {
    const regionCode = req.params.code;
    const { metric = 'cards', period = 'all_time' } = req.query;

    const request: LeaderboardRequest = {
      scope_type: 'region',
      scope_id: regionCode,
      metric: metric as any,
      period: period as any
    };

    const regionLeaderboard = await leaderboardService.getRegionLeaderboard(request, req.userScopes!);
    
    const response: ApiResponse = {
      success: true,
      data: regionLeaderboard
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching region leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch region leaderboard'
    });
  }
});

// GET /api/v1/leaderboards/national/leaderboard
router.get('/national/leaderboard', requirePermission('leaderboards', 'read', 'national'), async (req: AuthenticatedRequest, res) => {
  try {
    const { metric = 'cards', period = 'all_time' } = req.query;

    const request: LeaderboardRequest = {
      scope_type: 'national',
      scope_id: 'national',
      metric: metric as any,
      period: period as any
    };

    const nationalLeaderboard = await leaderboardService.getNationalLeaderboard(request, req.userScopes!);
    
    const response: ApiResponse = {
      success: true,
      data: nationalLeaderboard
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching national leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch national leaderboard'
    });
  }
});

export { router as leaderboardRoutes };
