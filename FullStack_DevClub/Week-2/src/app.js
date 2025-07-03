const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Import rate limiters
const { generalLimiter } = require('./middleware/rateLimiter');

// Security middleware
app.use(helmet());
app.use(generalLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'User Management API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      documentation: 'Check README for API documentation'
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
//app.use('*', (req, res) => {
  app.use((req, res, next) => { // Remove the '*' argument
  res.status(404).json({ 
    success: false,
    message: `Route ${req.originalUrl} not found` 
  });
});

module.exports = app;