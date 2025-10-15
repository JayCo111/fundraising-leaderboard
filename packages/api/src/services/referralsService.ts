// packages/api/src/services/referralsService.ts
import googleSheetsService from './googleSheetsService';
import { Validators } from '../utils/validators';
import { Helpers } from '../utils/helpers';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REFERRAL_STAGES,
  REFERRAL_POINTS,
} from '../utils/constants';

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

export class ReferralsService {
  /**
   * Get all referrals
   */
  static async getAllReferrals(): Promise<Referral[]> {
    try {
      const referrals = await googleSheetsService.getReferrals();
      return referrals;
    } catch (error: any) {
      console.error('Error getting all referrals:', error);
      throw new Error(`${ERROR_MESSAGES.GOOGLE_SHEETS_ERROR}: ${error.message}`);
    }
  }

  /**
   * Get referrals by student ID
   */
  static async getReferralsByStudentId(studentId: string): Promise<Referral[]> {
    if (!studentId) {
      throw new Error('Student ID is required');
    }

    const referrals = await googleSheetsService.getReferralsByStudentId(studentId);
    return referrals;
  }

  /**
   * Get referrals by stage
   */
  static async getReferralsByStage(stage: string): Promise<Referral[]> {
    const allReferrals = await this.getAllReferrals();
    return allReferrals.filter(r => r.Stage === stage);
  }

  /**
   * Add new referral
   */
  static async addReferral(referralData: {
    StudentID: string;
    ReferralName: string;
    ReferralEmail: string;
    ReferralPhone: string;
    Organization: string;
    Stage?: string;
  }): Promise<{ success: boolean; referralId: string; message: string }> {
    // Validate required fields
    const nameValidation = Validators.validateName(referralData.ReferralName, 'Referral name');
    if (!nameValidation.valid) {
      throw new Error(nameValidation.error);
    }

    const emailValidation = Validators.validateEmail(referralData.ReferralEmail);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.error);
    }

    const phoneValidation = Validators.validatePhone(referralData.ReferralPhone);
    if (!phoneValidation.valid) {
      throw new Error(phoneValidation.error);
    }

    const orgValidation = Validators.validateName(referralData.Organization, 'Organization');
    if (!orgValidation.valid) {
      throw new Error(orgValidation.error);
    }

    // Verify student exists
    const StudentsService = require('./studentsService').StudentsService;
    try {
      await StudentsService.getStudentById(referralData.StudentID);
    } catch {
      throw new Error(ERROR_MESSAGES.STUDENT_NOT_FOUND);
    }

    // Generate referral ID
    const referralId = Helpers.generateId('REF');

    // Default stage and points
    const stage = referralData.Stage || REFERRAL_STAGES.CONTACTED;
    const points = REFERRAL_POINTS[stage as keyof typeof REFERRAL_POINTS] || 0;

    // Add referral to Google Sheets
    await googleSheetsService.addReferral({
      ReferralID: referralId,
      StudentID: referralData.StudentID,
      ReferralName: nameValidation.sanitized!,
      ReferralEmail: emailValidation.sanitized!,
      ReferralPhone: phoneValidation.sanitized!,
      Organization: orgValidation.sanitized!,
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
      message: SUCCESS_MESSAGES.REFERRAL_CREATED,
    };
  }

  /**
   * Update referral
   */
  static async updateReferral(
    referralId: string,
    updates: Partial<{
      ReferralName: string;
      ReferralEmail: string;
      ReferralPhone: string;
      Organization: string;
      Stage: string;
    }>
  ): Promise<{ success: boolean; message: string }> {
    if (!referralId) {
      throw new Error('Referral ID is required');
    }

    // Validate updates
    const validatedUpdates: any = {};

    if (updates.ReferralName) {
      const validation = Validators.validateName(updates.ReferralName, 'Referral name');
      if (!validation.valid) throw new Error(validation.error);
      validatedUpdates.ReferralName = validation.sanitized;
    }

    if (updates.ReferralEmail) {
      const validation = Validators.validateEmail(updates.ReferralEmail);
      if (!validation.valid) throw new Error(validation.error);
      validatedUpdates.ReferralEmail = validation.sanitized;
    }

    if (updates.ReferralPhone) {
      const validation = Validators.validatePhone(updates.ReferralPhone);
      if (!validation.valid) throw new Error(validation.error);
      validatedUpdates.ReferralPhone = validation.sanitized;
    }

    if (updates.Organization) {
      const validation = Validators.validateName(updates.Organization, 'Organization');
      if (!validation.valid) throw new Error(validation.error);
      validatedUpdates.Organization = validation.sanitized;
    }

    if (updates.Stage) {
      const validStages = Object.values(REFERRAL_STAGES) as string[];
      if (!validStages.includes(updates.Stage)) {
        throw new Error(ERROR_MESSAGES.INVALID_REFERRAL_STAGE);
      }
      validatedUpdates.Stage = updates.Stage;
      validatedUpdates.Points = REFERRAL_POINTS[updates.Stage as keyof typeof REFERRAL_POINTS] || 0;
    }

    // Update referral in Google Sheets
    await googleSheetsService.updateReferral(referralId, validatedUpdates);

    console.log('✅ Referral updated successfully:', {
      referralId,
      updates: Object.keys(validatedUpdates),
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.REFERRAL_UPDATED,
    };
  }

  /**
   * Get referral statistics for a student
   */
  static async getStudentReferralStats(studentId: string): Promise<{
    totalReferrals: number;
    totalPoints: number;
    byStage: Record<string, number>;
  }> {
    const referrals = await this.getReferralsByStudentId(studentId);

    const stats = {
      totalReferrals: referrals.length,
      totalPoints: 0,
      byStage: {} as Record<string, number>,
    };

    // Initialize stage counts
    for (const stage of Object.values(REFERRAL_STAGES)) {
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
  static async getReferralLeaderboard(limit: number = 10): Promise<{
    StudentID: string;
    TotalReferrals: number;
    TotalPoints: number;
    Rank: number;
  }[]> {
    const allReferrals = await this.getAllReferrals();

    // Group by student
    const studentMap = new Map<string, {
      StudentID: string;
      TotalReferrals: number;
      TotalPoints: number;
    }>();

    for (const referral of allReferrals) {
      if (!studentMap.has(referral.StudentID)) {
        studentMap.set(referral.StudentID, {
          StudentID: referral.StudentID,
          TotalReferrals: 0,
          TotalPoints: 0,
        });
      }

      const student = studentMap.get(referral.StudentID)!;
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
  static async getOverallStats(): Promise<{
    totalReferrals: number;
    totalPoints: number;
    byStage: Record<string, number>;
  }> {
    const allReferrals = await this.getAllReferrals();

    const stats = {
      totalReferrals: allReferrals.length,
      totalPoints: 0,
      byStage: {} as Record<string, number>,
    };

    // Initialize stage counts
    for (const stage of Object.values(REFERRAL_STAGES)) {
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
  static async getRecentReferrals(days: number = 7): Promise<Referral[]> {
    const allReferrals = await this.getAllReferrals();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return allReferrals.filter(referral => {
      const referralDate = new Date(referral.DateAdded);
      return referralDate >= cutoffDate;
    });
  }
}
