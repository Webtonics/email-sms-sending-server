// routes/health.js - Clean version without keep-alive
const express = require('express');
const router = express.Router();

/**
 * Detailed health check with service diagnostics
 * GET /health/detailed
 */
router.get('/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check environment variables
    const envCheck = {
      resendApiKey: !!process.env.RESEND_API_KEY,
      emailFromAddress: !!process.env.EMAIL_FROM_ADDRESS,
      emailFromName: !!process.env.EMAIL_FROM_NAME,
    };
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryInfo = {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
    };
    
    // Service availability checks
    const services = {
      email: {
        configured: envCheck.resendApiKey && envCheck.emailFromAddress,
        provider: 'resend',
        status: envCheck.resendApiKey ? 'available' : 'not_configured',
      },
    };
    
    const responseTime = Date.now() - startTime;
    
    const detailedHealth = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      server: {
        uptime: process.uptime(),
        uptimeFormatted: formatUptime(process.uptime()),
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid,
      },
      memory: memoryInfo,
      environment: envCheck,
      services,
      endpoints: {
        health: '/health',
        detailedHealth: '/health/detailed',
        reviewRequest: '/api/email/review-request',
        emailTest: '/api/email/test',
        feedbackNotification: '/api/email/feedback-notification',
      },
    };
    
    res.status(200).json(detailedHealth);
  } catch (error) {
    console.error('Error in detailed health check:', error);
    
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      service: 'email-sms-server',
    });
  }
});

/**
 * Service readiness check
 * GET /health/ready
 */
router.get('/ready', (req, res) => {
  const requiredEnvVars = [
    'RESEND_API_KEY',
    'EMAIL_FROM_ADDRESS',
  ];
  
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    return res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: 'Missing required environment variables',
      missing: missingEnvVars,
    });
  }
  
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    message: 'Service is ready to handle requests',
  });
});

/**
 * Simple liveness probe
 * GET /health/live
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Format uptime in human-readable format
 */
function formatUptime(uptimeSeconds) {
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
}

module.exports = router;