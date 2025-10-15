export interface Referral {
    ReferralID: string;
    StudentID: string;
    ReferralName: string;
    ReferralEmail: string;
    ReferralPhone: string;
    Organization: string;
    Stage: string;
    Points: number;
    DateAdded: string;
    LastUpdated: string;
}
export declare class ReferralsService {
    /**
     * Get all referrals
     */
    static getAllReferrals(): Promise<Referral[]>;
    /**
     * Get referrals by student ID
     */
    static getReferralsByStudentId(studentId: string): Promise<Referral[]>;
    /**
     * Get referrals by stage
     */
    static getReferralsByStage(stage: string): Promise<Referral[]>;
    /**
     * Add new referral
     */
    static addReferral(referralData: {
        StudentID: string;
        ReferralName: string;
        ReferralEmail: string;
        ReferralPhone: string;
        Organization: string;
        Stage?: string;
    }): Promise<{
        success: boolean;
        referralId: string;
        message: string;
    }>;
    /**
     * Update referral
     */
    static updateReferral(referralId: string, updates: Partial<{
        ReferralName: string;
        ReferralEmail: string;
        ReferralPhone: string;
        Organization: string;
        Stage: string;
    }>): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get referral statistics for a student
     */
    static getStudentReferralStats(studentId: string): Promise<{
        totalReferrals: number;
        totalPoints: number;
        byStage: Record<string, number>;
    }>;
    /**
     * Get referral leaderboard
     */
    static getReferralLeaderboard(limit?: number): Promise<{
        StudentID: string;
        TotalReferrals: number;
        TotalPoints: number;
        Rank: number;
    }[]>;
    /**
     * Get overall referral statistics
     */
    static getOverallStats(): Promise<{
        totalReferrals: number;
        totalPoints: number;
        byStage: Record<string, number>;
    }>;
    /**
     * Get recent referrals (last N days)
     */
    static getRecentReferrals(days?: number): Promise<Referral[]>;
}
//# sourceMappingURL=referralsService.d.ts.map