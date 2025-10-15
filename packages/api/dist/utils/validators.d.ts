/**
 * Validation utility functions
 */
export declare class Validators {
    /**
     * Validate email format
     */
    static isValidEmail(email: string): boolean;
    /**
     * Validate and sanitize email
     */
    static validateEmail(email: string): {
        valid: boolean;
        error?: string;
        sanitized?: string;
    };
    /**
     * Validate phone number
     */
    static validatePhone(phone: string): {
        valid: boolean;
        error?: string;
        sanitized?: string;
    };
    /**
     * Validate name (first name, last name, etc.)
     */
    static validateName(name: string, fieldName?: string): {
        valid: boolean;
        error?: string;
        sanitized?: string;
    };
    /**
     * Validate order amount
     */
    static validateAmount(amount: number): {
        valid: boolean;
        error?: string;
    };
    /**
     * Validate quantity
     */
    static validateQuantity(quantity: number): {
        valid: boolean;
        error?: string;
    };
    /**
     * Validate required fields
     */
    static validateRequired(fields: Record<string, any>): {
        valid: boolean;
        errors: Record<string, string>;
    };
    /**
     * Sanitize string (remove dangerous characters)
     */
    static sanitizeString(str: string): string;
    /**
     * Validate URL
     */
    static validateUrl(url: string): {
        valid: boolean;
        error?: string;
    };
}
/**
 * Validation middleware factory
 */
export declare function validate(schema: Record<string, (value: any) => {
    valid: boolean;
    error?: string;
}>): (req: any, res: any, next: any) => any;
//# sourceMappingURL=validators.d.ts.map