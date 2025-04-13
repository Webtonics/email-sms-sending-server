// middleware/logger.js - Request logging middleware

const logger = require('../utils/logger');

/**
 * Middleware for logging HTTP requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
module.exports = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  // Log the request
  logger.info(`${method} ${originalUrl} - Request received from ${ip}`);
  
  // Log request body for POST/PUT requests (except for sensitive routes)
  if ((method === 'POST' || method === 'PUT') && !originalUrl.includes('/auth')) {
    // Sanitize request body by removing sensitive fields
    const sanitizedBody = { ...req.body };
    
    // Remove sensitive fields if they exist
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
    if (sanitizedBody.apiKey) sanitizedBody.apiKey = '[REDACTED]';
    
    logger.debug(`Request body: ${JSON.stringify(sanitizedBody)}`);
  }
  
  // Capture the response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    if (statusCode >= 400) {
      logger.warn(`${method} ${originalUrl} - Response: ${statusCode} - ${duration}ms`);
    } else {
      logger.info(`${method} ${originalUrl} - Response: ${statusCode} - ${duration}ms`);
    }
  });
  
  next();
};