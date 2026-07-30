const { body, validationResult } = require('express-validator');
const { sendValidationError } = require('../utils/response');

/**
 * Aturan validasi untuk login.
 */
const loginRules = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

/**
 * Middleware untuk mengecek hasil validasi.
 * Jika ada error, kirim response 422 dan hentikan request.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().reduce((acc, err) => {
      acc[err.path] = err.msg;
      return acc;
    }, {});
    return sendValidationError(res, 'Validation Error', formattedErrors);
  }
  next();
};

module.exports = {
  loginRules,
  validate,
};
