// server.js or app.js - Your main email server file
// Add keep-alive integration to your existing server

const express = require('express');
const cors = require('cors');
// const { keepAlive } = require('./server-keepalive'); // Import keep-alive

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint (enhanced for keep-alive)
app.get('/health', (req, res) => {
  const isKeepAliveRequest = req.headers['x-keep-alive'] === 'true';
  
  if (isKeepAliveRequest) {
    console.log('🔄 Keep-alive health check received');
  }
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'email-sms-server',
    keepAlive: keepAlive.getStats(),
  });
});

// Your existing routes
app.use('/api/email', require('./routes/email-routes'));
app.use('/api/sms', require('./routes/sms-routes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Email & SMS Server is running',
    status: 'active',
    uptime: process.uptime(),
    endpoints: [
      '/health',
      '/api/email/review-request',
      '/api/email/test',
      '/api/sms/review-request',
      '/api/sms/test',
    ],
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} not found`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  
  // Start keep-alive service after server starts
  setTimeout(() => {
    keepAlive.start();
  }, 2000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;