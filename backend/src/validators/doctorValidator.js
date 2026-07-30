const { body } = require('express-validator');

/**
 * Validasi untuk membuat dokter baru.
 * Sekaligus membuat akun user (role: DOCTOR).
 */
const createDoctorRules = [
  // === Data Akun User ===
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  // === Data Profil Dokter ===
  body('policlinic_id')
    .notEmpty().withMessage('Policlinic is required')
    .isInt({ min: 1 }).withMessage('Policlinic ID must be a positive integer'),

  body('name')
    .notEmpty().withMessage('Doctor name is required')
    .isLength({ min: 2, max: 150 }).withMessage('Name must be between 2 and 150 characters')
    .trim(),

  body('specialization')
    .optional()
    .isLength({ max: 150 }).withMessage('Specialization cannot exceed 150 characters')
    .trim(),

  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]{8,20}$/).withMessage('Phone must be 8-20 digits')
    .trim(),
];

/**
 * Validasi untuk update dokter.
 * Akun user dan doctor_code tidak bisa diubah.
 */
const updateDoctorRules = [
  body('policlinic_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Policlinic ID must be a positive integer'),

  body('name')
    .optional()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 150 }).withMessage('Name must be between 2 and 150 characters')
    .trim(),

  body('specialization')
    .optional()
    .isLength({ max: 150 }).withMessage('Specialization cannot exceed 150 characters')
    .trim(),

  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]{8,20}$/).withMessage('Phone must be 8-20 digits')
    .trim(),

  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be true or false'),
];

module.exports = { createDoctorRules, updateDoctorRules };
