import { Role } from '../types';

// Message types and templates
export const MESSAGE_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app'
};

export const MESSAGE_TEMPLATES = {
  // Sales Rep templates
  PROSPECT_FOLLOW_UP: {
    id: 'prospect_follow_up',
    name: 'Prospect Follow-up',
    type: MESSAGE_TYPES.EMAIL,
    subject: 'Following up on our conversation about SportsRaiser',
    template: `Hi {{contactName}},

I wanted to follow up on our conversation about SportsRaiser and how it can help {{organizationName}} with fundraising.

Key benefits for your organization:
- Increase fundraising revenue by 40-60%
- Reduce administrative burden
- Engage athletes and families
- Track progress in real-time

Would you be available for a 15-minute call this week to discuss how SportsRaiser can work for {{organizationName}}?

Best regards,
{{senderName}}`
  },

  // Coach templates
  TEAM_MOTIVATION: {
    id: 'team_motivation',
    name: 'Team Motivation',
    type: MESSAGE_TYPES.SMS,
    // eslint-disable-next-line no-template-curly-in-string
    template: `Hey {{athleteName}}! 🏆

Great job on your fundraising progress! You're currently at {{progress}}% of your goal.

Keep up the momentum! Every card sold helps our team reach our goal of $\${teamGoal}.

Go {{teamName}}! 💪

- Coach {{coachName}}`
  },

  // Director templates
  PROGRAM_UPDATE: {
    id: 'program_update',
    name: 'Program Update',
    type: MESSAGE_TYPES.EMAIL,
    subject: '{{programName}} - Weekly Update',
    // eslint-disable-next-line no-template-curly-in-string
    template: `Dear {{recipientName}},

Here's your weekly update for {{programName}}:

📊 Current Stats:
- Total Raised: $\${totalRaised}
- Cards Sold: {{cardsSold}}
- Participation Rate: {{participationRate}}%
- Goal Progress: {{goalProgress}}%

🏆 Top Performers:
{{topPerformers}}

Keep up the great work!

Best regards,
{{senderName}}`
  },

  // System templates
  TRANSACTION_CONFIRMATION: {
    id: 'transaction_confirmation',
    name: 'Transaction Confirmation',
    type: MESSAGE_TYPES.EMAIL,
    subject: 'Thank you for your donation!',
    // eslint-disable-next-line no-template-curly-in-string
    template: `Dear {{donorName}},

Thank you for your generous donation of $\${amount} to {{athleteName}}'s fundraising campaign!

Your contribution helps {{organizationName}} continue providing excellent programs for our athletes.

Transaction Details:
- Amount: $\${amount}
- Athlete: {{athleteName}}
- Team: {{teamName}}
- Date: {{transactionDate}}

Thank you for your support!

{{organizationName}}`
  }
};

