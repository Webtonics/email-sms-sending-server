// routes/health.js - Enhanced health endpoint with detailed diagnostics

const express = require('express');
const { keepAlive } = require('../server-keepalive');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Basic health check endpoint
 * GET /health
 */
router.get('/', (req, res) => {
  const isKeepAliveRequest = req.headers['x-keep-alive'] === 'true';
  
  if (isKeepAliveRequest) {
    logger.info('🔄 Keep-alive health check received');
  }
  
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    service: 'email-sms-server',
    ...keepAlive.getHealthInfo(),
  };
  
  res.status(200).json(healthData);
});

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
      twilioAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
      twilioAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
      twilioPhoneNumber: !!process.env.TWILIO_PHONE_NUMBER,
      emailFromAddress: !!process.env.EMAIL_FROM_ADDRESS,
      renderExternalUrl: !!process.env.RENDER_EXTERNAL_URL,
    };
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryInfo = {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
    };
    
    // Check CPU usage (simplified)
    const cpuUsage = process.cpuUsage();
    
    // Service availability checks
    const services = {
      email: {
        configured: envCheck.resendApiKey && envCheck.emailFromAddress,
        provider: 'resend',
        status: envCheck.resendApiKey ? 'available' : 'not_configured',
      },
      sms: {
        configured: envCheck.twilioAccountSid && envCheck.twilioAuthToken && envCheck.twilioPhoneNumber,
        provider: 'twilio',
        status: (envCheck.twilioAccountSid && envCheck.twilioAuthToken && envCheck.twilioPhoneNumber) 
          ? 'available' 
          : 'not_configured',
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
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      environment: envCheck,
      services,
      ...keepAlive.getHealthInfo(),
      endpoints: {
        health: '/health',
        detailedHealth: '/health/detailed',
        emailTest: '/api/email/test',
        smsTest: '/api/sms/test',
        reviewRequest: '/api/email/review-request',
      },
    };
    
    res.status(200).json(detailedHealth);
  } catch (error) {
    logger.error('Error in detailed health check:', error);
    
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      service: 'email-sms-server',
    });
  }
});

/**
 * Keep-alive statistics endpoint
 * GET /health/keepalive
 */
router.get('/keepalive', (req, res) => {
  try {
    const stats = keepAlive.getStats();
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      keepAlive: stats,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
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
 * Liveness probe (for Kubernetes-style health checks)
 * GET /health/live
 */
router.get('/live', (req, res) => {
  // Simple liveness check - if we can respond, we're alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Wake-up endpoint (for manual server wake-up)
 * POST /health/wakeup
 */
router.post('/wakeup', (req, res) => {
  logger.info('🌅 Manual wake-up request received');
  
  // Perform a simple operation to ensure the server is responsive
  const startTime = Date.now();
  
  setTimeout(() => {
    const responseTime = Date.now() - startTime;
    
    res.status(200).json({
      status: 'awake',
      timestamp: new Date().toISOString(),
      message: 'Server is now fully awake and responsive',
      responseTime: `${responseTime}ms`,
      uptime: process.uptime(),
      ...keepAlive.getHealthInfo(),
    });
  }, 100); // Small delay to simulate wake-up
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