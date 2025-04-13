// services/email-service.js - Service for email functionality using Resend

const axios = require('axios');
const logger = require('../utils/logger');
const { generateReviewRequestHtml, generateTestEmailHtml } = require('../utils/email-templates');

/**
 * Service for sending emails using Resend
 */
class EmailService {
  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.EMAIL_FROM_ADDRESS;
    this.fromName = process.env.EMAIL_FROM_NAME;
    
    if (!this.apiKey) {
      logger.error('RESEND_API_KEY is missing. Email functionality will not work.');
    }
    
    if (!this.fromEmail) {
      logger.warn('EMAIL_FROM_ADDRESS is missing. Using default address.');
      this.fromEmail = 'reviews@revboostapp.com';
    }
    
    if (!this.fromName) {
      logger.warn('EMAIL_FROM_NAME is missing. Using default name.');
      this.fromName = 'RevBoost';
    }
  }
  
  /**
   * Send a review request email
   * @param {Object} options - Email options
   * @param {string} options.toEmail - Recipient email address
   * @param {string} options.customerName - Customer name
   * @param {string} options.businessName - Business name
   * @param {string} options.reviewLink - Review link URL
   * @param {string} [options.replyTo] - Reply-to email address
   * @param {Object} [options.customData] - Custom data for template
   * @returns {Promise<Object>} The Resend API response
   */
  async sendReviewRequest({ toEmail, customerName, businessName, reviewLink, replyTo, customData }) {
    try {
      logger.info(`Sending review request email to ${toEmail}`);
      
      // Generate HTML content
      const htmlContent = generateReviewRequestHtml({
        customerName,
        businessName,
        reviewLink,
        customData,
      });
      
      // Build the email payload
      const emailData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: toEmail,
        subject: `We'd love to hear your feedback on ${businessName}`,
        html: htmlContent,
        tags: [
          { name: 'type', value: 'review_request' },
          { name: 'business', value: businessName },
        ]
      };
      
      // Add reply-to if provided
      if (replyTo) {
        emailData.reply_to = replyTo;
      }
      
      // Send the email
      const response = await this.sendEmail(emailData);
      
      logger.info(`Email sent successfully to ${toEmail}`);
      return response;
    } catch (error) {
      logger.error(`Failed to send review request email: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Send a test email
   * @param {string} toEmail - Recipient email address
   * @returns {Promise<Object>} The Resend API response
   */
  async sendTestEmail(toEmail) {
    try {
      logger.info(`Sending test email to ${toEmail}`);
      
      const htmlContent = generateTestEmailHtml();
      
      const emailData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: toEmail,
        subject: 'RevBoost Email Test',
        html: htmlContent,
        tags: [
          { name: 'type', value: 'test' },
        ]
      };
      
      const response = await this.sendEmail(emailData);
      
      logger.info(`Test email sent successfully to ${toEmail}`);
      return response;
    } catch (error) {
      logger.error(`Failed to send test email: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Send an email using Resend API
   * @param {Object} emailData - Email data
   * @returns {Promise<Object>} The Resend API response
   * @private
   */
  async sendEmail(emailData) {
    try {
      // Check if API key is available
      if (!this.apiKey) {
        throw new Error('Resend API key is not configured');
      }
      
      // Send the email
      const response = await axios.post('https://api.resend.com/emails', emailData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });
      
      return response.data;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        logger.error(`Resend API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        throw new Error(error.response.data.message || 'Failed to send email');
      } else if (error.request) {
        // The request was made but no response was received
        logger.error('No response received from Resend API');
        throw new Error('No response from email service');
      } else {
        // Something happened in setting up the request
        logger.error(`Email request setup error: ${error.message}`);
        throw error;
      }
    }
  }
}

module.exports = new EmailService();