const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');
const validate = require('../validators/validate');

const router = express.Router();

/**
 * Aturan validasi untuk login.
 */
const loginValidationRules = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

/**
 * POST /api/auth/login
 * Login dan dapatkan JWT token.
 * Body: { email, password }
 */
router.post('/login', loginValidationRules, validate, authController.login);

/**
 * POST /api/auth/logout
 * Logout dan invalidate token.
 * Header: Authorization: Bearer <token>
 */
router.post('/logout', authenticate, authController.logout);

/**
 * GET /api/auth/me
 * Ambil data user yang sedang login.
 * Header: Authorization: Bearer <token>
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;
