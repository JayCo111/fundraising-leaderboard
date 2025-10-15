// packages/api/src/routes/leaderboard.ts
import { Router, Request, Response } from 'express';
import { StudentsService } from '../services/studentsService';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

const router = Router();

/**
 * GET /api/v1/leaderboard/students
 * Get student leaderboard (ranked by net raised)
 */
router.get('/students', async (req: Request, res: Response) => {
  try {
    const rankedStudents = await StudentsService.getRankedStudents();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: rankedStudents,
      count: rankedStudents.length,
    });
  } catch (error: any) {
    console.error('Error in GET /leaderboard/students:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

/**
 * GET /api/v1/leaderboard/teams
 * Get team leaderboard (ranked by total net raised)
 */
router.get('/teams', async (req: Request, res: Response) => {
  try {
    const teamRankings = await StudentsService.getTeamRankings();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: teamRankings,
      count: teamRankings.length,
    });
  } catch (error: any) {
    console.error('Error in GET /leaderboard/teams:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

/**
 * GET /leaderboard/team/:teamName
 * Get leaderboard for a specific team
 */
router.get('/team/:teamName', async (req: Request, res: Response) => {
  try {
    const teamStudents = await StudentsService.getStudentsByTeam(req.params.teamName);

    if (teamStudents.length === 0) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Get enriched data and rank within team
    const enrichedStudents = await StudentsService.getEnrichedStudents(true, true);
    const teamEnriched = enrichedStudents.filter(s => s.Team === req.params.teamName);

    // Sort by NetRaised
    teamEnriched.sort((a, b) => b.NetRaised - a.NetRaised);

    // Add team ranks
    const ranked = teamEnriched.map((student, index) => ({
      ...student,
      TeamRank: index + 1,
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: ranked,
      count: ranked.length,
    });
  } catch (error: any) {
    console.error('Error in GET /leaderboard/team/:teamName:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

export { router as leaderboardRoutes };
