// packages/api/src/utils/constants.ts

/**
 * Application-wide constants
 */

export const AUTH_CONSTANTS = {
  // Token expiration times (in milliseconds)
  MAGIC_LINK_EXPIRY_MS: 15 * 60 * 1000, // 15 minutes
  JWT_EXPIRY: '24h', // 24 hours
  REFRESH_TOKEN_EXPIRY: '7d', // 7 days

  // Token types
  TOKEN_TYPE: {
    MAGIC_LINK: 'magic_link',
    JWT: 'jwt',
    REFRESH: 'refresh',
  },
} as const;

export const GOOGLE_SHEETS_RANGES = {
  STUDENTS: 'A2:K1000',
  ORDERS: 'A2:I1000',
  REFERRALS: 'A2:J1000',
  AUTH_TOKENS: 'A2:E1000',
  PROGRAMS: 'A2:B1000',
} as const;

export const GOOGLE_SHEETS_COLUMNS = {
  STUDENTS: {
    STUDENT_ID: 0,
    FIRST_NAME: 1,
    LAST_NAME: 2,
    TEAM: 3,
    GOAL: 4,
    PARENT_EMAIL: 5,
    PERSONAL_LINK: 6,
    QR_URL: 7,
    AVATAR_URL: 8,
    PROGRAM: 9,
    QR_LINK: 10,
  },
  ORDERS: {
    TIMESTAMP: 0,
    ORDER_ID: 1,
    BUYER_NAME: 2,
    BUYER_EMAIL: 3,
    BUYER_PHONE: 4,
    QUANTITY: 5,
    TOTAL_PAID: 6,
    STUDENT_ID: 7,
    STATUS: 8,
  },
  REFERRALS: {
    REFERRAL_ID: 0,
    STUDENT_ID: 1,
    REFERRAL_NAME: 2,
    REFERRAL_EMAIL: 3,
    REFERRAL_PHONE: 4,
    ORGANIZATION: 5,
    STAGE: 6,
    POINTS: 7,
    DATE_ADDED: 8,
    LAST_UPDATED: 9,
  },
  AUTH_TOKENS: {
    TOKEN: 0,
    EMAIL: 1,
    EXPIRES_AT: 2,
    CREATED_AT: 3,
    USED: 4,
  },
} as const;

export const REFERRAL_STAGES = {
  CONTACTED: 'Contacted',
  INTERESTED: 'Interested',
  MEETING_SCHEDULED: 'Meeting Scheduled',
  SIGNED_UP: 'Signed Up',
} as const;

export const REFERRAL_POINTS = {
  [REFERRAL_STAGES.CONTACTED]: 10,
  [REFERRAL_STAGES.INTERESTED]: 25,
  [REFERRAL_STAGES.MEETING_SCHEDULED]: 50,
  [REFERRAL_STAGES.SIGNED_UP]: 100,
} as const;

export const ORDER_STATUS = {
  PAID: 'Paid',
  PENDING: 'Pending',
  REFUNDED: 'Refunded',
  CANCELLED: 'Cancelled',
} as const;

export const USER_ROLES = {
  OWNER: 'OWNER',
  CEO: 'CEO',
  REGIONAL_DIRECTOR: 'REGIONAL_DIRECTOR',
  STATE_DIRECTOR: 'STATE_DIRECTOR',
  TERRITORY_DIRECTOR: 'TERRITORY_DIRECTOR',
  SALES_REP: 'SALES_REP',
  ORG_OWNER: 'ORG_OWNER',
  PROGRAM_DIRECTOR: 'PROGRAM_DIRECTOR',
  HEAD_COACH: 'HEAD_COACH',
  PARENT_STUDENT: 'PARENT_STUDENT',
} as const;

export const MEDAL_EMOJIS = {
  GOLD: '🥇',
  SILVER: '🥈',
  BRONZE: '🥉',
} as const;

export const EMAIL_SUBJECTS = {
  MAGIC_LINK: 'Your SportsRaiser Login Link',
  WELCOME: 'Welcome to SportsRaiser!',
  ORDER_CONFIRMATION: 'Order Confirmation',
  GOAL_ACHIEVED: 'Congratulations! Goal Achieved!',
  WEEKLY_SUMMARY: 'Your Weekly Fundraising Summary',
} as const;

export const ERROR_MESSAGES = {
  // Authentication
  EMAIL_NOT_FOUND: 'Email not found. Please check your email address.',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_ALREADY_USED: 'This login link has already been used',
  TOKEN_EXPIRED: 'This login link has expired. Please request a new one.',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to perform this action',

  // Students
  STUDENT_NOT_FOUND: 'Student not found',
  STUDENT_ALREADY_EXISTS: 'A student with this email already exists',

  // Orders
  ORDER_NOT_FOUND: 'Order not found',
  INVALID_ORDER_DATA: 'Invalid order data',

  // Referrals
  REFERRAL_NOT_FOUND: 'Referral not found',
  INVALID_REFERRAL_STAGE: 'Invalid referral stage',

  // General
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred',
  VALIDATION_ERROR: 'Validation error',
  GOOGLE_SHEETS_ERROR: 'Failed to connect to Google Sheets',
  EMAIL_SEND_ERROR: 'Failed to send email',
} as const;

export const SUCCESS_MESSAGES = {
  MAGIC_LINK_SENT: 'Magic link sent successfully. Check your email!',
  LOGIN_SUCCESS: 'Successfully logged in',
  LOGOUT_SUCCESS: 'Successfully logged out',
  ORDER_CREATED: 'Order created successfully',
  REFERRAL_CREATED: 'Referral added successfully',
  REFERRAL_UPDATED: 'Referral updated successfully',
  STUDENT_CREATED: 'Student added successfully',
  STUDENT_UPDATED: 'Student updated successfully',
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_MAX_REQUESTS: 5, // Stricter for auth endpoints
} as const;

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\d\s\-\(\)\+]+$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_EMAIL_LENGTH: 255,
  MAX_NAME_LENGTH: 100,
  MIN_ORDER_AMOUNT: 0.01,
  MAX_ORDER_AMOUNT: 10000,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
