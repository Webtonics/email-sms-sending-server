// services/sms-service.js - Service for SMS functionality using Twilio

const twilio = require('twilio');
const logger = require('../utils/logger');

/**
 * Service for sending SMS messages using Twilio
 */
class SmsService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!this.accountSid || !this.authToken) {
      logger.error('TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is missing. SMS functionality will not work.');
    }
    
    if (!this.fromNumber) {
      logger.warn('TWILIO_PHONE_NUMBER is missing. SMS functionality will not work.');
    }
    
    // Initialize Twilio client if credentials are provided
    if (this.accountSid && this.authToken) {
      this.client = twilio(this.accountSid, this.authToken);
    }
  }
  
  /**
   * Send a review request SMS
   * @param {Object} options - SMS options
   * @param {string} options.phoneNumber - Recipient phone number
   * @param {string} options.customerName - Customer name
   * @param {string} options.businessName - Business name
   * @param {string} options.reviewLink - Review link URL
   * @param {Object} [options.customData] - Custom data for message
   * @returns {Promise<Object>} The Twilio API response
   */
  async sendReviewRequest({ phoneNumber, customerName, businessName, reviewLink, customData }) {
    try {
      logger.info(`Sending review request SMS to ${phoneNumber}`);
      
      // Check if Twilio is configured
      if (!this.client || !this.fromNumber) {
        throw new Error('Twilio is not fully configured');
      }
      
      // Build the SMS message
      const messageBody = this.generateReviewRequestMessage({
        customerName,
        businessName,
        reviewLink,
        customData,
      });
      
      // Send the SMS
      const message = await this.client.messages.create({
        body: messageBody,
        from: this.fromNumber,
        to: phoneNumber,
      });
      
      logger.info(`SMS sent successfully to ${phoneNumber}, SID: ${message.sid}`);
      return {
        sid: message.sid,
        status: message.status,
      };
    } catch (error) {
      logger.error(`Failed to send review request SMS: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Send a test SMS
   * @param {string} phoneNumber - Recipient phone number
   * @returns {Promise<Object>} The Twilio API response
   */
  async sendTestSms(phoneNumber) {
    try {
      logger.info(`Sending test SMS to ${phoneNumber}`);
      
      // Check if Twilio is configured
      if (!this.client || !this.fromNumber) {
        throw new Error('Twilio is not fully configured');
      }
      
      // Send the SMS
      const message = await this.client.messages.create({
        body: 'This is a test message from RevBoost. If you received this, SMS sending is working properly!',
        from: this.fromNumber,
        to: phoneNumber,
      });
      
      logger.info(`Test SMS sent successfully to ${phoneNumber}, SID: ${message.sid}`);
      return {
        sid: message.sid,
        status: message.status,
      };
    } catch (error) {
      logger.error(`Failed to send test SMS: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generate a review request SMS message
   * @param {Object} options - Message options
   * @param {string} options.customerName - Customer name
   * @param {string} options.businessName - Business name
   * @param {string} options.reviewLink - Review link URL
   * @param {Object} [options.customData] - Custom data for message
   * @returns {string} The message body
   * @private
   */
  generateReviewRequestMessage({ customerName, businessName, reviewLink, customData }) {
    // Default message format
    let message = `Hi ${customerName}, thank you for choosing ${businessName}! We'd love to hear your feedback. Please share your experience here: ${reviewLink}`;
    
    // Use custom message if provided
    if (customData && customData.messageTemplate) {
      message = customData.messageTemplate
        .replace('{{customerName}}', customerName)
        .replace('{{businessName}}', businessName)
        .replace('{{reviewLink}}', reviewLink);
    }
    
    return message;
  }
}

module.exports = new SmsService();