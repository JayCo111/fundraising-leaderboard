import { Role } from '../types';

// Referral stages and point values
export const REFERRAL_STAGES = {
  ADDED: {
    id: 'ADDED',
    name: 'Added',
    description: 'Prospect added to CRM',
    points: 10,
    color: 'gray',
    icon: '➕',
    nextStages: ['CONTACTED', 'INTERESTED']
  },
  CONTACTED: {
    id: 'CONTACTED',
    name: 'Contacted',
    description: 'Initial contact made',
    points: 25,
    color: 'blue',
    icon: '📞',
    nextStages: ['INTERESTED', 'QUALIFIED', 'NOT_INTERESTED']
  },
  INTERESTED: {
    id: 'INTERESTED',
    name: 'Interested',
    description: 'Shows interest in program',
    points: 50,
    color: 'yellow',
    icon: '👀',
    nextStages: ['QUALIFIED', 'MEETING_SCHEDULED', 'NOT_INTERESTED']
  },
  QUALIFIED: {
    id: 'QUALIFIED',
    name: 'Qualified',
    description: 'Meets criteria and budget',
    points: 100,
    color: 'green',
    icon: '✅',
    nextStages: ['MEETING_SCHEDULED', 'PROPOSAL_SENT', 'NOT_INTERESTED']
  },
  MEETING_SCHEDULED: {
    id: 'MEETING_SCHEDULED',
    name: 'Meeting Scheduled',
    description: 'Meeting or demo scheduled',
    points: 150,
    color: 'purple',
    icon: '📅',
    nextStages: ['MEETING_COMPLETED', 'PROPOSAL_SENT', 'NOT_INTERESTED']
  },
  MEETING_COMPLETED: {
    id: 'MEETING_COMPLETED',
    name: 'Meeting Completed',
    description: 'Meeting or demo completed',
    points: 200,
    color: 'indigo',
    icon: '🤝',
    nextStages: ['PROPOSAL_SENT', 'NEGOTIATION', 'NOT_INTERESTED']
  },
  PROPOSAL_SENT: {
    id: 'PROPOSAL_SENT',
    name: 'Proposal Sent',
    description: 'Proposal or quote sent',
    points: 250,
    color: 'pink',
    icon: '📄',
    nextStages: ['NEGOTIATION', 'SIGNED', 'NOT_INTERESTED']
  },
  NEGOTIATION: {
    id: 'NEGOTIATION',
    name: 'Negotiation',
    description: 'In contract negotiation',
    points: 300,
    color: 'orange',
    icon: '🤝',
    nextStages: ['SIGNED', 'NOT_INTERESTED']
  },
  SIGNED: {
    id: 'SIGNED',
    name: 'Signed',
    description: 'Contract signed, program launched',
    points: 500,
    color: 'emerald',
    icon: '✍️',
    nextStages: ['COMPLETED', 'CANCELLED']
  },
  COMPLETED: {
    id: 'COMPLETED',
    name: 'Completed',
    description: 'Program completed successfully',
    points: 750,
    color: 'green',
    icon: '🏆',
    nextStages: []
  },
  NOT_INTERESTED: {
    id: 'NOT_INTERESTED',
    name: 'Not Interested',
    description: 'Declined or not interested',
    points: 0,
    color: 'red',
    icon: '❌',
    nextStages: []
  },
  CANCELLED: {
    id: 'CANCELLED',
    name: 'Cancelled',
    description: 'Program cancelled',
    points: 0,
    color: 'red',
    icon: '🚫',
    nextStages: []
  }
};

// Referral types and multipliers
export const REFERRAL_TYPES = {
  STUDENT_TO_STUDENT: {
    id: 'STUDENT_TO_STUDENT',
    name: 'Student to Student',
    multiplier: 1.0,
    description: 'Student refers another student'
  },
  STUDENT_TO_ORGANIZATION: {
    id: 'STUDENT_TO_ORGANIZATION',
    name: 'Student to Organization',
    multiplier: 2.0,
    description: 'Student refers an organization'
  },
  ORGANIZATION_TO_ORGANIZATION: {
    id: 'ORGANIZATION_TO_ORGANIZATION',
    name: 'Organization to Organization',
    multiplier: 3.0,
    description: 'Organization refers another organization'
  },
  COACH_TO_ORGANIZATION: {
    id: 'COACH_TO_ORGANIZATION',
    name: 'Coach to Organization',
    multiplier: 2.5,
    description: 'Coach refers an organization'
  },
  SALES_REP_TO_ORGANIZATION: {
    id: 'SALES_REP_TO_ORGANIZATION',
    name: 'Sales Rep to Organization',
    multiplier: 1.5,
    description: 'Sales rep refers an organization'
  }
};

