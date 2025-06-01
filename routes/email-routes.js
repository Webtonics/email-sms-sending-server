// routes/email-routes.js - Routes for email functionality

const express = require('express');
const { body, validationResult } = require('express-validator');
const emailService = require('../services/email-service');
const feedbackService = require('../services/feedback-service');
const router = express.Router();

/**
 * Send a review request email
 * POST /api/email/review-request
 */
router.post('/review-request', [
  // Validate request body
  body('toEmail').isEmail().withMessage('Valid email address required'),
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('reviewLink').isURL().withMessage('Valid review link URL is required'),
  body('replyTo').optional().isEmail().withMessage('Reply-to must be a valid email if provided'),
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { toEmail, customerName, businessName, reviewLink, replyTo, customData } = req.body;

    // Send the email
    const result = await emailService.sendReviewRequest({
      toEmail,
      customerName,
      businessName,
      reviewLink,
      replyTo,
      customData
    });

    // Return the result
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/email/feedback-notification
 * @desc Send feedback notification email to business owner
 * @access Public
 */
router.post('/feedback-notification', 
  [
    body('businessId').notEmpty().withMessage('Business ID is required'),
    body('toEmail').isEmail().withMessage('Valid email address is required'),
    body('businessName').notEmpty().withMessage('Business name is required'),
    body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('feedback').notEmpty().withMessage('Feedback content is required'),
    body('customerName').optional()
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    try {
      const { 
        businessId, 
        toEmail, 
        businessName, 
        rating, 
        feedback, 
        customerName 
      } = req.body;
      
      const result = await feedbackService.sendFeedbackNotification({
        businessId,
        toEmail,
        businessName,
        rating,
        feedback,
        customerName: customerName || 'Anonymous Customer'
      });
      
      return res.status(200).json({
        success: true,
        message: 'Feedback notification sent successfully',
        data: result
      });
    } catch (error) {
      logger.error(`Error sending feedback notification: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to send feedback notification',
        error: error.message
      });
    }
  }
);

/**
 * Send a test email
 * POST /api/email/test
 */
router.post('/test', [
  body('toEmail').isEmail().withMessage('Valid email address required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { toEmail } = req.body;

    // Send a test email
    const result = await emailService.sendTestEmail(toEmail);

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;