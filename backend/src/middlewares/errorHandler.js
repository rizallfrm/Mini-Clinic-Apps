const { sendError, sendValidationError, sendServerError } = require('../utils/response');

/**
 * Global Error Handler Middleware.
 * Harus didaftarkan sebagai middleware terakhir di app.js.
 * Menangani semua jenis error secara terpusat.
 *
 * FORMAT RESPONSE ERROR yang KONSISTEN:
 * {
 *   "success": false,
 *   "message": "...",
 *   "errors": {}   ← selalu ada, minimal {}
 * }
 */
const errorHandler = (err, req, res, next) => {
  // Log error untuk debugging (tidak tampil di response)
  console.error('❌ Error:', {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // =====================================================
  // SEQUELIZE ERRORS
  // =====================================================

  // Sequelize Validation Error (constraint di model)
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.reduce((acc, e) => {
      if (!acc[e.path]) acc[e.path] = e.message;
      return acc;
    }, {});
    return sendValidationError(res, 'Validation failed', errors);
  }

  // Sequelize Unique Constraint (data duplikat)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    const errors = { [field]: `Data with this ${field} already exists` };
    return sendError(res, `Duplicate data: ${field} already exists`, 409, errors);
  }

  // Sequelize Foreign Key Constraint
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return sendError(
      res,
      'Related data not found or cannot be deleted because it is still in use',
      400,
      {}
    );
  }

  // Sequelize Database Error
  if (err.name === 'SequelizeDatabaseError') {
    const errors = process.env.NODE_ENV === 'development' ? { detail: err.message } : {};
    return sendServerError(res, 'Database error occurred');
  }

  // Sequelize Connection Error
  if (
    err.name === 'SequelizeConnectionError' ||
    err.name === 'SequelizeConnectionRefusedError'
  ) {
    return sendServerError(res, 'Database connection failed');
  }

  // =====================================================
  // JWT ERRORS
  // =====================================================

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token. Please login again.', 401, {});
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token has expired. Please login again.', 401, {});
  }

  // =====================================================
  // CUSTOM APP ERRORS
  // =====================================================

  if (err.statusCode) {
    return sendError(
      res,
      err.message,
      err.statusCode,
      err.errors || {}  // ← selalu kirim {} jika tidak ada detail errors
    );
  }

  // =====================================================
  // SYNTAX ERROR (JSON parse failed)
  // =====================================================
  if (err instanceof SyntaxError && err.status === 400) {
    return sendError(res, 'Invalid JSON format in request body', 400, {});
  }

  // =====================================================
  // DEFAULT: Internal Server Error
  // =====================================================
  const devErrors = process.env.NODE_ENV === 'development' ? { detail: err.message } : {};
  return sendServerError(res, 'Internal Server Error');
};

/**
 * 404 Not Found Handler.
 * Dipanggil ketika tidak ada route yang cocok.
 */
const notFoundHandler = (req, res) => {
  return sendError(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    {}
  );
};

/**
 * Custom App Error class.
 * Gunakan ini untuk melempar error dengan statusCode custom dari service.
 *
 * Contoh:
 *   throw new AppError('Patient not found.', 404);
 *   throw new AppError('Validation Error', 422, { field: 'error msg' });
 */
class AppError extends Error {
  constructor(message, statusCode = 400, errors = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, notFoundHandler, AppError };