// Role-based messaging permissions
export const MESSAGING_PERMISSIONS = {
  [Role.OWNER]: {
    canSendBroadcast: true,
    canSendToRoles: [Role.CEO, Role.REGIONAL_DIRECTOR, Role.STATE_DIRECTOR, Role.TERRITORY_DIRECTOR],
    canSendToScope: 'national',
    maxRecipients: 10000
  },
  [Role.CEO]: {
    canSendBroadcast: true,
    canSendToRoles: [Role.REGIONAL_DIRECTOR, Role.STATE_DIRECTOR, Role.TERRITORY_DIRECTOR],
    canSendToScope: 'national',
    maxRecipients: 5000
  },
  [Role.REGIONAL_DIRECTOR]: {
    canSendBroadcast: true,
    canSendToRoles: [Role.STATE_DIRECTOR, Role.TERRITORY_DIRECTOR, Role.SALES_REP],
    canSendToScope: 'regional',
    maxRecipients: 1000
  },
  [Role.STATE_DIRECTOR]: {
    canSendBroadcast: true,
    canSendToRoles: [Role.TERRITORY_DIRECTOR, Role.SALES_REP],
    canSendToScope: 'state',
    maxRecipients: 500
  },
  [Role.TERRITORY_DIRECTOR]: {
    canSendBroadcast: true,
    canSendToRoles: [Role.SALES_REP],
    canSendToScope: 'territory',
    maxRecipients: 100
  },
  [Role.SALES_REP]: {
    canSendBroadcast: false,
    canSendToRoles: [],
    canSendToScope: 'prospects',
    maxRecipients: 50,
    canSend1on1: true
  },
  [Role.ORG_OWNER]: {
    canSendBroadcast: true,
    canSendToRoles: [Role.PROGRAM_DIRECTOR, Role.HEAD_COACH, Role.PARENT_STUDENT],
    canSendToScope: 'organization',
    maxRecipients: 1000
  },
  [Role.PROGRAM_DIRECTOR]: {
    canSendBroadcast: true,
    canSendToRoles: [Role.HEAD_COACH, Role.PARENT_STUDENT],
    canSendToScope: 'program',
    maxRecipients: 500
  },
  [Role.HEAD_COACH]: {
    canSendBroadcast: true,
    canSendToRoles: [Role.PARENT_STUDENT],
    canSendToScope: 'team',
    maxRecipients: 50
  },
  [Role.PARENT_STUDENT]: {
    canSendBroadcast: false,
    canSendToRoles: [],
    canSendToScope: 'self',
    maxRecipients: 1,
    canSend1on1: false
  }
};

