// packages/api/src/routes/auth.ts
import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { Validators } from '../utils/validators';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

const router = Router();

/**
 * POST /api/v1/auth/magic-link
 * Send magic link to user's email
 *
 * Body:
 * {
 *   "email": "parent@example.com"
 * }
 */
router.post('/magic-link', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate email
    const emailValidation = Validators.validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: emailValidation.error,
      });
    }

    // Get app URL from request origin or use default
    const appUrl = req.headers.origin || process.env.REACT_APP_URL || 'http://localhost:3000';

    // Send magic link
    const result = await AuthService.sendMagicLink(emailValidation.sanitized!, appUrl);

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error: any) {
    console.error('Error in /auth/magic-link:', error);

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

/**
 * POST /api/v1/auth/verify
 * Verify magic link token and return JWT
 *
 * Body:
 * {
 *   "token": "abc123..."
 * }
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Token is required',
      });
    }

    // Verify token and get JWT
    const result = await AuthService.verifyToken(token);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    console.error('Error in /auth/verify:', error);

    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INVALID_TOKEN,
    });
  }
});

/**
 * GET /api/v1/auth/me
 * Get current user info from JWT
 *
 * Headers:
 * Authorization: Bearer <jwt_token>
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT and get user data
    const user = await AuthService.verifyJWT(token);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Error in /auth/me:', error);

    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INVALID_TOKEN,
    });
  }
});

/**
 * POST /api/v1/auth/refresh
 * Refresh user data from Google Sheets
 *
 * Headers:
 * Authorization: Bearer <jwt_token>
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT
    const user = await AuthService.verifyJWT(token);

    // Refresh user data from Google Sheets
    const result = await AuthService.refreshUserData(user.ParentEmail);

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error: any) {
    console.error('Error in /auth/refresh:', error);

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
});

export { router as authRoutes };
