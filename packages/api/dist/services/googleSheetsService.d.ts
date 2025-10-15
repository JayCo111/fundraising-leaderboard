/**
 * Google Sheets Service
 *
 * Provides a clean interface to interact with Google Sheets as a database.
 * Supports CRUD operations for Students, Orders, Referrals, and Auth Tokens.
 */
export declare class GoogleSheetsService {
    private sheets;
    private spreadsheetId;
    constructor();
    /**
     * Generic method to read data from a sheet
     */
    private readSheet;
    /**
     * Generic method to write data to a sheet
     */
    private appendToSheet;
    /**
     * Generic method to update a row in a sheet
     */
    private updateRow;
    /**
     * Get all students
     * Columns: StudentID, FirstName, LastName, Team, Goal_$, ParentEmail,
     *          PersonalLink, QR_URL, Avatar_URL, Program, QR_Link
     */
    getStudents(): Promise<any[]>;
    /**
     * Get student by email
     */
    getStudentByEmail(email: string): Promise<any | null>;
    /**
     * Get student by ID
     */
    getStudentById(studentId: string): Promise<any | null>;
    /**
     * Add new student
     */
    addStudent(studentData: {
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
    }): Promise<void>;
    /**
     * Get all orders
     * Columns: Timestamp, OrderID, BuyerName, BuyerEmail, BuyerPhone,
     *          Quantity, TotalPaid, StudentID, Status
     */
    getOrders(): Promise<any[]>;
    /**
     * Get orders for a specific student
     */
    getOrdersByStudentId(studentId: string): Promise<any[]>;
    /**
     * Add new order
     */
    addOrder(orderData: {
        OrderID: string;
        BuyerName: string;
        BuyerEmail: string;
        BuyerPhone: string;
        Quantity: number;
        TotalPaid: number;
        StudentID: string;
        Status?: string;
    }): Promise<void>;
    /**
     * Get all referrals
     * Columns: ReferralID, StudentID, ReferralName, ReferralEmail, ReferralPhone,
     *          Organization, Stage, Points, DateAdded, LastUpdated
     */
    getReferrals(): Promise<any[]>;
    /**
     * Get referrals for a specific student
     */
    getReferralsByStudentId(studentId: string): Promise<any[]>;
    /**
     * Add new referral
     */
    addReferral(referralData: {
        ReferralID: string;
        StudentID: string;
        ReferralName: string;
        ReferralEmail: string;
        ReferralPhone: string;
        Organization: string;
        Stage?: string;
        Points?: number;
    }): Promise<void>;
    /**
     * Update referral
     */
    updateReferral(referralId: string, updates: Partial<{
        ReferralName: string;
        ReferralEmail: string;
        ReferralPhone: string;
        Organization: string;
        Stage: string;
        Points: number;
    }>): Promise<void>;
    /**
     * Get all auth tokens (for magic link authentication)
     * Columns: Token, Email, ExpiresAt, CreatedAt, Used
     */
    getAuthTokens(): Promise<any[]>;
    /**
     * Create auth token for magic link
     */
    createAuthToken(token: string, email: string, expiresAt: Date): Promise<void>;
    /**
     * Get auth token by token string
     */
    getAuthToken(token: string): Promise<any | null>;
    /**
     * Mark auth token as used
     */
    markTokenAsUsed(token: string): Promise<void>;
    /**
     * Check if Google Sheets connection is working
     */
    healthCheck(): Promise<boolean>;
    /**
     * Create AuthTokens sheet if it doesn't exist
     */
    createAuthTokensSheet(): Promise<void>;
}
declare const _default: GoogleSheetsService;
export default _default;
//# sourceMappingURL=googleSheetsService.d.ts.map