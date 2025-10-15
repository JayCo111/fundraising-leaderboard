"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralsRoutes = void 0;
// packages/api/src/routes/referrals.ts
const express_1 = require("express");
const referralsService_1 = require("../services/referralsService");
const constants_1 = require("../utils/constants");
const router = (0, express_1.Router)();
exports.referralsRoutes = router;
/**
 * GET /api/v1/referrals
 * Get all referrals
 * Query params:
 * - stage: filter by stage
 * - studentId: filter by student ID
 * - days: get recent referrals (last N days)
 */
router.get('/', async (req, res) => {
    try {
        const { stage, studentId, days } = req.query;
        let referrals;
        if (days) {
            referrals = await referralsService_1.ReferralsService.getRecentReferrals(Number(days));
        }
        else if (studentId) {
            referrals = await referralsService_1.ReferralsService.getReferralsByStudentId(String(studentId));
        }
        else if (stage) {
            referrals = await referralsService_1.ReferralsService.getReferralsByStage(String(stage));
        }
        else {
            referrals = await referralsService_1.ReferralsService.getAllReferrals();
        }
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: referrals,
            count: referrals.length,
        });
    }
    catch (error) {
        console.error('Error in GET /referrals:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * POST /api/v1/referrals
 * Add new referral
 */
router.post('/', async (req, res) => {
    try {
        const result = await referralsService_1.ReferralsService.addReferral(req.body);
        res.status(constants_1.HTTP_STATUS.CREATED).json(result);
    }
    catch (error) {
        console.error('Error in POST /referrals:', error);
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * PUT /api/v1/referrals/:id
 * Update referral
 */
router.put('/:id', async (req, res) => {
    try {
        const result = await referralsService_1.ReferralsService.updateReferral(req.params.id, req.body);
        res.status(constants_1.HTTP_STATUS.OK).json(result);
    }
    catch (error) {
        console.error('Error in PUT /referrals/:id:', error);
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * GET /api/v1/referrals/student/:studentId
 * Get referrals for a specific student
 */
router.get('/student/:studentId', async (req, res) => {
    try {
        const referrals = await referralsService_1.ReferralsService.getReferralsByStudentId(req.params.studentId);
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: referrals,
            count: referrals.length,
        });
    }
    catch (error) {
        console.error('Error in GET /referrals/student/:studentId:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * GET /api/v1/referrals/student/:studentId/stats
 * Get referral statistics for a student
 */
router.get('/student/:studentId/stats', async (req, res) => {
    try {
        const stats = await referralsService_1.ReferralsService.getStudentReferralStats(req.params.studentId);
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error('Error in GET /referrals/student/:studentId/stats:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * GET /api/v1/referrals/leaderboard
 * Get referral leaderboard
 * Query params:
 * - limit: number of top students to return (default: 10)
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const leaderboard = await referralsService_1.ReferralsService.getReferralLeaderboard(limit);
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: leaderboard,
            count: leaderboard.length,
        });
    }
    catch (error) {
        console.error('Error in GET /referrals/leaderboard:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * GET /api/v1/referrals/stats/overall
 * Get overall referral statistics
 */
router.get('/stats/overall', async (req, res) => {
    try {
        const stats = await referralsService_1.ReferralsService.getOverallStats();
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error('Error in GET /referrals/stats/overall:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
