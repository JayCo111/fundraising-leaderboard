"use strict";
// packages/api/src/services/tokenStorageService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenStorageService = void 0;
class TokenStorageService {
    constructor() {
        this.tokens = new Map();
    }
    /**
     * Store a new auth token
     */
    async createToken(token, email, expiresAt) {
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
    async getToken(token) {
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
    async deleteToken(token) {
        this.tokens.delete(token);
    }
    /**
     * Clean up expired tokens
     */
    cleanupExpiredTokens() {
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
    getActiveTokenCount() {
        this.cleanupExpiredTokens();
        return this.tokens.size;
    }
}
// Export singleton instance
exports.tokenStorageService = new TokenStorageService();
