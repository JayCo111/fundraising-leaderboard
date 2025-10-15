"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validators = void 0;
exports.validate = validate;
// packages/api/src/utils/validators.ts
const constants_1 = require("./constants");
/**
 * Validation utility functions
 */
class Validators {
    /**
     * Validate email format
     */
    static isValidEmail(email) {
        return constants_1.VALIDATION_RULES.EMAIL_REGEX.test(email);
    }
    /**
     * Validate and sanitize email
     */
    static validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { valid: false, error: 'Email is required' };
        }
        const trimmed = email.trim().toLowerCase();
        if (trimmed.length === 0) {
            return { valid: false, error: 'Email cannot be empty' };
        }
        if (trimmed.length > constants_1.VALIDATION_RULES.MAX_EMAIL_LENGTH) {
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
    static validatePhone(phone) {
        if (!phone || typeof phone !== 'string') {
            return { valid: false, error: 'Phone number is required' };
        }
        const trimmed = phone.trim();
        if (trimmed.length === 0) {
            return { valid: false, error: 'Phone number cannot be empty' };
        }
        if (!constants_1.VALIDATION_RULES.PHONE_REGEX.test(trimmed)) {
            return { valid: false, error: 'Invalid phone number format' };
        }
        return { valid: true, sanitized: trimmed };
    }
    /**
     * Validate name (first name, last name, etc.)
     */
    static validateName(name, fieldName = 'Name') {
        if (!name || typeof name !== 'string') {
            return { valid: false, error: `${fieldName} is required` };
        }
        const trimmed = name.trim();
        if (trimmed.length === 0) {
            return { valid: false, error: `${fieldName} cannot be empty` };
        }
        if (trimmed.length > constants_1.VALIDATION_RULES.MAX_NAME_LENGTH) {
            return { valid: false, error: `${fieldName} is too long` };
        }
        return { valid: true, sanitized: trimmed };
    }
    /**
     * Validate order amount
     */
    static validateAmount(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return { valid: false, error: 'Amount must be a number' };
        }
        if (amount < constants_1.VALIDATION_RULES.MIN_ORDER_AMOUNT) {
            return { valid: false, error: `Amount must be at least $${constants_1.VALIDATION_RULES.MIN_ORDER_AMOUNT}` };
        }
        if (amount > constants_1.VALIDATION_RULES.MAX_ORDER_AMOUNT) {
            return { valid: false, error: `Amount cannot exceed $${constants_1.VALIDATION_RULES.MAX_ORDER_AMOUNT}` };
        }
        return { valid: true };
    }
    /**
     * Validate quantity
     */
    static validateQuantity(quantity) {
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
    static validateRequired(fields) {
        const errors = {};
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
    static sanitizeString(str) {
        if (typeof str !== 'string')
            return '';
        return str
            .trim()
            .replace(/[<>]/g, '') // Remove < and > to prevent XSS
            .replace(/[\r\n]+/g, ' '); // Replace newlines with spaces
    }
    /**
     * Validate URL
     */
    static validateUrl(url) {
        if (!url || typeof url !== 'string') {
            return { valid: false, error: 'URL is required' };
        }
        try {
            new URL(url);
            return { valid: true };
        }
        catch {
            return { valid: false, error: 'Invalid URL format' };
        }
    }
}
exports.Validators = Validators;
/**
 * Validation middleware factory
 */
function validate(schema) {
    return (req, res, next) => {
        const errors = {};
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
                error: constants_1.ERROR_MESSAGES.VALIDATION_ERROR,
                details: errors,
            });
        }
        next();
    };
}
