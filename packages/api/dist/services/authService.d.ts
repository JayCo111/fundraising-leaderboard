export interface User {
    StudentID: string;
    FirstName: string;
    LastName: string;
    ParentEmail: string;
    Team: string;
    Program: string;
}
export interface AuthToken {
    token: string;
    user: User;
}
export declare class AuthService {
    /**
     * Generate and send magic link via Resend
     */
    static sendMagicLink(email: string, appUrl: string): Promise<{
        success: boolean;
        message: string;
        emailId?: string;
    }>;
    /**
     * Verify magic link token and return JWT
     */
    static verifyToken(token: string): Promise<AuthToken>;
    /**
     * Verify JWT token and return user data
     */
    static verifyJWT(token: string): Promise<User>;
    /**
     * Refresh user data from Google Sheets
     */
    static refreshUserData(email: string): Promise<{
        success: boolean;
        user: any;
    }>;
    /**
     * Send welcome email to new student
     */
    static sendWelcomeEmail(student: any): Promise<void>;
}
//# sourceMappingURL=authService.d.ts.map