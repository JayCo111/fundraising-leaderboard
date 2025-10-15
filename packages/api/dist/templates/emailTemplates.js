"use strict";
// packages/api/src/templates/emailTemplates.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailTemplates = void 0;
class EmailTemplates {
    /**
     * Magic link login email template
     */
    static magicLinkEmail(data) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your SportsRaiser Login Link</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">
              🏆 SportsRaiser
            </h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">
              Hi ${data.firstName}! 👋
            </h2>

            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
              Click the button below to securely log in to your fundraising dashboard:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${data.magicLink}"
                 style="display: inline-block;
                        background: linear-gradient(to right, #0891b2, #2563eb);
                        color: #ffffff;
                        padding: 16px 32px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                        font-size: 16px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                🔐 Log In to SportsRaiser
              </a>
            </div>

            <!-- Info Box -->
            <div style="background-color: #f0f9ff;
                        border-left: 4px solid #0891b2;
                        padding: 15px 20px;
                        margin: 30px 0;
                        border-radius: 4px;">
              <p style="color: #0c4a6e; margin: 0; font-size: 14px;">
                <strong>Team:</strong> ${data.team}<br />
                ${data.program ? `<strong>Program:</strong> ${data.program}` : ''}
              </p>
            </div>

            <!-- Security Notice -->
            <div style="background-color: #fef3c7;
                        border-left: 4px solid #f59e0b;
                        padding: 15px 20px;
                        margin: 20px 0;
                        border-radius: 4px;">
              <p style="color: #92400e; margin: 0; font-size: 13px;">
                ⚠️ <strong>Security Notice:</strong> This link expires in 15 minutes and can only be used once.
                If you didn't request this, please ignore this email.
              </p>
            </div>

            <!-- Alternative Link -->
            <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 25px 0 0 0;">
              Button not working? Copy and paste this link into your browser:<br />
              <a href="${data.magicLink}"
                 style="color: #0891b2; word-break: break-all;">
                ${data.magicLink}
              </a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
              © ${new Date().getFullYear()} SportsRaiser. All rights reserved.
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 10px 0 0 0; text-align: center;">
              Need help? Contact your fundraising coordinator.
            </p>
          </div>

        </div>
      </body>
      </html>
    `;
    }
    /**
     * Welcome email template for new students
     */
    static welcomeEmail(data) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SportsRaiser!</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 32px;">
              🎉 Welcome to SportsRaiser!
            </h1>
            <p style="color: #e0f2fe; margin: 0; font-size: 16px;">
              Let's make this fundraiser amazing!
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">
              Hi ${data.firstName}! 👋
            </h2>

            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
              Welcome to the <strong>${data.team}</strong> fundraising team! We're excited to have you on board.
            </p>

            <!-- Personal Link Section -->
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a);
                        padding: 25px;
                        border-radius: 12px;
                        margin: 30px 0;
                        border: 2px solid #f59e0b;">
              <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">
                🔗 Your Personal Fundraising Link
              </h3>
              <p style="color: #78350f; margin: 0 0 15px 0; font-size: 14px;">
                Share this link with family, friends, and supporters:
              </p>
              <a href="${data.personalLink}"
                 style="display: block;
                        background-color: #ffffff;
                        color: #0891b2;
                        padding: 12px;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: bold;
                        text-align: center;
                        word-break: break-all;">
                ${data.personalLink}
              </a>
            </div>

            ${data.qrCodeUrl ? `
            <!-- QR Code Section -->
            <div style="text-align: center; margin: 30px 0;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">
                📱 Or Share Your QR Code
              </h3>
              <img src="${data.qrCodeUrl}"
                   alt="QR Code"
                   style="max-width: 200px;
                          border-radius: 12px;
                          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />
            </div>
            ` : ''}

            <!-- Features List -->
            <div style="background-color: #f0fdf4;
                        padding: 25px;
                        border-radius: 12px;
                        margin: 30px 0;
                        border-left: 4px solid #10b981;">
              <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">
                🌟 What You Can Do
              </h3>
              <ul style="color: #047857; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Track your fundraising progress in real-time</li>
                <li>Compete on team and individual leaderboards</li>
                <li>View detailed statistics and achievements</li>
                <li>Add referrals to earn bonus points</li>
                <li>Share your personal link easily</li>
              </ul>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${process.env.REACT_APP_URL || 'https://yourdomain.com'}"
                 style="display: inline-block;
                        background: linear-gradient(to right, #0891b2, #2563eb);
                        color: #ffffff;
                        padding: 16px 32px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                        font-size: 16px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                🚀 Go to Dashboard
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
              © ${new Date().getFullYear()} SportsRaiser. All rights reserved.
            </p>
          </div>

        </div>
      </body>
      </html>
    `;
    }
}
exports.EmailTemplates = EmailTemplates;
