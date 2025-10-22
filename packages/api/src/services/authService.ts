// packages/api/src/services/authService.ts
import { Resend } from 'resend';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import googleSheetsService from './googleSheetsService';
import { tokenStorageService } from './tokenStorageService';
import { EmailTemplates } from '../templates/emailTemplates';
import { Helpers } from '../utils/helpers';
import { Validators } from '../utils/validators';
import {
  AUTH_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../utils/constants';

const resend = new Resend(config.RESEND_API_KEY);

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

export class AuthService {
  /**
   * Generate and send magic link via Resend
   */
  static async sendMagicLink(email: string, appUrl: string): Promise<{
    success: boolean;
    message: string;
    emailId?: string;
  }> {
    // Validate email
    const emailValidation = Validators.validateEmail(email);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.error);
    }

    const sanitizedEmail = emailValidation.sanitized!;

    // Check if user exists in Students sheet
    const student = await googleSheetsService.getStudentByEmail(sanitizedEmail);

    if (!student) {
      throw new Error(ERROR_MESSAGES.EMAIL_NOT_FOUND);
    }

    // Generate secure token
    const token = Helpers.generateToken(32);
    const expiresAt = Helpers.addTime(new Date(), AUTH_CONSTANTS.MAGIC_LINK_EXPIRY_MS);

    // Store token - try Google Sheets first, fallback to memory
    try {
      await googleSheetsService.createAuthToken(token, sanitizedEmail, expiresAt);
      console.log('✅ Token stored in Google Sheets');
    } catch (error: any) {
      console.warn('⚠️  Cannot write to Google Sheets, using in-memory storage:', error.message);
      await tokenStorageService.createToken(token, sanitizedEmail, expiresAt);
      console.log('✅ Token stored in memory (temporary)');
    }

    // Create magic link
    const magicLink = `${appUrl}?token=${token}`;

    // Generate email HTML using template
    const emailHtml = EmailTemplates.magicLinkEmail({
      firstName: student.FirstName,
      magicLink,
      team: student.Team,
      program: student.Program,
    });

    // Send email via Resend
    try {
      const { data, error } = await resend.emails.send({
        from: config.RESEND_FROM_EMAIL,
        to: sanitizedEmail,
        subject: 'Your SportsRaiser Login Link',
        html: emailHtml,
      });

      if (error) {
        console.error('Resend API error:', error);
        throw new Error(`${ERROR_MESSAGES.EMAIL_SEND_ERROR}: ${error.message}`);
      }

      console.log('✅ Magic link sent successfully:', {
        emailId: data?.id,
        recipient: Helpers.maskEmail(sanitizedEmail),
        expiresAt: expiresAt.toISOString(),
      });

      return {
        success: true,
        message: SUCCESS_MESSAGES.MAGIC_LINK_SENT,
        emailId: data?.id,
      };
    } catch (error: any) {
      console.error('Error sending magic link:', error);
      throw new Error(`${ERROR_MESSAGES.EMAIL_SEND_ERROR}: ${error.message}`);
    }
  }

  /**
   * Verify magic link token and return JWT
   */
  static async verifyToken(token: string): Promise<AuthToken> {
    // Validate token format
    if (!token || typeof token !== 'string' || token.length < 32) {
      throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
    }

    // Check memory storage first (since we're using API Key which can't write to Sheets)
    let email: string = '';
    const memoryToken = await tokenStorageService.getToken(token);

    if (memoryToken) {
      // Token found in memory storage
      email = memoryToken.email;
      // Delete token after use (one-time use)
      await tokenStorageService.deleteToken(token);
      console.log('✅ Token verified from memory storage');
    } else {
      // Try Google Sheets as fallback
      try {
        const tokenData = await googleSheetsService.getAuthToken(token);

        if (!tokenData) {
          throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
        }

        email = tokenData.Email;

        // Check if already used
        if (tokenData.Used) {
          throw new Error(ERROR_MESSAGES.TOKEN_ALREADY_USED);
        }

        // Check if expired
        if (Helpers.isExpired(tokenData.ExpiresAt)) {
          throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
        }

        // Mark token as used
        await googleSheetsService.markTokenAsUsed(token);
        console.log('✅ Token verified from Google Sheets');
      } catch (error) {
        // Token not found in either storage
        throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
      }
    }

    // Get student data
    const student = await googleSheetsService.getStudentByEmail(email);

    if (!student) {
      throw new Error(ERROR_MESSAGES.STUDENT_NOT_FOUND);
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      {
        studentId: student.StudentID,
        firstName: student.FirstName,
        lastName: student.LastName,
        email: student.ParentEmail,
        team: student.Team,
        program: student.Program,
        role: 'PARENT_STUDENT',
      },
      config.JWT_SECRET,
      { expiresIn: AUTH_CONSTANTS.JWT_EXPIRY }
    );

    console.log('✅ User authenticated successfully:', {
      studentId: student.StudentID,
      email: Helpers.maskEmail(student.ParentEmail),
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
  static async verifyJWT(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;

      // Return user data from token
      return {
        StudentID: decoded.studentId,
        FirstName: decoded.firstName,
        LastName: decoded.lastName,
        ParentEmail: decoded.email,
        Team: decoded.team,
        Program: decoded.program,
      };
    } catch (error) {
      throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
    }
  }

  /**
   * Refresh user data from Google Sheets
   */
  static async refreshUserData(email: string): Promise<{
    success: boolean;
    user: any;
  }> {
    const emailValidation = Validators.validateEmail(email);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.error);
    }

    const student = await googleSheetsService.getStudentByEmail(emailValidation.sanitized!);

    if (!student) {
      throw new Error(ERROR_MESSAGES.STUDENT_NOT_FOUND);
    }

    return {
      success: true,
      user: student,
    };
  }

  /**
   * Send welcome email to new student
   */
  static async sendWelcomeEmail(student: any): Promise<void> {
    const emailHtml = EmailTemplates.welcomeEmail({
      firstName: student.FirstName,
      lastName: student.LastName,
      team: student.Team,
      program: student.Program,
      personalLink: student.PersonalLink,
      qrCodeUrl: student.QR_URL,
    });

    const { error } = await resend.emails.send({
      from: config.RESEND_FROM_EMAIL,
      to: student.ParentEmail,
      subject: 'Welcome to SportsRaiser!',
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }

    console.log('✅ Welcome email sent to:', Helpers.maskEmail(student.ParentEmail));
  }
}
