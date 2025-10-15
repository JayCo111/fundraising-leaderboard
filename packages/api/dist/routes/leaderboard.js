"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardRoutes = void 0;
// packages/api/src/routes/leaderboard.ts
const express_1 = require("express");
const studentsService_1 = require("../services/studentsService");
const constants_1 = require("../utils/constants");
const router = (0, express_1.Router)();
exports.leaderboardRoutes = router;
/**
 * GET /api/v1/leaderboard/students
 * Get student leaderboard (ranked by net raised)
 */
router.get('/students', async (req, res) => {
    try {
        const rankedStudents = await studentsService_1.StudentsService.getRankedStudents();
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: rankedStudents,
            count: rankedStudents.length,
        });
    }
    catch (error) {
        console.error('Error in GET /leaderboard/students:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * GET /api/v1/leaderboard/teams
 * Get team leaderboard (ranked by total net raised)
 */
router.get('/teams', async (req, res) => {
    try {
        const teamRankings = await studentsService_1.StudentsService.getTeamRankings();
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: teamRankings,
            count: teamRankings.length,
        });
    }
    catch (error) {
        console.error('Error in GET /leaderboard/teams:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * GET /leaderboard/team/:teamName
 * Get leaderboard for a specific team
 */
router.get('/team/:teamName', async (req, res) => {
    try {
        const teamStudents = await studentsService_1.StudentsService.getStudentsByTeam(req.params.teamName);
        if (teamStudents.length === 0) {
            return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                error: 'Team not found',
            });
        }
        // Get enriched data and rank within team
        const enrichedStudents = await studentsService_1.StudentsService.getEnrichedStudents(true, true);
        const teamEnriched = enrichedStudents.filter(s => s.Team === req.params.teamName);
        // Sort by NetRaised
        teamEnriched.sort((a, b) => b.NetRaised - a.NetRaised);
        // Add team ranks
        const ranked = teamEnriched.map((student, index) => ({
            ...student,
            TeamRank: index + 1,
        }));
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: ranked,
            count: ranked.length,
        });
    }
    catch (error) {
        console.error('Error in GET /leaderboard/team/:teamName:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
