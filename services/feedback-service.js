// services/feedback-service.js

const emailService = require('./email-service');
const logger = require('../utils/logger');
const { escapeHtml } = require('../utils/email-templates');

/**
 * Service for handling customer feedback
 */
class FeedbackService {
  /**
   * Send feedback notification to business owner
   * @param {Object} options - Email options
   * @param {string} options.businessId - Business ID
   * @param {string} options.toEmail - Business owner's email address
   * @param {string} options.businessName - Business name
   * @param {number} options.rating - Customer rating (1-5)
   * @param {string} options.feedback - Customer feedback text
   * @param {string} options.customerName - Customer name
   * @returns {Promise<Object>} The email service response
   */
  async sendFeedbackNotification({ businessId, toEmail, businessName, rating, feedback, customerName }) {
    try {
      logger.info(`Sending feedback notification to ${toEmail} for business ${businessId}`);
      
      const subject = `⚠️ Negative Review Blocked - Customer Feedback (${rating}/5)`;
      
      // Create HTML content for the email
      const htmlContent = this.generateFeedbackEmailHtml({
        businessName,
        rating,
        feedback,
        customerName
      });
      
      // Build the email payload
      const emailData = {
        from: `${emailService.fromName} <${emailService.fromEmail}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent,
        tags: [
          { name: 'type', value: 'feedback_notification' },
          { name: 'business_id', value: businessId },
          { name: 'rating', value: rating.toString() }
        ]
      };
      
      // Send the email
      const response = await emailService.sendEmail(emailData);
      
      logger.info(`Feedback notification sent successfully to ${toEmail}`);
      return response;
    } catch (error) {
      logger.error(`Failed to send feedback notification: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generate HTML content for feedback notification email
   * @param {Object} options - Email options
   * @param {string} options.businessName - Business name
   * @param {number} options.rating - Customer rating (1-5)
   * @param {string} options.feedback - Customer feedback text
   * @param {string} options.customerName - Customer name
   * @returns {string} HTML content
   */
  generateFeedbackEmailHtml({ businessName, rating, feedback, customerName }) {
    // Escape all user-provided data to prevent XSS
    const safeBusinessName = escapeHtml(businessName);
    const safeFeedback = escapeHtml(feedback);
    const safeCustomerName = escapeHtml(customerName);
    
    // Get current year for copyright
    const currentYear = new Date().getFullYear();
    
    // Generate star rating HTML
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        starsHtml += '★'; // Filled star
      } else {
        starsHtml += '☆'; // Empty star
      }
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Customer Feedback Alert</title>
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
            color: #991b1b;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }
          
          /* Content styles */
          .content {
            padding: 24px 20px;
          }
          
          .rating {
            font-size: 24px;
            color: #f59e0b;
            margin: 15px 0;
          }
          
          .feedback-box {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
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
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Customer Feedback Alert</h2>
          </div>
          <div class="content">
            <p>Hello ${safeBusinessName} Team,</p>
            <p>A customer has left feedback that was <strong>not published publicly</strong>. This feedback has been blocked from appearing on review sites.</p>
            
            <p><strong>Customer:</strong> ${safeCustomerName}</p>
            <div class="rating">
              <strong>Rating:</strong> ${starsHtml} (${rating}/5)
            </div>
            
            <p><strong>Customer Feedback:</strong></p>
            <div class="feedback-box">
              ${safeFeedback}
            </div>
            
            <p>This feedback was captured by RevBoost to protect your online reputation. We recommend addressing this feedback directly with the customer.</p>
            
            <p>
              Best regards,<br>
              RevBoost Team
            </p>
          </div>
          <div class="footer">
            <p>This is an automated notification from RevBoost.</p>
            <p>© ${currentYear} RevBoost. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new FeedbackService();