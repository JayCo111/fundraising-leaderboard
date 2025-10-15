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
export declare class StudentsService {
    /**
     * Get all students
     */
    static getAllStudents(): Promise<Student[]>;
    /**
     * Get student by ID
     */
    static getStudentById(studentId: string): Promise<Student>;
    /**
     * Get student by email
     */
    static getStudentByEmail(email: string): Promise<Student>;
    /**
     * Get students by team
     */
    static getStudentsByTeam(teamName: string): Promise<Student[]>;
    /**
     * Get students by program
     */
    static getStudentsByProgram(programName: string): Promise<Student[]>;
    /**
     * Add new student
     */
    static addStudent(studentData: {
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
    }): Promise<{
        success: boolean;
        studentId: string;
        message: string;
    }>;
    /**
     * Get enriched students with calculated stats
     */
    static getEnrichedStudents(includeOrders?: boolean, includeReferrals?: boolean): Promise<EnrichedStudent[]>;
    /**
     * Get ranked students (leaderboard)
     */
    static getRankedStudents(): Promise<EnrichedStudent[]>;
    /**
     * Get team rankings
     */
    static getTeamRankings(): Promise<any[]>;
    /**
     * Get all unique teams
     */
    static getAllTeams(): Promise<string[]>;
    /**
     * Get all unique programs
     */
    static getAllPrograms(): Promise<string[]>;
}
//# sourceMappingURL=studentsService.d.ts.map