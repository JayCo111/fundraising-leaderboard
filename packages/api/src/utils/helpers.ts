// packages/api/src/utils/helpers.ts
import crypto from 'crypto';

/**
 * Helper utility functions
 */

export class Helpers {
  /**
   * Generate a unique ID
   */
  static generateId(prefix: string = ''): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
  }

  /**
   * Generate a secure random token
   */
  static generateToken(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Generate a random alphanumeric code
   */
  static generateCode(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Format currency (cents to dollars)
   */
  static formatCurrency(cents: number, includeSymbol: boolean = true): string {
    const dollars = cents / 100;
    const formatted = dollars.toFixed(2);
    return includeSymbol ? `$${formatted}` : formatted;
  }

  /**
   * Parse currency (dollars to cents)
   */
  static parseCurrency(amount: string | number): number {
    if (typeof amount === 'number') return Math.round(amount * 100);

    const cleaned = amount.toString().replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);

    if (isNaN(parsed)) return 0;

    return Math.round(parsed * 100);
  }

  /**
   * Format phone number to consistent format
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX if 10 digits
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    // Format as +X (XXX) XXX-XXXX if 11 digits
    if (digits.length === 11) {
      return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }

    // Return as-is if not standard format
    return phone;
  }

  /**
   * Calculate percentage
   */
  static calculatePercentage(value: number, total: number, decimals: number = 2): number {
    if (total === 0) return 0;
    return parseFloat(((value / total) * 100).toFixed(decimals));
  }

  /**
   * Sleep/delay function
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number;
      delayMs?: number;
      backoffMultiplier?: number;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delayMs = 1000,
      backoffMultiplier = 2,
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        if (attempt < maxAttempts) {
          const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
          console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Chunk array into smaller arrays
   */
  static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Deep clone object
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Remove undefined/null values from object
   */
  static removeEmpty<T extends Record<string, any>>(obj: T): Partial<T> {
    const result: Partial<T> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null && value !== '') {
        result[key as keyof T] = value;
      }
    }

    return result;
  }

  /**
   * Format date to ISO string (timezone-aware)
   */
  static formatDate(date: Date = new Date()): string {
    return date.toISOString();
  }

  /**
   * Check if date is expired
   */
  static isExpired(expiryDate: Date | string): boolean {
    const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
    return expiry < new Date();
  }

  /**
   * Add time to date
   */
  static addTime(date: Date, ms: number): Date {
    return new Date(date.getTime() + ms);
  }

  /**
   * Get time difference in human-readable format
   */
  static getTimeDifference(date: Date | string): string {
    const target = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const diffMins = Math.floor(Math.abs(diffMs) / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  /**
   * Mask email (for privacy)
   */
  static maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;

    const maskedLocal = localPart.length > 2
      ? `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}`
      : localPart;

    return `${maskedLocal}@${domain}`;
  }

  /**
   * Truncate string with ellipsis
   */
  static truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return `${str.substring(0, maxLength - 3)}...`;
  }

  /**
   * Generate slug from string
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Parse query string to object
   */
  static parseQueryString(queryString: string): Record<string, string> {
    const params: Record<string, string> = {};
    const pairs = queryString.replace('?', '').split('&');

    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    }

    return params;
  }

  /**
   * Build query string from object
   */
  static buildQueryString(params: Record<string, any>): string {
    const pairs = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);

    return pairs.length > 0 ? `?${pairs.join('&')}` : '';
  }
}
