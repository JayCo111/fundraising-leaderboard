// packages/api/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  org_id?: string;
  program_id?: string;
  team_id?: string;
  territory_id?: string;
  state_code?: string;
  region_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserScopes {
  org_id?: string;
  program_id?: string;
  team_id?: string;
  territory_id?: string;
  state_code?: string;
  region_code?: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  userScopes?: UserScopes;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        message: 'Authorization token is required'
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    
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
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Authorization token is invalid or expired'
    });
  }
};

export const requirePermission = (
  resource: string,
  action: string,
  scopeType?: string
) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
