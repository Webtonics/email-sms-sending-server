// server.js - Main entry point for the notification server

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');
const emailRoutes = require('./routes/email-routes');
const smsRoutes = require('./routes/sms-routes');
const loggerMiddleware = require('./middleware/logger');
const errorHandler = require('./middleware/error-handler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Apply security headers
app.use(helmet());

// Enable CORS - can be configured for specific origins in production
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Request logging
app.use(loggerMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Service is running' });
});

// API routes
app.use('/api/email', emailRoutes);
app.use('/api/sms', smsRoutes);

// Basic home route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'RevBoost Notification API',
    version: '1.0.0',
    documentation: '/docs',
    status: 'online'
  });
});

// Documentation route
app.get('/docs', (req, res) => {
  res.status(200).json({
    endpoints: {
      email: {
        'POST /api/email/review-request': 'Send a review request email',
        'POST /api/email/test': 'Send a test email'
      },
      sms: {
        'POST /api/sms/review-request': 'Send a review request SMS',
        'POST /api/sms/test': 'Send a test SMS'
      }
    }
  });
});

// Global error handler
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});