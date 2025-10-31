export const GOOGLE_SHEETS_CONFIG = {
  SHEET_ID: process.env.REACT_APP_GOOGLE_SHEET_ID,
  API_KEY: process.env.REACT_APP_GOOGLE_API_KEY,
  STUDENTS_RANGE: 'Students!A2:M1000', // Updated to include RegisteredDate (L) and RegistrationStatus (M)
  ORDERS_RANGE: 'Orders!A2:I1000',
  REFERRALS_RANGE: 'Referrals!A2:L1000', // Updated to include ReferrerID (K) and ReferrerType (L)
  PROGRAMS_RANGE: 'Programs!A2:S1000' // Updated to include all role/permission columns (A-S)
};