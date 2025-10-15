// packages/api/src/services/studentsService.ts
import googleSheetsService from './googleSheetsService';
import { Validators } from '../utils/validators';
import { Helpers } from '../utils/helpers';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';

export interface Student {
  StudentID: string;
  FirstName: string;
  LastName: string;
  Team: string;
  Goal_$: number;
  ParentEmail: string;
  PersonalLink?: string;
  QR_URL?: string;
  Avatar_URL?: string;
  Program?: string;
  QR_Link?: string;
}

export interface EnrichedStudent extends Student {
  CardsSold: number;
  NetRaised: number;
  ReferralPoints: number;
  TotalRewards: number;
  OverallRank?: number;
  TeamRank?: number;
  Medal?: string;
}

export class StudentsService {
  /**
   * Get all students
   */
  static async getAllStudents(): Promise<Student[]> {
    try {
      const students = await googleSheetsService.getStudents();
      return students;
    } catch (error: any) {
      console.error('Error getting all students:', error);
      throw new Error(`${ERROR_MESSAGES.GOOGLE_SHEETS_ERROR}: ${error.message}`);
    }
  }

  /**
   * Get student by ID
   */
  static async getStudentById(studentId: string): Promise<Student> {
    if (!studentId) {
      throw new Error('Student ID is required');
    }

    const student = await googleSheetsService.getStudentById(studentId);

    if (!student) {
      throw new Error(ERROR_MESSAGES.STUDENT_NOT_FOUND);
    }

    return student;
  }

  /**
   * Get student by email
   */
  static async getStudentByEmail(email: string): Promise<Student> {
    const emailValidation = Validators.validateEmail(email);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.error);
    }

    const student = await googleSheetsService.getStudentByEmail(emailValidation.sanitized!);

    if (!student) {
      throw new Error(ERROR_MESSAGES.STUDENT_NOT_FOUND);
    }

    return student;
  }

  /**
   * Get students by team
   */
  static async getStudentsByTeam(teamName: string): Promise<Student[]> {
    const allStudents = await this.getAllStudents();
    return allStudents.filter(s => s.Team === teamName);
  }

  /**
   * Get students by program
   */
  static async getStudentsByProgram(programName: string): Promise<Student[]> {
    const allStudents = await this.getAllStudents();
    return allStudents.filter(s => s.Program === programName);
  }

  /**
   * Add new student
   */
  static async addStudent(studentData: {
    FirstName: string;
    LastName: string;
    Team: string;
    Goal_$: number;
    ParentEmail: string;
    Program?: string;
    PersonalLink?: string;
    QR_URL?: string;
    Avatar_URL?: string;
    QR_Link?: string;
  }): Promise<{ success: boolean; studentId: string; message: string }> {
    // Validate required fields
    const firstNameValidation = Validators.validateName(studentData.FirstName, 'First name');
    if (!firstNameValidation.valid) {
      throw new Error(firstNameValidation.error);
    }

    const lastNameValidation = Validators.validateName(studentData.LastName, 'Last name');
    if (!lastNameValidation.valid) {
      throw new Error(lastNameValidation.error);
    }

    const emailValidation = Validators.validateEmail(studentData.ParentEmail);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.error);
    }

    // Check if student already exists
    const existingStudent = await googleSheetsService.getStudentByEmail(emailValidation.sanitized!);
    if (existingStudent) {
      throw new Error(ERROR_MESSAGES.STUDENT_ALREADY_EXISTS);
    }

    // Generate student ID
    const studentId = Helpers.generateId('STU');

    // Generate personal link if not provided
    const personalLink = studentData.PersonalLink ||
      `${process.env.REACT_APP_URL || 'https://yourdomain.com'}/donate/${studentId}`;

    // Add student to Google Sheets
    await googleSheetsService.addStudent({
      StudentID: studentId,
      FirstName: firstNameValidation.sanitized!,
      LastName: lastNameValidation.sanitized!,
      Team: Validators.sanitizeString(studentData.Team),
      Goal_$: studentData.Goal_$ || 0,
      ParentEmail: emailValidation.sanitized!,
      PersonalLink: personalLink,
      QR_URL: studentData.QR_URL,
      Avatar_URL: studentData.Avatar_URL,
      Program: studentData.Program,
      QR_Link: studentData.QR_Link,
    });

    console.log('✅ Student added successfully:', {
      studentId,
      name: `${studentData.FirstName} ${studentData.LastName}`,
      email: Helpers.maskEmail(emailValidation.sanitized!),
    });

    return {
      success: true,
      studentId,
      message: SUCCESS_MESSAGES.STUDENT_CREATED,
    };
  }

  /**
   * Get enriched students with calculated stats
   */
  static async getEnrichedStudents(
    includeOrders: boolean = true,
    includeReferrals: boolean = true
  ): Promise<EnrichedStudent[]> {
    const students = await this.getAllStudents();

    // Get orders and referrals if needed
    let orders: any[] = [];
    let referrals: any[] = [];

    if (includeOrders) {
      const OrdersService = require('./ordersService').OrdersService;
      orders = await OrdersService.getAllOrders();
    }

    if (includeReferrals) {
      const ReferralsService = require('./referralsService').ReferralsService;
      referrals = await ReferralsService.getAllReferrals();
    }

    // Enrich students with calculated data
    const enrichedStudents: EnrichedStudent[] = students.map(student => {
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
  static async getRankedStudents(): Promise<EnrichedStudent[]> {
    const enrichedStudents = await this.getEnrichedStudents(true, true);

    // Sort by NetRaised (descending)
    const sorted = enrichedStudents.sort((a, b) => b.NetRaised - a.NetRaised);

    // Add ranks and medals
    const ranked = sorted.map((student, index) => {
      const rank = index + 1;
      let medal: string | undefined;

      if (rank === 1) medal = '🥇';
      else if (rank === 2) medal = '🥈';
      else if (rank === 3) medal = '🥉';

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
  static async getTeamRankings(): Promise<any[]> {
    const enrichedStudents = await this.getEnrichedStudents(true, true);

    // Group by team
    const teamMap = new Map<string, {
      Team: string;
      Program?: string;
      TotalStudents: number;
      TotalCards: number;
      TotalNet: number;
      AvgPerStudent: number;
    }>();

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

      const team = teamMap.get(student.Team)!;
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
  static async getAllTeams(): Promise<string[]> {
    const students = await this.getAllStudents();
    const teams = new Set(students.map(s => s.Team).filter((t): t is string => Boolean(t)));
    return Array.from(teams).sort();
  }

  /**
   * Get all unique programs
   */
  static async getAllPrograms(): Promise<string[]> {
    const students = await this.getAllStudents();
    const programs = new Set(students.map(s => s.Program).filter((p): p is string => Boolean(p)));
    return Array.from(programs).sort();
  }
}
