// routes/sms-routes.js - Routes for SMS functionality

const express = require('express');
const { body, validationResult } = require('express-validator');
const smsService = require('../services/sms-service');
const router = express.Router();

/**
 * Send a review request SMS
 * POST /api/sms/review-request
 */
router.post('/review-request', [
  // Validate request body
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number required'),
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('reviewLink').isURL().withMessage('Valid review link URL is required'),
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

    const { phoneNumber, customerName, businessName, reviewLink, customData } = req.body;

    // Send the SMS
    const result = await smsService.sendReviewRequest({
      phoneNumber,
      customerName,
      businessName,
      reviewLink,
      customData
    });

    // Return the result
    res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Send a test SMS
 * POST /api/sms/test
 */
router.post('/test', [
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { phoneNumber } = req.body;

    // Send a test SMS
    const result = await smsService.sendTestSms(phoneNumber);

    res.status(200).json({
      success: true,
      message: 'Test SMS sent successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;