// middleware/error-handler.js - Global error handling middleware

const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
module.exports = (err, req, res, next) => {
  // Get the status code from the error if available, default to 500
  const statusCode = err.statusCode || 500;
  
  // Log the error
  const logMessage = `${req.method} ${req.originalUrl} - ${err.message}`;
  
  if (statusCode >= 500) {
    logger.error(`${logMessage}\n${err.stack}`);
  } else {
    logger.warn(logMessage);
  }
  
  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode,
    },
  };
  
  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    errorResponse.error.stack = err.stack;
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};