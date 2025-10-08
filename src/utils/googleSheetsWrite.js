/**
 * Google Sheets Write Utility
 * 
 * Handles writing data to Google Sheets using Google Apps Script web app
 * as a proxy to avoid CORS issues and authentication complexity.
 */

export const GOOGLE_SHEETS_WRITE_CONFIG = {
  // Google Apps Script web app URL - replace with your deployed script URL
  WEB_APP_URL: process.env.REACT_APP_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
  
  // Sheet configuration
  SHEET_ID: process.env.REACT_APP_GOOGLE_SHEET_ID,
  REFERRALS_RANGE: 'Referrals!A:J'
};

/**
 * Saves a new referral to Google Sheets
 * @param {Object} referralData - The referral data to save
 * @returns {Promise<Object>} - Success/error response
 */
export const saveReferral = async (referralData) => {
  try {
    const response = await fetch(GOOGLE_SHEETS_WRITE_CONFIG.WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'addReferral',
        sheetId: GOOGLE_SHEETS_WRITE_CONFIG.SHEET_ID,
        data: referralData
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      throw new Error(result.error || 'Failed to save referral');
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to save referral. Please try again.'
    };
  }
};

/**
 * Updates an existing referral in Google Sheets
 * @param {string} referralId - The ID of the referral to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} - Success/error response
 */
export const updateReferral = async (referralId, updateData) => {
  try {
    const response = await fetch(GOOGLE_SHEETS_WRITE_CONFIG.WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateReferral',
        sheetId: GOOGLE_SHEETS_WRITE_CONFIG.SHEET_ID,
        referralId,
        data: updateData
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      throw new Error(result.error || 'Failed to update referral');
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update referral. Please try again.'
    };
  }
};

/**
 * Generates a unique referral ID
 * @returns {string} - Unique referral ID
 */
export const generateReferralId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  return `REF-${timestamp}-${random}`.toUpperCase();
};

/**
 * Validates referral form data
 * @param {Object} formData - The form data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateReferralForm = (formData) => {
  const errors = {};
  
  if (!formData.referralName || formData.referralName.trim() === '') {
    errors.referralName = 'Name is required';
  }
  
  if (!formData.referralEmail || formData.referralEmail.trim() === '') {
    errors.referralEmail = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.referralEmail)) {
    errors.referralEmail = 'Please enter a valid email address';
  }
  
  if (!formData.referralPhone || formData.referralPhone.trim() === '') {
    errors.referralPhone = 'Phone number is required';
  }
  
  if (!formData.organization || formData.organization.trim() === '') {
    errors.organization = 'Organization is required';
  }
  
  if (!formData.stage || formData.stage.trim() === '') {
    errors.stage = 'Stage is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
