/**
 * API Client for SportsRaiser Backend
 *
 * Provides a clean interface to interact with the Node.js API
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Make API request
   */
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      // Log error in development only
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('API Request Error:', error);
      }
      throw error;
    }
  }

  // ==================== AUTHENTICATION ====================

  /**
   * Send magic link to email
   */
  async sendMagicLink(email) {
    return this.request('/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Verify magic link token and get JWT
   */
  async verifyToken(token) {
    const response = await this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    return this.request('/auth/me');
  }

  /**
   * Refresh user data from Google Sheets
   */
  async refreshUserData() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  /**
   * Logout
   */
  logout() {
    this.clearToken();
  }

  // ==================== STUDENTS ====================

  /**
   * Get all students
   * @param {boolean} enriched - Include calculated stats (CardsSold, NetRaised, etc.)
   */
  async getStudents(enriched = true) {
    const query = enriched ? '?enriched=true' : '';
    return this.request(`/students${query}`);
  }

  /**
   * Get student by ID
   */
  async getStudentById(studentId) {
    return this.request(`/students/${studentId}`);
  }

  /**
   * Get student by email
   */
  async getStudentByEmail(email) {
    return this.request(`/students/email/${encodeURIComponent(email)}`);
  }

  /**
   * Get students by team
   */
  async getStudentsByTeam(teamName) {
    return this.request(`/students/team/${encodeURIComponent(teamName)}`);
  }

  /**
   * Get students by program
   */
  async getStudentsByProgram(programName) {
    return this.request(`/students/program/${encodeURIComponent(programName)}`);
  }

  /**
   * Add new student
   */
  async addStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  /**
   * Get all unique teams
   */
  async getAllTeams() {
    return this.request('/students/meta/teams');
  }

  /**
   * Get all unique programs
   */
  async getAllPrograms() {
    return this.request('/students/meta/programs');
  }

  // ==================== ORDERS ====================

  /**
   * Get all orders
   * @param {Object} filters - { status, studentId, days }
   */
  async getOrders(filters = {}) {
    const params = new URLSearchParams(filters);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/orders${query}`);
  }

  /**
   * Get orders for a student
   */
  async getOrdersByStudentId(studentId) {
    return this.request(`/orders/student/${studentId}`);
  }

  /**
   * Get order statistics for a student
   */
  async getStudentOrderStats(studentId) {
    return this.request(`/orders/student/${studentId}/stats`);
  }

  /**
   * Add new order
   */
  async addOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  /**
   * Get overall order statistics
   */
  async getOverallOrderStats() {
    return this.request('/orders/stats/overall');
  }

  /**
   * Get top buyers
   */
  async getTopBuyers(limit = 10) {
    return this.request(`/orders/top-buyers?limit=${limit}`);
  }

  // ==================== REFERRALS ====================

  /**
   * Get all referrals
   * @param {Object} filters - { stage, studentId, days }
   */
  async getReferrals(filters = {}) {
    const params = new URLSearchParams(filters);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/referrals${query}`);
  }

  /**
   * Get referrals for a student
   */
  async getReferralsByStudentId(studentId) {
    return this.request(`/referrals/student/${studentId}`);
  }

  /**
   * Get referral statistics for a student
   */
  async getStudentReferralStats(studentId) {
    return this.request(`/referrals/student/${studentId}/stats`);
  }

  /**
   * Add new referral
   */
  async addReferral(referralData) {
    return this.request('/referrals', {
      method: 'POST',
      body: JSON.stringify(referralData),
    });
  }

  /**
   * Update referral
   */
  async updateReferral(referralId, updates) {
    return this.request(`/referrals/${referralId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Get referral leaderboard
   */
  async getReferralLeaderboard(limit = 10) {
    return this.request(`/referrals/leaderboard?limit=${limit}`);
  }

  /**
   * Get overall referral statistics
   */
  async getOverallReferralStats() {
    return this.request('/referrals/stats/overall');
  }

  // ==================== LEADERBOARD ====================

  /**
   * Get student leaderboard (ranked by net raised)
   */
  async getStudentLeaderboard() {
    return this.request('/leaderboard/students');
  }

  /**
   * Get team leaderboard (ranked by total net raised)
   */
  async getTeamLeaderboard() {
    return this.request('/leaderboard/teams');
  }

  /**
   * Get leaderboard for a specific team
   */
  async getTeamSpecificLeaderboard(teamName) {
    return this.request(`/leaderboard/team/${encodeURIComponent(teamName)}`);
  }

  // ==================== UTILITY ====================

  /**
   * Check API health
   */
  async healthCheck() {
    try {
      const response = await fetch(`${API_URL.replace('/api/v1', '')}/health`);
      return await response.json();
    } catch (error) {
      // Log error in development only
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Health check failed:', error);
      }
      return { status: 'error', error: error.message };
    }
  }
}

// Create and export singleton instance
const apiClient = new ApiClient();
export default apiClient;