// Message service class
export class MessageService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  // Check if user can send message to recipients
  canSendMessage(senderRole, recipientRoles, recipientCount) {
    const permissions = MESSAGING_PERMISSIONS[senderRole];
    if (!permissions) return false;

    // Check recipient count limit
    if (recipientCount > permissions.maxRecipients) return false;

    // Check if can send to any of the recipient roles
    if (permissions.canSendBroadcast) {
      return recipientRoles.some(role => permissions.canSendToRoles.includes(role));
    }

    // Check 1-on-1 messaging
    if (permissions.canSend1on1 && recipientCount === 1) {
      return true;
    }

    return false;
  }

  // Get available templates for a role
  getAvailableTemplates(userRole) {
    const templates = Object.values(MESSAGE_TEMPLATES);
    
    switch (userRole) {
      case Role.SALES_REP:
        return templates.filter(t => ['prospect_follow_up'].includes(t.id));
      case Role.HEAD_COACH:
        return templates.filter(t => ['team_motivation', 'program_update'].includes(t.id));
      case Role.PROGRAM_DIRECTOR:
      case Role.ORG_OWNER:
        return templates.filter(t => ['program_update'].includes(t.id));
      case Role.OWNER:
      case Role.CEO:
      case Role.REGIONAL_DIRECTOR:
      case Role.STATE_DIRECTOR:
      case Role.TERRITORY_DIRECTOR:
        return templates.filter(t => ['program_update'].includes(t.id));
      default:
        return [];
    }
  }

  // Send message
  async sendMessage(messageData) {
    const {
      senderId,
      senderRole,
      recipients,
      templateId,
      customMessage,
      messageType = MESSAGE_TYPES.EMAIL,
      scheduledFor = null
    } = messageData;

    // Validate permissions
    const recipientRoles = [...new Set(recipients.map(r => r.role))];
    const canSend = this.canSendMessage(senderRole, recipientRoles, recipients.length);
    
    if (!canSend) {
      throw new Error('Insufficient permissions to send message');
    }

    // Prepare message payload
    const payload = {
      sender_id: senderId,
      sender_role: senderRole,
      recipients: recipients.map(r => ({
        id: r.id,
        role: r.role,
        email: r.email,
        phone: r.phone,
        name: r.name
      })),
      template_id: templateId,
      custom_message: customMessage,
      message_type: messageType,
      scheduled_for: scheduledFor,
      created_at: new Date().toISOString()
    };

    // Send to API
    try {
      const response = await this.apiClient.post('/api/v1/messages', payload);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get message history
  async getMessageHistory(userId, filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await this.apiClient.get(`/api/v1/messages/history/${userId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching message history:', error);
      throw error;
    }
  }

  // Get recipients for a role and scope
  async getRecipients(userRole, userScope, filters = {}) {
    try {
      const params = new URLSearchParams({
        role: userRole,
        ...userScope,
        ...filters
      });

      const response = await this.apiClient.get(`/api/v1/messages/recipients?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recipients:', error);
      throw error;
    }
  }

  // Schedule message
  async scheduleMessage(messageData, scheduledFor) {
    return this.sendMessage({
      ...messageData,
      scheduledFor
    });
  }

  // Cancel scheduled message
  async cancelScheduledMessage(messageId) {
    try {
      const response = await this.apiClient.delete(`/api/v1/messages/scheduled/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error canceling scheduled message:', error);
      throw error;
    }
  }

  // Get message analytics
  async getMessageAnalytics(userId, dateRange) {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        start_date: dateRange.start,
        end_date: dateRange.end
      });

      const response = await this.apiClient.get(`/api/v1/messages/analytics?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching message analytics:', error);
      throw error;
    }
  }
}

// Mock API client for demo purposes
export class MockApiClient {
  constructor() {
    this.messages = [];
    this.recipients = this.generateMockRecipients();
  }

  generateMockRecipients() {
    return [
      // Sales Rep prospects
      { id: 'prospect-1', role: 'PROSPECT', name: 'John Smith', email: 'john@springfield.edu', phone: '(555) 123-4567', organization: 'Springfield High School' },
      { id: 'prospect-2', role: 'PROSPECT', name: 'Sarah Johnson', email: 'sarah@riverside.edu', phone: '(555) 234-5678', organization: 'Riverside Middle School' },
      
      // Team members
      { id: 'athlete-1', role: Role.PARENT_STUDENT, name: 'Mike Chen', email: 'mike@email.com', phone: '(555) 345-6789', team: 'Lightning' },
      { id: 'athlete-2', role: Role.PARENT_STUDENT, name: 'Emma Davis', email: 'emma@email.com', phone: '(555) 456-7890', team: 'Lightning' },
      
      // Coaches
      { id: 'coach-1', role: Role.HEAD_COACH, name: 'Coach Martinez', email: 'coach@email.com', phone: '(555) 567-8901', team: 'Thunder' },
      { id: 'coach-2', role: Role.HEAD_COACH, name: 'Coach Wilson', email: 'coach2@email.com', phone: '(555) 678-9012', team: 'Storm' },
      
      // Directors
      { id: 'director-1', role: Role.PROGRAM_DIRECTOR, name: 'Program Director', email: 'director@email.com', phone: '(555) 789-0123', program: 'Spring Soccer 2024' },
      { id: 'director-2', role: Role.ORG_OWNER, name: 'Org Owner', email: 'owner@email.com', phone: '(555) 890-1234', organization: 'Springfield Youth Sports' }
    ];
  }

  async post(url, data) {
    console.log('Mock API POST:', url, data);
    
    if (url.includes('/messages')) {
      const message = {
        id: `msg-${Date.now()}`,
        ...data,
        status: 'sent',
        sent_at: new Date().toISOString()
      };
      this.messages.push(message);
      return { data: message };
    }
    
    return { data: { success: true } };
  }

  async get(url) {
    console.log('Mock API GET:', url);
    
    if (url.includes('/recipients')) {
      return { data: this.recipients };
    }
    
    if (url.includes('/history')) {
      return { data: this.messages.slice(-10) };
    }
    
    if (url.includes('/analytics')) {
      return {
        data: {
          total_sent: this.messages.length,
          total_delivered: this.messages.length,
          total_opened: Math.floor(this.messages.length * 0.8),
          total_clicked: Math.floor(this.messages.length * 0.3),
          open_rate: 0.8,
          click_rate: 0.3
        }
      };
    }
    
    return { data: [] };
  }

  async delete(url) {
    console.log('Mock API DELETE:', url);
    return { data: { success: true } };
  }
}

export default MessageService;
