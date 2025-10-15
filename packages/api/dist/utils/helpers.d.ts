/**
 * Helper utility functions
 */
export declare class Helpers {
    /**
     * Generate a unique ID
     */
    static generateId(prefix?: string): string;
    /**
     * Generate a secure random token
     */
    static generateToken(bytes?: number): string;
    /**
     * Generate a random alphanumeric code
     */
    static generateCode(length?: number): string;
    /**
     * Format currency (cents to dollars)
     */
    static formatCurrency(cents: number, includeSymbol?: boolean): string;
    /**
     * Parse currency (dollars to cents)
     */
    static parseCurrency(amount: string | number): number;
    /**
     * Format phone number to consistent format
     */
    static formatPhoneNumber(phone: string): string;
    /**
     * Calculate percentage
     */
    static calculatePercentage(value: number, total: number, decimals?: number): number;
    /**
     * Sleep/delay function
     */
    static sleep(ms: number): Promise<void>;
    /**
     * Retry function with exponential backoff
     */
    static retry<T>(fn: () => Promise<T>, options?: {
        maxAttempts?: number;
        delayMs?: number;
        backoffMultiplier?: number;
    }): Promise<T>;
    /**
     * Chunk array into smaller arrays
     */
    static chunkArray<T>(array: T[], size: number): T[][];
    /**
     * Deep clone object
     */
    static deepClone<T>(obj: T): T;
    /**
     * Remove undefined/null values from object
     */
    static removeEmpty<T extends Record<string, any>>(obj: T): Partial<T>;
    /**
     * Format date to ISO string (timezone-aware)
     */
    static formatDate(date?: Date): string;
    /**
     * Check if date is expired
     */
    static isExpired(expiryDate: Date | string): boolean;
    /**
     * Add time to date
     */
    static addTime(date: Date, ms: number): Date;
    /**
     * Get time difference in human-readable format
     */
    static getTimeDifference(date: Date | string): string;
    /**
     * Mask email (for privacy)
     */
    static maskEmail(email: string): string;
    /**
     * Truncate string with ellipsis
     */
    static truncate(str: string, maxLength: number): string;
    /**
     * Generate slug from string
     */
    static slugify(str: string): string;
    /**
     * Parse query string to object
     */
    static parseQueryString(queryString: string): Record<string, string>;
    /**
     * Build query string from object
     */
    static buildQueryString(params: Record<string, any>): string;
}
//# sourceMappingURL=helpers.d.ts.map