// Referral CRM service class
export class ReferralCRMService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  // Get all prospects for a user
  async getProspects(userId, userRole, filters = {}) {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        user_role: userRole,
        ...filters
      });

      const response = await this.apiClient.get(`/api/v1/referrals/prospects?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Add new prospect
  async addProspect(prospectData) {
    try {
      const response = await this.apiClient.post('/api/v1/referrals/prospects', prospectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update prospect stage
  async updateProspectStage(prospectId, newStage, notes = '') {
    try {
      const response = await this.apiClient.put(`/api/v1/referrals/prospects/${prospectId}/stage`, {
        stage: newStage,
        notes,
        updated_at: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Add activity to prospect
  async addProspectActivity(prospectId, activityData) {
    try {
      const response = await this.apiClient.post(`/api/v1/referrals/prospects/${prospectId}/activities`, {
        ...activityData,
        created_at: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get referral analytics
  async getReferralAnalytics(userId, userRole, dateRange) {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        user_role: userRole,
        start_date: dateRange.start,
        end_date: dateRange.end
      });

      const response = await this.apiClient.get(`/api/v1/referrals/analytics?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get referral leaderboard
  async getReferralLeaderboard(scope, scopeId, period = 'all_time') {
    try {
      const params = new URLSearchParams({
        scope,
        scope_id: scopeId,
        period
      });

      const response = await this.apiClient.get(`/api/v1/referrals/leaderboard?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Calculate points for stage change
  calculatePoints(oldStage, newStage, referralType = 'STUDENT_TO_STUDENT') {
    const oldStageData = REFERRAL_STAGES[oldStage];
    const newStageData = REFERRAL_STAGES[newStage];
    const typeData = REFERRAL_TYPES[referralType];

    if (!oldStageData || !newStageData || !typeData) {
      return 0;
    }

    // Calculate point difference
    const pointDifference = newStageData.points - oldStageData.points;
    
    // Apply type multiplier
    const finalPoints = Math.max(0, pointDifference * typeData.multiplier);
    
    return Math.round(finalPoints);
  }

  // Get available next stages
  getAvailableNextStages(currentStage) {
    const stageData = REFERRAL_STAGES[currentStage];
    return stageData ? stageData.nextStages : [];
  }

  // Get stage progression path
  getStageProgressionPath() {
    return [
      'ADDED',
      'CONTACTED', 
      'INTERESTED',
      'QUALIFIED',
      'MEETING_SCHEDULED',
      'MEETING_COMPLETED',
      'PROPOSAL_SENT',
      'NEGOTIATION',
      'SIGNED',
      'COMPLETED'
    ];
  }

  // Validate stage transition
  isValidStageTransition(fromStage, toStage) {
    const availableStages = this.getAvailableNextStages(fromStage);
    return availableStages.includes(toStage);
  }

  // Get referral statistics
  async getReferralStats(userId, userRole) {
    try {
      const response = await this.apiClient.get(`/api/v1/referrals/stats/${userId}?role=${userRole}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Export referral data
  async exportReferralData(userId, userRole, format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        user_role: userRole,
        format,
        ...filters
      });

      const response = await this.apiClient.get(`/api/v1/referrals/export?${params}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Mock API client for demo purposes
export class MockReferralApiClient {
  constructor() {
    this.prospects = this.generateMockProspects();
    this.activities = this.generateMockActivities();
  }

  generateMockProspects() {
    return [
      {
        id: 'prospect-1',
        referrerId: 'student-1',
        referrerName: 'Mike Chen',
        referrerRole: Role.PARENT_STUDENT,
        organizationName: 'Springfield High School',
        contactName: 'John Smith',
        contactEmail: 'john@springfield.edu',
        contactPhone: '(555) 123-4567',
        stage: 'INTERESTED',
        points: 50,
        referralType: 'STUDENT_TO_ORGANIZATION',
        estimatedValue: 15000,
        probability: 75,
        createdDate: '2024-01-10',
        lastActivity: '2024-01-15',
        notes: 'Very interested in our program. Waiting for budget approval.',
        activities: [
          {
            id: 'activity-1',
            type: 'EMAIL_SENT',
            description: 'Sent program information email',
            date: '2024-01-12',
            points: 25
          },
          {
            id: 'activity-2',
            type: 'PHONE_CALL',
            description: 'Follow-up phone call',
            date: '2024-01-15',
            points: 25
          }
        ]
      },
      {
        id: 'prospect-2',
        referrerId: 'student-2',
        referrerName: 'Emma Davis',
        referrerRole: Role.PARENT_STUDENT,
        organizationName: 'Riverside Middle School',
        contactName: 'Sarah Johnson',
        contactEmail: 'sarah@riverside.edu',
        contactPhone: '(555) 234-5678',
        stage: 'QUALIFIED',
        points: 100,
        referralType: 'STUDENT_TO_ORGANIZATION',
        estimatedValue: 8000,
        probability: 60,
        createdDate: '2024-01-08',
        lastActivity: '2024-01-14',
        notes: 'Qualified lead. Needs assessment completed.',
        activities: [
          {
            id: 'activity-3',
            type: 'MEETING',
            description: 'Initial meeting completed',
            date: '2024-01-10',
            points: 50
          },
          {
            id: 'activity-4',
            type: 'PROPOSAL_SENT',
            description: 'Proposal sent',
            date: '2024-01-14',
            points: 50
          }
        ]
      },
      {
        id: 'prospect-3',
        referrerId: 'coach-1',
        referrerName: 'Coach Martinez',
        referrerRole: Role.HEAD_COACH,
        organizationName: 'Valley Sports Club',
        contactName: 'Lisa Davis',
        contactEmail: 'lisa@valleysports.com',
        contactPhone: '(555) 345-6789',
        stage: 'SIGNED',
        points: 500,
        referralType: 'COACH_TO_ORGANIZATION',
        estimatedValue: 25000,
        probability: 100,
        createdDate: '2024-01-02',
        lastActivity: '2024-01-16',
        notes: 'Contract signed. Program launched successfully.',
        activities: [
          {
            id: 'activity-5',
            type: 'CONTRACT_SIGNED',
            description: 'Contract signed and program launched',
            date: '2024-01-16',
            points: 500
          }
        ]
      }
    ];
  }

  generateMockActivities() {
    return [
      {
        id: 'activity-1',
        prospectId: 'prospect-1',
        type: 'EMAIL_SENT',
        description: 'Sent program information email',
        date: '2024-01-12',
        points: 25,
        userId: 'student-1'
      },
      {
        id: 'activity-2',
        prospectId: 'prospect-1',
        type: 'PHONE_CALL',
        description: 'Follow-up phone call',
        date: '2024-01-15',
        points: 25,
        userId: 'student-1'
      },
      {
        id: 'activity-3',
        prospectId: 'prospect-2',
        type: 'MEETING',
        description: 'Initial meeting completed',
        date: '2024-01-10',
        points: 50,
        userId: 'student-2'
      },
      {
        id: 'activity-4',
        prospectId: 'prospect-2',
        type: 'PROPOSAL_SENT',
        description: 'Proposal sent',
        date: '2024-01-14',
        points: 50,
        userId: 'student-2'
      },
      {
        id: 'activity-5',
        prospectId: 'prospect-3',
        type: 'CONTRACT_SIGNED',
        description: 'Contract signed and program launched',
        date: '2024-01-16',
        points: 500,
        userId: 'coach-1'
      }
    ];
  }

  async get(url) {
    if (url.includes('/prospects')) {
      return { data: this.prospects };
    }

    if (url.includes('/analytics')) {
      return {
        data: {
          totalProspects: this.prospects.length,
          totalPoints: this.prospects.reduce((sum, p) => sum + p.points, 0),
          stageDistribution: {
            ADDED: this.prospects.filter(p => p.stage === 'ADDED').length,
            CONTACTED: this.prospects.filter(p => p.stage === 'CONTACTED').length,
            INTERESTED: this.prospects.filter(p => p.stage === 'INTERESTED').length,
            QUALIFIED: this.prospects.filter(p => p.stage === 'QUALIFIED').length,
            SIGNED: this.prospects.filter(p => p.stage === 'SIGNED').length,
            COMPLETED: this.prospects.filter(p => p.stage === 'COMPLETED').length
          },
          conversionRate: 0.25,
          avgTimeToClose: 45,
          topReferrers: [
            { name: 'Mike Chen', points: 50, prospects: 1 },
            { name: 'Emma Davis', points: 100, prospects: 1 },
            { name: 'Coach Martinez', points: 500, prospects: 1 }
          ]
        }
      };
    }

    if (url.includes('/leaderboard')) {
      return {
        data: [
          { rank: 1, name: 'Coach Martinez', points: 500, prospects: 1, conversionRate: 1.0 },
          { rank: 2, name: 'Emma Davis', points: 100, prospects: 1, conversionRate: 0.5 },
          { rank: 3, name: 'Mike Chen', points: 50, prospects: 1, conversionRate: 0.25 }
        ]
      };
    }

    if (url.includes('/stats')) {
      return {
        data: {
          totalProspects: this.prospects.length,
          totalPoints: this.prospects.reduce((sum, p) => sum + p.points, 0),
          activeProspects: this.prospects.filter(p => !['COMPLETED', 'NOT_INTERESTED', 'CANCELLED'].includes(p.stage)).length,
          conversionRate: 0.25,
          avgPointsPerProspect: 216.67
        }
      };
    }

    return { data: [] };
  }

  async post(url, data) {
    if (url.includes('/prospects')) {
      const prospect = {
        id: `prospect-${Date.now()}`,
        ...data,
        createdDate: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0],
        activities: []
      };
      this.prospects.push(prospect);
      return { data: prospect };
    }

    if (url.includes('/activities')) {
      const activity = {
        id: `activity-${Date.now()}`,
        ...data
      };
      this.activities.push(activity);
      return { data: activity };
    }

    return { data: { success: true } };
  }

  async put(url, data) {
    if (url.includes('/stage')) {
      const prospectId = url.split('/')[4];
      const prospect = this.prospects.find(p => p.id === prospectId);
      if (prospect) {
        prospect.stage = data.stage;
        prospect.lastActivity = new Date().toISOString().split('T')[0];
      }
      return { data: { success: true } };
    }

    return { data: { success: true } };
  }
}

export default ReferralCRMService;
