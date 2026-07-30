require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

// =====================================================
// SECURITY MIDDLEWARE
// =====================================================

// Helmet: Set security HTTP headers
app.use(helmet());

// CORS: Izinkan akses dari frontend
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:3000',
    ];

    // Izinkan request tanpa origin (Postman, curl, dll)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// =====================================================
// LOGGING MIDDLEWARE
// =====================================================

// Morgan: HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =====================================================
// ROUTES
// =====================================================

// Base API route
app.use('/api', routes);

// Root endpoint (informasi API)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Mini Clinic Information System API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 handler - harus sebelum errorHandler
app.use(notFoundHandler);

// Global error handler - harus paling terakhir
app.use(errorHandler);

module.exports = app;
