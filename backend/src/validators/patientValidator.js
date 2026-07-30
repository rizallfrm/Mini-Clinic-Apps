const { body } = require('express-validator');

/**
 * Aturan validasi untuk membuat pasien baru.
 */
const createPatientRules = [
  body('nik')
    .notEmpty().withMessage('NIK is required')
    .isLength({ min: 16, max: 16 }).withMessage('NIK must be exactly 16 digits')
    .isNumeric().withMessage('NIK must contain numbers only')
    .trim(),

  body('name')
    .notEmpty().withMessage('Patient name is required')
    .isLength({ min: 2, max: 150 }).withMessage('Name must be between 2 and 150 characters')
    .trim(),

  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['MALE', 'FEMALE']).withMessage('Gender must be MALE or FEMALE'),

  body('birth_date')
    .notEmpty().withMessage('Birth date is required')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Birth date must be in YYYY-MM-DD format')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date >= now) {
        throw new Error('Birth date must be in the past');
      }
      return true;
    }),

  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]{8,20}$/).withMessage('Phone number must be 8-20 digits (numbers, +, -, spaces allowed)')
    .trim(),

  body('address')
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 5 }).withMessage('Address must be at least 5 characters')
    .trim(),
];

/**
 * Aturan validasi untuk mengedit pasien.
 * NIK tidak bisa diubah setelah dibuat.
 */
const updatePatientRules = [
  body('name')
    .optional()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 150 }).withMessage('Name must be between 2 and 150 characters')
    .trim(),

  body('gender')
    .optional()
    .isIn(['MALE', 'FEMALE']).withMessage('Gender must be MALE or FEMALE'),

  body('birth_date')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Birth date must be in YYYY-MM-DD format')
    .custom((value) => {
      if (value) {
        const date = new Date(value);
        const now = new Date();
        if (date >= now) {
          throw new Error('Birth date must be in the past');
        }
      }
      return true;
    }),

  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]{8,20}$/).withMessage('Phone number must be 8-20 digits')
    .trim(),

  body('address')
    .optional()
    .notEmpty().withMessage('Address cannot be empty')
    .isLength({ min: 5 }).withMessage('Address must be at least 5 characters')
    .trim(),
];

module.exports = { createPatientRules, updatePatientRules };
