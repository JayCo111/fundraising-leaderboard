// packages/api/src/utils/validators.ts
import { VALIDATION_RULES, ERROR_MESSAGES } from './constants';

/**
 * Validation utility functions
 */

export class Validators {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    return VALIDATION_RULES.EMAIL_REGEX.test(email);
  }

  /**
   * Validate and sanitize email
   */
  static validateEmail(email: string): { valid: boolean; error?: string; sanitized?: string } {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' };
    }

    const trimmed = email.trim().toLowerCase();

    if (trimmed.length === 0) {
      return { valid: false, error: 'Email cannot be empty' };
    }

    if (trimmed.length > VALIDATION_RULES.MAX_EMAIL_LENGTH) {
      return { valid: false, error: 'Email is too long' };
    }

    if (!this.isValidEmail(trimmed)) {
      return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true, sanitized: trimmed };
  }

  /**
   * Validate phone number
   */
  static validatePhone(phone: string): { valid: boolean; error?: string; sanitized?: string } {
    if (!phone || typeof phone !== 'string') {
      return { valid: false, error: 'Phone number is required' };
    }

    const trimmed = phone.trim();

    if (trimmed.length === 0) {
      return { valid: false, error: 'Phone number cannot be empty' };
    }

    if (!VALIDATION_RULES.PHONE_REGEX.test(trimmed)) {
      return { valid: false, error: 'Invalid phone number format' };
    }

    return { valid: true, sanitized: trimmed };
  }

  /**
   * Validate name (first name, last name, etc.)
   */
  static validateName(name: string, fieldName: string = 'Name'): { valid: boolean; error?: string; sanitized?: string } {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: `${fieldName} is required` };
    }

    const trimmed = name.trim();

    if (trimmed.length === 0) {
      return { valid: false, error: `${fieldName} cannot be empty` };
    }

    if (trimmed.length > VALIDATION_RULES.MAX_NAME_LENGTH) {
      return { valid: false, error: `${fieldName} is too long` };
    }

    return { valid: true, sanitized: trimmed };
  }

  /**
   * Validate order amount
   */
  static validateAmount(amount: number): { valid: boolean; error?: string } {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return { valid: false, error: 'Amount must be a number' };
    }

    if (amount < VALIDATION_RULES.MIN_ORDER_AMOUNT) {
      return { valid: false, error: `Amount must be at least $${VALIDATION_RULES.MIN_ORDER_AMOUNT}` };
    }

    if (amount > VALIDATION_RULES.MAX_ORDER_AMOUNT) {
      return { valid: false, error: `Amount cannot exceed $${VALIDATION_RULES.MAX_ORDER_AMOUNT}` };
    }

    return { valid: true };
  }

  /**
   * Validate quantity
   */
  static validateQuantity(quantity: number): { valid: boolean; error?: string } {
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      return { valid: false, error: 'Quantity must be a number' };
    }

    if (!Number.isInteger(quantity)) {
      return { valid: false, error: 'Quantity must be a whole number' };
    }

    if (quantity < 1) {
      return { valid: false, error: 'Quantity must be at least 1' };
    }

    if (quantity > 1000) {
      return { valid: false, error: 'Quantity cannot exceed 1000' };
    }

    return { valid: true };
  }

  /**
   * Validate required fields
   */
  static validateRequired(fields: Record<string, any>): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null || value === '') {
        errors[key] = `${key} is required`;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Sanitize string (remove dangerous characters)
   */
  static sanitizeString(str: string): string {
    if (typeof str !== 'string') return '';

    return str
      .trim()
      .replace(/[<>]/g, '') // Remove < and > to prevent XSS
      .replace(/[\r\n]+/g, ' '); // Replace newlines with spaces
  }

  /**
   * Validate URL
   */
  static validateUrl(url: string): { valid: boolean; error?: string } {
    if (!url || typeof url !== 'string') {
      return { valid: false, error: 'URL is required' };
    }

    try {
      new URL(url);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }
}

/**
 * Validation middleware factory
 */
export function validate(schema: Record<string, (value: any) => { valid: boolean; error?: string }>) {
  return (req: any, res: any, next: any) => {
    const errors: Record<string, string> = {};

    for (const [field, validator] of Object.entries(schema)) {
      const value = req.body[field];
      const result = validator(value);

      if (!result.valid) {
        errors[field] = result.error || `Invalid ${field}`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        details: errors,
      });
    }

    next();
  };
}
