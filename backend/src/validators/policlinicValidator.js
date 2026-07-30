const { body } = require('express-validator');

const createPoliclinicRules = [
  body('code')
    .notEmpty().withMessage('Policlinic code is required')
    .isLength({ min: 2, max: 30 }).withMessage('Code must be between 2 and 30 characters')
    .matches(/^[A-Z0-9\-_]+$/).withMessage('Code must contain only uppercase letters, numbers, hyphens, or underscores')
    .trim()
    .toUpperCase(),

  body('name')
    .notEmpty().withMessage('Policlinic name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
    .trim(),

  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be true or false'),
];

const updatePoliclinicRules = [
  body('name')
    .optional()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
    .trim(),

  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be true or false'),
];

module.exports = { createPoliclinicRules, updatePoliclinicRules };
