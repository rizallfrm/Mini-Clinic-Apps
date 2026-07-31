const { body } = require('express-validator');

// =====================================================
// MEDICAL RECORD (SOAP)
// =====================================================

const createMedicalRecordRules = [
  body('registration_id')
    .notEmpty().withMessage('Registration ID is required')
    .isInt({ min: 1 }).withMessage('Registration ID must be a positive integer'),

  // S — Subjective
  body('subjective')
    .notEmpty().withMessage('Subjective (patient complaint) is required')
    .isLength({ min: 5 }).withMessage('Subjective must be at least 5 characters')
    .trim(),

  // O — Objective (vital signs, semua opsional)
  body('blood_pressure')
    .optional({ checkFalsy: true })
    .isString().withMessage('Blood pressure must be text')
    .isLength({ max: 20 }).withMessage('Blood pressure cannot exceed 20 characters')
    .trim(),

  body('body_temperature')
    .optional({ checkFalsy: true })
    .isFloat({ min: 30, max: 45 }).withMessage('Body temperature must be between 30 and 45°C'),

  body('weight')
    .optional({ checkFalsy: true })
    .isFloat({ min: 1, max: 500 }).withMessage('Weight must be between 1 and 500 kg'),

  body('height')
    .optional({ checkFalsy: true })
    .isFloat({ min: 10, max: 300 }).withMessage('Height must be between 10 and 300 cm'),

  body('pulse')
    .optional({ checkFalsy: true })
    .isInt({ min: 30, max: 250 }).withMessage('Pulse must be between 30 and 250'),

  // A — Assessment
  body('assessment')
    .notEmpty().withMessage('Assessment (diagnosis) is required')
    .isLength({ min: 3 }).withMessage('Assessment must be at least 3 characters')
    .trim(),

  // P — Plan
  body('plan')
    .notEmpty().withMessage('Plan (treatment plan) is required')
    .isLength({ min: 3 }).withMessage('Plan must be at least 3 characters')
    .trim(),
];

const updateMedicalRecordRules = [
  body('subjective')
    .optional({ checkFalsy: true })
    .notEmpty().withMessage('Subjective cannot be empty')
    .isLength({ min: 5 }).withMessage('Subjective must be at least 5 characters')
    .trim(),

  body('blood_pressure')
    .optional({ checkFalsy: true })
    .isString().withMessage('Blood pressure must be text')
    .isLength({ max: 20 }).withMessage('Blood pressure cannot exceed 20 characters')
    .trim(),

  body('body_temperature')
    .optional({ checkFalsy: true })
    .isFloat({ min: 30, max: 45 }).withMessage('Body temperature must be between 30 and 45°C'),

  body('weight')
    .optional({ checkFalsy: true })
    .isFloat({ min: 1, max: 500 }).withMessage('Weight must be between 1 and 500 kg'),

  body('height')
    .optional({ checkFalsy: true })
    .isFloat({ min: 10, max: 300 }).withMessage('Height must be between 10 and 300 cm'),

  body('pulse')
    .optional({ checkFalsy: true })
    .isInt({ min: 30, max: 250 }).withMessage('Pulse must be between 30 and 250'),

  body('assessment')
    .optional({ checkFalsy: true })
    .notEmpty().withMessage('Assessment cannot be empty')
    .isLength({ min: 3 }).withMessage('Assessment must be at least 3 characters')
    .trim(),

  body('plan')
    .optional({ checkFalsy: true })
    .notEmpty().withMessage('Plan cannot be empty')
    .isLength({ min: 3 }).withMessage('Plan must be at least 3 characters')
    .trim(),
];

// =====================================================
// MEDICAL ACTION (Tindakan Medis)
// =====================================================

const createActionRules = [
  body('action_name')
    .notEmpty().withMessage('Action name is required')
    .isLength({ min: 2, max: 150 }).withMessage('Action name must be between 2 and 150 characters')
    .trim(),

  body('description')
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters')
    .trim(),

  body('notes')
    .optional({ checkFalsy: true })
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
    .trim(),
];

const updateActionRules = [
  body('action_name')
    .optional({ checkFalsy: true })
    .notEmpty().withMessage('Action name cannot be empty')
    .isLength({ min: 2, max: 150 }).withMessage('Action name must be between 2 and 150 characters')
    .trim(),

  body('description')
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters')
    .trim(),

  body('notes')
    .optional({ checkFalsy: true })
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
    .trim(),
];

// =====================================================
// PRESCRIPTIONS (Resep Obat)
// =====================================================

const createPrescriptionRules = [
  body('registration_id')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Registration ID must be a positive integer'),

  body('details')
    .isArray({ min: 1 }).withMessage('Prescription details must be a non-empty array'),

  body('details.*.medicine_id')
    .notEmpty().withMessage('Medicine ID is required')
    .isInt({ min: 1 }).withMessage('Medicine ID must be a positive integer'),

  body('details.*.dosage')
    .notEmpty().withMessage('Dosage is required')
    .isLength({ min: 1, max: 100 }).withMessage('Dosage must be between 1 and 100 characters')
    .trim(),

  body('details.*.quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

  body('details.*.notes')
    .optional({ checkFalsy: true })
    .isLength({ max: 255 }).withMessage('Notes cannot exceed 255 characters')
    .trim(),
];

const createPrescriptionDetailRules = [
  body('medicine_id')
    .notEmpty().withMessage('Medicine ID is required')
    .isInt({ min: 1 }).withMessage('Medicine ID must be a positive integer'),

  body('dosage')
    .notEmpty().withMessage('Dosage is required')
    .isLength({ min: 1, max: 100 }).withMessage('Dosage must be between 1 and 100 characters')
    .trim(),

  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

  body('notes')
    .optional({ checkFalsy: true })
    .isLength({ max: 255 }).withMessage('Notes cannot exceed 255 characters')
    .trim(),
];

const updatePrescriptionDetailRules = [
  body('dosage')
    .optional({ checkFalsy: true })
    .isLength({ min: 1, max: 100 }).withMessage('Dosage must be between 1 and 100 characters')
    .trim(),

  body('quantity')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

  body('notes')
    .optional({ checkFalsy: true })
    .isLength({ max: 255 }).withMessage('Notes cannot exceed 255 characters')
    .trim(),
];

module.exports = {
  createMedicalRecordRules,
  updateMedicalRecordRules,
  createActionRules,
  updateActionRules,
  createPrescriptionRules,
  createPrescriptionDetailRules,
  updatePrescriptionDetailRules,
};
