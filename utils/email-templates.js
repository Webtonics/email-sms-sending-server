// utils/email-templates.js - HTML email templates

/**
 * Escape HTML to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  /**
   * Generate HTML for review request email
   * @param {Object} options - Email options
   * @param {string} options.customerName - Customer name
   * @param {string} options.businessName - Business name
   * @param {string} options.reviewLink - Review link URL
   * @param {Object} [options.customData] - Custom data for template
   * @returns {string} HTML content
   */
  function generateReviewRequestHtml({ customerName, businessName, reviewLink, customData = {} }) {
    // Escape all user-provided data to prevent XSS
    const safeCustomerName = escapeHtml(customerName);
    const safeBusinessName = escapeHtml(businessName);
    const safeReviewLink = escapeHtml(reviewLink);
    
    // Get current year for copyright
    const currentYear = new Date().getFullYear();
    
    // Default button text
    const buttonText = customData.buttonText || 'Leave a Review';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>We'd Love Your Feedback</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          /* Base styles */
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
          }
          
          /* Container styles */
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }
          
          /* Header styles */
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .header h2 {
            color: #1e3a8a;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }
          
          /* Content styles */
          .content {
            padding: 24px 20px;
          }
          
          /* Button styles */
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.3s;
          }
          
          .button:hover {
            background-color: #1e40af;
          }
          
          /* Footer styles */
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
          }
          
          /* Responsive adjustments */
          @media only screen and (max-width: 480px) {
            .container {
              padding: 10px;
            }
            
            .content {
              padding: 20px 15px;
            }
            
            .button {
              display: block;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>We'd Love Your Feedback!</h2>
          </div>
          <div class="content">
            <p>Hello ${safeCustomerName},</p>
            <p>Thank you for choosing ${safeBusinessName}. We hope you had a great experience!</p>
            <p>We value your feedback and would appreciate it if you could take a moment to share your experience with us.</p>
            
            <div class="button-container">
              <a href="${safeReviewLink}" class="button">${buttonText}</a>
            </div>
            
            <p>Your feedback helps us improve and better serve our customers.</p>
            <p>Thank you for your time!</p>
            <p>
              Best regards,<br>
              The ${safeBusinessName} Team
            </p>
          </div>
          <div class="footer">
            <p>This email was sent to you because you interacted with ${safeBusinessName}.</p>
            <p>© ${currentYear} ${safeBusinessName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  /**
   * Generate HTML for test email
   * @returns {string} HTML content
   */
  function generateTestEmailHtml() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RevBoost Email Test</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .content {
            padding: 20px 0;
          }
          .footer {
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 20px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>RevBoost Email Test</h2>
          </div>
          <div class="content">
            <p>This is a test email from RevBoost.</p>
            <p>If you received this email, it means that email sending is working properly!</p>
            <p>You can now use the email service to send review requests to your customers.</p>
            <hr>
            <p>Details:</p>
            <ul>
              <li>Sent: ${new Date().toLocaleString()}</li>
              <li>Email Service: Resend</li>
            </ul>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} RevBoost. This is an automated test message.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  module.exports = {
    generateReviewRequestHtml,
    generateTestEmailHtml,
    escapeHtml
  };