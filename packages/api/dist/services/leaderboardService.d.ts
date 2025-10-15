import { LeaderboardRequest, LeaderboardEntry, UserScopes, ScopeType, LeaderboardMetric, LeaderboardPeriod } from '@sportsraiser/core/types';
export declare class LeaderboardService {
    private db;
    constructor();
    getLeaderboard(request: LeaderboardRequest, userScopes: UserScopes): Promise<LeaderboardEntry[]>;
    getTeamVsTeam(request: LeaderboardRequest, userScopes: UserScopes): Promise<any[]>;
    getAthleteLeaderboard(request: LeaderboardRequest, userScopes: UserScopes): Promise<any[]>;
    getProgramLeaderboard(request: LeaderboardRequest, userScopes: UserScopes): Promise<any[]>;
    getTerritoryLeaderboard(request: LeaderboardRequest, userScopes: UserScopes): Promise<any[]>;
    getStateLeaderboard(request: LeaderboardRequest, userScopes: UserScopes): Promise<any[]>;
    getRegionLeaderboard(request: LeaderboardRequest, userScopes: UserScopes): Promise<any[]>;
    getNationalLeaderboard(request: LeaderboardRequest, userScopes: UserScopes): Promise<any[]>;
    updateLeaderboard(scopeType: ScopeType, scopeId: string, metric: LeaderboardMetric, period: LeaderboardPeriod): Promise<void>;
}
//# sourceMappingURL=leaderboardService.d.ts.map