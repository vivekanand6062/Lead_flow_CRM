/**
 * LeadFlow CRM — Email Service (Resend + Development Simulator)
 *
 * Dispatches transactional emails using Resend REST API in production.
 * In development / testing mode without RESEND_API_KEY, safely logs and caches
 * outbound emails in an in-memory queue so automated tests and local developers
 * can inspect and verify reset links without external credentials.
 */

const fs = require('fs');
const path = require('path');

const DEV_EMAIL_FILE = path.join(__dirname, '../.dev-emails.json');

// In-memory queue for dev/testing email capture
let devEmailQueue = [];

/**
 * Format the branded HTML email template for password reset
 */
const getPasswordResetHtml = ({ name, resetUrl, expiresInMinutes = 15 }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your LeadFlow password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0E0C10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F5F1F3;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0E0C10; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #161219; border: 1px solid #2B232E; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #A855F7, #C08457, #E0A97E);"></td>
          </tr>
          
          <!-- Content Container -->
          <tr>
            <td style="padding: 36px 32px;">
              <!-- Brand Title -->
              <div style="font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: #FFFFFF; margin-bottom: 24px;">
                Lead<span style="color: #C08457;">Flow</span> <span style="font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; color: #A49B9F; margin-left: 6px; padding: 2px 6px; border: 1px solid #382D3D; border-radius: 4px;">CRM Security</span>
              </div>
              
              <h1 style="font-size: 20px; font-weight: 600; color: #F5F1F3; margin: 0 0 14px 0; line-height: 1.3;">
                Reset your LeadFlow password
              </h1>
              
              <p style="font-size: 14px; color: #C2B9BF; line-height: 1.6; margin: 0 0 20px 0;">
                Hello${name ? ` ${name}` : ''},<br/>
                We received a request to reset the password for your LeadFlow CRM account. Click the secure button below to set a new password.
              </p>
              
              <!-- Action Button -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 10px; background: linear-gradient(135deg, #C08457, #A86438);">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 13px 28px; font-size: 14px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 10px; letter-spacing: 0.2px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Security & Expiration Notice -->
              <div style="background-color: #1D1822; border-left: 3px solid #C08457; padding: 12px 14px; border-radius: 6px; margin: 24px 0; font-size: 12px; color: #A49B9F; line-height: 1.5;">
                <strong style="color: #F5F1F3;">Security Notice:</strong> This single-use reset link expires in <strong>${expiresInMinutes} minutes</strong>. If you did not request a password reset, you can safely disregard this email—your existing credentials remain secure.
              </div>
              
              <!-- Raw Link Fallback -->
              <p style="font-size: 11px; color: #7B7278; line-height: 1.5; margin: 24px 0 0 0; word-break: break-all;">
                If the button above does not work, copy and paste this link into your browser:<br/>
                <a href="${resetUrl}" style="color: #C08457; text-decoration: underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 18px 32px; background-color: #110E14; border-top: 1px solid #231C26; text-align: center; font-size: 11px; color: #6D646B;">
              LeadFlow CRM • Enterprise B2B Lead & Pipeline Management<br/>
              Protected by end-to-end cryptographic hashing and tenant isolation.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Send password reset email
 *
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} [params.name] - Recipient name
 * @param {string} params.token - Raw 32-byte cryptographic token
 * @param {string} [params.frontendUrl] - Override frontend URL if needed
 * @returns {Promise<{ success: boolean, simulated?: boolean, id?: string }>}
 */
const sendPasswordResetEmail = async ({ to, name, token, frontendUrl }) => {
  const baseUrl = frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl.replace(/\/+$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
  const fromEmail = process.env.FROM_EMAIL || 'LeadFlow Security <onboarding@resend.dev>';
  const resendApiKey = process.env.RESEND_API_KEY;
  const isProduction = process.env.NODE_ENV === 'production';

  const subject = 'Reset your LeadFlow password';
  const textContent = `Reset your LeadFlow password\n\nHello${name ? ` ${name}` : ''},\n\nWe received a request to reset your LeadFlow CRM account password. Use the following link within 15 minutes to reset it:\n\n${resetUrl}\n\nThis single-use link will expire in 15 minutes. If you did not request this, please ignore this email.\n\nLeadFlow CRM Security`;
  const htmlContent = getPasswordResetHtml({ name, resetUrl, expiresInMinutes: 15 });

  // If RESEND_API_KEY is configured, dispatch via Resend REST API
  if (resendApiKey && resendApiKey.startsWith('re_')) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: subject,
          html: htmlContent,
          text: textContent
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('[LeadFlow Email Service] Resend API error:', data);
        // Do not leak internal provider error to caller
        return { success: false, error: data.message || 'Email delivery failed' };
      }

      return { success: true, id: data.id };
    } catch (error) {
      console.error('[LeadFlow Email Service] Error sending email via Resend:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Development & Testing Mode Email Simulator
  const devEntry = {
    to,
    name,
    subject,
    resetUrl,
    token, // captured for test inspection
    sentAt: new Date().toISOString()
  };
  devEmailQueue.push(devEntry);

  try {
    let fileEmails = [];
    if (fs.existsSync(DEV_EMAIL_FILE)) {
      try {
        fileEmails = JSON.parse(fs.readFileSync(DEV_EMAIL_FILE, 'utf8'));
      } catch (e) {
        fileEmails = [];
      }
    }
    fileEmails.push(devEntry);
    fs.writeFileSync(DEV_EMAIL_FILE, JSON.stringify(fileEmails, null, 2), 'utf8');
  } catch (err) {
    // Ignore file write errors
  }

  if (!isProduction) {
    console.log(`\n======================================================`);
    console.log(`[LeadFlow Email Service - DEV SIMULATOR]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`(Notice: Set RESEND_API_KEY in .env for live Resend delivery)`);
    console.log(`======================================================\n`);
  }

  return { success: true, simulated: true };
};

/**
 * Dev/Test Helper: Get the most recent simulated email
 */
const getLastDevEmail = () => {
  try {
    if (fs.existsSync(DEV_EMAIL_FILE)) {
      const content = fs.readFileSync(DEV_EMAIL_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[parsed.length - 1];
      }
    }
  } catch (err) {
    // Fall back to in-memory
  }
  return devEmailQueue.length > 0 ? devEmailQueue[devEmailQueue.length - 1] : null;
};

/**
 * Dev/Test Helper: Get all simulated emails
 */
const getAllDevEmails = () => {
  try {
    if (fs.existsSync(DEV_EMAIL_FILE)) {
      const content = fs.readFileSync(DEV_EMAIL_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {}
  return [...devEmailQueue];
};

/**
 * Dev/Test Helper: Clear captured emails
 */
const clearDevEmails = () => {
  devEmailQueue = [];
  try {
    if (fs.existsSync(DEV_EMAIL_FILE)) {
      fs.writeFileSync(DEV_EMAIL_FILE, '[]', 'utf8');
    }
  } catch (err) {}
};

module.exports = {
  sendPasswordResetEmail,
  getLastDevEmail,
  getAllDevEmails,
  clearDevEmails
};
