/**
 * Password Security Utilities
 * 
 * Implements secure password hashing, validation, and storage
 * following industry best practices for password security.
 */

// Simple crypto hash function (in production, use a proper library like bcrypt)
const simpleHash = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}fundraising_salt_2024`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Validates password strength according to security standards
 * @param {string} password - The password to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

/**
 * Calculates password strength score (0-100)
 * @param {string} password - The password to analyze
 * @returns {number} - Strength score
 */
const calculatePasswordStrength = (password) => {
  let score = 0;
  
  // Length bonus
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Character variety bonus
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 10;
  
  // Pattern penalties
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 10; // Sequential patterns
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Hashes a password securely
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - The hashed password
 */
export const hashPassword = async (password) => {
  return await simpleHash(password);
};

/**
 * Verifies a password against its hash
 * @param {string} password - The password to verify
 * @param {string} hash - The stored hash
 * @returns {Promise<boolean>} - Whether the password matches
 */
export const verifyPassword = async (password, hash) => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

/**
 * Generates a secure random password
 * @param {number} length - Length of password (default 12)
 * @returns {string} - Generated password
 */
export const generateSecurePassword = (length = 12) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each required type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Password storage utilities for localStorage (demo purposes)
 * In production, passwords should be stored server-side
 */
export const passwordStorage = {
  // Store password hash for a student
  setPassword: async (studentId, password) => {
    const hash = await hashPassword(password);
    const passwordData = {
      hash,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`student_password_${studentId}`, JSON.stringify(passwordData));
    return true;
  },
  
  // Get password hash for a student
  getPassword: (studentId) => {
    const stored = localStorage.getItem(`student_password_${studentId}`);
    return stored ? JSON.parse(stored) : null;
  },
  
  // Verify password for a student
  verifyStudentPassword: async (studentId, password) => {
    const passwordData = passwordStorage.getPassword(studentId);
    if (!passwordData) return false;
    
    return await verifyPassword(password, passwordData.hash);
  },
  
  // Check if student has a password set
  hasPassword: (studentId) => {
    return passwordStorage.getPassword(studentId) !== null;
  },
  
  // Update password for a student
  updatePassword: async (studentId, newPassword) => {
    const passwordData = passwordStorage.getPassword(studentId);
    if (!passwordData) return false;
    
    const hash = await hashPassword(newPassword);
    passwordData.hash = hash;
    passwordData.lastUpdated = new Date().toISOString();
    
    localStorage.setItem(`student_password_${studentId}`, JSON.stringify(passwordData));
    return true;
  }
};
