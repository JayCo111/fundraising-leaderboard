"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
// packages/api/src/routes/auth.ts
const express_1 = require("express");
const authService_1 = require("../services/authService");
const validators_1 = require("../utils/validators");
const constants_1 = require("../utils/constants");
const router = (0, express_1.Router)();
exports.authRoutes = router;
/**
 * POST /api/v1/auth/magic-link
 * Send magic link to user's email
 *
 * Body:
 * {
 *   "email": "parent@example.com"
 * }
 */
router.post('/magic-link', async (req, res) => {
    try {
        const { email } = req.body;
        // Validate email
        const emailValidation = validators_1.Validators.validateEmail(email);
        if (!emailValidation.valid) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: emailValidation.error,
            });
        }
        // Get app URL from request origin or use default
        const appUrl = req.headers.origin || process.env.REACT_APP_URL || 'http://localhost:3000';
        // Send magic link
        const result = await authService_1.AuthService.sendMagicLink(emailValidation.sanitized, appUrl);
        res.status(constants_1.HTTP_STATUS.OK).json(result);
    }
    catch (error) {
        console.error('Error in /auth/magic-link:', error);
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
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
router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                error: 'Token is required',
            });
        }
        // Verify token and get JWT
        const result = await authService_1.AuthService.verifyToken(token);
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            token: result.token,
            user: result.user,
        });
    }
    catch (error) {
        console.error('Error in /auth/verify:', error);
        res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INVALID_TOKEN,
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
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: constants_1.ERROR_MESSAGES.UNAUTHORIZED,
            });
        }
        const token = authHeader.replace('Bearer ', '');
        // Verify JWT and get user data
        const user = await authService_1.AuthService.verifyJWT(token);
        res.status(constants_1.HTTP_STATUS.OK).json({
            success: true,
            user,
        });
    }
    catch (error) {
        console.error('Error in /auth/me:', error);
        res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INVALID_TOKEN,
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
router.post('/refresh', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: constants_1.ERROR_MESSAGES.UNAUTHORIZED,
            });
        }
        const token = authHeader.replace('Bearer ', '');
        // Verify JWT
        const user = await authService_1.AuthService.verifyJWT(token);
        // Refresh user data from Google Sheets
        const result = await authService_1.AuthService.refreshUserData(user.ParentEmail);
        res.status(constants_1.HTTP_STATUS.OK).json(result);
    }
    catch (error) {
        console.error('Error in /auth/refresh:', error);
        res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: error.message || constants_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});
