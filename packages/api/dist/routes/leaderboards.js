"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardRoutes = void 0;
// packages/api/src/routes/leaderboards.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const leaderboardService_1 = require("../services/leaderboardService");
const router = (0, express_1.Router)();
exports.leaderboardRoutes = router;
const leaderboardService = new leaderboardService_1.LeaderboardService();
// GET /api/v1/leaderboards
router.get('/', (0, auth_1.requirePermission)('leaderboards', 'read'), async (req, res) => {
    try {
        const { scope_type, scope_id, metric, period = 'all_time' } = req.query;
        if (!scope_type || !scope_id || !metric) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters',
                message: 'scope_type, scope_id, and metric are required'
            });
        }
        const request = {
            scope_type: scope_type,
            scope_id: scope_id,
            metric: metric,
            period: period
        };
        const leaderboard = await leaderboardService.getLeaderboard(request, req.userScopes);
        const response = {
            success: true,
            data: leaderboard
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch leaderboard'
        });
    }
});
// GET /api/v1/leaderboards/programs/:id/team-vs-team
router.get('/programs/:id/team-vs-team', (0, auth_1.requirePermission)('leaderboards', 'read', 'program'), async (req, res) => {
    try {
        const programId = req.params.id;
        const { metric = 'cards', period = 'all_time' } = req.query;
        const request = {
            scope_type: 'program',
            scope_id: programId,
            metric: metric,
            period: period
        };
        const teamVsTeam = await leaderboardService.getTeamVsTeam(request, req.userScopes);
        const response = {
            success: true,
            data: teamVsTeam
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching team vs team leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch team vs team leaderboard'
        });
    }
});
// GET /api/v1/leaderboards/teams/:id/athlete-leaderboard
router.get('/teams/:id/athlete-leaderboard', (0, auth_1.requirePermission)('leaderboards', 'read', 'team'), async (req, res) => {
    try {
        const teamId = req.params.id;
        const { metric = 'cards', period = 'all_time' } = req.query;
        const request = {
            scope_type: 'team',
            scope_id: teamId,
            metric: metric,
            period: period
        };
        const athleteLeaderboard = await leaderboardService.getAthleteLeaderboard(request, req.userScopes);
        const response = {
            success: true,
            data: athleteLeaderboard
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching athlete leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch athlete leaderboard'
        });
    }
});
// GET /api/v1/leaderboards/orgs/:id/program-leaderboard
router.get('/orgs/:id/program-leaderboard', (0, auth_1.requirePermission)('leaderboards', 'read', 'org'), async (req, res) => {
    try {
        const orgId = req.params.id;
        const { metric = 'cards', period = 'all_time' } = req.query;
        const request = {
            scope_type: 'org',
            scope_id: orgId,
            metric: metric,
            period: period
        };
        const programLeaderboard = await leaderboardService.getProgramLeaderboard(request, req.userScopes);
        const response = {
            success: true,
            data: programLeaderboard
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching program leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch program leaderboard'
        });
    }
});
// GET /api/v1/leaderboards/territories/:id/leaderboard
router.get('/territories/:id/leaderboard', (0, auth_1.requirePermission)('leaderboards', 'read', 'territory'), async (req, res) => {
    try {
        const territoryId = req.params.id;
        const { metric = 'cards', period = 'all_time' } = req.query;
        const request = {
            scope_type: 'territory',
            scope_id: territoryId,
            metric: metric,
            period: period
        };
        const territoryLeaderboard = await leaderboardService.getTerritoryLeaderboard(request, req.userScopes);
        const response = {
            success: true,
            data: territoryLeaderboard
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching territory leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch territory leaderboard'
        });
    }
});
// GET /api/v1/leaderboards/states/:code/leaderboard
router.get('/states/:code/leaderboard', (0, auth_1.requirePermission)('leaderboards', 'read', 'state'), async (req, res) => {
    try {
        const stateCode = req.params.code;
        const { metric = 'cards', period = 'all_time' } = req.query;
        const request = {
            scope_type: 'state',
            scope_id: stateCode,
            metric: metric,
            period: period
        };
        const stateLeaderboard = await leaderboardService.getStateLeaderboard(request, req.userScopes);
        const response = {
            success: true,
            data: stateLeaderboard
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching state leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch state leaderboard'
        });
    }
});
// GET /api/v1/leaderboards/regions/:code/leaderboard
router.get('/regions/:code/leaderboard', (0, auth_1.requirePermission)('leaderboards', 'read', 'region'), async (req, res) => {
    try {
        const regionCode = req.params.code;
        const { metric = 'cards', period = 'all_time' } = req.query;
        const request = {
            scope_type: 'region',
            scope_id: regionCode,
            metric: metric,
            period: period
        };
        const regionLeaderboard = await leaderboardService.getRegionLeaderboard(request, req.userScopes);
        const response = {
            success: true,
            data: regionLeaderboard
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching region leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch region leaderboard'
        });
    }
});
// GET /api/v1/leaderboards/national/leaderboard
router.get('/national/leaderboard', (0, auth_1.requirePermission)('leaderboards', 'read', 'national'), async (req, res) => {
    try {
        const { metric = 'cards', period = 'all_time' } = req.query;
        const request = {
            scope_type: 'national',
            scope_id: 'national',
            metric: metric,
            period: period
        };
        const nationalLeaderboard = await leaderboardService.getNationalLeaderboard(request, req.userScopes);
        const response = {
            success: true,
            data: nationalLeaderboard
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching national leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch national leaderboard'
        });
    }
});
//# sourceMappingURL=leaderboards.js.map