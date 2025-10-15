"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheetsService = void 0;
// packages/api/src/services/googleSheetsService.ts
const googleapis_1 = require("googleapis");
const config_1 = require("../config");
/**
 * Google Sheets Service
 *
 * Provides a clean interface to interact with Google Sheets as a database.
 * Supports CRUD operations for Students, Orders, Referrals, and Auth Tokens.
 */
class GoogleSheetsService {
    constructor() {
        // Initialize Google Sheets API client
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials: config_1.config.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS
                ? JSON.parse(config_1.config.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS)
                : undefined,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        this.sheets = googleapis_1.google.sheets({ version: 'v4', auth });
        this.spreadsheetId = config_1.config.GOOGLE_SHEET_ID;
    }
    /**
     * Generic method to read data from a sheet
     */
    async readSheet(sheetName, range) {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!${range}`,
            });
            return response.data.values || [];
        }
        catch (error) {
            console.error(`Error reading sheet ${sheetName}:`, error);
            throw new Error(`Failed to read from ${sheetName}: ${error.message}`);
        }
    }
    /**
     * Generic method to write data to a sheet
     */
    async appendToSheet(sheetName, values) {
        try {
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A:A`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });
        }
        catch (error) {
            console.error(`Error appending to sheet ${sheetName}:`, error);
            throw new Error(`Failed to append to ${sheetName}: ${error.message}`);
        }
    }
    /**
     * Generic method to update a row in a sheet
     */
    async updateRow(sheetName, rowIndex, values) {
        try {
            const lastColumn = String.fromCharCode(65 + values.length - 1); // A, B, C, etc.
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A${rowIndex}:${lastColumn}${rowIndex}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [values] },
            });
        }
        catch (error) {
            console.error(`Error updating row in sheet ${sheetName}:`, error);
            throw new Error(`Failed to update row in ${sheetName}: ${error.message}`);
        }
    }
    // ==================== STUDENTS ====================
    /**
     * Get all students
     * Columns: StudentID, FirstName, LastName, Team, Goal_$, ParentEmail,
     *          PersonalLink, QR_URL, Avatar_URL, Program, QR_Link
     */
    async getStudents() {
        const rows = await this.readSheet('Students', 'A2:K1000');
        return rows.map((row, index) => ({
            rowIndex: index + 2, // +2 because we start at row 2 (header is row 1)
            StudentID: row[0] || '',
            FirstName: row[1] || '',
            LastName: row[2] || '',
            Team: row[3] || '',
            Goal_$: parseFloat(row[4]) || 0,
            ParentEmail: row[5] || '',
            PersonalLink: row[6] || '',
            QR_URL: row[7] || '',
            Avatar_URL: row[8] || '',
            Program: row[9] || '',
            QR_Link: row[10] || '',
        }));
    }
    /**
     * Get student by email
     */
    async getStudentByEmail(email) {
        const students = await this.getStudents();
        return students.find(s => s.ParentEmail.toLowerCase() === email.toLowerCase()) || null;
    }
    /**
     * Get student by ID
     */
    async getStudentById(studentId) {
        const students = await this.getStudents();
        return students.find(s => s.StudentID === studentId) || null;
    }
    /**
     * Add new student
     */
    async addStudent(studentData) {
        const row = [
            studentData.StudentID,
            studentData.FirstName,
            studentData.LastName,
            studentData.Team,
            studentData.Goal_$,
            studentData.ParentEmail,
            studentData.PersonalLink || '',
            studentData.QR_URL || '',
            studentData.Avatar_URL || '',
            studentData.Program || '',
            studentData.QR_Link || '',
        ];
        await this.appendToSheet('Students', [row]);
    }
    // ==================== ORDERS ====================
    /**
     * Get all orders
     * Columns: Timestamp, OrderID, BuyerName, BuyerEmail, BuyerPhone,
     *          Quantity, TotalPaid, StudentID, Status
     */
    async getOrders() {
        const rows = await this.readSheet('Orders', 'A2:I1000');
        return rows.map((row, index) => ({
            rowIndex: index + 2,
            Timestamp: row[0] || '',
            OrderID: row[1] || '',
            BuyerName: row[2] || '',
            BuyerEmail: row[3] || '',
            BuyerPhone: row[4] || '',
            Quantity: parseInt(row[5]) || 0,
            TotalPaid: parseFloat(row[6]) || 0,
            StudentID: row[7] || '',
            Status: row[8] || 'Paid',
        }));
    }
    /**
     * Get orders for a specific student
     */
    async getOrdersByStudentId(studentId) {
        const orders = await this.getOrders();
        return orders.filter(o => o.StudentID === studentId);
    }
    /**
     * Add new order
     */
    async addOrder(orderData) {
        const row = [
            new Date().toISOString(),
            orderData.OrderID,
            orderData.BuyerName,
            orderData.BuyerEmail,
            orderData.BuyerPhone,
            orderData.Quantity,
            orderData.TotalPaid,
            orderData.StudentID,
            orderData.Status || 'Paid',
        ];
        await this.appendToSheet('Orders', [row]);
    }
    // ==================== REFERRALS ====================
    /**
     * Get all referrals
     * Columns: ReferralID, StudentID, ReferralName, ReferralEmail, ReferralPhone,
     *          Organization, Stage, Points, DateAdded, LastUpdated
     */
    async getReferrals() {
        const rows = await this.readSheet('Referrals', 'A2:J1000');
        return rows.map((row, index) => ({
            rowIndex: index + 2,
            ReferralID: row[0] || '',
            StudentID: row[1] || '',
            ReferralName: row[2] || '',
            ReferralEmail: row[3] || '',
            ReferralPhone: row[4] || '',
            Organization: row[5] || '',
            Stage: row[6] || 'Contacted',
            Points: parseInt(row[7]) || 0,
            DateAdded: row[8] || '',
            LastUpdated: row[9] || '',
        }));
    }
    /**
     * Get referrals for a specific student
     */
    async getReferralsByStudentId(studentId) {
        const referrals = await this.getReferrals();
        return referrals.filter(r => r.StudentID === studentId);
    }
    /**
     * Add new referral
     */
    async addReferral(referralData) {
        const now = new Date().toISOString();
        const row = [
            referralData.ReferralID,
            referralData.StudentID,
            referralData.ReferralName,
            referralData.ReferralEmail,
            referralData.ReferralPhone,
            referralData.Organization,
            referralData.Stage || 'Contacted',
            referralData.Points || 0,
            now,
            now,
        ];
        await this.appendToSheet('Referrals', [row]);
    }
    /**
     * Update referral
     */
    async updateReferral(referralId, updates) {
        const referrals = await this.getReferrals();
        const referral = referrals.find(r => r.ReferralID === referralId);
        if (!referral) {
            throw new Error('Referral not found');
        }
        const updatedRow = [
            referral.ReferralID,
            referral.StudentID,
            updates.ReferralName ?? referral.ReferralName,
            updates.ReferralEmail ?? referral.ReferralEmail,
            updates.ReferralPhone ?? referral.ReferralPhone,
            updates.Organization ?? referral.Organization,
            updates.Stage ?? referral.Stage,
            updates.Points ?? referral.Points,
            referral.DateAdded,
            new Date().toISOString(), // LastUpdated
        ];
        await this.updateRow('Referrals', referral.rowIndex, updatedRow);
    }
    // ==================== AUTH TOKENS ====================
    /**
     * Get all auth tokens (for magic link authentication)
     * Columns: Token, Email, ExpiresAt, CreatedAt, Used
     */
    async getAuthTokens() {
        try {
            const rows = await this.readSheet('AuthTokens', 'A2:E1000');
            return rows.map((row, index) => ({
                rowIndex: index + 2,
                Token: row[0] || '',
                Email: row[1] || '',
                ExpiresAt: row[2] || '',
                CreatedAt: row[3] || '',
                Used: row[4] === 'TRUE' || row[4] === true,
            }));
        }
        catch (error) {
            // AuthTokens sheet might not exist yet
            console.warn('AuthTokens sheet not found. Please create it.');
            return [];
        }
    }
    /**
     * Create auth token for magic link
     */
    async createAuthToken(token, email, expiresAt) {
        const row = [
            token,
            email.toLowerCase(),
            expiresAt.toISOString(),
            new Date().toISOString(),
            false,
        ];
        await this.appendToSheet('AuthTokens', [row]);
    }
    /**
     * Get auth token by token string
     */
    async getAuthToken(token) {
        const tokens = await this.getAuthTokens();
        return tokens.find(t => t.Token === token) || null;
    }
    /**
     * Mark auth token as used
     */
    async markTokenAsUsed(token) {
        const tokens = await this.getAuthTokens();
        const tokenData = tokens.find(t => t.Token === token);
        if (!tokenData) {
            throw new Error('Token not found');
        }
        const updatedRow = [
            tokenData.Token,
            tokenData.Email,
            tokenData.ExpiresAt,
            tokenData.CreatedAt,
            true, // Used
        ];
        await this.updateRow('AuthTokens', tokenData.rowIndex, updatedRow);
    }
    // ==================== UTILITY METHODS ====================
    /**
     * Check if Google Sheets connection is working
     */
    async healthCheck() {
        try {
            await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
            });
            return true;
        }
        catch (error) {
            console.error('Google Sheets health check failed:', error);
            return false;
        }
    }
    /**
     * Create AuthTokens sheet if it doesn't exist
     */
    async createAuthTokensSheet() {
        try {
            // Add new sheet
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: 'AuthTokens',
                                },
                            },
                        },
                    ],
                },
            });
            // Add headers
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: 'AuthTokens!A1:E1',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [['Token', 'Email', 'ExpiresAt', 'CreatedAt', 'Used']],
                },
            });
            console.log('✅ AuthTokens sheet created successfully');
        }
        catch (error) {
            console.error('Error creating AuthTokens sheet:', error);
            throw new Error(`Failed to create AuthTokens sheet: ${error.message}`);
        }
    }
}
exports.GoogleSheetsService = GoogleSheetsService;
// Export singleton instance
exports.default = new GoogleSheetsService();
