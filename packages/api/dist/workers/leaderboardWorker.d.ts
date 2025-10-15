import { Transaction } from '@sportsraiser/core/types';
export declare class LeaderboardWorker {
    private db;
    constructor();
    processTransactionEvent(transaction: Transaction): Promise<void>;
    processReferralEvent(referralEvent: any): Promise<void>;
    private cascadeLeaderboardUpdates;
    private updateParentScopesForTeam;
    private updateParentScopesForProgram;
    private updateParentScopesForOrg;
    private updateParentScopesForTerritory;
    private updateParentScopesForState;
    private updateParentScopesForRegion;
    private updateLeaderboardForScope;
    private updateLeaderboardMetric;
    private getTeamAggregatedData;
    private getProgramAggregatedData;
    private getOrgAggregatedData;
    private getTerritoryAggregatedData;
    private getStateAggregatedData;
    private getRegionAggregatedData;
    private getNationalAggregatedData;
    private getMetricValue;
    private updateReferralLeaderboard;
}
//# sourceMappingURL=leaderboardWorker.d.ts.map