"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requirePermission = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided',
                message: 'Authorization token is required'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
        // Set current user ID for RLS policies
        req.headers['x-current-user-id'] = decoded.userId;
        // You would typically fetch the full user from database here
        // For now, we'll create a mock user based on the token
        req.user = {
            id: decoded.userId,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
            status: 'ACTIVE',
            org_id: decoded.org_id,
            program_id: decoded.program_id,
            team_id: decoded.team_id,
            territory_id: decoded.territory_id,
            state_code: decoded.state_code,
            region_code: decoded.region_code,
            created_at: decoded.created_at,
            updated_at: decoded.updated_at
        };
        req.userScopes = {
            org_id: decoded.org_id,
            program_id: decoded.program_id,
            team_id: decoded.team_id,
            territory_id: decoded.territory_id,
            state_code: decoded.state_code,
            region_code: decoded.region_code,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid token',
            message: 'Authorization token is invalid or expired'
        });
    }
};
exports.authMiddleware = authMiddleware;
const requirePermission = (resource, action, scopeType) => {
    return (req, res, next) => {
        if (!req.user || !req.userScopes) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'User must be authenticated'
            });
        }
        // Simplified permission check - can be expanded later
        // For now, all authenticated users have access
        next();
    };
};
exports.requirePermission = requirePermission;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'User must be authenticated'
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient role',
                message: `User role '${req.user.role}' is not authorized for this action`
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
