"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsService = void 0;
// packages/api/src/services/studentsService.ts
const googleSheetsService_1 = __importDefault(require("./googleSheetsService"));
const validators_1 = require("../utils/validators");
const helpers_1 = require("../utils/helpers");
const constants_1 = require("../utils/constants");
class StudentsService {
    /**
     * Get all students
     */
    static async getAllStudents() {
        try {
            const students = await googleSheetsService_1.default.getStudents();
            return students;
        }
        catch (error) {
            console.error('Error getting all students:', error);
            throw new Error(`${constants_1.ERROR_MESSAGES.GOOGLE_SHEETS_ERROR}: ${error.message}`);
        }
    }
    /**
     * Get student by ID
     */
    static async getStudentById(studentId) {
        if (!studentId) {
            throw new Error('Student ID is required');
        }
        const student = await googleSheetsService_1.default.getStudentById(studentId);
        if (!student) {
            throw new Error(constants_1.ERROR_MESSAGES.STUDENT_NOT_FOUND);
        }
        return student;
    }
    /**
     * Get student by email
     */
    static async getStudentByEmail(email) {
        const emailValidation = validators_1.Validators.validateEmail(email);
        if (!emailValidation.valid) {
            throw new Error(emailValidation.error);
        }
        const student = await googleSheetsService_1.default.getStudentByEmail(emailValidation.sanitized);
        if (!student) {
            throw new Error(constants_1.ERROR_MESSAGES.STUDENT_NOT_FOUND);
        }
        return student;
    }
    /**
     * Get students by team
     */
    static async getStudentsByTeam(teamName) {
        const allStudents = await this.getAllStudents();
        return allStudents.filter(s => s.Team === teamName);
    }
    /**
     * Get students by program
     */
    static async getStudentsByProgram(programName) {
        const allStudents = await this.getAllStudents();
        return allStudents.filter(s => s.Program === programName);
    }
    /**
     * Add new student
     */
    static async addStudent(studentData) {
        // Validate required fields
        const firstNameValidation = validators_1.Validators.validateName(studentData.FirstName, 'First name');
        if (!firstNameValidation.valid) {
            throw new Error(firstNameValidation.error);
        }
        const lastNameValidation = validators_1.Validators.validateName(studentData.LastName, 'Last name');
        if (!lastNameValidation.valid) {
            throw new Error(lastNameValidation.error);
        }
        const emailValidation = validators_1.Validators.validateEmail(studentData.ParentEmail);
        if (!emailValidation.valid) {
            throw new Error(emailValidation.error);
        }
        // Check if student already exists
        const existingStudent = await googleSheetsService_1.default.getStudentByEmail(emailValidation.sanitized);
        if (existingStudent) {
            throw new Error(constants_1.ERROR_MESSAGES.STUDENT_ALREADY_EXISTS);
        }
        // Generate student ID
        const studentId = helpers_1.Helpers.generateId('STU');
        // Generate personal link if not provided
        const personalLink = studentData.PersonalLink ||
            `${process.env.REACT_APP_URL || 'https://yourdomain.com'}/donate/${studentId}`;
        // Add student to Google Sheets
        await googleSheetsService_1.default.addStudent({
            StudentID: studentId,
            FirstName: firstNameValidation.sanitized,
            LastName: lastNameValidation.sanitized,
            Team: validators_1.Validators.sanitizeString(studentData.Team),
            Goal_$: studentData.Goal_$ || 0,
            ParentEmail: emailValidation.sanitized,
            PersonalLink: personalLink,
            QR_URL: studentData.QR_URL,
            Avatar_URL: studentData.Avatar_URL,
            Program: studentData.Program,
            QR_Link: studentData.QR_Link,
        });
        console.log('✅ Student added successfully:', {
            studentId,
            name: `${studentData.FirstName} ${studentData.LastName}`,
            email: helpers_1.Helpers.maskEmail(emailValidation.sanitized),
        });
        return {
            success: true,
            studentId,
            message: constants_1.SUCCESS_MESSAGES.STUDENT_CREATED,
        };
    }
    /**
     * Get enriched students with calculated stats
     */
    static async getEnrichedStudents(includeOrders = true, includeReferrals = true) {
        const students = await this.getAllStudents();
        // Get orders and referrals if needed
        let orders = [];
        let referrals = [];
        if (includeOrders) {
            const OrdersService = require('./ordersService').OrdersService;
            orders = await OrdersService.getAllOrders();
        }
        if (includeReferrals) {
            const ReferralsService = require('./referralsService').ReferralsService;
            referrals = await ReferralsService.getAllReferrals();
        }
        // Enrich students with calculated data
        const enrichedStudents = students.map(student => {
            // Calculate cards sold and net raised from orders
            const studentOrders = orders.filter(o => o.StudentID === student.StudentID && o.Status === 'Paid');
            const CardsSold = studentOrders.reduce((sum, o) => sum + o.Quantity, 0);
            const NetRaised = studentOrders.reduce((sum, o) => sum + o.TotalPaid, 0);
            // Calculate referral points
            const studentReferrals = referrals.filter(r => r.StudentID === student.StudentID);
            const ReferralPoints = studentReferrals.reduce((sum, r) => sum + r.Points, 0);
            // Calculate total rewards
            const TotalRewards = NetRaised + ReferralPoints;
            return {
                ...student,
                CardsSold,
                NetRaised,
                ReferralPoints,
                TotalRewards,
            };
        });
        return enrichedStudents;
    }
    /**
     * Get ranked students (leaderboard)
     */
    static async getRankedStudents() {
        const enrichedStudents = await this.getEnrichedStudents(true, true);
        // Sort by NetRaised (descending)
        const sorted = enrichedStudents.sort((a, b) => b.NetRaised - a.NetRaised);
        // Add ranks and medals
        const ranked = sorted.map((student, index) => {
            const rank = index + 1;
            let medal;
            if (rank === 1)
                medal = '🥇';
            else if (rank === 2)
                medal = '🥈';
            else if (rank === 3)
                medal = '🥉';
            return {
                ...student,
                OverallRank: rank,
                Medal: medal,
            };
        });
        return ranked;
    }
    /**
     * Get team rankings
     */
    static async getTeamRankings() {
        const enrichedStudents = await this.getEnrichedStudents(true, true);
        // Group by team
        const teamMap = new Map();
        for (const student of enrichedStudents) {
            if (!teamMap.has(student.Team)) {
                teamMap.set(student.Team, {
                    Team: student.Team,
                    Program: student.Program,
                    TotalStudents: 0,
                    TotalCards: 0,
                    TotalNet: 0,
                    AvgPerStudent: 0,
                });
            }
            const team = teamMap.get(student.Team);
            team.TotalStudents++;
            team.TotalCards += student.CardsSold;
            team.TotalNet += student.NetRaised;
        }
        // Calculate averages and convert to array
        const teams = Array.from(teamMap.values()).map(team => ({
            ...team,
            AvgPerStudent: team.TotalStudents > 0 ? team.TotalNet / team.TotalStudents : 0,
        }));
        // Sort by TotalNet (descending)
        return teams.sort((a, b) => b.TotalNet - a.TotalNet);
    }
    /**
     * Get all unique teams
     */
    static async getAllTeams() {
        const students = await this.getAllStudents();
        const teams = new Set(students.map(s => s.Team).filter((t) => Boolean(t)));
        return Array.from(teams).sort();
    }
    /**
     * Get all unique programs
     */
    static async getAllPrograms() {
        const students = await this.getAllStudents();
        const programs = new Set(students.map(s => s.Program).filter((p) => Boolean(p)));
        return Array.from(programs).sort();
    }
}
exports.StudentsService = StudentsService;
