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
    .optional()
    .matches(/^\d{2,3}\/\d{2,3}$/).withMessage('Blood pressure must be in format "120/80"')
    .trim(),

  body('body_temperature')
    .optional()
    .isFloat({ min: 30, max: 45 }).withMessage('Body temperature must be between 30 and 45°C'),

  body('weight')
    .optional()
    .isFloat({ min: 1, max: 500 }).withMessage('Weight must be between 1 and 500 kg'),

  body('height')
    .optional()
    .isFloat({ min: 10, max: 300 }).withMessage('Height must be between 10 and 300 cm'),

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
    .optional()
    .notEmpty().withMessage('Subjective cannot be empty')
    .isLength({ min: 5 }).withMessage('Subjective must be at least 5 characters')
    .trim(),

  body('blood_pressure')
    .optional()
    .matches(/^\d{2,3}\/\d{2,3}$/).withMessage('Blood pressure must be in format "120/80"')
    .trim(),

  body('body_temperature')
    .optional()
    .isFloat({ min: 30, max: 45 }).withMessage('Body temperature must be between 30 and 45°C'),

  body('weight')
    .optional()
    .isFloat({ min: 1, max: 500 }).withMessage('Weight must be between 1 and 500 kg'),

  body('height')
    .optional()
    .isFloat({ min: 10, max: 300 }).withMessage('Height must be between 10 and 300 cm'),

  body('assessment')
    .optional()
    .notEmpty().withMessage('Assessment cannot be empty')
    .isLength({ min: 3 }).withMessage('Assessment must be at least 3 characters')
    .trim(),

  body('plan')
    .optional()
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
    .optional()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters')
    .trim(),

  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
    .trim(),
];

const updateActionRules = [
  body('action_name')
    .optional()
    .notEmpty().withMessage('Action name cannot be empty')
    .isLength({ min: 2, max: 150 }).withMessage('Action name must be between 2 and 150 characters')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters')
    .trim(),

  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
    .trim(),
];

// =====================================================
// PRESCRIPTION (Resep)
// =====================================================

const createPrescriptionRules = [
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
    .trim(),
];

// =====================================================
// PRESCRIPTION DETAIL (Detail Obat)
// =====================================================

const createPrescriptionDetailRules = [
  body('medicine_id')
    .notEmpty().withMessage('Medicine is required')
    .isInt({ min: 1 }).withMessage('Medicine ID must be a positive integer'),

  body('dosage')
    .notEmpty().withMessage('Dosage is required')
    .isLength({ min: 1, max: 100 }).withMessage('Dosage must be between 1 and 100 characters')
    .trim(),

  body('frequency')
    .notEmpty().withMessage('Frequency is required')
    .isLength({ min: 1, max: 100 }).withMessage('Frequency must be between 1 and 100 characters')
    .trim(),

  body('duration')
    .optional()
    .isLength({ max: 100 }).withMessage('Duration cannot exceed 100 characters')
    .trim(),

  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

  body('instructions')
    .optional()
    .isLength({ max: 500 }).withMessage('Instructions cannot exceed 500 characters')
    .trim(),
];

const updatePrescriptionDetailRules = [
  body('medicine_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Medicine ID must be a positive integer'),

  body('dosage')
    .optional()
    .notEmpty().withMessage('Dosage cannot be empty')
    .isLength({ min: 1, max: 100 }).withMessage('Dosage must be between 1 and 100 characters')
    .trim(),

  body('frequency')
    .optional()
    .notEmpty().withMessage('Frequency cannot be empty')
    .isLength({ min: 1, max: 100 }).withMessage('Frequency must be between 1 and 100 characters')
    .trim(),

  body('duration')
    .optional()
    .isLength({ max: 100 }).withMessage('Duration cannot exceed 100 characters')
    .trim(),

  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

  body('instructions')
    .optional()
    .isLength({ max: 500 }).withMessage('Instructions cannot exceed 500 characters')
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
