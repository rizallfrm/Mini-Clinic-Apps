const { body } = require('express-validator');

const createMedicineRules = [
  body('medicine_code')
    .notEmpty().withMessage('Medicine code is required')
    .isLength({ min: 2, max: 30 }).withMessage('Code must be between 2 and 30 characters')
    .matches(/^[A-Z0-9\-_]+$/).withMessage('Code must contain only uppercase letters, numbers, hyphens, or underscores')
    .trim()
    .toUpperCase(),

  body('name')
    .notEmpty().withMessage('Medicine name is required')
    .isLength({ min: 2, max: 150 }).withMessage('Name must be between 2 and 150 characters')
    .trim(),

  body('unit')
    .notEmpty().withMessage('Unit is required')
    .isLength({ min: 1, max: 50 }).withMessage('Unit must be between 1 and 50 characters')
    .trim(),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
    .trim(),

  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be true or false'),
];

const updateMedicineRules = [
  body('name')
    .optional()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 150 }).withMessage('Name must be between 2 and 150 characters')
    .trim(),

  body('unit')
    .optional()
    .notEmpty().withMessage('Unit cannot be empty')
    .isLength({ min: 1, max: 50 }).withMessage('Unit must be between 1 and 50 characters')
    .trim(),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
    .trim(),

  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be true or false'),
];

/**
 * Validasi untuk tambah atau kurangi stok.
 */
const adjustStockRules = [
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),

  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['ADD', 'SUBTRACT']).withMessage('Type must be ADD or SUBTRACT'),

  body('notes')
    .optional()
    .isLength({ max: 200 }).withMessage('Notes cannot exceed 200 characters')
    .trim(),
];

module.exports = { createMedicineRules, updateMedicineRules, adjustStockRules };
