// packages/api/src/routes/students.ts
import { Router, Request, Response } from 'express';
import { StudentsService } from '../services/studentsService';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

const router = Router();

/**
 * GET /api/v1/students
 * Get all students
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const enriched = req.query.enriched === 'true';

    const students = enriched
      ? await StudentsService.getEnrichedStudents()
      : await StudentsService.getAllStudents();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: students,
      count: students.length,
    });
  } catch (error: any) {
    console.error('Error in GET /students:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

/**
 * GET /api/v1/students/:id
 * Get student by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const student = await StudentsService.getStudentById(req.params.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: student,
    });
  } catch (error: any) {
    console.error('Error in GET /students/:id:', error);
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: error.message || ERROR_MESSAGES.STUDENT_NOT_FOUND,
    });
  }
});

/**
 * GET /api/v1/students/email/:email
 * Get student by email
 */
router.get('/email/:email', async (req: Request, res: Response) => {
  try {
    const student = await StudentsService.getStudentByEmail(req.params.email);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: student,
    });
  } catch (error: any) {
    console.error('Error in GET /students/email/:email:', error);
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: error.message || ERROR_MESSAGES.STUDENT_NOT_FOUND,
    });
  }
});

/**
 * GET /api/v1/students/team/:teamName
 * Get students by team
 */
router.get('/team/:teamName', async (req: Request, res: Response) => {
  try {
    const students = await StudentsService.getStudentsByTeam(req.params.teamName);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: students,
      count: students.length,
    });
  } catch (error: any) {
    console.error('Error in GET /students/team/:teamName:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

/**
 * GET /api/v1/students/program/:programName
 * Get students by program
 */
router.get('/program/:programName', async (req: Request, res: Response) => {
  try {
    const students = await StudentsService.getStudentsByProgram(req.params.programName);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: students,
      count: students.length,
    });
  } catch (error: any) {
    console.error('Error in GET /students/program/:programName:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

/**
 * POST /api/v1/students
 * Add new student
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = await StudentsService.addStudent(req.body);

    res.status(HTTP_STATUS.CREATED).json(result);
  } catch (error: any) {
    console.error('Error in POST /students:', error);
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

/**
 * GET /api/v1/students/meta/teams
 * Get all unique teams
 */
router.get('/meta/teams', async (req: Request, res: Response) => {
  try {
    const teams = await StudentsService.getAllTeams();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: teams,
      count: teams.length,
    });
  } catch (error: any) {
    console.error('Error in GET /students/meta/teams:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

/**
 * GET /api/v1/students/meta/programs
 * Get all unique programs
 */
router.get('/meta/programs', async (req: Request, res: Response) => {
  try {
    const programs = await StudentsService.getAllPrograms();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: programs,
      count: programs.length,
    });
  } catch (error: any) {
    console.error('Error in GET /students/meta/programs:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

export { router as studentsRoutes };
