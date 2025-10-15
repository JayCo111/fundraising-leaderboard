"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralsService = void 0;
// packages/api/src/services/referralsService.ts
const googleSheetsService_1 = __importDefault(require("./googleSheetsService"));
const validators_1 = require("../utils/validators");
const helpers_1 = require("../utils/helpers");
const constants_1 = require("../utils/constants");
class ReferralsService {
    /**
     * Get all referrals
     */
    static async getAllReferrals() {
        try {
            const referrals = await googleSheetsService_1.default.getReferrals();
            return referrals;
        }
        catch (error) {
            console.error('Error getting all referrals:', error);
            throw new Error(`${constants_1.ERROR_MESSAGES.GOOGLE_SHEETS_ERROR}: ${error.message}`);
        }
    }
    /**
     * Get referrals by student ID
     */
    static async getReferralsByStudentId(studentId) {
        if (!studentId) {
            throw new Error('Student ID is required');
        }
        const referrals = await googleSheetsService_1.default.getReferralsByStudentId(studentId);
        return referrals;
    }
    /**
     * Get referrals by stage
     */
    static async getReferralsByStage(stage) {
        const allReferrals = await this.getAllReferrals();
        return allReferrals.filter(r => r.Stage === stage);
    }
    /**
     * Add new referral
     */
    static async addReferral(referralData) {
        // Validate required fields
        const nameValidation = validators_1.Validators.validateName(referralData.ReferralName, 'Referral name');
        if (!nameValidation.valid) {
            throw new Error(nameValidation.error);
        }
        const emailValidation = validators_1.Validators.validateEmail(referralData.ReferralEmail);
        if (!emailValidation.valid) {
            throw new Error(emailValidation.error);
        }
        const phoneValidation = validators_1.Validators.validatePhone(referralData.ReferralPhone);
        if (!phoneValidation.valid) {
            throw new Error(phoneValidation.error);
        }
        const orgValidation = validators_1.Validators.validateName(referralData.Organization, 'Organization');
        if (!orgValidation.valid) {
            throw new Error(orgValidation.error);
        }
        // Verify student exists
        const StudentsService = require('./studentsService').StudentsService;
        try {
            await StudentsService.getStudentById(referralData.StudentID);
        }
        catch {
            throw new Error(constants_1.ERROR_MESSAGES.STUDENT_NOT_FOUND);
        }
        // Generate referral ID
        const referralId = helpers_1.Helpers.generateId('REF');
        // Default stage and points
        const stage = referralData.Stage || constants_1.REFERRAL_STAGES.CONTACTED;
        const points = constants_1.REFERRAL_POINTS[stage] || 0;
        // Add referral to Google Sheets
        await googleSheetsService_1.default.addReferral({
            ReferralID: referralId,
            StudentID: referralData.StudentID,
            ReferralName: nameValidation.sanitized,
            ReferralEmail: emailValidation.sanitized,
            ReferralPhone: phoneValidation.sanitized,
            Organization: orgValidation.sanitized,
            Stage: stage,
            Points: points,
        });
        console.log('✅ Referral added successfully:', {
            referralId,
            studentId: referralData.StudentID,
            organization: orgValidation.sanitized,
            stage,
            points,
        });
        return {
            success: true,
            referralId,
            message: constants_1.SUCCESS_MESSAGES.REFERRAL_CREATED,
        };
    }
    /**
     * Update referral
     */
    static async updateReferral(referralId, updates) {
        if (!referralId) {
            throw new Error('Referral ID is required');
        }
        // Validate updates
        const validatedUpdates = {};
        if (updates.ReferralName) {
            const validation = validators_1.Validators.validateName(updates.ReferralName, 'Referral name');
            if (!validation.valid)
                throw new Error(validation.error);
            validatedUpdates.ReferralName = validation.sanitized;
        }
        if (updates.ReferralEmail) {
            const validation = validators_1.Validators.validateEmail(updates.ReferralEmail);
            if (!validation.valid)
                throw new Error(validation.error);
            validatedUpdates.ReferralEmail = validation.sanitized;
        }
        if (updates.ReferralPhone) {
            const validation = validators_1.Validators.validatePhone(updates.ReferralPhone);
            if (!validation.valid)
                throw new Error(validation.error);
            validatedUpdates.ReferralPhone = validation.sanitized;
        }
        if (updates.Organization) {
            const validation = validators_1.Validators.validateName(updates.Organization, 'Organization');
            if (!validation.valid)
                throw new Error(validation.error);
            validatedUpdates.Organization = validation.sanitized;
        }
        if (updates.Stage) {
            const validStages = Object.values(constants_1.REFERRAL_STAGES);
            if (!validStages.includes(updates.Stage)) {
                throw new Error(constants_1.ERROR_MESSAGES.INVALID_REFERRAL_STAGE);
            }
            validatedUpdates.Stage = updates.Stage;
            validatedUpdates.Points = constants_1.REFERRAL_POINTS[updates.Stage] || 0;
        }
        // Update referral in Google Sheets
        await googleSheetsService_1.default.updateReferral(referralId, validatedUpdates);
        console.log('✅ Referral updated successfully:', {
            referralId,
            updates: Object.keys(validatedUpdates),
        });
        return {
            success: true,
            message: constants_1.SUCCESS_MESSAGES.REFERRAL_UPDATED,
        };
    }
    /**
     * Get referral statistics for a student
     */
    static async getStudentReferralStats(studentId) {
        const referrals = await this.getReferralsByStudentId(studentId);
        const stats = {
            totalReferrals: referrals.length,
            totalPoints: 0,
            byStage: {},
        };
        // Initialize stage counts
        for (const stage of Object.values(constants_1.REFERRAL_STAGES)) {
            stats.byStage[stage] = 0;
        }
        // Calculate stats
        for (const referral of referrals) {
            stats.totalPoints += referral.Points;
            stats.byStage[referral.Stage] = (stats.byStage[referral.Stage] || 0) + 1;
        }
        return stats;
    }
    /**
     * Get referral leaderboard
     */
    static async getReferralLeaderboard(limit = 10) {
        const allReferrals = await this.getAllReferrals();
        // Group by student
        const studentMap = new Map();
        for (const referral of allReferrals) {
            if (!studentMap.has(referral.StudentID)) {
                studentMap.set(referral.StudentID, {
                    StudentID: referral.StudentID,
                    TotalReferrals: 0,
                    TotalPoints: 0,
                });
            }
            const student = studentMap.get(referral.StudentID);
            student.TotalReferrals++;
            student.TotalPoints += referral.Points;
        }
        // Convert to array and sort
        const leaderboard = Array.from(studentMap.values());
        leaderboard.sort((a, b) => b.TotalPoints - a.TotalPoints);
        // Add ranks
        const rankedLeaderboard = leaderboard.slice(0, limit).map((entry, index) => ({
            ...entry,
            Rank: index + 1,
        }));
        return rankedLeaderboard;
    }
    /**
     * Get overall referral statistics
     */
    static async getOverallStats() {
        const allReferrals = await this.getAllReferrals();
        const stats = {
            totalReferrals: allReferrals.length,
            totalPoints: 0,
            byStage: {},
        };
        // Initialize stage counts
        for (const stage of Object.values(constants_1.REFERRAL_STAGES)) {
            stats.byStage[stage] = 0;
        }
        // Calculate stats
        for (const referral of allReferrals) {
            stats.totalPoints += referral.Points;
            stats.byStage[referral.Stage] = (stats.byStage[referral.Stage] || 0) + 1;
        }
        return stats;
    }
    /**
     * Get recent referrals (last N days)
     */
    static async getRecentReferrals(days = 7) {
        const allReferrals = await this.getAllReferrals();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return allReferrals.filter(referral => {
            const referralDate = new Date(referral.DateAdded);
            return referralDate >= cutoffDate;
        });
    }
}
exports.ReferralsService = ReferralsService;
