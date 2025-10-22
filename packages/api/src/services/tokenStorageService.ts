// packages/api/src/services/tokenStorageService.ts

/**
 * In-Memory Token Storage Service
 *
 * Fallback storage for auth tokens when Google Sheets write access is unavailable.
 * Tokens are stored in memory and will be lost when the server restarts.
 *
 * For production, use Google Sheets with Service Account or a real database.
 */

interface AuthToken {
  token: string;
  email: string;
  expiresAt: Date;
  createdAt: Date;
}

class TokenStorageService {
  private tokens: Map<string, AuthToken> = new Map();

  /**
   * Store a new auth token
   */
  async createToken(token: string, email: string, expiresAt: Date): Promise<void> {
    this.tokens.set(token, {
      token,
      email,
      expiresAt,
      createdAt: new Date(),
    });

    // Clean up expired tokens periodically
    this.cleanupExpiredTokens();
  }

  /**
   * Get token by token string
   */
  async getToken(token: string): Promise<AuthToken | null> {
    const storedToken = this.tokens.get(token);

    if (!storedToken) {
      return null;
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      this.tokens.delete(token);
      return null;
    }

    return storedToken;
  }

  /**
   * Delete a token (after use)
   */
  async deleteToken(token: string): Promise<void> {
    this.tokens.delete(token);
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [token, data] of this.tokens.entries()) {
      if (now > data.expiresAt) {
        this.tokens.delete(token);
      }
    }
  }

  /**
   * Get all active tokens (for debugging)
   */
  getActiveTokenCount(): number {
    this.cleanupExpiredTokens();
    return this.tokens.size;
  }
}

// Export singleton instance
export const tokenStorageService = new TokenStorageService();
