import { Request, Response, NextFunction } from 'express';
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
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requirePermission: (resource: string, action: string, scopeType?: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireRole: (allowedRoles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map