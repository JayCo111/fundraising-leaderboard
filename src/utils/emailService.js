/**
 * Email Service Utility
 * 
 * Handles sending personalized registration emails to parents
 * with pre-populated student data and personalized links.
 */

// Email service configuration
const EMAIL_CONFIG = {
  // In production, use a real email service like SendGrid, Mailgun, or AWS SES
  SERVICE_URL: process.env.REACT_APP_EMAIL_SERVICE_URL || 'https://api.emailjs.com/api/v1.0/email/send',
  SERVICE_ID: process.env.REACT_APP_EMAILJS_SERVICE_ID || 'your_service_id',
  TEMPLATE_ID: process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'your_template_id',
  PUBLIC_KEY: process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'your_public_key'
};

/**
 * Creates a personalized registration email template
 * @param {Object} studentData - Student information from Google Sheets
 * @param {string} registrationLink - Personalized registration URL
 * @returns {Object} - Email template data
 */
export const createRegistrationEmail = (studentData, registrationLink) => {
  const studentName = `${studentData.FirstName} ${studentData.LastName}`;
  const parentEmail = studentData.ParentEmail;
  const personalLink = studentData.PersonalLink;
  const qrCodeUrl = studentData.QR_URL;
  
  return {
    to_email: parentEmail,
    to_name: `Parent of ${studentName}`,
    student_name: studentName,
    first_name: studentData.FirstName,
    last_name: studentData.LastName,
    parent_email: parentEmail,
    registration_link: registrationLink,
    personal_link: personalLink,
    qr_code_url: qrCodeUrl,
    subject: `🎉 Welcome to the Fundraising Leaderboard - ${studentName}!`,
    message: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 20px; border-radius: 15px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #06b6d4; font-size: 28px; margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px;">
              🏆 Fundraising Leaderboard
            </h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Welcome to your personalized fundraising dashboard!</p>
          </div>
          
          <!-- Welcome Message -->
          <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #06b6d4;">
            <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 24px;">🎉 Exciting News!</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
              Welcome to the <strong>Fundraising Leaderboard</strong>! We're thrilled to have <strong>${studentName}</strong> 
              join our fundraising team. This is going to be an amazing journey filled with fun, competition, and incredible achievements!
            </p>
          </div>
          
          <!-- Registration Section -->
          <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px; border: 2px solid #e2e8f0;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">🔐 Complete Your Registration</h3>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
              To access your personalized leaderboard and start tracking progress, please complete your registration using the secure link below:
            </p>
            <div style="text-align: center;">
              <a href="${registrationLink}" 
                 style="background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);">
                🚀 Complete Registration
              </a>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin: 15px 0 0 0; text-align: center;">
              This link is personalized for ${studentName} and will pre-fill your information securely.
            </p>
          </div>
          
          <!-- Student Information -->
          <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb; margin-bottom: 25px;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">👤 Student Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong style="color: #374151;">Student Name:</strong><br>
                <span style="color: #6b7280;">${studentName}</span>
              </div>
              <div>
                <strong style="color: #374151;">Parent Email:</strong><br>
                <span style="color: #6b7280;">${parentEmail}</span>
              </div>
            </div>
          </div>
          
          <!-- Personal Links -->
          <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">🔗 Your Personal Fundraising Links</h3>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #92400e;">Personal Fundraising Link:</strong><br>
              <a href="${personalLink}" style="color: #1e40af; text-decoration: none; word-break: break-all;">
                ${personalLink}
              </a>
            </div>
            
            ${qrCodeUrl ? `
            <div style="text-align: center; margin-top: 20px;">
              <strong style="color: #92400e; display: block; margin-bottom: 10px;">📱 QR Code for Easy Sharing:</strong>
              <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 150px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            </div>
            ` : ''}
          </div>
          
          <!-- Features -->
          <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 18px;">🌟 What You Can Do</h3>
            <ul style="color: #374151; padding-left: 20px; margin: 0;">
              <li style="margin-bottom: 8px;">📊 Track fundraising progress in real-time</li>
              <li style="margin-bottom: 8px;">🏆 Compete on team and individual leaderboards</li>
              <li style="margin-bottom: 8px;">📈 View detailed statistics and achievements</li>
              <li style="margin-bottom: 8px;">👥 See how your team is performing</li>
              <li style="margin-bottom: 8px;">🎯 Set and track fundraising goals</li>
              <li style="margin-bottom: 8px;">📱 Share your personal fundraising link easily</li>
            </ul>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              Need help? Contact your fundraising coordinator.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This email was sent to ${parentEmail} for ${studentName}'s fundraising account.
            </p>
          </div>
        </div>
      </div>
    `
  };
};

/**
 * Sends a registration email to the parent
 * @param {Object} studentData - Student information
 * @param {string} registrationLink - Personalized registration URL
 * @returns {Promise<Object>} - Success/error response
 */
export const sendRegistrationEmail = async (studentData, registrationLink) => {
  try {
    const emailData = createRegistrationEmail(studentData, registrationLink);
    
    // For demo purposes, we'll simulate sending the email
    // In production, integrate with a real email service
    console.log('📧 Registration Email Prepared:', {
      to: emailData.to_email,
      subject: emailData.subject,
      student: `${emailData.first_name} ${emailData.last_name}`,
      registrationLink: emailData.registration_link,
      personalLink: emailData.personal_link,
      qrCodeUrl: emailData.qr_code_url
    });
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, replace this with actual email service call:
    /*
    const response = await fetch(EMAIL_CONFIG.SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAIL_CONFIG.SERVICE_ID,
        template_id: EMAIL_CONFIG.TEMPLATE_ID,
        user_id: EMAIL_CONFIG.PUBLIC_KEY,
        template_params: emailData
      })
    });
    
    if (!response.ok) {
      throw new Error(`Email service error: ${response.status}`);
    }
    */
    
    return {
      success: true,
      message: `Registration email sent successfully to ${emailData.to_email}`,
      emailData
    };
    
  } catch (error) {
    console.error('Error sending registration email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send registration email'
    };
  }
};

/**
 * Generates a personalized registration link
 * @param {string} studentId - Student ID
 * @param {Object} studentData - Student data
 * @returns {string} - Personalized registration URL
 */
export const generateRegistrationLink = (studentId, studentData) => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    studentId: studentId,
    firstName: studentData.FirstName,
    lastName: studentData.LastName,
    email: studentData.ParentEmail,
    mode: 'register'
  });
  
  return `${baseUrl}/register?${params.toString()}`;
};

/**
 * Extracts student data from URL parameters
 * @returns {Object|null} - Student data or null if not found
 */
export const getStudentDataFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('mode') === 'register' && urlParams.get('studentId')) {
    return {
      studentId: urlParams.get('studentId'),
      firstName: urlParams.get('firstName'),
      lastName: urlParams.get('lastName'),
      email: urlParams.get('email')
    };
  }
  
  return null;
};
