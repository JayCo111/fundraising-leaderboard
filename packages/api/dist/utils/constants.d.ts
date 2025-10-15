/**
 * Application-wide constants
 */
export declare const AUTH_CONSTANTS: {
    readonly MAGIC_LINK_EXPIRY_MS: number;
    readonly JWT_EXPIRY: "24h";
    readonly REFRESH_TOKEN_EXPIRY: "7d";
    readonly TOKEN_TYPE: {
        readonly MAGIC_LINK: "magic_link";
        readonly JWT: "jwt";
        readonly REFRESH: "refresh";
    };
};
export declare const GOOGLE_SHEETS_RANGES: {
    readonly STUDENTS: "A2:K1000";
    readonly ORDERS: "A2:I1000";
    readonly REFERRALS: "A2:J1000";
    readonly AUTH_TOKENS: "A2:E1000";
    readonly PROGRAMS: "A2:B1000";
};
export declare const GOOGLE_SHEETS_COLUMNS: {
    readonly STUDENTS: {
        readonly STUDENT_ID: 0;
        readonly FIRST_NAME: 1;
        readonly LAST_NAME: 2;
        readonly TEAM: 3;
        readonly GOAL: 4;
        readonly PARENT_EMAIL: 5;
        readonly PERSONAL_LINK: 6;
        readonly QR_URL: 7;
        readonly AVATAR_URL: 8;
        readonly PROGRAM: 9;
        readonly QR_LINK: 10;
    };
    readonly ORDERS: {
        readonly TIMESTAMP: 0;
        readonly ORDER_ID: 1;
        readonly BUYER_NAME: 2;
        readonly BUYER_EMAIL: 3;
        readonly BUYER_PHONE: 4;
        readonly QUANTITY: 5;
        readonly TOTAL_PAID: 6;
        readonly STUDENT_ID: 7;
        readonly STATUS: 8;
    };
    readonly REFERRALS: {
        readonly REFERRAL_ID: 0;
        readonly STUDENT_ID: 1;
        readonly REFERRAL_NAME: 2;
        readonly REFERRAL_EMAIL: 3;
        readonly REFERRAL_PHONE: 4;
        readonly ORGANIZATION: 5;
        readonly STAGE: 6;
        readonly POINTS: 7;
        readonly DATE_ADDED: 8;
        readonly LAST_UPDATED: 9;
    };
    readonly AUTH_TOKENS: {
        readonly TOKEN: 0;
        readonly EMAIL: 1;
        readonly EXPIRES_AT: 2;
        readonly CREATED_AT: 3;
        readonly USED: 4;
    };
};
export declare const REFERRAL_STAGES: {
    readonly CONTACTED: "Contacted";
    readonly INTERESTED: "Interested";
    readonly MEETING_SCHEDULED: "Meeting Scheduled";
    readonly SIGNED_UP: "Signed Up";
};
export declare const REFERRAL_POINTS: {
    readonly Contacted: 10;
    readonly Interested: 25;
    readonly "Meeting Scheduled": 50;
    readonly "Signed Up": 100;
};
export declare const ORDER_STATUS: {
    readonly PAID: "Paid";
    readonly PENDING: "Pending";
    readonly REFUNDED: "Refunded";
    readonly CANCELLED: "Cancelled";
};
export declare const USER_ROLES: {
    readonly OWNER: "OWNER";
    readonly CEO: "CEO";
    readonly REGIONAL_DIRECTOR: "REGIONAL_DIRECTOR";
    readonly STATE_DIRECTOR: "STATE_DIRECTOR";
    readonly TERRITORY_DIRECTOR: "TERRITORY_DIRECTOR";
    readonly SALES_REP: "SALES_REP";
    readonly ORG_OWNER: "ORG_OWNER";
    readonly PROGRAM_DIRECTOR: "PROGRAM_DIRECTOR";
    readonly HEAD_COACH: "HEAD_COACH";
    readonly PARENT_STUDENT: "PARENT_STUDENT";
};
export declare const MEDAL_EMOJIS: {
    readonly GOLD: "🥇";
    readonly SILVER: "🥈";
    readonly BRONZE: "🥉";
};
export declare const EMAIL_SUBJECTS: {
    readonly MAGIC_LINK: "Your SportsRaiser Login Link";
    readonly WELCOME: "Welcome to SportsRaiser!";
    readonly ORDER_CONFIRMATION: "Order Confirmation";
    readonly GOAL_ACHIEVED: "Congratulations! Goal Achieved!";
    readonly WEEKLY_SUMMARY: "Your Weekly Fundraising Summary";
};
export declare const ERROR_MESSAGES: {
    readonly EMAIL_NOT_FOUND: "Email not found. Please check your email address.";
    readonly INVALID_TOKEN: "Invalid or expired token";
    readonly TOKEN_ALREADY_USED: "This login link has already been used";
    readonly TOKEN_EXPIRED: "This login link has expired. Please request a new one.";
    readonly UNAUTHORIZED: "Authentication required";
    readonly FORBIDDEN: "You do not have permission to perform this action";
    readonly STUDENT_NOT_FOUND: "Student not found";
    readonly STUDENT_ALREADY_EXISTS: "A student with this email already exists";
    readonly ORDER_NOT_FOUND: "Order not found";
    readonly INVALID_ORDER_DATA: "Invalid order data";
    readonly REFERRAL_NOT_FOUND: "Referral not found";
    readonly INVALID_REFERRAL_STAGE: "Invalid referral stage";
    readonly INTERNAL_SERVER_ERROR: "An unexpected error occurred";
    readonly VALIDATION_ERROR: "Validation error";
    readonly GOOGLE_SHEETS_ERROR: "Failed to connect to Google Sheets";
    readonly EMAIL_SEND_ERROR: "Failed to send email";
};
export declare const SUCCESS_MESSAGES: {
    readonly MAGIC_LINK_SENT: "Magic link sent successfully. Check your email!";
    readonly LOGIN_SUCCESS: "Successfully logged in";
    readonly LOGOUT_SUCCESS: "Successfully logged out";
    readonly ORDER_CREATED: "Order created successfully";
    readonly REFERRAL_CREATED: "Referral added successfully";
    readonly REFERRAL_UPDATED: "Referral updated successfully";
    readonly STUDENT_CREATED: "Student added successfully";
    readonly STUDENT_UPDATED: "Student updated successfully";
};
export declare const RATE_LIMIT: {
    readonly WINDOW_MS: number;
    readonly MAX_REQUESTS: 100;
    readonly AUTH_WINDOW_MS: number;
    readonly AUTH_MAX_REQUESTS: 5;
};
export declare const VALIDATION_RULES: {
    readonly EMAIL_REGEX: RegExp;
    readonly PHONE_REGEX: RegExp;
    readonly MIN_PASSWORD_LENGTH: 8;
    readonly MAX_EMAIL_LENGTH: 255;
    readonly MAX_NAME_LENGTH: 100;
    readonly MIN_ORDER_AMOUNT: 0.01;
    readonly MAX_ORDER_AMOUNT: 10000;
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly SERVICE_UNAVAILABLE: 503;
};
//# sourceMappingURL=constants.d.ts.map