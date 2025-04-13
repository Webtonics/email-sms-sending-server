// routes/email-routes.js - Routes for email functionality

const express = require('express');
const { body, validationResult } = require('express-validator');
const emailService = require('../services/email-service');
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