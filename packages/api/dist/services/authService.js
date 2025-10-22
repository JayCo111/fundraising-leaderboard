"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
// packages/api/src/services/authService.ts
const resend_1 = require("resend");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const googleSheetsService_1 = __importDefault(require("./googleSheetsService"));
const tokenStorageService_1 = require("./tokenStorageService");
const emailTemplates_1 = require("../templates/emailTemplates");
const helpers_1 = require("../utils/helpers");
const validators_1 = require("../utils/validators");
const constants_1 = require("../utils/constants");
const resend = new resend_1.Resend(config_1.config.RESEND_API_KEY);
class AuthService {
    /**
     * Generate and send magic link via Resend
     */
    static async sendMagicLink(email, appUrl) {
        // Validate email
        const emailValidation = validators_1.Validators.validateEmail(email);
        if (!emailValidation.valid) {
            throw new Error(emailValidation.error);
        }
        const sanitizedEmail = emailValidation.sanitized;
        // Check if user exists in Students sheet
        const student = await googleSheetsService_1.default.getStudentByEmail(sanitizedEmail);
        if (!student) {
            throw new Error(constants_1.ERROR_MESSAGES.EMAIL_NOT_FOUND);
        }
        // Generate secure token
        const token = helpers_1.Helpers.generateToken(32);
        const expiresAt = helpers_1.Helpers.addTime(new Date(), constants_1.AUTH_CONSTANTS.MAGIC_LINK_EXPIRY_MS);
        // Store token - try Google Sheets first, fallback to memory
        try {
            await googleSheetsService_1.default.createAuthToken(token, sanitizedEmail, expiresAt);
            console.log('✅ Token stored in Google Sheets');
        }
        catch (error) {
            console.warn('⚠️  Cannot write to Google Sheets, using in-memory storage:', error.message);
            await tokenStorageService_1.tokenStorageService.createToken(token, sanitizedEmail, expiresAt);
            console.log('✅ Token stored in memory (temporary)');
        }
        // Create magic link
        const magicLink = `${appUrl}?token=${token}`;
        // Generate email HTML using template
        const emailHtml = emailTemplates_1.EmailTemplates.magicLinkEmail({
            firstName: student.FirstName,
            magicLink,
            team: student.Team,
            program: student.Program,
        });
        // Send email via Resend
        try {
            const { data, error } = await resend.emails.send({
                from: config_1.config.RESEND_FROM_EMAIL,
                to: sanitizedEmail,
                subject: 'Your SportsRaiser Login Link',
                html: emailHtml,
            });
            if (error) {
                console.error('Resend API error:', error);
                throw new Error(`${constants_1.ERROR_MESSAGES.EMAIL_SEND_ERROR}: ${error.message}`);
            }
            console.log('✅ Magic link sent successfully:', {
                emailId: data?.id,
                recipient: helpers_1.Helpers.maskEmail(sanitizedEmail),
                expiresAt: expiresAt.toISOString(),
            });
            return {
                success: true,
                message: constants_1.SUCCESS_MESSAGES.MAGIC_LINK_SENT,
                emailId: data?.id,
            };
        }
        catch (error) {
            console.error('Error sending magic link:', error);
            throw new Error(`${constants_1.ERROR_MESSAGES.EMAIL_SEND_ERROR}: ${error.message}`);
        }
    }
    /**
     * Verify magic link token and return JWT
     */
    static async verifyToken(token) {
        // Validate token format
        if (!token || typeof token !== 'string' || token.length < 32) {
            throw new Error(constants_1.ERROR_MESSAGES.INVALID_TOKEN);
        }
        // Check memory storage first (since we're using API Key which can't write to Sheets)
        let email = '';
        const memoryToken = await tokenStorageService_1.tokenStorageService.getToken(token);
        if (memoryToken) {
            // Token found in memory storage
            email = memoryToken.email;
            // Delete token after use (one-time use)
            await tokenStorageService_1.tokenStorageService.deleteToken(token);
            console.log('✅ Token verified from memory storage');
        }
        else {
            // Try Google Sheets as fallback
            try {
                const tokenData = await googleSheetsService_1.default.getAuthToken(token);
                if (!tokenData) {
                    throw new Error(constants_1.ERROR_MESSAGES.INVALID_TOKEN);
                }
                email = tokenData.Email;
                // Check if already used
                if (tokenData.Used) {
                    throw new Error(constants_1.ERROR_MESSAGES.TOKEN_ALREADY_USED);
                }
                // Check if expired
                if (helpers_1.Helpers.isExpired(tokenData.ExpiresAt)) {
                    throw new Error(constants_1.ERROR_MESSAGES.TOKEN_EXPIRED);
                }
                // Mark token as used
                await googleSheetsService_1.default.markTokenAsUsed(token);
                console.log('✅ Token verified from Google Sheets');
            }
            catch (error) {
                // Token not found in either storage
                throw new Error(constants_1.ERROR_MESSAGES.INVALID_TOKEN);
            }
        }
        // Get student data
        const student = await googleSheetsService_1.default.getStudentByEmail(email);
        if (!student) {
            throw new Error(constants_1.ERROR_MESSAGES.STUDENT_NOT_FOUND);
        }
        // Generate JWT
        const jwtToken = jsonwebtoken_1.default.sign({
            studentId: student.StudentID,
            firstName: student.FirstName,
            lastName: student.LastName,
            email: student.ParentEmail,
            team: student.Team,
            program: student.Program,
            role: 'PARENT_STUDENT',
        }, config_1.config.JWT_SECRET, { expiresIn: constants_1.AUTH_CONSTANTS.JWT_EXPIRY });
        console.log('✅ User authenticated successfully:', {
            studentId: student.StudentID,
            email: helpers_1.Helpers.maskEmail(student.ParentEmail),
            team: student.Team,
        });
        return {
            token: jwtToken,
            user: {
                StudentID: student.StudentID,
                FirstName: student.FirstName,
                LastName: student.LastName,
                ParentEmail: student.ParentEmail,
                Team: student.Team,
                Program: student.Program,
            },
        };
    }
    /**
     * Verify JWT token and return user data
     */
    static async verifyJWT(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
            // Return user data from token
            return {
                StudentID: decoded.studentId,
                FirstName: decoded.firstName,
                LastName: decoded.lastName,
                ParentEmail: decoded.email,
                Team: decoded.team,
                Program: decoded.program,
            };
        }
        catch (error) {
            throw new Error(constants_1.ERROR_MESSAGES.INVALID_TOKEN);
        }
    }
    /**
     * Refresh user data from Google Sheets
     */
    static async refreshUserData(email) {
        const emailValidation = validators_1.Validators.validateEmail(email);
        if (!emailValidation.valid) {
            throw new Error(emailValidation.error);
        }
        const student = await googleSheetsService_1.default.getStudentByEmail(emailValidation.sanitized);
        if (!student) {
            throw new Error(constants_1.ERROR_MESSAGES.STUDENT_NOT_FOUND);
        }
        return {
            success: true,
            user: student,
        };
    }
    /**
     * Send welcome email to new student
     */
    static async sendWelcomeEmail(student) {
        const emailHtml = emailTemplates_1.EmailTemplates.welcomeEmail({
            firstName: student.FirstName,
            lastName: student.LastName,
            team: student.Team,
            program: student.Program,
            personalLink: student.PersonalLink,
            qrCodeUrl: student.QR_URL,
        });
        const { error } = await resend.emails.send({
            from: config_1.config.RESEND_FROM_EMAIL,
            to: student.ParentEmail,
            subject: 'Welcome to SportsRaiser!',
            html: emailHtml,
        });
        if (error) {
            console.error('Error sending welcome email:', error);
            throw new Error(`Failed to send welcome email: ${error.message}`);
        }
        console.log('✅ Welcome email sent to:', helpers_1.Helpers.maskEmail(student.ParentEmail));
    }
}
exports.AuthService = AuthService;
