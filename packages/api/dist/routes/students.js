"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentsRoutes = void 0;
// packages/api/src/routes/students.ts
const express_1 = require("express");
const studentsService_1 = require("../services/studentsService");
const constants_1 = require("../utils/constants");
const router = (0, express_1.Router)();
exports.studentsRoutes = router;
/**
 * GET /api/v1/students
 * Get all students
 */
router.get('/', async (req, res) => {
    try {
        const enriched = req.query.enriched === 'true';
        const students = enriched
            ? await studentsService_1.StudentsService.getEnrichedStudents()
            : await studentsService_1.StudentsService.getAllStudents();
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: students,
            count: students.length,
        });
    }
    catch (error) {
        console.error('Error in GET /students:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * GET /api/v1/students/:id
 * Get student by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const student = await studentsService_1.StudentsService.getStudentById(req.params.id);
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: student,
        });
    }
    catch (error) {
        console.error('Error in GET /students/:id:', error);
        res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.STUDENT_NOT_FOUND,
        });
    }
});
/**
 * GET /api/v1/students/email/:email
 * Get student by email
 */
router.get('/email/:email', async (req, res) => {
    try {
        const student = await studentsService_1.StudentsService.getStudentByEmail(req.params.email);
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: student,
        });
    }
    catch (error) {
        console.error('Error in GET /students/email/:email:', error);
        res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.STUDENT_NOT_FOUND,
        });
    }
});
/**
 * GET /api/v1/students/team/:teamName
 * Get students by team
 */
router.get('/team/:teamName', async (req, res) => {
    try {
        const students = await studentsService_1.StudentsService.getStudentsByTeam(req.params.teamName);
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: students,
            count: students.length,
        });
    }
    catch (error) {
        console.error('Error in GET /students/team/:teamName:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * GET /api/v1/students/program/:programName
 * Get students by program
 */
router.get('/program/:programName', async (req, res) => {
    try {
        const students = await studentsService_1.StudentsService.getStudentsByProgram(req.params.programName);
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: students,
            count: students.length,
        });
    }
    catch (error) {
        console.error('Error in GET /students/program/:programName:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * POST /api/v1/students
 * Add new student
 */
router.post('/', async (req, res) => {
    try {
        const result = await studentsService_1.StudentsService.addStudent(req.body);
        res.status(constants_1.HTTP_STATUS.CREATED).json(result);
    }
    catch (error) {
        console.error('Error in POST /students:', error);
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * GET /api/v1/students/meta/teams
 * Get all unique teams
 */
router.get('/meta/teams', async (req, res) => {
    try {
        const teams = await studentsService_1.StudentsService.getAllTeams();
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: teams,
            count: teams.length,
        });
    }
    catch (error) {
        console.error('Error in GET /students/meta/teams:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
/**
 * GET /api/v1/students/meta/programs
 * Get all unique programs
 */
router.get('/meta/programs', async (req, res) => {
    try {
        const programs = await studentsService_1.StudentsService.getAllPrograms();
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            data: programs,
            count: programs.length,
        });
    }
    catch (error) {
        console.error('Error in GET /students/meta/programs:', error);
        res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
