const { body } = require('express-validator');

/**
 * Aturan validasi untuk membuat pendaftaran baru.
 */
const createRegistrationRules = [
  body('patient_id')
    .notEmpty().withMessage('Patient is required')
    .isInt({ min: 1 }).withMessage('Patient ID must be a positive integer'),

  body('doctor_id')
    .notEmpty().withMessage('Doctor is required')
    .isInt({ min: 1 }).withMessage('Doctor ID must be a positive integer'),

  body('policlinic_id')
    .notEmpty().withMessage('Policlinic is required')
    .isInt({ min: 1 }).withMessage('Policlinic ID must be a positive integer'),

  body('visit_date')
    .notEmpty().withMessage('Visit date is required')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Visit date must be in YYYY-MM-DD format'),

  body('payment_type')
    .notEmpty().withMessage('Payment type is required')
    .isIn(['CASH', 'INSURANCE', 'BPJS', 'OTHER'])
    .withMessage('Payment type must be CASH, INSURANCE, BPJS, or OTHER'),

  body('initial_complaint')
    .notEmpty().withMessage('Initial complaint is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Initial complaint must be between 5 and 1000 characters')
    .trim(),
];

/**
 * Aturan validasi untuk mengedit pendaftaran.
 * Hanya bisa diubah jika status WAITING.
 */
const updateRegistrationRules = [
  body('doctor_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Doctor ID must be a positive integer'),

  body('policlinic_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Policlinic ID must be a positive integer'),

  body('visit_date')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Visit date must be in YYYY-MM-DD format'),

  body('payment_type')
    .optional()
    .isIn(['CASH', 'INSURANCE', 'BPJS', 'OTHER'])
    .withMessage('Payment type must be CASH, INSURANCE, BPJS, or OTHER'),

  body('initial_complaint')
    .optional()
    .notEmpty().withMessage('Initial complaint cannot be empty')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Initial complaint must be between 5 and 1000 characters')
    .trim(),
];

/**
 * Aturan validasi untuk update status pendaftaran.
 */
const updateStatusRules = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['WAITING', 'CHECKED_IN', 'EXAMINATION', 'COMPLETED', 'CANCELLED'])
    .withMessage('Status must be WAITING, CHECKED_IN, EXAMINATION, COMPLETED, or CANCELLED'),
];

module.exports = {
  createRegistrationRules,
  updateRegistrationRules,
  updateStatusRules,
};
